import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PortalLayout from '../../components/portal/Layout';
import { FaTruck, FaSearch, FaPlus, FaFilter, FaCar, FaTachometerAlt, FaGasPump, FaTools, FaCalendarAlt, FaUser, FaMapMarkerAlt, FaCheckCircle, FaExclamationCircle, FaTimes, FaEdit, FaTrash, FaFile, FaDownload } from 'react-icons/fa';

export default function Vehicles() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewVehicleModal, setShowNewVehicleModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    plate: '',
    brand: '',
    model: '',
    year: '',
    type: '',
    status: 'active',
    fuelType: 'diesel',
    capacity: '',
    bodyType: '',
  });
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [showDocumentsUploadModal, setShowDocumentsUploadModal] = useState(false);
  const [showDriverChangeWarning, setShowDriverChangeWarning] = useState(false);
  const [selectedDriverForChange, setSelectedDriverForChange] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  const [drivers] = useState([
    {
      id: 'DRV001',
      name: 'Ahmet Yılmaz',
      vehicle: '34 ABC 123'
    },
    {
      id: 'DRV002',
      name: 'Mehmet Demir',
      vehicle: null
    },
    {
      id: 'DRV003',
      name: 'Ali Kaya',
      vehicle: '06 XYZ 789'
    },
    {
      id: 'DRV004',
      name: 'Ayşe Yıldız',
      vehicle: null
    }
  ]);

  const vehicleTypes = [
    'Kamyon',
    'Kamyonet',
    'Tır',
    'Minibüs',
    'Otobüs',
    'Panel Van',
    'Pickup',
    'Diğer'
  ];

  const bodyTypes = [
    'Tenteli',
    'Kapalı Kasa',
    'Açık Kasa',
    'Frigorifik',
    'Damperli',
    'Platform',
    'Diğer'
  ];

  useEffect(() => {
    // Kullanıcı kontrolü
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/portal/login');
      return;
    }
    setLoading(false);
  }, [router]);

  // Örnek araç verileri
  const [vehicles] = useState([
    {
      id: 'VEH001',
      plate: '34 ABC 123',
      brand: 'Mercedes-Benz',
      model: 'Actros',
      year: '2022',
      type: 'Kamyon',
      status: 'active',
      fuelType: 'diesel',
      capacity: '20 ton',
      bodyType: 'Kapalı Kasa',
      mileage: '45,000 km',
      fuelEfficiency: '8.5 L/100km',
      location: 'İstanbul',
      documents: ['Sigorta', 'Ruhsat', 'Bakım Raporu']
    },
    {
      id: 'VEH002',
      plate: '06 XYZ 789',
      brand: 'Volvo',
      model: 'FH16',
      year: '2021',
      type: 'Tır',
      status: 'maintenance',
      fuelType: 'diesel',
      capacity: '25 ton',
      bodyType: 'Tenteli',
      mileage: '78,000 km',
      fuelEfficiency: '9.2 L/100km',
      location: 'Ankara',
      documents: ['Sigorta', 'Ruhsat', 'Bakım Raporu']
    },
    {
      id: 'VEH003',
      plate: '35 DEF 456',
      brand: 'MAN',
      model: 'TGX',
      year: '2023',
      type: 'Kamyon',
      status: 'active',
      fuelType: 'diesel',
      capacity: '18 ton',
      bodyType: 'Frigorifik',
      mileage: '12,000 km',
      fuelEfficiency: '8.8 L/100km',
      location: 'İzmir',
      documents: ['Sigorta', 'Ruhsat', 'Bakım Raporu']
    },
    {
      id: 'VEH004',
      plate: '01 GHI 789',
      brand: 'Ford',
      model: 'Cargo',
      year: '2020',
      type: 'Kamyonet',
      status: 'inactive',
      fuelType: 'diesel',
      capacity: '15 ton',
      bodyType: 'Panel Van',
      mileage: '120,000 km',
      fuelEfficiency: '9.5 L/100km',
      location: 'Bursa',
      documents: ['Sigorta', 'Ruhsat', 'Bakım Raporu']
    }
  ]);

  const filteredVehicles = vehicles.filter(vehicle => {
    if (statusFilter !== 'all' && vehicle.status !== statusFilter) return false;
    if (searchTerm && !vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleSubmitVehicle = (e) => {
    e.preventDefault();
    // Yeni araç ekleme işlemi burada yapılacak
    setShowNewVehicleModal(false);
    setNewVehicle({
      plate: '',
      brand: '',
      model: '',
      year: '',
      type: '',
      status: 'active',
      fuelType: 'diesel',
      capacity: '',
      bodyType: '',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <PortalLayout title="Araçlar">
      <div className="space-y-6 p-4">
        {/* Üst Bilgi Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaTruck className="h-5 w-5 text-blue-500" />
              </div>
              <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded-full">
                Toplam
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Toplam Araç</h3>
            <p className="text-2xl font-bold text-gray-800">4</p>
            <p className="mt-2 text-xs text-green-600">
              <FaCheckCircle className="inline mr-1" />
              <span>%100 verimli</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-green-100 rounded-full">
                <FaCheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <span className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-1 rounded-full">
                Aktif
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Aktif Araçlar</h3>
            <p className="text-2xl font-bold text-gray-800">2</p>
            <p className="mt-2 text-xs text-green-600">
              <FaCheckCircle className="inline mr-1" />
              <span>%50 aktif oranı</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaTools className="h-5 w-5 text-yellow-500" />
              </div>
              <span className="text-xs text-yellow-700 font-semibold bg-yellow-50 px-2 py-1 rounded-full">
                Bakımda
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Bakımdaki Araçlar</h3>
            <p className="text-2xl font-bold text-gray-800">1</p>
            <p className="mt-2 text-xs text-yellow-600">
              <FaExclamationCircle className="inline mr-1" />
              <span>%25 bakım oranı</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-red-100 rounded-full">
                <FaTimes className="h-5 w-5 text-red-500" />
              </div>
              <span className="text-xs text-red-700 font-semibold bg-red-50 px-2 py-1 rounded-full">
                Pasif
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Pasif Araçlar</h3>
            <p className="text-2xl font-bold text-gray-800">1</p>
            <p className="mt-2 text-xs text-red-600">
              <FaTimes className="inline mr-1" />
              <span>%25 pasif oranı</span>
            </p>
          </div>
        </div>

        {/* Arama ve Filtreler */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
              <input
                type="text"
                placeholder="Araç ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
                >
                  <option value="all">Tüm Araçlar</option>
                  <option value="active">Aktif</option>
                  <option value="maintenance">Bakımda</option>
                  <option value="inactive">Pasif</option>
                </select>
                <FaFilter className="absolute left-3 top-3 text-gray-400" />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowNewVehicleModal(true)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center"
              >
                <FaPlus className="mr-2" />
                Yeni Araç
            </button>
            </div>
          </div>
        </div>

        {/* Araç Listesi */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Araç Listesi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map(vehicle => (
              <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{vehicle.brand} {vehicle.model}</h4>
                    <p className="text-sm text-gray-500">{vehicle.plate}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    vehicle.status === 'active' ? 'bg-green-100 text-green-800' : 
                    vehicle.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {vehicle.status === 'active' ? 'Aktif' : 
                     vehicle.status === 'maintenance' ? 'Bakımda' : 
                     'Pasif'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <FaCar className="text-blue-500 mr-2" />
                    <span>{vehicle.year} - {vehicle.type}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FaTruck className="text-blue-500 mr-2" />
                    <span>{vehicle.bodyType}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FaMapMarkerAlt className="text-blue-500 mr-2" />
                    <span>{vehicle.location}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaTachometerAlt className="mr-1" />
                    <span>{vehicle.mileage}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedVehicle(vehicle)}
                    className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                  >
                    Detayları Gör
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Yeni Araç Modal */}
      {showNewVehicleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Yeni Araç Ekle</h2>
              <button
                onClick={() => setShowNewVehicleModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitVehicle} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plaka</label>
                  <input
                    type="text"
                    value={newVehicle.plate}
                    onChange={(e) => setNewVehicle({...newVehicle, plate: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marka</label>
                  <input
                    type="text"
                    value={newVehicle.brand}
                    onChange={(e) => setNewVehicle({...newVehicle, brand: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Model</label>
                  <input
                    type="text"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Yıl</label>
                  <input
                    type="number"
                    value={newVehicle.year}
                    onChange={(e) => setNewVehicle({...newVehicle, year: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Araç Tipi</label>
                  <select
                    value={newVehicle.type}
                    onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    required
                  >
                    <option value="">Seçiniz</option>
                    {vehicleTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kasa Tipi</label>
                  <select
                    value={newVehicle.bodyType}
                    onChange={(e) => setNewVehicle({...newVehicle, bodyType: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    required
                  >
                    <option value="">Seçiniz</option>
                    {bodyTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Yakıt Tipi</label>
                  <select
                    value={newVehicle.fuelType}
                    onChange={(e) => setNewVehicle({...newVehicle, fuelType: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    required
                  >
                    <option value="diesel">Dizel</option>
                    <option value="gasoline">Benzin</option>
                    <option value="lpg">LPG</option>
                    <option value="electric">Elektrik</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kapasite</label>
                  <input
                    type="text"
                    value={newVehicle.capacity}
                    onChange={(e) => setNewVehicle({...newVehicle, capacity: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    placeholder="Örn: 20 ton"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewVehicleModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Sonraki
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sürücü Değişikliği Uyarı Modalı */}
      {showDriverChangeWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <FaExclamationCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Dikkat!</h3>
              <p className="text-gray-500 text-center mb-4">
                Bu sürücünün zaten bir aracı var. Yine de atamak istiyor musunuz?
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => {
                    setShowDriverChangeWarning(false);
                    setSelectedDriverForChange(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  İptal
                </button>
                <button
                  onClick={() => {
                    if (selectedDriverForChange) {
                      setSelectedVehicle({
                        ...selectedVehicle,
                        driver: selectedDriverForChange.id
                      });
                      setHasChanges(true);
                    }
                    setShowDriverChangeWarning(false);
                    setSelectedDriverForChange(null);
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Evet, Ata
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Araç Detay Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">{selectedVehicle.brand} {selectedVehicle.model}</h3>
              <button 
                onClick={() => {
                  setSelectedVehicle(null);
                  setHasChanges(false);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Araç Bilgileri</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <FaTruck className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Plaka</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedVehicle.plate}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <FaCar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Model</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedVehicle.year} {selectedVehicle.brand} {selectedVehicle.model}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <FaGasPump className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Yakıt Tipi</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedVehicle.fuelType === 'diesel' ? 'Dizel' : 
                           selectedVehicle.fuelType === 'gasoline' ? 'Benzin' : 
                           selectedVehicle.fuelType === 'lpg' ? 'LPG' : 
                           'Elektrik'}
                        </p>
                      </div>
                    </div>
                    
                      <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <FaTachometerAlt className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Kilometre</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedVehicle.mileage}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Araç Detayları</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <FaTruck className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Araç Tipi</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedVehicle.type}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <FaTruck className="h-5 w-5 text-blue-600" />
                        </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Kasa Tipi</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedVehicle.bodyType}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <FaTruck className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Kapasite</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedVehicle.capacity}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <FaMapMarkerAlt className="h-5 w-5 text-purple-600" />
                        </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Konum</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedVehicle.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Araç Durumu</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <FaTruck className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Durum</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedVehicle.status === 'active' ? 'Aktif' : 
                         selectedVehicle.status === 'maintenance' ? 'Bakımda' : 
                         'Pasif'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Sürücü</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <select
                    value={selectedVehicle.driver || ''}
                    onChange={(e) => {
                      const selectedDriver = e.target.value;
                      if (selectedDriver) {
                        const driver = drivers.find(d => d.id === selectedDriver);
                        if (driver && driver.vehicle) {
                          setSelectedDriverForChange(driver);
                          setShowDriverChangeWarning(true);
                        } else {
                          setSelectedVehicle({...selectedVehicle, driver: selectedDriver});
                          setHasChanges(true);
                        }
                      } else {
                        setSelectedVehicle({...selectedVehicle, driver: ''});
                        setHasChanges(true);
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Sürücü Seçin</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name} {driver.vehicle ? '(Mevcut Araç: ' + driver.vehicle + ')' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => setShowDocumentsModal(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Belgeler
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedVehicle(null);
                    setHasChanges(false);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Kapat
                </button>
                {hasChanges && (
                  <button
                    onClick={() => {
                      // Kaydetme işlemi
                      setSelectedVehicle(null);
                      setHasChanges(false);
                    }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    Kaydet
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Belgeler Modal */}
      {showDocumentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Belgeler</h3>
              <button 
                onClick={() => setShowDocumentsModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes className="h-5 w-5" />
                      </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {selectedVehicle.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FaFile className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-gray-900">{doc}</span>
                    </div>
                    <button className="text-orange-600 hover:text-orange-700">
                      <FaDownload className="h-5 w-5" />
                      </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
} 