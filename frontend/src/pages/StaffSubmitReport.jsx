import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function StaffSubmitReport({ currentUser }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    site_name: currentUser?.site_name || 'Mumbai Offshore Platform',
    location: 'Central Processing Unit',
    activity_type: 'Hot Work',
    date_incident: new Date().toISOString().slice(0, 16)
  });
  
  const [aiPreview, setAiPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Debounced Live AI Preview
  useEffect(() => {
    if (!formData.title && !formData.description) {
      setAiPreview(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setPreviewLoading(true);
        const response = await api.post('/reports/classify-preview', {
          title: formData.title,
          description: formData.description
        });
        setAiPreview(response.data);
      } catch (err) {
        console.error("Preview error:", err);
      } finally {
        setPreviewLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.title, formData.description]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const applyTemplate = (title, description, activity) => {
    setFormData(prev => ({
      ...prev,
      title,
      description,
      activity_type: activity
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post('/reports/submit', {
        ...formData,
        submitted_by: currentUser?.full_name || 'Field Staff'
      });
      setResult(response.data);
      setFormData({
        title: '',
        description: '',
        site_name: currentUser?.site_name || 'Mumbai Offshore Platform',
        location: 'Central Processing Unit',
        activity_type: 'Hot Work',
        date_incident: new Date().toISOString().slice(0, 16)
      });
      setAiPreview(null);
      window.dispatchEvent(new Event('reports-updated'));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-submit-container">
      <div className="form-main">
        <div className="section-header">
          <h2>👷 Submit Field Observation / Near-Miss</h2>
          <p>Report safety conditions or near-miss incidents. Reporter: <strong>{currentUser?.full_name}</strong></p>
        </div>

        {/* Quick Observation Template Chips */}
        <div className="template-chips">
          <span className="chips-label">⚡ Quick Templates:</span>
          <button type="button" className="chip" onClick={() => applyTemplate("Uncontrolled Gas Leak Observed", "Minor gas leak detected near flange valve #4 during pressure test without gas detector.", "Pressure Testing")}>
            ⛽ Gas Leak
          </button>
          <button type="button" className="chip" onClick={() => applyTemplate("Unsafe Scaffolding Assembly", "Scaffold missing toe-boards and top guardrail at 15m elevation.", "Other")}>
            🪜 Scaffold Hazard
          </button>
          <button type="button" className="chip" onClick={() => applyTemplate("No Isolation / Lockout Tagout", "Maintenance started on live electrical motor without de-energizing or applying LOTO tag.", "Energy Isolation")}>
            ⚡ No LOTO Tag
          </button>
          <button type="button" className="chip" onClick={() => applyTemplate("Corrosion on High Pressure Line", "Severe wall loss and external corrosion noticed on main diesel transfer pipeline.", "Maintenance")}>
            🔧 Pipe Corrosion
          </button>
        </div>

        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label>Report Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Uncontrolled gas leak detected near CPU manifold"
              required
            />
          </div>

          <div className="form-group">
            <label>Detailed Incident Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what happened, equipment involved, safety equipment used/missing..."
              rows="5"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Site Name</label>
              <input
                type="text"
                name="site_name"
                value={formData.site_name}
                onChange={handleChange}
                placeholder="e.g., Mumbai Platform, Assam Refinery"
              />
            </div>

            <div className="form-group">
              <label>Location / Section</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., CPU Block 4, Compressor Deck"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Activity Type</label>
              <select
                name="activity_type"
                value={formData.activity_type}
                onChange={handleChange}
              >
                <option value="Hot Work">Hot Work</option>
                <option value="Confined Space Entry">Confined Space Entry</option>
                <option value="Energy Isolation">Energy Isolation</option>
                <option value="Lifting & Rigging">Lifting & Rigging</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inspection">Inspection</option>
                <option value="Pressure Testing">Pressure Testing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date & Time of Incident</label>
              <input
                type="datetime-local"
                name="date_incident"
                value={formData.date_incident}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? '⏳ Submitting to Triage Engine...' : '✅ Submit Safety Report'}
          </button>
        </form>

        {error && <div className="alert alert-error">❌ Error: {error}</div>}
        {result && (
          <div className="alert alert-success">
            <h3>✅ Report Submitted & Triaged Successfully!</h3>
            <p><strong>Report ID:</strong> {result.report_id}</p>
            <p><strong>AI Triage Level:</strong> <span className={`label ${result.classification.toLowerCase()}`}>{result.classification}</span> ({(result.confidence * 100).toFixed(1)}% confidence)</p>
          </div>
        )}
      </div>

      {/* Live AI Triage Sidebar */}
      <div className="form-sidebar">
        <div className="ai-preview-card">
          <div className="ai-card-header">
            <span className="sparkle-icon">✨</span>
            <h3>Real-Time AI Triage Preview</h3>
            {previewLoading && <span className="spinner">🔄</span>}
          </div>
          <p className="ai-card-sub">As you type, the Voting Ensemble AI model dynamically analyzes potential fatality risks.</p>

          {aiPreview ? (
            <div className="ai-preview-body">
              <div className="preview-stat">
                <span className="stat-lbl">Predicted Risk Level:</span>
                <span className={`label ${aiPreview.classification.toLowerCase()} large`}>
                  {aiPreview.classification}
                </span>
              </div>

              <div className="preview-stat">
                <span className="stat-lbl">AI Confidence Score:</span>
                <div className="conf-bar-wrap">
                  <div className="conf-bar-fill" style={{ width: `${aiPreview.confidence * 100}%` }} />
                </div>
                <strong>{(aiPreview.confidence * 100).toFixed(1)}%</strong>
              </div>

              <div className="preview-stat">
                <span className="stat-lbl">Tagged Life-Saving Rule:</span>
                <span className="rule-badge">{aiPreview.life_saving_rule || 'None Tagged'}</span>
              </div>

              <div className="preview-stat">
                <span className="stat-lbl">Precursors Detected:</span>
                <div className="tag-cloud">
                  {aiPreview.precursors && aiPreview.precursors.length > 0 ? (
                    aiPreview.precursors.map((p, idx) => (
                      <span key={idx} className="tag precursor">{p}</span>
                    ))
                  ) : (
                    <small className="muted">No precursor triggers found</small>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="ai-preview-placeholder">
              <p>Type a report title or description to see instant AI triage analysis.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
