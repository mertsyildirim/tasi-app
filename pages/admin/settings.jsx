'use client'

import React, { useState, useEffect } from 'react'
import { FaSave, FaLock, FaEnvelope, FaBell, FaDesktop, FaDatabase, FaShieldAlt, FaPaintBrush, FaSpinner } from 'react-icons/fa'
import AdminLayout from '../../components/admin/Layout'

export default function SettingsPage() {
  const [selectedTab, setSelectedTab] = useState('general')
  const [maintenanceConfig, setMaintenanceConfig] = useState({
    homeEnabled: false,
    portalEnabled: false
  })
  const [tempMaintenanceConfig, setTempMaintenanceConfig] = useState({
    homeEnabled: false,
    portalEnabled: false
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [roles, setRoles] = useState([])
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedRoles, setSelectedRoles] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(false)

  // E-posta ayarları
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'bildirim@tasiapp.com',
    smtpPassword: '********',
    senderName: 'Taşı App',
    senderEmail: 'bildirim@tasiapp.com',
    useSSL: true
  });
  const [testEmail, setTestEmail] = useState('');

  // Bildirim ayarları ve bildirimlerin kendisi
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    desktopNotifications: true,
    systemEvents: true,
    userEvents: true,
    paymentEvents: true,
    shippingEvents: true
  });
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Manuel bildirim gönderme
  const [manualNotification, setManualNotification] = useState({
    title: '',
    message: '',
    type: 'system',
    url: '',
    recipientType: 'all',
    recipientId: '',
    sendEmail: true
  });
  const [isSending, setIsSending] = useState(false);

  // Bakım modu ayarlarını yükle
  useEffect(() => {
    const loadMaintenanceConfig = async () => {
      try {
        const response = await fetch('/api/settings/maintenance');
        const data = await response.json();
        setMaintenanceConfig(data);
        setTempMaintenanceConfig(data);
      } catch (error) {
        console.error('Bakım modu ayarları yüklenirken hata:', error);
      }
    };

    loadMaintenanceConfig();
  }, []);

  // Kullanıcıları yükle
  useEffect(() => {
    if (selectedTab === 'permissions') {
      loadUsers();
    }
  }, [selectedTab]);

  // Kullanıcıları getir
  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      console.log('Kullanıcılar yükleniyor...');
      
      // Token doğrulama olmadan test-users API'sini çağırıyoruz
      const response = await fetch('/api/test-users');
      const data = await response.json();
      
      console.log('API yanıtı:', data);
      
      if (data.success && data.users) {
        console.log('Kullanıcılar başarıyla alındı:', data.users.length);
        setUsers(data.users);
      } else {
        console.error('API yanıtında başarı bilgisi yok veya kullanıcı verisi bulunmuyor', data);
        setUsers([]); // Boş dizi ata
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenirken hata:', error);
      setUsers([]); // Boş dizi ata
    } finally {
      setLoadingUsers(false);
    }
  };

  // Roller tanımı
  useEffect(() => {
    const loadRoles = async () => {
      try {
        setLoadingRoles(true);
        const response = await fetch('/api/roles');
        const data = await response.json();
        
        if (data.success && data.roles) {
          const formattedRoles = data.roles.map(role => ({
            id: role.id,
            name: role.name,
            description: `${role.permissionCount} yetkiye sahip`
          }));
          setRoles(formattedRoles);
        } else {
          // API'den veri gelmezse varsayılan rolleri kullan
          setRoles([
            { id: 'admin', name: 'Süper Admin', description: 'Tam yetki (tüm işlemler)' },
            { id: 'editor', name: 'İçerik Editörü', description: 'İçerik yönetimi yapabilir' },
            { id: 'support', name: 'Destek Ekibi', description: 'Destek taleplerini yönetebilir' },
            { id: 'customer', name: 'Müşteri', description: 'Standart kullanıcı' },
            { id: 'driver', name: 'Sürücü', description: 'Sürücü kullanıcısı' },
            { id: 'company', name: 'Şirket', description: 'Taşıma şirketi' }
          ]);
        }
      } catch (error) {
        console.error('Roller yüklenirken hata:', error);
        // Hata durumunda varsayılan rolleri kullan
        setRoles([
          { id: 'admin', name: 'Süper Admin', description: 'Tam yetki (tüm işlemler)' },
          { id: 'editor', name: 'İçerik Editörü', description: 'İçerik yönetimi yapabilir' },
          { id: 'support', name: 'Destek Ekibi', description: 'Destek taleplerini yönetebilir' },
          { id: 'customer', name: 'Müşteri', description: 'Standart kullanıcı' },
          { id: 'driver', name: 'Sürücü', description: 'Sürücü kullanıcısı' },
          { id: 'company', name: 'Şirket', description: 'Taşıma şirketi' }
        ]);
      } finally {
        setLoadingRoles(false);
      }
    };
    
    loadRoles();
  }, []);

  // Kullanıcı seçildiğinde mevcut rollerini göster
  const handleUserSelect = (e) => {
    const userId = e.target.value;
    setSelectedUser(userId);
    
    if (userId) {
      const user = users.find(u => u.id === userId);
      if (user) {
        console.log('Seçilen kullanıcı rolleri:', user);
        // API'den dönen role veya roles değerini diziye çevir
        let userRoles = [];
        
        if (user.roles && Array.isArray(user.roles)) {
          userRoles = user.roles;
        } else if (user.role) {
          userRoles = Array.isArray(user.role) ? user.role : [user.role];
        } else {
          userRoles = ['customer']; // Varsayılan rol
        }
        
        console.log('Ayarlanan roller:', userRoles);
        setSelectedRoles(userRoles);
      } else {
        setSelectedRoles([]);
      }
    } else {
      setSelectedRoles([]);
    }
  };

  // Rol seçimi değiştiğinde güncelle
  const handleRoleChange = (roleId) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(r => r !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  // Kullanıcı rollerini güncelle
  const updateUserRoles = async () => {
    if (!selectedUser || selectedRoles.length === 0) {
      setSaveMessage('Lütfen bir kullanıcı ve en az bir rol seçin');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }
    
    try {
      setIsSaving(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.error('Token bulunamadı');
        setSaveMessage('Yetkilendirme hatası: Token bulunamadı');
        setTimeout(() => setSaveMessage(''), 3000);
        return;
      }
      
      const response = await fetch('/api/admin/update-user-role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: selectedUser,
          roles: selectedRoles
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSaveMessage('Kullanıcı rolleri başarıyla güncellendi');
        
        // Kullanıcı listesini güncelle
        await loadUsers();
      } else {
        setSaveMessage(`Hata: ${data.error || 'Bilinmeyen bir hata oluştu'}`);
      }
    } catch (error) {
      console.error('Roller güncellenirken hata:', error);
      setSaveMessage('Roller güncellenirken bir hata oluştu');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  // Bakım modu ayarlarını geçici olarak değiştir
  const handleMaintenanceChange = (type) => {
    setTempMaintenanceConfig(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Tüm ayarları kaydet
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/settings/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tempMaintenanceConfig),
      });

      if (response.ok) {
        setMaintenanceConfig(tempMaintenanceConfig);
        setSaveMessage('Ayarlar başarıyla kaydedildi');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('Ayarlar kaydedilirken bir hata oluştu');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (error) {
      console.error('Bakım modu ayarları kaydedilirken hata:', error);
      setSaveMessage('Ayarlar kaydedilirken bir hata oluştu');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // E-posta ayarlarını yükle
  useEffect(() => {
    if (selectedTab === 'email') {
      loadEmailSettings();
    }
  }, [selectedTab]);

  // E-posta ayarlarını getir
  const loadEmailSettings = async () => {
    try {
      console.log('E-posta ayarları yükleniyor...');
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.error('Token bulunamadı');
        return;
      }
      
      const response = await fetch('/api/admin/email-settings', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('E-posta ayarları getirilemedi');
      }
      
      const data = await response.json();
      console.log('E-posta ayarları:', data);
      
      if (data && data.data) {
        setEmailSettings(data.data);
      }
    } catch (error) {
      console.error('E-posta ayarları yüklenirken hata:', error);
      // Hata olsa da varsayılan ayarlar kullanılacak
    }
  };

  // E-posta ayarlarını değiştir
  const handleEmailSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEmailSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // E-posta ayarlarını kaydet
  const handleSaveEmailSettings = async () => {
    try {
      setIsSaving(true);
      setSaveMessage('');
      console.log('E-posta ayarları kaydediliyor...', emailSettings);
      
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.error('Token bulunamadı');
        setSaveMessage('Yetkilendirme hatası: Token bulunamadı');
        return;
      }
      
      const response = await fetch('/api/admin/email-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(emailSettings)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSaveMessage('E-posta ayarları başarıyla kaydedildi');
      } else {
        setSaveMessage(`Hata: ${data.message || 'E-posta ayarları kaydedilemedi'}`);
      }
    } catch (error) {
      console.error('E-posta ayarları kaydedilirken hata:', error);
      setSaveMessage('E-posta ayarları kaydedilirken bir hata oluştu');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 5000);
    }
  };

  // Test e-postası gönder
  const handleSendTestEmail = async () => {
    if (!testEmail) {
      setSaveMessage('Lütfen test için bir e-posta adresi girin');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }
    
    try {
      setIsSaving(true);
      setSaveMessage('');
      console.log('Test e-postası gönderiliyor:', testEmail);
      
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.error('Token bulunamadı');
        setSaveMessage('Yetkilendirme hatası: Token bulunamadı');
        return;
      }
      
      const response = await fetch('/api/admin/email-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'test',
          testEmail: testEmail
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSaveMessage(`Test e-postası başarıyla gönderildi: ${testEmail}`);
      } else {
        setSaveMessage(`Hata: ${data.message || 'Test e-postası gönderilemedi'}`);
      }
    } catch (error) {
      console.error('Test e-postası gönderilirken hata:', error);
      setSaveMessage('Test e-postası gönderilirken bir hata oluştu');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 5000);
    }
  };

  // Bildirimleri yükle
  useEffect(() => {
    if (selectedTab === 'notifications') {
      loadNotifications();
    }
  }, [selectedTab]);
  
  // Bildirimleri getir
  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      console.log('Bildirimler yükleniyor...');
      
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.error('Token bulunamadı');
        setNotifications([]);
        return;
      }
      
      const response = await fetch('/api/admin/notifications?limit=50', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Bildirimler getirilemedi: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('API yanıtı:', data);
      
      // API yanıtının yapısını kontrol et ve bildirimleri al
      if (data.success && data.data && Array.isArray(data.data.notifications)) {
        setNotifications(data.data.notifications);
      } else if (data.success && Array.isArray(data.data)) {
        // Alternatif yanıt formatı
        setNotifications(data.data);
      } else if (data.success && data.notifications && Array.isArray(data.notifications)) {
        // Farklı bir alternatif yanıt formatı
        setNotifications(data.notifications);
      } else {
        console.error('Bilinmeyen API yanıt formatı:', data);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Bildirimler yüklenirken hata:', error);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };
  
  // Bildirimleri okundu olarak işaretle
  const markAsRead = async (ids) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.error('Token bulunamadı');
        return;
      }
      
      const response = await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ids })
      });
      
      if (!response.ok) {
        throw new Error('Bildirimler işaretlenemedi');
      }
      
      // Bildirimleri yeniden yükle
      loadNotifications();
      setSaveMessage('Bildirimler okundu olarak işaretlendi');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Bildirimler işaretlenirken hata:', error);
      setSaveMessage('Bildirimler işaretlenirken bir hata oluştu');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Bildirimleri sil
  const deleteNotifications = async (ids) => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.error('Token bulunamadı');
        return;
      }
      
      const response = await fetch('/api/admin/notifications', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ids })
      });
      
      if (!response.ok) {
        throw new Error('Bildirimler silinemedi');
      }
      
      // Bildirimleri yeniden yükle
      loadNotifications();
      setSaveMessage('Bildirimler silindi');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Bildirimler silinirken hata:', error);
      setSaveMessage('Bildirimler silinirken bir hata oluştu');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Bildirim ayarlarını kaydet
  const handleSaveNotificationSettings = async () => {
    try {
      setIsSaving(true);
      setSaveMessage('');
      console.log('Bildirim ayarları kaydediliyor...', notificationSettings);
      
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.error('Token bulunamadı');
        setSaveMessage('Yetkilendirme hatası: Token bulunamadı');
        return;
      }
      
      const response = await fetch('/api/admin/notification-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(notificationSettings)
      });
      
      if (!response.ok) {
        throw new Error('Bildirim ayarları kaydedilemedi');
      }
      
      setSaveMessage('Bildirim ayarları başarıyla kaydedildi');
    } catch (error) {
      console.error('Bildirim ayarları kaydedilirken hata:', error);
      setSaveMessage('Bildirim ayarları kaydedilirken bir hata oluştu');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 5000);
    }
  };
  
  // Bildirim ayarı değişikliği
  const handleNotificationSettingChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Manuel bildirim gönderme
  const handleSendManualNotification = async () => {
    // Boş mesaj ve başlık kontrolü
    if (!manualNotification.title && !manualNotification.message) {
      setSaveMessage('Lütfen en az bir bildirim başlığı veya mesajı girin');
      setTimeout(() => setSaveMessage(''), 5000);
      return;
    }
    
    // Belirli bir kullanıcı seçildiğinde kontrol
    if (manualNotification.recipientType === 'user' && !manualNotification.recipientId) {
      setSaveMessage('Lütfen bir kullanıcı seçin veya farklı bir alıcı türü belirleyin');
      setTimeout(() => setSaveMessage(''), 5000);
      return;
    }
    
    try {
      setIsSending(true);
      setSaveMessage('');
      console.log('Manuel bildirim gönderiliyor...', manualNotification);
      
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.error('Token bulunamadı');
        setSaveMessage('Yetkilendirme hatası: Token bulunamadı');
        return;
      }
      
      const requestData = {
        title: manualNotification.title,
        message: manualNotification.message,
        type: manualNotification.type,
        url: manualNotification.url,
        recipientType: manualNotification.recipientType,
        recipientId: manualNotification.recipientId,
        sendEmail: manualNotification.sendEmail
      };
      
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSaveMessage(`Bildirim başarıyla gönderildi! ${data.recipientCount} kullanıcıya ${data.insertedCount} bildirim oluşturuldu.`);
        setManualNotification({
          title: '',
          message: '',
          type: 'system',
          url: '',
          recipientType: 'all',
          recipientId: '',
          sendEmail: true
        });
        
        // Bildirimleri yeniden yükle
        loadNotifications();
      } else {
        setSaveMessage(`Hata: ${data.message || 'Manuel bildirim gönderilemedi'}`);
      }
    } catch (error) {
      console.error('Manuel bildirim gönderilirken hata:', error);
      setSaveMessage('Manuel bildirim gönderilirken bir hata oluştu');
    } finally {
      setIsSending(false);
      setTimeout(() => setSaveMessage(''), 5000);
    }
  };

  // Bildirim tipi için CSS sınıfı
  const getNotificationTypeClass = (type) => {
    switch (type) {
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'payment':
        return 'bg-green-100 text-green-800';
      case 'shipping':
      case 'carrier':
        return 'bg-orange-100 text-orange-800';
      case 'message':
        return 'bg-indigo-100 text-indigo-800';
      case 'alert':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Bildirim tipi için okunabilir ad
  const getNotificationTypeName = (type) => {
    switch (type) {
      case 'user':
        return 'Kullanıcı';
      case 'payment':
        return 'Ödeme';
      case 'shipping':
        return 'Taşıma';
      case 'carrier':
        return 'Taşıyıcı';
      case 'message':
        return 'Mesaj';
      case 'alert':
        return 'Uyarı';
      case 'error':
        return 'Hata';
      case 'success':
        return 'Başarılı';
      case 'info':
        return 'Bilgi';
      case 'system':
        return 'Sistem';
      default:
        return type || 'Bilinmiyor';
    }
  };
  
  // Tarih formatla
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString || '-';
    }
  };

  return (
    <AdminLayout title="Sistem Ayarları" fixedHeader={true}>
      {/* Ayarlar Bölümü */}
      <div className="flex flex-col-reverse md:flex-row bg-white rounded-lg shadow">
        {/* İçerik Alanı */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          {selectedTab === 'general' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Genel Ayarlar</h2>
              
              <div className="mb-6">
                <label htmlFor="site-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Site Adı
                </label>
                <input
                  type="text"
                  id="site-name"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Taşı App"
                  defaultValue="Taşı App"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">
                  İletişim E-postası
                </label>
                <input
                  type="email"
                  id="contact-email"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="iletisim@tasiapp.com"
                  defaultValue="iletisim@tasiapp.com"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon Numarası
                </label>
                <input
                  type="text"
                  id="phone"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="+90 212 123 4567"
                  defaultValue="+90 212 123 4567"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Şirket Adresi
                </label>
                <textarea
                  id="address"
                  rows="3"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="İstanbul, Türkiye"
                  defaultValue="Ataşehir, İstanbul, Türkiye"
                ></textarea>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Çalışma Saatleri
                </label>
                <div className="flex flex-col md:flex-row md:space-x-4">
                  <input
                    type="text"
                    className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-2 md:mb-0"
                    placeholder="Başlangıç Saati"
                    defaultValue="09:00"
                  />
                  <input
                    type="text"
                    className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Bitiş Saati"
                    defaultValue="18:00"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bakım Modu
                </label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="maintenance-mode-home"
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      checked={tempMaintenanceConfig.homeEnabled}
                      onChange={() => handleMaintenanceChange('homeEnabled')}
                      disabled={isSaving}
                    />
                    <label htmlFor="maintenance-mode-home" className="ml-2 block text-sm text-gray-900">
                      Anasayfa bakım modunu etkinleştir (tasiapp.com)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="maintenance-mode-portal"
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      checked={tempMaintenanceConfig.portalEnabled}
                      onChange={() => handleMaintenanceChange('portalEnabled')}
                      disabled={isSaving}
                    />
                    <label htmlFor="maintenance-mode-portal" className="ml-2 block text-sm text-gray-900">
                      Portal bakım modunu etkinleştir (/portal/* sayfaları)
                    </label>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Not: Admin paneli hiçbir zaman bakım moduna girmez. Anasayfa bakım modu yalnızca ana sayfayı, portal bakım modu ise yalnızca /portal altındaki sayfaları etkiler.
                  </p>
                  {saveMessage && (
                    <p className={`mt-2 text-sm ${saveMessage.includes('hata') ? 'text-red-600' : 'text-green-600'}`}>
                      {saveMessage}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="mt-8">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                >
                  <FaSave className="mr-2" />
                  {isSaving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                </button>
              </div>
            </div>
          )}

          {selectedTab === 'security' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Güvenlik ve Giriş Ayarları</h2>
              
              <div className="mb-6">
                <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  id="current-password"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="••••••••"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  id="new-password"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="••••••••"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Şifreyi Tekrarla
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="••••••••"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  İki Faktörlü Doğrulama
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="two-factor"
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="two-factor" className="ml-2 block text-sm text-gray-900">
                    İki faktörlü doğrulamayı etkinleştir
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Hesabınızı korumak için giriş yaparken ek bir doğrulama kodu gerekir.
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Oturum Açma Girişimleri
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="3"
                    max="10"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    defaultValue="5"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    başarısız girişten sonra hesabı kilitle
                  </label>
                </div>
              </div>
              
              <div className="mt-8">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  <FaSave className="mr-2" />
                  Güvenlik Ayarlarını Kaydet
                </button>
              </div>
            </div>
          )}

          {selectedTab === 'email' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">E-posta Ayarları</h2>
              
              {saveMessage && (
                <div className={`mb-4 p-3 rounded-lg ${saveMessage.includes('başarı') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {saveMessage}
                </div>
              )}
              
              <div className="mb-6">
                <label htmlFor="smtp-host" className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Sunucu
                </label>
                <input
                  type="text"
                  id="smtp-host"
                  name="smtpHost"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="smtp.example.com"
                  value={emailSettings.smtpHost}
                  onChange={handleEmailSettingChange}
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="smtp-port" className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Port
                </label>
                <input
                  type="text"
                  id="smtp-port"
                  name="smtpPort"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="587"
                  value={emailSettings.smtpPort}
                  onChange={handleEmailSettingChange}
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="smtp-user" className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Kullanıcı Adı
                </label>
                <input
                  type="text"
                  id="smtp-user"
                  name="smtpUser"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="email@example.com"
                  value={emailSettings.smtpUser}
                  onChange={handleEmailSettingChange}
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="smtp-pass" className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Şifre
                </label>
                <input
                  type="password"
                  id="smtp-pass"
                  name="smtpPassword"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="••••••••"
                  value={emailSettings.smtpPassword}
                  onChange={handleEmailSettingChange}
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="sender-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Gönderen Adı
                </label>
                <input
                  type="text"
                  id="sender-name"
                  name="senderName"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Şirket Adı"
                  value={emailSettings.senderName}
                  onChange={handleEmailSettingChange}
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="sender-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Gönderen E-posta
                </label>
                <input
                  type="email"
                  id="sender-email"
                  name="senderEmail"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="bildirim@sirketiniz.com"
                  value={emailSettings.senderEmail}
                  onChange={handleEmailSettingChange}
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta Şifreleme
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="use-ssl"
                    name="useSSL"
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    checked={emailSettings.useSSL}
                    onChange={handleEmailSettingChange}
                  />
                  <label htmlFor="use-ssl" className="ml-2 block text-sm text-gray-900">
                    SSL kullan
                  </label>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="test-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Test E-postası İçin Alıcı
                </label>
                <div className="flex">
                  <input
                    type="email"
                    id="test-email"
                    className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                <button
                  type="button"
                    onClick={handleSendTestEmail}
                    className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSaving}
                >
                    {isSaving ? 'Gönderiliyor...' : 'Test E-postası Gönder'}
                </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Test e-postası göndermeden önce ayarları kaydetmeniz önerilir.
                </p>
              </div>
              
              <div className="mt-8">
                <button
                  type="button"
                  onClick={handleSaveEmailSettings}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  disabled={isSaving}
                >
                  <FaSave className="mr-2" />
                  {isSaving ? 'Kaydediliyor...' : 'E-posta Ayarlarını Kaydet'}
                </button>
              </div>
            </div>
          )}

          {selectedTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Bildirim Ayarları</h2>
              
              {saveMessage && (
                <div className={`mb-4 p-3 rounded-lg ${saveMessage.includes('başarı') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {saveMessage}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Bildirim Kanalları</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="emailNotifications"
                        name="emailNotifications"
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        checked={notificationSettings.emailNotifications}
                        onChange={handleNotificationSettingChange}
                      />
                      <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                        E-posta bildirimleri
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="smsNotifications"
                        name="smsNotifications"
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        checked={notificationSettings.smsNotifications}
                        onChange={handleNotificationSettingChange}
                      />
                      <label htmlFor="smsNotifications" className="ml-2 block text-sm text-gray-900">
                        SMS bildirimleri
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="desktopNotifications"
                        name="desktopNotifications"
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        checked={notificationSettings.desktopNotifications}
                        onChange={handleNotificationSettingChange}
                      />
                      <label htmlFor="desktopNotifications" className="ml-2 block text-sm text-gray-900">
                        Masaüstü bildirimleri
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Bildirim Olayları</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="systemEvents"
                        name="systemEvents"
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        checked={notificationSettings.systemEvents}
                        onChange={handleNotificationSettingChange}
                      />
                      <label htmlFor="systemEvents" className="ml-2 block text-sm text-gray-900">
                        Sistem olayları
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="userEvents"
                        name="userEvents"
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        checked={notificationSettings.userEvents}
                        onChange={handleNotificationSettingChange}
                      />
                      <label htmlFor="userEvents" className="ml-2 block text-sm text-gray-900">
                        Kullanıcı olayları
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="paymentEvents"
                        name="paymentEvents"
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        checked={notificationSettings.paymentEvents}
                        onChange={handleNotificationSettingChange}
                      />
                      <label htmlFor="paymentEvents" className="ml-2 block text-sm text-gray-900">
                        Ödeme olayları
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="shippingEvents"
                        name="shippingEvents"
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        checked={notificationSettings.shippingEvents}
                        onChange={handleNotificationSettingChange}
                      />
                      <label htmlFor="shippingEvents" className="ml-2 block text-sm text-gray-900">
                        Taşıma olayları
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 mb-8">
                <button
                  type="button"
                  onClick={handleSaveNotificationSettings}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  disabled={isSaving}
                >
                  <FaSave className="mr-2" />
                  {isSaving ? 'Kaydediliyor...' : 'Bildirim Ayarlarını Kaydet'}
                </button>
              </div>
              
              {/* Manuel Bildirim Gönderme Bölümü */}
              <div className="mt-8 mb-8 p-5 border rounded-lg bg-white">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Manuel Bildirim Gönder</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Belirli bir kullanıcıya veya tüm kullanıcılara manuel olarak bildirim gönderebilirsiniz.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="notification-title" className="block text-sm font-medium text-gray-700 mb-1">
                      Bildirim Başlığı
                    </label>
                    <input
                      type="text"
                      id="notification-title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Bildirim başlığını girin"
                      value={manualNotification.title}
                      onChange={(e) => setManualNotification({...manualNotification, title: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="notification-message" className="block text-sm font-medium text-gray-700 mb-1">
                      Bildirim Mesajı
                    </label>
                    <textarea
                      id="notification-message"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Bildirim içeriğini girin"
                      value={manualNotification.message}
                      onChange={(e) => setManualNotification({...manualNotification, message: e.target.value})}
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="notification-type" className="block text-sm font-medium text-gray-700 mb-1">
                      Bildirim Türü
                    </label>
                    <select
                      id="notification-type"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={manualNotification.type}
                      onChange={(e) => setManualNotification({...manualNotification, type: e.target.value})}
                    >
                      <option value="system">Sistem Bildirimi</option>
                      <option value="user">Kullanıcı Bildirimi</option>
                      <option value="payment">Ödeme Bildirimi</option>
                      <option value="shipping">Taşıma Bildirimi</option>
                      <option value="alert">Uyarı</option>
                      <option value="info">Bilgi</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="notification-url" className="block text-sm font-medium text-gray-700 mb-1">
                      Yönlendirme URL (İsteğe Bağlı)
                    </label>
                    <input
                      type="text"
                      id="notification-url"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Örn: /admin/users"
                      value={manualNotification.url}
                      onChange={(e) => setManualNotification({...manualNotification, url: e.target.value})}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Bildirimlere tıklandığında yönlendirilecek sayfa adresi
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="notification-recipient" className="block text-sm font-medium text-gray-700 mb-1">
                      Alıcı
                    </label>
                    <select
                      id="notification-recipient"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={manualNotification.recipientType}
                      onChange={(e) => setManualNotification({...manualNotification, recipientType: e.target.value})}
                    >
                      <option value="all">Tüm Kullanıcılar</option>
                      <option value="admins">Tüm Yöneticiler</option>
                      <option value="customers">Tüm Müşteriler</option>
                      <option value="carriers">Tüm Taşıyıcılar</option>
                      <option value="drivers">Tüm Sürücüler</option>
                      <option value="user">Belirli Bir Kullanıcı</option>
                    </select>
                  </div>
                  
                  {manualNotification.recipientType === 'user' && (
                    <div>
                      <label htmlFor="notification-user" className="block text-sm font-medium text-gray-700 mb-1">
                        Kullanıcı Seç
                      </label>
                      <select
                        id="notification-user"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        value={manualNotification.recipientId}
                        onChange={(e) => setManualNotification({...manualNotification, recipientId: e.target.value})}
                      >
                        <option value="">Bir kullanıcı seçin</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notification-email"
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      checked={manualNotification.sendEmail}
                      onChange={(e) => setManualNotification({...manualNotification, sendEmail: e.target.checked})}
                    />
                    <label htmlFor="notification-email" className="ml-2 block text-sm text-gray-900">
                      Aynı zamanda e-posta olarak da gönder
                    </label>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={handleSendManualNotification}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      disabled={isSending}
                    >
                      {isSending ? <FaSpinner className="animate-spin mr-2" /> : <FaBell className="mr-2" />}
                      {isSending ? 'Gönderiliyor...' : 'Bildirimi Gönder'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Son Bildirimler</h3>
                
                {loadingNotifications ? (
                  <div className="text-center py-4">
                    <FaSpinner className="animate-spin inline-block h-6 w-6 text-orange-500" />
                    <p className="mt-2 text-gray-500">Bildirimler yükleniyor...</p>
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bildirim
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tarih
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tür
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Durum
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            İşlemler
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {notifications.map((notification) => (
                          <tr key={notification.id} className={notification.read ? 'bg-gray-50' : 'bg-white'}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{notification.text}</div>
                              {notification.description && (
                                <div className="text-sm text-gray-500">{notification.description}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {formatDate(notification.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getNotificationTypeClass(notification.type)}`}>
                                {getNotificationTypeName(notification.type)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${notification.read ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                                {notification.read ? 'Okundu' : 'Okunmadı'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {!notification.read && (
                                <button 
                                  onClick={() => markAsRead([notification.id])} 
                                  className="text-blue-600 hover:text-blue-900 mr-3"
                                >
                                  Okundu
                                </button>
                              )}
                              <button 
                                onClick={() => deleteNotifications([notification.id])} 
                                className="text-red-600 hover:text-red-900"
                              >
                                Sil
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 border rounded-lg">
                    <p className="text-gray-500">Henüz bildirim bulunmuyor</p>
                  </div>
                )}
                
                {notifications.length > 0 && (
                  <div className="flex justify-end mt-4 space-x-3">
                    <button
                      onClick={() => markAsRead(notifications.filter(n => !n.read).map(n => n.id))}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      disabled={!notifications.some(n => !n.read) || isSaving}
                    >
                      Tümünü Okundu İşaretle
                    </button>
                    <button
                      onClick={() => deleteNotifications(notifications.map(n => n.id))}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      disabled={isSaving}
                    >
                      Tümünü Sil
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedTab === 'permissions' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Kullanıcı İzinleri</h2>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p className="text-blue-700">Bu bölümden admin kullanıcılarının sistem içindeki yetkilerini detaylı olarak düzenleyebilirsiniz.</p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Kullanıcı Seçin
                </label>
                <select
                  id="user-select"
                  className="w-full md:w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={selectedUser}
                  onChange={handleUserSelect}
                >
                  <option value="">Kullanıcı Seçin</option>
                  {users
                    .filter(user => 
                      user.roles && (user.roles.includes('admin') || 
                      user.roles.includes('editor') || 
                      user.roles.includes('support'))
                    )
                    .map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))
                  }
                </select>
                
                {loadingUsers && (
                  <div className="mt-2 text-sm text-gray-500">
                    <span className="inline-block animate-spin mr-1">⟳</span> Kullanıcılar yükleniyor...
                  </div>
                )}
              </div>
              
              {selectedUser && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Roller ve İzinler</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Kullanıcıya verilecek rolleri ve izinleri seçin. Her rol, belirli modüller üzerinde farklı işlemlere izin verir.
                  </p>
                  
                  <div className="space-y-8 mt-6">
                    {/* Taşıyıcı Modülü İzinleri */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200">
                      <h4 className="text-md font-semibold text-gray-800 mb-4">Taşıyıcı İzinleri</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center">
                          <input
                            id="carrier-view"
                            type="checkbox"
                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            checked={selectedRoles.includes('carrier-view')}
                            onChange={() => handleRoleChange('carrier-view')}
                          />
                          <label htmlFor="carrier-view" className="ml-2 text-sm text-gray-700">Görüntüleme</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="carrier-add"
                            type="checkbox"
                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            checked={selectedRoles.includes('carrier-add')}
                            onChange={() => handleRoleChange('carrier-add')}
                          />
                          <label htmlFor="carrier-add" className="ml-2 text-sm text-gray-700">Ekleme</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="carrier-edit"
                            type="checkbox"
                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            checked={selectedRoles.includes('carrier-edit')}
                            onChange={() => handleRoleChange('carrier-edit')}
                          />
                          <label htmlFor="carrier-edit" className="ml-2 text-sm text-gray-700">Düzenleme</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="carrier-delete"
                            type="checkbox"
                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            checked={selectedRoles.includes('carrier-delete')}
                            onChange={() => handleRoleChange('carrier-delete')}
                          />
                          <label htmlFor="carrier-delete" className="ml-2 text-sm text-gray-700">Silme</label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Sürücü Modülü İzinleri */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200">
                      <h4 className="text-md font-semibold text-gray-800 mb-4">Sürücü İzinleri</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center">
                          <input
                            id="driver-view"
                            type="checkbox"
                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            checked={selectedRoles.includes('driver-view')}
                            onChange={() => handleRoleChange('driver-view')}
                          />
                          <label htmlFor="driver-view" className="ml-2 text-sm text-gray-700">Görüntüleme</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="driver-add"
                            type="checkbox"
                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            checked={selectedRoles.includes('driver-add')}
                            onChange={() => handleRoleChange('driver-add')}
                          />
                          <label htmlFor="driver-add" className="ml-2 text-sm text-gray-700">Ekleme</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="driver-edit"
                            type="checkbox"
                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            checked={selectedRoles.includes('driver-edit')}
                            onChange={() => handleRoleChange('driver-edit')}
                          />
                          <label htmlFor="driver-edit" className="ml-2 text-sm text-gray-700">Düzenleme</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="driver-delete"
                            type="checkbox"
                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            checked={selectedRoles.includes('driver-delete')}
                            onChange={() => handleRoleChange('driver-delete')}
                          />
                          <label htmlFor="driver-delete" className="ml-2 text-sm text-gray-700">Silme</label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Müşteri Modülü İzinleri */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200">
                      <h4 className="text-md font-semibold text-gray-800 mb-4">Müşteri İzinleri</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center">
                          <input
                            id="customer-view"
                            type="checkbox"
                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            checked={selectedRoles.includes('customer-view')}
                            onChange={() => handleRoleChange('customer-view')}
                          />
                          <label htmlFor="customer-view" className="ml-2 text-sm text-gray-700">Görüntüleme</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="customer-add"
                            type="checkbox"
                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            checked={selectedRoles.includes('customer-add')}
                            onChange={() => handleRoleChange('customer-add')}
                          />
                          <label htmlFor="customer-add" className="ml-2 text-sm text-gray-700">Ekleme</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="customer-edit"
                            type="checkbox"
                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            checked={selectedRoles.includes('customer-edit')}
                            onChange={() => handleRoleChange('customer-edit')}
                          />
                          <label htmlFor="customer-edit" className="ml-2 text-sm text-gray-700">Düzenleme</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="customer-delete"
                            type="checkbox"
                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            checked={selectedRoles.includes('customer-delete')}
                            onChange={() => handleRoleChange('customer-delete')}
                          />
                          <label htmlFor="customer-delete" className="ml-2 text-sm text-gray-700">Silme</label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Sipariş/Taşıma Modülü İzinleri */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200">
                      <h4 className="text-md font-semibold text-gray-800 mb-4">Taşıma/Sipariş İzinleri</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center">
                          <input
                            id="order-view"
                            type="checkbox"
                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            checked={selectedRoles.includes('order-view')}
                            onChange={() => handleRoleChange('order-view')}
                          />
                          <label htmlFor="order-view" className="ml-2 text-sm text-gray-700">Görüntüleme</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="order-add"
                            type="checkbox"
                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            checked={selectedRoles.includes('order-add')}
                            onChange={() => handleRoleChange('order-add')}
                          />
                          <label htmlFor="order-add" className="ml-2 text-sm text-gray-700">Ekleme</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="order-edit"
                            type="checkbox"
                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            checked={selectedRoles.includes('order-edit')}
                            onChange={() => handleRoleChange('order-edit')}
                          />
                          <label htmlFor="order-edit" className="ml-2 text-sm text-gray-700">Düzenleme</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="order-delete"
                            type="checkbox"
                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            checked={selectedRoles.includes('order-delete')}
                            onChange={() => handleRoleChange('order-delete')}
                          />
                          <label htmlFor="order-delete" className="ml-2 text-sm text-gray-700">Silme</label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Sistem/Ayarlar Modülü İzinleri */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200">
                      <h4 className="text-md font-semibold text-gray-800 mb-4">Sistem/Ayarlar İzinleri</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center">
                          <input
                            id="settings-view"
                            type="checkbox"
                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            checked={selectedRoles.includes('settings-view')}
                            onChange={() => handleRoleChange('settings-view')}
                          />
                          <label htmlFor="settings-view" className="ml-2 text-sm text-gray-700">Görüntüleme</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="settings-edit"
                            type="checkbox"
                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            checked={selectedRoles.includes('settings-edit')}
                            onChange={() => handleRoleChange('settings-edit')}
                          />
                          <label htmlFor="settings-edit" className="ml-2 text-sm text-gray-700">Düzenleme</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="user-management"
                            type="checkbox"
                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            checked={selectedRoles.includes('user-management')}
                            onChange={() => handleRoleChange('user-management')}
                          />
                          <label htmlFor="user-management" className="ml-2 text-sm text-gray-700">Kullanıcı Yönetimi</label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="permission-management"
                            type="checkbox"
                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            checked={selectedRoles.includes('permission-management')}
                            onChange={() => handleRoleChange('permission-management')}
                          />
                          <label htmlFor="permission-management" className="ml-2 text-sm text-gray-700">İzin Yönetimi</label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Ana Roller */}
                    <div className="bg-white p-5 rounded-lg border border-gray-200">
                      <h4 className="text-md font-semibold text-gray-800 mb-4">Ana Rol Seçimi</h4>
                      <p className="text-sm text-gray-600 mb-4">Ana roller, birden fazla izni otomatik olarak tanımlar. Özel izinler seçildiğinde, ana rol seçilmese bile bu izinler kullanıcıda kalır.</p>
                      
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="role-admin"
                              type="checkbox"
                              checked={selectedRoles.includes('admin')}
                              onChange={() => handleRoleChange('admin')}
                              className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="role-admin" className="font-medium text-gray-700">Süper Admin</label>
                            <p className="text-gray-500">Tüm izinlere erişim sağlar</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="role-editor"
                              type="checkbox"
                              checked={selectedRoles.includes('editor')}
                              onChange={() => handleRoleChange('editor')}
                              className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="role-editor" className="font-medium text-gray-700">İçerik Editörü</label>
                            <p className="text-gray-500">İçerik ekleme ve düzenleme, müşteri ve sipariş görüntüleme</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="role-support"
                              type="checkbox"
                              checked={selectedRoles.includes('support')}
                              onChange={() => handleRoleChange('support')}
                              className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="role-support" className="font-medium text-gray-700">Destek Ekibi</label>
                            <p className="text-gray-500">Müşteri ve sipariş görüntüleme, destek taleplerini yanıtlama</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seçilen İzinlerin Özeti */}
                  <div className="mt-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-700 mb-2">Seçilen İzinler Özeti</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Toplam {selectedRoles.length} izin seçildi.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedRoles.map(role => (
                        <span key={role} className="bg-orange-100 text-orange-800 text-xs font-medium py-1 px-2 rounded-full">
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {saveMessage && (
                <div className={`mt-4 ${saveMessage.includes('Hata') ? 'text-red-600' : 'text-green-600'}`}>
                  {saveMessage}
                </div>
              )}
              
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  onClick={updateUserRoles}
                  disabled={isSaving || !selectedUser || selectedRoles.length === 0}
                >
                  <FaSave className="mr-2" />
                  {isSaving ? 'Kaydediliyor...' : 'Kullanıcı İzinlerini Kaydet'}
                </button>
              </div>
              
              {/* Yönerge Kutusu */}
              <div className="mt-10 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <h3 className="text-lg font-medium text-yellow-800 mb-2">İzin Modülü Kullanımı</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                  <li>Sadece admin panele erişimi olan kullanıcılar bu sayfada listelenir.</li>
                  <li>İzinler hem tek tek seçilebilir, hem de ana roller üzerinden toplu olarak verilebilir.</li>
                  <li>Her modül için Görüntüleme, Ekleme, Düzenleme ve Silme izinleri ayrı ayrı verilebilir.</li>
                  <li>Düzenleme izni olmadan Ekleme ve Silme izinleri tek başına çalışabilir.</li>
                  <li>Bir kullanıcının izinlerini değiştirmek için önce kullanıcıyı seçin, sonra izinleri düzenleyin.</li>
                </ul>
              </div>
            </div>
          )}

          {(selectedTab !== 'general' && selectedTab !== 'security' && selectedTab !== 'email' && selectedTab !== 'notifications' && selectedTab !== 'permissions') && (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {selectedTab === 'database' && 'Veritabanı Ayarları'}
                  {selectedTab === 'api' && 'API Erişim Ayarları'}
                  {selectedTab === 'appearance' && 'Görünüm Ayarları'}
                </h2>
                <p className="text-gray-600">
                  Bu bölüm geliştirme aşamasındadır. Çok yakında kullanıma sunulacaktır.
                </p>
              </div>
              <div className="mt-6">
                <img 
                  src="/assets/images/under-construction.svg" 
                  alt="Geliştirme Aşamasında" 
                  className="w-48 h-48 opacity-50"
                />
              </div>
            </div>
          )}
        </div>

        {/* Sağ Menü */}
        <div className="w-full md:w-64 border-l border-gray-200 flex-shrink-0">
          <nav className="sticky top-0 flex flex-col p-4">
            <button
              onClick={() => setSelectedTab('general')}
              className={`flex items-center p-3 rounded-md mb-2 transition-colors w-full ${
                selectedTab === 'general' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FaDesktop className="mr-3" />
              <span>Genel Ayarlar</span>
            </button>
            <button
              onClick={() => setSelectedTab('security')}
              className={`flex items-center p-3 rounded-md mb-2 transition-colors w-full ${
                selectedTab === 'security' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FaLock className="mr-3" />
              <span>Güvenlik</span>
            </button>
            <button
              onClick={() => setSelectedTab('email')}
              className={`flex items-center p-3 rounded-md mb-2 transition-colors w-full ${
                selectedTab === 'email' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FaEnvelope className="mr-3" />
              <span>E-posta Ayarları</span>
            </button>
            <button
              onClick={() => setSelectedTab('notifications')}
              className={`flex items-center p-3 rounded-md mb-2 transition-colors w-full ${
                selectedTab === 'notifications' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FaBell className="mr-3" />
              <span>Bildirim Ayarları</span>
            </button>
            <button
              onClick={() => setSelectedTab('database')}
              className={`flex items-center p-3 rounded-md mb-2 transition-colors w-full ${
                selectedTab === 'database' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FaDatabase className="mr-3" />
              <span>Veritabanı Ayarları</span>
            </button>
            <button
              onClick={() => setSelectedTab('api')}
              className={`flex items-center p-3 rounded-md mb-2 transition-colors w-full ${
                selectedTab === 'api' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FaShieldAlt className="mr-3" />
              <span>API Erişim Ayarları</span>
            </button>
            <button
              onClick={() => setSelectedTab('appearance')}
              className={`flex items-center p-3 rounded-md mb-2 transition-colors w-full ${
                selectedTab === 'appearance' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FaPaintBrush className="mr-3" />
              <span>Görünüm Ayarları</span>
            </button>
            <button
              onClick={() => setSelectedTab('permissions')}
              className={`flex items-center p-3 rounded-md mb-2 transition-colors w-full ${
                selectedTab === 'permissions' 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <FaShieldAlt className="mr-3" />
              <span>Kullanıcı İzinleri</span>
            </button>
          </nav>
        </div>
      </div>
    </AdminLayout>
  )
} 