import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PortalLayout from '../../components/portal/Layout';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaFileAlt, FaUpload, FaDownload, FaExclamationTriangle, FaCheckCircle, FaTruck, FaMotorcycle, FaBox, FaPallet, FaWarehouse, FaShippingFast, FaMapMarkedAlt, FaCheck, FaTimes as FaClose } from 'react-icons/fa';
import dynamic from 'next/dynamic';

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
    city: '',
    country: '',
    website: '',
    description: ''
  });

  // Taşıma tipleri
  const [transportTypes] = useState([
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
  const [selectedTransportTypes, setSelectedTransportTypes] = useState([1, 2, 4, 5]);

  // Hizmet bölgeleri için state
  const [serviceAreas, setServiceAreas] = useState({
    pickup: [], // Alınacak adresler
    delivery: [] // Teslim edilecek adresler
  });
  
  // İl ve ilçe listeleri (örnek veri)
  const [cities] = useState([
    { id: 1, name: 'İstanbul' },
    { id: 2, name: 'Ankara' },
    { id: 3, name: 'İzmir' },
    { id: 4, name: 'Bursa' },
    { id: 5, name: 'Antalya' },
    { id: 6, name: 'Adana' },
    { id: 7, name: 'Konya' },
    { id: 8, name: 'Gaziantep' },
    { id: 9, name: 'Şanlıurfa' },
    { id: 10, name: 'Kocaeli' }
  ]);
  
  const [districts] = useState({
    1: [ // İstanbul
      { id: 101, name: 'Kadıköy' },
      { id: 102, name: 'Beşiktaş' },
      { id: 103, name: 'Üsküdar' },
      { id: 104, name: 'Şişli' },
      { id: 105, name: 'Beyoğlu' },
      { id: 106, name: 'Bakırköy' },
      { id: 107, name: 'Ataşehir' },
      { id: 108, name: 'Maltepe' },
      { id: 109, name: 'Pendik' },
      { id: 110, name: 'Kartal' }
    ],
    2: [ // Ankara
      { id: 201, name: 'Çankaya' },
      { id: 202, name: 'Keçiören' },
      { id: 203, name: 'Mamak' },
      { id: 204, name: 'Etimesgut' },
      { id: 205, name: 'Sincan' }
    ],
    3: [ // İzmir
      { id: 301, name: 'Konak' },
      { id: 302, name: 'Karşıyaka' },
      { id: 303, name: 'Bornova' },
      { id: 304, name: 'Buca' },
      { id: 305, name: 'Çiğli' }
    ],
    4: [ // Bursa
      { id: 401, name: 'Nilüfer' },
      { id: 402, name: 'Osmangazi' },
      { id: 403, name: 'Yıldırım' },
      { id: 404, name: 'Mudanya' },
      { id: 405, name: 'Gemlik' }
    ],
    5: [ // Antalya
      { id: 501, name: 'Muratpaşa' },
      { id: 502, name: 'Konyaaltı' },
      { id: 503, name: 'Kepez' },
      { id: 504, name: 'Lara' },
      { id: 505, name: 'Kemer' }
    ],
    6: [ // Adana
      { id: 601, name: 'Seyhan' },
      { id: 602, name: 'Yüreğir' },
      { id: 603, name: 'Çukurova' },
      { id: 604, name: 'Sarıçam' },
      { id: 605, name: 'Karaisalı' }
    ],
    7: [ // Konya
      { id: 701, name: 'Selçuklu' },
      { id: 702, name: 'Meram' },
      { id: 703, name: 'Karatay' },
      { id: 704, name: 'Ereğli' },
      { id: 705, name: 'Akşehir' }
    ],
    8: [ // Gaziantep
      { id: 801, name: 'Şahinbey' },
      { id: 802, name: 'Şehitkamil' },
      { id: 803, name: 'Nizip' },
      { id: 804, name: 'İslahiye' },
      { id: 805, name: 'Araban' }
    ],
    9: [ // Şanlıurfa
      { id: 901, name: 'Haliliye' },
      { id: 902, name: 'Eyyübiye' },
      { id: 903, name: 'Karaköprü' },
      { id: 904, name: 'Siverek' },
      { id: 905, name: 'Viranşehir' }
    ],
    10: [ // Kocaeli
      { id: 1001, name: 'İzmit' },
      { id: 1002, name: 'Gebze' },
      { id: 1003, name: 'Darıca' },
      { id: 1004, name: 'Körfez' },
      { id: 1005, name: 'Gölcük' }
    ]
  });
  
  // Seçili il ve ilçeler
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [selectedCityDelivery, setSelectedCityDelivery] = useState('');
  const [selectedDistrictsDelivery, setSelectedDistrictsDelivery] = useState([]);
  const [showMap, setShowMap] = useState(false);
  
  // Harita için örnek veri
  const [mapData] = useState({
    pickupAreas: [
      { id: 1, name: 'İstanbul - Kadıköy', color: '#3B82F6', coordinates: { lat: 40.9909, lng: 29.0307 } },
      { id: 2, name: 'İstanbul - Beşiktaş', color: '#3B82F6', coordinates: { lat: 41.0422, lng: 29.0083 } },
      { id: 3, name: 'Ankara - Çankaya', color: '#3B82F6', coordinates: { lat: 39.9208, lng: 32.8541 } },
      { id: 4, name: 'İzmir - Konak', color: '#3B82F6', coordinates: { lat: 38.4192, lng: 27.1287 } }
    ],
    deliveryAreas: [
      { id: 5, name: 'İstanbul - Üsküdar', color: '#10B981', coordinates: { lat: 41.0235, lng: 29.0145 } },
      { id: 6, name: 'İstanbul - Şişli', color: '#10B981', coordinates: { lat: 41.0602, lng: 28.9877 } },
      { id: 7, name: 'Ankara - Keçiören', color: '#10B981', coordinates: { lat: 39.9651, lng: 32.8639 } },
      { id: 8, name: 'İzmir - Karşıyaka', color: '#10B981', coordinates: { lat: 38.4589, lng: 27.1386 } }
    ]
  });

  // İl seçildiğinde ilçeleri güncelle
  const handleCityChange = (e) => {
    const cityId = parseInt(e.target.value);
    setSelectedCity(cityId);
    setSelectedDistricts([]);
  };

  // Teslim edilecek adresler için il seçildiğinde ilçeleri güncelle
  const handleCityDeliveryChange = (e) => {
    const cityId = parseInt(e.target.value);
    setSelectedCityDelivery(cityId);
    setSelectedDistrictsDelivery([]);
  };

  // İlçe seçimini değiştir
  const toggleDistrict = (districtId) => {
    setSelectedDistricts(prev => {
      if (prev.includes(districtId)) {
        return prev.filter(id => id !== districtId);
      } else {
        return [...prev, districtId];
      }
    });
  };

  // Teslim edilecek adresler için ilçe seçimini değiştir
  const toggleDistrictDelivery = (districtId) => {
    setSelectedDistrictsDelivery(prev => {
      if (prev.includes(districtId)) {
        return prev.filter(id => id !== districtId);
      } else {
        return [...prev, districtId];
      }
    });
  };

  // Tüm ilçeleri seç/kaldır
  const toggleAllDistricts = () => {
    if (selectedCity && districts[selectedCity]) {
      if (selectedDistricts.length === districts[selectedCity].length) {
        setSelectedDistricts([]);
      } else {
        setSelectedDistricts(districts[selectedCity].map(d => d.id));
      }
    }
  };

  // Teslim edilecek adresler için tüm ilçeleri seç/kaldır
  const toggleAllDistrictsDelivery = () => {
    if (selectedCityDelivery && districts[selectedCityDelivery]) {
      if (selectedDistrictsDelivery.length === districts[selectedCityDelivery].length) {
        setSelectedDistrictsDelivery([]);
      } else {
        setSelectedDistrictsDelivery(districts[selectedCityDelivery].map(d => d.id));
      }
    }
  };

  // Hizmet bölgesi ekle
  const addServiceArea = (type) => {
    if (type === 'pickup' && selectedCity && selectedDistricts.length > 0) {
      const city = cities.find(c => c.id === selectedCity);
      const selectedDistrictNames = selectedDistricts.map(dId => {
        const district = districts[selectedCity].find(d => d.id === dId);
        return district ? district.name : '';
      }).filter(name => name !== '');
      
      const newArea = {
        id: Date.now(),
        city: city.name,
        districts: selectedDistrictNames,
        cityId: selectedCity,
        districtIds: selectedDistricts
      };
      
      setServiceAreas(prev => ({
        ...prev,
        pickup: [...prev.pickup, newArea]
      }));
      
      // Seçimleri sıfırla
      setSelectedCity('');
      setSelectedDistricts([]);
    } else if (type === 'delivery' && selectedCityDelivery && selectedDistrictsDelivery.length > 0) {
      const city = cities.find(c => c.id === selectedCityDelivery);
      const selectedDistrictNames = selectedDistrictsDelivery.map(dId => {
        const district = districts[selectedCityDelivery].find(d => d.id === dId);
        return district ? district.name : '';
      }).filter(name => name !== '');
      
      const newArea = {
        id: Date.now(),
        city: city.name,
        districts: selectedDistrictNames,
        cityId: selectedCityDelivery,
        districtIds: selectedDistrictsDelivery
      };
      
      setServiceAreas(prev => ({
        ...prev,
        delivery: [...prev.delivery, newArea]
      }));
      
      // Seçimleri sıfırla
      setSelectedCityDelivery('');
      setSelectedDistrictsDelivery([]);
    }
  };

  // Hizmet bölgesi kaldır
  const removeServiceArea = (type, areaId) => {
    setServiceAreas(prev => ({
      ...prev,
      [type]: prev[type].filter(area => area.id !== areaId)
    }));
  };

  // Hizmet bölgelerini kaydet
  const saveServiceAreas = () => {
    // Burada API'ye hizmet bölgelerini kaydetme isteği yapılacak
    console.log('Hizmet bölgeleri kaydediliyor:', serviceAreas);
    setShowMap(true);
    setIsEditingServiceAreas(false);
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

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/portal/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setFormData({
      name: parsedUser.name || '',
      email: parsedUser.email || '',
      phone: parsedUser.phone || '',
      company: parsedUser.company || '',
      taxNumber: parsedUser.taxNumber || '',
      taxOffice: parsedUser.taxOffice || '',
      address: parsedUser.address || '',
      city: parsedUser.city || '',
      country: parsedUser.country || '',
      website: parsedUser.website || '',
      description: parsedUser.description || ''
    });
    
    // Örnek hizmet bölgeleri
    if (parsedUser.serviceAreas) {
      setServiceAreas(parsedUser.serviceAreas);
    } else {
      // Örnek veri
      setServiceAreas({
        pickup: [
          { id: 1, city: 'İstanbul', districts: ['Kadıköy', 'Beşiktaş'], cityId: 1, districtIds: [101, 102] },
          { id: 2, city: 'Ankara', districts: ['Çankaya'], cityId: 2, districtIds: [201] }
        ],
        delivery: [
          { id: 3, city: 'İstanbul', districts: ['Üsküdar', 'Şişli'], cityId: 1, districtIds: [103, 104] },
          { id: 4, city: 'İzmir', districts: ['Konak', 'Karşıyaka'], cityId: 3, districtIds: [301, 302] }
        ]
      });
    }
    
    setLoading(false);
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Burada API'ye profil güncelleme isteği yapılacak
    console.log('Profil güncelleniyor:', formData);
    setIsEditing(false);
  };

  const handleUploadDocument = (documentId) => {
    // Burada belge yükleme işlemi yapılacak
    console.log('Belge yükleniyor:', documentId);
  };

  const handleDownloadDocument = (fileUrl) => {
    // Burada belge indirme işlemi yapılacak
    console.log('Belge indiriliyor:', fileUrl);
  };

  const getDocumentStatusIcon = (status) => {
    switch (status) {
      case 'uploaded':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />;
      case 'expired':
        return <FaExclamationTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <FaFileAlt className="h-5 w-5 text-gray-400" />;
    }
  };

  const getDocumentStatusText = (status) => {
    switch (status) {
      case 'uploaded':
        return 'Yüklendi';
      case 'pending':
        return 'Güncelleme Bekliyor';
      case 'expired':
        return 'Süresi Doldu';
      default:
        return 'Yüklenmedi';
    }
  };

  const isDocumentExpired = (document) => {
    if (!document.hasExpiry || !document.expiryDate) return false;
    
    const today = new Date();
    const expiryDate = new Date(document.expiryDate.split('.').reverse().join('-'));
    return today > expiryDate;
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                {/* Vergi Numarası */}
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

                {/* Vergi Dairesi */}
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

                {/* Web Sitesi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Web Sitesi
                  </label>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>

                {/* Yetkili Kişi */}
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

                {/* Telefon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                    />
                  </div>
                </div>

                {/* Adres */}
                <div className="md:col-span-2">
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

                {/* Şehir */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Şehir
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>

                {/* Ülke */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ülke
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>

                {/* Firma Açıklaması */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Firma Açıklaması
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
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
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Belge Adı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Yükleme Tarihi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Geçerlilik Tarihi
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
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
                          ? 'border-blue-500 bg-blue-50 hover:bg-blue-100' 
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                      } ${!isEditingTransportTypes && 'cursor-default'}`}
                      onClick={() => isEditingTransportTypes && toggleTransportType(type.id)}
                    >
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full ${
                          isSelected 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <h3 className={`ml-3 text-sm font-medium ${
                          isSelected 
                            ? 'text-blue-700' 
                            : 'text-gray-500'
                        }`}>
                          {type.name}
                        </h3>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        {type.description}
                      </p>
                      {isSelected && (
                        <div className="mt-2 flex items-center text-xs text-blue-600">
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
                    onClick={saveServiceAreas}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
              {/* Alınacak Adresler */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Alabileceğiniz Adresler</h3>
                
                {/* Seçili alınacak adresler */}
                {serviceAreas.pickup.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {serviceAreas.pickup.map(area => (
                        <div key={area.id} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          <span>{area.city} - {area.districts.join(', ')}</span>
                          {isEditingServiceAreas && (
                            <button 
                              onClick={() => removeServiceArea('pickup', area.id)}
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
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                              className="text-xs text-blue-600 hover:text-blue-800"
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
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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
                            : 'bg-blue-600 text-white hover:bg-blue-700'
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
                        <div key={area.id} className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          <span>{area.city} - {area.districts.join(', ')}</span>
                          {isEditingServiceAreas && (
                            <button 
                              onClick={() => removeServiceArea('delivery', area.id)}
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
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                              className="text-xs text-blue-600 hover:text-blue-800"
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
                                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
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
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        <FaCheck />
                        <span>Ekle</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Harita Görünümü */}
              {showMap && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Hizmet Bölgeleri Haritası</h3>
                  <div className="h-96 border border-gray-300 rounded-lg overflow-hidden">
                    <Map 
                      pickupAreas={mapData.pickupAreas}
                      deliveryAreas={mapData.deliveryAreas}
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-center space-x-6">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-700">Alınacak Adresler</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm text-gray-700">Teslim Edilecek Adresler</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
} 