'use client'

import React, { useState, useEffect } from 'react'
import { FaPlus, FaSearch, FaEdit, FaTrash, FaUserShield, FaIdCard, FaTruck, FaTimes, FaCheck, FaMapMarkerAlt, FaPhone, FaEnvelope, FaCalendarAlt, FaExclamationTriangle, FaBuilding, FaFileAlt, FaEye, FaExclamationCircle, FaTags, FaRegCalendarAlt, FaIndustry, FaIdBadge, FaUser, FaSpinner, FaUpload } from 'react-icons/fa'
import AdminLayout from '../../components/admin/Layout'
import { useRouter } from 'next/router'
import axios from 'axios'
import Head from 'next/head'

// Belge türleri sabiti
const DOCUMENT_TYPES = [
  { id: 'vergi', name: 'Vergi Levhası', required: true, hasExpiryDate: false },
  { id: 'sicil', name: 'Ticaret Sicil Gazetesi', required: true, hasExpiryDate: false },
  { id: 'imza', name: 'İmza Sirküleri', required: true, hasExpiryDate: false },
  { id: 'k1', name: 'K1 Belgesi', required: false, hasExpiryDate: true },
  { id: 'k2', name: 'K2 Belgesi', required: false, hasExpiryDate: true },
  { id: 'k3', name: 'K3 Belgesi', required: false, hasExpiryDate: true }
];

