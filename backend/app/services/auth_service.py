from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from flask import current_app
from ..models import db, User

class AuthService:
    """Manages local administrator authentication, first-run setup, and session tokens."""

    @staticmethod
    def get_serializer():
        secret_key = current_app.config['SECRET_KEY']
        return URLSafeTimedSerializer(secret_key)

    @classmethod
    def generate_token(cls, user: User) -> str:
        s = cls.get_serializer()
        return s.dumps({'user_id': user.id, 'username': user.username, 'role': user.role})

    @classmethod
    def verify_token(cls, token: str, max_age: int = 86400) -> dict:
        """Verifies token validity (default 24h expiration)."""
        s = cls.get_serializer()
        try:
            data = s.loads(token, max_age=max_age)
            return data
        except (SignatureExpired, BadSignature):
            return None

    @classmethod
    def ensure_default_admin(cls) -> User:
        """Creates the default administrator account on first-run if no users exist."""
        admin = User.query.filter_by(role='admin').first()
        if not admin:
            default_username = 'admin'
            default_password = 'Admin@FreshAI2026'
            admin = User(
                username=default_username,
                password_hash=generate_password_hash(default_password),
                role='admin',
                created_at=datetime.now(timezone.utc)
            )
            db.session.add(admin)
            db.session.commit()
            print(f"[FRESH AI] First-run setup: Initialized administrator '{default_username}'.")
        return admin

    @classmethod
    def authenticate(cls, username: str, password: str) -> dict:
        """Authenticates user and returns JWT token."""
        # Ensure at least one admin exists
        cls.ensure_default_admin()

        if not username or not password:
            return {'success': False, 'message': 'Username and password are required.'}

        user = User.query.filter_by(username=username.strip()).first()
        if not user or not check_password_hash(user.password_hash, password):
            return {'success': False, 'message': 'Invalid username or password.'}

        user.last_login = datetime.now(timezone.utc)
        db.session.commit()

        token = cls.generate_token(user)
        return {
            'success': True,
            'token': token,
            'user': user.to_dict(),
            'message': 'Authentication successful.'
        }
