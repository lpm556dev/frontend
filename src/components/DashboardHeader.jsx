// DashboardHeader.jsx - Updated for mobile with no dark background
import React from 'react';
import Image from 'next/image';

const DashboardHeader = ({ 
  userData, 
  sidebarOpen,
  toggleSidebar,
  showNotification, 
  notificationMessage, 
  notificationType, 
  setShowNotification,
  isMobile
}) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      {/* User Greeting Card */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-4 relative">
        {/* Mobile Menu Button - Only shown on mobile when sidebar is closed */}
        {isMobile && !sidebarOpen && (
          <button 
            onClick={toggleSidebar}
            className="text-white hover:bg-orange-600/30 rounded-full p-2 absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300 z-10"
            aria-label="Open menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <div className="container mx-auto flex justify-between items-center">
          {/* User Profile & Greeting */}
          <div className="flex items-center">
            {/* Add left padding on mobile to make room for hamburger menu */}
            <div className={`flex-shrink-0 mr-4 ${isMobile && !sidebarOpen ? 'ml-8' : ''}`}>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-orange-500 font-bold text-xl shadow-md">
                {userData.name ? userData.name.charAt(0).toUpperCase() : 'M'}
              </div>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Ahlan wa Sahlan,</h2>
              <p className="text-sm font-semibold text-white">{userData.name}</p>
              <p className="text-xs text-white opacity-80">{userData.level}</p>
            </div>
          </div>

          {/* Notification Icon */}
          <button className="relative text-white hover:bg-orange-600/30 rounded-full p-2 transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {userData.notifications > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center text-white">
                {userData.notifications}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Custom notification - Centered at top with better mobile styling */}
      {showNotification && (
        <div 
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-lg shadow-lg z-50 flex items-center transition-all duration-300 max-w-md w-11/12 sm:w-full ${
            notificationType === 'success' 
              ? 'bg-green-50 text-green-800 border-l-4 border-green-500' 
              : 'bg-red-50 text-red-800 border-l-4 border-red-500'
          }`}
        >
          {notificationType === 'success' ? (
            <svg className="h-6 w-6 mr-3 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-6 w-6 mr-3 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span className="flex-grow text-sm sm:text-base">{notificationMessage}</span>
          <button 
            className="ml-2 text-gray-500 hover:text-gray-700 flex-shrink-0"
            onClick={() => setShowNotification(false)}
            aria-label="Close notification"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </header>
  );
};

export default DashboardHeader;