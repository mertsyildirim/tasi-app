'use client'

import React, { useState, useEffect } from 'react'
import { 
  FaPlus, FaSearch, FaEdit, FaTrash, FaTruck, 
  FaCalendarAlt, FaGasPump, FaTachometerAlt, FaTimes,
  FaExclamationCircle, FaSpinner, FaEye, FaFileAlt
} from 'react-icons/fa'
import AdminLayout from '../../components/admin/Layout'
import { useRouter } from 'next/navigation'
import axios from 'axios'

export default function VehiclesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTab, setSelectedTab] = useState('all')
  const [showVehicleDetailModal, setShowVehicleDetailModal] = useState(null)
  const [showVehicleDocumentsModal, setShowVehicleDocumentsModal] = useState(null)
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false)
  const [showEditVehicleModal, setShowEditVehicleModal] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const router = useRouter()

  // Örnek araç verileri
  const [vehicles, setVehicles] = useState([])
  const [allVehicles, setAllVehicles] = useState([])

  // Yeni araç veri yapısı
  const [newVehicleData, setNewVehicleData] = useState({
    plate: '',
    brand: '',
    model: '',
    modelYear: '',
    chassisNumber: '',
    capacity: '',
    fuelType: '',
    status: 'Aktif',
    companyId: '',
    notes: ''
  })

  // Araç markaları ve modelleri
  const vehicleBrands = {
    'Motosiklet': {
      'Honda': ['CBR', 'CB', 'CRF', 'GL', 'NC', 'PCX', 'VFR', 'X-ADV'],
      'Yamaha': ['MT', 'R1', 'R6', 'TMAX', 'XMAX', 'WR', 'YZF'],
      'Kawasaki': ['Ninja', 'Z', 'Versys', 'KLR', 'W800', 'ZX'],
      'BMW': ['R', 'S', 'F', 'G', 'K'],
      'Ducati': ['Monster', 'Panigale', 'Multistrada', 'Streetfighter', 'Hypermotard'],
      'KTM': ['Duke', 'RC', 'Adventure', 'EXC', 'SX'],
      'Suzuki': ['GSX', 'V-Strom', 'Burgman', 'Bandit', 'Hayabusa'],
      'Triumph': ['Street', 'Speed', 'Tiger', 'Bonneville', 'Rocket']
    },
    'Otomobil': {
      'Toyota': ['Corolla', 'Yaris', 'RAV4', 'Camry', 'Hilux', 'Land Cruiser'],
      'Volkswagen': ['Golf', 'Passat', 'Polo', 'Tiguan', 'Arteon', 'T-Roc'],
      'Ford': ['Focus', 'Fiesta', 'Mustang', 'Explorer', 'Ranger', 'Transit'],
      'Renault': ['Clio', 'Megane', 'Captur', 'Kadjar', 'Talisman', 'Master'],
      'Fiat': ['500', 'Punto', 'Ducato', 'Doblo', 'Panda', 'Tipo'],
      'BMW': ['3 Serisi', '5 Serisi', 'X3', 'X5', 'M3', 'M5'],
      'Mercedes-Benz': ['A Serisi', 'C Serisi', 'E Serisi', 'S Serisi', 'GLC', 'GLE'],
      'Audi': ['A3', 'A4', 'A6', 'Q3', 'Q5', 'RS']
    },
    'Kamyonet': {
      'Ford': ['Transit Custom', 'Transit Connect'],
      'Volkswagen': ['Transporter', 'Caddy'],
      'Mercedes-Benz': ['Sprinter', 'Vito'],
      'Renault': ['Master', 'Trafic'],
      'Fiat': ['Ducato', 'Doblo'],
      'Peugeot': ['Boxer', 'Partner'],
      'Citroen': ['Jumper', 'Berlingo'],
      'Iveco': ['Daily']
    },
    'Kamyon': {
      'Mercedes-Benz': ['Actros', 'Arocs', 'Atego'],
      'Volvo': ['FH', 'FM', 'FMX'],
      'Scania': ['R', 'G', 'S'],
      'MAN': ['TGX', 'TGS', 'TGM'],
      'DAF': ['XF', 'CF', 'LF'],
      'Iveco': ['Hi-Way', 'Hi-Land', 'Hi-Road'],
      'Renault': ['T', 'C', 'K'],
      'Isuzu': ['Forward', 'Giga', 'Elios']
    },
    'TIR': {
      'Mercedes-Benz': ['Actros', 'Arocs'],
      'Volvo': ['FH16', 'FH'],
      'Scania': ['R730', 'R450'],
      'MAN': ['TGX', 'TGS'],
      'DAF': ['XF', 'CF'],
      'Iveco': ['Hi-Way', 'Hi-Road'],
      'Renault': ['T', 'C'],
      'Isuzu': ['Giga']
    }
  }

  // Belge yükleme için state
  const [newDocument, setNewDocument] = useState({
    type: '',
    validUntil: '',
    file: null
  })

  // Belge tipleri
  const documentTypes = [
    { id: 'registration', name: 'Ruhsat' },
    { id: 'inspection', name: 'Muayene Belgesi' },
    { id: 'insurance', name: 'Sigorta Poliçesi' },
    { id: 'comprehensive', name: 'Kasko Poliçesi' }
  ]

  // Araç verilerini API'den çekme
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('userData')
        
        if (!token || !userData) {
          router.push('/admin')
          return
        }

        const user = JSON.parse(userData)
        const allowedRoles = ['admin', 'super_admin', 'editor', 'support']
        const hasAllowedRole = user.roles?.some(role => allowedRoles.includes(role)) || allowedRoles.includes(user.role)
        
        if (!hasAllowedRole) {
          router.push('/admin/dashboard')
          return
        }
        
        const response = await axios.get('/api/admin/vehicles', {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            search: searchTerm,
            page: currentPage,
            limit: 10,
            status: selectedTab === 'all' ? '' : selectedTab
          }
        })
        
        if (response.data && response.data.vehicles) {
          setVehicles(response.data.vehicles)
          setAllVehicles(response.data.vehicles)
        }
      } catch (error) {
        console.error('Araçlar yüklenirken hata:', error)
        setError('Araç verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchVehicles()
  }, [currentPage, searchTerm, selectedTab])

  const tabs = [
    { id: 'all', name: 'Tüm Araçlar' },
    { id: 'active', name: 'Aktif' },
    { id: 'passive', name: 'Pasif' },
    { id: 'maintenance', name: 'Bakımda' },
    { id: 'documents', name: 'Süresi Dolmuş Belge' }
  ]

  // Durum renkleri
  const getStatusColor = (status) => {
    switch(status) {
      case 'Aktif':
        return 'bg-green-100 text-green-800'
      case 'Pasif':
        return 'bg-red-100 text-red-800'
      case 'Bakımda':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Belge yükleme fonksiyonu
  const handleDocumentUpload = async (vehicleId) => {
    try {
      const formData = new FormData()
      formData.append('type', newDocument.type)
      formData.append('validUntil', newDocument.validUntil)
      formData.append('file', newDocument.file)

      const token = localStorage.getItem('token')
      const response = await axios.post(`/api/admin/vehicles/${vehicleId}/documents`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        // Belge listesini güncelle
        const updatedVehicles = vehicles.map(vehicle => {
          if (vehicle.id === vehicleId) {
            return {
              ...vehicle,
              documents: [...(vehicle.documents || []), response.data.document]
            }
          }
          return vehicle
        })
        setVehicles(updatedVehicles)
        setNewDocument({ type: '', validUntil: '', file: null })
      }
    } catch (error) {
      console.error('Belge yükleme hatası:', error)
    }
  }

  // Belge silme fonksiyonu
  const handleDocumentDelete = async (vehicleId, documentId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.delete(`/api/admin/vehicles/${vehicleId}/documents/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.data.success) {
        // Belge listesini güncelle
        const updatedVehicles = vehicles.map(vehicle => {
          if (vehicle.id === vehicleId) {
            return {
              ...vehicle,
              documents: vehicle.documents.filter(doc => doc.id !== documentId)
            }
          }
          return vehicle
        })
        setVehicles(updatedVehicles)
      }
    } catch (error) {
      console.error('Belge silme hatası:', error)
    }
  }

  return (
    <AdminLayout title="Araç Yönetimi">
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
            onClick={() => setShowAddVehicleModal(true)}
          >
            <FaPlus className="mr-2" />
            <span>Yeni Araç</span>
          </button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Toplam Araç */}
        <div 
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedTab('all')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Araç</p>
              <p className="text-2xl font-semibold text-gray-900">{allVehicles.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaTruck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Aktif Araçlar */}
        <div 
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedTab('active')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aktif Araçlar</p>
              <p className="text-2xl font-semibold text-green-600">
                {allVehicles.filter(v => v.status === 'Aktif').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaTruck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Bakımdaki Araçlar */}
        <div 
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedTab('maintenance')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bakımdaki Araçlar</p>
              <p className="text-2xl font-semibold text-yellow-600">
                {allVehicles.filter(v => v.status === 'Bakımda').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaTruck className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Belgesi Eksik */}
        <div 
          className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setSelectedTab('documents')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Belgesi Eksik</p>
              <p className="text-2xl font-semibold text-red-600">
                {allVehicles.filter(v => v.hasExpiredDocuments).length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <FaFileAlt className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <FaExclamationCircle className="mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Yükleniyor */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-8 mb-8 flex justify-center items-center">
          <FaSpinner className="text-orange-600 text-2xl animate-spin mr-3" />
          <p className="text-gray-700">Araçlar yükleniyor...</p>
        </div>
      )}

      {/* Araç Tablosu */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Araç Bilgileri</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teknik Bilgiler</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taşıma</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <FaTruck className="text-gray-600 w-6 h-6" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{vehicle.plate}</div>
                          <div className="text-sm text-gray-500">{vehicle.brand} {vehicle.model}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Model Yılı: {vehicle.modelYear}</div>
                      <div className="text-sm text-gray-500">Kapasite: {vehicle.capacity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status}
                      </span>
                      {vehicle.hasExpiredDocuments && (
                        <div className="mt-1">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Süresi Dolmuş Belge
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span>{vehicle.activeShipments || 0} Aktif</span>
                        <span className="text-gray-400">{vehicle.completedShipments || 0} Tamamlanan</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-900 transition-colors" 
                          onClick={() => setShowVehicleDetailModal(vehicle)}
                          title="Detaylar"
                        >
                          <FaEye className="w-5 h-5" />
                        </button>
                        <button 
                          className="text-orange-600 hover:text-orange-900 transition-colors" 
                          onClick={() => setShowEditVehicleModal(vehicle)}
                          title="Düzenle"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 transition-colors" 
                          onClick={() => setShowDeleteConfirm(vehicle)}
                          title="Sil"
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {vehicles.length === 0 && !loading && (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">Kriterlere uygun araç bulunamadı.</p>
            </div>
          )}
        </div>
      )}

      {/* Yeni Araç Ekleme Modal */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Yeni Araç Ekle</h3>
              <button 
                onClick={() => setShowAddVehicleModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Araç Bilgileri */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-4">Araç Bilgileri</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plaka <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newVehicleData.plate}
                        onChange={(e) => setNewVehicleData({...newVehicleData, plate: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Araç Tipi <span className="text-red-500">*</span>
                      </label>
                      <select 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newVehicleData.vehicleType}
                        onChange={(e) => setNewVehicleData({
                          ...newVehicleData, 
                          vehicleType: e.target.value,
                          brand: '',
                          model: ''
                        })}
                        required
                      >
                        <option value="">Seçiniz</option>
                        {Object.keys(vehicleBrands).map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marka <span className="text-red-500">*</span>
                      </label>
                      <select 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newVehicleData.brand}
                        onChange={(e) => setNewVehicleData({
                          ...newVehicleData, 
                          brand: e.target.value,
                          model: ''
                        })}
                        required
                        disabled={!newVehicleData.vehicleType}
                      >
                        <option value="">Seçiniz</option>
                        {newVehicleData.vehicleType && Object.keys(vehicleBrands[newVehicleData.vehicleType]).map(brand => (
                          <option key={brand} value={brand}>{brand}</option>
                        ))}
                        <option value="other">Diğer</option>
                      </select>
                    </div>
                    {newVehicleData.brand === 'other' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Marka Adı <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          value={newVehicleData.customBrand || ''}
                          onChange={(e) => setNewVehicleData({
                            ...newVehicleData, 
                            customBrand: e.target.value
                          })}
                          required
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model <span className="text-red-500">*</span>
                      </label>
                      <select 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newVehicleData.model}
                        onChange={(e) => setNewVehicleData({...newVehicleData, model: e.target.value})}
                        required
                        disabled={!newVehicleData.brand || newVehicleData.brand === 'other'}
                      >
                        <option value="">Seçiniz</option>
                        {newVehicleData.brand && newVehicleData.brand !== 'other' && vehicleBrands[newVehicleData.vehicleType][newVehicleData.brand].map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                        <option value="other">Diğer</option>
                      </select>
                    </div>
                    {newVehicleData.model === 'other' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Model Adı <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                          value={newVehicleData.customModel || ''}
                          onChange={(e) => setNewVehicleData({
                            ...newVehicleData, 
                            customModel: e.target.value
                          })}
                          required
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Model Yılı <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="number" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newVehicleData.modelYear}
                        onChange={(e) => setNewVehicleData({...newVehicleData, modelYear: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Teknik Bilgiler */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-4">Teknik Bilgiler</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Şasi Numarası
                      </label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newVehicleData.chassisNumber}
                        onChange={(e) => setNewVehicleData({...newVehicleData, chassisNumber: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kapasite <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newVehicleData.capacity}
                        onChange={(e) => setNewVehicleData({...newVehicleData, capacity: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Yakıt Tipi
                      </label>
                      <select 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newVehicleData.fuelType}
                        onChange={(e) => setNewVehicleData({...newVehicleData, fuelType: e.target.value})}
                      >
                        <option value="">Seçiniz</option>
                        <option value="Dizel">Dizel</option>
                        <option value="Benzin">Benzin</option>
                        <option value="LPG">LPG</option>
                        <option value="Elektrik">Elektrik</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notlar
                      </label>
                      <textarea 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newVehicleData.notes}
                        onChange={(e) => setNewVehicleData({...newVehicleData, notes: e.target.value})}
                        rows={3}
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="bg-orange-50 p-4 rounded-lg mb-6">
                  <p className="text-sm text-orange-800">
                    <strong>Not:</strong> Araç kaydı oluşturulduktan sonra aşağıdaki belgeleri yüklemeniz gerekmektedir:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-sm text-orange-800">
                    <li>Ruhsat *</li>
                    <li>Muayene Belgesi *</li>
                    <li>Sigorta Poliçesi *</li>
                    <li>Kasko Poliçesi</li>
                  </ul>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={() => setShowAddVehicleModal(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded"
                  >
                    İptal
                  </button>
                  <button 
                    onClick={() => setShowVehicleDocumentsModal({ id: 'new', plate: newVehicleData.plate })}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded flex items-center"
                  >
                    <FaFileAlt className="mr-2" /> Belgeler
                  </button>
                  <button 
                    className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded"
                    disabled={!newVehicleData.plate || !newVehicleData.brand || !newVehicleData.model || !newVehicleData.modelYear || !newVehicleData.capacity}
                  >
                    Araç Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Belge Yönetimi Modal */}
      {showVehicleDocumentsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Belge Yönetimi</h3>
              <button 
                onClick={() => setShowVehicleDocumentsModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Yeni Belge Yükleme */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-4">Yeni Belge Yükle</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Belge Tipi <span className="text-red-500">*</span>
                      </label>
                      <select 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newDocument.type}
                        onChange={(e) => setNewDocument({...newDocument, type: e.target.value})}
                        required
                      >
                        <option value="">Seçiniz</option>
                        {documentTypes.map(type => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Geçerlilik Tarihi <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="date" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={newDocument.validUntil}
                        onChange={(e) => setNewDocument({...newDocument, validUntil: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Belge Dosyası <span className="text-red-500">*</span>
                      </label>
                      <input 
                        type="file" 
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        onChange={(e) => setNewDocument({...newDocument, file: e.target.files[0]})}
                        accept=".pdf,.jpg,.jpeg,.png"
                        required
                      />
                    </div>
                    <button 
                      className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700"
                      onClick={() => handleDocumentUpload(showVehicleDocumentsModal.id)}
                    >
                      Belge Yükle
                    </button>
                  </div>
                </div>

                {/* Mevcut Belgeler */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-4">Mevcut Belgeler</h4>
                  <div className="space-y-4">
                    {showVehicleDocumentsModal.documents && showVehicleDocumentsModal.documents.length > 0 ? (
                      showVehicleDocumentsModal.documents.map(doc => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{documentTypes.find(t => t.id === doc.type)?.name}</p>
                            <p className="text-sm text-gray-500">Geçerlilik: {new Date(doc.validUntil).toLocaleDateString('tr-TR')}</p>
                          </div>
                          <div className="flex space-x-2">
                            <button 
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => window.open(doc.url, '_blank')}
                            >
                              <FaEye />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDocumentDelete(showVehicleDocumentsModal.id, doc.id)}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">Henüz belge yüklenmemiş.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
} 
