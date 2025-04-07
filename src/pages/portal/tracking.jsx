import React, { useState, useEffect } from 'react';
import PortalLayout from '../../components/portal/Layout';
import Map from '../../components/portal/Map';
import { FaMapMarkedAlt, FaSearch, FaTruck, FaBox, FaClock, FaUserTie } from 'react-icons/fa';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

export default function Tracking() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [drivers] = useState([
    { 
      id: 1, 
      name: 'Ahmet Yılmaz', 
      vehicle: '34 ABC 123',
      location: { lat: 41.0082, lng: 28.9784 },
      status: 'Aktif',
      lastUpdate: '10:30'
    },
    { 
      id: 2, 
      name: 'Mehmet Demir', 
      vehicle: '06 XYZ 789',
      location: { lat: 41.0152, lng: 28.9794 },
      status: 'Aktif',
      lastUpdate: '10:28'
    },
    { 
      id: 3, 
      name: 'Ayşe Kaya', 
      vehicle: '35 DEF 456',
      location: { lat: 41.0182, lng: 28.9684 },
      status: 'Aktif',
      lastUpdate: '10:25'
    },
  ]);

  // Örnek sevkiyat verileri
  const shipments = [
    {
      id: 'SH001',
      customer: 'ABC Lojistik',
      from: 'İstanbul',
      to: 'Ankara',
      status: 'active',
      currentLocation: { lat: 40.9862, lng: 29.0307 },
      estimatedArrival: '2024-02-21 14:30',
      vehicle: '34 ABC 123',
      driver: 'Ahmet Yılmaz',
      lastUpdate: '2024-02-20 15:45'
    },
    {
      id: 'SH002',
      customer: 'XYZ Taşımacılık',
      from: 'İzmir',
      to: 'Bursa',
      status: 'completed',
      currentLocation: { lat: 40.1824, lng: 29.0670 },
      estimatedArrival: '2024-02-19 16:00',
      vehicle: '35 XYZ 456',
      driver: 'Mehmet Demir',
      lastUpdate: '2024-02-19 15:30'
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    const shipment = shipments.find(s => s.id === trackingNumber);
    setSelectedShipment(shipment);
  };

  const mapContainerStyle = {
    width: '100%',
    height: '600px'
  };

  const center = {
    lat: 41.0082,
    lng: 28.9784
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.vehicle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PortalLayout title="Takip">
      <div className="space-y-6">
        {/* Başlık ve Arama */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Araç Takip</h1>
          <div className="relative flex-1 sm:max-w-md">
            <input
              type="text"
              placeholder="Sürücü veya araç ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Harita */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={12}
            >
              {filteredDrivers.map((driver) => (
                <Marker
                  key={driver.id}
                  position={driver.location}
                  onClick={() => setSelectedDriver(driver)}
                />
              ))}

              {selectedDriver && (
                <InfoWindow
                  position={selectedDriver.location}
                  onCloseClick={() => setSelectedDriver(null)}
                >
                  <div className="p-2">
                    <h3 className="font-semibold">{selectedDriver.name}</h3>
                    <p className="text-sm text-gray-600">{selectedDriver.vehicle}</p>
                    <p className="text-sm text-gray-500">Son güncelleme: {selectedDriver.lastUpdate}</p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </LoadScript>
        </div>

        {/* Sürücü Listesi */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sürücü</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Araç</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Güncelleme</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDrivers.map((driver) => (
                  <tr 
                    key={driver.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedDriver(driver)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FaUserTie className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{driver.vehicle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        driver.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {driver.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.lastUpdate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Harita ve Detaylar */}
        {selectedShipment ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Harita */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
              <Map markers={[
                { position: selectedShipment.currentLocation, title: 'Mevcut Konum' }
              ]} />
            </div>

            {/* Sevkiyat Detayları */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sevkiyat Detayları</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FaBox className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Sevkiyat No</p>
                    <p className="text-sm text-gray-500">{selectedShipment.id}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaTruck className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Araç ve Sürücü</p>
                    <p className="text-sm text-gray-500">{selectedShipment.vehicle}</p>
                    <p className="text-sm text-gray-500">{selectedShipment.driver}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaClock className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Tahmini Varış</p>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedShipment.estimatedArrival).toLocaleString('tr-TR')}
                    </p>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900">Güzergah</p>
                  <p className="text-sm text-gray-500">{selectedShipment.from} → {selectedShipment.to}</p>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900">Son Güncelleme</p>
                  <p className="text-sm text-gray-500">
                    {new Date(selectedShipment.lastUpdate).toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">Takip etmek istediğiniz sevkiyat numarasını girin.</p>
          </div>
        )}
      </div>
    </PortalLayout>
  );
} 