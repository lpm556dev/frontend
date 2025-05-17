"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const ProfileForm = () => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formEnabled, setFormEnabled] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [formData, setFormData] = useState({
    pendidikanTerakhir: '',
    pekerjaan: '',
    organisasi: '',
    motivasi: ''
  });

  // Fetch user data from localStorage on component mount
  useEffect(() => {
    // Function to run on the client side only
    const fetchUserData = () => {
      try {
        // Check if user is logged in
        const isLoggedIn = localStorage.getItem('isLoggedIn') || sessionStorage.getItem('isLoggedIn');
        
        if (!isLoggedIn) {
          // Redirect to login page if not logged in
          router.push('/login');
          return;
        }
        
        // Get user data from localStorage or sessionStorage
        const storedUserData = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}');
        
        // Set userData with existing profile data
        const userProfile = {
          name: storedUserData.name || 'Muhammad Brilian Haikal',
          level: storedUserData.level || 'Pleton 20',
          email: storedUserData.email || 'brilian@example.com',
          phone: storedUserData.phone || '081234567890',
          pendidikanTerakhir: storedUserData.pendidikanTerakhir || '',
          pekerjaan: storedUserData.pekerjaan || '',
          organisasi: storedUserData.organisasi || '',
          motivasi: storedUserData.motivasi || ''
        };
        
        setUserData(userProfile);

        // Pre-fill the form if data exists
        setFormData({
          pendidikanTerakhir: storedUserData.pendidikanTerakhir || '',
          pekerjaan: storedUserData.pekerjaan || '',
          organisasi: storedUserData.organisasi || '',
          motivasi: storedUserData.motivasi || ''
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
        // Set default data if there's an error
        setUserData({
          name: 'Pengguna',
          level: 'Pleton 20',
          email: 'user@example.com',
          phone: '081234567890',
          pendidikanTerakhir: '',
          pekerjaan: '',
          organisasi: '',
          motivasi: ''
        });
      }
      
      setLoading(false);
    };

    // Execute only on client-side
    if (typeof window !== 'undefined') {
      fetchUserData();
    }
  }, [router]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}');
      const updatedUser = {
        ...currentUser,
        pendidikanTerakhir: formData.pendidikanTerakhir,
        pekerjaan: formData.pekerjaan,
        organisasi: formData.organisasi,
        motivasi: formData.motivasi
      };
      
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Update the user data state with new values
      setUserData({
        ...userData,
        pendidikanTerakhir: formData.pendidikanTerakhir,
        pekerjaan: formData.pekerjaan,
        organisasi: formData.organisasi,
        motivasi: formData.motivasi
      });
      
      // Reset editing state
      setIsEditing(false);
      setFormEnabled(false);
      
      alert('Profil berhasil diperbarui!');
    } catch (error) {
      console.error("Error saving profile data:", error);
      alert('Gagal menyimpan profil. Silakan coba lagi.');
    }
  };

  // Check if user already has profile data
  const hasExistingData = () => {
    // Return true if at least one required field is filled
    return !!(
      userData?.pendidikanTerakhir || 
      userData?.pekerjaan || 
      userData?.motivasi
    );
  };

  // Handle add new data
  const handleAddNew = () => {
    // Clear form data for new entry
    setFormData({
      pendidikanTerakhir: '',
      pekerjaan: '',
      organisasi: '',
      motivasi: ''
    });
    setIsEditing(true);
    setFormEnabled(true);
  };

  // Handle edit mode
  const handleEdit = () => {
    // Set the form data to the current user data
    setFormData({
      pendidikanTerakhir: userData?.pendidikanTerakhir || '',
      pekerjaan: userData?.pekerjaan || '',
      organisasi: userData?.organisasi || '',
      motivasi: userData?.motivasi || ''
    });
    setIsEditing(true);
    setFormEnabled(true);
  };

  // Handle cancel editing/adding
  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      pendidikanTerakhir: userData?.pendidikanTerakhir || '',
      pekerjaan: userData?.pekerjaan || '',
      organisasi: userData?.organisasi || '',
      motivasi: userData?.motivasi || ''
    });
    setIsEditing(false);
    setFormEnabled(false);
  };

  // Handle back button
  const handleBack = () => {
    router.push('/dashboard');
  };

  if (loading) {
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
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBack}
                className="text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            </div>
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
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-6">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-2xl mb-3">
              {userData?.name?.charAt(0) || 'U'}
            </div>
            <h2 className="text-xl font-medium">{userData?.name}</h2>
            <p className="text-sm text-gray-600 mb-1">{userData?.level}</p>
            <p className="text-sm text-gray-600 mb-1">{userData?.email}</p>
            <p className="text-sm text-gray-600">{userData?.phone}</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="p-4 border-b flex justify-between items-center">
            <div>
              <h2 className="text-lg font-medium">Data Diri</h2>
              <p className="text-xs text-gray-500">Lengkapi data diri Anda</p>
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
                {isFormVisible ? 'Tutup' : 'Lihat Data'}
              </button>
              {isFormVisible && (
                <>
                  <button 
                    type="button"
                    onClick={handleEdit}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm flex items-center"
                    disabled={formEnabled}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleAddNew()}
                    className={`${hasExistingData() ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white px-3 py-1 rounded-md text-sm flex items-center`}
                    disabled={formEnabled || hasExistingData()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Tambah
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Collapsible Form Content */}
          <div className={`transition-all duration-300 overflow-hidden ${isFormVisible ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
            {formEnabled ? (
              // Editable Form
              <form onSubmit={handleSubmit} className="p-4">
                {/* Pendidikan Terakhir */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pendidikan Terakhir
                  </label>
                  <select
                    name="pendidikanTerakhir"
                    value={formData.pendidikanTerakhir}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">-- Pilih Pendidikan --</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA">SMA</option>
                    <option value="SMK">SMK</option>
                    <option value="D3">D3</option>
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Untuk klasifikasi peserta</p>
                </div>
                
                {/* Pekerjaan */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pekerjaan
                  </label>
                  <input
                    type="text"
                    name="pekerjaan"
                    value={formData.pekerjaan}
                    onChange={handleChange}
                    placeholder="Masukkan pekerjaan Anda"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Jika bekerja atau wirausaha</p>
                </div>
                
                {/* Organisasi yang Diikuti */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organisasi yang Diikuti
                  </label>
                  <input
                    type="text"
                    name="organisasi"
                    value={formData.organisasi}
                    onChange={handleChange}
                    placeholder="Masukkan organisasi yang Anda ikuti"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Jika aktif dalam komunitas/LSM/masjid</p>
                </div>
                
                {/* Motivasi Mengikuti Diklat */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Motivasi Mengikuti Diklat
                  </label>
                  <textarea
                    name="motivasi"
                    value={formData.motivasi}
                    onChange={handleChange}
                    placeholder="Jelaskan motivasi Anda mengikuti diklat"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    required
                  ></textarea>
                  <p className="text-xs text-gray-500 mt-1">Untuk memahami niat peserta</p>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-6 flex justify-center space-x-4">
                  <button
                    type="submit"
                    className="bg-blue-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors"
                  >
                    Simpan Profil
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              // Data Display (Read-only)
              <div className="p-4">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-2 font-medium text-sm text-gray-700 w-1/3">Pendidikan Terakhir</td>
                      <td className="py-3 px-2 text-sm">{userData?.pendidikanTerakhir || '-'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2 font-medium text-sm text-gray-700">Pekerjaan</td>
                      <td className="py-3 px-2 text-sm">{userData?.pekerjaan || '-'}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-2 font-medium text-sm text-gray-700">Organisasi yang Diikuti</td>
                      <td className="py-3 px-2 text-sm">{userData?.organisasi || '-'}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2 font-medium text-sm text-gray-700 align-top">Motivasi Mengikuti Diklat</td>
                      <td className="py-3 px-2 text-sm">{userData?.motivasi || '-'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default ProfileForm;