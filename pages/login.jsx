'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { signIn } from 'next-auth/react'
import Image from 'next/image'

const Login = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loginType, setLoginType] = useState('email') // 'email' veya 'phone'
  const [otpSent, setOtpSent] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    otp: '',
    rememberMe: false
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (loginType === 'email') {
        const result = await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password
        })

        if (result.error) {
          setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.')
        } else {
          router.push('/portal/dashboard')
        }
      } else {
        // Telefon numarası ile giriş
        if (!otpSent) {
          // OTP gönderme işlemi
          try {
            const response = await fetch('/api/auth/send-otp', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ phone: formData.phone }),
            })
            
            if (response.ok) {
              setOtpSent(true)
              setError('')
            } else {
              const data = await response.json()
              setError(data.error || 'OTP gönderilemedi. Lütfen tekrar deneyin.')
            }
          } catch (error) {
            setError('OTP gönderilirken bir hata oluştu.')
          }
        } else {
          // OTP doğrulama işlemi
          try {
            const response = await fetch('/api/auth/verify-otp', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                phone: formData.phone,
                otp: formData.otp 
              }),
            })
            
            if (response.ok) {
              router.push('/portal/dashboard')
            } else {
              const data = await response.json()
              setError(data.error || 'OTP doğrulanamadı. Lütfen tekrar deneyin.')
            }
          } catch (error) {
            setError('OTP doğrulanırken bir hata oluştu.')
          }
        }
      }
    } catch (error) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  const toggleLoginType = () => {
    setLoginType(prev => prev === 'email' ? 'phone' : 'email')
    setOtpSent(false)
    setError('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Giriş Yap | Taşı.app</title>
        <meta name="description" content="Taşı.app giriş sayfası" />
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
            Hesabınıza Giriş Yapın
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hesabınız yok mu?{' '}
            <Link href="/register" className="font-medium text-orange-600 hover:text-orange-500">
              Hemen kaydolun
            </Link>
          </p>
        </div>
        
        {/* Giriş tipi toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                loginType === 'email'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-200`}
              onClick={() => setLoginType('email')}
            >
              E-posta ile Giriş
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                loginType === 'phone'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } border border-gray-200`}
              onClick={() => setLoginType('phone')}
            >
              Telefon ile Giriş
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {loginType === 'email' ? (
            // E-posta ile giriş formu
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">Email adresi</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                  placeholder="Email adresi"
                  value={formData.email}
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
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                  placeholder="Şifre"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>
          ) : (
            // Telefon ile giriş formu
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="phone" className="sr-only">Telefon numarası</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                  placeholder="Telefon numarası (5XX XXX XX XX)"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading || otpSent}
                />
              </div>
              {otpSent && (
                <div>
                  <label htmlFor="otp" className="sr-only">Doğrulama kodu</label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                    placeholder="Doğrulama kodu"
                    value={formData.otp}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              )}
            </div>
          )}

          {loginType === 'email' && (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={loading}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                  Beni hatırla
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-orange-600 hover:text-orange-500">
                  Şifremi unuttum
                </Link>
              </div>
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
              {loading 
                ? (loginType === 'phone' && !otpSent ? 'Kod Gönderiliyor...' : 'Giriş yapılıyor...') 
                : (loginType === 'phone' && !otpSent ? 'Kod Gönder' : 'Giriş Yap')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login 