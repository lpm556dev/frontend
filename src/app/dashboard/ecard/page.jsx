// components/ECard.jsx
"use client";

import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import useAuthStore from '../../../stores/authStore';
import QRCode from "react-qr-code";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Static image imports
import logoSsgWhite from '../../../../public/img/logossg_white.png';
import logoSsg from '../../../../public/img/logo_ssg.png';
import logoDtReady from '../../../../public/img/logo_DT READY.png';

export default function ECard() {
  if (typeof window === "undefined") return null;

  const { user, loading, error, qrcode, fetchUserQRCode } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const frontCardRef = useRef(null);
  const backCardRef = useRef(null);

  useEffect(() => {
    fetchUserQRCode();
  }, [fetchUserQRCode]);

  const replaceUnsupportedStyles = (element) => {
    if (!element || !element.style) return;

    const colorMap = {
      'oklch(0.9645 0.018 252.58)': '#eff6ff',
      'oklch(0.9645 0.018 252.58 / 1)': '#eff6ff',
      'oklch(0.9645 0.018 252.58 / var(--tw-bg-opacity))': '#eff6ff',
      'oklch(0.964 0.02 252.57)': '#eff6ff',
      'oklch(0.96 0.02 252.57)': '#eff6ff',
    };

    const styleProps = [
      'backgroundColor',
      'color',
      'borderColor',
      'borderTopColor',
      'borderRightColor',
      'borderBottomColor',
      'borderLeftColor',
      'fill',
      'stroke'
    ];

    styleProps.forEach(prop => {
      const value = element.style[prop];
      if (value && typeof value === 'string' && value.includes('oklch')) {
        for (const [oklch, hex] of Object.entries(colorMap)) {
          if (value.includes(oklch)) {
            element.style[prop] = value.replace(oklch, hex);
            break;
          }
        }
      }
    });

    if (element.children) {
      Array.from(element.children).forEach(child => replaceUnsupportedStyles(child));
    }

    if (element instanceof SVGElement) {
      const attributes = ['fill', 'stroke', 'stop-color'];
      attributes.forEach(attr => {
        const value = element.getAttribute(attr);
        if (value && value.includes('oklch')) {
          for (const [oklch, hex] of Object.entries(colorMap)) {
            if (value.includes(oklch)) {
              element.setAttribute(attr, value.replace(oklch, hex));
              break;
            }
          }
        }
      });
    }
  };

  const generateAndPrintPDF = async () => {
    setIsProcessing(true);

    try {
      const printContainer = document.createElement('div');
      printContainer.style.position = 'fixed';
      printContainer.style.left = '0';
      printContainer.style.top = '0';
      printContainer.style.width = '100vw';
      printContainer.style.height = '100vh';
      printContainer.style.display = 'flex';
      printContainer.style.justifyContent = 'center';
      printContainer.style.alignItems = 'center';
      printContainer.style.gap = '32px';
      printContainer.style.padding = '20px';
      printContainer.style.backgroundColor = '#f3f4f6';
      printContainer.style.zIndex = '9999';
      
      const frontClone = frontCardRef.current.cloneNode(true);
      const backClone = backCardRef.current.cloneNode(true);
      
      frontClone.style.boxShadow = 'none';
      backClone.style.boxShadow = 'none';
      
      // Replace Next.js Image components with regular img for PDF generation
      const replaceNextImages = (node) => {
        const images = node.querySelectorAll('img[data-nimg]');
        images.forEach(img => {
          const regularImg = document.createElement('img');
          regularImg.src = img.src;
          regularImg.alt = img.alt;
          regularImg.width = img.width;
          regularImg.height = img.height;
          regularImg.style.width = '100%';
          regularImg.style.height = 'auto';
          img.replaceWith(regularImg);
        });
      };

      replaceNextImages(frontClone);
      replaceNextImages(backClone);
      
      replaceUnsupportedStyles(frontClone);
      replaceUnsupportedStyles(backClone);
      
      printContainer.appendChild(frontClone);
      printContainer.appendChild(backClone);
      document.body.appendChild(printContainer);

      // Wait for images to load
      const images = printContainer.getElementsByTagName('img');
      await Promise.all(Array.from(images).map(img => {
        if (!img.complete) {
          return new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => {
              console.warn('Image failed to load:', img.src);
              resolve(); // Continue even if some images fail
            };
          });
        }
        return Promise.resolve();
      }));

      await new Promise(resolve => setTimeout(resolve, 500));
      await document.fonts.ready;
      
      const canvas = await html2canvas(printContainer, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: null,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight
      });

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgRatio = Math.min(
        (pdfWidth * 0.95) / canvas.width, 
        (pdfHeight * 0.95) / canvas.height
      );
      const imgWidth = canvas.width * imgRatio;
      const imgHeight = canvas.height * imgRatio;
      const xPos = (pdfWidth - imgWidth) / 2;
      const yPos = (pdfHeight - imgHeight) / 2;

      pdf.addImage(
        canvas.toDataURL('image/png', 1.0), 
        'PNG', 
        xPos, 
        yPos, 
        imgWidth, 
        imgHeight
      );

      document.body.removeChild(printContainer);

      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl);
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          URL.revokeObjectURL(pdfUrl);
        };
      }

    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert(`Gagal membuat PDF. Error: ${err.message}\n\nPastikan:\n1. Menggunakan browser terbaru (Chrome/Firefox)\n2. Tidak menggunakan mode penyamaran\n3. Mengizinkan pop-up untuk situs ini`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || !qrcode) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-10 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium">Memuat data kartu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Head>
        <title>Kartu Peserta Digital</title>
        <meta name="description" content="Kartu peserta digital Santri Siap Guna" />
      </Head>

      <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">Kartu Peserta Digital</h1>

      <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
        {/* Front Card */}
        <div
          ref={frontCardRef}
          className="bg-blue-700 text-white rounded-xl overflow-hidden shadow-xl w-full max-w-md h-64 flex"
        >
          <div className="w-2/5 bg-blue-900 flex flex-col justify-center items-center p-4">
            <div className="bg-white p-2 rounded-lg mb-3 shadow-md">
              <QRCode 
                value={qrcode} 
                size={120} 
                fgColor="#1e40af"
                level="H"
                style={{ width: '100%', height: 'auto' }} 
              />
            </div>
            <p className="text-xs font-medium text-blue-100 text-center">Scan untuk verifikasi</p>
          </div>
          <div className="w-3/5 flex flex-col py-4 px-4">
            <div className="flex items-center mb-4">
              <Image 
                src={logoSsgWhite}
                alt="Logo SSG" 
                width={32} 
                height={32} 
                className="mr-2"
                priority
              />
              <div>
                <h3 className="text-lg font-bold leading-tight">SANTRI SIAP</h3>
                <h3 className="text-lg font-bold leading-tight">GUNA</h3>
                <p className="text-xs font-medium">KARTU PESERTA</p>
              </div>
            </div>
            <div className="flex-grow flex flex-col justify-center">
              <h2 className="text-xl font-bold mb-3 truncate">{user?.name || 'Nama Peserta'}</h2>
              <div className="space-y-2">
                <div className="bg-blue-800 py-2 px-3 rounded-md text-sm font-medium">
                  Peserta Angkatan 2025
                </div>
                <div className="bg-blue-800 py-2 px-3 rounded-md text-sm font-medium">
                  Pleton: {user?.pleton || '-'} / Grup {user?.grup || '-'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Card */}
        <div
          ref={backCardRef}
          className="bg-white rounded-xl overflow-hidden shadow-xl w-full max-w-md h-64 flex flex-col"
        >
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-200">
            <Image 
              src={logoSsg}
              alt="Logo SSG" 
              width={80} 
              height={22}
              priority
            />
            <Image 
              src={logoDtReady}
              alt="Logo DT" 
              width={24} 
              height={24}
              priority
            />
          </div>
          <div className="text-center my-2">
            <h3 className="text-sm font-bold text-blue-900">ATURAN PENGGUNAAN KARTU</h3>
          </div>
          <div className="flex-grow px-4 py-2 text-xs text-gray-800">
            <ol className="list-decimal ml-4 space-y-1">
              <li>Kartu ini adalah identitas resmi peserta SSG</li>
              <li>Wajib dibawa saat kegiatan SSG berlangsung</li>
              <li>Tunjukkan QR code untuk presensi kehadiran</li>
              <li>Segera laporkan kehilangan kartu kepada panitia</li>
            </ol>
          </div>
          <div className="bg-blue-50 py-2 px-4 text-xs text-blue-800 font-semibold text-center border-t border-blue-200">
            Kartu ini hanya berlaku selama program Santri Siap Guna 2025
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-10">
        <button
          onClick={generateAndPrintPDF}
          disabled={isProcessing}
          className="bg-blue-800 hover:bg-blue-900 text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-colors duration-200 flex items-center justify-center min-w-[200px] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Membuat PDF...
            </>
          ) : (
            'Cetak Kartu (PDF)'
          )}
        </button>
      </div>
    </div>
  );
}