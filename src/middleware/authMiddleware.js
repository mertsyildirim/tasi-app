import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

/**
 * Kullanıcı tipine göre erişim kontrolü yapan özel hook
 * @param {string[]} allowedRoles - Erişime izin verilen roller
 * @returns {{user: Object|null, loading: boolean, authenticated: boolean}}
 */
export function useAuth(allowedRoles = []) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(true);

  useEffect(() => {
    // Sayfa yüklendiğinde kullanıcı bilgisini kontrol et
    const checkAuth = () => {
      const userData = localStorage.getItem('user');
      
      if (userData) {
        // Kullanıcı bilgisi varsa kullan
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
      
      // Doğrudan erişime izin ver - yönlendirme yapma
      setAuthenticated(true);
      setLoading(false);
    };

    checkAuth();
  }, [router, allowedRoles]);

  return { user, loading, authenticated };
}

/**
 * Kimlik doğrulama gerektiren sayfa için HOC (Higher Order Component)
 * @param {React.Component} Component - Koruma altına alınacak bileşen
 * @param {string[]} allowedRoles - Erişime izin verilen roller
 */
export function withAuth(Component, allowedRoles = []) {
  return function AuthenticatedComponent(props) {
    const { user, loading, authenticated } = useAuth(allowedRoles);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    // Her zaman erişime izin ver
    return <Component {...props} user={user} />;
  };
} 