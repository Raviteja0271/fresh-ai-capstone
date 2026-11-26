from flask import Blueprint, request, jsonify
from ..models import db, SecurityAlert

alert_bp = Blueprint('alerts', __name__)

@alert_bp.route('', methods=['GET'])
def get_alerts():
    try:
        severity = request.args.get('severity', '').strip().upper()
        status = request.args.get('status', '').strip().upper()

        query = SecurityAlert.query

        if severity and severity != 'ALL':
            query = query.filter_by(severity=severity)
        if status and status != 'ALL':
            query = query.filter_by(status=status)

        alerts = query.order_by(SecurityAlert.created_at.desc()).all()
        return jsonify({
            'total': len(alerts),
            'alerts': [a.to_dict() for a in alerts]
        }), 200
    except Exception as e:
        return jsonify({'error': f"Failed to retrieve alerts: {str(e)}"}), 500

@alert_bp.route('/<int:alert_id>/review', methods=['PUT'])
def review_alert(alert_id: int):
    alert = SecurityAlert.query.get(alert_id)
    if not alert:
        return jsonify({'error': f"Alert with ID {alert_id} not found."}), 404

    alert.status = 'REVIEWED'
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f"Alert #{alert_id} marked as REVIEWED.",
        'alert': alert.to_dict()
    }), 200

@alert_bp.route('/<int:alert_id>', methods=['DELETE'])
def delete_alert(alert_id: int):
    alert = SecurityAlert.query.get(alert_id)
    if not alert:
        return jsonify({'error': f"Alert with ID {alert_id} not found."}), 404

    db.session.delete(alert)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f"Alert #{alert_id} deleted."
    }), 200
