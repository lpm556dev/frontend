import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const Header = () => {
  const router = useRouter();
  
  const navigateToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <header className="bg-blue-900 text-white sticky top-0 z-50">
      <div className="container mx-auto px-3 py-3">
        <div className="flex justify-between items-center">
          {/* Tombol kembali di sebelah kiri */}
          <div className="flex items-center">
            <button 
              onClick={navigateToDashboard}
              className="text-white mr-3"
              aria-label="Back to Dashboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          </div>
          
          {/* Logo dan judul di tengah */}
          <div className="flex items-center">
            <Image 
              src="/img/logossg_white.png" 
              alt="Logo Santri Siap Guna" 
              width={28} 
              height={28} 
              className="mr-2"
            />
            <h1 className="text-xl font-bold">SANTRI SIAP GUNA</h1>
          </div>
          
          {/* Div kosong untuk menyeimbangkan layout */}
          <div className="w-6"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;