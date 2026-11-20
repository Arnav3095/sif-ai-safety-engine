import React from 'react';

export default function Navigation({ role, activeTab, setActiveTab }) {
  const staffTabs = [
    { id: 'new-report', label: 'Submit Safety Report', icon: '📝' },
    { id: 'my-reports', label: 'My Submissions & Status', icon: '📋' },
    { id: 'lsr-rules', label: 'Life-Saving Rules Guide', icon: '⚙️' }
  ];

  const adminTabs = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: '📊' },
    { id: 'triage-queue', label: 'Incident Triage & Review Queue', icon: '🚨' },
    { id: 'precursor-map', label: 'Precursor Pattern Analytics', icon: '🔍' },
    { id: 'lsr-rules', label: 'Life-Saving Rules Master', icon: '⚙️' }
  ];

  const currentTabs = role === 'staff' ? staffTabs : adminTabs;

  return (
    <nav className="navigation">
      <div className="nav-container">
        {currentTabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
