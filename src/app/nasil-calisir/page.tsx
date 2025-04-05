'use client'

import { FaSearch, FaClipboardList, FaTruck, FaStar, FaUserCheck, FaMoneyBillWave, FaMobile, FaShieldAlt } from 'react-icons/fa'

export default function NasilCalisir() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-16">
      {/* Ana Başlık */}
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Nasıl Çalışır?</h1>
        <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
          TaşıApp ile taşıma işleminizi kolayca gerçekleştirin. Sadece birkaç adımda güvenilir taşıma hizmeti alın.
        </p>

        {/* Adımlar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaSearch className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold mb-4">1. Teklif Alın</h3>
            <p className="text-gray-600">
              Taşınacak eşyalarınızın bilgilerini girin ve hemen ücretsiz teklif alın.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaClipboardList className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold mb-4">2. Teklif Karşılaştırın</h3>
            <p className="text-gray-600">
              Size özel gelen teklifleri karşılaştırın ve size en uygun olanı seçin.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaTruck className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold mb-4">3. Taşıma İşlemi</h3>
            <p className="text-gray-600">
              Seçtiğiniz firma ile taşıma işleminizi güvenle gerçekleştirin.
            </p>
          </div>
        </div>

        {/* Avantajlar */}
        <h2 className="text-3xl font-bold text-center mb-12">TaşıApp Avantajları</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <FaUserCheck className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Güvenilir Firmalar</h3>
            <p className="text-gray-600">
              Özenle seçilmiş ve denetlenen taşıma firmaları
            </p>
          </div>

          <div className="text-center">
            <FaMoneyBillWave className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Uygun Fiyatlar</h3>
            <p className="text-gray-600">
              Rekabetçi fiyatlar ve şeffaf ücretlendirme
            </p>
          </div>

          <div className="text-center">
            <FaMobile className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Kolay Kullanım</h3>
            <p className="text-gray-600">
              Kullanıcı dostu arayüz ve hızlı işlem
            </p>
          </div>

          <div className="text-center">
            <FaShieldAlt className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Tam Güvence</h3>
            <p className="text-gray-600">
              Sigortalı taşıma ve eşya güvencesi
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-orange-100 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Hemen Başlayın</h2>
          <p className="text-gray-600 mb-6">
            Güvenli ve profesyonel taşıma hizmeti için hemen teklif alın.
          </p>
          <button className="btn-primary bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors">
            Ücretsiz Teklif Al
          </button>
        </div>
      </div>
    </main>
  )
} 