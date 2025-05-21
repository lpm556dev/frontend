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
  const qrCodeRef = useRef(null);

  useEffect(() => {
    fetchUserQRCode();
  }, [fetchUserQRCode]);

  useEffect(() => {
    document.body.style.overflow = isProcessing ? 'hidden' : '';
  }, [isProcessing]);

  const navigateBack = () => {
    window.history.back();
  };

  const sanitizeElements = (element) => {
    if (!(element instanceof SVGElement)) {
      element.className = '';
    }

    const bgColors = {
      'bg-blue-700': '#1d4ed8',
      'bg-blue-900': '#1e3a8a',
      'bg-blue-800': '#1e40af',
      'bg-white': '#ffffff',
      'bg-blue-50': '#eff6ff'
    };

    const textColors = {
      'text-white': '#ffffff',
      'text-blue-100': '#dbeafe',
      'text-blue-800': '#1e40af',
      'text-gray-800': '#1f2937'
    };

    Object.entries(bgColors).forEach(([twClass, hex]) => {
      if(element.getAttribute('class')?.includes(twClass)) {
        element.style.backgroundColor = hex;
      }
    });

    Object.entries(textColors).forEach(([twClass, hex]) => {
      if(element.getAttribute('class')?.includes(twClass)) {
        element.style.color = hex;
      }
    });

    if (!element.style.backgroundColor) {
      element.style.backgroundColor = '#ffffff';
    }

    element.style.boxShadow = 'none';
    element.style.filter = 'none';

    Array.from(element.children).forEach(child => sanitizeElements(child));
  };

  const generateAndPrintPDF = async () => {
    setIsProcessing(true);

    try {
      const frontClone = frontCardRef.current.cloneNode(true);
      const backClone = backCardRef.current.cloneNode(true);

      sanitizeElements(frontClone);
      sanitizeElements(backClone);

      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.appendChild(frontClone);
      tempContainer.appendChild(backClone);
      document.body.appendChild(tempContainer);

      await new Promise(resolve => setTimeout(resolve, 500));

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85, 54]
      });

      const canvasOptions = {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: null,
        allowTaint: true
      };

      const frontCanvas = await html2canvas(frontClone, canvasOptions);
      pdf.addImage(frontCanvas.toDataURL('image/png'), 'PNG', 0, 0, 85, 54);

      const backCanvas = await html2canvas(backClone, canvasOptions);
      pdf.addPage([85, 54], 'landscape');
      pdf.addImage(backCanvas.toDataURL('image/png'), 'PNG', 0, 0, 85, 54);

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

  if (loading || error || qrcode === null) {
    const message = error
      ? 'Terjadi Kesalahan Saat Memuat Data'
      : qrcode === null
      ? 'Anda belum terdaftar sebagai peserta Santri Siap Guna.'
      : 'Memuat data kartu...';

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md mx-auto">
          <p className="text-gray-600 font-medium">{message}</p>
          <button onClick={navigateBack} className="mt-6 bg-blue-800 text-white py-2 px-6 rounded-md font-medium hover:bg-blue-900">
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
        <style>{`
          * {
            font-family: 'Inter', sans-serif !important;
          }
        `}</style>
      </Head>

      <header className="bg-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-center items-center">
          <Image src="/img/logossg_white.png" alt="Logo" width={40} height={40} className="mr-3" />
          <span className="text-xl font-bold tracking-tight">SANTRI SIAP GUNA</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Kartu Peserta Digital</h1>

        <div className="flex flex-col md:flex-row gap-8 justify-center">
          {/* Kartu Depan */}
          <motion.div
            ref={frontCardRef}
            className="bg-blue-700 text-white rounded-xl overflow-hidden shadow-xl w-full md:w-[400px] h-[250px] flex"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-2/5 bg-blue-900 flex flex-col justify-center items-center p-3">
              <div className="bg-white p-2 rounded-lg mb-2 shadow-md">
                <QRCode value={qrcode} size={120} className="w-full h-auto" />
              </div>
              <p className="text-xs font-medium text-blue-100 text-center">Scan untuk verifikasi</p>
            </div>
            <div className="w-3/5 pl-3 flex flex-col py-4 pr-3">
              <div className="flex items-center">
                <Image src="/img/logossg_white.png" alt="Logo" width={32} height={32} className="mr-2" />
                <div>
                  <h3 className="text-lg font-bold leading-none">SANTRI SIAP</h3>
                  <h3 className="text-lg font-bold leading-none">GUNA</h3>
                  <p className="text-xs font-medium">KARTU PESERTA</p>
                </div>
              </div>
              <div className="flex-grow flex flex-col justify-center mt-2">
                <h2 className="text-xl font-bold mb-2">{user?.name || 'Nama Peserta'}</h2>
                <div className="space-y-2">
                  <div className="bg-blue-800 py-1.5 px-3 rounded-md text-sm font-medium">Peserta Angkatan 2025</div>
                  <div className="bg-blue-800 py-1.5 px-3 rounded-md text-sm font-medium">Pleton: {user?.pleton || '-'} / Grup {user?.grup || '-'}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Kartu Belakang */}
          <motion.div
            ref={backCardRef}
            className="bg-white rounded-xl overflow-hidden shadow-xl w-full md:w-[400px] h-[250px] flex flex-col"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between px-4 pt-2 pb-1 border-b border-gray-100">
              <Image src="/img/logo_ssg.png" alt="SSG Logo" width={80} height={22} />
              <Image src="/img/logo_DT READY.png" alt="DT Logo" width={24} height={24} />
            </div>
            <div className="text-center my-1">
              <h3 className="text-sm font-bold text-blue-900">ATURAN PENGGUNAAN KARTU</h3>
            </div>
            <div className="flex-grow px-4 text-xs text-gray-800">
              <ol className="list-decimal ml-4">
                <li>Kartu ini adalah identitas resmi peserta SSG</li>
                <li>Wajib dibawa saat kegiatan SSG berlangsung</li>
                <li>Tunjukkan QR code untuk presensi kehadiran</li>
                <li>Segera laporkan kehilangan kartu kepada panitia</li>
              </ol>
            </div>
            <div className="bg-blue-50 py-1.5 px-4 text-xs text-blue-800 font-semibold text-center border-t border-blue-100">
              Kartu ini hanya berlaku selama program Santri Siap Guna 2025
            </div>
          </motion.div>
        </div>

        <div className="flex justify-center mt-10">
          <button
            onClick={generateAndPrintPDF}
            disabled={isProcessing}
            className="bg-blue-800 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-900 transition-colors flex items-center justify-center shadow-sm"
          >
            {isProcessing ? 'Membuat PDF...' : 'Cetak Kartu (via PDF)'}
          </button>
        </div>
      </main>
    </div>
  );
}
