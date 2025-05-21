"use client";

import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import useAuthStore from '../../../stores/authStore';
import QRCode from "react-qr-code";
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function ECard() {
  const { user, loading, error, qrcode, fetchUserQRCode } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const frontCardRef = useRef(null);
  const backCardRef = useRef(null);

  useEffect(() => {
    fetchUserQRCode();
  }, [fetchUserQRCode]);

  const navigateBack = () => {
    window.history.back();
  };

  const sanitizeElements = (element) => {
    // Skip SVG elements
    if (element instanceof SVGElement) return;

    // Preserve essential classes
    const essentialClasses = [
      'flex', 'flex-col', 'items-center', 'justify-center', 'rounded-lg', 
      'shadow-md', 'bg-blue-700', 'bg-blue-900', 'bg-white', 'bg-blue-800',
      'text-white', 'text-blue-100', 'text-blue-800', 'text-gray-800',
      'w-2/5', 'w-3/5', 'h-full', 'p-2', 'p-3', 'p-4', 'py-1', 'py-2',
      'px-3', 'px-4', 'mb-2', 'mr-2', 'ml-4', 'mt-2', 'space-y-2'
    ];
    
    const currentClasses = element.className.split(' ').filter(cls => 
      essentialClasses.includes(cls) || 
      cls.startsWith('text-') ||
      cls.startsWith('bg-') ||
      cls.startsWith('border-') ||
      cls.startsWith('rounded-')
    ).join(' ');

    element.className = currentClasses;

    // Force specific styles for printing
    element.style.fontFamily = "'Inter', sans-serif";
    element.style.fontWeight = element.style.fontWeight || '500';
    element.style.boxShadow = element.style.boxShadow || 'none';
    element.style.border = element.style.border || 'none';

    if (element.tagName === 'IMG') {
      element.style.objectFit = 'contain';
    }

    Array.from(element.children).forEach(child => sanitizeElements(child));
  };

  const generatePDF = async () => {
    setIsProcessing(true);
    
    try {
      // Create clones of the cards
      const frontClone = frontCardRef.current.cloneNode(true);
      const backClone = backCardRef.current.cloneNode(true);

      // Apply sanitization
      sanitizeElements(frontClone);
      sanitizeElements(backClone);

      // Create a temporary container
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '400px';
      tempContainer.style.height = '250px';
      tempContainer.appendChild(frontClone);
      tempContainer.appendChild(backClone);
      document.body.appendChild(tempContainer);

      await new Promise(resolve => setTimeout(resolve, 300));

      // Create PDF with credit card dimensions (85.6mm × 53.98mm)
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85.6, 53.98]
      });

      // Canvas options
      const canvasOptions = {
        scale: 3,
        logging: false,
        useCORS: true,
        backgroundColor: null,
        allowTaint: true,
        width: 400,
        height: 250
      };

      // Front card
      const frontCanvas = await html2canvas(frontClone, canvasOptions);
      pdf.addImage(frontCanvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, 85.6, 53.98);

      // Back card
      pdf.addPage([85.6, 53.98], 'landscape');
      const backCanvas = await html2canvas(backClone, canvasOptions);
      pdf.addImage(backCanvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, 85.6, 53.98);

      // Save and auto-print
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl);
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          URL.revokeObjectURL(pdfUrl);
        };
      }

      document.body.removeChild(tempContainer);

    } catch (err) {
      console.error('PDF Error:', err);
      alert('Gagal membuat PDF. Pastikan:\n1. Menggunakan browser terbaru\n2. Tidak menggunakan mode penyamaran\n3. Mengizinkan pop-up');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (qrcode === null) {
    return <NotRegisteredScreen onBack={navigateBack} />;
  }

  if (error) {
    return <ErrorScreen onBack={navigateBack} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Kartu Peserta Digital</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <Header onBack={navigateBack} />

      <main className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Kartu Peserta Digital</h1>
        
        <div className="flex flex-col md:flex-row gap-8 justify-center">
          {/* Front Card */}
          <motion.div 
            ref={frontCardRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-blue-700 text-white rounded-xl overflow-hidden shadow-xl w-full md:w-[400px] h-[250px] flex flex-col"
          >
            <div className="flex h-full">
              <div className="w-2/5 bg-blue-900 flex flex-col justify-center items-center py-3 px-3">
                <div className="bg-white p-2 rounded-lg mb-2 shadow-md">
                  <QRCode 
                    value={qrcode} 
                    size={120} 
                    className="w-full h-auto"
                  />
                </div>
                <p className="text-center text-xs font-medium text-blue-100">Scan untuk verifikasi</p>
              </div>
              
              <div className="w-3/5 pl-3 flex flex-col py-4 pr-3">
                <div className="flex items-center">
                  <Image 
                    src="/img/logossg_white.png" 
                    alt="Logo" 
                    width={32} 
                    height={32} 
                    className="mr-2"
                  />
                  <div>
                    <h3 className="text-lg font-bold leading-none tracking-wide">SANTRI SIAP</h3>
                    <h3 className="text-lg font-bold leading-none tracking-wide">GUNA</h3>
                    <p className="text-xs text-white font-medium">KARTU PESERTA</p>
                  </div>
                </div>
                
                <div className="flex-grow flex flex-col justify-center mt-2">
                  <h2 className="text-xl font-bold mb-2 text-white">
                    {user?.name || "MUHAMAD BRILLIAN HAIKAL"}
                  </h2>
                  
                  <div className="space-y-2">
                    <div className="bg-blue-800 py-1.5 px-3 rounded-md text-sm font-medium">
                      Peserta Angkatan 2025
                    </div>
                    <div className="bg-blue-800 py-1.5 px-3 rounded-md text-sm font-medium">
                      Pleton: {user?.pleton || "20"} / Grup {user?.grup || "B"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Back Card */}
          <motion.div 
            ref={backCardRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-xl overflow-hidden shadow-xl w-full md:w-[400px] h-[250px] flex flex-col"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-4 pt-2 pb-1 border-b border-gray-100">
                <Image 
                  src="/img/logo_ssg.png" 
                  alt="Santri Siap Guna Logo" 
                  width={80} 
                  height={22} 
                  className="h-auto"
                />
                <Image 
                  src="/img/logo_DT READY.png" 
                  alt="DT Logo" 
                  width={24} 
                  height={24} 
                />
              </div>
              
              <div className="text-center my-1">
                <h3 className="text-sm font-bold text-blue-900">ATURAN PENGGUNAAN KARTU</h3>
              </div>

              <div className="flex-grow px-4 overflow-visible pb-1">
                <ol className="text-xs text-gray-800 list-decimal ml-4 mt-0 space-y-0.5">
                  <li className="font-medium leading-tight">Kartu ini adalah identitas resmi peserta SSG</li>
                  <li className="font-medium leading-tight">Wajib dibawa saat kegiatan SSG berlangsung</li>
                  <li className="font-medium leading-tight">Tunjukkan QR code untuk presensi kehadiran</li>
                  <li className="font-medium leading-tight">Segera laporkan kehilangan kartu kepada panitia</li>
                </ol>
              </div>

              <div className="bg-blue-50 py-1.5 px-4 text-xs text-blue-800 font-semibold text-center border-t border-blue-100">
                Kartu ini hanya berlaku selama program Santri Siap Guna 2025
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex justify-center mt-10">
          <PrintButton 
            onClick={generatePDF}
            isProcessing={isProcessing}
          />
        </div>
      </main>
    </div>
  );
}

// Component abstractions for better readability
const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="bg-white p-8 rounded-xl shadow-lg text-center">
      <div className="animate-spin h-12 w-12 mx-auto border-b-2 border-blue-800 rounded-full mb-4"></div>
      <p className="text-gray-600 font-medium">Memuat data kartu...</p>
    </div>
  </div>
);

const NotRegisteredScreen = ({ onBack }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md mx-auto">
      <div className="text-orange-500 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Belum Terdaftar</h2>
      <p className="text-gray-600 mb-6">Anda belum terdaftar sebagai peserta Santri Siap Guna.</p>
      <button 
        onClick={onBack} 
        className="bg-blue-800 text-white py-2 px-6 rounded-md font-medium hover:bg-blue-900 transition-colors"
      >
        Kembali
      </button>
    </div>
  </div>
);

const ErrorScreen = ({ onBack }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md mx-auto">
      <div className="text-red-500 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
      <p className="text-gray-600 mb-6">Kamu belum terdaftar sebagai peserta atau terjadi kesalahan saat memuat data.</p>
      <button 
        onClick={onBack} 
        className="bg-blue-800 text-white py-2 px-6 rounded-md font-medium hover:bg-blue-900 transition-colors"
      >
        Kembali
      </button>
    </div>
  </div>
);

const Header = ({ onBack }) => (
  <header className="bg-blue-900 text-white shadow-lg">
    <div className="container mx-auto px-4 py-4 relative">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
        <button 
          onClick={onBack}
          className="text-white"
          aria-label="Kembali ke dashboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      </div>
      
      <div className="flex items-center justify-center">
        <Image 
          src="/img/logossg_white.png" 
          alt="Santri Siap Guna Logo" 
          width={40} 
          height={40} 
          className="mr-3"
        />
        <span className="text-xl font-bold tracking-tight">SANTRI SIAP GUNA</span>
      </div>
    </div>
  </header>
);

const PrintButton = ({ onClick, isProcessing }) => (
  <button 
    onClick={onClick}
    disabled={isProcessing}
    className="bg-blue-800 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-900 transition-colors flex items-center justify-center shadow-sm"
  >
    {isProcessing ? (
      <>
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Membuat PDF...
      </>
    ) : (
      <>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Cetak Kartu (via PDF)
      </>
    )}
  </button>
);