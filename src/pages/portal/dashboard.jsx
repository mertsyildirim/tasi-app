import React, { useEffect, useState } from 'react';
import { withAuth } from '../../lib/auth';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { FaTruck, FaShippingFast, FaCheckCircle, FaMoneyBillWave, FaCalendarAlt, FaUser, FaClock } from 'react-icons/fa';
import axios from 'axios';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    activeShipments: 0,
    completedShipments: 0,
    earnings: 0,
    recentActivity: []
  });
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    // API'den dashboard verilerini al
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        // Dashboard istatistiklerini al
        const statsResponse = await axios.get('/api/dashboard/portal-stats');
        if (statsResponse.data.success) {
          setStats(statsResponse.data.data);
        }
        
        // Taşıma taleplerini al
        const requestsResponse = await axios.get('/api/transport-requests/list', {
          params: { limit: 5 }
        });
        if (requestsResponse.data.success) {
          setRequests(requestsResponse.data.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Dashboard verileri yüklenirken hata:', err);
        setError('Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);

  // TL para formatı
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  // Tarih formatı
  const formatDate = (dateStr) => {
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
    <DashboardLayout>
      <div className="dashboard-container p-4 lg:p-6">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Gösterge Paneli</h1>
        
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
              Tekrar Dene
            </button>
          </div>
        ) : (
          <>
            {/* İstatistik Kartları */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <StatCard 
                icon={<FaShippingFast className="text-white text-xl" />} 
                title="Bekleyen Talepler" 
                value={stats.pendingRequests} 
                color="bg-blue-500"
              />
              <StatCard 
                icon={<FaTruck className="text-white text-xl" />} 
                title="Aktif Taşımalar" 
                value={stats.activeShipments} 
                color="bg-green-500"
              />
              <StatCard 
                icon={<FaCheckCircle className="text-white text-xl" />} 
                title="Tamamlanan Taşımalar" 
                value={stats.completedShipments} 
                color="bg-purple-500"
              />
              <StatCard 
                icon={<FaMoneyBillWave className="text-white text-xl" />} 
                title="Toplam Kazanç" 
                value={formatCurrency(stats.earnings)} 
                color="bg-amber-500"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Son Taşıma Talepleri */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow">
                <div className="p-5 border-b">
                  <h2 className="text-xl font-semibold text-gray-800">Son Taşıma Talepleri</h2>
                </div>
                <div className="p-5">
                  {requests.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rota</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {requests.map((request) => (
                            <tr key={request.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{request.pickupLocation}</div>
                                <div className="text-sm text-gray-500">→ {request.destinationLocation}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{formatDate(request.pickupDate)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{formatCurrency(request.price)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                  ${request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                                    request.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' : 
                                    request.status === 'IN_TRANSIT' ? 'bg-green-100 text-green-800' : 
                                    request.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' : 
                                    'bg-red-100 text-red-800'}`}
                                >
                                  {request.status === 'PENDING' ? 'Beklemede' : 
                                   request.status === 'ACCEPTED' ? 'Kabul Edildi' : 
                                   request.status === 'IN_TRANSIT' ? 'Taşıma Aşamasında' : 
                                   request.status === 'COMPLETED' ? 'Tamamlandı' : 
                                   'İptal Edildi'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <FaTruck className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                      <p>Henüz taşıma talebi bulunmuyor</p>
                    </div>
                  )}
                  {requests.length > 0 && (
                    <div className="mt-4 text-right">
                      <a href="/portal/transport-requests" className="text-orange-600 hover:text-orange-800 text-sm font-medium">
                        Tüm talepleri görüntüle →
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Son Aktiviteler */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-5 border-b">
                  <h2 className="text-xl font-semibold text-gray-800">Son Aktiviteler</h2>
                </div>
                <div className="p-5">
                  {stats.recentActivity && stats.recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {stats.recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start p-2 border-b border-gray-100 pb-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 
                            ${activity.type === 'shipment_assigned' ? 'bg-blue-100 text-blue-600' : 
                              activity.type === 'request_completed' ? 'bg-green-100 text-green-600' : 
                              activity.type === 'payment_received' ? 'bg-amber-100 text-amber-600' : 
                              activity.type === 'shipment_started' ? 'bg-purple-100 text-purple-600' : 
                              activity.type === 'location_updated' ? 'bg-indigo-100 text-indigo-600' :
                              'bg-gray-100 text-gray-600'}`}
                          >
                            {activity.type === 'shipment_assigned' ? <FaTruck className="h-4 w-4" /> : 
                             activity.type === 'request_completed' ? <FaCheckCircle className="h-4 w-4" /> : 
                             activity.type === 'payment_received' ? <FaMoneyBillWave className="h-4 w-4" /> : 
                             activity.type === 'shipment_started' ? <FaShippingFast className="h-4 w-4" /> : 
                             activity.type === 'location_updated' ? <FaUser className="h-4 w-4" /> :
                             <FaCalendarAlt className="h-4 w-4" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-800">{activity.message}</p>
                            <p className="text-xs text-gray-500 mt-1 flex items-center">
                              <FaClock className="h-3 w-3 mr-1" /> {formatDate(activity.date)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <FaClock className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                      <p>Henüz aktivite bulunmuyor</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
} 

export default withAuth(Dashboard, ['carrier', 'driver']); 