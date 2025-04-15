import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PortalLayout from '../../components/portal/Layout';
import { FaTasks, FaSearch, FaPlus, FaFilter, FaUser, FaTruck, FaMapMarkedAlt, FaClock, FaCheckCircle, FaExclamationCircle, FaTimes, FaEdit, FaTrash, FaCalendarAlt, FaUserTie, FaImage, FaSave } from 'react-icons/fa';

export default function Tasks() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending',
    type: 'transport',
    notes: '',
    image: null
  });

  useEffect(() => {
    // Kullanıcı kontrolü
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/portal/login');
      return;
    }
    setLoading(false);
  }, [router]);

  // Örnek görev verileri
  const [tasks] = useState([
    {
      id: 'TASK001',
      title: 'İstanbul-Ankara Taşıma',
      description: 'ABC Lojistik için acil yük taşıma',
      assignedTo: 'Ahmet Yılmaz',
      dueDate: '2024-02-20',
      priority: 'high',
      status: 'in_progress',
      type: 'transport',
      location: 'İstanbul-Ankara',
      notes: 'Özel ekipman gerekiyor',
      progress: 65
    },
    {
      id: 'TASK002',
      title: 'Depo Envanter Kontrolü',
      description: 'XYZ Depo envanter sayımı ve kontrolü',
      assignedTo: 'Mehmet Demir',
      dueDate: '2024-02-18',
      priority: 'medium',
      status: 'pending',
      type: 'inventory',
      location: 'XYZ Depo',
      notes: 'Tüm ürünlerin barkod kontrolü yapılacak',
      progress: 0
    },
    {
      id: 'TASK003',
      title: 'Araç Bakımı',
      description: '34 ABC 123 plakalı aracın periyodik bakımı',
      assignedTo: 'Ali Kaya',
      dueDate: '2024-02-15',
      priority: 'low',
      status: 'completed',
      type: 'maintenance',
      location: 'Merkez Garaj',
      notes: 'Yağ ve filtre değişimi yapılacak',
      progress: 100
    },
    {
      id: 'TASK004',
      title: 'Müşteri Ziyareti',
      description: 'DEF Lojistik ile yeni sözleşme görüşmesi',
      assignedTo: 'Ayşe Yıldız',
      dueDate: '2024-02-22',
      priority: 'high',
      status: 'pending',
      type: 'meeting',
      location: 'DEF Lojistik Merkez Ofis',
      notes: 'Sunum hazırlanacak',
      progress: 30
    }
  ]);

  const filteredTasks = tasks.filter(task => {
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !task.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleSubmitTask = (e) => {
    e.preventDefault();
    // Yeni görev ekleme işlemi burada yapılacak
    setShowNewTaskModal(false);
    setNewTask({
      title: '',
      description: '',
      assignedTo: '',
      dueDate: '',
      priority: 'medium',
      status: 'pending',
      type: 'transport',
      notes: '',
      image: null
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewTask({ ...newTask, image: file });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <PortalLayout title="Görevler">
      <div className="space-y-6 p-4">
        {/* Üst Bilgi Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaTasks className="h-5 w-5 text-blue-500" />
              </div>
              <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded-full">
                Toplam
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Toplam Görev</h3>
            <p className="text-2xl font-bold text-gray-800">4</p>
            <p className="mt-2 text-xs text-green-600">
              <FaCheckCircle className="inline mr-1" />
              <span>%100 verimli</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-green-100 rounded-full">
                <FaCheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <span className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-1 rounded-full">
                Tamamlanan
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Tamamlanan Görevler</h3>
            <p className="text-2xl font-bold text-gray-800">1</p>
            <p className="mt-2 text-xs text-green-600">
              <FaCheckCircle className="inline mr-1" />
              <span>%25 tamamlanma oranı</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaExclamationCircle className="h-5 w-5 text-yellow-500" />
              </div>
              <span className="text-xs text-yellow-700 font-semibold bg-yellow-50 px-2 py-1 rounded-full">
                Devam Eden
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Devam Eden Görevler</h3>
            <p className="text-2xl font-bold text-gray-800">1</p>
            <p className="mt-2 text-xs text-yellow-600">
              <FaExclamationCircle className="inline mr-1" />
              <span>%25 devam eden oranı</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-red-100 rounded-full">
                <FaTimes className="h-5 w-5 text-red-500" />
              </div>
              <span className="text-xs text-red-700 font-semibold bg-red-50 px-2 py-1 rounded-full">
                Bekleyen
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Bekleyen Görevler</h3>
            <p className="text-2xl font-bold text-gray-800">2</p>
            <p className="mt-2 text-xs text-red-600">
              <FaTimes className="inline mr-1" />
              <span>%50 bekleme oranı</span>
            </p>
          </div>
        </div>

        {/* Arama ve Filtreler */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Görev ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
                >
                  <option value="all">Tüm Görevler</option>
                  <option value="completed">Tamamlanan</option>
                  <option value="in_progress">Devam Eden</option>
                  <option value="pending">Bekleyen</option>
                </select>
                <FaFilter className="absolute left-3 top-3 text-gray-400" />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowNewTaskModal(true)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center"
              >
                <FaPlus className="mr-2" />
                Yeni Görev
              </button>
            </div>
          </div>
        </div>

        {/* Görev Listesi */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Görev Listesi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map(task => (
              <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <p className="text-sm text-gray-500">{task.description}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {task.status === 'completed' ? 'Tamamlandı' : 
                     task.status === 'in_progress' ? 'Devam Ediyor' : 
                     'Bekliyor'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <FaUserTie className="text-blue-500 mr-2" />
                    <span>{task.assignedTo}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FaMapMarkedAlt className="text-blue-500 mr-2" />
                    <span>{task.location}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FaTasks className="text-blue-500 mr-2" />
                    <span>{task.type === 'transport' ? 'Taşıma' : 
                           task.type === 'inventory' ? 'Envanter' : 
                           task.type === 'maintenance' ? 'Bakım' : 
                           'Toplantı'}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex items-center text-sm text-gray-500">
                    <FaCalendarAlt className="mr-1" />
                    <span>{task.dueDate}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedTask(task)}
                    className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                  >
                    Detayları Gör
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Yeni Görev Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Yeni Görev Ekle</h3>
              <button 
                onClick={() => setShowNewTaskModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitTask} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Görev Başlığı
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows="3"
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sürücü
                  </label>
                  <input
                    type="text"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Görev Tarihi
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Öncelik
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="high">Yüksek</option>
                    <option value="medium">Orta</option>
                    <option value="low">Düşük</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Durum
                  </label>
                  <select
                    value={newTask.status}
                    onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="pending">Bekliyor</option>
                    <option value="in_progress">Devam Ediyor</option>
                    <option value="completed">Tamamlandı</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Görev Tipi
                  </label>
                  <select
                    value={newTask.type}
                    onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="transport">Taşıma</option>
                    <option value="inventory">Envanter</option>
                    <option value="maintenance">Bakım</option>
                    <option value="meeting">Toplantı</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Görsel
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  {newTask.image && (
                    <div className="mt-2 text-sm text-gray-600">
                      Seçilen dosya: {newTask.image.name}
                    </div>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notlar
                  </label>
                  <textarea
                    value={newTask.notes}
                    onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows="3"
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 mr-2"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Görev Detay Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">{selectedTask.title}</h3>
              <button 
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Görev Bilgileri</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <FaTasks className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Görev Tipi</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedTask.type === 'transport' ? 'Taşıma' : 
                           selectedTask.type === 'inventory' ? 'Envanter' : 
                           selectedTask.type === 'maintenance' ? 'Bakım' : 
                           'Toplantı'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <FaUserTie className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Sürücü</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedTask.assignedTo}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <FaMapMarkedAlt className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Konum</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedTask.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <FaCalendarAlt className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Görev Tarihi</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedTask.dueDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Durum Bilgileri</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                        <FaTasks className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Durum</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedTask.status === 'completed' ? 'Tamamlandı' : 
                           selectedTask.status === 'in_progress' ? 'Devam Ediyor' : 
                           'Bekliyor'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <FaExclamationCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Öncelik</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {selectedTask.priority === 'high' ? 'Yüksek' : 
                           selectedTask.priority === 'medium' ? 'Orta' : 
                           'Düşük'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <FaTasks className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Açıklama</p>
                        <p className="text-lg font-semibold text-gray-900">{selectedTask.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Notlar</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedTask.notes}</p>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center">
                  <FaCheckCircle className="mr-2" />
                  Tamamla
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center">
                  <FaImage className="mr-2" />
                  Görseller
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTask(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 mr-2"
                >
                  Kapat
                </button>
                <button
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center"
                >
                  <FaSave className="mr-2" />
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
} 