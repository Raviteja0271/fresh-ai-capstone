import React, { useState } from 'react';
import { Shield, Lock, User, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import ApiService from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@FreshAI2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await ApiService.login(username, password);
      if (res.token) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #07190F 0%, #0E2E1D 50%, #05140B 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #0F1411, #18201B)',
          padding: '36px 32px 28px',
          textAlign: 'center',
          color: '#FFFFFF',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div style={{
            display: 'inline-flex',
            padding: '12px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            borderRadius: '14px',
            marginBottom: '16px',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
          }}>
            <Shield size={32} color="#FFFFFF" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.5px' }}>FRESH AI</h2>
          <p style={{ fontSize: '0.78rem', color: '#10B981', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
            Intelligent Phishing Detection & Secure Email Communication
          </p>
        </div>

        <div style={{ padding: '32px' }}>
          {error && (
            <div className="alert-box danger" style={{ marginBottom: '20px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} color="#6B7C72" />
                Username
              </label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} color="#6B7C72" />
                Password
              </label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px', marginTop: '8px' }}
            >
              {loading ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <KeyRound size={16} />}
              <span>{loading ? 'Authenticating...' : 'Sign In to Security Dashboard'}</span>
            </button>
          </form>

          <div style={{
            marginTop: '24px',
            padding: '14px',
            background: '#F4F8F5',
            borderRadius: '12px',
            border: '1px solid #E3ECE6',
            fontSize: '0.8rem',
            color: '#4B5E53'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#0F1411', marginBottom: '4px' }}>
              <CheckCircle2 size={14} color="#10B981" />
              First-Run Local Demonstration Credentials
            </div>
            <div>Username: <strong className="mono" style={{ color: '#0E1410' }}>admin</strong></div>
            <div>Password: <strong className="mono" style={{ color: '#0E1410' }}>Admin@FreshAI2026</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
