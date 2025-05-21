"use client";

import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import useAuthStore from '../../../stores/authStore';
import QRCode from "react-qr-code";
import { motion } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import { toPng } from 'html-to-image';

export default function ECard() {
  const { user, loading, error, qrcode, fetchUserQRCode } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const frontCardRef = useRef();
  const backCardRef = useRef();

  useEffect(() => {
    fetchUserQRCode();
  }, [fetchUserQRCode]);

  const navigateBack = () => {
    window.history.back();
  };

  const handlePrint = async () => {
    setIsProcessing(true);

    try {
      // Convert cards to high-quality images
      const frontCardImg = await toPng(frontCardRef.current, {
        quality: 1,
        pixelRatio: 3, // Higher resolution for print
        cacheBust: true,
        backgroundColor: '#1E3A8A'
      });

      const backCardImg = await toPng(backCardRef.current, {
        quality: 1,
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: '#FFFFFF'
      });

      // Create a new window with the printable content
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Kartu Peserta SSG</title>
            <style>
              @page {
                size: 171.2mm 54mm; /* Double width for two cards */
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .cards-container {
                display: flex;
                width: 171.2mm;
                height: 54mm;
              }
              .card-img {
                width: 85.6mm;
                height: 54mm;
                object-fit: contain;
              }
              @media print {
                .no-print {
                  display: none !important;
                }
              }
            </style>
          </head>
          <body>
            <div class="cards-container">
              <img src="${frontCardImg}" class="card-img" />
              <img src="${backCardImg}" class="card-img" />
            </div>
            <script>
              setTimeout(() => {
                window.print();
                window.close();
              }, 1000);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error('Error generating print content:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="animate-spin h-12 w-12 mx-auto border-b-2 border-blue-800 rounded-full mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat data kartu...</p>
        </div>
      </div>
    );
  }

  if (qrcode === null) {
    return (
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
            onClick={navigateBack}
            className="bg-blue-800 text-white py-2 px-6 rounded-md font-medium hover:bg-blue-900 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
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
            onClick={navigateBack}
            className="bg-blue-800 text-white py-2 px-6 rounded-md font-medium hover:bg-blue-900 transition-colors"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Kartu Peserta Digital</title>
      </Head>

      <header className="bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <button
              onClick={navigateBack}
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

      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Kartu Peserta Digital</h1>

          {/* Preview cards */}
          <div className="flex flex-col md:flex-row gap-8 justify-center mb-10">
            {/* Front Card Preview - Printable version */}
            <div ref={frontCardRef} style={{ width: '85mm', height: '54mm' }} className="bg-blue-700 text-white rounded-xl overflow-hidden shadow-xl flex flex-col border-2 border-blue-800">
              <div className="flex h-full">
                <div className="w-2/5 bg-blue-900 flex flex-col justify-center items-center py-2 px-1">
                  <div className="bg-white p-1 rounded-lg mb-1">
                    <QRCode
                      value={qrcode}
                      size={80}
                      className="w-full h-auto"
                      bgColor="#FFFFFF"
                      fgColor="#1E3A8A"
                      level="H"
                    />
                  </div>
                  <p className="text-center text-[8px] font-medium text-blue-100 mt-1">Scan untuk presensi</p>
                </div>

                <div className="w-3/5 pl-3 flex flex-col py-3 pr-2">
                  <div className="flex items-center">
                    <Image
                      src="/img/logo_ssg.png"
                      alt="Logo"
                      width={24}
                      height={24}
                      className="mr-1"
                    />
                    <div>
                      <h3 className="text-[12px] font-bold leading-none tracking-wide">SANTRI SIAP GUNA</h3>
                      <p className="text-[8px] text-white font-medium">KARTU PESERTA</p>
                    </div>
                  </div>

                  <div className="flex-grow flex flex-col justify-center mt-1">
                    <h2 className="text-[14px] font-bold mb-1 text-white leading-tight">
                      {user?.name || "MUHAMAD BRILLIAN HAIKAL"}
                    </h2>

                    <div className="space-y-1 mt-2">
                      <div className="bg-blue-800 py-1 px-2 rounded-md text-[10px] font-medium">
                        Peserta Angkatan {user?.nis?.substring(0, 2) || qrcode?.substring(0, 2) || "20"}
                      </div>
                      <div className="bg-blue-800 py-1 px-2 rounded-md text-[10px] font-medium">
                        Pleton: {user?.pleton || "20"} / Grup {user?.grup || "B"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Back Card Preview - Printable version */}
            <div ref={backCardRef} style={{ width: '85mm', height: '54mm' }} className="bg-white rounded-xl overflow-hidden shadow-xl flex flex-col border-2 border-gray-200">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between px-4 pt-3 pb-1 border-b border-gray-200">
                  <Image
                    src="/img/logo_ssg.png"
                    alt="Santri Siap Guna Logo"
                    width={60}
                    height={16}
                    className="h-auto"
                  />
                </div>

                <div className="text-center my-2">
                  <h3 className="text-[10px] font-bold text-blue-900">ATURAN PENGGUNAAN KARTU</h3>
                </div>

                <div className="flex-grow px-4 overflow-visible pb-0">
                  <ol className="text-[8px] text-gray-800 list-decimal ml-3 mt-0 space-y-1.5">
                    <li className="font-medium leading-tight">Kartu ini adalah identitas resmi peserta SSG</li>
                    <li className="font-medium leading-tight">Wajib dibawa saat kegiatan SSG berlangsung</li>
                    <li className="font-medium leading-tight">Tunjukkan QR code untuk presensi kehadiran</li>
                    <li className="font-medium leading-tight">Segera laporkan kehilangan kartu kepada panitia</li>
                    <li className="font-medium leading-tight">Dilarang memodifikasi atau menggandakan kartu</li>
                  </ol>
                </div>

                <div className="bg-blue-50 py-2 px-2 text-[8px] text-blue-800 font-semibold text-center border-t border-blue-200">
                  Kartu ini hanya berlaku selama program Santri Siap Guna {user?.angkatan || "2025"}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <motion.button
              onClick={handlePrint}
              disabled={isProcessing}
              className="bg-blue-800 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-900 transition-colors flex items-center justify-center shadow-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mempersiapkan cetakan...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Cetak Kartu (Depan & Belakang)
                </>
              )}
            </motion.button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Kartu akan dicetak dalam 1 halaman PDF dengan sisi depan dan belakang berdampingan</p>
            <p className="mt-1">Gunakan kertas yang cukup tebal (minimal 260gsm) untuk hasil terbaik</p>
          </div>
        </div>
      </main>
    </div>
  );
}