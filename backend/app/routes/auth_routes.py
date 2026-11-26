from functools import wraps
from flask import Blueprint, request, jsonify
from ..services.auth_service import AuthService
from ..models import User

auth_bp = Blueprint('auth', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Authentication token missing.'}), 401

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({'error': 'Invalid Authorization format. Expected Bearer <token>'}), 401

        token = parts[1]
        payload = AuthService.verify_token(token)
        if not payload:
            return jsonify({'error': 'Session expired or token invalid. Please log in again.'}), 401

        current_user = User.query.get(payload['user_id'])
        if not current_user:
            return jsonify({'error': 'User not found.'}), 401

        return f(current_user, *args, **kwargs)
    return decorated

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    password = data.get('password', '')

    result = AuthService.authenticate(username, password)
    if not result['success']:
        return jsonify({'error': result['message']}), 401

    return jsonify({
        'message': result['message'],
        'token': result['token'],
        'user': result['user']
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Logged out successfully.'}), 200

@auth_bp.route('/status', methods=['GET'])
def status():
    # If Authorization header present, verify it
    auth_header = request.headers.get('Authorization')
    if auth_header and len(auth_header.split()) == 2:
        token = auth_header.split()[1]
        payload = AuthService.verify_token(token)
        if payload:
            user = User.query.get(payload['user_id'])
            if user:
                return jsonify({
                    'authenticated': True,
                    'user': user.to_dict()
                }), 200

    # Ensure default admin exists for first-run
    admin = AuthService.ensure_default_admin()
    return jsonify({
        'authenticated': False,
        'first_run_info': {
            'default_username': 'admin',
            'note': 'Use default credentials (admin / Admin@FreshAI2026) for first-run login.'
        }
    }), 200
