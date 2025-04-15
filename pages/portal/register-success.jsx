import React from 'react';
import { FaCheck, FaTruck } from 'react-icons/fa';
import Link from 'next/link';
import Head from 'next/head';

const RegisterSuccess = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <Head>
        <title>Kayıt Başarılı | Taşı.app</title>
        <meta name="description" content="Taşı.app taşıyıcı kayıt başarılı sayfası" />
      </Head>
      
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-5">
            <FaCheck className="h-6 w-6 text-green-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Kayıt İşleminiz Tamamlandı!</h2>
          
          <div className="mx-auto mb-4 mt-6">
            <img src="/portal_logo.png" alt="Taşı Portal" className="h-16 mx-auto" />
          </div>
          
          <p className="text-gray-600 mb-5">
            Taşıyıcı hesabınız oluşturuldu. Bilgileriniz onaylandıktan sonra size e-posta ile bilgilendirme yapılacaktır.
          </p>
          
          <div className="border-t border-gray-200 pt-5 mt-5">
            <p className="text-gray-500 mb-5 text-sm">
              Hesabınızın onaylanması ve aktifleştirilmesi için gerekli evrakları en kısa sürede yüklemeniz gerekmektedir.
            </p>
            
            <div className="space-y-3">
              <Link
                href="/portal/login"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Giriş Yapın
              </Link>
              
              <Link
                href="/"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Ana Sayfaya Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterSuccess; 
 