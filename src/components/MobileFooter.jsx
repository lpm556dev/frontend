import React from 'react';
import { useRouter } from 'next/navigation';

const MobileFooter = () => {
  const router = useRouter();
  
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-100 p-4 text-center border-t border-gray-200">
      <div className="text-sm text-gray-600">
        Sudah punya akun?{" "}
        <button 
          type="button"
          className="text-blue-800 font-medium"
          onClick={() => router.push('/login')}
        >
          Masuk
        </button>
      </div>
    </div>
  );
};

export default MobileFooter;