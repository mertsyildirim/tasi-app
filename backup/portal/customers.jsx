import PortalLayout from '../../components/portal/Layout';
import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function Customers() {
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'ABC Lojistik',
      contact: 'Ahmet Yılmaz',
      email: 'info@abclojistik.com',
      phone: '0212 555 1234',
      address: 'İstanbul, Türkiye',
      status: 'Aktif',
      totalShipments: 25
    },
    {
      id: 2,
      name: 'XYZ Taşımacılık',
      contact: 'Mehmet Demir',
      email: 'info@xyztaşımacılık.com',
      phone: '0216 444 5678',
      address: 'İzmir, Türkiye',
      status: 'Aktif',
      totalShipments: 18
    }
  ]);

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Başlık ve Butonlar */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Müşteriler</h1>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Yeni Müşteri
          </button>
        </div>

        {/* Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Toplam Müşteri</h3>
            <p className="mt-2 text-3xl font-semibold text-primary">2</p>
            <p className="mt-1 text-sm text-gray-500">Aktif müşteriler</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Toplam Sevkiyat</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-600">43</p>
            <p className="mt-1 text-sm text-gray-500">Son 30 gün</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Ortalama Sevkiyat</h3>
            <p className="mt-2 text-3xl font-semibold text-green-600">21.5</p>
            <p className="mt-1 text-sm text-gray-500">Müşteri başına</p>
          </div>
        </div>

        {/* Müşteri Listesi */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Firma Adı</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İletişim Kişisi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-posta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adres</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam Sevkiyat</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.contact}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.address}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        customer.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.totalShipments}</td>
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