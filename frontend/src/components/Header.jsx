import React from 'react';
import HealthCheck from './HealthCheck';

export default function Header({ currentUser, onLogout }) {
  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand-lockup">
          <span className="brand-mark">OIL<span>/</span>HSSE</span>
          <span className="brand-kicker">SIH 2026 • AI SAFETY PORTAL</span>
        </div>
        
        {/* Logged In User Profile Badge & Logout */}
        <div className="user-profile-badge">
          <div className="user-avatar">
            {currentUser.role === 'admin' ? '🛡️' : '👷'}
          </div>
          <div className="user-details">
            <strong className="user-name">{currentUser.full_name}</strong>
            <small className="user-role-lbl">
              {currentUser.user_id || (currentUser.role === 'admin' ? 'ADM-001' : 'EMP-101')} • {currentUser.site_name || 'Corporate HSSE HQ'}
            </small>
          </div>
          <button type="button" className="logout-btn" onClick={onLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="header-banner">
        <div className="header-brand-lockup">
          <div className="header-iocl-badge">
            <img src="/indianoil_logo.png" alt="IndianOil Emblem" className="header-iocl-img" />
            <span className="header-iocl-lbl">IndianOil</span>
          </div>
          <div>
            <h1>
              {currentUser.role === 'staff' 
                ? `Welcome, ${currentUser.full_name}. Report field observations instantly.` 
                : `HSSE Command Center — Oversight & AI Triage.`}
            </h1>
            <p>
              {currentUser.role === 'staff'
                ? 'Real-time Voting Ensemble AI model assists staff in flagging fatality precursors.'
                : 'Executive safety oversight, AI risk verification, officer assignment & resolution tracking.'}
            </p>
          </div>
        </div>
        <div className="header-stats">
          <HealthCheck />
          <span className="last-sync">LOGGED IN AS {currentUser.email.toUpperCase()}</span>
        </div>
      </div>
    </header>
  );
}
