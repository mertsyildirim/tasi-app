// API helper functions
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Add token to request header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      
      // Redirect to login page
      window.location.href = '/portal/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  login: async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Giriş yapılırken bir hata oluştu' };
    }
  },
  
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Kayıt olurken bir hata oluştu' };
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  }
};

// User API functions
export const userAPI = {
  getProfile: async (email) => {
    try {
      const response = await api.get(`/api/user/profile?email=${email}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Profil bilgileri alınırken bir hata oluştu' };
    }
  },
  
  updateProfile: async (email, profileData) => {
    try {
      const response = await api.put(`/api/user/profile?email=${email}`, profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Profil güncellenirken bir hata oluştu' };
    }
  },
  
  uploadDocuments: async (email, documents) => {
    try {
      const response = await api.post('/api/user/upload-documents', { email, documents });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Belgeler yüklenirken bir hata oluştu' };
    }
  }
};

export default api; 