import React, { useState, useEffect } from 'react';
import {
  FileQuestion,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Link2,
  Cpu,
  Info,
  ArrowLeft
} from 'lucide-react';
import ApiService from '../services/api';
import RiskBadge from '../components/RiskBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ThreatExplanationPage({ selectedEmailId, onBackToHistory }) {
  const [emailRecord, setEmailRecord] = useState(null);
  const [allRecords, setAllRecords] = useState([]);
  const [currentId, setCurrentId] = useState(selectedEmailId || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load history list for selector
  useEffect(() => {
    const fetchList = async () => {
      try {
        const res = await ApiService.getHistory({ limit: 50 });
        setAllRecords(res.items || []);
        if (!currentId && res.items && res.items.length > 0) {
          setCurrentId(res.items[0].id);
        }
      } catch (err) {
        console.error('Failed to load history list:', err);
      }
    };
    fetchList();
  }, []);

  // Load specific record details
  useEffect(() => {
    if (!currentId) {
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await ApiService.getHistoryDetail(currentId);
        setEmailRecord(data);
      } catch (err) {
        setError(err.message || `Failed to fetch analysis details for #${currentId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [currentId]);

  if (loading && !emailRecord) {
    return <LoadingSpinner text="Computing explainable AI feature weights..." />;
  }

  const explanation = emailRecord?.explanation || {};
  const reasons = explanation.reasons || [];

  return (
    <div>
      {/* Top Selector Bar */}
      <div className="card-panel" style={{ padding: '16px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {onBackToHistory && (
              <button className="btn btn-secondary" onClick={onBackToHistory} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                <ArrowLeft size={14} />
                <span>History</span>
              </button>
            )}
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F1411' }}>
              Inspect Threat Explanation for Record:
            </div>
          </div>

          <div style={{ minWidth: '280px' }}>
            <select
              className="form-select"
              value={currentId || ''}
              onChange={(e) => setCurrentId(Number(e.target.value))}
            >
              {allRecords.map((r) => (
                <option key={r.id} value={r.id}>
                  #{r.id} - [{r.predicted_class}] {r.subject ? r.subject.substring(0, 30) : r.sender_email}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert-box danger">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {emailRecord && (
        <div>
          {/* Header Overview Card */}
          <div className="card-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span className={`badge ${emailRecord.predicted_class === 'PHISHING' ? 'badge-phishing' : 'badge-legitimate'}`} style={{ fontSize: '0.85rem' }}>
                    {emailRecord.predicted_class}
                  </span>
                  <RiskBadge level={emailRecord.risk_level} />
                  <span style={{ fontSize: '0.8rem', color: '#6B7C72' }}>
                    Confidence: <strong>{Math.round(emailRecord.confidence * 100)}%</strong>
                  </span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F1411' }}>{emailRecord.subject}</h3>
                <div style={{ fontSize: '0.85rem', color: '#6B7C72', marginTop: '4px' }}>
                  Sender: <strong style={{ color: '#0F1411' }}>{emailRecord.sender_email}</strong> • Logged: {emailRecord.created_at}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="mono" style={{ fontSize: '0.75rem', color: '#7D8E84' }}>
                  RECORD ID #{emailRecord.id}
                </span>
              </div>
            </div>

            {/* Email Raw Excerpt */}
            <div style={{ marginTop: '16px', padding: '14px', background: '#F4F8F5', borderRadius: '8px', border: '1px solid #E3ECE6' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#6B7C72', marginBottom: '4px' }}>
                Email Content Snippet:
              </div>
              <p style={{ fontSize: '0.88rem', color: '#334155', fontStyle: 'italic', lineHeight: 1.5 }}>
                "{emailRecord.email_content}"
              </p>
            </div>
          </div>

          <div className="grid-2">
            {/* Key Explainability Drivers */}
            <div className="card-panel">
              <div className="card-panel-header">
                <div>
                  <div className="card-title">
                    <Cpu size={18} color="#10B981" />
                    Machine Learning Diagnostic Synthesis
                  </div>
                  <div className="card-subtitle">Interpretability summary and contributing factors</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reasons.length > 0 ? (
                  reasons.map((reason, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <div style={{ marginTop: '4px' }}>
                        {emailRecord.predicted_class === 'PHISHING' ? (
                          <AlertTriangle size={16} color="#DC2626" />
                        ) : (
                          <CheckCircle size={16} color="#059669" />
                        )}
                      </div>
                      <p style={{ fontSize: '0.88rem', color: '#1E293B', lineHeight: 1.5 }}>
                        {reason}
                      </p>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '0.88rem', color: '#6B7C72' }}>
                    {explanation.summary || 'Model classified based on TF-IDF vocabulary weights.'}
                  </p>
                )}
              </div>

              {/* Disclaimer */}
              <div className="alert-box info" style={{ marginTop: '20px', marginBottom: 0 }}>
                <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.78rem' }}>
                  {explanation.disclaimer || 'Model explanation notice: Suspicious keywords and lexical weights are supporting signals calculated from TF-IDF feature contributions and pattern matching.'}
                </span>
              </div>
            </div>

            {/* Suspicious Tokens & Link Indicators */}
            <div className="card-panel">
              <div className="card-panel-header">
                <div>
                  <div className="card-title">
                    <Link2 size={18} color="#10B981" />
                    Indicators of Compromise (IoC)
                  </div>
                  <div className="card-subtitle">Extracted keywords and embedded link patterns</div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Identified High-Urgency Keywords:</label>
                {emailRecord.suspicious_keywords && emailRecord.suspicious_keywords.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {emailRecord.suspicious_keywords.map((kw, i) => (
                      <span key={i} style={{
                        padding: '4px 10px',
                        background: '#FEF2F2',
                        color: '#991B1B',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        border: '1px solid #FECACA'
                      }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: '#6B7C72' }}>
                    No high-urgency keywords detected in this message.
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label className="form-label">Extracted Links & Web Targets:</label>
                {emailRecord.links_found && emailRecord.links_found.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {emailRecord.links_found.map((url, i) => (
                      <div key={i} className="mono" style={{
                        padding: '8px 12px',
                        background: '#F4F8F5',
                        borderRadius: '6px',
                        border: '1px solid #E3ECE6',
                        fontSize: '0.8rem',
                        wordBreak: 'break-all'
                      }}>
                        {url}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: '#6B7C72' }}>
                    No external hyperlinks detected in email body.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
