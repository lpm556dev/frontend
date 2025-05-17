import React from 'react';
import FormField from './FormField';
import InfoAlert from './InfoAlert';

const AddressContactForm = ({ 
  formData, 
  setters, 
  passwordVisibility,
  formErrors, 
  formSubmitted, 
  isLoadingData,
  goBackToStep1,
  handleSubmit,
  handleKodePosChange,
  addressFromStep1,
  handleSameAddressChange
}) => {
  const { 
    alamatDomisili, rtDomisili, rwDomisili, kodePosStep2, 
    kelurahanStep2, kecamatanStep2, kotaStep2, provinsiStep2,
    email, nomorHp, kataSandi, konfirmasiKataSandi, persetujuanSyarat,
    isSameAddress
  } = formData;
  
  const { 
    setAlamatDomisili, setRtDomisili, setRwDomisili, setKodePosStep2,
    setKelurahanStep2, setKecamatanStep2, setKotaStep2, setProvinsiStep2,
    setEmail, setNomorHp, setKataSandi, setKonfirmasiKataSandi, setPersetujuanSyarat,
    setIsSameAddress
  } = setters;
  
  const { 
    showPassword, setShowPassword, 
    showConfirmPassword, setShowConfirmPassword 
  } = passwordVisibility;

  // Handle alamat domisili uppercase
  const handleAlamatDomisiliChange = (e) => {
    setAlamatDomisili(e.target.value.toUpperCase());
  };
  
  // Handle email lowercase
  const handleEmailChange = (e) => {
    setEmail(e.target.value.toLowerCase());
  };

  // Format nomor HP untuk mengizinkan input dengan awalan 08
  // namun menyimpan dengan format 62
  const handlePhoneNumberChange = (e) => {
    let value = e.target.value;
    
    // Hapus karakter non-digit
    value = value.replace(/\D/g, '');
    
    // Display format dengan 0 di awal untuk UX yang lebih familiar
    let displayValue = value;
    
    // Jika user mengetik 08xxx, tampilkan seperti itu di input field
    if (value.length > 0) {
      // Pastikan selalu mulai dengan 0 jika tidak ada
      if (!value.startsWith('0')) {
        displayValue = '0' + value;
      } else {
        displayValue = value;
      }
    }
    
    // Batasi panjang maksimal (12 digit)
    displayValue = displayValue.slice(0, 15); // Max 15 digit karena 62 + 10 digit nomor lokal
    
    // Simpan nilai ke state (untuk database akan dikonversi saat submit)
    setNomorHp(displayValue);
  };

  // Function untuk memformat nomor HP saat disubmit ke backend
  const formatPhoneForDatabase = (phone) => {
    // Hapus awalan 0 dan tambahkan 62
    if (phone.startsWith('0')) {
      return '62' + phone.substring(1);
    }
    return phone;
  };

  // Modifikasi handleSubmit untuk memformat nomor HP
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Konversi nomor HP dari 08xxx ke 62xxx
    const formattedPhone = formatPhoneForDatabase(nomorHp);
    
    // Panggil handleSubmit asli dengan nomor HP yang sudah diformat
    handleSubmit(e, formattedPhone);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 pb-16">
        <h1 className="text-2xl font-bold text-center mb-6">Daftar - Data Alamat</h1>
        
        {/* Progress Indicator */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-full max-w-md relative">
            <div className="h-1 bg-gray-300 absolute top-1/2 left-0 right-0 -translate-y-1/2"></div>
            <div className="flex justify-between">
              <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center z-10">1</div>
              <div className="w-6 h-6 rounded-full bg-blue-900 text-white flex items-center justify-center z-10">2</div>
            </div>
          </div>
          <div className="flex justify-between w-full max-w-md mt-1 text-xs">
            <span className="text-gray-400">Data Pribadi</span>
            <span className="text-blue-900 font-medium">Data Alamat</span>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <InfoAlert 
            message="Masukkan kode pos untuk mengisi data kelurahan, kecamatan, kota dan provinsi secara otomatis."
            bgColor="bg-blue-50"
            textColor="text-blue-800"
          />

          <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
            {/* Same Address Checkbox */}
            <div className="flex items-start mb-2">
              <input
                id="isSameAddress"
                type="checkbox"
                checked={isSameAddress}
                onChange={handleSameAddressChange}
                className="mr-2 mt-1"
              />
              <label htmlFor="isSameAddress" className="text-sm">
                Alamat domisili sama dengan alamat KTP
              </label>
            </div>

            <FormField
              id="alamatDomisili"
              label="ALAMAT DOMISILI"
              type="textarea"
              placeholder="Alamat Sesuai Domisili"
              value={alamatDomisili}
              onChange={handleAlamatDomisiliChange}
              formSubmitted={formSubmitted}
              formErrors={formErrors}
              readOnly={isSameAddress}
              additionalClassName={isSameAddress ? "bg-gray-100" : ""}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="rtDomisili"
                label="RT"
                type="tel"
                inputMode="numeric"
                placeholder="RT Domisili"
                value={rtDomisili}
                onChange={(e) => setRtDomisili(e.target.value.replace(/\D/g, '').slice(0, 3))}
                maxLength={3}
                formSubmitted={formSubmitted}
                formErrors={formErrors}
                readOnly={isSameAddress}
                additionalClassName={isSameAddress ? "bg-gray-100" : ""}
              />
              
              <FormField
                id="rwDomisili"
                label="RW"
                type="tel"
                inputMode="numeric"
                placeholder="RW Domisili"
                value={rwDomisili}
                onChange={(e) => setRwDomisili(e.target.value.replace(/\D/g, '').slice(0, 3))}
                maxLength={3}
                formSubmitted={formSubmitted}
                formErrors={formErrors}
                readOnly={isSameAddress}
                additionalClassName={isSameAddress ? "bg-gray-100" : ""}
              />
            </div>
            
            {/* Improved Kode Pos field */}
            <div className="relative">
              <label htmlFor="kodePosStep2" className="block text-xs font-medium text-gray-500 uppercase mb-1">
                KODE POS {formErrors.kodePosStep2 && formSubmitted && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="flex items-center relative">
                <input
                  id="kodePosStep2"
                  type="tel"
                  inputMode="numeric"
                  placeholder="Kode Pos Sesuai Domisili"
                  value={kodePosStep2}
                  onChange={handleKodePosChange}
                  maxLength={5}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${formErrors.kodePosStep2 && formSubmitted ? 'border-red-500' : 'border-gray-300'} ${isSameAddress ? 'bg-gray-100' : ''}`}
                  readOnly={isSameAddress}
                />
                {!isSameAddress && (
                  <button
                    type="button"
                    onClick={() => handleKodePosChange({ target: { value: kodePosStep2 } })}
                    className="absolute right-2 text-blue-700 hover:text-blue-900 p-1 rounded-md"
                    aria-label="Cari kode pos"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                )}
              </div>
              {formErrors.kodePosStep2 && formSubmitted && (
                <p className="mt-1 text-xs text-red-500">{formErrors.kodePosStep2}</p>
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
                id="kelurahanStep2"
                label="KELURAHAN/DESA"
                type="text"
                placeholder="Kelurahan/Desa"
                value={kelurahanStep2}
                onChange={(e) => setKelurahanStep2(e.target.value)}
                formSubmitted={formSubmitted}
                formErrors={formErrors}
                readOnly={kelurahanStep2 || isSameAddress}
                additionalClassName={(kelurahanStep2 || isSameAddress) ? "bg-gray-100" : ""}
              />
              
              <FormField
                id="kecamatanStep2"
                label="KECAMATAN"
                type="text"
                placeholder="Kecamatan"
                value={kecamatanStep2}
                onChange={(e) => setKecamatanStep2(e.target.value)}
                formSubmitted={formSubmitted}
                formErrors={formErrors}
                readOnly={kecamatanStep2 || isSameAddress}
                additionalClassName={(kecamatanStep2 || isSameAddress) ? "bg-gray-100" : ""}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="kotaStep2"
                label="KABUPATEN/KOTA"
                type="text"
                placeholder="Kabupaten/Kota"
                value={kotaStep2}
                onChange={(e) => setKotaStep2(e.target.value)}
                formSubmitted={formSubmitted}
                formErrors={formErrors}
                readOnly={kotaStep2 || isSameAddress}
                additionalClassName={(kotaStep2 || isSameAddress) ? "bg-gray-100" : ""}
              />
              
              <FormField
                id="provinsiStep2"
                label="PROVINSI"
                type="text"
                placeholder="Provinsi"
                value={provinsiStep2}
                onChange={(e) => setProvinsiStep2(e.target.value)}
                formSubmitted={formSubmitted}
                formErrors={formErrors}
                readOnly={provinsiStep2 || isSameAddress}
                additionalClassName={(provinsiStep2 || isSameAddress) ? "bg-gray-100" : ""}
              />
            </div>

            <div className="border-t border-gray-200 my-6 pt-4">
              <h2 className="text-base font-medium mb-2">Data Kontak</h2>
            </div>
            
            <FormField
              id="email"
              label="EMAIL"
              type="email"
              placeholder="Email Aktif"
              value={email}
              onChange={handleEmailChange}
              formSubmitted={formSubmitted}
              formErrors={formErrors}
            />
            
            {/* Nomor HP dengan penanganan format 08xx -> 62xx */}
            <div className="mb-3">
              <label htmlFor="nomorHp" className="block text-xs font-medium text-gray-500 uppercase mb-1">
                NOMOR HP <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="nomorHp"
                  name="nomorHp"
                  type="tel"
                  inputMode="numeric"
                  value={nomorHp}
                  onChange={handlePhoneNumberChange}
                  placeholder="Contoh: 0812345678"
                  className={`appearance-none block w-full px-3 py-2 border ${formSubmitted && formErrors.nomorHp ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-800 focus:border-blue-800 text-sm`}
                />
              </div>
              {formSubmitted && formErrors.nomorHp && (
                <p className="mt-1 text-xs text-red-500">{formErrors.nomorHp}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Masukkan nomor HP dengan awalan 08
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-3">
                <label htmlFor="kataSandi" className="block text-xs font-medium text-gray-500 uppercase mb-1">
                  KATA SANDI <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="kataSandi"
                    type={showPassword ? "text" : "password"}
                    value={kataSandi}
                    onChange={(e) => setKataSandi(e.target.value)}
                    className={`appearance-none block w-full px-3 py-2 border ${formSubmitted && formErrors.kataSandi ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-800 focus:border-blue-800 text-sm pr-10`}
                    placeholder="Kata Sandi"
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {showPassword ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                {formSubmitted && formErrors.kataSandi && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.kataSandi}</p>
                )}
              </div>
              
              <div className="mb-3">
                <label htmlFor="konfirmasiKataSandi" className="block text-xs font-medium text-gray-500 uppercase mb-1">
                  KONFIRMASI KATA SANDI <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="konfirmasiKataSandi"
                    type={showConfirmPassword ? "text" : "password"}
                    value={konfirmasiKataSandi}
                    onChange={(e) => setKonfirmasiKataSandi(e.target.value)}
                    className={`appearance-none block w-full px-3 py-2 border ${formSubmitted && formErrors.konfirmasiKataSandi ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-800 focus:border-blue-800 text-sm pr-10`}
                    placeholder="Konfirmasi Kata Sandi"
                  />
                  <button 
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {showConfirmPassword ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
                {formSubmitted && formErrors.konfirmasiKataSandi && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.konfirmasiKataSandi}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-start mt-4">
              <input
                id="persetujuanSyarat"
                type="checkbox"
                checked={persetujuanSyarat}
                onChange={(e) => setPersetujuanSyarat(e.target.checked)}
                className="mr-2 mt-1"
              />
              <label htmlFor="persetujuanSyarat" className="text-sm">
                Saya menyetujui <a href="#" className="text-blue-600">Syarat & Ketentuan</a> serta <a href="#" className="text-blue-600">Kebijakan Privasi</a>
              </label>
            </div>
            {formSubmitted && formErrors.persetujuanSyarat && (
              <p className="mt-1 text-xs text-red-500">{formErrors.persetujuanSyarat}</p>
            )}
            
            {/* Fixed margin for the buttons so they're always fully visible */}
            <div className="mt-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={goBackToStep1}
                  className="w-full bg-gray-200 text-gray-700 py-3 rounded-md font-medium hover:bg-gray-300 transition-colors"
                >
                  Kembali
                </button>
                
                <button
                  type="submit"
                  disabled={isLoadingData}
                  className="w-full bg-blue-900 text-white py-3 rounded-md font-medium hover:bg-blue-800 transition-colors disabled:opacity-50 shadow-md"
                >
                  Bismillah Daftar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Add additional CSS for fixing button visibility on mobile */}
      <style jsx>{`
        @media (max-width: 768px) {
          .container {
            padding-bottom: 80px;
          }
          
          form {
            padding-bottom: 60px;
          }
          
          .mt-6.mb-6 {
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
        }
      `}</style>
    </div>
  );
};

export default AddressContactForm;