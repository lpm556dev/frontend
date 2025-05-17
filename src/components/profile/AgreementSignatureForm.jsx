"use client";

import React, { useState, useEffect } from 'react';
import useAuthStore from '../../stores/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const AgreementForm = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const { user } = useAuthStore();
  // Get user ID from Zustand store
  const userId = user?.userId || null;

  // Load agreement data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedAgreement = JSON.parse(localStorage.getItem('agreementData') || '{}');
        if (storedAgreement && storedAgreement.agreed) {
          setAgreed(storedAgreement.agreed);
        }
      } catch (error) {
        console.error("Error loading agreement data:", error);
      }
    }
  }, []);

  // Handle agreement checkbox change
  const handleAgreementChange = (e) => {
    const isChecked = e.target.checked;
    setAgreed(isChecked);
    
    // Save to localStorage
    localStorage.setItem('agreementData', JSON.stringify({
      agreed: isChecked
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!agreed) return;
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const response = await fetch(`${API_URL}/users/re-registration?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agreed })
      });
      
      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'Persetujuan berhasil disimpan' });
        // You can redirect or do other actions here after successful submission
      } else {
        const errorData = await response.json();

        setSubmitStatus({ 
          type: 'error', 
          message: errorData.message || 'Terjadi kesalahan saat menyimpan persetujuan' 
        });
      }
    } catch (error) {
      console.error('Error submitting agreement:', error);
      setSubmitStatus({ 
        type: 'error', 
        message: 'Gagal menghubungi server. Silakan coba lagi nanti.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-6">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Persetujuan</h2>
          <p className="text-xs text-gray-500">Konfirmasi persetujuan Anda</p>
        </div>
        <div className="flex space-x-2">
          <button 
            type="button"
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-1 transition-transform duration-200 ${isFormVisible ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {isFormVisible ? 'Tutup' : 'Lihat'}
          </button>
        </div>
      </div>
      
      {/* Collapsible Form Content */}
      <div className={`transition-all duration-300 overflow-hidden ${isFormVisible ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-4">
          <div className="space-y-6">
            {/* Agreement Checkbox */}
            <div className="border rounded-lg p-4 bg-blue-50">
              <div className="flex items-start">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    id="agreement-checkbox"
                    name="agreement"
                    type="checkbox"
                    checked={agreed}
                    onChange={handleAgreementChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreement-checkbox" className="font-medium text-gray-700">
                    Saya bersedia mengikuti aturan Diklat SSG
                  </label>
                  <p className="text-gray-500 text-xs">
                    Dengan mencentang kotak ini, saya menyatakan bahwa saya telah membaca, memahami, dan setuju untuk mengikuti semua aturan dan ketentuan yang berlaku selama Diklat Santri Siap Guna.
                  </p>
                  <p className="text-red-500 text-xs mt-1">
                    *Wajib dicentang sebelum submit
                  </p>
                </div>
              </div>
            </div>
            
            {/* Submit button */}
            <div className="flex justify-center">
              <button
                type="button"
                disabled={!agreed || isSubmitting}
                onClick={handleSubmit}
                className={`px-6 py-2 rounded-lg text-white font-medium ${
                  agreed && !isSubmitting
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan & Lanjutkan'}
              </button>
            </div>
            
            {/* Status message */}
            {submitStatus && (
              <div className={`mt-3 text-sm text-center ${
                submitStatus.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {submitStatus.message}
              </div>
            )}
            
            {/* Help text */}
            {!agreed && (
              <p className="text-xs text-center text-gray-500">
                Anda harus mencentang persetujuan untuk melanjutkan
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgreementForm;