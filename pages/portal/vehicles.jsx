import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PortalLayout from '../../components/portal/Layout';
import { FaTruck, FaSearch, FaPlus, FaFilter, FaCar, FaTachometerAlt, FaGasPump, FaTools, FaCalendarAlt, FaUser, FaMapMarkerAlt, FaCheckCircle, FaExclamationCircle, FaTimes, FaEdit, FaTrash, FaFile, FaDownload, FaMotorcycle } from 'react-icons/fa';
import axios from 'axios';

export default function Vehicles() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sortField, setSortField] = useState('plate');
  const [sortDirection, setSortDirection] = useState('asc');

  const [vehicleForm, setVehicleForm] = useState({
    plate: '',
    type: 'truck',
    brand: '',
    model: '',
    year: '',
    capacity: '',
    driver: '',
    status: 'active',
    lastMaintenance: '',
    nextMaintenance: '',
    documents: []
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
    // Kullanıcı kontrolü ve araç verilerini getir
    const fetchData = async () => {
      try {
        // Kullanıcı bilgilerini kontrol et
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/portal/login');
          return;
        }

        // Kullanıcı profili
        const userResponse = await axios.get('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (userResponse.data.success) {
          setUser(userResponse.data.user);
        } else {
          throw new Error('Kullanıcı bilgileri alınamadı');
        }

        // Araç verileri
        const vehiclesResponse = await axios.get('/api/vehicles', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (vehiclesResponse.data.success) {
          setVehicles(vehiclesResponse.data.vehicles);
          setFilteredVehicles(vehiclesResponse.data.vehicles);
        } else {
          throw new Error('Araç verileri alınamadı');
        }

        setLoading(false);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
        setError('Veriler yüklenirken bir hata oluştu');
        
        // Test verileri ile devam et
        useMockData();
        setLoading(false);
      }
    };

    // Test verileriyle doldur
    const useMockData = () => {
      const mockVehicles = [
        {
          id: 'V001',
          plate: '34 ABC 123',
          type: 'truck',
          brand: 'Mercedes',
          model: 'Actros',
          year: '2021',
          capacity: '24 ton',
          driver: 'Ahmet Yılmaz',
          status: 'active',
          lastMaintenance: '2024-01-15',
          nextMaintenance: '2024-04-15',
          location: { lat: 41.0082, lng: 28.9784 },
          documents: [
            { id: 1, name: 'Ruhsat', status: 'valid', expiryDate: '2025-05-20' },
            { id: 2, name: 'Sigorta', status: 'valid', expiryDate: '2024-08-10' },
            { id: 3, name: 'Muayene', status: 'valid', expiryDate: '2024-10-15' }
          ]
        },
        {
          id: 'V002',
          plate: '34 DEF 456',
          type: 'van',
          brand: 'Ford',
          model: 'Transit',
          year: '2022',
          capacity: '1.5 ton',
          driver: 'Mehmet Demir',
          status: 'active',
          lastMaintenance: '2023-12-20',
          nextMaintenance: '2024-03-20',
          location: { lat: 40.9909, lng: 29.0307 },
          documents: [
            { id: 1, name: 'Ruhsat', status: 'valid', expiryDate: '2026-02-10' },
            { id: 2, name: 'Sigorta', status: 'expiring', expiryDate: '2024-04-05' },
            { id: 3, name: 'Muayene', status: 'valid', expiryDate: '2024-11-25' }
          ]
        },
        {
          id: 'V003',
          plate: '34 GHI 789',
          type: 'motorcycle',
          brand: 'Honda',
          model: 'PCX',
          year: '2023',
          capacity: '20 kg',
          driver: 'Ali Kaya',
          status: 'active',
          lastMaintenance: '2024-02-05',
          nextMaintenance: '2024-05-05',
          location: { lat: 41.0422, lng: 29.0083 },
          documents: [
            { id: 1, name: 'Ruhsat', status: 'valid', expiryDate: '2026-08-15' },
            { id: 2, name: 'Sigorta', status: 'valid', expiryDate: '2024-09-20' },
            { id: 3, name: 'Muayene', status: 'valid', expiryDate: '2025-02-10' }
          ]
        },
        {
          id: 'V004',
          plate: '34 JKL 012',
          type: 'truck',
          brand: 'Volvo',
          model: 'FH16',
          year: '2020',
          capacity: '26 ton',
          driver: 'Hakan Şahin',
          status: 'maintenance',
          lastMaintenance: '2024-03-01',
          nextMaintenance: '2024-06-01',
          location: null,
          documents: [
            { id: 1, name: 'Ruhsat', status: 'valid', expiryDate: '2025-04-10' },
            { id: 2, name: 'Sigorta', status: 'valid', expiryDate: '2024-07-15' },
            { id: 3, name: 'Muayene', status: 'expired', expiryDate: '2024-03-01' }
          ]
        },
        {
          id: 'V005',
          plate: '34 MNO 345',
          type: 'van',
          brand: 'Volkswagen',
          model: 'Transporter',
          year: '2021',
          capacity: '1.2 ton',
          driver: 'Serkan Yıldız',
          status: 'inactive',
          lastMaintenance: '2023-11-15',
          nextMaintenance: '2024-02-15',
          location: null,
          documents: [
            { id: 1, name: 'Ruhsat', status: 'valid', expiryDate: '2025-09-20' },
            { id: 2, name: 'Sigorta', status: 'expired', expiryDate: '2024-02-05' },
            { id: 3, name: 'Muayene', status: 'valid', expiryDate: '2024-12-10' }
          ]
        }
      ];
      
      setVehicles(mockVehicles);
      setFilteredVehicles(mockVehicles);
    };

    fetchData();
  }, [router]);

  // Araç verilerini getir
  const reloadVehicles = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/portal/login');
        return;
      }
      
      const response = await axios.get('/api/vehicles', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setVehicles(response.data.vehicles);
        filterVehicles(response.data.vehicles, searchTerm, statusFilter, typeFilter);
      } else {
        setError('Araç verileri alınamadı');
      }
    } catch (error) {
      console.error('Araç verilerini getirme hatası:', error);
      setError('Araç verileri alınamadı');
    } finally {
      setLoading(false);
    }
  };

  // Araç ekle
  const addVehicle = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/portal/login');
        return;
      }
      
      const response = await axios.post('/api/vehicles', vehicleForm, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setSuccess('Araç başarıyla eklendi');
        setShowModal(false);
        reloadVehicles();
        
        // Form verilerini temizle
        setVehicleForm({
          plate: '',
          type: 'truck',
          brand: '',
          model: '',
          year: '',
          capacity: '',
          driver: '',
          status: 'active',
          lastMaintenance: '',
          nextMaintenance: '',
          documents: []
        });
        
        // Başarı mesajını 3 saniye sonra kaldır
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError(response.data.message || 'Araç eklenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Araç ekleme hatası:', error);
      setError('Araç eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Araç güncelle
  const updateVehicle = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/portal/login');
        return;
      }
      
      const response = await axios.put(`/api/vehicles/${selectedVehicle.id}`, vehicleForm, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setSuccess('Araç başarıyla güncellendi');
        setShowModal(false);
        reloadVehicles();
        
        // Form verilerini temizle
        setVehicleForm({
          plate: '',
          type: 'truck',
          brand: '',
          model: '',
          year: '',
          capacity: '',
          driver: '',
          status: 'active',
          lastMaintenance: '',
          nextMaintenance: '',
          documents: []
        });
        
        // Başarı mesajını 3 saniye sonra kaldır
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError(response.data.message || 'Araç güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Araç güncelleme hatası:', error);
      setError('Araç güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Araç sil
  const deleteVehicle = async (vehicleId) => {
    if (!window.confirm('Bu aracı silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/portal/login');
        return;
      }
      
      const response = await axios.delete(`/api/vehicles/${vehicleId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setSuccess('Araç başarıyla silindi');
        reloadVehicles();
        
        // Başarı mesajını 3 saniye sonra kaldır
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError(response.data.message || 'Araç silinirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Araç silme hatası:', error);
      setError('Araç silinirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Filtreleme
  const filterVehicles = (vehicleList, searchText, status, type) => {
    let filtered = vehicleList;
    
    // Arama filtresi
    if (searchText) {
      filtered = filtered.filter(vehicle => 
        vehicle.plate.toLowerCase().includes(searchText.toLowerCase()) ||
        vehicle.brand.toLowerCase().includes(searchText.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchText.toLowerCase()) ||
        vehicle.driver.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // Durum filtresi
    if (status !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === status);
    }
    
    // Tip filtresi
    if (type !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.type === type);
    }
    
    // Sıralama
    filtered = filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'plate') {
        comparison = a.plate.localeCompare(b.plate);
      } else if (sortField === 'brand') {
        comparison = a.brand.localeCompare(b.brand);
      } else if (sortField === 'driver') {
        comparison = a.driver.localeCompare(b.driver);
      } else if (sortField === 'year') {
        comparison = parseInt(a.year) - parseInt(b.year);
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    setFilteredVehicles(filtered);
  };

  // Arama işlemi
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    filterVehicles(vehicles, value, statusFilter, typeFilter);
  };
  
  // Durum filtresi değiştirme
  const handleStatusFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    filterVehicles(vehicles, searchTerm, value, typeFilter);
  };
  
  // Tip filtresi değiştirme
  const handleTypeFilterChange = (e) => {
    const value = e.target.value;
    setTypeFilter(value);
    filterVehicles(vehicles, searchTerm, statusFilter, value);
  };
  
  // Sıralama değiştirme
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    
    filterVehicles(vehicles, searchTerm, statusFilter, typeFilter);
  };

  // Form girişleri değiştirme
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVehicleForm({
      ...vehicleForm,
      [name]: value
    });
  };

  // Modal açma (Ekleme veya Düzenleme)
  const openModal = (mode, vehicle = null) => {
    setModalMode(mode);
    
    if (mode === 'edit' && vehicle) {
      setSelectedVehicle(vehicle);
      setVehicleForm({
        plate: vehicle.plate,
        type: vehicle.type,
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year,
        capacity: vehicle.capacity,
        driver: vehicle.driver,
        status: vehicle.status,
        lastMaintenance: vehicle.lastMaintenance,
        nextMaintenance: vehicle.nextMaintenance,
        documents: vehicle.documents || []
      });
    } else {
      setSelectedVehicle(null);
      setVehicleForm({
        plate: '',
        type: 'truck',
        brand: '',
        model: '',
        year: '',
        capacity: '',
        driver: '',
        status: 'active',
        lastMaintenance: '',
        nextMaintenance: '',
        documents: []
      });
    }
    
    setShowModal(true);
  };

  // Modal kapatma
  const closeModal = () => {
    setShowModal(false);
    setSelectedVehicle(null);
    setVehicleForm({
      plate: '',
      type: 'truck',
      brand: '',
      model: '',
      year: '',
      capacity: '',
      driver: '',
      status: 'active',
      lastMaintenance: '',
      nextMaintenance: '',
      documents: []
    });
  };

  // Form gönderme
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (modalMode === 'add') {
      addVehicle();
    } else {
      updateVehicle();
    }
  };

  // Araç tipi ikonu
  const getVehicleIcon = (type) => {
    switch (type) {
      case 'truck':
        return <FaTruck className="h-5 w-5 text-blue-600" />;
      case 'van':
        return <FaCar className="h-5 w-5 text-green-600" />;
      case 'motorcycle':
        return <FaMotorcycle className="h-5 w-5 text-purple-600" />;
      default:
        return <FaTruck className="h-5 w-5 text-gray-600" />;
    }
  };

  // Araç durumu etiketi
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Aktif</span>;
      case 'maintenance':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Bakımda</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Pasif</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Bilinmiyor</span>;
    }
  };

  // Araç türü adı
  const getVehicleTypeName = (type) => {
    switch (type) {
      case 'truck':
        return 'Kamyon';
      case 'van':
        return 'Kamyonet/Van';
      case 'motorcycle':
        return 'Motosiklet';
      default:
        return 'Diğer';
    }
  };

  // Yükleme durumu
  if (loading) {
    return (
      <PortalLayout title="Araçlar">
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </PortalLayout>
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
                onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
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
            <div className="flex-1">
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={handleTypeFilterChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
                >
                  <option value="all">Tüm Araçlar</option>
                  <option value="truck">Kamyon</option>
                  <option value="van">Kamyonet/Van</option>
                  <option value="motorcycle">Motosiklet</option>
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
                onClick={() => openModal('add')}
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
                    onClick={() => openModal('edit', vehicle)}
                    className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                  >
                    Düzenle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Yeni Araç Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">{modalMode === 'add' ? 'Yeni Araç Ekle' : 'Araç Düzenle'}</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Plaka</label>
                  <input
                    type="text"
                    value={vehicleForm.plate}
                    onChange={handleInputChange}
                    name="plate"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Marka</label>
                  <input
                    type="text"
                    value={vehicleForm.brand}
                    onChange={handleInputChange}
                    name="brand"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Model</label>
                  <input
                    type="text"
                    value={vehicleForm.model}
                    onChange={handleInputChange}
                    name="model"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Yıl</label>
                  <input
                    type="number"
                    value={vehicleForm.year}
                    onChange={handleInputChange}
                    name="year"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Araç Tipi</label>
                  <select
                    value={vehicleForm.type}
                    onChange={handleInputChange}
                    name="type"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    required
                  >
                    <option value="">Seçiniz</option>
                    <option value="truck">Kamyon</option>
                    <option value="van">Kamyonet/Van</option>
                    <option value="motorcycle">Motosiklet</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Kasa Tipi</label>
                  <select
                    value={vehicleForm.bodyType}
                    onChange={handleInputChange}
                    name="bodyType"
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
                    value={vehicleForm.fuelType}
                    onChange={handleInputChange}
                    name="fuelType"
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
                    value={vehicleForm.capacity}
                    onChange={handleInputChange}
                    name="capacity"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    placeholder="Örn: 20 ton"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  {modalMode === 'add' ? 'Ekle' : 'Güncelle'}
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