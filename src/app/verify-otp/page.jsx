'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function VerifyOtpPage() {
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user, login } = useAuthStore();
  const inputRefs = useRef([]);

  // Focus on first input when component mounts
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleOtpChange = (index, value) => {
    // Only accept numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Auto focus next input field if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // On backspace, clear current field and focus previous field (if not empty)
    if (e.key === 'Backspace') {
      if (otpValues[index] === '' && index > 0) {
        const newOtpValues = [...otpValues];
        newOtpValues[index - 1] = '';
        setOtpValues(newOtpValues);
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Only process if the pasted content looks like a 6-digit OTP
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpValues(digits);
      
      // Focus the last input
      inputRefs.current[5].focus();
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await fetch('http://localhost:3333/api/users/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.userId,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengirim ulang OTP');
      }

      toast.success('Kode OTP baru telah dikirim ke nomor HP Anda');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Gagal mengirim ulang OTP');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if OTP is complete
    if (otpValues.some(val => val === '')) {
      setError('Kode OTP harus lengkap 6 digit');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    try {
      const otpCode = otpValues.join('');
      
      const response = await fetch(`${API_URL}/users/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.userId,
          otp: otpCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verifikasi gagal');
      }

      // Update auth store: set user_verify jadi 1
      login(
        {
          ...user,
          user_verify: { isverified: 1 }
        },
        useAuthStore.getState().authToken,
        user.userId
      );

      setSuccessMessage('Verifikasi berhasil. Mengarahkan ke dashboard...');
      
      // Tampilkan toast sukses
      toast.success('Verifikasi berhasil!');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Gagal verifikasi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Form Side */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-4 md:p-6 overflow-y-auto">
        <div className="w-full max-w-md">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 text-center">
            Verifikasi OTP
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Masukkan kode OTP yang dikirimkan ke nomor HP Anda
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 uppercase mb-3 text-center">
                KODE OTP
              </label>
              <div className="flex space-x-2 justify-between">
                {otpValues.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={index === 0 ? handlePaste : null}
                    className="w-10 h-12 text-center border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-800 focus:border-blue-800 text-lg"
                  />
                ))}
              </div>
              {error && (
                <p className="mt-2 text-center text-red-500 text-sm">{error}</p>
              )}
              {successMessage && (
                <p className="mt-2 text-center text-green-500 text-sm">{successMessage}</p>
              )}
              <p className="mt-3 text-sm text-gray-500 text-center">
                Tidak menerima kode?{" "}
                <button 
                  type="button"
                  className="text-blue-800 font-medium"
                  onClick={handleResendOtp}
                >
                  Kirim ulang
                </button>
              </p>
            </div>
            
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-800 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Memverifikasi...' : 'Verifikasi'}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <button 
              onClick={() => router.push('/login')}
              className="text-sm font-medium text-blue-800 hover:text-blue-900"
            >
              Kembali ke halaman masuk
            </button>
          </div>
        </div>
      </div>
      
      {/* Banner Side */}
      <div className="hidden md:flex md:w-1/2 bg-blue-900 justify-center items-center p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Santri Siap Guna</h2>
          <p className="text-white text-sm mb-6">Masukkan kode OTP untuk melanjutkan ke dashboard</p>
          <Image 
            src="/img/logossg_white.png" 
            alt="Logo Santri Siap Guna" 
            width={150} 
            height={150} 
            className="mx-auto mb-4"
          />
        </div>
      </div>
    </div>
  );
}