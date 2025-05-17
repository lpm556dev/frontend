// app/admin/users/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Filter, Download, ChevronLeft, ChevronRight, Eye, Check, Power, AlertCircle, FileText, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: 'nama_lengkap', direction: 'ascending' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activatingUser, setActivatingUser] = useState(null);

  const handleGoBack = () => {
    window.history.back();
  };
  
  // File type display names
  const fileTypeNames = {
    'ktp': 'KTP',
    'pas_foto': 'Pas Foto',
    'surat_izin': 'Surat Izin',
    'surat_kesehatan': 'Surat Kesehatan',
    'bukti_pembayaran': 'Bukti Pembayaran',
    'tertanda': 'Tanda Tangan'
  };
  
  const formatGender = (genderValue) => {
  if (genderValue === '1' || genderValue === 1) return 'Laki-laki';
  if (genderValue === '0' || genderValue === 0) return 'Perempuan';
  if (genderValue === 'P' || genderValue === "P") return 'Perempuan';
  return genderValue || 'N/A'; // Return original value if not 0 or 1, or N/A if null/undefined
};
  
  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      if (isRefreshing) {
        setIsRefreshing(true);
      }
      
      // Fetch users data
      const response = await fetch(`${API_URL}/users`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("datanya : " , data);
      
      // Process and combine user data with flag status
      const processedData = data.data.map(user => {
        // Find corresponding flag for this user
        const userFlag = data.flag.find(f => f.user_id === user.id);
        
        return {
          ...user,
          flag_status: userFlag ? userFlag.flag : null
        };
      });
      
      setUsers(processedData);
      
      // Store files data separately
      if (data.file) {
        setFiles(data.file);
      }
      
      setError(null);
    } catch (err) {
      setError(`Failed to fetch users: ${err.message}`);
      setUsers([]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle refresh button
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUsers();
  };

  // Get user flag status
  const getUserFlagStatus = (user) => {
    if (user.flag_status === "1") return "active";
    if (user.flag_status === "0") return "inactive";
    return null;
  };

  // Get user files
  const getUserFiles = (userId) => {
    return files.filter(file => file.user_id === userId);
  };

  // Check if user has submitted all required documents
  const hasAllDocuments = (userId) => {
    const userFiles = getUserFiles(userId);
    const requiredTypes = ['ktp', 'pas_foto', 'surat_izin', 'surat_kesehatan', 'bukti_pembayaran', 'tertanda'];
    return requiredTypes.every(type => userFiles.some(file => file.file_type === type));
  };

  // Activate user function
  const activateUser = async (userId) => {
    setActivatingUser(userId);
    try {
      const response = await fetch(`${API_URL}/admin/activate?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      const resData = await response.json(); // parse dulu responsenya
  
      if (!response.ok) {
        // Kalau gagal, tampilkan message dari response JSON
        throw new Error(resData.message || 'Activation failed');
      }
  
      toast.success(resData.message || 'User activated successfully');
      
      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, flag_status: "1" } : user
        )
      );
  
      // If detail modal is open, update selected user too
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => ({ ...prev, flag_status: "1" }));
      }
  
      fetchUsers();
    } catch (err) {
      console.error(`Failed to activate user: ${err.message}`);
      toast.error(err.message); // gunakan message dari error yang dilempar
    } finally {
      setActivatingUser(null);
    }
  };
  

  // Handle sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // View file function (link to Google Drive)
  const viewFile = (fileId) => {
    console.log("file id :" , fileId)
    if (!fileId) return;
    window.open(`https://drive.google.com/file/d/${fileId}/view`, '_blank');
  };

  // Open user detail modal
  const openDetailModal = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  // Close user detail modal
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedUser(null);
  };

  // Sort users based on sortConfig
  const sortedUsers = React.useMemo(() => {
    const sortableUsers = [...users];
    if (sortConfig.key) {
      sortableUsers.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);

  // Filter users based on search term
  const filteredUsers = React.useMemo(() => {
    return sortedUsers.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.nama_lengkap?.toLowerCase().includes(searchLower) ||
        user.nik?.includes(searchTerm) ||
        user.tempat_lahir?.toLowerCase().includes(searchLower) ||
        user.alamat?.toLowerCase().includes(searchLower) ||
        user.nomor_hp?.includes(searchTerm) ||
        user.kelurahan_desa?.toLowerCase().includes(searchLower) ||
        user.kecamatan?.toLowerCase().includes(searchLower) ||
        user.kabupaten_kota?.toLowerCase().includes(searchLower) ||
        user.provinsi?.toLowerCase().includes(searchLower) ||
        user.domisili_alamat?.toLowerCase().includes(searchLower) ||
        user.domisili_kelurahan_desa?.toLowerCase().includes(searchLower) ||
        user.domisili_kabupaten_kota?.toLowerCase().includes(searchLower) ||
        user.domisili_provinsi?.toLowerCase().includes(searchLower)
      );
    });
  }, [sortedUsers, searchTerm]);

  // Calculate pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Handle page change
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Export users to CSV
  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      'Nama Lengkap', 'NIK', 'Tempat Lahir', 'Tanggal Lahir', 'Jenis Kelamin',
      'Alamat', 'RT', 'RW', 'Kode Pos', 'Kelurahan/Desa', 'Kecamatan',
      'Kabupaten/Kota', 'Provinsi', 'Nomor HP', 'Golongan Darah',
      'Domisili Alamat', 'Domisili RT', 'Domisili RW', 'Domisili Kode Pos',
      'Domisili Kelurahan/Desa', 'Domisili Kecamatan', 'Domisili Kabupaten/Kota',
      'Domisili Provinsi', 'Status Aktivasi', 'Dokumen Lengkap'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => {
        const flagStatus = getUserFlagStatus(user);
        const activationStatus = flagStatus === 'active' ? 'Aktif' : 
                                flagStatus === 'inactive' ? 'Tidak Aktif' : 'Belum Memperbaharui Dokumen';
        const documentsComplete = hasAllDocuments(user.id) ? 'Lengkap' : 'Belum Lengkap';
        
        return [
          user.nama_lengkap || '',
          user.nik || '',
          user.tempat_lahir || '',
          user.tanggal_lahir ? new Date(user.tanggal_lahir).toISOString().split('T')[0] : '',
          user.jenis_kelamin || '',
          `"${user.alamat || ''}"`, // Quotes to handle commas in address
          user.rt || '',
          user.rw || '',
          user.kode_pos || '',
          user.kelurahan_desa || '',
          user.kecamatan || '',
          user.kabupaten_kota || '',
          user.provinsi || '',
          user.nomor_hp || '',
          user.golongan_darah || '',
          `"${user.domisili_alamat || ''}"`,
          user.domisili_rt || '',
          user.domisili_rw || '',
          user.domisili_kode_pos || '',
          user.domisili_kelurahan_desa || '',
          user.domisili_kecamatan || '',
          user.domisili_kabupaten_kota || '',
          user.domisili_provinsi || '',
          activationStatus,
          documentsComplete
        ].join(',');
      })
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'data_pengguna.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to get file icon based on file extension
  const getFileIcon = (fileName) => {
    if (!fileName) return null;
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    if (['png', 'jpg', 'jpeg', 'gif'].includes(extension)) {
      return '📷';
    } else if (['pdf'].includes(extension)) {
      return '📄';
    } else if (['zip', 'rar'].includes(extension)) {
      return '📦';
    } else if (['json', 'txt'].includes(extension)) {
      return '📝';
    } else if (['pptx'].includes(extension)) {
      return '📊';
    }
    
    return '📁';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <button 
          onClick={handleGoBack}
          className="mr-3 p-2 rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-600 flex items-center"
          >
          <ChevronLeft size={18} />
          <span className="ml-1">Kembali</span>
          </button>
          </div>
        <h1 className="text-2xl font-bold text-gray-800">Data Pengguna</h1>
      <p className="text-gray-600">Lihat data pengguna dalam sistem</p>
    </div>

      {/* Action bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Cari pengguna..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="absolute left-3 top-2.5 text-gray-400">
            <Search size={18} />
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center px-3 py-2 bg-white text-gray-700 rounded-lg border hover:bg-gray-50"
            disabled={isRefreshing}
          >
            <RefreshCw size={18} className={`mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            className="flex items-center px-3 py-2 bg-white text-gray-700 rounded-lg border hover:bg-gray-50"
          >
            <Filter size={18} className="mr-1" />
            Filter
          </button>
          
          <button
            onClick={exportToCSV}
            className="flex items-center px-3 py-2 bg-white text-gray-700 rounded-lg border hover:bg-gray-50"
          >
            <Download size={18} className="mr-1" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && !isRefreshing ? (
          <div className="p-10 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 text-gray-600">Memuat data pengguna...</p>
          </div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-500">{error}</p>
            <button 
              onClick={handleRefresh}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('nama_lengkap')}
                    >
                      <div className="flex items-center">
                        Nama Lengkap
                        {sortConfig.key === 'nama_lengkap' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('nik')}
                    >
                      <div className="flex items-center">
                        NIK
                        {sortConfig.key === 'nik' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('alamat')}
                    >
                      <div className="flex items-center">
                        Alamat KTP
                        {sortConfig.key === 'alamat' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('domisili_alamat')}
                    >
                      <div className="flex items-center">
                        Alamat Domisili
                        {sortConfig.key === 'domisili_alamat' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort('nomor_hp')}
                    >
                      <div className="flex items-center">
                        Nomor HP
                        {sortConfig.key === 'nomor_hp' && (
                          <span className="ml-1">
                            {sortConfig.direction === 'ascending' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        Dokumen
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        Status
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <div className="flex items-center">
                        Aksi
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user, index) => {
                      const flagStatus = getUserFlagStatus(user);
                      const userFiles = getUserFiles(user.id);
                      const hasComplete = hasAllDocuments(user.id);
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 text-sm font-medium">
                                  {user.nama_lengkap ? user.nama_lengkap.charAt(0).toUpperCase() : 'U'}
                                </span>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{user.nama_lengkap || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.nik || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                            {user.alamat ? (
                              <span className="text-sm text-gray-500">
                                {user.alamat}, {user.kelurahan_desa}, {user.kabupaten_kota}
                              </span>
                            ) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                            {user.domisili_alamat ? (
                              <span className="text-sm text-gray-500">
                                {user.domisili_alamat}, {user.domisili_kelurahan_desa}, {user.domisili_kabupaten_kota}
                              </span>
                            ) : 'Sama dengan KTP'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.nomor_hp || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {userFiles.length > 0 ? (
                              hasComplete ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <Check size={14} className="mr-1" />
                                  Lengkap
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <AlertTriangle size={14} className="mr-1" />
                                  Belum Lengkap
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <AlertTriangle size={14} className="mr-1" />
                                Belum Ada
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {flagStatus === 'active' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <Check size={14} className="mr-1" />
                                Aktif
                              </span>
                            ) : flagStatus === 'inactive' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <AlertCircle size={14} className="mr-1" />
                                Tidak Aktif
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Belum Update
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => openDetailModal(user)}
                                className="text-blue-600 hover:text-blue-800 flex items-center"
                              >
                                <Eye size={18} />
                              </button>
                              
                              {flagStatus !== 'active' && (
                                <button 
                                  onClick={() => activateUser(user.id)}
                                  disabled={activatingUser === user.id}
                                  className={`text-green-600 hover:text-green-800 flex items-center ${activatingUser === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                  <Power size={18} className={activatingUser === user.id ? 'animate-pulse' : ''} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                        {searchTerm ? 'Tidak ada pengguna yang sesuai dengan pencarian' : 'Tidak ada data pengguna'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredUsers.length > 0 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Menampilkan <span className="font-medium">{indexOfFirstUser + 1}</span> hingga{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastUser, filteredUsers.length)}
                      </span>{' '}
                      dari <span className="font-medium">{filteredUsers.length}</span> hasil
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft size={18} />
                      </button>
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                        // Calculate page numbers to show (simple pagination)
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = idx + 1;
                        } else if (currentPage <= 3) {
                          pageNum = idx + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + idx;
                        } else {
                          pageNum = currentPage - 2 + idx;
                        }
  
                        return (
                          <button
                            key={idx}
                            onClick={() => paginate(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                              currentPage === pageNum
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft size={18} />
                      </button>
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                        // Calculate page numbers to show (simple pagination)
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = idx + 1;
                        } else if (currentPage <= 3) {
                          pageNum = idx + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + idx;
                        } else {
                          pageNum = currentPage - 2 + idx;
                        }
  
                        return (
                          <button
                            key={idx}
                            onClick={() => paginate(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                              currentPage === pageNum
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight size={18} />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* User Detail Modal */}
{showDetailModal && selectedUser && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
        <h3 className="text-lg font-medium text-gray-900">Detail Pengguna</h3>
        <button 
          onClick={closeDetailModal}
          className="text-gray-400 hover:text-gray-500 p-1 -mr-1"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Informasi Pribadi</h4>
            <div className="space-y-2">
              <div className="flex flex-wrap">
                <span className="text-gray-500 w-32 flex-shrink-0">Nama Lengkap</span>
                <span className="text-gray-900 break-words">{selectedUser.nama_lengkap || 'N/A'}</span>
              </div>
              <div className="flex flex-wrap">
                <span className="text-gray-500 w-32 flex-shrink-0">NIK</span>
                <span className="text-gray-900 break-words">{selectedUser.nik || 'N/A'}</span>
              </div>
              <div className="flex flex-wrap">
                <span className="text-gray-500 w-32 flex-shrink-0">Tempat Lahir</span>
                <span className="text-gray-900 break-words">{selectedUser.tempat_lahir || 'N/A'}</span>
              </div>
              <div className="flex flex-wrap">
                <span className="text-gray-500 w-32 flex-shrink-0">Tanggal Lahir</span>
                <span className="text-gray-900 break-words">{formatDate(selectedUser.tanggal_lahir)}</span>
              </div>
              <div className="flex flex-wrap">
                <span className="text-gray-500 w-32 flex-shrink-0">Jenis Kelamin</span>
                <span className="text-gray-900 break-words">{formatGender(selectedUser.jenis_kelamin)}</span>
              </div>
              <div className="flex flex-wrap">
                <span className="text-gray-500 w-32 flex-shrink-0">Golongan Darah</span>
                <span className="text-gray-900 break-words">{selectedUser.golongan_darah || 'N/A'}</span>
              </div>
              <div className="flex flex-wrap">
                <span className="text-gray-500 w-32 flex-shrink-0">Nomor HP</span>
                <span className="text-gray-900 break-words">{selectedUser.nomor_hp || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          {/* Address Information */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Alamat KTP</h4>
            <div className="space-y-2">
              <div className="flex flex-wrap">
                <span className="text-gray-500 w-32 flex-shrink-0">Alamat</span>
                <span className="text-gray-900 break-words">{selectedUser.alamat || 'N/A'}</span>
              </div>
              <div className="flex flex-wrap">
                <span className="text-gray-500 w-32 flex-shrink-0">RT/RW</span>
                <span className="text-gray-900 break-words">
                  {selectedUser.rt || 'N/A'}/{selectedUser.rw || 'N/A'}
                </span>
              </div>
              <div className="flex flex-wrap">
                <span className="text-gray-500 w-32 flex-shrink-0">Kelurahan/Desa</span>
                <span className="text-gray-900 break-words">{selectedUser.kelurahan_desa || 'N/A'}</span>
              </div>
              <div className="flex flex-wrap">
                <span className="text-gray-500 w-32 flex-shrink-0">Kecamatan</span>
                <span className="text-gray-900 break-words">{selectedUser.kecamatan || 'N/A'}</span>
              </div>
              <div className="flex flex-wrap">
                <span className="text-gray-500 w-32 flex-shrink-0">Kabupaten/Kota</span>
                <span className="text-gray-900 break-words">{selectedUser.kabupaten_kota || 'N/A'}</span>
              </div>
              <div className="flex flex-wrap">
                <span className="text-gray-500 w-32 flex-shrink-0">Provinsi</span>
                <span className="text-gray-900 break-words">{selectedUser.provinsi || 'N/A'}</span>
              </div>
              <div className="flex flex-wrap">
                <span className="text-gray-500 w-32 flex-shrink-0">Kode Pos</span>
                <span className="text-gray-900 break-words">{selectedUser.kode_pos || 'N/A'}</span>
              </div>
            </div>
          </div>
          
          {/* Domisili Information (if different) */}
          {selectedUser.domisili_alamat && (
            <div className="md:col-span-2">
              <h4 className="text-md font-medium text-gray-900 mb-3">Alamat Domisili</h4>
              <div className="space-y-2">
                <div className="flex flex-wrap">
                  <span className="text-gray-500 w-32 flex-shrink-0">Alamat</span>
                  <span className="text-gray-900 break-words">{selectedUser.domisili_alamat || 'N/A'}</span>
                </div>
                <div className="flex flex-wrap">
                  <span className="text-gray-500 w-32 flex-shrink-0">RT/RW</span>
                  <span className="text-gray-900 break-words">
                    {selectedUser.domisili_rt || 'N/A'}/{selectedUser.domisili_rw || 'N/A'}
                  </span>
                </div>
                <div className="flex flex-wrap">
                  <span className="text-gray-500 w-32 flex-shrink-0">Kelurahan/Desa</span>
                  <span className="text-gray-900 break-words">{selectedUser.domisili_kelurahan_desa || 'N/A'}</span>
                </div>
                <div className="flex flex-wrap">
                  <span className="text-gray-500 w-32 flex-shrink-0">Kecamatan</span>
                  <span className="text-gray-900 break-words">{selectedUser.domisili_kecamatan || 'N/A'}</span>
                </div>
                <div className="flex flex-wrap">
                  <span className="text-gray-500 w-32 flex-shrink-0">Kabupaten/Kota</span>
                  <span className="text-gray-900 break-words">{selectedUser.domisili_kabupaten_kota || 'N/A'}</span>
                </div>
                <div className="flex flex-wrap">
                  <span className="text-gray-500 w-32 flex-shrink-0">Provinsi</span>
                  <span className="text-gray-900 break-words">{selectedUser.domisili_provinsi || 'N/A'}</span>
                </div>
                <div className="flex flex-wrap">
                  <span className="text-gray-500 w-32 flex-shrink-0">Kode Pos</span>
                  <span className="text-gray-900 break-words">{selectedUser.domisili_kode_pos || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Documents Section */}
          <div className="md:col-span-2">
            <h4 className="text-md font-medium text-gray-900 mb-3">Dokumen</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {getUserFiles(selectedUser.id).length > 0 ? (
                getUserFiles(selectedUser.id).map((file, index) => (
                  <div key={index} className="border rounded-lg p-3 hover:bg-gray-50 flex flex-col">
                    <div className="flex items-center mb-2">
                      <FileText size={18} className="text-gray-500 mr-2 flex-shrink-0" />
                      <span className="font-medium text-gray-900 truncate">
                        {fileTypeNames[file.file_type] || file.file_type}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-sm text-gray-500 truncate flex-1 min-w-0 pr-2">
                        {getFileIcon(file.file_name)} {file.file_name || 'file'}
                      </span>
                      <button
                        onClick={() => viewFile(file.google_drive_file_id)}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center whitespace-nowrap pl-2"
                      >
                        <Eye size={16} className="mr-1 flex-shrink-0" />
                        Lihat
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-4">
                  Belum ada dokumen yang diunggah
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 sticky bottom-0 bg-white">
        <div className="w-full sm:w-auto">
          <span className="text-gray-500 mr-2">Status:</span>
          {getUserFlagStatus(selectedUser) === 'active' ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <Check size={14} className="mr-1" />
              Aktif
            </span>
          ) : getUserFlagStatus(selectedUser) === 'inactive' ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <AlertCircle size={14} className="mr-1" />
              Tidak Aktif
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Belum Update
            </span>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={closeDetailModal}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 w-full sm:w-auto"
          >
            Tutup
          </button>
          
          {getUserFlagStatus(selectedUser) !== 'active' && (
            <button
              onClick={() => {
                activateUser(selectedUser.id);
                closeDetailModal();
              }}
              disabled={activatingUser === selectedUser.id}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full sm:w-auto ${
                activatingUser === selectedUser.id ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {activatingUser === selectedUser.id ? (
                <span className="flex items-center justify-center">
                  <RefreshCw size={16} className="animate-spin mr-2" />
                  Mengaktifkan...
                </span>
              ) : (
                'Aktifkan Pengguna'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
