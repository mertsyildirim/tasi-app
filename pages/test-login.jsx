import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function TestLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      console.log('Giriş denemesi:', formData);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('API yanıtı:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Giriş başarısız');
      }

      // Başarılı giriş
      setSuccessMessage('Giriş başarılı! Yönlendiriliyor...');
      
      // Kullanıcı bilgilerini sessionStorage'a kaydet
      sessionStorage.setItem('userData', JSON.stringify({
        id: data.user._id,
        email: data.user.email,
        name: data.user.name || 'Kullanıcı',
        role: data.user.role,
        token: data.token
      }));

      // Rol bazlı yönlendirme
      setTimeout(() => {
        if (data.user.role === 'carrier') {
          router.push('/portal/dashboard');
        } else if (data.user.role === 'driver') {
          router.push('/portal/driver/dashboard');
        } else if (data.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      }, 1500);
    } catch (error) {
      console.error('Giriş hatası:', error);
      setError(error.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Test Giriş | Taşı App</title>
        <meta name="description" content="Test Giriş Sayfası" />
      </Head>

      <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6">Test Giriş</h1>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <p className="text-green-700">{successMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-posta
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Şifre
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={loading}
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-sm text-gray-600 text-center">Test Kullanıcıları:</p>
            <div className="mt-2 text-xs text-gray-600 space-y-1">
              <p>Taşıyıcı: tasici@tasiapp.com / TasiApp2024!</p>
              <p>Sürücü: surucu@tasiapp.com / Driver2024!</p>
              <p>Müşteri: musteri@tasiapp.com / Customer2024!</p>
              <p>Admin: admin@tasiapp.com / Admin2024!</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 