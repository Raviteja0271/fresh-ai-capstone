import React from 'react';

export default function MetricCard({ title, value, caption, icon: Icon, theme = 'navy' }) {
  return (
    <div className={`metric-card ${theme}`}>
      <div className="metric-info">
        <h3>{title}</h3>
        <div className="metric-value">{value}</div>
        {caption && <div className="metric-caption">{caption}</div>}
      </div>
      <div className={`metric-icon-box ${theme}`}>
        {Icon && <Icon size={24} />}
      </div>
    </div>
  );
}
