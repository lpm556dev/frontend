"use client";

import React, { useState, useEffect } from 'react';
import useAuthStore from '../../../stores/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Presensi = () => {
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [showNotesForm, setShowNotesForm] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [editingRecord, setEditingRecord] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [actualAttendance, setActualAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const [attendanceSummary, setAttendanceSummary] = useState({
    hadir: 0,
    izin: 0,
    sakit: 0,
    total: 0
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

  // Set nearest Saturday as default when component loads
  useEffect(() => {
    const today = new Date();
    const currentDay = today.getDay();
    let nextSaturday = new Date(today);
    
    if (currentDay !== 6) {
      const daysUntilSaturday = currentDay === 0 ? 6 : (6 - currentDay);
      nextSaturday.setDate(today.getDate() + daysUntilSaturday);
    }
    
    const yyyy = nextSaturday.getFullYear();
    const mm = String(nextSaturday.getMonth() + 1).padStart(2, '0');
    const dd = String(nextSaturday.getDate()).padStart(2, '0');
    const formattedSaturday = `${yyyy}-${mm}-${dd}`;
    
    setDate(formattedSaturday);
  }, []);

  // Fetch actual attendance data from API
  useEffect(() => {
    if (!user?.userId) {
      console.log('No user found in store');
      return;
    }
  
    fetchAttendanceData(user.userId);
  }, [user]);

  const fetchAttendanceData = async (userId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/get-presensi?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch attendance data');
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setActualAttendance(data.data);
        calculateAttendanceSummary(data.data);
      } else {
        console.error('Invalid data format:', data);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setError('Gagal memuat data presensi');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate attendance summary from API data
  const calculateAttendanceSummary = (attendanceData) => {
    const attendanceDays = new Set();
    let hadirCount = 0;
    let izinCount = 0;
    let sakitCount = 0;

    // Group by date and count statuses
    attendanceData.forEach(record => {
      const date = new Date(record.waktu_presensi).toLocaleDateString();
      
      // Count unique attendance days
      if (record.jenis === 'masuk') {
        attendanceDays.add(date);
      }

      // Count statuses from masuk records
      if (record.jenis === 'masuk') {
        const status = record.keterangan?.toLowerCase() || record.status?.toLowerCase();
        if (status === 'hadir') hadirCount++;
        else if (status === 'izin') izinCount++;
        else if (status === 'sakit') sakitCount++;
      }
    });

    setAttendanceSummary({
      hadir: hadirCount,
      izin: izinCount,
      sakit: sakitCount,
      total: attendanceDays.size // Total unique days with attendance
    });
  };

  // Format attendance time
  const formatAttendanceTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Format attendance date
  const formatAttendanceDate = (dateTimeString) => {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    });
  };

  // Group actual attendance data by date
  const groupAttendanceByDate = () => {
    const grouped = {};
    
    actualAttendance.forEach(record => {
      const date = new Date(record.waktu_presensi).toLocaleDateString('id-ID');
      
      if (!grouped[date]) {
        grouped[date] = {
          date,
          masuk: null,
          keluar: null,
          keterangan: null,
          status: null
        };
      }
      
      if (record.jenis === 'masuk') {
        grouped[date].masuk = record;
        grouped[date].keterangan = record.keterangan || null;
        grouped[date].status = record.status || null;
      } else if (record.jenis === 'keluar') {
        grouped[date].keluar = record;
        // Only update keterangan if not already set by masuk
        if (!grouped[date].keterangan && record.keterangan) {
          grouped[date].keterangan = record.keterangan;
        }
      } else if (record.jenis === 'izin') {
        // Handle izin records separately
        grouped[date].masuk = record;
        grouped[date].keterangan = record.keterangan || 'Izin';
        grouped[date].status = 'izin';
      }
    });
    
    return Object.values(grouped);
  };
  
  const groupedAttendance = groupAttendanceByDate();

  // Get status color for display
  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const statusLower = status.toLowerCase();
    if (statusLower === 'hadir') return 'bg-green-100 text-green-800';
    if (statusLower === 'izin') return 'bg-yellow-100 text-yellow-800';
    if (statusLower === 'sakit') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`mx-auto bg-white rounded-lg shadow-sm ${isMobile ? 'p-3' : 'p-6'}`}>
      <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-center py-4`}>PRESENSI</h1>
      
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 mb-4 rounded relative">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      
      {/* Kehadiran Summary Card */}
      <div className="bg-yellow-50 rounded-lg p-4 mb-6 border border-yellow-100">
        <div className={`${isMobile ? 'flex flex-col space-y-3' : 'flex justify-between items-center'}`}>
          <div className={isMobile ? 'text-center' : ''}>
            <h2 className="text-lg font-medium">Kehadiran</h2>
            <p className="font-bold mt-1">
              {isLoading ? 'Loading...' : `${attendanceSummary.hadir} DARI ${attendanceSummary.total} SESI`}
            </p>
          </div>
          
          <div className={`${isMobile ? 'grid grid-cols-3 gap-4' : 'flex space-x-8'}`}>
            <div className="text-center">
              <p className="font-semibold">Hadir</p>
              <p className="font-bold">{isLoading ? '-' : attendanceSummary.hadir}</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">Izin</p>
              <p className="font-bold">{isLoading ? '-' : attendanceSummary.izin}</p>
            </div>
            <div className="text-center">
              <p className="font-semibold">Sakit</p>
              <p className="font-bold">{isLoading ? '-' : attendanceSummary.sakit}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Actual Attendance Table */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Riwayat Presensi:</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="py-3 px-4 border-b text-left">No</th>
                <th className="py-3 px-4 border-b text-left">Tanggal</th>
                <th className="py-3 px-4 border-b text-left">Masuk</th>
                <th className="py-3 px-4 border-b text-left">Keluar</th>
                <th className="py-3 px-4 border-b text-left">Status</th>
                <th className="py-3 px-4 border-b text-left">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-4 text-center">Loading...</td>
                </tr>
              ) : groupedAttendance.length > 0 ? (
                groupedAttendance.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{index + 1}</td>
                    <td className="py-3 px-4">
                      {formatAttendanceDate(item.masuk?.waktu_presensi || item.keluar?.waktu_presensi)}
                    </td>
                    <td className="py-3 px-4">
                      {item.masuk ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                          {formatAttendanceTime(item.masuk.waktu_presensi)}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {item.keluar ? (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                          {formatAttendanceTime(item.keluar.waktu_presensi)}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status || item.keterangan)}`}>
                        {item.status || item.keterangan || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {item.keterangan ? (
                        <span className="text-sm">
                          {item.keterangan}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))
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
      </div>
      
      {/* Note about actual attendance */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="font-medium">Catatan Penting:</p>
        <p className="text-sm mt-1">Presensi kehadiran yang sesungguhnya akan dilakukan secara offline dengan memindai barcode pada saat pertemuan. Rencana kehadiran ini <strong>hanya untuk prediksi</strong> dan tidak akan mempengaruhi kehadiran sebenarnya.</p>
      </div>
      
      {/* Attendance Table (moved to bottom) */}
      <div id="attendance-table" className="mt-6">
        <h3 className="text-lg font-medium mb-3">Data Rencana Kehadiran:</h3>
        <div className="overflow-x-auto mb-6">
          <table className="min-w-full border border-gray-200">
            <thead>
              <tr className="bg-yellow-500 text-black">
                <th className="py-3 px-2 sm:px-4 border-b text-left">No</th>
                <th className="py-3 px-2 sm:px-4 border-b text-left">Hari dan Tanggal</th>
                <th className="py-3 px-2 sm:px-4 border-b text-left">Status</th>
                {!isMobile && <th className="py-3 px-4 border-b text-left">Catatan</th>}
                <th className="py-3 px-2 sm:px-4 border-b text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.length > 0 ? (
                attendanceRecords.map((record, index) => (
                  <tr key={record.id} className={`border-b hover:bg-gray-50 ${editingRecord?.id === record.id ? 'bg-yellow-50' : ''}`}>
                    <td className="py-3 px-2 sm:px-4">{index + 1}</td>
                    <td className="py-3 px-2 sm:px-4">{record.date}</td>
                    <td className="py-3 px-2 sm:px-4">
                      <span className={`px-2 py-1 rounded-full text-sm font-semibold 
                        ${record.status === 'Hadir' ? 'bg-green-100 text-green-800' : 
                          record.status === 'Sakit' ? 'bg-red-100 text-red-800' : 
                          record.status === 'Izin' ? 'bg-yellow-100 text-yellow-800' : 
                          record.status === 'Telat' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    {!isMobile && <td className="py-3 px-4">{record.notes || '-'}</td>}
                    <td className="py-3 px-2 sm:px-4 text-center">
                      <div className={`${isMobile ? 'flex flex-col space-y-1' : 'flex space-x-2 justify-center'}`}>
                        <button 
                          className="bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded"
                          onClick={() => handleEdit(record)}
                        >
                          {isMobile ? '✏️' : 'Edit'}
                        </button>
                        <button 
                          className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded"
                          onClick={() => handleDelete(record.id)}
                        >
                          {isMobile ? '🗑️' : 'Hapus'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-b">
                  <td colSpan={isMobile ? 4 : 5} className="py-6 text-center text-gray-500">
                    Belum ada rencana kehadiran
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Presensi;