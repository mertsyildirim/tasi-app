'use client'

import React, { useState } from 'react'
import { FaSearch, FaEye, FaFileInvoice, FaMoneyBillWave, FaCreditCard, FaTruck, FaUser, FaPlus, FaCalendarAlt, FaClock, FaExclamationTriangle, FaCheck, FaTimes } from 'react-icons/fa'
import AdminLayout from '../../components/admin/Layout'

export default function PaymentsPage() {
  const [activeSection, setActiveSection] = useState('customer')
  const [selectedTab, setSelectedTab] = useState('all')
  const [showPaymentDetailModal, setShowPaymentDetailModal] = useState(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(2)

  // Örnek müşteri ödeme verileri
  const customerPayments = [
    { 
      id: 'PAY-001', 
      customerName: 'Ahmet Yılmaz', 
      company: 'ABC Tekstil Ltd.', 
      amount: '2.500 ₺', 
      status: 'Ödendi', 
      date: '02.04.2023', 
      method: 'Kredi Kartı',
      orderId: 'SHP-123'
    },
    { 
      id: 'PAY-002', 
      customerName: 'Ayşe Demir', 
      company: 'Demir Mobilya A.Ş.', 
      amount: '5.800 ₺', 
      status: 'Beklemede', 
      date: '01.04.2023', 
      method: 'Havale/EFT',
      orderId: 'SHP-124'
    },
    { 
      id: 'PAY-003', 
      customerName: 'Mehmet Kara', 
      company: 'Kara Market', 
      amount: '1.950 ₺', 
      status: 'Ödendi', 
      date: '31.03.2023', 
      method: 'Nakit',
      orderId: 'SHP-125'
    },
    { 
      id: 'PAY-004', 
      customerName: 'Zeynep Ak', 
      company: 'Ak Elektronik', 
      amount: '1.200 ₺', 
      status: 'İptal Edildi', 
      date: '30.03.2023', 
      method: 'Kredi Kartı',
      orderId: 'SHP-126'
    },
    { 
      id: 'PAY-005', 
      customerName: 'Ali Vural', 
      company: 'Vural İnşaat', 
      amount: '3.750 ₺', 
      status: 'Beklemede', 
      date: '03.04.2023', 
      method: 'Havale/EFT',
      orderId: 'SHP-127'
    },
  ];

  // Örnek taşıyıcı ödeme verileri
  const carrierPayments = [
    { 
      id: 'CRP-001', 
      carrierName: 'Hızlı Nakliyat', 
      amount: '1.800 ₺', 
      status: 'Ödendi', 
      date: '05.04.2023', 
      method: 'Havale/EFT',
      driverName: 'Mustafa Demir',
      shipmentId: 'SHP-123'
    },
    { 
      id: 'CRP-002', 
      carrierName: 'Güven Transport', 
      amount: '3.200 ₺', 
      status: 'Beklemede', 
      date: '06.04.2023', 
      method: 'Havale/EFT',
      driverName: 'Ali Kaya',
      shipmentId: 'SHP-124'
    },
    { 
      id: 'CRP-003', 
      carrierName: 'Yıldız Taşımacılık', 
      amount: '2.150 ₺', 
      status: 'Tarih Bekliyor', 
      date: '?', 
      method: 'Havale/EFT',
      driverName: 'Ahmet Yıldız',
      shipmentId: 'SHP-128'
    },
    { 
      id: 'CRP-004', 
      carrierName: 'Anadolu Lojistik', 
      amount: '4.500 ₺', 
      status: 'Ödendi', 
      date: '02.04.2023', 
      method: 'Havale/EFT',
      driverName: 'Mehmet Şahin',
      shipmentId: 'SHP-130'
    },
    { 
      id: 'CRP-005', 
      carrierName: 'Ekspres Taşıma', 
      amount: '1.950 ₺', 
      status: 'İptal Edildi', 
      date: '03.04.2023', 
      method: 'Havale/EFT',
      driverName: 'Hasan Kılıç',
      shipmentId: 'SHP-132'
    },
    { 
      id: 'CRP-006', 
      carrierName: 'Mega Transport', 
      amount: '3.750 ₺', 
      status: 'Tarih Bekliyor', 
      date: '?', 
      method: 'Havale/EFT',
      driverName: 'Osman Yücel',
      shipmentId: 'SHP-135'
    },
  ];

  // Müşteri ödeme sekmeleri
  const customerTabs = [
    { id: 'all', name: 'Tüm Ödemeler' },
    { id: 'paid', name: 'Ödendi' },
    { id: 'pending', name: 'Beklemede' },
    { id: 'canceled', name: 'İptal Edildi' },
  ]

  // Taşıyıcı ödeme sekmeleri
  const carrierTabs = [
    { id: 'all', name: 'Tüm Ödemeler' },
    { id: 'paid', name: 'Ödendi' },
    { id: 'pending', name: 'Beklemede' },
    { id: 'waitingDate', name: 'Tarih Bekliyor' },
    { id: 'canceled', name: 'İptal Edildi' },
  ]

  // Durum renkleri
  const getStatusColor = (status) => {
    switch(status) {
      case 'Ödendi':
        return 'bg-green-100 text-green-800'
      case 'Beklemede':
        return 'bg-yellow-100 text-yellow-800'
      case 'Tarih Bekliyor':
        return 'bg-blue-100 text-blue-800'
      case 'İptal Edildi':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Ödeme yöntemi ikonu
  const getMethodIcon = (method) => {
    switch(method) {
      case 'Kredi Kartı':
        return <FaCreditCard className="mr-2 text-blue-600" />
      case 'Havale/EFT':
        return <FaMoneyBillWave className="mr-2 text-green-600" />
      case 'Nakit':
        return <FaMoneyBillWave className="mr-2 text-green-800" />
      default:
        return <FaMoneyBillWave className="mr-2 text-gray-600" />
    }
  }

  // Aktif olan ödeme listesini belirleme
  const activePayments = activeSection === 'customer' ? customerPayments : carrierPayments;
  const activeTabs = activeSection === 'customer' ? customerTabs : carrierTabs;

  // Filtreleme
  const filteredPayments = activePayments.filter(payment => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'paid') return payment.status === 'Ödendi';
    if (selectedTab === 'pending') return payment.status === 'Beklemede';
    if (selectedTab === 'waitingDate') return payment.status === 'Tarih Bekliyor';
    if (selectedTab === 'canceled') return payment.status === 'İptal Edildi';
    return true;
  });

  // Toplam kazanç hesaplama (Müşteri ödemeleri)
  const calculateTotalCustomerRevenue = () => {
    return customerPayments
      .filter(payment => payment.status === 'Ödendi')
      .reduce((total, payment) => {
        const amount = parseFloat(payment.amount.replace(' ₺', '').replace('.', '').replace(',', '.'));
        return total + amount;
      }, 0)
      .toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
  }

  // Bekleyen müşteri ödemesi hesaplama
  const calculatePendingCustomerRevenue = () => {
    return customerPayments
      .filter(payment => payment.status === 'Beklemede')
      .reduce((total, payment) => {
        const amount = parseFloat(payment.amount.replace(' ₺', '').replace('.', '').replace(',', '.'));
        return total + amount;
      }, 0)
      .toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
  }

  // Toplam taşıyıcı ödemesi hesaplama
  const calculateTotalCarrierPayment = () => {
    return carrierPayments
      .filter(payment => payment.status === 'Ödendi')
      .reduce((total, payment) => {
        const amount = parseFloat(payment.amount.replace(' ₺', '').replace('.', '').replace(',', '.'));
        return total + amount;
      }, 0)
      .toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
  }

  // Bekleyen taşıyıcı ödemesi hesaplama
  const calculatePendingCarrierPayment = () => {
    return carrierPayments
      .filter(payment => payment.status === 'Beklemede' || payment.status === 'Tarih Bekliyor')
      .reduce((total, payment) => {
        const amount = parseFloat(payment.amount.replace(' ₺', '').replace('.', '').replace(',', '.'));
        return total + amount;
      }, 0)
      .toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺';
  }

  // Ödeme görüntüleme fonksiyonu
  const handleViewPayment = (payment) => {
    setShowPaymentDetailModal(payment);
  };

  // Dekont görüntüleme fonksiyonu
  const handleViewInvoice = (payment) => {
    setShowInvoiceModal(payment);
  };

  // Sayfa değiştirme işlevi
  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <AdminLayout title="Ödeme Yönetimi">
      {/* Ana Sekmeler - Müşteri/Taşıyıcı */}
      <div className="mb-6">
        <div className="inline-flex bg-white rounded-lg shadow p-1">
          <button
            onClick={() => {
              setActiveSection('customer');
              setSelectedTab('all');
            }}
            className={`px-6 py-3 rounded-md flex items-center font-medium transition-colors ${
              activeSection === 'customer' 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaUser className="mr-2" /> Müşteri Ödemeleri
          </button>
          <button
            onClick={() => {
              setActiveSection('carrier');
              setSelectedTab('all');
            }}
            className={`px-6 py-3 rounded-md flex items-center font-medium transition-colors ${
              activeSection === 'carrier' 
                ? 'bg-orange-500 text-white' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaTruck className="mr-2" /> Taşıyıcı Ödemeleri
          </button>
        </div>
      </div>

      {/* Alt Sekmeler ve Arama */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-wrap space-x-2">
          {activeTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors mb-2 ${
                selectedTab === tab.id 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder={activeSection === 'customer' ? "Ödeme ID, müşteri veya sipariş ara..." : "Ödeme ID, taşıyıcı veya sipariş ara..."} 
              className="pl-10 pr-4 py-2 w-full md:min-w-[320px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* İstatistik Kartları - Müşteri Ödemeleri */}
      {activeSection === 'customer' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 col-span-1">
            <div className="text-sm text-gray-500">Toplam Ödeme</div>
            <div className="text-2xl font-bold mt-1">{customerPayments.length}</div>
            <div className="text-xs text-gray-500 mt-1">Son 30 gün</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 col-span-1">
            <div className="text-sm text-gray-500">Toplam Kazanç</div>
            <div className="text-2xl font-bold mt-1 text-green-600">{calculateTotalCustomerRevenue()}</div>
            <div className="text-xs text-gray-500 mt-1">Onaylanmış ödemeler</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 col-span-1">
            <div className="text-sm text-gray-500">Bekleyen Ödeme</div>
            <div className="text-2xl font-bold mt-1 text-yellow-600">{customerPayments.filter(p => p.status === 'Beklemede').length}</div>
            <div className="text-xs text-gray-500 mt-1">Bekleyen tutar: {calculatePendingCustomerRevenue()}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 col-span-1">
            <div className="text-sm text-gray-500">İptal Edilen</div>
            <div className="text-2xl font-bold mt-1 text-red-600">{customerPayments.filter(p => p.status === 'İptal Edildi').length}</div>
            <div className="text-xs text-gray-500 mt-1">İptal edilen ödemeler</div>
          </div>
        </div>
      )}

      {/* İstatistik Kartları - Taşıyıcı Ödemeleri */}
      {activeSection === 'carrier' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 col-span-1">
            <div className="text-sm text-gray-500">Toplam Ödeme</div>
            <div className="text-2xl font-bold mt-1">{carrierPayments.length}</div>
            <div className="text-xs text-gray-500 mt-1">Son 30 gün</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 col-span-1">
            <div className="text-sm text-gray-500">Ödenen Tutar</div>
            <div className="text-2xl font-bold mt-1 text-green-600">{calculateTotalCarrierPayment()}</div>
            <div className="text-xs text-gray-500 mt-1">Tamamlanmış ödemeler</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 col-span-1">
            <div className="text-sm text-gray-500">Bekleyen Ödeme</div>
            <div className="flex items-center mt-1">
              <div className="text-xl font-bold text-yellow-600 mr-2">{carrierPayments.filter(p => p.status === 'Beklemede').length}</div>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Beklemede</span>
            </div>
            <div className="flex items-center mt-1">
              <div className="text-xl font-bold text-blue-600 mr-2">{carrierPayments.filter(p => p.status === 'Tarih Bekliyor').length}</div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Tarih Bekliyor</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">Toplam: {calculatePendingCarrierPayment()}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 col-span-1">
            <div className="text-sm text-gray-500">İptal Edilen</div>
            <div className="text-2xl font-bold mt-1 text-red-600">{carrierPayments.filter(p => p.status === 'İptal Edildi').length}</div>
            <div className="text-xs text-gray-500 mt-1">İptal edilen ödemeler</div>
          </div>
        </div>
      )}

      {/* Müşteri Ödemeleri Tablosu */}
      {activeSection === 'customer' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödeme ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sipariş No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{payment.id}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{payment.orderId}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{payment.customerName}</div>
                      <div className="text-sm text-gray-500">{payment.company}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.amount}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{payment.date}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900 transition-colors" 
                          title="Görüntüle"
                          onClick={() => handleViewPayment(payment)}
                        >
                          <FaEye className="w-5 h-5" />
                        </button>
                        {payment.status === 'Ödendi' && (
                          <button 
                            className="text-green-600 hover:text-green-900 transition-colors" 
                            title="Fatura"
                            onClick={() => handleViewInvoice(payment)}
                          >
                            <FaFileInvoice className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Toplam <span className="font-medium">{filteredPayments.length}</span> ödeme
            </div>
          </div>
        </div>
      )}

      {/* Taşıyıcı Ödemeleri Tablosu */}
      {activeSection === 'carrier' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ödeme ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sipariş No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taşıyıcı</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sürücü</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{payment.id}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{payment.shipmentId}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{payment.carrierName}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{payment.driverName}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.amount}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                        {payment.status === 'Tarih Bekliyor' && (
                          <button className="ml-2 p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100" title="Ödeme tarihi belirle">
                            <FaCalendarAlt size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.status === 'Tarih Bekliyor' ? (
                        <span className="flex items-center text-blue-500">
                          <FaClock className="mr-1" /> Belirlenmedi
                        </span>
                      ) : (
                        payment.date
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900 transition-colors" 
                          title="Görüntüle"
                          onClick={() => handleViewPayment(payment)}
                        >
                          <FaEye className="w-5 h-5" />
                        </button>
                        {payment.status === 'Ödendi' && (
                          <button 
                            className="text-green-600 hover:text-green-900 transition-colors" 
                            title="Dekont"
                            onClick={() => handleViewInvoice(payment)}
                          >
                            <FaFileInvoice className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Toplam <span className="font-medium">{filteredPayments.length}</span> ödeme
            </div>
          </div>
        </div>
      )}

      {/* Ödeme Detay Modalı */}
      {showPaymentDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowPaymentDetailModal(null)}>
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">
                {activeSection === 'customer' ? 'Müşteri Ödemesi Detayı' : 'Taşıyıcı Ödemesi Detayı'}
              </h3>
              <button 
                onClick={() => setShowPaymentDetailModal(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-500">Ödeme ID</div>
                    <div className="font-medium">{showPaymentDetailModal.id}</div>
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-500">
                      {activeSection === 'customer' ? 'Sipariş No' : 'Taşıma No'}
                    </div>
                    <div className="font-medium">
                      {activeSection === 'customer' ? showPaymentDetailModal.orderId : showPaymentDetailModal.shipmentId}
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-500">
                      {activeSection === 'customer' ? 'Müşteri' : 'Taşıyıcı'}
                    </div>
                    <div className="font-medium">
                      {activeSection === 'customer' ? showPaymentDetailModal.customerName : showPaymentDetailModal.carrierName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {activeSection === 'customer' ? showPaymentDetailModal.company : showPaymentDetailModal.driverName}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-500">Ödeme Durumu</div>
                    <div className="mt-1">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(showPaymentDetailModal.status)}`}>
                        {showPaymentDetailModal.status}
                      </span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-500">Tutar</div>
                    <div className="font-bold text-lg text-gray-800">{showPaymentDetailModal.amount}</div>
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-500">Ödeme Tarihi</div>
                    <div className="font-medium">
                      {showPaymentDetailModal.status === 'Tarih Bekliyor' 
                        ? <span className="text-blue-500 flex items-center"><FaClock className="mr-1" /> Belirlenmedi</span>
                        : showPaymentDetailModal.date
                      }
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="text-sm text-gray-500">Ödeme Yöntemi</div>
                    <div className="font-medium flex items-center">
                      {getMethodIcon(showPaymentDetailModal.method)}
                      {showPaymentDetailModal.method}
                    </div>
                  </div>
                </div>
              </div>

              {showPaymentDetailModal.status === 'Ödendi' && (
                <div className="mt-6 text-center">
                  <button 
                    className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center mx-auto hover:bg-green-700 transition-colors"
                    onClick={() => {
                      setShowPaymentDetailModal(null);
                      handleViewInvoice(showPaymentDetailModal);
                    }}
                  >
                    <FaFileInvoice className="mr-2" />
                    {activeSection === 'customer' ? 'Fatura Görüntüle' : 'Dekont Görüntüle'}
                  </button>
                </div>
              )}
              <div className="mt-4 text-center">
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center mx-auto hover:bg-blue-700 transition-colors"
                >
                  <FaFileInvoice className="mr-2" />
                  {activeSection === 'customer' ? 'Fatura (PDF) Ekle' : 'Dekont (PDF) Ekle'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dekont Modalı */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowInvoiceModal(null)}>
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">
                {activeSection === 'customer' ? 'Ödeme Faturası' : 'Ödeme Dekontu'}
              </h3>
              <button 
                onClick={() => setShowInvoiceModal(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 p-8 border rounded-md">
                <div className="flex justify-between mb-6">
                  <div>
                    <div className="text-xl font-bold text-gray-800">Taşı.app</div>
                    <div className="text-gray-500">Ödeme Makbuzu</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-500">Dekont No: INV-{showInvoiceModal.id}</div>
                    <div className="text-gray-500">Tarih: {showInvoiceModal.date}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-6">
                  <div>
                    <div className="text-sm text-gray-600 font-medium mb-1">Gönderen:</div>
                    <div className="text-gray-900">
                      {activeSection === 'customer' ? showInvoiceModal.customerName : 'Taşı.app Ltd.'}
                    </div>
                    <div className="text-gray-500">
                      {activeSection === 'customer' ? showInvoiceModal.company : 'Dijital Lojistik Platformu'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 font-medium mb-1">Alıcı:</div>
                    <div className="text-gray-900">
                      {activeSection === 'customer' ? 'Taşı.app Ltd.' : showInvoiceModal.carrierName}
                    </div>
                    <div className="text-gray-500">
                      {activeSection === 'customer' ? 'Dijital Lojistik Platformu' : showInvoiceModal.driverName}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between pb-2 font-medium text-gray-900">
                    <div>
                      {activeSection === 'customer' ? 'Sipariş No' : 'Taşıma No'}
                    </div>
                    <div>
                      {activeSection === 'customer' ? showInvoiceModal.orderId : showInvoiceModal.shipmentId}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 py-4">
                  <div className="flex justify-between pb-2">
                    <div className="text-gray-600">Ödeme Yöntemi</div>
                    <div className="text-gray-900 flex items-center">
                      {getMethodIcon(showInvoiceModal.method)}
                      {showInvoiceModal.method}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4 pb-2">
                  <div className="flex justify-between font-bold">
                    <div className="text-lg">Toplam Tutar</div>
                    <div className="text-lg text-green-600">{showInvoiceModal.amount}</div>
                  </div>
                </div>

                <div className="mt-8 text-center text-gray-500 text-sm">
                  <p>Bu bir resmi makbuzdur.</p>
                  <p>Teşekkür ederiz!</p>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button 
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md flex items-center hover:bg-gray-200 transition-colors"
                  onClick={() => setShowInvoiceModal(null)}
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
} 