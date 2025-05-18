import React, { useState, useEffect } from 'react';
import useAuthStore from '../stores/authStore';

const DashboardContent = ({
  userData,
  navigateToMY,
  navigateToRundown,
  navigateToKelolaTugas,
  navigateToKelolaKegiatan,
  navigateToSeePresensi,
  navigateToPresensi,
  navigateToTugas,
  navigateToAlQuran,
  navigateToECard,
  navigateToPeserta,
  navigateToScan,
  navigateToProfile,
}) => {
  const { role, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [bookmarkData, setBookmarkData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false);
  const [recentPresensi, setRecentPresensi] = useState([]);
  const [isLoadingPresensi, setIsLoadingPresensi] = useState(false);

  const checkBookmark = async () => {
    if (!user?.userId) return;

    setIsLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/quran/bookmark?user_id=${user?.userId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch bookmark');
      }

      const data = await response.json();
      if (data.success) {
        setBookmarkData(data.data);
      }
    } catch (error) {
      console.error('Error checking bookmark:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    setIsLoadingAnnouncements(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/admin/get-kegiatan`);

      if (!response.ok) {
        throw new Error('Failed to fetch announcements');
      }

      const data = await response.json();
      if (data.success) {
        setAnnouncements(data.data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
    } finally {
      setIsLoadingAnnouncements(false);
    }
  };

  const fetchRecentPresensi = async () => {
    if (role !== '3' && role !== '4') return;

    try {
      setIsLoadingPresensi(true);
      const response = await fetch('https://api.siapguna.org/api/admin/get-presensi?limit=5&sort=desc');

      if (!response.ok) {
        throw new Error('Gagal mengambil data presensi');
      }

      const data = await response.json();
      if (data.success) {
        // Format the data to match expected structure
        const formattedData = data.data.map(item => ({
          id: item.id,
          user: {
            name: item.nama_lengkap,
            pleton: item.qrcode_text.startsWith('A') ? 'A' : 'B'
          },
          status: item.status || (item.jenis === 'masuk' ? 'Masuk' : 'Keluar'),
          keterangan: item.keterangan || '-',
          tanggal: item.waktu_presensi
        }));
        setRecentPresensi(formattedData);
      }
    } catch (error) {
      console.error('Error fetching recent presensi:', error);
    } finally {
      setIsLoadingPresensi(false);
    }
  };

  useEffect(() => {
    checkBookmark();
    fetchAnnouncements();
    fetchRecentPresensi();
  }, [role, user?.userId]);

  // Format date untuk lastRead dari updated_at
  const formatLastRead = (dateString) => {
    if (!dateString) return '-';
    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Format date for announcements
  const formatAnnouncementDate = (dateString) => {
    if (!dateString) return '-';
    const options = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Format date for presensi
  const formatPresensiDate = (dateString) => {
    if (!dateString) return '-';
    const options = {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  // Gabungkan data bookmark dengan data default
  const quranProgress = {
    ...userData.quranProgress, // Data default dari props
    ...(bookmarkData ? { // Override dengan data bookmark jika ada
      juz: bookmarkData.juz,
      surah: bookmarkData.surah,
      page: bookmarkData.page,
      ayah: bookmarkData.ayah,
      lastRead: formatLastRead(bookmarkData.updated_at)
    } : {})
  };

  // Format date for display - showing current date
  const formatDate = () => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date().toLocaleDateString('id-ID', options);
  };

  // All possible quick access items
  const allQuickAccessItems = [
    {
      id: 'rundown',
      name: 'Rundown',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      onClick: () => navigateToRundown(),
      roles: ['2c', '3']
    },
    {
      id: 'kelola-tugas',
      name: 'Kelola Tugas',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      onClick: () => navigateToKelolaTugas(),
      roles: ['3', '4']
    },
    {
      id: "kegiatan",
      name: "Kelola Kegiatan",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18m-7 5h7M3 17h7m-7 0a2 2 0 01-2-2V7a2 2 0 012-2m0 10a2 2 0 002-2V7a2 2 0 00-2-2m0 10h18m-7-5h7M3 12h18" />
        </svg>
      ),
      onClick: () => navigateToKelolaKegiatan(),
      roles: ['3', '4']
    },
    {
      id: 'tugas',
      name: 'Tugas',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      onClick: () => navigateToTugas(),
      roles: ['1a']
    },
    {
      id: 'alquran',
      name: 'Al-Quran',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      onClick: () => navigateToAlQuran(),
      roles: ['all']
    },
    {
      id: 'bap',
      name: 'BAP/LAJ',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      onClick: null,
      roles: ['1b']
    },
    {
      id: 'presensi',
      name: 'Presensi',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      onClick: () => navigateToPresensi(),
      roles: ['1a']
    },
    {
      id: 'nilai',
      name: 'Nilai',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      onClick: null,
      roles: ['1a', '2c', '3', '4']
    },
    {
      id: 'my',
      name: 'MY',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      ),
      onClick: () => navigateToMY(),
      roles: ['all']
    },
    {
      id: 'ecard',
      name: 'E-Card',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      onClick: () => navigateToECard(),
      roles: ['1a']
    },
    {
      id: 'peserta',
      name: 'Peserta',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      onClick: () => navigateToPeserta(),
      roles: ['3']
    },
    {
      id: 'lihat-presensi',
      name: 'Lihat Presensi',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      onClick: () => navigateToSeePresensi(),
      roles: ['3', '4'] 
    },
    {
      id: 'scanqr',
      name: 'Scan QR',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
      onClick: () => navigateToScan(),
      roles: ['2c', '3', '4']
    }
  ];

  // Filter quick access items based on user role
  const getFilteredQuickAccessItems = () => {
    return allQuickAccessItems.filter(item => {
      if (item.roles.includes('all')) return true;
      return item.roles.includes(role);
    });
  };

  const quickAccessItems = getFilteredQuickAccessItems();

  return (
    <main className="flex-1 overflow-y-auto py-4 px-3 sm:px-4 md:px-6 pb-20 transition-all duration-300 bg-gray-50">
      {/* Progress MY Card */}
      <section className="bg-white rounded-lg shadow-sm mb-4 p-4">
        <h3 className="text-sm font-medium mb-2">Progres MY</h3>
        <div className="mb-2 flex justify-between text-xs text-gray-600">
          <span>Diselesaikan: {userData.taskCompleted}/{userData.taskTotal}</span>
          <span>{userData.completionRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-orange-400 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${userData.completionRate}%` }}
          ></div>
        </div>
      </section>

      {/* Jadwal and Search Row - Responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        {/* Jadwal Card */}
        {role !== '0a' && role !== '0b' && (
          <section className="md:col-span-3 flex flex-col sm:flex-row rounded-lg overflow-hidden shadow-sm">
            <div className="bg-blue-900 text-white p-4 w-full sm:w-48 flex flex-col justify-center">
              <h3 className="text-sm font-semibold">Jadwal Hari ini</h3>
              <p className="text-xs mt-1">{formatDate()}</p>
            </div>
            <div className="bg-blue-100 p-4 flex-grow">
              <h3 className="text-blue-900 font-medium text-sm">TUGAS</h3>
              <ol className="text-xs space-y-1 mt-2">
                <li>
                  <span className="font-medium">1. Agama</span><br />
                  <span className="text-gray-700">Sholat Lima Waktu</span>
                </li>
                <li>
                  <span className="font-medium">2. BTQ</span><br />
                  <span className="text-gray-700">Baca Surat An-naba</span>
                </li>
                <li>
                  <span className="font-medium">3. Tataboga</span><br />
                  <span className="text-gray-700">Masak Telur</span>
                </li>
              </ol>
              <div className="mt-2 flex justify-end">
                <button
                  className="bg-blue-900 text-white text-xs px-3 py-1 rounded-full flex items-center hover:bg-blue-800 transition-colors duration-300"
                  onClick={() => navigateToTugas()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Lihat Jadwal
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Search Box */}
        <div className="flex flex-col w-full">
          <div className="relative mb-3">
            <input
              type="text"
              placeholder="Pencarian..."
              className="w-full bg-gray-100 rounded-lg px-4 py-2 pl-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Pengumuman Section */}
      <section className="bg-orange-300 rounded-lg shadow-sm mb-4 p-4">
        <h3 className="font-bold text-sm mb-2">Pengumuman</h3>

        {isLoadingAnnouncements ? (
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-700"></div>
          </div>
        ) : announcements.length > 0 ? (
          announcements.map((announcement) => (
            <div key={announcement.id} className="mt-2 p-3 bg-white rounded-lg mb-2">
              <p className="font-medium text-sm">{announcement.judul}</p>
              <p className="text-xs text-gray-700">{announcement.deskripsi}</p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">{formatAnnouncementDate(announcement.tanggal)}</p>
                <span className={`px-2 py-0.5 text-xs rounded-full ${announcement.status === 'Dibuka'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
                  }`}>
                  {announcement.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="mt-2 p-3 bg-white rounded-lg mb-2">
            <p className="text-xs text-gray-700">Tidak ada pengumuman saat ini</p>
          </div>
        )}
      </section>

      {/* Presensi Terbaru Section */}
      {(role === '3' || role === '4') && (
        <section className="bg-white rounded-lg shadow-sm mb-4 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm">Presensi Terbaru</h3>
            <button
              onClick={() => navigateToSeePresensi()}
              className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center"
            >
              Lihat Semua
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {isLoadingPresensi ? (
            <div className="flex justify-center items-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-700"></div>
            </div>
          ) : recentPresensi.length > 0 ? (
            <div className="space-y-3">
              {recentPresensi.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${item.status === 'hadir' ? 'bg-green-500' :
                      item.status === 'izin' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                    <div>
                      <p className="text-sm font-medium">{item.user.name}</p>
                      <p className="text-xs text-gray-500">{item.user.pleton || '-'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium capitalize">{item.status}</p>
                    <p className="text-xs text-gray-500">{formatPresensiDate(item.tanggal)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">Belum ada data presensi</p>
            </div>
          )}
        </section>
      )}

      {/* Quick Access - Responsive grid */}
      <section className="bg-white rounded-lg shadow-sm mb-4 p-4">
        <h3 className="font-medium text-sm mb-4">Akses Cepat</h3>
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-4">
          {quickAccessItems.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col items-center ${item.onClick ? 'cursor-pointer active:scale-95' : ''} 
                transition-transform duration-200`}
              onClick={item.onClick}
            >
              <div className="w-12 h-12 rounded-full bg-orange-300 flex items-center justify-center text-orange-500 mb-1">
                {item.icon}
              </div>
              <span className="text-xs text-gray-600 text-center">{item.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Quran Progress Section */}
      <section className="bg-green-50 rounded-lg shadow-sm mb-6 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
          <div className="flex items-center mb-3 sm:mb-0">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-700 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-lg font-medium">Progress Al-Quran</h2>
          </div>
          <button
            className="bg-green-500 text-white px-4 py-1 rounded-lg text-sm font-medium w-full sm:w-auto hover:bg-green-600 transition-colors duration-300"
            onClick={() => navigateToAlQuran()}
          >
            Lanjutkan Membaca
          </button>
        </div>

        <div className="flex mb-2">
          <div className="grid grid-cols-2 xs:grid-cols-4 gap-4 w-full">
            <div>
              <p className="text-xs text-gray-500">Juz</p>
              <p className="font-medium">{quranProgress.juz || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Surat</p>
              <p className="font-medium">{quranProgress.surah || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Halaman</p>
              <p className="font-medium">{quranProgress.page || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Ayat</p>
              <p className="font-medium">{quranProgress.ayah || '-'}</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Terakhir Dibaca: {quranProgress.lastRead || '-'}
        </p>
      </section>

      {/* Bottom spacing for mobile navigation */}
      <div className="h-16 md:h-0"></div>
    </main>
  );
};

export default DashboardContent;