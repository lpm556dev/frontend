"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { CalendarIcon, PlusIcon, PencilIcon, XIcon, CheckIcon, ClockIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function KegiatanPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  const [kegiatan, setKegiatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({
    id: '',
    judul: '',
    deskripsi: '',
    tanggal: '',
    status: 'Dibuka'
  });

  // Fetch data
  const fetchKegiatan = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/get-kegiatan`);
      if (response.data.success) {
        setKegiatan(response.data.data);
      } else {
        setKegiatan([]);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching kegiatan:", err);
      setError("Gagal memuat data kegiatan. Silakan coba lagi nanti.");
      setKegiatan([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKegiatan();
  }, []);

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (formMode === 'add') {
        // Create new kegiatan
        await axios.post(`${API_URL}/admin/create-kegiatan`, formData);
      } else {
        // Update existing kegiatan
        await axios.post(`${API_URL}/admin/update-kegiatan`, formData);
      }
      
      // Reset form and fetch updated data
      resetForm();
      fetchKegiatan();
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(formMode === 'add' ? 
        "Gagal menambahkan kegiatan baru." : 
        "Gagal mengupdate kegiatan.");
    } finally {
      setLoading(false);
    }
  };

  // Edit kegiatan
  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      judul: item.judul,
      deskripsi: item.deskripsi,
      tanggal: formatDateForInput(item.tanggal),
      status: item.status
    });
    setFormMode('edit');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format date for input field
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: '',
      judul: '',
      deskripsi: '',
      tanggal: '',
      status: 'Dibuka'
    });
    setFormMode('add');
    setShowForm(false);
  };

  // Get status badge class based on status
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'Dibuka':
        return 'bg-green-100 text-green-800';
      case 'Ditutup':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-8 px-4 shadow-md">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <CalendarIcon className="mr-3" size={32} />
            Manajemen Kegiatan
          </h1>
          <p className="mt-2 text-blue-100">Kelola jadwal dan informasi kegiatan dengan mudah</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex items-center">
              <XIcon className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Add/Edit Form Toggle Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="mb-6 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Tambah Kegiatan Baru
          </button>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {formMode === 'add' ? 'Tambah Kegiatan Baru' : 'Edit Kegiatan'}
              </h2>
              <button 
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="col-span-2">
                  <label htmlFor="judul" className="block text-sm font-medium text-gray-700">
                    Judul Kegiatan
                  </label>
                  <input
                    type="text"
                    name="judul"
                    id="judul"
                    required
                    value={formData.judul}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div className="col-span-2">
                  <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700">
                    Deskripsi
                  </label>
                  <textarea
                    id="deskripsi"
                    name="deskripsi"
                    rows={3}
                    required
                    value={formData.deskripsi}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="tanggal" className="block text-sm font-medium text-gray-700">
                    Tanggal
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      name="tanggal"
                      id="tanggal"
                      required
                      value={formData.tanggal}
                      onChange={handleChange}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    required
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="Dibuka">Dibuka</option>
                    <option value="Ditutup">Ditutup</option>
                  </select>
                </div>

                <div className="col-span-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {loading ? 'Memproses...' : formMode === 'add' ? 'Simpan' : 'Update'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Kegiatan List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Daftar Kegiatan</h2>
          </div>
          
          {loading && !kegiatan.length ? (
            <div className="py-12">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
              <p className="text-center mt-4 text-gray-500">Memuat data kegiatan...</p>
            </div>
          ) : !kegiatan.length ? (
            <div className="py-12 text-center">
              <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada kegiatan</h3>
              <p className="mt-1 text-sm text-gray-500">Belum ada kegiatan yang ditambahkan</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Tambah Kegiatan Baru
                </button>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {kegiatan.map((item) => {
                // Format date for display
                let formattedDate;
                try {
                  formattedDate = format(new Date(item.tanggal), "d MMMM yyyy", { locale: id });
                } catch (e) {
                  formattedDate = "Tanggal tidak valid";
                }
                
                return (
                  <li key={item.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{item.judul}</h3>
                        <div className="flex items-center mt-1">
                          <CalendarIcon className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-sm text-gray-500">{formattedDate}</span>
                          <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(item.status)}`}>
                            {item.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">{item.deskripsi}</p>
                      </div>
                      <button
                        onClick={() => handleEdit(item)}
                        className="inline-flex items-center justify-center p-2 rounded-full text-indigo-600 hover:bg-indigo-50"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}