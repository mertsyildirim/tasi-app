'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'

const Register = () => {
  const router = useRouter();
  const [accountType, setAccountType] = useState('individual'); // 'individual' veya 'corporate'
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    taxNumber: '',
    taxOffice: '',
    agreeToTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Kullanım koşullarını kabul etmelisiniz');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          accountType,
          ...(accountType === 'corporate' && {
            companyName: formData.companyName,
            taxNumber: formData.taxNumber,
            taxOffice: formData.taxOffice
          })
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/login?registered=true');
      } else {
        setError(data.error || 'Kayıt sırasında bir hata oluştu');
      }
    } catch (error) {
      console.error('Register error:', error);
      setError('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Kayıt Ol | Taşı.app</title>
        <meta name="description" content="Taşı.app kayıt sayfası" />
      </Head>
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <div className="mb-6">
            <Image
              src="/logo.png"
              alt="Taşı.app Logo"
              width={150}
              height={150}
              priority
            />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Yeni Hesap Oluştur
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Zaten hesabınız var mı?{' '}
            <Link href="/login" className="font-medium text-orange-600 hover:text-orange-500">
              Giriş yapın
            </Link>
          </p>
        </div>

        {/* Hesap tipi toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                accountType === 'individual'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-200`}
              onClick={() => setAccountType('individual')}
            >
              Bireysel
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                accountType === 'corporate'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-200`}
              onClick={() => setAccountType('corporate')}
            >
              Kurumsal
            </button>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {accountType === 'individual' ? (
              // Bireysel kayıt formu
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className="sr-only">Ad</label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                      placeholder="Ad"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="sr-only">Soyad</label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                      placeholder="Soyad"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>
              </>
            ) : (
              // Kurumsal kayıt formu
              <>
                <div>
                  <label htmlFor="companyName" className="sr-only">Firma Adı</label>
                  <input
                    id="companyName"
                    name="companyName"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                    placeholder="Firma Adı"
                    value={formData.companyName}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="taxNumber" className="sr-only">Vergi Numarası</label>
                    <input
                      id="taxNumber"
                      name="taxNumber"
                      type="text"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                      placeholder="Vergi Numarası"
                      value={formData.taxNumber}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label htmlFor="taxOffice" className="sr-only">Vergi Dairesi</label>
                    <input
                      id="taxOffice"
                      name="taxOffice"
                      type="text"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                      placeholder="Vergi Dairesi"
                      value={formData.taxOffice}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className="sr-only">Yetkili Adı</label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                      placeholder="Yetkili Adı"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="sr-only">Yetkili Soyadı</label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                      placeholder="Yetkili Soyadı"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                </div>
              </>
            )}
            <div>
              <label htmlFor="email" className="sr-only">Email adresi</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Email adresi"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="phone" className="sr-only">Telefon numarası</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Telefon numarası (5XX XXX XX XX)"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Şifre</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Şifre"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Şifre Tekrar</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Şifre Tekrar"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              required
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              disabled={loading}
            />
            <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
              <Link href="/terms" className="text-orange-600 hover:text-orange-500">Kullanım Koşulları</Link>nı kabul ediyorum
            </label>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading ? 'bg-orange-400' : 'bg-orange-600 hover:bg-orange-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
              disabled={loading}
            >
              {loading ? 'Hesap Oluşturuluyor...' : 'Hesap Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register 