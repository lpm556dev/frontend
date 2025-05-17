import React, { useState } from 'react';
import FormField from './FormField';
import InfoAlert from './InfoAlert';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const PersonalDataForm = ({ 
  formData, 
  setters, 
  formErrors, 
  formSubmitted, 
  isLoadingData,
  handleSubmit,
  handleKodePosChange
}) => {
  const { 
    name, nik, birthPlace, birthDate, gender, bloodType, 
    address, rt, rw, kodePos, kelurahan, kecamatan, kota, provinsi 
  } = formData;
  
  const { 
    setName, setNik, setBirthPlace, setBirthDate, setGender, setBloodType,
    setAddress, setRt, setRw, setKodePos, setKelurahan, setKecamatan, setKota, setProvinsi
  } = setters;

  // State untuk modal pencarian
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Handler untuk mengubah nama menjadi uppercase dan mengganti tanda petik dengan backtick
  const handleNameChange = (e) => {
    const processedValue = e.target.value.toUpperCase().replace(/'/g, '`');
    setName(processedValue);
  };

  // Handler untuk mengubah alamat menjadi uppercase
  const handleAddressChange = (e) => {
    setAddress(e.target.value.toUpperCase());
  };
  
  // Handler untuk mengubah tempat lahir menjadi uppercase
  const handleBirthPlaceChange = (e) => {
    setBirthPlace(e.target.value.toUpperCase());
  };
  
  // Membuka modal pencarian
  const openSearchModal = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchModal(true);
  };
  
  // Handle pencarian alamat - terhubung dengan API kode pos
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      // Menggunakan endpoint kodepos yang sudah ada di aplikasi
      const response = await fetch(`${API_URL}/users/kodepos/search?keyword=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        // Jika response status 404, artinya tidak ada hasil yang ditemukan
        if (response.status === 404) {
          setSearchResults([]);
          setIsSearching(false);
          return;
        }
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Pastikan data yang diterima sesuai format yang dibutuhkan
      const formattedResults = Array.isArray(data) 
        ? data.map(item => ({
            kelurahan: item.kelurahan || '',
            kecamatan: item.kecamatan || '',
            kota: item.kota || item.kabupaten_kota || '',  
            provinsi: item.provinsi || '',
            kodePos: item.kode_pos || ''
          }))
        : [];
      
      setSearchResults(formattedResults);
      
      if (formattedResults.length === 0) {
        console.log('Tidak ada hasil yang ditemukan untuk pencarian:', searchTerm);
      }
    } catch (error) {
      console.error('Error searching for address:', error);
      
      // Jika API gagal, gunakan fallback ke data statis
      // Ini hanya digunakan jika endpoint sebenarnya belum siap
      const mockResults = [
        { kelurahan: 'KEBON KOSONG', kecamatan: 'KEMAYORAN', kota: 'JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10630' },
        { kelurahan: 'KEBON MELATI', kecamatan: 'TANAH ABANG', kota: 'JAKARTA PUSAT', provinsi: 'DKI JAKARTA', kodePos: '10230' },
        { kelurahan: 'KEBON JERUK', kecamatan: 'KEBON JERUK', kota: 'JAKARTA BARAT', provinsi: 'DKI JAKARTA', kodePos: '11530' }
      ].filter(item => {
        const term = searchTerm.toUpperCase();
        return (
          item.kelurahan.toUpperCase().includes(term) || 
          item.kecamatan.toUpperCase().includes(term) || 
          item.kota.toUpperCase().includes(term)
        );
      });
      
      setSearchResults(mockResults);
      
      // Opsional: beri tahu pengguna bahwa API sedang menggunakan data lokal
      toast.error('Gagal terhubung ke server. Menggunakan data lokal.');
    } finally {
      setIsSearching(false);
    }
  };
  
  // Mengisi data dari hasil pencarian
  const fillAddressData = (result) => {
    // Pastikan semua data ada sebelum mengisi form
    if (!result) {
      console.error('Data alamat tidak lengkap');
      return;
    }

    // Transformasi data jika diperlukan
    // Pastikan semua nilai dalam uppercase sesuai dengan tampilan formulir
    const kelurahanVal = result.kelurahan ? result.kelurahan.toUpperCase() : '';
    const kecamatanVal = result.kecamatan ? result.kecamatan.toUpperCase() : '';
    const kotaVal = result.kota || result.kabupaten_kota ? (result.kota || result.kabupaten_kota).toUpperCase() : '';
    const provinsiVal = result.provinsi ? result.provinsi.toUpperCase() : '';
    const kodePosVal = result.kodePos || result.kode_pos || '';

    // Isi data ke form
    setKelurahan(kelurahanVal);
    setKecamatan(kecamatanVal);
    setKota(kotaVal);
    setProvinsi(provinsiVal);
    setKodePos(kodePosVal);
    
    // Kirim feedback ke pengguna
    toast.success('Data alamat berhasil diisi');
    
    // Tutup modal pencarian
    setShowSearchModal(false);
    
    // Opsional: Log untuk debugging
    console.log('Data alamat diisi:', { kelurahanVal, kecamatanVal, kotaVal, provinsiVal, kodePosVal });
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 pb-16">
        <h1 className="text-2xl font-bold text-center mb-6">Daftar - Data Pribadi</h1>
        
        {/* Progress Indicator */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-full max-w-md relative">
            <div className="h-1 bg-gray-300 absolute top-1/2 left-0 right-0 -translate-y-1/2"></div>
            <div className="flex justify-between">
              <div className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center z-10">1</div>
              <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center z-10">2</div>
            </div>
          </div>
          <div className="flex justify-between w-full max-w-md mt-1 text-xs">
            <span className="text-blue-900 font-medium">Data Pribadi</span>
            <span className="text-gray-400">Data Alamat</span>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <InfoAlert 
            message="Pastikan Data yang Anda masukkan sesuai dengan KTP dan memudahkan proses verifikasi."
            bgColor="bg-blue-50"
            textColor="text-blue-800"
          />

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <FormField
              id="name"
              label="NAMA LENGKAP"
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="Nama sesuai KTP"
              formSubmitted={formSubmitted}
              formErrors={formErrors}
            />
            
            <FormField
              id="nik"
              label="NIK"
              type="tel"
              value={nik}
              onChange={(e) => setNik(e.target.value.replace(/\D/g, '').slice(0, 16))}
              placeholder="Nomor NIK"
              maxLength={16}
              formSubmitted={formSubmitted}
              formErrors={formErrors}
              inputMode="numeric"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="birthPlace"
                label="TEMPAT LAHIR"
                type="text"
                value={birthPlace}
                onChange={handleBirthPlaceChange}
                placeholder="Tempat Lahir"
                formSubmitted={formSubmitted}
                formErrors={formErrors}
              />
              
              <FormField
                id="birthDate"
                label="TANGGAL LAHIR"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder=""
                formSubmitted={formSubmitted}
                formErrors={formErrors}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="gender"
                label="JENIS KELAMIN"
                type="select"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                formSubmitted={formSubmitted}
                formErrors={formErrors}
                options={[
                  { value: "", label: "Pilih Jenis Kelamin" },
                  { value: "1", label: "Laki-laki" },
                  { value: "0", label: "Perempuan" }
                ]}
              />
              
              <FormField
                id="bloodType"
                label="GOLONGAN DARAH"
                type="select"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                formSubmitted={formSubmitted}
                formErrors={formErrors}
                options={[
                  { value: "", label: "Pilih Golongan Darah" },
                  { value: "A", label: "A" },
                  { value: "B", label: "B" },
                  { value: "AB", label: "AB" },
                  { value: "O", label: "O" },
                  { value: "X", label: "Tidak Tahu" }
                ]}
              />
            </div>
            
            <FormField
              id="address"
              label="ALAMAT (SESUAI KTP)"
              type="textarea"
              value={address}
              onChange={handleAddressChange}
              placeholder="Alamat Lengkap"
              formSubmitted={formSubmitted}
              formErrors={formErrors}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="rt"
                label="RT"
                type="tel"
                value={rt}
                onChange={(e) => setRt(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="RT"
                maxLength={3}
                formSubmitted={formSubmitted}
                formErrors={formErrors}
                inputMode="numeric"
              />
              
              <FormField
                id="rw"
                label="RW"
                type="tel"
                value={rw}
                onChange={(e) => setRw(e.target.value.replace(/\D/g, '').slice(0, 3))}
                placeholder="RW"
                maxLength={3}
                formSubmitted={formSubmitted}
                formErrors={formErrors}
                inputMode="numeric"
              />
            </div>
            
            {/* Improved Kode Pos field with search icon properly aligned */}
            <div className="relative">
              <label htmlFor="kodePos" className="block text-xs font-medium text-gray-500 uppercase mb-1">
                KODE POS{formErrors.kodePos && formSubmitted && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="flex items-center relative">
                <input
                  id="kodePos"
                  type="tel"
                  inputMode="numeric"
                  placeholder="Kode Pos KTP"
                  value={kodePos}
                  onChange={handleKodePosChange}
                  maxLength={5}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.kodePos && formSubmitted ? 'border-red-500' : 'border-gray-300'}`}
                />
                <button
                  type="button"
                  onClick={openSearchModal}
                  className="absolute right-2 text-blue-700 hover:text-blue-900 p-1 rounded-md"
                  aria-label="Cari kode pos"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
              {formErrors.kodePos && formSubmitted && (
                <p className="mt-1 text-sm text-red-500">{formErrors.kodePos}</p>
              )}
            </div>
            
            {isLoadingData && (
              <div className="mb-3 px-3 py-2 bg-gray-50 text-gray-700 text-sm rounded-md border border-gray-100 flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mencari data kode pos...
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="kelurahan"
                label="KELURAHAN/DESA"
                type="text"
                placeholder="Kelurahan/Desa"
                value={kelurahan}
                onChange={(e) => setKelurahan(e.target.value)}
                formSubmitted={formSubmitted}
                formErrors={formErrors}
                readOnly={kelurahan ? true : false}
                additionalClassName={kelurahan ? "bg-gray-100" : ""}
              />
              
              <FormField
                id="kecamatan"
                label="KECAMATAN"
                type="text"
                placeholder="Kecamatan"
                value={kecamatan}
                onChange={(e) => setKecamatan(e.target.value)}
                formSubmitted={formSubmitted}
                formErrors={formErrors}
                readOnly={kecamatan ? true : false}
                additionalClassName={kecamatan ? "bg-gray-100" : ""}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="kota"
                label="KABUPATEN/KOTA"
                type="text"
                placeholder="Kabupaten/Kota"
                value={kota}
                onChange={(e) => setKota(e.target.value)}
                formSubmitted={formSubmitted}
                formErrors={formErrors}
                readOnly={kota ? true : false}
                additionalClassName={kota ? "bg-gray-100" : ""}
              />
              
              <FormField
                id="provinsi"
                label="PROVINSI"
                type="text"
                placeholder="Provinsi"
                value={provinsi}
                onChange={(e) => setProvinsi(e.target.value)}
                formSubmitted={formSubmitted}
                formErrors={formErrors}
                readOnly={provinsi ? true : false}
                additionalClassName={provinsi ? "bg-gray-100" : ""}
              />
            </div>
            
            {/* Fixed margin for the button so it's always fully visible */}
            <div className="mt-6 mb-6 fixed-button">
              <button
                type="submit"
                className="w-full bg-blue-900 text-white py-3 rounded-md font-medium hover:bg-blue-800 transition-colors shadow-md"
              >
                Lanjutkan
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Modal Pencarian */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                Cari Alamat
              </h3>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-2 text-sm text-gray-600">
              <p>Masukkan nama kelurahan, kecamatan, atau kabupaten/kota</p>
            </div>
            
            <div className="flex mb-4">
              <input
                type="text"
                className="flex-grow border rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Kebon Jeruk, Kemayoran, Jakarta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="bg-blue-900 text-white px-4 py-2 rounded-r-md hover:bg-blue-800"
              >
                Cari
              </button>
            </div>
            
            <div className="mt-4 max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="flex justify-center py-4">
                  <svg className="animate-spin h-5 w-5 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : searchResults.length === 0 && searchTerm ? (
                <div className="text-center py-4">
                  <div className="text-gray-400 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">Tidak ada data yang ditemukan</p>
                  <p className="text-gray-500 text-sm mt-1">
                    Coba kata kunci lain atau cari dengan kode pos
                  </p>
                  
                  {/* Opsi alternatif: cari dengan kode pos */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-gray-600 text-sm mb-2">Atau cari menggunakan kode pos:</p>
                    <div className="flex">
                      <input
                        type="tel"
                        inputMode="numeric"
                        className="flex-grow border rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Masukkan kode pos (5 digit)"
                        maxLength={5}
                        onChange={(e) => setKodePos(e.target.value.replace(/\D/g, '').slice(0, 5))}
                        value={kodePos}
                      />
                      <button
                        onClick={() => {
                          setShowSearchModal(false);
                          handleKodePosChange({ target: { value: kodePos } });
                        }}
                        className="bg-blue-900 text-white px-4 py-2 rounded-r-md hover:bg-blue-800"
                        disabled={kodePos.length !== 5}
                      >
                        Gunakan
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <ul className="divide-y">
                  {searchResults.map((result, index) => (
                    <li key={index} className="py-2">
                      <button
                        onClick={() => fillAddressData(result)}
                        className="w-full text-left hover:bg-gray-50 p-2 rounded"
                      >
                        <div className="font-medium">{result.kelurahan}</div>
                        <div className="text-sm text-gray-600">
                          <span>{result.kecamatan}, </span>
                          <span>{result.kota}, </span>
                          <span>{result.provinsi} - {result.kodePos}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add additional CSS for fixing button visibility on mobile */}
      <style jsx>{`
        @media (max-width: 768px) {
          .fixed-button {
            position: fixed;
            bottom: 20px;
            left: 0;
            right: 0;
            padding: 0 20px;
            z-index: 40;
            max-width: 500px;
            margin-left: auto;
            margin-right: auto;
          }
          
          .container {
            padding-bottom: 80px;
          }
        }
      `}</style>
    </div>
  );
};

export default PersonalDataForm;