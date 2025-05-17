"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../../stores/authStore';
import DashboardHeader from '../../../components/DashboardHeader';

const LihatPresensiPage = () => {
  const { role, user } = useAuthStore();
  const router = useRouter();
  const [presensiData, setPresensiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterName, setFilterName] = useState('');

  useEffect(() => {
    if (role !== '3' && role !== '4') {
      router.push('/dashboard');
      return;
    }
    
    fetchPresensiData();
  }, [role, router]);

  const fetchPresensiData = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/api/users/presensi`);
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data presensi');
      }

      const data = await response.json();
      if (data.success) {
        setPresensiData(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Memuat data presensi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Data Presensi" 
        showBackButton={true}
        onBack={() => router.push('/dashboard')}
      />

      <div className="container mx-auto p-4">
        {/* Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Filter Tanggal</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cari Nama</label>
              <input
                type="text"
                placeholder="Cari peserta..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Peserta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pleton</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {presensiData.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{item.user?.name || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.user?.pleton || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === 'Hadir' ? 'bg-green-100 text-green-800' :
                        item.status === 'Izin' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(item.tanggal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LihatPresensiPage;