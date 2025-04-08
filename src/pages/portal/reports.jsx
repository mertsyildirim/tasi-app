import { useState } from 'react';
import PortalLayout from '../../components/portal/Layout';
import { FaChartLine, FaDownload, FaCalendarAlt } from 'react-icons/fa';

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState('shipments');
  const [dateRange, setDateRange] = useState('week');

  const reports = [
    { id: 'shipments', name: 'Sevkiyat Raporu', description: 'Sevkiyat istatistikleri ve performans analizi' },
    { id: 'revenue', name: 'Gelir Raporu', description: 'Gelir ve gider analizi' },
    { id: 'customers', name: 'Müşteri Raporu', description: 'Müşteri aktivite ve memnuniyet analizi' },
    { id: 'vehicles', name: 'Araç Raporu', description: 'Araç performans ve bakım analizi' },
  ];

  return (
    <PortalLayout title="Raporlar">
      <div className="space-y-6">
        {/* Başlık */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Raporlar</h1>
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">Bu Hafta</option>
              <option value="month">Bu Ay</option>
              <option value="quarter">Bu Çeyrek</option>
              <option value="year">Bu Yıl</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <FaDownload />
              <span>Raporu İndir</span>
            </button>
          </div>
        </div>

        {/* Rapor Seçimi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedReport === report.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
              onClick={() => setSelectedReport(report.id)}
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FaChartLine className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{report.name}</h3>
                  <p className="text-sm text-gray-500">{report.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Rapor İçeriği */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">
              {reports.find(r => r.id === selectedReport)?.name}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaCalendarAlt />
              <span>Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}</span>
            </div>
          </div>

          {/* Örnek Grafik Alanı */}
          <div className="h-96 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Grafik burada görüntülenecek</p>
          </div>

          {/* Örnek Tablo */}
          <div className="mt-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Değer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Değişim</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2024-03-01</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1,234</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+12.5%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Yükseliş</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2024-02-28</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1,098</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">-5.2%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Düşüş</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">2024-02-27</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1,158</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+3.1%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Yükseliş</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
} 