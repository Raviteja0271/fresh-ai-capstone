import json
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from flask import current_app
from ..models import db, EmailAnalysis, SecurityAlert, ModelMetric, DatasetInfo
from ..ml.classifier import PhishingClassifier
from .dataset_service import DatasetService

class MLService:
    """Orchestrates ML model training, prediction, evaluation, and alert dispatch."""

    _classifier_instance: Optional[PhishingClassifier] = None

    @classmethod
    def get_classifier(cls) -> PhishingClassifier:
        """Singleton instance of PhishingClassifier."""
        if cls._classifier_instance is None:
            model_dir = current_app.config['MODEL_FOLDER']
            cls._classifier_instance = PhishingClassifier(model_dir)
            cls._classifier_instance.load()
        return cls._classifier_instance

    @classmethod
    def train_model(cls) -> Dict[str, Any]:
        """Trains the ML model on the current active dataset."""
        dataset_path = DatasetService.get_active_dataset_path()
        df = DatasetService.load_dataframe(dataset_path)

        classifier = cls.get_classifier()
        metrics = classifier.train(df, text_col='email_text', label_col='label')

        # Persist metrics in DB
        metric_record = ModelMetric(
            model_name="TF-IDF + Logistic Regression",
            accuracy=metrics['accuracy'],
            precision=metrics['precision'],
            recall=metrics['recall'],
            f1_score=metrics['f1_score'],
            confusion_matrix=json.dumps(metrics['confusion_matrix']),
            classification_report=json.dumps(metrics['classification_report']),
            train_size=metrics['train_size'],
            test_size=metrics['test_size'],
            trained_at=datetime.now(timezone.utc)
        )
        db.session.add(metric_record)

        # Update dataset feature count in latest DatasetInfo
        latest_ds = DatasetInfo.query.order_by(DatasetInfo.uploaded_at.desc()).first()
        if latest_ds:
            latest_ds.feature_count = metrics.get('feature_count', 0)

        db.session.commit()

        return {
            'success': True,
            'metrics': metric_record.to_dict(),
            'message': 'Model successfully trained on dataset with stratified train/test split.'
        }

    @classmethod
    def get_latest_metrics(cls) -> Dict[str, Any]:
        """Returns the most recent trained model metrics."""
        record = ModelMetric.query.order_by(ModelMetric.trained_at.desc()).first()
        if not record:
            # Check if saved model can be loaded
            classifier = cls.get_classifier()
            if classifier.is_loaded and classifier.metrics:
                return {
                    'is_trained': True,
                    'metrics': classifier.metrics
                }
            return {
                'is_trained': False,
                'message': 'No trained model found. Please train the model.'
            }
        return {
            'is_trained': True,
            'metrics': record.to_dict()
        }

    @classmethod
    def analyze_email(
        cls,
        email_content: str,
        subject: str = "",
        sender_email: str = "",
        header_analysis: Optional[dict] = None
    ) -> Dict[str, Any]:
        """
        Runs machine learning classification, explainability, saves to DB,
        and triggers a security alert if threat detected.
        """
        if not email_content or not email_content.strip():
            raise ValueError("Email content cannot be empty.")

        classifier = cls.get_classifier()
        if not classifier.is_loaded:
            if not classifier.load():
                # Auto-train if first run
                cls.train_model()
                classifier = cls.get_classifier()

        # Run ML prediction and explainability
        result = classifier.predict_email(email_content, subject=subject, sender=sender_email)

        # Save to EmailAnalysis database table
        analysis_record = EmailAnalysis(
            sender_email=sender_email.strip() if sender_email else "unknown@domain.com",
            subject=subject.strip() if subject else "No Subject",
            email_content=email_content,
            predicted_class=result['predicted_class'],
            confidence=result['confidence'],
            risk_level=result['risk_level'],
            suspicious_keywords=json.dumps(result['suspicious_keywords']),
            explanation=json.dumps(result['explanation']),
            links_found=json.dumps(result['links_found']),
            header_analysis=json.dumps(header_analysis) if header_analysis else None,
            created_at=datetime.now(timezone.utc)
        )
        db.session.add(analysis_record)
        db.session.flush()  # populate analysis_record.id

        # If phishing or medium/high risk, create a security alert
        created_alert = None
        if result['predicted_class'] == 'PHISHING' or result['risk_level'] in ['MEDIUM', 'HIGH']:
            severity = 'CRITICAL' if result['risk_level'] == 'HIGH' and result['confidence'] > 0.90 else result['risk_level']
            alert_desc = (
                f"Suspicious email detected from '{analysis_record.sender_email}' with subject '{analysis_record.subject}'. "
                f"Classified as {result['predicted_class']} ({round(result['confidence']*100, 1)}% confidence)."
            )
            created_alert = SecurityAlert(
                analysis_id=analysis_record.id,
                alert_type="Phishing Attempt Detected" if result['predicted_class'] == 'PHISHING' else "Potential Risk Inbound Email",
                description=alert_desc,
                severity=severity,
                status="NEW",
                created_at=datetime.now(timezone.utc)
            )
            db.session.add(created_alert)

        db.session.commit()

        response = {
            'analysis_id': analysis_record.id,
            'predicted_class': result['predicted_class'],
            'confidence': result['confidence'],
            'risk_level': result['risk_level'],
            'suspicious_keywords': result['suspicious_keywords'],
            'links_found': result['links_found'],
            'url_anomalies': result['url_anomalies'],
            'top_phishing_signals': result['top_phishing_signals'],
            'top_legitimate_signals': result['top_legitimate_signals'],
            'explanation': result['explanation'],
            'created_at': analysis_record.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'alert_triggered': created_alert.to_dict() if created_alert else None
        }

        return response
