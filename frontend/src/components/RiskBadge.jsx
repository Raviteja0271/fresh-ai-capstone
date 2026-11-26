import React from 'react';
import { AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react';

export default function RiskBadge({ level, size = 'normal' }) {
  const normLevel = (level || 'LOW').toUpperCase();

  if (normLevel === 'HIGH' || normLevel === 'CRITICAL') {
    return (
      <span className="badge badge-high">
        <AlertTriangle size={size === 'small' ? 12 : 14} />
        {normLevel} RISK
      </span>
    );
  }

  if (normLevel === 'MEDIUM') {
    return (
      <span className="badge badge-med">
        <AlertCircle size={size === 'small' ? 12 : 14} />
        MEDIUM RISK
      </span>
    );
  }

  return (
    <span className="badge badge-low">
      <ShieldCheck size={size === 'small' ? 12 : 14} />
      LOW RISK
    </span>
  );
}
