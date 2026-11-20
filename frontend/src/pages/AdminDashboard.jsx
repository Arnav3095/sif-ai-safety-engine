import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../utils/api';
import SummaryCard from '../components/SummaryCard';

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [topSites, setTopSites] = useState([]);
  const [topActivities, setTopActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [overviewRes, sitesRes, activitiesRes] = await Promise.all([
          api.get('/dashboard/overview'),
          api.get('/dashboard/top-sites'),
          api.get('/dashboard/top-activities')
        ]);
        setOverview(overviewRes.data);
        setTopSites(sitesRes.data.sites);
        setTopActivities(activitiesRes.data.activities);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading">⏳ Loading Executive Overview...</div>;
  if (!overview) return <div className="error">No overview data available</div>;

  const chartData = [
    { name: 'CRITICAL (SIF)', value: overview.critical_reports, fill: '#ff4444' },
    { name: 'MEDIUM RISK', value: overview.medium_reports, fill: '#ffaa00' },
    { name: 'LOW RISK', value: overview.low_reports, fill: '#00aa00' }
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-alert-banner">
        <div className="alert-badge">🚨 SIF ALERT</div>
        <div>
          <strong>{overview.critical_reports} Critical Fatal-Potential Incidents</strong> recorded. Focus immediate field audits on highest risk sites.
        </div>
      </div>

      {/* Summary KPI Cards */}
      <section className="summary-cards">
        <SummaryCard title="Total Observations" value={overview.total_reports} icon="📋" color="#3498db" />
        <SummaryCard title="Critical (SIF)" value={overview.critical_reports} percentage={overview.critical_percentage} icon="🚨" color="#e74c3c" />
        <SummaryCard title="Medium Risk" value={overview.medium_reports} percentage={overview.medium_percentage} icon="⚠️" color="#f39c12" />
        <SummaryCard title="Low Risk" value={overview.low_reports} percentage={overview.low_percentage} icon="✅" color="#2ecc71" />
        <SummaryCard title="Last 7 Days" value={overview.reports_last_7_days} subtitle={`${overview.critical_last_7_days} critical`} icon="📈" color="#9b59b6" />
      </section>

      {/* Charts & Risk Tables */}
      <div className="dashboard-grid">
        <div className="chart-box">
          <h3>📊 Fatality Potential Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="table-box">
          <h3>🏭 High Risk Operating Sites</h3>
          <table className="risk-table">
            <thead>
              <tr>
                <th>Site Name</th>
                <th>Reports</th>
                <th>Critical</th>
                <th>Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {topSites.slice(0, 5).map((site, idx) => (
                <tr key={idx}>
                  <td><strong>{site.site_name}</strong></td>
                  <td>{site.total_reports}</td>
                  <td className="critical">{site.critical_reports}</td>
                  <td className="score">{site.risk_score.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
