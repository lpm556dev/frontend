"use client";

import React, { useState, useEffect, useRef } from 'react';
import useAuthStore from '../../stores/authStore';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const RequiredDocumentsForm = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const docTypesOrder = ['ktp', 'pasFoto', 'suratIzin', 'suratSehat', 'buktiPembayaran', 'digitalSignature'];
  const currentDocType = docTypesOrder[currentStep];
  const { user, role } = useAuthStore();
  const [documents, setDocuments] = useState({
    ktp: null,
    pasFoto: null,
    suratIzin: null,
    suratSehat: null,
    buktiPembayaran: null,
    digitalSignature: null
  });
  const [previews, setPreviews] = useState({
    ktp: null,
    pasFoto: null,
    suratIzin: null,
    suratSehat: null,
    buktiPembayaran: null,
    digitalSignature: null
  });
  const [uploadingStatus, setUploadingStatus] = useState({
    ktp: false,
    pasFoto: false,
    suratIzin: false,
    suratSehat: false,
    buktiPembayaran: false,
    digitalSignature: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRefs = {
    ktp: useRef(null),
    pasFoto: useRef(null),
    suratIzin: useRef(null),
    suratSehat: useRef(null),
    buktiPembayaran: useRef(null),
    digitalSignature: useRef(null)
  };
  
  const signaturePadRef = useRef(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureExists, setSignatureExists] = useState(false);

  const documentTypes = {
    ktp: {
      label: "KTP",
      description: "Unggah foto KTP/Kartu Pelajar",
      formats: "JPG, PNG, atau PDF",
      maxSize: "2MB",
      backendType: "ktp"
    },
    pasFoto: {
      label: "Pas Foto",
      description: "Unggah pas foto terbaru (3x4, latar belakang merah/biru)",
      formats: "JPG atau PNG",
      maxSize: "1MB",
      backendType: "pas_foto"
    },
    suratIzin: {
      label: "Surat Izin Orang Tua/Wali",
      description: "Unggah surat izin yang telah ditandatangani",
      formats: "JPG, PNG, atau PDF",
      maxSize: "2MB",
      backendType: "surat_izin"
    },
    suratSehat: {
      label: "Surat Keterangan Sehat",
      description: "Unggah surat keterangan sehat dari dokter",
      formats: "JPG, PNG, atau PDF",
      maxSize: "2MB",
      backendType: "surat_kesehatan"
    },
    buktiPembayaran: {
      label: "Bukti Pembayaran",
      description: "Unggah bukti transfer atau pembayaran",
      formats: "JPG, PNG, atau PDF",
      maxSize: "2MB",
      backendType: "bukti_pembayaran"
    },
    digitalSignature: {
      label: "Tanda Tangan Digital",
      description: "Buat tanda tangan digital atau unggah file tanda tangan Anda",
      formats: "JPG atau PNG",
      maxSize: "1MB",
      backendType: "digital_signature"
    }
  };

  useEffect(() => {
    if (currentDocType === 'digitalSignature' && canvasRef.current && !documents.digitalSignature) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      context.lineWidth = 2;
      context.lineCap = 'round';
      context.strokeStyle = '#000000';
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [currentDocType, documents.digitalSignature]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    context.beginPath();
    context.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setSignatureExists(true);
  };
  
  const draw = (e) => {
    if (!isDrawing) return;
    
    e.preventDefault();
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    context.lineTo(clientX - rect.left, clientY - rect.top);
    context.stroke();
  };
  
  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      context.closePath();
      setIsDrawing(false);
    }
  };
  
  const clearSignature = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    setSignatureExists(false);
    setDocuments(prev => ({ ...prev, digitalSignature: null }));
    setPreviews(prev => ({ ...prev, digitalSignature: null }));
  };
  
  const saveSignature = () => {
    if (!signatureExists) {
      toast.error("Harap buat tanda tangan terlebih dahulu");
      return;
    }
    
    const canvas = canvasRef.current;
    canvas.toBlob((blob) => {
      const signatureFile = new File([blob], "signature.png", { type: "image/png" });
      setDocuments(prev => ({ ...prev, digitalSignature: signatureFile }));
      const dataUrl = canvas.toDataURL("image/png");
      setPreviews(prev => ({ ...prev, digitalSignature: dataUrl }));
      safelyStoreDocumentMetadata('digitalSignature', signatureFile, dataUrl);
      toast.success("Tanda tangan berhasil disimpan");
    });
  };

  const safelyStoreDocumentMetadata = (documentType, file, dataUrl) => {
    try {
      const currentDocs = JSON.parse(localStorage.getItem('requiredDocumentsMetadata') || '{}');
      const metadata = {
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString(),
        preview: dataUrl ? dataUrl.substring(0, 100) : null
      };
      currentDocs[documentType] = metadata;
      localStorage.setItem('requiredDocumentsMetadata', JSON.stringify(currentDocs));
    } catch (error) {
      console.error('Error storing document metadata:', error);
      toast.error('Tidak dapat menyimpan metadata dokumen');
    }
  };

  const handleSubmit = async () => {
    const missingDocs = docTypesOrder.filter(docType => !documents[docType]);
  
    if (missingDocs.length > 0) {
      toast.error(`Masih ada dokumen yang belum diupload: ${missingDocs.map(d => documentTypes[d].label).join(', ')}`);
      setCurrentStep(docTypesOrder.indexOf(missingDocs[0]));
      return;
    }
  
    const formData = new FormData();
    docTypesOrder.forEach(docType => {
      if (documents[docType]) {
        formData.append('files', documents[docType]);
      }
    });
  
    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_URL}/users/upload-files?id=${user.userId}`, {
        method: "POST",
        body: formData
      });
  
      setIsSubmitting(false);
      
      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || "Semua dokumen berhasil dikirim!");
        localStorage.removeItem('requiredDocumentsMetadata');
        setDocuments({
          ktp: null,
          pasFoto: null,
          suratIzin: null,
          suratSehat: null,
          buktiPembayaran: null,
          digitalSignature: null
        });
        setPreviews({
          ktp: null,
          pasFoto: null,
          suratIzin: null,
          suratSehat: null,
          buktiPembayaran: null,
          digitalSignature: null
        });
        setCurrentStep(0);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Gagal mengupload dokumen");
      }
    } catch (err) {
      toast.error(err.message || "Terjadi kesalahan saat mengupload");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const storedMetadata = JSON.parse(localStorage.getItem('requiredDocumentsMetadata') || '{}');
    
    const fetchUserDocuments = async () => {
      try {
        const res = await fetch(`${API_URL}/users/user-files?userId=${user.userId}`);
        if (!res.ok) throw new Error("Gagal mengambil data dokumen");

        const data = await res.json();
        const initialPreviews = { ...previews };
        const initialDocuments = { ...documents };

        if (data.files && Array.isArray(data.files)) {
          data.files.forEach(file => {
            const backendToFrontendMap = {
              'ktp': 'ktp',
              'pas_foto': 'pasFoto',
              'surat_izin': 'suratIzin',
              'surat_kesehatan': 'suratSehat',
              'bukti_pembayaran': 'buktiPembayaran',
              'tertanda': 'digitalSignature'
            };

            const frontendDocType = backendToFrontendMap[file.file_type];
            
            if (frontendDocType) {
              initialPreviews[frontendDocType] = file.drive_link;
              initialDocuments[frontendDocType] = {
                name: file.file_name,
                type: file.file_name.endsWith('.pdf') ? 'application/pdf' : 
                     file.file_name.endsWith('.png') ? 'image/png' : 
                     file.file_name.endsWith('.jpg') || file.file_name.endsWith('.jpeg') ? 'image/jpeg' : 
                     'application/octet-stream',
                fromServer: true,
                url: file.drive_link
              };
            }
          });

          setPreviews(initialPreviews);
          setDocuments(initialDocuments);
        }
      } catch (err) {
        console.error("Fetch document error:", err);
      }
    };

    if (user?.userId) {
      fetchUserDocuments();
    }
  }, [user]);
    
  const handleFileChange = (e, documentType) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setDocuments(prev => ({ ...prev, [documentType]: file }));
      setPreviews(prev => ({ ...prev, [documentType]: dataUrl }));
      safelyStoreDocumentMetadata(documentType, file, dataUrl);
    };
  
    reader.readAsDataURL(file);
  };

  const handleDeleteDocument = (documentType) => {
    setDocuments(prev => ({ ...prev, [documentType]: null }));
    setPreviews(prev => ({ ...prev, [documentType]: null }));
    const currentDocs = JSON.parse(localStorage.getItem('requiredDocumentsMetadata') || '{}');
    delete currentDocs[documentType];
    localStorage.setItem('requiredDocumentsMetadata', JSON.stringify(currentDocs));
    if (fileInputRefs[documentType].current) {
      fileInputRefs[documentType].current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="p-4">
      {/* Stepper Indicator - Modified to show only numbers */}
      <div className="flex justify-between mb-6">
        {docTypesOrder.map((docType, index) => (
          <div key={docType} className="flex flex-col items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center 
                ${index <= currentStep ? 'bg-blue-500 text-white' : 'bg-gray-200'} 
                ${index === currentStep ? 'ring-2 ring-blue-300' : ''}`}
            >
              {index + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      <div className="border rounded-lg p-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-md font-medium">{documentTypes[currentDocType].label}</h3>
            <p className="text-xs text-gray-500 mt-1">{documentTypes[currentDocType].description}</p>
            <p className="text-xs text-gray-400">Format: {documentTypes[currentDocType].formats} (Maks: {documentTypes[currentDocType].maxSize})</p>
          </div>
          
          {!documents[currentDocType] && currentDocType !== 'digitalSignature' && (
            <label className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium cursor-pointer ${uploadingStatus[currentDocType] ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
              </svg>
              Unggah
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => handleFileChange(e, currentDocType)} 
                accept={currentDocType === 'pasFoto' ? "image/jpeg,image/png" : "image/jpeg,image/png,application/pdf"}
                ref={fileInputRefs[currentDocType]}
                disabled={uploadingStatus[currentDocType]}
              />
            </label>
          )}

          {!documents[currentDocType] && currentDocType === 'digitalSignature' && (
            <label className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium cursor-pointer bg-gray-500 hover:bg-gray-600 text-white`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
              </svg>
              Unggah Tanda Tangan
              <input 
                type="file" 
                className="hidden" 
                onChange={(e) => handleFileChange(e, 'digitalSignature')} 
                accept="image/jpeg,image/png"
                ref={fileInputRefs.digitalSignature}
              />
            </label>
          )}
        </div>
        
        {uploadingStatus[currentDocType] && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-1">Mengunggah...</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full animate-pulse w-full"></div>
            </div>
          </div>
        )}
        
        {currentDocType === 'digitalSignature' && !documents.digitalSignature && (
          <div className="mt-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <p className="text-sm text-center text-gray-500 mb-3">Buat tanda tangan digital Anda di bawah ini</p>
              
              <canvas
                ref={canvasRef}
                className="w-full h-64 border border-gray-300 bg-white rounded cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              
              <div className="flex justify-center mt-4 space-x-3">
                <button
                  onClick={clearSignature}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Hapus
                </button>
                <button
                  onClick={saveSignature}
                  disabled={!signatureExists}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white ${signatureExists ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                  Simpan Tanda Tangan
                </button>
              </div>
            </div>
          </div>
        )}
        
        {documents[currentDocType] && (
          <div className="mt-3">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-md text-blue-600">
                    {documents[currentDocType].type.startsWith('image/') ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {documents[currentDocType].name || (currentDocType === 'digitalSignature' ? 'Tanda Tangan Digital.png' : 'Document')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(documents[currentDocType].size)} • {new Date().toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
                
                {role === '0a' && (
                  <button 
                    onClick={() => handleDeleteDocument(currentDocType)}
                    className="p-1 hover:bg-red-100 rounded-full text-red-500 hover:text-red-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
              
              {previews[currentDocType] && (
                <div className="mt-2">
                  {documents[currentDocType].type.startsWith('image/') && (
                    <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
                      <img 
                        src={previews[currentDocType]} 
                        className="w-full h-auto max-h-64 object-contain mx-auto" 
                        alt={documentTypes[currentDocType].label}
                      />
                    </div>
                  )}
                  
                  {!documents[currentDocType].type.startsWith('image/') && (
                    <div className="bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="mt-3 flex justify-center">
                    <a 
                      href={typeof previews[currentDocType] === 'string' ? previews[currentDocType] : '#'} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Lihat Dokumen
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
          disabled={currentStep === 0}
          className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
        >
          Kembali
        </button>
        {currentStep < docTypesOrder.length - 1 ? (
          <button
            onClick={() => {
              if (documents[currentDocType]) {
                setCurrentStep(prev => prev + 1);
              } else {
                toast.error(`Harap upload ${documentTypes[currentDocType].label} terlebih dahulu`);
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Lanjut
          </button>
        ) : (
          role !== '1a' && (
            <button
              onClick={handleSubmit}
              disabled={!documents[currentDocType] || isSubmitting}
              className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Mengirim...
                </>
              ) : "Kirim Semua Dokumen"}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default RequiredDocumentsForm;