'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { FaUser, FaPen, FaCheck, FaTimes } from 'react-icons/fa'
import { getUserFromStorage, saveUserToStorage } from '../utils/auth'

export default function ProfilePage() {
  const router = useRouter()
  const inputRefs = {
    fullName: useRef<HTMLInputElement>(null),
    companyName: useRef<HTMLInputElement>(null),
    authorizedName: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null)
  }
  const [user, setUser] = useState<any>(null)
  const [editMode, setEditMode] = useState({
    fullName: false,
    companyName: false,
    authorizedName: false,
    email: false,
    phone: false
  })

  const [editValues, setEditValues] = useState({
    fullName: '',
    companyName: '',
    authorizedName: '',
    email: '',
    phone: '',
    verificationCode: '',
    newAddress: {
      title: '',
      address: '',
      city: '',
      district: ''
    }
  })

  const [verificationState, setVerificationState] = useState({
    isVerifying: false,
    field: null as string | null,
    newValue: '',
    timer: 0
  })

  const [showAddressForm, setShowAddressForm] = useState(false)

  useEffect(() => {
    const userData = getUserFromStorage()
    if (!userData) {
      router.push('/giris')
      return
    }
    setUser(userData)
    setEditValues({
      fullName: userData.fullName || '',
      companyName: userData.companyName || '',
      authorizedName: userData.authorizedName || '',
      email: userData.email || '',
      phone: userData.phone || '',
      verificationCode: '',
      newAddress: {
        title: '',
        address: '',
        city: '',
        district: ''
      }
    })

    // Kullanıcı bilgileri değiştiğinde güncelle
    const handleUserDataChange = (event: Event) => {
      const customEvent = event as CustomEvent<any>
      setUser(customEvent.detail)
    }

    window.addEventListener('userDataChanged', handleUserDataChange)

    return () => {
      window.removeEventListener('userDataChanged', handleUserDataChange)
    }
  }, [router])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (verificationState.timer > 0) {
      interval = setInterval(() => {
        setVerificationState(prev => ({
          ...prev,
          timer: prev.timer - 1
        }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [verificationState.timer])

  const handleEdit = (field: string) => {
    setEditMode({ ...editMode, [field]: true })
    setEditValues({
      ...editValues,
      [field]: user[field] || ''
    })
    // Input'a odaklanma ve cursor'ı sona konumlandırma
    setTimeout(() => {
      const input = document.querySelector(`input[name="${field}"]`)
      if (input && input instanceof HTMLInputElement) {
        input.focus()
        const length = input.value.length
        input.setSelectionRange(length, length)
      }
    }, 100)
  }

  const handleSave = async (field: string) => {
    // E-posta veya telefon değişikliği için doğrulama gerekiyor
    if ((field === 'email' || field === 'phone') && editValues[field] !== user[field]) {
      setVerificationState({
        isVerifying: true,
        field,
        newValue: editValues[field],
        timer: 120 // 2 dakika
      })
      // Burada backend'e doğrulama kodu gönderme isteği yapılacak
      // Şimdilik mock bir istek yapıyoruz
      console.log(`Doğrulama kodu gönderiliyor: ${field}`)
      return
    }

    const newUser = { ...user, [field]: editValues[field] }
    saveUserToStorage(newUser, true)
    setUser(newUser)
    setEditMode({ ...editMode, [field]: false })
  }

  const handleCancel = (field: string) => {
    setEditMode({ ...editMode, [field]: false })
    setEditValues({ ...editValues, [field]: user[field] || '' })
    if (verificationState.field === field) {
      setVerificationState({
        isVerifying: false,
        field: null,
        newValue: '',
        timer: 0
      })
    }
  }

  const handleVerificationSubmit = async (field: string) => {
    // Burada backend'e doğrulama kodunu kontrol etme isteği yapılacak
    // Şimdilik mock bir kontrol yapıyoruz
    if (editValues.verificationCode === '123456') {
      const newUser = { ...user, [field]: verificationState.newValue }
      saveUserToStorage(newUser, true)
      setUser(newUser)
      setEditMode({ ...editMode, [field]: false })
      setVerificationState({
        isVerifying: false,
        field: null,
        newValue: '',
        timer: 0
      })
      setEditValues({ ...editValues, verificationCode: '' })
    } else {
      alert('Geçersiz doğrulama kodu!')
    }
  }

  const handleResendCode = () => {
    // Burada backend'e yeni kod gönderme isteği yapılacak
    setVerificationState(prev => ({
      ...prev,
      timer: 120
    }))
    console.log('Yeni kod gönderiliyor...')
  }

  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const renderVerificationSection = (field: string) => {
    if (verificationState.isVerifying && verificationState.field === field) {
      return (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-gray-600">
            {field === 'email' ? 'E-posta adresinize' : 'Telefon numaranıza'} gönderilen 6 haneli doğrulama kodunu giriniz
          </p>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              maxLength={6}
              value={editValues.verificationCode}
              onChange={(e) => setEditValues({ ...editValues, verificationCode: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 w-32"
              placeholder="123456"
            />
            <button
              onClick={() => handleVerificationSubmit(field)}
              className="px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"
            >
              Onayla
            </button>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-500">
              {verificationState.timer > 0 ? (
                <>Kalan süre: {formatTimer(verificationState.timer)}</>
              ) : (
                'Kod expired oldu'
              )}
            </span>
            {verificationState.timer === 0 && (
              <button
                onClick={handleResendCode}
                className="text-orange-500 hover:text-orange-600"
              >
                Yeni kod gönder
              </button>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  const handleAddAddress = () => {
    if (!editValues.newAddress.title || !editValues.newAddress.address || !editValues.newAddress.city || !editValues.newAddress.district) {
      alert('Lütfen tüm adres alanlarını doldurun')
      return
    }

    const newUser = {
      ...user,
      addresses: [...(user.addresses || []), editValues.newAddress]
    }
    saveUserToStorage(newUser, true)
    setUser(newUser)
    setShowAddressForm(false)
    setEditValues({
      ...editValues,
      newAddress: {
        title: '',
        address: '',
        city: '',
        district: ''
      }
    })
  }

  const handleDeleteAddress = (index: number) => {
    const newAddresses = [...(user.addresses || [])]
    newAddresses.splice(index, 1)
    const newUser = { ...user, addresses: newAddresses }
    saveUserToStorage(newUser, true)
    setUser(newUser)
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-2xl shadow-xl p-10">
          {/* Profil Başlığı */}
          <div className="flex items-center mb-10">
            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center">
              <FaUser className="text-white w-10 h-10" />
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-gray-800">
                {user.type === 'individual' ? user.fullName : user.companyName}
              </h1>
              <p className="text-gray-500">Müşteri</p>
            </div>
          </div>

          {/* Profil Bilgileri */}
          <div className="space-y-6">
            {user.type === 'individual' ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Ad Soyad</p>
                  {editMode.fullName ? (
                    <div className="flex items-center space-x-2">
                      <input
                        name="fullName"
                        type="text"
                        value={editValues.fullName}
                        onChange={(e) => setEditValues({ ...editValues, fullName: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        onClick={() => handleSave('fullName')}
                        className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                      >
                        <FaCheck className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCancel('fullName')}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        <FaTimes className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <p className="text-gray-700">{user.fullName}</p>
                      <button
                        onClick={() => handleEdit('fullName')}
                        className="ml-2 text-orange-500 hover:text-orange-600"
                      >
                        <FaPen className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Şirket Adı</p>
                    {editMode.companyName ? (
                      <div className="flex items-center space-x-2">
                        <input
                          name="companyName"
                          type="text"
                          value={editValues.companyName}
                          onChange={(e) => setEditValues({ ...editValues, companyName: e.target.value })}
                          className="border border-gray-300 rounded-lg px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <button
                          onClick={() => handleSave('companyName')}
                          className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                        >
                          <FaCheck className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCancel('companyName')}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          <FaTimes className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <p className="text-gray-700">{user.companyName}</p>
                        <button
                          onClick={() => handleEdit('companyName')}
                          className="ml-2 text-orange-500 hover:text-orange-600"
                        >
                          <FaPen className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Yetkili Adı</p>
                    {editMode.authorizedName ? (
                      <div className="flex items-center space-x-2">
                        <input
                          name="authorizedName"
                          type="text"
                          value={editValues.authorizedName}
                          onChange={(e) => setEditValues({ ...editValues, authorizedName: e.target.value })}
                          className="border border-gray-300 rounded-lg px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <button
                          onClick={() => handleSave('authorizedName')}
                          className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                        >
                          <FaCheck className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleCancel('authorizedName')}
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          <FaTimes className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <p className="text-gray-700">{user.authorizedName}</p>
                        <button
                          onClick={() => handleEdit('authorizedName')}
                          className="ml-2 text-orange-500 hover:text-orange-600"
                        >
                          <FaPen className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">E-posta</p>
                {editMode.email ? (
                  <div>
                    <div className="flex items-center space-x-2">
                      <input
                        name="email"
                        type="email"
                        value={editValues.email}
                        onChange={(e) => setEditValues({ ...editValues, email: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        onClick={() => handleSave('email')}
                        className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                      >
                        <FaCheck className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCancel('email')}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        <FaTimes className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {renderVerificationSection('email')}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <p className="text-gray-700">{user.email}</p>
                    <button
                      onClick={() => handleEdit('email')}
                      className="ml-2 text-orange-500 hover:text-orange-600"
                    >
                      <FaPen className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Telefon</p>
                {editMode.phone ? (
                  <div>
                    <div className="flex items-center space-x-2">
                      <input
                        name="phone"
                        type="tel"
                        value={editValues.phone}
                        onChange={(e) => setEditValues({ ...editValues, phone: e.target.value })}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <button
                        onClick={() => handleSave('phone')}
                        className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"
                      >
                        <FaCheck className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCancel('phone')}
                        className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        <FaTimes className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {renderVerificationSection('phone')}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <p className="text-gray-700">{user.phone}</p>
                    <button
                      onClick={() => handleEdit('phone')}
                      className="ml-2 text-orange-500 hover:text-orange-600"
                    >
                      <FaPen className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Adresler */}
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Adreslerim</h2>
              <button
                onClick={() => setShowAddressForm(true)}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm flex items-center"
              >
                <span>Yeni Adres Ekle</span>
              </button>
            </div>

            {showAddressForm && (
              <div className="bg-orange-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Yeni Adres</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Adres Başlığı</label>
                    <input
                      type="text"
                      value={editValues.newAddress.title}
                      onChange={(e) => setEditValues({
                        ...editValues,
                        newAddress: { ...editValues.newAddress, title: e.target.value }
                      })}
                      placeholder="Örn: Ev, İş"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">İl</label>
                    <input
                      type="text"
                      value={editValues.newAddress.city}
                      onChange={(e) => setEditValues({
                        ...editValues,
                        newAddress: { ...editValues.newAddress, city: e.target.value }
                      })}
                      placeholder="İl seçin"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">İlçe</label>
                    <input
                      type="text"
                      value={editValues.newAddress.district}
                      onChange={(e) => setEditValues({
                        ...editValues,
                        newAddress: { ...editValues.newAddress, district: e.target.value }
                      })}
                      placeholder="İlçe seçin"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Açık Adres</label>
                    <textarea
                      value={editValues.newAddress.address}
                      onChange={(e) => setEditValues({
                        ...editValues,
                        newAddress: { ...editValues.newAddress, address: e.target.value }
                      })}
                      placeholder="Açık adresinizi yazın"
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => setShowAddressForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleAddAddress}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    Kaydet
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.addresses?.map((address: any, index: number) => (
                <div key={index} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">{address.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{address.city} / {address.district}</p>
                      <p className="text-gray-600 text-sm mt-2">{address.address}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteAddress(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {(!user.addresses || user.addresses.length === 0) && !showAddressForm && (
              <div className="bg-gray-50 rounded-xl p-4 text-gray-500 text-center">
                Henüz bir adres eklenmemiş
              </div>
            )}
          </div>

          {/* Son İşlemler */}
          <div className="mt-16">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Son Taşımalarım</h2>
            <div className="bg-gray-50 rounded-xl p-4 text-gray-500 text-center">
              Henüz bir transfer işlemi bulunmuyor.
            </div>
          </div>

          {/* Hızlı İşlemler */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Hızlı İşlemler</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-white border border-orange-200 rounded-xl p-4 text-center hover:bg-orange-50 transition-colors">
                <span className="block text-orange-500 font-medium">Yeni Transfer Talebi</span>
                <span className="text-sm text-gray-500">Hemen taşıma işlemi başlatın</span>
              </button>
              <button className="bg-white border border-orange-200 rounded-xl p-4 text-center hover:bg-orange-50 transition-colors">
                <span className="block text-orange-500 font-medium">Fiyat Hesapla</span>
                <span className="text-sm text-gray-500">Taşıma ücretini öğrenin</span>
              </button>
              <button className="bg-white border border-orange-200 rounded-xl p-4 text-center hover:bg-orange-50 transition-colors">
                <span className="block text-orange-500 font-medium">Destek Talebi</span>
                <span className="text-sm text-gray-500">Sorularınızı yanıtlayalım</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 