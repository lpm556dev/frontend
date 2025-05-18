"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../../stores/authStore';
import DashboardHeader from '../../../components/DashboardHeader';

const LihatPresensiPage = () => {
  const { role, user } = useAuthStore((state) => ({
    role: state.role,
    user: state.user
  }));
  const router = useRouter();
  const [presensiData, setPresensiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterName, setFilterName] = useState('');

  // Contoh data presensi untuk testing
  const mockPresensiData = [
    {
      id: 1,
      qrcode_text: "B51004",
      nama_lengkap: "Ahmad Budiman",
      jenis: "masuk",
      keterangan: "hadir seperti biasanya",
      status: "hadir",
      waktu_presensi: "2023-11-15T08:05:00Z"
    },
    {
      id: 2,
      qrcode_text: "B51004",
      nama_lengkap: "Ahmad Budiman",
      jenis: "keluar",
      keterangan: "pulang setelah kegiatan",
      status: "hadir",
      waktu_presensi: "2023-11-15T16:30:00Z"
    },
    {
      id: 3,
      qrcode_text: "A52001",
      nama_lengkap: "Siti Nurhaliza",
      jenis: "masuk",
      keterangan: "hadir tepat waktu",
      status: "hadir",
      waktu_presensi: "2023-11-15T07:55:00Z"
    }
  ];

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    if (role !== '3' && role !== '4') {
      router.push('/dashboard');
      return;
    }
    
    // Untuk development, gunakan mock data
    // fetchPresensiData();
    processPresensiData(mockPresensiData);
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
    } finally {
      setLoading(false);
    }
  };

  const processPresensiData = (rawData) => {
    // Group by qrcode_text to combine masuk/keluar
    const groupedData = rawData.reduce((acc, item) => {
      if (!acc[item.qrcode_text]) {
        acc[item.qrcode_text] = {
          id: item.id,
          qrcode_text: item.qrcode_text,
          nama_lengkap: item.nama_lengkap,
          pleton: item.qrcode_text?.startsWith('A') ? 'A' : 'B',
          status: item.status,
          keterangan: item.keterangan,
          waktu_masuk: null,
          waktu_keluar: null,
          originalData: []
        };
      }
      
      if (item.jenis === 'masuk') {
        acc[item.qrcode_text].waktu_masuk = item.waktu_presensi;
      } else if (item.jenis === 'keluar') {
        acc[item.qrcode_text].waktu_keluar = item.waktu_presensi;
      }
      
      acc[item.qrcode_text].originalData.push(item);
      
      return acc;
    }, {});

    // Convert to array
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

  const formatDateTime = (dateString) => {
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

  const formatTimeOnly = (dateString) => {
    if (!dateString) return '-';
    const options = { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    };
    return new Date(dateString).toLocaleTimeString('id-ID', options);
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch(status.toLowerCase()) {
      case 'hadir':
        return 'bg-green-100 text-green-800';
      case 'izin':
        return 'bg-yellow-100 text-yellow-800';
      case 'sakit':
        return 'bg-blue-100 text-blue-800';
      case 'alfa':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter data based on filter inputs
  const filteredData = presensiData.filter(item => {
    const dateToCheck = item.waktu_masuk || item.waktu_keluar;
    const matchesDate = filterDate ? 
      new Date(dateToCheck).toISOString().split('T')[0] === filterDate : 
      true;
    const matchesName = filterName ? 
      item.user.name.toLowerCase().includes(filterName.toLowerCase()) : 
      true;
    return matchesDate && matchesName;
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
        {/* Form untuk menambahkan presensi baru */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <h3 className="font-medium text-lg mb-4">Tambah Data Presensi</h3>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">QR Code</label>
              <input
                type="text"
                placeholder="Contoh: B51004"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select className="w-full p-2 border rounded-md">
                <option value="hadir">Hadir</option>
                <option value="izin">Izin</option>
                <option value="sakit">Sakit</option>
                <option value="alfa">Alfa</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Keterangan</label>
              <input
                type="text"
                placeholder="Keterangan presensi"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Jam Masuk</label>
              <input
                type="time"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Jam Keluar</label>
              <input
                type="time"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Simpan Presensi
              </button>
            </div>
          </form>
        </div>

        {/* Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <h3 className="font-medium text-lg mb-4">Filter Data Presensi</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tanggal Presensi</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cari Nama Peserta</label>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jam Masuk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jam Keluar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.waktu_masuk ? formatTimeOnly(item.waktu_masuk) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {item.waktu_keluar ? formatTimeOnly(item.waktu_keluar) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.keterangan || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
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