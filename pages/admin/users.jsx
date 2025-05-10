import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/admin/Layout';
import { FaSearch, FaFilter, FaUser, FaCheck, FaTimes, FaEye } from 'react-icons/fa';

export default function Users() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!data.success || (!data.user.roles?.includes('admin') && data.user.role !== 'admin')) {
          router.push('/admin/login');
          return;
        }

        fetchUsers();
      } catch (error) {
        console.error('Yetkilendirme hatası:', error);
        router.push('/admin/login');
      }
    };

    checkAuth();
  }, [router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users?page=${page}&search=${search}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setUsers(data.users);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (error) {
      console.error('Kullanıcıları getirme hatası:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page) {
      fetchUsers();
    }
  }, [page, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <AdminLayout title="Kullanıcı Yönetimi">
      <div className="p-6">
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                placeholder="Kullanıcı ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <FaSearch className="inline-block mr-2" />
                Ara
              </button>
            </form>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kullanıcı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      E-posta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                              <FaUser className="h-6 w-6 text-orange-500" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.roles?.includes('admin') ? 'Admin' : user.role}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isActive ? (
                          <div className="flex items-center">
                            <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-full bg-green-50 text-green-700 border border-green-200">
                              <FaCheck className="w-4 h-4 mr-2 text-green-500" />
                              Aktif
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="px-3 py-1 inline-flex items-center text-sm font-medium rounded-full bg-red-50 text-red-700 border border-red-200">
                              <FaTimes className="w-4 h-4 mr-2 text-red-500" />
                              Pasif
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-orange-500 hover:text-orange-600"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      page === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Önceki
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === i + 1
                          ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      page === totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    Sonraki
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Kullanıcı Detayları</h2>
            <div className="space-y-4">
              <p><strong className="text-gray-700">Ad Soyad:</strong> {selectedUser.name}</p>
              <p><strong className="text-gray-700">E-posta:</strong> {selectedUser.email}</p>
              <p><strong className="text-gray-700">Telefon:</strong> {selectedUser.phone || '-'}</p>
              <p><strong className="text-gray-700">Rol:</strong> {selectedUser.roles?.join(', ') || selectedUser.role || '-'}</p>
            </div>
            <button
              onClick={closeModal}
              className="mt-6 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
} 