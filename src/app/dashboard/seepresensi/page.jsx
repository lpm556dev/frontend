"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../../stores/authStore';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const SeePresensiPage = () => {
  const router = useRouter();
  const { role, user, token } = useAuthStore();
  const [presensiData, setPresensiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Fetch presensi data based on user role
  const fetchPresensiData = async () => {
    setLoading(true);
    try {
      let apiUrl;
      
      if (role === '3' || role === '4') { // Admin or super admin
        apiUrl = 'https://api.siapguna.org/api/admin/get-presensi';
      } else { // Regular user
        apiUrl = `https://api.siapguna.org/api/users/get-presensi?user_id=${user?.userId}`;
      }

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch presence data');
      }

      const data = await response.json();
      
      if (data.success) {
        const formattedData = data.data.map(item => ({
          id: item.id || Math.random().toString(36).substr(2, 9), // Generate random ID if not provided
          userId: item.user_id,
          qrCode: item.qrcode_text || '-',
          name: item.nama_lengkap || item.user?.nama_lengkap || 'N/A',
          pleton: item.qrcode_text?.startsWith('A') ? 'A' : 'B',
          jenis: item.jenis || '-',
          status: item.status || (item.jenis === 'masuk' ? 'Masuk' : item.jenis === 'keluar' ? 'Keluar' : 'Izin'),
          keterangan: item.keterangan || '-',
          waktu: item.waktu_presensi,
          formattedDate: formatDate(item.waktu_presensi)
        }));

        setPresensiData(formattedData);
      } else {
        throw new Error(data.message || 'Failed to load presence data');
      }
    } catch (error) {
      console.error('Error fetching presence data:', error);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to load presence data',
        footer: 'Please check your internet connection or contact administrator'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on selected filters
  const filteredData = presensiData.filter(item => {
    // Filter by type (masuk/keluar/izin)
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
    
    // Filter by search query (name or QR code)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!item.name.toLowerCase().includes(query) && 
          !item.qrCode.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    return true;
  });

  // Handle reset filters
  const resetFilters = () => {
    setFilter('all');
    setDateFilter('');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Presence Data</h1>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Presence Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Presence Type</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="masuk">Check-in</option>
                <option value="keluar">Check-out</option>
                <option value="izin">Permission</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Search Filter */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Name/QR Code</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or QR code..."
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
              Reset Filters
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3">Loading presence data...</span>
            </div>
          ) : filteredData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platoon
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      QR Code
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Note
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
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
                          item.status.toLowerCase() === 'hadir' ? 'bg-green-100 text-green-800' :
                          item.status.toLowerCase() === 'izin' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.keterangan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.formattedDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No presence data found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || filter !== 'all' || dateFilter 
                  ? "Try adjusting your search filters" 
                  : "No presence data has been recorded yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeePresensiPage;