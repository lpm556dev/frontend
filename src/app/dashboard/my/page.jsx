"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import useAuthStore from '../../../stores/authStore';
import MutabaahReport from '../../../components/my/MutabaahReport';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir",
  "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
  "Ramadhan", "Syawal", "Dzulka'dah", "Dzulhijjah"
];

const DEFAULT_FORM_DATA = {
  date: new Date().toISOString().split('T')[0],
  sholat_wajib: 0,
  sholat_tahajud: false,
  sholat_dhuha: 0,
  sholat_rawatib: 0,
  sholat_sunnah_lainnya: 0,
  tilawah_quran: false,
  terjemah_quran: false,
  shaum_sunnah: false,
  shodaqoh: false,
  dzikir_pagi_petang: false,
  istighfar_1000x: 0,
  istighfar_completed: false,
  sholawat_100x: 0,
  sholawat_completed: false,
  menyimak_mq_pagi: false,
  kajian_al_hikam: false,  // New field for Thursday
  kajian_marifatullah: false,  // New field for Thursday
  haid: false
};

export default function MutabaahYaumiyahPage() {
  const router = useRouter();
  const { user, userId } = useAuthStore();
  
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [hijriDate, setHijriDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [headerBgColor, setHeaderBgColor] = useState('bg-green-600');
  const [showReportModal, setShowReportModal] = useState(false);
  const [isThursday, setIsThursday] = useState(false);
  const [isUserFemale, setIsUserFemale] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [dateOptions, setDateOptions] = useState([]);
  const [formData, setFormData] = useState({...DEFAULT_FORM_DATA});

  const calculateHijriDate = (gregorianDate) => {
    try {
      const date = new Date(gregorianDate);
      
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      let hDay = 1;
      let hMonthIndex = 10;
      const hYear = 1446;
      
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
        day: 6, 
        month: 10, 
        year: 1446, 
        formatted: "6 Dzulka'dah 1446 H" 
      };
    }
  };

  const getHijriDate = (date) => {
    try {
      return calculateHijriDate(date).formatted;
    } catch (error) {
      console.error('Error getting Hijri date:', error);
      return "1 Muharram 1446 H";
    }
  };

  const formatHijriDate = (hijriString) => {
    if (!hijriString) return '';
    return hijriString;
  };

  const formatDate = (date) => {
    if (!date) return '';
    try {
      const dayNames = {
        0: 'Ahad',
        1: 'Senin', 
        2: 'Selasa', 
        3: 'Rabu', 
        4: 'Kamis', 
        5: 'Jumat', 
        6: 'Sabtu'
      };
      
      const dayOfWeek = date.getDay();
      const day = String(date.getDate()).padStart(2, '0');
      const month = date.toLocaleDateString('id-ID', { month: 'long' });
      const year = date.getFullYear();
      
      return `${dayNames[dayOfWeek]}, ${day} ${month} ${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    try {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  const isToday = (dateString) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      return dateString === today;
    } catch (error) {
      console.error('Error checking if date is today:', error);
      return false;
    }
  };

  const isYesterday = (dateString) => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayFormatted = yesterday.toISOString().split('T')[0];
      return dateString === yesterdayFormatted;
    } catch (error) {
      console.error('Error checking if date is yesterday:', error);
      return false;
    }
  };

  const calculateDaysDifference = (dateString) => {
    try {
      const today = new Date();
      const todayFormatted = today.toISOString().split('T')[0];
      
      if (dateString === todayFormatted) {
        return 0;
      }
      
      if (isYesterday(dateString)) {
        return -1;
      }
      
      const selected = new Date(dateString + 'T12:00:00');
      const todayNoon = new Date(todayFormatted + 'T12:00:00');
      
      const diffTime = selected.getTime() - todayNoon.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch (error) {
      console.error('Error calculating days difference:', error);
      return 0;
    }
  };

  const updateHijriDate = (date) => {
    try {
      const hijri = getHijriDate(date);
      setHijriDate(hijri);
    } catch (error) {
      console.error('Failed to update Hijri date:', error);
      setHijriDate("");
    }
  };

  const updateHeaderBgColor = (dateString) => {
    if (formData.haid) {
      setHeaderBgColor('bg-red-600');
      return;
    }
    
    if (isToday(dateString)) {
      setHeaderBgColor('bg-green-600');
      return;
    }
    
    if (isYesterday(dateString)) {
      setHeaderBgColor('bg-orange-500');
      return;
    }
    
    const daysDiff = calculateDaysDifference(dateString);
    
    if (daysDiff > 0) {
      setHeaderBgColor('bg-green-600');
    } else if (daysDiff === -2) {
      setHeaderBgColor('bg-orange-500');
    } else {
      setHeaderBgColor('bg-amber-700');
    }
  };

  const formatDateForDisplay = (date) => {
    try {
      const dayNames = {
        0: 'Ahad',
        1: 'Senin',
        2: 'Selasa',
        3: 'Rabu',
        4: 'Kamis',
        5: 'Jumat',
        6: 'Sabtu'
      };
      
      const day = date.getDate();
      const month = date.toLocaleDateString('id-ID', { month: 'long' });
      const year = date.getFullYear();
      const dayOfWeek = date.getDay();
      
      return `${dayNames[dayOfWeek]}, ${day} ${month} ${year}`;
    } catch (error) {
      console.error('Error formatting date for display:', error);
      return String(date);
    }
  };

  const getSelectedDateInfo = () => {
    try {
      const dayName = selectedDateTime ? formatDate(selectedDateTime).split(',')[0] : '';
      const fullDate = selectedDateTime ? formatDate(selectedDateTime) : '';
      return { dayName, fullDate };
    } catch (error) {
      console.error('Error getting selected date info:', error);
      return { dayName: '', fullDate: '' };
    }
  };

  const getStatusText = () => {
    if (isToday(selectedDate)) {
      return "Tepat Waktu";
    }
    
    if (isYesterday(selectedDate)) {
      return "Terlambat 1 hari";
    }
    
    const daysDiff = calculateDaysDifference(selectedDate);
    
    if (daysDiff > 0) {
      return `${daysDiff} hari ke depan`;
    }
    
    const lateDays = Math.abs(daysDiff);
    return `Terlambat ${lateDays} hari`;
  };
  
  const getStatusBadgeClass = () => {
    if (formData.haid) {
      return 'bg-red-600/40 border-red-300';
    }
    
    if (isToday(selectedDate)) {
      return 'bg-green-600/40 border-green-300';
    }
    
    if (calculateDaysDifference(selectedDate) < 0) {
      if (headerBgColor === 'bg-orange-500') {
        return 'bg-orange-500/40 border-orange-300';
      } else if (headerBgColor === 'bg-amber-700') {
        return 'bg-amber-700/40 border-amber-300';
      }
    }
    
    return 'bg-green-600/40 border-green-300';
  };

  const handleDateChange = (e) => {
    try {
      const newDate = e.target.value;
      setSelectedDate(newDate);
      setFormData(prev => ({ ...prev, date: newDate }));
      
      const selectedDate = new Date(newDate);
      if (!isNaN(selectedDate.getTime())) {
        setSelectedDateTime(selectedDate);
        const hijriResult = calculateHijriDate(selectedDate);
        setHijriDate(hijriResult.formatted);
        
        // Check if selected date is Thursday (day 4)
        setIsThursday(selectedDate.getDay() === 4);
      }
      
      updateHeaderBgColor(newDate);
      checkExistingData(newDate);
    } catch (error) {
      console.error('Error handling date change:', error);
      toast.error('Terjadi kesalahan saat mengubah tanggal');
    }
  };

  const handleInputChange = (field, value, isCheckbox = false) => {
    try {
      if (field === 'haid') {
        const newValue = value;
        const updatedFormData = {
          ...formData,
          haid: newValue,
          ...(newValue ? {
            sholat_wajib: 0,
            sholat_tahajud: false,
            sholat_dhuha: 0,
            sholat_rawatib: 0,
            sholat_sunnah_lainnya: 0,
            shaum_sunnah: false 
          } : {
            shaum_sunnah: false 
          })
        };
        
        setFormData(updatedFormData);
        
        if (newValue) {
          setHeaderBgColor('bg-red-600');
        } else {
          updateHeaderBgColor(formData.date);
        }
      } 
      else if (isCheckbox && (field === 'istighfar_completed' || field === 'sholawat_completed')) {
        setFormData(prev => ({
          ...prev,
          [field]: value,
          [field === 'istighfar_completed' ? 'istighfar_1000x' : 'sholawat_100x']: 
            value ? (field === 'istighfar_completed' ? 1000 : 100) : 0
        }));
      } 
      else if (field === 'istighfar_1000x' || field === 'sholawat_100x') {
        const numValue = Math.max(0, parseInt(value) || 0);
        const maxValue = field === 'istighfar_1000x' ? 1000 : 100;
        
        setFormData(prev => ({
          ...prev,
          [field]: Math.min(numValue, maxValue),
          [field === 'istighfar_1000x' ? 'istighfar_completed' : 'sholawat_completed']: 
            numValue >= maxValue
        }));
      }
      else if (['sholat_tahajud', 'tilawah_quran', 'terjemah_quran', 'shaum_sunnah', 
                'shodaqoh', 'dzikir_pagi_petang', 'menyimak_mq_pagi', 
                'kajian_al_hikam', 'kajian_marifatullah'].includes(field)) {
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
      } else {
        const numValue = Math.max(0, parseInt(value) || 0);
        setFormData(prev => ({
          ...prev,
          [field]: numValue
        }));
      }
    } catch (error) {
      console.error('Error handling input change:', error);
    }
  };

  const checkExistingData = async (date) => {
    try {
      const storageKey = `mutabaah_${user?.userId}_${date}`;
      const localData = localStorage.getItem(storageKey);
      
      if (localData) {
        try {
          const parsedData = JSON.parse(localData);
          
          const convertedData = {
            ...parsedData,
            sholat_tahajud: parsedData.sholat_tahajud ? true : parsedData.sholat_tahajud === 0 ? false : Boolean(parsedData.sholat_tahajud),
            tilawah_quran: parsedData.tilawah_quran ? true : parsedData.tilawah_quran === 0 ? false : Boolean(parsedData.tilawah_quran),
            terjemah_quran: parsedData.terjemah_quran ? true : parsedData.terjemah_quran === 0 ? false : Boolean(parsedData.terjemah_quran),
            shaum_sunnah: parsedData.shaum_sunnah ? true : parsedData.shaum_sunnah === 0 ? false : Boolean(parsedData.shaum_sunnah),
            shodaqoh: parsedData.shodaqoh ? true : parsedData.shodaqoh === 0 ? false : Boolean(parsedData.shodaqoh),
            dzikir_pagi_petang: parsedData.dzikir_pagi_petang ? true : parsedData.dzikir_pagi_petang === 0 ? false : Boolean(parsedData.dzikir_pagi_petang), 
            menyimak_mq_pagi: parsedData.menyimak_mq_pagi ? true : parsedData.menyimak_mq_pagi === 0 ? false : Boolean(parsedData.menyimak_mq_pagi),
            kajian_al_hikam: parsedData.kajian_al_hikam ? true : parsedData.kajian_al_hikam === 0 ? false : Boolean(parsedData.kajian_al_hikam),
            kajian_marifatullah: parsedData.kajian_marifatullah ? true : parsedData.kajian_marifatullah === 0 ? false : Boolean(parsedData.kajian_marifatullah),
            istighfar_completed: parsedData.istighfar_completed || false,
            sholawat_completed: parsedData.sholawat_completed || false
          };
          
          setFormData(convertedData);
          toast.info('Data ditemukan dari penyimpanan lokal');
          return;
        } catch (parseError) {
          console.error('Error parsing local data:', parseError);
        }
      }
      
      setFormData({
        ...DEFAULT_FORM_DATA,
        date: date
      });
      
    } catch (error) {
      console.error('Error checking existing data:', error);
      setFormData({
        ...DEFAULT_FORM_DATA,
        date: date
      });
    }
  };

  const handleRouteBack = () => {
    router.back(); // Menggunakan router.back() untuk kembali ke halaman sebelumnya
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const storageKey = `mutabaah_${user?.userId}_${formData.date}`;
      localStorage.setItem(storageKey, JSON.stringify(formData));
      
      try {
        const response = await fetch(`${API_URL}/users/input-my`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user?.userId, ...formData }),
          credentials: 'include',
        });

        const responseText = await response.text();
        let result = {};
        
        if (responseText) {
          try {
            result = JSON.parse(responseText);
          } catch (jsonError) {
            console.error("Failed to parse JSON:", jsonError);
          }
        }
        
        if (!response.ok) {
          let errorMessage = 'Terjadi kesalahan server. Silakan coba lagi nanti.';
          
          if (result && typeof result === 'object') {
            errorMessage = result.message || result.error || errorMessage;
          }
          
          if (responseText.includes('ECONNREFUSED') || response.status === 500) {
            toast.success('Data telah disimpan di browser Anda. Server database sedang tidak tersedia.');
            router.push('/dashboard');
            return;
          }
          
          throw new Error(errorMessage);
        }
        
        toast.success(result.message || 'Data Mutabaah Yaumiyah berhasil disimpan!');
        router.push('/dashboard');
        
      } catch (apiError) {
        if (apiError.message.includes('Failed to fetch')) {
          toast.warning('Server tidak tersedia. Data telah disimpan sementara di browser Anda.');
          router.push('/dashboard');
          return;
        }
        toast.error(apiError.message || 'Gagal menyimpan data. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateReport = () => {
    setShowReportModal(true);
  };

  useEffect(() => {
    const generateDateOptions = () => {
      try {
        const options = [];
        const currentDate = new Date();
        const todayString = currentDate.toISOString().split('T')[0];
        
        options.push({
          value: todayString,
          label: formatDateForDisplay(currentDate)
        });
        
        for (let i = 1; i <= 7; i++) {
          const pastDate = new Date();
          pastDate.setDate(currentDate.getDate() - i);
          options.push({
            value: pastDate.toISOString().split('T')[0],
            label: formatDateForDisplay(pastDate)
          });
        }
        
        options.sort((a, b) => new Date(b.value) - new Date(a.value));
        
        return options;
      } catch (error) {
        console.error('Error generating date options:', error);
        return [];
      }
    };
    
    setDateOptions(generateDateOptions());
    
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    setSelectedDate(todayString);
    setFormData(prev => ({ ...prev, date: todayString }));
    setSelectedDateTime(today);
    
    // Check if today is Thursday
    setIsThursday(today.getDay() === 4);
    
    // Check if user is female (gender = 0)
    if (user && user.gender === "0") {
      setIsUserFemale(true);
    }
    
    updateHijriDate(today);
  }, [user]);

  useEffect(() => {
    updateHeaderBgColor(formData.date);
  }, [formData.haid, formData.date]);

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        setCurrentDateTime(now);
        
        const currentDay = now.getDate();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const prevDate = currentDateTime;
        const prevDay = prevDate ? prevDate.getDate() : -1;
        const prevMonth = prevDate ? prevDate.getMonth() : -1;
        const prevYear = prevDate ? prevDate.getFullYear() : -1;
        
        if (currentDay !== prevDay || currentMonth !== prevMonth || currentYear !== prevYear) {
          console.log('Day changed, updating Hijri date');
          updateHijriDate(now);
        }
        
        const todayString = now.toISOString().split('T')[0];
        
        if (selectedDate !== todayString && isToday(formData.date)) {
          setSelectedDate(todayString);
          setFormData(prev => ({ ...prev, date: todayString }));
          setSelectedDateTime(now);
          updateHijriDate(now);
        }
        
        if (!formData.haid) {
          updateHeaderBgColor(formData.date);
        }
      } catch (error) {
        console.error('Error updating time:', error);
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [currentDateTime, selectedDate, formData.haid, formData.date]);

  useEffect(() => {
    try {
      const newSelectedDate = new Date(formData.date);
      if (!isNaN(newSelectedDate.getTime())) {
        setSelectedDateTime(newSelectedDate);
        updateHijriDate(newSelectedDate);
        
        // Check if selected date is Thursday (day 4)
        setIsThursday(newSelectedDate.getDay() === 4);
      }
    } catch (error) {
      console.error('Error updating selected date:', error);
    }
  }, [formData.date]);

  const sholatSection = [
    { label: "Sholat Wajib 5 waktu", field: "sholat_wajib", max: 5, type: "number" },
    { label: "Sholat Tahajud & atau Witir 3 rakaat/hari", field: "sholat_tahajud", type: "checkbox" },
    { label: "Sholat Dhuha 4 rakaat", field: "sholat_dhuha", max: 12, type: "number" },
    { label: "Sholat Rawatib 10 rakaat", field: "sholat_rawatib", max: 12, type: "number" },
    { label: "Sholat Sunnah Lainnya 6 rakaat", field: "sholat_sunnah_lainnya", max: 12, type: "number" },
  ];

  const quranSection = [
    { label: "Tilawah Quran (1 Halaman)", field: "tilawah_quran", type: "checkbox" },
    { label: "Terjemah Quran (1 Halaman)", field: "terjemah_quran", type: "checkbox" },
  ];

  const sunnahSection = [
    { label: "Shaum Sunnah (3x/bulan)", field: "shaum_sunnah", type: "checkbox" },
    { label: "Shodaqoh Maal", field: "shodaqoh", type: "checkbox" },
    { label: "Dzikir Pagi/Petang", field: "dzikir_pagi_petang", type: "checkbox" },
    { 
      label: "Istighfar (x1000)", 
      field: "istighfar_1000x", 
      completedField: "istighfar_completed",
      max: 1000, 
      type: "dual" 
    },
    { 
      label: "Sholawat (x100)", 
      field: "sholawat_100x", 
      completedField: "sholawat_completed",
      max: 100, 
      type: "dual" 
    },
  ];

  // Thursday special activities
  const thursdaySection = [
    { label: "Menyimak Kajian Al-Hikam", field: "kajian_al_hikam", type: "checkbox" },
    { label: "Menyimak Kajian Ma'rifatullah", field: "kajian_marifatullah", type: "checkbox" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className={`p-4 sm:p-6 ${headerBgColor} text-white`}>
          <h1 className="text-xl sm:text-2xl font-bold text-center">Mutaba'ah Yaumiyah</h1>
          <p className="text-center text-sm sm:text-base mt-1">Ahlan wa Sahlan</p>
          <p className="text-center font-medium text-sm sm:text-base mt-1 truncate px-2">{user?.name || 'Pengguna'}</p>
          
          <div className="text-center mt-3">
            <p className="text-md sm:text-lg font-medium text-white">{formatHijriDate(hijriDate) || '...'}</p>
            <p className="text-md sm:text-lg text-white">{formatDate(selectedDateTime)}</p>
            <p className="text-xl sm:text-2xl font-medium text-white mt-1">{formatTime(currentDateTime)}</p>
            
            {getStatusText() && (
              <div className="mt-3">
                <p className={`text-white text-xs sm:text-sm font-medium ${getStatusBadgeClass()} px-4 py-1.5 rounded-full inline-block border-2`}>
                  {getStatusText()}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Pilih Tanggal Input:
            </label>
            <select
              value={selectedDate}
              onChange={handleDateChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm sm:text-base"
            >
              {dateOptions.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs sm:text-sm text-gray-500 italic mt-1">
              Pilih tanggal untuk mengisi data Mutaba'ah Yaumiyah yang terlewat (hingga 7 hari ke belakang).
            </p>
          </div>

          {/* Haid checkbox - only show for female users (gender = 0) */}
          {user?.fullData.jenis_kelamin === "0" && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.haid}
                  onChange={(e) => handleInputChange('haid', e.target.checked)}
                  className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-red-600 rounded focus:ring-red-500" 
                />
                <span className="ml-2 text-xs sm:text-sm text-gray-700">
                  Sedang berhalangan (haid/menstruasi) dan tidak dapat melaksanakan sholat
                </span>
              </label>
            </div>
          )}

          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-green-700 border-b pb-2">
              1.1 Sholat Wajib dan Sunnah
            </h2>
            
            <div className="space-y-3 sm:space-y-4">
              {sholatSection.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs sm:text-sm text-gray-700 flex-1 pr-2">{item.label}</span>
                  
                  {item.type === "checkbox" ? (
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={formData[item.field]}
                        onChange={(e) => handleInputChange(item.field, e.target.checked)}
                        className={`form-checkbox h-5 w-5 text-green-600 rounded focus:ring-green-500 ${
                          formData.haid ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={formData.haid && item.field === 'sholat_tahajud'}
                      />
                    </div>
                  ) : (
                    <select
                      value={formData[item.field]}
                      onChange={(e) => handleInputChange(item.field, e.target.value)}
                      className={`shadow border rounded py-1 sm:py-2 px-2 sm:px-3 w-16 sm:w-20 text-gray-700 focus:outline-none focus:shadow-outline text-sm ${
                        formData.haid ? 'bg-gray-200 cursor-not-allowed' : ''
                      }`}
                      disabled={formData.haid}
                    >
                      {/* Special case for Sholat Wajib 5 waktu */}
                      {item.field === 'sholat_wajib' ? (
                        [...Array(6).keys()].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))
                      ) : (
                        /* Even numbers for other sholat */
                        [...Array(Math.floor(item.max / 2) + 1).keys()].map(i => {
                          const num = i * 2;
                          return <option key={num} value={num}>{num}</option>;
                        })
                      )}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-green-700 border-b pb-2">
              1.2 Aktivitas Quran
            </h2>
            
            <div className="space-y-3 sm:space-y-4">
              {quranSection.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs sm:text-sm text-gray-700 flex-1 pr-2">{item.label}</span>
                  
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={formData[item.field]}
                      onChange={(e) => handleInputChange(item.field, e.target.checked)}
                      className="form-checkbox h-5 w-5 text-green-600 rounded focus:ring-green-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-green-700 border-b pb-2">
              1.3 Aktivitas Sunnah
            </h2>
            
            <div className="space-y-3 sm:space-y-4">
              {sunnahSection.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs sm:text-sm text-gray-700 flex-1 pr-2">{item.label}</span>
                  
                  {item.type === "checkbox" ? (
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={formData[item.field]}
                        onChange={(e) => handleInputChange(item.field, e.target.checked)}
                        className={`form-checkbox h-5 w-5 text-green-600 rounded focus:ring-green-500 ${
                          formData.haid && item.field === 'shaum_sunnah' ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={formData.haid && item.field === 'shaum_sunnah'}
                      />
                    </div>
                  ) : item.type === "dual" ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max={item.max}
                        value={formData[item.field]}
                        onChange={(e) => handleInputChange(item.field, e.target.value)}
                        className="shadow border rounded py-1 sm:py-2 px-2 sm:px-3 w-16 sm:w-20 text-gray-700 focus:outline-none focus:shadow-outline text-sm"
                      />
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          checked={formData[item.completedField]}
                          onChange={(e) => handleInputChange(item.completedField, e.target.checked, true)}
                          className="form-checkbox h-5 w-5 text-green-600 rounded focus:ring-green-500"
                          title={item.field === 'istighfar_1000x' ? 'Centang jika sudah 1000x' : 'Centang jika sudah 100x'}
                        />
                      </div>
                    </div>
                  ) : (
                    <input
                      type="number"
                      min="0"
                      max={item.max}
                      value={formData[item.field]}
                      onChange={(e) => handleInputChange(item.field, e.target.value)}
                      className="shadow border rounded py-1 sm:py-2 px-2 sm:px-3 w-16 sm:w-20 text-gray-700 focus:outline-none focus:shadow-outline text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-green-700 border-b pb-2">
              2.1 Menyimak MQ Pagi
            </h2>
            
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg flex items-center justify-between">
              <span className="text-xs sm:text-sm text-gray-700">Menyimak MQ Pagi</span>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={formData.menyimak_mq_pagi}
                  onChange={(e) => handleInputChange('menyimak_mq_pagi', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-green-600 rounded focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Thursday Special Activities - Only show on Thursday */}
          {isThursday && (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-green-700 border-b pb-2">
                2.2 Aktivitas Khusus Hari Kamis
              </h2>
              
              <div className="space-y-3 sm:space-y-4">
                {thursdaySection.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
                    <span className="text-xs sm:text-sm text-gray-700 flex-1 pr-2">{item.label}</span>
                    
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={formData[item.field]}
                        onChange={(e) => handleInputChange(item.field, e.target.checked)}
                        className="form-checkbox h-5 w-5 text-green-600 rounded focus:ring-green-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between gap-3 mt-6">
            <button
              onClick={handleRouteBack}
              disabled={isSubmitting}
              className={`${
                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
              } text-white font-bold py-2 px-4 sm:px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 text-sm sm:text-base flex-1`}
            >
              Kembali
            </button>
            
            <button
              onClick={handleGenerateReport}
              disabled={isSubmitting}
              className={`${
                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } text-white font-bold py-2 px-4 sm:px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 text-sm sm:text-base flex-1`}
            >
              Laporan
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`${
                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              } text-white font-bold py-2 px-4 sm:px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-150 text-sm sm:text-base flex-1`}
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </div>
      </div>

      {/* Use Report Component here */}
      {showReportModal && (
        <MutabaahReport 
          user={user} 
          onClose={() => setShowReportModal(false)} 
        />
      )}
    </div>
  );
};