import React, { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/Layout'
import { FaTruck, FaEdit, FaPlus, FaSearch, FaFilter, FaEye, FaFileAlt, FaTimes, FaExclamationCircle, FaIdCard, FaSpinner, FaTrash, FaCheck, FaTruckLoading } from 'react-icons/fa'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function Vehicles() {
  const router = useRouter()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showVehicleDetailModal, setShowVehicleDetailModal] = useState(null)
  const [showVehicleDocumentsModal, setShowVehicleDocumentsModal] = useState(null)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [companies, setCompanies] = useState([])
  
  // Yeni araç verisi
  const [newVehicleData, setNewVehicleData] = useState({
    plate: '',
    brand: '',
    model: '',
    year: '',
    type: '',
    capacity: '',
      status: 'active',
    companyId: '',
    driverId: '',
    lastMaintenance: '',
    nextMaintenance: ''
  })

  // ESC tuşu ile modal'ları kapatma
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        // Sadece en son açılan modal'ı kapat
        if (showVehicleDocumentsModal) {
          setShowVehicleDocumentsModal(null);
        } else if (showEditModal) {
          setShowEditModal(false);
        } else if (showAddModal) {
          setShowAddModal(false);
        } else if (showVehicleDetailModal) {
          setShowVehicleDetailModal(null);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Modal açıkken body scroll'u engelle
    if (showVehicleDetailModal || showVehicleDocumentsModal || showAddModal || showEditModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [showVehicleDetailModal, showVehicleDocumentsModal, showAddModal, showEditModal]);

  // Araçları API'den çekme
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          console.log('Token bulunamadı, login sayfasına yönlendiriliyor');
          router.replace('/admin');
          return;
        }
        
        // API'den araçları çek
        const statusParam = selectedTab === 'all' ? '' : 
                          selectedTab === 'active' ? 'active' :
                          selectedTab === 'maintenance' ? 'maintenance' :
                          selectedTab === 'documents' ? 'documents' : '';
        
        const response = await axios.get(`/api/admin/vehicles`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            status: statusParam,
            search: searchTerm
          }
        });
        
        if (response.data && response.data.vehicles) {
          setVehicles(response.data.vehicles);
        }

        // Şirketleri çek (dropdown için)
        const companiesResponse = await axios.get(`/api/admin/carriers`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (companiesResponse.data && companiesResponse.data.carriers) {
          setCompanies(companiesResponse.data.carriers);
        }

        // Sürücüleri çek (dropdown için)
        const driversResponse = await axios.get(`/api/admin/drivers`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (driversResponse.data && driversResponse.data.drivers) {
          setDrivers(driversResponse.data.drivers);
        }
      } catch (error) {
        console.error('Araçlar yüklenirken hata:', error);
        
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('userData');
          router.replace('/admin');
          return;
        }
        
        setError('Araç verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    
    if (router.isReady) {
      fetchVehicles();
    }
  }, [router.isReady, selectedTab, searchTerm]);

  const tabs = [
    { id: 'all', name: 'Tüm Araçlar' },
    { id: 'active', name: 'Aktif' },
    { id: 'maintenance', name: 'Bakımda' },
    { id: 'documents', name: 'Süresi Dolmuş Belge' },
  ]

  // Araç durumuna göre renk sınıfı
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Araç durumuna göre Türkçe metin
  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Aktif'
      case 'maintenance':
        return 'Bakımda'
      case 'inactive':
        return 'Pasif'
      default:
        return 'Bilinmiyor'
    }
  }

  // Araç silme
  const deleteVehicle = async (id) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.log('Token bulunamadı, login sayfasına yönlendiriliyor');
        router.replace('/admin');
        return;
      }
      
      const response = await axios.delete(`/api/admin/vehicles`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: { id }
      });
      
      if (response.data && response.data.success) {
        setVehicles(prevVehicles => prevVehicles.filter(vehicle => vehicle.id !== id));
        // Modal'ı kapat
        setShowVehicleDetailModal(null);
      }
    } catch (error) {
      console.error('Araç silinirken hata:', error);
      alert('Araç silinirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  // Araç durumunu değiştirme
  const toggleVehicleStatus = async (id, currentStatus) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.log('Token bulunamadı, login sayfasına yönlendiriliyor');
        router.replace('/admin');
        return;
      }
      
      // Active ve maintenance arasında geçiş yap
      const newStatus = currentStatus === 'active' ? 'maintenance' : 'active';
      
      const response = await axios.put(`/api/admin/vehicles`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: { id }
        }
      );
      
      if (response.data && response.data.success) {
    setVehicles(prevVehicles => 
      prevVehicles.map(vehicle => 
        vehicle.id === id 
              ? {...vehicle, status: newStatus} 
          : vehicle
      )
        );
        
        if (showVehicleDetailModal && showVehicleDetailModal.id === id) {
          setShowVehicleDetailModal({...showVehicleDetailModal, status: newStatus});
        }
      }
    } catch (error) {
      console.error('Araç durumu değiştirilirken hata:', error);
      alert('Araç durumu değiştirilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  // Yeni araç ekleme
  const addVehicle = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.log('Token bulunamadı, login sayfasına yönlendiriliyor');
        router.replace('/admin');
        return;
      }
      
      // API çağrısı
      const response = await axios.post('/api/admin/vehicles', newVehicleData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.success) {
        // Araç eklendi, listeyi yenile
        const updatedVehicles = await axios.get('/api/admin/vehicles', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (updatedVehicles.data && updatedVehicles.data.vehicles) {
          setVehicles(updatedVehicles.data.vehicles);
        }
        
        // Modal'ı kapat ve formu sıfırla
        setShowAddModal(false);
        setNewVehicleData({
          plate: '',
          brand: '',
          model: '',
          year: '',
          type: '',
          capacity: '',
          status: 'active',
          companyId: '',
          driverId: '',
          lastMaintenance: '',
          nextMaintenance: ''
        });
      }
    } catch (error) {
      console.error('Araç eklenirken hata:', error);
      alert('Araç eklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  // Araç güncelleme
  const updateVehicle = async (updatedVehicle) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.log('Token bulunamadı, login sayfasına yönlendiriliyor');
        router.replace('/admin');
        return;
      }
      
      // API çağrısı
      const { id, ...vehicleData } = updatedVehicle;
      
      const response = await axios.put('/api/admin/vehicles', 
        vehicleData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: { id }
        }
      );
      
      if (response.data && response.data.success) {
        // Araç güncellendi, listeyi yenile
        const updatedVehicles = await axios.get('/api/admin/vehicles', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (updatedVehicles.data && updatedVehicles.data.vehicles) {
          setVehicles(updatedVehicles.data.vehicles);
          
          // Modal'ları düzenle
          const updatedVehicleInfo = updatedVehicles.data.vehicles.find(v => v.id === id);
          if (updatedVehicleInfo) {
            setShowEditModal(false);
            setShowVehicleDetailModal(updatedVehicleInfo);
          }
        }
      }
    } catch (error) {
      console.error('Araç güncellenirken hata:', error);
      alert('Araç güncellenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout title="Araç Yönetimi">
      <div className={showVehicleDetailModal || showEditModal || showAddModal ? "blur-sm" : ""}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex space-x-2 flex-wrap">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedTab === tab.id 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } mb-2`}
              >
                {tab.name}
              </button>
            ))}
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-auto">
              <input 
                type="text" 
                placeholder="Araç ara..." 
                className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button 
              className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus className="mr-2" /> Yeni Araç
            </button>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="flex flex-row gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 flex-1">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FaTruck className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Toplam Araç</h3>
                <p className="text-2xl font-bold">{vehicles.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 flex-1">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FaCheck className="text-green-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Aktif Araçlar</h3>
                <p className="text-2xl font-bold">{vehicles.filter(v => v.status === 'active').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 flex-1">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <FaTruckLoading className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Taşımada</h3>
                <p className="text-2xl font-bold">{vehicles.filter(v => v.shipmentStatus === 'active').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <FaExclamationCircle className="mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Yükleniyor */}
        {loading && (
          <div className="bg-white rounded-lg shadow p-8 mb-8 flex justify-center items-center">
            <FaSpinner className="text-orange-600 text-2xl animate-spin mr-3" />
            <p className="text-gray-700">Araçlar yükleniyor...</p>
          </div>
        )}

        {/* Araç Tablosu */}
        {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plaka</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Araç</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sürücü</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tip</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bakım</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                  {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                          {vehicle.plate}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">{vehicle.brand}</div>
                          <div className="text-sm text-gray-500 ml-1">{vehicle.model}</div>
                        </div>
                        <div className="text-xs text-gray-500">{vehicle.year}</div>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.driver || 'Atanmamış'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vehicle.type}</div>
                        <div className="text-xs text-gray-500">{vehicle.capacity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                        {getStatusText(vehicle.status)}
                      </span>
                        {vehicle.hasExpiredDocuments && (
                          <div className="mt-1">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Süresi Dolmuş Belge
                            </span>
                          </div>
                        )}
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>Son: {vehicle.lastMaintenance || 'Belirtilmemiş'}</div>
                        <div>Sonraki: {vehicle.nextMaintenance || 'Belirtilmemiş'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900 transition-colors" 
                          onClick={() => setShowVehicleDetailModal(vehicle)}
                        >
                          <FaEye className="w-5 h-5" />
                        </button>
                        <button 
                          className="text-orange-600 hover:text-orange-900 transition-colors" 
                            onClick={() => {
                              setSelectedVehicle(vehicle)
                              setShowEditModal(true)
                            }}
                          >
                            <FaEdit className="w-5 h-5" />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900 transition-colors" 
                            onClick={() => deleteVehicle(vehicle.id)}
                          >
                            <FaTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            {vehicles.length === 0 && !loading && (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-500">Araç bulunamadı.</p>
        </div>
      )}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Toplam <span className="font-medium">{vehicles.length}</span> araç
            </div>
          </div>
        </div>
      )}
        </div>
    </AdminLayout>
  )
} 
