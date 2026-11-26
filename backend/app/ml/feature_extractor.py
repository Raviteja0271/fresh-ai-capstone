from sklearn.feature_extraction.text import TfidfVectorizer
import joblib
from pathlib import Path

class FeatureExtractor:
    """Manages TF-IDF Vectorization for email texts."""

    def __init__(self, max_features: int = 3000, ngram_range: tuple = (1, 2)):
        self.vectorizer = TfidfVectorizer(
            ngram_range=ngram_range,
            max_features=max_features,
            stop_words='english',
            sublinear_tf=True
        )
        self.is_fitted = False

    def fit_transform(self, raw_documents):
        """Fit vectorizer and transform documents into TF-IDF sparse matrix."""
        X = self.vectorizer.fit_transform(raw_documents)
        self.is_fitted = True
        return X

    def transform(self, raw_documents):
        """Transform documents using already fitted vectorizer."""
        if not self.is_fitted:
            raise ValueError("TF-IDF Vectorizer has not been fitted yet.")
        return self.vectorizer.transform(raw_documents)

    def get_feature_names(self):
        """Return vocabulary feature names."""
        if not self.is_fitted:
            return []
        return self.vectorizer.get_feature_names_out().tolist()

    def save(self, filepath: Path):
        """Serialize vectorizer to disk."""
        filepath.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.vectorizer, filepath)

    def load(self, filepath: Path):
        """Deserialize vectorizer from disk."""
        if not filepath.exists():
            raise FileNotFoundError(f"Vectorizer file not found at {filepath}")
        self.vectorizer = joblib.load(filepath)
        self.is_fitted = True
