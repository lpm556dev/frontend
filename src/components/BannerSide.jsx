import React from 'react';
import { useRouter } from 'next/navigation';

const BannerSide = ({ signupStep }) => {
  const router = useRouter();

  return (
    <div className="hidden md:flex md:w-1/2 bg-blue-900 justify-center items-center p-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          {signupStep === 1 ? "Gabung Sekarang" : "Satu Langkah Lagi"}
        </h2>
        <p className="text-white text-sm mb-6">
          {signupStep === 1 
            ? "Lengkapi data diri anda sesuai KTP" 
            : "Lengkapi alamat dan kontak anda"}
        </p>
        
        <div className="flex justify-center space-x-2 mb-8">
          <div className={`w-3 h-3 rounded-full ${signupStep === 1 ? 'bg-white' : 'bg-white/50'}`}></div>
          <div className={`w-3 h-3 rounded-full ${signupStep === 2 ? 'bg-white' : 'bg-white/50'}`}></div>
        </div>
        
        <button
          type="button"
          className="inline-block py-2 px-6 border border-white rounded-full text-sm font-medium text-white hover:bg-white hover:text-blue-800 transition-colors"
          onClick={() => router.push('/login')}
        >
          Sudah punya akun? Bismillah masuk yuk
        </button>
      </div>
    </div>
  );
};

export default BannerSide;