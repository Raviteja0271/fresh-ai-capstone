import React from 'react';
import { ShieldCheck, Database, RefreshCw } from 'lucide-react';

export default function Navbar({ pageTitle, pageSubtitle, onRefresh, isRefreshing = false }) {
  return (
    <header className="top-navbar">
      <div className="page-title">
        <h2>{pageTitle}</h2>
        {pageSubtitle && <span>{pageSubtitle}</span>}
      </div>

      <div className="top-navbar-actions">
        <div className="sys-badge">
          <span className="sys-badge-dot"></span>
          <span>Local Defense Active</span>
        </div>

        {onRefresh && (
          <button
            className="btn btn-secondary"
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{ padding: '7px 12px', fontSize: '0.8rem', gap: '6px' }}
            title="Refresh Data"
          >
            <RefreshCw size={14} className={isRefreshing ? 'spinner' : ''} />
            <span>Sync</span>
          </button>
        )}
      </div>
    </header>
  );
}
