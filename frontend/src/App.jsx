import React, { useState, useEffect } from 'react';
import './App.css';

// Layout & Pages
import MainLayout from './layouts/MainLayout';
import AuthScreen from './pages/AuthScreen';
import StaffSubmitReport from './pages/StaffSubmitReport';
import StaffReportsView from './pages/StaffReportsView';
import LifeSavingRulesView from './pages/LifeSavingRulesView';
import AdminDashboard from './pages/AdminDashboard';
import AdminTriageQueue from './pages/AdminTriageQueue';
import AnalysisView from './pages/AnalysisView';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('sih_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('new-report');
  const [selectedReportForReview, setSelectedReportForReview] = useState(null);

  // Sync default tab when user logs in
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sih_user', JSON.stringify(currentUser));
      if (currentUser.role === 'admin') {
        setActiveTab('dashboard');
      } else { 
        setActiveTab('new-report');
      }
    } else {
      localStorage.removeItem('sih_user');
    }
  }, [currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sih_user');
  };

  // 1. Unauthenticated Gateway: Show Login / Register Screen
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={setCurrentUser} />;
  }

  // 2. Authenticated Portals: Field Staff vs HSSE Admin
  return (
    <MainLayout
      currentUser={currentUser}
      onLogout={handleLogout}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      selectedReportForReview={selectedReportForReview}
      onCloseReviewModal={() => setSelectedReportForReview(null)}
      onReportUpdated={() => {
        setSelectedReportForReview(null);
        window.dispatchEvent(new Event('reports-updated'));
      }}
    >
      {/* STAFF PORTAL VIEWS */}
      {currentUser.role === 'staff' && (
        <>
          {activeTab === 'new-report' && <StaffSubmitReport currentUser={currentUser} />}
          {activeTab === 'my-reports' && <StaffReportsView currentUser={currentUser} />}
          {activeTab === 'lsr-rules' && <LifeSavingRulesView currentUser={currentUser} />}
        </>
      )}

      {/* ADMIN PORTAL VIEWS */}
      {currentUser.role === 'admin' && (
        <>
          {activeTab === 'dashboard' && <AdminDashboard />}
          {activeTab === 'triage-queue' && <AdminTriageQueue onReviewReport={setSelectedReportForReview} />}
          {activeTab === 'precursor-map' && <AnalysisView />}
          {activeTab === 'lsr-rules' && <LifeSavingRulesView currentUser={currentUser} />}
        </>
      )}
    </MainLayout>
  );
}
