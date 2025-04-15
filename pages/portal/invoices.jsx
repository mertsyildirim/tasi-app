import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PortalLayout from '../../components/portal/Layout';
import { FaFileInvoice, FaSearch, FaFilter, FaUser, FaTruck, FaMoneyBillWave, FaCheckCircle, FaExclamationCircle, FaTimes, FaUpload, FaDownload, FaPrint } from 'react-icons/fa';
import axios from 'axios';

export default function Invoices() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    customer: '',
    invoiceNo: '',
    date: '',
    dueDate: '',
    amount: '',
    status: 'pending',
    type: 'transport',
    description: '',
    items: []
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedInvoiceForUpload, setSelectedInvoiceForUpload] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    // Kullanıcı kontrolü
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/portal/login');
      return;
    }
    
    // Faturaları API'den çek
    fetchInvoices();
  }, [router]);

  // Faturaları API'den çekme fonksiyonu
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      // Kullanıcının token'ını al
      const token = localStorage.getItem('token');
      
      // API'ye istek gönder
      const response = await axios.get('/api/invoices', {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      
      if (response.data.success) {
        setInvoices(response.data.invoices || []);
        
        // İstatistikleri hesapla
        calculateStats(response.data.invoices);
      } else {
        console.error('Fatura verileri alınamadı');
        setError('Fatura verileri yüklenirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Fatura verileri çekilirken hata:', err);
      setError('Fatura verileri çekilirken bir hata oluştu');
      
      // Geçici olarak örnek veriler kullan
      const mockInvoices = [
        {
          id: 'INV001',
          invoiceNo: '2024-001',
          customer: 'ABC Lojistik Ltd. Şti.',
          date: '2024-01-15',
          dueDate: '2024-02-15',
          amount: '12,500.00',
          status: 'paid',
          type: 'transport',
          description: 'Ocak ayı taşıma hizmetleri',
          items: [
            { description: 'İstanbul-Ankara taşıma', quantity: 5, unitPrice: '2,500.00', total: '12,500.00' }
          ]
        },
        {
          id: 'INV002',
          invoiceNo: '2024-002',
          customer: 'XYZ Dağıtım A.Ş.',
          date: '2024-01-20',
          dueDate: '2024-02-20',
          amount: '8,750.00',
          status: 'pending',
          type: 'transport',
          description: 'Ocak ayı dağıtım hizmetleri',
          items: [
            { description: 'İstanbul içi dağıtım', quantity: 7, unitPrice: '1,250.00', total: '8,750.00' }
          ]
        },
        {
          id: 'INV003',
          invoiceNo: '2024-003',
          customer: '123 Nakliyat',
          date: '2024-01-25',
          dueDate: '2024-02-25',
          amount: '15,000.00',
          status: 'overdue',
          type: 'storage',
          description: 'Ocak ayı depolama hizmetleri',
          items: [
            { description: 'Depolama hizmeti (100m²)', quantity: 1, unitPrice: '15,000.00', total: '15,000.00' }
          ]
        },
        {
          id: 'INV004',
          invoiceNo: '2024-004',
          customer: 'DEF Lojistik',
          date: '2024-02-01',
          dueDate: '2024-03-01',
          amount: '5,000.00',
          status: 'pending',
          type: 'other',
          description: 'Özel taşıma hizmeti',
          items: [
            { description: 'Özel ekipman taşıma', quantity: 1, unitPrice: '5,000.00', total: '5,000.00' }
          ]
        }
      ];
      
      setInvoices(mockInvoices);
      calculateStats(mockInvoices);
    } finally {
      setLoading(false);
    }
  };
  
  // İstatistikleri hesaplama fonksiyonu
  const calculateStats = (invoiceList) => {
    const stats = {
      total: invoiceList.length,
      paid: invoiceList.filter(inv => inv.status === 'paid').length,
      pending: invoiceList.filter(inv => inv.status === 'pending').length,
      overdue: invoiceList.filter(inv => inv.status === 'overdue').length
    };
    
    setStats(stats);
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (statusFilter !== 'all' && invoice.status !== statusFilter) return false;
    if (searchTerm && !invoice.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !invoice.customer.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleSubmitInvoice = async (e) => {
    e.preventDefault();
    
    try {
      // Kullanıcının token'ını al
      const token = localStorage.getItem('token');
      
      // API'ye istek gönder
      const response = await axios.post('/api/invoices', newInvoice, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      
      if (response.data.success) {
        // Faturalar listesini güncelle
        fetchInvoices();
        
        // Modal'ı kapat ve form'u sıfırla
        setShowNewInvoiceModal(false);
        setNewInvoice({
          customer: '',
          invoiceNo: '',
          date: '',
          dueDate: '',
          amount: '',
          status: 'pending',
          type: 'transport',
          description: '',
          items: []
        });
      } else {
        console.error('Fatura eklenirken hata oluştu');
        setError('Fatura eklenirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Fatura eklenirken hata:', err);
      setError('Fatura eklenirken bir hata oluştu');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    
    if (!uploadedFile || !selectedInvoiceForUpload) {
      setError('Lütfen bir dosya seçin');
      return;
    }
    
    try {
      // Form data oluştur
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('invoiceId', selectedInvoiceForUpload.id);
      
      // Kullanıcının token'ını al
      const token = localStorage.getItem('token');
      
      // API'ye istek gönder
      const response = await axios.post('/api/invoices/upload-document', formData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        // Faturalar listesini güncelle
        fetchInvoices();
        
        // Modal'ı kapat ve dosyayı sıfırla
        setShowUploadModal(false);
        setSelectedInvoiceForUpload(null);
        setUploadedFile(null);
      } else {
        console.error('Dosya yüklenirken hata oluştu');
        setError('Dosya yüklenirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Dosya yüklenirken hata:', err);
      setError('Dosya yüklenirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <PortalLayout title="Faturalar">
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Faturalar">
      <div className="space-y-6 p-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Hata!</strong>
            <span className="block sm:inline"> {error}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
              <FaTimes className="h-4 w-4 text-red-500" />
            </span>
          </div>
        )}
        
        {/* Üst Bilgi Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaFileInvoice className="h-5 w-5 text-blue-500" />
              </div>
              <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded-full">
                Toplam
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Toplam Fatura</h3>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            <p className="mt-2 text-xs text-green-600">
              <FaCheckCircle className="inline mr-1" />
              <span>%100 verimli</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-green-100 rounded-full">
                <FaCheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <span className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-1 rounded-full">
                Ödenmiş
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Ödenmiş Faturalar</h3>
            <p className="text-2xl font-bold text-gray-800">{stats.paid}</p>
            <p className="mt-2 text-xs text-green-600">
              <FaCheckCircle className="inline mr-1" />
              <span>%{stats.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0} ödeme oranı</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaExclamationCircle className="h-5 w-5 text-yellow-500" />
              </div>
              <span className="text-xs text-yellow-700 font-semibold bg-yellow-50 px-2 py-1 rounded-full">
                Bekleyen
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Bekleyen Faturalar</h3>
            <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
            <p className="mt-2 text-xs text-yellow-600">
              <FaExclamationCircle className="inline mr-1" />
              <span>%{stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0} bekleme oranı</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-red-100 rounded-full">
                <FaTimes className="h-5 w-5 text-red-500" />
              </div>
              <span className="text-xs text-red-700 font-semibold bg-red-50 px-2 py-1 rounded-full">
                Gecikmiş
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Gecikmiş Faturalar</h3>
            <p className="text-2xl font-bold text-gray-800">{stats.overdue}</p>
            <p className="mt-2 text-xs text-red-600">
              <FaTimes className="inline mr-1" />
              <span>%{stats.total > 0 ? Math.round((stats.overdue / stats.total) * 100) : 0} gecikme oranı</span>
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
                  placeholder="Fatura ara..."
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
                  <option value="all">Tüm Faturalar</option>
                  <option value="paid">Ödenmiş</option>
                  <option value="pending">Bekleyen</option>
                  <option value="overdue">Gecikmiş</option>
                </select>
                <FaFilter className="absolute left-3 top-3 text-gray-400" />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fatura Listesi */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Fatura Listesi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInvoices.map(invoice => (
              <div key={invoice.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Fatura #{invoice.invoiceNo}</h4>
                    <p className="text-sm text-gray-500">Taşıma #{invoice.id}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 
                    invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {invoice.status === 'paid' ? 'Ödenmiş' : 
                     invoice.status === 'pending' ? 'Bekliyor' : 
                     'Gecikmiş'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <FaMoneyBillWave className="text-blue-500 mr-2" />
                    <span>{invoice.amount} TL (KDV Dahil)</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FaFileInvoice className="text-blue-500 mr-2" />
                    <span>{invoice.type === 'transport' ? 'Taşıma' : 
                           invoice.type === 'storage' ? 'Depolama' : 
                           'Diğer'}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaTruck className="mr-1" />
                    <span>{invoice.date}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedInvoiceForUpload(invoice);
                      setShowUploadModal(true);
                    }}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    <FaUpload className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Fatura Yükle</h3>
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedInvoiceForUpload(null);
                  setUploadedFile(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fatura Dosyası (PDF veya Görsel)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                
                {uploadedFile && (
                  <div className="text-sm text-gray-600">
                    Seçilen dosya: {uploadedFile.name}
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedInvoiceForUpload(null);
                    setUploadedFile(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 mr-2"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Yükle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fatura Detay Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Fatura #{selectedInvoice.invoiceNo}</h3>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Fatura Bilgileri</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <FaFileInvoice className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Fatura No</p>
                        <p className="text-lg font-semibold text-gray-900">#{selectedInvoice.invoiceNo}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <FaUser className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Müşteri</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedInvoice.customer}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <FaMoneyBillWave className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Tutar</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedInvoice.amount} TL</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <FaTruck className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Fatura Tipi</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedInvoice.type === 'transport' ? 'Taşıma' : 
                           selectedInvoice.type === 'storage' ? 'Depolama' : 
                           'Diğer'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Ödeme Bilgileri</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <FaFileInvoice className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Fatura Tarihi</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedInvoice.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <FaFileInvoice className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Son Ödeme Tarihi</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedInvoice.dueDate}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <FaCheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Durum</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedInvoice.status === 'paid' ? 'Ödenmiş' : 
                           selectedInvoice.status === 'pending' ? 'Bekliyor' : 
                           'Gecikmiş'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <FaFileInvoice className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Açıklama</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedInvoice.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Fatura Kalemleri</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Miktar</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Birim Fiyat</th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Toplam</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedInvoice.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{item.description}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{item.quantity}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{item.unitPrice} TL</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{item.total} TL</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="px-4 py-2 text-right text-sm font-medium text-gray-900">Toplam</td>
                        <td className="px-4 py-2 text-right text-sm font-bold text-gray-900">{selectedInvoice.amount} TL</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center">
                  <FaDownload className="mr-2" />
                  İndir
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center">
                  <FaPrint className="mr-2" />
                  Yazdır
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 mr-2"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
} 