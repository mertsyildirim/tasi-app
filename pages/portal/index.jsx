'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function PortalIndex() {
  const router = useRouter();

  useEffect(() => {
    // Kullanıcı oturum durumunu kontrol et
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      const user = JSON.parse(userData);
      // Kullanıcı rolüne göre yönlendirme
      if (user.role === 'driver') {
        router.push('/portal/driver/dashboard');
      } else {
        router.push('/portal/dashboard');
      }
    } else {
      // Oturum yoksa giriş sayfasına yönlendir
      router.push('/portal/login');
    }
  }, []);

  return (
    <>
      <Head>
        <title>Taşıyıcı Portalı - TaşıApp</title>
        <meta name="description" content="TaşıApp Taşıyıcı Portalı" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            TaşıApp Taşıyıcı Portalı
          </h1>
          <p className="text-gray-600">
            Yönlendiriliyorsunuz...
          </p>
        </div>
      </div>
    </>
  );
} 