import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/router';

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
  'test@test.com': {
    id: 'cust_789',
    email: 'test@test.com',
    password: 'test123',
    name: 'Test Kullanıcı',
    role: 'customer',
    phone: '+90 555 111 2222',
    address: 'Beşiktaş, İstanbul',
    notifications: true,
    language: 'tr',
    createdAt: '2024-06-01T10:00:00Z',
    lastLogin: '2024-06-01T10:00:00Z'
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
        // Test için otomatik giriş yapılacak
        console.log('Otomatik mock kullanıcı girişi yapılıyor');
        
        // Demo kullanıcı
        const demoUser = {
          id: 'demo_user',
          email: email || 'demo@tasiapp.com',
          name: 'Demo Kullanıcı',
          role: 'customer',
          phone: '+90 555 123 4567',
          address: 'İstanbul, Türkiye'
        };
        
        localStorage.setItem('userData', JSON.stringify(demoUser));
        setUser(demoUser);
        
        if (email.includes('carrier') || email.includes('tasiyici')) {
          router.push('/portal/dashboard');
        } else {
          router.push('/profile');
        }
        
        return {
          success: true,
          user: demoUser
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
      if (userData.role === 'customer') {
        router.push('/profile');
      } else if (userData.role === 'carrier') {
        router.push('/portal/dashboard');
      } else {
        router.push('/');
      }

      return {
        success: true,
        user: userData
      };

    } catch (error) {
      console.error('Giriş yapılırken hata oluştu:', error);
      
      // Hata durumunda da otomatik giriş yap
      const demoUser = {
        id: 'demo_user',
        email: email || 'demo@tasiapp.com',
        name: 'Demo Kullanıcı',
        role: 'customer',
        phone: '+90 555 123 4567',
        address: 'İstanbul, Türkiye'
      };
      
      localStorage.setItem('userData', JSON.stringify(demoUser));
      setUser(demoUser);
      
      router.push('/profile');
      
      return {
        success: true,
        user: demoUser
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('userData');
    setUser(null);
    router.push('/login');
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
      
      // Otomatik giriş yap
      const registeredUser = {
        ...newUser,
        password: undefined
      };
      
      localStorage.setItem('userData', JSON.stringify(registeredUser));
      setUser(registeredUser);
      
      router.push('/profile');

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