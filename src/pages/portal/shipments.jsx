import React, { useState } from 'react';
import PortalLayout from '../../components/portal/Layout';
import { FaBox, FaSearch, FaFilter, FaPlus, FaEye, FaTruck, FaMapMarkerAlt, FaCalendarAlt, FaTimes } from 'react-icons/fa';

export default function Shipments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Örnek taşıma verileri
  const [shipments] = useState([
    {
      id: 1,
      trackingNo: 'TRK123456',
      origin: 'İstanbul, Kadıköy',
      destination: 'Ankara, Çankaya',
      status: 'Yolda',
      date: '15.06.2023',
      vehicle: '34 ABC 123',
      driver: 'Ahmet Yılmaz'
    },
    {
      id: 2,
      trackingNo: 'TRK789012',
      origin: 'İzmir, Konak',
      destination: 'Bursa, Nilüfer',
      status: 'Tamamlandı',
      date: '14.06.2023',
      vehicle: '06 XYZ 456',
      driver: 'Mehmet Demir'
    },
    {
      id: 3,
      trackingNo: 'TRK345678',
      origin: 'Antalya, Muratpaşa',
      destination: 'İstanbul, Beşiktaş',
      status: 'Beklemede',
      date: '13.06.2023',
      vehicle: '07 ABC 789',
      driver: 'Ayşe Kaya'
    },
    {
      id: 4,
      trackingNo: 'TRK901234',
      origin: 'Ankara, Keçiören',
      destination: 'İzmir, Karşıyaka',
      status: 'Yolda',
      date: '12.06.2023',
      vehicle: '06 DEF 012',
      driver: 'Ali Yıldız'
    },
    {
      id: 5,
      trackingNo: 'TRK567890',
      origin: 'Bursa, Osmangazi',
      destination: 'İstanbul, Üsküdar',
      status: 'Tamamlandı',
      date: '11.06.2023',
      vehicle: '16 GHI 345',
      driver: 'Zeynep Şahin'
    }
  ]);
  
  // Arama fonksiyonu
  const filteredShipments = shipments.filter(shipment => 
    shipment.trackingNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Taşıma detaylarını görüntüleme fonksiyonu
  const handleViewShipment = (shipment) => {
    setSelectedShipment(shipment);
    setShowModal(true);
  };
  
  // Modal'ı kapatma fonksiyonu
  const closeModal = () => {
    setShowModal(false);
    setSelectedShipment(null);
  };
  
  // Durum rengini belirleme fonksiyonu
  const getStatusColor = (status) => {
    switch (status) {
      case 'Tamamlandı':
        return 'bg-green-100 text-green-800';
      case 'Yolda':
        return 'bg-blue-100 text-blue-800';
      case 'Beklemede':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PortalLayout title="Taşımalar">
      <div className="space-y-6">
        {/* Başlık ve Arama */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Sevkiyatlarım</h1>
          <div className="relative flex-1 sm:max-w-md">
            <input
              type="text"
              placeholder="Sevkiyat ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Sevkiyat Listesi */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Takip No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nereden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nereye
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Araç
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sürücü
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {shipment.trackingNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {shipment.origin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {shipment.destination}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(shipment.status)}`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {shipment.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {shipment.vehicle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {shipment.driver}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleViewShipment(shipment)}
                        className="text-blue-600 hover:text-blue-900 flex items-center justify-end gap-2"
                      >
                        <span>İncele</span>
                        <FaEye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Taşıma Detay Modal */}
      {showModal && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Taşıma Detayları</h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Takip Bilgileri</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <FaTruck className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Takip No</p>
                        <p className="text-lg font-semibold text-blue-600">{selectedShipment.trackingNo}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <FaMapMarkerAlt className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Durum</p>
                        <p className={`text-lg font-semibold ${getStatusColor(selectedShipment.status).split(' ')[1]}`}>
                          {selectedShipment.status}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <FaCalendarAlt className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Tarih</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedShipment.date}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Adres Bilgileri</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="border-t border-gray-200 pt-3">
                      <p className="text-sm font-medium text-gray-900 mb-1">Alınacak Adres</p>
                      <p className="text-base text-gray-700 mb-3">{selectedShipment.origin}</p>
                      
                      <p className="text-sm font-medium text-gray-900 mb-1">Teslim Adresi</p>
                      <p className="text-base text-gray-700">{selectedShipment.destination}</p>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Araç ve Sürücü Bilgileri</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">Araç Plakası</p>
                        <p className="text-base text-gray-700">{selectedShipment.vehicle}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">Sürücü</p>
                        <p className="text-base text-gray-700">{selectedShipment.driver}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
} 