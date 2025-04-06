import React from 'react'
import { FaTruck, FaClipboardList, FaRoute, FaMoneyBillWave, FaUser, FaCog, FaEnvelope, FaMapPin, FaPhone, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'

export default function TasiyiciSayfasi() {
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-grow">
        {/* Header */}
        <header className="w-full bg-blue-600 text-white py-6">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Taşı.app Taşıyıcı Paneli</h1>
              <div className="flex items-center space-x-4">
                <button className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition">
                  <FaUser className="inline mr-2" /> Profilim
                </button>
                <button className="bg-transparent border border-white text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                  Çıkış
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Hoş Geldiniz, Taşıyıcı</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-500 p-3 rounded-full text-white">
                    <FaClipboardList className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Aktif Talepler</h3>
                    <p className="text-3xl font-bold text-blue-600">12</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-green-500 p-3 rounded-full text-white">
                    <FaRoute className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Tamamlanan Taşımalar</h3>
                    <p className="text-3xl font-bold text-green-600">48</p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-500 p-3 rounded-full text-white">
                    <FaMoneyBillWave className="text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Toplam Kazanç</h3>
                    <p className="text-3xl font-bold text-orange-600">₺24,550</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Aktif Taşıma Talepleri</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                    <th className="py-3 px-6 text-left">ID</th>
                    <th className="py-3 px-6 text-left">Alım</th>
                    <th className="py-3 px-6 text-left">Teslimat</th>
                    <th className="py-3 px-6 text-center">Mesafe</th>
                    <th className="py-3 px-6 text-center">Tür</th>
                    <th className="py-3 px-6 text-center">Ücret</th>
                    <th className="py-3 px-6 text-center">İşlem</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 text-sm">
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left">#T1254</td>
                    <td className="py-3 px-6 text-left">Kadıköy, İstanbul</td>
                    <td className="py-3 px-6 text-left">Beşiktaş, İstanbul</td>
                    <td className="py-3 px-6 text-center">10.5 km</td>
                    <td className="py-3 px-6 text-center">
                      <span className="bg-blue-200 text-blue-800 py-1 px-3 rounded-full text-xs">Paletli Taşıma</span>
                    </td>
                    <td className="py-3 px-6 text-center font-bold">₺450</td>
                    <td className="py-3 px-6 text-center">
                      <button className="bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600 mr-2">Kabul Et</button>
                      <button className="bg-gray-200 text-gray-700 py-1 px-4 rounded hover:bg-gray-300">Detay</button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left">#T1255</td>
                    <td className="py-3 px-6 text-left">Ataşehir, İstanbul</td>
                    <td className="py-3 px-6 text-left">Sarıyer, İstanbul</td>
                    <td className="py-3 px-6 text-center">22.3 km</td>
                    <td className="py-3 px-6 text-center">
                      <span className="bg-orange-200 text-orange-800 py-1 px-3 rounded-full text-xs">Depo Taşıma</span>
                    </td>
                    <td className="py-3 px-6 text-center font-bold">₺850</td>
                    <td className="py-3 px-6 text-center">
                      <button className="bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600 mr-2">Kabul Et</button>
                      <button className="bg-gray-200 text-gray-700 py-1 px-4 rounded hover:bg-gray-300">Detay</button>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 text-left">#T1256</td>
                    <td className="py-3 px-6 text-left">Bakırköy, İstanbul</td>
                    <td className="py-3 px-6 text-left">Beylikdüzü, İstanbul</td>
                    <td className="py-3 px-6 text-center">31.8 km</td>
                    <td className="py-3 px-6 text-center">
                      <span className="bg-purple-200 text-purple-800 py-1 px-3 rounded-full text-xs">Koli Taşıma</span>
                    </td>
                    <td className="py-3 px-6 text-center font-bold">₺320</td>
                    <td className="py-3 px-6 text-center">
                      <button className="bg-green-500 text-white py-1 px-4 rounded hover:bg-green-600 mr-2">Kabul Et</button>
                      <button className="bg-gray-200 text-gray-700 py-1 px-4 rounded hover:bg-gray-300">Detay</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Araç Bilgileriniz</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <FaTruck className="mr-3 text-blue-600 text-xl" />
                  <span className="font-medium">Kamyon (10 ton)</span>
                </div>
                <div className="pl-8">
                  <p className="text-gray-600">Plaka: <span className="font-medium">34 ABC 123</span></p>
                  <p className="text-gray-600">Model: <span className="font-medium">2020 Ford Cargo</span></p>
                  <p className="text-gray-600">Kapasite: <span className="font-medium">45 m³</span></p>
                </div>
                <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 inline-flex items-center">
                  <FaCog className="mr-2" />
                  Araç Bilgilerini Düzenle
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-6">Performans</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Tamamlama Oranı</span>
                    <span className="font-medium">96%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Zamanında Teslimat</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Müşteri Memnuniyeti</span>
                    <span className="font-medium">4.8/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Taşı.app</h3>
              <p className="text-gray-400 mb-4">Türkiye'nin lider lojistik ve taşımacılık platformu. Güvenli ve hızlı taşıma hizmetleri için bizi tercih edin.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition"><FaFacebook size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-white transition"><FaTwitter size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-white transition"><FaInstagram size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-white transition"><FaLinkedin size={20} /></a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Hizmetlerimiz</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Depo Taşıma</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Paletli Taşıma</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Koli Taşıma</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Parsiyel Taşıma</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Evden Eve Nakliyat</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Şirket</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition">Hakkımızda</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Kariyer</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Gizlilik Politikası</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition">Kullanım Şartları</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">İletişim</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <FaMapPin className="mr-2 text-blue-500" />
                  <span className="text-gray-400">İstanbul, Türkiye</span>
                </li>
                <li className="flex items-center">
                  <FaPhone className="mr-2 text-blue-500" />
                  <span className="text-gray-400">+90 (212) 123 45 67</span>
                </li>
                <li className="flex items-center">
                  <FaEnvelope className="mr-2 text-blue-500" />
                  <span className="text-gray-400">info@tasi.app</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} Taşı.app. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </main>
  )
} 