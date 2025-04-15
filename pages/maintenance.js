import React from 'react';
import Head from 'next/head';

export default function Maintenance() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <Head>
        <title>Bakım Çalışması | Taşı App</title>
        <meta name="description" content="Taşı App şu anda bakım çalışması nedeniyle hizmet veremiyor." />
      </Head>
      
      <div className="max-w-lg w-full bg-white p-10 rounded-2xl shadow-xl text-center border-t-4 border-orange-500">
        <div className="mb-8">
          <img 
            src="/logo.png" 
            alt="Taşı App Logo" 
            className="h-20 mx-auto"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/200x80?text=TAŞI+APP";
            }}
          />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Yakında Sizinleyiz</h1>
        
        <div className="flex items-center justify-center mb-6">
          <div className="w-24 h-1 bg-orange-500 rounded-full"></div>
        </div>
        
        <p className="text-gray-600 text-lg mb-8">
          Sizlere daha iyi hizmet verebilmek için sistemimizde bakım çalışması yapıyoruz. Çok yakında tekrar hizmetinizdeyiz.
        </p>
        
        <div className="relative h-2 max-w-sm mx-auto bg-gray-200 rounded-full overflow-hidden mb-6">
          <div className="absolute top-0 left-0 h-full bg-orange-500 rounded-full animate-pulse" style={{width: '75%'}}></div>
        </div>
        
        <div className="py-4 px-6 bg-orange-50 rounded-xl mb-8">
          <p className="text-orange-800 font-medium">
            Planlanan tamamlanma: Çok Yakında
          </p>
        </div>
        
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="flex space-x-2">
            <div className="h-3 w-3 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
            <div className="h-3 w-3 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
            <div className="h-3 w-3 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '600ms'}}></div>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mt-8">
          Acil durumlar için: <a href="mailto:info@tasiapp.com" className="text-orange-600 hover:underline font-medium">info@tasiapp.com</a>
        </p>
      </div>
      
      <p className="mt-8 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Taşı App. Tüm hakları saklıdır.
      </p>
    </div>
  );
} 