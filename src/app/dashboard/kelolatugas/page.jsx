"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '../../../stores/authStore';
import DashboardHeader from '../../../components/DashboardHeader';
import Swal from 'sweetalert2';

const KelolaTugasPage = () => {
  const { role, user } = useAuthStore();
  const router = useRouter();
  const [tugasList, setTugasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    deadline: '',
    pleton: 'all'
  });

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === 'undefined') return;

    if (role !== '3' && role !== '4') {
      router.push('/dashboard');
      return;
    }
    fetchTugas();
  }, [role, router]);

  const fetchTugas = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/api/tugas`);
      const data = await response.json();
      if (data.success) setTugasList(data.data);
    } catch (error) {
      console.error('Error fetching tugas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/api/tugas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        Swal.fire('Sukses!', 'Tugas berhasil ditambahkan', 'success');
        setFormData({
          judul: '',
          deskripsi: '',
          deadline: '',
          pleton: 'all'
        });
        fetchTugas();
      }
    } catch (error) {
      Swal.fire('Error!', 'Gagal menambahkan tugas', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/api/tugas/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        Swal.fire('Sukses!', 'Tugas berhasil dihapus', 'success');
        fetchTugas();
      }
    } catch (error) {
      Swal.fire('Error!', 'Gagal menghapus tugas', 'error');
    }
  };

  // Add a check for client-side rendering
  if (typeof window === 'undefined') {
    return null; // or return a loading state
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Kelola Tugas" 
        showBackButton={true}
        onBack={() => router.push('/dashboard')}
        userData={user || { name: 'User' }} // Provide fallback user data
      />

      {/* Rest of your component remains the same */}
      <div className="container mx-auto p-4">
        {/* Form Tambah Tugas */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Tambah Tugas Baru</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Judul Tugas</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  value={formData.judul}
                  onChange={(e) => setFormData({...formData, judul: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Deadline</label>
                <input
                  type="datetime-local"
                  className="w-full p-2 border rounded-md"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Deskripsi</label>
              <textarea
                className="w-full p-2 border rounded-md"
                rows={3}
                value={formData.deskripsi}
                onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Untuk Pleton</label>
              <select
                className="w-full p-2 border rounded-md"
                value={formData.pleton}
                onChange={(e) => setFormData({...formData, pleton: e.target.value})}
              >
                <option value="all">Semua Pleton</option>
                <option value="1">Pleton 1</option>
                <option value="2">Pleton 2</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Simpan Tugas
            </button>
          </form>
        </div>

        {/* Daftar Tugas */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <h2 className="text-lg font-semibold p-4 border-b">Daftar Tugas</h2>
          {loading ? (
            <div className="p-4 text-center">Memuat data...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pleton</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tugasList.map((tugas, index) => (
                    <tr key={tugas.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{tugas.judul}</td>
                      <td className="px-6 py-4">{tugas.deskripsi}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(tugas.deadline).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tugas.pleton === 'all' ? 'Semua' : `Pleton ${tugas.pleton}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(tugas.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KelolaTugasPage;