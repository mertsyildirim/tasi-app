import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PortalLayout from '../../components/portal/Layout';
import { FaTruck, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaSearch, FaFilter, FaPlus, FaEye, FaTimes, FaChartLine, FaUsers, FaTachometerAlt, FaStar, FaIdCard, FaCar, FaRoute, FaCamera, FaFileUpload, FaArrowLeft, FaArrowRight, FaInfoCircle, FaCalendar, FaExclamationTriangle } from 'react-icons/fa';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

export default function Drivers() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    licenseType: 'all',
    rating: 'all'
  });
  const [newDriver, setNewDriver] = useState({
    // Kişisel Bilgiler
    name: '',
    phone: '',
    email: '',
    tcNo: '',
    birthDate: '',
    
    // Ehliyet Bilgileri
    license: [],
    licenseNo: '',
    licenseExpiryDate: '',
    
    // SRC Belgesi Bilgileri
    srcClass: [],
    srcNo: '',
    srcExpiryDate: '',
    
    // Diğer Bilgiler
    status: 'active',
    notes: '',
    
    // Görüntüler
    profileImage: null,
    licenseImage: null,
    vehicleImage: null,
    insuranceImage: null
  });
  const [showLicenseExample, setShowLicenseExample] = useState(false);
  const [showVehicleConfirmation, setShowVehicleConfirmation] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [pendingVehicle, setPendingVehicle] = useState(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [documentExpiryDates, setDocumentExpiryDates] = useState({
    licenseFont: '',
    licenseBack: '',
    src: '',
    sgk: ''
  });

  useEffect(() => {
    // Kullanıcı kontrolü
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/portal/login');
      return;
    }
    setLoading(false);
  }, [router]);

  // Örnek sürücü verileri
  const [drivers] = useState([
    {
      id: 'DRV001',
      name: 'Ahmet Yılmaz',
      phone: '0532 555 1234',
      email: 'ahmet@example.com',
      vehicle: '34 ABC 123 - Mercedes-Benz Actros',
      license: 'B Sınıfı',
      status: 'active',
      totalDeliveries: 128,
      rating: 4.7,
      location: { lat: 41.0082, lng: 28.9784 }
    },
    {
      id: 'DRV002',
      name: 'Mehmet Demir',
      phone: '0533 444 5678',
      email: 'mehmet@example.com',
      vehicle: '06 XYZ 789 - Volvo FH16',
      license: 'B Sınıfı',
      status: 'active',
      totalDeliveries: 95,
      rating: 4.5,
      location: { lat: 39.9334, lng: 32.8597 }
    },
    {
      id: 'DRV003',
      name: 'Ayşe Kaya',
      phone: '0535 333 9012',
      email: 'ayse@example.com',
      vehicle: '35 DEF 456 - Scania R450',
      license: 'B Sınıfı',
      status: 'inactive',
      totalDeliveries: 67,
      rating: 4.3,
      location: { lat: 38.4237, lng: 27.1428 }
    }
  ]);

  const [vehicles] = useState([
    {
      id: 'VEH001',
      plate: '34 ABC 123',
      model: 'Mercedes-Benz Actros',
      status: 'available',
      currentDriver: null
    },
    {
      id: 'VEH002',
      plate: '06 XYZ 789',
      model: 'Volvo FH16',
      status: 'assigned',
      currentDriver: {
        id: 'DRV002',
        name: 'Mehmet Demir'
      }
    },
    {
      id: 'VEH003',
      plate: '35 DEF 456',
      model: 'Scania R450',
      status: 'available',
      currentDriver: null
    }
  ]);

  // Filtreleme işlemi
  const filteredDrivers = drivers.filter(driver => {
    // Arama filtresi
    const searchFilter = 
      searchTerm === '' ? true :
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.includes(searchTerm) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.vehicle.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Durum filtresi
    const statusFilter = 
      filters.status === 'all' ? true :
      filters.status === 'active' ? driver.status === 'active' :
      filters.status === 'inactive' ? driver.status === 'inactive' :
      true;
    
    // Ehliyet sınıfı filtresi
    const licenseFilter = 
      filters.licenseType === 'all' ? true :
      driver.license.includes(filters.licenseType);
    
    // Puan filtresi
    const ratingFilter = 
      filters.rating === 'all' ? true :
      filters.rating === 'high' ? driver.rating >= 4.5 :
      filters.rating === 'medium' ? driver.rating >= 4.0 && driver.rating < 4.5 :
      driver.rating < 4.0;
    
    return searchFilter && statusFilter && licenseFilter && ratingFilter;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      licenseType: 'all',
      rating: 'all'
    });
  };

  const handleAddDriver = (e) => {
    e.preventDefault();
    if (formStep === 1) {
      setFormStep(2);
    } else {
      // Yeni sürücü ekleme işlemleri burada yapılacak
      setShowAddDriver(false);
      setFormStep(1);
      setNewDriver({
        name: '',
        phone: '',
        email: '',
        tcNo: '',
        birthDate: '',
        license: [],
        licenseNo: '',
        licenseExpiryDate: '',
        srcClass: [],
        srcNo: '',
        srcExpiryDate: '',
        status: 'active',
        notes: '',
        profileImage: null,
        licenseImage: null,
        vehicleImage: null,
        insuranceImage: null
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Telefon numarası için özel format
    if (name === 'phone') {
      // Sadece rakamları al
      const numbers = value.replace(/\D/g, '');
      
      // Maksimum 10 rakam
      const limitedNumbers = numbers.substring(0, 10);
      
      setNewDriver(prev => ({
        ...prev,
        [name]: limitedNumbers
      }));
    } else {
      setNewDriver(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    
    if (name === 'license' || name === 'srcClass') {
      setNewDriver(prev => {
        const currentValues = prev[name] || [];
        
        if (checked) {
          // Eğer seçili değilse ekle
          if (!currentValues.includes(value)) {
            return {
              ...prev,
              [name]: [...currentValues, value]
            };
          }
        } else {
          // Eğer seçili ise çıkar
          return {
            ...prev,
            [name]: currentValues.filter(item => item !== value)
          };
        }
        
        return prev;
      });
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setNewDriver(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const handlePrevStep = () => {
    setFormStep(1);
  };

  const handleVehicleSelect = (vehicle) => {
    if (!vehicle) {
      setSelectedVehicle(null);
      return;
    }
    
    if (vehicle.status === 'available') {
      setSelectedVehicle(vehicle);
      setIsEdited(true);
    } else {
      setSelectedVehicle(null); // Önce seçimi temizle
      setShowVehicleConfirmation(true);
      // Onay bekleyen aracı geçici olarak tut
      setPendingVehicle(vehicle);
    }
  };

  const handleVehicleConfirm = () => {
    setSelectedVehicle(pendingVehicle);
    setShowVehicleConfirmation(false);
    setPendingVehicle(null);
    setIsEdited(true);
  };

  const handleVehicleCancel = () => {
    setShowVehicleConfirmation(false);
    setPendingVehicle(null);
    // Dropdown'ı önceki seçime veya boş duruma döndür
    const select = document.querySelector('select[name="vehicle"]');
    if (select) {
      select.value = selectedVehicle?.id || '';
    }
  };

  const handleSaveChanges = () => {
    // Burada API çağrısı yapılacak
    setIsEdited(false);
  };

  const handleDriverClose = () => {
    setSelectedDriver(null);
    setSelectedVehicle(null);
    setShowDocuments(false);
    setIsEdited(false);
    setDocumentExpiryDates({
      licenseFont: '',
      licenseBack: '',
      src: '',
      sgk: ''
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
    <PortalLayout title="Sürücüler">
      <div className="space-y-6 p-4">
        {/* Üst Bilgi Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-orange-100 rounded-full">
                <FaUsers className="h-5 w-5 text-orange-500" />
              </div>
              <span className="text-xs text-orange-700 font-semibold bg-orange-50 px-2 py-1 rounded-full">
                Toplam
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Sürücü Sayısı</h3>
            <p className="text-2xl font-bold text-gray-800">3</p>
            <p className="mt-2 text-xs text-green-600">
              <FaChartLine className="inline mr-1" />
              <span>%10 artış</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-green-100 rounded-full">
                <FaTruck className="h-5 w-5 text-green-500" />
              </div>
              <span className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-1 rounded-full">
                Aktif
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Aktif Sürücüler</h3>
            <p className="text-2xl font-bold text-gray-800">2</p>
            <p className="mt-2 text-xs text-green-600">
              <FaChartLine className="inline mr-1" />
              <span>%67 oran</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaRoute className="h-5 w-5 text-blue-500" />
              </div>
              <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded-full">
                Ortalama
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Sevkiyat/Sürücü</h3>
            <p className="text-2xl font-bold text-gray-800">97</p>
            <p className="mt-2 text-xs text-green-600">
              <FaChartLine className="inline mr-1" />
              <span>%12 artış</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-purple-100 rounded-full">
                <FaStar className="h-5 w-5 text-purple-500" />
              </div>
              <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-2 py-1 rounded-full">
                Performans
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Ortalama Puan</h3>
            <p className="text-2xl font-bold text-gray-800">4.5</p>
            <p className="mt-2 text-xs text-green-600">
              <FaChartLine className="inline mr-1" />
              <span>%5 artış</span>
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
                placeholder="Sürücü ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowAddDriver(true)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center"
              >
                <FaPlus className="mr-2" />
                Yeni Sürücü
              </button>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
              >
                <FaFilter className="mr-2" />
                Filtrele
            </button>
          </div>
        </div>

          {/* Filtre Dropdown */}
          {showFilters && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                  <select 
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">Tümü</option>
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ehliyet Sınıfı</label>
                  <select 
                    name="licenseType"
                    value={filters.licenseType}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">Tümü</option>
                    <option value="A Sınıfı">A Sınıfı</option>
                    <option value="B Sınıfı">B Sınıfı</option>
                    <option value="C Sınıfı">C Sınıfı</option>
                    <option value="D Sınıfı">D Sınıfı</option>
                    <option value="E Sınıfı">E Sınıfı</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Puan</label>
                  <select 
                    name="rating"
                    value={filters.rating}
                    onChange={handleFilterChange}
                    className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">Tümü</option>
                    <option value="high">4.5 ve üzeri</option>
                    <option value="medium">4.0 - 4.4</option>
                    <option value="low">4.0 altı</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button 
                  onClick={resetFilters}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Sıfırla
                </button>
                <button 
                  onClick={applyFilters}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Uygula
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sürücü Listesi */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sürücü Listesi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDrivers.map(driver => (
              <div key={driver.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{driver.name}</h4>
                    <p className="text-sm text-gray-500">{driver.vehicle}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    driver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {driver.status === 'active' ? 'Aktif' : 'Pasif'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <FaPhone className="text-blue-500 mr-2" />
                    <span>{driver.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FaEnvelope className="text-blue-500 mr-2" />
                    <span>{driver.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FaIdCard className="text-blue-500 mr-2" />
                    <span>{driver.license}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex items-center">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">{driver.rating}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedDriver(driver)}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Detayları Gör
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sürücü Detay Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Sürücü Detayları</h2>
                <button onClick={handleDriverClose} className="text-gray-400 hover:text-gray-500">
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sol Kolon */}
                <div className="space-y-6">
                  {/* Kişisel Bilgiler */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Kişisel Bilgiler</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="flex items-center">
                        <FaUser className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Ad Soyad</p>
                          <p className="font-medium text-gray-900">{selectedDriver.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FaIdCard className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">TC Kimlik No</p>
                          <p className="font-medium text-gray-900">{selectedDriver.tcNo}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FaPhone className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Telefon</p>
                          <p className="font-medium text-gray-900">{selectedDriver.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FaEnvelope className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">E-posta</p>
                          <p className="font-medium text-gray-900">{selectedDriver.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ehliyet Bilgileri */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Ehliyet Bilgileri</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="flex items-center">
                        <FaIdCard className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Ehliyet Sınıfı</p>
                          <p className="font-medium text-gray-900">{selectedDriver.license}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FaIdCard className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Ehliyet No</p>
                          <p className="font-medium text-gray-900">{selectedDriver.licenseNo}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FaCalendar className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Geçerlilik Tarihi</p>
                          <p className="font-medium text-gray-900">{selectedDriver.licenseExpiryDate}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Araç Bilgileri - Yeni Konum */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Araç Bilgileri</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="flex items-center">
                        <FaCar className="h-5 w-5 text-gray-400 mr-3" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Mevcut Araç</p>
                          <select
                            name="vehicle"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm rounded-md"
                            value={selectedVehicle?.id || ''}
                            onChange={(e) => {
                              const vehicle = vehicles.find(v => v.id === e.target.value);
                              handleVehicleSelect(vehicle);
                            }}
                          >
                            <option value="">Araç Seçin</option>
                            {vehicles.map((vehicle) => (
                              <option key={vehicle.id} value={vehicle.id}>
                                {vehicle.plate} - {vehicle.model}
                                {vehicle.status === 'assigned' && vehicle.currentDriver && 
                                  ` (${vehicle.currentDriver.name} kullanımında)`}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {selectedVehicle && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Plaka</p>
                              <p className="font-medium text-gray-900">{selectedVehicle.plate}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Model</p>
                              <p className="font-medium text-gray-900">{selectedVehicle.model}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Sağ Kolon */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Performans İstatistikleri</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FaTruck className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Toplam Taşıma</p>
                            <p className="font-medium text-gray-900">{selectedDriver.totalDeliveries}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <FaStar className="h-5 w-5 text-yellow-400 mr-1" />
                          <span className="font-medium text-gray-900">{selectedDriver.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <FaTachometerAlt className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Ortalama Süre</p>
                          <p className="font-medium text-gray-900">2.5 saat</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Aktif Taşıma Bilgileri */}
                  {selectedDriver.status === 'active' && selectedDriver.currentShipment && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Aktif Taşıma Bilgileri</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Alınacak Adres</p>
                          <p className="font-medium text-gray-900">{selectedDriver.currentShipment.pickupAddress}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Teslim Adresi</p>
                          <p className="font-medium text-gray-900">{selectedDriver.currentShipment.deliveryAddress}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-2">Sürücü Konumu</p>
                          <div className="h-48 bg-gray-200 rounded-lg overflow-hidden">
                            <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                              <GoogleMap
                                mapContainerStyle={{ width: '100%', height: '100%' }}
                                center={selectedDriver.location}
                                zoom={13}
                                options={{
                                  zoomControl: true,
                                  streetViewControl: false,
                                  mapTypeControl: false,
                                  fullscreenControl: false,
                                  styles: [
                                    {
                                      featureType: 'poi',
                                      elementType: 'labels',
                                      stylers: [{ visibility: 'off' }]
                                    }
                                  ]
                                }}
                              >
                                <Marker
                                  position={selectedDriver.location}
                                  icon={{
                                    path: 'M17.402,0H5.643C2.526,0,0,2.526,0,5.643v11.759C0,20.519,2.526,23.045,5.643,23.045h11.759c3.116,0,5.643-2.526,5.643-5.643 V5.643C23.045,2.526,20.518,0,17.402,0z M21.41,17.402c0,2.212-1.796,4.008-4.008,4.008H5.643 c-2.212,0-4.008-1.796-4.008-4.008V5.643c0-2.212,1.796-4.008,4.008-4.008h11.759c2.212,0,4.008,1.796,4.008,4.008V17.402z',
                                    fillColor: '#FF6B00',
                                    fillOpacity: 1,
                                    strokeWeight: 0,
                                    rotation: 0,
                                    scale: 1,
                                    anchor: new google.maps.Point(11.5, 11.5),
                                    labelOrigin: new google.maps.Point(11.5, 11.5)
                                  }}
                                  label={{
                                    text: '🚛',
                                    fontSize: '16px',
                                    fontWeight: 'bold'
                                  }}
                                />
                                <InfoWindow position={selectedDriver.location}>
                                  <div className="p-2">
                                    <h3 className="font-medium text-gray-900">{selectedDriver.name}</h3>
                                    <p className="text-sm text-gray-500">{selectedDriver.vehicle}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      Son güncelleme: {selectedDriver.lastUpdate}
                                    </p>
                                  </div>
                                </InfoWindow>
                              </GoogleMap>
                            </LoadScript>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Alt Kısım - Belgeler Butonu ve Kaydet/Kapat */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  {/* Belgeler Butonu */}
                  <button
                    onClick={() => setShowDocuments(!showDocuments)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    <FaFileUpload className="mr-2 h-4 w-4" />
                    Belgeler
                  </button>

                  {/* Kaydet ve Kapat Butonları */}
                  <div className="flex space-x-3">
                    {isEdited && (
                      <button
                        onClick={handleSaveChanges}
                        className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        Kaydet
                      </button>
                    )}
                    <button
                      onClick={handleDriverClose}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Belgeler Listesi Modal - Yeni tasarım */}
            {showDocuments && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl w-[600px] p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Belgeler</h3>
                    <button 
                      onClick={() => setShowDocuments(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <FaTimes className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <span className="text-gray-700 font-medium">Ehliyet (Ön)</span>
                        <div className="mt-2">
                          <label className="text-sm text-gray-500">Geçerlilik Tarihi</label>
                          <input
                            type="date"
                            value={documentExpiryDates.licenseFont}
                            onChange={(e) => {
                              setDocumentExpiryDates(prev => ({...prev, licenseFont: e.target.value}));
                              setIsEdited(true);
                            }}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>
                      <button className="ml-4 px-4 py-2 text-orange-500 hover:text-orange-600 font-medium">
                        Görüntüle
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <span className="text-gray-700 font-medium">Ehliyet (Arka)</span>
                        <div className="mt-2">
                          <label className="text-sm text-gray-500">Geçerlilik Tarihi</label>
                          <input
                            type="date"
                            value={documentExpiryDates.licenseBack}
                            onChange={(e) => {
                              setDocumentExpiryDates(prev => ({...prev, licenseBack: e.target.value}));
                              setIsEdited(true);
                            }}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>
                      <button className="ml-4 px-4 py-2 text-orange-500 hover:text-orange-600 font-medium">
                        Görüntüle
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <span className="text-gray-700 font-medium">SRC Belgesi</span>
                        <div className="mt-2">
                          <label className="text-sm text-gray-500">Geçerlilik Tarihi</label>
                          <input
                            type="date"
                            value={documentExpiryDates.src}
                            onChange={(e) => {
                              setDocumentExpiryDates(prev => ({...prev, src: e.target.value}));
                              setIsEdited(true);
                            }}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>
                      <button className="ml-4 px-4 py-2 text-orange-500 hover:text-orange-600 font-medium">
                        Görüntüle
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <span className="text-gray-700 font-medium">SGK Bildirgesi</span>
                        <div className="mt-2">
                          <label className="text-sm text-gray-500">Geçerlilik Tarihi</label>
                          <input
                            type="date"
                            value={documentExpiryDates.sgk}
                            onChange={(e) => {
                              setDocumentExpiryDates(prev => ({...prev, sgk: e.target.value}));
                              setIsEdited(true);
                            }}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>
                      <button className="ml-4 px-4 py-2 text-orange-500 hover:text-orange-600 font-medium">
                        Görüntüle
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Araç Değiştirme Onay Modalı */}
            {showVehicleConfirmation && pendingVehicle && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <div className="flex items-center mb-4">
                    <FaExclamationTriangle className="text-yellow-500 h-6 w-6 mr-3" />
                    <h3 className="text-lg font-medium text-gray-900">Araç Değiştirme Onayı</h3>
                  </div>
                  <p className="text-gray-500 mb-4">
                    Bu araç şu anda {pendingVehicle.currentDriver.name} tarafından kullanılıyor. 
                    Aracı {selectedDriver.name} sürücüsüne atamak istediğinize emin misiniz?
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={handleVehicleCancel}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleVehicleConfirm}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                      Onayla
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Yeni Sürücü Ekleme Modal */}
      {showAddDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Yeni Sürücü Ekle</h3>
              <button 
                onClick={() => {
                  setShowAddDriver(false);
                  setFormStep(1);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes className="h-5 w-5" />
              </button>
        </div>

            <form onSubmit={handleAddDriver} className="p-6">
              {/* Step 1: Temel Bilgiler */}
              {formStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ad Soyad
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newDriver.name}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        TC Kimlik No
                      </label>
                      <input
                        type="text"
                        name="tcNo"
                        value={newDriver.tcNo}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefon
                      </label>
                      <div className="relative flex">
                        <div className="flex items-center justify-center bg-gray-100 text-gray-700 px-3 rounded-l-md border border-r-0 border-gray-300">
                          +90
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={newDriver.phone}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-r-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          required
                          maxLength={10}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        E-posta
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={newDriver.email}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                        placeholder="ornek@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Doğum Tarihi
                      </label>
                      <input
                        type="date"
                        name="birthDate"
                        value={newDriver.birthDate}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ehliyet Sınıfı
                      </label>
                      <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="license-A1"
                              name="license"
                              value="A1"
                              checked={newDriver.license.includes('A1')}
                              onChange={handleCheckboxChange}
                              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="license-A1" className="ml-2 block text-sm text-gray-700">
                              A1 Sınıfı
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="license-A2"
                              name="license"
                              value="A2"
                              checked={newDriver.license.includes('A2')}
                              onChange={handleCheckboxChange}
                              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="license-A2" className="ml-2 block text-sm text-gray-700">
                              A2 Sınıfı
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="license-B"
                              name="license"
                              value="B"
                              checked={newDriver.license.includes('B')}
                              onChange={handleCheckboxChange}
                              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="license-B" className="ml-2 block text-sm text-gray-700">
                              B Sınıfı
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="license-C"
                              name="license"
                              value="C"
                              checked={newDriver.license.includes('C')}
                              onChange={handleCheckboxChange}
                              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="license-C" className="ml-2 block text-sm text-gray-700">
                              C Sınıfı
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="license-D"
                              name="license"
                              value="D"
                              checked={newDriver.license.includes('D')}
                              onChange={handleCheckboxChange}
                              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="license-D" className="ml-2 block text-sm text-gray-700">
                              D Sınıfı
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="license-E"
                              name="license"
                              value="E"
                              checked={newDriver.license.includes('E')}
                              onChange={handleCheckboxChange}
                              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="license-E" className="ml-2 block text-sm text-gray-700">
                              E Sınıfı
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="license-F"
                              name="license"
                              value="F"
                              checked={newDriver.license.includes('F')}
                              onChange={handleCheckboxChange}
                              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="license-F" className="ml-2 block text-sm text-gray-700">
                              F Sınıfı
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="license-G"
                              name="license"
                              value="G"
                              checked={newDriver.license.includes('G')}
                              onChange={handleCheckboxChange}
                              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="license-G" className="ml-2 block text-sm text-gray-700">
                              G Sınıfı
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="license-H"
                              name="license"
                              value="H"
                              checked={newDriver.license.includes('H')}
                              onChange={handleCheckboxChange}
                              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="license-H" className="ml-2 block text-sm text-gray-700">
                              H Sınıfı
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="license-K"
                              name="license"
                              value="K"
                              checked={newDriver.license.includes('K')}
                              onChange={handleCheckboxChange}
                              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="license-K" className="ml-2 block text-sm text-gray-700">
                              K Sınıfı
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="license-L"
                              name="license"
                              value="L"
                              checked={newDriver.license.includes('L')}
                              onChange={handleCheckboxChange}
                              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="license-L" className="ml-2 block text-sm text-gray-700">
                              L Sınıfı
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="license-M"
                              name="license"
                              value="M"
                              checked={newDriver.license.includes('M')}
                              onChange={handleCheckboxChange}
                              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="license-M" className="ml-2 block text-sm text-gray-700">
                              M Sınıfı
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ehliyet No
                        </label>
                        <button 
                          type="button"
                          onClick={() => setShowLicenseExample(true)}
                          className="ml-2 text-orange-500 hover:text-orange-600 focus:outline-none"
                        >
                          <FaInfoCircle className="h-4 w-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        name="licenseNo"
                        value={newDriver.licenseNo}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ehliyet Geçerlilik Tarihi
                      </label>
                      <input
                        type="date"
                        name="licenseExpiryDate"
                        value={newDriver.licenseExpiryDate}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SRC Belgesi Sınıfı
                      </label>
                      <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="srcClass-SRC1"
                              name="srcClass"
                              value="SRC1"
                              checked={newDriver.srcClass.includes('SRC1')}
                              onChange={handleCheckboxChange}
                              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="srcClass-SRC1" className="ml-2 block text-sm text-gray-700">
                              SRC1
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="srcClass-SRC2"
                              name="srcClass"
                              value="SRC2"
                              checked={newDriver.srcClass.includes('SRC2')}
                              onChange={handleCheckboxChange}
                              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="srcClass-SRC2" className="ml-2 block text-sm text-gray-700">
                              SRC2
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="srcClass-SRC3"
                              name="srcClass"
                              value="SRC3"
                              checked={newDriver.srcClass.includes('SRC3')}
                              onChange={handleCheckboxChange}
                              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="srcClass-SRC3" className="ml-2 block text-sm text-gray-700">
                              SRC3
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="srcClass-SRC4"
                              name="srcClass"
                              value="SRC4"
                              checked={newDriver.srcClass.includes('SRC4')}
                              onChange={handleCheckboxChange}
                              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="srcClass-SRC4" className="ml-2 block text-sm text-gray-700">
                              SRC4
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="srcClass-SRC5"
                              name="srcClass"
                              value="SRC5"
                              checked={newDriver.srcClass.includes('SRC5')}
                              onChange={handleCheckboxChange}
                              className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label htmlFor="srcClass-SRC5" className="ml-2 block text-sm text-gray-700">
                              SRC5
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    {newDriver.srcClass.includes('SRC5') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SRC 5 Geçerlilik Tarihi
                        </label>
                        <input
                          type="date"
                          name="srcExpiryDate"
                          value={newDriver.srcExpiryDate}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          required
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notlar
                    </label>
                    <textarea
                      name="notes"
                      value={newDriver.notes}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Step 2: Görüntü Yüklemeleri */}
              {formStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ehliyet Fotoğrafı (Ön)
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <FaCamera className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="profileImage"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500"
                            >
                              <span>Dosya Yükle</span>
                              <input
                                id="profileImage"
                                name="profileImage"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">veya sürükleyip bırakın</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF max 10MB</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ehliyet Fotoğrafı (Arka)
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <FaFileUpload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="licenseImage"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500"
                            >
                              <span>Dosya Yükle</span>
                              <input
                                id="licenseImage"
                                name="licenseImage"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">veya sürükleyip bırakın</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF max 10MB</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Src Belgesi
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <FaCar className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="vehicleImage"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500"
                            >
                              <span>Dosya Yükle</span>
                              <input
                                id="vehicleImage"
                                name="vehicleImage"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">veya sürükleyip bırakın</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF max 10MB</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sgk Bildirgesi
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <FaFileUpload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="insuranceImage"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500"
                            >
                              <span>Dosya Yükle</span>
                              <input
                                id="insuranceImage"
                                name="insuranceImage"
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">veya sürükleyip bırakın</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF, PDF max 10MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-between">
                {formStep === 2 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 flex items-center"
                  >
                    <FaArrowLeft className="mr-2" />
                    Geri
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddDriver(false);
                      setFormStep(1);
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    İptal
                      </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm flex items-center"
                  >
                    {formStep === 1 ? (
                      <>
                        İleri
                        <FaArrowRight className="ml-2" />
                      </>
                    ) : (
                      'Kaydet'
                    )}
                      </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ehliyet Örnek Popup */}
      {showLicenseExample && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowLicenseExample(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
            >
              <FaTimes className="h-5 w-5" />
            </button>
            
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ehliyet No Örneği</h3>
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <img 
                  src="/images/license-example.png" 
                  alt="Ehliyet No Örneği" 
                  className="mx-auto max-w-full h-auto rounded shadow-sm"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/400x200?text=Ehliyet+No+Örneği";
                  }}
                />
              </div>
              <p className="text-sm text-gray-500">
                Ehliyet numarası, ehliyetinizin sağ alt köşesinde bulunan 11 haneli benzersiz bir numaradır.
              </p>
          </div>
        </div>
      </div>
      )}
    </PortalLayout>
  );
} 