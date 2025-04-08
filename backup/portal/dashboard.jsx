import React, { useState, useEffect } from 'react';
import { FaTruck, FaClipboardList, FaRoute, FaMoneyBillWave, FaUser, FaCog, FaBars, FaTimes, FaSignOutAlt, 
  FaBell, FaCalendarAlt, FaMapMarkerAlt, FaCheckCircle, FaExclamationTriangle, FaEye } from 'react-icons/fa';
import { useRouter } from 'next/router';
import Head from 'next/head';
import PortalLayout from '../../components/portal/Layout';

export default function TasiyiciDashboard() {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userData, setUserData] = useState(null);
  
  const router = useRouter();

  // Kullanıcı verilerini al
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem('portalUser'));
      if (user) {
        setUserData(user);
      }
    } catch (error) {
      console.error('Kullanıcı verileri alınamadı:', error);
    }
  }, []);

  // Mobil cihaz kontrolü
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Çıkış yapma işlevi
  const handleLogout = () => {
    localStorage.removeItem('portalUser');
    router.push('/portal');
  };

  // Sidebar menü öğeleri
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <FaTruck /> },
    { id: 'shipments', name: 'Taşımalarım', icon: <FaRoute /> },
    { id: 'requests', name: 'Açık Talepler', icon: <FaClipboardList /> },
    { id: 'payments', name: 'Ödemelerim', icon: <FaMoneyBillWave /> },
    { id: 'profile', name: 'Profil', icon: <FaUser /> },
    { id: 'settings', name: 'Ayarlar', icon: <FaCog /> },
  ];

  // Aktif taşıma talepleri
  const activeRequests = [
    {
      id: 'T1254',
      pickup: 'Kadıköy, İstanbul',
      delivery: 'Beşiktaş, İstanbul',
      distance: '10.5 km',
      type: 'Paletli Taşıma',
      amount: '₺450',
    },
    {
      id: 'T1255',
      pickup: 'Ataşehir, İstanbul',
      delivery: 'Sarıyer, İstanbul',
      distance: '22.3 km',
      type: 'Depo Taşıma',
      amount: '₺850',
    },
    {
      id: 'T1256',
      pickup: 'Bakırköy, İstanbul',
      delivery: 'Beylikdüzü, İstanbul',
      distance: '31.8 km',
      type: 'Koli Taşıma',
      amount: '₺320',
    },
  ];

  // Mevcut taşımalar
  const currentShipments = [
    {
      id: 'S7821',
      customer: 'ABC Tekstil Ltd.',
      pickup: 'Şişli, İstanbul',
      delivery: 'Çankaya, Ankara',
      deadline: '23 Nisan 2023',
      status: 'Yolda',
      progress: 50,
    },
    {
      id: 'S7822',
      customer: 'XYZ Elektronik A.Ş.',
      pickup: 'Gebze, Kocaeli',
      delivery: 'Nilüfer, Bursa',
      deadline: '25 Nisan 2023',
      status: 'Alındı',
      progress: 20,
    },
  ];

  // Şirket adı ve baş harflerini al
  const companyName = userData?.companyName || 'Süper Taşımacılık';
  const companyInitials = companyName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();

  return (
    <PortalLayout pageTitle="Dashboard">
      <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
        {/* Mobil menü butonu */}
        <div className="md:hidden bg-blue-600 text-white p-4 flex justify-between items-center">
          <h1 className="text-lg font-bold flex items-center">
            <FaTruck className="mr-2" /> Taşı.app Portal
          </h1>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white p-2"
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        
        {/* Sidebar */}
        <div className={`
          ${isMobile ? (sidebarOpen ? 'block' : 'hidden') : 'block'} 
          bg-blue-600 text-white w-full md:w-64 
          md:sticky md:top-0 md:h-screen overflow-y-auto
          transition-all duration-300
        `}>
          <div className="p-4 border-b border-blue-500">
            <h1 className="text-xl font-bold flex items-center">
              <FaTruck className="mr-2" /> Taşı.app Portal
            </h1>
          </div>
          
          <div className="p-4 border-b border-blue-500">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-white text-blue-600 flex items-center justify-center text-xl font-bold">
                {companyInitials}
              </div>
              <div className="ml-3">
                <div className="font-medium">{companyName}</div>
                <div className="text-sm text-blue-200">Firma #{userData?.id || '12345'}</div>
              </div>
            </div>
          </div>
          
          <nav className="mt-4">
            <ul>
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    className={`flex items-center w-full px-4 py-3 hover:bg-blue-700 transition-colors ${
                      activeTab === item.id ? 'bg-blue-700' : ''
                    }`}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (isMobile) setSidebarOpen(false);
                    }}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-3 hover:bg-blue-700 transition-colors mt-4 text-blue-200"
                >
                  <span className="mr-3"><FaSignOutAlt /></span>
                  Çıkış Yap
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Ana İçerik */}
        <div className="flex-1 overflow-x-hidden">
          <div className="bg-white border-b">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center py-4">
                <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
                <div className="flex items-center">
                  <button className="p-2 rounded-full hover:bg-gray-100 relative">
                    <FaBell className="text-gray-600" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full"></span>
                  </button>
                  <button className="flex items-center ml-4 text-sm font-medium text-gray-700">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2">
                      {companyInitials}
                    </div>
                    <span>{companyName}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <FaClipboardList className="text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-gray-500 text-sm">Açık Talepler</h3>
                    <p className="text-2xl font-bold">{activeRequests.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-full">
                    <FaRoute className="text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-gray-500 text-sm">Devam Eden Taşımalar</h3>
                    <p className="text-2xl font-bold">{currentShipments.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <FaMoneyBillWave className="text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-gray-500 text-sm">Aylık Kazanç</h3>
                    <p className="text-2xl font-bold">₺24,550</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center">
                    <FaClipboardList className="mr-2 text-blue-600" /> Açık Taşıma Talepleri
                  </h2>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                      <tr>
                        <th className="py-3 px-4 text-left">ID</th>
                        <th className="py-3 px-4 text-left">Rota</th>
                        <th className="py-3 px-4 text-center">Mesafe</th>
                        <th className="py-3 px-4 text-center">Tür</th>
                        <th className="py-3 px-4 text-center">Ücret</th>
                        <th className="py-3 px-4 text-center">İşlem</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {activeRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">#{request.id}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            <div className="flex flex-col">
                              <span className="flex items-center">
                                <FaMapMarkerAlt className="text-red-500 mr-1" size={12} /> {request.pickup}
                              </span>
                              <span className="flex items-center mt-1">
                                <FaMapMarkerAlt className="text-green-500 mr-1" size={12} /> {request.delivery}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-center text-gray-600">{request.distance}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="bg-blue-100 text-blue-800 text-xs py-1 px-2 rounded-full">
                              {request.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-center font-bold text-gray-900">{request.amount}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex justify-center space-x-2">
                              <button className="bg-green-500 text-white py-1 px-2 rounded text-xs hover:bg-green-600">
                                Kabul Et
                              </button>
                              <button className="bg-gray-100 text-gray-600 py-1 px-2 rounded text-xs hover:bg-gray-200">
                                Detay
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="p-4 border-t border-gray-200 text-center">
                    <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Tüm Talepleri Görüntüle →
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center">
                    <FaRoute className="mr-2 text-green-600" /> Aktif Taşımalarım
                  </h2>
                </div>
                
                <div className="p-6 space-y-6">
                  {currentShipments.map((shipment) => (
                    <div key={shipment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">#{shipment.id} - {shipment.customer}</h3>
                          <div className="flex flex-col mt-2 text-xs text-gray-600">
                            <span className="flex items-center">
                              <FaMapMarkerAlt className="text-red-500 mr-1" size={12} /> {shipment.pickup}
                            </span>
                            <span className="flex items-center mt-1">
                              <FaMapMarkerAlt className="text-green-500 mr-1" size={12} /> {shipment.delivery}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          {shipment.status === 'Yolda' ? (
                            <span className="bg-blue-100 text-blue-800 text-xs py-1 px-2 rounded-full">
                              Yolda
                            </span>
                          ) : (
                            <span className="bg-orange-100 text-orange-800 text-xs py-1 px-2 rounded-full">
                              Alındı
                            </span>
                          )}
                          <div className="text-xs text-gray-500 mt-1 flex items-center justify-end">
                            <FaCalendarAlt className="mr-1" size={10} /> 
                            Teslim: {shipment.deadline}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>İlerleme</span>
                          <span>{shipment.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              shipment.status === 'Yolda' ? 'bg-blue-500' : 'bg-orange-500'
                            }`}
                            style={{ width: `${shipment.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <button className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center">
                          <FaEye className="mr-1" /> Detayları Görüntüle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 border-t border-gray-200 text-center">
                  <a href="#" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Tüm Taşımaları Görüntüle →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
} 