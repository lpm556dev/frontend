"use client";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../stores/authStore';
import Dashboard from '../../components/Dashboard';

export default function SSGDashboardPage() {
const MySwal = withReactContent(Swal);
  const router = useRouter();
  const { user, userId, logout, checkAuth, verify, role } = useAuthStore();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  
  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success'); // 'success' or 'error'
  
  // Navigation functions
  const navigateToMY = () => {
    router.push('/dashboard/my');
  };

  const navigateToKelolaKegiatan = () => {
    router.push('/dashboard/kegiatan');
  }

  const navigateToKelolaTugas = () => {
    router.push('/dashboard/kelolatugas');
  }

  const navigateToRundown = () => {
    router.push('/dashboard/rundown');
  };

  const navigateToECard = () => {
    router.push('/dashboard/ecard');
  };

  const navigateToPeserta = () => {
    router.push('/dashboard/peserta');
  };

  const navigateToScan = () => {
    router.push('/dashboard/scan');
  }
  
  const navigateToProfile = () => {
    router.push('/dashboard/profile');
  };
  
  const navigateToPresensi = () => {
    router.push('/dashboard/presensi');
  };

  const navigateToLihatPresensi = () => {
  router.push('/dashboard/lihatpresensi');
};

  const navigateToAlQuran = () => {
    router.push('/dashboard/Quran');
  };

  const navigateToHome = () => {
    router.push('/dashboard');
  };

  useEffect(() => {
    if (verify === 0) {
      router.replace('/verify-otp');
    }
  }, [verify, router]);
  
  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
    
    // Debug the current state when component mounts
    console.log("Dashboard page mounted, auth store state:", useAuthStore.getState());
  }, []);
  
  // Check authentication on component mount
  useEffect(() => {
    if (isClient) {
      // Check if authenticated using Zustand store
      const isAuthorized = checkAuth();
      console.log("Dashboard auth check result:", isAuthorized);
      
      if (!isAuthorized) {
        console.log("Not authenticated, redirecting to login from dashboard");
        router.push('/login');
        return;
      }
      
      // If authenticated, fetch user data
      fetchUserData();
    }
  }, [router, checkAuth, isClient]);

  // Effect to hide notification after some time
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000); // Hide after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  // Fetch user data
  const fetchUserData = () => {
    try {
      // If we already have basic user data in the Zustand store, use it
      const storeUser = useAuthStore.getState().user;
      const userVerify = useAuthStore.getState().verify;
      const userRole = useAuthStore.getState().role;
      console.log("userVerify:", verify);
      console.log("user role:", role);

      // Extract name from store data - first try to get nomor_hp for display
      const userPhone = storeUser?.nomor_hp || '08212651023';
      const userName = storeUser?.name || storeUser?.name || "ilham";
      
      // Mock data - in a real app, this would come from an API call
      // Merge any existing user data from Zustand store with additional dashboard data
      setUserData({
        ...storeUser,
        name: userName, 
        phone: userPhone,
        level: 'Pleton 20',
        taskCompleted: 40,
        taskTotal: 50,
        completionRate: 70,
        notifications: 3,
        quranProgress: {
          juz: 5,
          surah: 'Al-Baqarah',
          page: 21,
          lastRead: '15 Maret 2025',
        }
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading user data:", error);
      setNotificationType('error');
      setNotificationMessage('Gagal memuat data pengguna. Silakan coba lagi.');
      setShowNotification(true);
      
      // Redirect after showing error
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  };
  // Handle logout using Zustand store
const handleLogout = () => {
  MySwal.fire({
    title: 'Yakin ingin logout?',
    text: "Anda perlu login kembali untuk mengakses sistem",
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Ya, Logout!',
    cancelButtonText: 'Batal',
    backdrop: `
      rgba(0,0,123,0.4)
      url("/images/nyan-cat.gif")
      left top
      no-repeat
    `
  }).then((result) => {
    if (result.isConfirmed) {
      try {
        MySwal.fire({
          title: 'Logging out...',
          timer: 1500,
          timerProgressBar: true,
          didOpen: () => {
            MySwal.showLoading();
          }
        }).then(() => {
          // Call logout function from Zustand store
          logout();
          router.push('/login');
          
          // Optional: Show success toast after redirect
          MySwal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'Logout berhasil!',
            showConfirmButton: false,
            timer: 3000
          });
        });
      } catch (error) {
        console.error("Error during logout process:", error);
        MySwal.fire({
          icon: 'error',
          title: 'Gagal logout',
          text: 'Silakan coba lagi',
        });
      }
    }
  });
};

  // If we're server-side or still loading, show a loading spinner
  if (!isClient || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 mx-auto text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <Dashboard 
      userData={userData}
      loading={loading}
      navigateToKelolaKegiatan={navigateToKelolaKegiatan}
      navigateToKelolaTugas={navigateToKelolaTugas}
      navigateToScan ={navigateToScan}
      handleLogout={handleLogout}
      navigateToMY={navigateToMY}
      navigateToRundown={navigateToRundown}
      navigateToPeserta={navigateToPeserta}
      navigateToProfile={navigateToProfile}
      navigateToECard={navigateToECard}
      navigateToPresensi={navigateToPresensi}
      navigateToLihatPresensi={navigateToLihatPresensi}
      navigateToAlQuran={navigateToAlQuran}
      navigateToTugas={() => console.log('Navigate to Tugas')}
      navigateToHome={navigateToHome}
      showNotification={showNotification}
      notificationMessage={notificationMessage}
      notificationType={notificationType}
      setShowNotification={setShowNotification}
    />
  );
}