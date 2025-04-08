import { useState } from 'react';
import PortalLayout from '../../components/portal/Layout';
import { FaSearch, FaDownload, FaEye } from 'react-icons/fa';

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices] = useState([
    {
      id: 1,
      invoiceNo: 'INV-2024-001',
      customer: 'ABC Lojistik',
      amount: '15.000 TL',
      date: '15.03.2024',
      status: 'Ödendi',
      shipmentNo: 'SHP-2024-001',
      fileUrl: '/invoices/inv-2024-001.pdf'
    },
    {
      id: 2,
      invoiceNo: 'INV-2024-002',
      customer: 'XYZ Transport',
      amount: '12.500 TL',
      date: '14.03.2024',
      status: 'Beklemede',
      shipmentNo: 'SHP-2024-002',
      fileUrl: '/invoices/inv-2024-002.pdf'
    },
    {
      id: 3,
      invoiceNo: 'INV-2024-003',
      customer: '123 Nakliyat',
      amount: '18.750 TL',
      date: '13.03.2024',
      status: 'Ödendi',
      shipmentNo: 'SHP-2024-003',
      fileUrl: '/invoices/inv-2024-003.pdf'
    }
  ]);

  const filteredInvoices = invoices.filter(invoice =>
    invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.shipmentNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewInvoice = (fileUrl) => {
    // Burada fatura görüntüleme işlemi yapılacak
    console.log('Fatura görüntüleniyor:', fileUrl);
  };

  const handleDownloadInvoice = (fileUrl) => {
    // Burada fatura indirme işlemi yapılacak
    console.log('Fatura indiriliyor:', fileUrl);
  };

  return (
    <PortalLayout title="Faturalar">
      <div className="space-y-6">
        {/* Başlık ve Arama */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Faturalarım</h1>
          <div className="relative flex-1 sm:max-w-md">
            <input
              type="text"
              placeholder="Fatura ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Fatura Listesi */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fatura No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Müşteri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sevkiyat No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoiceNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.shipmentNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invoice.status === 'Ödendi' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewInvoice(invoice.fileUrl)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FaEye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(invoice.fileUrl)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <FaDownload className="h-5 w-5" />
                        </button>
                      </div>
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