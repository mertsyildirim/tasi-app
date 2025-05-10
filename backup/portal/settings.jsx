import PortalLayout from '../../components/portal/Layout';
import { useState } from 'react';
import { 
  UserCircleIcon, 
  BuildingOfficeIcon, 
  KeyIcon, 
  BellIcon, 
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState({
    companyName: 'ABC Lojistik',
    email: 'info@abclojistik.com',
    phone: '0212 555 1234',
    address: 'İstanbul, Türkiye',
    taxNumber: '1234567890',
    taxOffice: 'Kadıköy Vergi Dairesi'
  });

  const tabs = [
    { id: 'profile', name: 'Profil Bilgileri', icon: UserCircleIcon },
    { id: 'company', name: 'Firma Bilgileri', icon: BuildingOfficeIcon },
    { id: 'security', name: 'Güvenlik', icon: KeyIcon },
    { id: 'notifications', name: 'Bildirimler', icon: BellIcon },
    { id: 'privacy', name: 'Gizlilik', icon: ShieldCheckIcon }
  ];

  return (
    <PortalLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Ayarlar</h1>

        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Profil Bilgileri</h3>
                  <p className="mt-1 text-sm text-gray-500">Kişisel bilgilerinizi güncelleyin</p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">E-posta</label>
                    <input
                      type="email"
                      value={user.email}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefon</label>
                    <input
                      type="tel"
                      value={user.phone}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    Değişiklikleri Kaydet
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'company' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Firma Bilgileri</h3>
                  <p className="mt-1 text-sm text-gray-500">Firma bilgilerinizi güncelleyin</p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Firma Adı</label>
                    <input
                      type="text"
                      value={user.companyName}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vergi Numarası</label>
                    <input
                      type="text"
                      value={user.taxNumber}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vergi Dairesi</label>
                    <input
                      type="text"
                      value={user.taxOffice}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Adres</label>
                    <textarea
                      value={user.address}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    Değişiklikleri Kaydet
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Güvenlik Ayarları</h3>
                  <p className="mt-1 text-sm text-gray-500">Şifre ve güvenlik ayarlarınızı yönetin</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mevcut Şifre</label>
                    <input
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Yeni Şifre</label>
                    <input
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Yeni Şifre (Tekrar)</label>
                    <input
                      type="password"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    Şifreyi Güncelle
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Bildirim Ayarları</h3>
                  <p className="mt-1 text-sm text-gray-500">Bildirim tercihlerinizi yönetin</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">E-posta Bildirimleri</h4>
                      <p className="text-sm text-gray-500">Önemli güncellemeler için e-posta alın</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-primary">
                      <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">SMS Bildirimleri</h4>
                      <p className="text-sm text-gray-500">Acil durumlar için SMS alın</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-gray-200">
                      <span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Gizlilik Ayarları</h3>
                  <p className="mt-1 text-sm text-gray-500">Gizlilik tercihlerinizi yönetin</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Veri Analizi</h4>
                      <p className="text-sm text-gray-500">Hizmet kalitesini artırmak için veri analizi yapılmasına izin ver</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-primary">
                      <span className="translate-x-5 inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Üçüncü Taraf Paylaşımı</h4>
                      <p className="text-sm text-gray-500">Üçüncü taraflarla veri paylaşımına izin ver</p>
                    </div>
                    <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-gray-200">
                      <span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
} 