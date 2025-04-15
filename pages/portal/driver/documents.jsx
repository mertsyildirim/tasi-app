import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DriverLayout from '../../../components/portal/DriverLayout';
import { FaFileAlt, FaCheckCircle, FaExclamationTriangle, FaSpinner, FaUpload, FaCalendarAlt } from 'react-icons/fa';

export default function Documents() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [filter, setFilter] = useState('all'); // all, valid, expired, pending

  // Örnek belge verileri
  const sampleDocuments = [
    {
      id: 1,
      title: 'Sürücü Belgesi',
      type: 'license',
      status: 'valid',
      issueDate: '2023-01-15',
      expiryDate: '2025-01-15',
      documentNumber: 'SRC123456',
      issuingAuthority: 'Milli Eğitim Bakanlığı',
      fileUrl: '/documents/license.pdf'
    },
    {
      id: 2,
      title: 'Sağlık Raporu',
      type: 'health',
      status: 'expired',
      issueDate: '2023-06-01',
      expiryDate: '2024-03-01',
      documentNumber: 'SRH789012',
      issuingAuthority: 'Sağlık Bakanlığı',
      fileUrl: '/documents/health.pdf'
    },
    {
      id: 3,
      title: 'Araç Ruhsatı',
      type: 'vehicle',
      status: 'valid',
      issueDate: '2022-12-01',
      expiryDate: '2024-12-01',
      documentNumber: 'ARU345678',
      issuingAuthority: 'Emniyet Genel Müdürlüğü',
      fileUrl: '/documents/vehicle.pdf'
    },
    {
      id: 4,
      title: 'Sigorta Poliçesi',
      type: 'insurance',
      status: 'pending',
      issueDate: '2024-01-01',
      expiryDate: '2025-01-01',
      documentNumber: 'SIG901234',
      issuingAuthority: 'ABC Sigorta',
      fileUrl: '/documents/insurance.pdf'
    }
  ];

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('user');
        if (!userData) {
          router.push('/portal/login');
          return;
        }
        const user = JSON.parse(userData);
        if (user.type !== 'driver') {
          router.push('/portal/dashboard');
          return;
        }
        setUser(user);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/portal/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    setDocuments(sampleDocuments);
  }, [router]);

  const filteredDocuments = documents.filter(document => {
    if (filter === 'all') return true;
    return document.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'valid':
        return 'Geçerli';
      case 'expired':
        return 'Süresi Dolmuş';
      case 'pending':
        return 'Beklemede';
      default:
        return 'Bilinmiyor';
    }
  };

  const getDocumentTypeText = (type) => {
    switch (type) {
      case 'license':
        return 'Sürücü Belgesi';
      case 'health':
        return 'Sağlık Raporu';
      case 'vehicle':
        return 'Araç Ruhsatı';
      case 'insurance':
        return 'Sigorta Poliçesi';
      default:
        return 'Diğer';
    }
  };

  if (loading) {
    return (
      <DriverLayout title="Belgelerim">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </DriverLayout>
    );
  }

  return (
    <DriverLayout title="Belgelerim">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Bilgi Kartları */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaFileAlt className="h-6 w-6 text-orange-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Toplam Belge
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {documents.length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaCheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Geçerli Belgeler
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {documents.filter(d => d.status === 'valid').length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaExclamationTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Süresi Dolmuş
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {documents.filter(d => d.status === 'expired').length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaSpinner className="h-6 w-6 text-yellow-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Beklemede
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {documents.filter(d => d.status === 'pending').length}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filtreler */}
        <div className="mt-8 flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setFilter('valid')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'valid'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Geçerli
            </button>
            <button
              onClick={() => setFilter('expired')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'expired'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Süresi Dolmuş
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'pending'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Beklemede
            </button>
          </div>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <FaUpload className="mr-2 -ml-1 h-4 w-4" />
            Yeni Belge Yükle
          </button>
        </div>

        {/* Belgeler Listesi */}
        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Belge Detayları
              </h3>
            </div>
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200">
                {filteredDocuments.map((document) => (
                  <li key={document.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {document.title}
                        </p>
                        <div className="mt-2 flex">
                          <div className="flex items-center text-sm text-gray-500">
                            <FaFileAlt className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <p>{document.documentNumber}</p>
                          </div>
                          <div className="ml-6 flex items-center text-sm text-gray-500">
                            <FaCalendarAlt className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <p>
                              {new Date(document.issueDate).toLocaleDateString('tr-TR')} - {new Date(document.expiryDate).toLocaleDateString('tr-TR')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                          {getStatusText(document.status)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Belge Bilgileri</h4>
                        <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                          <div className="sm:col-span-1">
                            <dt className="text-xs font-medium text-gray-500">Belge Tipi</dt>
                            <dd className="mt-1 text-sm text-gray-900">{getDocumentTypeText(document.type)}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-xs font-medium text-gray-500">Belge No</dt>
                            <dd className="mt-1 text-sm text-gray-900">{document.documentNumber}</dd>
                          </div>
                          <div className="sm:col-span-1">
                            <dt className="text-xs font-medium text-gray-500">Veren Kurum</dt>
                            <dd className="mt-1 text-sm text-gray-900">{document.issuingAuthority}</dd>
                          </div>
                        </dl>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">İşlemler</h4>
                        <div className="mt-2 flex space-x-3">
                          <button
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                          >
                            Görüntüle
                          </button>
                          <button
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                          >
                            İndir
                          </button>
                          <button
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                          >
                            Güncelle
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DriverLayout>
  );
} 