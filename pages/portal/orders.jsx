import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PortalLayout from '../../components/portal/Layout';
import { FaSearch, FaFilter, FaSort, FaList, FaCalendarAlt, FaTrash, FaEye, FaDownload } from 'react-icons/fa';

export default function OrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Mock data - gerçek uygulamada API'den gelecek
    const mockOrders = [
      {
        id: 'ORD-1001',
        date: '2023-10-15',
        customer: 'Ahmet Yılmaz',
        items: [
          { name: 'Koli Taşıma', quantity: 2, price: 150 },
          { name: 'Sigorta', quantity: 1, price: 50 }
        ],
        total: 350,
        status: 'completed',
        paymentStatus: 'paid',
        address: 'Atatürk Mah. Cumhuriyet Cad. No:123, İstanbul'
      },
      {
        id: 'ORD-1002',
        date: '2023-10-14',
        customer: 'Ayşe Demir',
        items: [
          { name: 'Express Kurye', quantity: 1, price: 200 }
        ],
        total: 200,
        status: 'processing',
        paymentStatus: 'paid',
        address: 'Barbaros Mah. İnönü Cad. No:45, İzmir'
      },
      {
        id: 'ORD-1003',
        date: '2023-10-10',
        customer: 'Mehmet Kaya',
        items: [
          { name: 'Palet Taşıma', quantity: 3, price: 300 },
          { name: 'Sigorta', quantity: 1, price: 150 }
        ],
        total: 1050,
        status: 'cancelled',
        paymentStatus: 'refunded',
        address: 'Gazi Mah. Fevzi Çakmak Cad. No:78, Ankara'
      },
      {
        id: 'ORD-1004',
        date: '2023-10-08',
        customer: 'Zeynep Öztürk',
        items: [
          { name: 'Parsiyel Yük', quantity: 1, price: 450 }
        ],
        total: 450,
        status: 'completed',
        paymentStatus: 'paid',
        address: 'Karşıyaka Mah. Belediye Cad. No:22, Antalya'
      },
      {
        id: 'ORD-1005',
        date: '2023-10-05',
        customer: 'Ali Yıldız',
        items: [
          { name: 'Koli Taşıma', quantity: 5, price: 150 },
          { name: 'Ambalajlama', quantity: 1, price: 100 }
        ],
        total: 850,
        status: 'processing',
        paymentStatus: 'pending',
        address: 'Merkez Mah. Atatürk Cad. No:56, Bursa'
      },
    ];

    // Verileri yükle
    setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  // Filtreleme fonksiyonu
  const filteredOrders = orders.filter(order => {
    if (filterStatus !== 'all' && order.status !== filterStatus) {
      return false;
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        order.id.toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query) ||
        order.address.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Sıralama fonksiyonu
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy === 'id') {
      return sortOrder === 'asc' 
        ? a.id.localeCompare(b.id) 
        : b.id.localeCompare(a.id);
    } else if (sortBy === 'total') {
      return sortOrder === 'asc' ? a.total - b.total : b.total - a.total;
    }
    return 0;
  });

  // Durum badge'i
  const StatusBadge = ({ status }) => {
    let colorClass = '';
    let text = '';

    switch (status) {
      case 'completed':
        colorClass = 'bg-green-100 text-green-800';
        text = 'Tamamlandı';
        break;
      case 'processing':
        colorClass = 'bg-orange-100 text-orange-800';
        text = 'İşleniyor';
        break;
      case 'cancelled':
        colorClass = 'bg-red-100 text-red-800';
        text = 'İptal Edildi';
        break;
      default:
        colorClass = 'bg-gray-100 text-gray-800';
        text = status;
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
        {text}
      </span>
    );
  };

  // Ödeme durumu badge'i
  const PaymentBadge = ({ status }) => {
    let colorClass = '';
    let text = '';

    switch (status) {
      case 'paid':
        colorClass = 'bg-green-100 text-green-800';
        text = 'Ödendi';
        break;
      case 'pending':
        colorClass = 'bg-yellow-100 text-yellow-800';
        text = 'Bekliyor';
        break;
      case 'refunded':
        colorClass = 'bg-purple-100 text-purple-800';
        text = 'İade Edildi';
        break;
      default:
        colorClass = 'bg-gray-100 text-gray-800';
        text = status;
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
        {text}
      </span>
    );
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleViewDetails = (orderId) => {
    router.push(`/portal/orders/${orderId}`);
  };

  return (
    <PortalLayout title="Siparişler">
      <div className="px-4 py-5 sm:px-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Siparişlerim</h1>
          <p className="mt-1 text-sm text-gray-500">
            Geçmiş ve aktif siparişlerinizi buradan yönetebilirsiniz
          </p>
        </div>

        {/* Arama ve filtre */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 mb-6">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Sipariş ID, müşteri veya adres ara..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <FaFilter className="mr-2 h-4 w-4" />
              Filtrele
            </button>
            
            <button
              onClick={() => toggleSort('date')}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <FaSort className="mr-2 h-4 w-4" />
              {sortBy === 'date' 
                ? `Tarih ${sortOrder === 'asc' ? '↑' : '↓'}`
                : 'Tarih'
              }
            </button>
            
            <button
              onClick={() => toggleSort('total')}
              className="hidden md:flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <FaSort className="mr-2 h-4 w-4" />
              {sortBy === 'total' 
                ? `Tutar ${sortOrder === 'asc' ? '↑' : '↓'}`
                : 'Tutar'
              }
            </button>
          </div>
        </div>

        {/* Filtreler */}
        {showFilters && (
          <div className="p-4 mb-6 border border-gray-200 rounded-md bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-3">Durum Filtresi</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  filterStatus === 'all'
                    ? 'bg-orange-100 text-orange-800 border-orange-200 border'
                    : 'bg-white text-gray-600 border border-gray-300'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  filterStatus === 'completed'
                    ? 'bg-green-100 text-green-800 border-green-200 border'
                    : 'bg-white text-gray-600 border border-gray-300'
                }`}
              >
                Tamamlanan
              </button>
              <button
                onClick={() => setFilterStatus('processing')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  filterStatus === 'processing'
                    ? 'bg-orange-100 text-orange-800 border-orange-200 border'
                    : 'bg-white text-gray-600 border border-gray-300'
                }`}
              >
                İşleniyor
              </button>
              <button
                onClick={() => setFilterStatus('cancelled')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  filterStatus === 'cancelled'
                    ? 'bg-red-100 text-red-800 border-red-200 border'
                    : 'bg-white text-gray-600 border border-gray-300'
                }`}
              >
                İptal
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6 flex flex-col items-center justify-center h-64">
            <FaList className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Sipariş Bulunamadı</h3>
            <p className="text-sm text-gray-500 mt-1">
              {searchQuery || filterStatus !== 'all' 
                ? 'Arama ve filtreleme kriterlerinize uygun sipariş bulunamadı.' 
                : 'Henüz hiç sipariş vermediniz.'}
            </p>
            {(searchQuery || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Masaüstü sipariş tablosu */}
            <div className="hidden md:block overflow-hidden">
              <div className="shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSort('id')}
                      >
                        <div className="flex items-center">
                          Sipariş ID
                          {sortBy === 'id' && (
                            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSort('date')}
                      >
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-1 h-3 w-3" />
                          Tarih
                          {sortBy === 'date' && (
                            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Müşteri
                      </th>
                      <th 
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSort('total')}
                      >
                        <div className="flex items-center">
                          Tutar
                          {sortBy === 'total' && (
                            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ödeme
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.date).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.total.toLocaleString('tr-TR')} ₺
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <PaymentBadge status={order.paymentStatus} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => handleViewDetails(order.id)}
                              className="text-orange-600 hover:text-orange-900"
                              title="Detayları Görüntüle"
                            >
                              <FaEye className="h-5 w-5" />
                            </button>
                            {order.status === 'completed' && (
                              <button
                                className="text-orange-600 hover:text-orange-900"
                                title="Faturayı İndir"
                              >
                                <FaDownload className="h-5 w-5" />
                              </button>
                            )}
                            {order.status === 'processing' && (
                              <button
                                className="text-red-600 hover:text-red-900"
                                title="İptal Et"
                              >
                                <FaTrash className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobil sipariş kartları */}
            <div className="md:hidden space-y-4">
              {sortedOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-white shadow rounded-lg overflow-hidden border border-gray-200"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-orange-600">{order.id}</p>
                        <p className="text-sm text-gray-900 font-medium mt-1">{order.customer}</p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tarih:</span>
                        <span className="text-gray-900">{new Date(order.date).toLocaleDateString('tr-TR')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Toplam:</span>
                        <span className="text-gray-900 font-medium">{order.total.toLocaleString('tr-TR')} ₺</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Ödeme:</span>
                        <PaymentBadge status={order.paymentStatus} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 bg-gray-50 p-3 flex justify-end space-x-3">
                    <button
                      onClick={() => handleViewDetails(order.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FaEye className="h-3.5 w-3.5 mr-1" />
                      Detay
                    </button>
                    
                    {order.status === 'completed' && (
                      <button
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <FaDownload className="h-3.5 w-3.5 mr-1" />
                        Fatura
                      </button>
                    )}
                    
                    {order.status === 'processing' && (
                      <button
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        <FaTrash className="h-3.5 w-3.5 mr-1" />
                        İptal
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </PortalLayout>
  );
} 