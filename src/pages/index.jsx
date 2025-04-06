import React from 'react'
import Link from 'next/link'
import { FaTruck, FaUsers, FaMapMarkerAlt, FaCheckCircle, FaShieldAlt, FaMoneyBillWave, FaStar, FaEnvelope, FaMapPin, FaPhone, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-grow">
        {/* Navigation */}
        <nav className="bg-white shadow-md py-4">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">Taşı.app</h1>
            <div className="flex space-x-6 items-center">
              <a href="#" className="text-gray-600 hover:text-blue-600 transition">Hizmetlerimiz</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition">Nasıl Çalışır</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition">SSS</a>
              <a href="#" className="text-gray-600 hover:text-blue-600 transition">İletişim</a>
              <Link href="/kullanici" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Müşteri Girişi</Link>
              <Link href="/tasiyici" className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition">Taşıyıcı Girişi</Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Türkiye'nin En Hızlı Taşıma Platformu</h2>
                <p className="text-xl mb-8">Eşyalarınızı güvenle taşımak için doğru adrestesiniz. Sadece birkaç tıklama ile taşıma talebinizi oluşturun, güvenilir taşıyıcılardan hemen teklif almaya başlayın!</p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold text-lg hover:bg-blue-50 transition w-full sm:w-auto">
                    Taşıma Talebi Oluştur
                  </button>
                  <button className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-blue-400 transition border border-white w-full sm:w-auto">
                    Taşıyıcı Ol
                  </button>
                </div>
              </div>
              <div className="md:w-1/2">
                <img src="/images/hero-illustration.svg" alt="Taşıma Hizmeti" className="w-full" />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Neden Taşı.app?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaShieldAlt className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-4">Güvenli Taşıma</h3>
                <p className="text-gray-600">Tüm taşıyıcılarımız detaylı bir şekilde incelenir ve onaylanır. Eşyalarınız sigorta kapsamındadır.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaMoneyBillWave className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-4">Uygun Fiyatlar</h3>
                <p className="text-gray-600">Rekabetçi fiyatlarla en uygun taşıma teklifini seçme özgürlüğüne sahipsiniz.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCheckCircle className="text-blue-600 text-2xl" />
                </div>
                <h3 className="text-xl font-bold mb-4">Kolay Kullanım</h3>
                <p className="text-gray-600">Kullanıcı dostu arayüzümüz sayesinde taşıma talebi oluşturmak ve taşıyıcı bulmak çok kolay.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Nasıl Çalışır?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <div className="space-y-8">
                  <div className="flex items-start">
                    <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1">1</div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold mb-2">Taşıma talebinizi oluşturun</h3>
                      <p className="text-gray-600">Taşınacak eşyanızın türünü, boyutlarını, alınacak ve teslim edilecek adresleri, tarihleri belirtin.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1">2</div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold mb-2">Teklifleri değerlendirin</h3>
                      <p className="text-gray-600">Güvenilir taşıyıcılarımızdan gelen teklifleri karşılaştırın ve en uygun olanı seçin.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-1">3</div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold mb-2">Taşıma işlemini tamamlayın</h3>
                      <p className="text-gray-600">Taşıyıcı ile iletişime geçin, eşyalarınızı güvenle taşıtın ve taşıma tamamlandığında ödemeyi yapın.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <img src="/images/how-it-works.svg" alt="Nasıl Çalışır" className="w-full rounded-lg shadow-lg" />
              </div>
            </div>
            
            <div className="text-center mt-12">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-blue-700 transition">
                Hemen Başlayın
              </button>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Taşıma Hizmetlerimiz</h2>
            <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">Her türlü taşıma ihtiyacınız için uygun çözümler sunuyoruz. İster ev eşyası, ister ofis ekipmanı, ister özel eşya - tüm taşıma işleriniz için yanınızdayız.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <img src="/images/service-home-moving.svg" alt="Ev Taşıma" className="w-full h-48 object-cover rounded-md mb-4" />
                <h3 className="text-xl font-bold mb-2">Ev Taşıma</h3>
                <p className="text-gray-600 mb-4">Evinizi güvenle ve profesyonelce yeni adresinize taşıyoruz.</p>
                <a href="#" className="text-blue-600 font-medium hover:text-blue-800 transition">Daha Fazla Bilgi →</a>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <img src="/images/service-office-moving.svg" alt="Ofis Taşıma" className="w-full h-48 object-cover rounded-md mb-4" />
                <h3 className="text-xl font-bold mb-2">Ofis Taşıma</h3>
                <p className="text-gray-600 mb-4">İş akışınızı minimum seviyede etkileyecek şekilde ofis taşıma hizmeti.</p>
                <a href="#" className="text-blue-600 font-medium hover:text-blue-800 transition">Daha Fazla Bilgi →</a>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <img src="/images/service-furniture-moving.svg" alt="Mobilya Taşıma" className="w-full h-48 object-cover rounded-md mb-4" />
                <h3 className="text-xl font-bold mb-2">Mobilya Taşıma</h3>
                <p className="text-gray-600 mb-4">Tek bir mobilya parçasını bile özenle taşıyoruz.</p>
                <a href="#" className="text-blue-600 font-medium hover:text-blue-800 transition">Daha Fazla Bilgi →</a>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
                <img src="/images/service-special-items.svg" alt="Özel Eşya Taşıma" className="w-full h-48 object-cover rounded-md mb-4" />
                <h3 className="text-xl font-bold mb-2">Özel Eşya Taşıma</h3>
                <p className="text-gray-600 mb-4">Piyano, sanat eserleri gibi özel eşyalarınız için uzman taşıma hizmeti.</p>
                <a href="#" className="text-blue-600 font-medium hover:text-blue-800 transition">Daha Fazla Bilgi →</a>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Müşterilerimiz Ne Diyor?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex text-yellow-400 mb-4">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>
                <p className="text-gray-600 mb-4">"Taşı.app sayesinde İstanbul'dan Ankara'ya taşınmak çok kolay oldu. Taşıyıcıyı kolayca bulabildim ve tüm eşyalarım güvenle yeni evime ulaştı."</p>
                <div className="flex items-center">
                  <img src="/images/avatar-1.svg" alt="Müşteri" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <h4 className="font-bold">Ayşe Yılmaz</h4>
                    <p className="text-gray-500 text-sm">İstanbul</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex text-yellow-400 mb-4">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>
                <p className="text-gray-600 mb-4">"Ofisimizi taşırken Taşı.app'i kullandık. Rekabetçi fiyatlar ve profesyonel hizmet sayesinde sorunsuz bir taşınma süreci yaşadık."</p>
                <div className="flex items-center">
                  <img src="/images/avatar-2.svg" alt="Müşteri" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <h4 className="font-bold">Mehmet Kaya</h4>
                    <p className="text-gray-500 text-sm">İzmir</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex text-yellow-400 mb-4">
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </div>
                <p className="text-gray-600 mb-4">"Piyanomun taşınması konusunda endişeliydim ama Taşı.app'ten bulduğum uzman taşıyıcı sayesinde hiçbir sorun yaşamadan taşınma işlemi tamamlandı."</p>
                <div className="flex items-center">
                  <img src="/images/avatar-3.svg" alt="Müşteri" className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <h4 className="font-bold">Zeynep Demir</h4>
                    <p className="text-gray-500 text-sm">Ankara</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Taşıma İşleminizi Hemen Başlatın</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">Türkiye'nin en hızlı ve güvenilir taşıma platformuna katılın. Birkaç tıklama ile taşıma talebinizi oluşturun ve hemen teklifler almaya başlayın.</p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition">
                Taşıma Talebi Oluştur
              </button>
              <button className="bg-blue-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-400 transition border border-white">
                Taşıyıcı Olarak Kaydol
              </button>
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