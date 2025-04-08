import React, { useState, useEffect } from 'react';
import PortalLayout from '../../components/portal/Layout';
import { FaTruck, FaSearch, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { FiTruck, FiCalendar, FiClock, FiInfo, FiAlertCircle, FiCheckCircle, FiMapPin, FiUser, FiX, FiFileText, FiActivity, FiSettings } from 'react-icons/fi';

export default function Vehicles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  // Örnek araç verileri
  useEffect(() => {
    // API bağlantısı olmadığı için örnek veri kullanıyoruz
    setTimeout(() => {
      setVehicles([
        {
          id: 1,
          plate: "34 ABC 123",
          make: "Mercedes",
          model: "Actros",
          year: 2020,
          type: "Tır",
          status: "active",
          maintenance: "Güncel",
          driver: "Ahmet Yılmaz",
          location: "İstanbul, Türkiye",
          lastService: "15.03.2023",
          nextService: "15.09.2023",
          fuel: 85,
          mileage: 125000,
          chassisNumber: "WDB9634031L964539",
          engineNumber: "OM471LA",
          capacity: "40 ton",
          dimensions: "13.6m x 2.5m x 4m",
          documents: {
            insurance: {
              number: "INS-123456",
              valid: true,
              expiryDate: "25.05.2024",
            },
            technicalInspection: {
              number: "TECH-78952",
              valid: true,
              expiryDate: "10.11.2023",
            },
            permitLicense: {
              number: "PL-458712",
              valid: true,
              expiryDate: "31.12.2023",
            },
          },
        },
        {
          id: 2,
          plate: "06 DEF 456",
          make: "Volvo",
          model: "FH16",
          year: 2019,
          type: "Tır",
          status: "maintenance",
          maintenance: "Bakım Gerekli",
          driver: "Mehmet Kaya",
          location: "Ankara, Türkiye",
          lastService: "10.01.2023",
          nextService: "10.07.2023",
          fuel: 45,
          mileage: 210000,
          chassisNumber: "YV2RT40A8KB411231",
          engineNumber: "D16K650",
          capacity: "38 ton",
          dimensions: "13.6m x 2.5m x 4m",
          documents: {
            insurance: {
              number: "INS-789123",
              valid: true,
              expiryDate: "12.09.2023",
            },
            technicalInspection: {
              number: "TECH-12587",
              valid: false,
              expiryDate: "05.06.2023",
            },
            permitLicense: {
              number: "PL-785412",
              valid: true,
              expiryDate: "01.04.2024",
            },
          },
        },
        {
          id: 3,
          plate: "35 GHI 789",
          make: "Scania",
          model: "R500",
          year: 2021,
          type: "Tır",
          status: "inactive",
          maintenance: "Güncel",
          driver: "Unassigned",
          location: "İzmir, Türkiye",
          lastService: "20.05.2023",
          nextService: "20.11.2023",
          fuel: 30,
          mileage: 75000,
          chassisNumber: "XLER4X20005246892",
          engineNumber: "DC16 108",
          capacity: "42 ton",
          dimensions: "13.6m x 2.5m x 4m",
          documents: {
            insurance: {
              number: "INS-456123",
              valid: true,
              expiryDate: "18.08.2023",
            },
            technicalInspection: {
              number: "TECH-23654",
              valid: true,
              expiryDate: "30.09.2023",
            },
            permitLicense: {
              number: "PL-125478",
              valid: true,
              expiryDate: "15.10.2023",
            },
          },
        },
        {
          id: 4,
          plate: "07 JKL 101",
          make: "Renault",
          model: "T High",
          year: 2020,
          type: "Tır",
          status: "active",
          maintenance: "Bakım Gerekli",
          driver: "Ali Demir",
          location: "Antalya, Türkiye",
          lastService: "05.02.2023",
          nextService: "05.08.2023",
          fuel: 65,
          mileage: 150000,
          chassisNumber: "VF624GPA000123456",
          engineNumber: "DTI 13",
          capacity: "36 ton",
          dimensions: "13.6m x 2.5m x 4m",
          documents: {
            insurance: {
              number: "INS-987456",
              valid: true,
              expiryDate: "22.07.2023",
            },
            technicalInspection: {
              number: "TECH-78541",
              valid: true,
              expiryDate: "15.12.2023",
            },
            permitLicense: {
              number: "PL-587412",
              valid: false,
              expiryDate: "01.06.2023",
            },
          },
        },
        {
          id: 5,
          plate: "16 MNO 789",
          make: "Ford",
          model: "F-MAX",
          year: 2022,
          type: "Tır",
          status: "active",
          maintenance: "Güncel",
          driver: "Ayşe Yıldız",
          location: "Bursa, Türkiye",
          lastService: "10.04.2023",
          nextService: "10.10.2023",
          fuel: 90,
          mileage: 50000,
          chassisNumber: "WFOCXXGBVCLU52314",
          engineNumber: "Ecotorq",
          capacity: "40 ton",
          dimensions: "13.6m x 2.5m x 4m",
          documents: {
            insurance: {
              number: "INS-654789",
              valid: true,
              expiryDate: "30.11.2023",
            },
            technicalInspection: {
              number: "TECH-45678",
              valid: true,
              expiryDate: "25.10.2023",
            },
            permitLicense: {
              number: "PL-987654",
              valid: true,
              expiryDate: "15.07.2024",
            },
          },
        },
      ]);
      setFilteredVehicles(vehicles);
      setLoading(false);
    }, 1000);

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
    
    const filtered = vehicles.filter(vehicle => 
      vehicle.plate.toLowerCase().includes(term.toLowerCase()) ||
      vehicle.driver.toLowerCase().includes(term.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(term.toLowerCase())
    );
    
    setFilteredVehicles(filtered);
  };

  // Araç detay modelini aç
  const openVehicleDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowVehicleModal(true);
  };

  // Araç durumuna göre renk döndüren fonksiyon
  const getStatusColor = (status) => {
    switch(status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Durumu Türkçeye çeviren fonksiyon
  const getStatusText = (status) => {
    switch(status) {
      case 'active':
        return 'Aktif';
      case 'maintenance':
        return 'Bakımda';
      case 'inactive':
        return 'Pasif';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <FiCheckCircle className="mr-2 text-green-500" />;
      case "inactive":
        return <FiAlertCircle className="mr-2 text-gray-500" />;
      case "maintenance":
        return <FiSettings className="mr-2 text-yellow-500" />;
      default:
        return <FiInfo className="mr-2 text-gray-500" />;
    }
  };

  const getMaintenanceColor = (maintenance) => {
    if (maintenance === "Güncel") {
      return "text-green-600";
    } else if (maintenance === "Bakım Gerekli") {
      return "text-yellow-600";
    } else {
      return "text-red-600";
    }
  };

  const getDocumentStatusColor = (valid) => {
    return valid ? "text-green-600" : "text-red-600";
  };

  const getDocumentStatusText = (valid) => {
    return valid ? "Geçerli" : "Süresi Dolmuş";
  };

  const getDocumentStatusIcon = (valid) => {
    return valid ? (
      <FiCheckCircle className="text-green-600" />
    ) : (
      <FiAlertTriangle className="text-red-600" />
    );
  };

  return (
    <PortalLayout title="Araçlar">
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaTruck className="mr-2 text-blue-500" /> Araç Yönetimi
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
                placeholder="Plaka, sürücü veya tip ara..."
              />
            </div>
            
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <FaPlus className="mr-2" /> Araç Ekle
            </button>
          </div>
        </div>
        
        {/* Mobil Kart Görünümü */}
        <div className="block md:hidden">
          {filteredVehicles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Araç bulunamadı</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-white border rounded-lg shadow-sm p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-gray-900">{vehicle.plate}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                      {getStatusText(vehicle.status)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm"><span className="font-medium">Sürücü:</span> {vehicle.driver}</p>
                    <p className="text-sm"><span className="font-medium">Tip:</span> {vehicle.type}</p>
                    <p className="text-sm"><span className="font-medium">Kapasite:</span> {vehicle.capacity}</p>
                    <p className="text-sm"><span className="font-medium">Marka/Model:</span> {vehicle.make} {vehicle.model} ({vehicle.year})</p>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button 
                      onClick={() => openVehicleDetails(vehicle)}
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
                  Plaka
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sürücü
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tip
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kapasite
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marka/Model
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    Araç bulunamadı
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {vehicle.plate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {vehicle.driver === "Unassigned" ? "Atanmamış" : vehicle.driver}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {vehicle.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {vehicle.capacity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                        {getStatusText(vehicle.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {vehicle.make} {vehicle.model} ({vehicle.year})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => openVehicleDetails(vehicle)}
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

      {/* Araç Detay Modalı */}
      {showVehicleModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  Araç Detayları: {selectedVehicle.plate}
                </h3>
                <button
                  onClick={() => setShowVehicleModal(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  <FiX className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-700 mb-2">Araç Bilgileri</h4>
                  <div className="space-y-2">
                    <p className="text-sm"><span className="font-medium">Plaka:</span> {selectedVehicle.plate}</p>
                    <p className="text-sm"><span className="font-medium">Marka:</span> {selectedVehicle.make}</p>
                    <p className="text-sm"><span className="font-medium">Model:</span> {selectedVehicle.model}</p>
                    <p className="text-sm"><span className="font-medium">Yıl:</span> {selectedVehicle.year}</p>
                    <p className="text-sm"><span className="font-medium">Tip:</span> {selectedVehicle.type}</p>
                    <p className="text-sm"><span className="font-medium">Kapasite:</span> {selectedVehicle.capacity}</p>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-2">Durum Bilgileri</h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Durum:</span> 
                      <span className={`ml-1 px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(selectedVehicle.status)}`}>
                        {getStatusText(selectedVehicle.status)}
                      </span>
                    </p>
                    <p className="text-sm"><span className="font-medium">Sürücü:</span> {selectedVehicle.driver === "Unassigned" ? "Atanmamış" : selectedVehicle.driver}</p>
                    <p className="text-sm"><span className="font-medium">Ruhsat Bitiş:</span> {selectedVehicle.documents.permitLicense.expiryDate}</p>
                    <p className="text-sm"><span className="font-medium">Son Bakım:</span> {selectedVehicle.lastService}</p>
                    <p className="text-sm"><span className="font-medium">Gelecek Bakım:</span> {selectedVehicle.nextService}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-gray-700 mb-2">Teknik Bilgiler</h4>
                <div className="space-y-2">
                  <p className="text-sm"><span className="font-medium">Yakıt Tüketimi:</span> {selectedVehicle.fuel}%</p>
                  <p className="text-sm"><span className="font-medium">Diğer Özellikler:</span> Klima, GPS, Radyo</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowVehicleModal(false)}
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