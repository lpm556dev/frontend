"use client";

import React, { useState, useEffect } from 'react';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';


const API_URL = process.env.NEXT_PUBLIC_API_URL;
const HealthInfoForm = () => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const { user } = useAuthStore();
  const [healthData, setHealthData] = useState({
    riwayat_penyakit: '',
    memiliki_disabilitas: '',
    kontak_darurat_nama: '',
    kontak_darurat_nomor: '',
    hubungan_darurat: ''
  });

  // Fetch health data
  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const response = await fetch(`${API_URL}/users/get-health?user_id=${user?.userId}`);
        const result = await response.json();
        
        if (result?.data) {
          setHealthData({
            riwayat_penyakit: result.data.riwayat_penyakit || '',
            memiliki_disabilitas: result.data.memiliki_disabilitas || '',
            kontak_darurat_nama: result.data.kontak_darurat_nama || '',
            kontak_darurat_nomor: result.data.kontak_darurat_nomor || '',
            hubungan_darurat: result.data.hubungan_darurat || ''
          });
          setUserData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch health data:', error);
      }
    };

    if (user?.userId) {
      fetchHealthData();
    }
  }, [user]);

  const hasAnyData = () => {
    return !!(
      userData?.riwayat_penyakit ||
      userData?.memiliki_disabilitas ||
      userData?.kontak_darurat_nama ||
      userData?.kontak_darurat_nomor ||
      userData?.hubungan_darurat
    );
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setHealthData({
      riwayat_penyakit: '',
      memiliki_disabilitas: '',
      kontak_darurat_nama: '',
      kontak_darurat_nomor: '',
      hubungan_darurat: ''
    });
    setIsFormVisible(true);
    setIsEditing(true);
  };

  const saveData = async () => {
    try {
      const url = userData 
        ? `${API_URL}/users/edit-health`
        : `${API_URL}/users/create-health`;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...healthData,
          user_id: user?.userId
        })
      });

      const result = await response.json();
      console.log('Response:', result);
      if (response.ok) {
        toast.success('Data kesehatan berhasil disimpan');
        setIsEditing(false);
        setUserData(healthData);
      } else {
        toast.error(result.error || 'Gagal menyimpan data');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Terjadi kesalahan saat menyimpan data');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHealthData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-6">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Data Kesehatan dan Darurat</h2>
          <p className="text-xs text-gray-500">Informasi kesehatan dan kontak darurat</p>
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
            {/* Riwayat Penyakit */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Riwayat Penyakit
              </label>
              <input
                type="text"
                name="riwayat_penyakit"
                value={healthData.riwayat_penyakit}
                onChange={handleChange}
                placeholder="Masukkan riwayat penyakit jika ada"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Jika ada penyakit kronis/alergi</p>
            </div>
            
            {/* Disabilitas */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apakah memiliki disabilitas?
              </label>
              <select
                name="memiliki_disabilitas"
                value={healthData.memiliki_disabilitas}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih --</option>
                <option value="Ya">Ya</option>
                <option value="Tidak">Tidak</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Untuk persiapan fasilitas khusus</p>
            </div>
            
            {/* Kontak Darurat */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Kontak Darurat
              </label>
              <input
                type="text"
                name="kontak_darurat_nama"
                value={healthData.kontak_darurat_nama}
                onChange={handleChange}
                placeholder="Nama kontak darurat"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Nama orang yang bisa dihubungi jika darurat</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kontak Darurat no hp
              </label>
              <input
                type="text"
                name="kontak_darurat_nomor"
                value={healthData.kontak_darurat_nomor}
                onChange={handleChange}
                placeholder="Nama kontak darurat"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Orang yang bisa dihubungi jika darurat</p>
            </div>
            
            {/* Hubungan dengan Kontak Darurat */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hubungan dengan Kontak Darurat
              </label>
              <select
                name="hubungan_darurat"
                value={healthData.hubungan_darurat}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Pilih Hubungan --</option>
                <option value="Orang tua">Orang Tua</option>
                <option value="Saudara">Saudara</option>
                <option value="Pasangan">Pasangan</option>
                <option value="Anak">Anak</option>
                <option value="Kerabat">Kerabat</option>
                <option value="Teman">Teman</option>
                <option value="Lainnya">Lainnya</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Untuk verifikasi hubungan</p>
            </div>
          </div>
        ) : (
          // Data Display (Read-only)
          <div className="p-4">
            <table className="w-full border-collapse">
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-2 font-medium text-sm text-gray-700 w-1/3">Riwayat Penyakit</td>
                  <td className="py-3 px-2 text-sm">{userData?.riwayat_penyakit || '-'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-2 font-medium text-sm text-gray-700">Memiliki Disabilitas</td>
                  <td className="py-3 px-2 text-sm">{userData?.memiliki_disabilitas || '-'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-2 font-medium text-sm text-gray-700">Nama Kontak Darurat</td>
                  <td className="py-3 px-2 text-sm">{userData?.kontak_darurat_nama || '-'}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-2 font-medium text-sm text-gray-700">Kontak Darurat</td>
                  <td className="py-3 px-2 text-sm">{userData?.kontak_darurat_nomor || '-'}</td>
                </tr>
                <tr>
                  <td className="py-3 px-2 font-medium text-sm text-gray-700">Hubungan dengan Kontak Darurat</td>
                  <td className="py-3 px-2 text-sm">{userData?.hubungan_darurat || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthInfoForm;