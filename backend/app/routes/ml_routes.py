from flask import Blueprint, request, jsonify
from ..services.ml_service import MLService

ml_bp = Blueprint('ml', __name__)

@ml_bp.route('/model/train', methods=['POST'])
def train_model():
    try:
        result = MLService.train_model()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': f"Model training failed: {str(e)}"}), 500

@ml_bp.route('/model/metrics', methods=['GET'])
def get_metrics():
    try:
        metrics_data = MLService.get_latest_metrics()
        return jsonify(metrics_data), 200
    except Exception as e:
        return jsonify({'error': f"Failed to retrieve metrics: {str(e)}"}), 500

@ml_bp.route('/email/analyse', methods=['POST'])
def analyse_email():
    data = request.get_json() or {}
    email_content = data.get('email_content', '').strip()
    subject = data.get('subject', '').strip()
    sender_email = data.get('sender_email', '').strip()
    header_analysis = data.get('header_analysis', None)

    if not email_content:
        return jsonify({'error': 'Email content is required for analysis.'}), 400

    try:
        analysis_result = MLService.analyze_email(
            email_content=email_content,
            subject=subject,
            sender_email=sender_email,
            header_analysis=header_analysis
        )
        return jsonify(analysis_result), 200
    except Exception as e:
        return jsonify({'error': f"Email analysis failed: {str(e)}"}), 500
