import React, { useState } from 'react';
import {
  Mail,
  Send,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  ShieldCheck,
  Link2,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import ApiService from '../services/api';
import RiskBadge from '../components/RiskBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function EmailAnalysisPage({ onSelectEmailForExplanation }) {
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const sampleTemplates = [
    {
      title: '🚨 Bank Account Suspension',
      sender: 'support@chase-security-verify.xyz',
      subject: 'URGENT: Your account access has been restricted!',
      content: 'Dear customer, your bank account has been suspended due to suspicious activity. Please verify your credentials immediately at http://secure-bank-login.xyz/verify or your account will be permanently closed within 24 hours.'
    },
    {
      title: '💼 Sprint Backlog Review',
      sender: 'sarah.jenkins@company.com',
      subject: 'Sprint Planning Backlog - Q4 Review',
      content: 'Hi Team, attached is the revised sprint backlog for Q4. Please review the Jira tickets assigned to you before tomorrow 10:00 AM standup so we can finalize user stories.'
    },
    {
      title: '💰 Crypto Airdrop Scam',
      sender: 'airdrop@bitcoin-blockchain-alert.club',
      subject: 'Incoming Bitcoin Transfer: 0.85 BTC Waiting',
      content: 'Cryptocurrency Alert: 0.85 BTC deposited to your wallet address! Confirm your Bitcoin withdrawal request within 12 hours: http://crypto-wallet-verify.club/claim'
    },
    {
      title: '📚 Library Book Due',
      sender: 'library@university.edu',
      subject: 'Library Book Due Date Reminder',
      content: 'Dear student, your library book "Introduction to Computer Security" is due for return on Friday. You can renew it online through the university OPAC catalog.'
    }
  ];

  const handleApplyTemplate = (tmpl) => {
    setSenderEmail(tmpl.sender);
    setSubject(tmpl.subject);
    setEmailContent(tmpl.content);
    setResult(null);
    setError('');
  };

  const handleAnalyse = async (e) => {
    e.preventDefault();
    if (!emailContent.trim()) {
      setError('Please provide email content to analyse.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await ApiService.analyseEmail({
        sender_email: senderEmail,
        subject,
        email_content: emailContent
      });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Email analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Sample presets bar */}
      <div className="card-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#0F1411' }}>
            <Sparkles size={16} color="#10B981" />
            <span>Load Quick Synthetic Demonstration Samples:</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {sampleTemplates.map((t, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-secondary"
                onClick={() => handleApplyTemplate(t)}
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Input Panel */}
        <div className="card-panel">
          <div className="card-panel-header">
            <div>
              <div className="card-title">
                <Mail size={18} color="#10B981" />
                Inbound Email Inspector
              </div>
              <div className="card-subtitle">Paste incoming message contents for ML TF-IDF evaluation</div>
            </div>
          </div>

          {error && (
            <div className="alert-box danger">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAnalyse}>
            <div className="form-group">
              <label className="form-label">Sender Email Address (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. security-alert@service-domain.com"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Subject</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. URGENT: Verify your billing credentials"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Body Content *</label>
              <textarea
                className="form-textarea"
                rows={8}
                placeholder="Paste the full email text here..."
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px' }}
            >
              {loading ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <Send size={16} />}
              <span>{loading ? 'Evaluating Model Feature Contributions...' : 'Analyse Email'}</span>
            </button>
          </form>
        </div>

        {/* Prediction Results Panel */}
        <div className="card-panel">
          <div className="card-panel-header">
            <div>
              <div className="card-title">
                <ShieldAlert size={18} color="#10B981" />
                Detection & Threat Verdict
              </div>
              <div className="card-subtitle">Real-time classification, risk level and signal breakdown</div>
            </div>
          </div>

          {loading && <LoadingSpinner text="Running TF-IDF tokenization & Logistic Regression inference..." />}

          {!loading && !result && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7D8E84' }}>
              <Mail size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ fontWeight: 500 }}>No email analyzed yet</p>
              <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                Fill in the form on the left or select a sample preset to run the ML classifier.
              </p>
            </div>
          )}

          {!loading && result && (
            <div>
              {/* Verdict Banner */}
              <div style={{
                padding: '20px',
                borderRadius: '12px',
                backgroundColor: result.predicted_class === 'PHISHING' ? '#FEF2F2' : '#E8F7EE',
                border: `1px solid ${result.predicted_class === 'PHISHING' ? '#FECACA' : '#A7F3D0'}`,
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: '#6B7C72' }}>
                    Model Classification
                  </div>
                  <div style={{
                    fontSize: '1.6rem',
                    fontWeight: 800,
                    color: result.predicted_class === 'PHISHING' ? '#DC2626' : '#059669',
                    marginTop: '2px'
                  }}>
                    {result.predicted_class}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <RiskBadge level={result.risk_level} />
                  <span style={{ fontSize: '0.78rem', color: '#6B7C72' }}>
                    Record saved to database (#{result.analysis_id})
                  </span>
                </div>
              </div>

              {/* Confidence Meter */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: '#0F1411' }}>Classification Confidence</span>
                  <span style={{ fontWeight: 700, color: '#10B981' }}>{Math.round(result.confidence * 100)}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#E3ECE6', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.round(result.confidence * 100)}%`,
                    height: '100%',
                    background: result.predicted_class === 'PHISHING' ? 'linear-gradient(90deg, #F59E0B, #F87171)' : 'linear-gradient(90deg, #34D399, #10B981)',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>

              {/* Suspicious Keywords */}
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Suspicious Lexical Signals Detected:</label>
                {result.suspicious_keywords && result.suspicious_keywords.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {result.suspicious_keywords.map((kw, i) => (
                      <span key={i} style={{
                        padding: '4px 10px',
                        background: '#FEF2F2',
                        color: '#991B1B',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        border: '1px solid #FCA5A5'
                      }}>
                        {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.82rem', color: '#6B7C72' }}>No high-urgency suspicious keywords detected.</p>
                )}
              </div>

              {/* Links found */}
              {result.links_found && result.links_found.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Link2 size={14} color="#10B981" />
                    <span>Embedded Links Extracted ({result.links_found.length}):</span>
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                    {result.links_found.map((link, idx) => (
                      <div key={idx} className="mono" style={{
                        fontSize: '0.78rem',
                        padding: '6px 10px',
                        background: '#F4F8F5',
                        borderRadius: '6px',
                        border: '1px solid #E3ECE6',
                        wordBreak: 'break-all'
                      }}>
                        {link}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action: View full explanation */}
              <div style={{ paddingTop: '10px', borderTop: '1px solid #E3ECE6', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => onSelectEmailForExplanation(result.analysis_id)}
                  style={{ gap: '6px' }}
                >
                  <span>View Full Explainable Threat Diagnostics</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
