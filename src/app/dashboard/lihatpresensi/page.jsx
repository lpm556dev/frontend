"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '../../../components/DashboardHeader';

// Buat custom hook untuk auth store yang aman SSR
const useSafeAuthStore = () => {
  const [store, setStore] = useState(null);
  
  useEffect(() => {
    // Dynamic import untuk menghindari SSR issues
    import('../../../stores/authStore').then((module) => {
      setStore(module.useAuthStore);
    });
  }, []);

  return store ? store() : { role: null, user: null };
};

const LihatPresensiPage = () => {
  const { role, user } = useSafeAuthStore();
  const router = useRouter();
  const [presensiData, setPresensiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterName, setFilterName] = useState('');

  // Data mock untuk development
  const mockPresensiData = [
    {
      id: 1,
      qrcode_text: "B51004",
      nama_lengkap: "Ahmad Budiman",
      jenis: "masuk",
      keterangan: "hadir seperti biasanya",
      status: "hadir",
      waktu_presensi: new Date().toISOString()
    },
    {
      id: 2,
      qrcode_text: "B51004",
      nama_lengkap: "Ahmad Budiman",
      jenis: "keluar",
      keterangan: "pulang setelah kegiatan",
      status: "hadir",
      waktu_presensi: new Date().toISOString()
    }
  ];

  useEffect(() => {
    // Pastikan hanya berjalan di client side
    if (typeof window === 'undefined') return;

    // Jika role tidak sesuai, redirect
    if (role && role !== '3' && role !== '4') {
      router.push('/dashboard');
      return;
    }

    // Untuk development, gunakan mock data
    processPresensiData(mockPresensiData);
    
    // Untuk production, gunakan:
    // fetchPresensiData();
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
        processPresensiData(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
      setPresensiData([]);
    } finally {
      setLoading(false);
    }
  };

  const processPresensiData = (rawData) => {
    if (!rawData || !Array.isArray(rawData)) {
      setPresensiData([]);
      setLoading(false);
      return;
    }

    const groupedData = rawData.reduce((acc, item) => {
      const key = item.qrcode_text;
      if (!key) return acc;

      if (!acc[key]) {
        acc[key] = {
          id: item.id,
          qrcode_text: key,
          nama_lengkap: item.nama_lengkap || 'Unknown',
          pleton: key.startsWith('A') ? 'A' : 'B',
          status: item.status || 'unknown',
          keterangan: item.keterangan || '',
          waktu_masuk: null,
          waktu_keluar: null
        };
      }

      if (item.jenis === 'masuk') {
        acc[key].waktu_masuk = item.waktu_presensi;
      } else if (item.jenis === 'keluar') {
        acc[key].waktu_keluar = item.waktu_presensi;
      }

      return acc;
    }, {});

    const formattedData = Object.values(groupedData).map(item => ({
      ...item,
      user: {
        name: item.nama_lengkap,
        pleton: item.pleton
      }
    }));

    setPresensiData(formattedData);
    setLoading(false);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return '-';
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch(status.toLowerCase()) {
      case 'hadir': return 'bg-green-100 text-green-800';
      case 'izin': return 'bg-yellow-100 text-yellow-800';
      case 'sakit': return 'bg-blue-100 text-blue-800';
      case 'alfa': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredData = presensiData.filter(item => {
    const date = item.waktu_masuk || item.waktu_keluar;
    const dateMatch = filterDate 
      ? new Date(date).toISOString().split('T')[0] === filterDate 
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
        {/* Form Filter */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal</label>
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
                placeholder="Cari nama peserta..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterDate('');
                  setFilterName('');
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Reset Filter
              </button>
            </div>
          </div>
        </div>

        {/* Tabel Data */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pleton</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Masuk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keluar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{item.user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{item.user.pleton}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatTime(item.waktu_masuk)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatTime(item.waktu_keluar)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.keterangan || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      Tidak ada data presensi
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