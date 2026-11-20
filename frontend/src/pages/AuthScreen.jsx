import React, { useState } from 'react';
import api from '../utils/api';

export default function AuthScreen({ onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState('staff'); // 'staff' | 'admin'
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form inputs
  const [email, setEmail] = useState('staff@oil.com');
  const [password, setPassword] = useState('staff123');

  // Modals state
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showNoticesModal, setShowNoticesModal] = useState(false);

  // Emergency Form State
  const [emergencyData, setEmergencyData] = useState({
    title: '',
    description: '',
    location: 'Refinery Main Processing Unit',
    submitted_by: 'Field Staff'
  });
  const [emergencyLoading, setEmergencyLoading] = useState(false);
  const [emergencyResult, setEmergencyResult] = useState(null);

  // Register Form State
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('staff');
  const [regSite, setRegSite] = useState('Greater Noida HSE Hub');
  const [regEmpId, setRegEmpId] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState(null);

  // Safety Slogans list for rotation
  const slogans = [
    "Safety First, Success Follows",
    "Zero Harm to People, Zero Harm to Environment",
    "Identify Hazards Before They Cause Accidents",
    "Compliance with Life-Saving Rules is Mandatory",
    "Report Near-Misses Immediately to Prevent SIF"
  ];
  const [sloganIndex, setSloganIndex] = useState(0);

  const rotateSlogan = () => {
    setSloganIndex((prev) => (prev + 1) % slogans.length);
  };

  // Quick Demo Login Fill
  const fillDemoStaff = () => {
    setSelectedRole('staff');
    setEmail('staff@oil.com');
    setPassword('staff123');
    setError(null);
  };

  const fillDemoAdmin = () => {
    setSelectedRole('admin');
    setEmail('admin@oil.com');
    setPassword('admin123');
    setError(null);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', {
        email: email,
        password: password,
        role: selectedRole
      });

      if (response.data.success) {
        onLoginSuccess(response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError(null);

    try {
      const response = await api.post('/auth/register', {
        full_name: regFullName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        site_name: regSite,
        user_id: regEmpId
      });

      if (response.data.success) {
        setShowRegisterModal(false);
        onLoginSuccess(response.data.user);
      }
    } catch (err) {
      setRegError(err.response?.data?.error || err.message);
    } finally {
      setRegLoading(false);
    }
  };

  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    setEmergencyLoading(true);
    try {
      const response = await api.post('/reports/submit', {
        title: `🚨 EMERGENCY: ${emergencyData.title}`,
        description: emergencyData.description,
        site_name: 'Greater Noida HSE Refinery',
        location: emergencyData.location,
        activity_type: 'Emergency Action',
        submitted_by: emergencyData.submitted_by || 'Emergency Reporter'
      });
      setEmergencyResult(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setEmergencyLoading(false);
    }
  };

  return (
    <div className="iocl-auth-page">
      {/* Top Header Bar */}
      <header className="iocl-top-header">
        <div className="iocl-header-left">
          <img src="/indianoil_logo.png" alt="IndianOil Emblem" className="iocl-header-emblem" />
          <div className="iocl-header-title-box">
            <h1>INDIANOIL (IOCL) - SAFETY & HSE PORTAL</h1>
            <span className="iocl-header-sub">Greater Noida, Uttar Pradesh, India</span>
          </div>
        </div>
      </header>

      {/* Main Content Layout Grid */}
      <div className="iocl-portal-container">
        {/* Left Side: IndianOil Brand Logo */}
        <div className="iocl-left-branding">
          <img src="/indianoil_logo.png" alt="IndianOil Logo" className="iocl-main-brand-logo" />
          <h2 className="iocl-brand-text">IndianOil</h2>
        </div>

        {/* Center: Main Login Card ("SAFETY & HSE PORTAL") */}
        <div className="iocl-center-card">
          <div className="iocl-card-navy-header">
            <div className="iocl-navy-logo-badge">
              <img src="/indianoil_logo.png" alt="IOCL" />
            </div>
            <h2>SAFETY & HSE PORTAL</h2>
          </div>

          <div className="iocl-card-body">
            {/* Role Switcher Pill Bar */}
            <div className="iocl-role-pills">
              <button
                type="button"
                className={`iocl-role-pill ${selectedRole === 'staff' ? 'active' : ''}`}
                onClick={() => { setSelectedRole('staff'); setError(null); }}
              >
                👷 Field Staff
              </button>
              <button
                type="button"
                className={`iocl-role-pill ${selectedRole === 'admin' ? 'active' : ''}`}
                onClick={() => { setSelectedRole('admin'); setError(null); }}
              >
                🛡️ HSSE Admin
              </button>
            </div>

            {/* 1-Click Demo Shortcut Bar */}
            <div className="iocl-demo-shortcuts">
              <span>⚡ Quick Demo Login:</span>
              <button type="button" onClick={fillDemoStaff} className="iocl-demo-btn">Staff Demo</button>
              <button type="button" onClick={fillDemoAdmin} className="iocl-demo-btn">Admin Demo</button>
            </div>

            {error && <div className="iocl-alert error">❌ {error}</div>}

            <form onSubmit={handleLoginSubmit} className="iocl-form">
              <div className="iocl-input-group">
                <label>EMPLOYEE ID / USER ID</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={selectedRole === 'staff' ? 'A1234567 or staff@oil.com' : 'ADM001 or admin@oil.com'}
                  required
                />
              </div>

              <div className="iocl-input-group">
                <label>PASSWORD</label>
                <div className="iocl-password-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="iocl-eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '🔒'}
                  </button>
                </div>
              </div>

              <div className="iocl-form-options">
                <label className="iocl-checkbox">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember Me</span>
                </label>
                <button
                  type="button"
                  className="iocl-link-text"
                  onClick={() => setShowForgotModal(true)}
                >
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="iocl-submit-btn" disabled={loading}>
                {loading ? 'AUTHENTICATING...' : 'SIGN IN TO PORTAL'}
              </button>

              <div className="iocl-register-prompt">
                Don't have an account?{' '}
                <button
                  type="button"
                  className="iocl-link-text bold"
                  onClick={() => setShowRegisterModal(true)}
                >
                  Sign up here
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side: Safety Widgets Panel */}
        <div className="iocl-right-widgets">
          {/* Widget 1: Emergency Safety Reporting */}
          <div className="iocl-widget-section">
            <div className="iocl-widget-header">
              <span className="iocl-widget-icon red-icon">⚠️</span>
              <div className="iocl-widget-titles">
                <h3>EMERGENCY SAFETY REPORTING</h3>
              </div>
            </div>
            <button
              type="button"
              className="iocl-btn-emergency"
              onClick={() => {
                setEmergencyResult(null);
                setShowEmergencyModal(true);
              }}
            >
              REPORT INCIDENT
            </button>
          </div>

          {/* Widget 2: Today's Safety Slogan */}
          <div className="iocl-widget-section">
            <div className="iocl-widget-header">
              <span className="iocl-widget-icon orange-icon">👷</span>
              <div className="iocl-widget-titles">
                <h3>TODAY'S SAFETY SLOGAN</h3>
                <p className="iocl-slogan-text">"{slogans[sloganIndex]}"</p>
              </div>
            </div>
            <button type="button" className="iocl-slogan-rotate" onClick={rotateSlogan}>
              🔄 Next Slogan
            </button>
          </div>

          {/* Widget 3: Important Safety Notices */}
          <div className="iocl-widget-section">
            <div className="iocl-widget-header">
              <span className="iocl-widget-icon blue-icon">📋</span>
              <div className="iocl-widget-titles">
                <h3>IMPORTANT SAFETY NOTICES</h3>
              </div>
            </div>
            <button
              type="button"
              className="iocl-btn-notices"
              onClick={() => setShowNoticesModal(true)}
            >
              VIEW NOTICES
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Reporting Modal */}
      {showEmergencyModal && (
        <div className="modal-backdrop">
          <div className="modal-content iocl-modal">
            <div className="modal-header emergency-header">
              <h2>🚨 Immediate Emergency Incident Report</h2>
              <button className="close-btn" onClick={() => setShowEmergencyModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {emergencyResult ? (
                <div className="alert alert-success">
                  <h3>✅ Emergency Alert Logged & Dispatched to HSSE Triage!</h3>
                  <p><strong>Report Reference ID:</strong> {emergencyResult.report_id}</p>
                  <p><strong>Triage Priority:</strong> <span className={`label ${emergencyResult.classification?.toLowerCase()}`}>{emergencyResult.classification}</span></p>
                  <button className="btn-primary" onClick={() => setShowEmergencyModal(false)}>Close Window</button>
                </div>
              ) : (
                <form onSubmit={handleEmergencySubmit} className="report-form">
                  <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
                    Use this form for urgent, immediate field hazard reporting. No prior login required.
                  </p>
                  <div className="form-group">
                    <label>Emergency Hazard Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Uncontrolled blow-off or gas leak near Unit 3"
                      value={emergencyData.title}
                      onChange={(e) => setEmergencyData({ ...emergencyData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Incident Details *</label>
                    <textarea
                      rows="4"
                      placeholder="Describe what is occurring, exact location, and personnel involved..."
                      value={emergencyData.description}
                      onChange={(e) => setEmergencyData({ ...emergencyData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Site Location / Area</label>
                      <input
                        type="text"
                        value={emergencyData.location}
                        onChange={(e) => setEmergencyData({ ...emergencyData, location: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Reporter Name / Phone</label>
                      <input
                        type="text"
                        placeholder="e.g. Duty Shift Operator"
                        value={emergencyData.submitted_by}
                        onChange={(e) => setEmergencyData({ ...emergencyData, submitted_by: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn-secondary" onClick={() => setShowEmergencyModal(false)}>Cancel</button>
                    <button type="submit" className="btn-primary" style={{ background: '#dc2626' }} disabled={emergencyLoading}>
                      {emergencyLoading ? 'Logging Alert...' : '🚨 Submit Emergency Alert'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Account Registration Modal */}
      {showRegisterModal && (
        <div className="modal-backdrop">
          <div className="modal-content iocl-modal">
            <div className="modal-header">
              <h2>📝 Create New IndianOil Safety Account</h2>
              <button className="close-btn" onClick={() => setShowRegisterModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {regError && <div className="alert alert-error">❌ {regError}</div>}
              <form onSubmit={handleRegisterSubmit} className="report-form">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="e.g., Rajesh Sharma"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Official Email Address *</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g., rajesh@oil.com"
                    required
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Employee / User ID</label>
                    <input
                      type="text"
                      value={regEmpId}
                      onChange={(e) => setRegEmpId(e.target.value)}
                      placeholder="e.g., EMP-502"
                    />
                  </div>
                  <div className="form-group">
                    <label>Account Role *</label>
                    <select value={regRole} onChange={(e) => setRegRole(e.target.value)}>
                      <option value="staff">Field Staff</option>
                      <option value="admin">HSSE Admin / Executive</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Operating Refinery / Hub Location</label>
                  <input
                    type="text"
                    value={regSite}
                    onChange={(e) => setRegSite(e.target.value)}
                    placeholder="e.g. Greater Noida HSE Hub"
                  />
                </div>
                <div className="form-group">
                  <label>Create Password *</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowRegisterModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ background: '#ea580c' }} disabled={regLoading}>
                    {regLoading ? 'Creating Account...' : 'Create Account & Sign In'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-backdrop">
          <div className="modal-content iocl-modal">
            <div className="modal-header">
              <h2>🔒 Account Support & Password Reset</h2>
              <button className="close-btn" onClick={() => setShowForgotModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ color: '#cbd5e1', fontSize: '13px' }}>
              <p>For security compliance in IndianOil plant operations, passwords can be reset via your corporate Single Sign-On (SSO) or by contacting the HSSE Lead Administrator.</p>
              <div style={{ background: '#0b141c', padding: '12px', borderRadius: '6px', margin: '12px 0', border: '1px solid #1e293b' }}>
                <p style={{ margin: '0 0 6px', color: '#fff', fontWeight: 'bold' }}>⚡ Demo Credentials:</p>
                <p style={{ margin: '0 0 4px' }}>• Field Staff: <code>staff@oil.com</code> / Password: <code>staff123</code></p>
                <p style={{ margin: 0 }}>• HSSE Admin: <code>admin@oil.com</code> / Password: <code>admin123</code></p>
              </div>
              <div className="modal-footer">
                <button className="btn-primary" onClick={() => setShowForgotModal(false)}>Understood</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safety Notices Modal */}
      {showNoticesModal && (
        <div className="modal-backdrop">
          <div className="modal-content iocl-modal">
            <div className="modal-header">
              <h2>📋 Active Site Safety Bulletins & Notices</h2>
              <button className="close-btn" onClick={() => setShowNoticesModal(false)}>✕</button>
            </div>
            <div className="modal-body" style={{ color: '#cbd5e1', fontSize: '13px', display: 'grid', gap: '12px' }}>
              <div className="action-box success">
                <strong style={{ display: 'block', marginBottom: '4px' }}>📌 Notice #1: Mandatory Pre-Work Gas Detector Checks</strong>
                All hot work permits in Block B must be accompanied by dual gas level verification prior to torch ignition.
              </div>
              <div className="action-box">
                <strong style={{ display: 'block', marginBottom: '4px' }}>📌 Notice #2: Zero-Tolerance for LOTO Violations</strong>
                Energy isolation lockout/tagout must be verified with physical zero-energy testing before line break operations.
              </div>
              <div className="action-box">
                <strong style={{ display: 'block', marginBottom: '4px' }}>📌 Notice #3: Monsoon Slip & Fall Advisory</strong>
                Elevated scaffolding walkways are treated with non-slip coating. Safety harness latching is mandatory above 2 meters.
              </div>
              <div className="modal-footer">
                <button className="btn-primary" onClick={() => setShowNoticesModal(false)}>Acknowledge Notices</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
