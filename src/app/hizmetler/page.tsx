'use client'

import { FaTruck, FaBoxOpen, FaMapMarkedAlt, FaHome, FaTools, FaWarehouse, FaShieldAlt } from 'react-icons/fa'

export default function Hizmetler() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-16">
      {/* Ana Başlık */}
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Hizmetlerimiz</h1>
        <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
          TaşıApp olarak, tüm taşımacılık ihtiyaçlarınız için profesyonel çözümler sunuyoruz.
        </p>

        {/* Ana Hizmetler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <FaMapMarkedAlt className="w-10 h-10 text-orange-500 mr-4" />
              <h2 className="text-2xl font-bold">Şehirler Arası Taşımacılık</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Türkiye'nin 81 ilinde güvenli ve hızlı taşımacılık hizmeti sunuyoruz. Özel araçlarımız ve profesyonel ekibimizle eşyalarınızı güvenle taşıyoruz.
            </p>
            <ul className="text-gray-600 list-disc list-inside">
              <li>Tam zamanlı takip sistemi</li>
              <li>Sigortalı taşımacılık</li>
              <li>Profesyonel paketleme</li>
              <li>Özel ekipman desteği</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <FaTruck className="w-10 h-10 text-orange-500 mr-4" />
              <h2 className="text-2xl font-bold">Şehir İçi Taşımacılık</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Şehir içinde hızlı ve güvenli taşıma hizmeti. Aynı gün teslimat seçeneği ile eşyalarınızı istediğiniz adrese ulaştırıyoruz.
            </p>
            <ul className="text-gray-600 list-disc list-inside">
              <li>Hızlı teslimat</li>
              <li>Esnek çalışma saatleri</li>
              <li>Uygun fiyatlandırma</li>
              <li>Deneyimli personel</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <FaBoxOpen className="w-10 h-10 text-orange-500 mr-4" />
              <h2 className="text-2xl font-bold">Paketleme Hizmeti</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Eşyalarınızı özel malzemelerle profesyonel şekilde paketliyoruz. Hassas eşyalarınız için özel koruma sağlıyoruz.
            </p>
            <ul className="text-gray-600 list-disc list-inside">
              <li>Özel paketleme malzemeleri</li>
              <li>Kırılacak eşya koruması</li>
              <li>Mobilya demontaj/montaj</li>
              <li>Etiketleme sistemi</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <FaHome className="w-10 h-10 text-orange-500 mr-4" />
              <h2 className="text-2xl font-bold">Evden Eve Taşıma</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Ev taşıma sürecinizi profesyonel ekibimizle sorunsuz bir şekilde yönetiyoruz. A'dan Z'ye tüm taşıma işlemlerinizi üstleniyoruz.
            </p>
            <ul className="text-gray-600 list-disc list-inside">
              <li>Ücretsiz ekspertiz</li>
              <li>Profesyonel taşıma ekibi</li>
              <li>Mobilya montaj/demontaj</li>
              <li>Sigortalı taşımacılık</li>
            </ul>
          </div>
        </div>

        {/* Ek Hizmetler */}
        <h2 className="text-3xl font-bold text-center mb-12">Ek Hizmetlerimiz</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FaTools className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Montaj/Demontaj</h3>
            <p className="text-gray-600">
              Mobilyalarınızın sökülmesi ve kurulması için uzman ekip desteği
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FaWarehouse className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Depolama</h3>
            <p className="text-gray-600">
              Kısa ve uzun süreli güvenli depolama çözümleri
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <FaShieldAlt className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Sigorta</h3>
            <p className="text-gray-600">
              Tüm taşıma sürecinde tam kapsamlı sigorta güvencesi
            </p>
          </div>
        </div>
      </div>
    </main>
  )
} 