import PortalLayout from '../../components/portal/Layout';
import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function Shipments() {
  const [shipments, setShipments] = useState([
    {
      id: 1,
      trackingNo: 'TRK001',
      customer: 'ABC Lojistik',
      from: 'İstanbul',
      to: 'Ankara',
      status: 'Yolda',
      vehicle: '34 ABC 123',
      driver: 'Ahmet Yılmaz',
      date: '2024-02-20'
    },
    {
      id: 2,
      trackingNo: 'TRK002',
      customer: 'XYZ Taşımacılık',
      from: 'İzmir',
      to: 'Bursa',
      status: 'Tamamlandı',
      vehicle: '34 XYZ 789',
      driver: 'Mehmet Demir',
      date: '2024-02-19'
    }
  ]);

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Başlık ve Butonlar */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Sevkiyatlar</h1>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Yeni Sevkiyat
          </button>
        </div>

        {/* Sevkiyat Listesi */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Takip No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nereden</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nereye</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Araç</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sürücü</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shipments.map((shipment) => (
                  <tr key={shipment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{shipment.trackingNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.from}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.to}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        shipment.status === 'Yolda' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.vehicle}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.driver}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary hover:text-primary-dark mr-4">Detay</button>
                      <button className="text-primary hover:text-primary-dark">Düzenle</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
} 