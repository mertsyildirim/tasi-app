'use client'

import React, { useState, useEffect } from 'react'
import { FaPlus, FaSearch, FaEdit, FaTrash, FaUserShield, FaIdCard, FaTruck, FaTimes, FaCheck, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCalendarAlt, FaExclamationTriangle, FaBuilding, FaFileAlt, FaEye, FaExclamationCircle, FaTags, FaRegCalendarAlt, FaIndustry, FaIdBadge, FaUser } from 'react-icons/fa'
import AdminLayout from '../../components/admin/Layout'

export default function CarriersPage() {
  const [selectedTab, setSelectedTab] = useState('all')
  const [showCarrierDetailModal, setShowCarrierDetailModal] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDriversModal, setShowDriversModal] = useState(false)
  const [showVehiclesModal, setShowVehiclesModal] = useState(false)
  const [showDocumentsModal, setShowDocumentsModal] = useState(false)
  const [showDriverDocumentsModal, setShowDriverDocumentsModal] = useState(null)
  const [showAddCarrierModal, setShowAddCarrierModal] = useState(false)
  const [showEditCarrierModal, setShowEditCarrierModal] = useState(null)
  const [newCarrierData, setNewCarrierData] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    address: '',
    taxOffice: '',
    taxNumber: '',
    companyType: '',
    registrationNumber: '',
  })

  // ESC tuşu ile modal'ları kapatma
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        // Sadece en son açılan modal'ı kapat
        if (showDriverDocumentsModal) {
          setShowDriverDocumentsModal(null);
        } else if (showEditCarrierModal) {
          setShowEditCarrierModal(null);
        } else if (showAddCarrierModal) {
          setShowAddCarrierModal(false);
        } else if (showDocumentsModal) {
          setShowDocumentsModal(false);
        } else if (showVehiclesModal) {
          setShowVehiclesModal(false);
        } else if (showDriversModal) {
          setShowDriversModal(false);
        } else if (showDeleteConfirm) {
          setShowDeleteConfirm(null);
        } else if (showCarrierDetailModal) {
          setShowCarrierDetailModal(null);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Modal açıkken body scroll'u engelle
    if (showCarrierDetailModal || showDeleteConfirm || showDriversModal || showVehiclesModal || showDocumentsModal || showDriverDocumentsModal || showAddCarrierModal || showEditCarrierModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [showCarrierDetailModal, showDeleteConfirm, showDriversModal, showVehiclesModal, showDocumentsModal, showDriverDocumentsModal, showAddCarrierModal, showEditCarrierModal]);

  // Örnek taşıyıcı verileri
  const [carriers, setCarriers] = useState([
    { 
      id: 1, 
      name: 'Mehmet Kaya', 
      company: 'Kaya Nakliyat', 
      phone: '0555 123 4567', 
      email: 'mehmet@example.com', 
      vehicles: 5, 
      drivers: 8, 
      status: 'Aktif', 
      joinDate: '15.03.2023', 
      address: 'İstanbul, Kadıköy', 
      completedShipments: 45, 
      activeShipments: 3, 
      pendingDocuments: false,
      taxOffice: 'Kadıköy Vergi Dairesi',
      taxNumber: '12345678901',
      companyType: 'Limited Şirket',
      registrationNumber: 'İST-789456123',
      driversList: [
        { 
          id: 1, 
          name: 'Ali Yılmaz', 
          phone: '0532 111 2233', 
          licenseType: 'C', 
          joinDate: '01.04.2023', 
          activeShipments: 1,
          successRate: 92,
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
          licenseType: 'E', 
          joinDate: '15.04.2023', 
          activeShipments: 2,
          successRate: 85,
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
          licenseType: 'C', 
          joinDate: '10.05.2023', 
          activeShipments: 0,
          successRate: 98,
          documents: [
            { id: 1, name: 'Sürücü Belgesi *', type: 'Zorunlu', validUntil: '05.09.2026', status: 'Aktif', fileUrl: '/documents/surucu_belgesi.pdf' },
            { id: 2, name: 'SRC Belgesi *', type: 'Zorunlu', validUntil: '30.11.2024', status: 'Aktif', fileUrl: '/documents/src_belgesi.pdf' },
            { id: 3, name: 'ADR Eğitim Sertifikası', type: 'Opsiyonel', validUntil: '12.07.2024', status: 'Aktif', fileUrl: '/documents/adr_sertifika.pdf' }
          ]
        }
      ],
      vehiclesList: [
        { id: 1, plate: '34ABC123', type: 'Kamyon', capacity: '10 ton', lastInspection: '05.03.2023', status: 'Aktif' },
        { id: 2, plate: '34DEF456', type: 'Tır', capacity: '24 ton', lastInspection: '12.01.2023', status: 'Aktif' },
        { id: 3, plate: '34GHI789', type: 'Kamyonet', capacity: '3.5 ton', lastInspection: '22.02.2023', status: 'Bakımda' }
      ],
      documentsList: [
        { id: 1, name: 'K1 Belgesi *', type: 'Zorunlu', validUntil: '31.12.2023', status: 'Aktif', fileUrl: '/documents/k1_belgesi.pdf' },
        { id: 2, name: 'Taşımacılık Yetki Belgesi *', type: 'Zorunlu', validUntil: '15.06.2023', status: 'Süresi Dolmuş', fileUrl: '/documents/yetki_belgesi.pdf' },
        { id: 3, name: 'Vergi Levhası *', type: 'Zorunlu', validUntil: null, status: 'Aktif', fileUrl: '/documents/vergi_levhasi.pdf' },
        { id: 4, name: 'Sicil Gazetesi *', type: 'Zorunlu', validUntil: null, status: 'Aktif', fileUrl: '/documents/sicil_gazetesi.pdf' },
        { id: 5, name: 'İmza Sirküleri *', type: 'Zorunlu', validUntil: null, status: 'Aktif', fileUrl: '/documents/imza_sirkuleri.pdf' },
        { id: 6, name: 'ISO 9001', type: 'Opsiyonel', validUntil: '01.05.2024', status: 'Aktif', fileUrl: '/documents/iso9001.pdf' },
        { id: 7, name: 'ADR Belgesi', type: 'Opsiyonel', validUntil: '22.03.2023', status: 'Süresi Dolmuş', fileUrl: '/documents/adr.pdf' },
      ]
    },
    { 
      id: 2, 
      name: 'Hasan Demir', 
      company: 'Demir Lojistik', 
      phone: '0532 456 7890', 
      email: 'hasan@example.com', 
      vehicles: 3, 
      drivers: 4, 
      status: 'Aktif', 
      joinDate: '22.01.2023', 
      address: 'Ankara, Çankaya', 
      completedShipments: 28, 
      activeShipments: 2, 
      pendingDocuments: true, 
      taxOffice: 'Çankaya Vergi Dairesi',
      taxNumber: '98765432101',
      companyType: 'Anonim Şirket',
      registrationNumber: 'ANK-123456789',
      driversList: [], 
      vehiclesList: [],
      documentsList: [] 
    },
    { id: 3, name: 'Ayşe Çelik', company: 'Çelik Taşımacılık', phone: '0542 789 0123', email: 'ayse@example.com', vehicles: 7, drivers: 12, status: 'Aktif', joinDate: '10.02.2023', address: 'İzmir, Konak', completedShipments: 67, activeShipments: 5, pendingDocuments: false, taxOffice: '', taxNumber: '', companyType: '', registrationNumber: '', driversList: [], vehiclesList: [], documentsList: [] },
    { id: 4, name: 'Mustafa Yılmaz', company: 'Yılmaz Nakliyat', phone: '0533 234 5678', email: 'mustafa@example.com', vehicles: 2, drivers: 3, status: 'Pasif', joinDate: '05.04.2023', address: 'Bursa, Nilüfer', completedShipments: 12, activeShipments: 0, pendingDocuments: true, taxOffice: '', taxNumber: '', companyType: '', registrationNumber: '', driversList: [], vehiclesList: [], documentsList: [] },
    { id: 5, name: 'Fatma Aydın', company: 'Aydın Lojistik', phone: '0537 345 6789', email: 'fatma@example.com', vehicles: 4, drivers: 6, status: 'Aktif', joinDate: '18.03.2023', address: 'Antalya, Muratpaşa', completedShipments: 33, activeShipments: 2, pendingDocuments: false, taxOffice: '', taxNumber: '', companyType: '', registrationNumber: '', driversList: [], vehiclesList: [], documentsList: [] },
  ]);

  const tabs = [
    { id: 'all', name: 'Tüm Taşıyıcılar' },
    { id: 'active', name: 'Aktif' },
    { id: 'passive', name: 'Pasif' },
    { id: 'pending', name: 'Onay Bekleyen' },
    { id: 'pendingdocs', name: 'Belge Bekleyen' },
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
      case 'Sarı Belge Bekleyen':
        return 'bg-amber-100 text-amber-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Taşıyıcı durumunu değiştirme
  const toggleCarrierStatus = (id) => {
    setCarriers(prevCarriers => 
      prevCarriers.map(carrier => 
        carrier.id === id 
          ? {...carrier, status: carrier.status === 'Aktif' ? 'Pasif' : 'Aktif'} 
          : carrier
      )
    );
    setShowCarrierDetailModal(null);
  }

  // Taşıyıcı silme
  const deleteCarrier = (id) => {
    setCarriers(prevCarriers => prevCarriers.filter(carrier => carrier.id !== id));
    setShowDeleteConfirm(null);
  }

  // Yeni taşıyıcı ekleme
  const addNewCarrier = () => {
    const newCarrier = {
      id: carriers.length > 0 ? Math.max(...carriers.map(c => c.id)) + 1 : 1,
      name: newCarrierData.name,
      company: newCarrierData.company,
      phone: newCarrierData.phone,
      email: newCarrierData.email,
      address: newCarrierData.address,
      taxOffice: newCarrierData.taxOffice,
      taxNumber: newCarrierData.taxNumber,
      companyType: newCarrierData.companyType,
      registrationNumber: newCarrierData.registrationNumber,
      vehicles: 0,
      drivers: 0,
      status: 'Aktif',
      joinDate: new Date().toLocaleDateString('tr-TR'),
      completedShipments: 0,
      activeShipments: 0,
      pendingDocuments: true,
      driversList: [],
      vehiclesList: [],
      documentsList: []
    };

    setCarriers(prevCarriers => [...prevCarriers, newCarrier]);
    setNewCarrierData({
      name: '',
      company: '',
      phone: '',
      email: '',
      address: '',
      taxOffice: '',
      taxNumber: '',
      companyType: '',
      registrationNumber: '',
    });
    setShowAddCarrierModal(false);
  };

  // Taşıyıcı düzenleme
  const updateCarrier = (updatedCarrier) => {
    setCarriers(prevCarriers => 
      prevCarriers.map(carrier => 
        carrier.id === updatedCarrier.id ? {...updatedCarrier} : carrier
      )
    );
    setShowEditCarrierModal(null);
    setShowCarrierDetailModal(updatedCarrier);
  };

  // Filtreleme ve arama
  const filteredCarriers = carriers.filter(carrier => {
    // Tab filtresi
    const tabFilter = 
      selectedTab === 'all' ? true :
      selectedTab === 'active' ? carrier.status === 'Aktif' :
      selectedTab === 'passive' ? carrier.status === 'Pasif' :
      selectedTab === 'pending' ? carrier.status === 'Beklemede' :
      selectedTab === 'pendingdocs' ? carrier.pendingDocuments === true :
      true;
    
    // Arama filtresi
    const searchFilter = 
      carrier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrier.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      carrier.phone.includes(searchTerm);
    
    return tabFilter && searchFilter;
  });

  return (
    <AdminLayout title="Taşıyıcı Yönetimi" isBlurred={showCarrierDetailModal || showDeleteConfirm || showDriversModal || showVehiclesModal || showDocumentsModal || showDriverDocumentsModal || showAddCarrierModal || showEditCarrierModal}>
      <div className={showCarrierDetailModal || showDeleteConfirm || showDriversModal || showVehiclesModal || showDocumentsModal || showDriverDocumentsModal || showAddCarrierModal || showEditCarrierModal ? "blur-sm" : ""}>
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
                placeholder="Taşıyıcı ara..." 
                className="pl-10 pr-4 py-2 w-full md:min-w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button 
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-1"
              onClick={() => setShowAddCarrierModal(true)}
            >
              <FaPlus className="mr-2" />
              <span>Yeni Taşıyıcı</span>
            </button>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <FaUserShield className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Toplam Taşıyıcı</h3>
                <p className="text-2xl font-bold">{carriers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FaTruck className="text-green-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Toplam Araç</h3>
                <p className="text-2xl font-bold">{carriers.reduce((sum, carrier) => sum + carrier.vehicles, 0)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FaIdCard className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Toplam Sürücü</h3>
                <p className="text-2xl font-bold">{carriers.reduce((sum, carrier) => sum + carrier.drivers, 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Taşıyıcı Tablosu */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taşıyıcı</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İletişim</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Araç/Sürücü</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kayıt Tarihi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCarriers.map((carrier) => (
                  <tr key={carrier.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{carrier.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                          {carrier.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{carrier.name}</div>
                          <div className="text-sm text-gray-500">{carrier.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{carrier.phone}</div>
                      <div className="text-sm text-gray-500">{carrier.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                          {carrier.vehicles} Araç
                        </span>
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                          {carrier.drivers} Sürücü
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(carrier.status)}`}>
                        {carrier.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{carrier.joinDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900 transition-colors" 
                          onClick={() => setShowCarrierDetailModal(carrier)}
                          title="Firma Detayları"
                        >
                          <FaBuilding className="w-5 h-5" />
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
              Toplam <span className="font-medium">{filteredCarriers.length}</span> taşıyıcı
            </div>
            <div className="flex space-x-1">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                Önceki
              </button>
              <button className="px-3 py-1 border border-gray-300 bg-orange-50 text-orange-600 rounded-md text-sm">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                Sonraki
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Taşıyıcı Detay Modal */}
      {showCarrierDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget && !showDriversModal && !showVehiclesModal && !showDocumentsModal && !showEditCarrierModal) setShowCarrierDetailModal(null);
        }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Taşıyıcı Detayları</h3>
              <button 
                onClick={() => setShowCarrierDetailModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-shrink-0">
                  <div className="flex flex-col items-center">
                    <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-3xl font-bold mb-2">
                      {showCarrierDetailModal.name.charAt(0)}
                    </div>
                    <h4 className="text-lg font-medium text-gray-900">{showCarrierDetailModal.name}</h4>
                    <p className="text-sm text-gray-500">{showCarrierDetailModal.company}</p>
                    <div className="mt-2">
                      <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(showCarrierDetailModal.status)}`}>
                        {showCarrierDetailModal.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h5 className="text-sm font-medium text-gray-800 mb-3">Taşıyıcı Bilgileri</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h6 className="font-medium text-gray-700 mb-3">Araç ve Sürücüler</h6>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">Toplam Araç</p>
                            <button 
                              onClick={() => setShowVehiclesModal(true)}
                              className="text-lg font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                            >
                              {showCarrierDetailModal.vehicles}
                              <FaTruck className="ml-2 text-sm" />
                            </button>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Toplam Sürücü</p>
                            <button 
                              onClick={() => setShowDriversModal(true)}
                              className="text-lg font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                            >
                              {showCarrierDetailModal.drivers}
                              <FaIdCard className="ml-2 text-sm" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h6 className="font-medium text-gray-700 mb-3">Performans Bilgileri</h6>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">Tamamlanan Taşımalar</p>
                            <div className="text-lg font-medium text-orange-600 flex items-center">
                              {showCarrierDetailModal.completedShipments}
                              <FaCheck className="ml-2 text-sm" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Aktif Taşımalar</p>
                            <div className="text-lg font-medium text-blue-600 flex items-center">
                              {showCarrierDetailModal.activeShipments}
                              <FaTruck className="ml-2 text-sm" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Başarı Oranı</p>
                            <div className="text-lg font-medium text-green-600 flex items-center">
                              %{Math.round((showCarrierDetailModal.completedShipments / (showCarrierDetailModal.completedShipments + Math.floor(Math.random() * 10))) * 100)}
                              <FaCheck className="ml-2 text-sm" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h5 className="text-sm font-medium text-gray-800 mb-3">Firma ve İletişim Bilgileri</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h6 className="font-medium text-gray-700 mb-3">Firma Bilgileri</h6>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <FaBuilding className="text-gray-400 mr-2" />
                        <span className="text-gray-800">{showCarrierDetailModal.company}</span>
                      </div>
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="text-gray-400 mr-2" />
                        <span className="text-gray-800">{showCarrierDetailModal.address}</span>
                      </div>
                      <div className="flex items-center">
                        <FaTags className="text-gray-400 mr-2" />
                        <span className="text-gray-800">Vergi D.: {showCarrierDetailModal.taxOffice || 'Belirtilmemiş'}</span>
                      </div>
                      <div className="flex items-center">
                        <FaIdBadge className="text-gray-400 mr-2" />
                        <span className="text-gray-800">VKN: {showCarrierDetailModal.taxNumber || 'Belirtilmemiş'}</span>
                      </div>
                      <div className="flex items-center">
                        <FaIndustry className="text-gray-400 mr-2" />
                        <span className="text-gray-800">{showCarrierDetailModal.companyType || 'Belirtilmemiş'}</span>
                      </div>
                      <div className="flex items-center">
                        <FaRegCalendarAlt className="text-gray-400 mr-2" />
                        <span className="text-gray-800">Kayıt: {showCarrierDetailModal.joinDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h6 className="font-medium text-gray-700 mb-3">İletişim Bilgileri</h6>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <FaUser className="text-gray-400 mr-2" />
                        <span className="text-gray-800">{showCarrierDetailModal.name}</span>
                      </div>
                      <div className="flex items-center">
                        <FaPhone className="text-gray-400 mr-2" />
                        <span className="text-gray-800">{showCarrierDetailModal.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <FaEnvelope className="text-gray-400 mr-2" />
                        <span className="text-gray-800">{showCarrierDetailModal.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4 flex justify-end">
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded mr-2 flex items-center"
                  onClick={() => setShowDocumentsModal(true)}
                >
                  <FaFileAlt className="mr-2" /> Belgeler
                </button>
                <button 
                  className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded mr-2"
                  onClick={() => setShowEditCarrierModal(showCarrierDetailModal)}
                >
                  <FaEdit className="mr-2 inline-block" /> Düzenle
                </button>
                <button 
                  onClick={() => toggleCarrierStatus(showCarrierDetailModal.id)}
                  className={`font-medium py-2 px-4 rounded mr-2 ${
                    showCarrierDetailModal.status === 'Aktif' 
                      ? 'bg-red-500 hover:bg-red-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {showCarrierDetailModal.status === 'Aktif' ? 'Pasif Yap' : 'Aktif Yap'}
                </button>
                <button 
                  onClick={() => setShowCarrierDetailModal(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sürücüler Listesi Modal */}
      {showCarrierDetailModal && showDriversModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget && !showDriverDocumentsModal) setShowDriversModal(false);
        }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">{showCarrierDetailModal.company} - Sürücüler</h3>
              <button 
                onClick={() => setShowDriversModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              {showCarrierDetailModal.driversList && showCarrierDetailModal.driversList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sürücü Adı</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İletişim</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ehliyet Sınıfı</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Katılım Tarihi</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktif Taşıma</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başarı Oranı</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {showCarrierDetailModal.driversList.map((driver) => (
                        <tr key={driver.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                                {driver.name.charAt(0)}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{driver.phone}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{driver.licenseType}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{driver.joinDate}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{driver.activeShipments}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2.5">
                                <div className={`h-2.5 rounded-full ${driver.successRate > 90 ? 'bg-green-600' : driver.successRate > 70 ? 'bg-yellow-500' : 'bg-red-600'}`} style={{width: `${driver.successRate}%`}}></div>
                              </div>
                              <span className="ml-2">%{driver.successRate}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <button 
                              className="text-blue-600 hover:text-blue-900 mr-3"
                              title="Belgeleri Görüntüle"
                              onClick={() => setShowDriverDocumentsModal(driver)}
                            >
                              <FaFileAlt size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Bu taşıyıcıya ait sürücü kaydı bulunmamaktadır.</p>
                </div>
              )}

              <div className="mt-6 flex justify-start">
                <button 
                  onClick={() => setShowDriversModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded flex items-center"
                >
                  <FaTimes className="mr-2" /> Geri
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Araçlar Listesi Modal */}
      {showCarrierDetailModal && showVehiclesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget) setShowVehiclesModal(false);
        }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">{showCarrierDetailModal.company} - Araç Listesi</h3>
              <button 
                onClick={() => setShowVehiclesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              {showCarrierDetailModal.vehiclesList && showCarrierDetailModal.vehiclesList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plaka</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Araç Tipi</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kapasite</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Muayene</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {showCarrierDetailModal.vehiclesList.map((vehicle) => (
                        <tr key={vehicle.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{vehicle.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{vehicle.plate}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.capacity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{vehicle.lastInspection}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              vehicle.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {vehicle.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Bu taşıyıcı için henüz araç kaydı bulunmamaktadır.</p>
                </div>
              )}

              <div className="mt-6 flex justify-start">
                <button 
                  onClick={() => setShowVehiclesModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded flex items-center"
                >
                  <FaTimes className="mr-2" /> Geri
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Belgeler Modal */}
      {showCarrierDetailModal && showDocumentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget) setShowDocumentsModal(false);
        }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">{showCarrierDetailModal.company} - Belgeler</h3>
              <button 
                onClick={() => setShowDocumentsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              {showCarrierDetailModal.documentsList && showCarrierDetailModal.documentsList.length > 0 ? (
                <>
                  <div className="mb-4">
                    <h4 className="text-lg font-medium text-gray-800 mb-2">Zorunlu Belgeler</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 mb-6">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Belge Adı</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Geçerlilik Tarihi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {showCarrierDetailModal.documentsList
                            .filter(doc => doc.type === 'Zorunlu')
                            .map((document) => (
                            <tr key={document.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                {document.name}
                                {document.type === 'Zorunlu' && <span className="text-red-500"> *</span>}
                              </td>
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

                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-2">Opsiyonel Belgeler</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Belge Adı</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Geçerlilik Tarihi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {showCarrierDetailModal.documentsList
                            .filter(doc => doc.type === 'Opsiyonel')
                            .map((document) => (
                            <tr key={document.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                {document.name}
                                {document.type === 'Zorunlu' && <span className="text-red-500"> *</span>}
                              </td>
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
                                  document.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
                  <p className="text-gray-500">Bu taşıyıcı için henüz belge kaydı bulunmamaktadır.</p>
                </div>
              )}

              <div className="mt-6 flex justify-start">
                <button 
                  onClick={() => setShowDocumentsModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded flex items-center"
                >
                  <FaTimes className="mr-2" /> Geri
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

              <div className="mt-6 flex justify-start">
                <button 
                  onClick={() => setShowDriverDocumentsModal(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded flex items-center"
                >
                  <FaTimes className="mr-2" /> Geri
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Silme Onay Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => {
          if (e.target === e.currentTarget) setShowDeleteConfirm(null);
        }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-4 border-b border-gray-200 flex items-center text-red-600">
              <FaExclamationTriangle className="mr-2" />
              <h3 className="font-semibold">Taşıyıcı Silme Onayı</h3>
            </div>
            <div className="p-6">
              <p className="mb-4">
                <span className="font-medium">{showDeleteConfirm.name} ({showDeleteConfirm.company})</span> taşıyıcısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded"
                >
                  İptal
                </button>
                <button 
                  onClick={() => deleteCarrier(showDeleteConfirm.id)}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
                >
                  Evet, Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Yeni Taşıyıcı Modal */}
      {showAddCarrierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget) setShowAddCarrierModal(false);
        }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Yeni Taşıyıcı Ekle</h3>
              <button 
                onClick={() => setShowAddCarrierModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-4">Yetkili Bilgileri</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Yetkili Adı Soyadı *</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newCarrierData.name}
                        onChange={(e) => setNewCarrierData({...newCarrierData, name: e.target.value})}
                        placeholder="Yetkili adı soyadı"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newCarrierData.phone}
                        onChange={(e) => setNewCarrierData({...newCarrierData, phone: e.target.value})}
                        placeholder="0555 123 4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                      <input 
                        type="email" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newCarrierData.email}
                        onChange={(e) => setNewCarrierData({...newCarrierData, email: e.target.value})}
                        placeholder="ornek@email.com"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-4">Firma Bilgileri</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Firma Adı *</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newCarrierData.company}
                        onChange={(e) => setNewCarrierData({...newCarrierData, company: e.target.value})}
                        placeholder="Firma adı"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                      <textarea 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newCarrierData.address}
                        onChange={(e) => setNewCarrierData({...newCarrierData, address: e.target.value})}
                        placeholder="Firma adresi"
                        rows={3}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h4 className="text-md font-medium text-gray-700 mb-4">Vergi Bilgileri</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Dairesi</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          value={newCarrierData.taxOffice}
                          onChange={(e) => setNewCarrierData({...newCarrierData, taxOffice: e.target.value})}
                          placeholder="Vergi dairesi"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Numarası</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          value={newCarrierData.taxNumber}
                          onChange={(e) => setNewCarrierData({...newCarrierData, taxNumber: e.target.value})}
                          placeholder="Vergi numarası"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Firma Türü</label>
                        <select 
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          value={newCarrierData.companyType}
                          onChange={(e) => setNewCarrierData({...newCarrierData, companyType: e.target.value})}
                        >
                          <option value="">Seçiniz</option>
                          <option value="Şahıs Firması">Şahıs Firması</option>
                          <option value="Limited Şirket">Limited Şirket</option>
                          <option value="Anonim Şirket">Anonim Şirket</option>
                          <option value="Diğer">Diğer</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tescil Numarası</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          value={newCarrierData.registrationNumber}
                          onChange={(e) => setNewCarrierData({...newCarrierData, registrationNumber: e.target.value})}
                          placeholder="Tescil numarası"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-md font-medium text-gray-700 mb-4">Gerekli Belgeler</h4>
                <div className="bg-orange-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-orange-800">
                    <strong>Not:</strong> Taşıyıcı kaydı oluşturulduktan sonra aşağıdaki belgeleri yüklemeniz gerekmektedir:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-sm text-orange-800">
                    <li>K1 Belgesi *</li>
                    <li>Taşımacılık Yetki Belgesi *</li>
                    <li>Vergi Levhası *</li>
                    <li>Sicil Gazetesi *</li>
                    <li>İmza Sirküleri *</li>
                  </ul>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={() => setShowAddCarrierModal(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded"
                  >
                    İptal
                  </button>
                  <button 
                    onClick={addNewCarrier}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded"
                    disabled={!newCarrierData.name || !newCarrierData.company || !newCarrierData.phone}
                  >
                    Taşıyıcı Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Taşıyıcı Düzenleme Modal */}
      {showEditCarrierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget) setShowEditCarrierModal(null);
        }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Taşıyıcı Düzenle: {showEditCarrierModal.company}</h3>
              <button 
                onClick={() => setShowEditCarrierModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-4">Yetkili Bilgileri</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Yetkili Adı Soyadı *</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        defaultValue={showEditCarrierModal.name}
                        onChange={(e) => setShowEditCarrierModal({...showEditCarrierModal, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefon *</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        defaultValue={showEditCarrierModal.phone}
                        onChange={(e) => setShowEditCarrierModal({...showEditCarrierModal, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                      <input 
                        type="email" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        defaultValue={showEditCarrierModal.email}
                        onChange={(e) => setShowEditCarrierModal({...showEditCarrierModal, email: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-4">Firma Bilgileri</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Firma Adı *</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        defaultValue={showEditCarrierModal.company}
                        onChange={(e) => setShowEditCarrierModal({...showEditCarrierModal, company: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                      <textarea 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        defaultValue={showEditCarrierModal.address}
                        onChange={(e) => setShowEditCarrierModal({...showEditCarrierModal, address: e.target.value})}
                        rows={3}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h4 className="text-md font-medium text-gray-700 mb-4">Vergi Bilgileri</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Dairesi</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          defaultValue={showEditCarrierModal.taxOffice}
                          onChange={(e) => setShowEditCarrierModal({...showEditCarrierModal, taxOffice: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vergi Numarası</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          defaultValue={showEditCarrierModal.taxNumber}
                          onChange={(e) => setShowEditCarrierModal({...showEditCarrierModal, taxNumber: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Firma Türü</label>
                        <select 
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          defaultValue={showEditCarrierModal.companyType}
                          onChange={(e) => setShowEditCarrierModal({...showEditCarrierModal, companyType: e.target.value})}
                        >
                          <option value="">Seçiniz</option>
                          <option value="Şahıs Firması">Şahıs Firması</option>
                          <option value="Limited Şirket">Limited Şirket</option>
                          <option value="Anonim Şirket">Anonim Şirket</option>
                          <option value="Diğer">Diğer</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tescil Numarası</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          defaultValue={showEditCarrierModal.registrationNumber}
                          onChange={(e) => setShowEditCarrierModal({...showEditCarrierModal, registrationNumber: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Durumu</label>
                        <select 
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          defaultValue={showEditCarrierModal.status}
                          onChange={(e) => setShowEditCarrierModal({...showEditCarrierModal, status: e.target.value})}
                        >
                          <option value="Aktif">Aktif</option>
                          <option value="Pasif">Pasif</option>
                          <option value="Beklemede">Beklemede</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={() => setShowEditCarrierModal(null)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded"
                  >
                    İptal
                  </button>
                  <button 
                    onClick={() => updateCarrier(showEditCarrierModal)}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded"
                    disabled={!showEditCarrierModal.name || !showEditCarrierModal.company || !showEditCarrierModal.phone}
                  >
                    Değişiklikleri Kaydet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
} 