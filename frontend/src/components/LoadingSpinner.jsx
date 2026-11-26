import React from 'react';

export default function LoadingSpinner({ text = 'Processing...' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '32px' }}>
      <div className="spinner" style={{ width: '28px', height: '28px', borderWidth: '3px' }}></div>
      <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 500 }}>{text}</span>
    </div>
  );
}
