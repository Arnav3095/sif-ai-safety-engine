import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function AdminTriageQueue({ onReviewReport }) {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports', { params: { per_page: 50 } });
      setReports(res.data.reports);
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
  }, []);

  const filteredReports = filter === 'all'
    ? reports
    : filter === 'pending'
    ? reports.filter(r => r.status === 'pending' || r.status === 'classified')
    : reports.filter(r => r.sif_classification === filter);

  if (loading) return <div className="loading">⏳ Loading Triage Queue...</div>;

  return (
    <div className="admin-queue-view">
      <div className="section-header">
        <h2>🛡️ HSSE Admin Incident Triage & Review Queue</h2>
        <p>Review AI triage classifications, override risk scores, assign field safety officers, and mark actions resolved.</p>
      </div>

      <div className="filter-bar">
        <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All Reports ({reports.length})
        </button>
        <button className={`filter-btn critical ${filter === 'CRITICAL' ? 'active' : ''}`} onClick={() => setFilter('CRITICAL')}>
          Critical (SIF)
        </button>
        <button className={`filter-btn medium ${filter === 'MEDIUM' ? 'active' : ''}`} onClick={() => setFilter('MEDIUM')}>
          Medium
        </button>
        <button className={`filter-btn low ${filter === 'LOW' ? 'active' : ''}`} onClick={() => setFilter('LOW')}>
          Low
        </button>
      </div>

      <div className="queue-list">
        {filteredReports.map(report => (
          <div key={report.id} className={`queue-card risk-${report.sif_classification.toLowerCase()}`}>
            <div className="queue-card-left">
              <div className="queue-title-row">
                <span className={`label ${report.sif_classification.toLowerCase()}`}>{report.sif_classification}</span>
                <h3>{report.title}</h3>
                <span className={`status-pill ${report.status}`}>{report.status.toUpperCase()}</span>
              </div>

              <p className="queue-desc">{report.description}</p>

              <div className="queue-meta">
                <span>📍 {report.site_name}</span>
                <span>🔧 {report.activity_type}</span>
                <span>⏱️ {new Date(report.date_submitted).toLocaleDateString()}</span>
                {report.assigned_to && <span>👨‍🔧 Assigned: {report.assigned_to}</span>}
              </div>
            </div>

            <div className="queue-card-right">
              <div className="conf-score">
                <small>AI Confidence</small>
                <strong>{(report.sif_confidence * 100).toFixed(1)}%</strong>
              </div>
              <button className="review-action-btn" onClick={() => onReviewReport(report)}>
                ⚡ Review & Action
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
