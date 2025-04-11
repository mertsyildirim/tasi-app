import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DriverLayout from '../../../components/portal/DriverLayout';
import LocationTracker from '../../../components/portal/LocationTracker';
import { FaTruck, FaClock, FaRoute, FaMapMarkedAlt, FaCheckCircle, FaSpinner, FaMobileAlt, FaQrcode, FaSignOutAlt, FaPlay, FaMapMarker, FaTimes } from 'react-icons/fa';

export default function ActiveTasks() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [driverStatus, setDriverStatus] = useState('active');
  const [notifications, setNotifications] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [showQrCode, setShowQrCode] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [locationStatus, setLocationStatus] = useState(null);

  // Örnek görevler
  const sampleTasks = [
    {
      id: 1,
      title: 'İstanbul Kadıköy - Ankara Çankaya Arası Taşıma',
      status: 'active',
      progress: 65,
      startTime: '09:00',
      endTime: '18:00',
      distance: '450 km',
      customer: 'ABC Lojistik',
      pickup: 'İstanbul, Kadıköy',
      delivery: 'Ankara, Çankaya',
      cargo: {
        type: 'Genel Kargo',
        weight: '3.5 ton',
        volume: '12 m³',
        pieces: '24 adet'
      },
      checkpoints: [
        { id: 1, title: 'Alınacak adrese doğru yola çıkış', completed: true, completedAt: '09:00' },
        { id: 2, title: '(İstanbul, Kadıköy) Varış', completed: false, completedAt: null },
        { id: 3, title: 'Taşıma sürecinde', completed: false, completedAt: null },
        { id: 4, title: '(Ankara, Çankaya) Varış', completed: false, completedAt: null },
        { id: 5, title: 'Teslim edildi', completed: false, completedAt: null }
      ]
    },
    {
      id: 2,
      title: 'İzmir Konak - Antalya Muratpaşa Arası Taşıma',
      status: 'pending',
      progress: 0,
      startTime: '10:00',
      endTime: '19:00',
      distance: '380 km',
      customer: 'XYZ Taşımacılık',
      pickup: 'İzmir, Konak',
      delivery: 'Antalya, Muratpaşa',
      cargo: {
        type: 'Soğuk Zincir',
        weight: '2.8 ton',
        volume: '8 m³',
        pieces: '16 adet'
      },
      checkpoints: [
        { id: 1, title: 'Alınacak adrese doğru yola çıkış', completed: false, completedAt: null },
        { id: 2, title: '(İzmir, Konak) Varış', completed: false, completedAt: null },
        { id: 3, title: 'Taşıma sürecinde', completed: false, completedAt: null },
        { id: 4, title: '(Antalya, Muratpaşa) Varış', completed: false, completedAt: null },
        { id: 5, title: 'Teslim edildi', completed: false, completedAt: null }
      ]
    }
  ];

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
    setActiveTasks(sampleTasks);
  }, [router]);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setShowQrCode(false);
      }
    };

    if (showQrCode) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showQrCode]);

  const handleQrCodeClick = (task) => {
    setSelectedTask(task);
    setShowQrCode(true);
  };

  // Konum durumu değiştiğinde tetiklenecek fonksiyon
  const handleLocationChange = (status) => {
    setLocationStatus(status);
    // İlgili aktif görevi al
    const activeTask = activeTasks.find(task => task.status === 'active');
    
    // Aktif görev varsa ve konum izleme aktifse
    if (activeTask && status.tracking) {
      console.log('Konum gönderiliyor:', status.location);
      // Burada konum takibi için gerekli işlemler yapılabilir
    }
  };

  if (loading) {
    return (
      <DriverLayout title="Aktif Taşımalarım">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </DriverLayout>
    );
  }

  return (
    <DriverLayout title="Aktif Taşımalarım" driverStatus={driverStatus}>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Bilgi Kartları */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaTruck className="h-6 w-6 text-orange-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Toplam Aktif Taşımalarım
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {activeTasks.length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaCheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Tamamlanan Kontrol Noktaları
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {activeTasks.reduce((acc, task) => 
                          acc + task.checkpoints.filter(cp => cp.completed).length, 0
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaRoute className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Toplam Mesafe
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {activeTasks.reduce((acc, task) => {
                          const distance = parseInt(task.distance);
                          return acc + (isNaN(distance) ? 0 : distance);
                        }, 0)} km
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaMapMarkedAlt className="h-6 w-6 text-purple-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Konum Durumu
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {locationStatus?.tracking ? (
                          <span className="text-green-500">Aktif</span>
                        ) : (
                          <span className="text-red-500">Pasif</span>
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Konum İzleme Bileşeni */}
        <div className="mt-5">
          <LocationTracker 
            onChange={handleLocationChange} 
            autoStart={true}
            updateInterval={20000}
            taskId={activeTasks.find(task => task.status === 'active')?.id}
          />
        </div>

        {/* Aktif Görevler */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Aktif Taşımalarım</h2>
          <div className="space-y-6">
            {activeTasks.map((task) => (
              <div key={task.id} className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {task.title}
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      {task.customer} · {task.startTime} - {task.endTime}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {task.status === 'active' ? 'Aktif' : 'Beklemede'}
                    </span>
                    <button
                      onClick={() => handleQrCodeClick(task)}
                      className="ml-2 p-2 text-gray-500 hover:text-gray-700"
                    >
                      <FaQrcode />
                    </button>
                  </div>
                </div>
                
                <div className="border-t border-gray-200">
                  <div className="px-4 py-3 sm:px-6">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        İlerleme: %{task.progress}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {task.distance}
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-orange-500 h-2.5 rounded-full" 
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Güzergah Bilgileri</h4>
                        <div className="space-y-3">
                          <div className="flex items-start">
                            <span className="flex-shrink-0 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center">
                              <FaMapMarker className="h-3 w-3 text-white" />
                            </span>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">Alınacak Adres</p>
                              <p className="text-sm text-gray-500">{task.pickup}</p>
                            </div>
                          </div>
                          <div className="flex items-start">
                            <span className="flex-shrink-0 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                              <FaMapMarker className="h-3 w-3 text-white" />
                            </span>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">Teslim Adresi</p>
                              <p className="text-sm text-gray-500">{task.delivery}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Kargo Bilgileri</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500">Tür</p>
                            <p className="font-medium text-gray-900">{task.cargo.type}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Ağırlık</p>
                            <p className="font-medium text-gray-900">{task.cargo.weight}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Hacim</p>
                            <p className="font-medium text-gray-900">{task.cargo.volume}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Parça Sayısı</p>
                            <p className="font-medium text-gray-900">{task.cargo.pieces}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Kontrol Noktaları</h4>
                    <div className="flex flex-col space-y-4">
                      {task.checkpoints.map((checkpoint) => (
                        <div key={checkpoint.id} className="flex items-center">
                          <div className={`flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center
                            ${checkpoint.completed ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                            {checkpoint.completed && <FaCheckCircle className="h-4 w-4 text-white" />}
                          </div>
                          <div className="ml-3 flex-grow">
                            <p className={`text-sm ${checkpoint.completed ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                              {checkpoint.title}
                            </p>
                          </div>
                          <div className="ml-2">
                            {checkpoint.completed ? (
                              <span className="text-xs text-gray-500">
                                {checkpoint.completedAt}
                              </span>
                            ) : (
                              task.status === 'active' && !task.checkpoints.slice(0, checkpoint.id - 1).some(cp => !cp.completed) && (
                                <button className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 transition">
                                  <FaPlay className="inline-block mr-1" size={10} />
                                  Başlat
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR Kod Modalı */}
      {showQrCode && selectedTask && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Taşıma QR Kodu</h3>
              <button 
                onClick={() => setShowQrCode(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <div className="flex flex-col items-center">
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=tasi-task-${selectedTask.id}`} 
                    alt="QR Kod" 
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-sm text-gray-500 mb-2 text-center">
                  Bu QR kodu taşıma kontrol noktalarındaki personele gösterin.
                </p>
                <button className="mt-4 w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition flex items-center justify-center">
                  <FaMobileAlt className="mr-2" />
                  Kodu Paylaş
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DriverLayout>
  );
} 