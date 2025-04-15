import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaUser,
  FaUserTie,
  FaUserShield,
  FaTimes
} from 'react-icons/fa';
import AdminLayout from '../../components/admin/Layout';
import { toast } from 'react-toastify';

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState({
    id: '',
    name: '',
    email: '',
    role: '',
    status: 'active'
  });
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    admin: 0
  });
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    roles: ['editor'],
  });

  // APIURL'yi ortam değişkenlerinden veya varsayılan olarak ayarla
  const APIURL = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    if (router) {
      fetchUsers();
    }
  }, [router]);
  
  // Kullanıcı istatistiklerini hesapla
  useEffect(() => {
    if (users.length > 0) {
      setUserStats({
        total: users.length,
        active: users.filter(user => user.status === 'active').length,
        admin: users.filter(user => 
          user.role === 'admin' || 
          (user.roles && (user.roles.includes('admin') || user.roles.includes('super_admin')))
        ).length
      });
    }
  }, [users]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.log('Token bulunamadı. Giriş sayfasına yönlendiriliyor.');
        router.replace('/admin');
        return;
      }
      
      console.log('Kullanıcılar için API isteği yapılıyor...');
      
      // Timeout ile API'yi çağır (uzun süre cevap gelmezse 15 saniye sonra iptal et)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Bağlantı zaman aşımına uğradı')), 15000);
      });
      
      // Tüm kullanıcıları getirmek için API çağrısı
      const fetchPromise = axios.get(`/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      // İki promisi yarıştır - hangisi önce tamamlanırsa o değerle devam et
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      console.log('API yanıtı:', response.data);
      
      if (response.data && response.data.users) {
        setUsers(response.data.users);
        console.log(`${response.data.users.length} kullanıcı başarıyla yüklendi`);
      } else {
        console.error('API yanıtında kullanıcı verileri bulunamadı:', response.data);
        toast.error('Kullanıcı verileri bulunamadı');
      }
    } catch (error) {
      console.error('Kullanıcılar getirilemedi:', error);
      
      let errorMessage = 'Kullanıcı verileri yüklenemedi';
      
      // Hata türüne göre farklı mesaj göster
      if (error.message === 'Bağlantı zaman aşımına uğradı') {
        errorMessage = 'Sunucudan yanıt alınamadı, lütfen daha sonra tekrar deneyin';
      } else if (error.response) {
        // Sunucudan hata yanıtı geldi
        if (error.response.status === 401 || error.response.status === 403) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('userData');
          router.replace('/admin');
          return;
        } else {
          errorMessage = error.response.data?.error || 'Sunucu hatası';
        }
      } else if (error.request) {
        // İstek yapıldı ama yanıt gelmedi
        errorMessage = 'Sunucu yanıt vermiyor. Lütfen internet bağlantınızı kontrol edin';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'roles') {
      setNewUser({ ...newUser, roles: [value] });
    } else {
      setNewUser({ ...newUser, [name]: value });
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    
    // Zorunlu alanları kontrol et
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Lütfen tüm zorunlu alanları doldurun.');
      return;
    }
    
    setLoading(true);
    
    // Token alır
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Yetkilendirme hatası: Token bulunamadı');
      setLoading(false);
      return;
    }
      
    // Gönderilecek veriyi hazırla
    const userData = {
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      role: newUser.roles[0] || 'editor', // roles array'inden tek bir role değeri al
      status: 'active' // varsayılan durum ekle
    };
    
    console.log('Kullanıcı ekleme isteği gönderiliyor:', {
      ...userData,
      password: '***gizlendi***'
    });
    
    try {
      // daha güvenilir fetch API isteği
      console.log('API isteği başlatılıyor...');
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });
      
      console.log('API yanıt durumu:', response.status);
      
      // Yanıtı JSON olarak çözümle
      const data = await response.json();
      console.log('Kullanıcı ekleme yanıtı:', data);
      
      // Başarısız yanıt durumunu kontrol et
      if (!response.ok) {
        throw new Error(data.error || 'Kullanıcı eklenirken bir hata oluştu');
      }
      
      // Başarı mesajı göster
      toast.success(data.message || 'Kullanıcı başarıyla eklendi!');
      
      // Formu sıfırla
      setNewUser({
        name: '',
        email: '',
        password: '',
        roles: ['editor'],
      });
      
      // Kullanıcı listesini yenile
      fetchUsers();
    } catch (error) {
      console.error('Kullanıcı eklenemedi:', error.message);
      let errorMessage = error.message;
      
      // Tipik hata durumlarına göre daha açıklayıcı mesajlar
      if (errorMessage.includes('e-posta')) {
        errorMessage = 'Bu e-posta adresi zaten kullanılıyor!';
      } else if (errorMessage.includes('zorunlu')) {
        errorMessage = 'Lütfen tüm zorunlu alanları eksiksiz doldurun!';
      } else if (errorMessage.includes('bağlantı')) {
        errorMessage = 'Sunucu bağlantısında bir sorun oluştu. Lütfen internet bağlantınızı kontrol edin.';
      }
      
      toast.error(errorMessage || 'Kullanıcı eklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Başarı mesajı göster
      toast.success('Kullanıcı başarıyla silindi!');
      
      // Kullanıcı listesini güncelle
      setUsers(users.filter(user => user.id !== userId));
      setLoading(false);
    } catch (error) {
      console.error('Kullanıcı silinemedi:', error);
      toast.error(error.response?.data?.error || 'Kullanıcı silinirken bir hata oluştu.');
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      await axios.patch(
        `/api/admin/users/${userId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Kullanıcı listesini güncelle
      setUsers(
        users.map(user =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
      
      // Başarı mesajı göster
      toast.success(`Kullanıcı durumu ${newStatus === 'active' ? 'aktif' : 'pasif'} olarak güncellendi.`);
      setLoading(false);
    } catch (error) {
      console.error('Kullanıcı durumu güncellenemedi:', error);
      toast.error(error.response?.data?.error || 'Kullanıcı durumu güncellenirken bir hata oluştu.');
      setLoading(false);
    }
  };

  // Kullanıcı düzenleme modalını aç
  const handleEditUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      toast.error('Kullanıcı bulunamadı');
      return;
    }
    
    setEditUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || 'active'
    });
    
    setShowEditModal(true);
  };
  
  // Düzenleme formundaki değişiklikleri izle
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditUser(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Kullanıcı bilgilerini güncelle
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    if (!editUser.name || !editUser.email) {
      toast.error('Ad ve e-posta alanları zorunludur');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        toast.error('Oturum zaman aşımına uğradı');
        setLoading(false);
        return;
      }
      
      // Kullanıcı bilgilerini güncelle
      await axios.put(
        `/api/admin/users?id=${editUser.id}`,
        {
          name: editUser.name,
          email: editUser.email,
          role: editUser.role,
          status: editUser.status
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Kullanıcı listesini güncelle
      setUsers(
        users.map(user => 
          user.id === editUser.id ? { ...user, ...editUser } : user
        )
      );
      
      toast.success('Kullanıcı başarıyla güncellendi');
      setShowEditModal(false);
      
    } catch (error) {
      console.error('Kullanıcı güncellenirken hata:', error);
      toast.error(error.response?.data?.error || 'Kullanıcı güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Kullanıcı Yönetimi</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md flex items-center shadow"
          >
            <FaPlus className="mr-2" /> Yeni Ekle
          </button>
        </div>
        
        {/* İstatistik Kutuları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Toplam Kullanıcı */}
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <FaUser className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Toplam Kullanıcı</p>
              <p className="text-2xl font-bold text-gray-800">{userStats.total}</p>
            </div>
          </div>
          
          {/* Aktif Kullanıcı */}
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <FaUserTie className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Aktif Kullanıcı</p>
              <p className="text-2xl font-bold text-gray-800">{userStats.active}</p>
            </div>
          </div>
          
          {/* Yönetici Sayısı */}
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className="rounded-full bg-red-100 p-3 mr-4">
              <FaUserShield className="text-red-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Yönetici Sayısı</p>
              <p className="text-2xl font-bold text-gray-800">{userStats.admin}</p>
            </div>
          </div>
        </div>

        {/* Kullanıcı Listesi */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Ad Soyad</th>
                  <th className="py-3 px-6 text-left">E-posta</th>
                  <th className="py-3 px-6 text-left">Rol</th>
                  <th className="py-3 px-6 text-left">Durum</th>
                  <th className="py-3 px-6 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="text-gray-700 text-sm">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-6">{user.name}</td>
                      <td className="py-3 px-6">{user.email}</td>
                      <td className="py-3 px-6 capitalize">
                        {user.role === 'admin' ? 'Süper Admin' : 
                         user.role === 'editor' ? 'İçerik Editörü' : 
                         user.role === 'support' ? 'Destek Ekibi' : 
                         user.role}
                      </td>
                      <td className="py-3 px-6">
                        <button
                          onClick={() => handleToggleStatus(user.id, user.status)}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.status === 'active' ? 'Aktif' : 'Pasif'}
                        </button>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <button 
                            onClick={() => handleEditUser(user.id)}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-gray-500">
                      Yönetici kullanıcısı bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Yeni Kullanıcı Ekleme Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Yeni Kullanıcı Ekle</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="p-4">
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newUser.name}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={newUser.email}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                  Şifre
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={newUser.password}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="roles" className="block text-gray-700 text-sm font-bold mb-2">
                  Rol
                </label>
                <select
                  id="roles"
                  name="roles"
                  value={newUser.roles[0]}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="editor">Editör</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Süper Admin</option>
                </select>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
                  disabled={loading}
                >
                  {loading ? <FaSpinner className="animate-spin mx-auto" /> : "Ekle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Kullanıcı Düzenleme Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Kullanıcı Düzenle</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="p-4">
              <div className="mb-4">
                <label htmlFor="edit-name" className="block text-gray-700 text-sm font-bold mb-2">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editUser.name}
                  onChange={handleEditChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="edit-email" className="block text-gray-700 text-sm font-bold mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  id="edit-email"
                  name="email"
                  value={editUser.email}
                  onChange={handleEditChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="edit-role" className="block text-gray-700 text-sm font-bold mb-2">
                  Rol
                </label>
                <select
                  id="edit-role"
                  name="role"
                  value={editUser.role}
                  onChange={handleEditChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="editor">Editör</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Süper Admin</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="edit-status" className="block text-gray-700 text-sm font-bold mb-2">
                  Durum
                </label>
                <select
                  id="edit-status"
                  name="status"
                  value={editUser.status}
                  onChange={handleEditChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                </select>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded"
                  disabled={loading}
                >
                  {loading ? <FaSpinner className="animate-spin mx-auto" /> : "Güncelle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
