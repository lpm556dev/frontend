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
      const response = await fetch('https://api.siapguna.org/api/admin/get-presensi');
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data presensi');
      }

      const data = await response.json();
      if (data.success) {
        setPresensiData(data.data.map(item => ({
          id: item.id,
          user: {
            name: item.nama_lengkap,
            pleton: item.qrcode_text?.startsWith('A') ? 'A' : 'B'
          },
          status: item.keterangan || (item.jenis === 'masuk' ? 'Masuk' : 'Keluar'),
          tanggal: item.waktu_presensi
        })));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'hadir') return 'bg-green-100 text-green-800';
    if (statusLower === 'izin') return 'bg-yellow-100 text-yellow-800';
    if (statusLower === 'masuk') return 'bg-blue-100 text-blue-800';
    if (statusLower === 'keluar') return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const filteredData = presensiData.filter(item => {
    const dateMatch = filterDate 
      ? new Date(item.tanggal).toISOString().split('T')[0] === filterDate 
      : true;
    const nameMatch = filterName 
      ? item.user.name.toLowerCase().includes(filterName.toLowerCase())
      : true;
    return dateMatch && nameMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
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
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{item.user.name || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.user.pleton || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(item.tanggal)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada data presensi yang ditemukan
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LihatPresensiPage;