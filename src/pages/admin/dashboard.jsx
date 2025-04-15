import React, { useEffect, useState } from 'react';
import { withAuth } from '../../lib/auth';
import AdminLayout from '../../components/layouts/AdminLayout';
import { FaUsers, FaBuilding, FaTruck, FaCarAlt, FaShippingFast, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    counts: {
      users: 0,
      companies: 0,
      drivers: 0,
      vehicles: 0,
      transportRequests: 0,
      activeTransports: 0,
      completedTransports: 0,
      pendingTransports: 0
    },
    recent: {
      transportRequests: [],
      companies: [],
      users: []
    },
    trends: {
      monthlyTransportData: []
    }
  });

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        const response = await axios.get('/api/admin/dashboard');
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Dashboard verileri alınırken hata:', err);
        setError('Veriler alınırken bir hata oluştu. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.');
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Ay isimleri
  const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

  // Grafik verisini formatlayalım
  const chartData = stats.trends.monthlyTransportData.map(item => ({
    name: `${monthNames[item._id.month - 1]}`,
    Toplam: item.count,
    Tamamlanan: item.completed,
    İptal: item.cancelled,
  }));

  // Tarih formatı
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('tr-TR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // İstatistik kartı komponenti
  const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white rounded-lg shadow p-5 flex flex-col">
      <div className="flex items-center mb-2">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <h3 className="ml-3 text-lg font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="text-2xl font-bold text-gray-800 mt-1">{value}</div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="admin-dashboard p-4 lg:p-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Admin Gösterge Paneli</h1>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Yenile
            </button>
          </div>
        ) : (
          <>
            {/* İstatistik Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <StatCard 
                icon={<FaUsers className="text-white text-xl" />} 
                title="Toplam Kullanıcı" 
                value={stats.counts.users} 
                color="bg-blue-500"
              />
              <StatCard 
                icon={<FaBuilding className="text-white text-xl" />} 
                title="Toplam Şirket" 
                value={stats.counts.companies} 
                color="bg-green-500"
              />
              <StatCard 
                icon={<FaTruck className="text-white text-xl" />} 
                title="Toplam Sürücü" 
                value={stats.counts.drivers} 
                color="bg-purple-500"
              />
              <StatCard 
                icon={<FaCarAlt className="text-white text-xl" />} 
                title="Toplam Araç" 
                value={stats.counts.vehicles} 
                color="bg-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <StatCard 
                icon={<FaShippingFast className="text-white text-xl" />} 
                title="Toplam Taşıma Talebi" 
                value={stats.counts.transportRequests} 
                color="bg-indigo-500"
              />
              <StatCard 
                icon={<FaClock className="text-white text-xl" />} 
                title="Bekleyen Talepler" 
                value={stats.counts.pendingTransports} 
                color="bg-yellow-500"
              />
              <StatCard 
                icon={<FaTruck className="text-white text-xl" />} 
                title="Aktif Taşımalar" 
                value={stats.counts.activeTransports} 
                color="bg-teal-500"
              />
              <StatCard 
                icon={<FaCheckCircle className="text-white text-xl" />} 
                title="Tamamlanan Taşımalar" 
                value={stats.counts.completedTransports} 
                color="bg-green-600"
              />
            </div>

            {/* Grafik ve Listeler */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Son 6 Ay Taşıma Grafiği */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow p-5">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Son 6 Ay Taşıma İstatistikleri</h2>
                <div className="h-80">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Toplam" fill="#4F46E5" />
                        <Bar dataKey="Tamamlanan" fill="#10B981" />
                        <Bar dataKey="İptal" fill="#F59E0B" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <FaExclamationTriangle className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                        <p>Grafik için yeterli veri bulunmuyor</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Son Kayıt Olan Şirketler */}
              <div className="bg-white rounded-lg shadow p-5">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Son Kayıt Olan Şirketler</h2>
                {stats.recent.companies.length > 0 ? (
                  <ul className="space-y-3">
                    {stats.recent.companies.map((company) => (
                      <li key={company._id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-800">{company.name}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Kayıt: {formatDate(company.createdAt)}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <FaBuilding className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                    <p>Henüz kayıtlı şirket bulunmuyor</p>
                  </div>
                )}
              </div>
            </div>

            {/* Son Kayıtlı Kullanıcılar */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-5 border-b">
                <h2 className="text-xl font-semibold text-gray-800">Son Kayıtlı Kullanıcılar</h2>
              </div>
              <div className="p-5">
                {stats.recent.users.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kayıt Tarihi</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {stats.recent.users.map((user) => (
                          <tr key={user._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name} {user.surname}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                                  user.role === 'company' ? 'bg-blue-100 text-blue-800' : 
                                  user.role === 'driver' ? 'bg-green-100 text-green-800' : 
                                  'bg-purple-100 text-purple-800'}`}
                              >
                                {user.role === 'admin' ? 'Admin' : 
                                 user.role === 'company' ? 'Şirket' : 
                                 user.role === 'driver' ? 'Sürücü' : 
                                 'Müşteri'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(user.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <FaUsers className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                    <p>Henüz kayıtlı kullanıcı bulunmuyor</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default withAuth(AdminDashboard, ['admin']); 