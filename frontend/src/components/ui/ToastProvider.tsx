'use client';

import { Toaster } from 'react-hot-toast';

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Define default options
        className: '',
        duration: 4000,
        style: {
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          color: '#4a3f3a',
          padding: '16px',
          borderRadius: '16px',
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(201, 168, 150, 0.2)',
          fontFamily: 'var(--font-vazirmatn)',
          fontSize: '14px',
          fontWeight: 500,
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
          style: {
            border: '1px solid rgba(16, 185, 129, 0.2)',
            background: 'rgba(255, 255, 255, 0.9)',
          }
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
          style: {
            border: '1px solid rgba(239, 68, 68, 0.2)',
            background: 'rgba(255, 255, 255, 0.9)',
          }
        },
      }}
    />
  );
};
