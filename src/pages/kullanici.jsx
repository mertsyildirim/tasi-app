import React from 'react'
import { FaMapMarkerAlt, FaBox, FaTruck, FaClipboardList, FaEnvelope, FaMapPin, FaPhone, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'

export default function KullaniciSayfasi() {
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col">
      <div className="flex-grow">
        {/* Header */}
        <header className="w-full bg-indigo-600 text-white py-6">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Taşı.app</h1>
              <div className="flex items-center space-x-4">
                <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition">
                  Profilim
                </button>
                <button className="bg-transparent border border-white text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                  Çıkış
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-indigo-600 text-white py-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h2 className="text-3xl font-bold mb-4">Eşyanızı taşımak hiç bu kadar kolay olmamıştı!</h2>
                <p className="text-lg mb-6">Güvenilir taşıyıcılarla eşyalarınızı şehir içi veya şehirlerarası hızlıca taşıyın. Sadece birkaç adımda taşıma talebinizi oluşturun ve hemen teklifler almaya başlayın!</p>
                <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-bold text-lg hover:bg-indigo-50 transition">
                  Taşıma Talebi Oluştur
                </button>
              </div>
              <div className="md:w-1/2">
                <img src="/images/hero-illustration.svg" alt="Taşıma Hizmeti" className="w-full h-auto" />
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Taşıma Hizmetlerimiz</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-lg transition">
                <div className="bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaBox className="text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-center mb-4">Koli Taşıma</h3>
                <p className="text-gray-600 text-center">Küçük kolilerinizi veya paketlerinizi şehir içinde hızlıca teslim ediyoruz.</p>
              </div>
              <div className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-lg transition">
                <div className="bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTruck className="text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-center mb-4">Ev Taşıma</h3>
                <p className="text-gray-600 text-center">Profesyonel ekiplerimizle evinizi güvenle ve hızla yeni adresinize taşıyoruz.</p>
              </div>
              <div className="bg-gray-50 p-8 rounded-lg shadow-md hover:shadow-lg transition">
                <div className="bg-indigo-100 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaClipboardList className="text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-center mb-4">Özel Taşıma</h3>
                <p className="text-gray-600 text-center">Büyük, hassas veya özel eşyalarınız için özel çözümler sunuyoruz.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Nasıl Çalışır?</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                <h3 className="text-xl font-bold mb-2">Taşıma Talebinizi Oluşturun</h3>
                <p className="text-gray-600">Eşyanızın türünü, boyutlarını ve taşıma adreslerini belirtin.</p>
              </div>
              <div className="text-center">
                <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                <h3 className="text-xl font-bold mb-2">Teklifleri İnceleyin</h3>
                <p className="text-gray-600">Onaylı taşıyıcılarımızdan gelen teklifleri karşılaştırın.</p>
              </div>
              <div className="text-center">
                <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                <h3 className="text-xl font-bold mb-2">Taşıyıcıyı Seçin</h3>
                <p className="text-gray-600">Size en uygun teklifi veren taşıyıcıyı seçin ve onaylayın.</p>
              </div>
              <div className="text-center">
                <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
                <h3 className="text-xl font-bold mb-2">Taşıma İşlemini Tamamlayın</h3>
                <p className="text-gray-600">Taşıma işlemi tamamlandıktan sonra taşıyıcıyı değerlendirin.</p>
              </div>
            </div>
            <div className="text-center mt-12">
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-indigo-700 transition">
                Hemen Başlayın
              </button>
            </div>
          </div>
        </section>

        {/* Active Requests */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Aktif Talepleriniz</h2>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Ev Taşıma</h3>
                  <span className="bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full text-sm font-medium">Teklifler Bekleniyor</span>
                </div>
                <div className="mt-4 flex items-center text-gray-600">
                  <FaMapMarkerAlt className="text-indigo-600 mr-2" />
                  <p><span className="font-medium">Nereden:</span> Kadıköy, İstanbul</p>
                  <span className="mx-4">→</span>
                  <FaMapMarkerAlt className="text-indigo-600 mr-2" />
                  <p><span className="font-medium">Nereye:</span> Beşiktaş, İstanbul</p>
                </div>
                <div className="mt-2 text-gray-600">
                  <p><span className="font-medium">Tarih:</span> 15 Haziran 2023</p>
                </div>
                <div className="mt-4">
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition mr-3">
                    Teklifleri Görüntüle (3)
                  </button>
                  <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition">
                    Talebi Düzenle
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Koli Taşıma</h3>
                  <span className="bg-green-100 text-green-800 py-1 px-3 rounded-full text-sm font-medium">Taşıyıcı Yolda</span>
                </div>
                <div className="mt-4 flex items-center text-gray-600">
                  <FaMapMarkerAlt className="text-indigo-600 mr-2" />
                  <p><span className="font-medium">Nereden:</span> Ataşehir, İstanbul</p>
                  <span className="mx-4">→</span>
                  <FaMapMarkerAlt className="text-indigo-600 mr-2" />
                  <p><span className="font-medium">Nereye:</span> Şişli, İstanbul</p>
                </div>
                <div className="mt-2 text-gray-600">
                  <p><span className="font-medium">Tarih:</span> 12 Haziran 2023</p>
                </div>
                <div className="mt-4">
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition mr-3">
                    Taşıyıcıyı Ara
                  </button>
                  <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition">
                    Canlı Takip
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
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
                  <FaMapPin className="mr-2 text-indigo-500" />
                  <span className="text-gray-400">İstanbul, Türkiye</span>
                </li>
                <li className="flex items-center">
                  <FaPhone className="mr-2 text-indigo-500" />
                  <span className="text-gray-400">+90 (212) 123 45 67</span>
                </li>
                <li className="flex items-center">
                  <FaEnvelope className="mr-2 text-indigo-500" />
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