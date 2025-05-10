import React, { useState, useEffect } from 'react';
import { XIcon, PlusIcon, TrashIcon } from '@heroicons/react/outline';
import axios from 'axios';
import { API_CONFIG } from '../../lib/config';
import { format } from 'date-fns';

const InvoiceAddModal = ({ onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [carriers, setCarriers] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'customer', // customer veya carrier
    entityId: '',
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 30 gün sonra
    status: 'pending',
    currency: 'TRY',
    items: [
      { description: '', quantity: 1, unitPrice: 0, tax: 18 }
    ],
    notes: '',
    shipmentIds: []
  });
  
  // Hesaplanan değerler
  const [calculatedValues, setCalculatedValues] = useState({
    subtotal: 0,
    taxTotal: 0,
    total: 0
  });
  
  // Müşterileri, taşıyıcıları ve sevkiyatları yükle
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) return;
        
        // Müşterileri yükle
        const customersRes = await axios.get(`${API_CONFIG.BASE_URL}/api/admin/customers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (customersRes.data.success) {
          setCustomers(customersRes.data.customers);
        }
        
        // Taşıyıcıları yükle
        const carriersRes = await axios.get(`${API_CONFIG.BASE_URL}/api/admin/carriers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (carriersRes.data.success) {
          setCarriers(carriersRes.data.carriers);
        }
        
        // Sevkiyatları yükle
        const shipmentsRes = await axios.get(`${API_CONFIG.BASE_URL}/api/admin/shipments?status=delivered&limit=100`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (shipmentsRes.data.success) {
          setShipments(shipmentsRes.data.shipments);
        }
      } catch (err) {
        console.error("Veri yükleme hatası:", err);
        setError("Gerekli veriler yüklenirken bir hata oluştu.");
      }
    };
    
    fetchData();
  }, []);
  
  // Form değişiklikleri
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Kalem değişiklikleri
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    
    // Sayı alanları için dönüşüm
    if (field === 'quantity' || field === 'unitPrice' || field === 'tax') {
      value = parseFloat(value) || 0;
    }
    
    newItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
  };
  
  // Kalem ekleme
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, tax: 18 }]
    }));
  };
  
  // Kalem silme
  const removeItem = (index) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    
    // En az bir kalem olmalı
    if (newItems.length === 0) {
      newItems.push({ description: '', quantity: 1, unitPrice: 0, tax: 18 });
    }
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };
  
  // Shipment seçim değişikliği
  const handleShipmentChange = (e) => {
    const shipmentId = e.target.value;
    let selectedShipmentIds;
    
    if (shipmentId === "") return;
    
    // Halihazırda seçili mi kontrol et
    if (formData.shipmentIds.includes(shipmentId)) {
      selectedShipmentIds = formData.shipmentIds.filter(id => id !== shipmentId);
    } else {
      selectedShipmentIds = [...formData.shipmentIds, shipmentId];
    }
    
    setFormData(prev => ({ 
      ...prev, 
      shipmentIds: selectedShipmentIds
    }));
  };
  
  // Seçili sevkiyatı kaldır
  const removeSelectedShipment = (shipmentId) => {
    setFormData(prev => ({
      ...prev,
      shipmentIds: prev.shipmentIds.filter(id => id !== shipmentId)
    }));
  };
  
  // Toplam hesaplamaları
  useEffect(() => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + (item.quantity * item.unitPrice), 
      0
    );
    
    const taxTotal = formData.items.reduce(
      (sum, item) => sum + (item.quantity * item.unitPrice * (item.tax / 100)), 
      0
    );
    
    const total = subtotal + taxTotal;
    
    setCalculatedValues({ subtotal, taxTotal, total });
  }, [formData.items]);
  
  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!formData.entityId) {
        setError(`Lütfen bir ${formData.type === 'customer' ? 'müşteri' : 'taşıyıcı'} seçin`);
        setLoading(false);
        return;
      }
      
      if (formData.items.some(item => !item.description)) {
        setError('Tüm kalemlerin açıklaması doldurulmalıdır');
        setLoading(false);
        return;
      }
      
      // API'ye gönderilecek veriyi hazırla
      const invoiceData = {
        type: formData.type,
        [formData.type === 'customer' ? 'customerId' : 'carrierId']: formData.entityId,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        status: formData.status,
        currency: formData.currency,
        items: formData.items,
        subtotal: calculatedValues.subtotal,
        taxTotal: calculatedValues.taxTotal,
        totalAmount: calculatedValues.total,
        notes: formData.notes,
        shipmentIds: formData.shipmentIds
      };
      
      onSave(invoiceData);
    } catch (err) {
      setError('Fatura eklenirken bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Para formatı
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: formData.currency
    }).format(amount);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Yeni Fatura Oluştur</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <XIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Fatura Tipi ve Fatura Edilecek Kurum */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fatura Tipi
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="customer">Müşteri Faturası</option>
                  <option value="carrier">Taşıyıcı Faturası</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.type === 'customer' ? 'Müşteri' : 'Taşıyıcı'}
                </label>
                <select
                  name="entityId"
                  value={formData.entityId}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seçiniz</option>
                  {formData.type === 'customer' 
                    ? customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.companyName}
                        </option>
                      ))
                    : carriers.map(carrier => (
                        <option key={carrier.id} value={carrier.id}>
                          {carrier.companyName}
                        </option>
                      ))
                  }
                </select>
              </div>
            </div>
            
            {/* Fatura Tarihi ve Durum */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fatura Tarihi
                </label>
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Son Ödeme Tarihi
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durum
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Beklemede</option>
                  <option value="paid">Ödendi</option>
                  <option value="overdue">Gecikmiş</option>
                  <option value="cancelled">İptal Edildi</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Para Birimi
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TRY">Türk Lirası (₺)</option>
                  <option value="USD">Amerikan Doları ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
            </div>
            
            {/* Sevkiyat Seçimi */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                İlişkili Sevkiyatlar
              </label>
              
              <div className="flex gap-2">
                <select
                  onChange={handleShipmentChange}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue=""
                >
                  <option value="">Sevkiyat seçin...</option>
                  {shipments
                    .filter(s => !formData.shipmentIds.includes(s.id))
                    .map(shipment => (
                      <option key={shipment.id} value={shipment.id}>
                        {shipment.shipmentNumber} - {shipment.sender_info?.name} → {shipment.receiver_info?.name}
                      </option>
                    ))
                  }
                </select>
              </div>
              
              {formData.shipmentIds.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Seçili Sevkiyatlar:</p>
                  <div className="space-y-2">
                    {formData.shipmentIds.map(id => {
                      const shipment = shipments.find(s => s.id === id);
                      if (!shipment) return null;
                      
                      return (
                        <div key={id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                          <span className="text-sm">
                            {shipment.shipmentNumber} - {shipment.sender_info?.name} → {shipment.receiver_info?.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSelectedShipment(id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Fatura Kalemleri */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Fatura Kalemleri
                </label>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Yeni Kalem Ekle
                </button>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Açıklama
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        Miktar
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Birim Fiyat
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        KDV %
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Tutar
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                        İşlem
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            placeholder="Kalem açıklaması"
                            className="w-full border-0 focus:ring-0"
                            required
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            className="w-full border-0 focus:ring-0"
                            required
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                            className="w-full border-0 focus:ring-0"
                            required
                          />
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={item.tax}
                            onChange={(e) => handleItemChange(index, 'tax', e.target.value)}
                            className="w-full border-0 focus:ring-0"
                          >
                            <option value="0">0%</option>
                            <option value="1">1%</option>
                            <option value="8">8%</option>
                            <option value="18">18%</option>
                            <option value="20">20%</option>
                          </select>
                        </td>
                        <td className="px-4 py-2 text-right">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            disabled={formData.items.length === 1}
                            className={`text-red-500 hover:text-red-700 ${formData.items.length === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="4" className="px-4 py-2 text-right font-medium">
                        Ara Toplam:
                      </td>
                      <td className="px-4 py-2 text-right font-medium">
                        {formatCurrency(calculatedValues.subtotal)}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan="4" className="px-4 py-2 text-right font-medium">
                        KDV Toplam:
                      </td>
                      <td className="px-4 py-2 text-right font-medium">
                        {formatCurrency(calculatedValues.taxTotal)}
                      </td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan="4" className="px-4 py-2 text-right font-medium text-lg">
                        Genel Toplam:
                      </td>
                      <td className="px-4 py-2 text-right font-bold text-lg">
                        {formatCurrency(calculatedValues.total)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            {/* Notlar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notlar
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Fatura ile ilgili notlar..."
              ></textarea>
            </div>
            
            {/* Butonlar */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                disabled={loading}
              >
                {loading ? 'Kaydediliyor...' : 'Fatura Oluştur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InvoiceAddModal; 