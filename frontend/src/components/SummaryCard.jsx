import React from 'react';

export default function SummaryCard({ title, value, percentage, subtitle, icon, color }) {
  return (
    <div className="summary-card" style={{ borderLeftColor: color }}>
      <div className="card-icon">{icon}</div>
      <div className="card-content">
        <h4>{title}</h4>
        <div className="card-value">{value}</div>
        {percentage && <div className="card-percentage">{percentage.toFixed(1)}%</div>}
        {subtitle && <div className="card-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
}
