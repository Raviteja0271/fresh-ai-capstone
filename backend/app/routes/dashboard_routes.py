from flask import Blueprint, jsonify
from ..services.dashboard_service import DashboardService

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/statistics', methods=['GET'])
def get_dashboard_statistics():
    try:
        stats = DashboardService.get_statistics()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': f"Failed to retrieve dashboard statistics: {str(e)}"}), 500

@dashboard_bp.route('/trends', methods=['GET'])
def get_dashboard_trends():
    try:
        trends = DashboardService.get_trends()
        return jsonify(trends), 200
    except Exception as e:
        return jsonify({'error': f"Failed to retrieve trend analytics: {str(e)}"}), 500
