import React, { useState } from 'react';
import api from '../utils/api';

export default function AdminReviewModal({ report, currentUser, onClose, onReportUpdated }) {
  const [classification, setClassification] = useState(report.sif_classification || 'CRITICAL');
  const [status, setStatus] = useState(report.status || 'under_review');
  const [assignedTo, setAssignedTo] = useState(report.assigned_to || '');
  const [actionTaken, setActionTaken] = useState(report.action_taken || '');
  const [notes, setNotes] = useState(report.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put(`/reports/${report.report_id}/review`, {
        sif_classification: classification,
        status: status,
        assigned_to: assignedTo,
        action_taken: actionTaken,
        notes: notes,
        reviewed_by: currentUser?.full_name || 'HSSE Admin'
      });
      onReportUpdated();
    } catch (err) {
      alert("Error saving review: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>🛡️ Admin Review & Action - Report #{report.report_id.slice(0, 8)}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSave} className="modal-body">
          <div className="report-summary-box">
            <h3>{report.title}</h3>
            <p>{report.description}</p>
            <div className="summary-tags">
              <span>📍 {report.site_name}</span>
              <span>🔧 {report.activity_type}</span>
              <span>Rule: {report.life_saving_rule || 'N/A'}</span>
            </div>
          </div>

          <div className="form-group">
            <label>AI Classification Override:</label>
            <div className="override-buttons">
              <button
                type="button"
                className={`override-btn critical ${classification === 'CRITICAL' ? 'selected' : ''}`}
                onClick={() => setClassification('CRITICAL')}
              >
                CRITICAL (SIF)
              </button>
              <button
                type="button"
                className={`override-btn medium ${classification === 'MEDIUM' ? 'selected' : ''}`}
                onClick={() => setClassification('MEDIUM')}
              >
                MEDIUM RISK
              </button>
              <button
                type="button"
                className={`override-btn low ${classification === 'LOW' ? 'selected' : ''}`}
                onClick={() => setClassification('LOW')}
              >
                LOW RISK
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Report Status:</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="pending">Pending Review</option>
                <option value="under_review">Under Investigation</option>
                <option value="assigned">Assigned to Engineer</option>
                <option value="resolved">Resolved & Closed</option>
              </select>
            </div>

            <div className="form-group">
              <label>Assign Safety Officer / Engineer:</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="e.g., Eng. Rajesh Sharma (Lead Maintenance)"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Corrective Action Taken:</label>
            <textarea
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              placeholder="Describe corrective safety actions taken on site..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>HSSE Admin Review Notes:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal review notes..."
              rows="2"
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving Changes...' : '💾 Save Review & Update Database'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
