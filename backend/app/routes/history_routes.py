from flask import Blueprint, request, jsonify
from ..models import db, EmailAnalysis

history_bp = Blueprint('history', __name__)

@history_bp.route('', methods=['GET'])
def get_history():
    try:
        search = request.args.get('search', '').strip()
        risk_level = request.args.get('risk_level', '').strip().upper()
        predicted_class = request.args.get('predicted_class', '').strip().upper()
        limit = min(int(request.args.get('limit', 100)), 500)
        page = max(int(request.args.get('page', 1)), 1)

        query = EmailAnalysis.query

        if search:
            query = query.filter(
                (EmailAnalysis.sender_email.ilike(f'%{search}%')) |
                (EmailAnalysis.subject.ilike(f'%{search}%')) |
                (EmailAnalysis.email_content.ilike(f'%{search}%'))
            )

        if risk_level and risk_level != 'ALL':
            query = query.filter_by(risk_level=risk_level)

        if predicted_class and predicted_class != 'ALL':
            query = query.filter_by(predicted_class=predicted_class)

        total_items = query.count()
        records = query.order_by(EmailAnalysis.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

        return jsonify({
            'total': total_items,
            'page': page,
            'limit': limit,
            'items': [r.to_dict() for r in records]
        }), 200
    except Exception as e:
        return jsonify({'error': f"Failed to retrieve history: {str(e)}"}), 500

@history_bp.route('/<int:record_id>', methods=['GET'])
def get_history_detail(record_id: int):
    record = EmailAnalysis.query.get(record_id)
    if not record:
        return jsonify({'error': f"Analysis record with ID {record_id} not found."}), 404

    return jsonify(record.to_dict()), 200

@history_bp.route('/<int:record_id>', methods=['DELETE'])
def delete_history_record(record_id: int):
    record = EmailAnalysis.query.get(record_id)
    if not record:
        return jsonify({'error': f"Analysis record with ID {record_id} not found."}), 404

    db.session.delete(record)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f"Analysis record #{record_id} successfully deleted."
    }), 200
