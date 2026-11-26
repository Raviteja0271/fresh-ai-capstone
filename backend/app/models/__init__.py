from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .models import User, EmailAnalysis, SecurityAlert, DatasetInfo, ModelMetric
