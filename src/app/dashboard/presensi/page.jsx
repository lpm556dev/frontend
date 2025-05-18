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
    if (!user || !user.userId) {
      console.log('No user found in store');
      return;
    }
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user's attendance data
        const response = await fetch(`${API_URL}/users/get-presensi?user_id=${user.userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch attendance data');
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.data)) {
          setActualAttendance(data.data);
          calculateAttendanceSummary(data.data);
        } else {
          console.error('Invalid data format:', data);
          setError('Format data presensi tidak valid');
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setError('Gagal memuat data presensi');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Calculate attendance summary from API data
  const calculateAttendanceSummary = (attendanceData) => {
    const summary = {
      hadir: 0,
      izin: 0,
      sakit: 0,
      total: 16 // Assuming 16 sessions in total (adjust as needed)
    };

    // Group by date to count unique attendance days
    const attendanceDays = new Set();
    
    attendanceData.forEach(record => {
      const date = new Date(record.waktu_presensi).toLocaleDateString();
      
      if (record.jenis === 'masuk' || record.jenis === 'keluar') {
        attendanceDays.add(date);
      }
      
      if (record.status === 'izin') {
        summary.izin++;
      } else if (record.status === 'sakit') {
        summary.sakit++;
      }
    });

    summary.hadir = attendanceDays.size;
    setAttendanceSummary(summary);
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
          keterangan: null
        };
      }
      
      if (record.jenis === 'masuk') {
        grouped[date].masuk = record;
        grouped[date].keterangan = record.keterangan || null;
      } else if (record.jenis === 'keluar') {
        grouped[date].keluar = record;
        if (record.keterangan) {
          grouped[date].keterangan = record.keterangan;
        }
      } else if (record.jenis === 'izin') {
        grouped[date].keterangan = record.keterangan || 'Izin';
      }
    });
    
    return Object.values(grouped);
  };
  
  const groupedAttendance = groupAttendanceByDate();

  // Rest of your component code remains the same...
  // [Keep all the existing JSX and other functions]

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
                <th className="py-3 px-4 border-b text-left">Keterangan</th>
                <th className="py-3 px-4 border-b text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-4 text-center">Memuat data...</td>
                </tr>
              ) : groupedAttendance.length > 0 ? (
                groupedAttendance.map((item, index) => {
                  // Determine status based on records
                  let status = '-';
                  let statusClass = 'bg-gray-100 text-gray-800';
                  
                  if (item.masuk && item.keluar) {
                    status = 'Hadir';
                    statusClass = 'bg-green-100 text-green-800';
                  } else if (item.masuk) {
                    status = 'Hadir (belum keluar)';
                    statusClass = 'bg-yellow-100 text-yellow-800';
                  } else if (item.keterangan && item.keterangan.includes('izin')) {
                    status = 'Izin';
                    statusClass = 'bg-blue-100 text-blue-800';
                  } else if (item.keterangan && item.keterangan.includes('sakit')) {
                    status = 'Sakit';
                    statusClass = 'bg-red-100 text-red-800';
                  }

                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">{item.date}</td>
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
                        {item.keterangan || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-sm ${statusClass}`}>
                          {status}
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
      </div>

      {/* Planning Summary Card */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
        <h3 className="text-md font-medium mb-3">Jadwal Minggu Ini:</h3>
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
        <div id="status-menu" className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-xl font-medium mb-4">
            {editingRecord ? 'Edit Rencana Kehadiran' : 'Tambah Rencana Kehadiran'}
            <span className="text-sm font-normal text-gray-600 ml-2">({selectedDate})</span>
          </h3>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded relative">
              <span className="block sm:inline">{error}</span>
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
                className={`${isMobile ? 'w-full' : ''} bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-8 rounded`}
              >
                {editingRecord ? 'Update' : 'Simpan'}
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