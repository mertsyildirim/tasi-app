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
  FaCamera,
  FaEdit,
  FaTimes,
  FaBuilding
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
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
    company: ''
  });
  const [passwordStatus, setPasswordStatus] = useState('idle');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');

    if (!token || !userData) {
      router.push('/admin');
      return;
    }

    // mert@tasiapp.com için özel kontrol
    if (userData.email === 'mert@tasiapp.com') {
      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        company: userData.company || ''
      });
      setLoading(false);
      return;
    }

    // Diğer kullanıcılar için rol kontrolü
    const allowedRoles = ['admin', 'super_admin', 'editor', 'support'];
    const hasAllowedRole = userData.roles?.some(role => allowedRoles.includes(role)) || allowedRoles.includes(userData.role);

    if (!hasAllowedRole) {
      router.push('/admin');
      return;
    }

    setUser(userData);
    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      company: userData.company || ''
    });
    setLoading(false);
  }, [router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Profil güncellenirken bir hata oluştu');
      }

      // Kullanıcı verilerini güncelle
      const updatedUserData = { ...user, ...formData };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));
      setUser(updatedUserData);
      setIsEditing(false);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Profil">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Profil Bilgileri</h1>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <FaEdit />
                <span>Düzenle</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user.name || '',
                      email: user.email || '',
                      phone: user.phone || '',
                      company: user.company || '',
                      oldPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <FaTimes />
                  <span>İptal</span>
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <FaSave />
                  <span>Kaydet</span>
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <FaUser className="inline mr-2" />
                  Ad Soyad
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                ) : (
                  <p className="text-gray-900">{user.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <FaEnvelope className="inline mr-2" />
                  E-posta
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                ) : (
                  <p className="text-gray-900">{user.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <FaPhone className="inline mr-2" />
                  Telefon
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                ) : (
                  <p className="text-gray-900">{user.phone || '-'}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Rol
              </label>
              <p className="text-gray-900">
                {user.roles?.join(', ') || user.role || '-'}
              </p>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
} 