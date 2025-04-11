'use client'

import React, { useState, useEffect } from 'react'
import { FaSave, FaLock, FaEnvelope, FaBell, FaDesktop, FaDatabase, FaShieldAlt, FaPaintBrush } from 'react-icons/fa'
import AdminLayout from '../../components/admin/Layout'

export default function SettingsPage() {
  const [selectedTab, setSelectedTab] = useState('general')
  const [maintenanceConfig, setMaintenanceConfig] = useState({
    homeEnabled: false,
    portalEnabled: false
  })
  const [tempMaintenanceConfig, setTempMaintenanceConfig] = useState({
    homeEnabled: false,
    portalEnabled: false
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // Bakım modu ayarlarını yükle
  useEffect(() => {
    const loadMaintenanceConfig = async () => {
      try {
        const response = await fetch('/api/settings/maintenance');
        const data = await response.json();
        setMaintenanceConfig(data);
        setTempMaintenanceConfig(data);
      } catch (error) {
        console.error('Bakım modu ayarları yüklenirken hata:', error);
      }
    };

    loadMaintenanceConfig();
  }, []);

  // Bakım modu ayarlarını geçici olarak değiştir
  const handleMaintenanceChange = (type) => {
    setTempMaintenanceConfig(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Tüm ayarları kaydet
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/settings/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tempMaintenanceConfig),
      });

      if (response.ok) {
        setMaintenanceConfig(tempMaintenanceConfig);
        setSaveMessage('Ayarlar başarıyla kaydedildi');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('Ayarlar kaydedilirken bir hata oluştu');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Bakım modu ayarları kaydedilirken hata:', error);
      setSaveMessage('Ayarlar kaydedilirken bir hata oluştu');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout title="Sistem Ayarları">
      {/* Ayarlar Bölümü */}
      <div className="flex flex-col lg:flex-row bg-white rounded-lg shadow">
        {/* Sol Menü */}
        <div className="w-full lg:w-64 border-r border-gray-200">
          <nav className="flex flex-col p-4">
            <button
              onClick={() => setSelectedTab('general')}
              className={`flex items-center p-3 rounded-md mb-2 transition-colors ${
                selectedTab === 'general' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FaDesktop className="mr-3" />
              <span>Genel Ayarlar</span>
            </button>
            <button
              onClick={() => setSelectedTab('security')}
              className={`flex items-center p-3 rounded-md mb-2 transition-colors ${
                selectedTab === 'security' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FaLock className="mr-3" />
              <span>Güvenlik ve Giriş</span>
            </button>
            <button
              onClick={() => setSelectedTab('email')}
              className={`flex items-center p-3 rounded-md mb-2 transition-colors ${
                selectedTab === 'email' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FaEnvelope className="mr-3" />
              <span>E-posta Ayarları</span>
            </button>
            <button
              onClick={() => setSelectedTab('notifications')}
              className={`flex items-center p-3 rounded-md mb-2 transition-colors ${
                selectedTab === 'notifications' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FaBell className="mr-3" />
              <span>Bildirim Ayarları</span>
            </button>
            <button
              onClick={() => setSelectedTab('database')}
              className={`flex items-center p-3 rounded-md mb-2 transition-colors ${
                selectedTab === 'database' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FaDatabase className="mr-3" />
              <span>Veritabanı Ayarları</span>
            </button>
            <button
              onClick={() => setSelectedTab('api')}
              className={`flex items-center p-3 rounded-md mb-2 transition-colors ${
                selectedTab === 'api' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FaShieldAlt className="mr-3" />
              <span>API Erişimi</span>
            </button>
            <button
              onClick={() => setSelectedTab('appearance')}
              className={`flex items-center p-3 rounded-md mb-2 transition-colors ${
                selectedTab === 'appearance' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FaPaintBrush className="mr-3" />
              <span>Görünüm Ayarları</span>
            </button>
          </nav>
        </div>

        {/* Sağ İçerik */}
        <div className="flex-1 p-6">
          {selectedTab === 'general' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Genel Ayarlar</h2>
              
              <div className="mb-6">
                <label htmlFor="site-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Site Adı
                </label>
                <input
                  type="text"
                  id="site-name"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Taşı App"
                  defaultValue="Taşı App"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
                  İletişim E-postası
                </label>
                <input
                  type="email"
                  id="contact-email"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="iletisim@tasiapp.com"
                  defaultValue="iletisim@tasiapp.com"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon Numarası
                </label>
                <input
                  type="text"
                  id="phone"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="+90 212 123 4567"
                  defaultValue="+90 212 123 4567"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Şirket Adresi
                </label>
                <textarea
                  id="address"
                  rows="3"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="İstanbul, Türkiye"
                  defaultValue="Ataşehir, İstanbul, Türkiye"
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Çalışma Saatleri
                </label>
                <div className="flex flex-col md:flex-row md:space-x-4">
                  <input
                    type="text"
                    className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-2 md:mb-0"
                    placeholder="Başlangıç Saati"
                    defaultValue="09:00"
                  />
                  <input
                    type="text"
                    className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Bitiş Saati"
                    defaultValue="18:00"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bakım Modu
                </label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="maintenance-mode-home"
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      checked={tempMaintenanceConfig.homeEnabled}
                      onChange={() => handleMaintenanceChange('homeEnabled')}
                      disabled={isSaving}
                    />
                    <label htmlFor="maintenance-mode-home" className="ml-2 block text-sm text-gray-900">
                      Anasayfa bakım modunu etkinleştir (tasiapp.com)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="maintenance-mode-portal"
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      checked={tempMaintenanceConfig.portalEnabled}
                      onChange={() => handleMaintenanceChange('portalEnabled')}
                      disabled={isSaving}
                    />
                    <label htmlFor="maintenance-mode-portal" className="ml-2 block text-sm text-gray-900">
                      Portal bakım modunu etkinleştir (/portal/* sayfaları)
                    </label>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Not: Admin paneli hiçbir zaman bakım moduna girmez. Anasayfa bakım modu yalnızca ana sayfayı, portal bakım modu ise yalnızca /portal altındaki sayfaları etkiler.
                  </p>
                  {saveMessage && (
                    <p className={`mt-2 text-sm ${saveMessage.includes('hata') ? 'text-red-600' : 'text-green-600'}`}>
                      {saveMessage}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-8">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                >
                  <FaSave className="mr-2" />
                  {isSaving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                </button>
              </div>
            </div>
          )}

          {selectedTab === 'security' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Güvenlik ve Giriş Ayarları</h2>
              
              <div className="mb-6">
                <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  id="current-password"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="••••••••"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  id="new-password"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="••••••••"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Şifreyi Tekrarla
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="••••••••"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İki Faktörlü Doğrulama
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="two-factor"
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="two-factor" className="ml-2 block text-sm text-gray-900">
                    İki faktörlü doğrulamayı etkinleştir
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Hesabınızı korumak için giriş yaparken ek bir doğrulama kodu gerekir.
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Oturum Açma Girişimleri
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="3"
                    max="10"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    defaultValue="5"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    başarısız girişten sonra hesabı kilitle
                  </label>
                </div>
              </div>
              
              <div className="mt-8">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  <FaSave className="mr-2" />
                  Güvenlik Ayarlarını Kaydet
                </button>
              </div>
            </div>
          )}

          {selectedTab === 'email' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">E-posta Ayarları</h2>
              
              <div className="mb-6">
                <label htmlFor="smtp-host" className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Sunucu
                </label>
                <input
                  type="text"
                  id="smtp-host"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="smtp.example.com"
                  defaultValue="smtp.gmail.com"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="smtp-port" className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Port
                </label>
                <input
                  type="text"
                  id="smtp-port"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="587"
                  defaultValue="587"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="smtp-user" className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Kullanıcı Adı
                </label>
                <input
                  type="text"
                  id="smtp-user"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="email@example.com"
                  defaultValue="bildirim@tasiapp.com"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="smtp-pass" className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Şifre
                </label>
                <input
                  type="password"
                  id="smtp-pass"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="••••••••"
                  defaultValue="********"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="sender-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Gönderen Adı
                </label>
                <input
                  type="text"
                  id="sender-name"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Şirket Adı"
                  defaultValue="Taşı App"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta Şifreleme
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="use-ssl"
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    defaultChecked
                  />
                  <label htmlFor="use-ssl" className="ml-2 block text-sm text-gray-900">
                    SSL kullan
                  </label>
                </div>
              </div>
              
              <div className="mb-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mr-4"
                >
                  Test E-postası Gönder
                </button>
              </div>
              
              <div className="mt-8">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  <FaSave className="mr-2" />
                  E-posta Ayarlarını Kaydet
                </button>
              </div>
            </div>
          )}

          {(selectedTab !== 'general' && selectedTab !== 'security' && selectedTab !== 'email') && (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {selectedTab === 'notifications' && 'Bildirim Ayarları'}
                  {selectedTab === 'database' && 'Veritabanı Ayarları'}
                  {selectedTab === 'api' && 'API Erişim Ayarları'}
                  {selectedTab === 'appearance' && 'Görünüm Ayarları'}
                </h2>
                <p className="text-gray-600">
                  Bu bölüm geliştirme aşamasındadır. Çok yakında kullanıma sunulacaktır.
                </p>
              </div>
              <div className="mt-6">
                <img 
                  src="/assets/images/under-construction.svg" 
                  alt="Geliştirme Aşamasında" 
                  className="w-48 h-48 opacity-50"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
} 