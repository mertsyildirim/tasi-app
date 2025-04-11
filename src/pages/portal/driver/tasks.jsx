import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DriverLayout from '../../../components/portal/DriverLayout';
import { FaTruck, FaClock, FaRoute, FaMapMarkedAlt, FaCheckCircle, FaSpinner, FaFilter } from 'react-icons/fa';

export default function Tasks() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // all, active, completed, cancelled

  // Örnek görevler
  const sampleTasks = [
    {
      id: 1,
      title: 'İstanbul - Ankara Nakliye',
      status: 'completed',
      progress: 100,
      startTime: '2024-03-20 09:00',
      endTime: '2024-03-20 18:00',
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
      rating: 4.5,
      earnings: 2500
    },
    {
      id: 2,
      title: 'İzmir - Antalya Nakliye',
      status: 'cancelled',
      progress: 30,
      startTime: '2024-03-21 10:00',
      endTime: '2024-03-21 19:00',
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
      rating: null,
      earnings: 800
    },
    {
      id: 3,
      title: 'Ankara - İstanbul Nakliye',
      status: 'active',
      progress: 65,
      startTime: '2024-03-22 08:00',
      endTime: '2024-03-22 17:00',
      distance: '450 km',
      customer: 'DEF Lojistik',
      pickup: 'Ankara, Çankaya',
      delivery: 'İstanbul, Beşiktaş',
      cargo: {
        type: 'Genel Kargo',
        weight: '4.2 ton',
        volume: '15 m³',
        pieces: '32 adet'
      },
      rating: null,
      earnings: 0
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
    setTasks(sampleTasks);
  }, [router]);

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return 'Bilinmiyor';
    }
  };

  if (loading) {
    return (
      <DriverLayout title="Tüm Taşımalarım">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </DriverLayout>
    );
  }

  return (
    <DriverLayout title="Tüm Taşımalarım">
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
                      Toplam Görev
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {tasks.length}
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
                      Tamamlanan Görevler
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {tasks.filter(t => t.status === 'completed').length}
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
                        {tasks.reduce((acc, task) => {
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
                        {Math.round(tasks.reduce((acc, task) => {
                          const start = new Date(task.startTime);
                          const end = new Date(task.endTime);
                          return acc + (end - start) / (1000 * 60 * 60);
                        }, 0) / tasks.length)} saat
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtreler */}
        <div className="mt-8 flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'active'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Aktif
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'completed'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Tamamlanan
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'cancelled'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              İptal Edilen
            </button>
          </div>
        </div>

        {/* Görevler Listesi */}
        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Taşıma Görevleri
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {filteredTasks.map((task) => (
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
                              {task.startTime} - {task.endTime}
                            </p>
                          </div>
                          <div className="ml-6 flex items-center text-sm text-gray-500">
                            <FaRoute className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <p>{task.distance}</p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {getStatusText(task.status)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-orange-200">
                          <div
                            style={{ width: `${task.progress}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500"
                          ></div>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        İlerleme: {task.progress}%
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
                        <h4 className="text-sm font-medium text-gray-500">Görev Detayları</h4>
                        <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                          <div className="sm:col-span-1">
                            <dt className="text-xs font-medium text-gray-500">Müşteri</dt>
                            <dd className="mt-1 text-sm text-gray-900">{task.customer}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-xs font-medium text-gray-500">Kazanç</dt>
                            <dd className="mt-1 text-sm text-gray-900">{task.earnings} ₺</dd>
                          </div>
                          {task.rating && (
                            <div className="sm:col-span-1">
                              <dt className="text-xs font-medium text-gray-500">Değerlendirme</dt>
                              <dd className="mt-1 text-sm text-gray-900">{task.rating}/5</dd>
                            </div>
                          )}
                        </dl>
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