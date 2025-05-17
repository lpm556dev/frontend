"use client";

import React, { useState, useEffect, useId } from 'react';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const PersonalInfoForm = () => {
  const { user } = useAuthStore(); 
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    pendidikanTerakhir: '',
    pekerjaan: '',
    organisasi: '',
    motivasi: ''
  });

  // Fetch user data from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userId = user?.userId;
      if (userId) {
        fetchEducationData(userId);
      }
    }
  }, []);
  

  // Check if user has any personal data
  const hasAnyData = () => {
    return !!(
      userData?.pendidikanTerakhir || 
      userData?.pekerjaan || 
      userData?.motivasi
    );
  };

  // Handle edit mode
  const handleEdit = () => {
    setIsEditing(true);
    setIsCreating(false); // << Ini menandakan mode update
  };  

  // Handle add new data
  const handleAddNew = () => {
    setFormData({
      pendidikanTerakhir: '',
      pekerjaan: '',
      organisasi: '',
      motivasi: ''
    });
  
    setIsFormVisible(true);
    setIsEditing(true);
    setIsCreating(true); // << Tambahkan ini
  };  
  // Handle save directly
  const saveData = async () => {
    try {
      const userId = user?.userId;
      const url = isCreating
        ? `${API_URL}/users/create-education`
        : `${API_URL}/users/edit-education`;
  
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          pendidikan_terakhir: formData.pendidikanTerakhir,
          pekerjaan: formData.pekerjaan,
          organisasi: formData.organisasi,
          motivasi: formData.motivasi
        })
      });
  
      if (!response.ok) throw new Error('Gagal menyimpan data');
  
      toast.success('Data berhasil disimpan!');
      setUserData(formData);
      setIsEditing(false);
      setIsCreating(false); // Reset kembali
  
    } catch (err) {
      toast.error('Gagal menyimpan data ke server.');
    }
  };
    

  const fetchEducationData = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/users/get-education?id=${userId}`);
      if (!res.ok) throw new Error('Gagal ambil data');
      const data = await res.json();
  
      const fetchedData = {
        pendidikanTerakhir: data.pendidikan_terakhir || '',
        pekerjaan: data.pekerjaan || '',
        organisasi: data.organisasi || '',
        motivasi: data.motivasi || ''
      };
  
      setUserData(fetchedData);
      setFormData(fetchedData);
  
      // Jangan langsung aktifkan form dan edit mode di sini
      // Cukup simpan datanya saja
  
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };
  
  
  // Handle input changes with auto-save
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    const newFormData = {
      ...formData,
      [name]: value
    };
    
    setFormData(newFormData);
    
    // Auto-save after 500ms of no typing
    const saveTimeout = setTimeout(() => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}');
      const updatedUser = {
        ...currentUser,
        [name]: value
      };
      
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      // Update userData as well
      setUserData(prev => ({
        ...prev,
        [name]: value
      }));
    }, 500);
    
    // Clear timeout on next input change
    return () => clearTimeout(saveTimeout);
  };

  return (
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
          
          {isFormVisible && !isEditing && (
            <>
              <button 
                type="button"
                onClick={handleEdit}
                className={`${!hasAnyData() ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white px-3 py-1 rounded-md text-sm flex items-center`}
                disabled={!hasAnyData()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit
              </button>
              
              <button 
                type="button"
                onClick={handleAddNew}
                className={`${hasAnyData() ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'} text-white px-3 py-1 rounded-md text-sm flex items-center`}
                disabled={hasAnyData()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tambah
              </button>
            </>
          )}
          
          {isEditing && (
            <button 
              type="button"
              onClick={saveData}
              className="bg-green-500 text-white px-3 py-1 rounded-md text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Selesai
            </button>
          )}
        </div>
      </div>
      
      {/* Collapsible Form Content */}
      <div className={`transition-all duration-300 overflow-hidden ${isFormVisible || isEditing ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        {isEditing ? (
          // Editable Form
          <div className="p-4">
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
          </div>
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
  );
};

export default PersonalInfoForm;