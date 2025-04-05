'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Taşı App</h3>
            <p className="text-gray-400">
              Yük sahipleri ile taşıyıcıları buluşturan güvenilir platform
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Hızlı Linkler</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/hakkimizda" className="text-gray-400 hover:text-white">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/hizmetler" className="text-gray-400 hover:text-white">
                  Hizmetler
                </Link>
              </li>
              <li>
                <Link href="/nasil-calisir" className="text-gray-400 hover:text-white">
                  Nasıl Çalışır?
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="text-gray-400 hover:text-white">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">İletişim</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Telefon: (0212) 123 45 67</li>
              <li>E-posta: info@tasiapp.com</li>
              <li>Adres: İstanbul, Türkiye</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Bizi Takip Edin</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Twitter
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                Instagram
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Taşı App. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
} 