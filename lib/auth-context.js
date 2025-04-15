import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

const AuthContext = createContext();

// Mock kullanıcı verileri
const MOCK_USERS = {
  'ahmet@example.com': {
    id: 'cust_123',
    email: 'ahmet@example.com',
    password: 'Test123!',
    name: 'Ahmet Yılmaz',
    role: 'customer',
    phone: '+90 555 123 4567',
    address: 'Kadıköy, İstanbul',
    notifications: true,
    language: 'tr',
    createdAt: '2024-03-15T10:00:00Z',
    lastLogin: '2024-03-20T15:30:00Z'
  },
  'testbelge@test.com': {
    id: 'cust_456',
    email: 'testbelge@test.com',
    password: 'test123',
    name: 'Test Kullanıcı',
    role: 'carrier',
    phone: '+90 555 987 6543',
    address: 'Üsküdar, İstanbul',
    notifications: true,
    language: 'tr',
    createdAt: '2024-06-01T10:00:00Z',
    lastLogin: '2024-06-01T10:00:00Z',
    documentStatus: 'WAITING_DOCUMENTS'
  },
  'tasiapp@example.com': {
    id: 'carrier_789',
    email: 'tasiapp@example.com',
    password: 'Tasi123!',
    name: 'Taşı App Kullanıcı',
    role: 'carrier',
    phone: '+90 555 123 4567',
    address: 'Levent, İstanbul',
    createdAt: '2024-01-15T10:00:00Z',
    lastLogin: '2024-04-01T08:30:00Z'
  },
  'driver@tasiapp.com': {
    id: 'driver_012',
    email: 'driver@tasiapp.com',
    password: 'Driver123!',
    name: 'Sürücü Kullanıcı',
    role: 'driver',
    phone: '+90 555 888 9999',
    address: 'Beşiktaş, İstanbul',
    createdAt: '2024-02-10T14:20:00Z',
    lastLogin: '2024-04-01T09:15:00Z'
  },
  'demo@tasiapp.com': {
    id: 'carrier_345',
    email: 'demo@tasiapp.com',
    password: 'demo123',
    name: 'Demo Kullanıcı',
    role: 'carrier',
    phone: '+90 555 777 8888',
    address: 'Şişli, İstanbul',
    createdAt: '2024-03-05T11:30:00Z',
    lastLogin: '2024-04-01T10:00:00Z'
  },
  'admin@tasiapp.com': {
    id: 'admin_678',
    email: 'admin@tasiapp.com',
    password: 'Admin123!',
    name: 'Admin Kullanıcı',
    role: 'admin',
    phone: '+90 555 444 5555',
    address: 'Ankara',
    createdAt: '2024-01-01T09:00:00Z',
    lastLogin: '2024-04-02T08:00:00Z'
  },
  'surucu@tasiapp.com': {
    id: 'driver_901',
    email: 'surucu@tasiapp.com',
    password: '1234',
    name: 'Sürücü Kullanıcı',
    role: 'driver',
    phone: '+90 555 333 2222',
    address: 'İzmir',
    createdAt: '2024-02-20T15:45:00Z',
    lastLogin: '2024-04-01T07:30:00Z'
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadUserFromCookies() {
      const userData = localStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      setLoading(false);
    }

    loadUserFromCookies();
  }, []);

  const login = async (email, password) => {
    try {
      // Mock login kontrolü
      const mockUser = MOCK_USERS[email];
      if (!mockUser || mockUser.password !== password) {
        return {
          success: false,
          error: 'Email veya şifre hatalı'
        };
      }

      // Başarılı giriş
      const userData = {
        ...mockUser,
        password: undefined // Şifreyi client tarafında tutmuyoruz
      };

      localStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);

      // Belge durumu kontrolü
      if (userData.documentStatus === 'WAITING_DOCUMENTS') {
        router.push('/portal/upload-documents');
        return {
          success: true,
          user: userData,
          redirectTo: '/portal/upload-documents'
        };
      }

      // Role göre yönlendirme
      if (userData.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (userData.role === 'driver') {
        router.push('/portal/driver/dashboard');
      } else if (userData.role === 'carrier') {
        router.push('/portal/dashboard');  
      } else if (userData.role === 'customer') {
        router.push('/profile');
      } else {
        router.push('/');
      }

      return {
        success: true,
        user: userData
      };

    } catch (error) {
      console.error('Giriş yapılırken hata oluştu:', error);
      return {
        success: false,
        error: 'Giriş sırasında bir hata oluştu'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('userData');
    setUser(null);
    router.push('/portal/login');
  };

  const register = async (userData) => {
    try {
      // Mock register işlemi
      const newUser = {
        id: `cust_${Date.now()}`,
        ...userData,
        role: 'customer',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      // Yeni kullanıcıyı mock veritabanına ekle
      MOCK_USERS[userData.email] = newUser;

      return { success: true };
    } catch (error) {
      console.error('Kayıt sırasında hata oluştu:', error);
      return {
        success: false,
        error: 'Kayıt sırasında bir hata oluştu'
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      // Mock profil güncelleme
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      console.error('Profil güncellenirken hata oluştu:', error);
      return {
        success: false,
        error: 'Profil güncellenirken bir hata oluştu'
      };
    }
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated: !!user,
      user,
      loading,
      login,
      logout,
      register,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export function withAuth(WrappedComponent, allowedRoles = []) {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!isAuthenticated) {
          router.replace('/login');
          return;
        }

        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
          router.replace('/');
        }
      }
    }, [loading, isAuthenticated, user, router]);

    if (loading) {
      return <div>Yükleniyor...</div>;
    }

    return isAuthenticated ? <WrappedComponent {...props} /> : null;
  };
} 