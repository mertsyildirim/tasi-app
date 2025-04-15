import React, { useState, useEffect } from 'react';
import { withAuth } from '../../../lib/auth';
import AdminLayout from '../../../components/layouts/AdminLayout';
import { FaUserEdit, FaArrowLeft, FaSave, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';

function EditUser() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    role: '',
    status: 'active',
    company: {
      name: '',
      taxNumber: '',
      address: '',
      phone: ''
    }
  });
  const [originalData, setOriginalData] = useState(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwords, setPasswords] = useState({
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (id) {
      fetchUserData();
    }
  }, [id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`/api/admin/users/${id}`);
      
      if (response.data) {
        const userData = response.data;
        setFormData({
          name: userData.name || '',
          surname: userData.surname || '',
          email: userData.email || '',
          phone: userData.phone || '',
          role: userData.role || 'customer',
          status: userData.status || 'active',
          company: {
            name: userData.company?.name || '',
            taxNumber: userData.company?.taxNumber || '',
            address: userData.company?.address || '',
            phone: userData.company?.phone || ''
          }
        });
        setOriginalData(userData);
      }
      setLoading(false);
    } catch (err) {
      console.error('Kullanıcı bilgileri alınırken hata:', err);
      setError('Kullanıcı bilgileri alınamadı. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      // Nested property (company object)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'İsim alanı zorunludur';
    if (!formData.surname.trim()) return 'Soyisim alanı zorunludur';
    if (!formData.email.trim()) return 'E-posta alanı zorunludur';
    
    // Şirket seçilmiş ise şirket adı zorunlu
    if (formData.role === 'company' && !formData.company.name.trim()) {
      return 'Şirket adı zorunludur';
    }

    // Şifre alanları doldurulmuşsa kontrol et
    if (showPasswordFields) {
      if (!passwords.password) return 'Şifre alanı zorunludur';
      if (passwords.password.length < 6) return 'Şifre en az 6 karakter olmalıdır';
      if (passwords.password !== passwords.confirmPassword) return 'Şifreler eşleşmiyor';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Şifre alanları gösteriliyorsa ve şifre değiştiriliyorsa doğrulama yap
    if (showPasswordFields) {
      if (passwords.newPassword !== passwords.confirmPassword) {
        setError('Şifreler eşleşmiyor');
      return;
      }
      
      if (passwords.newPassword && passwords.newPassword.length < 6) {
        setError('Şifre en az 6 karakter olmalıdır');
        return;
      }
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Form verilerini hazırla
      const userData = {
        name: `${formData.name} ${formData.surname}`,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: formData.status
      };
      
      // Şifre değişikliği varsa ekle
      if (showPasswordFields && passwords.newPassword) {
        userData.password = passwords.newPassword;
      }

      // Şirket rolü seçiliyse şirket bilgilerini ekle
      if (formData.role === 'company') {
        userData.company = formData.company;
      }
      
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSuccessMessage('Kullanıcı başarıyla güncellendi');
        setOriginalData({...originalData, ...result.data});
      } else {
        setError(result.message || 'Bir hata oluştu');
      }
    } catch (err) {
      console.error('Güncelleme hatası:', err);
      setError('Kullanıcı güncellenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const response = await axios.delete(`/api/admin/users/${id}`);

      if (response.data.success) {
        router.push('/admin/users');
      }
    } catch (err) {
      console.error('Kullanıcı silme hatası:', err);
      const errorMessage = err.response?.data?.error || 'Kullanıcı silinirken bir hata oluştu';
      setError(errorMessage);
      setDeleting(false);
    }
  };

  // Kullanıcı rolüne göre başlık ve renk
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return { title: 'Admin', color: 'bg-red-100 text-red-800' };
      case 'company':
        return { title: 'Şirket', color: 'bg-blue-100 text-blue-800' };
      case 'driver':
        return { title: 'Sürücü', color: 'bg-green-100 text-green-800' };
      default:
        return { title: 'Müşteri', color: 'bg-purple-100 text-purple-800' };
    }
  };

  // Kullanıcı durumuna göre başlık ve renk
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return { title: 'Aktif', color: 'bg-green-100 text-green-800' };
      case 'inactive':
        return { title: 'Pasif', color: 'bg-gray-100 text-gray-800' };
      case 'pending':
        return { title: 'Onay Bekliyor', color: 'bg-yellow-100 text-yellow-800' };
      case 'suspended':
        return { title: 'Askıya Alınmış', color: 'bg-red-100 text-red-800' };
      default:
        return { title: 'Bilinmiyor', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center mb-2">
              <Link href="/admin/users">
                <a className="text-orange-600 hover:text-orange-700 mr-2">
                  <FaArrowLeft />
                </a>
              </Link>
              <h1 className="text-3xl font-semibold text-gray-800 flex items-center">
                <FaUserEdit className="mr-2" /> Kullanıcı Düzenle
              </h1>
            </div>
            {originalData && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500">
                <span>ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{id}</span></span>
                {originalData.role && (
                  <span className={`px-2 py-1 rounded-full ${getRoleBadge(originalData.role).color}`}>
                    {getRoleBadge(originalData.role).title}
                  </span>
                )}
                {originalData.status && (
                  <span className={`px-2 py-1 rounded-full ${getStatusBadge(originalData.status).color}`}>
                    {getStatusBadge(originalData.status).title}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={handleDelete}
              disabled={deleting || loading}
              className={`bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-700 transition ${
                (deleting || loading) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {deleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Siliniyor...
                </>
              ) : (
                <>
                  <FaTrash className="mr-2" />
                  Kullanıcıyı Sil
                </>
              )}
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white shadow-md rounded-lg p-6 flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Temel Bilgiler */}
                <div className="md:col-span-2">
                  <h2 className="text-xl font-medium text-gray-800 mb-4">Temel Kullanıcı Bilgileri</h2>
                </div>

                {/* İsim */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    İsim <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>

                {/* Soyisim */}
                <div>
                  <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">
                    Soyisim <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="surname"
                    name="surname"
                    value={formData.surname}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>

                {/* E-posta */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>

                {/* Telefon */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                {/* Kullanıcı Rolü */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Kullanıcı Rolü <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="customer">Müşteri</option>
                    <option value="company">Şirket</option>
                    <option value="driver">Sürücü</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Kullanıcı Durumu */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Durum <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                    <option value="pending">Onay Bekliyor</option>
                    <option value="suspended">Askıya Alınmış</option>
                  </select>
                </div>

                {/* Şifre Değiştirme Butonu */}
                <div className="md:col-span-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                    className="text-orange-600 hover:text-orange-800 font-medium"
                  >
                    {showPasswordFields ? 'Şifre Değiştirmekten Vazgeç' : 'Şifre Değiştir'}
                  </button>
                </div>

                {/* Şifre Değiştirme Alanları */}
                {showPasswordFields && (
                  <>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Yeni Şifre <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={passwords.password}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required={showPasswordFields}
                        minLength={6}
                      />
                      <p className="mt-1 text-xs text-gray-500">En az 6 karakter olmalıdır</p>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Yeni Şifre Tekrar <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwords.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required={showPasswordFields}
                      />
                    </div>
                  </>
                )}

                {/* Şirket Bilgileri - Sadece şirket rolü seçiliyse */}
                {formData.role === 'company' && (
                  <>
                    <div className="md:col-span-2 mt-4">
                      <h2 className="text-xl font-medium text-gray-800 mb-4">Şirket Bilgileri</h2>
                    </div>

                    {/* Şirket Adı */}
                    <div>
                      <label htmlFor="company.name" className="block text-sm font-medium text-gray-700 mb-1">
                        Şirket Adı <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="company.name"
                        name="company.name"
                        value={formData.company.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required={formData.role === 'company'}
                      />
                    </div>

                    {/* Vergi Numarası */}
                    <div>
                      <label htmlFor="company.taxNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Vergi Numarası
                      </label>
                      <input
                        type="text"
                        id="company.taxNumber"
                        name="company.taxNumber"
                        value={formData.company.taxNumber}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    {/* Adres */}
                    <div className="md:col-span-2">
                      <label htmlFor="company.address" className="block text-sm font-medium text-gray-700 mb-1">
                        Şirket Adresi
                      </label>
                      <textarea
                        id="company.address"
                        name="company.address"
                        value={formData.company.address}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    {/* Şirket Telefon */}
                    <div>
                      <label htmlFor="company.phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Şirket Telefonu
                      </label>
                      <input
                        type="tel"
                        id="company.phone"
                        name="company.phone"
                        value={formData.company.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-8 flex justify-end">
                <Link href="/admin/users">
                  <a className="mr-4 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition">
                    İptal
                  </a>
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className={`bg-orange-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-orange-700 transition ${
                    saving ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <FaSave className="mr-2" />
                      Kaydet
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {originalData && originalData.createdAt && (
          <div className="mt-4 text-sm text-gray-500 text-right">
            <p>Kayıt Tarihi: {new Date(originalData.createdAt).toLocaleString('tr-TR')}</p>
            {originalData.updatedAt && (
              <p>Son Güncelleme: {new Date(originalData.updatedAt).toLocaleString('tr-TR')}</p>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default withAuth(EditUser, ['super_admin', 'admin', 'editor', 'support']); 