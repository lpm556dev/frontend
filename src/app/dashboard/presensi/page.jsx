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

  // Attendance planning summary
  const [planningSummary, setPlanningSummary] = useState({
    hadir: 0,
    sakit: 0,
    izin: 0,
    alpha: 0,
    telat: 0
  });

  // Check if it's mobile view
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for resize
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Set nearest Saturday as default when component loads
  useEffect(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Find the next Saturday
    let nextSaturday = new Date(today);
    if (currentDay !== 6) {
      // Calculate days until next Saturday (6 - currentDay)
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
    if (!user) {
    console.log('No user found in store');
    return; // Exit early if no user
  }
  
  const userId = user.userId;
  console.log('UserId for API call:', userId);
  
  // Only fetch when we have a userId
  if (userId) {
    fetchAttendanceData(userId);
  }
}, [user]);

  const fetchAttendanceData = async (userId) => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_URL}/users/get-presensi?user_id=${userId}`, {
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
    // Group by date to count unique attendance days
    const attendanceDays = new Set();
    
    // Count attended days (where there's both entry and exit on the same day)
    attendanceData.forEach(record => {
      const date = new Date(record.waktu_presensi).toLocaleDateString();
      attendanceDays.add(date);
    });
    
    // For this simple example, we'll just count days with any attendance as "hadir"
    // In a real application, you might need more complex logic
    setAttendanceSummary({
      hadir: attendanceDays.size,
      izin: 0, // These values would come from a different API endpoint or field
      sakit: 0, // These values would come from a different API endpoint or field
      total: 16 // Assuming fixed total, adjust based on your requirements
    });
  };

  // Format attendance time
  const formatAttendanceTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Format attendance date
  const formatAttendanceDate = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    });
  };

  // Get the current Saturday and Sunday dates
  const getWeekendDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    
    // Find the current/next Saturday
    const saturdayDate = new Date(today);
    if (currentDay !== 6) {
      const daysUntilSaturday = currentDay === 0 ? 6 : (6 - currentDay);
      saturdayDate.setDate(today.getDate() + daysUntilSaturday);
    }
    
    // Sunday is the day after Saturday
    const sundayDate = new Date(saturdayDate);
    sundayDate.setDate(saturdayDate.getDate() + 1);
    
    return {
      saturday: {
        date: saturdayDate,
        formatted: formatDateToISO(saturdayDate)
      },
      sunday: {
        date: sundayDate,
        formatted: formatDateToISO(sundayDate)
      }
    };
  };

  const formatDateToISO = (dateObj) => {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!date) {
      setError('Silakan pilih tanggal terlebih dahulu');
      return;
    }
    
    // Check if selected date is Saturday or Sunday
    const selectedDay = new Date(date).getDay(); // 0 = Sunday, 6 = Saturday
    if (selectedDay !== 0 && selectedDay !== 6) {
      setError('Rencana kehadiran hanya dapat dilakukan untuk hari Sabtu dan Minggu');
      return;
    }
    
    // Get current weekend dates
    const weekendDates = getWeekendDates();
    const selectedDateObj = new Date(date);
    const selectedDateIso = formatDateToISO(selectedDateObj);
    
    // Check if the selected date is the current weekend
    if (selectedDateIso !== weekendDates.saturday.formatted && 
        selectedDateIso !== weekendDates.sunday.formatted) {
      setError('Anda hanya dapat merencanakan kehadiran untuk Sabtu dan Minggu minggu ini');
      return;
    }
    
    if (!status) {
      setError('Silakan pilih status kehadiran');
      return;
    }
    
    if ((status === 'Sakit' || status === 'Izin' || status === 'Telat') && !notes.trim()) {
      setError(`Keterangan untuk ${status} wajib diisi`);
      return;
    }

    // Check if we already have 2 entries for this weekend and trying to add a new one
    if (!editingRecord && attendanceRecords.length >= 2) {
      setError('Anda hanya dapat merencanakan maksimal 2 kehadiran (Sabtu dan Minggu)');
      return;
    }

    if (editingRecord) {
      // Update existing record
      const updatedRecords = attendanceRecords.map(record => 
        record.id === editingRecord.id 
          ? { 
              ...record, 
              date: formatDate(date), 
              status: status,
              notes: notes 
            } 
          : record
      );
      setAttendanceRecords(updatedRecords);
      setEditingRecord(null);
      setSuccessMessage('Rencana kehadiran berhasil diperbarui');
    } else {
      // Check if date already exists
      const dateExists = attendanceRecords.some(
        record => record.date === formatDate(date) && (!editingRecord || record.id !== editingRecord.id)
      );
      
      if (dateExists) {
        setError('Rencana untuk tanggal ini sudah ada. Silakan gunakan tombol Edit untuk mengubah data.');
        return;
      }
      
      // Create new record
      const newRecord = {
        id: Date.now(), // Using timestamp as ID for uniqueness
        date: formatDate(date),
        status: status,
        notes: notes
      };
      setAttendanceRecords([...attendanceRecords, newRecord]);
      setSuccessMessage('Rencana kehadiran berhasil ditambahkan');
    }
    
    // Update summary
    const newRecords = editingRecord 
      ? attendanceRecords.map(r => r.id === editingRecord.id ? {...r, status} : r)
      : [...attendanceRecords, { status }];
    
    updateSummary(newRecords);
    
    // Reset form
    resetForm();
    
    // Scroll to table after submission
    setTimeout(() => {
      document.getElementById('attendance-table').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 300);
  };

  const resetForm = () => {
    // Reset fields
    setStatus('');
    setNotes('');
    setShowNotesForm(false);
    setEditingRecord(null);
    setShowStatusMenu(false);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  const updateSummary = (records) => {
    const newSummary = {
      hadir: 0,
      sakit: 0,
      izin: 0,
      alpha: 0,
      telat: 0
    };

    records.forEach(record => {
      if (record.status === 'Hadir') newSummary.hadir++;
      else if (record.status === 'Sakit') newSummary.sakit++;
      else if (record.status === 'Izin') newSummary.izin++;
      else if (record.status === 'Alpha') newSummary.alpha++;
      else if (record.status === 'Telat') newSummary.telat++;
    });

    setPlanningSummary(newSummary);
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', options);
  };

  const handleDateSelection = (selectedDateISO, formattedDate) => {
    setDate(selectedDateISO);
    setSelectedDate(formattedDate);
    setShowStatusMenu(true);
    setError('');
    
    // Scroll to status menu
    setTimeout(() => {
      document.getElementById('status-menu').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };

  const handleStatusClick = (selectedStatus) => {
    setStatus(selectedStatus);
    setError('');
    
    // Show notes form for Sakit, Izin, and Telat
    if (selectedStatus === 'Sakit' || selectedStatus === 'Izin' || selectedStatus === 'Telat') {
      setShowNotesForm(true);
    } else {
      setShowNotesForm(false);
      setNotes('');
    }
  };

  const handleEdit = (record) => {
    // Parse the formatted date back to YYYY-MM-DD for the date input
    const dateParts = record.date.split(', ')[1].split(' ');
    const day = dateParts[0];
    const month = getMonthNumber(dateParts[1]);
    const year = dateParts[2];
    
    const formattedDate = `${year}-${month}-${day.padStart(2, '0')}`;
    
    // Verify it's a weekend day (should always be, but double-check)
    const selectedDay = new Date(formattedDate).getDay();
    if (selectedDay !== 0 && selectedDay !== 6) {
      setError('Hanya data untuk hari Sabtu dan Minggu yang dapat diedit');
      return;
    }
    
    // Populate the form with the record data
    setDate(formattedDate);
    setSelectedDate(record.date);
    setStatus(record.status);
    setNotes(record.notes || '');
    setEditingRecord(record);
    setShowStatusMenu(true);
    
    // Show notes form if needed
    if (record.status === 'Sakit' || record.status === 'Izin' || record.status === 'Telat') {
      setShowNotesForm(true);
    } else {
      setShowNotesForm(false);
    }
    
    // Clear any previous messages
    setError('');
    setSuccessMessage('');
    
    // Scroll to form
    document.getElementById('status-menu').scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      const updatedRecords = attendanceRecords.filter(record => record.id !== id);
      setAttendanceRecords(updatedRecords);
      updateSummary(updatedRecords);
      setSuccessMessage('Rencana kehadiran berhasil dihapus');
      
      if (editingRecord && editingRecord.id === id) {
        resetForm();
      }
    }
  };

  // Helper function to convert month name to number
  const getMonthNumber = (monthName) => {
    const months = {
      'Januari': '01', 'Februari': '02', 'Maret': '03', 'April': '04',
      'Mei': '05', 'Juni': '06', 'Juli': '07', 'Agustus': '08',
      'September': '09', 'Oktober': '10', 'November': '11', 'Desember': '12'
    };
    return months[monthName] || '01'; // Default to '01' if not found
  };

  // Get the weekend options for display
  const weekendDates = getWeekendDates();
  const saturdayFormatted = formatDate(weekendDates.saturday.formatted);
  const sundayFormatted = formatDate(weekendDates.sunday.formatted);

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
        keterangan: null // Tambahkan field keterangan
      };
    }
    
    if (record.jenis === 'masuk') {
      grouped[date].masuk = record;
      // Ambil keterangan dari record masuk jika ada
      grouped[date].keterangan = record.keterangan || null;
    } else if (record.jenis === 'keluar') {
      grouped[date].keluar = record;
      // Jika keterangan ada di record keluar, timpa yang sebelumnya
      if (record.keterangan) {
        grouped[date].keterangan = record.keterangan;
      }
    }
  });
  
  return Object.values(grouped);
};
  
  const groupedAttendance = groupAttendanceByDate();

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
        
        {/* Detail button inside Kehadiran section */}
        <div className="mt-3 text-right">
          <button 
            onClick={() => window.location.href = '/dashboard/presensi/detail'}
            className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-1 px-4 rounded text-sm"
          >
            Lihat Detail Kehadiran
          </button>
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
      <th className="py-3 px-4 border-b text-left">Keterangan</th> {/* Kolom baru */}
    </tr>
  </thead>
  <tbody>
    {isLoading ? (
      <tr>
        <td colSpan="5" className="py-4 text-center">Loading...</td> {/* Update colSpan */}
      </tr>
    ) : groupedAttendance.length > 0 ? (
      groupedAttendance.map((item, index) => (
        <tr key={index} className="border-b hover:bg-gray-50">
          <td className="py-3 px-4">{index + 1}</td>
          <td className="py-3 px-4">{formatAttendanceDate(item.masuk?.waktu_presensi || item.keluar?.waktu_presensi)}</td>
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
            {item.keterangan ? (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {item.keterangan}
              </span>
            ) : '-'}
          </td>
        </tr>
      ))
    ) : (
      <tr>
        <td colSpan="5" className="py-4 text-center text-gray-500">Belum ada data presensi</td> {/* Update colSpan */}
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