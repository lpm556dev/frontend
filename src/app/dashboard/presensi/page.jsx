"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../../stores/authStore';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const API_URL = 'https://api.siapguna.org/api';

const PresensiPage = () => {
  const router = useRouter();
  const { role, user, token, isAuthenticated } = useAuthStore();
  const [presensiData, setPresensiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState({
    hadir: 0,
    izin: 0,
    sakit: 0,
    total: 16 // Assuming 16 sessions total
  });

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated || !token) {
      MySwal.fire({
        icon: 'warning',
        title: 'Autentikasi Diperlukan',
        text: 'Silakan login terlebih dahulu',
      }).then(() => {
        router.push('/login');
      });
      return;
    }
  }, [isAuthenticated, token, router]);

  // Check if mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Format date for filter input
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Format time only
  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate attendance summary
  const calculateAttendanceSummary = (data) => {
    const summary = {
      hadir: 0,
      izin: 0,
      sakit: 0,
      total: 16
    };

    const attendanceDays = new Set();
    
    data.forEach(item => {
      const date = new Date(item.waktu_presensi).toLocaleDateString();
      
      if (item.jenis === 'masuk' || item.jenis === 'keluar') {
        attendanceDays.add(date);
      }
      
      if (item.status === 'izin') {
        summary.izin++;
      } else if (item.status === 'sakit') {
        summary.sakit++;
      }
    });

    summary.hadir = attendanceDays.size;
    setAttendanceSummary(summary);
  };

  // Fetch presensi data based on user role
  const fetchPresensiData = async () => {
    setLoading(true);
    try {
      let apiUrl;
      
      if (role === '3' || role === '4') {
        // Admin can see all presensi
        apiUrl = `${API_URL}/admin/get-presensi`;
      } else {
        // Regular users can only see their own presensi
        apiUrl = `${API_URL}/users/get-presensi?user_id=${user?.userId}`;
      }
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengambil data presensi');
      }

      const data = await response.json();
      
      if (data.success) {
        // Format the data for display
        const formattedData = data.data.map(item => ({
          id: item.id,
          userId: item.user_id,
          qrCode: item.qrcode_text,
          name: item.nama_lengkap || item.user?.nama_lengkap || 'N/A',
          pleton: item.qrcode_text?.startsWith('A') ? 'A' : 'B',
          jenis: item.jenis,
          status: item.status || (item.jenis === 'masuk' ? 'Masuk' : 'Keluar'),
          keterangan: item.keterangan || '-',
          waktu: item.waktu_presensi,
          waktuMasuk: item.jenis === 'masuk' ? item.waktu_presensi : null,
          waktuKeluar: item.jenis === 'keluar' ? item.waktu_presensi : null,
          tanggal: formatDate(item.waktu_presensi),
          displayDate: new Date(item.waktu_presensi).toLocaleDateString('id-ID', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric'
          })
        }));

        setPresensiData(formattedData);
        calculateAttendanceSummary(data.data);
      } else {
        throw new Error(data.message || 'Gagal memuat data presensi');
      }
    } catch (error) {
      console.error('Error fetching presensi data:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Gagal memuat data presensi',
        footer: 'Periksa koneksi internet Anda atau hubungi administrator'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchPresensiData();
    }
  }, [role, user?.userId, token, isAuthenticated]);

  // Filter data based on selected filters
  const filteredData = presensiData.filter(item => {
    // Filter by jenis (masuk/keluar/izin)
    if (filter !== 'all' && item.jenis !== filter) {
      return false;
    }
    
    // Filter by date
    if (dateFilter) {
      const itemDate = new Date(item.waktu).toISOString().split('T')[0];
      if (itemDate !== dateFilter) {
        return false;
      }
    }
    
    // Filter by search query (name or qr code)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!item.name.toLowerCase().includes(query) && 
          !item.qrCode.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    return true;
  });

  // Group data by date for user view
  const groupDataByDate = () => {
    const grouped = {};
    
    presensiData.forEach(item => {
      const dateKey = item.displayDate;
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          masuk: null,
          keluar: null,
          keterangan: null,
          status: null
        };
      }
      
      if (item.jenis === 'masuk') {
        grouped[dateKey].masuk = item;
        grouped[dateKey].keterangan = item.keterangan;
      } else if (item.jenis === 'keluar') {
        grouped[dateKey].keluar = item;
        if (item.keterangan) {
          grouped[dateKey].keterangan = item.keterangan;
        }
      }
      
      // Determine status
      if (item.status === 'izin') {
        grouped[dateKey].status = 'Izin';
      } else if (item.status === 'sakit') {
        grouped[dateKey].status = 'Sakit';
      } else if (item.jenis === 'masuk' && grouped[dateKey].keluar) {
        grouped[dateKey].status = 'Hadir';
      } else if (item.jenis === 'masuk' && !grouped[dateKey].keluar) {
        grouped[dateKey].status = 'Hadir (belum keluar)';
      }
    });
    
    return Object.values(grouped);
  };

  const groupedData = groupDataByDate();

  // Handle reset filters
  const resetFilters = () => {
    setFilter('all');
    setDateFilter('');
    setSearchQuery('');
  };

  // Admin view table
  const renderAdminTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nama
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pleton
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              QR Code
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Jenis
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Keterangan
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Waktu
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {item.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.pleton}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.qrCode}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  item.jenis === 'masuk' ? 'bg-blue-100 text-blue-800' :
                  item.jenis === 'keluar' ? 'bg-purple-100 text-purple-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.jenis}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  item.status === 'hadir' ? 'bg-green-100 text-green-800' :
                  item.status === 'izin' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.keterangan}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {item.tanggal}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // User view table
  const renderUserTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200">
        <thead>
          <tr className="bg-blue-500 text-white">
            <th className="py-3 px-4 border-b text-left">No</th>
            <th className="py-3 px-4 border-b text-left">Tanggal</th>
            <th className="py-3 px-4 border-b text-left">Masuk</th>
            <th className="py-3 px-4 border-b text-left">Keluar</th>
            <th className="py-3 px-4 border-b text-left">Keterangan</th>
            <th className="py-3 px-4 border-b text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {groupedData.length > 0 ? (
            groupedData.map((item, index) => {
              let statusClass = 'bg-gray-100 text-gray-800';
              if (item.status === 'Hadir') statusClass = 'bg-green-100 text-green-800';
              else if (item.status === 'Izin') statusClass = 'bg-blue-100 text-blue-800';
              else if (item.status === 'Sakit') statusClass = 'bg-red-100 text-red-800';
              else if (item.status?.includes('belum')) statusClass = 'bg-yellow-100 text-yellow-800';

              return (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{item.date}</td>
                  <td className="py-3 px-4">
                    {item.masuk ? (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        {formatTime(item.masuk.waktu)}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="py-3 px-4">
                    {item.keluar ? (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                        {formatTime(item.keluar.waktu)}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="py-3 px-4">
                    {item.keterangan || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-sm ${statusClass}`}>
                      {item.status || '-'}
                    </span>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="py-4 text-center text-gray-500">
                Belum ada data presensi
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // Summary card
  const renderSummaryCard = () => (
    <div className="bg-yellow-50 rounded-lg p-4 mb-6 border border-yellow-100">
      <div className={`${isMobile ? 'flex flex-col space-y-3' : 'flex justify-between items-center'}`}>
        <div className={isMobile ? 'text-center' : ''}>
          <h2 className="text-lg font-medium">Kehadiran</h2>
          <p className="font-bold mt-1">
            {loading ? 'Loading...' : `${attendanceSummary.hadir} DARI ${attendanceSummary.total} SESI`}
          </p>
        </div>
        
        <div className={`${isMobile ? 'grid grid-cols-3 gap-4' : 'flex space-x-8'}`}>
          <div className="text-center">
            <p className="font-semibold">Hadir</p>
            <p className="font-bold">{loading ? '-' : attendanceSummary.hadir}</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">Izin</p>
            <p className="font-bold">{loading ? '-' : attendanceSummary.izin}</p>
          </div>
          <div className="text-center">
            <p className="font-semibold">Sakit</p>
            <p className="font-bold">{loading ? '-' : attendanceSummary.sakit}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {role === '3' || role === '4' ? 'Data Presensi' : 'Presensi Saya'}
          </h1>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>

        {/* Summary Card (for regular users) */}
        {(role !== '3' && role !== '4') && renderSummaryCard()}

        {/* Filter Section (for admin only) */}
        {(role === '3' || role === '4') && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Jenis Presensi Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Presensi</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Semua</option>
                  <option value="masuk">Masuk</option>
                  <option value="keluar">Keluar</option>
                  <option value="izin">Izin</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Search Filter */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Cari Nama/QR Code</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari berdasarkan nama atau QR code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={resetFilters}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                Reset Filter
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3">Memuat data presensi...</span>
            </div>
          ) : (role === '3' || role === '4') ? (
            filteredData.length > 0 ? (
              renderAdminTable()
            ) : (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data presensi</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || filter !== 'all' || dateFilter 
                    ? "Coba ubah filter pencarian Anda" 
                    : "Belum ada data presensi yang tercatat"}
                </p>
              </div>
            )
          ) : groupedData.length > 0 ? (
            renderUserTable()
          ) : (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada data presensi</h3>
              <p className="mt-1 text-sm text-gray-500">Anda belum memiliki catatan presensi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PresensiPage;