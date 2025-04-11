import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import PortalLayout from '../../components/portal/Layout';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaMapMarkerAlt, FaEdit, FaSave, FaTimes, FaFileAlt, FaUpload, FaDownload, FaExclamationTriangle, FaCheckCircle, FaTruck, FaMotorcycle, FaBox, FaPallet, FaWarehouse, FaShippingFast, FaMapMarkedAlt, FaCheck, FaTimes as FaClose } from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { LoadScript } from '@react-google-maps/api';

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
  
  // İl ve ilçe listeleri
  const cities = [
    { id: 1, name: 'Adana' },
    { id: 2, name: 'Adıyaman' },
    { id: 3, name: 'Afyonkarahisar' },
    { id: 4, name: 'Ağrı' },
    { id: 5, name: 'Amasya' },
    { id: 6, name: 'Ankara' },
    { id: 7, name: 'Antalya' },
    { id: 8, name: 'Artvin' },
    { id: 9, name: 'Aydın' },
    { id: 10, name: 'Balıkesir' },
    { id: 11, name: 'Bilecik' },
    { id: 12, name: 'Bingöl' },
    { id: 13, name: 'Bitlis' },
    { id: 14, name: 'Bolu' },
    { id: 15, name: 'Burdur' },
    { id: 16, name: 'Bursa' },
    { id: 17, name: 'Çanakkale' },
    { id: 18, name: 'Çankırı' },
    { id: 19, name: 'Çorum' },
    { id: 20, name: 'Denizli' },
    { id: 21, name: 'Diyarbakır' },
    { id: 22, name: 'Edirne' },
    { id: 23, name: 'Elazığ' },
    { id: 24, name: 'Erzincan' },
    { id: 25, name: 'Erzurum' },
    { id: 26, name: 'Eskişehir' },
    { id: 27, name: 'Gaziantep' },
    { id: 28, name: 'Giresun' },
    { id: 29, name: 'Gümüşhane' },
    { id: 30, name: 'Hakkari' },
    { id: 31, name: 'Hatay' },
    { id: 32, name: 'Isparta' },
    { id: 33, name: 'Mersin' },
    { id: 34, name: 'İstanbul' },
    { id: 35, name: 'İzmir' },
    { id: 36, name: 'Kars' },
    { id: 37, name: 'Kastamonu' },
    { id: 38, name: 'Kayseri' },
    { id: 39, name: 'Kırklareli' },
    { id: 40, name: 'Kırşehir' },
    { id: 41, name: 'Kocaeli' },
    { id: 42, name: 'Konya' },
    { id: 43, name: 'Kütahya' },
    { id: 44, name: 'Malatya' },
    { id: 45, name: 'Manisa' },
    { id: 46, name: 'Kahramanmaraş' },
    { id: 47, name: 'Mardin' },
    { id: 48, name: 'Muğla' },
    { id: 49, name: 'Muş' },
    { id: 50, name: 'Nevşehir' },
    { id: 51, name: 'Niğde' },
    { id: 52, name: 'Ordu' },
    { id: 53, name: 'Rize' },
    { id: 54, name: 'Sakarya' },
    { id: 55, name: 'Samsun' },
    { id: 56, name: 'Siirt' },
    { id: 57, name: 'Sinop' },
    { id: 58, name: 'Sivas' },
    { id: 59, name: 'Tekirdağ' },
    { id: 60, name: 'Tokat' },
    { id: 61, name: 'Trabzon' },
    { id: 62, name: 'Tunceli' },
    { id: 63, name: 'Şanlıurfa' },
    { id: 64, name: 'Uşak' },
    { id: 65, name: 'Van' },
    { id: 66, name: 'Yozgat' },
    { id: 67, name: 'Zonguldak' },
    { id: 68, name: 'Aksaray' },
    { id: 69, name: 'Bayburt' },
    { id: 70, name: 'Karaman' },
    { id: 71, name: 'Kırıkkale' },
    { id: 72, name: 'Batman' },
    { id: 73, name: 'Şırnak' },
    { id: 74, name: 'Bartın' },
    { id: 75, name: 'Ardahan' },
    { id: 76, name: 'Iğdır' },
    { id: 77, name: 'Yalova' },
    { id: 78, name: 'Karabük' },
    { id: 79, name: 'Kilis' },
    { id: 80, name: 'Osmaniye' },
    { id: 81, name: 'Düzce' }
  ];
  
  const districts = {
    1: [ // Adana
      { id: 101, name: 'Seyhan' },
      { id: 102, name: 'Yüreğir' },
      { id: 103, name: 'Çukurova' },
      { id: 104, name: 'Sarıçam' },
      { id: 105, name: 'Ceyhan' },
      { id: 106, name: 'Kozan' },
      { id: 107, name: 'İmamoğlu' },
      { id: 108, name: 'Karataş' },
      { id: 109, name: 'Karaisalı' },
      { id: 110, name: 'Pozantı' }
    ],
    2: [ // Adıyaman
      { id: 201, name: 'Merkez' },
      { id: 202, name: 'Kahta' },
      { id: 203, name: 'Besni' },
      { id: 204, name: 'Gölbaşı' },
      { id: 205, name: 'Gerger' }
    ],
    3: [ // Afyonkarahisar
      { id: 301, name: 'Merkez' },
      { id: 302, name: 'Sandıklı' },
      { id: 303, name: 'Dinar' },
      { id: 304, name: 'Bolvadin' },
      { id: 305, name: 'Emirdağ' }
    ],
    34: [ // İstanbul
      { id: 3401, name: 'Kadıköy' },
      { id: 3402, name: 'Beşiktaş' },
      { id: 3403, name: 'Üsküdar' },
      { id: 3404, name: 'Şişli' },
      { id: 3405, name: 'Beyoğlu' },
      { id: 3406, name: 'Bakırköy' },
      { id: 3407, name: 'Ataşehir' },
      { id: 3408, name: 'Maltepe' },
      { id: 3409, name: 'Pendik' },
      { id: 3410, name: 'Kartal' },
      { id: 3411, name: 'Beykoz' },
      { id: 3412, name: 'Fatih' },
      { id: 3413, name: 'Eyüp' },
      { id: 3414, name: 'Gaziosmanpaşa' },
      { id: 3415, name: 'Kağıthane' },
      { id: 3416, name: 'Sarıyer' },
      { id: 3417, name: 'Zeytinburnu' },
      { id: 3418, name: 'Beylikdüzü' },
      { id: 3419, name: 'Esenyurt' },
      { id: 3420, name: 'Başakşehir' }
    ],
    6: [ // Ankara
      { id: 601, name: 'Çankaya' },
      { id: 602, name: 'Keçiören' },
      { id: 603, name: 'Yenimahalle' },
      { id: 604, name: 'Mamak' },
      { id: 605, name: 'Etimesgut' },
      { id: 606, name: 'Sincan' },
      { id: 607, name: 'Altındağ' },
      { id: 608, name: 'Pursaklar' },
      { id: 609, name: 'Gölbaşı' },
      { id: 610, name: 'Polatlı' }
    ],
    35: [ // İzmir
      { id: 3501, name: 'Konak' },
      { id: 3502, name: 'Karşıyaka' },
      { id: 3503, name: 'Bornova' },
      { id: 3504, name: 'Buca' },
      { id: 3505, name: 'Çiğli' },
      { id: 3506, name: 'Gaziemir' },
      { id: 3507, name: 'Karabağlar' },
      { id: 3508, name: 'Bayraklı' },
      { id: 3509, name: 'Balçova' },
      { id: 3510, name: 'Narlıdere' }
    ],
    16: [ // Bursa
      { id: 1601, name: 'Osmangazi' },
      { id: 1602, name: 'Nilüfer' },
      { id: 1603, name: 'Yıldırım' },
      { id: 1604, name: 'İnegöl' },
      { id: 1605, name: 'Gemlik' },
      { id: 1606, name: 'Mudanya' },
      { id: 1607, name: 'Gürsu' },
      { id: 1608, name: 'Kestel' },
      { id: 1609, name: 'Mustafakemalpaşa' },
      { id: 1610, name: 'Orhangazi' }
    ],
    7: [ // Antalya
      { id: 701, name: 'Muratpaşa' },
      { id: 702, name: 'Kepez' },
      { id: 703, name: 'Konyaaltı' },
      { id: 704, name: 'Alanya' },
      { id: 705, name: 'Manavgat' },
      { id: 706, name: 'Serik' },
      { id: 707, name: 'Aksu' },
      { id: 708, name: 'Döşemealtı' },
      { id: 709, name: 'Kumluca' },
      { id: 710, name: 'Kaş' }
    ],
    41: [ // Kocaeli
      { id: 4101, name: 'İzmit' },
      { id: 4102, name: 'Gebze' },
      { id: 4103, name: 'Darıca' },
      { id: 4104, name: 'Körfez' },
      { id: 4105, name: 'Gölcük' },
      { id: 4106, name: 'Derince' },
      { id: 4107, name: 'Çayırova' },
      { id: 4108, name: 'Kartepe' },
      { id: 4109, name: 'Başiskele' },
      { id: 4110, name: 'Dilovası' }
    ],
    42: [ // Konya
      { id: 4201, name: 'Selçuklu' },
      { id: 4202, name: 'Meram' },
      { id: 4203, name: 'Karatay' },
      { id: 4204, name: 'Ereğli' },
      { id: 4205, name: 'Akşehir' },
      { id: 4206, name: 'Beyşehir' },
      { id: 4207, name: 'Çumra' },
      { id: 4208, name: 'Seydişehir' },
      { id: 4209, name: 'Ilgın' },
      { id: 4210, name: 'Kulu' }
    ],
    27: [ // Gaziantep
      { id: 2701, name: 'Şahinbey' },
      { id: 2702, name: 'Şehitkamil' },
      { id: 2703, name: 'Nizip' },
      { id: 2704, name: 'İslahiye' },
      { id: 2705, name: 'Nurdağı' },
      { id: 2706, name: 'Araban' },
      { id: 2707, name: 'Oğuzeli' },
      { id: 2708, name: 'Yavuzeli' },
      { id: 2709, name: 'Karkamış' }
    ],
    20: [ // Denizli
      { id: 2001, name: 'Pamukkale' },
      { id: 2002, name: 'Merkezefendi' },
      { id: 2003, name: 'Çivril' },
      { id: 2004, name: 'Acıpayam' },
      { id: 2005, name: 'Tavas' },
      { id: 2006, name: 'Honaz' },
      { id: 2007, name: 'Sarayköy' },
      { id: 2008, name: 'Buldan' },
      { id: 2009, name: 'Çal' },
      { id: 2010, name: 'Çardak' }
    ],
    38: [ // Kayseri
      { id: 3801, name: 'Kocasinan' },
      { id: 3802, name: 'Melikgazi' },
      { id: 3803, name: 'Talas' },
      { id: 3804, name: 'Yahyalı' },
      { id: 3805, name: 'Develi' },
      { id: 3806, name: 'Bünyan' },
      { id: 3807, name: 'Pınarbaşı' },
      { id: 3808, name: 'Yozgat' },
      { id: 3809, name: 'Sarıoğlan' },
      { id: 3810, name: 'Hacılar' }
    ],
    26: [ // Eskişehir
      { id: 2601, name: 'Tepebaşı' },
      { id: 2602, name: 'Odunpazarı' },
      { id: 2603, name: 'Sivrihisar' },
      { id: 2604, name: 'Alpu' },
      { id: 2605, name: 'Beylikova' },
      { id: 2606, name: 'Çifteler' },
      { id: 2607, name: 'Günyüzü' },
      { id: 2608, name: 'Han' },
      { id: 2609, name: 'İnönü' },
      { id: 2610, name: 'Mahmudiye' }
    ],
    33: [ // Mersin
      { id: 3301, name: 'Yenişehir' },
      { id: 3302, name: 'Toroslar' },
      { id: 3303, name: 'Akdeniz' },
      { id: 3304, name: 'Mezitli' },
      { id: 3305, name: 'Tarsus' },
      { id: 3306, name: 'Erdemli' },
      { id: 3307, name: 'Silifke' },
      { id: 3308, name: 'Anamur' },
      { id: 3309, name: 'Mut' },
      { id: 3310, name: 'Gülnar' }
    ],
    21: [ // Diyarbakır
      { id: 2101, name: 'Kayapınar' },
      { id: 2102, name: 'Yenişehir' },
      { id: 2103, name: 'Bağlar' },
      { id: 2104, name: 'Sur' },
      { id: 2105, name: 'Bismil' },
      { id: 2106, name: 'Çermik' },
      { id: 2107, name: 'Çınar' },
      { id: 2108, name: 'Çüngüş' },
      { id: 2109, name: 'Dicle' },
      { id: 2110, name: 'Eğil' }
    ],
    63: [ // Şanlıurfa
      { id: 6301, name: 'Haliliye' },
      { id: 6302, name: 'Eyyübiye' },
      { id: 6303, name: 'Karaköprü' },
      { id: 6304, name: 'Siverek' },
      { id: 6305, name: 'Viranşehir' },
      { id: 6306, name: 'Suruç' },
      { id: 6307, name: 'Birecik' },
      { id: 6308, name: 'Harran' },
      { id: 6309, name: 'Hilvan' },
      { id: 6310, name: 'Ceylanpınar' }
    ],
    61: [ // Trabzon
      { id: 6101, name: 'Ortahisar' },
      { id: 6102, name: 'Akçaabat' },
      { id: 6103, name: 'Yomra' },
      { id: 6104, name: 'Arsin' },
      { id: 6105, name: 'Araklı' },
      { id: 6106, name: 'Of' },
      { id: 6107, name: 'Sürmene' },
      { id: 6108, name: 'Vakfıkebir' },
      { id: 6109, name: 'Beşikdüzü' },
      { id: 6110, name: 'Çarşıbaşı' }
    ],
    55: [ // Samsun
      { id: 5501, name: 'İlkadım' },
      { id: 5502, name: 'Atakum' },
      { id: 5503, name: 'Canik' },
      { id: 5504, name: 'Tekkeköy' },
      { id: 5505, name: 'Bafra' },
      { id: 5506, name: 'Çarşamba' },
      { id: 5507, name: 'Havza' },
      { id: 5508, name: 'Kavak' },
      { id: 5509, name: 'Ladik' },
      { id: 5510, name: 'Salıpazarı' }
    ],
    54: [ // Sakarya
      { id: 5401, name: 'Adapazarı' },
      { id: 5402, name: 'Serdivan' },
      { id: 5403, name: 'Erenler' },
      { id: 5404, name: 'Ferizli' },
      { id: 5405, name: 'Geyve' },
      { id: 5406, name: 'Hendek' },
      { id: 5407, name: 'Karapürçek' },
      { id: 5408, name: 'Karasu' },
      { id: 5409, name: 'Kaynarca' },
      { id: 5410, name: 'Kocaali' }
    ],
    10: [ // Balıkesir
      { id: 1001, name: 'Altıeylül' },
      { id: 1002, name: 'Karesi' },
      { id: 1003, name: 'Bandırma' },
      { id: 1004, name: 'Edremit' },
      { id: 1005, name: 'Gönen' },
      { id: 1006, name: 'Burhaniye' },
      { id: 1007, name: 'Dursunbey' },
      { id: 1008, name: 'Sındırgı' },
      { id: 1009, name: 'Susurluk' },
      { id: 1010, name: 'Manyas' }
    ],
    9: [ // Aydın
      { id: 901, name: 'Efeler' },
      { id: 902, name: 'Nazilli' },
      { id: 903, name: 'Söke' },
      { id: 904, name: 'Kuşadası' },
      { id: 905, name: 'Didim' },
      { id: 906, name: 'Germencik' },
      { id: 907, name: 'Bozdoğan' },
      { id: 908, name: 'Çine' },
      { id: 909, name: 'Köşk' },
      { id: 910, name: 'Sultanhisar' }
    ],
    48: [ // Muğla
      { id: 4801, name: 'Menteşe' },
      { id: 4802, name: 'Bodrum' },
      { id: 4803, name: 'Fethiye' },
      { id: 4804, name: 'Marmaris' },
      { id: 4805, name: 'Milas' },
      { id: 4806, name: 'Dalaman' },
      { id: 4807, name: 'Köyceğiz' },
      { id: 4808, name: 'Ortaca' },
      { id: 4809, name: 'Ula' },
      { id: 4810, name: 'Yatağan' }
    ],
    32: [ // Isparta
      { id: 3201, name: 'Merkez' },
      { id: 3202, name: 'Eğirdir' },
      { id: 3203, name: 'Yalvaç' },
      { id: 3204, name: 'Sütçüler' },
      { id: 3205, name: 'Gelendost' },
      { id: 3206, name: 'Keçiborlu' },
      { id: 3207, name: 'Senirkent' },
      { id: 3208, name: 'Uluborlu' },
      { id: 3209, name: 'Aksu' },
      { id: 3210, name: 'Gönen' }
    ],
    31: [ // Hatay
      { id: 3101, name: 'Antakya' },
      { id: 3102, name: 'İskenderun' },
      { id: 3103, name: 'Defne' },
      { id: 3104, name: 'Dörtyol' },
      { id: 3105, name: 'Reyhanlı' },
      { id: 3106, name: 'Samandağ' },
      { id: 3107, name: 'Kırıkhan' },
      { id: 3108, name: 'Payas' },
      { id: 3109, name: 'Erzin' },
      { id: 3110, name: 'Belen' }
    ],
    25: [ // Erzurum
      { id: 2501, name: 'Yakutiye' },
      { id: 2502, name: 'Palandöken' },
      { id: 2503, name: 'Aziziye' },
      { id: 2504, name: 'Horasan' },
      { id: 2505, name: 'Oltu' },
      { id: 2506, name: 'Pasinler' },
      { id: 2507, name: 'Karaçoban' },
      { id: 2508, name: 'Hınıs' },
      { id: 2509, name: 'Tortum' },
      { id: 2510, name: 'Narman' }
    ],
    24: [ // Erzincan
      { id: 2401, name: 'Merkez' },
      { id: 2402, name: 'Tercan' },
      { id: 2403, name: 'Üzümlü' },
      { id: 2404, name: 'Kemah' },
      { id: 2405, name: 'Kemaliye' },
      { id: 2406, name: 'İliç' },
      { id: 2407, name: 'Refahiye' },
      { id: 2408, name: 'Çayırlı' },
      { id: 2409, name: 'Otlukbeli' }
    ],
    23: [ // Elazığ
      { id: 2301, name: 'Merkez' },
      { id: 2302, name: 'Kovancılar' },
      { id: 2303, name: 'Baskil' },
      { id: 2304, name: 'Karakoçan' },
      { id: 2305, name: 'Palu' },
      { id: 2306, name: 'Arıcak' },
      { id: 2307, name: 'Maden' },
      { id: 2308, name: 'Sivrice' },
      { id: 2309, name: 'Alacakaya' }
    ],
    22: [ // Edirne
      { id: 2201, name: 'Merkez' },
      { id: 2202, name: 'Keşan' },
      { id: 2203, name: 'Uzunköprü' },
      { id: 2204, name: 'Havsa' },
      { id: 2205, name: 'İpsala' },
      { id: 2206, name: 'Enez' },
      { id: 2207, name: 'Lalapaşa' },
      { id: 2208, name: 'Meriç' },
      { id: 2209, name: 'Süloğlu' }
    ],
    19: [ // Çorum
      { id: 1901, name: 'Merkez' },
      { id: 1902, name: 'Sungurlu' },
      { id: 1903, name: 'İskilip' },
      { id: 1904, name: 'Osmancık' },
      { id: 1905, name: 'Alaca' },
      { id: 1906, name: 'Mecitözü' },
      { id: 1907, name: 'Kargı' },
      { id: 1908, name: 'Bayat' },
      { id: 1909, name: 'Boğazkale' }
    ],
    18: [ // Çankırı
      { id: 1801, name: 'Merkez' },
      { id: 1802, name: 'Orta' },
      { id: 1803, name: 'Çerkeş' },
      { id: 1804, name: 'Ilgaz' },
      { id: 1805, name: 'Kurşunlu' },
      { id: 1806, name: 'Eldivan' },
      { id: 1807, name: 'Atkaracalar' },
      { id: 1808, name: 'Kızılırmak' },
      { id: 1809, name: 'Bayramören' }
    ],
    17: [ // Çanakkale
      { id: 1701, name: 'Merkez' },
      { id: 1702, name: 'Çan' },
      { id: 1703, name: 'Biga' },
      { id: 1704, name: 'Gelibolu' },
      { id: 1705, name: 'Ayvacık' },
      { id: 1706, name: 'Bayramiç' },
      { id: 1707, name: 'Biga' },
      { id: 1708, name: 'Çan' },
      { id: 1709, name: 'Eceabat' }
    ],
    15: [ // Burdur
      { id: 1501, name: 'Merkez' },
      { id: 1502, name: 'Bucak' },
      { id: 1503, name: 'Gölhisar' },
      { id: 1504, name: 'Tefenni' },
      { id: 1505, name: 'Ağlasun' },
      { id: 1506, name: 'Karamanlı' },
      { id: 1507, name: 'Kemer' },
      { id: 1508, name: 'Altınyayla' },
      { id: 1509, name: 'Çavdır' }
    ],
    14: [ // Bolu
      { id: 1401, name: 'Merkez' },
      { id: 1402, name: 'Gerede' },
      { id: 1403, name: 'Mengen' },
      { id: 1404, name: 'Mudurnu' },
      { id: 1405, name: 'Dörtdivan' },
      { id: 1406, name: 'Yeniçağa' },
      { id: 1407, name: 'Kıbrıscık' },
      { id: 1408, name: 'Seben' },
      { id: 1409, name: 'Göynük' }
    ],
    13: [ // Bitlis
      { id: 1301, name: 'Merkez' },
      { id: 1302, name: 'Tatvan' },
      { id: 1303, name: 'Ahlat' },
      { id: 1304, name: 'Güroymak' },
      { id: 1305, name: 'Mutki' },
      { id: 1306, name: 'Hizan' },
      { id: 1307, name: 'Adilcevaz' }
    ],
    12: [ // Bingöl
      { id: 1201, name: 'Merkez' },
      { id: 1202, name: 'Genç' },
      { id: 1203, name: 'Karlıova' },
      { id: 1204, name: 'Solhan' },
      { id: 1205, name: 'Adaklı' },
      { id: 1206, name: 'Kiğı' },
      { id: 1207, name: 'Yedisu' },
      { id: 1208, name: 'Yayladere' }
    ],
    11: [ // Bilecik
      { id: 1101, name: 'Merkez' },
      { id: 1102, name: 'Bozüyük' },
      { id: 1103, name: 'Söğüt' },
      { id: 1104, name: 'Gölpazarı' },
      { id: 1105, name: 'Osmaneli' },
      { id: 1106, name: 'Pazaryeri' },
      { id: 1107, name: 'İnhisar' }
    ],
    8: [ // Artvin
      { id: 801, name: 'Merkez' },
      { id: 802, name: 'Hopa' },
      { id: 803, name: 'Arhavi' },
      { id: 804, name: 'Borçka' },
      { id: 805, name: 'Şavşat' },
      { id: 806, name: 'Yusufeli' },
      { id: 807, name: 'Kemalpaşa' },
      { id: 808, name: 'Ardanuç' }
    ],
    5: [ // Amasya
      { id: 501, name: 'Merkez' },
      { id: 502, name: 'Merzifon' },
      { id: 503, name: 'Suluova' },
      { id: 504, name: 'Taşova' },
      { id: 505, name: 'Göynücek' },
      { id: 506, name: 'Gümüşhacıköy' },
      { id: 507, name: 'Hamamözü' }
    ],
    4: [ // Ağrı
      { id: 401, name: 'Merkez' },
      { id: 402, name: 'Doğubayazıt' },
      { id: 403, name: 'Diyadin' },
      { id: 404, name: 'Eleşkirt' },
      { id: 405, name: 'Patnos' },
      { id: 406, name: 'Tutak' },
      { id: 407, name: 'Taşlıçay' },
      { id: 408, name: 'Hamur' }
    ]
  };
  
  // Seçili il ve ilçeler
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [selectedCityDelivery, setSelectedCityDelivery] = useState('');
  const [selectedDistrictsDelivery, setSelectedDistrictsDelivery] = useState([]);
  // showMap state'ini kaldırıyorum
  const [mapData] = useState({
    pickupAreas: [
      { id: 1, name: 'İstanbul - Kadıköy', color: '#10B981', coordinates: { lat: 40.9909, lng: 29.0307 } },
      { id: 2, name: 'İstanbul - Beşiktaş', color: '#10B981', coordinates: { lat: 41.0422, lng: 29.0083 } },
      { id: 3, name: 'Ankara - Çankaya', color: '#10B981', coordinates: { lat: 39.9208, lng: 32.8541 } },
      { id: 4, name: 'İzmir - Konak', color: '#10B981', coordinates: { lat: 38.4192, lng: 27.1287 } }
    ],
    deliveryAreas: [
      { id: 5, name: 'İstanbul - Üsküdar', color: '#3B82F6', coordinates: { lat: 41.0235, lng: 29.0145 } },
      { id: 6, name: 'İstanbul - Şişli', color: '#3B82F6', coordinates: { lat: 41.0602, lng: 28.9877 } },
      { id: 7, name: 'Ankara - Keçiören', color: '#3B82F6', coordinates: { lat: 39.9651, lng: 32.8639 } },
      { id: 8, name: 'İzmir - Karşıyaka', color: '#3B82F6', coordinates: { lat: 38.4589, lng: 27.1386 } }
    ]
  });

  const [citySearch, setCitySearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [selectedCityIndex, setSelectedCityIndex] = useState(-1);
  const [selectedDistrictIndex, setSelectedDistrictIndex] = useState(-1);
  const cityDropdownRef = useRef(null);
  const districtDropdownRef = useRef(null);

  const filteredCities = cities.filter(city => {
    const searchTerm = citySearch.toLowerCase()
      .replace(/i/g, 'i')
      .replace(/ı/g, 'i')
      .replace(/İ/g, 'i')
      .replace(/I/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
    
    const cityName = city.name.toLowerCase()
      .replace(/i/g, 'i')
      .replace(/ı/g, 'i')
      .replace(/İ/g, 'i')
      .replace(/I/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
    
    return cityName.includes(searchTerm);
  });

  const filteredDistricts = formData.city ? districts[formData.city]?.filter(district => {
    const searchTerm = districtSearch.toLowerCase()
      .replace(/i/g, 'i')
      .replace(/ı/g, 'i')
      .replace(/İ/g, 'i')
      .replace(/I/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
    
    const districtName = district.name.toLowerCase()
      .replace(/i/g, 'i')
      .replace(/ı/g, 'i')
      .replace(/İ/g, 'i')
      .replace(/I/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
    
    return districtName.includes(searchTerm);
  }) : [];

  const handleCityKeyDown = (e) => {
    if (!showCityDropdown) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedCityIndex(prev => 
        prev < filteredCities.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedCityIndex(prev => prev > 0 ? prev - 1 : prev);
    } else if (e.key === 'Enter' && selectedCityIndex >= 0) {
      e.preventDefault();
      const selectedCity = filteredCities[selectedCityIndex];
      handleInputChange({ target: { name: 'city', value: selectedCity.id } });
      setCitySearch(selectedCity.name);
      setShowCityDropdown(false);
      setSelectedCityIndex(-1);
    } else if (e.key === 'Escape') {
      setShowCityDropdown(false);
      setSelectedCityIndex(-1);
    }
  };

  const handleDistrictKeyDown = (e) => {
    if (!showDistrictDropdown) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedDistrictIndex(prev => 
        prev < filteredDistricts.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedDistrictIndex(prev => prev > 0 ? prev - 1 : prev);
    } else if (e.key === 'Enter' && selectedDistrictIndex >= 0) {
      e.preventDefault();
      const selectedDistrict = filteredDistricts[selectedDistrictIndex];
      handleInputChange({ target: { name: 'district', value: selectedDistrict.id } });
      setDistrictSearch(selectedDistrict.name);
      setShowDistrictDropdown(false);
      setSelectedDistrictIndex(-1);
    } else if (e.key === 'Escape') {
      setShowDistrictDropdown(false);
      setSelectedDistrictIndex(-1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
      if (districtDropdownRef.current && !districtDropdownRef.current.contains(event.target)) {
        setShowDistrictDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
                  <div className="relative" ref={districtDropdownRef}>
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
                                ? 'bg-blue-100 text-blue-800' 
                                : 'hover:bg-gray-100'
                            }`}
                            onClick={() => {
                              handleInputChange({ target: { name: 'district', value: district.id } });
                              setDistrictSearch(district.name);
                              setShowDistrictDropdown(false);
                              setSelectedDistrictIndex(-1);
                            }}
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
                  <div className="relative" ref={cityDropdownRef}>
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
                    disabled={!isEditing}
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
                    onClick={saveServiceAreas}
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
                      pickupAreas={mapData.pickupAreas}
                      deliveryAreas={mapData.deliveryAreas}
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
                            className={`px-3 py-2 cursor-pointer ${
                              index === selectedDistrictIndex 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'hover:bg-gray-100'
                            }`}
                            onClick={() => {
                              handleInputChange({ target: { name: 'district', value: district.id } });
                              setDistrictSearch(district.name);
                              setShowDistrictDropdown(false);
                              setSelectedDistrictIndex(-1);
                            }}
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
                  <div className="relative" ref={cityDropdownRef}>
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
                    disabled={!isEditing}
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
                    onClick={saveServiceAreas}
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
                      pickupAreas={mapData.pickupAreas}
                      deliveryAreas={mapData.deliveryAreas}
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
