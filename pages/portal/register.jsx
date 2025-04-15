import React, { useState } from 'react';
import { FaTruck, FaBuilding, FaIdCard, FaPhone, FaEnvelope, FaLock, FaCheck } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: '',
    taxNumber: '',
    taxOffice: '',
    address: '',
    city: '',
    district: '',
    contactPerson: {
      firstName: '',
      lastName: '',
    },
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    vehicleTypes: [],
    serviceAreas: [],
    documents: {
      taxCertificate: null,
      companyRegistration: null,
      driverLicense: null
    },
    documentLater: false
  });
  
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const cities = [
    'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 
    'Konya', 'Gaziantep', 'Şanlıurfa', 'Kocaeli', 'Mersin'
  ];

  const vehicleTypes = [
    { id: 'panel_van', name: 'Panel Van' },
    { id: 'light_commercial', name: 'Hafif Ticari' },
    { id: 'truck', name: 'Kamyon' },
    { id: 'truck_with_trailer', name: 'Kamyon + Dorse' },
    { id: 'cold_chain', name: 'Soğuk Zincir' },
    { id: 'heavy_equipment', name: 'Ağır Nakliye' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Nested properties için
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (type === 'checkbox') {
      if (name === 'agreeToTerms') {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      } else {
        // Checkbox grupları için (vehicleTypes ve serviceAreas)
        const array = name.startsWith('vehicle') ? 'vehicleTypes' : 'serviceAreas';
        if (checked) {
          setFormData(prev => ({
            ...prev,
            [array]: [...prev[array], value]
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            [array]: prev[array].filter(item => item !== value)
          }));
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Hata varsa temizle
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!formData.companyName.trim()) newErrors.companyName = 'Şirket adı gerekli';
      if (!formData.taxNumber.trim()) newErrors.taxNumber = 'Vergi numarası gerekli';
      if (formData.taxNumber.trim() && !/^\d{10}$/.test(formData.taxNumber.trim())) 
        newErrors.taxNumber = 'Vergi numarası 10 haneli olmalıdır';
      if (!formData.taxOffice.trim()) newErrors.taxOffice = 'Vergi dairesi gerekli';
      if (!formData.address.trim()) newErrors.address = 'Adres gerekli';
      if (!formData.city) newErrors.city = 'Şehir seçimi gerekli';
    }
    
    if (currentStep === 2) {
      if (!formData.contactPerson.firstName.trim()) newErrors['contactPerson.firstName'] = 'Ad gerekli';
      if (!formData.contactPerson.lastName.trim()) newErrors['contactPerson.lastName'] = 'Soyad gerekli';
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Telefon numarası gerekli';
      if (formData.phoneNumber.trim() && !/^\d{10}$/.test(formData.phoneNumber.trim().replace(/\s/g, ''))) 
        newErrors.phoneNumber = 'Geçerli bir telefon numarası girin';
      if (!formData.email.trim()) newErrors.email = 'E-posta gerekli';
      if (formData.email.trim() && !/^\S+@\S+\.\S+$/.test(formData.email.trim())) 
        newErrors.email = 'Geçerli bir e-posta adresi girin';
    }
    
    if (currentStep === 3) {
      if (!formData.password.trim()) newErrors.password = 'Şifre gerekli';
      if (formData.password.trim() && formData.password.length < 6) 
        newErrors.password = 'Şifre en az 6 karakter olmalı';
      if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Şifre tekrarı gerekli';
      if (formData.password !== formData.confirmPassword) 
        newErrors.confirmPassword = 'Şifreler eşleşmiyor';
      if (formData.vehicleTypes.length === 0) 
        newErrors.vehicleTypes = 'En az bir araç türü seçin';
    }
    
    if (currentStep === 4) {
      if (!formData.agreeToTerms) 
        newErrors.agreeToTerms = 'Kullanım koşullarını kabul etmelisiniz';
      if (!formData.documentLater && !formData.documents.taxCertificate)
        newErrors['documents.taxCertificate'] = 'Vergi levhası gerekli';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateStep(step)) {
      // Formu gönder
      console.log('Form gönderiliyor:', formData);
      
      // Kayıt işlemi simülasyonu
      setSuccess(true);
      
      // Kullanıcı statüsünü belirle
      const userStatus = formData.documentLater ? 'WAITING_DOCUMENTS' : 'WAITING_APPROVAL';
      console.log('Kullanıcı statüsü:', userStatus);
      
      // Gerçek API çağrısı burada yapılacak
      // API entegrasyonu
      setTimeout(() => {
        router.push('/portal/register-success');
      }, 2000);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <FaCheck className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-3 text-lg font-medium text-gray-900">Kayıt Başarılı!</h2>
            <p className="mt-2 text-sm text-gray-500">
              Taşıyıcı hesabınız oluşturuldu. Verdiğiniz bilgiler incelendikten sonra hesabınız aktifleştirilecektir.
            </p>
            <div className="mt-5">
              <Link 
                href="/portal/login" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Giriş Sayfasına Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Taşıyıcı Kayıt | Taşı.app</title>
        <meta name="description" content="Taşı.app taşıyıcı kayıt sayfası" />
      </Head>
      
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center rounded-md mb-2">
            <img src="/portal_logo.png" alt="Taşı Portal" className="h-16" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 text-center">
            Taşıyıcı Kayıt
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Taşıapp.com taşıyıcı ağına katılın, müşterilere hizmet verin, kazanın
          </p>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Progress */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${(step/4)*100}%` }}></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <div className={step >= 1 ? 'text-orange-600 font-medium' : ''}>Şirket Bilgileri</div>
              <div className={step >= 2 ? 'text-orange-600 font-medium' : ''}>İletişim Bilgileri</div>
              <div className={step >= 3 ? 'text-orange-600 font-medium' : ''}>Hesap Bilgileri</div>
              <div className={step >= 4 ? 'text-orange-600 font-medium' : ''}>Belgeler</div>
            </div>
          </div>
          
          <form onSubmit={step === 4 ? handleSubmit : undefined} className="p-6">
            {/* Form İçeriği */}
            {step === 1 && (
              <div className="space-y-5">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Şirket Bilgileri</h3>
                
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Şirket Adı</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaBuilding className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      className={`pl-10 block w-full shadow-sm sm:text-sm rounded-md py-3 border-2 ${errors.companyName ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
                      value={formData.companyName}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="taxNumber" className="block text-sm font-medium text-gray-700">Vergi Numarası</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaIdCard className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="taxNumber"
                        name="taxNumber"
                        className={`pl-10 block w-full shadow-sm sm:text-sm rounded-md py-3 border-2 ${errors.taxNumber ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
                        value={formData.taxNumber}
                        onChange={handleChange}
                        maxLength={10}
                      />
                    </div>
                    {errors.taxNumber && <p className="mt-1 text-sm text-red-600">{errors.taxNumber}</p>}
                  </div>

                  <div>
                    <label htmlFor="taxOffice" className="block text-sm font-medium text-gray-700">Vergi Dairesi</label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="taxOffice"
                        name="taxOffice"
                        className={`block w-full shadow-sm sm:text-sm rounded-md py-3 border-2 ${errors.taxOffice ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
                        value={formData.taxOffice}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.taxOffice && <p className="mt-1 text-sm text-red-600">{errors.taxOffice}</p>}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adres</label>
                  <div className="mt-1">
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      className={`block w-full shadow-sm sm:text-sm rounded-md py-3 border-2 ${errors.address ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">Şehir</label>
                    <select
                      id="city"
                      name="city"
                      className={`mt-1 block w-full py-3 px-3 border-2 ${errors.city ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'} bg-white rounded-md shadow-sm sm:text-sm`}
                      value={formData.city}
                      onChange={handleChange}
                    >
                      <option value="">Seçiniz</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
                  </div>

                  <div>
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700">İlçe</label>
                    <input
                      type="text"
                      id="district"
                      name="district"
                      className="mt-1 block w-full shadow-sm sm:text-sm border-2 border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500 py-3"
                      value={formData.district}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-5">
                <h3 className="text-lg font-medium text-gray-900 mb-4">İletişim Bilgileri</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contactPerson.firstName" className="block text-sm font-medium text-gray-700">Yetkili Adı</label>
                    <input
                      type="text"
                      id="contactPerson.firstName"
                      name="contactPerson.firstName"
                      className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md py-3 border-2 ${errors['contactPerson.firstName'] ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
                      value={formData.contactPerson.firstName}
                      onChange={handleChange}
                    />
                    {errors['contactPerson.firstName'] && <p className="mt-1 text-sm text-red-600">{errors['contactPerson.firstName']}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="contactPerson.lastName" className="block text-sm font-medium text-gray-700">Yetkili Soyadı</label>
                    <input
                      type="text"
                      id="contactPerson.lastName"
                      name="contactPerson.lastName"
                      className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md py-3 border-2 ${errors['contactPerson.lastName'] ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
                      value={formData.contactPerson.lastName}
                      onChange={handleChange}
                    />
                    {errors['contactPerson.lastName'] && <p className="mt-1 text-sm text-red-600">{errors['contactPerson.lastName']}</p>}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Telefon Numarası</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaPhone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      className={`pl-10 block w-full shadow-sm sm:text-sm rounded-md py-3 border-2 ${errors.phoneNumber ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
                      placeholder="5XX XXX XX XX"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-posta Adresi</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className={`pl-10 block w-full shadow-sm sm:text-sm rounded-md py-3 border-2 ${errors.email ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-5">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Hesap Bilgileri</h3>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Şifre</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className={`pl-10 block w-full shadow-sm sm:text-sm rounded-md py-3 border-2 ${errors.password ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Şifre Tekrar</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaLock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className={`pl-10 block w-full shadow-sm sm:text-sm rounded-md py-3 border-2 ${errors.confirmPassword ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Araç Türleri</label>
                  <div className="grid grid-cols-2 gap-2">
                    {vehicleTypes.map(vehicle => (
                      <label key={vehicle.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name={`vehicle_${vehicle.id}`}
                          value={vehicle.id}
                          checked={formData.vehicleTypes.includes(vehicle.id)}
                          onChange={handleChange}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{vehicle.name}</span>
                      </label>
                    ))}
                  </div>
                  {errors.vehicleTypes && <p className="mt-1 text-sm text-red-600">{errors.vehicleTypes}</p>}
                </div>
              </div>
            )}
            
            {step === 4 && (
              <div className="space-y-5">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Belgeler</h3>
                
                {!formData.documentLater && (
                  <>
                    <div>
                      <label htmlFor="taxCertificate" className="block text-sm font-medium text-gray-700">Vergi Levhası</label>
                      <div className="mt-1">
                        <input
                          type="file"
                          id="taxCertificate"
                          name="documents.taxCertificate"
                          onChange={(e) => setFormData({
                            ...formData,
                            documents: {
                              ...formData.documents,
                              taxCertificate: e.target.files[0]
                            }
                          })}
                          className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 border-2 py-2 ${errors['documents.taxCertificate'] ? 'border-red-300 text-red-900' : 'border-gray-300'}`}
                        />
                      </div>
                      {errors['documents.taxCertificate'] && <p className="mt-1 text-sm text-red-600">{errors['documents.taxCertificate']}</p>}
                      <p className="mt-1 text-xs text-gray-500">Geçerli bir vergi levhası yükleyin (PDF, JPG veya PNG)</p>
                    </div>
                    
                    <div>
                      <label htmlFor="companyRegistration" className="block text-sm font-medium text-gray-700">Ticaret Sicil Belgesi</label>
                      <div className="mt-1">
                        <input
                          type="file"
                          id="companyRegistration"
                          name="documents.companyRegistration"
                          onChange={(e) => setFormData({
                            ...formData,
                            documents: {
                              ...formData.documents,
                              companyRegistration: e.target.files[0]
                            }
                          })}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 border-2 py-2"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Ticaret sicil belgesi yükleyin (PDF, JPG veya PNG)</p>
                    </div>
                    
                    <div>
                      <label htmlFor="driverLicense" className="block text-sm font-medium text-gray-700">Sürücü Belgesi</label>
                      <div className="mt-1">
                        <input
                          type="file"
                          id="driverLicense"
                          name="documents.driverLicense"
                          onChange={(e) => setFormData({
                            ...formData,
                            documents: {
                              ...formData.documents,
                              driverLicense: e.target.files[0]
                            }
                          })}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 border-2 py-2"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Sürücü belgesi yükleyin (PDF, JPG veya PNG)</p>
                    </div>
                  </>
                )}
                
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      documentLater: !formData.documentLater
                    })}
                    className={`inline-flex items-center px-4 py-2 border ${formData.documentLater ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-300 bg-white text-gray-700'} rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
                  >
                    {formData.documentLater ? 'Belgelerimi Şimdi Yükle' : 'Belgelerimi Daha Sonra Yükle'}
                  </button>
                  
                  {formData.documentLater && (
                    <p className="mt-2 text-sm text-gray-600 italic">
                      Belgelerinizi daha sonra yüklemek üzere kaydoluyorsunuz. Hesabınız "Belge Bekleniyor" statüsünde olacak ve belgelerinizi yükledikten sonra onay sürecine geçecektir.
                    </p>
                  )}
                </div>
                
                <div className="flex items-center">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className={`h-4 w-4 ${errors.agreeToTerms ? 'text-red-600 border-red-500' : 'text-orange-600 border-gray-300'} rounded focus:ring-orange-500`}
                  />
                  <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
                    <Link href="/terms" className="text-orange-600 hover:text-orange-500">Kullanım Şartları</Link>'nı ve <Link href="/privacy" className="text-orange-600 hover:text-orange-500">Gizlilik Politikası</Link>'nı kabul ediyorum
                  </label>
                </div>
                {errors.agreeToTerms && <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>}
              </div>
            )}
            
            {/* Butonlar */}
            <div className="mt-8 flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  onClick={handlePrevious}
                >
                  Geri
                </button>
              )}
              
              {step < 4 ? (
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ml-auto"
                  onClick={handleNext}
                >
                  İleri
                </button>
              ) : (
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ml-auto"
                >
                  Kaydı Tamamla
                </button>
              )}
            </div>
          </form>
          
          <div className="px-4 py-4 bg-gray-50 text-right sm:px-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Zaten hesabınız var mı? 
              <Link href="/portal/login" className="ml-1 text-orange-600 hover:text-orange-500">
                Giriş yapın
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
 