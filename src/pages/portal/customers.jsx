import { useState, useEffect } from 'react';
import PortalLayout from '../../components/portal/Layout';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaUser, FaPhone, FaEnvelope, FaEye, FaTimes } from 'react-icons/fa';

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers] = useState([
    { 
      id: 1, 
      name: 'ABC Lojistik', 
      contact: 'Ahmet Yılmaz', 
      email: 'ahmet@abclojistik.com', 
      phone: '0212 555 1234', 
      status: 'Aktif',
      address: 'Ataşehir, İstanbul',
      taxNumber: '1234567890',
      companyType: 'Limited Şirket',
      foundingDate: '2015-03-12',
      employeeCount: 45,
      website: 'www.abclojistik.com',
      logo: '/images/company-logos/abc.png'
    },
    { 
      id: 2, 
      name: 'XYZ Nakliyat', 
      contact: 'Mehmet Demir', 
      email: 'mehmet@xyznakliyat.com', 
      phone: '0216 444 5678', 
      status: 'Aktif',
      address: 'Kadıköy, İstanbul',
      taxNumber: '0987654321',
      companyType: 'Anonim Şirket',
      foundingDate: '2010-07-22',
      employeeCount: 78,
      website: 'www.xyznakliyat.com',
      logo: '/images/company-logos/xyz.png'
    },
    { 
      id: 3, 
      name: '123 Transport', 
      contact: 'Ayşe Kaya', 
      email: 'ayse@123transport.com', 
      phone: '0312 333 9012', 
      status: 'Pasif',
      address: 'Çankaya, Ankara',
      taxNumber: '2468013579',
      companyType: 'Şahıs Şirketi',
      foundingDate: '2018-11-05',
      employeeCount: 12,
      website: 'www.123transport.com',
      logo: '/images/company-logos/123.png'
    },
  ]);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // Mobil kontrol için useEffect
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const getStatusColor = (status) => {
    return status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <PortalLayout title="Müşteriler">
      <div className="space-y-6">
        {/* Başlık ve Arama */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Müşteriler</h1>
          <div className="flex gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder="Müşteri ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <FaPlus />
              <span className="hidden sm:inline">Yeni Müşteri</span>
            </button>
          </div>
        </div>

        {/* Mobil Görünüm - Kart Listesi */}
        {isMobile ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <FaUser className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium">{customer.name}</h3>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleViewCustomer(customer)}
                    className="p-2 bg-blue-50 text-blue-600 rounded-full"
                  >
                    <FaEye className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FaUser className="h-4 w-4 mr-2" />
                    <span>{customer.contact}</span>
                  </div>
                  <div className="flex items-center">
                    <FaEnvelope className="h-4 w-4 mr-2" />
                    <span>{customer.email}</span>
                  </div>
                  <div className="flex items-center">
                    <FaPhone className="h-4 w-4 mr-2" />
                    <span>{customer.phone}</span>
                  </div>
                </div>
                <div className="flex justify-end mt-3 gap-2">
                  <button className="p-2 text-blue-600 bg-blue-50 rounded-full">
                    <FaEdit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-red-600 bg-red-50 rounded-full">
                    <FaTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Masaüstü Görünüm - Tablo */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İletişim</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-posta</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <FaUser className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.contact}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleViewCustomer(customer)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          <FaEye className="h-5 w-5" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900 mr-4">
                          <FaEdit className="h-5 w-5" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <FaTrash className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Müşteri Detay Modalı */}
        {showCustomerModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <FaUser className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(selectedCustomer.status)}`}>
                        {selectedCustomer.status}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowCustomerModal(false)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <FaTimes className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Firma Bilgileri</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <p className="text-sm text-gray-500">Vergi Numarası</p>
                        <p>{selectedCustomer.taxNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Firma Tipi</p>
                        <p>{selectedCustomer.companyType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Kuruluş Tarihi</p>
                        <p>{selectedCustomer.foundingDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Çalışan Sayısı</p>
                        <p>{selectedCustomer.employeeCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Web Sitesi</p>
                        <p>{selectedCustomer.website}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">İletişim Bilgileri</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <p className="text-sm text-gray-500">İletişim Kişisi</p>
                        <p>{selectedCustomer.contact}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">E-posta</p>
                        <p>{selectedCustomer.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Telefon</p>
                        <p>{selectedCustomer.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Adres</p>
                        <p>{selectedCustomer.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button 
                    onClick={() => setShowCustomerModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Kapat
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Düzenle
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
} 