"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, CheckCircle, XCircle, RefreshCw, Clock, Calendar, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const API_URL = "https://api.siapguna.org/api";

export default function QrCodeScanner() {
  // State management
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [attendanceStatus, setAttendanceStatus] = useState('hadir');
  const [attendanceType, setAttendanceType] = useState('masuk');
  const [keterangan, setKeterangan] = useState('hadir tepat waktu');
  
  // Scanner reference
  const scannerRef = useRef(null);

  // Update current time and date
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      // Update time
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
      
      // Update date
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      setCurrentDate(now.toLocaleDateString('id-ID', options));

      // Determine attendance type based on time
      if (now.getHours() < 12) {
        setAttendanceType('masuk');
        setKeterangan('hadir tepat waktu');
      } else {
        setAttendanceType('keluar');
        setKeterangan('pulang setelah kegiatan');
      }
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle successful QR scan
  const onScanSuccess = (decodedText) => {
    setScannedCode(decodedText);
    stopScanner();
  };

  // Stop QR scanner
  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setScanning(false);
  };

  // Start QR scanner
  const startScanner = () => {
    setScannedCode(null);
    setScanResult(null);
    setScanning(true);

    setTimeout(() => {
      const qrReaderElement = document.getElementById("qr-reader");
      if (!qrReaderElement) return;

      qrReaderElement.innerHTML = '';

      if (scannerRef.current) {
        scannerRef.current.clear();
      }

      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader", 
        { 
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true
        }, 
        false
      );
      
      scannerRef.current.render(onScanSuccess, (err) => {
        console.warn("QR scan error:", err);
      });
    }, 300);
  };

  // Submit attendance to API
  const submitAttendance = async () => {
    if (!scannedCode) return;

    setSubmitting(true);

    try {
      const now = new Date();
      const payload = {
        qrcode_text: scannedCode,
        jenis: attendanceType,
        keterangan: keterangan,
        status: attendanceStatus,
        waktu_presensi: now.toISOString()
      };

      const response = await fetch(`${API_URL}/users/presensi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setScanResult({
          success: true,
          message: data.message || 'Presensi berhasil dicatat'
        });
        toast.success(data.message || 'Presensi berhasil dicatat');
      } else {
        setScanResult({
          success: false,
          message: data.message || 'Gagal mencatat presensi'
        });
        toast.error(data.message || 'Gagal mencatat presensi');
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      setScanResult({
        success: false,
        message: `Error: ${error.message}`
      });
      toast.error(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form to scan again
  const resetForm = () => {
    setScannedCode(null);
    setScanResult(null);
    startScanner();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Toaster position="top-center" />
      
      {/* Date and Time Display */}
      <div className="mb-6 text-center bg-gradient-to-r from-blue-600 to-blue-900 text-white py-5 px-4 rounded-xl shadow-lg">
        {/* Date */}
        <div className="mb-3">
          <div className="text-lg">{currentDate}</div>
        </div>
        
        {/* Real-time Clock */}
        <div className="flex items-center justify-center bg-white/20 py-2 px-4 rounded-lg inline-flex">
          <Clock className="mr-2 text-blue-100" size={22} />
          <span className="text-2xl font-mono font-bold tracking-wider">{currentTime}</span>
        </div>
      </div>
      
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-1">Scan QR Code</h1>
        <p className="text-gray-600 text-lg">Pindai QR code untuk mencatat kehadiran</p>
      </div>

      {/* QR Scanner Section */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        {/* Initial Button State */}
        {!scanning && !scannedCode && !scanResult && (
          <div className="p-6 text-center">
            <button
              onClick={startScanner}
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 rounded-lg hover:shadow-lg hover:scale-105 transform transition-all duration-200 flex items-center mx-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              <Camera size={24} className="mr-3" />
              <span className="text-lg font-medium">Bismillah Scan QR Code</span>
            </button>
            <p className="mt-3 text-sm text-gray-500">
              Klik tombol di atas untuk membuka kamera
            </p>
          </div>
        )}

        {/* QR Scanner Container */}
        <div id="qr-reader-container" className={scanning ? "block p-4 relative" : "hidden"}>
          <div className="mb-4 text-center">
            <div className="text-md text-blue-700 font-medium mb-2">Pindai QR Code</div>
            <div className="text-sm text-gray-500">Posisikan QR code di dalam kotak</div>
          </div>
          <div id="qr-reader" className="w-full relative"></div>
          <div className="text-center mt-6">
            <button
              onClick={stopScanner}
              className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 flex items-center mx-auto"
            >
              <XCircle size={18} className="mr-2" />
              <span>Batalkan Scan</span>
            </button>
          </div>
        </div>

        {/* Scanned Code Display */}
        {scannedCode && !scanResult && (
          <div className="p-6">
            <div className="text-center mb-6">
              {submitting ? (
                <div className="flex flex-col items-center justify-center">
                  <RefreshCw size={56} className="animate-spin text-blue-500" />
                  <span className="mt-4 text-lg font-medium text-gray-700">Memproses Kehadiran...</span>
                </div>
              ) : (
                <>
                  <div className="bg-green-100 p-4 rounded-lg mb-4 inline-block">
                    <CheckCircle size={56} className="mx-auto mb-2 text-green-500" />
                  </div>
                  <h3 className="text-xl font-medium text-green-700">QR Code Terdeteksi!</h3>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 max-w-xs mx-auto">
                    <p className="text-gray-600 break-all text-sm">{scannedCode}</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-gray-700">
                      Status: <span className="font-medium capitalize">{attendanceStatus}</span>
                    </p>
                    <p className="text-gray-700">
                      Jenis: <span className="font-medium capitalize">{attendanceType}</span>
                    </p>
                    <p className="text-gray-700">
                      Keterangan: <span className="font-medium">{keterangan}</span>
                    </p>
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={submitAttendance}
                      disabled={submitting}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {submitting ? 'Mengirim...' : 'Submit Presensi'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Scan Result Display */}
        {scanResult && (
          <div className="p-6">
            <div className="text-center mb-6">
              {scanResult.success ? (
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle size={52} className="text-green-500" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <XCircle size={52} className="text-red-500" />
                </div>
              )}
              <h3 className={`text-xl font-medium mt-4 ${scanResult.success ? 'text-green-700' : 'text-red-700'}`}>
                {scanResult.success ? 'Presensi Berhasil!' : 'Presensi Gagal!'}
              </h3>
              <div className={`mt-3 p-4 ${scanResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'} rounded-lg mx-auto max-w-sm`}>
                <p className="text-sm">{scanResult.message}</p>
              </div>
            </div>
            
            <div className="flex justify-center mt-6">
              <button
                onClick={resetForm}
                className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:shadow-lg transition-all duration-200 flex items-center"
              >
                <Camera size={20} className="mr-2" />
                Scan QR Code Lain
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
        <h3 className="font-medium text-blue-800 mb-3 flex items-center text-lg">
          <Calendar className="mr-2" size={20} />
          Petunjuk Presensi
        </h3>
        <ol className="list-decimal list-inside text-blue-700 space-y-2 ml-1">
          <li>Klik tombol "Bismillah Scan QR Code"</li>
          <li>Izinkan aplikasi mengakses kamera</li>
          <li>Arahkan kamera ke QR code</li>
          <li>Tunggu hingga QR code terdeteksi</li>
          <li>Presensi akan dicatat secara otomatis</li>
        </ol>
      </div>
    </div>
  );
}