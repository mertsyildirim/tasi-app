import { useState, useEffect } from 'react';
import DriverLayout from '../../../components/portal/DriverLayout';
import { FaTruck, FaRoute, FaClock, FaGasPump, FaCalendarAlt } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Chart.js kayıt
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend
);

export default function DriverDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [driverStatusValue, setDriverStatusValue] = useState('active');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Oturum bilgisi bulunamadı');
        }
        
        const response = await fetch('/api/drivers/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Dashboard verileri alınamadı');
        }
        
        const data = await response.json();
        setDashboardData(data);
        if (data.driverStatus) {
          setDriverStatusValue(data.driverStatus);
        }
      } catch (error) {
        console.error('Dashboard veri hatası:', error);
        setError(error.message);
        
        // Hata durumunda mock data kullan
        setDashboardData({
          currentRoute: {
            id: "R12345",
            origin: "İstanbul",
            destination: "Ankara",
            distance: "450 km",
            estimatedTime: "5 saat",
            status: "devam ediyor"
          },
          stats: {
            totalTrips: 45,
            totalDistance: "12,500 km",
            averageRating: 4.8,
            fuelConsumption: "8.5 L/100km"
          },
          recentTrips: [
            {
              id: "T789012",
              date: "15 Mayıs 2023",
              route: "İstanbul - İzmir",
              status: "tamamlandı",
              distance: "480 km"
            },
            {
              id: "T789011",
              date: "10 Mayıs 2023",
              route: "Ankara - İstanbul",
              status: "tamamlandı",
              distance: "450 km"
            },
            {
              id: "T789010",
              date: "5 Mayıs 2023",
              route: "İzmir - Antalya",
              status: "tamamlandı",
              distance: "350 km"
            }
          ],
          upcomingMaintenance: {
            date: "20 Haziran 2023",
            type: "Periyodik Bakım",
            vehicle: "Ford Kamyon"
          },
          monthlyPerformance: {
            labels: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran"],
            datasets: [
              {
                label: "Mesafe (km)",
                data: [1200, 1900, 1700, 2100, 2400, 2000],
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)"
              },
              {
                label: "Yakıt Tüketimi (L)",
                data: [320, 390, 350, 400, 450, 380],
                borderColor: "rgba(255, 99, 132, 1)",
                backgroundColor: "rgba(255, 99, 132, 0.2)"
              }
            ]
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <DriverLayout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </DriverLayout>
    );
  }

  if (error) {
    return (
      <DriverLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-6 mx-4" role="alert">
          <strong className="font-bold">Hata!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </DriverLayout>
    );
  }

  return (
    <DriverLayout driverStatus={driverStatusValue}>
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Sürücü Paneli</h1>
        
        {/* Mevcut Rota Bilgisi */}
        {dashboardData.currentRoute && dashboardData.currentRoute.status === "devam ediyor" ? (
          <div className="bg-white shadow-md rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <FaRoute className="mr-2 text-blue-600" /> Aktif Rota
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="border-r border-gray-200 pr-4">
                <p className="text-sm text-gray-500">Başlangıç</p>
                <p className="font-medium">{dashboardData.currentRoute.origin}</p>
              </div>
              <div className="border-r border-gray-200 pr-4">
                <p className="text-sm text-gray-500">Varış</p>
                <p className="font-medium">{dashboardData.currentRoute.destination}</p>
              </div>
              <div className="border-r border-gray-200 pr-4">
                <p className="text-sm text-gray-500">Mesafe</p>
                <p className="font-medium">{dashboardData.currentRoute.distance}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tahmini Süre</p>
                <p className="font-medium">{dashboardData.currentRoute.estimatedTime}</p>
              </div>
            </div>
            <div className="mt-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                Rotayı Görüntüle
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <FaRoute className="mr-2 text-gray-500" /> Aktif Rota
            </h2>
            <p className="text-gray-500">Şu an aktif bir rotanız bulunmamaktadır.</p>
          </div>
        )}

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white shadow-md rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Toplam Sefer</p>
                <p className="text-2xl font-bold">{dashboardData.stats.totalTrips}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaTruck className="text-xl text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Toplam Mesafe</p>
                <p className="text-2xl font-bold">{dashboardData.stats.totalDistance}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaRoute className="text-xl text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ortalama Puan</p>
                <p className="text-2xl font-bold">{dashboardData.stats.averageRating}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <div className="text-xl text-yellow-600">★</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Yakıt Tüketimi</p>
                <p className="text-2xl font-bold">{dashboardData.stats.fuelConsumption}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <FaGasPump className="text-xl text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Grafik */}
        <div className="bg-white shadow-md rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Aylık Performans</h2>
          <div className="h-64">
            <Line
              data={{
                labels: dashboardData.monthlyPerformance.labels,
                datasets: dashboardData.monthlyPerformance.datasets
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Son Seferler ve Bakım Bilgisi */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Son Seferler */}
          <div className="lg:col-span-2 bg-white shadow-md rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <FaClock className="mr-2 text-blue-600" /> Son Seferler
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rota
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mesafe
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dashboardData.recentTrips.map((trip) => (
                    <tr key={trip.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.route}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.distance}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          trip.status === 'tamamlandı' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {trip.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-right">
              <a href="/portal/driver/trips" className="text-blue-600 hover:text-blue-800">
                Tüm seferleri görüntüle &rarr;
              </a>
            </div>
          </div>

          {/* Yaklaşan Bakım */}
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center">
              <FaCalendarAlt className="mr-2 text-blue-600" /> Yaklaşan Bakım
            </h2>
            {dashboardData.upcomingMaintenance ? (
              <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-r">
                <p className="text-sm text-gray-600">Tarih</p>
                <p className="font-medium mb-2">{dashboardData.upcomingMaintenance.date}</p>
                <p className="text-sm text-gray-600">Bakım Türü</p>
                <p className="font-medium mb-2">{dashboardData.upcomingMaintenance.type}</p>
                <p className="text-sm text-gray-600">Araç</p>
                <p className="font-medium">{dashboardData.upcomingMaintenance.vehicle}</p>
                <button className="mt-4 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors w-full">
                  Bakım Takvimini Görüntüle
                </button>
              </div>
            ) : (
              <p className="text-gray-500">Yaklaşan bakım bulunmamaktadır.</p>
            )}
          </div>
        </div>
      </div>
    </DriverLayout>
  );
} 