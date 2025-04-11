import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PortalLayout from '../../components/portal/Layout';
import { FaUser, FaBuilding, FaPhone, FaEnvelope, FaMapMarkerAlt, FaLock, FaBell, FaGlobe, FaSave, FaTimes } from 'react-icons/fa';

export default function Settings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // Kullanıcı kontrolü
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/portal/login');
      return;
    }
    setLoading(false);
  }, [router]);

  // Örnek kullanıcı verileri
  const [userData, setUserData] = useState({
    profile: {
      name: 'Ahmet Yılmaz',
      title: 'Yönetici',
      phone: '0532 555 1234',
      email: 'ahmet@example.com',
      address: 'İstanbul, Türkiye'
    },
    company: {
      name: 'ABC Lojistik',
      taxNumber: '1234567890',
      address: 'Merkez Mah. Atatürk Cad. No:123',
      city: 'İstanbul',
      country: 'Türkiye'
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    notifications: {
      email: true,
      sms: true,
      push: false
    },
    language: 'tr'
  });

  const handleSave = () => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <PortalLayout title="Ayarlar">
      <div className="space-y-6 p-4">
        {/* Üst Bilgi Kartı */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <FaUser className="h-8 w-8 text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{userData.profile.name}</h2>
              <p className="text-gray-500">{userData.profile.title}</p>
            </div>
          </div>
        </div>

        {/* Sekmeler */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaUser className="inline-block mr-2" />
                Profil
              </button>
              <button
                onClick={() => setActiveTab('company')}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'company'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaBuilding className="inline-block mr-2" />
                Şirket
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'security'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaLock className="inline-block mr-2" />
                Güvenlik
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'notifications'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaBell className="inline-block mr-2" />
                Bildirimler
              </button>
              <button
                onClick={() => setActiveTab('language')}
                className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'language'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaGlobe className="inline-block mr-2" />
                Dil
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Profil Sekmesi */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad Soyad
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={userData.profile.name}
                        onChange={(e) => setUserData({
                          ...userData,
                          profile: { ...userData.profile, name: e.target.value }
                        })}
                        className="pl-10 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ünvan
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={userData.profile.title}
                        onChange={(e) => setUserData({
                          ...userData,
                          profile: { ...userData.profile, title: e.target.value }
                        })}
                        className="pl-10 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaPhone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={userData.profile.phone}
                        onChange={(e) => setUserData({
                          ...userData,
                          profile: { ...userData.profile, phone: e.target.value }
                        })}
                        className="pl-10 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-posta
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={userData.profile.email}
                        onChange={(e) => setUserData({
                          ...userData,
                          profile: { ...userData.profile, email: e.target.value }
                        })}
                        className="pl-10 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adres
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={userData.profile.address}
                        onChange={(e) => setUserData({
                          ...userData,
                          profile: { ...userData.profile, address: e.target.value }
                        })}
                        className="pl-10 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Şirket Sekmesi */}
            {activeTab === 'company' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şirket Adı
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaBuilding className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={userData.company.name}
                        onChange={(e) => setUserData({
                          ...userData,
                          company: { ...userData.company, name: e.target.value }
                        })}
                        className="pl-10 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vergi Numarası
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaBuilding className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={userData.company.taxNumber}
                        onChange={(e) => setUserData({
                          ...userData,
                          company: { ...userData.company, taxNumber: e.target.value }
                        })}
                        className="pl-10 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adres
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={userData.company.address}
                        onChange={(e) => setUserData({
                          ...userData,
                          company: { ...userData.company, address: e.target.value }
                        })}
                        className="pl-10 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Şehir
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={userData.company.city}
                        onChange={(e) => setUserData({
                          ...userData,
                          company: { ...userData.company, city: e.target.value }
                        })}
                        className="pl-10 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ülke
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={userData.company.country}
                        onChange={(e) => setUserData({
                          ...userData,
                          company: { ...userData.company, country: e.target.value }
                        })}
                        className="pl-10 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Güvenlik Sekmesi */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mevcut Şifre
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={userData.security.currentPassword}
                        onChange={(e) => setUserData({
                          ...userData,
                          security: { ...userData.security, currentPassword: e.target.value }
                        })}
                        className="pl-10 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yeni Şifre
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={userData.security.newPassword}
                        onChange={(e) => setUserData({
                          ...userData,
                          security: { ...userData.security, newPassword: e.target.value }
                        })}
                        className="pl-10 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yeni Şifre (Tekrar)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={userData.security.confirmPassword}
                        onChange={(e) => setUserData({
                          ...userData,
                          security: { ...userData.security, confirmPassword: e.target.value }
                        })}
                        className="pl-10 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bildirimler Sekmesi */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">E-posta Bildirimleri</h3>
                      <p className="text-sm text-gray-500">Önemli güncellemeler için e-posta al</p>
                    </div>
                    <button
                      onClick={() => setUserData({
                        ...userData,
                        notifications: { ...userData.notifications, email: !userData.notifications.email }
                      })}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        userData.notifications.email ? 'bg-orange-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          userData.notifications.email ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">SMS Bildirimleri</h3>
                      <p className="text-sm text-gray-500">Acil durumlar için SMS al</p>
                    </div>
                    <button
                      onClick={() => setUserData({
                        ...userData,
                        notifications: { ...userData.notifications, sms: !userData.notifications.sms }
                      })}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        userData.notifications.sms ? 'bg-orange-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          userData.notifications.sms ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Push Bildirimleri</h3>
                      <p className="text-sm text-gray-500">Anlık güncellemeler için bildirim al</p>
                    </div>
                    <button
                      onClick={() => setUserData({
                        ...userData,
                        notifications: { ...userData.notifications, push: !userData.notifications.push }
                      })}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                        userData.notifications.push ? 'bg-orange-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          userData.notifications.push ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Dil Sekmesi */}
            {activeTab === 'language' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dil Seçimi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaGlobe className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        value={userData.language}
                        onChange={(e) => setUserData({ ...userData, language: e.target.value })}
                        className="pl-10 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="tr">Türkçe</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Kaydet Butonu */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center"
              >
                <FaSave className="mr-2" />
                Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Başarı Mesajı */}
      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg">
          <div className="flex items-center">
            <FaCheck className="mr-2" />
            <span>Değişiklikler başarıyla kaydedildi!</span>
          </div>
        </div>
      )}
    </PortalLayout>
  );
} 