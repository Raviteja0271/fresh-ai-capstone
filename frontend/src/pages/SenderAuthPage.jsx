import React, { useState } from 'react';
import {
  CheckCheck,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Send,
  Sparkles,
  Info,
  Server,
  UserCheck
} from 'lucide-react';
import ApiService from '../services/api';
import RiskBadge from '../components/RiskBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function SenderAuthPage() {
  const [senderEmail, setSenderEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [returnPath, setReturnPath] = useState('');
  const [rawHeaders, setRawHeaders] = useState('');
  const [authHeader, setAuthHeader] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);

  const sampleScenarios = [
    {
      title: '⚠️ Spoofed PayPal Domain & Failed SPF',
      sender: 'billing@paypa1-security.com',
      name: 'PayPal Official Support',
      replyTo: 'phisher-inbox@attacker-host.top',
      returnPath: 'bounce@unverified-mta.online',
      headers: `Received: from mail.unverified-mta.online (192.168.1.100)
From: "PayPal Official Support" <billing@paypa1-security.com>
Reply-To: phisher-inbox@attacker-host.top
Return-Path: <bounce@unverified-mta.online>
Authentication-Results: mx.google.com; spf=fail (google.com: domain of billing@paypa1-security.com does not designate 192.168.1.100 as permitted sender); dkim=fail; dmarc=fail action=quarantine`,
      authHeader: 'spf=fail dkim=fail dmarc=fail'
    },
    {
      title: '✅ Legitimate Corporate Communication',
      sender: 'notifications@microsoft.com',
      name: 'Microsoft 365 Billing',
      replyTo: 'notifications@microsoft.com',
      returnPath: 'bounce@microsoft.com',
      headers: `Received: from mail-relay.microsoft.com (40.92.18.22)
From: "Microsoft 365 Billing" <notifications@microsoft.com>
Reply-To: notifications@microsoft.com
Return-Path: <bounce@microsoft.com>
Authentication-Results: mx.google.com; spf=pass (google.com: domain of notifications@microsoft.com designates 40.92.18.22 as permitted sender); dkim=pass header.i=@microsoft.com; dmarc=pass`,
      authHeader: 'spf=pass dkim=pass dmarc=pass'
    },
    {
      title: '🎭 Executive Impersonation (CEO Fraud)',
      sender: 'ceo.office@executive-personal-mail.xyz',
      name: 'Satya Nadella - Chief Executive Officer',
      replyTo: 'wire-transfers-rapid@offshore-desk.biz',
      returnPath: 'bounce@executive-personal-mail.xyz',
      headers: `From: "Satya Nadella - Chief Executive Officer" <ceo.office@executive-personal-mail.xyz>
Reply-To: wire-transfers-rapid@offshore-desk.biz
Authentication-Results: mx.company.com; spf=softfail; dkim=none; dmarc=fail`,
      authHeader: 'spf=softfail dkim=none dmarc=fail'
    }
  ];

  const handleApplyScenario = (sc) => {
    setSenderEmail(sc.sender);
    setDisplayName(sc.name);
    setReplyTo(sc.replyTo);
    setReturnPath(sc.returnPath);
    setRawHeaders(sc.headers);
    setAuthHeader(sc.authHeader);
    setReport(null);
    setError('');
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!senderEmail && !rawHeaders) {
      setError('Please provide at least a sender email or raw headers.');
      return;
    }

    setLoading(true);
    setError('');
    setReport(null);

    try {
      const data = await ApiService.analyseSender({
        sender_email: senderEmail,
        display_name: displayName,
        reply_to: replyTo,
        return_path: returnPath,
        raw_headers: rawHeaders,
        auth_results_header: authHeader
      });
      setReport(data);
    } catch (err) {
      setError(err.message || 'Sender analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase();
    if (s === 'PASS') {
      return <span className="badge badge-low">PASS</span>;
    }
    if (s === 'FAIL' || s === 'SOFTFAIL' || s === 'REJECT') {
      return <span className="badge badge-high">{s}</span>;
    }
    return <span className="badge badge-neutral">NOT AVAILABLE</span>;
  };

  return (
    <div>
      {/* Sample Scenario Preset Bar */}
      <div className="card-panel" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#0F1411' }}>
            <Sparkles size={16} color="#10B981" />
            <span>Load Header Demonstration Scenarios:</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {sampleScenarios.map((sc, idx) => (
              <button
                key={idx}
                type="button"
                className="btn btn-secondary"
                onClick={() => handleApplyScenario(sc)}
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                {sc.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Input Form */}
        <div className="card-panel">
          <div className="card-panel-header">
            <div>
              <div className="card-title">
                <UserCheck size={18} color="#10B981" />
                Sender Identity & Header Inspector
              </div>
              <div className="card-subtitle">Verify domain alignment, address mismatches and RFC authentication</div>
            </div>
          </div>

          {error && (
            <div className="alert-box danger">
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAnalyze}>
            <div className="form-group">
              <label className="form-label">Sender Email Address *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. security-update@brand-alert.com"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
              />
            </div>

            <div className="grid-2" style={{ gap: '12px', marginBottom: '16px' }}>
              <div>
                <label className="form-label">Display Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. PayPal Support"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Reply-To Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. inbox@destination.com"
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Return-Path (Envelope Sender)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. bounce@mta-origin.com"
                value={returnPath}
                onChange={(e) => setReturnPath(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Raw Email Headers (Optional)</label>
              <textarea
                className="form-textarea"
                rows={5}
                placeholder="Paste RFC 5322 header block here..."
                value={rawHeaders}
                onChange={(e) => setRawHeaders(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px' }}
            >
              {loading ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <Send size={16} />}
              <span>{loading ? 'Inspecting Headers & Alignments...' : 'Analyse Sender Authenticity'}</span>
            </button>
          </form>
        </div>

        {/* Results Report */}
        <div className="card-panel">
          <div className="card-panel-header">
            <div>
              <div className="card-title">
                <CheckCheck size={18} color="#10B981" />
                Authentication Diagnostic Report
              </div>
              <div className="card-subtitle">Parsed header metrics, domain alignment and risk score</div>
            </div>
          </div>

          {loading && <LoadingSpinner text="Evaluating SPF, DKIM, and DMARC alignment..." />}

          {!loading && !report && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7D8E84' }}>
              <Server size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p style={{ fontWeight: 500 }}>No sender header analyzed yet</p>
              <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                Enter sender details or select a scenario preset to run diagnostics.
              </p>
            </div>
          )}

          {!loading && report && (
            <div>
              {/* Summary Score Card */}
              <div style={{
                padding: '18px 20px',
                borderRadius: '12px',
                backgroundColor: report.sender_risk_level === 'HIGH' ? '#FEF2F2' : report.sender_risk_level === 'MEDIUM' ? '#FFFBEB' : '#E8F7EE',
                border: `1px solid ${report.sender_risk_level === 'HIGH' ? '#FECACA' : report.sender_risk_level === 'MEDIUM' ? '#FDE68A' : '#A7F3D0'}`,
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, color: '#6B7C72' }}>
                    Sender Authenticity Verdict
                  </div>
                  <div style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: report.sender_risk_level === 'HIGH' ? '#DC2626' : report.sender_risk_level === 'MEDIUM' ? '#D97706' : '#059669',
                    marginTop: '2px'
                  }}>
                    {report.sender_risk_level} SENDER RISK
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6B7C72' }}>Risk Score</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F1411' }}>
                    {report.risk_score} <span style={{ fontSize: '0.8rem', color: '#7D8E84' }}>/ 100</span>
                  </div>
                </div>
              </div>

              {/* Protocol Badges Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ padding: '12px', background: '#F4F8F5', borderRadius: '8px', border: '1px solid #E3ECE6', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7C72', marginBottom: '6px' }}>SPF STATUS</div>
                  {getStatusBadge(report.spf_status)}
                </div>
                <div style={{ padding: '12px', background: '#F4F8F5', borderRadius: '8px', border: '1px solid #E3ECE6', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7C72', marginBottom: '6px' }}>DKIM STATUS</div>
                  {getStatusBadge(report.dkim_status)}
                </div>
                <div style={{ padding: '12px', background: '#F4F8F5', borderRadius: '8px', border: '1px solid #E3ECE6', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7C72', marginBottom: '6px' }}>DMARC STATUS</div>
                  {getStatusBadge(report.dmarc_status)}
                </div>
              </div>

              {/* Sender Identity Warnings */}
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Identity Alignment Findings:</label>
                {report.warnings && report.warnings.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                    {report.warnings.map((w, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: '#991B1B', background: '#FEF2F2', padding: '8px 12px', borderRadius: '6px', border: '1px solid #FECACA' }}>
                        <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#065F46', background: '#E8F7EE', padding: '10px 14px', borderRadius: '6px', border: '1px solid #A7F3D0' }}>
                    <ShieldCheck size={16} />
                    <span>Sender domains and return path are aligned. No deceptive flags detected.</span>
                  </div>
                )}
              </div>

              {/* Education / Methodology Disclaimer */}
              <div className="alert-box info" style={{ marginBottom: 0 }}>
                <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '0.78rem' }}>
                  {report.verification_disclaimer}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
