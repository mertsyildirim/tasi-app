import { connectToDatabase } from '../../../src/lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // Token doğrulama
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Yetkilendirme başarısız. Token bulunamadı.' });
  }
  
  try {
    // Token doğrulama
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tasiapp-super-gizli-jwt-anahtar');
    const userRoles = decoded.roles || [];
    
    // Admin kontrolü
    if (!userRoles.includes('admin')) {
      return res.status(403).json({ 
        success: false, 
        message: 'Bu sayfaya erişim yetkiniz bulunmamaktadır. Sadece yöneticiler erişebilir.' 
      });
    }
    
    // Veritabanı bağlantısı
    const conn = await connectToDatabase();
    const db = conn.connection.db;
    
    // GET metodu - Araçları getir
    if (req.method === 'GET') {
      const { status, search, companyId } = req.query;
      
      // Filtreleme koşulları
      let query = {};
      
      if (status) {
        if (status === 'active') {
          query.status = 'active';
        } else if (status === 'maintenance') {
          query.status = 'maintenance';
        } else if (status === 'inactive') {
          query.status = 'inactive';
        } else if (status === 'documents') {
          // Belgesi süresi dolmuş araçları getir
          query.hasExpiredDocuments = true;
        }
      }
      
      if (companyId) {
        query.companyId = new ObjectId(companyId);
      }
      
      if (search) {
        query.$or = [
          { plate: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
          { model: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Araçları getir
      const vehicles = await db.collection('vehicles').find(query).toArray();
      
      // Belge durumlarını kontrol et
      const vehiclesWithDetails = await Promise.all(vehicles.map(async vehicle => {
        let hasExpiredDocuments = false;
        
        // Aracın belgelerini getir
        const documents = await db.collection('vehicleDocuments')
          .find({ vehicleId: vehicle._id })
          .toArray();
        
        // Süresi dolmuş belge var mı kontrol et
        const now = new Date();
        for (const doc of documents) {
          if (doc.validUntil && new Date(doc.validUntil) < now) {
            hasExpiredDocuments = true;
            break;
          }
        }
        
        // Aracın şirket bilgilerini getir
        let company = null;
        if (vehicle.companyId) {
          company = await db.collection('companies').findOne({ _id: new ObjectId(vehicle.companyId) });
        }
        
        // Aracın sürücü bilgilerini getir
        let driver = null;
        if (vehicle.driverId) {
          driver = await db.collection('drivers').findOne({ _id: new ObjectId(vehicle.driverId) });
        }
        
        return {
          id: vehicle._id.toString(),
          plate: vehicle.plate || '',
          brand: vehicle.brand || '',
          model: vehicle.model || '',
          year: vehicle.year || '',
          type: vehicle.type || '',
          capacity: vehicle.capacity || '',
          status: vehicle.status || 'active',
          lastMaintenance: vehicle.lastMaintenance ? new Date(vehicle.lastMaintenance).toLocaleDateString('tr-TR') : '',
          nextMaintenance: vehicle.nextMaintenance ? new Date(vehicle.nextMaintenance).toLocaleDateString('tr-TR') : '',
          company: company?.name || '',
          companyId: vehicle.companyId ? vehicle.companyId.toString() : '',
          driver: driver?.name || '',
          driverId: vehicle.driverId ? vehicle.driverId.toString() : '',
          hasExpiredDocuments,
          documents: documents.map(doc => ({
            id: doc._id.toString(),
            name: doc.name,
            type: doc.isRequired ? 'Zorunlu' : 'Opsiyonel',
            validUntil: doc.validUntil ? new Date(doc.validUntil).toLocaleDateString('tr-TR') : null,
            status: doc.validUntil && new Date(doc.validUntil) < now ? 'Süresi Dolmuş' : 'Aktif',
            fileUrl: doc.fileUrl || ''
          }))
        };
      }));
      
      return res.status(200).json({
        success: true,
        vehicles: vehiclesWithDetails
      });
    }
    
    // POST metodu - Yeni araç ekle
    if (req.method === 'POST') {
      const vehicleData = req.body;
      
      // Zorunlu alanlar kontrolü
      if (!vehicleData.plate || !vehicleData.brand || !vehicleData.model) {
        return res.status(400).json({
          success: false,
          message: 'Plaka, marka ve model alanları zorunludur.'
        });
      }
      
      // CompanyId ve DriverId varsa ObjectId'ye dönüştür
      if (vehicleData.companyId) {
        vehicleData.companyId = new ObjectId(vehicleData.companyId);
      }
      
      if (vehicleData.driverId) {
        vehicleData.driverId = new ObjectId(vehicleData.driverId);
      }
      
      // Tarih alanlarını düzenle
      if (vehicleData.lastMaintenance) {
        vehicleData.lastMaintenance = new Date(vehicleData.lastMaintenance);
      }
      
      if (vehicleData.nextMaintenance) {
        vehicleData.nextMaintenance = new Date(vehicleData.nextMaintenance);
      }
      
      // Yeni araç oluştur
      const newVehicle = {
        plate: vehicleData.plate,
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: vehicleData.year || '',
        type: vehicleData.type || '',
        capacity: vehicleData.capacity || '',
        status: vehicleData.status || 'active',
        companyId: vehicleData.companyId || null,
        driverId: vehicleData.driverId || null,
        lastMaintenance: vehicleData.lastMaintenance || null,
        nextMaintenance: vehicleData.nextMaintenance || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Veritabanına ekle
      const result = await db.collection('vehicles').insertOne(newVehicle);
      
      if (result.acknowledged) {
        return res.status(201).json({
          success: true,
          message: 'Araç başarıyla eklendi.',
          vehicle: {
            _id: result.insertedId,
            ...newVehicle
          }
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Araç eklenirken bir hata oluştu.'
        });
      }
    }
    
    // PUT metodu - Araç güncelle
    if (req.method === 'PUT') {
      const { id } = req.query;
      const updateData = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Araç ID\'si gereklidir.'
        });
      }
      
      // CompanyId ve DriverId varsa ObjectId'ye dönüştür
      if (updateData.companyId) {
        updateData.companyId = new ObjectId(updateData.companyId);
      }
      
      if (updateData.driverId) {
        updateData.driverId = new ObjectId(updateData.driverId);
      }
      
      // Tarih alanlarını düzenle
      if (updateData.lastMaintenance) {
        updateData.lastMaintenance = new Date(updateData.lastMaintenance);
      }
      
      if (updateData.nextMaintenance) {
        updateData.nextMaintenance = new Date(updateData.nextMaintenance);
      }
      
      // Güncelleme verilerini hazırla
      const updatedData = {
        ...updateData,
        updatedAt: new Date()
      };
      
      const result = await db.collection('vehicles').updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );
      
      if (result.matchedCount > 0) {
        return res.status(200).json({
          success: true,
          message: 'Araç başarıyla güncellendi.'
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Araç bulunamadı.'
        });
      }
    }
    
    // DELETE metodu - Araç sil
    if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Araç ID\'si gereklidir.'
        });
      }
      
      const result = await db.collection('vehicles').deleteOne({ _id: new ObjectId(id) });
      
      if (result.deletedCount > 0) {
        // İlgili belgeleri de sil
        await db.collection('vehicleDocuments').deleteMany({ vehicleId: new ObjectId(id) });
        
        return res.status(200).json({
          success: true,
          message: 'Araç başarıyla silindi.'
        });
      } else {
        return res.status(404).json({
          success: false,
          message: 'Araç bulunamadı.'
        });
      }
    }
    
    // Desteklenmeyen metot
    return res.status(405).json({
      success: false,
      message: 'Metot izin verilmiyor'
    });
    
  } catch (error) {
    console.error('API hatası:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz veya süresi dolmuş token.'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.'
    });
  }
} 