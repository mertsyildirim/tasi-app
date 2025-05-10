import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/router';
import { signIn, signOut, useSession } from 'next-auth/react';

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
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
    } else if (status === 'authenticated') {
      setUser(session.user);
      setLoading(false);
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [status, session]);

  const login = async (email, password) => {
    try {
      console.log('Giriş denemesi:', email);
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      console.log('Giriş sonucu:', result);

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.ok) {
        // Kullanıcı rolüne göre yönlendirme
        const userRole = session?.user?.roles?.[0] || 'user';
        console.log('Kullanıcı rolü:', userRole);
        
        if (userRole === 'admin' || userRole === 'super_admin') {
          router.push('/admin/dashboard');
        } else if (userRole === 'driver') {
          router.push('/portal/driver/dashboard');
        } else if (userRole === 'carrier') {
          router.push('/portal/dashboard');
        } else {
          router.push('/profile');
        }
      }
    } catch (error) {
      console.error('Giriş hatası:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      router.push('/admin');
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kayıt işlemi başarısız oldu');
      }

      return data;
    } catch (error) {
      console.error('Kayıt hatası:', error);
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Profil güncelleme başarısız oldu');
      }

      setUser(data.user);
      return data;
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export function withAuth(WrappedComponent, allowedRoles = []) {
  return function AuthenticatedComponent(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.replace('/admin');
      }
    }, [user, loading, router]);

    if (loading) {
      return <div>Yükleniyor...</div>;
    }

    if (!user) {
      return null;
    }

    // Admin rolü kontrolünü kaldırıyoruz
    // if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    //   return <div>Bu sayfaya erişim yetkiniz yok</div>;
    // }

    return <WrappedComponent {...props} />;
  };
} 