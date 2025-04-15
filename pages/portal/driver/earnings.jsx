import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DriverLayout from '../../../components/portal/DriverLayout';
import { FaMoneyBillWave, FaChartLine, FaCalendarAlt, FaSpinner } from 'react-icons/fa';

export default function Earnings() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState([]);
  const [filter, setFilter] = useState('all'); // all, daily, weekly, monthly

  // Örnek kazanç verileri
  const sampleEarnings = [
    {
      id: 1,
      date: '2024-03-22',
      amount: 2500,
      type: 'daily',
      tasks: [
        {
          id: 1,
          title: 'İstanbul - Ankara Nakliye',
          amount: 1500,
          status: 'completed'
        },
        {
          id: 2,
          title: 'Ankara - İstanbul Nakliye',
          amount: 1000,
          status: 'completed'
        }
      ]
    },
    {
      id: 2,
      date: '2024-03-21',
      amount: 1800,
      type: 'daily',
      tasks: [
        {
          id: 3,
          title: 'İzmir - Antalya Nakliye',
          amount: 1800,
          status: 'completed'
        }
      ]
    },
    {
      id: 3,
      date: '2024-03-20',
      amount: 3200,
      type: 'daily',
      tasks: [
        {
          id: 4,
          title: 'İstanbul - İzmir Nakliye',
          amount: 2000,
          status: 'completed'
        },
        {
          id: 5,
          title: 'İzmir - İstanbul Nakliye',
          amount: 1200,
          status: 'completed'
        }
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
    setEarnings(sampleEarnings);
  }, [router]);

  const filteredEarnings = earnings.filter(earning => {
    if (filter === 'all') return true;
    return earning.type === filter;
  });

  const totalEarnings = earnings.reduce((acc, earning) => acc + earning.amount, 0);
  const averageDailyEarnings = totalEarnings / earnings.length;
  const totalTasks = earnings.reduce((acc, earning) => acc + earning.tasks.length, 0);

  if (loading) {
    return (
      <DriverLayout title="Kazançlarım">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </DriverLayout>
    );
  }

  return (
    <DriverLayout title="Kazançlarım">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Bilgi Kartları */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaMoneyBillWave className="h-6 w-6 text-orange-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Toplam Kazanç
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {totalEarnings} ₺
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
                  <FaChartLine className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Günlük Ortalama
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {averageDailyEarnings.toFixed(2)} ₺
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
                  <FaCalendarAlt className="h-6 w-6 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Toplam Görev
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {totalTasks}
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
                  <FaMoneyBillWave className="h-6 w-6 text-purple-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Görev Başına Ortalama
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {(totalEarnings / totalTasks).toFixed(2)} ₺
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
              onClick={() => setFilter('daily')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'daily'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Günlük
            </button>
            <button
              onClick={() => setFilter('weekly')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'weekly'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Haftalık
            </button>
            <button
              onClick={() => setFilter('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'monthly'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Aylık
            </button>
          </div>
        </div>

        {/* Kazanç Listesi */}
        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Kazanç Detayları
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {filteredEarnings.map((earning) => (
                  <li key={earning.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {new Date(earning.date).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <FaMoneyBillWave className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <p>{earning.amount} ₺</p>
                          </div>
                          <div className="ml-6 flex items-center text-sm text-gray-500">
                            <FaCalendarAlt className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <p>
                              {earning.type === 'daily'
                                ? 'Günlük'
                                : earning.type === 'weekly'
                                ? 'Haftalık'
                                : 'Aylık'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500">Görevler</h4>
                      <ul className="mt-2 divide-y divide-gray-200">
                        {earning.tasks.map((task) => (
                          <li key={task.id} className="py-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <FaMoneyBillWave className="h-5 w-5 text-gray-400" />
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">
                                    {task.title}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {task.amount} ₺
                                  </p>
                                </div>
                              </div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                task.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {task.status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor'}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
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