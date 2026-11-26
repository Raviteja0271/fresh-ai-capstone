import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Mail,
  ShieldCheck
} from 'lucide-react';
import ApiService from '../services/api';
import RiskBadge from '../components/RiskBadge';
import ConfirmationModal from '../components/ConfirmationModal';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HistoryPage({ onSelectEmailForExplanation }) {
  const [historyItems, setHistoryItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [classFilter, setClassFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Delete modal state
  const [deleteModalItem, setDeleteModalItem] = useState(null);

  const loadHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ApiService.getHistory({
        search,
        risk_level: riskFilter,
        predicted_class: classFilter,
        limit: 100
      });
      setHistoryItems(data.items || []);
      setTotalCount(data.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load analysis history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [riskFilter, classFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadHistory();
  };

  const handleDelete = async () => {
    if (!deleteModalItem) return;
    try {
      await ApiService.deleteHistoryRecord(deleteModalItem.id);
      setSuccessMsg(`Analysis record #${deleteModalItem.id} permanently removed.`);
      setHistoryItems(historyItems.filter((i) => i.id !== deleteModalItem.id));
      setDeleteModalItem(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete record.');
    }
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

      {/* Search & Filter Toolbar */}
      <div className="card-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1, maxWidth: '400px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="Search sender, subject, or email content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
              Search
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Classification:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
              >
                <option value="ALL">All Classes</option>
                <option value="PHISHING">Phishing Only</option>
                <option value="LEGITIMATE">Legitimate Only</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Risk Level:</span>
              <select
                className="form-select"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
              >
                <option value="ALL">All Risk Levels</option>
                <option value="HIGH">High Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="LOW">Low Risk</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* History Table Card */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div>
            <div className="card-title">
              <History size={18} color="#10B981" />
              Comprehensive Email Analysis Audit Trail
            </div>
            <div className="card-subtitle">
              Persistent SQLite log of all evaluated email artifacts
            </div>
          </div>
          <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
            {historyItems.length} Record(s) Found
          </span>
        </div>

        {loading ? (
          <LoadingSpinner text="Querying database analysis history..." />
        ) : historyItems.length > 0 ? (
          <div className="table-responsive">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>ID</th>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th style={{ width: '130px' }}>Predicted Class</th>
                  <th style={{ width: '130px' }}>Confidence</th>
                  <th style={{ width: '120px' }}>Risk Level</th>
                  <th style={{ width: '160px' }}>Date & Time</th>
                  <th style={{ width: '140px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {historyItems.map((item) => (
                  <tr key={item.id}>
                    <td className="mono" style={{ fontWeight: 600 }}>#{item.id}</td>
                    <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.sender_email}
                    </td>
                    <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                      {item.subject}
                    </td>
                    <td>
                      <span className={`badge ${item.predicted_class === 'PHISHING' ? 'badge-phishing' : 'badge-legitimate'}`}>
                        {item.predicted_class}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                          width: '50px',
                          height: '6px',
                          background: '#E2E8F0',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${Math.round(item.confidence * 100)}%`,
                            height: '100%',
                            background: item.predicted_class === 'PHISHING' ? '#EF4444' : '#10B981'
                          }} />
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                          {Math.round(item.confidence * 100)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <RiskBadge level={item.risk_level} size="small" />
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#64748B' }}>
                      {item.created_at}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => onSelectEmailForExplanation(item.id)}
                          style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px' }}
                          title="View Threat Diagnostic"
                        >
                          <ExternalLink size={12} />
                          <span>Explain</span>
                        </button>

                        <button
                          className="btn btn-outline-danger"
                          onClick={() => setDeleteModalItem(item)}
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          title="Delete Record"
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
            <Mail size={44} style={{ opacity: 0.3, marginBottom: '10px' }} />
            <p style={{ fontWeight: 500 }}>No history records matched your search query.</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal for History Deletion */}
      <ConfirmationModal
        isOpen={Boolean(deleteModalItem)}
        title="Delete Analysis History Record"
        message={`Are you sure you want to permanently delete analysis record #${deleteModalItem?.id} ("${deleteModalItem?.subject}")?`}
        confirmText="Delete Record"
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalItem(null)}
      />
    </div>
  );
}
