"use client";

import React, { useState, useEffect } from 'react';
import useAuthStore from '../../stores/authStore';

const ProfileHeader = () => {
  const [userData, setUserData] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const { role } = useAuthStore();
  
  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (isClient) {
      try {
        // Get user data from Zustand store
        const userFromStore = useAuthStore.getState().user;
        // console.log("User data from store:", userFromStore);
        
        // Extract user data, prioritizing store values
        const phoneNumber = userFromStore?.nomor_hp || '081234567890';
        const userName = userFromStore?.nama || userFromStore?.name || phoneNumber || 'User';
        
        setUserData({
          name: userName,
          level: userFromStore?.level || 'Pleton 20',
          email: userFromStore?.email || `${phoneNumber.replace(/[^0-9]/g, '')}@example.com`,
          phone: phoneNumber,
        });
      } catch (error) {
        console.error("Error getting user data:", error);
        setUserData({
          name: 'Pengguna',
          level: 'Pleton 20',
          email: 'user@example.com',
          phone: '081234567890',
        });
      }
    }
  }, [isClient]);

  if (!isClient || !userData) {
    return (
      <div className="bg-white rounded-lg shadow-md mb-6 p-6 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
        <p className="ml-2">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md mb-6 p-6">
      <div className="flex flex-col items-center">
        {/* User avatar */}
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-2xl mb-3">
          {userData?.name?.charAt(0) || 'U'}
        </div>
        
        {/* Conditional rendering for role */}
        {role === '1a' && (
          <div className="bg-blue-100 rounded-full px-4 py-1 text-blue-700 text-sm font-medium mb-3">
            Peserta santri siap guna (SSG)
          </div>
        )}
        
        <h2 className="text-xl font-medium">{userData?.name}</h2>
        <p className="text-sm text-gray-600 mb-1">{userData?.level}</p>
        <p className="text-sm text-gray-600 mb-1">{userData?.email}</p>
        <p className="text-sm text-gray-600">{userData?.phone}</p>
      </div>
    </div>
  );
};

export default ProfileHeader;