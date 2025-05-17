// Dashboard.jsx - Main component with no dark overlay for mobile
import React, { useState, useEffect } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import DashboardContent from './DashboardContent';

const Dashboard = ({ 
  userData, 
  loading, 
  navigateToScan,
  navigateToKelolaKegiatan,
  navigateToKelolaTugas,
  handleLogout,
  navigateToMY,
  navigateToRundown,
  navigateToProfile,
  navigateToPresensi,
  navigateToLihatPresensi,
  navigateToAlQuran,
  navigateToTugas,
  navigateToHome,
  navigateToECard,
  navigateToPeserta,
  showNotification,
  notificationMessage,
  notificationType,
  setShowNotification
}) => {
  // Start with sidebar closed (for both mobile and desktop)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check device type and set initial state
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Desktop: Start with sidebar closed per requirement
      // Mobile: Always keep sidebar closed initially
      setSidebarOpen(false);
    };
    
    // Check on mount
    checkDevice();
    
    // Add resize listener
    window.addEventListener('resize', checkDevice);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-2xl">
          <svg className="animate-spin h-12 w-12 mx-auto text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg text-gray-600 font-medium">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden relative">
      {/* Removed dark overlay for both mobile and desktop */}

      {/* Sidebar with mobile/desktop awareness */}
      <DashboardSidebar 
        userData={userData}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        navigateToKelolaKegiatan={navigateToKelolaKegiatan}
        navigateToKelolaTugas={navigateToKelolaTugas}
        handleLogout={handleLogout}
        navigateToHome={navigateToHome}
        navigateToMY={navigateToMY}
        navigateToRundown={navigateToRundown}
        navigateToAlQuran={navigateToAlQuran}
        navigateToPresensi={navigateToPresensi}
        navigateToLihatPresensi={navigateToLihatPresensi}
        navigateToTugas={navigateToTugas}
        navigateToProfile={navigateToProfile}
        navigateToScan={navigateToScan}
        closeSidebar={closeSidebar}
        isMobile={isMobile}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out bg-white">
        <DashboardHeader 
          userData={userData}
          sidebarOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          showNotification={showNotification}
          notificationMessage={notificationMessage}
          notificationType={notificationType}
          setShowNotification={setShowNotification}
          isMobile={isMobile}
        />

        <DashboardContent 
          userData={userData}
          navigateToMY={navigateToMY}
          navigateToKelolaKegiatan={navigateToKelolaKegiatan}
          navigateToKelolaTugas={navigateToKelolaTugas}
          navigateToRundown={navigateToRundown}
          navigateToPresensi={navigateToPresensi}
          navigateToLihatPresensi={navigateToLihatPresensi}
          navigateToTugas={navigateToTugas}
          navigateToAlQuran={navigateToAlQuran}
          navigateToProfile={navigateToProfile}
          navigateToECard={navigateToECard}
          navigateToPeserta={navigateToPeserta}
          navigateToScan={navigateToScan}
        />
      </div>
    </div>
  );
};

export default Dashboard;