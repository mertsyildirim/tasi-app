'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock, FaBell, FaLanguage, FaHistory, FaFileInvoice, FaEdit, FaCamera, FaSignOutAlt, FaTruck, FaHome } from 'react-icons/fa';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import MainLayout from '../components/layout/MainLayout';
import axios from 'axios';
import { useAuth } from '../src/lib/auth';

// DefaultAvatar bileşeni
const DefaultAvatar = ({ name = '', size = 96, className = '' }) => {
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'TM';
    const words = name.trim().split(' ').filter(word => word.length > 0);
    if (words.length === 0) return 'TM';
    return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
  };

  return (
    <div 
      className={`rounded-full flex items-center justify-center ${className}`}
      style={{ 
        width: size, 
        height: size,
        backgroundColor: '#FF6B00',
      }}
    >
      <span 
        className="text-white font-bold select-none"
        style={{ fontSize: Math.floor(size * 0.4) + 'px' }}
      >
        {getInitials(name)}
      </span>
    </div>
  );
};

export default function Profile() {
  const router = useRouter();
  const { isAuthenticated, user: authUser, loading: authLoading, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [shipmentHistory, setShipmentHistory] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    notifications: true,
    language: 'tr',
    taxNumber: '',
    billingAddress: ''
  });

  // API çağrıları için referans stabilliği sağlayacak şekilde fetchShipmentHistory tanımlandı
  const fetchShipmentHistory = useCallback(async () => {
    try {
      const response = await axios.get('/api/shipments/user');
      if (response.data.shipments) {
        setShipmentHistory(response.data.shipments);
      }
    } catch (err) {
      console.error('Taşıma geçmişi çekilirken hata:', err);
      setShipmentHistory([]);
    }
  }, []);

  // Fatura bilgilerini getir
  const fetchInvoices = useCallback(async () => {
    try {
      const response = await axios.get('/api/invoices/user');
      if (response.data.invoices) {
        setInvoices(response.data.invoices);
      }
    } catch (err) {
      console.error('Fatura bilgileri çekilirken hata:', err);
      setInvoices([]);
    }
  }, []);

  // Auth durumu değiştiğinde kullanıcı yönlendirmelerini yap
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Kullanıcı verilerini yükle
  useEffect(() => {
    if (!authLoading && isAuthenticated && authUser) {
      // Kullanıcı verilerini console.log ile kontrol et
      console.log('authUser:', authUser);
      // Form verilerini doldur
      setFormData({
        fullName: authUser.name || authUser.fullName || '',
        email: authUser.email || '',
        phone: authUser.phone || authUser.phoneNumber || '',
        address: authUser.address || '',
        notifications: authUser.notifications !== false,
        language: authUser.language || 'tr',
        taxNumber: authUser.taxNumber || '',
        billingAddress: authUser.billingAddress || ''
      });
      
      // Profil fotoğrafı
      if (authUser.avatarUrl) {
        setProfileImage(authUser.avatarUrl);
      }
      
      // Taşıma geçmişini çek
      fetchShipmentHistory();
      
      // Fatura bilgilerini çek
      fetchInvoices();
      
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, authUser, fetchShipmentHistory, fetchInvoices]);

  // Form değişikliklerini izleme
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Form gönderimi - profil bilgilerini güncelleme
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // API'ye profil güncellemesi gönder
      const response = await axios.put('/api/users/profile', formData);
      
      if (response.data.success) {
        setIsEditing(false);
        setError(null);
      } else {
        setError(response.data.message || 'Profil güncellenirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Profil güncellenirken hata:', err);
      setError(err.response?.data?.message || 'Profil güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Çıkış işlemi
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-24">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Hata!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  const tabs = [
    { id: 'summary', name: 'Profil Özeti', icon: <FaHome /> },
    { id: 'personal', name: 'Kişisel Bilgiler', icon: <FaUser /> },
    { id: 'settings', name: 'Hesap Ayarları', icon: <FaLock /> },
    { id: 'history', name: 'Taşıma Geçmişi', icon: <FaHistory /> },
    { id: 'billing', name: 'Fatura Bilgileri', icon: <FaFileInvoice /> }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>Profil | Taşı.app</title>
        <meta name="description" content="Taşı.app profil sayfası" />
      </Head>

      {/* Header */}
      <nav className="bg-white shadow-md py-4 relative z-20">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Taşı.app" className="h-10" />
          </Link>
          <div className="hidden md:flex space-x-6 items-center">
            <Link href="/" className={`text-gray-600 hover:text-orange-600 transition group relative ${router.pathname === '/' ? 'text-orange-600' : ''}`}>
              Anasayfa
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/#services" className={`text-gray-600 hover:text-orange-600 transition group relative ${router.pathname === '/services' ? 'text-orange-600' : ''}`}>
              Hizmetlerimiz
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/#about" className={`text-gray-600 hover:text-orange-600 transition group relative ${router.pathname === '/about' ? 'text-orange-600' : ''}`}>
              Neden Biz?
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/contact" className={`text-gray-600 hover:text-orange-600 transition group relative ${router.pathname === '/contact' ? 'text-orange-600' : ''}`}>
              İletişim
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/profile" 
                  className="px-4 py-2 text-sm font-medium text-orange-600 bg-white border border-orange-600 rounded-md hover:bg-orange-50"
                >
                  Profilim
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
                >
                  Çıkış Yap
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700">
                  Giriş Yap
                </Link>
                <Link href="/register" className="px-4 py-2 text-sm font-medium text-orange-600 bg-white border border-orange-600 rounded-md hover:bg-orange-50">
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="bg-gradient-to-b from-gray-50 to-gray-100 py-8">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Sol Sidebar */}
              <div className="w-full md:w-64 bg-white rounded-xl shadow-md">
                <div className="h-full overflow-y-auto">
                  <div className="p-6">
                    <div className="flex flex-col items-center mb-8">
                      <div className="relative">
                        {profileImage ? (
                          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                            <Image
                              src={profileImage}
                              alt={formData.fullName || 'Kullanıcı'}
                              width={96}
                              height={96}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ) : (
                          <div 
                            className="w-24 h-24 rounded-full flex items-center justify-center border-4 border-white shadow-lg"
                            style={{ backgroundColor: '#FF6B00' }}
                          >
                            <span className="text-white text-2xl font-bold">
                              {formData.fullName 
                                ? formData.fullName.trim().split(' ').slice(0, 2).map(name => name?.[0]).join('').toUpperCase() 
                                : 'TM'}
                            </span>
                          </div>
                        )}
                      </div>
                      <h2 className="mt-4 text-lg font-semibold text-gray-900">{formData.fullName}</h2>
                      <p className="text-gray-500 text-sm">{formData.email}</p>
                    </div>

                    <nav className="space-y-2">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                            activeTab === tab.id
                              ? 'bg-orange-500 text-white shadow-md'
                              : 'text-gray-600 hover:bg-orange-50 hover:text-orange-600'
                          }`}
                        >
                          <span className="mr-3">{tab.icon}</span>
                          {tab.name}
                        </button>
                      ))}
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
                      >
                        <span className="mr-3"><FaSignOutAlt /></span>
                        Çıkış Yap
                      </button>
                    </nav>
                  </div>
                </div>
              </div>

              {/* Ana İçerik */}
              <div className="flex-1">
                <div className="bg-white rounded-xl shadow-md">
                  <div className="p-4">
                    {/* Profil Özeti Sekmesi */}
                    {activeTab === 'summary' && (
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Profil Özeti</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Kişisel Bilgiler Özeti */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Kişisel Bilgiler</h4>
                            <div className="space-y-4">
                              <div className="flex items-center text-gray-600">
                                <FaUser className="w-5 h-5 mr-3 text-orange-600" />
                                <span>{formData.fullName}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <FaEnvelope className="w-5 h-5 mr-3 text-orange-600" />
                                <span>{formData.email}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <FaPhone className="w-5 h-5 mr-3 text-orange-600" />
                                <span>{formData.phone || 'Belirtilmedi'}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <FaMapMarkerAlt className="w-5 h-5 mr-3 text-orange-600" />
                                <span>{formData.address || 'Belirtilmedi'}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => setActiveTab('personal')}
                              className="mt-6 text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center"
                            >
                              Detayları Düzenle
                              <FaEdit className="ml-2" />
                            </button>
                          </div>

                          {/* Son Taşımalar */}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Son Taşımalar</h4>
                            
                            {shipmentHistory.length > 0 ? (
                              <div className="space-y-4">
                                {shipmentHistory.slice(0, 3).map((shipment) => (
                                  <div 
                                    key={shipment._id || shipment.id} 
                                    className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center text-gray-600">
                                      <FaTruck className="w-5 h-5 mr-3 text-orange-600" />
                                      <div>
                                        <div className="font-medium">
                                          {shipment.origin || shipment.from} → {shipment.destination || shipment.to}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {new Date(shipment.date || shipment.createdAt).toLocaleDateString('tr-TR')}
                                        </div>
                                      </div>
                                    </div>
                                    <span className="text-orange-600 font-medium">
                                      {shipment.totalPrice ? `₺${shipment.totalPrice}` : shipment.amount}
                                    </span>
                                  </div>
                                ))}
                                
                                <button
                                  onClick={() => setActiveTab('history')}
                                  className="mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center"
                                >
                                  Tüm Taşımaları Gör
                                  <FaEdit className="ml-2" />
                                </button>
                              </div>
                            ) : (
                              <div className="text-center py-4 text-gray-500">
                                Henüz taşıma kaydınız bulunmuyor.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Kişisel Bilgiler Sekmesi */}
                    {activeTab === 'personal' && (
                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-semibold text-gray-900">Kişisel Bilgiler</h3>
                          <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center text-sm font-medium text-orange-600 hover:text-orange-700"
                          >
                            <FaEdit className="mr-2" />
                            {isEditing ? 'İptal' : 'Düzenle'}
                          </button>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                              <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                              <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                            {isEditing && (
                              <div className="flex justify-end">
                                <button
                                  type="submit"
                                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                >
                                  Kaydet
                                </button>
                              </div>
                            )}
                          </form>
                        </div>
                      </div>
                    )}

                    {/* Hesap Ayarları Sekmesi */}
                    {activeTab === 'settings' && (
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Hesap Ayarları</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-6">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Bildirimler</h4>
                            <label className="flex items-center space-x-3">
                              <input
                                type="checkbox"
                                name="notifications"
                                checked={formData.notifications}
                                onChange={handleInputChange}
                                className="h-5 w-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                              />
                              <span className="text-gray-700">E-posta bildirimleri almak istiyorum</span>
                            </label>
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Dil Seçimi</h4>
                            <select
                              name="language"
                              value={formData.language}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                            >
                              <option value="tr">Türkçe</option>
                              <option value="en">English</option>
                            </select>
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Şifre Değiştir</h4>
                            <button className="w-full px-4 py-2 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors">
                              Şifre Değiştir
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Taşıma Geçmişi Sekmesi */}
                    {activeTab === 'history' && (
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Taşıma Geçmişi</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          {shipmentHistory.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="text-left border-b">
                                    <th className="pb-3 text-gray-600">Tarih</th>
                                    <th className="pb-3 text-gray-600">Nereden</th>
                                    <th className="pb-3 text-gray-600">Nereye</th>
                                    <th className="pb-3 text-gray-600">Durum</th>
                                    <th className="pb-3 text-gray-600 text-right">Tutar</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {shipmentHistory.map((shipment) => (
                                    <tr key={shipment._id || shipment.id} className="border-b last:border-0">
                                      <td className="py-4 text-sm">
                                        {new Date(shipment.date || shipment.createdAt).toLocaleDateString('tr-TR')}
                                      </td>
                                      <td className="py-4 text-sm">{shipment.origin || shipment.from}</td>
                                      <td className="py-4 text-sm">{shipment.destination || shipment.to}</td>
                                      <td className="py-4">
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full
                                          ${shipment.status === 'Tamamlandı' || shipment.status === 'completed' 
                                            ? 'bg-green-100 text-green-800' 
                                            : shipment.status === 'İptal Edildi' || shipment.status === 'cancelled'
                                              ? 'bg-red-100 text-red-800'
                                              : 'bg-yellow-100 text-yellow-800'
                                          }`}>
                                          {shipment.status === 'completed' ? 'Tamamlandı' : 
                                            shipment.status === 'cancelled' ? 'İptal Edildi' : 
                                            shipment.status === 'pending' ? 'Beklemede' : 
                                            shipment.status || 'Beklemede'}
                                      </span>
                                      </td>
                                      <td className="py-4 text-sm text-right font-medium">
                                        {shipment.totalPrice ? `₺${shipment.totalPrice}` : shipment.amount}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              Henüz taşıma kaydınız bulunmuyor.
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Fatura Bilgileri Sekmesi */}
                    {activeTab === 'billing' && (
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Fatura Bilgileri</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Vergi/TC Kimlik No</label>
                              <input
                                type="text"
                                name="taxNumber"
                                value={formData.taxNumber}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Fatura Adresi</label>
                              <textarea
                                name="billingAddress"
                                value={formData.billingAddress}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                              />
                            </div>
                            <div className="flex justify-end">
                              <button
                                type="submit"
                                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                              >
                                Kaydet
                              </button>
                            </div>
                          </form>
                          
                          {/* Faturalar Listesi */}
                          <div className="mt-8">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Son Faturalar</h4>
                            {invoices.length > 0 ? (
                              <div className="overflow-x-auto mt-4">
                                <table className="w-full">
                                  <thead>
                                    <tr className="text-left border-b">
                                      <th className="pb-3 text-gray-600">Fatura No</th>
                                      <th className="pb-3 text-gray-600">Tarih</th>
                                      <th className="pb-3 text-gray-600">Dönem</th>
                                      <th className="pb-3 text-gray-600">Durum</th>
                                      <th className="pb-3 text-gray-600 text-right">Tutar</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {invoices.map((invoice) => (
                                      <tr key={invoice.id} className="border-b last:border-0">
                                        <td className="py-4 text-sm font-medium">
                                          {invoice.invoiceNo}
                                        </td>
                                        <td className="py-4 text-sm">
                                          {new Date(invoice.issueDate).toLocaleDateString('tr-TR')}
                                        </td>
                                        <td className="py-4 text-sm">{invoice.period}</td>
                                        <td className="py-4">
                                          <span className={`px-3 py-1 text-xs font-medium rounded-full
                                            ${invoice.status === 'paid' 
                                              ? 'bg-green-100 text-green-800' 
                                              : invoice.status === 'overdue'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {invoice.status === 'paid' ? 'Ödendi' : 
                                              invoice.status === 'overdue' ? 'Gecikmiş' : 
                                              invoice.status === 'pending' ? 'Bekliyor' : 
                                              invoice.status}
                                          </span>
                                        </td>
                                        <td className="py-4 text-sm text-right font-medium">
                                          {invoice.totalAmount} {invoice.currency || 'TRY'}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                                
                                <div className="text-right mt-4">
                                  <a 
                                    href="/portal/invoices" 
                                    className="text-orange-600 hover:text-orange-700 font-medium text-sm inline-flex items-center"
                                  >
                                    Tüm Faturalarım
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-8 text-gray-500">
                                Henüz fatura kaydınız bulunmuyor.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
            {/* Logo ve Açıklama */}
            <div className="col-span-1 md:col-span-3">
              <img src="/logo.png" alt="Taşı.app" className="h-8 mb-4" />
              <p className="text-gray-400 mb-4">
                Türkiye'nin en güvenilir ve hızlı taşımacılık platformu. Tek tıkla taşıyıcı bulun, anlık takip edin.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-orange-500 transition">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="col-span-1">
              <h3 className="text-lg font-semibold mb-4">Hizmetlerimiz</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-orange-500">Express Taşıma</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500">Koli Taşıma</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500">Paletli Taşıma</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500">Parsiyel Taşıma</a></li>
                <li><a href="#" className="text-gray-400 hover:text-orange-500">Kurye Hizmetleri</a></li>
              </ul>
            </div>

            <div className="col-span-1">
              <h3 className="text-lg font-semibold mb-4">Taşıyıcı</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/portal/login" className="text-gray-400 hover:text-orange-500">
                    Taşıyıcı Portal Girişi
                  </Link>
                </li>
                <li>
                  <Link href="/portal/register" className="text-gray-400 hover:text-orange-500 border border-gray-700 hover:border-orange-500 rounded px-3 py-1 inline-flex items-center transition-colors">
                    Taşıyıcı Olun
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-1">
              <h3 className="text-lg font-semibold mb-4">İletişim</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-400">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <span>+90 212 123 4567</span>
                </li>
                <li className="flex items-center text-gray-400">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  info@tasiapp.com
                </li>
                <li className="flex items-center text-gray-400">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  İstanbul, Türkiye
                </li>
              </ul>
            </div>
          </div>

          {/* Alt Footer */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 Taşı.app. Tüm hakları saklıdır.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-orange-500 text-sm transition">Gizlilik Politikası</a>
                <a href="#" className="text-gray-400 hover:text-orange-500 text-sm transition">Kullanım Şartları</a>
                <a href="#" className="text-gray-400 hover:text-orange-500 text-sm transition">KVKK</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
