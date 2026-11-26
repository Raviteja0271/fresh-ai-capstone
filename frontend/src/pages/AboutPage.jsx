import React from 'react';
import {
  Shield,
  GraduationCap,
  Cpu,
  Lock,
  Layers,
  Database,
  CheckCircle,
  FileText,
  AlertTriangle,
  Code2
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Title Hero */}
      <div className="card-panel" style={{
        background: 'linear-gradient(135deg, #0F1411 0%, #18221B 100%)',
        color: '#FFFFFF',
        padding: '36px 32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={{
            padding: '12px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
          }}>
            <Shield size={32} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF' }}>
              FRESH AI
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#34D399', fontWeight: 600 }}>
              Fresh AI-Assisted Phishing Email Detection and Secure Communication Framework
            </p>
          </div>
        </div>

        <p style={{ fontSize: '0.92rem', color: '#CBD5E1', lineHeight: 1.6, maxWidth: '850px' }}>
          An end-to-end intelligent cybersecurity web application engineered to protect enterprise and academic email
          inboxes from sophisticated social engineering, credential harvesting, and spoofing attacks. Built with
          state-of-the-art Natural Language Processing, Explainable Machine Learning, Sender Header Verification,
          and OpenPGP / RSA Public-Key Cryptography.
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '20px',
          flexWrap: 'wrap',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '16px'
        }}>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
            Academic Track: <strong>Final-Year B.Tech Capstone Project</strong>
          </span>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>•</span>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
            Specialization: <strong>Artificial Intelligence & Machine Learning</strong>
          </span>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>•</span>
          <span style={{ fontSize: '0.8rem', color: '#34D399', fontWeight: 600 }}>
            Environment: Localhost Defense
          </span>
        </div>
      </div>

      {/* Architecture & Methodology */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div>
            <div className="card-title">
              <Layers size={18} color="#10B981" />
              System Architecture & Core Engineering Modules
            </div>
            <div className="card-subtitle">Comprehensive breakdown of technical building blocks</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0F1411', marginBottom: '6px' }}>
              <Cpu size={16} color="#10B981" />
              Module 1 & 2: Machine Learning & NLP
            </div>
            <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
              Implements HTML stripping, canonical URL tokenization, and TF-IDF n-gram (1, 2) vectorization.
              Employs balanced Logistic Regression with reproducible train/test splits, computing true empirical accuracy,
              precision, recall, and confusion matrices on unseen data.
            </p>
          </div>

          <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0F1411', marginBottom: '6px' }}>
              <Shield size={16} color="#10B981" />
              Module 3A: Sender Authentication
            </div>
            <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
              Parses RFC 5322 header blocks to detect sender vs Reply-To mismatches, Return-Path divergences,
              and brand typosquatting. Evaluates explicit SPF, DKIM, and DMARC verification tokens with educational
              transparency regarding supplied vs live DNS verification.
            </p>
          </div>

          <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0F1411', marginBottom: '6px' }}>
              <Lock size={16} color="#10B981" />
              Module 3B: PGP & Cryptography
            </div>
            <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
              Dual-engine asymmetric cryptography: natively integrates with GnuPG subprocesses when present,
              with a robust built-in Python Cryptography RSA-2048 / OAEP engine for seamless local demonstrations.
              Supports digital signatures (RSA-PSS) and SHA-256 integrity checks.
            </p>
          </div>

          <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#0F1411', marginBottom: '6px' }}>
              <Database size={16} color="#10B981" />
              Module 4 & 5: Threat Diagnostics & Storage
            </div>
            <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
              Persistent relational SQLite backend managed via SQLAlchemy ORM. Tracks full analysis history,
              automated incident security alerts, dataset metadata, and empirical evaluation metrics without storing
              private cryptographic keys or sensitive credentials.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack Details */}
      <div className="card-panel">
        <div className="card-panel-header">
          <div>
            <div className="card-title">
              <Code2 size={18} color="#10B981" />
              Technology Stack Specifications
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Frontend</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F1411', marginTop: '2px' }}>React 18 & Vite</div>
            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Recharts, Lucide Icons, Custom Responsive CSS</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Backend API</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F1411', marginTop: '2px' }}>Python & Flask</div>
            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Flask-CORS, RESTful Endpoints, Werkzeug</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Database</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F1411', marginTop: '2px' }}>SQLite & SQLAlchemy</div>
            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Parameterized queries, Relational Cascades</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>ML & Security</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0F1411', marginTop: '2px' }}>Scikit-Learn & GnuPG</div>
            <div style={{ fontSize: '0.78rem', color: '#64748B' }}>TF-IDF, Cryptography RSA-2048, SHA-256</div>
          </div>
        </div>
      </div>

      {/* Safety & Academic Integrity Disclaimers */}
      <div className="card-panel" style={{ borderLeft: '4px solid #10B981' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F1411', marginBottom: '8px' }}>
          Ethical AI & Cybersecurity Disclosures
        </h4>
        <ul style={{ paddingLeft: '20px', fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
          <li>All testing and demonstration data consists solely of synthetic, safe, and curated samples. No live malicious payloads or exploit code are stored or processed.</li>
          <li>The framework operates entirely locally on localhost without requiring paid cloud APIs or transmission of user email content over external networks.</li>
          <li>Private cryptographic keys and passphrases are strictly confined to client-side memory or exported to user custody, and are never persisted in the database.</li>
        </ul>
      </div>
    </div>
  );
}
