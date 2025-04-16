import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import PortalLayout from '../../components/portal/Layout';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaFileAlt, FaUpload, FaDownload, FaExclamationTriangle, FaCheckCircle, FaTruck, FaMotorcycle, FaBox, FaPallet, FaWarehouse, FaShippingFast, FaMapMarkedAlt, FaCheck, FaTimes as FaClose, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { LoadScript } from '@react-google-maps/api';
import axios from 'axios';
import Head from 'next/head';

// Harita bileşenini dinamik olarak yükle (SSR sorunlarını önlemek için)
const Map = dynamic(() => import('../../components/Map'), { ssr: false });

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingServiceAreas, setIsEditingServiceAreas] = useState(false);
  const [isEditingTransportTypes, setIsEditingTransportTypes] = useState(false);
  const [activeTab, setActiveTab] = useState('company'); // 'company', 'documents', 'transport', 'serviceAreas'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    taxNumber: '',
    taxOffice: '',
    address: '',
    district: '',
    city: '',
    country: '',
    website: '',
    description: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Taşıma tipleri
  const [transportTypes, setTransportTypes] = useState([
    { id: 1, name: 'Motokurye', icon: FaMotorcycle, description: 'Hızlı ve küçük paket teslimatları için motosiklet ile taşıma hizmeti' },
    { id: 2, name: 'Araçlı Kurye', icon: FaTruck, description: 'Şehir içi kurye hizmetleri için araç ile taşıma' },
    { id: 3, name: 'Evden Eve Nakliyat', icon: FaBox, description: 'Ev ve ofis taşıma hizmetleri' },
    { id: 4, name: 'Şehir İçi Koli Taşıma', icon: FaShippingFast, description: 'Şehir içi koli ve paket taşıma hizmetleri' },
    { id: 5, name: 'Şehirler Arası Paletli Taşıma', icon: FaPallet, description: 'Şehirler arası paletli yük taşıma hizmetleri' },
    { id: 6, name: 'Depo Hizmetleri', icon: FaWarehouse, description: 'Depolama ve stok yönetimi hizmetleri' },
    { id: 7, name: 'Soğuk Zincir Taşımacılığı', icon: FaTruck, description: 'Gıda ve ilaç gibi soğuk zincir gerektiren ürünlerin taşınması' },
    { id: 8, name: 'Proje Taşımacılığı', icon: FaTruck, description: 'Özel projeler için özel taşıma hizmetleri' },
    { id: 9, name: 'Tehlikeli Madde Taşımacılığı', icon: FaTruck, description: 'Tehlikeli madde taşıma hizmetleri' },
    { id: 10, name: 'Uluslararası Taşımacılık', icon: FaShippingFast, description: 'Sınır ötesi taşıma hizmetleri' }
  ]);

  // Seçili taşıma tipleri (örnek olarak)
  const [selectedTransportTypes, setSelectedTransportTypes] = useState([]);

  // Hizmet bölgeleri için state
  const [serviceAreas, setServiceAreas] = useState({
    pickup: [], // Alınacak adresler
    delivery: [] // Teslim edilecek adresler
  });
  
  // Kullanıcı profil bilgilerini getir
  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // Kullanıcının token'ını al
      const token = localStorage.getItem('token');
      
      // API'ye profil bilgileri için istek gönder
      const profileResponse = await axios.get('/api/portal/profile', {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      
      if (profileResponse.data.success) {
        const userData = profileResponse.data.user;
        setUser(userData);
        
        // Form verilerini doldur
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          company: userData.company || '',
          taxNumber: userData.taxNumber || '',
          taxOffice: userData.taxOffice || '',
          address: userData.address || '',
          district: userData.district || '',
          city: userData.city || '',
          country: userData.country || '',
          website: userData.website || '',
          description: userData.description || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Taşıma tiplerini doldur
        if (userData.transportTypes && userData.transportTypes.length > 0) {
          setSelectedTransportTypes(userData.transportTypes);
        }
        
        // Hizmet bölgelerini doldur
        if (userData.serviceAreas) {
          setServiceAreas(userData.serviceAreas);
        }
      } else {
        console.error('Profil verileri alınamadı');
        setError('Profil bilgileri yüklenirken bir hata oluştu');
        
        // Örnek veri kullan
        useMockData();
      }
    } catch (err) {
      console.error('Profil verileri çekilirken hata:', err);
      setError('Profil bilgileri çekilirken bir hata oluştu');
      
      // Örnek veri kullan
      useMockData();
    } finally {
      setLoading(false);
    }
  };
  
  // API bağlantısı yapılamazsa örnek veri kullan
  const useMockData = () => {
    // Örnek kullanıcı verisi
    const mockUser = {
      id: 'user123',
      name: 'Ahmet Yılmaz',
      email: 'ahmet@tasiapp.com',
      phone: '0532 123 4567',
      company: 'ABC Lojistik Ltd. Şti.',
      taxNumber: '1234567890',
      taxOffice: 'İstanbul',
      address: 'Atatürk Cad. No:123',
      district: 'Kadıköy',
      city: 'İstanbul',
      country: 'Türkiye',
      website: 'www.abclojistik.com',
      description: 'ABC Lojistik olarak 10 yıldır lojistik sektöründe hizmet vermekteyiz.',
      transportTypes: [1, 2, 4, 5],
      serviceAreas: {
        pickup: [
          { id: 1, city: 'İstanbul', districts: [3401, 3404, 3406] },
          { id: 2, city: 'Ankara', districts: [601, 602] }
        ],
        delivery: [
          { id: 1, city: 'İstanbul', districts: [3401, 3402, 3403, 3404, 3405] },
          { id: 2, city: 'Ankara', districts: [601, 602, 603, 604] },
          { id: 3, city: 'İzmir', districts: [] }
        ]
      }
    };
    
    setUser(mockUser);
    
    // Form verilerini doldur
    setFormData({
      name: mockUser.name || '',
      email: mockUser.email || '',
      phone: mockUser.phone || '',
      company: mockUser.company || '',
      taxNumber: mockUser.taxNumber || '',
      taxOffice: mockUser.taxOffice || '',
      address: mockUser.address || '',
      district: mockUser.district || '',
      city: mockUser.city || '',
      country: mockUser.country || '',
      website: mockUser.website || '',
      description: mockUser.description || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    // Taşıma tiplerini doldur
    if (mockUser.transportTypes && mockUser.transportTypes.length > 0) {
      setSelectedTransportTypes(mockUser.transportTypes);
    }
    
    // Hizmet bölgelerini doldur
    if (mockUser.serviceAreas) {
      setServiceAreas(mockUser.serviceAreas);
    }
  };

  useEffect(() => {
    // Kullanıcı kontrolü
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/portal/login');
      return;
    }
    
    // Profil verilerini getir
    fetchProfileData();
  }, [router]);

  // Profil bilgilerini güncelleme
  const updateProfile = async () => {
    try {
      setLoading(true);
      
      // Kullanıcının token'ını al
      const token = localStorage.getItem('token');
      
      // API'ye istek gönder
      const response = await axios.put('/api/portal/profile', formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      
      if (response.data.success) {
        setSuccess('Profil bilgileriniz başarıyla güncellendi');
        setIsEditing(false);
        
        // Başarı mesajını 3 saniye sonra kaldır
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError(response.data.message || 'Profil güncellenirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Profil güncellenirken hata:', err);
      setError('Profil güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  // Taşıma tiplerini güncelleme
  const updateTransportTypes = async () => {
    try {
      setLoading(true);
      
      // Kullanıcının token'ını al
      const token = localStorage.getItem('token');
      
      // API'ye istek gönder
      const response = await axios.put('/api/portal/transport-types', {
        transportTypes: selectedTransportTypes
      }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      
      if (response.data.success) {
        setSuccess('Taşıma tipleriniz başarıyla güncellendi');
        setIsEditingTransportTypes(false);
        
        // Başarı mesajını 3 saniye sonra kaldır
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError(response.data.message || 'Taşıma tipleri güncellenirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Taşıma tipleri güncellenirken hata:', err);
      setError('Taşıma tipleri güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  // Hizmet bölgelerini güncelleme
  const updateServiceAreas = async () => {
    try {
      setLoading(true);
      
      // Kullanıcının token'ını al
      const token = localStorage.getItem('token');
      
      // API'ye istek gönder
      const response = await axios.put('/api/portal/service-areas', {
        serviceAreas
      }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      
      if (response.data.success) {
        setSuccess('Hizmet bölgeleriniz başarıyla güncellendi');
        setIsEditingServiceAreas(false);
        
        // Başarı mesajını 3 saniye sonra kaldır
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      } else {
        setError(response.data.message || 'Hizmet bölgeleri güncellenirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Hizmet bölgeleri güncellenirken hata:', err);
      setError('Hizmet bölgeleri güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Taşıma tipi seçimini değiştirme fonksiyonu
  const toggleTransportType = (typeId) => {
    setSelectedTransportTypes(prev => {
      if (prev.includes(typeId)) {
        return prev.filter(id => id !== typeId);
      } else {
        return [...prev, typeId];
      }
    });
  };

  // Taşıma tiplerini kaydetme fonksiyonu
  const saveTransportTypes = () => {
    // Burada API'ye taşıma tiplerini kaydetme isteği yapılacak
    console.log('Taşıma tipleri kaydediliyor:', selectedTransportTypes);
    setIsEditingTransportTypes(false);
  };

  // Taşıyıcı belgeleri
  const [documents] = useState([
    {
      id: 1,
      name: 'Vergi Levhası',
      required: true,
      hasExpiry: false,
      status: 'uploaded',
      expiryDate: null,
      uploadDate: '15.03.2023',
      fileUrl: '/documents/tax-certificate.pdf'
    },
    {
      id: 2,
      name: 'Ticaret Sicil Gazetesi',
      required: true,
      hasExpiry: false,
      status: 'uploaded',
      expiryDate: null,
      uploadDate: '15.03.2023',
      fileUrl: '/documents/trade-registry.pdf'
    },
    {
      id: 3,
      name: 'İmza Sirküleri',
      required: true,
      hasExpiry: false,
      status: 'uploaded',
      expiryDate: null,
      uploadDate: '15.03.2023',
      fileUrl: '/documents/signature-circular.pdf'
    },
    {
      id: 4,
      name: 'Ulaştırma Bakanlığı Yetki Belgesi',
      required: true,
      hasExpiry: true,
      status: 'expired',
      expiryDate: '01.01.2023',
      uploadDate: '01.01.2022',
      fileUrl: '/documents/transport-authority.pdf'
    },
    {
      id: 5,
      name: 'Sigorta Poliçesi',
      required: true,
      hasExpiry: true,
      status: 'pending',
      expiryDate: '15.06.2024',
      uploadDate: '15.06.2023',
      fileUrl: '/documents/insurance-policy.pdf'
    },
    {
      id: 6,
      name: 'ISO 9001 Belgesi',
      required: false,
      hasExpiry: true,
      status: 'uploaded',
      expiryDate: '31.12.2024',
      uploadDate: '31.12.2021',
      fileUrl: '/documents/iso-certificate.pdf'
    },
    {
      id: 7,
      name: 'OHSAS 18001 Belgesi',
      required: false,
      hasExpiry: true,
      status: 'uploaded',
      expiryDate: '30.09.2024',
      uploadDate: '30.09.2021',
      fileUrl: '/documents/ohsas-certificate.pdf'
    },
    {
      id: 8,
      name: 'Araç Filosu Listesi',
      required: true,
      hasExpiry: false,
      status: 'uploaded',
      expiryDate: null,
      uploadDate: '10.03.2023',
      fileUrl: '/documents/fleet-list.pdf'
    }
  ]);

  // Belge yükleme
  const uploadDocument = async (documentId, file) => {
    try {
      // Form data oluştur
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentId', documentId);
      
      // Kullanıcının token'ını al
      const token = localStorage.getItem('token');
      
      // API'ye istek gönder
      const response = await axios.post('/api/portal/upload-document', formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setSuccess('Belge başarıyla yüklendi');
        
        // Profil verilerini yeniden yükle
        fetchProfileData();
        
        // Başarı mesajını 3 saniye sonra kaldır
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
    } else {
        setError(response.data.message || 'Belge yüklenirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Belge yüklenirken hata:', err);
      setError('Belge yüklenirken bir hata oluştu');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile();
  };

  const handleUploadDocument = (documentId) => {
    // Dosya input elementini programatik olarak tıkla
    const fileInput = document.getElementById(`document-${documentId}`);
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleFileChange = (e, documentId) => {
    const file = e.target.files[0];
    if (file) {
      uploadDocument(documentId, file);
    }
  };

  const handleDownloadDocument = (fileUrl) => {
    window.open(fileUrl, '_blank');
  };

  const getDocumentStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FaCheckCircle className="text-green-500 h-5 w-5" />;
      case 'rejected':
        return <FaTimes className="text-red-500 h-5 w-5" />;
      case 'pending':
        return <FaExclamationTriangle className="text-yellow-500 h-5 w-5" />;
      default:
        return <FaUpload className="text-gray-500 h-5 w-5" />;
    }
  };

  const getDocumentStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Onaylandı';
      case 'rejected':
        return 'Reddedildi';
      case 'pending':
        return 'İnceleniyor';
      case 'expired':
        return 'Süresi Doldu';
      default:
        return 'Yüklenmedi';
    }
  };

  const isDocumentExpired = (document) => {
    if (!document.expiryDate) return false;
    const today = new Date();
    const expiry = new Date(document.expiryDate);
    return today > expiry;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <PortalLayout title="Profil">
      <div className="max-w-5xl mx-auto">
        {/* Tab Menüsü */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('company')}
              className={`${
                activeTab === 'company'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <FaBuilding className="mr-2" />
              Firma Bilgileri
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <FaFileAlt className="mr-2" />
              Belgeler
            </button>
            <button
              onClick={() => setActiveTab('transport')}
              className={`${
                activeTab === 'transport'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <FaTruck className="mr-2" />
              Taşıma Tipleri
            </button>
            <button
              onClick={() => setActiveTab('serviceAreas')}
              className={`${
                activeTab === 'serviceAreas'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <FaMapMarkedAlt className="mr-2" />
              Hizmet Bölgeleri
            </button>
          </nav>
        </div>

        {activeTab === 'company' ? (
          /* Firma Bilgileri */
          <div className="bg-white shadow rounded-lg">
            {/* Profil Başlığı */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Firma Bilgileri</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    isEditing
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <FaTimes />
                      <span>İptal</span>
                    </>
                  ) : (
                    <>
                      <FaEdit />
                      <span>Düzenle</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Profil Formu */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              {success && (
                <div className="rounded-md bg-green-50 p-4">
                  <div className="text-sm text-green-700">{success}</div>
                </div>
              )}

              {/* Firma Adı */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Firma Adı
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBuilding className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
              </div>

              {/* Adres */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adres
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
              </div>

              {/* İlçe ve İl */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İlçe
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={districtSearch}
                      onChange={(e) => {
                        setDistrictSearch(e.target.value);
                        setShowDistrictDropdown(true);
                        setSelectedDistrictIndex(-1);
                      }}
                      onFocus={() => setShowDistrictDropdown(true)}
                      onKeyDown={handleDistrictKeyDown}
                      placeholder="İlçe Ara..."
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      disabled={!isEditing || !formData.city}
                    />
                    {showDistrictDropdown && isEditing && formData.city && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredDistricts.map((district, index) => (
                          <div
                            key={district.id}
                            className={`px-3 py-2 cursor-pointer ${
                              index === selectedDistrictIndex 
                                ? 'bg-orange-100 text-orange-800' 
                                : 'hover:bg-gray-100'
                            }`}
                            onClick={() => handleDistrictSelect(district, index)}
                          >
                            {district.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    İl
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={citySearch}
                      onChange={(e) => {
                        setCitySearch(e.target.value);
                        setShowCityDropdown(true);
                        setSelectedCityIndex(-1);
                      }}
                      onFocus={() => setShowCityDropdown(true)}
                      onKeyDown={handleCityKeyDown}
                      placeholder="İl Ara..."
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    {showCityDropdown && isEditing && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredCities.map((city, index) => (
                          <div
                            key={city.id}
                            className={`px-3 py-2 cursor-pointer ${
                              index === selectedCityIndex 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'hover:bg-gray-100'
                            }`}
                            onClick={() => {
                              handleInputChange({ target: { name: 'city', value: city.id } });
                              setCitySearch(city.name);
                              setShowCityDropdown(false);
                              setSelectedCityIndex(-1);
                              setDistrictSearch('');
                            }}
                          >
                            {city.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Vergi Dairesi ve Vergi Numarası */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vergi Dairesi
                  </label>
                  <input
                    type="text"
                    name="taxOffice"
                    value={formData.taxOffice}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vergi Numarası
                  </label>
                  <input
                    type="text"
                    name="taxNumber"
                    value={formData.taxNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
              </div>

              {/* Yetkili Kişi ve Cep Telefon */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yetkili Kişi
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cep Telefon
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="absolute inset-y-0 left-5 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500">+90</span>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="5XX XXX XX XX"
                      maxLength="10"
                      className="block w-full pl-16 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* E-posta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
              </div>

              {/* Firma Açıklaması */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Firma Açıklaması
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  rows="4"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              {/* Kaydet Butonu */}
              {isEditing && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FaSave />
                    <span>Kaydet</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        ) : activeTab === 'documents' ? (
          /* Belgeler */
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Taşıyıcı Belgeleri</h2>
              <p className="mt-1 text-sm text-gray-500">
                Taşıyıcı olarak çalışabilmek için gerekli belgeleri yükleyin veya güncelleyin.
              </p>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b-2 border-gray-300">
                        Belge Adı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b-2 border-gray-300">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b-2 border-gray-300">
                        Yükleme Tarihi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b-2 border-gray-300">
                        Geçerlilik Tarihi
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b-2 border-gray-300">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-300">
                    {documents.map((document) => (
                      <tr key={document.id} className={`${isDocumentExpired(document) ? 'bg-yellow-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaFileAlt className="h-5 w-5 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{document.name}</div>
                              {document.required && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                  Zorunlu
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getDocumentStatusIcon(document.status)}
                            <span className="ml-2 text-sm text-gray-900">{getDocumentStatusText(document.status)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {document.uploadDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {document.hasExpiry ? document.expiryDate : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {document.status === 'uploaded' && (
                              <button
                                onClick={() => handleDownloadDocument(document.fileUrl)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <FaDownload className="h-5 w-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleUploadDocument(document.id)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <FaUpload className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeTab === 'transport' ? (
          /* Taşıma Tipleri */
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Taşıma Tipleri</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Firma olarak sunduğunuz taşıma hizmet tipleri. Taşıma hizmet tiplerine göre talepler alacaksınız.
                  </p>
                </div>
                {isEditingTransportTypes ? (
                  <button
                    onClick={saveTransportTypes}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FaSave />
                    <span>Kaydet</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingTransportTypes(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <FaEdit />
                    <span>Düzenle</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {transportTypes.map((type) => {
                  const isSelected = selectedTransportTypes.includes(type.id);
                  const Icon = type.icon;
                  
                  return (
                    <div 
                      key={type.id} 
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected 
                          ? 'border-orange-500 bg-orange-50 hover:bg-orange-100' 
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      } ${!isEditingTransportTypes && 'cursor-default'}`}
                      onClick={() => isEditingTransportTypes && toggleTransportType(type.id)}
                    >
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full ${
                          isSelected 
                            ? 'bg-orange-100 text-orange-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className={`ml-3 text-sm font-medium ${
                          isSelected 
                            ? 'text-orange-700' 
                            : 'text-gray-500'
                        }`}>
                          {type.name}
                        </h3>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        {type.description}
                      </p>
                      {isSelected && (
                        <div className="mt-2 flex items-center text-xs text-orange-600">
                          <FaCheckCircle className="h-3 w-3 mr-1" />
                          <span>Bu hizmeti sunuyorsunuz</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Hizmet Bölgeleri */
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Hizmet Bölgeleri</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Hizmet verdiğiniz alınacak ve teslim edilecek adres bölgelerini belirleyin.
                  </p>
                </div>
                {isEditingServiceAreas ? (
                  <button
                    onClick={updateServiceAreas}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    <FaSave />
                    <span>Kaydet</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingServiceAreas(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <FaEdit />
                    <span>Düzenle</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {/* Harita Görünümü */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hizmet Bölgeleri Haritası</h3>
                <div className="h-96 border border-gray-300 rounded-lg overflow-hidden">
                  <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
                    <Map 
                      pickupAreas={serviceAreas.pickup}
                      deliveryAreas={serviceAreas.delivery}
                    />
                  </LoadScript>
                </div>
                <div className="mt-4 flex items-center justify-center space-x-6">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-700">Alabileceğiniz Adresler</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-700">Teslim Edebileceğiniz Adresler</span>
                  </div>
                </div>
              </div>

              {/* Alınacak Adresler */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Alabileceğiniz Adresler</h3>
                
                {/* Seçili alınacak adresler */}
                {serviceAreas.pickup.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {serviceAreas.pickup.map(area => (
                        <div key={area.id} className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          <span>{area.city} - {area.districts.join(', ')}</span>
                          {isEditingServiceAreas && (
                            <button 
                              onClick={() => removeServiceArea('pickup', area.id)}
                              className="ml-2 text-green-600 hover:text-green-800"
                            >
                              <FaClose className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Alınacak adres seçimi */}
                {isEditingServiceAreas && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Yeni Alınacak Adres Ekle</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          İl
                        </label>
                        <select
                          value={selectedCity}
                          onChange={handleCityChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value="">İl Seçin</option>
                          {cities.map(city => (
                            <option key={city.id} value={city.id}>{city.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      {selectedCity && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            İlçeler
                          </label>
                          <div className="flex items-center mb-2">
                            <button
                              onClick={toggleAllDistricts}
                              className="text-xs text-orange-600 hover:text-orange-800"
                            >
                              {selectedDistricts.length === districts[selectedCity].length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                            </button>
                          </div>
                          <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                            {districts[selectedCity].map(district => (
                              <div key={district.id} className="flex items-center mb-1">
                                <input
                                  type="checkbox"
                                  id={`district-${district.id}`}
                                  checked={selectedDistricts.includes(district.id)}
                                  onChange={() => toggleDistrict(district.id)}
                                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`district-${district.id}`} className="ml-2 block text-sm text-gray-700">
                                  {district.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => addServiceArea('pickup')}
                        disabled={!selectedCity || selectedDistricts.length === 0}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                          !selectedCity || selectedDistricts.length === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-orange-600 text-white hover:bg-orange-700'
                        }`}
                      >
                        <FaCheck />
                        <span>Ekle</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Teslim Edilecek Adresler */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Teslim Edebileceğiniz Adresler</h3>
                
                {/* Seçili teslim edilecek adresler */}
                {serviceAreas.delivery.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {serviceAreas.delivery.map(area => (
                        <div key={area.id} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          <span>{area.city} - {area.districts.join(', ')}</span>
                          {isEditingServiceAreas && (
                            <button 
                              onClick={() => removeServiceArea('delivery', area.id)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <FaClose className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Teslim edilecek adres seçimi */}
                {isEditingServiceAreas && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Yeni Teslim Edilecek Adres Ekle</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          İl
                        </label>
                        <select
                          value={selectedCityDelivery}
                          onChange={handleCityDeliveryChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value="">İl Seçin</option>
                          {cities.map(city => (
                            <option key={city.id} value={city.id}>{city.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      {selectedCityDelivery && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            İlçeler
                          </label>
                          <div className="flex items-center mb-2">
                            <button
                              onClick={toggleAllDistrictsDelivery}
                              className="text-xs text-orange-600 hover:text-orange-800"
                            >
                              {selectedDistrictsDelivery.length === districts[selectedCityDelivery].length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                            </button>
                          </div>
                          <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                            {districts[selectedCityDelivery].map(district => (
                              <div key={district.id} className="flex items-center mb-1">
                                <input
                                  type="checkbox"
                                  id={`district-delivery-${district.id}`}
                                  checked={selectedDistrictsDelivery.includes(district.id)}
                                  onChange={() => toggleDistrictDelivery(district.id)}
                                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`district-delivery-${district.id}`} className="ml-2 block text-sm text-gray-700">
                                  {district.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => addServiceArea('delivery')}
                        disabled={!selectedCityDelivery || selectedDistrictsDelivery.length === 0}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                          !selectedCityDelivery || selectedDistrictsDelivery.length === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-orange-600 text-white hover:bg-orange-700'
                        }`}
                      >
                        <FaCheck />
                        <span>Ekle</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex-shrink-0 group block">
          <div className="flex items-center">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-orange-100">
              <span className="text-sm font-medium leading-none text-orange-700">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user.companyName}</p>
              {user.name !== user.companyName && (
                <p className="text-xs font-medium text-gray-500">{user.name}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
                            