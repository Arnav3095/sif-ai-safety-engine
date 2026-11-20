import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function StaffReportsView({ currentUser }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const userName = currentUser?.full_name || currentUser?.email || 'Field Staff';
      const response = await api.get('/reports', {
        params: {
          per_page: 50,
          submitted_by: userName
        }
      });
      setReports(response.data.reports);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    window.addEventListener('reports-updated', fetchReports);
    return () => window.removeEventListener('reports-updated', fetchReports);
  }, [currentUser]);

  if (loading) return <div className="loading">⏳ Loading submission history...</div>;

  return (
    <div className="staff-history-view">
      <div className="section-header">
        <h2>📋 My Submitted Field Reports</h2>
        <p>Showing reports filed by: <strong>{currentUser?.full_name}</strong></p>
      </div>

      {reports.length === 0 ? (
        <div className="empty-state-card">
          <span className="empty-icon">📂</span>
          <h3>No Safety Submissions Found</h3>
          <p>You haven't submitted any safety observations yet under this account. Switch to the "Submit Safety Report" tab to file a report.</p>
        </div>
      ) : (
        <div className="reports-grid">
          {reports.map(report => (
            <div key={report.id} className={`report-card risk-${report.sif_classification.toLowerCase()}`}>
              <div className="card-header">
                <h3>{report.title}</h3>
                <span className={`status-pill ${report.status}`}>{report.status.toUpperCase()}</span>
              </div>
              <p className="card-desc">{report.description}</p>
              <div className="card-meta-row">
                <span>📍 {report.site_name}</span>
                <span>🔧 {report.activity_type}</span>
                <span>⏱️ {new Date(report.date_submitted).toLocaleDateString()}</span>
              </div>

              <div className="card-triage-info">
                <span className={`label ${report.sif_classification.toLowerCase()}`}>{report.sif_classification}</span>
                <small>AI Confidence: {(report.sif_confidence * 100).toFixed(1)}%</small>
              </div>

              {report.assigned_to && (
                <div className="action-box">
                  <strong>👨‍🔧 Assigned Officer:</strong> {report.assigned_to}
                </div>
              )}

              {report.action_taken && (
                <div className="action-box success">
                  <strong>✅ Action Taken:</strong> {report.action_taken}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
