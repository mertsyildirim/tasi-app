import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth-context';
import MainLayout from './MainLayout';
import CompanyPortalLayout from './CompanyPortalLayout';
import DriverPortalLayout from './DriverPortalLayout';
import AdminLayout from './AdminLayout';

export default function Layout({ children }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  
  // URL'ye göre hangi layout'un kullanılacağını belirle
  const { pathname } = router;
  
  // Admin paneli sayfaları
  if (pathname.startsWith('/admin')) {
    // Admin yetkisi kontrolü
    if (isAuthenticated && user?.role === 'admin') {
      return <AdminLayout>{children}</AdminLayout>;
    }
    // Admin yetkisi yoksa ve giriş yapmışsa - yetkisiz sayfası
    else if (isAuthenticated) {
      return (
        <MainLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Yetkisiz Erişim</h1>
              <p className="mb-6">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
              <button 
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        </MainLayout>
      );
    }
    // Giriş yapmamışsa - login sayfasına yönlendir
    else {
      router.push('/login');
      return null;
    }
  }
  
  // Şirket portalı sayfaları
  else if (pathname.startsWith('/portal') && !pathname.startsWith('/portal/driver')) {
    // Şirket yetkisi kontrolü
    if (isAuthenticated && user?.role === 'company') {
      return <CompanyPortalLayout>{children}</CompanyPortalLayout>;
    }
    // Şirket yetkisi yoksa ve giriş yapmışsa - yetkisiz sayfası
    else if (isAuthenticated) {
      return (
        <MainLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Yetkisiz Erişim</h1>
              <p className="mb-6">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
              <button 
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        </MainLayout>
      );
    }
    // Giriş yapmamışsa - login sayfasına yönlendir
    else {
      router.push('/login');
      return null;
    }
  }
  
  // Sürücü portalı sayfaları
  else if (pathname.startsWith('/portal/driver')) {
    // Sürücü yetkisi kontrolü
    if (isAuthenticated && user?.role === 'driver') {
      return <DriverPortalLayout>{children}</DriverPortalLayout>;
    }
    // Sürücü yetkisi yoksa ve giriş yapmışsa - yetkisiz sayfası
    else if (isAuthenticated) {
      return (
        <MainLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Yetkisiz Erişim</h1>
              <p className="mb-6">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
              <button 
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Ana Sayfaya Dön
              </button>
            </div>
          </div>
        </MainLayout>
      );
    }
    // Giriş yapmamışsa - login sayfasına yönlendir
    else {
      router.push('/login');
      return null;
    }
  }
  
  // Giriş/Kayıt sayfaları için özel durum
  else if (pathname === '/login' || pathname === '/register') {
    // Kullanıcı zaten giriş yapmışsa, rolüne göre yönlendir
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (user?.role === 'company') {
        router.push('/portal/dashboard');
      } else if (user?.role === 'driver') {
        router.push('/portal/driver/dashboard');
      } else {
        router.push('/');
      }
      return null;
    }
    // Giriş yapmamışsa, login/register sayfasını göster
    else {
      return <MainLayout>{children}</MainLayout>;
    }
  }
  
  // Diğer tüm sayfalar için ana layout kullan
  else {
    return <MainLayout>{children}</MainLayout>;
  }
} 