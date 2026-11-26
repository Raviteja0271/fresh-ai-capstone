from datetime import datetime
import json
from . import db

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='admin')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None
        }

class EmailAnalysis(db.Model):
    __tablename__ = 'email_analysis'
    
    id = db.Column(db.Integer, primary_key=True)
    sender_email = db.Column(db.String(255), nullable=True)
    subject = db.Column(db.String(500), nullable=True)
    email_content = db.Column(db.Text, nullable=False)
    predicted_class = db.Column(db.String(50), nullable=False)  # PHISHING or LEGITIMATE
    confidence = db.Column(db.Float, nullable=False)  # 0.0 to 1.0 (or percentage)
    risk_level = db.Column(db.String(50), nullable=False)  # LOW, MEDIUM, HIGH
    suspicious_keywords = db.Column(db.Text, nullable=True)  # JSON list
    explanation = db.Column(db.Text, nullable=True)  # Detailed JSON/Text explanation
    links_found = db.Column(db.Text, nullable=True)  # JSON list of extracted links
    header_analysis = db.Column(db.Text, nullable=True)  # JSON summary of header checks
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    alerts = db.relationship('SecurityAlert', backref='analysis', cascade='all, delete-orphan', lazy=True)

    def to_dict(self):
        keywords = []
        if self.suspicious_keywords:
            try:
                keywords = json.loads(self.suspicious_keywords)
            except Exception:
                keywords = [k.strip() for k in self.suspicious_keywords.split(',') if k.strip()]
                
        links = []
        if self.links_found:
            try:
                links = json.loads(self.links_found)
            except Exception:
                links = []

        explanation_data = self.explanation
        if self.explanation:
            try:
                explanation_data = json.loads(self.explanation)
            except Exception:
                pass

        header_data = None
        if self.header_analysis:
            try:
                header_data = json.loads(self.header_analysis)
            except Exception:
                pass

        return {
            'id': self.id,
            'sender_email': self.sender_email or 'Unknown Sender',
            'subject': self.subject or 'No Subject',
            'email_content': self.email_content,
            'predicted_class': self.predicted_class,
            'confidence': round(self.confidence, 4),
            'risk_level': self.risk_level,
            'suspicious_keywords': keywords,
            'explanation': explanation_data,
            'links_found': links,
            'header_analysis': header_data,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }

class SecurityAlert(db.Model):
    __tablename__ = 'security_alerts'
    
    id = db.Column(db.Integer, primary_key=True)
    analysis_id = db.Column(db.Integer, db.ForeignKey('email_analysis.id'), nullable=True)
    alert_type = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(50), nullable=False)  # LOW, MEDIUM, HIGH, CRITICAL
    status = db.Column(db.String(50), default='NEW')  # NEW, REVIEWED, DISMISSED
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'analysis_id': self.analysis_id,
            'alert_type': self.alert_type,
            'description': self.description,
            'severity': self.severity,
            'status': self.status,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }

class DatasetInfo(db.Model):
    __tablename__ = 'dataset_info'
    
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    total_records = db.Column(db.Integer, nullable=False)
    phishing_records = db.Column(db.Integer, nullable=False)
    legitimate_records = db.Column(db.Integer, nullable=False)
    feature_count = db.Column(db.Integer, default=0)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'total_records': self.total_records,
            'phishing_records': self.phishing_records,
            'legitimate_records': self.legitimate_records,
            'feature_count': self.feature_count,
            'uploaded_at': self.uploaded_at.strftime('%Y-%m-%d %H:%M:%S') if self.uploaded_at else None
        }

class ModelMetric(db.Model):
    __tablename__ = 'model_metrics'
    
    id = db.Column(db.Integer, primary_key=True)
    model_name = db.Column(db.String(100), nullable=False)
    accuracy = db.Column(db.Float, nullable=False)
    precision = db.Column(db.Float, nullable=False)
    recall = db.Column(db.Float, nullable=False)
    f1_score = db.Column(db.Float, nullable=False)
    confusion_matrix = db.Column(db.Text, nullable=True)  # JSON 2x2 matrix
    classification_report = db.Column(db.Text, nullable=True)  # JSON details
    train_size = db.Column(db.Integer, default=0)
    test_size = db.Column(db.Integer, default=0)
    trained_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        matrix = None
        if self.confusion_matrix:
            try:
                matrix = json.loads(self.confusion_matrix)
            except Exception:
                matrix = None
        
        report = None
        if self.classification_report:
            try:
                report = json.loads(self.classification_report)
            except Exception:
                report = None

        return {
            'id': self.id,
            'model_name': self.model_name,
            'accuracy': round(self.accuracy, 4),
            'precision': round(self.precision, 4),
            'recall': round(self.recall, 4),
            'f1_score': round(self.f1_score, 4),
            'confusion_matrix': matrix,
            'classification_report': report,
            'train_size': self.train_size,
            'test_size': self.test_size,
            'trained_at': self.trained_at.strftime('%Y-%m-%d %H:%M:%S') if self.trained_at else None
        }
