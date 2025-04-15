import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PortalLayout from '../../components/portal/Layout';
import { FaHeadset, FaSearch, FaPlus, FaFilter, FaTicketAlt, FaCheckCircle, FaClock, FaExclamationCircle, FaTimes, FaPaperPlane, FaFileAlt, FaUser, FaCalendarAlt, FaComments } from 'react-icons/fa';

export default function Support() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    category: 'general'
  });

  useEffect(() => {
    // Kullanıcı kontrolü
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/portal/login');
      return;
    }
    setLoading(false);
  }, [router]);

  // Örnek destek talepleri
  const [tickets] = useState([
    {
      id: 'TKT001',
      subject: 'Taşıma Gecikmesi',
      description: 'İstanbul-Ankara taşıması 2 saat gecikmeli başladı.',
      status: 'open',
      priority: 'high',
      category: 'shipment',
      date: '2024-02-20',
      lastUpdate: '2024-02-20 14:30',
      responses: [
        {
          id: 1,
          user: 'Ahmet Yılmaz',
          role: 'customer',
          message: 'Taşıma gecikmesi hakkında bilgi almak istiyorum.',
          date: '2024-02-20 14:00'
        },
        {
          id: 2,
          user: 'Destek Ekibi',
          role: 'support',
          message: 'Talebiniz inceleniyor, en kısa sürede size dönüş yapacağız.',
          date: '2024-02-20 14:30'
        }
      ]
    },
    {
      id: 'TKT002',
      subject: 'Fatura Sorunu',
      description: 'Ocak ayı faturası yanlış hesaplanmış.',
      status: 'in_progress',
      priority: 'medium',
      category: 'billing',
      date: '2024-02-19',
      lastUpdate: '2024-02-20 10:15',
      responses: [
        {
          id: 1,
          user: 'Mehmet Demir',
          role: 'customer',
          message: 'Fatura tutarı yanlış görünüyor, kontrol edebilir misiniz?',
          date: '2024-02-19 16:00'
        },
        {
          id: 2,
          user: 'Destek Ekibi',
          role: 'support',
          message: 'Faturanız kontrol edildi, düzeltme işlemi başlatıldı.',
          date: '2024-02-20 10:15'
        }
      ]
    },
    {
      id: 'TKT003',
      subject: 'Uygulama Hatası',
      description: 'Mobil uygulamada takip sayfası açılmıyor.',
      status: 'closed',
      priority: 'low',
      category: 'technical',
      date: '2024-02-18',
      lastUpdate: '2024-02-19 09:45',
      responses: [
        {
          id: 1,
          user: 'Ayşe Kaya',
          role: 'customer',
          message: 'Takip sayfası açılmıyor, lütfen yardımcı olun.',
          date: '2024-02-18 11:30'
        },
        {
          id: 2,
          user: 'Destek Ekibi',
          role: 'support',
          message: 'Sorun çözüldü, uygulamayı güncelleyiniz.',
          date: '2024-02-19 09:45'
        }
      ]
    }
  ]);

  const filteredTickets = tickets.filter(ticket => {
    if (statusFilter !== 'all' && ticket.status !== statusFilter) return false;
    if (searchTerm && !ticket.subject.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    // Yeni talep oluşturma işlemi burada yapılacak
    setNewTicket({
      subject: '',
      description: '',
      priority: 'medium',
      category: 'general'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <PortalLayout title="Destek">
      <div className="space-y-6 p-4">
        {/* Üst Bilgi Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaTicketAlt className="h-5 w-5 text-blue-500" />
              </div>
              <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded-full">
                Toplam
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Toplam Talep</h3>
            <p className="text-2xl font-bold text-gray-800">3</p>
            <p className="mt-2 text-xs text-green-600">
              <FaCheckCircle className="inline mr-1" />
              <span>%100 yanıt oranı</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaClock className="h-5 w-5 text-yellow-500" />
              </div>
              <span className="text-xs text-yellow-700 font-semibold bg-yellow-50 px-2 py-1 rounded-full">
                Bekleyen
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Bekleyen Talepler</h3>
            <p className="text-2xl font-bold text-gray-800">1</p>
            <p className="mt-2 text-xs text-yellow-600">
              <FaClock className="inline mr-1" />
              <span>Ortalama 2 saat yanıt</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-green-100 rounded-full">
                <FaCheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <span className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-1 rounded-full">
                Tamamlanan
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Tamamlanan Talepler</h3>
            <p className="text-2xl font-bold text-gray-800">1</p>
            <p className="mt-2 text-xs text-green-600">
              <FaCheckCircle className="inline mr-1" />
              <span>%100 memnuniyet</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-orange-100 rounded-full">
                <FaHeadset className="h-5 w-5 text-orange-500" />
              </div>
              <span className="text-xs text-orange-700 font-semibold bg-orange-50 px-2 py-1 rounded-full">
                Destek
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Destek Ekibi</h3>
            <p className="text-2xl font-bold text-gray-800">7/24</p>
            <p className="mt-2 text-xs text-green-600">
              <FaCheckCircle className="inline mr-1" />
              <span>Aktif destek</span>
            </p>
          </div>
        </div>

        {/* Arama ve Filtreler */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Talep ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
                >
                  <option value="all">Tüm Talepler</option>
                  <option value="open">Açık</option>
                  <option value="in_progress">İşlemde</option>
                  <option value="closed">Kapalı</option>
                </select>
                <FaFilter className="absolute left-3 top-3 text-gray-400" />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setNewTicket({ subject: '', description: '', priority: 'medium', category: 'general' })}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center"
              >
                <FaPlus className="mr-2" />
                Yeni Talep
              </button>
            </div>
          </div>
        </div>

        {/* Talep Listesi */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Destek Talepleri</h3>
          <div className="grid grid-cols-1 gap-4">
            {filteredTickets.map(ticket => (
              <div key={ticket.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                    <p className="text-sm text-gray-500">{ticket.description}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    ticket.status === 'open' ? 'bg-yellow-100 text-yellow-800' : 
                    ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {ticket.status === 'open' ? 'Açık' : 
                     ticket.status === 'in_progress' ? 'İşlemde' : 
                     'Kapalı'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <FaTicketAlt className="text-blue-500 mr-2" />
                    <span>#{ticket.id}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FaCalendarAlt className="text-blue-500 mr-2" />
                    <span>{ticket.date}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FaComments className="text-blue-500 mr-2" />
                    <span>{ticket.responses.length} yanıt</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaUser className="mr-1" />
                    <span>Son güncelleme: {ticket.lastUpdate}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedTicket(ticket)}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Detayları Gör
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Yeni Talep Modal */}
      {newTicket.subject !== undefined && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Yeni Destek Talebi</h3>
              <button 
                onClick={() => setNewTicket(undefined)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitTicket} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Konu
                  </label>
                  <input
                    type="text"
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Öncelik
                    </label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="low">Düşük</option>
                      <option value="medium">Orta</option>
                      <option value="high">Yüksek</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori
                    </label>
                    <select
                      value={newTicket.category}
                      onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="general">Genel</option>
                      <option value="shipment">Taşıma</option>
                      <option value="billing">Fatura</option>
                      <option value="technical">Teknik</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setNewTicket(undefined)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 mr-2"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center"
                >
                  <FaPaperPlane className="mr-2" />
                  Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Talep Detay Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">{selectedTicket.subject}</h3>
              <button 
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Talep Bilgileri</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <FaTicketAlt className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Talep No</p>
                        <p className="text-lg font-semibold text-gray-900">#{selectedTicket.id}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <FaCalendarAlt className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Tarih</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedTicket.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <FaCheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Durum</p>
                        <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                          selectedTicket.status === 'open' ? 'bg-yellow-100 text-yellow-800' : 
                          selectedTicket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {selectedTicket.status === 'open' ? 'Açık' : 
                           selectedTicket.status === 'in_progress' ? 'İşlemde' : 
                           'Kapalı'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Talep Detayı</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedTicket.description}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Yanıtlar</h4>
                <div className="space-y-4">
                  {selectedTicket.responses.map(response => (
                    <div key={response.id} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                            response.role === 'customer' ? 'bg-orange-100' : 'bg-blue-100'
                          }`}>
                            <FaUser className={`h-4 w-4 ${
                              response.role === 'customer' ? 'text-orange-500' : 'text-blue-500'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{response.user}</p>
                            <p className="text-xs text-gray-500">{response.date}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">{response.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Yanıtınızı yazın..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center">
                  <FaPaperPlane className="mr-2" />
                  Gönder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
} 