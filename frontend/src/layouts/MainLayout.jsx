import React from 'react';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import AdminReviewModal from '../components/AdminReviewModal';

export default function MainLayout({
  currentUser,
  onLogout,
  activeTab,
  setActiveTab,
  selectedReportForReview,
  onCloseReviewModal,
  onReportUpdated,
  children
}) {
  return (
    <div className="app">
      <Header currentUser={currentUser} onLogout={onLogout} />
      
      <Navigation role={currentUser.role} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        {children}
      </main>

      {/* Admin Review Modal */}
      {selectedReportForReview && (
        <AdminReviewModal
          report={selectedReportForReview}
          currentUser={currentUser}
          onClose={onCloseReviewModal}
          onReportUpdated={onReportUpdated}
        />
      )}
      
      <Footer currentUser={currentUser} />
    </div>
  );
}
