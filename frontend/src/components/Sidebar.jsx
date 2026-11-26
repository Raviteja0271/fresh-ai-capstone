import React from 'react';
import {
  Shield,
  LayoutDashboard,
  MailSearch,
  CheckCheck,
  KeyRound,
  FileQuestion,
  Bell,
  History,
  Database,
  Cpu,
  Info,
  LogOut
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, user, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Main Dashboard', icon: LayoutDashboard, section: 'Core' },
    { id: 'analysis', label: 'Email Analysis', icon: MailSearch, section: 'Analysis' },
    { id: 'threat-explanation', label: 'Threat Explanation', icon: FileQuestion, section: 'Analysis' },
    { id: 'sender-auth', label: 'Sender Authentication', icon: CheckCheck, section: 'Security' },
    { id: 'pgp-secure', label: 'PGP & Cryptography', icon: KeyRound, section: 'Security' },
    { id: 'dataset', label: 'Dataset Management', icon: Database, section: 'Machine Learning' },
    { id: 'model-performance', label: 'Model Performance', icon: Cpu, section: 'Machine Learning' },
    { id: 'alerts', label: 'Security Alerts', icon: Bell, section: 'Monitoring' },
    { id: 'history', label: 'Analysis History', icon: History, section: 'Monitoring' },
    { id: 'about', label: 'About Project', icon: Info, section: 'General' },
  ];

  // Group items by section
  const sections = ['Core', 'Analysis', 'Security', 'Machine Learning', 'Monitoring', 'General'];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-icon-wrapper">
          <Shield size={24} />
        </div>
        <div className="brand-text">
          <h1>FRESH AI</h1>
          <p>Email Security</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {sections.map((section) => {
          const items = navItems.filter((i) => i.section === section);
          if (!items.length) return null;
          return (
            <div key={section} style={{ marginBottom: '8px' }}>
              <div className="nav-section-title">{section}</div>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setCurrentPage(item.id)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-badge">
          <div className="user-avatar">
            {(user?.username || 'A')[0].toUpperCase()}
          </div>
          <div className="user-info">
            <div className="username">{user?.username || 'Admin User'}</div>
            <div className="role">{user?.role || 'Administrator'}</div>
          </div>
        </div>
        <button
          className="btn btn-secondary"
          onClick={onLogout}
          style={{ width: '100%', padding: '8px 12px', fontSize: '0.8rem', gap: '8px' }}
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
