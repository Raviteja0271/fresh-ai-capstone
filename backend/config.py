import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'fresh-ai-capstone-secret-key-2026-secure-session')
    DB_PATH = BASE_DIR / 'database' / 'fresh_ai.db'
    db_url = os.environ.get('DATABASE_URL')
    if db_url and db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql://', 1)
    SQLALCHEMY_DATABASE_URI = db_url if db_url else f'sqlite:///{DB_PATH}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    UPLOAD_FOLDER = BASE_DIR / 'uploads'
    MODEL_FOLDER = BASE_DIR / 'trained_models'
    SAMPLE_DATA_PATH = BASE_DIR.parent / 'sample_data' / 'sample_emails.csv'
    
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max upload
    ALLOWED_EXTENSIONS = {'csv', 'txt'}
    
    # In production on Render or cloud, allow all origins by default or configurable via env
    _configured_cors = os.environ.get('CORS_ORIGINS')
    if _configured_cors:
        CORS_ORIGINS = [origin.strip() for origin in _configured_cors.split(',') if origin.strip()]
    else:
        CORS_ORIGINS = "*"
