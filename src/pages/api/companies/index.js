import { connectToDatabase } from '@/lib/mongodb';
import { authMiddleware, roleMiddleware } from '@/middleware/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    // Auth kontrolü
    await authMiddleware(req, res, async () => {
      const { method } = req;
      const { db } = await connectToDatabase();

      switch (method) {
        case 'GET':
          return await getCompanies(req, res, db);
        case 'POST':
          // Sadece admin yeni şirket ekleyebilir
          return await roleMiddleware(['admin'])(req, res, async () => {
            return await createCompany(req, res, db);
          });
        default:
          res.setHeader('Allow', ['GET', 'POST']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Companies API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Şirketleri listele
async function getCompanies(req, res, db) {
  try {
    const { role } = req.user;
    const {
      page = 1,
      limit = 10,
      search,
      status,
      city,
      companyType,
      sortBy = 'name',
      sortOrder = 'asc',
      isVerified
    } = req.query;

    // Yetki kontrolü
    if (role !== 'admin') {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }

    // Filtreleri oluştur
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { taxNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (city) {
      query.city = city;
    }

    if (companyType) {
      query.companyType = companyType;
    }

    if (isVerified !== undefined) {
      query.isVerified = isVerified === 'true';
    }

    // Toplam sayıyı hesapla
    const total = await db.collection('companies').countDocuments(query);

    // Sıralama ayarları
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Sayfalama
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Şirketleri getir
    const companies = await db.collection('companies')
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // İstatistikleri hesapla
    const stats = {
      total,
      active: await db.collection('companies').countDocuments({ ...query, status: 'active' }),
      pending: await db.collection('companies').countDocuments({ ...query, status: 'pending' }),
      suspended: await db.collection('companies').countDocuments({ ...query, status: 'suspended' }),
      verified: await db.collection('companies').countDocuments({ ...query, isVerified: true }),
      totalFleetSize: await db.collection('companies')
        .aggregate([
          { $match: query },
          { $group: { _id: null, total: { $sum: '$fleetSize' } } }
        ]).toArray().then(result => result[0]?.total || 0),
      averageRating: await db.collection('companies')
        .aggregate([
          { $match: query },
          { $group: { _id: null, avg: { $avg: '$rating' } } }
        ]).toArray().then(result => result[0]?.avg || 0)
    };

    // Şehirlere göre dağılım
    const cityDistribution = await db.collection('companies')
      .aggregate([
        { $match: query },
        { $group: { _id: '$city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]).toArray();

    // Şirket türlerine göre dağılım
    const typeDistribution = await db.collection('companies')
      .aggregate([
        { $match: query },
        { $group: { _id: '$companyType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]).toArray();

    return res.status(200).json({
      companies,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      },
      stats,
      distributions: {
        cities: cityDistribution,
        types: typeDistribution
      }
    });

  } catch (error) {
    console.error('Get companies error:', error);
    return res.status(500).json({ error: 'Şirketler listelenirken hata oluştu' });
  }
}

// Yeni şirket oluştur
async function createCompany(req, res, db) {
  try {
    const {
      name,
      taxNumber,
      address,
      phone,
      email,
      contactPerson,
      fleetSize,
      serviceAreas
    } = req.body;

    // Validasyon
    if (!name || !taxNumber || !address || !phone || !email) {
      return res.status(400).json({ error: 'Tüm zorunlu alanları doldurun' });
    }

    // Vergi numarası kontrolü
    const existingCompany = await db.collection('companies').findOne({ taxNumber });
    if (existingCompany) {
      return res.status(400).json({ error: 'Bu vergi numarası ile kayıtlı şirket bulunmaktadır' });
    }

    // Yeni şirket oluştur
    const company = {
      name,
      taxNumber,
      address,
      phone,
      email,
      contactPerson,
      fleetSize: parseInt(fleetSize) || 0,
      serviceAreas: serviceAreas || [],
      status: 'pending',
      rating: 0,
      completedJobs: 0,
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('companies').insertOne(company);

    return res.status(201).json({
      message: 'Şirket başarıyla oluşturuldu',
      company: {
        id: result.insertedId,
        ...company
      }
    });
  } catch (error) {
    console.error('Create company error:', error);
    return res.status(500).json({ error: 'Şirket oluşturulurken hata oluştu' });
  }
} 