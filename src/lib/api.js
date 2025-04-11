import axios from 'axios';

const API = {
  // ===== Kullanıcı API'leri =====
  user: {
    // Kullanıcı profil bilgilerini getir
    getProfile: async () => {
      try {
        const { data } = await axios.get('/api/users/profile');
        return { success: true, data };
      } catch (error) {
        console.error('Profil bilgileri alınamadı:', error);
        return {
          success: false,
          error: error.response?.data?.error || 'Profil bilgileri alınamadı'
        };
      }
    },
    
    // Kullanıcı profil bilgilerini güncelle
    updateProfile: async (profileData) => {
      try {
        const { data } = await axios.put('/api/users/profile', profileData);
        return { success: true, data };
      } catch (error) {
        console.error('Profil güncellenemedi:', error);
        return {
          success: false,
          error: error.response?.data?.error || 'Profil güncellenemedi'
        };
      }
    }
  },
  
  // ===== Şirket API'leri =====
  company: {
    // Şirket bilgilerini getir
    getDetails: async (companyId) => {
      try {
        const { data } = await axios.get(`/api/companies/${companyId}`);
        return { success: true, data };
      } catch (error) {
        console.error('Şirket bilgileri alınamadı:', error);
        return {
          success: false,
          error: error.response?.data?.error || 'Şirket bilgileri alınamadı'
        };
      }
    },
    
    // Şirket bilgilerini güncelle
    updateDetails: async (companyId, companyData) => {
      try {
        const { data } = await axios.put(`/api/companies/${companyId}`, companyData);
        return { success: true, data };
      } catch (error) {
        console.error('Şirket bilgileri güncellenemedi:', error);
        return {
          success: false,
          error: error.response?.data?.error || 'Şirket bilgileri güncellenemedi'
        };
      }
    },
    
    // Şirket sürücülerini getir
    getDrivers: async (filters = {}) => {
      try {
        const { data } = await axios.get('/api/drivers', { params: filters });
        return { success: true, data };
      } catch (error) {
        console.error('Sürücü bilgileri alınamadı:', error);
        return {
          success: false,
          error: error.response?.data?.error || 'Sürücü bilgileri alınamadı'
        };
      }
    },
    
    // Şirket araçlarını getir
    getVehicles: async (filters = {}) => {
      try {
        const { data } = await axios.get('/api/vehicles', { params: filters });
        return { success: true, data };
      } catch (error) {
        console.error('Araç bilgileri alınamadı:', error);
        return {
          success: false,
          error: error.response?.data?.error || 'Araç bilgileri alınamadı'
        };
      }
    }
  },
  
  // ===== Sürücü API'leri =====
  driver: {
    // Sürücü bilgilerini getir
    getDetails: async (driverId) => {
      try {
        const { data } = await axios.get(`/api/drivers/${driverId}`);
        return { success: true, data };
      } catch (error) {
        console.error('Sürücü bilgileri alınamadı:', error);
        return {
          success: false,
          error: error.response?.data?.error || 'Sürücü bilgileri alınamadı'
        };
      }
    },
    
    // Sürücü bilgilerini güncelle
    updateDetails: async (driverId, driverData) => {
      try {
        const { data } = await axios.put(`/api/drivers/${driverId}`, driverData);
        return { success: true, data };
      } catch (error) {
        console.error('Sürücü bilgileri güncellenemedi:', error);
        return {
          success: false,
          error: error.response?.data?.error || 'Sürücü bilgileri güncellenemedi'
        };
      }
    },
    
    // Sürücünün taşıma isteklerini getir
    getTransportRequests: async (filters = {}) => {
      try {
        const { data } = await axios.get('/api/transport-requests', { params: filters });
        return { success: true, data };
      } catch (error) {
        console.error('Taşıma istekleri alınamadı:', error);
        return {
          success: false,
          error: error.response?.data?.error || 'Taşıma istekleri alınamadı'
        };
      }
    }
  },
  
  // ===== Araç API'leri =====
  vehicle: {
    // Araç bilgilerini getir
    getDetails: async (vehicleId) => {
      try {
        const { data } = await axios.get(`/api/vehicles/${vehicleId}`);
        return { success: true, data };
      } catch (error) {
        console.error('Araç bilgileri alınamadı:', error);
        return {
          success: false,
          error: error.response?.data?.error || 'Araç bilgileri alınamadı'
        };
      }
    },
    
    // Araç ekle
    create: async (vehicleData) => {
      try {
        const { data } = await axios.post('/api/vehicles', vehicleData);
        return { success: true, data };
      } catch (error) {
        console.error('Araç eklenemedi:', error);
        return {
          success: false,
          error: error.response?.data?.error || 'Araç eklenemedi'
        };
      }
    },
    
    // Araç bilgilerini güncelle
    update: async (vehicleId, vehicleData) => {
      try {
        const { data } = await axios.put(`/api/vehicles/${vehicleId}`, vehicleData);
        return { success: true, data };
      } catch (error) {
        console.error('Araç bilgileri güncellenemedi:', error);
        return {
          success: false,
          error: error.response?.data?.error || 'Araç bilgileri güncellenemedi'
        };
      }
    },
    
    // Araç sil
    delete: async (vehicleId) => {
      try {
        const { data } = await axios.delete(`/api/vehicles/${vehicleId}`);
        return { success: true, data };
      } catch (error) {
        console.error('Araç silinemedi:', error);
        return {
          success: false,
          error: error.response?.data?.error || 'Araç silinemedi'
        };
      }
    }
  },
  
  // ===== Taşıma İsteği API'leri =====
  transportRequest: {
    // Taşıma isteklerini getir
    getAll: async (filters = {}) => {
      try {
        const { data } = await axios.get('/api/transport-requests', { params: filters });
        return { success: true, data };
      } catch (error) {
        console.error('Taşıma istekleri alınamadı:', error);
        return {
          success: false,
          error: error.response?.data?.error || 'Taşıma istekleri alınamadı'
        };
      }
    },
    
    // Taşıma isteği detaylarını getir
    getDetails: async (requestId) => {
      try {
        const { data } = await axios.get(`/api/transport-requests/${requestId}`);
        return { success: true, data };
      } catch (error) {
        console.error('Taşıma isteği detayları alınamadı:', error);
        return {
          success: false,
          error: error.response?.data?.error || 'Taşıma isteği detayları alınamadı'
        };
      }
    },
    
    // Taşıma isteği oluştur
    create: async (requestData) => {
      try {
        const { data } = await axios.post('/api/transport-requests', requestData);
        return { success: true, data };
      } catch (error) {
        console.error('Taşıma isteği oluşturulamadı:', error);
        return {
          success: false,
          error: error.response?.data?.error || 'Taşıma isteği oluşturulamadı'
        };
      }
    },
    
    // Taşıma isteği durumunu güncelle
    updateStatus: async (requestId, statusData) => {
      try {
        const { data } = await axios.put(`/api/transport-requests/${requestId}/status`, statusData);
        return { success: true, data };
      } catch (error) {
        console.error('Taşıma isteği durumu güncellenemedi:', error);
        return {
          success: false,
          error: error.response?.data?.error || 'Taşıma isteği durumu güncellenemedi'
        };
      }
    }
  },
  
  // ===== Admin API'leri =====
  admin: {
    // Dashboard verileri
    getDashboard: async () => {
      try {
        const { data } = await axios.get('/api/admin/dashboard');
        return { success: true, data };
      } catch (error) {
        console.error('Dashboard verileri alınamadı:', error);
        return {
          success: false,
          error: error.response?.data?.error || 'Dashboard verileri alınamadı'
        };
      }
    },
    
    // Kullanıcıları getir
    getUsers: async (filters = {}) => {
      try {
        const { data } = await axios.get('/api/admin/users', { params: filters });
        return { success: true, data };
      } catch (error) {
        console.error('Kullanıcı bilgileri alınamadı:', error);
        return {
          success: false,
          error: error.response?.data?.error || 'Kullanıcı bilgileri alınamadı'
        };
      }
    },
    
    // Kullanıcı ekle
    createUser: async (userData) => {
      try {
        const { data } = await axios.post('/api/admin/users', userData);
        return { success: true, data };
      } catch (error) {
        console.error('Kullanıcı eklenemedi:', error);
        return {
          success: false,
          error: error.response?.data?.error || 'Kullanıcı eklenemedi'
        };
      }
    },
    
    // Kullanıcı güncelle
    updateUser: async (userId, userData) => {
      try {
        const { data } = await axios.put(`/api/admin/users/${userId}`, userData);
        return { success: true, data };
      } catch (error) {
        console.error('Kullanıcı güncellenemedi:', error);
        return {
          success: false,
          error: error.response?.data?.error || 'Kullanıcı güncellenemedi'
        };
      }
    },
    
    // Kullanıcı sil
    deleteUser: async (userId) => {
      try {
        const { data } = await axios.delete(`/api/admin/users/${userId}`);
        return { success: true, data };
      } catch (error) {
        console.error('Kullanıcı silinemedi:', error);
        return {
          success: false,
          error: error.response?.data?.error || 'Kullanıcı silinemedi'
        };
      }
    }
  }
};

export default API; 