import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DriverLayout from '../../../components/portal/DriverLayout';
import { FaRoute, FaClock, FaMapMarkedAlt, FaTruck, FaSpinner } from 'react-icons/fa';

export default function Routes() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);
  const [filter, setFilter] = useState('all'); // all, active, completed, cancelled

  // Örnek rotalar
  const sampleRoutes = [
    {
      id: 1,
      title: 'İstanbul - Ankara Güzergahı',
      status: 'active',
      progress: 75,
      startTime: '2024-03-22 08:00',
      endTime: '2024-03-22 18:00',
      distance: '450 km',
      duration: '10 saat',
      checkpoints: [
        { id: 1, name: 'İstanbul, Kadıköy', time: '08:00', status: 'completed' },
        { id: 2, name: 'İzmit, Gebze', time: '09:30', status: 'completed' },
        { id: 3, name: 'Sakarya, Adapazarı', time: '11:00', status: 'completed' },
        { id: 4, name: 'Bolu, Merkez', time: '13:00', status: 'active' },
        { id: 5, name: 'Ankara, Çankaya', time: '18:00', status: 'pending' }
      ],
      traffic: 'normal',
      weather: 'sunny',
      notes: 'Bolu geçişinde dikkatli olunmalı'
    },
    {
      id: 2,
      title: 'İzmir - Antalya Güzergahı',
      status: 'completed',
      progress: 100,
      startTime: '2024-03-21 07:00',
      endTime: '2024-03-21 17:00',
      distance: '380 km',
      duration: '10 saat',
      checkpoints: [
        { id: 1, name: 'İzmir, Konak', time: '07:00', status: 'completed' },
        { id: 2, name: 'Aydın, Merkez', time: '08:30', status: 'completed' },
        { id: 3, name: 'Denizli, Merkez', time: '10:00', status: 'completed' },
        { id: 4, name: 'Burdur, Merkez', time: '12:00', status: 'completed' },
        { id: 5, name: 'Antalya, Muratpaşa', time: '17:00', status: 'completed' }
      ],
      traffic: 'heavy',
      weather: 'rainy',
      notes: 'Denizli çıkışında yoğun trafik vardı'
    },
    {
      id: 3,
      title: 'Ankara - İstanbul Güzergahı',
      status: 'cancelled',
      progress: 30,
      startTime: '2024-03-23 09:00',
      endTime: '2024-03-23 19:00',
      distance: '450 km',
      duration: '10 saat',
      checkpoints: [
        { id: 1, name: 'Ankara, Çankaya', time: '09:00', status: 'completed' },
        { id: 2, name: 'Bolu, Merkez', time: '11:00', status: 'completed' },
        { id: 3, name: 'Sakarya, Adapazarı', time: '13:00', status: 'cancelled' },
        { id: 4, name: 'İzmit, Gebze', time: '15:00', status: 'pending' },
        { id: 5, name: 'İstanbul, Beşiktaş', time: '19:00', status: 'pending' }
      ],
      traffic: 'normal',
      weather: 'cloudy',
      notes: 'Hava koşulları nedeniyle iptal edildi'
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
    setRoutes(sampleRoutes);
  }, [router]);

  const filteredRoutes = routes.filter(route => {
    if (filter === 'all') return true;
    return route.status === filter;
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

  const getCheckpointStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCheckpointStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Tamamlandı';
      case 'active':
        return 'Aktif';
      case 'pending':
        return 'Bekliyor';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return 'Bilinmiyor';
    }
  };

  if (loading) {
    return (
      <DriverLayout title="Rotalarım">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </DriverLayout>
    );
  }

  return (
    <DriverLayout title="Rotalarım">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Bilgi Kartları */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaRoute className="h-6 w-6 text-orange-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Toplam Rota
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {routes.length}
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
                  <FaMapMarkedAlt className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Aktif Rotalar
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {routes.filter(r => r.status === 'active').length}
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
                  <FaTruck className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Toplam Mesafe
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {routes.reduce((acc, route) => {
                          const distance = parseInt(route.distance);
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
                        {Math.round(routes.reduce((acc, route) => {
                          const duration = parseInt(route.duration);
                          return acc + (isNaN(duration) ? 0 : duration);
                        }, 0) / routes.length)} saat
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

        {/* Rotalar Listesi */}
        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Rota Detayları
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {filteredRoutes.map((route) => (
                  <li key={route.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {route.title}
                        </p>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <FaClock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <p>
                              {route.startTime} - {route.endTime}
                            </p>
                          </div>
                          <div className="ml-6 flex items-center text-sm text-gray-500">
                            <FaRoute className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <p>{route.distance}</p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(route.status)}`}>
                          {getStatusText(route.status)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-orange-200">
                          <div
                            style={{ width: `${route.progress}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500"
                          ></div>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        İlerleme: {route.progress}%
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500">Duraklar</h4>
                      <ul className="mt-2 divide-y divide-gray-200">
                        {route.checkpoints.map((checkpoint) => (
                          <li key={checkpoint.id} className="py-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <FaMapMarkedAlt className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">
                                    {checkpoint.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {checkpoint.time}
                                  </p>
                                </div>
                              </div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCheckpointStatusColor(checkpoint.status)}`}>
                                {getCheckpointStatusText(checkpoint.status)}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Rota Bilgileri</h4>
                        <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                          <div className="sm:col-span-1">
                            <dt className="text-xs font-medium text-gray-500">Süre</dt>
                            <dd className="mt-1 text-sm text-gray-900">{route.duration}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-xs font-medium text-gray-500">Trafik</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {route.traffic === 'normal' ? 'Normal' : route.traffic === 'heavy' ? 'Yoğun' : 'Hafif'}
                            </dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-xs font-medium text-gray-500">Hava Durumu</dt>
                            <dd className="mt-1 text-sm text-gray-900">
                              {route.weather === 'sunny' ? 'Güneşli' : route.weather === 'rainy' ? 'Yağmurlu' : 'Bulutlu'}
                            </dd>
                          </div>
                        </dl>
                      </div>
                      {route.notes && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Notlar</h4>
                          <p className="mt-2 text-sm text-gray-900">{route.notes}</p>
                        </div>
                      )}
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