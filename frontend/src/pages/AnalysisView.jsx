import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../utils/api';
import SummaryCard from '../components/SummaryCard';

export default function AnalysisView() {
  const [precursors, setPrecursors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/dashboard/precursors')
      .then(res => setPrecursors(res.data.precursors))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">⏳ Loading Precursor Pattern Analytics...</div>;

  const filtered = precursors.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      (p.precursor_type || '').toLowerCase().includes(term) ||
      (p.activity || '').toLowerCase().includes(term) ||
      (p.site_name || '').toLowerCase().includes(term)
    );
  });

  const chartData = filtered.map(p => ({
    name: p.precursor_type ? p.precursor_type.replace('_', ' ') : 'Pattern',
    Probability: parseFloat((p.sif_probability * 100).toFixed(1)),
    Frequency: p.frequency
  }));

  const totalPrecursors = precursors.length;
  const topRiskPrecursor = precursors.length > 0 ? precursors[0] : null;
  const avgProbability = precursors.length > 0 
    ? (precursors.reduce((acc, curr) => acc + (curr.sif_probability || 0), 0) / precursors.length * 100).toFixed(1)
    : '0.0';

  return (
    <div className="analysis-view">
      <div className="section-header">
        <h2>🔍 Precursor Pattern Analytics</h2>
        <p>Correlate recurring safety degradation patterns with severe incident probability across IndianOil operating sites.</p>
      </div>

      {/* KPI Cards */}
      <section className="summary-cards" style={{ marginBottom: '24px' }}>
        <SummaryCard title="Tracked Precursor Patterns" value={totalPrecursors} icon="🔍" color="#38bdf8" />
        <SummaryCard title="Highest SIF Probability" value={topRiskPrecursor ? `${(topRiskPrecursor.sif_probability * 100).toFixed(1)}%` : '0%'} subtitle={topRiskPrecursor ? topRiskPrecursor.precursor_type : ''} icon="🚨" color="#ef4444" />
        <SummaryCard title="Avg SIF Correlation" value={`${avgProbability}%`} subtitle="Predictive risk score" icon="⚡" color="#f59e0b" />
        <SummaryCard title="Top Affected Site" value={topRiskPrecursor ? topRiskPrecursor.site_name : 'N/A'} icon="🏢" color="#10b981" />
      </section>

      {/* Recharts Analytics Bar Chart */}
      <div className="chart-box" style={{ marginBottom: '24px' }}>
        <h3>📊 Precursor SIF Probability vs Occurrence Frequency</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2d3d" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
            <YAxis stroke="#94a3b8" fontSize={11} unit="%" />
            <Tooltip contentStyle={{ background: '#0b1622', borderColor: '#24384a', color: '#fff' }} />
            <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
            <Bar dataKey="Probability" fill="#E85D04" radius={[4, 4, 0, 0]} name="SIF Probability (%)" />
            <Bar dataKey="Frequency" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Occurrence Frequency" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Search Filter Bar */}
      <div className="filter-bar" style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="🔍 Filter patterns by precursor type, activity, or operating site..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, padding: '12px 16px', background: '#091724', border: '1px solid #1c2e40', color: '#fff', borderRadius: '6px', outline: 'none' }}
        />
        <span style={{ font: '11px var(--mono)', color: '#94a3b8' }}>
          Showing {filtered.length} of {precursors.length} Patterns
        </span>
      </div>

      {/* Risk Pattern Table */}
      <div className="table-box">
        <table className="risk-table">
          <thead>
            <tr>
              <th>Pattern ID</th>
              <th>Precursor Type</th>
              <th>Activity / Operation</th>
              <th>Operating Site</th>
              <th>Frequency</th>
              <th>SIF Probability</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, idx) => (
              <tr key={idx}>
                <td><code style={{ color: '#38bdf8' }}>{p.pattern_id || `PRE-00${idx+1}`}</code></td>
                <td>
                  <span className="tag precursor" style={{ fontWeight: '700' }}>
                    {p.precursor_type ? p.precursor_type.replace('_', ' ') : 'General Hazard'}
                  </span>
                </td>
                <td>{p.activity}</td>
                <td>{p.site_name}</td>
                <td><strong>{p.frequency}</strong> incidents</td>
                <td>
                  <span className={`label ${p.sif_probability >= 0.75 ? 'critical' : p.sif_probability >= 0.6 ? 'medium' : 'low'}`}>
                    {(p.sif_probability * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
