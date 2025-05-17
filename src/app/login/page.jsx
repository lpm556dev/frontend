"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
export default function SignInPage() {
  const router = useRouter();
  const { login, checkAuth } = useAuthStore();
  
  // Login form state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Notification state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  
  useEffect(() => {
    setIsClient(true);
    console.log("Login page mounted, auth store state:", useAuthStore.getState());
  }, []);
  
  useEffect(() => {
    if (isClient && checkAuth()) {
      console.log("Already authenticated, redirecting to dashboard");
      router.push('/dashboard');
    }
  }, [checkAuth, router, isClient]);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  async function handleGoogleLogin() {
    try {
      setIsLoading(true);
      setLoginError('');
  
      // Buka jendela popup untuk login Google
      const popup = window.open(
        `${API_URL}/users/google`,
        'Google Login',
        'width=600,height=600'
      );
  
      // Tambahkan event listener untuk menerima pesan dari popup
      const receiveMessage = (event) => {
        if (event.origin !== `https://api.siapguna.org`) return;
        
        if (event.data.token) {
          // Login berhasil, tutup popup dan proses data
          popup.close();
          window.removeEventListener('message', receiveMessage);
  
          const { token, userId, user, user_verify, userRole } = event.data;
  
          // Normalisasi data user
          const normalizedUser = {
            userId,
            nomor_hp: user.nomor_hp || '',
            email: user.email,
            name: user.nama_lengkap || `User ${user.email.split('@')[0]}`,
            fullData: user,
            user_verify,
            userRole
          };
  
          // Update auth store
          login(normalizedUser, token, userId);
  
          // Redirect berdasarkan status verifikasi
          if (user_verify?.isverified === 0) {
            router.push('/verify-otp');
          } else {
            router.push('/dashboard');
          }
        } else if (event.data.error) {
          // Handle error
          popup.close();
          window.removeEventListener('message', receiveMessage);
          setLoginError(event.data.error);
          toast.error(event.data.error);
        }
      };
  
      window.addEventListener('message', receiveMessage);
    } catch (error) {
      console.error('Google login error:', error);
      setLoginError('Terjadi kesalahan saat login dengan Google');
      toast.error('Terjadi kesalahan saat login dengan Google');
    } finally {
      setIsLoading(false);
    }
  }
  
  function handleFacebookLogin() {
    // Facebook login not implemented yet
    setNotificationMessage("Facebook login belum tersedia");
    setNotificationType("error");
    setShowNotification(true);
  }
  

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');
    
    try {
      // Validate inputs
      if (!phoneNumber || !password) {
        throw new Error('Nomor HP dan password harus diisi');
      }
  
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          nomor_hp: phoneNumber.trim(),
          password: password.trim()
        })
      });
  
      const responseData = await response.json();
      // console.log("error login", responseData)
      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 400) {
          throw new Error(`${responseData.message}`);
        } else if (response.status === 400) {
          throw new Error(responseData.message || 'Data tidak valid');
        } else {
          throw new Error(responseData.message || 'Terjadi kesalahan saat login');
        }
      }
  
      // Extract and normalize user data
      const { token, userId, data: userData, user_verify, userRole } = responseData;

      if (!token || !userId || !userData) {
        throw new Error('Data respons tidak valid');
      }

      // Prepare user object for storage
      const normalizedUser = {
        userId,
        nomor_hp: userData.nomor_hp,
        email: userData.email,
        name: userData.nama_lengkap || `User ${phoneNumber.slice(-4)}`,
        fullData: userData,
        user_verify, // tambahkan ini
        userRole     // tambahkan ini
      };

      // Update auth store
      login(normalizedUser, token, userId);
      // Show success notification
      setNotificationType('success');
      setNotificationMessage(`${responseData.message}`);
      setShowNotification(true);
  
      // Redirect after delay
      setTimeout(() => {
        if (user_verify?.isverified === 0) {
          router.push('/verify-otp');
        } else {
          router.push('/dashboard');
        }
      }, 1500);
    } catch (error) {
      
      console.error("Login error:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Terjadi kesalahan tidak terduga saat login';
      
      setLoginError(errorMessage);
      setNotificationType('error');
      setNotificationMessage(errorMessage);
      setShowNotification(true);
  
    } finally {
      setIsLoading(false);
    }
  }

  // Navigation handler for signup button
  function navigateToSignup() {
    router.push('/login/signup');
  }

  // Effect to hide notification after some time
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000); // Hide after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  return (
    <div className="flex h-screen font-sans">
      {/* Custom notification - Centered at top */}
      {showNotification && (
        <div 
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-md shadow-lg z-50 flex items-center transition-all duration-300 ${
            notificationType === 'success' ? 'bg-green-100 text-green-800 border-l-4 border-green-500' : 'bg-red-100 text-red-800 border-l-4 border-red-500'
          }`}
        >
          {notificationType === 'success' ? (
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span>{notificationMessage}</span>
          <button 
            className="ml-2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowNotification(false)}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Form Side */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full md:w-1/2 flex flex-col justify-center items-center p-4 md:p-6 overflow-y-auto"
      >
        <div className="w-full max-w-md">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 text-center">
            Santri Siap Guna
          </h1>
          
          {/* Social login options */}
          <div className="flex space-x-4 mb-8">
            <button 
              type="button"
              onClick={handleGoogleLogin}
              className="flex items-center justify-center w-1/2 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" 
                fill="#4285F4"/>
              </svg>
              Google
            </button>
            
            <button 
              type="button"
              onClick={handleFacebookLogin}
              className="flex items-center justify-center w-1/2 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" 
                fill="#1877F2"/>
              </svg>
              Facebook
            </button>
          </div>
          
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                atau masuk dengan nomor HP
              </span>
            </div>
          </div>
          
          {/* Login Form */}
          <form onSubmit={handleLoginSubmit}>
            {loginError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm border border-red-200 rounded">
                {loginError}
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="phoneNumber" className="block text-xs font-medium text-gray-500 uppercase mb-1">
                Nomor HP
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-800 focus:border-blue-800"
                placeholder="Nomor HP"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="block text-xs font-medium text-gray-500 uppercase mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-800 focus:border-blue-800"
                  placeholder="Kata Sandi"
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            
            {/* Cloudflare Turnstile */}
            <div className="mb-4">
              <div className="cf-turnstile" data-sitekey="0x4AAAAAABBBnsl2yEqRVvMU"></div>
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-800 focus:ring-blue-800 border-gray-300 rounded"
                />
                <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-700">
                  Ingat Saya
                </label>
              </div>
              
              <div className="text-sm">
                <Link href="/login/forgot-password" className="font-medium text-gray-500 hover:text-gray-700">
                  Lupa Kata Sandi?
                </Link>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-800 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </>
                ) : 'Bismillah Masuk'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
      
      {/* Banner Side */}
      <div className="hidden md:flex md:w-1/2 bg-blue-900 justify-center items-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-2">Ahlan Wa Sahlan</h2>
          <p className="text-white text-sm mb-6">Belum punya akun?</p>
          <button
            type="button"
            onClick={navigateToSignup}
            className="inline-block py-2 px-6 border border-white rounded-full text-sm font-medium text-white hover:bg-white hover:text-blue-800 transition-colors"
          >
            Daftar Gratis
          </button>
        </motion.div>
      </div>
      
      {/* Mobile-only footer for switching modes */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-100 p-4 text-center border-t border-gray-200">
        <div className="text-sm text-gray-600">
          Belum punya akun?{" "}
          <button 
            type="button"
            onClick={navigateToSignup}
            className="text-blue-800 font-medium"
          >
            Daftar Gratis
          </button>
        </div>
      </div>
    </div>
  );
}
