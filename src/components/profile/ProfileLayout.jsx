"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../stores/authStore';

const ProfileLayout = ({ children }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const { checkAuth } = useAuthStore();

  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      // Check if user is logged in using Zustand store
      const isAuthenticated = checkAuth();
      console.log("Profile layout auth check result:", isAuthenticated);
      
      if (!isAuthenticated) {
        // Redirect to login page if not authenticated
        console.log("Not authenticated, redirecting to login from profile");
        router.push('/login');
        return;
      }
      
      setLoading(false);
    }
  }, [router, checkAuth, isClient]);

  // Handle back button
  const handleBack = () => {
    router.push('/dashboard');
  };

  if (!isClient || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 mx-auto text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Memuat profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-900 text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Tombol kembali di sebelah kiri */}
            <button 
              onClick={handleBack}
              className="text-white"
              aria-label="Kembali ke dashboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            
            {/* Logo dan title di tengah */}
            <div className="flex items-center">
              <Image 
                src="/img/logossg_white.png" 
                alt="Logo Santri Siap Guna" 
                width={36} 
                height={36} 
                className="mr-2"
              />
              <h1 className="text-xl font-bold">SANTRI SIAP GUNA</h1>
            </div>
            
            {/* Elemen kosong untuk menjaga layout */}
            <div className="w-6"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-grow container mx-auto px-4 py-6 pb-20"
      >
        {children}
      </motion.main>
    </div>
  );
};

export default ProfileLayout;