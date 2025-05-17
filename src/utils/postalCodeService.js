import axios from 'axios';

// Base URL untuk API kode pos
const API_URL = 'http://localhost:3333/api/users/kodepos';

// Timeout untuk request (dalam milidetik)
const REQUEST_TIMEOUT = 8000;

/**
 * Mengambil data lokasi berdasarkan kode pos dari API server
 * 
 * @param {string} kodePos - Kode pos (5 digit)
 * @returns {Promise<Object|null>} - Data lokasi atau null jika tidak ditemukan
 */
export const getPostalCodeData = async(kodePos) => {
    try {
        // Validasi input
        if (!kodePos || kodePos.length !== 5 || !/^\d{5}$/.test(kodePos)) {
            console.warn('Format kode pos tidak valid. Harap masukkan 5 digit angka.');
            return null;
        }

        // Konfigurasi axios dengan timeout dan headers
        const config = {
            timeout: REQUEST_TIMEOUT,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            params: {
                kode_pos: kodePos
            }
        };

        console.log(`Memanggil API: ${API_URL} dengan kode pos ${kodePos}`);

        // Memanggil API dengan axios
        const response = await axios.get(API_URL, config);

        console.log('API Response:', response.data);

        // Memeriksa status response
        if (response.status === 200 && response.data) {
            // Mengembalikan data dalam format yang dibutuhkan aplikasi
            return {
                kelurahan: response.data.kelurahan || '',
                kecamatan: response.data.kecamatan || '',
                kota: response.data.kota || '',
                provinsi: response.data.provinsi || '',
                kodePos: kodePos
            };
        } else {
            console.warn('Response API tidak valid:', response);
            return null;
        }
    } catch (error) {
        // Menangani error dari API
        console.error('Error saat mengambil data kode pos:', error.message);
        if (error.response) {
            console.error('Status error:', error.response.status);
            console.error('Data error:', error.response.data);
        } else if (error.request) {
            console.error('Tidak ada respons dari server:', error.request);
        }

        return null;
    }
};

/**
 * Fungsi utama untuk mendapatkan data kode pos
 * 
 * @param {string} kodePos - Kode pos (5 digit)
 * @returns {Promise<Object|null>} - Data lokasi atau null jika tidak ditemukan
 */
export const getPostalCodeDataSafe = async(kodePos) => {
    try {
        // Panggil API server
        const apiData = await getPostalCodeData(kodePos);
        return apiData;
    } catch (error) {
        console.error('Error pada getPostalCodeDataSafe:', error);
        return null;
    }
};