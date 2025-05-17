"use client";

import { Toaster } from 'react-hot-toast';

// Toast provider to show notifications throughout the app
const ToastProvider = () => {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Default toast options
        duration: 5000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        // Customize specific toast types
        success: {
          duration: 3000,
          style: {
            background: '#22c55e',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#22c55e',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: '#ef4444',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#ef4444',
          },
        },
        loading: {
          duration: Infinity,
          style: {
            background: '#3b82f6',
          },
        },
      }}
    />
  );
};

export default ToastProvider;