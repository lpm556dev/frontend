"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, CheckCircle, XCircle, RefreshCw, Clock, Calendar, AlertCircle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const API_URL = "https://api.siapguna.org/api";

// Define Hijri month names
const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir",
  "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
  "Ramadhan", "Syawal", "Dzulka'dah", "Dzulhijjah"
];

export default function QrCodeScanner() {
  // State management
  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState({
    gregorian: '',
    hijri: '',
    hijriDay: 0,
    hijriMonth: 0,
    hijriYear: 0
  });
  const [attendanceStatus, setAttendanceStatus] = useState('hadir');
  const [attendanceType, setAttendanceType] = useState('masuk');
  const [lateReason, setLateReason] = useState('');
  const [permissionReason, setPermissionReason] = useState('');
  const [keterangan, setKeterangan] = useState(null);
  const [showLateForm, setShowLateForm] = useState(false);
  const [showPermissionForm, setShowPermissionForm] = useState(false);
  const [showKeteranganForm, setShowKeteranganForm] = useState(false);
  const [isOutsideValidHours, setIsOutsideValidHours] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [autoAttendance, setAutoAttendance] = useState(false);
  const [weekendScanStatus, setWeekendScanStatus] = useState(null);
  const [weekendScanHistory, setWeekendScanHistory] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [todayScans, setTodayScans] = useState([]);
  const [scannedCodes, setScannedCodes] = useState([]); // New state to track scanned QR codes
  
  // Scanner reference
  const scannerRef = useRef(null);

  // ===== Date and Time Functions =====
  
  // Calculate Hijri date from Gregorian date
  const calculateHijriDate = (gregorianDate) => {
    try {
      const date = new Date(gregorianDate);
      
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      let hDay = 1;
      let hMonthIndex = 10;
      let hYear = 1446;
      
      if (year === 2025 && month === 5) {
        const mayMapping = {
          1: 3, 2: 4, 3: 5, 4: 6, 5: 7, 6: 8, 7: 9, 8: 10,
          9: 11, 10: 12, 11: 13, 12: 14, 13: 15, 14: 16,
          15: 17, 16: 18, 17: 19, 18: 20, 19: 21, 20: 22,
          21: 23, 22: 24, 23: 25, 24: 26, 25: 27, 26: 28,
          27: 29, 28: 30, 29: 1, 30: 2, 31: 3
        };
        
        hDay = mayMapping[day] || day;
        
        if (day >= 29) {
          hMonthIndex = 11;
        }
      }
      else if (year === 2025 && month === 4) {
        const aprilMapping = {
          1: 3, 2: 4, 3: 5, 4: 6, 5: 7, 6: 8, 7: 9, 8: 10,
          9: 11, 10: 12, 11: 13, 12: 14, 13: 15, 14: 16,
          15: 17, 16: 18, 17: 19, 18: 20, 19: 21, 20: 22,
          21: 23, 22: 24, 23: 25, 24: 26, 25: 27, 26: 28,
          27: 29, 28: 30, 29: 1, 30: 2
        };
        
        hDay = aprilMapping[day] || day;
        
        if (day >= 29) {
          hMonthIndex = 10;
        } else {
          hMonthIndex = 9;
        }
      }
      else if (year === 2025 && month === 6) {
        const juneMapping = {
          1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10,
          8: 11, 9: 12, 10: 13, 11: 14, 12: 15, 13: 16,
          14: 17, 15: 18, 16: 19, 17: 20, 18: 21, 19: 22,
          20: 23, 21: 24, 22: 25, 23: 26, 24: 27, 25: 28,
          26: 29, 27: 30, 28: 1, 29: 2, 30: 3
        };
        
        hDay = juneMapping[day] || day;
        
        if (day >= 28) {
          hMonthIndex = 0;
          hYear = 1447;
        } else {
          hMonthIndex = 11;
        }
      }
      else {
        const offset = day % 30;
        hDay = offset + 1;
      }
      
      return {
        day: hDay,
        month: hMonthIndex,
        year: hYear,
        formatted: `${hDay} ${HIJRI_MONTHS[hMonthIndex]} ${hYear} H`
      };
    } catch (error) {
      console.error('Error calculating Hijri date:', error);
      return { 
        day: 7, 
        month: 10, 
        year: 1446, 
        formatted: "7 Dzulka'dah 1446 H" 
      };
    }
  };

  // Format day name in Indonesian
  const formatDayName = (date) => {
    const dayNames = {
      0: 'Ahad',
      1: 'Senin', 
      2: 'Selasa', 
      3: 'Rabu', 
      4: 'Kamis', 
      5: 'Jumat', 
      6: 'Sabtu'
    };
    
    return dayNames[date.getDay()];
  };

  // Format date in Indonesian
  const formatDate = (date) => {
    if (!date) return '';
    try {
      const dayName = formatDayName(date);
      const day = String(date.getDate()).padStart(2, '0');
      const month = date.toLocaleDateString('id-ID', { month: 'long' });
      const year = date.getFullYear();
      
      return `${dayName}, ${day} ${month} ${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Check if current time is within valid hours (Saturday 16:00-Sunday 16:00)
  const checkValidHours = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const dayOfWeek = now.getDay();

    // Monday to Friday - not allowed
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      setIsOutsideValidHours(true);
      return false;
    }

    // Saturday - allowed from 16:00 onwards
    if (dayOfWeek === 6) {
      if (hours >= 16) {
        setIsOutsideValidHours(false);
        return true;
      } else {
        setIsOutsideValidHours(true);
        return false;
      }
    }

    // Sunday - allowed before 16:00
    if (dayOfWeek === 0) {
      if (hours < 16 || (hours === 16 && minutes === 0)) {
        setIsOutsideValidHours(false);
        return true;
      } else {
        setIsOutsideValidHours(true);
        // Check if we need to set auto attendance
        if (hours >= 16 && scanCount === 0) {
          setAutoAttendance(true);
          setAttendanceStatus('hadir');
        }
        return false;
      }
    }

    // Default case (shouldn't happen)
    setIsOutsideValidHours(true);
    return false;
  };

  // Check if it's weekend (Saturday or Sunday)
  const isWeekend = () => {
    const now = new Date();
    return now.getDay() === 6 || now.getDay() === 0;
  };

  // Check if it's Saturday
  const isSaturday = () => {
    const now = new Date();
    return now.getDay() === 6;
  };

  // Check if it's Sunday
  const isSunday = () => {
    const now = new Date();
    return now.getDay() === 0;
  };

  // Get today's date string in YYYY-MM-DD format
  const getTodayDateString = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  // Check if QR code has already been scanned today
  const hasScannedCodeToday = (code) => {
    return scannedCodes.includes(code);
  };

  // ===== Effects =====
  
  // Initialize date/time and custom styling
  useEffect(() => {
    // Initialize and update the clock and date
    const updateDateTime = () => {
      const now = new Date();
      
      // Update time
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
      
      // Update Gregorian date
      const gregorianDate = formatDate(now);
      
      // Update Hijri date
      const hijriDate = calculateHijriDate(now);
      
      setCurrentDate({
        gregorian: gregorianDate,
        hijri: hijriDate.formatted,
        hijriDay: hijriDate.day,
        hijriMonth: hijriDate.month,
        hijriYear: hijriDate.year
      });

      // Check valid hours
      checkValidHours();

      // Reset scan count if it's after Sunday 16:00
      if (now.getDay() === 0 && (now.getHours() > 16 || (now.getHours() === 16 && now.getMinutes() > 0))) {
        setScanCount(0);
        setWeekendScanStatus(null);
      }
      
      // Reset scan count if it's before Saturday 16:00
      if (now.getDay() === 6 && now.getHours() < 16) {
        setScanCount(0);
        setWeekendScanStatus(null);
      }

      // Determine attendance type based on time
      if (now.getHours() < 12) {
        setAttendanceType('masuk');
      } else {
        setAttendanceType('keluar');
      }
    };

    // Update immediately and then every second
    updateDateTime();
    const clockInterval = setInterval(updateDateTime, 1000);
    
    // Add custom CSS to improve the scanner UI
    const style = document.createElement('style');
    style.textContent = `
      #qr-reader {
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        background: #f8fafc;
        max-width: 100%;
        margin: 0 auto;
      }
      
      #qr-reader__scan_region {
        background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
        padding: 20px;
      }
      
      #qr-reader__dashboard {
        padding: 16px;
        background: white;
      }
      
      #qr-reader__camera_selection {
        margin: 10px 0;
        padding: 10px;
        border: none;
        background-color: #f1f5f9;
        border-radius: 8px;
        width: 100%;
        color: #475569;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      #qr-reader__camera_permission_button, #qr-reader__filescan_input {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        border: none;
        padding: 12px 16px;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        width: 100%;
        margin: 8px 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      #qr-reader__camera_permission_button:hover, #qr-reader__filescan_input:hover {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
      }
      
      #qr-reader__camera_permission_button:before {
        content: '📷 ';
        margin-right: 8px;
      }
      
      #qr-reader__filescan_input:before {
        content: '🖼️ ';
        margin-right: 8px;
      }
      
      .scan-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(59, 130, 246, 0.1);
        border-radius: 12px;
        pointer-events: none;
        z-index: 10;
      }
      
      .scan-corner {
        position: absolute;
        width: 20px;
        height: 20px;
        border-color: #3b82f6;
        border-width: 4px;
        z-index: 11;
      }
      
      .scan-corner-tl {
        top: 20px;
        left: 20px;
        border-left-style: solid;
        border-top-style: solid;
        border-right-style: none;
        border-bottom-style: none;
      }
      
      .scan-corner-tr {
        top: 20px;
        right: 20px;
        border-right-style: solid;
        border-top-style: solid;
        border-left-style: none;
        border-bottom-style: none;
      }
      
      .scan-corner-bl {
        bottom: 20px;
        left: 20px;
        border-left-style: solid;
        border-bottom-style: solid;
        border-right-style: none;
        border-top-style: none;
      }
      
      .scan-corner-br {
        bottom: 20px;
        right: 20px;
        border-right-style: solid;
        border-bottom-style: solid;
        border-left-style: none;
        border-top-style: none;
      }
      
      .scan-line {
        position: absolute;
        width: calc(100% - 80px);
        height: 2px;
        background: linear-gradient(90deg, transparent, #3b82f6, transparent);
        top: 50%;
        left: 40px;
        animation: scan 2s linear infinite;
        z-index: 11;
      }
      
      @keyframes scan {
        0% {
          transform: translateY(-100px);
        }
        50% {
          transform: translateY(100px);
        }
        100% {
          transform: translateY(-100px);
        }
      }
    `;
    document.head.appendChild(style);

    // Load weekend scan history from localStorage
    const savedHistory = localStorage.getItem('weekendScanHistory');
    if (savedHistory) {
      setWeekendScanHistory(JSON.parse(savedHistory));
    }

    // Load today's scans from localStorage
    const savedTodayScans = localStorage.getItem('todayScans');
    if (savedTodayScans) {
      setTodayScans(JSON.parse(savedTodayScans));
    }

    // Load scanned codes from localStorage
    const savedScannedCodes = localStorage.getItem('scannedCodes');
    if (savedScannedCodes) {
      setScannedCodes(JSON.parse(savedScannedCodes));
    }

    // Fetch initial attendance history
    fetchAttendanceHistory();

    // Clean up scanner and clock interval on component unmount
    return () => {
      clearInterval(clockInterval);
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
          scannerRef.current = null;
        } catch (error) {
          console.error("Error cleaning up scanner:", error);
        }
      }
      document.head.removeChild(style);
    };
  }, []);

  // Save weekend scan history to localStorage when it changes
  useEffect(() => {
    if (weekendScanHistory.length > 0) {
      localStorage.setItem('weekendScanHistory', JSON.stringify(weekendScanHistory));
    }
  }, [weekendScanHistory]);

  // Save today's scans to localStorage when it changes
  useEffect(() => {
    if (todayScans.length > 0) {
      localStorage.setItem('todayScans', JSON.stringify(todayScans));
    }
  }, [todayScans]);

  // Save scanned codes to localStorage when it changes
  useEffect(() => {
    if (scannedCodes.length > 0) {
      localStorage.setItem('scannedCodes', JSON.stringify(scannedCodes));
    }
  }, [scannedCodes]);

  // Handle auto attendance on Sunday after 16:00 if not scanned
  useEffect(() => {
    if (autoAttendance) {
      const submitAutoAttendance = async () => {
        try {
          const now = new Date();
          const payload = {
            qrcode_text: 'AUTO_ATTENDANCE',
            jenis: 'keluar', // Default to 'keluar' for auto attendance
            keterangan: 'presensi otomatis',
            status: 'hadir',
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
              message: "Presensi otomatis berhasil dicatat",
            });
            toast.success("Presensi otomatis berhasil dicatat");
            fetchAttendanceHistory();
          } else {
            setScanResult({
              success: false,
              message: data.message || 'Gagal mencatat presensi otomatis',
            });
            toast.error(data.message || `Gagal mencatat presensi otomatis`);
          }
        } catch (error) {
          console.error('Error submitting auto attendance:', error);
          setScanResult({
            success: false,
            message: `Error: ${error.message}`,
          });
          toast.error(`Error: ${error.message}`);
        }
      };

      submitAutoAttendance();
      setAutoAttendance(false);
    }
  }, [autoAttendance]);

  // ===== QR Scanner Functions =====
  
  // Handle successful QR scan
  const onScanSuccess = (decodedText) => {
    if (isOutsideValidHours) {
      toast.error("Tidak dapat melakukan scan di luar waktu yang ditentukan");
      stopScanner();
      return;
    }

    // Check if this QR code has already been scanned today
    if (hasScannedCodeToday(decodedText)) {
      toast.error("QR code ini sudah discan hari ini");
      stopScanner();
      return;
    }

    setScannedCode(decodedText);
    stopScanner();
    
    const now = new Date();
    const today = getTodayDateString();
    
    // Add to today's scans
    const newScan = {
      date: today,
      timestamp: now.getTime(),
      type: attendanceType
    };
    
    setTodayScans(prev => [...prev, newScan]);
    
    // Add to scanned codes
    setScannedCodes(prev => [...prev, decodedText]);
    
    // Set attendance status based on time
    if (now.getHours() < 12) {
      setAttendanceType('masuk');
      setAttendanceStatus('hadir');
    } else {
      setAttendanceType('keluar');
      setAttendanceStatus('hadir');
    }
  };

  // Stop QR scanner
  const stopScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
      scannerRef.current = null;
      setScanning(false);
    }
  };

  // Start QR scanner
  const startScanner = () => {
    if (isOutsideValidHours) {
      toast.error("Fitur scan hanya tersedia pada Sabtu pukul 16.00 hingga Ahad pukul 16.00");
      return;
    }

    setScannedCode(null);
    setScanResult(null);
    setShowLateForm(false);
    setShowPermissionForm(false);
    setShowKeteranganForm(false);
    setLateReason('');
    setPermissionReason('');
    setKeterangan(null);
    setScanning(true);

    // Short delay to ensure DOM is fully ready
    setTimeout(() => {
      const qrReaderElement = document.getElementById("qr-reader");
      
      if (!qrReaderElement) {
        console.error("QR reader element not found");
        setScanning(false);
        toast.error("Gagal memulai scanner. Silakan coba lagi.");
        return;
      }
      
      // Clear any existing content in the QR reader element
      qrReaderElement.innerHTML = '';
      
      // Add a loading animation while scanner initializes
      const loadingDiv = document.createElement('div');
      loadingDiv.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px;">
          <div style="width: 48px; height: 48px; border: 4px solid #dbeafe; border-top-color: #3b82f6; border-radius: 50%; animation: qr-spinner 1s linear infinite;"></div>
          <p style="margin-top: 16px; color: #1e40af; font-weight: 500;">Menyiapkan kamera...</p>
        </div>
        <style>
          @keyframes qr-spinner {
            to {transform: rotate(360deg);}
          }
        </style>
      `;
      qrReaderElement.appendChild(loadingDiv);

      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (error) {
          console.error("Error clearing existing scanner:", error);
        }
      }

      try {
        // Use the Html5QrcodeScanner with enhanced settings
        scannerRef.current = new Html5QrcodeScanner(
          "qr-reader", 
          { 
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
            showTorchButtonIfSupported: true,
            aspectRatio: 1.0
          }, 
          /* verbose= */ false
        );
        
        // Render the scanner and set up the callbacks
        scannerRef.current.render(onScanSuccess, (err) => {
          console.warn("QR scan error:", err);
        });
        
        // Add scan animation overlay after scanner is initialized
        setTimeout(() => {
          const scanRegion = document.getElementById("qr-reader__scan_region");
          if (scanRegion) {
            // Create overlay container
            const overlayDiv = document.createElement('div');
            overlayDiv.className = 'scan-overlay';
            
            // Create corner markers
            const cornerTL = document.createElement('div');
            cornerTL.className = 'scan-corner scan-corner-tl';
            
            const cornerTR = document.createElement('div');
            cornerTR.className = 'scan-corner scan-corner-tr';
            
            const cornerBL = document.createElement('div');
            cornerBL.className = 'scan-corner scan-corner-bl';
            
            const cornerBR = document.createElement('div');
            cornerBR.className = 'scan-corner scan-corner-br';
            
            // Create scanning line animation
            const scanLine = document.createElement('div');
            scanLine.className = 'scan-line';
            
            // Append all elements
            overlayDiv.appendChild(cornerTL);
            overlayDiv.appendChild(cornerTR);
            overlayDiv.appendChild(cornerBL);
            overlayDiv.appendChild(cornerBR);
            overlayDiv.appendChild(scanLine);
            
            scanRegion.appendChild(overlayDiv);
            
            // Modify the header text to make it more attractive
            const header = document.querySelector("#qr-reader__header");
            if (header) {
              header.innerHTML = '<div style="font-weight: 600; color: #1e40af; text-align: center; padding: 10px;">📱 Arahkan Kamera ke QR Code</div>';
            }
            
            // Enhance camera selection dropdown if it exists
            const cameraSelection = document.getElementById("qr-reader__camera_selection");
            if (cameraSelection) {
              cameraSelection.style.appearance = "none";
              cameraSelection.style.backgroundImage = "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e\")";
              cameraSelection.style.backgroundRepeat = "no-repeat";
              cameraSelection.style.backgroundPosition = "right 10px center";
              cameraSelection.style.backgroundSize = "20px";
              cameraSelection.style.paddingRight = "40px";
            }
            
            // Find and modify file selection button if it exists
            const fileButton = document.getElementById("qr-reader__filescan_input");
            if (fileButton) {
              fileButton.innerHTML = '🖼️ Pilih Gambar QR Code';
              fileButton.style.display = "flex";
              fileButton.style.alignItems = "center";
              fileButton.style.justifyContent = "center";
            }
          }
        }, 1000);
        
        // Modify UI elements to force camera-only mode
        setTimeout(() => {
          // Try to hide file selection elements
          const fileSelectionElements = document.querySelectorAll('[id*="file"], [class*="file"], input[type="file"]');
          fileSelectionElements.forEach(element => {
            if (element) {
              element.style.display = "none";
            }
          });
          
          // Auto-click the camera permission button if it exists
          const cameraButton = document.getElementById("qr-reader__camera_permission_button");
          if (cameraButton) {
            cameraButton.click();
          }
          
          // Focus on camera scanning interface
          const scanRegion = document.getElementById("qr-reader__scan_region");
          if (scanRegion) {
            scanRegion.style.display = "block";
          }
        }, 500);
        
      } catch (error) {
        console.error("Error initializing QR scanner:", error);
        setScanning(false);
        toast.error("Gagal memulai scanner. Silakan coba lagi.");
      }
    }, 300);
  };

  // ===== API Interaction =====
  
  // Submit attendance data to server
  const submitAttendance = async (qrcodeText) => {
    if (!qrcodeText) return;

    setSubmitting(true);
    setScanResult(null);

    try {
      const now = new Date();
      let keteranganText = '';
      let jenis = attendanceType;

      // Determine jenis and keterangan based on different conditions
      if (keterangan === 'izin' || keterangan === 'sakit') {
        jenis = 'izin';
        keteranganText = `izin karena ${keterangan}`;
      } else if (attendanceStatus === 'terlambat') {
        keteranganText = `terlambat: ${lateReason}`;
      } else if (attendanceStatus === 'ijin pulang') {
        keteranganText = `ijin pulang: ${permissionReason}`;
      } else if (attendanceType === 'masuk') {
        keteranganText = 'hadir tepat waktu';
      } else {
        keteranganText = 'pulang setelah kegiatan';
      }

      const payload = {
        qrcode_text: qrcodeText,
        jenis: jenis,
        keterangan: keteranganText,
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
          message: data.message,
          status: attendanceStatus,
          lateReason: lateReason,
          permissionReason: permissionReason
        });
        toast.success(`${data.message}`);
        
        // Fetch updated attendance history after successful submission
        fetchAttendanceHistory();
      } else {
        setScanResult({
          success: false,
          message: data.message || 'Gagal mencatat presensi',
        });
        toast.error(data.message || `Gagal mencatat presensi`);
      }
    } catch (error) {
      console.error('Error submitting attendance:', error);
      setScanResult({
        success: false,
        message: `Error: ${error.message}`,
      });
      toast.error(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch attendance history from server
  const fetchAttendanceHistory = async () => {
    try {
      // In a real app, you would get the user_id from authentication
      const user_id = 20; // Example user ID
      const response = await fetch(`${API_URL}/users/get-presensi?user_id=${user_id}`);
      
      if (response.ok) {
        const data = await response.json();
        setAttendanceHistory(data.data || []);
      } else {
        console.error('Failed to fetch attendance history');
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    }
  };

  // Handle permission submission
  const handlePermissionSubmit = () => {
    if (!permissionReason) {
      toast.error('Harap masukkan alasan ijin');
      return;
    }
    submitAttendance(scannedCode);
  };

  // Reset form to scan again
  const resetForm = () => {
    setScannedCode(null);
    setScanResult(null);
    setShowLateForm(false);
    setShowPermissionForm(false);
    setShowKeteranganForm(false);
    setLateReason('');
    setPermissionReason('');
    setKeterangan(null);
    startScanner();
  };

  // ===== Component Render =====
  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <Toaster position="top-center" />
      
      {/* Date and Time Display */}
      <div className="mb-6 text-center bg-gradient-to-r from-blue-600 to-blue-900 text-white py-5 px-4 rounded-xl shadow-lg">
        {/* Hijri Date */}
        <div className="mb-2">
          <div className="text-2xl font-bold tracking-wide">
            {currentDate.hijriDay} {HIJRI_MONTHS[currentDate.hijriMonth]} {currentDate.hijriYear} H
          </div>
        </div>
        
        {/* Gregorian Date */}
        <div className="mb-3">
          <div className="text-lg opacity-90">{currentDate.gregorian}</div>
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
        {/* Warning for invalid days/hours */}
        {isOutsideValidHours && (
          <div className="p-6 text-center bg-red-50 border-b border-red-100">
            <div className="flex items-center justify-center text-red-600 mb-3">
              <AlertCircle size={24} className="mr-2" />
              <span className="font-medium">Fitur scan tidak tersedia</span>
            </div>
            <p className="text-sm text-red-500">
              Fitur ini hanya tersedia pada Sabtu pukul 16.00 hingga Ahad pukul 16.00.
            </p>
          </div>
        )}

        {/* Initial Button State */}
        {!scanning && !scannedCode && !scanResult && (
          <div className="p-6 text-center">
            <button
              onClick={startScanner}
              disabled={isOutsideValidHours}
              className={`bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-4 rounded-lg hover:shadow-lg hover:scale-105 transform transition-all duration-200 flex items-center mx-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                isOutsideValidHours ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Camera size={24} className="mr-3" />
              <span className="text-lg font-medium">Bismillah Scan QR Code</span>
            </button>
            <p className="mt-3 text-sm text-gray-500">
              {isOutsideValidHours 
                ? "Scan hanya tersedia pada waktu yang ditentukan" 
                : "Klik tombol di atas untuk membuka kamera"}
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

        {/* Scanned Code Display (Processing) */}
        {scannedCode && !scanResult && !showLateForm && !showPermissionForm && !showKeteranganForm && (
          <div className="p-6">
            <div className="text-center mb-6">
              {submitting ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="relative">
                    <RefreshCw size={56} className="animate-spin text-blue-500" />
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                      <div className="h-10 w-10 rounded-full bg-white"></div>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 text-xl font-bold">✓</span>
                      </div>
                    </div>
                  </div>
                  <span className="mt-4 text-lg font-medium text-gray-700">Memproses Kehadiran...</span>
                  <span className="text-sm text-gray-500 mt-2">Mohon tunggu sebentar</span>
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
                  
                  {/* Keterangan Button (only during implementation hours) */}
                  {(isSaturday() && currentTime >= "17:00:00") || 
                   (isSunday() && currentTime < "16:00:00") ? (
                    <div className="mt-6">
                      <button
                        onClick={() => setShowKeteranganForm(true)}
                        className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                      >
                        Tambah Keterangan (Izin/Sakit)
                      </button>
                    </div>
                  ) : null}
                  
                  <div className="mt-6">
                    <button
                      onClick={() => submitAttendance(scannedCode)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      {submitting ? 'Mengirim...' : 'Submit Presensi'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Keterangan Form */}
        {showKeteranganForm && (
          <div className="p-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium mb-4">Pilih Keterangan</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  onClick={() => setKeterangan('izin')}
                  className={`py-3 rounded-lg border ${keterangan === 'izin' ? 
                    'bg-blue-100 border-blue-500 text-blue-700' : 
                    'bg-gray-50 border-gray-300 text-gray-700'}`}
                >
                  Izin
                </button>
                <button
                  onClick={() => setKeterangan('sakit')}
                  className={`py-3 rounded-lg border ${keterangan === 'sakit' ? 
                    'bg-red-100 border-red-500 text-red-700' : 
                    'bg-gray-50 border-gray-300 text-gray-700'}`}
                >
                  Sakit
                </button>
              </div>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setShowKeteranganForm(false);
                    setKeterangan(null);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    setShowKeteranganForm(false);
                    if (!keterangan) {
                      toast.error('Harap pilih keterangan');
                      return;
                    }
                    submitAttendance(scannedCode);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Late Form */}
        {showLateForm && (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <Clock size={52} className="text-yellow-500" />
              </div>
              <h3 className="text-xl font-medium mt-4 text-yellow-700">Anda Terlambat</h3>
              <p className="text-yellow-600 mt-2">Silakan berikan alasan keterlambatan Anda</p>
              
              <div className="mt-4">
                <textarea
                  value={lateReason}
                  onChange={(e) => setLateReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan alasan terlambat..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowLateForm(false);
                    setAttendanceStatus('hadir');
                    submitAttendance(scannedCode);
                  }}
                  className="px-5 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200"
                >
                  Tetap Hadir
                </button>
                <button
                  onClick={handleLateSubmit}
                  className="px-5 py-3 bg-gradient-to-r from-yellow-600 to-yellow-800 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Simpan Keterlambatan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Permission Form */}
        {showPermissionForm && (
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                <Calendar size={52} className="text-purple-500" />
              </div>
              <h3 className="text-xl font-medium mt-4 text-purple-700">Ijin Pulang</h3>
              <p className="text-purple-600 mt-2">Silakan berikan alasan ijin pulang Anda</p>
              
              <div className="mt-4">
                <textarea
                  value={permissionReason}
                  onChange={(e) => setPermissionReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Masukkan alasan ijin pulang..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowPermissionForm(false);
                    setAttendanceStatus('hadir');
                    submitAttendance(scannedCode);
                  }}
                  className="px-5 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200"
                >
                  Tetap Hadir
                </button>
                <button
                  onClick={handlePermissionSubmit}
                  className="px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:shadow-lg transition-all duration-200"
                >
                  Simpan Ijin Pulang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scan Result Display */}
        {scanResult && (
          <div className="p-6">
            <div className="text-center mb-6">
              {scanResult.success ? (
                <div className="relative">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle size={52} className="text-green-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center border-2 border-white animate-bounce">
                    ✓
                  </div>
                </div>
              ) : (
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <XCircle size={52} className="text-red-500" />
                </div>
              )}
              <h3 className={`text-xl font-medium mt-4 ${scanResult.success ? 'text-green-700' : 'text-red-700'}`}>
                {scanResult.success ? 'Alhamdulillah, Berhasil!' : 'Maaf, Gagal!'}
              </h3>
              <div className={`mt-3 p-4 ${scanResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'} rounded-lg mx-auto max-w-sm`}>
                <p className="text-sm">{scanResult.message}</p>
                {keterangan && (
                  <p className="mt-2 text-sm">Keterangan: {keterangan === 'izin' ? 'Izin' : 'Sakit'}</p>
                )}
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
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 rounded-full w-6 h-6 mr-2 flex-shrink-0 font-medium">1</span>
            <span>Klik tombol "Bismillah Scan QR Code"</span>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 rounded-full w-6 h-6 mr-2 flex-shrink-0 font-medium">2</span>
            <span>Izinkan aplikasi mengakses kamera</span>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 rounded-full w-6 h-6 mr-2 flex-shrink-0 font-medium">3</span>
            <span>Arahkan kamera ke QR code</span>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 rounded-full w-6 h-6 mr-2 flex-shrink-0 font-medium">4</span>
            <span>Tunggu hingga QR code terdeteksi</span>
          </li>
          <li className="flex items-start">
            <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 rounded-full w-6 h-6 mr-2 flex-shrink-0 font-medium">5</span>
            <span>Presensi akan dicatat secara otomatis</span>
          </li>
        </ol>
      </div>
    </div>
  );
}