"use client";

import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import useAuthStore from '../../../stores/authStore';
import QRCode from "react-qr-code";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function ECard() {
  const { user, loading, error, qrcode, fetchUserQRCode } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    fetchUserQRCode();
  }, [fetchUserQRCode]);

  const navigateBack = () => {
    window.history.back();
  };

  const handlePrint = () => {
    setIsProcessing(true);
    const printContent = document.getElementById('card-content');
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kartu Peserta SSG</title>
          <style>
            @page {
              size: 85mm 54mm landscape;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              width: 85mm;
              height: 54mm;
              overflow: hidden;
            }
            .card-container {
              width: 85mm;
              height: 54mm;
              display: flex;
              font-family: Arial, sans-serif;
            }
            .front-card {
              width: 100%;
              height: 100%;
              background: linear-gradient(to bottom, #1a4b8c, #0d2b56);
              color: white;
              padding: 10px;
              box-sizing: border-box;
              position: relative;
            }
            .header {
              display: flex;
              align-items: center;
              margin-bottom: 10px;
            }
            .qr-container {
              background: white;
              padding: 5px;
              border-radius: 5px;
              margin-right: 15px;
            }
            .user-name {
              font-size: 18px;
              font-weight: bold;
              margin: 10px 0;
            }
            .info-badge {
              background: rgba(255,255,255,0.2);
              padding: 5px 10px;
              border-radius: 15px;
              margin: 5px 0;
              font-size: 12px;
            }
            .rules {
              font-size: 10px;
              margin-top: 10px;
            }
            .rules ol {
              padding-left: 15px;
            }
            .footer {
              font-size: 10px;
              text-align: center;
              margin-top: 10px;
              padding-top: 5px;
              border-top: 1px solid rgba(255,255,255,0.3);
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      setIsProcessing(false);
    }, 500);
  };

  const generatePDF = async () => {
    setIsProcessing(true);
    
    try {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [85, 54],
      });

      const cardElement = document.getElementById('card-content');
      
      // Create a clone to avoid modifying the original
      const clone = cardElement.cloneNode(true);
      clone.style.width = '85mm';
      clone.style.height = '54mm';
      clone.style.visibility = 'hidden';
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, { 
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true
      });

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 85, 54);
      pdf.save(`kartu-peserta-${user?.name || 'user'}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Memuat data kartu...</div>;
  }

  if (error || qrcode === null) {
    return (
      <div className="error-message">
        <h2>{error ? "Terjadi Kesalahan" : "Belum Terdaftar"}</h2>
        <p>{error ? "Gagal memuat data kartu" : "Anda belum terdaftar sebagai peserta"}</p>
        <button onClick={navigateBack}>Kembali</button>
      </div>
    );
  }

  return (
    <div className="e-card-container">
      <Head>
        <title>Kartu Peserta Digital</title>
      </Head>

      <header className="app-header">
        <button onClick={navigateBack} className="back-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1>Kartu Peserta Digital</h1>
      </header>

      <main className="card-view">
        <div id="card-content" ref={cardRef} className="card-container">
          <div className="front-card">
            <div className="header">
              <div className="qr-container">
                <QRCode 
                  value={qrcode} 
                  size={80} 
                  level="H"
                />
              </div>
              <div>
                <h2>SANTRI SIAP GUNA</h2>
                <p className="subtitle">KARTU PESERTA</p>
              </div>
            </div>

            <div className="user-name">
              {user?.name || "MUHAMAD BRILLIAN HAIKAL"}
            </div>

            <div className="scan-text">Scan untuk verifikasi</div>

            <div className="info-badge">Peserta Angkatan 2025</div>
            <div className="info-badge">Pleton: {user?.pleton || "20"} / Grup {user?.grup || "B"}</div>

            <div className="rules">
              <h3>ATURAN PENGGUNAAN KARTU</h3>
              <ol>
                <li>Kartu ini adalah identitas resmi peserta SSG</li>
                <li>Wajib dibawa saat kegiatan SSG berlangsung</li>
                <li>Tunjukkan QR code untuk presensi kehadiran</li>
                <li>Segera laporkan kehilangan kartu kepada panitia</li>
              </ol>
            </div>

            <div className="footer">
              Kartu ini hanya berlaku selama program Santri Siap Guna 2025
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            onClick={handlePrint}
            disabled={isProcessing}
            className="print-button"
          >
            {isProcessing ? "Menyiapkan..." : "Cetak Kartu"}
          </button>
          <button 
            onClick={generatePDF}
            disabled={isProcessing}
            className="pdf-button"
          >
            {isProcessing ? "Membuat PDF..." : "Unduh PDF"}
          </button>
        </div>
      </main>

      <style jsx>{`
        .e-card-container {
          min-height: 100vh;
          background: #f5f7fa;
        }
        .app-header {
          background: #1a4b8c;
          color: white;
          padding: 15px;
          display: flex;
          align-items: center;
          position: relative;
        }
        .app-header h1 {
          margin: 0 auto;
          font-size: 1.2rem;
        }
        .back-button {
          background: none;
          border: none;
          color: white;
          position: absolute;
          left: 15px;
        }
        .card-view {
          max-width: 800px;
          margin: 20px auto;
          padding: 20px;
        }
        .card-container {
          width: 100%;
          max-width: 400px;
          height: 250px;
          margin: 0 auto 30px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border-radius: 10px;
          overflow: hidden;
        }
        .front-card {
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, #1a4b8c, #0d2b56);
          color: white;
          padding: 15px;
          box-sizing: border-box;
        }
        .header {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }
        .header h2 {
          margin: 0;
          font-size: 1.1rem;
        }
        .subtitle {
          margin: 0;
          font-size: 0.7rem;
          opacity: 0.8;
        }
        .qr-container {
          background: white;
          padding: 8px;
          border-radius: 8px;
          margin-right: 15px;
        }
        .user-name {
          font-size: 1.2rem;
          font-weight: bold;
          margin: 15px 0;
        }
        .scan-text {
          font-size: 0.8rem;
          margin-bottom: 10px;
          opacity: 0.8;
        }
        .info-badge {
          background: rgba(255,255,255,0.2);
          padding: 6px 12px;
          border-radius: 15px;
          margin: 8px 0;
          font-size: 0.8rem;
          display: inline-block;
        }
        .rules {
          margin-top: 15px;
          font-size: 0.7rem;
        }
        .rules h3 {
          margin: 10px 0 5px 0;
          font-size: 0.8rem;
        }
        .rules ol {
          padding-left: 20px;
          margin: 5px 0;
        }
        .rules li {
          margin-bottom: 3px;
        }
        .footer {
          font-size: 0.7rem;
          text-align: center;
          margin-top: 15px;
          padding-top: 8px;
          border-top: 1px solid rgba(255,255,255,0.3);
        }
        .action-buttons {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-top: 30px;
        }
        .print-button, .pdf-button {
          padding: 12px 25px;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .print-button {
          background: #1a4b8c;
          color: white;
        }
        .print-button:hover {
          background: #0d2b56;
        }
        .pdf-button {
          background: #28a745;
          color: white;
        }
        .pdf-button:hover {
          background: #218838;
        }
        .loading-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .error-message {
          text-align: center;
          padding: 40px 20px;
        }
        .error-message h2 {
          color: #dc3545;
        }
        .error-message button {
          margin-top: 20px;
          padding: 10px 20px;
          background: #1a4b8c;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}