import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function LifeSavingRulesView({ currentUser }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add Rule Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newKeywords, setNewKeywords] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState(null);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/life-saving-rules');
      setRules(res.data.rules);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleAddRuleSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);

    try {
      const response = await api.post('/dashboard/life-saving-rules', {
        rule_code: newCode,
        rule_name: newName,
        description: newDesc,
        keywords: newKeywords
      });

      if (response.data.success) {
        setShowAddModal(false);
        setNewCode('');
        setNewName('');
        setNewDesc('');
        setNewKeywords('');
        fetchRules();
      }
    } catch (err) {
      setAddError(err.response?.data?.error || err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const filteredRules = rules.filter(r => {
    const term = searchTerm.toLowerCase();
    const keywordsStr = Array.isArray(r.keywords) ? r.keywords.join(' ') : (r.keywords || '');
    return (
      r.rule_code.toLowerCase().includes(term) ||
      r.rule_name.toLowerCase().includes(term) ||
      r.description.toLowerCase().includes(term) ||
      keywordsStr.toLowerCase().includes(term)
    );
  });

  const getRuleIcon = (code) => {
    if (code.startsWith('ES')) return '⚡';
    if (code.startsWith('HW')) return '🔥';
    if (code.startsWith('CS')) return '🚪';
    if (code.startsWith('LOF')) return '🎯';
    if (code.startsWith('WH')) return '🪜';
    if (code.startsWith('MVS')) return '🚜';
    if (code.startsWith('HPE')) return '💥';
    if (code.startsWith('CT')) return '🏗️';
    if (code.startsWith('BSC')) return '🛑';
    if (code.startsWith('PTW')) return '📝';
    if (code.startsWith('FFD')) return '🩺';
    if (code.startsWith('H2S')) return '☣️';
    return '🛡️';
  };

  if (loading) return <div className="loading">⏳ Loading Life-Saving Rules...</div>;

  return (
    <div className="rules-view">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2>⚙️ IOGP & IndianOil Life-Saving Rules Master</h2>
          <p>Mandatory standards & protocols for eliminating Serious Injury & Fatality (SIF) in plant operations.</p>
        </div>

        {currentUser?.role === 'admin' && (
          <button
            type="button"
            className="btn-primary"
            style={{ background: '#ea580c', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => { setAddError(null); setShowAddModal(true); }}
          >
            ➕ Add New Life-Saving Rule
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="filter-bar" style={{ margin: '16px 0 24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="🔍 Search rule by code, title, or keywords (e.g. LOTO, H2S, Hot Work)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: '12px 16px', background: '#111c24', border: '1px solid #24384a', color: '#fff', borderRadius: '6px', outline: 'none' }}
        />
        <span style={{ font: '11px var(--mono)', color: '#94a3b8' }}>
          {filteredRules.length} of {rules.length} Rules Loaded
        </span>
      </div>

      <div className="rules-grid">
        {filteredRules.map(rule => (
          <div key={rule.id} className="rule-card">
            <div className="rule-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>{getRuleIcon(rule.rule_code)}</span>
                <h3>{rule.rule_name}</h3>
              </div>
              <span className="rule-code">{rule.rule_code}</span>
            </div>
            <p>{rule.description}</p>
            {rule.keywords && (
              <div className="tag-cloud" style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(Array.isArray(rule.keywords) ? rule.keywords : rule.keywords.split(',')).map((kw, idx) => (
                  <span key={idx} className="tag">{kw.trim()}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add New Rule Modal (Admin) */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content iocl-modal">
            <div className="modal-header">
              <h2>➕ Add New Life-Saving Rule Master Record</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {addError && <div className="alert alert-error">❌ {addError}</div>}
              <form onSubmit={handleAddRuleSubmit} className="report-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Rule Code (e.g., LOTO02, HAZ01) *</label>
                    <input
                      type="text"
                      placeholder="e.g. LOTO02"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Rule Name / Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Chemical Spill Containment"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Rule Description & Mandatory Safeguards *</label>
                  <textarea
                    rows="4"
                    placeholder="Provide clear operational requirements and safety protocol..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Trigger Keywords (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. chemical, spill, hazmat, containment, acid"
                    value={newKeywords}
                    onChange={(e) => setNewKeywords(e.target.value)}
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ background: '#ea580c' }} disabled={addLoading}>
                    {addLoading ? 'Saving Rule...' : '✅ Save New Rule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
