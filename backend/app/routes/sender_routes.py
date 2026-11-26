from flask import Blueprint, request, jsonify
from ..security.sender_analyzer import SenderAuthenticator

sender_bp = Blueprint('sender', __name__)

@sender_bp.route('/sender/analyse', methods=['POST'])
def analyse_sender():
    data = request.get_json() or {}
    sender_email = data.get('sender_email', '').strip()
    display_name = data.get('display_name', '').strip()
    reply_to = data.get('reply_to', '').strip()
    return_path = data.get('return_path', '').strip()
    raw_headers = data.get('raw_headers', '').strip()
    auth_results_header = data.get('auth_results_header', '').strip()

    if not sender_email and not raw_headers:
        return jsonify({'error': 'Please provide at least a sender email address or raw email headers.'}), 400

    try:
        report = SenderAuthenticator.analyze_sender(
            sender_email=sender_email,
            display_name=display_name,
            reply_to=reply_to,
            return_path=return_path,
            raw_headers=raw_headers,
            auth_results_header=auth_results_header
        )
        return jsonify(report), 200
    except Exception as e:
        return jsonify({'error': f"Sender analysis error: {str(e)}"}), 500
