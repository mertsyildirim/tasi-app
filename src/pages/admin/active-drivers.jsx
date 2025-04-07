'use client'

import React, { useState } from 'react'
import { FaPlus, FaSearch, FaEdit, FaTrash, FaMapMarkerAlt, FaPhone, FaEnvelope, FaTruck } from 'react-icons/fa'
import AdminLayout from '../../components/admin/Layout'

export default function ActiveDriversPage() {
  const [searchTerm, setSearchTerm] = useState('')

  // Örnek aktif sürücü verileri
  const activeDrivers = [
    { id: 1, name: 'Mehmet Kaya', phone: '0555 123 4567', email: 'mehmet@example.com', vehicleType: 'Kamyon', licensePlate: '34 ABC 123', status: 'Aktif', location: 'İstanbul, Kadıköy', lastActive: '5 dakika önce', company: 'Kaya Nakliyat' },
    { id: 2, name: 'Fatma Çelik', phone: '0532 456 7890', email: 'fatma@example.com', vehicleType: 'Kamyonet', licensePlate: '06 XYZ 789', status: 'Taşıma sırasında', location: 'Ankara, Çankaya', lastActive: '10 dakika önce', company: 'Çelik Taşımacılık' },
    { id: 3, name: 'Ahmet Demir', phone: '0533 789 0123', email: 'ahmet@example.com', vehicleType: 'Tır', licensePlate: '35 DEF 456', status: 'Aktif', location: 'İzmir, Konak', lastActive: '15 dakika önce', company: 'Demir Lojistik' },
    { id: 4, name: 'Ayşe Yılmaz', phone: '0542 345 6789', email: 'ayse@example.com', vehicleType: 'Kamyon', licensePlate: '34 KLM 789', status: 'Taşıma sırasında', location: 'İstanbul, Beşiktaş', lastActive: '20 dakika önce', company: 'Yılmaz Nakliyat' },
    { id: 5, name: 'Hasan Öztürk', phone: '0535 678 9012', email: 'hasan@example.com', vehicleType: 'Tır', licensePlate: '16 NOP 012', status: 'Aktif', location: 'Bursa, Nilüfer', lastActive: '30 dakika önce', company: 'Öztürk Lojistik' },
    { id: 6, name: 'Zeynep Koç', phone: '0539 012 3456', email: 'zeynep@example.com', vehicleType: 'Kamyonet', licensePlate: '01 QRS 345', status: 'Taşıma sırasında', location: 'Adana, Seyhan', lastActive: '45 dakika önce', company: 'Koç Taşımacılık' },
    { id: 7, name: 'Mustafa Şahin', phone: '0536 234 5678', email: 'mustafa@example.com', vehicleType: 'Kamyon', licensePlate: '07 TUV 678', status: 'Aktif', location: 'Antalya, Muratpaşa', lastActive: '1 saat önce', company: 'Şahin Nakliyat' },
    { id: 8, name: 'Esra Aydın', phone: '0534 567 8901', email: 'esra@example.com', vehicleType: 'Tır', licensePlate: '42 WXY 901', status: 'Aktif', location: 'Konya, Selçuklu', lastActive: '1.5 saat önce', company: 'Aydın Lojistik' },
  ]

  // Durum renk sınıfları
  const getStatusColor = (status) => {
    switch(status) {
      case 'Aktif':
        return 'bg-green-100 text-green-800'
      case 'Taşıma sırasında':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Arama filtreleme
  const filteredDrivers = activeDrivers.filter(driver => {
    if (searchTerm === '') return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      driver.name.toLowerCase().includes(searchLower) ||
      driver.location.toLowerCase().includes(searchLower) ||
      driver.company.toLowerCase().includes(searchLower) ||
      driver.vehicleType.toLowerCase().includes(searchLower) ||
      driver.licensePlate.toLowerCase().includes(searchLower)
    )
  })

  return (
    <AdminLayout title="Aktif Sürücüler">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-lg font-medium">Aktif Sürücü Listesi</h1>
          <p className="text-gray-500 text-sm mt-1">Sistemde anlık olarak aktif olan tüm sürücüleri görüntüle ve takip et</p>
        </div>
        <div className="flex flex-col w-full md:flex-row md:w-auto gap-4">
          <div className="relative w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Sürücü ara..." 
              className="pl-10 pr-4 py-2 w-full md:min-w-[250px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2">
            <FaPlus />
            <span>Yeni Sürücü</span>
          </button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <FaTruck className="text-green-600" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Toplam Aktif Sürücü</h3>
              <p className="text-2xl font-bold">{activeDrivers.filter(d => d.status === 'Aktif').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <FaTruck className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Taşıma Yapan Sürücü</h3>
              <p className="text-2xl font-bold">{activeDrivers.filter(d => d.status === 'Taşıma sırasında').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-full mr-4">
              <FaTruck className="text-orange-600" />
            </div>
            <div>
              <h3 className="text-gray-500 text-sm">Tüm Araçlar</h3>
              <p className="text-2xl font-bold">{activeDrivers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sürücü Haritası */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold">Sürücü Konumları</h3>
        </div>
        <div className="h-64 bg-gray-100 p-4 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <FaMapMarkerAlt className="mx-auto mb-2 text-orange-500 h-8 w-8" />
            <p>Burada gerçek bir harita gösterimi olacak</p>
            <p className="text-sm">Gerçek harita entegrasyonu için Google Maps API gerekli</p>
          </div>
        </div>
      </div>

      {/* Sürücü Listesi */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sürücü</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İletişim</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Araç</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Konum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Son Aktivite</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                        {driver.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                        <div className="text-sm text-gray-500">{driver.company}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <FaPhone className="mr-2 text-gray-500" /> {driver.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FaEnvelope className="mr-2 text-gray-500" /> {driver.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{driver.vehicleType}</div>
                    <div className="text-sm text-gray-500">{driver.licensePlate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(driver.status)}`}>
                      {driver.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{driver.lastActive}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button className="text-orange-600 hover:text-orange-900 transition-colors" title="Takip Et">
                        <FaMapMarkerAlt className="w-5 h-5" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900 transition-colors" title="Düzenle">
                        <FaEdit className="w-5 h-5" />
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
            Toplam <span className="font-medium">{filteredDrivers.length}</span> aktif sürücü
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
    </AdminLayout>
  )
} 