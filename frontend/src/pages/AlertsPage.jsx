import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Eye,
  Filter,
  Check,
  ShieldAlert
} from 'lucide-react';
import ApiService from '../services/api';
import ConfirmationModal from '../components/ConfirmationModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AlertsPage({ onSelectEmailForExplanation }) {
  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Delete modal state
  const [deleteModalAlert, setDeleteModalAlert] = useState(null);

  const loadAlerts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ApiService.getAlerts({
        severity: severityFilter,
        status: statusFilter
      });
      setAlerts(data.alerts || []);
    } catch (err) {
      setError(err.message || 'Failed to load security alerts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [severityFilter, statusFilter]);

  const handleReview = async (alertId) => {
    try {
      await ApiService.reviewAlert(alertId);
      setSuccessMsg(`Alert #${alertId} marked as REVIEWED.`);
      // Update local state immediately
      setAlerts(alerts.map((a) => (a.id === alertId ? { ...a, status: 'REVIEWED' } : a)));
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to review alert.');
    }
  };

  const handleDelete = async () => {
    if (!deleteModalAlert) return;
    try {
      await ApiService.deleteAlert(deleteModalAlert.id);
      setSuccessMsg(`Alert #${deleteModalAlert.id} deleted.`);
      setAlerts(alerts.filter((a) => a.id !== deleteModalAlert.id));
      setDeleteModalAlert(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete alert.');
    }
  };

  const getSeverityBadge = (sev) => {
    const s = (sev || '').toUpperCase();
    if (s === 'CRITICAL' || s === 'HIGH') {
      return <span className="badge badge-high">{s}</span>;
    }
    if (s === 'MEDIUM') {
      return <span className="badge badge-med">MEDIUM</span>;
    }
    return <span className="badge badge-low">LOW</span>;
  };

  return (
    <div>
      {error && (
        <div className="alert-box danger">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert-box success">
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="card-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Filter size={18} color="#10B981" />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F1411' }}>Filter Security Incidents:</span>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Severity:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Status:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">New (Unreviewed)</option>
                <option value="REVIEWED">Reviewed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Feed Card */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div>
            <div className="card-title">
              <Bell size={18} color="#10B981" />
              Incident Alert Stream
            </div>
            <div className="card-subtitle">
              Automated alarms triggered by high-risk email classifications
            </div>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
            {alerts.length} Incident(s)
          </span>
        </div>

        {loading ? (
          <LoadingSpinner text="Retrieving security alerts..." />
        ) : alerts.length > 0 ? (
          <div className="table-responsive">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th style={{ width: '130px' }}>Severity</th>
                  <th>Incident Description</th>
                  <th style={{ width: '110px' }}>Status</th>
                  <th style={{ width: '160px' }}>Timestamp</th>
                  <th style={{ width: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td className="mono" style={{ fontWeight: 600 }}>#{alert.id}</td>
                    <td>{getSeverityBadge(alert.severity)}</td>
                    <td style={{ maxWidth: '420px', lineHeight: 1.5 }}>
                      <div style={{ fontWeight: 600, color: '#0F1411', marginBottom: '2px' }}>
                        {alert.alert_type}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                        {alert.description}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${alert.status === 'NEW' ? 'badge-high' : 'badge-low'}`}>
                        {alert.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      {alert.created_at}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {alert.status === 'NEW' && (
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleReview(alert.id)}
                            style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px' }}
                            title="Mark as Reviewed"
                          >
                            <Check size={12} color="#10B981" />
                            <span>Review</span>
                          </button>
                        )}

                        {alert.analysis_id && (
                          <button
                            className="btn btn-secondary"
                            onClick={() => onSelectEmailForExplanation(alert.analysis_id)}
                            style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px' }}
                            title="Inspect Threat Explanation"
                          >
                            <Eye size={12} />
                            <span>Inspect</span>
                          </button>
                        )}

                        <button
                          className="btn btn-outline-danger"
                          onClick={() => setDeleteModalAlert(alert)}
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          title="Delete Alert"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94A3B8' }}>
            <ShieldAlert size={44} style={{ opacity: 0.3, marginBottom: '10px' }} />
            <p style={{ fontWeight: 500 }}>No security alerts found matching the current filter criteria.</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal for Alert Deletion */}
      <ConfirmationModal
        isOpen={Boolean(deleteModalAlert)}
        title="Delete Security Alert"
        message={`Are you sure you want to permanently delete alert #${deleteModalAlert?.id}? This action cannot be undone.`}
        confirmText="Delete Alert"
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalAlert(null)}
      />
    </div>
  );
}
