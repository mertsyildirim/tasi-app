import { connectToDatabase } from '@/lib/mongodb';
import { authMiddleware } from '@/middleware/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    await authMiddleware(req, res, async () => {
      const { method } = req;
      const { db } = await connectToDatabase();

      switch (method) {
        case 'GET':
          return await getRatings(req, res, db);
        case 'POST':
          return await addRating(req, res, db);
        case 'PUT':
          return await updateRating(req, res, db);
        case 'DELETE':
          return await deleteRating(req, res, db);
        default:
          res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Company ratings API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Değerlendirmeleri getir
async function getRatings(req, res, db) {
  try {
    const { id } = req.query;
    const { page = 1, limit = 10, sort = 'latest' } = req.query;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz şirket ID' });
    }

    const skip = (page - 1) * limit;
    const sortOptions = {
      latest: { createdAt: -1 },
      highest: { rating: -1 },
      lowest: { rating: 1 }
    };

    const ratings = await db.collection('ratings')
      .find({ companyId: new ObjectId(id) })
      .sort(sortOptions[sort] || sortOptions.latest)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    const total = await db.collection('ratings')
      .countDocuments({ companyId: new ObjectId(id) });

    // Ortalama puanı hesapla
    const averageRating = await db.collection('ratings')
      .aggregate([
        { $match: { companyId: new ObjectId(id) } },
        { $group: {
          _id: null,
          average: { $avg: '$rating' },
          count: { $sum: 1 }
        }}
      ]).toArray();

    // Kullanıcı bilgilerini ekle
    const ratingsWithUser = await Promise.all(ratings.map(async (rating) => {
      const user = await db.collection('users').findOne(
        { _id: rating.userId },
        { projection: { name: 1, avatar: 1 } }
      );
      return {
        ...rating,
        user: user ? {
          name: user.name,
          avatar: user.avatar
        } : null
      };
    }));

    return res.status(200).json({
      ratings: ratingsWithUser,
      metadata: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        averageRating: averageRating[0]?.average || 0,
        totalRatings: averageRating[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    return res.status(500).json({ error: 'Değerlendirmeler getirilirken hata oluştu' });
  }
}

// Yeni değerlendirme ekle
async function addRating(req, res, db) {
  try {
    const { id } = req.query;
    const { id: userId, role } = req.user;
    const { rating, comment } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz şirket ID' });
    }

    // Validasyon
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Geçerli bir puan girin (1-5)' });
    }

    // Şirketin varlığını kontrol et
    const company = await db.collection('companies').findOne({
      _id: new ObjectId(id)
    });

    if (!company) {
      return res.status(404).json({ error: 'Şirket bulunamadı' });
    }

    // Kullanıcının daha önce değerlendirme yapıp yapmadığını kontrol et
    const existingRating = await db.collection('ratings').findOne({
      companyId: new ObjectId(id),
      userId: new ObjectId(userId)
    });

    if (existingRating) {
      return res.status(400).json({ error: 'Bu şirket için zaten bir değerlendirmeniz var' });
    }

    // Yeni değerlendirme oluştur
    const newRating = {
      companyId: new ObjectId(id),
      userId: new ObjectId(userId),
      rating,
      comment,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('ratings').insertOne(newRating);

    if (!result.insertedId) {
      return res.status(400).json({ error: 'Değerlendirme eklenemedi' });
    }

    // Şirket sahibine bildirim gönder
    await sendRatingNotification(db, company, newRating, 'NEW');

    return res.status(201).json({
      message: 'Değerlendirme başarıyla eklendi',
      rating: newRating
    });
  } catch (error) {
    console.error('Add rating error:', error);
    return res.status(500).json({ error: 'Değerlendirme eklenirken hata oluştu' });
  }
}

// Değerlendirme güncelle
async function updateRating(req, res, db) {
  try {
    const { id } = req.query;
    const { ratingId } = req.body;
    const { id: userId, role } = req.user;
    const { rating, comment } = req.body;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(ratingId)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Validasyon
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Geçerli bir puan girin (1-5)' });
    }

    // Değerlendirmeyi bul
    const existingRating = await db.collection('ratings').findOne({
      _id: new ObjectId(ratingId),
      companyId: new ObjectId(id)
    });

    if (!existingRating) {
      return res.status(404).json({ error: 'Değerlendirme bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && existingRating.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Bu değerlendirmeyi güncelleme yetkiniz yok' });
    }

    // Değerlendirmeyi güncelle
    const result = await db.collection('ratings').updateOne(
      { _id: new ObjectId(ratingId) },
      {
        $set: {
          rating,
          comment,
          updatedAt: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: 'Değerlendirme güncellenemedi' });
    }

    return res.status(200).json({
      message: 'Değerlendirme başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Update rating error:', error);
    return res.status(500).json({ error: 'Değerlendirme güncellenirken hata oluştu' });
  }
}

// Değerlendirme sil
async function deleteRating(req, res, db) {
  try {
    const { id } = req.query;
    const { ratingId } = req.body;
    const { id: userId, role } = req.user;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(ratingId)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Değerlendirmeyi bul
    const rating = await db.collection('ratings').findOne({
      _id: new ObjectId(ratingId),
      companyId: new ObjectId(id)
    });

    if (!rating) {
      return res.status(404).json({ error: 'Değerlendirme bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && rating.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Bu değerlendirmeyi silme yetkiniz yok' });
    }

    // Değerlendirmeyi sil
    const result = await db.collection('ratings').deleteOne({
      _id: new ObjectId(ratingId)
    });

    if (result.deletedCount === 0) {
      return res.status(400).json({ error: 'Değerlendirme silinemedi' });
    }

    return res.status(200).json({
      message: 'Değerlendirme başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete rating error:', error);
    return res.status(500).json({ error: 'Değerlendirme silinirken hata oluştu' });
  }
}

// Değerlendirme bildirimi gönder
async function sendRatingNotification(db, company, rating, action) {
  try {
    const notification = {
      type: 'COMPANY_RATING',
      title: 'Yeni Değerlendirme',
      message: `Şirketiniz için yeni bir değerlendirme yapıldı. Puan: ${rating.rating}`,
      status: 'unread',
      metadata: {
        companyId: company._id,
        ratingId: rating._id,
        rating: rating.rating
      },
      userId: company.userId,
      createdAt: new Date()
    };

    await db.collection('notifications').insertOne(notification);
  } catch (error) {
    console.error('Send rating notification error:', error);
  }
} 