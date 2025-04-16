import React, { useEffect, useState } from 'react';
import { withAuth } from '../../../src/lib/auth';
import AdminLayout from '../../../src/components/layouts/AdminLayout';
import { FaUsers, FaSearch, FaFilter, FaUserPlus, FaEdit, FaTrash, FaExclamationTriangle, FaTimes, FaUserShield, FaUserTie, FaUser } from 'react-icons/fa';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';

function UserManagement() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    admin: 0
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0
  });
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  });
  const router = useRouter();

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
  }, [pagination.page, filters]);

  // Kullanıcı istatistiklerini hesapla
  useEffect(() => {
    if (users.length > 0) {
      const stats = {
        total: users.length,
        active: users.filter(user => user.status === 'active').length,
        admin: users.filter(user => user.role === 'admin' || (user.roles && user.roles.includes('admin'))).length
      };
      setUserStats(stats);
    }
  }, [users]);

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await axios.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCurrentUser(response.data.user);
    } catch (err) {
      console.error('Oturum bilgileri alınamadı:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      const response = await axios.get('/api/admin/users', { params });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
      setLoading(false);
    } catch (err) {
      console.error('Kullanıcılar alınırken hata:', err);
      setError('Kullanıcı bilgileri alınamadı. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Filtre değişince sayfa 1'e dön
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Mevcut filtrede arama zaten var
    fetchUsers();
  };

  const clearFilters = () => {
    setFilters({
      role: '',
      status: '',
      search: ''
    });
  };

  const changePage = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  // Tarih formatı
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('tr-TR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const deleteUser = async (userId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setError('Oturum zaman aşımına uğradı. Lütfen tekrar giriş yapın.');
        return;
      }
      
      // Kullanıcı ID'si kontrol et
      if (!userId) {
        setError('Kullanıcı ID bulunamadı.');
        return;
      }
      
      console.log('Kullanıcı siliniyor:', userId);
      
      // API'ye istek at
      await axios.delete(`/api/admin/users?id=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Başarılı işlem sonrası
      console.log('Kullanıcı başarıyla silindi');
      
      // Kullanıcı listesini yenile
      fetchUsers();
      
      // Kullanıcıya bildir
      alert('Kullanıcı başarıyla silindi.');
    } catch (err) {
      console.error('Kullanıcı silinirken hata:', err);
      
      // Kullanıcıya hata mesajı göster
      const errorMessage = err.response?.data?.error || 'Kullanıcı silinemedi. Lütfen tekrar deneyin.';
      setError(errorMessage);
      alert('Hata: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı sayfasına yönlendirme
  const editUser = (userId) => {
    if (!userId) {
      setError('Kullanıcı ID bulunamadı.');
      return;
    }
    
    console.log('Kullanıcı düzenleme sayfasına yönlendiriliyor:', userId);
    router.push(`/admin/users/${userId}`);
  };

  // Kullanıcı durumunu değiştirme
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      // Kullanıcının super_admin rolüne sahip olup olmadığını kontrol et
      if (!currentUser || !currentUser.roles || !currentUser.roles.includes('super_admin')) {
        alert('Kullanıcı durumunu değiştirmek için Super Admin yetkisine sahip olmanız gerekiyor.');
        return;
      }

      setLoading(true);
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setError('Oturum zaman aşımına uğradı. Lütfen tekrar giriş yapın.');
        return;
      }
      
      // Yeni durumu belirle (aktif/pasif değişimi)
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      // API'ye istek at
      await axios.put(`/api/admin/users?id=${userId}`, 
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Kullanıcı listesini yenile
      fetchUsers();
      
      // Kullanıcıya bildir
      alert(`Kullanıcı durumu ${newStatus === 'active' ? 'aktif' : 'pasif'} olarak güncellendi.`);
    } catch (err) {
      console.error('Kullanıcı durumu güncellenirken hata:', err);
      const errorMessage = err.response?.data?.error || 'Kullanıcı durumu güncellenemedi. Lütfen tekrar deneyin.';
      setError(errorMessage);
      alert('Hata: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Kullanıcı Yönetimi">
      <div className="user-management p-4 lg:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-800 mb-4 md:mb-0">Kullanıcı Yönetimi</h1>
          <button 
            onClick={() => setShowUserModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-orange-700 transition"
          >
            <FaUserPlus className="mr-2" />
            Yeni Ekle
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

        {/* Yeni Kullanıcı Ekleme Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Yeni Kullanıcı Ekle</h2>
                <button 
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="p-6">
                <iframe 
                  src="/admin/users/new" 
                  className="w-full h-[500px] border-0" 
                  title="Yeni Kullanıcı Ekle"
                ></iframe>
              </div>
            </div>
          </div>
        )}

        {/* Filtreler */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h2 className="text-lg font-medium text-gray-700 mb-4 md:mb-0 flex items-center">
              <FaFilter className="mr-2" /> Filtreler
            </h2>
            
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
              {/* Rol Filtresi */}
              <select
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                className="border rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Tüm Roller</option>
                <option value="admin">Admin</option>
                <option value="company">Şirket</option>
                <option value="driver">Sürücü</option>
                <option value="customer">Müşteri</option>
              </select>

              {/* Durum Filtresi */}
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="border rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
                <option value="pending">Onay Bekliyor</option>
                <option value="suspended">Askıya Alınmış</option>
              </select>

              {/* Arama */}
              <form onSubmit={handleSearchSubmit} className="flex w-full md:w-auto">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="İsim, e-posta veya telefon ara..."
                  className="border rounded-l-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
                />
                <button
                  type="submit"
                  className="bg-orange-600 text-white px-3 py-2 rounded-r-md hover:bg-orange-700"
                >
                  <FaSearch />
                </button>
              </form>

              {/* Filtreleri Temizle */}
              <button
                onClick={clearFilters}
                className="text-gray-600 border border-gray-300 px-3 py-2 rounded-md hover:bg-gray-100"
              >
                Temizle
              </button>
            </div>
          </div>
        </div>

        {/* Kullanıcı Tablosu */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <FaExclamationTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <p className="text-red-500 text-lg mb-4">{error}</p>
              <button 
                onClick={() => fetchUsers()} 
                className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
              >
                Tekrar Dene
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center">
              <FaUsers className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Kullanıcı bulunamadı</p>
              {Object.values(filters).some(f => f !== '') && (
                <button 
                  onClick={clearFilters} 
                  className="mt-4 text-orange-600 underline hover:text-orange-800"
                >
                  Filtreleri temizle
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İletişim</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kayıt Tarihi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name} {user.surname}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                          <div className="text-sm text-gray-500">{user.phone || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                              user.role === 'company' ? 'bg-blue-100 text-blue-800' : 
                              user.role === 'driver' ? 'bg-green-100 text-green-800' : 
                              'bg-purple-100 text-purple-800'}`}
                          >
                            {user.role === 'admin' ? 'Admin' : 
                             user.role === 'company' ? 'Şirket' : 
                             user.role === 'driver' ? 'Sürücü' : 
                             'Müşteri'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${user.status === 'active' ? 'bg-green-100 text-green-800' : 
                              user.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                              user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}
                          >
                            {user.status === 'active' ? 'Aktif' : 
                             user.status === 'inactive' ? 'Pasif' : 
                             user.status === 'pending' ? 'Onay Bekliyor' : 
                             'Askıya Alınmış'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                              onClick={() => editUser(user.id || user._id)}
                            >
                              <FaEdit className="mr-1" /> Düzenle
                            </button>
                            
                            {currentUser && currentUser.roles && currentUser.roles.includes('super_admin') && (
                              <button 
                                className={`${user.status === 'active' ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'} flex items-center`}
                                onClick={() => toggleUserStatus(user.id || user._id, user.status)}
                              >
                                {user.status === 'active' ? 'Pasif Yap' : 'Aktif Yap'}
                              </button>
                            )}
                            
                            <button 
                              className="text-red-600 hover:text-red-900 flex items-center" 
                              onClick={() => {
                                if (confirm(`${user.name} kullanıcısını silmek istediğinize emin misiniz?`)) {
                                  deleteUser(user.id || user._id);
                                }
                              }}
                            >
                              <FaTrash className="mr-1" /> Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sayfalama */}
              {pagination.pages > 1 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between items-center">
                    <button
                      onClick={() => changePage(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        pagination.page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Önceki
                    </button>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">{pagination.page}</span> / <span className="font-medium">{pagination.pages}</span>{' '}
                      <span>Toplam {pagination.total} kullanıcı</span>
                    </div>
                    <button
                      onClick={() => changePage(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        pagination.page === pagination.pages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Sonraki
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default withAuth(UserManagement, ['admin', 'super_admin', 'editor', 'support']); 