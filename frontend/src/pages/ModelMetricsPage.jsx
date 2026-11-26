import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Target,
  CheckCircle,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Award,
  Layers,
  Database
} from 'lucide-react';
import ApiService from '../services/api';
import MetricCard from '../components/MetricCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ModelMetricsPage() {
  const [metricsData, setMetricsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadMetrics = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ApiService.getModelMetrics();
      if (data.is_trained) {
        setMetricsData(data.metrics);
      } else {
        setMetricsData(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve model metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const handleRetrain = async () => {
    setTraining(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await ApiService.trainModel();
      setMetricsData(res.metrics);
      setSuccessMsg('Model successfully retrained and evaluated on test dataset.');
    } catch (err) {
      setError(err.message || 'Model training failed.');
    } finally {
      setTraining(false);
    }
  };

  if (loading && !metricsData) {
    return <LoadingSpinner text="Retrieving model validation metrics..." />;
  }

  const cm = metricsData?.confusion_matrix || [[0, 0], [0, 0]];
  const tn = cm[0]?.[0] || 0;
  const fp = cm[0]?.[1] || 0;
  const fn = cm[1]?.[0] || 0;
  const tp = cm[1]?.[1] || 0;

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
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Model Overview Banner */}
      <div className="card-panel" style={{ padding: '20px 24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', background: '#E8F6ED', color: '#047857', borderRadius: '8px' }}>
                <Cpu size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F1411' }}>
                  TF-IDF + Logistic Regression Classifier
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Supervised binary classification model • Evaluated via 75/25 Stratified Train-Test Split (Seed: 42)
                </p>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleRetrain}
            disabled={training}
            style={{ padding: '10px 18px', fontSize: '0.88rem' }}
          >
            <RefreshCw size={16} className={training ? 'spinner' : ''} />
            <span>{training ? 'Retraining & Evaluating...' : 'Retrain Model Now'}</span>
          </button>
        </div>
      </div>

      {metricsData ? (
        <div>
          {/* Key Metric Score Cards */}
          <div className="metrics-grid">
            <MetricCard
              title="Test Accuracy"
              value={`${(metricsData.accuracy * 100).toFixed(1)}%`}
              caption="Overall correct classifications"
              icon={Award}
              theme="navy"
            />
            <MetricCard
              title="Precision"
              value={`${(metricsData.precision * 100).toFixed(1)}%`}
              caption="Low false positive rate"
              icon={Target}
              theme="green"
            />
            <MetricCard
              title="Recall / Sensitivity"
              value={`${(metricsData.recall * 100).toFixed(1)}%`}
              caption="High phishing catch rate"
              icon={TrendingUp}
              theme="amber"
            />
            <MetricCard
              title="F1-Score (Harmonic Mean)"
              value={`${(metricsData.f1_score * 100).toFixed(1)}%`}
              caption="Balanced classification metric"
              icon={Cpu}
              theme="purple"
            />
          </div>

          <div className="grid-2">
            {/* Confusion Matrix Card */}
            <div className="card-panel">
              <div className="card-panel-header">
                <div>
                  <div className="card-title">
                    <Target size={18} color="#10B981" />
                    Empirical Confusion Matrix
                  </div>
                  <div className="card-subtitle">
                    Calculated strictly on the held-out test split ({metricsData.test_size || 28} unseen records)
                  </div>
                </div>
              </div>

              <div style={{ maxWidth: '420px', margin: '0 auto', padding: '10px 0' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  textAlign: 'center'
                }}>
                  {/* True Negative */}
                  <div style={{
                    padding: '20px 14px',
                    background: '#F0FDF4',
                    border: '2px solid #BBF7D0',
                    borderRadius: '10px'
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                      True Negatives (TN)
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#15803D', margin: '4px 0' }}>
                      {tn}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      Legitimate correctly identified
                    </div>
                  </div>

                  {/* False Positive */}
                  <div style={{
                    padding: '20px 14px',
                    background: '#FEF2F2',
                    border: '2px solid #FECACA',
                    borderRadius: '10px'
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase' }}>
                      False Positives (FP)
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#DC2626', margin: '4px 0' }}>
                      {fp}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      Legitimate flagged as Phishing
                    </div>
                  </div>

                  {/* False Negative */}
                  <div style={{
                    padding: '20px 14px',
                    background: '#FEF2F2',
                    border: '2px solid #FECACA',
                    borderRadius: '10px'
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase' }}>
                      False Negatives (FN)
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#DC2626', margin: '4px 0' }}>
                      {fn}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      Phishing slipped through
                    </div>
                  </div>

                  {/* True Positive */}
                  <div style={{
                    padding: '20px 14px',
                    background: '#F0FDF4',
                    border: '2px solid #BBF7D0',
                    borderRadius: '10px'
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
                      True Positives (TP)
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#15803D', margin: '4px 0' }}>
                      {tp}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      Phishing intercepted
                    </div>
                  </div>
                </div>

                <div style={{
                  marginTop: '16px',
                  textAlign: 'center',
                  fontSize: '0.8rem',
                  color: '#64748B'
                }}>
                  Evaluated on {metricsData.test_size || 28} unseen test emails • Trained on {metricsData.train_size || 84} emails
                </div>
              </div>
            </div>

            {/* Hyperparameters & Pipeline Specs */}
            <div className="card-panel">
              <div className="card-panel-header">
                <div>
                  <div className="card-title">
                    <Layers size={18} color="#10B981" />
                    Model Pipeline Architecture
                  </div>
                  <div className="card-subtitle">Feature engineering and estimator configuration</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '12px 16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    Vectorization Technique
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F1411', marginTop: '2px' }}>
                    Term Frequency - Inverse Document Frequency (TF-IDF)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                    Unigrams & Bigrams (1, 2) • Sublinear TF scaling • English stop-words filtered • 3000 max features
                  </div>
                </div>

                <div style={{ padding: '12px 16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    Classification Algorithm
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F1411', marginTop: '2px' }}>
                    L2 Regularized Logistic Regression (lbfgs)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                    Inverse regularization parameter C = 1.5 • Balanced class weights • Fixed random seed: 42
                  </div>
                </div>

                <div style={{ padding: '12px 16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    Model Persistence
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F1411', marginTop: '2px' }}>
                    Local Joblib Serialization
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', marginTop: '2px' }}>
                    Trained model stored in <span className="mono">backend/trained_models/</span> for immediate inference on startup
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: '#64748B', marginBottom: '16px' }}>No model currently trained.</p>
          <button className="btn btn-primary" onClick={handleRetrain} disabled={training}>
            Train Baseline Model
          </button>
        </div>
      )}
    </div>
  );
}
