'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getUserFromStorage, logoutUser } from '../utils/auth'
import { FaUser, FaSignOutAlt, FaCog, FaChevronDown, FaBars, FaTimes } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const storedUser = getUserFromStorage()
    setUser(storedUser)

    const handleStorageChange = () => {
      const updatedUser = getUserFromStorage()
      setUser(updatedUser)
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const handleLogout = () => {
    logoutUser()
    setUser(null)
    setIsProfileOpen(false)
    router.push('/')
  }

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="Taşı Logo" 
              width={120} 
              height={40} 
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Mobil Menü Butonu */}
          <button
            className="md:hidden text-gray-600 hover:text-orange-500"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <FaTimes className="h-6 w-6" />
            ) : (
              <FaBars className="h-6 w-6" />
            )}
          </button>

          {/* Desktop Menü */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-600 hover:text-orange-500">
              Anasayfa
            </Link>
            <Link href="/hakkimizda" className="text-gray-600 hover:text-orange-500">
              Hakkımızda
            </Link>
            <Link href="/hizmetler" className="text-gray-600 hover:text-orange-500">
              Hizmetler
            </Link>
            <Link href="/nasil-calisir" className="text-gray-600 hover:text-orange-500">
              Nasıl Çalışır?
            </Link>
            <Link href="/iletisim" className="text-gray-600 hover:text-orange-500">
              İletişim
            </Link>
          </nav>

          {/* Mobil Menü */}
          <div
            ref={menuRef}
            className={`fixed md:hidden top-[72px] left-0 right-0 bg-white shadow-lg transition-all duration-300 ease-in-out ${
              isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
            } z-50`}
          >
            <div className="py-4 px-6 space-y-4">
              <Link
                href="/"
                className="block text-gray-600 hover:text-orange-500 py-2 text-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Anasayfa
              </Link>
              <Link
                href="/hakkimizda"
                className="block text-gray-600 hover:text-orange-500 py-2 text-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Hakkımızda
              </Link>
              <Link
                href="/hizmetler"
                className="block text-gray-600 hover:text-orange-500 py-2 text-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Hizmetler
              </Link>
              <Link
                href="/nasil-calisir"
                className="block text-gray-600 hover:text-orange-500 py-2 text-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Nasıl Çalışır?
              </Link>
              <Link
                href="/iletisim"
                className="block text-gray-600 hover:text-orange-500 py-2 text-lg font-medium border-b border-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                İletişim
              </Link>
              {!user && (
                <Link
                  href="/giris"
                  className="block text-center bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors text-lg font-medium mt-4"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Giriş Yap / Kayıt Ol
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-orange-500 focus:outline-none"
                >
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-orange-500" />
                  </div>
                  <span className="font-medium">
                    {user.type === 'corporate' ? user.companyName : user.fullName}
                  </span>
                  <FaChevronDown className={`transform transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10">
                    <Link
                      href="/profil"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                    >
                      <FaUser className="mr-2" />
                      <span>Profilim</span>
                    </Link>
                    <Link
                      href="/ayarlar"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                    >
                      <FaCog className="mr-2" />
                      <span>Ayarlar</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                    >
                      <FaSignOutAlt className="mr-2" />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/giris"
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Giriş Yap / Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 