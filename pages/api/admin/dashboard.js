import { connectToDatabase } from '../../../src/lib/mongodb';
import { setupCORS, handleOptionsRequest, sendSuccess, sendError, logRequest } from '../../../src/lib/api-utils';

export default async function handler(req, res) {
  // CORS ayarlarını ekle
  setupCORS(res);
  
  // OPTIONS isteğini işle
  if (handleOptionsRequest(req, res)) {
    return;
  }
  
  // İsteği logla
  logRequest(req);
  
  // Sadece GET isteklerini işle
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return sendError(res, `Method ${req.method} not allowed`, 405);
  }
  
  try {
    // Veritabanına bağlan
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // Tüm istatistikleri veritabanından çek
    const [
      userCount,
      companyCount,
      driverCount,
      vehicleCount,
      requestCount,
      activeTransportCount,
      completedTransportCount,
      pendingTransportCount,
      recentUsers,
      recentCompanies,
      recentRequests
    ] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('companies').countDocuments(),
      db.collection('drivers').countDocuments(),
      db.collection('vehicles').countDocuments(),
      db.collection('transportRequests').countDocuments(),
      db.collection('transports').countDocuments({ status: 'active' }),
      db.collection('transports').countDocuments({ status: 'completed' }),
      db.collection('transports').countDocuments({ status: 'pending' }),
      db.collection('users').find().sort({ createdAt: -1 }).limit(5).toArray(),
      db.collection('companies').find().sort({ createdAt: -1 }).limit(5).toArray(),
      db.collection('transportRequests').find().sort({ createdAt: -1 }).limit(5).toArray()
    ]);
    
    // Aylık taşıma trend verileri
    const monthlyTransportData = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Son 6 ay için aylık taşıma verilerini topla
    for (let i = 5; i >= 0; i--) {
      const month = now.getMonth() - i;
      const year = currentYear + Math.floor(month / 12);
      const adjustedMonth = ((month % 12) + 12) % 12; // Negatif ay değerini işle
      
      const startDate = new Date(year, adjustedMonth, 1);
      const endDate = new Date(year, adjustedMonth + 1, 0);
      
      const count = await db.collection('transports').countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      });
      
      monthlyTransportData.push({
        month: startDate.toLocaleString('tr-TR', { month: 'short' }),
        count
      });
    }
    
    // Kullanıcı verilerini formatla
    const formattedUsers = recentUsers.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.roles?.[0] || 'customer',
      status: user.isActive ? 'active' : 'inactive',
      createdAt: user.createdAt
    }));
    
    // Şirket verilerini formatla
    const formattedCompanies = recentCompanies.map(company => ({
      id: company._id.toString(),
      name: company.name,
      email: company.email || '',
      phone: company.phone || '',
      status: company.status || 'active',
      createdAt: company.createdAt
    }));
    
    // Taşıma talepleri verilerini formatla
    const formattedRequests = recentRequests.map(request => ({
      id: request._id.toString(),
      title: request.title || `Taşıma #${request._id.toString().substr(-6)}`,
      status: request.status || 'pending',
      origin: request.origin?.address || 'Belirtilmemiş',
      destination: request.destination?.address || 'Belirtilmemiş',
      createdAt: request.createdAt
    }));
    
    // Tüm verileri bir araya getir
    const dashboardData = {
      counts: {
        users: userCount,
        companies: companyCount,
        drivers: driverCount,
        vehicles: vehicleCount,
        transportRequests: requestCount,
        activeTransports: activeTransportCount,
        completedTransports: completedTransportCount,
        pendingTransports: pendingTransportCount
      },
      recent: {
        users: formattedUsers,
        companies: formattedCompanies,
        transportRequests: formattedRequests
      },
      trends: {
        monthlyTransportData
      }
    };
    
    return sendSuccess(res, dashboardData);
  } catch (error) {
    console.error('Dashboard API error:', error);
    return sendError(res, 'Dashboard verileri yüklenirken bir hata oluştu', 500, error);
  }
} 