from datetime import datetime, timedelta, timezone
from sqlalchemy import func
from ..models import db, EmailAnalysis, SecurityAlert

class DashboardService:
    """Computes real-time analytics and statistics from SQLite database."""

    @classmethod
    def get_statistics(cls) -> dict:
        total_analysed = EmailAnalysis.query.count()
        phishing_count = EmailAnalysis.query.filter_by(predicted_class='PHISHING').count()
        legitimate_count = EmailAnalysis.query.filter_by(predicted_class='LEGITIMATE').count()
        high_risk_count = EmailAnalysis.query.filter_by(risk_level='HIGH').count()
        medium_risk_count = EmailAnalysis.query.filter_by(risk_level='MEDIUM').count()
        low_risk_count = EmailAnalysis.query.filter_by(risk_level='LOW').count()
        
        total_alerts = SecurityAlert.query.count()
        new_alerts = SecurityAlert.query.filter_by(status='NEW').count()
        critical_alerts = SecurityAlert.query.filter_by(severity='CRITICAL').count()

        # Class distribution for charts
        class_distribution = [
            {'name': 'Phishing', 'value': phishing_count, 'color': '#EF4444'},
            {'name': 'Legitimate', 'value': legitimate_count, 'color': '#10B981'}
        ]

        # Risk distribution for charts
        risk_distribution = [
            {'name': 'Low Risk', 'value': low_risk_count, 'color': '#10B981'},
            {'name': 'Medium Risk', 'value': medium_risk_count, 'color': '#F59E0B'},
            {'name': 'High Risk', 'value': high_risk_count, 'color': '#EF4444'}
        ]

        return {
            'total_analysed': total_analysed,
            'phishing_count': phishing_count,
            'legitimate_count': legitimate_count,
            'high_risk_count': high_risk_count,
            'medium_risk_count': medium_risk_count,
            'low_risk_count': low_risk_count,
            'total_alerts': total_alerts,
            'new_alerts': new_alerts,
            'critical_alerts': critical_alerts,
            'class_distribution': class_distribution,
            'risk_distribution': risk_distribution
        }

    @classmethod
    def get_trends(cls) -> list:
        """Calculates daily analysis counts over the past 7 days."""
        now = datetime.now(timezone.utc)
        trends = []
        
        for i in range(6, -1, -1):
            day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
            day_end = day_start + timedelta(days=1)
            day_label = day_start.strftime('%b %d')

            phishing_day = EmailAnalysis.query.filter(
                EmailAnalysis.created_at >= day_start,
                EmailAnalysis.created_at < day_end,
                EmailAnalysis.predicted_class == 'PHISHING'
            ).count()

            legitimate_day = EmailAnalysis.query.filter(
                EmailAnalysis.created_at >= day_start,
                EmailAnalysis.created_at < day_end,
                EmailAnalysis.predicted_class == 'LEGITIMATE'
            ).count()

            trends.append({
                'date': day_label,
                'phishing': phishing_day,
                'legitimate': legitimate_day,
                'total': phishing_day + legitimate_day
            })

        return trends
