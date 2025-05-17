"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import PersonalDataForm from '../../../components/PersonalDataForm';
import AddressContactForm from '../../../components/AddressContactForm';
import BannerSide from '../../../components/BannerSide';
import MobileFooter from '../../../components/MobileFooter';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SignupPage = () => {
  const router = useRouter();
  
  // State for controlling step
  const [signupStep, setSignupStep] = useState(1);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Personal Data (Step 1)
  const [name, setName] = useState('');
  const [nik, setNik] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [address, setAddress] = useState('');
  const [rt, setRt] = useState('');
  const [rw, setRw] = useState('');
  const [kodePos, setKodePos] = useState('');
  const [kelurahan, setKelurahan] = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [kota, setKota] = useState('');
  const [provinsi, setProvinsi] = useState('');
  
  // Address & Contact Data (Step 2)
  const [isSameAddress, setIsSameAddress] = useState(false);
  const [alamatDomisili, setAlamatDomisili] = useState('');
  const [rtDomisili, setRtDomisili] = useState('');
  const [rwDomisili, setRwDomisili] = useState('');
  const [kodePosStep2, setKodePosStep2] = useState('');
  const [kelurahanStep2, setKelurahanStep2] = useState('');
  const [kecamatanStep2, setKecamatanStep2] = useState('');
  const [kotaStep2, setKotaStep2] = useState('');
  const [provinsiStep2, setProvinsiStep2] = useState('');
  const [email, setEmail] = useState('');
  const [nomorHp, setNomorHp] = useState('');
  const [kataSandi, setKataSandi] = useState('');
  const [konfirmasiKataSandi, setKonfirmasiKataSandi] = useState('');
  const [persetujuanSyarat, setPersetujuanSyarat] = useState(false);
  
  // States for postal code selection modals
  const [postalCodeResults, setPostalCodeResults] = useState([]);
  const [showPostalCodeModal, setShowPostalCodeModal] = useState(false);
  const [currentPostalCodeStep, setCurrentPostalCodeStep] = useState(null); // 1 or 2
  
  // Handle Same Address Checkbox
  const handleSameAddressChange = (e) => {
    const isChecked = e.target.checked;
    setIsSameAddress(isChecked);
    
    if (isChecked) {
      // Copy address data from Step 1 to Step 2
      setAlamatDomisili(address);
      setRtDomisili(rt);
      setRwDomisili(rw);
      setKodePosStep2(kodePos);
      setKelurahanStep2(kelurahan);
      setKecamatanStep2(kecamatan);
      setKotaStep2(kota);
      setProvinsiStep2(provinsi);
    } else {
      // Clear the fields if unchecked
      setAlamatDomisili('');
      setRtDomisili('');
      setRwDomisili('');
      setKodePosStep2('');
      setKelurahanStep2('');
      setKecamatanStep2('');
      setKotaStep2('');
      setProvinsiStep2('');
    }
  };
  
  // Generic function to handle postal code lookup
  const handleKodePosLookup = async (postalCode, setters, step) => {
    if (!postalCode || postalCode.length !== 5) {
      // Clear address fields if postal code is incomplete
      setters.setKelurahan('');
      setters.setKecamatan('');
      setters.setKota('');
      setters.setProvinsi('');
      return;
    }
    
    try {
      setIsLoadingData(true);
      
      // Fetch data from the server
      const response = await fetch(`${API_URL}/users/kodepos?kode_pos=${postalCode}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          if (data.length === 1) {
            // Only one result, automatically fill the form
            const result = data[0];
            setters.setKelurahan(result.kelurahan || "");
            setters.setKecamatan(result.kecamatan || "");
            setters.setKota(result.kota || "");
            setters.setProvinsi(result.provinsi || "");
            
            // Clear any previous error
            setFormErrors(prev => {
              const newErrors = {...prev};
              delete newErrors[setters.errorKey];
              return newErrors;
            });
          } else {
            // Multiple results, show selection modal
            setPostalCodeResults(data);
            setShowPostalCodeModal(true);
            setCurrentPostalCodeStep(step);
          }
        } else {
          // No results found
          setFormErrors(prev => ({
            ...prev,
            [setters.errorKey]: "Data kode pos tidak ditemukan. Harap isi alamat secara manual."
          }));
          
          // Clear address fields
          setters.setKelurahan('');
          setters.setKecamatan('');
          setters.setKota('');
          setters.setProvinsi('');
        }
      } else {
        console.error(`Server responded with status: ${response.status}`);
        setFormErrors(prev => ({
          ...prev,
          [setters.errorKey]: "Data kode pos tidak ditemukan. Harap isi alamat secara manual."
        }));
      }
    } catch (error) {
      console.error('Error fetching postal code data:', error);
      setFormErrors(prev => ({
        ...prev,
        [setters.errorKey]: "Gagal terhubung ke server. Silakan isi alamat secara manual."
      }));
    } finally {
      setIsLoadingData(false);
    }
  };
  
  // Handle postal code change for Step 1
  const handleKodePosChangeStep1 = (e) => {
    const newValue = e.target.value.replace(/[^0-9]/g, '').substring(0, 5);
    setKodePos(newValue);
    
    if (newValue.length === 5) {
      handleKodePosLookup(newValue, {
        setKelurahan,
        setKecamatan,
        setKota,
        setProvinsi,
        errorKey: 'kodePos'
      }, 1);
    }
  };
  
  // Handle postal code change for Step 2
  const handleKodePosChangeStep2 = (e) => {
    if (isSameAddress) return; // Don't allow changes if same address is checked
    
    const newValue = e.target.value.replace(/[^0-9]/g, '').substring(0, 5);
    setKodePosStep2(newValue);
    
    if (newValue.length === 5) {
      handleKodePosLookup(newValue, {
        setKelurahan: setKelurahanStep2,
        setKecamatan: setKecamatanStep2,
        setKota: setKotaStep2,
        setProvinsi: setProvinsiStep2,
        errorKey: 'kodePosStep2'
      }, 2);
    }
  };
  
  // Handle selection from postal code results
  const handlePostalCodeSelection = (result) => {
    if (currentPostalCodeStep === 1) {
      // Apply selected data to Step 1 fields
      setKelurahan(result.kelurahan || "");
      setKecamatan(result.kecamatan || "");
      setKota(result.kota || "");
      setProvinsi(result.provinsi || "");
      
      // Clear any previous error
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.kodePos;
        return newErrors;
      });
    } else if (currentPostalCodeStep === 2) {
      // Apply selected data to Step 2 fields
      setKelurahanStep2(result.kelurahan || "");
      setKecamatanStep2(result.kecamatan || "");
      setKotaStep2(result.kota || "");
      setProvinsiStep2(result.provinsi || "");
      
      // Clear any previous error
      setFormErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.kodePosStep2;
        return newErrors;
      });
    }
    
    // Close the modal
    setShowPostalCodeModal(false);
    setPostalCodeResults([]);
    setCurrentPostalCodeStep(null);
  };
  
  // Handle Step 1 submission (Personal Data)
  const handleStep1Submit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    // Basic validation
    const errors = {};
    if (!name) errors.name = "Nama lengkap harus diisi";
    if (!nik || nik.length !== 16) errors.nik = "NIK harus 16 digit";
    if (!birthPlace) errors.birthPlace = "Tempat lahir harus diisi";
    if (!birthDate) errors.birthDate = "Tanggal lahir harus diisi";
    if (!gender) errors.gender = "Jenis kelamin harus dipilih";
    if (!bloodType) errors.bloodType = "Golongan darah harus dipilih";
    if (!address) errors.address = "Alamat harus diisi";
    if (!rt) errors.rt = "RT harus diisi";
    if (!rw) errors.rw = "RW harus diisi";
    if (!kodePos || kodePos.length !== 5) errors.kodePos = "Kode pos harus 5 digit";
    if (!kelurahan) errors.kelurahan = "Kelurahan/desa harus diisi";
    if (!kecamatan) errors.kecamatan = "Kecamatan harus diisi";
    if (!kota) errors.kota = "Kabupaten/Kota harus diisi";
    if (!provinsi) errors.provinsi = "Provinsi harus diisi";
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      // Proceed to step 2
      setSignupStep(2);
      setFormSubmitted(false);
      
      // If same address is checked, copy address from step 1
      if (isSameAddress) {
        handleSameAddressChange({ target: { checked: true } });
      }
    }
  };
  
  // Handle Step 2 submission (Address & Contact)
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    // Basic validation
    const errors = {};
    if (!alamatDomisili) errors.alamatDomisili = "Alamat domisili harus diisi";
    if (!rtDomisili) errors.rtDomisili = "RT domisili harus diisi";
    if (!rwDomisili) errors.rwDomisili = "RW domisili harus diisi";
    if (!kodePosStep2 || kodePosStep2.length !== 5) errors.kodePosStep2 = "Kode pos harus 5 digit";
    if (!kelurahanStep2) errors.kelurahanStep2 = "Kelurahan harus diisi";
    if (!kecamatanStep2) errors.kecamatanStep2 = "Kecamatan harus diisi";
    if (!kotaStep2) errors.kotaStep2 = "Kabupaten/Kota harus diisi";
    if (!provinsiStep2) errors.provinsiStep2 = "Provinsi harus diisi";
    if (!email) errors.email = "Email harus diisi";
    if (!nomorHp) errors.nomorHp = "Nomor HP harus diisi";
    if (!kataSandi) errors.kataSandi = "Kata sandi harus diisi";
    if (kataSandi !== konfirmasiKataSandi) errors.konfirmasiKataSandi = "Konfirmasi kata sandi tidak cocok";
    if (!persetujuanSyarat) errors.persetujuanSyarat = "Anda harus menyetujui syarat dan ketentuan";
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      try {
        setIsLoadingData(true);
        
        // Prepare user data for registration
        const userData = {
          // Personal data
          nama_lengkap: name,
          nik: nik,
          tempat_lahir: birthPlace,
          tanggal_lahir: birthDate,
          jenis_kelamin: gender === '1' ? '1' : '0',
          golongan_darah: bloodType,
          alamat: address,
          rt: rt,
          rw: rw,
          kode_pos: kodePos,
          kelurahan_desa: kelurahan,
          kecamatan: kecamatan,
          kabupaten_kota: kota,
          provinsi: provinsi,
          // Address & contact data
          domisili_alamat: alamatDomisili,
          domisili_rt: rtDomisili,
          domisili_rw: rwDomisili,
          domisili_kode_pos: kodePosStep2,
          domisili_kelurahan_desa: kelurahanStep2,
          domisili_kecamatan: kecamatanStep2,
          domisili_kabupaten_kota: kotaStep2,
          domisili_provinsi: provinsiStep2,
          email: email,
          nomor_hp: nomorHp,
          password: kataSandi
        };
        
        // Send registration request to server
        const response = await fetch(`${API_URL}/users/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(userData)
        });
        
        const responseData = await response.json();
        console.log("respondata", responseData.message)
        if (response.ok) {
          // Registration successful
          toast.success("Pendaftaran telah berhasil");
          router.push('/login');
        } else {
          toast.error("Gagal daftar ", responseData);
          // Handle registration errors
          if (response.status === 400 && responseData.message && responseData.message.includes('NIK sudah terdaftar')) {
            setSignupStep(1);
            setFormErrors({ nik: "NIK ini sudah terdaftar. Silakan gunakan NIK lain atau login dengan NIK ini" });
          } else if (response.status === 400 && responseData.message && responseData.message.includes('Nomor HP sudah terdaftar')) {
            setFormErrors({ nomorHp: "Nomor HP ini sudah terdaftar. Silakan gunakan nomor HP lain atau login." });
          } else {
            setFormErrors({ 
              server: responseData.message || responseData.error || 'Terjadi kesalahan saat pendaftaran. Silakan coba lagi.' 
            });
          }
        }
      } catch (error) {
        console.error('Error saat pendaftaran:', error);
        setFormErrors({ 
          server: 'Gagal terhubung ke server. Silakan coba lagi nanti.' 
        });
      } finally {
        setIsLoadingData(false);
      }
    }
  };
  
  // Go back to step 1
  const goBackToStep1 = () => {
    setSignupStep(1);
    setFormSubmitted(false);
  };

  // Render postal code selection modal
  const renderPostalCodeModal = () => {
    if (!showPostalCodeModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Pilih Alamat</h3>
          <p className="text-sm text-gray-600 mb-4">
            Terdapat beberapa alamat dengan kode pos yang sama. Silakan pilih alamat yang sesuai:
          </p>
          
          <div className="max-h-64 overflow-y-auto">
            {postalCodeResults.map((result, index) => (
              <button
                key={index}
                className="w-full text-left p-3 hover:bg-gray-100 border-b border-gray-200 flex flex-col"
                onClick={() => handlePostalCodeSelection(result)}
              >
                <span className="font-medium">{result.kelurahan}</span>
                <span className="text-sm text-gray-600">
                  {result.kecamatan}, {result.kota}, {result.provinsi}
                </span>
              </button>
            ))}
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setShowPostalCodeModal(false);
                setPostalCodeResults([]);
                setCurrentPostalCodeStep(null);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Form Side */}
      <div className="w-full md:w-1/2 overflow-y-auto">
        {signupStep === 1 ? (
          <PersonalDataForm 
            formData={{ 
              name, nik, birthPlace, birthDate, gender, bloodType, 
              address, rt, rw, kodePos, kelurahan, kecamatan, kota, provinsi 
            }}
            setters={{ 
              setName, setNik, setBirthPlace, setBirthDate, setGender, setBloodType,
              setAddress, setRt, setRw, setKodePos, setKelurahan, setKecamatan, setKota, setProvinsi
            }}
            formErrors={formErrors}
            formSubmitted={formSubmitted}
            isLoadingData={isLoadingData}
            handleSubmit={handleStep1Submit}
            handleKodePosChange={handleKodePosChangeStep1}
          />
        ) : (
          <AddressContactForm 
            formData={{ 
              alamatDomisili, rtDomisili, rwDomisili, kodePosStep2, 
              kelurahanStep2, kecamatanStep2, kotaStep2, provinsiStep2,
              email, nomorHp, kataSandi, konfirmasiKataSandi, persetujuanSyarat,
              isSameAddress
            }}
            setters={{ 
              setAlamatDomisili, setRtDomisili, setRwDomisili, setKodePosStep2,
              setKelurahanStep2, setKecamatanStep2, setKotaStep2, setProvinsiStep2,
              setEmail, setNomorHp, setKataSandi, setKonfirmasiKataSandi, setPersetujuanSyarat,
              setIsSameAddress
            }}
            passwordVisibility={{
              showPassword, setShowPassword,
              showConfirmPassword, setShowConfirmPassword
            }}
            formErrors={formErrors}
            formSubmitted={formSubmitted}
            isLoadingData={isLoadingData}
            goBackToStep1={goBackToStep1}
            handleSubmit={handleStep2Submit}
            handleKodePosChange={handleKodePosChangeStep2}
            addressFromStep1={{
              address, rt, rw, kodePos, kelurahan, kecamatan, kota, provinsi
            }}
            handleSameAddressChange={handleSameAddressChange}
          />
        )}
      </div>
      
      {/* Right side - Blue banner */}
      <BannerSide signupStep={signupStep} />
      
      {/* Mobile-only footer for login link */}
      <MobileFooter />
      
      {/* Postal Code Selection Modal */}
      {renderPostalCodeModal()}
    </div>
  );
};

export default SignupPage;