export default function CarriersPage() {
  const router = useRouter()
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [carriers, setCarriers] = useState([])
  const [newCarrierData, setNewCarrierData] = useState({
    name: '',
    contactPerson: '',
    company: '',
    phone: '',
    email: '',
    address: '',
    taxOffice: '',
    taxNumber: '',
    companyType: '',
    registrationNumber: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCarriers, setTotalCarriers] = useState(0)
  const [status, setStatus] = useState('')
  // İstatistik sayıları için yeni state'ler
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    documentRequired: 0
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

  // Belge durumunu kontrol et ve güncelle
  const checkDocumentStatus = (carrier) => {
    if (!carrier.documents || carrier.documents.length === 0) {
      return 'belge_bekliyor';
    }

    const hasExpiredDocuments = carrier.documents.some(doc => {
      if (!doc.expiryDate) return false;
      const expiryDate = new Date(doc.expiryDate);
      return expiryDate < new Date();
    });

    if (hasExpiredDocuments) {
      return 'suresi_gecmis_belge';
    }

    return 'active';
  };

  // Taşıyıcıları API'den çekme
  useEffect(() => {
    const fetchCarriers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');
        
        if (!token || !userData) {
          console.log('Token veya kullanıcı bilgisi bulunamadı, login sayfasına yönlendiriliyor');
          router.replace('/admin');
          return;
        }

        const user = JSON.parse(userData);
        const allowedRoles = ['admin', 'super_admin', 'editor', 'support'];
        const hasAllowedRole = user.roles?.some(role => allowedRoles.includes(role)) || allowedRoles.includes(user.role);
        
        if (!hasAllowedRole) {
          console.log('Bu sayfaya erişim yetkiniz yok');
          router.replace('/admin/dashboard');
          return;
        }
        
        // Tüm taşıyıcıları çek - istatistikler için
        const allCarriersResponse = await axios.get(`/api/admin/carriers`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            page: 1,
            limit: 1000 // Tüm taşıyıcıları almak için yüksek limit
          }
        });

        // İstatistikleri hesapla ve state'e kaydet
        if (allCarriersResponse.data && allCarriersResponse.data.carriers) {
          const allCarriers = allCarriersResponse.data.carriers;
          
          const activeCount = allCarriers.filter(c => checkDocumentStatus(c) === 'active').length;
          const pendingCount = allCarriers.filter(c => c.status === 'pending').length;
          const documentRequiredCount = allCarriers.filter(c => {
            const status = checkDocumentStatus(c);
            return status === 'belge_bekliyor' || status === 'suresi_gecmis_belge';
          }).length;

          setStats({
            total: allCarriers.length,
            active: activeCount,
            pending: pendingCount,
            documentRequired: documentRequiredCount
          });
        }

        // Filtrelenmiş taşıyıcıları çek - tablo için
        const filteredResponse = await axios.get(`/api/admin/carriers`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            search: searchTerm,
            status: status,
            page: currentPage,
            limit: 10
          }
        });

        if (filteredResponse.data && filteredResponse.data.carriers) {
          const updatedCarriers = filteredResponse.data.carriers.map(carrier => ({
            ...carrier,
            status: checkDocumentStatus(carrier)
          }));
          setCarriers(updatedCarriers);
          setTotalPages(filteredResponse.data.totalPages || 1);
          setTotalCarriers(filteredResponse.data.total || 0);
        }

      } catch (error) {
        console.error('Nakliyeciler yüklenirken hata:', error);
        
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          router.replace('/admin');
          return;
        }
        
        setError('Nakliyeci verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    
    if (router.isReady) {
      fetchCarriers();
    }
  }, [router.isReady, currentPage, searchTerm, status]);

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
  const addNewCarrier = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.log('Token bulunamadı, login sayfasına yönlendiriliyor');
        router.replace('/admin');
        return;
      }
      
      // API çağrısı
      const response = await axios.post('/api/admin/carriers', newCarrierData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.success) {
        // Taşıyıcı eklendi, listeyi yenile
        const updatedCarriers = await axios.get('/api/admin/carriers', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (updatedCarriers.data && updatedCarriers.data.carriers) {
          setCarriers(updatedCarriers.data.carriers);
        }
        
        // Modal'ı kapat ve formu sıfırla
        setShowAddCarrierModal(false);
    setNewCarrierData({
      name: '',
          contactPerson: '',
      company: '',
      phone: '',
      email: '',
      address: '',
      taxOffice: '',
      taxNumber: '',
      companyType: '',
      registrationNumber: '',
    });
      }
    } catch (error) {
      console.error('Taşıyıcı eklenirken hata:', error);
      alert('Taşıyıcı eklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
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
    if (status === 'active') return carrier.status === 'active';
    if (status === 'inactive') return carrier.status === 'inactive';
    if (status === 'pending') return carrier.status === 'pending';
    if (status === 'belge_bekliyor') return carrier.status === 'belge_bekliyor';
    if (status === 'suresi_gecmis_belge') return carrier.status === 'suresi_gecmis_belge';
    if (status === 'suspended') return carrier.status === 'suspended';
    if (status === 'blocked') return carrier.status === 'blocked';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Onay Bekliyor</span>;
      case 'belge_bekliyor':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Belge Bekliyor</span>;
      case 'suresi_gecmis_belge':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Süresi Geçmiş Belge</span>;
      case 'active':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Aktif</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Pasif</span>;
      case 'suspended':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Askıya Alınmış</span>;
      case 'blocked':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Engellenmiş</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Bilinmiyor</span>;
    }
  };

  const getDocumentStatus = (status) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Onaylandı</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Reddedildi</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">İnceleniyor</span>;
      case 'expired':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Süresi Dolmuş</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Bilinmiyor</span>;
    }
  };

  const getVehicleStatus = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Aktif</span>;
      case 'maintenance':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Bakımda</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Pasif</span>;
      case 'repair':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Tamirde</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Bilinmiyor</span>;
    }
  };

  const getDriverStatus = (status) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Aktif</span>;
      case 'on_leave':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">İzinde</span>;
      case 'inactive':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Pasif</span>;
      case 'suspended':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Askıya Alınmış</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Bilinmiyor</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Taşıyıcılar - TaşıApp Admin</title>
      </Head>
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
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-auto">
                <input 
                  type="text" 
                  placeholder="Taşıyıcı ara..."
                  className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
                <option value="pending">Onay Bekliyor</option>
                <option value="belge_bekliyor">Belge Bekliyor</option>
                <option value="suresi_gecmis_belge">Süresi Geçmiş Belge</option>
                <option value="suspended">Askıya Alınmış</option>
                <option value="blocked">Engellenmiş</option>
              </select>
              <button 
                className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                onClick={() => setShowAddCarrierModal(true)}
              >
                <FaPlus className="mr-2" /> Yeni Taşıyıcı
              </button>
            </div>
          </div>

          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Toplam Taşıyıcı */}
            <div 
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setStatus(null)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Taşıyıcı</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Aktif Taşıyıcılar */}
            <div 
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setStatus('active')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aktif Taşıyıcılar</p>
                  <p className="text-2xl font-semibold text-green-600">{stats.active}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Onay Bekleyen */}
            <div 
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setStatus('pending')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Onay Bekleyen</p>
                  <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Belge Bekleyen */}
            <div 
              className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setStatus('belge_bekliyor')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Belge Bekleyen</p>
                  <p className="text-2xl font-semibold text-red-600">{stats.documentRequired}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
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
                    <tr key={carrier?.id || Math.random()} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{carrier?.carrierId || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                            {carrier?.name ? carrier.name.charAt(0) : '?'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{carrier?.name || 'İsimsiz Taşıyıcı'}</div>
                            <div className="text-sm text-gray-500">{carrier?.company || 'Firma Adı Yok'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{carrier?.phone || 'Telefon Yok'}</div>
                        <div className="text-sm text-gray-500">{carrier?.email || 'E-posta Yok'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex space-x-2">
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                            {carrier?.vehicles || 0} Araç
                          </span>
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                            {carrier?.drivers || 0} Sürücü
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(carrier?.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{carrier?.createdAt ? new Date(carrier.createdAt).toLocaleDateString('tr-TR') : 'Tarih Yok'}</td>
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
                        {showCarrierDetailModal?.name ? showCarrierDetailModal.name.charAt(0) : '?'}
                      </div>
                      <h4 className="text-lg font-medium text-gray-900">{showCarrierDetailModal?.name || 'İsimsiz Taşıyıcı'}</h4>
                      <p className="text-sm text-gray-500">{showCarrierDetailModal?.company || 'Firma Adı Yok'}</p>
                      <div className="mt-2">
                        {getStatusBadge(showCarrierDetailModal?.status)}
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
                          <span className="text-gray-800">Kayıt: {showCarrierDetailModal?.createdAt ? new Date(showCarrierDetailModal.createdAt).toLocaleDateString('tr-TR') : 'Tarih Yok'}</span>
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
                  {showCarrierDetailModal.status === 'suresi_gecmis_belge' && (
                    <button 
                      onClick={() => {
                        const updatedCarrier = {
                          ...showCarrierDetailModal,
                          status: 'active'
                        };
                        setCarriers(prevCarriers =>
                          prevCarriers.map(carrier =>
                            carrier.id === updatedCarrier.id ? updatedCarrier : carrier
                          )
                        );
                        setShowCarrierDetailModal(updatedCarrier);
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded mr-2"
                    >
                      <FaCheck className="mr-2 inline-block" /> Aktif Yap
                    </button>
                  )}
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
                              {getVehicleStatus(vehicle.status)}
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
                        {DOCUMENT_TYPES.filter(doc => doc.required).map((documentType) => {
                          const documents = showCarrierDetailModal.documentsList?.filter(doc => doc.type === documentType.id) || [];
                          return (
                            <tr key={documentType.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                {documentType.name}
                                <span className="text-red-500 ml-1">*</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {documents.length > 0 ? (
                                  documents.map((doc, index) => (
                                    <div key={index} className="flex items-center">
                                      {doc.status === 'Süresi Dolmuş' ? (
                                        <><FaExclamationCircle className="text-red-500 mr-2" /> {doc.validUntil}</>
                                      ) : doc.validUntil ? (
                                        <>{doc.validUntil}</>
                                      ) : (
                                        <span className="text-gray-400">Geçerlilik Tarihi Yok</span>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-gray-400">Geçerlilik Tarihi Yok</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getDocumentStatus(documents[0]?.status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {documents.map((doc, index) => (
                                  <button 
                                    key={index}
                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                    title="Belgeyi Görüntüle"
                                    onClick={() => window.open(doc.fileUrl, '_blank')}
                                  >
                                    <FaEye size={18} />
                                  </button>
                                ))}
                                <button 
                                  className="text-orange-600 hover:text-orange-900 mr-3"
                                  title="Belge Yükle"
                                  onClick={() => {/* Belge yükleme fonksiyonu */}}
                                >
                                  <FaUpload size={18} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-lg font-medium text-gray-800 mb-2">K Belgeleri (En az biri zorunlu)</h4>
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
                        {DOCUMENT_TYPES.filter(doc => ['k1', 'k2', 'k3'].includes(doc.id)).map((documentType) => {
                          const documents = showCarrierDetailModal.documentsList?.filter(doc => doc.type === documentType.id) || [];
                          return (
                            <tr key={documentType.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                {documentType.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {documents.length > 0 ? (
                                  documents.map((doc, index) => (
                                    <div key={index} className="flex items-center">
                                      {doc.status === 'Süresi Dolmuş' ? (
                                        <><FaExclamationCircle className="text-red-500 mr-2" /> {doc.validUntil}</>
                                      ) : doc.validUntil ? (
                                        <>{doc.validUntil}</>
                                      ) : (
                                        <span className="text-gray-400">Geçerlilik Tarihi Yok</span>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-gray-400">Geçerlilik Tarihi Yok</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getDocumentStatus(documents[0]?.status)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {documents.map((doc, index) => (
                                  <button 
                                    key={index}
                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                    title="Belgeyi Görüntüle"
                                    onClick={() => window.open(doc.fileUrl, '_blank')}
                                  >
                                    <FaEye size={18} />
                                  </button>
                                ))}
                                <button 
                                  className="text-orange-600 hover:text-orange-900 mr-3"
                                  title="Belge Yükle"
                                  onClick={() => {/* Belge yükleme fonksiyonu */}}
                                >
                                  <FaUpload size={18} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

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
                      <li>K Belgesi *</li>
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
    </>
  )
} 