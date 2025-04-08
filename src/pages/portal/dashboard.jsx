import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PortalLayout from '../../components/portal/Layout';
import { FaTruck, FaBox, FaMoneyBillWave, FaUsers, FaChartLine, FaSearch, FaEye } from 'react-icons/fa';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [shipments] = useState({
    active: [
      { id: 1, trackingNo: 'TRK001', from: 'İstanbul', to: 'Ankara', status: 'Yolda', date: '15.03.2024' },
      { id: 2, trackingNo: 'TRK002', from: 'İzmir', to: 'Bursa', status: 'Yükleniyor', date: '15.03.2024' },
      { id: 3, trackingNo: 'TRK003', from: 'Antalya', to: 'İstanbul', status: 'Hazırlanıyor', date: '15.03.2024' }
    ],
    recent: [
      { id: 4, trackingNo: 'TRK004', from: 'Ankara', to: 'İzmir', status: 'Tamamlandı', date: '14.03.2024' },
      { id: 5, trackingNo: 'TRK005', from: 'Bursa', to: 'Antalya', status: 'Tamamlandı', date: '13.03.2024' },
      { id: 6, trackingNo: 'TRK006', from: 'İstanbul', to: 'Ankara', status: 'Tamamlandı', date: '12.03.2024' }
    ]
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/portal/login');
      return;
    }
    setUser(JSON.parse(userData));
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderShipmentCard = (shipment) => (
    <div key={shipment.id} className="bg-white p-4 rounded-lg shadow mb-4 lg:hidden">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium text-gray-900">{shipment.trackingNo}</span>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          shipment.status === 'Yolda' ? 'bg-green-100 text-green-800' :
          shipment.status === 'Yükleniyor' ? 'bg-yellow-100 text-yellow-800' :
          shipment.status === 'Tamamlandı' ? 'bg-gray-100 text-gray-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {shipment.status}
        </span>
      </div>
      <div className="space-y-1 text-sm text-gray-500">
        <div className="flex justify-between">
          <span>Nereden:</span>
          <span className="font-medium">{shipment.from}</span>
        </div>
        <div className="flex justify-between">
          <span>Nereye:</span>
          <span className="font-medium">{shipment.to}</span>
        </div>
        <div className="flex justify-between">
          <span>Tarih:</span>
          <span className="font-medium">{shipment.date}</span>
        </div>
      </div>
      <div className="mt-3 flex justify-end">
        <button 
          onClick={() => router.push(`/portal/shipments/${shipment.id}`)}
          className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
        >
          <FaEye className="h-4 w-4" />
          <span className="text-sm">İncele</span>
        </button>
      </div>
    </div>
  );

  return (
    <PortalLayout title="Dashboard">
      <div className="space-y-6 p-4">
        {/* İstatistikler */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 lg:p-3 rounded-full bg-blue-100">
                <FaTruck className="h-4 w-4 lg:h-6 lg:w-6 text-blue-600" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-500">Aktif Taşımalar</p>
                <p className="text-base lg:text-lg font-semibold text-gray-900">{shipments.active.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 lg:p-3 rounded-full bg-green-100">
                <FaMoneyBillWave className="h-4 w-4 lg:h-6 lg:w-6 text-green-600" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-500">Toplam Kazanç</p>
                <p className="text-base lg:text-lg font-semibold text-gray-900">12.500 ₺</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 lg:p-3 rounded-full bg-purple-100">
                <FaUsers className="h-4 w-4 lg:h-6 lg:w-6 text-purple-600" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-500">Müşteriler</p>
                <p className="text-base lg:text-lg font-semibold text-gray-900">8</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 lg:p-6">
            <div className="flex items-center">
              <div className="p-2 lg:p-3 rounded-full bg-yellow-100">
                <FaChartLine className="h-4 w-4 lg:h-6 lg:w-6 text-yellow-600" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm font-medium text-gray-500">Performans</p>
                <p className="text-base lg:text-lg font-semibold text-gray-900">%92</p>
              </div>
            </div>
          </div>
        </div>

        {/* Aktif Taşımalar */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 lg:p-6">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Aktif Taşımalar</h2>
            
            {/* Mobil Görünüm */}
            <div className="lg:hidden space-y-4">
              {shipments.active.map(renderShipmentCard)}
            </div>

            {/* Masaüstü Görünüm */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Takip No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nereden</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nereye</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shipments.active.map((shipment) => (
                    <tr key={shipment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{shipment.trackingNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.from}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.to}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          shipment.status === 'Yolda' ? 'bg-green-100 text-green-800' :
                          shipment.status === 'Yükleniyor' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {shipment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => router.push(`/portal/shipments/${shipment.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FaEye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Son Taşımalar */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 lg:p-6">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900 mb-4">Son Taşımalar</h2>
            
            {/* Mobil Görünüm */}
            <div className="lg:hidden space-y-4">
              {shipments.recent.map(renderShipmentCard)}
            </div>

            {/* Masaüstü Görünüm */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Takip No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nereden</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nereye</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {shipments.recent.map((shipment) => (
                    <tr key={shipment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{shipment.trackingNo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.from}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.to}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {shipment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => router.push(`/portal/shipments/${shipment.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FaEye className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
} 