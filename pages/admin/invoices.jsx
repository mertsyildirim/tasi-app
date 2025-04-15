import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/admin/Layout';
import axios from 'axios';
import { API_CONFIG } from '../../lib/config';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { TbReportMoney, TbCash, TbClock, TbAlertTriangle, TbX } from 'react-icons/tb';
import InvoiceAddModal from '../../components/admin/InvoiceAddModal';
import InvoiceEditModal from '../../components/admin/InvoiceEditModal';

const AdminInvoicesPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    cancelled: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0
  });
  
  // Pagination
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // Filtering
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateRange: {
      startDate: '',
      endDate: ''
    }
  });
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Fetch invoices
  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Token kontrolü
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }
      
      // API çağrısı için URL oluştur
      let url = `${API_CONFIG.BASE_URL}/api/admin/invoices?page=${currentPage}&limit=${limit}`;
      
      // Filtreleri ekle
      if (filters.status) url += `&status=${filters.status}`;
      if (filters.search) url += `&search=${filters.search}`;
      if (filters.dateRange.startDate) url += `&startDate=${filters.dateRange.startDate}`;
      if (filters.dateRange.endDate) url += `&endDate=${filters.dateRange.endDate}`;
      
      // Faturaları getir
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setInvoices(response.data.invoices);
        setTotalPages(response.data.totalPages);
        setStats(response.data.stats);
      } else {
        setError('Faturalar yüklenirken bir hata oluştu.');
      }
    } catch (err) {
      console.error('Fatura getirme hatası:', err);
      setError('Faturalar yüklenirken bir hata oluştu: ' + err.message);
      
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        toast.error('Oturum süresi dolmuş olabilir. Lütfen tekrar giriş yapın.');
        router.push('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // İlk yükleme ve filtre/sayfa değişikliklerinde faturaları getir
  useEffect(() => {
    fetchInvoices();
  }, [currentPage, limit, filters]);
  
  // Filtre değişikliklerini işle
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('dateRange')) {
      const dateField = name.split('.')[1];
      setFilters(prev => ({
        ...prev,
        dateRange: {
          ...prev.dateRange,
          [dateField]: value
        }
      }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
    
    // Filtre değiştiğinde ilk sayfaya dön
    setCurrentPage(1);
  };
  
  // Arama işlemi
  const handleSearch = (e) => {
    e.preventDefault();
    fetchInvoices();
  };
  
  // Filtreleri temizle
  const clearFilters = () => {
    setFilters({
      status: '',
      search: '',
      dateRange: {
        startDate: '',
        endDate: ''
      }
    });
    setCurrentPage(1);
  };
  
  // Fatura ekleme işlemi
  const handleAddInvoice = async (invoiceData) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/admin/invoices`, invoiceData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        toast.success('Fatura başarıyla oluşturuldu');
        setShowAddModal(false);
        fetchInvoices();
      } else {
        toast.error('Fatura oluşturulurken bir hata oluştu');
      }
    } catch (err) {
      console.error('Fatura ekleme hatası:', err);
      toast.error('Fatura eklenirken bir hata oluştu: ' + (err.response?.data?.message || err.message));
    }
  };
  
  // Fatura düzenleme işlemi
  const handleEditInvoice = async (invoiceData) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await axios.put(
        `${API_CONFIG.BASE_URL}/api/admin/invoices?id=${selectedInvoice.id}`, 
        invoiceData, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Fatura başarıyla güncellendi');
        setShowEditModal(false);
        fetchInvoices();
      } else {
        toast.error('Fatura güncellenirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Fatura güncelleme hatası:', err);
      toast.error('Fatura güncellenirken bir hata oluştu: ' + (err.response?.data?.message || err.message));
    }
  };
  
  // Fatura silme işlemi
  const handleDeleteInvoice = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await axios.delete(
        `${API_CONFIG.BASE_URL}/api/admin/invoices?id=${selectedInvoice.id}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        toast.success('Fatura başarıyla silindi');
        setShowDeleteConfirm(false);
        fetchInvoices();
      } else {
        toast.error('Fatura silinirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Fatura silme hatası:', err);
      toast.error('Fatura silinirken bir hata oluştu: ' + (err.response?.data?.message || err.message));
    }
  };
  
  // Düzenle modalını aç
  const openEditModal = (invoice) => {
    setSelectedInvoice(invoice);
    setShowEditModal(true);
  };
  
  // Silme onayını aç
  const openDeleteConfirm = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDeleteConfirm(true);
  };
  
  // Para birimini formatla
  const formatCurrency = (amount, currency = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  // Tarih formatla
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMMM yyyy', { locale: tr });
    } catch (error) {
      return dateString;
    }
  };
  
  // Durum adını getTR fonksiyonu ile al
  const getStatusName = (status) => {
    const statusMap = {
      'pending': 'Beklemede',
      'paid': 'Ödendi',
      'overdue': 'Gecikmiş',
      'cancelled': 'İptal Edildi'
    };
    
    return statusMap[status] || status;
  };
  
  // Durum sınıfını al
  const getStatusClass = (status) => {
    const statusClasses = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800',
      'overdue': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };
  
  return (
    <AdminLayout>
      <Head>
        <title>Faturalar | Taşı Admin</title>
      </Head>
      
      <div className="px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Faturalar</h1>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary py-2 px-4 rounded-md"
          >
            Yeni Fatura Oluştur
          </button>
        </div>
        
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white shadow rounded-lg p-4 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-purple-100 mr-4">
                <TbReportMoney className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Toplam Fatura</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-4 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-green-100 mr-4">
                <TbCash className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Ödenen</p>
                <p className="text-xl font-bold">{stats.paid}</p>
                <p className="text-sm text-gray-500">{formatCurrency(stats.paidAmount)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-4 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-yellow-100 mr-4">
                <TbClock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Bekleyen</p>
                <p className="text-xl font-bold">{stats.pending}</p>
                <p className="text-sm text-gray-500">{formatCurrency(stats.pendingAmount)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-4 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-red-100 mr-4">
                <TbAlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Gecikmiş</p>
                <p className="text-xl font-bold">{stats.overdue}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-4 border-l-4 border-gray-500">
            <div className="flex items-center">
              <div className="rounded-full p-3 bg-gray-100 mr-4">
                <TbX className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">İptal Edilen</p>
                <p className="text-xl font-bold">{stats.cancelled}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filtreler */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Durum
              </label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tümü</option>
                <option value="pending">Beklemede</option>
                <option value="paid">Ödendi</option>
                <option value="overdue">Gecikmiş</option>
                <option value="cancelled">İptal Edildi</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="dateRange.startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                id="dateRange.startDate"
                name="dateRange.startDate"
                value={filters.dateRange.startDate}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="dateRange.endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                id="dateRange.endDate"
                name="dateRange.endDate"
                value={filters.dateRange.endDate}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Ara
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="search"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Fatura no veya ID"
                  className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Ara
                </button>
              </div>
            </div>
            
            <div className="md:col-span-4 flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="text-blue-500 hover:text-blue-700 font-medium"
              >
                Filtreleri Temizle
              </button>
            </div>
          </form>
        </div>
        
        {/* Fatura Tablosu */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loader"></div>
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg font-medium mb-2">Fatura bulunamadı</p>
              <p className="text-sm">Farklı filtreler deneyebilir veya yeni bir fatura oluşturabilirsiniz.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fatura No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Müşteri/Taşıyıcı
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Düzenlenme Tarihi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Son Ödeme Tarihi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tutar
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {invoice.invoiceNo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {invoice.customer?.companyName || invoice.carrier?.companyName || 'Bilinmiyor'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(invoice.issueDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(invoice.dueDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {formatCurrency(invoice.totalAmount, invoice.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(invoice.status)}`}>
                            {getStatusName(invoice.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => openEditModal(invoice)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => openDeleteConfirm(invoice)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{(currentPage - 1) * limit + 1}</span>
                      {' '}-{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * limit, stats.total)}
                      </span>
                      {' '}/ {' '}
                      <span className="font-medium">{stats.total}</span>
                      {' '}sonuç
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        Önceki
                      </button>
                      
                      {/* Sayfa numaraları */}
                      {[...Array(totalPages).keys()].map(page => (
                        <button
                          key={page + 1}
                          onClick={() => setCurrentPage(page + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                            currentPage === page + 1
                              ? 'bg-blue-50 border-blue-500 text-blue-600 z-10'
                              : 'bg-white text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === totalPages 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        Sonraki
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Modallar */}
      {showAddModal && (
        <InvoiceAddModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddInvoice}
        />
      )}
      
      {showEditModal && selectedInvoice && (
        <InvoiceEditModal
          invoice={selectedInvoice}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditInvoice}
        />
      )}
      
      {/* Silme Onay Modalı */}
      {showDeleteConfirm && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Faturayı Sil</h3>
            <p className="mb-6">
              <strong>{selectedInvoice.invoiceNo}</strong> numaralı faturayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleDeleteInvoice}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminInvoicesPage; 