import os
import pandas as pd
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
from datetime import datetime, timezone
from flask import current_app
from ..models import db, DatasetInfo
from ..ml.preprocessor import TextPreprocessor

class DatasetService:
    """Handles CSV dataset upload, column mapping, preprocessing, and statistics."""

    @classmethod
    def get_active_dataset_path(cls) -> Path:
        """Returns the most recent uploaded dataset or the fallback sample dataset."""
        latest_record = DatasetInfo.query.order_by(DatasetInfo.uploaded_at.desc()).first()
        if latest_record:
            uploaded_path = current_app.config['UPLOAD_FOLDER'] / latest_record.filename
            if uploaded_path.exists():
                return uploaded_path

        # Fallback to sample dataset
        sample_path = current_app.config['SAMPLE_DATA_PATH']
        return sample_path

    @classmethod
    def load_dataframe(cls, filepath: Path) -> pd.DataFrame:
        """Reads CSV with robust encoding handling."""
        if not filepath.exists():
            raise FileNotFoundError(f"File not found: {filepath}")

        try:
            return pd.read_csv(filepath, encoding='utf-8')
        except UnicodeDecodeError:
            return pd.read_csv(filepath, encoding='latin1')

    @classmethod
    def inspect_file(cls, filepath: Path) -> Dict[str, Any]:
        """Reads the header columns and top preview rows of an uploaded file."""
        df = cls.load_dataframe(filepath)
        columns = list(df.columns)
        
        # Suggest probable column matches
        text_col_candidate = None
        label_col_candidate = None
        
        for col in columns:
            c_low = col.lower().strip()
            if not text_col_candidate and ('text' in c_low or 'body' in c_low or 'email' in c_low or 'content' in c_low or 'message' in c_low):
                text_col_candidate = col
            if not label_col_candidate and ('label' in c_low or 'class' in c_low or 'target' in c_low or 'spam' in c_low or 'phishing' in c_low):
                label_col_candidate = col

        preview_records = df.head(10).fillna('').to_dict(orient='records')

        return {
            'total_rows': len(df),
            'columns': columns,
            'suggested_text_col': text_col_candidate or (columns[0] if columns else None),
            'suggested_label_col': label_col_candidate or (columns[1] if len(columns) > 1 else None),
            'preview': preview_records
        }

    @classmethod
    def process_and_register_dataset(
        cls,
        filepath: Path,
        filename: str,
        text_col: str = 'email_text',
        label_col: str = 'label'
    ) -> Dict[str, Any]:
        """
        Validates columns, computes distribution, and logs into DatasetInfo table.
        """
        df = cls.load_dataframe(filepath)

        if text_col not in df.columns:
            raise ValueError(f"Selected text column '{text_col}' not found in dataset columns: {list(df.columns)}")
        if label_col not in df.columns:
            raise ValueError(f"Selected label column '{label_col}' not found in dataset columns: {list(df.columns)}")

        # Normalize dataframe
        clean_df = df.dropna(subset=[text_col, label_col]).copy()
        
        def map_label(val):
            s = str(val).strip().lower()
            if s in ['1', 'phishing', 'phish', 'spam', 'malicious', 'true', 'yes']:
                return 'phishing'
            return 'legitimate'

        labels = clean_df[label_col].apply(map_label)
        phishing_count = int((labels == 'phishing').sum())
        legitimate_count = int((labels == 'legitimate').sum())
        total_records = len(clean_df)

        # Standardize and save as active dataset
        standardized_df = pd.DataFrame({
            'email_text': clean_df[text_col],
            'label': labels
        })
        standardized_filename = f"active_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}_{filename}"
        save_path = current_app.config['UPLOAD_FOLDER'] / standardized_filename
        standardized_df.to_csv(save_path, index=False)

        # Register in DB
        info = DatasetInfo(
            filename=standardized_filename,
            total_records=total_records,
            phishing_records=phishing_count,
            legitimate_records=legitimate_count,
            feature_count=0,
            uploaded_at=datetime.now(timezone.utc)
        )
        db.session.add(info)
        db.session.commit()

        return {
            'id': info.id,
            'filename': info.filename,
            'total_records': total_records,
            'phishing_records': phishing_count,
            'legitimate_records': legitimate_count,
            'preview': clean_df.head(10).fillna('').to_dict(orient='records'),
            'message': 'Dataset successfully uploaded, mapped, and registered.'
        }

    @classmethod
    def load_synthetic_sample(cls) -> Dict[str, Any]:
        """Loads and registers the bundled synthetic demonstration dataset."""
        sample_path = current_app.config['SAMPLE_DATA_PATH']
        if not sample_path.exists():
            raise FileNotFoundError(f"Synthetic sample dataset not found at {sample_path}")

        return cls.process_and_register_dataset(
            filepath=sample_path,
            filename="synthetic_demonstration_emails.csv",
            text_col='email_text',
            label_col='label'
        )

    @classmethod
    def get_current_statistics(cls) -> Dict[str, Any]:
        """Returns statistics of the latest active dataset."""
        latest = DatasetInfo.query.order_by(DatasetInfo.uploaded_at.desc()).first()
        if not latest:
            # Try to auto-load sample data
            try:
                res = cls.load_synthetic_sample()
                latest = DatasetInfo.query.get(res['id'])
            except Exception:
                return {
                    'has_dataset': False,
                    'message': 'No dataset uploaded yet.'
                }

        # Load preview of current dataset
        filepath = current_app.config['UPLOAD_FOLDER'] / latest.filename
        if not filepath.exists():
            filepath = current_app.config['SAMPLE_DATA_PATH']

        preview_records = []
        try:
            df = cls.load_dataframe(filepath)
            preview_records = df.head(15).fillna('').to_dict(orient='records')
        except Exception:
            pass

        return {
            'has_dataset': True,
            'dataset_info': latest.to_dict(),
            'preview': preview_records
        }
