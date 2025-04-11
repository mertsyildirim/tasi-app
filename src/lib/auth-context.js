import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Sayfa yüklendiğinde kullanıcı durumunu kontrol et
  useEffect(() => {
    async function loadUserFromCookies() {
      const token = Cookies.get('auth_token');
      
      if (token) {
        // Token varsa, kullanıcı bilgilerini al
        try {
          axios.defaults.headers.Authorization = `Bearer ${token}`;
          const { data } = await axios.get('/api/users/profile');
          
          if (data.user) {
            setUser({
              ...data.user,
              profile: data.profile || null,
              stats: data.stats || null
            });
          }
        } catch (error) {
          console.error('Oturum doğrulanırken hata oluştu:', error);
          Cookies.remove('auth_token');
          delete axios.defaults.headers.Authorization;
        }
      }
      
      setLoading(false);
    }

    loadUserFromCookies();
  }, []);

  // Giriş fonksiyonu
  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      
      if (data.token) {
        Cookies.set('auth_token', data.token, { expires: 7 }); // 7 günlük token
        axios.defaults.headers.Authorization = `Bearer ${data.token}`;
        
        // Kullanıcı bilgilerini al
        const userData = await axios.get('/api/users/profile');
        
        setUser({
          ...userData.data.user,
          profile: userData.data.profile || null,
          stats: userData.data.stats || null
        });

        // Kullanıcı rolüne göre yönlendirme
        const role = userData.data.user.role;
        
        if (role === 'admin') {
          router.push('/admin/dashboard');
        } else if (role === 'company') {
          router.push('/portal/dashboard');
        } else if (role === 'driver') {
          router.push('/portal/driver/dashboard');
        } else {
          router.push('/');
        }
        
        return {
          success: true,
          user: userData.data.user
        };
      }
      
      return { success: false, error: 'Giriş başarısız' };
    } catch (error) {
      console.error('Giriş yapılırken hata oluştu:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Giriş sırasında bir hata oluştu'
      };
    }
  };

  // Çıkış fonksiyonu
  const logout = () => {
    Cookies.remove('auth_token');
    delete axios.defaults.headers.Authorization;
    setUser(null);
    router.push('/login');
  };

  // Kayıt fonksiyonu
  const register = async (userData) => {
    try {
      const { data } = await axios.post('/api/auth/register', userData);
      
      if (data.success) {
        return { success: true };
      }
      
      return { success: false, error: 'Kayıt başarısız' };
    } catch (error) {
      console.error('Kayıt sırasında hata oluştu:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Kayıt sırasında bir hata oluştu'
      };
    }
  };

  // Kullanıcı bilgilerini güncelleme
  const updateProfile = async (profileData) => {
    try {
      const { data } = await axios.put('/api/users/profile', profileData);
      
      if (data.success) {
        // Güncellenmiş kullanıcı bilgilerini al
        const userData = await axios.get('/api/users/profile');
        
        setUser({
          ...userData.data.user,
          profile: userData.data.profile || null,
          stats: userData.data.stats || null
        });
        
        return { success: true };
      }
      
      return { success: false, error: 'Profil güncellenemedi' };
    } catch (error) {
      console.error('Profil güncellenirken hata oluştu:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Profil güncellenirken bir hata oluştu'
      };
    }
  };

  // Auth bağlamında sunulacak değerler
  const authContextValue = {
    isAuthenticated: !!user,
    user,
    loading,
    login,
    logout,
    register,
    updateProfile
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Auth bağlamını kullanmak için hook
export const useAuth = () => useContext(AuthContext);

// Yalnızca belirli rollere erişim için HOC (Higher Order Component)
export function withAuth(WrappedComponent, allowedRoles = []) {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, user, loading } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
      // Yükleme tamamlandıktan sonra kontrol et
      if (!loading) {
        // Kullanıcı oturum açmamışsa login sayfasına yönlendir
        if (!isAuthenticated) {
          router.replace('/login');
          return;
        }
        
        // Belirli roller belirtilmişse ve kullanıcının rolü izin verilenler arasında değilse
        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
          // Kullanıcı rolüne göre uygun sayfaya yönlendir
          if (user.role === 'admin') {
            router.replace('/admin/dashboard');
          } else if (user.role === 'company') {
            router.replace('/portal/dashboard');
          } else if (user.role === 'driver') {
            router.replace('/portal/driver/dashboard');
          } else {
            router.replace('/');
          }
        }
      }
    }, [isAuthenticated, loading, router, user]);

    // Yükleme durumundaysa veya kimlik doğrulama gerekiyorsa
    if (loading || !isAuthenticated) {
      return <div>Yükleniyor...</div>;
    }
    
    // Belirli roller belirtilmişse ve kullanıcının rolü izin verilenler arasında değilse
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return <div>Bu sayfaya erişim izniniz yok.</div>;
    }

    // Tüm kontrollerden geçerse bileşeni göster
    return <WrappedComponent {...props} />;
  };
} 