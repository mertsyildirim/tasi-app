import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { FaUpload, FaCheck, FaExclamationTriangle, FaFilePdf, FaFileImage, FaSpinner, FaTimes } from 'react-icons/fa';
import Link from 'next/link';

const UploadDocumentsPage = () => {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [documents, setDocuments] = useState({
    taxCertificate: null,
    companyRegistration: null,
    driverLicense: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setDocuments(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Vergi levhası zorunlu alan
    if (!documents.taxCertificate) {
      setError('Vergi levhası zorunludur. Lütfen yükleyin.');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      // Normalde burada API'ye dosyaları yükleyecek kodlar olacak
      // Mock bir işlem yapıyoruz
      console.log('Belgeler gönderiliyor:', documents);
      
      setTimeout(() => {
        setSuccess(true);
        setSubmitting(false);
        
        // Başarılı sayfasına yönlendir
        setTimeout(() => {
          router.push('/portal/dashboard');
        }, 2000);
      }, 1500);
    } catch (error) {
      console.error('Belge yükleme hatası:', error);
      setError('Belgeler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <FaCheck className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-3 text-lg font-medium text-gray-900">Belgeler Başarıyla Yüklendi!</h2>
            <p className="mt-2 text-sm text-gray-500">
              Belgeleriniz onay sürecine alınmıştır. Onaylandıktan sonra hesabınız aktif olacaktır.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Belge Yükleme | Taşıapp</title>
        <meta name="description" content="Taşıapp belge yükleme sayfası" />
      </Head>
      
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center rounded-md mb-2">
            <img src="/portal_logo.png" alt="Taşı Portal" className="h-16" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">
            Belge Yükleme
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Hesabınızın aktifleştirilmesi için gerekli belgeleri yükleyin
          </p>
          
          {/* Uyarı Mesajı */}
          <div className="mt-4 flex items-center justify-center rounded-md bg-yellow-50 p-4 border border-yellow-200">
            <FaExclamationTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <p className="text-sm text-yellow-700">
              Hesabınızı aktifleştirmek için vergi levhası yüklemeniz zorunludur.
            </p>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="taxCertificate" className="block text-sm font-medium text-gray-700">
                Vergi Levhası <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {documents.taxCertificate ? (
                    <div className="flex flex-col items-center">
                      {documents.taxCertificate.type.includes('pdf') ? (
                        <FaFilePdf className="mx-auto h-12 w-12 text-red-500" />
                      ) : (
                        <FaFileImage className="mx-auto h-12 w-12 text-blue-500" />
                      )}
                      <p className="text-sm text-gray-700 mt-2">{documents.taxCertificate.name}</p>
                      <button
                        type="button"
                        onClick={() => setDocuments(prev => ({ ...prev, taxCertificate: null }))}
                        className="mt-2 text-xs text-red-600 hover:text-red-500"
                      >
                        Dosyayı Kaldır
                      </button>
                    </div>
                  ) : (
                    <>
                      <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="taxCertificate-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500"
                        >
                          <span>Dosya Yükle</span>
                          <input
                            id="taxCertificate-upload"
                            name="taxCertificate"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">veya sürükleyip bırakın</p>
                      </div>
                    </>
                  )}
                  <p className="text-xs text-gray-500">PNG, JPG veya PDF (max. 10MB)</p>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="companyRegistration" className="block text-sm font-medium text-gray-700">
                Ticaret Sicil Belgesi
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {documents.companyRegistration ? (
                    <div className="flex flex-col items-center">
                      {documents.companyRegistration.type.includes('pdf') ? (
                        <FaFilePdf className="mx-auto h-12 w-12 text-red-500" />
                      ) : (
                        <FaFileImage className="mx-auto h-12 w-12 text-blue-500" />
                      )}
                      <p className="text-sm text-gray-700 mt-2">{documents.companyRegistration.name}</p>
                      <button
                        type="button"
                        onClick={() => setDocuments(prev => ({ ...prev, companyRegistration: null }))}
                        className="mt-2 text-xs text-red-600 hover:text-red-500"
                      >
                        Dosyayı Kaldır
                      </button>
                    </div>
                  ) : (
                    <>
                      <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="companyRegistration-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500"
                        >
                          <span>Dosya Yükle</span>
                          <input
                            id="companyRegistration-upload"
                            name="companyRegistration"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">veya sürükleyip bırakın</p>
                      </div>
                    </>
                  )}
                  <p className="text-xs text-gray-500">PNG, JPG veya PDF (max. 10MB)</p>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="driverLicense" className="block text-sm font-medium text-gray-700">
                Sürücü Belgesi
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {documents.driverLicense ? (
                    <div className="flex flex-col items-center">
                      {documents.driverLicense.type.includes('pdf') ? (
                        <FaFilePdf className="mx-auto h-12 w-12 text-red-500" />
                      ) : (
                        <FaFileImage className="mx-auto h-12 w-12 text-blue-500" />
                      )}
                      <p className="text-sm text-gray-700 mt-2">{documents.driverLicense.name}</p>
                      <button
                        type="button"
                        onClick={() => setDocuments(prev => ({ ...prev, driverLicense: null }))}
                        className="mt-2 text-xs text-red-600 hover:text-red-500"
                      >
                        Dosyayı Kaldır
                      </button>
                    </div>
                  ) : (
                    <>
                      <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="driverLicense-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500"
                        >
                          <span>Dosya Yükle</span>
                          <input
                            id="driverLicense-upload"
                            name="driverLicense"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                        <p className="pl-1">veya sürükleyip bırakın</p>
                      </div>
                    </>
                  )}
                  <p className="text-xs text-gray-500">PNG, JPG veya PDF (max. 10MB)</p>
                </div>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={submitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                  submitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Yükleniyor...
                  </>
                ) : (
                  'Belgeleri Gönder'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadDocumentsPage; 