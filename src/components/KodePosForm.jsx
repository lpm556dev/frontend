import React, { useState } from "react";

/**
 * Component for handling postal code input and automatic address lookup
 */
const KodePosForm = ({ 
  kodePos, 
  setKodePos, 
  setKelurahan, 
  setKecamatan, 
  setKota, 
  setProvinsi
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Handler for postal code input
  const handleKodePosChange = (e) => {
    const newValue = e.target.value.replace(/[^0-9]/g, '').substring(0, 5);
    
    // Update postal code state - ensure it can always be changed
    setKodePos(newValue);
    
    // Reset messages if postal code length changes
    if (newValue.length !== 5) {
      setError(null);
      setSuccess(false);
    }
    
    // If postal code is 5 digits, look up the data
    if (newValue.length === 5) {
      fetchKodePos(newValue);
    }
  };
  
  // Function to fetch data from server
  const fetchKodePos = async (kodePosValue) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Call postal code API on server port 3333
      const response = await fetch(`http://localhost:3333/api/users/kodepos?kode_pos=${kodePosValue}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        cache: 'no-store'
      });
      
      // If response is OK
      if (response.ok) {
        const data = await response.json();
        console.log("Postal code data from server:", data);
        
        // Fill form with received data
        setKelurahan(data.kelurahan || "");
        setKecamatan(data.kecamatan || "");
        setKota(data.kota || "");
        setProvinsi(data.provinsi || "");
        
        // Set success status
        setSuccess(true);
      } else {
        // If server responds with error
        console.error(`Server responded with status: ${response.status}`);
        setError("Data kode pos tidak ditemukan. Harap isi alamat secara manual.");
      }
    } catch (error) {
      console.error("Error fetching postal code data:", error);
      setError("Failed to connect to server. Please fill address manually.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3">
      <div className="mb-3">
        <label htmlFor="kodePos" className="block text-xs font-medium text-gray-500 uppercase mb-1">
          KODE POS <span className="text-red-500">*</span>
        </label>
        <input
          id="kodePos"
          type="text"
          value={kodePos || ""}
          onChange={handleKodePosChange}
          placeholder="Enter 5-digit postal code"
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-800 focus:border-blue-800 text-sm"
          maxLength="5"
          disabled={loading}
        />
      </div>
      
      {loading && (
        <div className="mb-3 px-3 py-2 bg-gray-50 text-gray-700 text-sm rounded-md border border-gray-100 flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Looking up postal code data...
        </div>
      )}
      
      {error && (
        <div className="mb-3 px-3 py-2 bg-red-50 text-red-700 text-sm rounded-md border border-red-100">
          {error}
        </div>
      )}
      
      {success && !error && !loading && (
        <div className="mb-3 px-3 py-2 bg-green-50 text-green-700 text-sm rounded-md border border-green-100">
          Data kode pos berhasil ditemukan!
        </div>
      )}
    </div>
  );
};

export default KodePosForm;