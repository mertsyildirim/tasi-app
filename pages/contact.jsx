'use client'

import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPaperPlane } from 'react-icons/fa';
import Head from 'next/head';
import MainLayout from '../components/layout/MainLayout';
import { useRouter } from 'next/router';

export default function Contact() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Form değiştiğinde ilgili hata mesajını temizle
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Ad Soyad alanı zorunludur';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta alanı zorunludur';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Konu alanı zorunludur';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Mesaj alanı zorunludur';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Mesajınız en az 10 karakter olmalıdır';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Gerçek API isteği burada yapılacak
      // Şimdilik simüle ediyoruz
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      
      // 5 saniye sonra başarı mesajını kaldır
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
      
    } catch (error) {
      console.error('Form gönderme hatası:', error);
      setSubmitError('Form gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <Head>
        <title>İletişim - Tasiapp</title>
        <meta name="description" content="Tasiapp ile iletişime geçin. Taşıma hizmetleri hakkında bilgi alın, sorularınızı sorun." />
      </Head>
      
      <div className="bg-gradient-to-b from-orange-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Bizimle İletişime Geçin</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sorularınız, önerileriniz veya iş birliği fırsatları için bizimle iletişime geçebilirsiniz. 
              Size en kısa sürede dönüş yapacağız.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
            {/* İletişim Formu */}
            <div className="lg:col-span-3 bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">İletişim Formu</h2>
              
              {submitSuccess && (
                <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
                  <p className="font-medium">Mesajınız başarıyla gönderildi!</p>
                  <p className="text-sm">En kısa sürede size dönüş yapacağız.</p>
                </div>
              )}
              
              {submitError && (
                <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
                  <p>{submitError}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Ad Soyad</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none ${
                        errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-orange-100'
                      }`}
                      placeholder="Adınız Soyadınız"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">E-posta</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none ${
                        errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-orange-100'
                      }`}
                      placeholder="E-posta adresiniz"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Konu</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none ${
                      errors.subject ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-orange-100'
                    }`}
                    placeholder="Mesajınızın konusu"
                  />
                  {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Mesajınız</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:outline-none ${
                      errors.message ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-orange-100'
                    }`}
                    placeholder="Mesajınızı yazın..."
                  ></textarea>
                  {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center justify-center w-full sm:w-auto px-8 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition duration-300 ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2" />
                      Gönder
                    </>
                  )}
                </button>
              </form>
            </div>
            
            {/* İletişim Bilgileri */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">İletişim Bilgileri</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-orange-100 p-3 rounded-full">
                      <FaMapMarkerAlt className="text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-800">Adres</h3>
                      <p className="text-gray-600 mt-1">
                        Atatürk Cad. Teknoloji Plaza No:120 Kat:4<br/>
                        Kadıköy, İstanbul, 34710
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-orange-100 p-3 rounded-full">
                      <FaPhone className="text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-800">Telefon</h3>
                      <p className="text-gray-600 mt-1">
                        <a href="tel:+902121234567" className="hover:text-orange-600 transition">+90 (212) 123 45 67</a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-orange-100 p-3 rounded-full">
                      <FaEnvelope className="text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-800">E-posta</h3>
                      <p className="text-gray-600 mt-1">
                        <a href="mailto:info@tasiapp.com" className="hover:text-orange-600 transition">info@tasiapp.com</a>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Bizi Takip Edin</h3>
                  <div className="flex space-x-4">
                    <a 
                      href="https://facebook.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-gray-100 hover:bg-orange-100 text-gray-500 hover:text-orange-600 p-3 rounded-full transition"
                    >
                      <FaFacebook />
                    </a>
                    <a 
                      href="https://twitter.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-gray-100 hover:bg-orange-100 text-gray-500 hover:text-orange-600 p-3 rounded-full transition"
                    >
                      <FaTwitter />
                    </a>
                    <a 
                      href="https://instagram.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-gray-100 hover:bg-orange-100 text-gray-500 hover:text-orange-600 p-3 rounded-full transition"
                    >
                      <FaInstagram />
                    </a>
                    <a 
                      href="https://linkedin.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-gray-100 hover:bg-orange-100 text-gray-500 hover:text-orange-600 p-3 rounded-full transition"
                    >
                      <FaLinkedin />
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 px-4">Çalışma Saatleri</h3>
                <div className="space-y-2 px-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pazartesi - Cuma:</span>
                    <span className="font-medium">09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cumartesi:</span>
                    <span className="font-medium">10:00 - 14:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pazar:</span>
                    <span className="font-medium">Kapalı</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Harita */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 p-6">Bizi Ziyaret Edin</h2>
            <div className="h-96 w-full">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48186.20102629785!2d29.0088766!3d40.9912552!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab85cec0fd5a5%3A0x47e569839c2c0a5b!2sKad%C4%B1k%C3%B6y%2F%C4%B0stanbul!5e0!3m2!1str!2str!4v1651689694173!5m2!1str!2str" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade">
              </iframe>
            </div>
          </div>
          
          {/* SSS Bölümü */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sık Sorulan Sorular</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Taşıma fiyatları nasıl belirleniyor?</h3>
                <p className="text-gray-600">
                  Taşıma fiyatları; mesafe, yükün boyutu, ağırlığı, özel taşıma gereksinimleri ve seçilen taşıma türüne göre hesaplanmaktadır. 
                  Uygulama üzerinden hızlıca fiyat teklifi alabilirsiniz.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Kurye hizmetiniz hangi bölgelerde geçerli?</h3>
                <p className="text-gray-600">
                  Kurye hizmetimiz şu anda İstanbul, Ankara, İzmir, Bursa ve Antalya'da aktif olarak hizmet vermektedir. 
                  Yakında daha fazla şehirde hizmet vermeye başlayacağız.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Taşıma sürecinde eşyalarım güvende mi?</h3>
                <p className="text-gray-600">
                  Tüm taşımalar sigorta kapsamındadır. Ayrıca taşıyıcılarımız özenle seçilmekte ve düzenli olarak denetlenmektedir. 
                  Taşıma sırasında oluşabilecek hasarlara karşı eşyalarınız güvence altındadır.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Taşıma talebimi iptal edebilir miyim?</h3>
                <p className="text-gray-600">
                  Taşıyıcı henüz sizi onaylamadıysa, talebinizi herhangi bir ücret ödemeden iptal edebilirsiniz. 
                  Onaylandıktan sonra yapılan iptallerde, taşıyıcının harcadığı zamanı telafi etmek için küçük bir iptal ücreti tahsil edilebilir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 
 