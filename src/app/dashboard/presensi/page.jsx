"use client";

import React, { useState, useEffect } from 'react';
import useAuthStore from '../../../stores/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const Presensi = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuthStore();
  const [attendanceSummary, setAttendanceSummary] = useState({
    hadir: 0,
    izin: 0,
    sakit: 0,
    alpa: 0,
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

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setIsLoading(true);
        if (!user?.id) return;
        
        const response = await fetch(`http://api.siapguna.org/api/users/presensi?user_id=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch attendance data');
        }
        
        const data = await response.json();
        setAttendanceData(data.data || []);
        calculateSummary(data.data || []);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setError('Gagal memuat data presensi');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceData();
  }, [user?.id]);

  // Calculate attendance summary
  const calculateSummary = (data) => {
    const summary = {
      hadir: 0,
      izin: 0,
      sakit: 0,
      alpa: 0,
      total: 0
    };

    // Group by date to count unique attendance days
    const attendanceDays = new Set();
    const leaveDays = new Set();
    
    data.forEach(record => {
      const date = new Date(record.waktu_presensi).toLocaleDateString();
      
      if (record.jenis === 'masuk' || record.jenis === 'keluar') {
        attendanceDays.add(date);
      } else if (record.jenis === 'izin') {
        leaveDays.add(date);
      }
      
      if (record.status === 'izin') {
        summary.izin++;
      } else if (record.status === 'sakit') {
        summary.sakit++;
      } else if (record.status === 'alpa') {
        summary.alpa++;
      }
    });

    summary.hadir = attendanceDays.size;
    summary.total = summary.hadir + summary.izin + summary.sakit + summary.alpa;
    setAttendanceSummary(summary);
  };

  // Format time
  const formatTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Format date
  const formatDate = (dateTimeString) => {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    });
  };

  // Group attendance by date
  const groupAttendanceByDate = () => {
    const grouped = {};
    
    attendanceData.forEach(record => {
      const date = new Date(record.waktu_presensi).toLocaleDateString('id-ID');
      
      if (!grouped[date]) {
        grouped[date] = {
          date,
          masuk: null,
          keluar: null,
          izin: null,
          status: null,
          keterangan: null
        };
      }
      
      if (record.jenis === 'masuk') {
        grouped[date].masuk = record;
        grouped[date].status = record.status;
        grouped[date].keterangan = record.keterangan || null;
      } else if (record.jenis === 'keluar') {
        grouped[date].keluar = record;
        if (record.keterangan) {
          grouped[date].keterangan = record.keterangan;
        }
      } else if (record.jenis === 'izin') {
        grouped[date].izin = record;
        grouped[date].status = record.status;
        grouped[date].keterangan = record.keterangan || 'Izin';
      }
    });
    
    return Object.values(grouped);
  };

  // Get status display and class
  const getStatusInfo = (record) => {
    if (record.izin) {
      return {
        text: record.izin.status === 'sakit' ? 'Sakit' : 'Izin',
        class: record.izin.status === 'sakit' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
      };
    }
    
    if (record.masuk && record.keluar) {
      return {
        text: record.status === 'telat' ? 'Hadir (Terlambat)' : 'Hadir',
        class: record.status === 'telat' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
      };
    }
    
    if (record.masuk) {
      return {
        text: 'Hadir (Belum Keluar)',
        class: 'bg-yellow-100 text-yellow-800'
      };
    }
    
    return {
      text: '-',
      class: 'bg-gray-100 text-gray-800'
    };
  };

  const groupedAttendance = groupAttendanceByDate();

  return (
    <div className={`mx-auto bg-white rounded-lg shadow-sm ${isMobile ? 'p-3' : 'p-6'}`}>
      <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-center py-4`}>PRESENSI</h1>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {/* Attendance Summary Card */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
        <div className={`${isMobile ? 'flex flex-col space-y-3' : 'flex justify-between items-center'}`}>
          <div className={isMobile ? 'text-center' : ''}>
            <h2 className="text-lg font-medium">Rekap Kehadiran</h2>
            <p className="font-bold mt-1">
              {isLoading ? 'Loading...' : `${attendanceSummary.hadir} HARI DARI ${attendanceSummary.total} HARI`}
            </p>
          </div>
          
          <div className={`${isMobile ? 'grid grid-cols-2 gap-4' : 'flex space-x-8'}`}>
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
            <div className="text-center">
              <p className="font-semibold">Alpa</p>
              <p className="font-bold">{isLoading ? '-' : attendanceSummary.alpa}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Attendance Table */}
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
                  const statusInfo = getStatusInfo(item);
                  
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">{item.date}</td>
                      <td className="py-3 px-4">
                        {item.masuk ? (
                          <span className={`px-2 py-1 rounded text-sm ${
                            item.masuk.status === 'telat' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {formatTime(item.masuk.waktu_presensi)}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {item.keluar ? (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                            {formatTime(item.keluar.waktu_presensi)}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {item.keterangan || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-sm ${statusInfo.class}`}>
                          {statusInfo.text}
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

      {/* Information Note */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
        <p className="font-medium">Informasi Presensi:</p>
        <p className="text-sm mt-1">
          Presensi dilakukan dengan memindai QR Code yang tersedia di lokasi kegiatan. 
          Pastikan Anda melakukan presensi masuk dan keluar untuk mencatat kehadiran dengan lengkap.
        </p>
      </div>
    </div>
  );
};

export default Presensi;