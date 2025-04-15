'use client'

import React, { useState, useEffect } from 'react'
import { 
  FaPlus, FaSearch, FaEdit, FaTrash, FaIdCard, FaPhone, 
  FaEnvelope, FaTruck, FaFileAlt, FaEye, FaTimes, FaCheck,
  FaFilter, FaExclamationCircle, FaSpinner
} from 'react-icons/fa'
import AdminLayout from '../../components/admin/Layout'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function DriversPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('all')
  const [showDriverDetailModal, setShowDriverDetailModal] = useState(null)
  const [showDriverDocumentsModal, setShowDriverDocumentsModal] = useState(null)
  const [showAddDriverModal, setShowAddDriverModal] = useState(false)
  const [showEditDriverModal, setShowEditDriverModal] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  
  // ESC tuşu ile modal'ları kapatma
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        // Sadece en son açılan modal'ı kapat
        if (showDriverDocumentsModal) {
          setShowDriverDocumentsModal(null);
        } else if (showEditDriverModal) {
          setShowEditDriverModal(null);
        } else if (showAddDriverModal) {
          setShowAddDriverModal(false);
        } else if (showDeleteConfirm) {
          setShowDeleteConfirm(null);
        } else if (showDriverDetailModal) {
          setShowDriverDetailModal(null);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Modal açıkken body scroll'u engelle
    if (showDriverDetailModal || showDeleteConfirm || showDriverDocumentsModal || showAddDriverModal || showEditDriverModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [showDriverDetailModal, showDeleteConfirm, showDriverDocumentsModal, showAddDriverModal, showEditDriverModal]);

  // Örnek sürücü verileri
  const [drivers, setDrivers] = useState([]);
  
  // API'den veri çekme
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companies, setCompanies] = useState([]);
  const router = useRouter();
  
  // Filtrelenmemiş tüm sürücüler
  const [allDrivers, setAllDrivers] = useState([]);
  
  // Yeni sürücü veri yapısı
  const [newDriverData, setNewDriverData] = useState({
    name: '',
    phone: '',
    email: '',
    licenseType: '',
    licenseExpiry: '',
    experience: '',
    status: 'Aktif',
    companyId: '',
    address: '',
    notes: ''
  });
  
  // Tüm sürücüleri API'den çekme
  useEffect(() => {
    const fetchAllDrivers = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          return;
        }
        
        // API'den tüm sürücüleri çek (filtresiz)
        const response = await axios.get(`/api/admin/drivers`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            status: '',  // Filtresiz
            search: ''
          }
        });
        
        if (response.data && response.data.drivers) {
          // API yanıtındaki sürücüleri formatlayarak ayarla
          const formattedDrivers = response.data.drivers.map(driver => ({
            ...driver,
            // API'den gelen status format uyumsuzluğunu düzelt
            status: driver.status === 'active' ? 'Aktif' : 
                   driver.status === 'inactive' ? 'Pasif' : driver.status,
            // Eksik alanlar için varsayılan değerler
            documents: [],
            hasExpiredDocuments: false,
            // Taşımayla ilgili varsayılan değerler
            activeShipments: 0,
            completedShipments: 0
          }));
          
          setAllDrivers(formattedDrivers);
        }
      } catch (error) {
        console.error('Tüm sürücüleri getirme hatası:', error);
      }
    };
    
    if (router) {
      fetchAllDrivers();
    }
  }, [router]);
  
  // Sürücüleri API'den çekme
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          console.log('Token bulunamadı, login sayfasına yönlendiriliyor');
          router.replace('/admin');
          return;
        }
        
        // API'den sürücüleri çek
        const statusParam = selectedTab === 'all' ? '' : 
                            selectedTab === 'active' ? 'active' :
                            selectedTab === 'passive' ? 'inactive' :
                            selectedTab === 'documents' ? 'documents' : '';
        
        console.log('Sürücüler API isteği başlatılıyor...');
        const response = await axios.get(`/api/admin/drivers`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            status: statusParam,
            search: searchTerm
          }
        });
        
        console.log('Sürücüler API yanıtı:', response.data);
        
        if (response.data && response.data.drivers) {
          // API yanıtındaki sürücüleri formatlayarak ayarla
          const formattedDrivers = response.data.drivers.map(driver => ({
            ...driver,
            // API'den gelen status format uyumsuzluğunu düzelt
            status: driver.status === 'active' ? 'Aktif' : 
                   driver.status === 'inactive' ? 'Pasif' : driver.status,
            // Eksik alanlar için varsayılan değerler
            documents: [],
            hasExpiredDocuments: false,
            // Taşımayla ilgili varsayılan değerler
            activeShipments: 0,
            completedShipments: 0
          }));
          
          setDrivers(formattedDrivers);
          console.log(`${formattedDrivers.length} sürücü başarıyla yüklendi`);
        } else {
          console.error('API yanıtında sürücü verisi bulunamadı');
          setError('Sürücü verisi bulunamadı. API yanıtı geçersiz format içeriyor.');
        }

        try {
          // Şirketleri de çek (dropdown için)
          const companiesResponse = await axios.get(`/api/admin/carriers`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (companiesResponse.data && companiesResponse.data.carriers) {
            setCompanies(companiesResponse.data.carriers);
          }
        } catch (companyError) {
          console.error('Şirketler yüklenirken hata:', companyError);
          // Şirketler yüklenmese bile sürücüleri göstermeye devam et
        }
      } catch (error) {
        console.error('Sürücüler yüklenirken hata:', error);
        
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('userData');
          router.replace('/admin');
          return;
        }
        
        setError('Sürücü verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    
    if (router) {
      fetchDrivers();
    }
  }, [router, selectedTab, searchTerm]);

  const tabs = [
    { id: 'all', name: 'Tüm Sürücüler' },
    { id: 'active', name: 'Aktif' },
    { id: 'passive', name: 'Pasif' },
    { id: 'documents', name: 'Süresi Dolmuş Belge' },
  ]

  // Durum renkleri
  const getStatusColor = (status) => {
    switch(status) {
      case 'Aktif':
        return 'bg-green-100 text-green-800'
      case 'Pasif':
        return 'bg-red-100 text-red-800'
      case 'Beklemede':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Sürücü silme
  const deleteDriver = async (id) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.log('Token bulunamadı, login sayfasına yönlendiriliyor');
        router.replace('/admin');
        return;
      }
      
      const response = await axios.delete(`/api/admin/drivers`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: { id }
      });
      
      if (response.data && response.data.success) {
        setDrivers(prevDrivers => prevDrivers.filter(driver => driver.id !== id));
        setShowDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Sürücü silinirken hata:', error);
      alert('Sürücü silinirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Sürücü durumunu değiştirme
  const toggleDriverStatus = async (id, currentStatus) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.log('Token bulunamadı, login sayfasına yönlendiriliyor');
        router.replace('/admin');
        return;
      }
      
      const newStatus = currentStatus === 'Aktif' ? 'Pasif' : 'Aktif';
      
      const response = await axios.put(`/api/admin/drivers`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: { id }
        }
      );
      
      if (response.data && response.data.success) {
        setDrivers(prevDrivers => 
          prevDrivers.map(driver => 
            driver.id === id 
              ? {...driver, status: newStatus} 
              : driver
          )
        );
        
        if (showDriverDetailModal && showDriverDetailModal.id === id) {
          setShowDriverDetailModal({...showDriverDetailModal, status: newStatus});
        }
      }
    } catch (error) {
      console.error('Sürücü durumu değiştirilirken hata:', error);
      alert('Sürücü durumu değiştirilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Filtreleme ve arama
  const filteredDrivers = drivers.filter(driver => {
    // Tab filtresi
    const tabFilter = 
      selectedTab === 'all' ? true :
      selectedTab === 'active' ? driver.status === 'active' :
      selectedTab === 'passive' ? driver.status === 'inactive' :
      selectedTab === 'documents' ? driver.documents.some(doc => doc.status === 'Süresi Dolmuş') :
      true;
    
    // Arama filtresi
    const searchFilter = 
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.includes(searchTerm);
    
    return tabFilter && searchFilter;
  });

  // Yeni sürücü ekleme
  const addNewDriver = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.log('Token bulunamadı, login sayfasına yönlendiriliyor');
        router.replace('/admin');
        return;
      }
      
      // API çağrısı
      const response = await axios.post('/api/admin/drivers', newDriverData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.success) {
        // Sürücü eklendi, listeyi yenile
        const updatedDrivers = await axios.get('/api/admin/drivers', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (updatedDrivers.data && updatedDrivers.data.drivers) {
          setDrivers(updatedDrivers.data.drivers);
        }
        
        // Modal'ı kapat ve formu sıfırla
        setShowAddDriverModal(false);
        setNewDriverData({
          name: '',
          phone: '',
          email: '',
          licenseType: '',
          licenseExpiry: '',
          experience: '',
          status: 'Aktif',
          companyId: '',
          address: '',
          notes: ''
        });
      }
    } catch (error) {
      console.error('Sürücü eklenirken hata:', error);
      alert('Sürücü eklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Sürücü güncelleme
  const updateDriver = async (updatedDriver) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.log('Token bulunamadı, login sayfasına yönlendiriliyor');
        router.replace('/admin');
        return;
      }
      
      // API çağrısı
      const { id, ...driverData } = updatedDriver;
      
      const response = await axios.put('/api/admin/drivers', 
        driverData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: { id }
        }
      );
      
      if (response.data && response.data.success) {
        // Sürücü güncellendi, listeyi yenile
        const updatedDrivers = await axios.get('/api/admin/drivers', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (updatedDrivers.data && updatedDrivers.data.drivers) {
          setDrivers(updatedDrivers.data.drivers);
          
          // Modal'ları düzenle
          const updatedDriverInfo = updatedDrivers.data.drivers.find(d => d.id === id);
          if (updatedDriverInfo) {
            setShowEditDriverModal(null);
            setShowDriverDetailModal(updatedDriverInfo);
          }
        }
      }
    } catch (error) {
      console.error('Sürücü güncellenirken hata:', error);
      alert('Sürücü güncellenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Sürücü Yönetimi" isBlurred={showDriverDetailModal || showDeleteConfirm || showDriverDocumentsModal || showAddDriverModal || showEditDriverModal}>
      <div className={showDriverDetailModal || showDeleteConfirm || showDriverDocumentsModal || showAddDriverModal || showEditDriverModal ? "blur-sm" : ""}>
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
          <div className="flex flex-col w-full md:flex-row md:w-auto gap-4">
            <div className="relative w-full md:w-auto">
              <input 
                type="text" 
                placeholder="Sürücü ara..." 
                className="pl-10 pr-4 py-2 w-full md:min-w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button 
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-1"
              onClick={() => setShowAddDriverModal(true)}
            >
              <FaPlus className="mr-2" />
              <span>Yeni Sürücü</span>
            </button>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FaIdCard className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Toplam Sürücü</h3>
                <p className="text-2xl font-bold">{allDrivers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FaCheck className="text-green-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Aktif Sürücüler</h3>
                <p className="text-2xl font-bold">{allDrivers.filter(d => d.status === 'Aktif').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <FaExclamationCircle className="text-red-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Belgesi Eksik</h3>
                <p className="text-2xl font-bold">{allDrivers.filter(d => d.hasExpiredDocuments).length}</p>
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
            <p className="text-gray-700">Sürücüler yükleniyor...</p>
          </div>
        )}

        {/* Sürücü Tablosu */}
        {!loading && !error && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sürücü Bilgileri</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İletişim</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ehliyet Bilgileri</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taşıma</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDrivers.map((driver) => (
                    <tr key={driver.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                            {driver.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                            <div className="text-sm text-gray-500">{driver.company}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{driver.phone}</div>
                        <div className="text-sm text-gray-500">{driver.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Sınıf: {driver.licenseType || '-'}</div>
                        <div className="text-sm text-gray-500">
                          {driver.licenseExpiry ? (
                            <>Son Geçerlilik: {driver.licenseExpiry}</>
                          ) : (
                            '-'
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(driver.status)}`}>
                          {driver.status}
                        </span>
                        {driver.hasExpiredDocuments && (
                          <div className="mt-1">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Süresi Dolmuş Belge
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col">
                          <span>{driver.activeShipments || 0} Aktif</span>
                          <span className="text-gray-400">{driver.completedShipments || 0} Tamamlanan</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900 transition-colors" 
                            onClick={() => setShowDriverDetailModal(driver)}
                            title="Detaylar"
                          >
                            <FaEye className="w-5 h-5" />
                          </button>
                          <button 
                            className="text-orange-600 hover:text-orange-900 transition-colors" 
                            onClick={() => setShowEditDriverModal(driver)}
                            title="Düzenle"
                          >
                            <FaEdit className="w-5 h-5" />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900 transition-colors" 
                            onClick={() => setShowDeleteConfirm(driver)}
                            title="Sil"
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
            {filteredDrivers.length === 0 && !loading && (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-500">Kriterlere uygun sürücü bulunamadı.</p>
              </div>
            )}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Toplam <span className="font-medium">{filteredDrivers.length}</span> sürücü
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sürücü Detay Modalı */}
      {showDriverDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget && !showDriverDocumentsModal) setShowDriverDetailModal(null);
        }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Sürücü Detayları</h3>
              <button 
                onClick={() => setShowDriverDetailModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Sol Bölüm - Kişisel Bilgiler */}
                <div className="md:w-1/2 space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-3">Sürücü Bilgileri</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-2xl">
                          {showDriverDetailModal.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <h5 className="text-xl font-medium text-gray-900">{showDriverDetailModal.name}</h5>
                          <p className="text-gray-600">{showDriverDetailModal.company}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-start">
                          <div className="w-28 text-gray-500">ID:</div>
                          <div className="font-medium">{showDriverDetailModal.id}</div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-28 text-gray-500">Telefon:</div>
                          <div className="font-medium">{showDriverDetailModal.phone}</div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-28 text-gray-500">E-posta:</div>
                          <div className="font-medium">{showDriverDetailModal.email}</div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-28 text-gray-500">Adres:</div>
                          <div className="font-medium">{showDriverDetailModal.address}</div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-28 text-gray-500">Katılım Tarihi:</div>
                          <div className="font-medium">{showDriverDetailModal.joinDate}</div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-28 text-gray-500">Durum:</div>
                          <div>
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(showDriverDetailModal.status)}`}>
                              {showDriverDetailModal.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-3">Ek Bilgiler</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-start">
                          <div className="w-28 text-gray-500">Ehliyet Sınıfı:</div>
                          <div className="font-medium">
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {showDriverDetailModal.licenseType}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-28 text-gray-500">Son Geçerlilik:</div>
                          <div className="font-medium">{showDriverDetailModal.licenseExpiry}</div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-28 text-gray-500">Deneyim:</div>
                          <div className="font-medium">{showDriverDetailModal.experience}</div>
                        </div>
                        <div className="flex items-start">
                          <div className="w-28 text-gray-500">Notlar:</div>
                          <div className="font-medium">{showDriverDetailModal.notes || "-"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Sağ Bölüm - Performans ve Belgeler */}
                <div className="md:w-1/2 space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-3">Performans</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-600">Başarı Oranı</span>
                          <span className={`font-bold ${
                            showDriverDetailModal.successRate >= 90 ? 'text-green-600' : 
                            showDriverDetailModal.successRate >= 75 ? 'text-orange-600' : 
                            'text-red-600'
                          }`}>{showDriverDetailModal.successRate}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className={`h-2.5 rounded-full ${
                            showDriverDetailModal.successRate >= 90 ? 'bg-green-600' : 
                            showDriverDetailModal.successRate >= 75 ? 'bg-orange-600' : 
                            'bg-red-600'
                          }`} style={{width: `${showDriverDetailModal.successRate}%`}}></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="text-gray-500 text-sm mb-1">Aktif Taşıma</div>
                          <div className="text-xl font-bold text-blue-600">{showDriverDetailModal.activeShipments}</div>
                        </div>
                        <div className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="text-gray-500 text-sm mb-1">Tamamlanan</div>
                          <div className="text-xl font-bold text-green-600">{showDriverDetailModal.completedShipments}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-3">Belgeler</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Belge</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Tarih</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {showDriverDetailModal.documents.map((document) => (
                            <tr key={document.id}>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <div className="flex items-center">
                                  <FaFileAlt className="text-gray-400 mr-2" />
                                  <div className="text-sm font-medium text-gray-900">
                                    {document.name}
                                    {document.type === 'Zorunlu' && <span className="text-red-500"> *</span>}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  document.status === 'Aktif' ? 'bg-green-100 text-green-800' : 
                                  document.status === 'Süresi Dolmuş' ? 'bg-red-100 text-red-800' : 
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {document.status}
                                </span>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                {document.validUntil || "Süresiz"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                      <div className="mt-4">
                        <button 
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center"
                          onClick={() => setShowDriverDocumentsModal(showDriverDetailModal)}
                        >
                          <FaFileAlt className="mr-2" /> Belgeleri Görüntüle
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4 flex justify-end">
                <button 
                  className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded mr-2"
                  onClick={() => setShowEditDriverModal(showDriverDetailModal)}
                >
                  <FaEdit className="mr-2 inline-block" /> Düzenle
                </button>
                <button 
                  onClick={() => toggleDriverStatus(showDriverDetailModal.id, showDriverDetailModal.status)}
                  className={`font-medium py-2 px-4 rounded mr-2 ${
                    showDriverDetailModal.status === 'Aktif' 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {showDriverDetailModal.status === 'Aktif' ? 'Pasif Yap' : 'Aktif Yap'}
                </button>
                <button 
                  onClick={() => setShowDriverDetailModal(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sürücü Belgeleri Modal */}
      {showDriverDocumentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget) setShowDriverDocumentsModal(null);
        }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">{showDriverDocumentsModal.name} - Sürücü Belgeleri</h3>
              <button 
                onClick={() => setShowDriverDocumentsModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              {showDriverDocumentsModal.documents && showDriverDocumentsModal.documents.length > 0 ? (
                <>
                  <div className="mb-4">
                    <h4 className="text-lg font-medium text-gray-800 mb-2">Belgeler</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 mb-6">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Belge Adı</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tür</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Geçerlilik Tarihi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {showDriverDocumentsModal.documents.map((document) => (
                            <tr key={document.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                {document.name}
                                {document.type === 'Zorunlu' && <span className="text-red-500"> *</span>}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{document.type}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                                {document.validUntil ? (
                                  document.status === 'Süresi Dolmuş' ? (
                                    <><FaExclamationCircle className="text-red-500 mr-2" /> {document.validUntil}</>
                                  ) : (
                                    <>{document.validUntil}</>
                                  )
                                ) : (
                                  <span className="text-gray-400">Süresiz</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  document.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {document.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button 
                                  className="text-blue-600 hover:text-blue-900 mr-3"
                                  title="Belgeyi Görüntüle"
                                  onClick={() => window.open(document.fileUrl, '_blank')}
                                >
                                  <FaEye size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Bu sürücü için henüz belge kaydı bulunmamaktadır.</p>
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <div>
                  <button 
                    className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded flex items-center"
                  >
                    <FaPlus className="mr-2" /> Belge Ekle
                  </button>
                </div>
                <button 
                  onClick={() => setShowDriverDocumentsModal(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded flex items-center"
                >
                  <FaTimes className="mr-2" /> Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Silme Onay Modalı */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => {
          if (e.target === e.currentTarget) setShowDeleteConfirm(null);
        }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-lg text-gray-900">Sürücü Silme Onayı</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700">
                <b>{showDeleteConfirm.name}</b> isimli sürücüyü silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded"
                >
                  İptal
                </button>
                <button 
                  onClick={() => deleteDriver(showDeleteConfirm.id)}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
                >
                  Sürücüyü Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Yeni Sürücü Ekleme Modal */}
      {showAddDriverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget) setShowAddDriverModal(false);
        }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Yeni Sürücü Ekle</h3>
              <button 
                onClick={() => setShowAddDriverModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kişisel Bilgiler */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-4">Kişisel Bilgiler</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adı Soyadı <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newDriverData.name}
                        onChange={(e) => setNewDriverData({...newDriverData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefon <span className="text-red-500">*</span></label>
                      <input 
                        type="tel" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newDriverData.phone}
                        onChange={(e) => setNewDriverData({...newDriverData, phone: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                      <input 
                        type="email" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newDriverData.email}
                        onChange={(e) => setNewDriverData({...newDriverData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                      <textarea 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newDriverData.address}
                        onChange={(e) => setNewDriverData({...newDriverData, address: e.target.value})}
                        rows={3}
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                {/* Sürücü Bilgileri */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-4">Sürücü Bilgileri</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Firma <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newDriverData.company}
                        onChange={(e) => setNewDriverData({...newDriverData, company: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Firma ID</label>
                      <input 
                        type="number" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newDriverData.companyId}
                        onChange={(e) => setNewDriverData({...newDriverData, companyId: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ehliyet Sınıfı <span className="text-red-500">*</span></label>
                      <select 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newDriverData.licenseType}
                        onChange={(e) => setNewDriverData({...newDriverData, licenseType: e.target.value})}
                        required
                      >
                        <option value="">Seçiniz</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ehliyet Son Geçerlilik Tarihi</label>
                      <input 
                        type="text" 
                        placeholder="gg.aa.yyyy"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newDriverData.licenseExpiry}
                        onChange={(e) => setNewDriverData({...newDriverData, licenseExpiry: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deneyim</label>
                      <input 
                        type="text" 
                        placeholder="Örn: 5 yıl"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newDriverData.experience}
                        onChange={(e) => setNewDriverData({...newDriverData, experience: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
                      <textarea 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newDriverData.notes}
                        onChange={(e) => setNewDriverData({...newDriverData, notes: e.target.value})}
                        rows={3}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="bg-orange-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-orange-800">
                    <strong>Not:</strong> Sürücü kaydı oluşturulduktan sonra aşağıdaki belgeleri yüklemeniz gerekmektedir:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-sm text-orange-800">
                    <li>Sürücü Belgesi *</li>
                    <li>SRC Belgesi *</li>
                    <li>Sağlık Raporu *</li>
                    <li>Psikoteknik Belgesi *</li>
                  </ul>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={() => setShowAddDriverModal(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded"
                  >
                    İptal
                  </button>
                  <button 
                    onClick={addNewDriver}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded"
                    disabled={!newDriverData.name || !newDriverData.phone || !newDriverData.licenseType || !newDriverData.company}
                  >
                    Sürücü Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
} 