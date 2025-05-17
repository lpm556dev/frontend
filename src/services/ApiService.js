/**
 * API Service untuk komunikasi dengan server database
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL;
class ApiService {
    /**
     * Memeriksa apakah NIK sudah terdaftar di database
     */
    static async checkNikExists(nik) {
        try {
            const response = await fetch(`${API_URL}/users/check-nik`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ nik }),
            });

            if (response.ok) {
                const data = await response.json();
                return data.exists;
            } else if (response.status === 400) {
                // Jika backend mengembalikan error 400 dengan pesan NIK sudah terdaftar
                const errorData = await response.json();
                return errorData.message && errorData.message.includes('NIK sudah terdaftar');
            }

            return false;
        } catch (error) {
            console.error('Error saat memeriksa NIK:', error);
            throw error; // Throw error agar dapat ditangkap di komponen
        }
    }

    /**
     * Mendaftarkan pengguna baru
     */
    static async registerUser(userData) {
        try {
            const response = await fetch(`${API_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const responseData = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    data: responseData,
                    userId: responseData.userId,
                    token: responseData.token
                };
            } else {
                return {
                    success: false,
                    error: responseData.message || responseData.error || 'Pendaftaran gagal',
                    status: response.status
                };
            }
        } catch (error) {
            console.error('Error saat pendaftaran:', error);
            throw error; // Throw error
        }
    }

    /**
     * Login pengguna
     */
    static async loginUser(phone, password) {
        try {
            const response = await fetch(`${API_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    nomor_hp: phone,
                    password
                })
            });

            const responseData = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    data: responseData,
                    userId: responseData.userId,
                    token: responseData.token
                };
            } else {
                return {
                    success: false,
                    error: responseData.message || 'Login gagal',
                    status: response.status
                };
            }
        } catch (error) {
            console.error('Error saat login:', error);
            throw error; // Throw error
        }
    }

    /**
     * Mendapatkan data kode pos
     */
    static async getPostalCodeData(kodePos) {
        try {
            const response = await fetch(`${API_URL}/users/kodepos?kode_pos=${kodePos}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                return { success: true, data: await response.json() };
            } else {
                const errorData = await response.json();
                return {
                    success: false,
                    error: errorData.message || 'Kode pos tidak ditemukan',
                    status: response.status
                };
            }
        } catch (error) {
            console.error('Error saat mengambil data kode pos:', error);
            throw error; // Throw error
        }
    }

    /**
     * Memeriksa koneksi server
     */
    static async checkHealth() {
        try {
            const response = await fetch(`${API_BASE_URL}/health-check`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                cache: 'no-store'
            });

            return response.ok;
        } catch (error) {
            console.warn('Health check gagal:', error);
            return false;
        }
    }

    /**
     * Logout pengguna
     */
    static async logoutUser() {
        try {
            const response = await fetch(`${API_BASE_URL}/users/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                return { success: true, message: 'Logout berhasil' };
            } else {
                return { success: false, error: 'Logout gagal' };
            }
        } catch (error) {
            console.error('Error saat logout:', error);
            throw error; // Throw error
        }
    }
}

export default ApiService;