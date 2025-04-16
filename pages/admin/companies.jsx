import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

const Companies = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');
        
        if (!token || !userData) {
          console.log('Token veya kullanıcı bilgisi bulunamadı, login sayfasına yönlendiriliyor');
          router.replace('/admin');
          return;
        }

        const user = JSON.parse(userData);
        const allowedRoles = ['admin', 'super_admin', 'editor', 'support'];
        const hasAllowedRole = user.roles?.some(role => allowedRoles.includes(role)) || allowedRoles.includes(user.role);
        
        if (!hasAllowedRole) {
          console.log('Bu sayfaya erişim yetkiniz yok');
          router.replace('/admin/dashboard');
          return;
        }
        
        // API'den şirketleri çek
        const response = await axios.get(`/api/admin/companies`, {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            search: searchTerm,
            page: currentPage,
            limit: 10
          }
        });
        
        if (response.data && response.data.companies) {
          setCompanies(response.data.companies);
          setTotalPages(response.data.totalPages || 1);
          setTotalCompanies(response.data.total || 0);
        }
      } catch (error) {
        console.error('Şirketler yüklenirken hata:', error);
        
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          router.replace('/admin');
          return;
        }
        
        setError('Şirket verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };
    
    if (router.isReady) {
      fetchCompanies();
    }
  }, [router.isReady, currentPage, searchTerm]);

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default Companies; 