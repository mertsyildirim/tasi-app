import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PortalLayout from '../../../components/portal/Layout';
import { FaTruck, FaRoute, FaMapMarkerAlt, FaCalendarAlt, FaGasPump } from 'react-icons/fa';

export default function DriverDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeAssignment, setActiveAssignment] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/portal/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'driver') {
      router.push('/portal/login');
      return;
    }
    
    setUser(parsedUser);

    // Örnek bir aktif görev oluştur
    setActiveAssignment({
      id: 'TRK002',
      from: 'İzmir',
      to: 'Bursa',
      status: 'Yolda',
      pickup: '15.03.2024 09:00',
      delivery: '15.03.2024 18:00',
      customer: 'Ahmet Yılmaz',
      distance: '312 km',
      loadType: 'Paletli Yük',
      weight: '1850 kg',
      notes: 'Dikkatli taşınmalı, hassas ekipman',
      checkpoints: [
        { name: 'İzmir Depo', status: 'Tamamlandı', time: '09:15' },
        { name: 'Balıkesir Kontrol', status: 'Tamamlandı', time: '12:30' },
        { name: 'Bursa Dağıtım', status: 'Bekleniyor', time: '18:00' }
      ]
    });

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <PortalLayout title="Sürücü Paneli">
      <div className="space-y-6 p-4">
        {/* Sürücü Özet Bilgisi */}
        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <div className="flex items-center">
            <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-blue-600 font-bold text-xl">{user?.name?.charAt(0) || 'S'}</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold">{user?.name || 'Sürücü Kullanıcı'}</h2>
              <p className="text-gray-500">Sürücü ID: #DR-{Math.floor(Math.random() * 1000) + 1000}</p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">Aktif</span>
            </div>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 lg:p-3 rounded-full bg-blue-100">
                <FaTruck className="h-4 w-4 lg:h-5 lg:w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs lg:text-sm font-medium text-gray-500">Toplam Taşıma</p>
                <p className="text-base lg:text-lg font-semibold text-gray-900">145</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 lg:p-3 rounded-full bg-green-100">
                <FaRoute className="h-4 w-4 lg:h-5 lg:w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs lg:text-sm font-medium text-gray-500">Toplam Mesafe</p>
                <p className="text-base lg:text-lg font-semibold text-gray-900">12,450 km</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 lg:p-3 rounded-full bg-purple-100">
                <FaCalendarAlt className="h-4 w-4 lg:h-5 lg:w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs lg:text-sm font-medium text-gray-500">Bugün</p>
                <p className="text-base lg:text-lg font-semibold text-gray-900">1 Taşıma</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 lg:p-3 rounded-full bg-yellow-100">
                <FaGasPump className="h-4 w-4 lg:h-5 lg:w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs lg:text-sm font-medium text-gray-500">Araç Durumu</p>
                <p className="text-base lg:text-lg font-semibold text-gray-900">İyi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Aktif Taşıma */}
        {activeAssignment && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-2">Aktif Taşıma</h2>
              <div className="flex items-center text-sm">
                <span className="font-medium text-gray-900">Takip No: {activeAssignment.id}</span>
                <span className="mx-2 text-gray-500">•</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800`}>
                  {activeAssignment.status}
                </span>
              </div>
            </div>
            
            <div className="p-4 lg:p-6">
              {/* Rota Bilgisi */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <FaMapMarkerAlt className="text-green-600 h-4 w-4" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs text-gray-500">Nereden</p>
                      <p className="font-medium">{activeAssignment.from}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 mx-4">
                  <div className="relative flex items-center justify-center">
                    <div className="h-0.5 bg-gray-300 w-full absolute z-0"></div>
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center z-10">
                      <FaTruck className="text-blue-600 h-4 w-4" />
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-1">{activeAssignment.distance}</p>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <FaMapMarkerAlt className="text-red-600 h-4 w-4" />
                    </div>
                    <div className="ml-3">
                      <p className="text-xs text-gray-500">Nereye</p>
                      <p className="font-medium">{activeAssignment.to}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Taşıma Detayları */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Alım Tarihi</p>
                    <p className="font-medium">{activeAssignment.pickup}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Teslim Tarihi</p>
                    <p className="font-medium">{activeAssignment.delivery}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Müşteri</p>
                    <p className="font-medium">{activeAssignment.customer}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Yük Tipi</p>
                    <p className="font-medium">{activeAssignment.loadType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ağırlık</p>
                    <p className="font-medium">{activeAssignment.weight}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Notlar</p>
                    <p className="font-medium">{activeAssignment.notes}</p>
                  </div>
                </div>
              </div>
              
              {/* Kontrol Noktaları */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Kontrol Noktaları</h3>
                <div className="space-y-4">
                  {activeAssignment.checkpoints.map((checkpoint, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        checkpoint.status === 'Tamamlandı' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {checkpoint.status === 'Tamamlandı' ? '✓' : (index + 1)}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className={`font-medium ${
                          checkpoint.status === 'Tamamlandı' ? 'text-gray-700' : 'text-gray-900'
                        }`}>{checkpoint.name}</p>
                        <p className="text-xs text-gray-500">{checkpoint.time}</p>
                      </div>
                      <div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          checkpoint.status === 'Tamamlandı' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {checkpoint.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Butonlar */}
              <div className="flex justify-end mt-6 space-x-3">
                <button className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-md hover:bg-blue-200">
                  Haritada Göster
                </button>
                <button className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700">
                  Teslimatı Tamamla
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Aktif taşıma yoksa */}
        {!activeAssignment && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="py-8">
              <FaTruck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aktif taşıma bulunmuyor</h3>
              <p className="text-gray-500 mb-4">Şu anda atanmış bir taşıma göreviniz bulunmuyor.</p>
              <button className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700">
                Taşıma Talep Et
              </button>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
} 