import { connectToDatabase } from '@/lib/mongodb';
import { authMiddleware } from '@/middleware/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await authMiddleware(req, res, async () => {
      const { db } = await connectToDatabase();
      const { id: userId, role } = req.user;
      const {
        name,
        taxNumber,
        taxOffice,
        address,
        city,
        district,
        phone,
        email,
        website,
        contactPerson,
        companyType,
        employeeCount,
        fleetSize
      } = req.body;

      // Zorunlu alan kontrolü
      const requiredFields = ['name', 'taxNumber', 'taxOffice', 'address', 'city', 'district', 'phone', 'email', 'contactPerson'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      if (missingFields.length > 0) {
        return res.status(400).json({
          error: 'Eksik bilgi',
          fields: missingFields
        });
      }

      // Vergi numarası kontrolü
      if (!/^\d{10}$/.test(taxNumber)) {
        return res.status(400).json({ error: 'Geçersiz vergi numarası formatı' });
      }

      // Vergi numarası benzersiz mi kontrolü
      const existingCompany = await db.collection('companies').findOne({ taxNumber });
      if (existingCompany) {
        return res.status(400).json({ error: 'Bu vergi numarası ile kayıtlı bir şirket bulunmakta' });
      }

      // Yeni şirket oluştur
      const newCompany = {
        name,
        taxNumber,
        taxOffice,
        address,
        city,
        district,
        phone,
        email,
        website: website || null,
        contactPerson,
        companyType: companyType || 'logistics',
        employeeCount: parseInt(employeeCount) || 0,
        fleetSize: parseInt(fleetSize) || 0,
        status: role === 'admin' ? 'active' : 'pending',
        isVerified: false,
        rating: 0,
        totalRatings: 0,
        completedTransports: 0,
        cancelledTransports: 0,
        documents: [],
        userId: new ObjectId(userId),
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          notifications: {
            email: true,
            sms: true,
            push: true
          },
          billing: {
            autoInvoice: false,
            paymentDue: 30
          },
          preferences: {
            language: 'tr',
            currency: 'TRY',
            timezone: 'Europe/Istanbul'
          }
        }
      };

      const result = await db.collection('companies').insertOne(newCompany);

      if (!result.insertedId) {
        return res.status(500).json({ error: 'Şirket kaydı oluşturulamadı' });
      }

      // Kullanıcı rolünü güncelle
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            role: 'company',
            companyId: result.insertedId
          }
        }
      );

      // Admin'e bildirim gönder
      if (role !== 'admin') {
        await db.collection('notifications').insertOne({
          type: 'NEW_COMPANY_REGISTRATION',
          companyId: result.insertedId,
          status: 'unread',
          message: `Yeni şirket kaydı: ${name}`,
          createdAt: new Date()
        });
      }

      return res.status(201).json({
        message: role === 'admin' ? 'Şirket başarıyla oluşturuldu' : 'Şirket kaydınız incelendikten sonra aktif edilecektir',
        company: newCompany
      });
    });
  } catch (error) {
    console.error('Company register error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
} 