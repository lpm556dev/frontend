import Cookies from 'js-cookie';

// Set token in both cookie and sessionStorage for better security
export const setToken = (token, userId) => {
    if (typeof window !== 'undefined') {
        // Set in sessionStorage (will be cleared when browser is closed)
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('userId', userId);

        // Also set in cookies for middleware to access
        Cookies.set('authToken', token, { secure: true, sameSite: 'strict' });
        Cookies.set('userId', userId, { secure: true, sameSite: 'strict' });
    }
};

// Get token from sessionStorage
export const getToken = () => {
    if (typeof window !== 'undefined') {
        return sessionStorage.getItem('authToken');
    }
    return null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
    if (typeof window !== 'undefined') {
        const token = sessionStorage.getItem('authToken');
        return !!token; // Convert to boolean
    }
    return false;
};

// Remove token from both sessionStorage and cookies
export const removeToken = () => {
    if (typeof window !== 'undefined') {
        // Clear from sessionStorage
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('userId');

        // Clear from cookies
        Cookies.remove('authToken');
        Cookies.remove('userId');
    }
};

// Logout function to clear all auth data
export const logout = () => {
    removeToken();
};