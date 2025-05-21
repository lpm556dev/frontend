"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir",
  "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
  "Ramadhan", "Syawal", "Dzulka'dah", "Dzulhijjah"
];

const MutabaahReport = ({ user, onClose }) => {
  const [allUserData, setAllUserData] = useState([]);
  const [loadingReport, setLoadingReport] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  
  const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 5 + i);

  useEffect(() => {
    if (user?.userId) {
      fetchIbadahData();
    }
  }, [user, month, year]);

  const fetchIbadahData = async () => {
    try {
      setLoadingReport(true);
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/users/get-ibadah-month?user_id=${user.userId}&month=${String(month).padStart(2, '0')}&year=${year}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        const processedData = Array.isArray(result.data) ? result.data : [result.data];
        
        const normalizedData = processedData.map(item => ({
          ...item,
          date: item.date || item.created_at,
          sholat_wajib: Number(item.sholat_wajib) || 0,
          sholat_tahajud: item.sholat_tahajud ? 1 : 0,
          sholat_dhuha: Number(item.sholat_dhuha) || 0,
          sholat_rawatib: Number(item.sholat_rawatib) || 0,
          sholat_sunnah_lainnya: Number(item.sholat_sunnah_lainnya) || 0,
          tilawah_quran: item.tilawah_quran ? 1 : 0,
          terjemah_quran: item.terjemah_quran ? 1 : 0,
          shaum_sunnah: item.shaum_sunnah ? 1 : 0,
          shodaqoh: item.shodaqoh ? 1 : 0,
          dzikir_pagi_petang: item.dzikir_pagi_petang ? 1 : 0,
          istighfar_1000x: Number(item.istighfar_1000x) || 0,
          istighfar_completed: item.istighfar_completed || false,
          sholawat_100x: Number(item.sholawat_100x) || 0,
          sholawat_completed: item.sholawat_completed || false,
          menyimak_mq_pagi: item.menyimak_mq_pagi ? 1 : 0,
          kajian_al_hikam: item.kajian_al_hikam ? 1 : 0,
          kajian_marifatullah: item.kajian_marifatullah ? 1 : 0,
          haid: item.haid ? 1 : 0
        }));
        
        normalizedData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAllUserData(normalizedData);
      } else {
        setAllUserData([]);
        if (result.status === 'not_found') {
          toast.info(result.message || 'Tidak ada data untuk periode yang dipilih');
        } else {
          toast.error(result.message || 'Gagal mengambil data laporan');
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error(error.message || 'Gagal mengambil data laporan');
      setAllUserData([]);
    } finally {
      setLoadingReport(false);
    }
  };

  const downloadReport = () => {
    try {
      // Header information
      let csvContent = "Laporan Lengkap Mutaba'ah Yaumiyah\n\n";
      csvContent += `Nama,${user?.name || '-'}\n`;
      csvContent += `Periode,${months.find(m => m.value === month)?.label} ${year}\n`;
      csvContent += `Tanggal Laporan,${new Date().toLocaleDateString('id-ID')}\n`;
      csvContent += `Total Data,${allUserData.length}\n\n`;

      // Main table headers
      const headers = [
        "No", 
        "Tanggal", 
        "Hijriah", 
        "Sholat Wajib", 
        "Tahajud", 
        "Dhuha", 
        "Shaum Sunnah", 
        "Haid",
        "Tilawah Quran",
        "Terjemah Quran",
        "Dzikir Pagi/Petang",
        "Istighfar 1000x",
        "Sholawat 100x",
        "Menyimak MQ Pagi"
      ];

      // Add headers with proper formatting
      csvContent += headers.join(',') + '\n';

      // Add data rows
      allUserData.forEach((data, index) => {
        const row = [
          index + 1,
          `"${new Date(data.date).toLocaleDateString('id-ID')}"`, // Wrapped in quotes for proper CSV formatting
          `"${formatHijriDate(data.date)}"`,
          data.sholat_wajib > 0 ? `${data.sholat_wajib}/5` : '0/5',
          data.sholat_tahajud > 0 ? 'Ya' : 'Tidak',
          data.sholat_dhuha > 0 ? `${data.sholat_dhuha} rakaat` : 'Tidak',
          data.shaum_sunnah > 0 ? 'Ya' : 'Tidak',
          data.haid > 0 ? 'Ya' : 'Tidak',
          data.tilawah_quran > 0 ? 'Ya' : 'Tidak',
          data.terjemah_quran > 0 ? 'Ya' : 'Tidak',
          data.dzikir_pagi_petang > 0 ? 'Ya' : 'Tidak',
          data.istighfar_1000x > 0 ? 'Ya' : 'Tidak',
          data.sholawat_100x > 0 ? 'Ya' : 'Tidak',
          data.menyimak_mq_pagi > 0 ? 'Ya' : 'Tidak'
        ];
        csvContent += row.join(',') + '\n';
      });

      // Add summary statistics
      const stats = calculateStatistics();
      csvContent += '\n\nStatistik Ringkasan\n\n';
      
      const summaryData = [
        ['Sholat Wajib (Rata-rata)', `${stats.avgSholatWajib}/5`],
        ['Tahajud (Hari)', `${stats.tahajudDays}/${allUserData.length}`],
        ['Dhuha (Hari)', `${stats.dhuhaDays}/${allUserData.length}`],
        ['Shaum Sunnah (Hari)', `${stats.shaumDays}/${allUserData.length}`],
        ['Haid (Hari)', `${stats.haidDays}/${allUserData.length}`],
        ['Tilawah Quran (Hari)', `${stats.tilawahDays}/${allUserData.length}`],
        ['Terjemah Quran (Hari)', `${stats.terjemahDays}/${allUserData.length}`],
        ['Istighfar 1000x (Hari)', `${stats.istighfarCompleted}/${allUserData.length}`],
        ['Sholawat 100x (Hari)', `${stats.sholawatCompleted}/${allUserData.length}`],
        ['MQ Pagi (Hari)', `${stats.mqDays}/${allUserData.length}`]
      ];

      summaryData.forEach(item => {
        csvContent += `${item[0]},${item[1]}\n`;
      });

      // Create and download the file
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `laporan_mutabaah_${user?.name || 'user'}_${months.find(m => m.value === month)?.label}_${year}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Gagal mengunduh laporan');
    }
  };

  const calculateStatistics = () => {
    if (allUserData.length === 0) {
      return {
        avgSholatWajib: '0.0',
        tahajudDays: 0,
        tilawahDays: 0,
        terjemahDays: 0,
        dhuhaDays: 0,
        shaumDays: 0,
        dzikirDays: 0,
        istighfarCompleted: 0,
        sholawatCompleted: 0,
        mqDays: 0,
        kajianDays: 0,
        haidDays: 0
      };
    }
    
    const totalEntries = allUserData.length;
    const avgSholatWajib = (
      allUserData.reduce((sum, data) => sum + Number(data.sholat_wajib), 0) / totalEntries
    ).toFixed(1);
    
    const tahajudDays = allUserData.filter(data => data.sholat_tahajud > 0).length;
    const tilawahDays = allUserData.filter(data => data.tilawah_quran > 0).length;
    const terjemahDays = allUserData.filter(data => data.terjemah_quran > 0).length;
    const dhuhaDays = allUserData.filter(data => data.sholat_dhuha > 0).length;
    const shaumDays = allUserData.filter(data => data.shaum_sunnah > 0).length;
    const dzikirDays = allUserData.filter(data => data.dzikir_pagi_petang > 0).length;
    const istighfarCompleted = allUserData.filter(data => data.istighfar_completed).length;
    const sholawatCompleted = allUserData.filter(data => data.sholawat_completed).length;
    const mqDays = allUserData.filter(data => data.menyimak_mq_pagi > 0).length;
    const kajianDays = allUserData.filter(data => data.kajian_al_hikam > 0 || data.kajian_marifatullah > 0).length;
    const haidDays = allUserData.filter(data => data.haid > 0).length;
    
    return { 
      avgSholatWajib, 
      tahajudDays, 
      tilawahDays, 
      terjemahDays, 
      dhuhaDays,
      shaumDays,
      dzikirDays,
      istighfarCompleted,
      sholawatCompleted,
      mqDays,
      kajianDays,
      haidDays
    };
  };

  const stats = calculateStatistics();

  const handleMonthChange = (e) => {
    setMonth(parseInt(e.target.value, 10));
  };

  const handleYearChange = (e) => {
    setYear(parseInt(e.target.value, 10));
  };

  const isValueActive = (value) => Number(value) > 0;

  const formatHijriDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const hijri = calculateHijriDate(date);
      return hijri.formatted;
    } catch (error) {
      console.error('Error formatting Hijri date:', error);
      return '';
    }
  };

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Laporan Lengkap Mutaba'ah Yaumiyah</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Nama:</span>
              <span>{user?.name || '-'}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Periode:</span>
              <div className="flex space-x-2">
                <select 
                  value={month}
                  onChange={handleMonthChange}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
                <select 
                  value={year}
                  onChange={handleYearChange}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Total Data:</span>
              <span>{allUserData.length} hari</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Tanggal Laporan:</span>
              <span>{new Date().toLocaleDateString('id-ID')}</span>
            </div>
          </div>

          {loadingReport ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {allUserData.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hijriah</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sholat Wajib</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahajud</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dhuha</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shaum</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Haid</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {allUserData.map((data, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {new Date(data.date).toLocaleDateString('id-ID')}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {formatHijriDate(data.date)}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {data.sholat_wajib}/5
                              {data.haid > 0 && <span className="text-red-500 ml-1">(Haid)</span>}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {isValueActive(data.sholat_tahajud) ? (
                                <span className="text-green-600">✓</span>
                              ) : (
                                <span className="text-red-600">✗</span>
                              )}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {data.sholat_dhuha > 0 ? (
                                <span className="text-green-600">{data.sholat_dhuha} rakaat</span>
                              ) : (
                                <span className="text-red-600">✗</span>
                              )}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {isValueActive(data.shaum_sunnah) ? (
                                <span className="text-green-600">✓</span>
                              ) : (
                                <span className="text-red-600">✗</span>
                              )}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                              {isValueActive(data.haid) ? (
                                <span className="text-red-600">✗</span>
                              ) : (
                                <span className="text-green-600">✓</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-lg mb-3">Statistik Ringkasan</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-sm text-blue-800">Sholat Wajib (Rata-rata)</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {stats.avgSholatWajib}/5
                        </div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-sm text-green-800">Tahajud (Hari)</div>
                        <div className="text-2xl font-bold text-green-600">
                          {stats.tahajudDays}/{allUserData.length}
                        </div>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <div className="text-sm text-indigo-800">Tilawah Quran (Hari)</div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {stats.tilawahDays}/{allUserData.length}
                        </div>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="text-sm text-purple-800">Dhuha (Hari)</div>
                        <div className="text-2xl font-bold text-purple-600">
                          {stats.dhuhaDays}/{allUserData.length}
                        </div>
                      </div>
                      <div className="bg-amber-50 p-4 rounded-lg">
                        <div className="text-sm text-amber-800">Shaum Sunnah (Hari)</div>
                        <div className="text-2xl font-bold text-amber-600">
                          {stats.shaumDays}/{allUserData.length}
                        </div>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <div className="text-sm text-red-800">Haid (Hari)</div>
                        <div className="text-2xl font-bold text-red-600">
                          {stats.haidDays}/{allUserData.length}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="bg-teal-50 p-4 rounded-lg">
                        <div className="text-sm text-teal-800">Istighfar 1000x (Hari)</div>
                        <div className="text-2xl font-bold text-teal-600">
                          {stats.istighfarCompleted}/{allUserData.length}
                        </div>
                      </div>
                      <div className="bg-pink-50 p-4 rounded-lg">
                        <div className="text-sm text-pink-800">Sholawat 100x (Hari)</div>
                        <div className="text-2xl font-bold text-pink-600">
                          {stats.sholawatCompleted}/{allUserData.length}
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="text-sm text-yellow-800">MQ Pagi (Hari)</div>
                        <div className="text-2xl font-bold text-yellow-600">
                          {stats.mqDays}/{allUserData.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada data laporan yang tersedia untuk periode {months.find(m => m.value === month)?.label} {year}
                </div>
              )}
            </>
          )}
          
          <div className="mt-6 flex justify-end space-x-3">
            {allUserData.length > 0 && (
              <button
                onClick={downloadReport}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download CSV
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MutabaahReport;