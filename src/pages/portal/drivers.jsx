import React, { useState, useEffect } from 'react';
import PortalLayout from '../../components/portal/Layout';
import { FaUser, FaSearch, FaPlus, FaEdit, FaTrash, FaEye, FaPhone, FaIdCard } from 'react-icons/fa';

export default function Drivers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Örnek sürücü verileri
  useEffect(() => {
    const driverData = [
      { id: 1, name: 'Ahmet Yılmaz', phone: '0532 123 4567', licenseType: 'E', licenseDate: '12.06.2025', age: 35, experience: 10, status: 'active', address: 'Kadıköy, İstanbul', email: 'ahmet.yilmaz@example.com', emergencyContact: 'Ayşe Yılmaz - 0533 765 4321', bloodType: 'A Rh+', vehicleAssigned: '34 ABC 123', joinDate: '10.03.2020', lastMedicalCheck: '15.01.2023' },
      { id: 2, name: 'Mehmet Demir', phone: '0533 456 7890', licenseType: 'C', licenseDate: '05.11.2024', age: 42, experience: 15, status: 'inactive', address: 'Beylikdüzü, İstanbul', email: 'mehmet.demir@example.com', emergencyContact: 'Fatma Demir - 0532 987 6543', bloodType: '0 Rh-', vehicleAssigned: '', joinDate: '22.05.2018', lastMedicalCheck: '05.02.2023' },
      { id: 3, name: 'Ayşe Kara', phone: '0536 789 0123', licenseType: 'E', licenseDate: '30.08.2026', age: 29, experience: 5, status: 'active', address: 'Çankaya, Ankara', email: 'ayse.kara@example.com', emergencyContact: 'Mustafa Kara - 0535 432 1098', bloodType: 'B Rh+', vehicleAssigned: '06 XYZ 456', joinDate: '15.01.2021', lastMedicalCheck: '20.03.2023' },
      { id: 4, name: 'Mustafa Aydın', phone: '0538 234 5678', licenseType: 'E', licenseDate: '18.04.2023', age: 38, experience: 12, status: 'vacation', address: 'Konak, İzmir', email: 'mustafa.aydin@example.com', emergencyContact: 'Zeynep Aydın - 0539 876 5432', bloodType: 'AB Rh+', vehicleAssigned: '35 DEF 789', joinDate: '03.06.2019', lastMedicalCheck: '10.12.2022' },
      { id: 5, name: 'Zeynep Yıldız', phone: '0535 876 5432', licenseType: 'B', licenseDate: '22.10.2025', age: 31, experience: 7, status: 'active', address: 'Muratpaşa, Antalya', email: 'zeynep.yildiz@example.com', emergencyContact: 'Ali Yıldız - 0531 234 5678', bloodType: 'A Rh-', vehicleAssigned: '07 KLM 321', joinDate: '08.09.2020', lastMedicalCheck: '25.02.2023' },
    ];
    
    setDrivers(driverData);
    setFilteredDrivers(driverData);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Arama fonksiyonu
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    const filtered = drivers.filter(driver => 
      driver.name.toLowerCase().includes(term.toLowerCase()) ||
      driver.phone.toLowerCase().includes(term.toLowerCase()) ||
      driver.licenseType.toLowerCase().includes(term.toLowerCase())
    );
    
    setFilteredDrivers(filtered);
  };

  // Sürücü detay modalını aç
  const openDriverDetails = (driver) => {
    setSelectedDriver(driver);
    setShowDriverModal(true);
  };

  // Sürücü durumuna göre renk döndüren fonksiyon
  const getStatusColor = (status) => {
    switch(status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'vacation':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Durumu Türkçeye çeviren fonksiyon
  const getStatusText = (status) => {
    switch(status) {
      case 'active':
        return 'Aktif';
      case 'inactive':
        return 'Pasif';
      case 'vacation':
        return 'İzinde';
      default:
        return status;
    }
  };

  return (
    <PortalLayout title="Sürücüler">
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaUser className="mr-2 text-blue-500" /> Sürücü Yönetimi
          </h2>
          
          <div className="mt-4 sm:mt-0 w-full sm:w-auto flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="İsim, telefon veya ehliyet tipi ara..."
              />
            </div>
            
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <FaPlus className="mr-2" /> Sürücü Ekle
            </button>
          </div>
        </div>
        
        {/* Mobil Kart Görünümü */}
        <div className="block md:hidden">
          {filteredDrivers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Sürücü bulunamadı</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDrivers.map((driver) => (
                <div key={driver.id} className="bg-white border rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-gray-900">{driver.name}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(driver.status)}`}>
                      {getStatusText(driver.status)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm flex items-center">
                      <FaPhone className="text-gray-400 mr-2" />
                      {driver.phone}
                    </p>
                    <p className="text-sm flex items-center">
                      <FaIdCard className="text-gray-400 mr-2" />
                      Ehliyet: {driver.licenseType} (Bitiş: {driver.licenseDate})
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Deneyim:</span> {driver.experience} yıl
                    </p>
                    {driver.vehicleAssigned && (
                      <p className="text-sm">
                        <span className="font-medium">Araç:</span> {driver.vehicleAssigned}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => openDriverDetails(driver)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                    >
                      <FaEye />
                    </button>
                    <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full">
                      <FaEdit />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Masaüstü Tablo Görünümü */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sürücü
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İletişim
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ehliyet
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deneyim
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Araç
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Sürücü bulunamadı
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FaUser className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                          <div className="text-sm text-gray-500">{driver.age} yaş</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{driver.phone}</div>
                      <div className="text-sm text-gray-500">{driver.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Sınıf {driver.licenseType}</div>
                      <div className="text-sm text-gray-500">Bitiş: {driver.licenseDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.experience} yıl
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(driver.status)}`}>
                        {getStatusText(driver.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {driver.vehicleAssigned || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => openDriverDetails(driver)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Detaylar"
                        >
                          <FaEye className="h-5 w-5" />
                        </button>
                        <button 
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Düzenle"
                        >
                          <FaEdit className="h-5 w-5" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900"
                          title="Sil"
                        >
                          <FaTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sürücü Detay Modalı */}
      {showDriverModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Sürücü Bilgileri
                </h3>
                <button
                  onClick={() => setShowDriverModal(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-semibold">{selectedDriver.name}</h4>
                  <p className="text-gray-600">{selectedDriver.phone}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(selectedDriver.status)}`}>
                    {getStatusText(selectedDriver.status)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-700 mb-2">Kişisel Bilgiler</h4>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Yaş:</span> {selectedDriver.age}</p>
                    <p className="text-sm"><span className="font-medium">Adres:</span> {selectedDriver.address}</p>
                    <p className="text-sm"><span className="font-medium">E-posta:</span> {selectedDriver.email}</p>
                    <p className="text-sm"><span className="font-medium">Kan Grubu:</span> {selectedDriver.bloodType || "Belirtilmemiş"}</p>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-2">Ehliyet Bilgileri</h4>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Ehliyet No:</span> {selectedDriver.licenseNumber}</p>
                    <p className="text-sm"><span className="font-medium">Ehliyet Sınıfı:</span> {selectedDriver.licenseClass}</p>
                    <p className="text-sm"><span className="font-medium">Bitiş Tarihi:</span> {selectedDriver.licenseExpiry}</p>
                    <p className="text-sm">
                      <span className="font-medium">SRC Belgesi:</span> 
                      {selectedDriver.hasSRCLicense ? 
                        <span className="ml-1 text-green-600">Var</span> : 
                        <span className="ml-1 text-red-600">Yok</span>
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-gray-700 mb-2">Deneyim Bilgileri</h4>
                <div className="space-y-2">
                  <p className="text-sm"><span className="font-medium">Deneyim:</span> {selectedDriver.experience} yıl</p>
                  <p className="text-sm"><span className="font-medium">Sürdüğü Araç:</span> {selectedDriver.currentVehicle || "Atanmamış"}</p>
                  <p className="text-sm"><span className="font-medium">Toplam Yolculuk:</span> {selectedDriver.totalTrips || "0"} sefer</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDriverModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                >
                  Kapat
                </button>
                <button
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700 focus:outline-none"
                >
                  Düzenle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
} 