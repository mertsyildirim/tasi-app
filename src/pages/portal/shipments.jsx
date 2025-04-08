import React, { useState } from 'react';
import PortalLayout from '../../components/portal/Layout';
import { FaBox, FaSearch, FaFilter, FaPlus, FaEye, FaTruck, FaMapMarkerAlt, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import { FiTruck, FiPackage, FiMap, FiCalendar, FiUser, FiPhone, FiMail, FiMapPin, FiFileText, FiInfo, FiX, FiDollarSign } from 'react-icons/fi';

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
    <PortalLayout sidebar="Taşımalar">
      <div className="p-4 sm:p-6 w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Taşımalar</h1>
          <p className="text-gray-600">
            Tüm taşıma siparişlerinizi görüntüleyin ve yönetin
          </p>
        </div>

        {/* Masaüstü için tablo görünümü */}
        <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taşıma ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{shipment.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {shipment.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {shipment.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        shipment.status
                      )}`}
                    >
                      {getStatusText(shipment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {shipment.amount} ₺
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewShipment(shipment)}
                      className="text-indigo-600 hover:text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 px-3 py-1 rounded"
                    >
                      İncele
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobil için kart görünümü */}
        <div className="md:hidden space-y-4">
          {shipments.map((shipment) => (
            <div key={shipment.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <FiPackage className="text-indigo-500 mr-2" />
                  <span className="font-medium text-gray-900">#{shipment.id}</span>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    shipment.status
                  )}`}
                >
                  {getStatusText(shipment.status)}
                </span>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <FiUser className="mr-1 text-gray-400" />
                    <span>{shipment.customer}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FiCalendar className="mr-1 text-gray-400" />
                    <span>{shipment.date}</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <FiMapPin className="mr-1 text-gray-400" />
                    <span>{shipment.from} → {shipment.to}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FiDollarSign className="mr-1 text-gray-400" />
                    <span>{shipment.amount} ₺</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleViewShipment(shipment)}
                className="w-full bg-indigo-600 text-white text-sm font-medium py-2 px-4 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                İncele
              </button>
            </div>
          ))}
        </div>
        
        {/* Shipment Details Popup */}
        {selectedShipment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Taşıma Detayları
                  </h3>
                  <button
                    onClick={() => setSelectedShipment(null)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <FiX className="h-6 w-6" />
                  </button>
                </div>

                {/* Takip Bilgileri Bölümü */}
                <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <FiFileText className="mr-2 text-indigo-500" />
                    Takip Bilgileri
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Taşıma ID</p>
                      <p className="font-medium">#{selectedShipment.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tarih</p>
                      <p className="font-medium">{selectedShipment.date}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Durum</p>
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          selectedShipment.status
                        )}`}
                      >
                        {getStatusText(selectedShipment.status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tahmini Teslimat</p>
                      <p className="font-medium">{selectedShipment.estimatedDelivery}</p>
                    </div>
                  </div>
                </div>

                {/* Müşteri Bilgileri Bölümü */}
                <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-700 mb-3 flex items-center">
                    <FiUser className="mr-2 text-blue-500" />
                    Müşteri Bilgileri
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Müşteri</p>
                      <p className="font-medium">{selectedShipment.customer}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Telefon</p>
                      <p className="font-medium">{selectedShipment.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">E-posta</p>
                      <p className="font-medium">{selectedShipment.email}</p>
                    </div>
                  </div>
                </div>

                {/* Araç ve Sürücü Bilgileri */}
                <div className="mb-6 bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                    <FiTruck className="mr-2 text-green-500" />
                    Araç ve Sürücü Bilgileri
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Araç</p>
                      <p className="font-medium">{selectedShipment.vehicle}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sürücü</p>
                      <p className="font-medium">{selectedShipment.driver}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Plaka</p>
                      <p className="font-medium">{selectedShipment.plate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Yük Tipi</p>
                      <p className="font-medium">{selectedShipment.cargoType}</p>
                    </div>
                  </div>
                </div>

                {/* Lokasyon Bilgileri */}
                <div className="mb-6 bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-700 mb-3 flex items-center">
                    <FiMap className="mr-2 text-yellow-500" />
                    Lokasyon Bilgileri
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Yükleme Noktası</p>
                      <p className="font-medium">{selectedShipment.from}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Teslimat Noktası</p>
                      <p className="font-medium">{selectedShipment.to}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Mesafe</p>
                      <p className="font-medium">{selectedShipment.distance} km</p>
                    </div>
                  </div>
                </div>

                {/* Ödeme Bilgileri */}
                <div className="mb-6 bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-700 mb-3 flex items-center">
                    <FiDollarSign className="mr-2 text-purple-500" />
                    Ödeme Bilgileri
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Tutar</p>
                      <p className="font-medium">{selectedShipment.amount} ₺</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ödeme Durumu</p>
                      <p className={`font-medium ${selectedShipment.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedShipment.paymentStatus === 'paid' ? 'Ödendi' : 'Bekliyor'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ödeme Yöntemi</p>
                      <p className="font-medium">{selectedShipment.paymentMethod || 'Belirtilmemiş'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fatura No</p>
                      <p className="font-medium">{selectedShipment.invoiceNumber || 'Belirtilmemiş'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedShipment(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                  >
                    Kapat
                  </button>
                  <button className="px-4 py-2 bg-yellow-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-yellow-700 focus:outline-none">
                    Güncelle
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
} 