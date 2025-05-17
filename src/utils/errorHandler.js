// utils/errorHandler.js
import { toast } from 'react-hot-toast';
import API_CONFIG from '../config/api';

/**
 * Handle API errors consistently across the application
 * @param {Error} error - The error object
 * @param {string} fallbackMessage - A default message to show if error doesn't have one
 * @param {boolean} showToast - Whether to show a toast notification
 * @returns {Object} Processed error information
 */
export const handleApiError = (error, fallbackMessage = 'Terjadi kesalahan', showToast = true) => {
    let message = fallbackMessage;
    let statusCode = null;

    // Extract error message if available
    if (error && error.message) {
        message = error.message;
    }

    // Handle network errors
    if (error && error.name === 'TypeError' && error.message.includes('Network')) {
        message = 'Koneksi ke server gagal. Periksa koneksi internet Anda.';
    }

    // Handle timeout errors
    if (error && error.name === 'AbortError') {
        message = 'Permintaan terlalu lama. Silakan coba lagi.';
    }

    // Extract HTTP status code if available
    if (error && error.status) {
        statusCode = error.status;

        // Customize messages based on status code
        switch (statusCode) {
            case API_CONFIG.STATUS.UNAUTHORIZED:
                message = 'Sesi Anda telah berakhir. Silakan login kembali.';
                // Optional: redirect to login page or refresh token
                break;
            case API_CONFIG.STATUS.FORBIDDEN:
                message = 'Anda tidak memiliki izin untuk aksi ini.';
                break;
            case API_CONFIG.STATUS.NOT_FOUND:
                message = 'Data yang Anda cari tidak ditemukan.';
                break;
            case API_CONFIG.STATUS.INTERNAL_SERVER_ERROR:
                message = 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
                break;
            default:
                // Use the message from the error
        }
    }

    // Show toast notification if requested
    if (showToast) {
        toast.error(message);
    }

    // Return processed error information
    return {
        message,
        statusCode,
        originalError: error
    };
};

/**
 * Wraps an async function with error handling
 * @param {Function} asyncFn - The async function to execute
 * @param {Object} options - Options for error handling
 * @returns {Function} A function that executes the asyncFn with error handling
 */
export const withErrorHandling = (asyncFn, options = {}) => {
    const {
        fallbackMessage = 'Terjadi kesalahan',
            showToast = true,
            onError = null
    } = options;

    return async(...args) => {
        try {
            return await asyncFn(...args);
        } catch (error) {
            const processedError = handleApiError(error, fallbackMessage, showToast);

            // Call custom error handler if provided
            if (onError && typeof onError === 'function') {
                onError(processedError);
            }

            throw processedError;
        }
    };
};

export default {
    handleApiError,
    withErrorHandling
};