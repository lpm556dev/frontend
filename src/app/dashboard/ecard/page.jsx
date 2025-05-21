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
      const frontClone = frontCardRef.current.cloneNode(true);
      const backClone = backCardRef.current.cloneNode(true);

      sanitizeElements(frontClone);
      sanitizeElements(backClone);

      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.left = '-9999px';
      tempContainer.style.transform = 'scale(1)';
      tempContainer.style.background = '#ffffff';
      tempContainer.appendChild(frontClone);
      tempContainer.appendChild(backClone);
      document.body.appendChild(tempContainer);

      await new Promise(resolve => setTimeout(resolve, 500));
      await document.fonts.ready;

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

  return (
    <QRCode 
      value={qrcode} 
      size={120} 
      style={{ width: "120px", height: "120px" }}
    />
  );
}
