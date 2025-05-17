"use client";

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import ProfileHeader from '../../../components/profile/ProfileHeader';
import ProfileLayout from '../../../components/profile/ProfileLayout';
import PersonalInfoForm from '../../../components/profile/PersonalInfoForm';
import HealthInfoForm from '../../../components/profile/HealthInfoForm';
import RequiredDocumentsForm from '../../../components/profile/RequiredDocumentsForm';
import AgreementSignatureForm from '../../../components/profile/AgreementSignatureForm';
import useAuthStore from '../../../stores/authStore';
import { useRouter } from 'next/navigation';

// Use dynamic import with no SSR to prevent hydration issues
const ProfilePage = () => {
  const router = useRouter();
  const { user, checkAuth, role } = useAuthStore();
  const [userData, setUserData] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Handle client-side rendering and authentication
  useEffect(() => {
    setIsClient(true);
    
    // Debug auth state
    console.log("Profile page mounted, auth store state:", useAuthStore.getState());
  }, []);
  
  // Check authentication status
  useEffect(() => {
    if (isClient) {
      const isAuthenticated = checkAuth();
      
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login");
        router.push('/login');
        return;
      }
      
      // Get user data from Zustand store
      const authUser = useAuthStore.getState().user;
      setUserData(authUser);
    }
  }, [router, checkAuth, isClient]);

  if (!isClient || !userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <ProfileLayout>
      {/* Pass user data to components */}
      <ProfileHeader userData={userData} />
      <PersonalInfoForm initialData={userData} />
      <HealthInfoForm initialData={userData} />
      <RequiredDocumentsForm initialData={userData} />
  
        <AgreementSignatureForm initialData={userData} />
      
    </ProfileLayout>
  );
};

export default ProfilePage;
