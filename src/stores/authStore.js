// stores/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      authToken: null,
      isAuthenticated: false,
      lastLoginTime: null,
      verify: null,
      role: null,
      qrcode : null,
      loading: false,
      error: null,
      login: (userData, token, userId) => {
        if (!token || !userId) {
          console.error('Invalid login data');
          return;
        }

        const normalizedUser = {
          userId,
          nomor_hp: userData.nomor_hp,
          email: userData.email,
          name: userData.name,
          fullData: userData.fullData
        };
      
        set({
          user: normalizedUser,
          authToken: token,
          isAuthenticated: true,
          lastLoginTime: new Date().toISOString(),
          verify: userData.user_verify?.isverified || 0,
          role: userData.userRole?.role || 'user' // fallback role kalau undefined
        });

        // Set secure cookies
        if (typeof window !== 'undefined') {
          Cookies.set('authToken', token, {
            expires: 1,
            path: '/',
            sameSite: 'Strict',
            secure: process.env.NODE_ENV === 'production'
          });

          Cookies.set('userId', userId.toString(), {
            expires: 1,
            path: '/',
            sameSite: 'Strict',
            secure: process.env.NODE_ENV === 'production'
          });
        }
      },

      logout: () => {
        set({
          user: null,
          authToken: null,
          isAuthenticated: false,
          lastLoginTime: null,
        });

        if (typeof window !== 'undefined') {
          Cookies.remove('authToken', { path: '/' });
          Cookies.remove('userId', { path: '/' });
          localStorage.removeItem('auth-storage');
        }
      },

      checkAuth: () => {
        const state = get();
        return !!(
          state.isAuthenticated && 
          state.authToken && 
          state.user?.userId && 
          new Date(state.lastLoginTime || 0) > new Date(Date.now() - 86400000) // 24h
        );
      },
      fetchUserQRCode: async () => {
        set({ loading: true, error: null })
        try {
          const user = get().user;
          const response = await fetch(`${API_URL}/users/user-qrcode?user_id=${user.userId}`)
          if (!response.ok) {
            throw new Error('Failed to fetch user data')
          }
          const userData = await response.json()
          console.log('userData', userData)
          set({ qrcode: userData.data.qrcode_text, loading: false })
        } catch (error) {
          set({ error: error.message, loading: false })
        }
      },
      updateUserProfile: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        authToken: state.authToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastLoginTime: state.lastLoginTime,
        verify: state.verify,
        role: state.role,
        qrcode: state.qrcode,
      }),
    }
  )
);

export default useAuthStore;