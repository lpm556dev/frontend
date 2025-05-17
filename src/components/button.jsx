"use client";

import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, onClick, className = '', type = 'button' }) => {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={`bg-blue-900 text-white font-bold py-2 px-6 md:py-3 md:px-10 text-sm md:text-base rounded-full hover:bg-blue-800 transition-colors ${className}`}
      whileHover={{ 
        scale: 1.05,
        backgroundColor: "#0A2F52" 
      }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 10,
        delay: 0.6
      }}
    >
      {children}
    </motion.button>
  );
};

export default Button;