import React, { useState } from 'react'
import AdminLayout from '../../components/admin/Layout'
import { FaTruck, FaEdit, FaPlus, FaSearch, FaFilter, FaEye, FaFileAlt, FaTimes, FaExclamationCircle, FaIdCard } from 'react-icons/fa'

export default function Vehicles() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showVehicleDetailModal, setShowVehicleDetailModal] = useState(null)
  const [showVehicleDocumentsModal, setShowVehicleDocumentsModal] = useState(null)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('all')

  // Örnek araç verileri
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      plate: '34 ABC 123',
      brand: 'Mercedes',
      model: 'Actros',
      year: '2022',
      type: 'Kamyon',
      capacity: '20 ton',
      status: 'active',
      driver: 'Ahmet Yılmaz',
      lastMaintenance: '2024-02-15',
      nextMaintenance: '2024-05-15',
      documents: [
        { id: 1, name: 'Ruhsat *', type: 'Zorunlu', validUntil: '31.12.2024', status: 'Aktif', fileUrl: '/documents/ruhsat.pdf' },
        { id: 2, name: 'Sigorta *', type: 'Zorunlu', validUntil: '15.06.2023', status: 'Süresi Dolmuş', fileUrl: '/documents/sigorta.pdf' },
        { id: 3, name: 'Muayene *', type: 'Zorunlu', validUntil: '22.08.2023', status: 'Süresi Dolmuş', fileUrl: '/documents/muayene.pdf' }
      ]
    },
    {
      id: 2,
      plate: '06 XYZ 789',
      brand: 'Volvo',
      model: 'FH16',
      year: '2021',
      type: 'Tır',
      capacity: '40 ton',
      status: 'maintenance',
      driver: 'Mehmet Demir',
      lastMaintenance: '2024-01-20',
      nextMaintenance: '2024-04-20',
      documents: [
        { id: 1, name: 'Ruhsat *', type: 'Zorunlu', validUntil: '31.12.2024', status: 'Aktif', fileUrl: '/documents/ruhsat.pdf' },
        { id: 2, name: 'Sigorta *', type: 'Zorunlu', validUntil: '10.08.2024', status: 'Aktif', fileUrl: '/documents/sigorta.pdf' }
      ]
    },
    {
      id: 3,
      plate: '35 DEF 456',
      brand: 'MAN',
      model: 'TGX',
      year: '2023',
      type: 'Kamyon',
      capacity: '16 ton',
      status: 'active',
      driver: 'Ali Kaya',
      lastMaintenance: '2024-02-01',
      nextMaintenance: '2024-05-01',
      documents: [
        { id: 1, name: 'Ruhsat *', type: 'Zorunlu', validUntil: '31.12.2024', status: 'Aktif', fileUrl: '/documents/ruhsat.pdf' },
        { id: 2, name: 'Sigorta *', type: 'Zorunlu', validUntil: '10.08.2024', status: 'Aktif', fileUrl: '/documents/sigorta.pdf' }
      ]
    }
  ])

  const tabs = [
    { id: 'all', name: 'Tüm Araçlar' },
    { id: 'active', name: 'Aktif' },
    { id: 'maintenance', name: 'Bakımda' },
    { id: 'documents', name: 'Süresi Dolmuş Belge' },
  ]

  // Araç durumuna göre renk sınıfı
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Araç durumuna göre Türkçe metin
  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Aktif'
      case 'maintenance':
        return 'Bakımda'
      case 'inactive':
        return 'Pasif'
      default:
        return 'Bilinmiyor'
    }
  }

  // Araç silme
  const deleteVehicle = (id) => {
    setVehicles(prevVehicles => prevVehicles.filter(vehicle => vehicle.id !== id))
  }

  // Araç durumunu değiştirme
  const toggleVehicleStatus = (id) => {
    setVehicles(prevVehicles => 
      prevVehicles.map(vehicle => 
        vehicle.id === id 
          ? {...vehicle, status: vehicle.status === 'active' ? 'maintenance' : 'active'} 
          : vehicle
      )
    )
  }

  // Filtreleme ve arama
  const filteredVehicles = vehicles.filter(vehicle => {
    // Tab filtresi
    const tabFilter = 
      selectedTab === 'all' ? true :
      selectedTab === 'active' ? vehicle.status === 'active' :
      selectedTab === 'maintenance' ? vehicle.status === 'maintenance' :
      selectedTab === 'documents' ? vehicle.documents.some(doc => doc.status === 'Süresi Dolmuş') :
      true
    
    // Arama filtresi
    const searchFilter = 
      vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase())
    
    return tabFilter && searchFilter
  })

  return (
    <AdminLayout title="Araç Yönetimi">
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex space-x-2 flex-wrap">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedTab === tab.id 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } mb-2`}
              >
                {tab.name}
              </button>
            ))}
          </div>
          <div className="flex flex-col w-full md:flex-row md:w-auto gap-4">
            <div className="relative w-full md:w-auto">
              <input 
                type="text" 
                placeholder="Araç ara..." 
                className="pl-10 pr-4 py-2 w-full md:min-w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button 
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-1"
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus className="mr-2" />
              <span>Yeni Araç</span>
            </button>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <FaTruck className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Toplam Araç</h3>
                <p className="text-2xl font-bold">{vehicles.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FaTruck className="text-green-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Aktif Araç</h3>
                <p className="text-2xl font-bold">{vehicles.filter(vehicle => vehicle.status === 'active').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <FaExclamationCircle className="text-red-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Süresi Dolmuş Belge</h3>
                <p className="text-2xl font-bold">{vehicles.filter(vehicle => vehicle.documents.some(doc => doc.status === 'Süresi Dolmuş')).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Araç Tablosu */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plaka</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marka/Model</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tip</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sürücü</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bakım</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicle.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{vehicle.plate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vehicle.brand}</div>
                      <div className="text-sm text-gray-500">{vehicle.model}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vehicle.type}</div>
                      <div className="text-sm text-gray-500">{vehicle.capacity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vehicle.driver}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                        {getStatusText(vehicle.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vehicle.lastMaintenance}</div>
                      <div className="text-sm text-gray-500">Sonraki: {vehicle.nextMaintenance}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900 transition-colors" 
                          onClick={() => setShowVehicleDetailModal(vehicle)}
                          title="Araç Detayları"
                        >
                          <FaEye className="w-5 h-5" />
                        </button>
                        <button 
                          className="text-orange-600 hover:text-orange-900 transition-colors" 
                          onClick={() => setShowVehicleDocumentsModal(vehicle)}
                          title="Belgeler"
                        >
                          <FaFileAlt className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Toplam <span className="font-medium">{filteredVehicles.length}</span> araç
            </div>
            <div className="flex space-x-1">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                Önceki
              </button>
              <button className="px-3 py-1 border border-gray-300 bg-orange-50 text-orange-600 rounded-md text-sm">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                Sonraki
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Araç Detay Modalı */}
      {showVehicleDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget && !showVehicleDocumentsModal) setShowVehicleDetailModal(null);
        }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Araç Detayları</h3>
              <button 
                onClick={() => setShowVehicleDetailModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Sol Bölüm - Araç Bilgileri */}
                <div className="md:w-1/2 space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-3">Araç Bilgileri</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                          <FaTruck className="h-8 w-8" />
                        </div>
                        <div className="ml-4">
                          <h5 className="text-xl font-medium text-gray-900">{showVehicleDetailModal.plate}</h5>
                          <p className="text-gray-600">{showVehicleDetailModal.brand} {showVehicleDetailModal.model}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Araç Tipi</p>
                          <p className="font-medium text-gray-900">{showVehicleDetailModal.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Model Yılı</p>
                          <p className="font-medium text-gray-900">{showVehicleDetailModal.year}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Kapasite</p>
                          <p className="font-medium text-gray-900">{showVehicleDetailModal.capacity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Durum</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            showVehicleDetailModal.status === 'active' ? 'bg-green-100 text-green-800' :
                            showVehicleDetailModal.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {showVehicleDetailModal.status === 'active' ? 'Aktif' :
                             showVehicleDetailModal.status === 'maintenance' ? 'Bakımda' :
                             'Pasif'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-3">Bakım Bilgileri</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Son Bakım Tarihi</p>
                        <p className="font-medium text-gray-900">{showVehicleDetailModal.lastMaintenance}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Sonraki Bakım Tarihi</p>
                        <p className="font-medium text-gray-900">{showVehicleDetailModal.nextMaintenance}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Bakım Notları</p>
                        <p className="text-sm text-gray-600">{showVehicleDetailModal.maintenanceNotes || 'Not bulunmuyor'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sağ Bölüm - Sürücü ve Performans */}
                <div className="md:w-1/2 space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-3">Sürücü Bilgileri</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {showVehicleDetailModal.driver && typeof showVehicleDetailModal.driver === 'string' ? (
                        <div className="text-center py-4">
                          <div className="flex items-center justify-center mb-4">
                            <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                              {showVehicleDetailModal.driver.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <h5 className="text-lg font-medium text-gray-900">{showVehicleDetailModal.driver}</h5>
                            </div>
                          </div>
                        </div>
                      ) : showVehicleDetailModal.driver && typeof showVehicleDetailModal.driver === 'object' ? (
                        <>
                          <div className="flex items-center mb-4">
                            <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                              {showVehicleDetailModal.driver.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <h5 className="text-lg font-medium text-gray-900">{showVehicleDetailModal.driver.name}</h5>
                              <p className="text-sm text-gray-500">{showVehicleDetailModal.driver.phone}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Ehliyet Sınıfı</p>
                              <p className="font-medium text-gray-900">{showVehicleDetailModal.driver.licenseType || '-'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Deneyim</p>
                              <p className="font-medium text-gray-900">{showVehicleDetailModal.driver.experience || '-'}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500">Atanmış sürücü bulunmuyor</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-3">Performans Bilgileri</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Toplam Sefer</p>
                          <p className="font-medium text-gray-900">{showVehicleDetailModal.totalTrips || '0'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Toplam Mesafe</p>
                          <p className="font-medium text-gray-900">{showVehicleDetailModal.totalDistance || '0'} km</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Yakıt Tüketimi</p>
                          <p className="font-medium text-gray-900">{showVehicleDetailModal.fuelConsumption || '0'} lt/100km</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Aktif Sefer</p>
                          <p className="font-medium text-gray-900">{showVehicleDetailModal.activeTrip ? 'Var' : 'Yok'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-3">Belgeler</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <button 
                        onClick={() => setShowVehicleDocumentsModal(showVehicleDetailModal)}
                        className="w-full bg-white border border-gray-300 shadow-sm px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 flex items-center justify-center"
                      >
                        <FaFileAlt className="mr-2" />
                        Belgeleri Görüntüle
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Araç Belgeleri Modal */}
      {showVehicleDocumentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget) setShowVehicleDocumentsModal(null);
        }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">{showVehicleDocumentsModal.plate} - Araç Belgeleri</h3>
              <button 
                onClick={() => setShowVehicleDocumentsModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              {showVehicleDocumentsModal.documents && showVehicleDocumentsModal.documents.length > 0 ? (
                <>
                  <div className="mb-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 mb-6">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Belge Adı</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tür</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Geçerlilik Tarihi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {showVehicleDocumentsModal.documents.map((document) => (
                            <tr key={document.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {document.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {document.type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <input
                                  type="date"
                                  defaultValue={document.validUntil}
                                  className="border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  document.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {document.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex space-x-2">
                                  <button 
                                    className="text-blue-600 hover:text-blue-900"
                                    title="Belgeyi Görüntüle"
                                    onClick={() => window.open(document.fileUrl, '_blank')}
                                  >
                                    <FaEye size={18} />
                                  </button>
                                  <button 
                                    className="text-orange-600 hover:text-orange-900"
                                    title="Belgeyi Düzenle"
                                    onClick={() => {
                                      // Belge düzenleme işlemi
                                    }}
                                  >
                                    <FaEdit size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Bu araç için henüz belge kaydı bulunmamaktadır.</p>
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <div>
                  <button 
                    className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded flex items-center"
                  >
                    <FaPlus className="mr-2" /> Yeni Belge Ekle
                  </button>
                </div>
                <button 
                  onClick={() => setShowVehicleDocumentsModal(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded flex items-center"
                >
                  <FaTimes className="mr-2" /> Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Yeni Araç Ekleme Modalı */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Yeni Araç Ekle
                    </h3>
                    <form className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Plaka</label>
                          <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Marka</label>
                          <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Model</label>
                          <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Yıl</label>
                          <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Tip</label>
                          <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500">
                            <option>Kamyon</option>
                            <option>Tır</option>
                            <option>Kamyonet</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Kapasite</label>
                          <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Araç Düzenleme Modalı */}
      {showEditModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Araç Düzenle
                    </h3>
                    <form className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Plaka</label>
                          <input
                            type="text"
                            defaultValue={selectedVehicle.plate}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Marka</label>
                          <input
                            type="text"
                            defaultValue={selectedVehicle.brand}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Model</label>
                          <input
                            type="text"
                            defaultValue={selectedVehicle.model}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Yıl</label>
                          <input
                            type="text"
                            defaultValue={selectedVehicle.year}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Tip</label>
                          <select 
                            defaultValue={selectedVehicle.type}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option>Kamyon</option>
                            <option>Tır</option>
                            <option>Kamyonet</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Kapasite</label>
                          <input
                            type="text"
                            defaultValue={selectedVehicle.capacity}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
} 
import AdminLayout from '../../components/admin/Layout'
import { FaTruck, FaEdit, FaPlus, FaSearch, FaFilter, FaEye, FaFileAlt, FaTimes, FaExclamationCircle, FaIdCard } from 'react-icons/fa'

export default function Vehicles() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showVehicleDetailModal, setShowVehicleDetailModal] = useState(null)
  const [showVehicleDocumentsModal, setShowVehicleDocumentsModal] = useState(null)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('all')

  // Örnek araç verileri
  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      plate: '34 ABC 123',
      brand: 'Mercedes',
      model: 'Actros',
      year: '2022',
      type: 'Kamyon',
      capacity: '20 ton',
      status: 'active',
      driver: 'Ahmet Yılmaz',
      lastMaintenance: '2024-02-15',
      nextMaintenance: '2024-05-15',
      documents: [
        { id: 1, name: 'Ruhsat *', type: 'Zorunlu', validUntil: '31.12.2024', status: 'Aktif', fileUrl: '/documents/ruhsat.pdf' },
        { id: 2, name: 'Sigorta *', type: 'Zorunlu', validUntil: '15.06.2023', status: 'Süresi Dolmuş', fileUrl: '/documents/sigorta.pdf' },
        { id: 3, name: 'Muayene *', type: 'Zorunlu', validUntil: '22.08.2023', status: 'Süresi Dolmuş', fileUrl: '/documents/muayene.pdf' }
      ]
    },
    {
      id: 2,
      plate: '06 XYZ 789',
      brand: 'Volvo',
      model: 'FH16',
      year: '2021',
      type: 'Tır',
      capacity: '40 ton',
      status: 'maintenance',
      driver: 'Mehmet Demir',
      lastMaintenance: '2024-01-20',
      nextMaintenance: '2024-04-20',
      documents: [
        { id: 1, name: 'Ruhsat *', type: 'Zorunlu', validUntil: '31.12.2024', status: 'Aktif', fileUrl: '/documents/ruhsat.pdf' },
        { id: 2, name: 'Sigorta *', type: 'Zorunlu', validUntil: '10.08.2024', status: 'Aktif', fileUrl: '/documents/sigorta.pdf' }
      ]
    },
    {
      id: 3,
      plate: '35 DEF 456',
      brand: 'MAN',
      model: 'TGX',
      year: '2023',
      type: 'Kamyon',
      capacity: '16 ton',
      status: 'active',
      driver: 'Ali Kaya',
      lastMaintenance: '2024-02-01',
      nextMaintenance: '2024-05-01',
      documents: [
        { id: 1, name: 'Ruhsat *', type: 'Zorunlu', validUntil: '31.12.2024', status: 'Aktif', fileUrl: '/documents/ruhsat.pdf' },
        { id: 2, name: 'Sigorta *', type: 'Zorunlu', validUntil: '10.08.2024', status: 'Aktif', fileUrl: '/documents/sigorta.pdf' }
      ]
    }
  ])

  const tabs = [
    { id: 'all', name: 'Tüm Araçlar' },
    { id: 'active', name: 'Aktif' },
    { id: 'maintenance', name: 'Bakımda' },
    { id: 'documents', name: 'Süresi Dolmuş Belge' },
  ]

  // Araç durumuna göre renk sınıfı
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Araç durumuna göre Türkçe metin
  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Aktif'
      case 'maintenance':
        return 'Bakımda'
      case 'inactive':
        return 'Pasif'
      default:
        return 'Bilinmiyor'
    }
  }

  // Araç silme
  const deleteVehicle = (id) => {
    setVehicles(prevVehicles => prevVehicles.filter(vehicle => vehicle.id !== id))
  }

  // Araç durumunu değiştirme
  const toggleVehicleStatus = (id) => {
    setVehicles(prevVehicles => 
      prevVehicles.map(vehicle => 
        vehicle.id === id 
          ? {...vehicle, status: vehicle.status === 'active' ? 'maintenance' : 'active'} 
          : vehicle
      )
    )
  }

  // Filtreleme ve arama
  const filteredVehicles = vehicles.filter(vehicle => {
    // Tab filtresi
    const tabFilter = 
      selectedTab === 'all' ? true :
      selectedTab === 'active' ? vehicle.status === 'active' :
      selectedTab === 'maintenance' ? vehicle.status === 'maintenance' :
      selectedTab === 'documents' ? vehicle.documents.some(doc => doc.status === 'Süresi Dolmuş') :
      true
    
    // Arama filtresi
    const searchFilter = 
      vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase())
    
    return tabFilter && searchFilter
  })

  return (
    <AdminLayout title="Araç Yönetimi">
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex space-x-2 flex-wrap">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedTab === tab.id 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } mb-2`}
              >
                {tab.name}
              </button>
            ))}
          </div>
          <div className="flex flex-col w-full md:flex-row md:w-auto gap-4">
            <div className="relative w-full md:w-auto">
              <input 
                type="text" 
                placeholder="Araç ara..." 
                className="pl-10 pr-4 py-2 w-full md:min-w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button 
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-1"
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus className="mr-2" />
              <span>Yeni Araç</span>
            </button>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <FaTruck className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Toplam Araç</h3>
                <p className="text-2xl font-bold">{vehicles.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FaTruck className="text-green-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Aktif Araç</h3>
                <p className="text-2xl font-bold">{vehicles.filter(vehicle => vehicle.status === 'active').length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <FaExclamationCircle className="text-red-600" />
              </div>
              <div>
                <h3 className="text-gray-500 text-sm">Süresi Dolmuş Belge</h3>
                <p className="text-2xl font-bold">{vehicles.filter(vehicle => vehicle.documents.some(doc => doc.status === 'Süresi Dolmuş')).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Araç Tablosu */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plaka</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marka/Model</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tip</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sürücü</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bakım</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicle.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{vehicle.plate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vehicle.brand}</div>
                      <div className="text-sm text-gray-500">{vehicle.model}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vehicle.type}</div>
                      <div className="text-sm text-gray-500">{vehicle.capacity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vehicle.driver}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                        {getStatusText(vehicle.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vehicle.lastMaintenance}</div>
                      <div className="text-sm text-gray-500">Sonraki: {vehicle.nextMaintenance}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900 transition-colors" 
                          onClick={() => setShowVehicleDetailModal(vehicle)}
                          title="Araç Detayları"
                        >
                          <FaEye className="w-5 h-5" />
                        </button>
                        <button 
                          className="text-orange-600 hover:text-orange-900 transition-colors" 
                          onClick={() => setShowVehicleDocumentsModal(vehicle)}
                          title="Belgeler"
                        >
                          <FaFileAlt className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Toplam <span className="font-medium">{filteredVehicles.length}</span> araç
            </div>
            <div className="flex space-x-1">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                Önceki
              </button>
              <button className="px-3 py-1 border border-gray-300 bg-orange-50 text-orange-600 rounded-md text-sm">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                Sonraki
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Araç Detay Modalı */}
      {showVehicleDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget && !showVehicleDocumentsModal) setShowVehicleDetailModal(null);
        }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Araç Detayları</h3>
              <button 
                onClick={() => setShowVehicleDetailModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Sol Bölüm - Araç Bilgileri */}
                <div className="md:w-1/2 space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-3">Araç Bilgileri</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 h-16 w-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                          <FaTruck className="h-8 w-8" />
                        </div>
                        <div className="ml-4">
                          <h5 className="text-xl font-medium text-gray-900">{showVehicleDetailModal.plate}</h5>
                          <p className="text-gray-600">{showVehicleDetailModal.brand} {showVehicleDetailModal.model}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Araç Tipi</p>
                          <p className="font-medium text-gray-900">{showVehicleDetailModal.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Model Yılı</p>
                          <p className="font-medium text-gray-900">{showVehicleDetailModal.year}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Kapasite</p>
                          <p className="font-medium text-gray-900">{showVehicleDetailModal.capacity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Durum</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            showVehicleDetailModal.status === 'active' ? 'bg-green-100 text-green-800' :
                            showVehicleDetailModal.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {showVehicleDetailModal.status === 'active' ? 'Aktif' :
                             showVehicleDetailModal.status === 'maintenance' ? 'Bakımda' :
                             'Pasif'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-3">Bakım Bilgileri</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Son Bakım Tarihi</p>
                        <p className="font-medium text-gray-900">{showVehicleDetailModal.lastMaintenance}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Sonraki Bakım Tarihi</p>
                        <p className="font-medium text-gray-900">{showVehicleDetailModal.nextMaintenance}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Bakım Notları</p>
                        <p className="text-sm text-gray-600">{showVehicleDetailModal.maintenanceNotes || 'Not bulunmuyor'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sağ Bölüm - Sürücü ve Performans */}
                <div className="md:w-1/2 space-y-6">
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-3">Sürücü Bilgileri</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {showVehicleDetailModal.driver && typeof showVehicleDetailModal.driver === 'string' ? (
                        <div className="text-center py-4">
                          <div className="flex items-center justify-center mb-4">
                            <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                              {showVehicleDetailModal.driver.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <h5 className="text-lg font-medium text-gray-900">{showVehicleDetailModal.driver}</h5>
                            </div>
                          </div>
                        </div>
                      ) : showVehicleDetailModal.driver && typeof showVehicleDetailModal.driver === 'object' ? (
                        <>
                          <div className="flex items-center mb-4">
                            <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                              {showVehicleDetailModal.driver.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <h5 className="text-lg font-medium text-gray-900">{showVehicleDetailModal.driver.name}</h5>
                              <p className="text-sm text-gray-500">{showVehicleDetailModal.driver.phone}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Ehliyet Sınıfı</p>
                              <p className="font-medium text-gray-900">{showVehicleDetailModal.driver.licenseType || '-'}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Deneyim</p>
                              <p className="font-medium text-gray-900">{showVehicleDetailModal.driver.experience || '-'}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-500">Atanmış sürücü bulunmuyor</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-3">Performans Bilgileri</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Toplam Sefer</p>
                          <p className="font-medium text-gray-900">{showVehicleDetailModal.totalTrips || '0'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Toplam Mesafe</p>
                          <p className="font-medium text-gray-900">{showVehicleDetailModal.totalDistance || '0'} km</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Yakıt Tüketimi</p>
                          <p className="font-medium text-gray-900">{showVehicleDetailModal.fuelConsumption || '0'} lt/100km</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Aktif Sefer</p>
                          <p className="font-medium text-gray-900">{showVehicleDetailModal.activeTrip ? 'Var' : 'Yok'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-3">Belgeler</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <button 
                        onClick={() => setShowVehicleDocumentsModal(showVehicleDetailModal)}
                        className="w-full bg-white border border-gray-300 shadow-sm px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 flex items-center justify-center"
                      >
                        <FaFileAlt className="mr-2" />
                        Belgeleri Görüntüle
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Araç Belgeleri Modal */}
      {showVehicleDocumentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={(e) => {
          if (e.target === e.currentTarget) setShowVehicleDocumentsModal(null);
        }}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">{showVehicleDocumentsModal.plate} - Araç Belgeleri</h3>
              <button 
                onClick={() => setShowVehicleDocumentsModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              {showVehicleDocumentsModal.documents && showVehicleDocumentsModal.documents.length > 0 ? (
                <>
                  <div className="mb-4">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 mb-6">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Belge Adı</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tür</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Geçerlilik Tarihi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {showVehicleDocumentsModal.documents.map((document) => (
                            <tr key={document.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {document.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {document.type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <input
                                  type="date"
                                  defaultValue={document.validUntil}
                                  className="border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 text-sm"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  document.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {document.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex space-x-2">
                                  <button 
                                    className="text-blue-600 hover:text-blue-900"
                                    title="Belgeyi Görüntüle"
                                    onClick={() => window.open(document.fileUrl, '_blank')}
                                  >
                                    <FaEye size={18} />
                                  </button>
                                  <button 
                                    className="text-orange-600 hover:text-orange-900"
                                    title="Belgeyi Düzenle"
                                    onClick={() => {
                                      // Belge düzenleme işlemi
                                    }}
                                  >
                                    <FaEdit size={18} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Bu araç için henüz belge kaydı bulunmamaktadır.</p>
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <div>
                  <button 
                    className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded flex items-center"
                  >
                    <FaPlus className="mr-2" /> Yeni Belge Ekle
                  </button>
                </div>
                <button 
                  onClick={() => setShowVehicleDocumentsModal(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded flex items-center"
                >
                  <FaTimes className="mr-2" /> Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Yeni Araç Ekleme Modalı */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Yeni Araç Ekle
                    </h3>
                    <form className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Plaka</label>
                          <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Marka</label>
                          <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Model</label>
                          <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Yıl</label>
                          <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Tip</label>
                          <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500">
                            <option>Kamyon</option>
                            <option>Tır</option>
                            <option>Kamyonet</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Kapasite</label>
                          <input
                            type="text"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Araç Düzenleme Modalı */}
      {showEditModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Araç Düzenle
                    </h3>
                    <form className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Plaka</label>
                          <input
                            type="text"
                            defaultValue={selectedVehicle.plate}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Marka</label>
                          <input
                            type="text"
                            defaultValue={selectedVehicle.brand}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Model</label>
                          <input
                            type="text"
                            defaultValue={selectedVehicle.model}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Yıl</label>
                          <input
                            type="text"
                            defaultValue={selectedVehicle.year}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Tip</label>
                          <select 
                            defaultValue={selectedVehicle.type}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          >
                            <option>Kamyon</option>
                            <option>Tır</option>
                            <option>Kamyonet</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Kapasite</label>
                          <input
                            type="text"
                            defaultValue={selectedVehicle.capacity}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-orange-600 text-base font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Kaydet
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
} 