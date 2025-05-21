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
  const cardContainerRef = useRef(null);

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
      if (element.getAttribute('class')?.includes(twClass)) {
        element.style.backgroundColor = hex;
      }
    });

    Object.entries(textColors).forEach(([twClass, hex]) => {
      if (element.getAttribute('class')?.includes(twClass)) {
        element.style.color = hex;
      }
    });

    if (!element.style.backgroundColor) {
      element.style.backgroundColor = '#ffffff';
    }

    const computedStyle = window.getComputedStyle(element);
    element.style.width = computedStyle.width;
    element.style.height = computedStyle.height;
    element.style.padding = computedStyle.padding;
    element.style.margin = computedStyle.margin;
    element.style.fontSize = computedStyle.fontSize;
    element.style.fontWeight = computedStyle.fontWeight;
    element.style.textAlign = computedStyle.textAlign;
    element.style.justifyContent = computedStyle.justifyContent;
    element.style.alignItems = computedStyle.alignItems;

    element.style.boxShadow = 'none';
    element.style.filter = 'none';

    Array.from(element.children).forEach(child => sanitizeElements(child));
  };

  const generateAndPrintPDF = async () => {
    setIsProcessing(true);

    try {
      const containerClone = cardContainerRef.current.cloneNode(true);
      
      // Hapus tombol cetak dari clone
      const printButton = containerClone.querySelector('button');
      if (printButton) printButton.remove();
      
      // Hapus judul halaman dari clone
      const pageTitle = containerClone.querySelector('h1');
      if (pageTitle) pageTitle.remove();

      sanitizeElements(containerClone);

      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.transform = 'scale(1)';
      tempContainer.style.background = '#ffffff';
      tempContainer.appendChild(containerClone);
      document.body.appendChild(tempContainer);

      await new Promise(resolve => setTimeout(resolve, 500));
      await document.fonts.ready;

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm"
      });

      const canvasOptions = {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: null,
        allowTaint: true
      };

      const canvas = await html2canvas(containerClone, canvasOptions);
      
      // Hitung rasio aspek untuk memastikan gambar pas di halaman PDF
      const imgWidth = 280; // Lebar halaman PDF dalam mm (landscape)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);

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
        ref={cardContainerRef}
        className="flex flex-col md:flex-row gap-8 justify-center"
      >
        <div
          className="bg-blue-700 text-white rounded-xl overflow-hidden shadow-xl w-full md:w-[400px] h-[250px] flex"
        >
          <div className="w-2/5 bg-blue-900 flex flex-col justify-center items-center p-3">
            <div className="bg-white p-2 rounded-lg mb-2 shadow-md">
              <QRCode value={qrcode} size={120} style={{ width: '120px', height: '120px' }} />
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
        </div>

        <div
          className="bg-white rounded-xl overflow-hidden shadow-xl w-full md:w-[400px] h-[250px] flex flex-col"
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
        </div>
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
    </div>
  );
}