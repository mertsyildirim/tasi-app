import React, { useState } from 'react';
import Head from 'next/head';
import { FaTruck } from 'react-icons/fa';

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    
    try {
      // Taşıyıcı demo hesabı (basit obje)
      const user = {
        id: 1,
        name: 'Demo Kullanıcı',
        email: 'demo@tasiapp.com'
      };
      
      // Önce localStorage'ı temizle
      localStorage.clear();
      
      // Kullanıcı verilerini kaydet
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('portal_user', JSON.stringify(user));
      
      // Doğrudan sabit URL'ye yönlendir
      window.location.href = "https://portal.tasiapp.com/portal/dashboard";
      
    } catch (error) {
      console.error("Login hatası:", error);
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
            <button
              onClick={handleLogin}
              disabled={loading}
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