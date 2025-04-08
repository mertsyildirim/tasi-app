'use client'

import React, { useState, useEffect } from 'react'
import { 
  FaPlus, FaSearch, FaEdit, FaTrash, FaIdCard, FaPhone, 
  FaEnvelope, FaTruck, FaFileAlt, FaEye, FaTimes, FaCheck,
  FaFilter, FaExclamationCircle
} from 'react-icons/fa'
import AdminLayout from '../../components/admin/Layout'

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
  const [drivers, setDrivers] = useState([
    { 
      id: 1, 
      name: 'Ali Yılmaz', 
      phone: '0532 111 2233', 
      email: 'ali@example.com',
      licenseType: 'C', 
      joinDate: '01.04.2023', 
      experience: '5 yıl',
      activeShipments: 1,
      completedShipments: 45,
      status: 'Aktif',
      company: 'Kaya Nakliyat',
      companyId: 1,
      successRate: 92,
      address: 'İstanbul, Kadıköy',
      notes: 'Deneyimli sürücü, ağır yük taşımacılığında uzman.',
      licenseExpiry: '31.12.2024',
      documents: [
        { id: 1, name: 'Sürücü Belgesi *', type: 'Zorunlu', validUntil: '31.12.2024', status: 'Aktif', fileUrl: '/documents/surucu_belgesi.pdf' },
        { id: 2, name: 'SRC Belgesi *', type: 'Zorunlu', validUntil: '15.06.2023', status: 'Süresi Dolmuş', fileUrl: '/documents/src_belgesi.pdf' },
        { id: 3, name: 'Sağlık Raporu *', type: 'Zorunlu', validUntil: '22.08.2023', status: 'Süresi Dolmuş', fileUrl: '/documents/saglik_raporu.pdf' }
      ]
    },
    { 
      id: 2, 
      name: 'Veli Demir', 
      phone: '0535 222 3344',
      email: 'veli@example.com', 
      licenseType: 'E', 
      joinDate: '15.04.2023', 
      experience: '8 yıl',
      activeShipments: 2,
      completedShipments: 78,
      status: 'Aktif',
      company: 'Kaya Nakliyat',
      companyId: 1,
      successRate: 85,
      address: 'İstanbul, Beşiktaş',
      notes: 'Uluslararası taşımacılık deneyimi var.',
      licenseExpiry: '10.05.2025',
      documents: [
        { id: 1, name: 'Sürücü Belgesi *', type: 'Zorunlu', validUntil: '10.05.2025', status: 'Aktif', fileUrl: '/documents/surucu_belgesi.pdf' },
        { id: 2, name: 'SRC Belgesi *', type: 'Zorunlu', validUntil: '22.10.2024', status: 'Aktif', fileUrl: '/documents/src_belgesi.pdf' },
        { id: 3, name: 'Psikoteknik Belgesi *', type: 'Zorunlu', validUntil: '18.03.2023', status: 'Süresi Dolmuş', fileUrl: '/documents/psikoteknik.pdf' }
      ]
    },
    { 
      id: 3, 
      name: 'Ayşe Kara', 
      phone: '0537 333 4455', 
      email: 'ayse@example.com',
      licenseType: 'C', 
      joinDate: '10.05.2023', 
      experience: '3 yıl',
      activeShipments: 0,
      completedShipments: 32,
      status: 'Aktif',
      company: 'Kaya Nakliyat',
      companyId: 1,
      successRate: 98,
      address: 'İstanbul, Ümraniye',
      notes: 'Yeni başlayan, hızlı öğrenen.',
      licenseExpiry: '05.09.2026',
      documents: [
        { id: 1, name: 'Sürücü Belgesi *', type: 'Zorunlu', validUntil: '05.09.2026', status: 'Aktif', fileUrl: '/documents/surucu_belgesi.pdf' },
        { id: 2, name: 'SRC Belgesi *', type: 'Zorunlu', validUntil: '30.11.2024', status: 'Aktif', fileUrl: '/documents/src_belgesi.pdf' },
        { id: 3, name: 'ADR Eğitim Sertifikası', type: 'Opsiyonel', validUntil: '12.07.2024', status: 'Aktif', fileUrl: '/documents/adr_sertifika.pdf' }
      ]
    },
    { 
      id: 4, 
      name: 'Ahmet Özkan', 
      phone: '0538 444 5566', 
      email: 'ahmet@example.com',
      licenseType: 'E', 
      joinDate: '05.02.2023', 
      experience: '10 yıl',
      activeShipments: 1,
      completedShipments: 93,
      status: 'Aktif',
      company: 'Demir Lojistik',
      companyId: 2,
      successRate: 96,
      address: 'Ankara, Çankaya',
      notes: 'Kıdemli sürücü, her türlü koşulda deneyimli.',
      licenseExpiry: '12.08.2025',
      documents: [
        { id: 1, name: 'Sürücü Belgesi *', type: 'Zorunlu', validUntil: '12.08.2025', status: 'Aktif', fileUrl: '/documents/surucu_belgesi.pdf' },
        { id: 2, name: 'SRC Belgesi *', type: 'Zorunlu', validUntil: '05.04.2024', status: 'Aktif', fileUrl: '/documents/src_belgesi.pdf' }
      ]
    },
    { 
      id: 5, 
      name: 'Kemal Yıldız', 
      phone: '0539 555 6677', 
      email: 'kemal@example.com',
      licenseType: 'C', 
      joinDate: '20.03.2023', 
      experience: '6 yıl',
      activeShipments: 0,
      completedShipments: 58,
      status: 'Pasif',
      company: 'Çelik Taşımacılık',
      companyId: 3,
      successRate: 88,
      address: 'İzmir, Karşıyaka',
      notes: 'Şu an izinde, 15.06.2023 tarihinde dönecek.',
      licenseExpiry: '18.11.2023',
      documents: [
        { id: 1, name: 'Sürücü Belgesi *', type: 'Zorunlu', validUntil: '18.11.2023', status: 'Aktif', fileUrl: '/documents/surucu_belgesi.pdf' },
        { id: 2, name: 'SRC Belgesi *', type: 'Zorunlu', validUntil: '21.09.2023', status: 'Aktif', fileUrl: '/documents/src_belgesi.pdf' }
      ]
    },
    { 
      id: 6, 
      name: 'Zeynep Aydın', 
      phone: '0531 666 7788', 
      email: 'zeynep@example.com',
      licenseType: 'C', 
      joinDate: '12.01.2023', 
      experience: '4 yıl',
      activeShipments: 1,
      completedShipments: 37,
      status: 'Aktif',
      company: 'Aydın Lojistik',
      companyId: 5,
      successRate: 90,
      address: 'Antalya, Konyaaltı',
      notes: 'Güney bölgesi uzmanı.',
      licenseExpiry: '03.03.2024',
      documents: [
        { id: 1, name: 'Sürücü Belgesi *', type: 'Zorunlu', validUntil: '03.03.2024', status: 'Aktif', fileUrl: '/documents/surucu_belgesi.pdf' },
        { id: 2, name: 'SRC Belgesi *', type: 'Zorunlu', validUntil: '10.08.2024', status: 'Aktif', fileUrl: '/documents/src_belgesi.pdf' }
      ]
    },
  ]);

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
  const deleteDriver = (id) => {
    setDrivers(prevDrivers => prevDrivers.filter(driver => driver.id !== id));
    setShowDeleteConfirm(null);
  }

  // Sürücü durumunu değiştirme
  const toggleDriverStatus = (id) => {
    setDrivers(prevDrivers => 
      prevDrivers.map(driver => 
        driver.id === id 
          ? {...driver, status: driver.status === 'Aktif' ? 'Pasif' : 'Aktif'} 
          : driver
      )
    );
  }

  // Filtreleme ve arama
  const filteredDrivers = drivers.filter(driver => {
    // Tab filtresi
    const tabFilter = 
      selectedTab === 'all' ? true :
      selectedTab === 'active' ? driver.status === 'Aktif' :
      selectedTab === 'passive' ? driver.status === 'Pasif' :
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
  const [newDriverData, setNewDriverData] = useState({
    name: '',
    phone: '',
    email: '',
    licenseType: '',
    experience: '',
    company: '',
    companyId: '',
    address: '',
    notes: '',
    licenseExpiry: '',
  });

  // Yeni sürücü ekleme
  const addNewDriver = () => {
    const newDriver = {
      id: drivers.length > 0 ? Math.max(...drivers.map(d => d.id)) + 1 : 1,
      name: newDriverData.name,
      phone: newDriverData.phone,
      email: newDriverData.email,
      licenseType: newDriverData.licenseType,
      joinDate: new Date().toLocaleDateString('tr-TR'),
      experience: newDriverData.experience,
      activeShipments: 0,
      completedShipments: 0,
      status: 'Aktif',
      company: newDriverData.company,
      companyId: parseInt(newDriverData.companyId),
      successRate: 100,
      address: newDriverData.address,
      notes: newDriverData.notes,
      licenseExpiry: newDriverData.licenseExpiry,
      documents: []
    };

    setDrivers(prevDrivers => [...prevDrivers, newDriver]);
    setNewDriverData({
      name: '',
      phone: '',
      email: '',
      licenseType: '',
      experience: '',
      company: '',
      companyId: '',
      address: '',
      notes: '',
      licenseExpiry: '',
    });
    setShowAddDriverModal(false);
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
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <FaIdCard className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Toplam Sürücü</h3>
                <p className="text-2xl font-bold">{drivers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FaTruck className="text-green-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Aktif Sürücü</h3>
                <p className="text-2xl font-bold">{drivers.filter(driver => driver.status === 'Aktif').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <FaExclamationCircle className="text-red-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Süresi Dolmuş Belge</h3>
                <p className="text-2xl font-bold">{drivers.filter(driver => driver.documents.some(doc => doc.status === 'Süresi Dolmuş')).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sürücü Tablosu */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sürücü</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İletişim</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ehliyet</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Firma</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taşıma</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{driver.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                          {driver.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                          <div className="text-sm text-gray-500">{driver.experience} deneyim</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{driver.phone}</div>
                      <div className="text-sm text-gray-500">{driver.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {driver.licenseType}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        Son: {driver.licenseExpiry}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.company}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        driver.documents.some(doc => doc.status === 'Süresi Dolmuş')
                          ? 'bg-yellow-100 text-yellow-800'
                          : getStatusColor(driver.status)
                      }`}>
                        {driver.documents.some(doc => doc.status === 'Süresi Dolmuş')
                          ? 'Süresi Dolmuş Belge'
                          : driver.status
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm text-gray-900">{driver.activeShipments} aktif</div>
                        <div className="text-sm text-gray-500">{driver.completedShipments} tamamlanan</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900 transition-colors" 
                          onClick={() => setShowDriverDetailModal(driver)}
                          title="Sürücü Detayları"
                        >
                          <FaEye className="w-5 h-5" />
                        </button>
                        <button 
                          className="text-orange-600 hover:text-orange-900 transition-colors" 
                          onClick={() => setShowDriverDocumentsModal(driver)}
                          title="Belgeler"
                        >
                          <FaFileAlt className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Toplam <span className="font-medium">{filteredDrivers.length}</span> sürücü
            </div>
            <div className="flex space-x-1">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                Önceki
              </button>
              <button className="px-3 py-1 border border-gray-300 bg-orange-50 text-orange-600 rounded-md text-sm">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                Sonraki
              </button>
            </div>
          </div>
        </div>
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
                  onClick={() => toggleDriverStatus(showDriverDetailModal.id)}
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