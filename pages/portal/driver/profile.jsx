import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DriverLayout from '../../../components/portal/DriverLayout';
import { FaUser, FaTruck, FaFileAlt, FaChartLine, FaEdit, FaCamera } from 'react-icons/fa';

export default function DriverProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@example.com',
    phone: '+90 532 123 4567',
    licenseNumber: '34ABC123',
    licenseExpiry: '2025-12-31',
    vehicleInfo: {
      plate: '34 ABC 123',
      model: 'Mercedes-Benz Actros',
      year: '2022',
      capacity: '20 ton'
    },
    documents: [
      { id: 1, name: 'Sürücü Belgesi', expiryDate: '2025-12-31', status: 'active' },
      { id: 2, name: 'Sağlık Raporu', expiryDate: '2024-12-31', status: 'active' },
      { id: 3, name: 'ADR Sertifikası', expiryDate: '2024-06-30', status: 'expiring' }
    ],
    statistics: {
      totalDeliveries: 156,
      totalDistance: '12,450 km',
      averageRating: 4.8,
      completionRate: '98%'
    }
  });

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          router.push('/portal/login');
          return;
        }
        const user = JSON.parse(userData);
        if (user.type !== 'driver') {
          router.push('/portal/dashboard');
          return;
        }
        setUser(user);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/portal/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSave = () => {
    // Burada profil güncelleme API'si çağrılacak
    setIsEditing(false);
  };

  if (loading) {
    return (
      <DriverLayout title="Profilim">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </DriverLayout>
    );
  }

  return (
    <DriverLayout title="Profilim">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {/* Profil Başlığı */}
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">Sürücü Profili</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Kişisel bilgileriniz ve performans istatistikleriniz</p>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <FaEdit className="mr-2 h-4 w-4" />
              {isEditing ? 'İptal' : 'Düzenle'}
            </button>
          </div>

          {/* Profil İçeriği */}
          <div className="border-t border-gray-200">
            <dl>
              {/* Kişisel Bilgiler */}
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Ad Soyad</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    profileData.name
                  )}
                </dd>
              </div>

              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">E-posta</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    profileData.email
                  )}
                </dd>
              </div>

              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Telefon</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  ) : (
                    profileData.phone
                  )}
                </dd>
              </div>

              {/* Araç Bilgileri */}
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Araç Plakası</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {profileData.vehicleInfo.plate}
                </dd>
              </div>

              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Araç Modeli</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {profileData.vehicleInfo.model}
                </dd>
              </div>

              {/* Belgeler */}
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Belgeler</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    {profileData.documents.map((doc) => (
                      <li key={doc.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                        <div className="w-0 flex-1 flex items-center">
                          <FaFileAlt className="flex-shrink-0 h-5 w-5 text-gray-400" />
                          <span className="ml-2 flex-1 w-0 truncate">{doc.name}</span>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className={`font-medium ${
                            doc.status === 'active' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {doc.status === 'active' ? 'Aktif' : 'Yakında Yenilenecek'}
                          </span>
                          <span className="ml-2 text-gray-500">({doc.expiryDate})</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>

              {/* İstatistikler */}
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Performans İstatistikleri</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                      <div className="text-sm font-medium text-gray-500">Toplam Teslimat</div>
                      <div className="mt-1 text-2xl font-semibold text-gray-900">{profileData.statistics.totalDeliveries}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <div className="text-sm font-medium text-gray-500">Toplam Mesafe</div>
                      <div className="mt-1 text-2xl font-semibold text-gray-900">{profileData.statistics.totalDistance}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <div className="text-sm font-medium text-gray-500">Ortalama Puan</div>
                      <div className="mt-1 text-2xl font-semibold text-gray-900">{profileData.statistics.averageRating}</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <div className="text-sm font-medium text-gray-500">Tamamlanma Oranı</div>
                      <div className="mt-1 text-2xl font-semibold text-gray-900">{profileData.statistics.completionRate}</div>
                    </div>
                  </div>
                </dd>
              </div>
            </dl>
          </div>

          {/* Kaydet Butonu */}
          {isEditing && (
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button
                onClick={handleSave}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Kaydet
              </button>
            </div>
          )}
        </div>
      </div>
    </DriverLayout>
  );
} 