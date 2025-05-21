// components/ECard.jsx
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
  if (typeof window === "undefined") return null;

  const { user, loading, error, qrcode, fetchUserQRCode } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const cardsContainerRef = useRef(null);

  useEffect(() => {
    fetchUserQRCode();
  }, [fetchUserQRCode]);

  useEffect(() => {
    document.body.style.overflow = isProcessing ? 'hidden' : '';
  }, [isProcessing]);

  const generateAndPrintPDF = async () => {
    setIsProcessing(true);

    try {
      // Clone the entire cards container
      const containerClone = cardsContainerRef.current.cloneNode(true);
      
      // Remove elements that shouldn't be printed
      const printButton = containerClone.querySelector('button');
      if (printButton) printButton.remove();
      
      const pageTitle = containerClone.querySelector('h1');
      if (pageTitle) pageTitle.remove();

      // Apply print-specific styles
      containerClone.style.display = 'flex';
      containerClone.style.flexDirection = 'row';
      containerClone.style.gap = '20px';
      containerClone.style.padding = '0';
      containerClone.style.margin = '0';
      containerClone.style.width = 'fit-content';
      containerClone.style.height = 'fit-content';
      containerClone.style.background = 'white';

      // Create temporary container for printing
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.padding = '20px';
      tempContainer.style.background = 'white';
      tempContainer.appendChild(containerClone);
      document.body.appendChild(tempContainer);

      await new Promise(resolve => setTimeout(resolve, 300));
      await document.fonts.ready;

      // Calculate dimensions based on actual card sizes
      const cardWidth = 400; // px
      const cardHeight = 250; // px
      const totalWidth = (cardWidth * 2) + 20; // 2 cards + gap
      const totalHeight = cardHeight;

      // Create PDF with calculated dimensions
      const pdf = new jsPDF({
        orientation: totalWidth > totalHeight ? "landscape" : "portrait",
        unit: "px",
        format: [totalWidth, totalHeight]
      });

      const canvasOptions = {
        scale: 1,
        logging: true,
        useCORS: true,
        backgroundColor: null,
        allowTaint: true,
        width: totalWidth,
        height: totalHeight,
        windowWidth: containerClone.scrollWidth,
        windowHeight: containerClone.scrollHeight
      };

      const canvas = await html2canvas(containerClone, canvasOptions);
      
      // Add image to PDF
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, totalWidth, totalHeight);

      // Generate PDF and open print dialog
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

  if (loading || !qrcode) {
    return <div className="text-center p-10">Memuat data kartu...</div>;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Head>
        <title>Kartu Peserta Digital</title>
      </Head>

      <h1 className="text-2xl font-bold text-center mb-8">Kartu Peserta Digital</h1>

      <div 
        ref={cardsContainerRef}
        className="flex flex-col md:flex-row gap-8 justify-center print:flex-row print:gap-4 print:justify-center print:items-center"
      >
        {/* Front Card */}
        <div
          className="bg-blue-700 text-white rounded-xl overflow-hidden shadow-xl w-full md:w-[400px] h-[250px] flex print:w-[400px] print:h-[250px] print:shadow-none"
        >
          <div className="w-2/5 bg-blue-900 flex flex-col justify-center items-center p-3 print:bg-[#1e3a8a]">
            <div className="bg-white p-2 rounded-lg mb-2 shadow-md print:shadow-none">
              <QRCode value={qrcode} size={120} style={{ width: '120px', height: '120px' }} />
            </div>
            <p className="text-xs font-medium text-blue-100 text-center print:text-[#dbeafe]">Scan untuk verifikasi</p>
          </div>
          <div className="w-3/5 pl-3 flex flex-col py-4 pr-3">
            <div className="flex items-center">
              <Image 
                src="/img/logossg_white.png" 
                alt="Logo" 
                width={32} 
                height={32} 
                className="mr-2 print:filter-none"
              />
              <div>
                <h3 className="text-lg font-bold leading-none">SANTRI SIAP</h3>
                <h3 className="text-lg font-bold leading-none">GUNA</h3>
                <p className="text-xs font-medium">KARTU PESERTA</p>
              </div>
            </div>
            <div className="flex-grow flex flex-col justify-center mt-2">
              <h2 className="text-xl font-bold mb-2">{user?.name || 'Nama Peserta'}</h2>
              <div className="space-y-2">
                <div className="bg-blue-800 py-1.5 px-3 rounded-md text-sm font-medium print:bg-[#1e40af]">
                  Peserta Angkatan 2025
                </div>
                <div className="bg-blue-800 py-1.5 px-3 rounded-md text-sm font-medium print:bg-[#1e40af]">
                  Pleton: {user?.pleton || '-'} / Grup {user?.grup || '-'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Card */}
        <div
          className="bg-white rounded-xl overflow-hidden shadow-xl w-full md:w-[400px] h-[250px] flex flex-col print:w-[400px] print:h-[250px] print:shadow-none"
        >
          <div className="flex items-center justify-between px-4 pt-2 pb-1 border-b border-gray-100 print:border-[#f3f4f6]">
            <Image 
              src="/img/logo_ssg.png" 
              alt="SSG Logo" 
              width={80} 
              height={22} 
              className="print:filter-none"
            />
            <Image 
              src="/img/logo_DT READY.png" 
              alt="DT Logo" 
              width={24} 
              height={24} 
              className="print:filter-none"
            />
          </div>
          <div className="text-center my-1">
            <h3 className="text-sm font-bold text-blue-900 print:text-[#1e40af]">ATURAN PENGGUNAAN KARTU</h3>
          </div>
          <div className="flex-grow px-4 text-xs text-gray-800 print:text-[#1f2937]">
            <ol className="list-decimal ml-4">
              <li>Kartu ini adalah identitas resmi peserta SSG</li>
              <li>Wajib dibawa saat kegiatan SSG berlangsung</li>
              <li>Tunjukkan QR code untuk presensi kehadiran</li>
              <li>Segera laporkan kehilangan kartu kepada panitia</li>
            </ol>
          </div>
          <div className="bg-blue-50 py-1.5 px-4 text-xs text-blue-800 font-semibold text-center border-t border-blue-100 print:bg-[#eff6ff] print:text-[#1e40af] print:border-[#dbeafe]">
            Kartu ini hanya berlaku selama program Santri Siap Guna 2025
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-10 print:hidden">
        <button
          onClick={generateAndPrintPDF}
          disabled={isProcessing}
          className="bg-blue-800 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-900 transition-colors flex items-center justify-center shadow-sm"
        >
          {isProcessing ? 'Membuat PDF...' : 'Cetak Kartu (via PDF)'}
        </button>
      </div>
    </div>
  );
}