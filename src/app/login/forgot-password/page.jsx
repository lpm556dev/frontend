"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

function ForgotPasswordPage() {
  const router = useRouter();
  
  // State management
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [step, setStep] = useState(1); // Step 1: Enter phone number, Step 2: Enter OTP, Step 3: New password
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Load Cloudflare Turnstile script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  
  // Handle phone number submission
  function handlePhoneSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call to send OTP
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setStep(2); // Move to OTP verification
    }, 1500);
  }
  
  // Handle OTP input
  function handleOtpChange(index, value) {
    // Only accept numbers
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  }
  
  // Handle OTP verification
  function handleOtpSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call to verify OTP
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setStep(3); // Move to password reset
    }, 1500);
  }
  
  // Handle password reset
  function handlePasswordReset(e) {
    e.preventDefault();
    
    // Validate passwords
    if (newPassword.length < 8) {
      setPasswordError('Kata sandi harus minimal 8 karakter');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Kata sandi tidak sama');
      return;
    }
    
    setIsSubmitting(true);
    setPasswordError('');
    
    // Simulate API call to reset password
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      
      // Redirect to login page after success
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }, 1500);
  }
  
  return (
    <div className="flex h-screen">
      {/* Form Side */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full md:w-1/2 flex flex-col justify-center items-center p-4 md:p-6 overflow-y-auto"
      >
        <div className="w-full max-w-md">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 text-center">
            Lupa Kata Sandi
          </h1>
          <p className="text-center text-gray-500 mb-8">
            {step === 1 && "Masukkan nomor HP yang terdaftar untuk reset kata sandi"}
            {step === 2 && "Masukkan kode OTP yang dikirimkan ke nomor HP Anda"}
            {step === 3 && "Buat kata sandi baru untuk akun Anda"}
          </p>
          
          {/* Step 1: Phone Number Form */}
          {step === 1 && (
            <form onSubmit={handlePhoneSubmit}>
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
                  placeholder="Masukkan nomor HP Anda"
                />
              </div>
              
              {/* Cloudflare Turnstile */}
              <div className="mb-6">
                <div className="cf-turnstile" data-sitekey="0x4AAAAAABBBnsl2yEqRVvMU"></div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim OTP'}
                </button>
              </div>
            </form>
          )}
          
          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleOtpSubmit}>
              <div className="mb-6">
                <label className="block text-xs font-medium text-gray-500 uppercase mb-3">
                  Kode OTP
                </label>
                <div className="flex space-x-2 justify-between">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      className="w-10 h-12 text-center border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-800 focus:border-blue-800 text-lg"
                    />
                  ))}
                </div>
                <p className="mt-3 text-sm text-gray-500 text-center">
                  Tidak menerima kode?{" "}
                  <button 
                    type="button"
                    className="text-blue-800 font-medium"
                    onClick={() => {
                      // Resend OTP logic here
                      alert('Kode OTP baru telah dikirim!');
                    }}
                  >
                    Kirim ulang
                  </button>
                </p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-800"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || otp.some(digit => digit === '')}
                  className="w-2/3 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Memverifikasi...' : 'Verifikasi'}
                </button>
              </div>
            </form>
          )}
          
          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handlePasswordReset}>
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-xs font-medium text-gray-500 uppercase mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-800 focus:border-blue-800"
                  placeholder="Minimal 8 karakter"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-500 uppercase mb-1">
                  Konfirmasi Kata Sandi
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-800 focus:border-blue-800"
                  placeholder="Masukkan kembali kata sandi"
                />
                {passwordError && (
                  <p className="mt-2 text-sm text-red-600">
                    {passwordError}
                  </p>
                )}
              </div>
              
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-800"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Memproses...' : 'Reset Kata Sandi'}
                </button>
              </div>
              
              {submitStatus === 'success' && (
                <div className="mt-4 p-3 bg-green-50 text-green-800 rounded-md text-sm">
                  Kata sandi berhasil diperbarui! Mengarahkan ke halaman login...
                </div>
              )}
            </form>
          )}
          
          <div className="mt-8 text-center">
            <Link href="/login" className="text-sm font-medium text-blue-800 hover:text-blue-900">
              Kembali ke halaman login
            </Link>
          </div>
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
          <h2 className="text-3xl font-bold text-white mb-2">Reset Kata Sandi</h2>
          <p className="text-white text-sm mb-6">Ikuti langkah-langkah untuk memperbarui kata sandi Anda</p>
          <Link
            href="/login"
            className="inline-block py-2 px-6 border border-white rounded-full text-sm font-medium text-white hover:bg-white hover:text-blue-800 transition-colors"
          >
            Masuk
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;