import PortalLayout from '../../components/portal/Layout';
import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function Payments() {
  const [payments, setPayments] = useState([
    {
      id: 1,
      invoiceNo: 'INV001',
      customer: 'ABC Lojistik',
      amount: 15000,
      status: 'Ödendi',
      date: '2024-02-20',
      dueDate: '2024-03-20',
      type: 'Nakit'
    },
    {
      id: 2,
      invoiceNo: 'INV002',
      customer: 'XYZ Taşımacılık',
      amount: 12500,
      status: 'Beklemede',
      date: '2024-02-19',
      dueDate: '2024-03-19',
      type: 'Havale'
    }
  ]);

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Başlık ve Butonlar */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Ödemeler</h1>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Yeni Ödeme
          </button>
        </div>

        {/* Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Toplam Tahsilat</h3>
            <p className="mt-2 text-3xl font-semibold text-primary">₺27,500</p>
            <p className="mt-1 text-sm text-gray-500">Son 30 gün</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Bekleyen Ödemeler</h3>
            <p className="mt-2 text-3xl font-semibold text-yellow-600">₺12,500</p>
            <p className="mt-1 text-sm text-gray-500">3 bekleyen ödeme</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900">Ortalama Tahsilat Süresi</h3>
            <p className="mt-2 text-3xl font-semibold text-green-600">15 gün</p>
            <p className="mt-1 text-sm text-gray-500">Son 30 gün</p>
          </div>
        </div>

        {/* Ödeme Listesi */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fatura No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Ödeme</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödeme Tipi</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.invoiceNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₺{payment.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === 'Ödendi' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.dueDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.type}</td>
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