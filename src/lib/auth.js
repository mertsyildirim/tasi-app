import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import axios from 'axios';

const AuthContext = createContext({});

// Axios için default authorization header ayarla
const setAxiosAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadUserFromCookies();
  }, []);

  const loadUserFromCookies = async () => {
    try {
      const token = Cookies.get('auth');
      if (token) {
        axios.defaults.headers.Authorization = `Bearer ${token}`;
        try {
          const { data } = await axios.get('/api/users/profile');
          if (data) setUser(data);
        } catch (error) {
          console.error('Profile yüklenirken hata:', error);
          Cookies.remove('auth');
          delete axios.defaults.headers.Authorization;
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Token yüklenirken hata:', error);
      Cookies.remove('auth');
      delete axios.defaults.headers.Authorization;
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      
      if (data.success) {
        setUser(data.user);
        
        // Token cookie'ye otomatik olarak kaydedildi, sadece axios header'ını ayarlıyoruz
        const token = Cookies.get('auth');
        if (token) {
          axios.defaults.headers.Authorization = `Bearer ${token}`;
        }
        
        // Role göre yönlendirme
        switch (data.user.role) {
          case 'super_admin':
          case 'editor':
          case 'support':
            router.push('/admin');
            break;
          case 'carrier':
            router.push('/portal');
            break;
          case 'driver':
            router.push('/portal');
            break;
          default:
            router.push('/profile');
        }
        
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Giriş yapılırken bir hata oluştu'
      };
    }
  };

  const logout = () => {
    Cookies.remove('auth');
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
export function withAuth(Component, allowedRoles = []) {
  return function AuthenticatedComponent(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        // Kullanıcı girişi yapılmadıysa login sayfasına yönlendir
        if (!user) {
          router.push('/login');
          return;
        }
        
        // Rol kontrolü - izin verilen roller belirtilmişse ve kullanıcının rolü bu listede değilse
        if (allowedRoles.length > 0) {
          // Kullanıcının rolu
          const userRole = user.role || '';
          // Kullanıcının rolleri (eğer varsa)
          const userRoles = user.roles || [userRole];
          
          // Kullanıcının herhangi bir rolü izin verilen rollerden biriyse erişime izin ver
          const hasAllowedRole = userRoles.some(role => allowedRoles.includes(role)) || allowedRoles.includes(userRole);
          
          if (!hasAllowedRole) {
            console.log('Yetkisiz erişim. İzin verilen roller:', allowedRoles, 'Kullanıcı rolleri:', userRoles, 'Kullanıcı rolü:', userRole);
            // Yetkisiz erişimde ana sayfaya yönlendir
            router.push('/');
          }
        }
      }
    }, [loading, user, router]);

    if (loading) {
      return <div>Yükleniyor...</div>;
    }

    return user ? <Component {...props} /> : null;
  };
} 