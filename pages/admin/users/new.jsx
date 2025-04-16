import React, { useState } from 'react';
import { withAuth } from '../../../src/lib/auth';
import AdminLayout from '../../../src/components/layouts/AdminLayout';
import { FaUserPlus, FaArrowLeft, FaSave } from 'react-icons/fa';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';

function NewUser() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'customer',
    company: {
      name: '',
      taxNumber: '',
      address: '',
      phone: ''
    }
  });

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

  const validateForm = () => {
    if (!formData.name.trim()) return 'İsim alanı zorunludur';
    if (!formData.surname.trim()) return 'Soyisim alanı zorunludur';
    if (!formData.email.trim()) return 'E-posta alanı zorunludur';
    if (!formData.password) return 'Şifre alanı zorunludur';
    if (formData.password.length < 6) return 'Şifre en az 6 karakter olmalıdır';
    if (formData.password !== formData.confirmPassword) return 'Şifreler eşleşmiyor';

    // Şirket seçilmiş ise şirket adı zorunlu
    if (formData.role === 'company' && !formData.company.name.trim()) {
      return 'Şirket adı zorunludur';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form doğrulama
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // API isteği için veriyi hazırla
      const userData = {
        name: formData.name + ' ' + formData.surname, // İsim ve soyisim birleştir
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        status: 'active'
      };

      // Şirket rolü için şirket bilgilerini ekle
      if (formData.role === 'company') {
        userData.company = formData.company;
      }

      console.log('Gönderilecek kullanıcı verisi:', userData);

      // API isteği gönder
      const token = localStorage.getItem('auth_token');
      const response = await axios.post('/api/admin/users', userData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('API yanıtı:', response.data);

      if (response.data.success) {
        setSuccessMessage('Kullanıcı başarıyla oluşturuldu');
        // Form verilerini temizle
        setFormData({
          name: '',
          surname: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          role: 'customer',
          company: {
            name: '',
            taxNumber: '',
            address: '',
            phone: ''
          }
        });

        // 2 saniye sonra kullanıcı listesine yönlendir
        setTimeout(() => {
          router.push('/admin/users');
        }, 2000);
      }
    } catch (err) {
      console.error('Kullanıcı oluşturma hatası:', err);
      const errorMessage = err.response?.data?.error || 'Kullanıcı oluşturulurken bir hata oluştu';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Yeni Kullanıcı Ekle">
      <div className="p-4 lg:p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-800 flex items-center">
            <FaUserPlus className="mr-2" /> Yeni Kullanıcı Ekle
          </h1>
          <Link href="/admin/users">
            <a className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg flex items-center hover:bg-gray-200 transition">
              <FaArrowLeft className="mr-2" /> Listeye Dön
            </a>
          </Link>
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

              {/* Şifre */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                  minLength={6}
                />
                <p className="mt-1 text-xs text-gray-500">En az 6 karakter olmalıdır</p>
              </div>

              {/* Şifre Tekrar */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Şifre Tekrar <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>

              {/* Kullanıcı Rolü */}
              <div className="md:col-span-2">
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
                disabled={loading}
                className={`bg-orange-600 text-white px-6 py-2 rounded-lg flex items-center hover:bg-orange-700 transition ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
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
      </div>
    </AdminLayout>
  );
}

export default withAuth(NewUser, ['admin', 'super_admin', 'editor', 'support']); 