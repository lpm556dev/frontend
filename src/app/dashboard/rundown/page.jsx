"use client";

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const Rundown = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {/* Animated Back Button */}
      <motion.button
        onClick={() => router.back()}
        className="absolute top-6 left-6 text-blue-600 hover:text-blue-800 font-medium"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        ← Kembali
      </motion.button>

      {/* Animated Coming Soon Content */}
      <motion.div 
        className="flex-grow flex flex-col items-center justify-center px-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Floating Construction Icon */}
        <motion.div
          className="mb-8 text-6xl"
          animate={{ 
            y: [0, -15, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut"
          }}
        >
          🚧
        </motion.div>

        {/* Bouncing Title */}
        <motion.h1 
          className="text-3xl font-bold text-gray-800 mb-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
        >
          Fitur Sedang Dalam Pengembangan
        </motion.h1>

        {/* Typing Animation Text */}
        <motion.p 
          className="text-gray-600 max-w-md text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Kami sedang bekerja keras untuk menghadirkan fitur ini secepatnya!
        </motion.p>

        {/* Pulsing Coming Soon Badge */}
        <motion.div
          className="mt-8 bg-blue-100 text-blue-800 px-6 py-2 rounded-full font-medium"
          animate={{
            scale: [1, 1.05, 1],
            boxShadow: ["0 0 0 0 rgba(59, 130, 246, 0)", "0 0 0 10px rgba(59, 130, 246, 0.1)", "0 0 0 0 rgba(59, 130, 246, 0)"]
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut"
          }}
        >
          Coming Soon
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Rundown;