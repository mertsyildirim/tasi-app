import React, { useState, useRef } from 'react';
import { FaUpload, FaFile, FaImage, FaFileAlt, FaTimes, FaCheckCircle, FaSpinner } from 'react-icons/fa';

/**
 * Dosya yükleme bileşeni
 * @param {Object} props
 * @param {Function} props.onUpload Yükleme tamamlandığında çağrılacak fonksiyon
 * @param {Function} props.onError Hata durumunda çağrılacak fonksiyon
 * @param {string} props.folder Dosyaların yükleneceği klasör (opsiyonel)
 * @param {Array} props.acceptedFileTypes Kabul edilen dosya türleri ['image/*', '.pdf', '.docx']
 * @param {number} props.maxFileSize Maksimum dosya boyutu (MB)
 * @param {boolean} props.multiple Çoklu dosya yükleme seçeneği
 */
export default function FileUploader({
  onUpload,
  onError,
  folder = '',
  acceptedFileTypes = ['image/*', '.pdf', '.docx'],
  maxFileSize = 5,
  multiple = false
}) {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [errors, setErrors] = useState([]);
  
  const fileInputRef = useRef(null);
  
  // Dosya seçildiğinde
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setErrors([]);
    
    // Dosya boyutu ve türü kontrolü
    const validFiles = [];
    const errorMessages = [];
    
    selectedFiles.forEach(file => {
      // Maksimum boyut kontrolü (MB)
      if (file.size > maxFileSize * 1024 * 1024) {
        errorMessages.push(`${file.name}: Dosya boyutu çok büyük (Maksimum: ${maxFileSize}MB)`);
        return;
      }
      
      // Dosya türü kontrolü
      let isValidType = false;
      
      for (const type of acceptedFileTypes) {
        if (type.startsWith('.')) {
          // Uzantı kontrolü (.pdf, .docx vb.)
          const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
          if (extension === type.toLowerCase()) {
            isValidType = true;
            break;
          }
        } else if (type.endsWith('/*')) {
          // MIME tipi grubu kontrolü (image/*, video/* vb.)
          const baseType = type.split('/')[0];
          if (file.type.startsWith(`${baseType}/`)) {
            isValidType = true;
            break;
          }
        } else {
          // Tam MIME tipi kontrolü (image/jpeg, application/pdf vb.)
          if (file.type === type) {
            isValidType = true;
            break;
          }
        }
      }
      
      if (!isValidType) {
        errorMessages.push(`${file.name}: Desteklenmeyen dosya türü`);
        return;
      }
      
      validFiles.push(file);
    });
    
    if (errorMessages.length > 0) {
      setErrors(errorMessages);
      onError && onError(errorMessages);
    }
    
    if (validFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
  };
  
  // Dosya kaldırma
  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    
    // İlgili hata mesajını da kaldır
    if (errors[index]) {
      setErrors(prevErrors => prevErrors.filter((_, i) => i !== index));
    }
  };
  
  // Dosya yükleme
  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    const uploadResults = [];
    const newUploadedFiles = [];
    const newErrors = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // İlerleme durumunu güncelle
        setUploadProgress(prev => ({
          ...prev,
          [i]: 0
        }));
        
        // FormData oluştur
        const formData = new FormData();
        formData.append('file', file);
        
        if (folder) {
          formData.append('folder', folder);
        }
        
        // Dosyayı yükle
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({
              ...prev,
              [i]: progress
            }));
          },
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Dosya yükleme hatası');
        }
        
        const data = await response.json();
        
        // Başarılı yükleme
        uploadResults.push(data);
        newUploadedFiles.push({
          file,
          result: data
        });
        
        // İlerleme durumunu güncelle
        setUploadProgress(prev => ({
          ...prev,
          [i]: 100
        }));
      } catch (error) {
        console.error(`"${file.name}" dosyası yüklenirken hata:`, error);
        
        newErrors.push(`"${file.name}" dosyası yüklenemedi: ${error.message}`);
        
        // İlerleme durumunu sıfırla
        setUploadProgress(prev => ({
          ...prev,
          [i]: -1
        }));
      }
    }
    
    setIsUploading(false);
    setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
    
    if (newErrors.length > 0) {
      setErrors(prev => [...prev, ...newErrors]);
      onError && onError(newErrors);
    }
    
    if (newUploadedFiles.length > 0) {
      // Başarılı sonuçları bildir
      onUpload && onUpload(newUploadedFiles.map(item => item.result));
      
      // Dosyaları temizle
      setFiles([]);
      setUploadProgress({});
    }
  };
  
  // Dosya ikonunu belirleme
  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return <FaImage className="text-blue-500" />;
    } else if (file.type.includes('pdf')) {
      return <FaFileAlt className="text-red-500" />;
    } else if (file.type.includes('word') || file.type.includes('document')) {
      return <FaFileAlt className="text-blue-700" />;
    } else {
      return <FaFile className="text-gray-500" />;
    }
  };
  
  // Dosya boyutu formatı
  const formatFileSize = (bytes) => {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
  };
  
  return (
    <div className="w-full">
      {/* Dosya seçme alanı */}
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple={multiple}
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileChange}
          className="hidden"
        />
        
        <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Dosyaları buraya sürükleyin veya tıklayarak seçin
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Kabul edilen türler: {acceptedFileTypes.join(', ')} (Maks: {maxFileSize}MB)
        </p>
      </div>
      
      {/* Seçilen dosyalar */}
      {files.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Seçilen Dosyalar ({files.length})
          </h4>
          
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between py-3 px-4 bg-white">
                <div className="flex items-center">
                  <span className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                    {getFileIcon(file)}
                  </span>
                  <div className="ml-3 truncate">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  {/* Yükleme durumu */}
                  {isUploading && uploadProgress[index] !== undefined && (
                    <div className="mr-4 w-16">
                      {uploadProgress[index] === -1 ? (
                        <span className="text-red-500 text-xs">Hata</span>
                      ) : uploadProgress[index] === 100 ? (
                        <FaCheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="flex items-center">
                          <FaSpinner className="animate-spin h-4 w-4 text-orange-500 mr-2" />
                          <span className="text-xs text-gray-600">{uploadProgress[index]}%</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Dosyayı kaldır butonu */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="text-red-500 hover:text-red-700"
                    disabled={isUploading}
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          
          {/* Yükleme butonu */}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={uploadFiles}
              disabled={isUploading || files.length === 0}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <span className="flex items-center">
                  <FaSpinner className="animate-spin h-4 w-4 mr-2" />
                  Yükleniyor...
                </span>
              ) : (
                'Dosyaları Yükle'
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Hata mesajları */}
      {errors.length > 0 && (
        <div className="mt-4">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
            <strong className="font-bold">Hata!</strong>
            <ul className="mt-1 list-disc list-inside text-sm">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      {/* Yüklenen dosyalar */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Yüklenen Dosyalar ({uploadedFiles.length})
          </h4>
          
          <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
            {uploadedFiles.map((item, index) => (
              <li key={index} className="flex items-center justify-between py-3 px-4 bg-gray-50">
                <div className="flex items-center">
                  <span className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                    {getFileIcon(item.file)}
                  </span>
                  <div className="ml-3 truncate max-w-xs">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.file.name}</p>
                    <a 
                      href={item.result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline truncate block"
                    >
                      {item.result.url}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <FaCheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 