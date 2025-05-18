import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '../stores/authStore';

const SeePresensi = () => {
  const { role, user } = useAuthStore();
  const router = useRouter();
  const [presensiData, setPresensiData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userPresensi, setUserPresensi] = useState([]);

  // Fetch all presensi data
  const fetchPresensiData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.siapguna.org/api/admin/get-presensi');
      if (!response.ok) {
        throw new Error('Gagal mengambil data presensi');
      }
      const data = await response.json();
      if (data.success) {
        // Format the data
        const formattedData = data.data.map(item => ({
          id: item.id,
          user: {
            id: item.user_id,
            name: item.nama_lengkap,
            pleton: item.qrcode_text?.startsWith('A') ? 'A' : 'B'
          },
          jenis: item.jenis,
          status: item.status || (item.jenis === 'masuk' ? 'Masuk' : 'Keluar'),
          keterangan: item.keterangan || '-',
          tanggal: item.waktu_presensi,
          qrcode: item.qrcode_text
        }));
        setPresensiData(formattedData);
        setFilteredData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching presensi data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch presensi for a specific user
  const fetchUserPresensi = async (userId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.siapguna.org/api/users/get-presensi?user_id=${userId}`);
      if (!response.ok) {
        throw new Error('Gagal mengambil data presensi user');
      }
      const data = await response.json();
      if (data.success) {
        setUserPresensi(data.data);
      }
    } catch (error) {
      console.error('Error fetching user presensi:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (role === '3' || role === '4') {
      fetchPresensiData();
    }
  }, [role]);

  // Apply filters
  useEffect(() => {
    let result = [...presensiData];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(item => 
        item.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.qrcode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply date filter
    if (dateFilter) {
      result = result.filter(item => 
        new Date(item.tanggal).toLocaleDateString() === new Date(dateFilter).toLocaleDateString()
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(item => item.status.toLowerCase() === statusFilter.toLowerCase());
    }
    
    setFilteredData(result);
  }, [searchTerm, dateFilter, statusFilter, presensiData]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Format just the date part
  const formatDateOnly = (dateString) => {
    if (!dateString) return '-';
    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Handle user selection
  const handleUserClick = (user) => {
    setSelectedUser(user);
    fetchUserPresensi(user.id);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'hadir':
        return 'bg-green-100 text-green-800';
      case 'izin':
        return 'bg-yellow-100 text-yellow-800';
      case 'sakit':
        return 'bg-blue-100 text-blue-800';
      case 'alpa':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <main className="flex-1 overflow-y-auto py-4 px-3 sm:px-4 md:px-6 pb-20 transition-all duration-300 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-800">Data Presensi</h1>
        <button
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cari Nama/QR</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama atau QR code..."
                className="w-full bg-gray-100 rounded-lg px-4 py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter Tanggal</label>
            <input
              type="date"
              className="w-full bg-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter Status</label>
            <select
              className="w-full bg-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status</option>
              <option value="hadir">Hadir</option>
              <option value="izin">Izin</option>
              <option value="sakit">Sakit</option>
              <option value="alpa">Alpa</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setDateFilter('');
                setStatusFilter('all');
              }}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors duration-300"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Presensi List */}
        <div className={`bg-white rounded-lg shadow-sm p-4 ${selectedUser ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Daftar Presensi</h2>
            <p className="text-sm text-gray-600">{filteredData.length} data ditemukan</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">
              <p>{error}</p>
              <button 
                onClick={fetchPresensiData}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
              >
                Coba lagi
              </button>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2 text-gray-600">Tidak ada data presensi yang ditemukan</p>
            </div>
          ) : (
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
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      QR Code
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jenis
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item) => (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-gray-50 cursor-pointer ${selectedUser?.id === item.user.id ? 'bg-blue-50' : ''}`}
                      onClick={() => handleUserClick(item.user)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{item.user.pleton}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.tanggal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.qrcode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {item.jenis}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* User Detail */}
        {selectedUser && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Detail Peserta</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">{selectedUser.name}</h3>
                  <p className="text-sm text-gray-600">Pleton {selectedUser.pleton}</p>
                </div>
              </div>
            </div>

            <h3 className="font-medium text-sm mb-3">Riwayat Presensi</h3>

            {isLoading ? (
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : userPresensi.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Belum ada data presensi</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userPresensi.map((item, index) => (
                  <div key={index} className="p-3 border border-gray-100 rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(item.waktu_presensi)}
                      </span>
                    </div>
                    <p className="text-sm font-medium capitalize mb-1">{item.jenis}</p>
                    <p className="text-xs text-gray-600">{item.keterangan || '-'}</p>
                    {item.qrcode_text && (
                      <p className="text-xs mt-1 text-gray-500">QR: {item.qrcode_text}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom spacing for mobile navigation */}
      <div className="h-16 md:h-0"></div>
    </main>
  );
};

export default SeePresensi;