"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Presensi = () => {
  const [attendanceData, setAttendanceData] = useState({
    totalSessions: 12,
    attendedSessions: 6,
    sickDays: 1,
    permittedAbsences: 1,
    unpermittedAbsences: 0
  });
  
  const [attendanceHistory, setAttendanceHistory] = useState([
    { id: 1, date: 'Sabtu, 22 Maret 2025', status: 'Hadir' },
    { id: 2, date: 'Minggu, 23 Maret 2025', status: 'Hadir' }
  ]);
  
  const [showDetailView, setShowDetailView] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Hadir');

  // Handle edit attendance
  const handleEditAttendance = (id) => {
    console.log(`Edit attendance for ID: ${id}`);
    // In a real app, you would implement an edit modal or form here
  };

  // Handle date selection
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Handle status selection
  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!selectedDate) {
      alert('Silahkan pilih tanggal terlebih dahulu');
      return;
    }

    // Format the date to match the display format
    const dateObj = new Date(selectedDate);
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formattedDate = dateObj.toLocaleDateString('id-ID', options);
    
    // Create new attendance record
    const newRecord = {
      id: attendanceHistory.length + 1,
      date: formattedDate,
      status: selectedStatus
    };
    
    // Update attendance history
    setAttendanceHistory([...attendanceHistory, newRecord]);
    
    // Update attendance stats based on status
    const updatedData = { ...attendanceData };
    
    if (selectedStatus === 'Hadir') {
      updatedData.attendedSessions += 1;
    } else if (selectedStatus === 'Sakit') {
      updatedData.sickDays += 1;
    } else if (selectedStatus === 'Izin') {
      updatedData.permittedAbsences += 1;
    } else if (selectedStatus === 'Telat') {
      // You might want to handle late arrivals separately or count them as present
      updatedData.attendedSessions += 1;
    }
    
    setAttendanceData(updatedData);
    
    // Reset form
    setSelectedDate('');
    setSelectedStatus('Hadir');
    setShowDatePicker(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-6">
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold text-center mb-4">PRESENSI</h2>
        
        {/* Attendance Summary */}
        <div className="bg-yellow-50 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Kehadiran</p>
              <p className="text-sm">{attendanceData.attendedSessions} DARI {attendanceData.totalSessions} SESI</p>
            </div>
            <div className="flex space-x-6">
              <div className="text-center">
                <p className="font-medium">Hadir</p>
                <p className="text-xl font-bold">{attendanceData.attendedSessions}</p>
              </div>
              <div className="text-center">
                <p className="font-medium">Sakit</p>
                <p className="text-xl font-bold">{attendanceData.sickDays}</p>
              </div>
              <div className="text-center">
                <p className="font-medium">Izin</p>
                <p className="text-xl font-bold">{attendanceData.permittedAbsences}</p>
              </div>
              <div className="text-center">
                <p className="font-medium">Alpha</p>
                <p className="text-xl font-bold">{attendanceData.unpermittedAbsences}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between mb-4">
          <button 
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded"
            onClick={() => setShowDatePicker(true)}
          >
            Rencana Kehadiran
          </button>
          <button 
            className="bg-blue-900 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded"
            onClick={() => setShowDetailView(!showDetailView)}
          >
            Lihat Detail Presensi
          </button>
        </div>
        
        {/* Attendance Table */}
        {showDetailView && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <table className="w-full border-collapse">
              <thead className="bg-orange-500 text-white">
                <tr>
                  <th className="py-2 px-4 text-left">No</th>
                  <th className="py-2 px-4 text-left">Hari dan Tanggal</th>
                  <th className="py-2 px-4 text-left">Keterangan</th>
                  <th className="py-2 px-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{record.id}</td>
                    <td className="py-3 px-4">{record.date}</td>
                    <td className="py-3 px-4">{record.status}</td>
                    <td className="py-3 px-4">
                      <button 
                        className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-1 rounded"
                        onClick={() => handleEditAttendance(record.id)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
        
        {/* Date Picker Modal */}
        {showDatePicker && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowDatePicker(false)}
          >
            <div 
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium mb-4">Pilih Tanggal, Hari dan Keterangan</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih Tangal
                </label>
                <input 
                  type="date" 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={selectedDate}
                  onChange={handleDateChange}
                />
              </div>
              
              <div className="mb-6 grid grid-cols-4 gap-2">
                <button 
                  className={`py-2 px-4 rounded font-medium ${selectedStatus === 'Hadir' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-800'}`}
                  onClick={() => handleStatusSelect('Hadir')}
                >
                  Hadir
                </button>
                <button 
                  className={`py-2 px-4 rounded font-medium ${selectedStatus === 'Sakit' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-800'}`}
                  onClick={() => handleStatusSelect('Sakit')}
                >
                  Sakit
                </button>
                <button 
                  className={`py-2 px-4 rounded font-medium ${selectedStatus === 'Izin' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-800'}`}
                  onClick={() => handleStatusSelect('Izin')}
                >
                  Izin
                </button>
                <button 
                  className={`py-2 px-4 rounded font-medium ${selectedStatus === 'Telat' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'}`}
                  onClick={() => handleStatusSelect('Telat')}
                >
                  Telat
                </button>
              </div>
              
              <div className="flex justify-between">
                <button 
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
                  onClick={() => setShowDatePicker(false)}
                >
                  Cancel
                </button>
                <button 
                  className="bg-blue-900 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Presensi;