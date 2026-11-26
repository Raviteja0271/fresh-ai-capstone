import React, { useState, useEffect } from 'react';
import {
  Mail,
  AlertTriangle,
  ShieldCheck,
  Flame,
  Bell,
  ArrowRight,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import ApiService from '../services/api';
import MetricCard from '../components/MetricCard';
import RiskBadge from '../components/RiskBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DashboardPage({ onNavigate, onSelectEmailForExplanation }) {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, trendsRes, historyRes] = await Promise.all([
        ApiService.getDashboardStatistics(),
        ApiService.getDashboardTrends(),
        ApiService.getHistory({ limit: 5 })
      ]);
      setStats(statsRes);
      setTrends(trendsRes || []);
      setRecentAnalyses(historyRes.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Retrieving real-time cybersecurity metrics from SQLite database..." />;
  }

  const pieData = stats?.class_distribution || [
    { name: 'Phishing', value: 0, color: '#F87171' },
    { name: 'Legitimate', value: 0, color: '#10B981' }
  ];

  const riskData = stats?.risk_distribution || [
    { name: 'Low Risk', value: 0, color: '#10B981' },
    { name: 'Medium Risk', value: 0, color: '#F59E0B' },
    { name: 'High Risk', value: 0, color: '#F87171' }
  ];

  return (
    <div>
      {error && (
        <div className="alert-box danger">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Analysed"
          value={stats?.total_analysed || 0}
          caption="Evaluated via TF-IDF + Logistic Reg."
          icon={Mail}
          theme="navy"
        />
        <MetricCard
          title="Phishing Detected"
          value={stats?.phishing_count || 0}
          caption={`${stats?.total_analysed ? Math.round(((stats.phishing_count || 0) / stats.total_analysed) * 100) : 0}% malicious threat ratio`}
          icon={AlertTriangle}
          theme="red"
        />
        <MetricCard
          title="Legitimate Emails"
          value={stats?.legitimate_count || 0}
          caption="Normal communication verified"
          icon={ShieldCheck}
          theme="green"
        />
        <MetricCard
          title="High-Risk Threats"
          value={stats?.high_risk_count || 0}
          caption="Immediate analyst review required"
          icon={Flame}
          theme="amber"
        />
        <MetricCard
          title="Security Alerts"
          value={stats?.total_alerts || 0}
          caption={`${stats?.new_alerts || 0} pending review`}
          icon={Bell}
          theme="purple"
        />
      </div>

      {/* Visual Charts Grid */}
      <div className="grid-2" style={{ marginBottom: '24px' }}>
        {/* Detection Breakdown */}
        <div className="card-panel" style={{ marginBottom: 0 }}>
          <div className="card-panel-header">
            <div>
              <div className="card-title">
                <PieIcon size={18} color="#10B981" />
                Detection Class Distribution
              </div>
              <div className="card-subtitle">Real-time breakdown of phishing vs legitimate emails</div>
            </div>
          </div>
          <div style={{ height: 260, width: '100%' }}>
            {stats?.total_analysed > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0F1411', border: '1px solid #1C241F', borderRadius: '10px', color: '#FFF' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#7D8E84' }}>
                No emails analysed yet. Analyze sample emails to see distribution.
              </div>
            )}
          </div>
        </div>

        {/* 7-Day Activity Trend */}
        <div className="card-panel" style={{ marginBottom: 0 }}>
          <div className="card-panel-header">
            <div>
              <div className="card-title">
                <BarChart3 size={18} color="#10B981" />
                Detection Activity Trends
              </div>
              <div className="card-subtitle">Daily email threat volume over the past 7 days</div>
            </div>
          </div>
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E3ECE6" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#6B7C72' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#6B7C72' }} />
                <Tooltip
                  contentStyle={{ background: '#0F1411', border: '1px solid #1C241F', borderRadius: '10px', color: '#FFF' }}
                />
                <Legend />
                <Bar dataKey="phishing" name="Phishing" fill="#F87171" radius={[4, 4, 0, 0]} />
                <Bar dataKey="legitimate" name="Legitimate" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Launchpad & Recent Records */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div>
            <div className="card-title">
              <Mail size={18} color="#10B981" />
              Recent Email Analyses
            </div>
            <div className="card-subtitle">Latest incoming messages processed by machine learning inference</div>
          </div>
          <button className="btn btn-secondary" onClick={() => onNavigate('analysis')} style={{ fontSize: '0.82rem' }}>
            <span>Analyse New Email</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {recentAnalyses.length > 0 ? (
          <div className="table-responsive">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th>Classification</th>
                  <th>Confidence</th>
                  <th>Risk Level</th>
                  <th>Timestamp</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentAnalyses.map((item) => (
                  <tr key={item.id}>
                    <td className="mono" style={{ fontWeight: 600 }}>#{item.id}</td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.sender_email}
                    </td>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
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
                          background: '#E3ECE6',
                          borderRadius: '3px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${Math.round(item.confidence * 100)}%`,
                            height: '100%',
                            background: item.predicted_class === 'PHISHING' ? '#F87171' : '#10B981'
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
                    <td style={{ fontSize: '0.78rem', color: '#6B7C72' }}>
                      {item.created_at}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        onClick={() => onSelectEmailForExplanation(item.id)}
                        style={{ padding: '4px 8px', fontSize: '0.75rem', gap: '4px' }}
                      >
                        <ExternalLink size={12} />
                        <span>Explain</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '36px 20px', color: '#64748B' }}>
            <p>No email analysis records in the database yet.</p>
            <button
              className="btn btn-primary"
              onClick={() => onNavigate('analysis')}
              style={{ marginTop: '12px' }}
            >
              Analyze Your First Email
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
