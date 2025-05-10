import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/admin/Layout';
import axios from 'axios';
import { FaCar, FaSpinner, FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';

export default function VehicleDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');
        
        if (!token || !userData) {
          console.log('Token veya kullanıcı bilgisi bulunamadı, login sayfasına yönlendiriliyor');
          router.replace('/admin');
          return;
        }

        const user = JSON.parse(userData);
        const allowedRoles = ['admin', 'super_admin', 'editor', 'support'];
        const hasAllowedRole = user.roles?.some(role => allowedRoles.includes(role)) || allowedRoles.includes(user.role);
        
        if (!hasAllowedRole) {
          console.log('Bu sayfaya erişim yetkiniz yok');
          router.replace('/admin/dashboard');
          return;
        }

        const response = await axios.get(`/api/admin/vehicles/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data && response.data.vehicle) {
          setVehicle(response.data.vehicle);
          setEditData(response.data.vehicle);
        }
      } catch (error) {
        console.error('Araç detayları yüklenirken hata:', error);
        
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          router.replace('/admin');
          return;
        }
        
        setError('Araç detayları yüklenemedi. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady && id) {
      fetchVehicle();
    }
  }, [router.isReady, id]);

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`/api/admin/vehicles/${id}`, editData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data && response.data.vehicle) {
        setVehicle(response.data.vehicle);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Araç güncellenirken hata:', error);
      setError('Araç güncellenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bu aracı silmek istediğinizden emin misiniz?')) {
      try {
        const token = localStorage.getItem('token');
        
        await axios.delete(`/api/admin/vehicles/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        router.push('/admin/vehicles');
      } catch (error) {
        console.error('Araç silinirken hata:', error);
        setError('Araç silinirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <FaSpinner className="animate-spin text-orange-500 text-4xl" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-4">
          <div className="bg-red-50 text-red-500 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!vehicle) {
    return (
      <AdminLayout>
        <div className="p-4">
          <div className="bg-yellow-50 text-yellow-600 p-4 rounded-lg">
            Araç bulunamadı
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/admin/vehicles')}
              className="text-gray-600 hover:text-gray-800"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-800">
              Araç Detayları
            </h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 flex items-center space-x-2"
            >
              <FaEdit />
              <span>{isEditing ? 'İptal' : 'Düzenle'}</span>
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 flex items-center space-x-2"
            >
              <FaTrash />
              <span>Sil</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {isEditing ? (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plaka
                  </label>
                  <input
                    type="text"
                    value={editData.plateNumber || ''}
                    onChange={(e) => setEditData({ ...editData, plateNumber: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marka
                  </label>
                  <input
                    type="text"
                    value={editData.brand || ''}
                    onChange={(e) => setEditData({ ...editData, brand: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <input
                    type="text"
                    value={editData.model || ''}
                    onChange={(e) => setEditData({ ...editData, model: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yıl
                  </label>
                  <input
                    type="number"
                    value={editData.year || ''}
                    onChange={(e) => setEditData({ ...editData, year: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kapasite
                  </label>
                  <input
                    type="text"
                    value={editData.capacity || ''}
                    onChange={(e) => setEditData({ ...editData, capacity: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durum
                  </label>
                  <select
                    value={editData.status || 'active'}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                    <option value="maintenance">Bakımda</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
                >
                  Kaydet
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Araç Bilgileri
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Plaka
                    </label>
                    <p className="mt-1 text-lg">{vehicle.plateNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Marka
                    </label>
                    <p className="mt-1 text-lg">{vehicle.brand}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Model
                    </label>
                    <p className="mt-1 text-lg">{vehicle.model}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Detay Bilgileri
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Yıl
                    </label>
                    <p className="mt-1 text-lg">{vehicle.year || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Kapasite
                    </label>
                    <p className="mt-1 text-lg">{vehicle.capacity || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      Durum
                    </label>
                    <span
                      className={`mt-1 inline-flex px-2 py-1 text-sm font-semibold rounded-full ${
                        vehicle.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : vehicle.status === 'maintenance'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {vehicle.status === 'active'
                        ? 'Aktif'
                        : vehicle.status === 'maintenance'
                        ? 'Bakımda'
                        : 'Pasif'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 