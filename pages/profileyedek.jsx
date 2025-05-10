'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock, FaBell, FaLanguage, FaHistory, FaFileInvoice, FaEdit, FaCamera, FaSignOutAlt, FaTruck, FaHome } from 'react-icons/fa';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import MainLayout from '../components/layout/MainLayout';
import DefaultAvatar from '../components/DefaultAvatar';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
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

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    // Customer rolü kontrolü
    if (parsedUser.role !== 'customer') {
      router.push('/');
      return;
    }

    setUser(parsedUser);
    setFormData({
      fullName: parsedUser.name || '',
      email: parsedUser.email || '',
      phone: parsedUser.phone || '',
      address: parsedUser.address || '',
      notifications: parsedUser.notifications !== false,
      language: parsedUser.language || 'tr',
      taxNumber: parsedUser.taxNumber || '',
      billingAddress: parsedUser.billingAddress || ''
    });
    setProfileImage(parsedUser.profileImage || null);
    setLoading(false);
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // API çağrısı yapılacak
    console.log('Form data:', formData);
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'summary', name: 'Profil Özeti', icon: <FaHome /> },
    { id: 'personal', name: 'Kişisel Bilgiler', icon: <FaUser /> },
    { id: 'settings', name: 'Hesap Ayarları', icon: <FaLock /> },
    { id: 'history', name: 'Taşıma Geçmişi', icon: <FaHistory /> },
    { id: 'billing', name: 'Fatura Bilgileri', icon: <FaFileInvoice /> }
  ];

  // Örnek taşıma geçmişi
  const shipmentHistory = [
    { id: 1, date: '01.04.2024', from: 'İstanbul', to: 'Ankara', status: 'Tamamlandı', amount: '₺450' },
    { id: 2, date: '15.03.2024', from: 'İzmir', to: 'Antalya', status: 'Tamamlandı', amount: '₺380' },
    { id: 3, date: '01.03.2024', from: 'Bursa', to: 'İstanbul', status: 'Tamamlandı', amount: '₺290' }
  ];

  return (
    <MainLayout>
      <Head>
        <title>Profil | Taşı.app</title>
        <meta name="description" content="Taşı.app profil sayfası" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-8">
                {/* Sol Sidebar */}
                <div className="w-full sm:w-72 flex-shrink-0 bg-gray-50 rounded-xl p-6">
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative">
                      {profileImage ? (
                        <Image
                          src={profileImage}
                          alt="Profil Fotoğrafı"
                          width={128}
                          height={128}
                          className="rounded-full"
                        />
                      ) : (
                        <DefaultAvatar name={formData.fullName} size="xl" />
                      )}
                      <button 
                        className="absolute bottom-0 right-0 bg-orange-600 text-white p-2 rounded-full hover:bg-orange-700 transition-colors"
                        onClick={() => {/* Fotoğraf yükleme fonksiyonu */}}
                      >
                        <FaCamera className="w-4 h-4" />
                      </button>
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-gray-900">{formData.fullName}</h2>
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
                  </nav>
                </div>

                {/* Sağ İçerik */}
                <div className="flex-1 bg-white rounded-xl">
                  {activeTab === 'summary' && (
                    <div className="bg-white rounded-xl">
                      <h3 className="text-xl font-semibold text-gray-900 mb-8">Profil Özeti</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Kişisel Bilgiler Özeti */}
                        <div className="bg-orange-50 rounded-xl p-6">
                          <h4 className="text-lg font-medium text-orange-800 mb-4">Kişisel Bilgiler</h4>
                          <div className="space-y-3">
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
                          </div>
                          <button
                            onClick={() => setActiveTab('personal')}
                            className="mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center"
                          >
                            Detayları Düzenle
                            <FaEdit className="ml-2" />
                          </button>
                        </div>

                        {/* Son Taşımalar */}
                        <div className="bg-orange-50 rounded-xl p-6">
                          <h4 className="text-lg font-medium text-orange-800 mb-4">Son Taşımalar</h4>
                          <div className="space-y-3">
                            {shipmentHistory.slice(0, 3).map((shipment) => (
                              <div key={shipment.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center text-gray-600">
                                  <FaTruck className="w-5 h-5 mr-3 text-orange-600" />
                                  <span>{shipment.from} → {shipment.to}</span>
                                </div>
                                <span className="text-orange-600 font-medium">{shipment.amount}</span>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => setActiveTab('history')}
                            className="mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center"
                          >
                            Tüm Taşımalar
                            <FaHistory className="ml-2" />
                          </button>
                        </div>

                        {/* Fatura Bilgileri Özeti */}
                        <div className="bg-orange-50 rounded-xl p-6">
                          <h4 className="text-lg font-medium text-orange-800 mb-4">Fatura Bilgileri</h4>
                          <div className="space-y-3">
                            <div className="flex items-center text-gray-600">
                              <FaFileInvoice className="w-5 h-5 mr-3 text-orange-600" />
                              <span>Vergi/TC No: {formData.taxNumber || 'Belirtilmedi'}</span>
                            </div>
                            <div className="flex items-start text-gray-600">
                              <FaMapMarkerAlt className="w-5 h-5 mr-3 mt-1 text-orange-600" />
                              <span className="flex-1">{formData.billingAddress || 'Fatura adresi belirtilmedi'}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveTab('billing')}
                            className="mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center"
                          >
                            Detayları Düzenle
                            <FaEdit className="ml-2" />
                          </button>
                        </div>

                        {/* Hesap Ayarları Özeti */}
                        <div className="bg-orange-50 rounded-xl p-6">
                          <h4 className="text-lg font-medium text-orange-800 mb-4">Hesap Ayarları</h4>
                          <div className="space-y-3">
                            <div className="flex items-center text-gray-600">
                              <FaBell className="w-5 h-5 mr-3 text-orange-600" />
                              <span>Bildirimler: {formData.notifications ? 'Açık' : 'Kapalı'}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <FaLanguage className="w-5 h-5 mr-3 text-orange-600" />
                              <span>Dil: {formData.language === 'tr' ? 'Türkçe' : 'English'}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveTab('settings')}
                            className="mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center"
                          >
                            Ayarları Düzenle
                            <FaEdit className="ml-2" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'personal' && (
                    <div className="bg-white rounded-xl">
                      <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-semibold text-gray-900">Kişisel Bilgiler</h3>
                        <button
                          onClick={() => setIsEditing(!isEditing)}
                          className="flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                            ${isEditing ? 'text-gray-600 hover:text-gray-700' : 'text-orange-500 hover:text-orange-600'}"
                        >
                          <FaEdit className="mr-2" />
                          {isEditing ? 'İptal' : 'Düzenle'}
                        </button>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Ad Soyad</label>
                          <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">E-posta</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Telefon</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Adres</label>
                          <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>

                        {isEditing && (
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                              Kaydet
                            </button>
                          </div>
                        )}
                      </form>
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="bg-white rounded-xl">
                      <h3 className="text-xl font-semibold text-gray-900 mb-8">Hesap Ayarları</h3>
                      <div className="space-y-8">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-4">Bildirimler</h4>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="notifications"
                              checked={formData.notifications}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-600">
                              E-posta bildirimleri almak istiyorum
                            </span>
                          </label>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-4">Dil</h4>
                          <select
                            name="language"
                            value={formData.language}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option value="tr">Türkçe</option>
                            <option value="en">English</option>
                          </select>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-4">Şifre Değiştir</h4>
                          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                            <FaLock className="mr-2" />
                            Şifre Değiştir
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'history' && (
                    <div className="bg-white rounded-xl">
                      <h3 className="text-xl font-semibold text-gray-900 mb-8">Taşıma Geçmişi</h3>
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nereden</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nereye</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {shipmentHistory.map((shipment) => (
                              <tr key={shipment.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.from}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.to}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    {shipment.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.amount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeTab === 'billing' && (
                    <div className="bg-white rounded-xl">
                      <h3 className="text-xl font-semibold text-gray-900 mb-8">Fatura Bilgileri</h3>
                      <form className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Vergi/TC Kimlik No</label>
                          <input
                            type="text"
                            name="taxNumber"
                            value={formData.taxNumber}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Fatura Adresi</label>
                          <textarea
                            name="billingAddress"
                            value={formData.billingAddress}
                            onChange={handleInputChange}
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                          >
                            Kaydet
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 
 