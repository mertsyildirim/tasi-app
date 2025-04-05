'use client'

import { FaTruck, FaUsers, FaHandshake, FaChartLine } from 'react-icons/fa'

export default function Hakkimizda() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-16">
      {/* Ana Başlık */}
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Hakkımızda</h1>
        <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
          TaşıApp, Türkiye'nin lider dijital taşımacılık platformu olarak, güvenilir ve kaliteli hizmet sunmayı amaçlamaktadır.
        </p>

        {/* Misyon & Vizyon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-orange-600">Misyonumuz</h2>
            <p className="text-gray-600">
              Müşterilerimize en kaliteli taşımacılık hizmetini sunarak, sektörde güvenilir ve yenilikçi çözümler üretmek. 
              Teknoloji ile geleneksel taşımacılığı birleştirerek, kullanıcılarımıza sorunsuz bir deneyim yaşatmak.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-orange-600">Vizyonumuz</h2>
            <p className="text-gray-600">
              Türkiye'nin ve bölgenin en büyük dijital taşımacılık platformu olmak. 
              Yenilikçi çözümlerimizle sektöre öncülük ederek, taşımacılık deneyimini daha iyiye taşımak.
            </p>
          </div>
        </div>

        {/* Değerlerimiz */}
        <h2 className="text-3xl font-bold text-center mb-12">Değerlerimiz</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <FaTruck className="w-12 h-12 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Güvenilirlik</h3>
            <p className="text-gray-600">
              Her zaman güvenilir ve şeffaf hizmet sunuyoruz.
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <FaUsers className="w-12 h-12 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Müşteri Odaklılık</h3>
            <p className="text-gray-600">
              Müşterilerimizin memnuniyeti önceliğimizdir.
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <FaHandshake className="w-12 h-12 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">İş Birliği</h3>
            <p className="text-gray-600">
              Paydaşlarımızla güçlü iş birlikleri kuruyoruz.
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <FaChartLine className="w-12 h-12 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sürekli Gelişim</h3>
            <p className="text-gray-600">
              Kendimizi sürekli yeniliyor ve geliştiriyoruz.
            </p>
          </div>
        </div>

        {/* Rakamlarla Biz */}
        <h2 className="text-3xl font-bold text-center mb-12">Rakamlarla Biz</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">10.000+</div>
            <div className="text-gray-600">Başarılı Taşıma</div>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">1.000+</div>
            <div className="text-gray-600">Aktif Taşıyıcı</div>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="text-4xl font-bold text-orange-600 mb-2">81</div>
            <div className="text-gray-600">Hizmet Verilen İl</div>
          </div>
        </div>
      </div>
    </main>
  )
} 