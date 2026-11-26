import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any, Tuple, List
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

from .preprocessor import TextPreprocessor
from .feature_extractor import FeatureExtractor

class PhishingClassifier:
    """Intelligent Phishing Email Classifier using TF-IDF and Logistic Regression."""

    def __init__(self, model_dir: Path):
        self.model_dir = Path(model_dir)
        self.model_path = self.model_dir / "logistic_regression_model.joblib"
        self.vectorizer_path = self.model_dir / "tfidf_vectorizer.joblib"
        self.metrics_path = self.model_dir / "model_metrics.joblib"
        
        self.model: LogisticRegression = None
        self.feature_extractor = FeatureExtractor()
        self.metrics: Dict[str, Any] = {}
        self.is_loaded = False

    def train(self, df: pd.DataFrame, text_col: str = 'email_text', label_col: str = 'label') -> Dict[str, Any]:
        """
        Trains the Logistic Regression model using train/test split.
        Returns calculated evaluation metrics on the unseen test set.
        """
        if text_col not in df.columns or label_col not in df.columns:
            raise ValueError(f"Required columns '{text_col}' and '{label_col}' not found in dataset.")

        # Clean dataframe
        clean_df = df.dropna(subset=[text_col, label_col]).copy()
        
        # Standardize labels to binary (1 = phishing, 0 = legitimate)
        def map_label(val):
            s = str(val).strip().lower()
            if s in ['1', 'phishing', 'phish', 'spam', 'malicious', 'true', 'yes']:
                return 1
            return 0

        y = clean_df[label_col].apply(map_label).values
        raw_texts = clean_df[text_col].astype(str).tolist()

        # Clean text
        cleaned_texts = [TextPreprocessor.clean_text(t) for t in raw_texts]

        # Train / Test split with fixed random seed 42
        X_train_raw, X_test_raw, y_train, y_test = train_test_split(
            cleaned_texts, y, test_size=0.25, random_state=42, stratify=y
        )

        # Fit TF-IDF Vectorizer
        X_train_tfidf = self.feature_extractor.fit_transform(X_train_raw)
        X_test_tfidf = self.feature_extractor.transform(X_test_raw)

        # Train Logistic Regression with balanced weights
        self.model = LogisticRegression(
            C=1.5,
            max_iter=1000,
            random_state=42,
            class_weight='balanced',
            solver='lbfgs'
        )
        self.model.fit(X_train_tfidf, y_train)

        # Predict on Unseen Test Dataset
        y_pred = self.model.predict(X_test_tfidf)

        # Calculate actual metrics
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        cm = confusion_matrix(y_test, y_pred).tolist()
        cls_report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)

        self.metrics = {
            'accuracy': acc,
            'precision': prec,
            'recall': rec,
            'f1_score': f1,
            'confusion_matrix': cm,
            'classification_report': cls_report,
            'train_size': len(y_train),
            'test_size': len(y_test),
            'total_samples': len(y),
            'phishing_count': int(sum(y)),
            'legitimate_count': int(len(y) - sum(y)),
            'feature_count': len(self.feature_extractor.get_feature_names())
        }

        # Save artifacts
        self.save()
        self.is_loaded = True

        return self.metrics

    def save(self):
        """Save model, vectorizer, and metrics to disk."""
        self.model_dir.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.model, self.model_path)
        self.feature_extractor.save(self.vectorizer_path)
        joblib.dump(self.metrics, self.metrics_path)

    def load(self) -> bool:
        """Load trained model from disk if available."""
        if self.model_path.exists() and self.vectorizer_path.exists():
            try:
                self.model = joblib.load(self.model_path)
                self.feature_extractor.load(self.vectorizer_path)
                if self.metrics_path.exists():
                    self.metrics = joblib.load(self.metrics_path)
                self.is_loaded = True
                return True
            except Exception as e:
                print(f"Failed to load model: {e}")
                self.is_loaded = False
                return False
        return False

    def predict_email(self, email_text: str, subject: str = "", sender: str = "") -> Dict[str, Any]:
        """
        Predicts whether an email is PHISHING or LEGITIMATE.
        Computes confidence, risk level, suspicious keywords, and feature contributions.
        """
        if not self.is_loaded:
            if not self.load():
                raise RuntimeError("Machine Learning model has not been trained yet. Please train the model first.")

        full_content = f"{subject} {email_text}".strip()
        cleaned_text = TextPreprocessor.clean_text(full_content)
        
        # Rule-based / pattern heuristics
        suspicious_keywords, url_anomalies = TextPreprocessor.find_suspicious_patterns(full_content)

        # Transform via TF-IDF
        X_vec = self.feature_extractor.transform([cleaned_text])
        
        # Probabilities [prob_legitimate, prob_phishing]
        probabilities = self.model.predict_proba(X_vec)[0]
        prob_legitimate = float(probabilities[0])
        prob_phishing = float(probabilities[1])

        # Prediction decision
        is_phishing = prob_phishing >= 0.50
        predicted_class = "PHISHING" if is_phishing else "LEGITIMATE"
        confidence = prob_phishing if is_phishing else prob_legitimate

        # Calculate Risk Level
        if is_phishing:
            if confidence >= 0.80 or len(url_anomalies) > 0 or len(suspicious_keywords) >= 3:
                risk_level = "HIGH"
            else:
                risk_level = "MEDIUM"
        else:
            if confidence >= 0.75 and len(suspicious_keywords) == 0 and len(url_anomalies) == 0:
                risk_level = "LOW"
            else:
                risk_level = "MEDIUM"

        # Feature contribution explainability (TF-IDF weight * Model coefficient)
        feature_names = self.feature_extractor.get_feature_names()
        coefficients = self.model.coef_[0]
        
        # Get non-zero indices for this document
        row_indices, col_indices = X_vec.nonzero()
        word_contributions = []
        for col_idx in col_indices:
            term = feature_names[col_idx]
            weight = X_vec[0, col_idx]
            coef = coefficients[col_idx]
            contribution = float(weight * coef)
            word_contributions.append({
                'term': term,
                'weight': round(float(weight), 4),
                'coefficient': round(float(coef), 4),
                'contribution': round(contribution, 4),
                'direction': 'PHISHING' if contribution > 0 else 'LEGITIMATE'
            })

        # Sort contributions: strongest phishing indicators vs strongest legitimate indicators
        word_contributions.sort(key=lambda x: abs(x['contribution']), reverse=True)
        top_phishing_signals = [w for w in word_contributions if w['direction'] == 'PHISHING'][:8]
        top_legitimate_signals = [w for w in word_contributions if w['direction'] == 'LEGITIMATE'][:8]

        # Natural language synthesis explanation
        explanation_summary = self._generate_explanation(
            predicted_class=predicted_class,
            confidence=confidence,
            risk_level=risk_level,
            top_phishing_signals=top_phishing_signals,
            suspicious_keywords=suspicious_keywords,
            url_anomalies=url_anomalies
        )

        extracted_urls = TextPreprocessor.extract_urls(full_content)

        return {
            'predicted_class': predicted_class,
            'confidence': round(confidence, 4),
            'risk_level': risk_level,
            'prob_phishing': round(prob_phishing, 4),
            'prob_legitimate': round(prob_legitimate, 4),
            'suspicious_keywords': suspicious_keywords,
            'links_found': extracted_urls,
            'url_anomalies': url_anomalies,
            'top_phishing_signals': top_phishing_signals,
            'top_legitimate_signals': top_legitimate_signals,
            'explanation': explanation_summary
        }

    def _generate_explanation(self, predicted_class: str, confidence: float, risk_level: str,
                              top_phishing_signals: List[dict], suspicious_keywords: List[str],
                              url_anomalies: List[dict]) -> Dict[str, Any]:
        """Generates comprehensive, interpretable security threat breakdown."""
        reasons = []
        if predicted_class == "PHISHING":
            reasons.append(f"Model classified this email as PHISHING with {round(confidence * 100, 1)}% confidence.")
            if top_phishing_signals:
                terms = ", ".join([f"'{s['term']}' (weight: {s['contribution']})" for s in top_phishing_signals[:4]])
                reasons.append(f"Key machine learning lexical drivers identified: {terms}.")
            if suspicious_keywords:
                reasons.append(f"High-urgency / credential harvesting keywords detected: {', '.join(suspicious_keywords[:6])}.")
            if url_anomalies:
                reasons.append(f"{len(url_anomalies)} link(s) matched high-risk patterns (e.g. deceptive subdomains, untrusted TLDs, or raw IP hosts).")
        else:
            reasons.append(f"Model classified this email as LEGITIMATE with {round(confidence * 100, 1)}% confidence.")
            reasons.append("Email contains standard workplace / operational vocabulary without aggressive urgency manipulation.")
            if suspicious_keywords:
                reasons.append(f"Note: Found benign occurrence of {len(suspicious_keywords)} keyword(s), but structural model context remains legitimate.")

        disclaimer = (
            "Model explanation notice: Extracted suspicious keywords and lexical weights are supporting "
            "signals calculated from TF-IDF feature contributions and pattern matching. They are intended as "
            "explainable AI diagnostic aids for security analysts rather than definitive standalone proof."
        )

        return {
            'summary': " ".join(reasons),
            'risk_level': risk_level,
            'reasons': reasons,
            'disclaimer': disclaimer
        }
