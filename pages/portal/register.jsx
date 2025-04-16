import React, { useState } from 'react';
import { FaTruck, FaBuilding, FaIdCard, FaPhone, FaEnvelope, FaLock, FaCheck, FaExclamationCircle, FaUser, FaFileAlt, FaMapMarkerAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import axios from 'axios';

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
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setApiError('');

      // Dosya boyutu kontrolü (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          [type]: 'Dosya boyutu 5MB\'dan küçük olmalıdır.'
        }));
        return;
      }

      // Dosya tipi kontrolü
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          [type]: 'Sadece PDF, JPEG ve PNG dosyaları yüklenebilir.'
        }));
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await axios.post('/api/upload/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [type]: response.data.fileUrl
          }
        }));
        setErrors(prev => ({
          ...prev,
          [type]: null
        }));
      }
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      setErrors(prev => ({
        ...prev,
        [type]: 'Dosya yüklenirken bir hata oluştu.'
      }));
    } finally {
      setLoading(false);
    }
  };

  const validateStep = (currentStep) => {
    const newErrors = {};

    switch (currentStep) {
      case 1:
        if (!formData.companyName) newErrors.companyName = 'Firma adı zorunludur.';
        if (!formData.taxNumber) newErrors.taxNumber = 'Vergi numarası zorunludur.';
        if (!formData.taxOffice) newErrors.taxOffice = 'Vergi dairesi zorunludur.';
        if (!formData.address) newErrors.address = 'Adres zorunludur.';
        if (!formData.city) newErrors.city = 'Şehir seçimi zorunludur.';
        if (!formData.district) newErrors.district = 'İlçe seçimi zorunludur.';
        break;

      case 2:
        if (!formData.contactPerson.firstName) newErrors.firstName = 'Ad zorunludur.';
        if (!formData.contactPerson.lastName) newErrors.lastName = 'Soyad zorunludur.';
        if (!formData.phoneNumber) newErrors.phoneNumber = 'Telefon numarası zorunludur.';
        if (!/^[0-9]{10}$/.test(formData.phoneNumber)) {
          newErrors.phoneNumber = 'Geçerli bir telefon numarası giriniz.';
        }
        if (!formData.email) newErrors.email = 'E-posta adresi zorunludur.';
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Geçerli bir e-posta adresi giriniz.';
        }
        break;

      case 3:
        if (!formData.password) newErrors.password = 'Şifre zorunludur.';
        if (formData.password.length < 8) {
          newErrors.password = 'Şifre en az 8 karakter olmalıdır.';
        }
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Şifre tekrarı zorunludur.';
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Şifreler eşleşmiyor.';
        }
        break;

      case 4:
        if (!formData.documentLater) {
          if (!formData.documents.taxCertificate) {
            newErrors.taxCertificate = 'Vergi levhası zorunludur.';
          }
          if (!formData.documents.companyRegistration) {
            newErrors.companyRegistration = 'Ticaret sicil belgesi zorunludur.';
          }
          if (!formData.documents.driverLicense) {
            newErrors.driverLicense = 'Sürücü belgesi zorunludur.';
          }
        }
        if (!formData.agreeToTerms) {
          newErrors.agreeToTerms = 'Kullanım koşullarını kabul etmelisiniz.';
        }
        break;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateStep(step)) {
      try {
        setLoading(true);
        setApiError('');

        // Form verilerini hazırla
        const submitData = {
          ...formData,
          status: formData.documentLater ? 'WAITING_DOCUMENTS' : 'WAITING_APPROVAL',
          role: 'carrier',
          documents: formData.documentLater ? null : formData.documents
        };

        // API'ye kayıt isteği gönder
        const response = await axios.post('/api/auth/register', submitData);

        if (response.data.success) {
          setSuccess(true);
          
          // Başarılı kayıt sonrası yönlendirme
          setTimeout(() => {
            router.push('/portal/register-success');
          }, 2000);
        }
      } catch (error) {
        console.error('Kayıt hatası:', error);
        
        if (error.response?.data?.error) {
          setApiError(error.response.data.error);
        } else {
          setApiError('Kayıt işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        }
      } finally {
        setLoading(false);
      }
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Taşı App - Taşıyıcı Kayıt</title>
      </Head>

      {/* Logo ve başlık */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          src="/logo.png"
          alt="Taşı App Logo"
          width={100}
          height={100}
          className="mx-auto"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Taşıyıcı Kayıt
        </h2>
      </div>

      {/* Form */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* İlerleme Çubuğu */}
          <div className="mb-8">
            <div className="relative">
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <div
                  style={{ width: `${(step / 4) * 100}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500 transition-all duration-300"
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <div className={step >= 1 ? 'text-orange-600 font-medium' : ''}>Şirket</div>
                <div className={step >= 2 ? 'text-orange-600 font-medium' : ''}>İletişim</div>
                <div className={step >= 3 ? 'text-orange-600 font-medium' : ''}>Hesap</div>
                <div className={step >= 4 ? 'text-orange-600 font-medium' : ''}>Belgeler</div>
              </div>
            </div>
          </div>

          {/* Loading Spinner */}
          {loading && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 rounded-md bg-green-50 border border-green-400">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaCheck className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Kayıt başarıyla tamamlandı! Yönlendiriliyorsunuz...
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* API Error Message */}
          {apiError && (
            <div className="mb-4 p-4 rounded-md bg-red-50 border border-red-400">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaExclamationCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{apiError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Steps */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Şirket Bilgileri</h3>
                
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                    Firma Adı
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                        errors.companyName ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.companyName && (
                      <p className="mt-2 text-sm text-red-600">{errors.companyName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="taxNumber" className="block text-sm font-medium text-gray-700">
                      Vergi Numarası
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="taxNumber"
                        name="taxNumber"
                        value={formData.taxNumber}
                        onChange={handleChange}
                        maxLength={10}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                          errors.taxNumber ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.taxNumber && (
                        <p className="mt-2 text-sm text-red-600">{errors.taxNumber}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="taxOffice" className="block text-sm font-medium text-gray-700">
                      Vergi Dairesi
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="taxOffice"
                        name="taxOffice"
                        value={formData.taxOffice}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                          errors.taxOffice ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.taxOffice && (
                        <p className="mt-2 text-sm text-red-600">{errors.taxOffice}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Adres
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                        errors.address ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.address && (
                      <p className="mt-2 text-sm text-red-600">{errors.address}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                      Şehir
                    </label>
                    <div className="mt-1">
                      <select
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                          errors.city ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Seçiniz</option>
                        {cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      {errors.city && (
                        <p className="mt-2 text-sm text-red-600">{errors.city}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                      İlçe
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="district"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                          errors.district ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.district && (
                        <p className="mt-2 text-sm text-red-600">{errors.district}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">İletişim Bilgileri</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      Ad
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="firstName"
                        name="contactPerson.firstName"
                        value={formData.contactPerson.firstName}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                          errors.firstName ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.firstName && (
                        <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Soyad
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="lastName"
                        name="contactPerson.lastName"
                        value={formData.contactPerson.lastName}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                          errors.lastName ? 'border-red-300' : 'border-gray-300'
                        }`}
                      />
                      {errors.lastName && (
                        <p className="mt-2 text-sm text-red-600">{errors.lastName}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                    Telefon Numarası
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      placeholder="5XX XXX XX XX"
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                        errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.phoneNumber && (
                      <p className="mt-2 text-sm text-red-600">{errors.phoneNumber}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    E-posta Adresi
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Hesap Bilgileri</h3>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Şifre
                  </label>
                  <div className="mt-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Şifre Tekrar
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Belgeler</h3>

                {!formData.documentLater && (
                  <>
                    <div>
                      <label htmlFor="taxCertificate" className="block text-sm font-medium text-gray-700">
                        Vergi Levhası
                      </label>
                      <div className="mt-1">
                        <input
                          type="file"
                          id="taxCertificate"
                          name="documents.taxCertificate"
                          onChange={(e) => handleFileUpload(e, 'taxCertificate')}
                          accept=".pdf,.jpg,.jpeg,.png"
                          className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 ${
                            errors.taxCertificate ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.taxCertificate && (
                          <p className="mt-2 text-sm text-red-600">{errors.taxCertificate}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="companyRegistration" className="block text-sm font-medium text-gray-700">
                        Ticaret Sicil Belgesi
                      </label>
                      <div className="mt-1">
                        <input
                          type="file"
                          id="companyRegistration"
                          name="documents.companyRegistration"
                          onChange={(e) => handleFileUpload(e, 'companyRegistration')}
                          accept=".pdf,.jpg,.jpeg,.png"
                          className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 ${
                            errors.companyRegistration ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.companyRegistration && (
                          <p className="mt-2 text-sm text-red-600">{errors.companyRegistration}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="driverLicense" className="block text-sm font-medium text-gray-700">
                        Sürücü Belgesi
                      </label>
                      <div className="mt-1">
                        <input
                          type="file"
                          id="driverLicense"
                          name="documents.driverLicense"
                          onChange={(e) => handleFileUpload(e, 'driverLicense')}
                          accept=".pdf,.jpg,.jpeg,.png"
                          className={`block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 ${
                            errors.driverLicense ? 'border-red-300' : 'border-gray-300'
                          }`}
                        />
                        {errors.driverLicense && (
                          <p className="mt-2 text-sm text-red-600">{errors.driverLicense}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        documentLater: !formData.documentLater,
                      })
                    }
                    className={`inline-flex items-center px-4 py-2 border ${
                      formData.documentLater
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-300 bg-white text-gray-700'
                    } rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
                  >
                    {formData.documentLater ? 'Belgeleri Şimdi Yükle' : 'Belgeleri Daha Sonra Yükle'}
                  </button>
                </div>

                <div className="mt-4">
                  <div className="flex items-center">
                    <input
                      id="agreeToTerms"
                      name="agreeToTerms"
                      type="checkbox"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className={`h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded ${
                        errors.agreeToTerms ? 'border-red-300' : ''
                      }`}
                    />
                    <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
                      <Link href="/terms" className="text-orange-600 hover:text-orange-500">
                        Kullanım Koşulları
                      </Link>
                      'nı ve{' '}
                      <Link href="/privacy" className="text-orange-600 hover:text-orange-500">
                        Gizlilik Politikası
                      </Link>
                      'nı kabul ediyorum
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="mt-2 text-sm text-red-600">{errors.agreeToTerms}</p>
                  )}
                </div>
              </div>
            )}

            {/* Form Navigation */}
            <div className="flex justify-between items-center mt-6">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                >
                  Geri
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep(step)) {
                      setStep(step + 1);
                    }
                  }}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                >
                  İleri
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                >
                  {loading ? 'Kaydediliyor...' : 'Kaydı Tamamla'}
                </button>
              )}
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Zaten hesabınız var mı?</span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link href="/portal/login" className="font-medium text-orange-600 hover:text-orange-500">
                Giriş yapın
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
 