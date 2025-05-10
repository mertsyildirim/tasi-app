import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth-context';
import { 
  FaTachometerAlt, FaUsers, FaBuilding, FaTruck, FaCarAlt, 
  FaShippingFast, FaFileInvoiceDollar, FaCreditCard, FaCog,
  FaSignOutAlt, FaBars, FaTimes, FaUser, FaUserCircle
} from 'react-icons/fa';

export default function AdminLayout({ children, title }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Aktif link kontrolü
  const isActive = (path) => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };

  // Sidebar menü elemanı
  const MenuItem = ({ icon, title, path }) => (
    <Link href={path}>
      <a 
        className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
          isActive(path) 
            ? 'bg-orange-600 text-white' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <span className="mr-3">{icon}</span>
        <span>{title}</span>
      </a>
    </Link>
  );

  // Çıkış işlemi
  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <>
      <Head>
        <title>Taşı.app Admin Panel</title>
        <meta name="description" content="Taşı.app Admin Paneli" />
      </Head>

      <div className="flex h-screen bg-gray-100">
        {/* Mobil Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white shadow-lg transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-center h-16 bg-white border-b border-gray-200 text-gray-800">
            <Link href="/admin">
              <a className="flex items-center justify-center">
                <img src="/logo.png" alt="Taşı.app Logo" className="h-10 object-contain" />
              </a>
            </Link>
            <button 
              className="absolute right-4 top-4 lg:hidden text-gray-600"
              onClick={() => setSidebarOpen(false)}
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-col p-4 overflow-y-auto h-[calc(100%-4rem)]">
            <nav className="mt-2 space-y-1">
              <MenuItem 
                icon={<FaTachometerAlt />} 
                title="Gösterge Paneli" 
                path="/admin/dashboard" 
              />
              <MenuItem 
                icon={<FaUsers />} 
                title="Kullanıcı Yönetimi" 
                path="/admin/users" 
              />
              <MenuItem 
                icon={<FaBuilding />} 
                title="Şirket Yönetimi" 
                path="/admin/companies" 
              />
              <MenuItem 
                icon={<FaTruck />} 
                title="Sürücü Yönetimi" 
                path="/admin/drivers" 
              />
              <MenuItem 
                icon={<FaCarAlt />} 
                title="Araç Yönetimi" 
                path="/admin/vehicles" 
              />
              <MenuItem 
                icon={<FaShippingFast />} 
                title="Taşıma Talepleri" 
                path="/admin/transport-requests" 
              />
              <MenuItem 
                icon={<FaFileInvoiceDollar />} 
                title="Faturalar" 
                path="/admin/invoices" 
              />
              <MenuItem 
                icon={<FaCreditCard />} 
                title="Ödemeler" 
                path="/admin/payments" 
              />
              <MenuItem 
                icon={<FaCog />} 
                title="Sistem Ayarları" 
                path="/admin/settings" 
              />
            </nav>

            <div className="mt-auto pt-4 border-t border-gray-200">
              {user && (
                <div className="mb-4 px-4 py-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-orange-200 flex items-center justify-center text-orange-700">
                      <FaUser />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}
              <Link href="/admin/profile">
                <a className="w-full flex items-center px-4 py-3 text-gray-600 rounded-lg hover:bg-gray-100 mb-2">
                  <FaUserCircle className="mr-3" />
                  <span>Profil</span>
                </a>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-red-600 rounded-lg hover:bg-red-50"
              >
                <FaSignOutAlt className="mr-3" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-600 lg:hidden mr-2"
              >
                <FaBars className="h-6 w-6" />
              </button>
              <h1 className="text-lg font-medium text-gray-800">
                  {title}
              </h1>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            {children}
          </main>
        </div>
      </div>
    </>
  );
} 