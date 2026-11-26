import React, { useState, useEffect } from 'react';
import ApiService from './services/api';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EmailAnalysisPage from './pages/EmailAnalysisPage';
import ThreatExplanationPage from './pages/ThreatExplanationPage';
import SenderAuthPage from './pages/SenderAuthPage';
import PgpPage from './pages/PgpPage';
import DatasetPage from './pages/DatasetPage';
import ModelMetricsPage from './pages/ModelMetricsPage';
import AlertsPage from './pages/AlertsPage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';

import './App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Check auth status on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = ApiService.getToken();
        if (token) {
          const res = await ApiService.getAuthStatus();
          if (res.authenticated) {
            setUser(res.user);
          } else {
            ApiService.clearToken();
            setUser(null);
          }
        }
      } catch (err) {
        console.warn('Auth check error:', err);
        ApiService.clearToken();
        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = async () => {
    await ApiService.logout();
    setUser(null);
    setCurrentPage('dashboard');
  };

  const handleSelectEmailForExplanation = (emailId) => {
    setSelectedEmailId(emailId);
    setCurrentPage('threat-explanation');
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (checkingAuth) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B132B' }}>
        <LoadingSpinner text="Initializing FRESH AI Security Engine..." />
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Page titles
  const pageMeta = {
    dashboard: { title: 'Security Overview Dashboard', subtitle: 'Real-time telemetry, classification ratios and threat alerts' },
    analysis: { title: 'Intelligent Email Classifier', subtitle: 'Machine learning phishing detection and feature extraction' },
    'threat-explanation': { title: 'Explainable AI Threat Diagnostics', subtitle: 'Interpretable lexical weights and contributing signals' },
    'sender-auth': { title: 'Sender Authentication & Header Analysis', subtitle: 'Domain alignment, SPF, DKIM, and DMARC verification' },
    'pgp-secure': { title: 'PGP & Cryptographic Framework', subtitle: 'OpenPGP key management, asymmetric encryption, RSA-PSS signing & SHA-256' },
    dataset: { title: 'Email Dataset Management', subtitle: 'CSV ingestion, interactive column mapping and preprocessed features' },
    'model-performance': { title: 'Model Evaluation & Metrics', subtitle: 'Empirical accuracy, precision, recall, F1, and confusion matrix' },
    alerts: { title: 'Security Incident Alarms', subtitle: 'Triage, filter and review automated threat alerts' },
    history: { title: 'Email Analysis Audit Trail', subtitle: 'Comprehensive database log of all evaluated email artifacts' },
    about: { title: 'About FRESH AI Capstone Project', subtitle: 'Academic thesis, architecture, and technology stack' }
  };

  const currentMeta = pageMeta[currentPage] || { title: 'Security Dashboard', subtitle: '' };

  return (
    <div className="app-container">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        user={user}
        onLogout={handleLogout}
      />

      <div className="main-wrapper">
        <Navbar
          pageTitle={currentMeta.title}
          pageSubtitle={currentMeta.subtitle}
          onRefresh={handleRefresh}
        />

        <main className="content-area" key={refreshKey}>
          {currentPage === 'dashboard' && (
            <DashboardPage
              onNavigate={(page) => setCurrentPage(page)}
              onSelectEmailForExplanation={handleSelectEmailForExplanation}
            />
          )}

          {currentPage === 'analysis' && (
            <EmailAnalysisPage
              onSelectEmailForExplanation={handleSelectEmailForExplanation}
            />
          )}

          {currentPage === 'threat-explanation' && (
            <ThreatExplanationPage
              selectedEmailId={selectedEmailId}
              onBackToHistory={() => setCurrentPage('history')}
            />
          )}

          {currentPage === 'sender-auth' && <SenderAuthPage />}

          {currentPage === 'pgp-secure' && <PgpPage />}

          {currentPage === 'dataset' && (
            <DatasetPage
              onNavigateToModelTraining={() => setCurrentPage('model-performance')}
            />
          )}

          {currentPage === 'model-performance' && <ModelMetricsPage />}

          {currentPage === 'alerts' && (
            <AlertsPage
              onSelectEmailForExplanation={handleSelectEmailForExplanation}
            />
          )}

          {currentPage === 'history' && (
            <HistoryPage
              onSelectEmailForExplanation={handleSelectEmailForExplanation}
            />
          )}

          {currentPage === 'about' && <AboutPage />}
        </main>
      </div>
    </div>
  );
}
