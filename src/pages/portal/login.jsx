import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaTruck } from 'react-icons/fa';
import Head from 'next/head';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login işleminden sonra sayfa yenilemesi gerekirse
  useEffect(() => {
    // Sonsuz döngüyü önlemek için bu kontrol kısmını kaldırıyoruz
    // Kullanıcı login sayfasında kalsın, sadece butonla giriş yapsın
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log("Giriş yapılıyor...");
      
      // Demo kullanıcı objesi
      const user = {
        id: 1,
        name: 'Demo Kullanıcı',
        email: 'demo@tasiapp.com',
        role: 'portal_user'
      };

      // Tarayıcı önbelleğini temizleme
      localStorage.clear();
      
      // Her iki anahtara da kullanıcı bilgilerini kaydet
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('portal_user', JSON.stringify(user));
      
      console.log("Kullanıcı bilgileri kaydedildi. Dashboard'a yönlendiriliyor...");
      
      // Next.js router yerine doğrudan tarayıcı yönlendirmesi kullan
      window.location.href = "/portal/dashboard";
      
    } catch (err) {
      console.error("Giriş hatası:", err);
      setError("Giriş yaparken bir hata oluştu. Lütfen tekrar deneyin.");
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Taşıyıcı Portalı | Taşı.app</title>
        <meta name="description" content="Taşı.app taşıyıcı portalı giriş sayfası" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="bg-white p-3 rounded-full shadow-lg">
              <FaTruck className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Taşıyıcı Portalı
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Taşı.app taşıyıcı portalına hoş geldiniz
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-100">
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleLogin}
              className="w-full flex justify-center py-3 px-4 bg-blue-600 text-white rounded-md shadow-sm text-lg font-medium hover:bg-blue-700 focus:outline-none"
            >
              {loading ? "Giriş yapılıyor..." : "Demo Hesap ile Giriş Yap"}
            </button>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Bu demo hesap, tüm kullanıcıları doğrudan giriş yapmalarını sağlar.</p>
              <p>Gerçek bir kullanıcı doğrulaması yoktur.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 