import { useState } from 'react';
import PortalLayout from '../../components/portal/Layout';
import { FaSearch, FaCalendarAlt, FaMoneyBillWave, FaCheck, FaClock, FaExclamationTriangle, FaFileInvoiceDollar } from 'react-icons/fa';

export default function Payments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const [payments] = useState([
    {
      id: 1,
      period: '1-15 Mart 2024',
      totalShipments: 45,
      totalAmount: 12500,
      status: 'Ödendi',
      paymentDate: '15.03.2024',
      invoiceNumber: 'INV-2024-001',
      details: [
        { date: '01.03.2024', shipmentCount: 12, amount: 3500 },
        { date: '05.03.2024', shipmentCount: 15, amount: 4200 },
        { date: '10.03.2024', shipmentCount: 18, amount: 4800 }
      ]
    },
    {
      id: 2,
      period: '16-31 Mart 2024',
      totalShipments: 38,
      totalAmount: 9800,
      status: 'Beklemede',
      paymentDate: '31.03.2024',
      invoiceNumber: 'INV-2024-002',
      details: [
        { date: '16.03.2024', shipmentCount: 10, amount: 2800 },
        { date: '20.03.2024', shipmentCount: 14, amount: 3600 },
        { date: '25.03.2024', shipmentCount: 14, amount: 3400 }
      ]
    },
    {
      id: 3,
      period: '1-15 Nisan 2024',
      totalShipments: 42,
      totalAmount: 11200,
      status: 'Planlandı',
      paymentDate: '15.04.2024',
      invoiceNumber: 'INV-2024-003',
      details: [
        { date: '01.04.2024', shipmentCount: 11, amount: 3100 },
        { date: '05.04.2024', shipmentCount: 16, amount: 4200 },
        { date: '10.04.2024', shipmentCount: 15, amount: 3900 }
      ]
    }
  ]);

  const filteredPayments = payments.filter(payment =>
    payment.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Ödendi':
        return <FaCheck className="h-5 w-5 text-green-500" />;
      case 'Beklemede':
        return <FaClock className="h-5 w-5 text-yellow-500" />;
      case 'Planlandı':
        return <FaCalendarAlt className="h-5 w-5 text-blue-500" />;
      default:
        return <FaExclamationTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <PortalLayout title="Ödemeler">
      <div className="space-y-6">
        {/* Başlık ve Arama */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Ödeme Bilgileri</h1>
          <div className="flex gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Dönem veya fatura no ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Ödeme Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPayments.map((payment) => (
            <div key={payment.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{payment.period}</h3>
                    <p className="text-sm text-gray-500">Fatura No: {payment.invoiceNumber}</p>
                  </div>
                  {getStatusIcon(payment.status)}
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Toplam Sevkiyat</span>
                    <span className="text-sm font-medium">{payment.totalShipments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Toplam Tutar</span>
                    <span className="text-sm font-medium">{payment.totalAmount.toLocaleString('tr-TR')} ₺</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Ödeme Tarihi</span>
                    <span className="text-sm font-medium">{payment.paymentDate}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Detaylı Dağılım</h4>
                  <div className="space-y-2">
                    {payment.details.map((detail, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-500">{detail.date}</span>
                        <span className="font-medium">{detail.shipmentCount} sevkiyat - {detail.amount.toLocaleString('tr-TR')} ₺</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <FaFileInvoiceDollar />
                    <span>Fatura Görüntüle</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
} 