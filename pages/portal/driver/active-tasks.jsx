import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DriverLayout from '../../../components/portal/DriverLayout';
import { FaTruck, FaClock, FaRoute, FaMapMarkedAlt, FaCheckCircle, FaSpinner, FaMobileAlt, FaQrcode, FaSignOutAlt, FaPlay, FaMapMarker } from 'react-icons/fa';

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
                  <FaClock className="h-6 w-6 text-purple-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Ortalama Süre
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {activeTasks.length > 0 
                          ? Math.round(activeTasks.reduce((acc, task) => {
                              const start = new Date(`2000-01-01 ${task.startTime}`);
                              const end = new Date(`2000-01-01 ${task.endTime}`);
                              return acc + (end - start) / (1000 * 60 * 60);
                            }, 0) / activeTasks.length)
                          : 0} saat
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Aktif Görevler Listesi */}
        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Aktif Taşımalarım
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {activeTasks.map((task) => (
                  <li key={task.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {task.title}
                        </p>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <FaClock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <p>
                              {new Date().toLocaleDateString('tr-TR')} {
                                task.checkpoints[1]?.completed 
                                  ? `${task.checkpoints[1].completedAt || task.startTime} - ${task.checkpoints[4]?.completed ? task.checkpoints[4].completedAt || task.endTime : task.endTime}`
                                  : ''
                              }
                            </p>
                          </div>
                          <div className="ml-6 flex items-center text-sm text-gray-500">
                            <FaRoute className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <p>{task.distance}</p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.status === 'active' ? 'Aktif' : 'Beklemede'}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-orange-200 gap-2">
                          {/* İlk parça - Step 1 */}
                          <div
                            style={{ width: `${task.checkpoints[0].completed ? '32%' : '0%'}` }}
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center rounded-l ${
                              task.checkpoints[0].completed ? 'bg-orange-500' : 'bg-orange-200'
                            }`}
                          ></div>
                          {/* İkinci parça - Step 2,3,4 */}
                          <div
                            style={{ width: `${task.checkpoints[1].completed || task.checkpoints[2].completed || task.checkpoints[3].completed ? '32%' : '0%'}` }}
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                              task.checkpoints[1].completed || task.checkpoints[2].completed || task.checkpoints[3].completed ? 'bg-orange-500' : 'bg-orange-200'
                            }`}
                          ></div>
                          {/* Son parça - Step 5 */}
                          <div
                            style={{ width: `${task.checkpoints[4].completed ? '32%' : '0%'}` }}
                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center rounded-r ${
                              task.checkpoints[4].completed ? 'bg-orange-500' : 'bg-orange-200'
                            }`}
                          ></div>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          {!task.checkpoints.some(cp => cp.completed) && (
                            new Date().toLocaleDateString('tr-TR') === new Date().toLocaleDateString('tr-TR')
                              ? "Yola çıkmanız bekleniyor"
                              : "Randevu tarihi bekleniyor"
                          )}
                          {task.checkpoints[0].completed && !task.checkpoints[1].completed && "Alınacak adrese doğru yoldasınız"}
                          {task.checkpoints[1].completed && !task.checkpoints[2].completed && "Alınacak adrese vardınız"}
                          {task.checkpoints[2].completed && !task.checkpoints[3].completed && "Teslim edilecek adrese doğru yoldasınız"}
                          {task.checkpoints[3].completed && !task.checkpoints[4].completed && "Teslim edilecek adrese vardınız"}
                          {task.checkpoints[4].completed && "Yükü teslim ettiniz"}
                        </div>
                        {!task.checkpoints.some(cp => cp.completed) && new Date().toLocaleDateString('tr-TR') === new Date().toLocaleDateString('tr-TR') && (
                          <button
                            onClick={() => handleQrCodeClick(task)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                          >
                            <FaMobileAlt className="mr-1.5 h-4 w-4" />
                            <FaMapMarker className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Kargo Bilgileri</h4>
                        <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                          <div className="sm:col-span-1">
                            <dt className="text-xs font-medium text-gray-500">Tip</dt>
                            <dd className="mt-1 text-sm text-gray-900">{task.cargo.type}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-xs font-medium text-gray-500">Ağırlık</dt>
                            <dd className="mt-1 text-sm text-gray-900">{task.cargo.weight}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-xs font-medium text-gray-500">Hacim</dt>
                            <dd className="mt-1 text-sm text-gray-900">{task.cargo.volume}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-xs font-medium text-gray-500">Adet</dt>
                            <dd className="mt-1 text-sm text-gray-900">{task.cargo.pieces}</dd>
                          </div>
                        </dl>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Kontrol Noktaları</h4>
                        <ul className="mt-2 divide-y divide-gray-200">
                          {task.checkpoints.map((checkpoint) => (
                            <li key={checkpoint.id} className="py-2 flex items-center justify-between">
                              <div className="flex items-center">
                                <div className={`flex-shrink-0 h-4 w-4 rounded-full ${
                                  checkpoint.completed ? 'bg-green-400' : 'bg-gray-300'
                                }`}></div>
                                <p className="ml-3 text-sm text-gray-900">{checkpoint.title}</p>
                              </div>
                              {checkpoint.completed && (
                                <FaCheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* QR Kod Modal */}
        {showQrCode && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10">
                      <FaQrcode className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Yola Çık
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Alınacak adrese doğru yola çıkış işlemini başlatmak için mobil uygulamayı kullanın ve konum servislerini aktif duruma getirin
                        </p>
                        <div className="mt-4 flex justify-center">
                          <div className="bg-gray-200 p-4 rounded-lg">
                            <div className="w-48 h-48 bg-white flex items-center justify-center">
                              <span className="text-gray-500">QR Kod</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={() => setShowQrCode(false)}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DriverLayout>
  );
} 