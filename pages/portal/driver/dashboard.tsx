import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DriverLayout from '../../../components/portal/DriverLayout';
import { FaTruck, FaRoute, FaMoneyBillWave, FaChartLine, FaClock, FaMapMarkedAlt, FaCheckCircle, FaSpinner } from 'react-icons/fa';

interface User {
  type: string;
  roles?: string[];
  isFreelance?: boolean;
}

export default function DriverDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [driverStatus, setDriverStatus] = useState('active');
  const [notifications, setNotifications] = useState([]);
  const [activeTasks, setActiveTasks] = useState([]);
  const [viewMode, setViewMode] = useState('driver');

  // Toggle görünürlük kontrolü
  const showToggle = user?.roles?.includes('company') && user?.roles?.includes('driver') && user?.isFreelance;

  // Örnek bildirimler
  const sampleNotifications = [
    {
      id: 1,
      message: 'Yeni bir görev atandı',
      time: '5 dakika önce',
      type: 'task'
    },
    {
      id: 1,
      message: 'Araç bakım hatırlatması',
      time: '1 saat önce',
      type: 'maintenance'
    },
    {
      id: 1,
      message: 'Yeni rota güncellemesi',
      time: '2 saat önce',
      type: 'route'
    }
  ];

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
      checkpoints: [
        { id: 1, title: 'Alınacak adrese doğru yola çıkış', completed: false, completedAt: null },
        { id: 2, title: '(İzmir, Konak) Varış', completed: false, completedAt: null },
        { id: 3, title: 'Taşıma sürecinde', completed: false, completedAt: null },
        { id: 4, title: '(Antalya, Muratpaşa) Varış', completed: false, completedAt: null },
        { id: 5, title: 'Teslim edildi', completed: false, completedAt: null }
      ]
    }
  ];

  // Sürücü istatistikleri
  const driverStats = {
    totalTasks: 156,
    activeTasks: 2,
    totalDistance: '12,450 km',
    completionRate: '98%'
  };

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
    setNotifications(sampleNotifications);
    setActiveTasks(sampleTasks);
  }, [router]);

  // Saati güncelle
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <DriverLayout title="Ana Sayfa">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </DriverLayout>
    );
  }

  return (
    <DriverLayout title="Ana Sayfa" driverStatus={driverStatus}>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header kısmı */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Sürücü Kontrol Paneli</h1>
          <div className="flex items-center space-x-4">
            {showToggle && (
              <div className="flex items-center mr-4">
                <label className="mr-2 text-sm font-medium text-gray-700">Mod:</label>
                <select
                  value={viewMode}
                  onChange={(e) => {
                    const selected = e.target.value;
                    setViewMode(selected);
                    if (selected === 'company') {
                      router.push('/portal/dashboard');
                    } else {
                      router.push('/portal/driver/dashboard');
                    }
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="driver">Sürücü</option>
                  <option value="company">Firma</option>
                </select>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <FaClock className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {currentTime.toLocaleTimeString('tr-TR')}
              </span>
            </div>
          </div>
        </div>

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
                      Toplam Görev
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {driverStats.totalTasks}
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
                      Aktif Görev
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {driverStats.activeTasks}
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
                        {driverStats.totalDistance}
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
                  <FaChartLine className="h-6 w-6 text-purple-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Başarı Oranı
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {driverStats.completionRate}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Aktif Görevler */}
        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Aktif Taşımalarım
                </h3>
                <button
                  onClick={() => router.push('/portal/driver/active-tasks')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Tümünü Gör
                </button>
              </div>
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
                      <div className="mt-2 text-sm text-gray-500">
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
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bildirimler */}
        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Son Bildirimler
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <li key={notification.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DriverLayout>
  );
} 