"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../../stores/authStore';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const PresensiPage = () => {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [presensiData, setPresensiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Attendance planning states
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [showNotesForm, setShowNotesForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);
  const [attendanceSummary, setAttendanceSummary] = useState({
    hadir: 0,
    izin: 0,
    sakit: 0,
    total: 16
  });

  // Check if it's mobile view
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
    try {
      const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      return new Date(dateString).toLocaleDateString('id-ID', options);
    } catch (e) {
      console.error('Error formatting date:', e);
      return '-';
    }
  };

  // Format date for date filter comparison
  const formatDateForFilter = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (e) {
      console.error('Error formatting filter date:', e);
      return '';
    }
  };

  // Fetch presensi data from API
  const fetchPresensiData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.siapguna.org/api/users/get-presensi?user_id=${user?.userId}`, {
        headers: {
          'Content-Type': 'application/json'
        },
        method : 'GET'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Format the API response data
      const formattedData = data.map(item => ({
        id: item.id,
        qrCode: item.qrcode_text || '-',
        pleton: item.pleton || (item.qrcode_text?.startsWith('A') ? 'A' : 'B'),
        jenis: item.jenis.toLowerCase(),
        status: item.status,
        keterangan: item.keterangan || '-',
        waktu: item.waktu_presensi,
        formattedDate: formatDate(item.waktu_presensi),
        filterDate: formatDateForFilter(item.waktu_presensi)
      }));

      setPresensiData(formattedData);
      calculateAttendanceSummary(formattedData);
    } catch (error) {
      console.error('Error fetching presence data:', error);
      MySwal.fire({
        title: 'Error',
        text: 'Gagal memuat data presensi',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate attendance summary
  const calculateAttendanceSummary = (attendanceData) => {
    const summary = {
      hadir: 0,
      izin: 0,
      sakit: 0,
      total: 16
    };

    if (!Array.isArray(attendanceData)) return;

    const attendanceDays = new Set();
    
    attendanceData.forEach(record => {
      try {
        const date = new Date(record.waktu).toLocaleDateString();
        
        if (record.jenis === 'masuk' || record.jenis === 'keluar') {
          attendanceDays.add(date);
        }
        
        if (record.status === 'Izin') {
          summary.izin++;
        } else if (record.status === 'Sakit') {
          summary.sakit++;
        } else if (record.status === 'Telat') {
          attendanceDays.add(date);
        }
      } catch (e) {
        console.error('Error processing attendance record:', e);
      }
    });

    summary.hadir = attendanceDays.size;
    setAttendanceSummary(summary);
  };

  useEffect(() => {
    if(user !== null){}

    fetchPresensiData();
  }, [user]);

  // Get weekend dates (Saturday and Sunday)
  const getWeekendDates = () => {
    try {
      const today = new Date();
      const currentDay = today.getDay();
      
      // Calculate next Saturday
      let saturday = new Date(today);
      if (currentDay !== 6) {
        const daysUntilSaturday = currentDay === 0 ? 6 : (6 - currentDay);
        saturday.setDate(today.getDate() + daysUntilSaturday);
      }
      
      // Calculate next Sunday
      let sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      
      // Format dates
      const formatDate = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };
      
      const formatDisplayDate = (date) => {
        return date.toLocaleDateString('id-ID', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric'
        });
      };
      
      return {
        saturday: {
          formatted: formatDate(saturday),
          display: formatDisplayDate(saturday)
        },
        sunday: {
          formatted: formatDate(sunday),
          display: formatDisplayDate(sunday)
        }
      };
    } catch (e) {
      console.error('Error getting weekend dates:', e);
      const today = new Date();
      return {
        saturday: {
          formatted: today.toISOString().split('T')[0],
          display: 'Sabtu'
        },
        sunday: {
          formatted: new Date(today.setDate(today.getDate() + 1)).toISOString().split('T')[0],
          display: 'Minggu'
        }
      };
    }
  };

  const weekendDates = getWeekendDates();
  const saturdayFormatted = weekendDates.saturday.display;
  const sundayFormatted = weekendDates.sunday.display;

  // Handle date selection
  const handleDateSelection = (date, displayDate) => {
    try {
      setSelectedDate(displayDate);
      setDateFilter(date);
      setShowStatusMenu(true);
      setShowNotesForm(false);
      setStatus('');
      setNotes('');
    } catch (e) {
      console.error('Error handling date selection:', e);
    }
  };

  // Handle status click
  const handleStatusClick = (selectedStatus) => {
    try {
      setStatus(selectedStatus);
      setShowNotesForm(selectedStatus !== 'Hadir');
      if (selectedStatus === 'Hadir') {
        setNotes('');
      }
    } catch (e) {
      console.error('Error handling status click:', e);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!status) {
      setError('Silakan pilih status kehadiran');
      return;
    }
    
    if ((status === 'Izin' || status === 'Sakit' || status === 'Telat') && !notes) {
      setError('Silakan isi keterangan');
      return;
    }
    
    setError('');
    
    try {
      setIsLoadingSubmit(true);
      
      // Prepare data for API submission
      const payload = {
        user_id: user.id,
        status: status,
        keterangan: notes,
        tanggal: dateFilter,
        waktu_presensi: new Date(dateFilter).toISOString()
      };
      
      const response = await fetch(`https://api.siapguna.org/api/users/get-presensi?user_id=${user.userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSuccessMessage('Presensi berhasil disimpan');
        await fetchPresensiData(); // Refresh data
      } else {
        throw new Error(result.message || 'Gagal menyimpan presensi');
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      setError('Terjadi kesalahan saat menyimpan presensi');
    } finally {
      setIsLoadingSubmit(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // Reset form
  const resetForm = () => {
    try {
      setStatus('');
      setNotes('');
      setShowNotesForm(false);
      setShowStatusMenu(false);
      setSelectedDate('');
      setError('');
    } catch (e) {
      console.error('Error resetting form:', e);
    }
  };

  // Filter data based on selected filters
  const filteredData = presensiData.filter(item => {
    try {
      // Filter by type (masuk/keluar/izin)
      if (filter !== 'all' && item.jenis !== filter) {
        return false;
      }

      // Filter by date
      if (dateFilter && item.filterDate !== dateFilter) {
        return false;
      }

      // Filter by search query (QR code)
      if (searchQuery && !item.qrCode.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      return true;
    } catch (e) {
      console.error('Error filtering data:', e);
      return false;
    }
  });

  // Handle reset filters
  const resetFilters = () => {
    try {
      setFilter('all');
      setDateFilter('');
      setSearchQuery('');
    } catch (e) {
      console.error('Error resetting filters:', e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Presensi</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>

        {/* Kehadiran Summary Card */}
        <div className="bg-yellow-50 rounded-lg p-4 mb-6 border border-yellow-100">
          <div className={`${isMobile ? 'flex flex-col space-y-3' : 'flex justify-between items-center'}`}>
            <div className={isMobile ? 'text-center' : ''}>
              <h2 className="text-lg font-medium">Kehadiran</h2>
              <p className="font-bold mt-1">
                {loading ? 'Memuat...' : `${attendanceSummary.hadir} DARI ${attendanceSummary.total} SESI`}
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

        {/* Planning Section */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
          <h3 className="text-md font-medium mb-3">Rencana Kehadiran Minggu Ini:</h3>
          <div className={`${isMobile ? 'flex flex-col space-y-3' : 'flex space-x-4'}`}>
            <div className="bg-white p-3 rounded border border-gray-200 flex-1">
              <p className="font-medium">{saturdayFormatted}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-blue-600">Hari Pertama</span>
                <button
                  type="button"
                  onClick={() => handleDateSelection(weekendDates.saturday.formatted, saturdayFormatted)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black text-sm py-1 px-3 rounded"
                >
                  Pilih
                </button>
              </div>
            </div>

            <div className="bg-white p-3 rounded border border-gray-200 flex-1">
              <p className="font-medium">{sundayFormatted}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-blue-600">Hari Kedua</span>
                <button
                  type="button"
                  onClick={() => handleDateSelection(weekendDates.sunday.formatted, sundayFormatted)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black text-sm py-1 px-3 rounded"
                >
                  Pilih
                </button>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Catatan: Anda hanya dapat merencanakan kehadiran untuk akhir pekan ini (maksimal 2 hari).
          </p>
        </div>

        {/* Status Menu (only shown after date selection) */}
        {showStatusMenu && (
          <div id="status-menu" className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
            <h3 className="text-xl font-medium mb-4">
              Tambah Presensi
              <span className="text-sm font-normal text-gray-600 ml-2">({selectedDate})</span>
            </h3>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded relative">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mb-4 rounded relative">
                <span className="block sm:inline">{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                {/* Status selection */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Status Kehadiran:
                  </label>
                  <div className={`${isMobile ? 'grid grid-cols-2 gap-2' : 'flex space-x-4'} justify-center`}>
                    <button
                      type="button"
                      onClick={() => handleStatusClick('Hadir')}
                      className={`py-2 px-4 rounded ${status === 'Hadir' ? 'bg-green-600 text-white font-bold' : 'bg-green-500 text-white hover:bg-green-600'}`}
                    >
                      Hadir
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusClick('Sakit')}
                      className={`py-2 px-4 rounded ${status === 'Sakit' ? 'bg-red-600 text-white font-bold' : 'bg-red-500 text-white hover:bg-red-600'}`}
                    >
                      Sakit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusClick('Izin')}
                      className={`py-2 px-4 rounded ${status === 'Izin' ? 'bg-yellow-600 text-white font-bold' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}
                    >
                      Izin
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusClick('Telat')}
                      className={`py-2 px-4 rounded ${status === 'Telat' ? 'bg-blue-600 text-white font-bold' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    >
                      Telat
                    </button>
                  </div>
                </div>

                {/* Notes form for Sakit, Izin, Telat */}
                {showNotesForm && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                      Keterangan {status}:
                    </label>
                    <textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder={`Berikan keterangan untuk ${status}...`}
                      rows="3"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Silakan berikan detail keterangan untuk {status}
                    </p>
                  </div>
                )}
              </div>

              <div className={`${isMobile ? 'flex flex-col space-y-2' : 'flex justify-end space-x-4'}`}>
                <button
                  type="button"
                  onClick={resetForm}
                  className={`${isMobile ? 'w-full' : ''} bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-8 rounded`}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoadingSubmit}
                  className={`${isMobile ? 'w-full' : ''} bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-8 rounded ${isLoadingSubmit ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoadingSubmit ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Note about actual attendance */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="font-medium">Catatan Penting:</p>
          <p className="text-sm mt-1">Presensi kehadiran yang sesungguhnya akan dilakukan secara offline dengan memindai barcode pada saat pertemuan. Rencana kehadiran ini <strong>hanya untuk prediksi</strong> dan tidak akan mempengaruhi kehadiran sebenarnya.</p>
        </div>

        {/* Presence History Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Riwayat Presensi</h2>
          
          {/* Filter Section */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Presence Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Kehadiran</label>
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

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3">Memuat data presensi...</span>
              </div>
            ) : filteredData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Peleton
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.pleton}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.qrCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs ${item.jenis === 'masuk' ? 'bg-blue-100 text-blue-800' :
                            item.jenis === 'keluar' ? 'bg-purple-100 text-purple-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                            {item.jenis}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs ${item.status.toLowerCase() === 'hadir' ? 'bg-green-100 text-green-800' :
                            item.status.toLowerCase() === 'izin' ? 'bg-yellow-100 text-yellow-800' :
                              item.status.toLowerCase() === 'sakit' ? 'bg-red-100 text-red-800' :
                              item.status.toLowerCase() === 'telat' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada data presensi</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery || filter !== 'all' || dateFilter
                    ? "Coba sesuaikan filter pencarian Anda"
                    : "Belum ada data presensi yang tercatat"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresensiPage;