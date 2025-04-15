import React, { useState, useEffect } from 'react';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaLock, 
  FaSave, 
  FaShieldAlt, 
  FaUserCog, 
  FaIdCard,
  FaEye,
  FaEyeSlash,
  FaCamera
} from 'react-icons/fa';
import AdminLayout from '../../components/admin/Layout';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

export default function AdminProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordStatus, setPasswordStatus] = useState('idle');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    // Kullanıcı bilgilerini fetch et
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          console.error('Kullanıcı oturumu bulunamadı');
          router.replace('/admin'); // Oturum yoksa giriş sayfasına yönlendir
          return;
        }
        
        // API'den kullanıcı verilerini al
        const response = await fetch('/api/admin/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Kullanıcı profili alınamadı');
        }
        
        const data = await response.json();
        
        if (data.success && data.user) {
          setUser(data.user);
          
          // Form verilerini doldur
          setFormData(prev => ({
            ...prev,
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.user.phone || ''
          }));
        } else {
          throw new Error(data.message || 'Kullanıcı verileri alınamadı');
        }
      } catch (error) {
        console.error('Kullanıcı bilgileri yüklenirken hata:', error);
        toast.error(error.message || 'Kullanıcı bilgileri yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    // Form doğrulama
    if (!formData.name.trim()) {
      toast.error('İsim alanı zorunludur');
      return;
    }
    
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      toast.error('Geçerli bir e-posta adresi girmelisiniz');
      return;
    }
    
    setSaving(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      
      // API'ye profil güncelleme isteği gönder
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Profil güncellenirken bir hata oluştu');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        toast.success('Profil bilgileriniz başarıyla güncellendi');
      } else {
        throw new Error(data.message || 'Profil güncellenirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Profil güncellenirken hata:', error);
      toast.error(error.message || 'Profil güncellenirken bir hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordStatus('submitting');
    
    // Şifre doğrulama
    if (!formData.oldPassword) {
      setPasswordError('Mevcut şifrenizi girmelisiniz');
      setPasswordStatus('error');
      return;
    }
    
    if (!formData.newPassword || formData.newPassword.length < 6) {
      setPasswordError('Yeni şifre en az 6 karakter olmalıdır');
      setPasswordStatus('error');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError('Şifreler eşleşmiyor');
      setPasswordStatus('error');
      return;
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      
      // API'ye şifre değiştirme isteği gönder
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.oldPassword,
          newPassword: formData.newPassword
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Şifre değiştirilirken bir hata oluştu');
      }
      
      setPasswordStatus('success');
      setPasswordSuccess('Şifreniz başarıyla değiştirildi');
      
      // Şifre alanlarını temizle
      setFormData(prev => ({
        ...prev,
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      // 3 saniye sonra başarı mesajını temizle
      setTimeout(() => {
        setPasswordSuccess('');
        setPasswordStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Şifre değiştirilirken hata:', error);
      setPasswordError(error.message || 'Şifre değiştirilirken bir hata oluştu');
      setPasswordStatus('error');
    }
  };

  // İsim baş harflerini alma
  const getInitials = (name) => {
    if (!name) return 'A';
    
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
  
  // Kullanıcı rolünü formatla
  const formatUserRole = (role) => {
    switch(role) {
      case 'super_admin': return 'Süper Admin';
      case 'admin': return 'Admin';
      case 'editor': return 'Editör';
      case 'support': return 'Destek';
      default: return 'Kullanıcı';
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Profil">
        <div className="flex justify-center items-center min-h-screen-content">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Profil">
      <div className="container mx-auto p-4 md:p-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Kullanıcı profil header */}
          <div className="bg-orange-600 text-white p-6">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-orange-600">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user?.name || 'Kullanıcı'} 
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <FaUser className="w-12 h-12" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user?.name || 'Kullanıcı'}</h1>
                <p className="text-orange-100 flex items-center">
                  <FaEnvelope className="mr-2" />
                  {user?.email || 'Yükleniyor...'}
                </p>
                <div className="flex items-center mt-2">
                  <span className="bg-orange-700 text-orange-100 px-3 py-1 rounded-full text-sm">
                    {formatUserRole(user?.role)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Profil içeriği */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profil bilgileri formu */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FaUserCog className="mr-2" /> Profil Bilgileri
                </h2>
                
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  {/* İsim */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Ad Soyad
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        placeholder="Adınız Soyadınız"
                      />
                    </div>
                  </div>
                  
                  {/* E-posta */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      E-posta Adresi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        placeholder="ornek@mail.com"
                      />
                    </div>
                  </div>
                  
                  {/* Telefon */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaPhone className="text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        placeholder="+90 555 123 45 67"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      {saving ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Kaydediliyor...
                        </>
                      ) : (
                        <>
                          <FaSave className="mr-2" /> Bilgileri Kaydet
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Şifre değiştirme formu */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <FaLock className="mr-2" /> Şifre Değiştir
                </h2>
                
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  {/* Mevcut şifre */}
                  <div>
                    <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Mevcut Şifre
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="oldPassword"
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleChange}
                        className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        placeholder="Mevcut şifreniz"
                      />
                      <button 
                        type="button" 
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Yeni şifre */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Yeni Şifre
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        placeholder="En az 6 karakter"
                      />
                    </div>
                  </div>
                  
                  {/* Şifre tekrar */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Şifre Tekrar
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        placeholder="Şifrenizi tekrar girin"
                      />
                    </div>
                  </div>
                  
                  {/* Hata veya başarı mesajları */}
                  {passwordStatus === 'error' && (
                    <div className="text-red-500 text-sm">{passwordError}</div>
                  )}
                  
                  {passwordStatus === 'success' && (
                    <div className="text-green-500 text-sm">{passwordSuccess}</div>
                  )}
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={passwordStatus === 'submitting'}
                      className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      {passwordStatus === 'submitting' ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          İşleniyor...
                        </>
                      ) : (
                        <>
                          <FaShieldAlt className="mr-2" /> Şifre Değiştir
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 