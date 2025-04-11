import { connectToDatabase } from '@/lib/mongodb';
import { authMiddleware, roleMiddleware } from '@/middleware/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    await authMiddleware(req, res, async () => {
      const { method } = req;
      const { db } = await connectToDatabase();

      switch (method) {
        case 'GET':
          return await getDocuments(req, res, db);
        case 'POST':
          return await addDocument(req, res, db);
        case 'DELETE':
          return await deleteDocument(req, res, db);
        default:
          res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Company documents API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Dokümanları getir
async function getDocuments(req, res, db) {
  try {
    const { id } = req.query;
    const { role, id: userId } = req.user;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz şirket ID' });
    }

    const company = await db.collection('companies').findOne({
      _id: new ObjectId(id)
    });

    if (!company) {
      return res.status(404).json({ error: 'Şirket bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && company.userId?.toString() !== userId) {
      return res.status(403).json({ error: 'Bu şirketin dokümanlarını görüntüleme yetkiniz yok' });
    }

    return res.status(200).json({
      documents: company.documents || []
    });
  } catch (error) {
    console.error('Get documents error:', error);
    return res.status(500).json({ error: 'Dokümanlar getirilirken hata oluştu' });
  }
}

// Yeni doküman ekle
async function addDocument(req, res, db) {
  try {
    const { id } = req.query;
    const { role, id: userId } = req.user;
    const { name, type, url, expiryDate } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz şirket ID' });
    }

    // Validasyon
    if (!name || !type || !url) {
      return res.status(400).json({ error: 'Tüm zorunlu alanları doldurun' });
    }

    const company = await db.collection('companies').findOne({
      _id: new ObjectId(id)
    });

    if (!company) {
      return res.status(404).json({ error: 'Şirket bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && company.userId?.toString() !== userId) {
      return res.status(403).json({ error: 'Bu şirkete doküman ekleme yetkiniz yok' });
    }

    const document = {
      id: new ObjectId(),
      name,
      type,
      url,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      status: 'pending',
      uploadedAt: new Date(),
      updatedAt: new Date()
    };

    // Dokümanı ekle
    const result = await db.collection('companies').updateOne(
      { _id: new ObjectId(id) },
      { 
        $push: { documents: document },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: 'Doküman eklenemedi' });
    }

    // Bildirim gönder (admin için)
    if (role !== 'admin') {
      await sendDocumentNotification(db, company, document, 'NEW');
    }

    return res.status(201).json({
      message: 'Doküman başarıyla eklendi',
      document
    });
  } catch (error) {
    console.error('Add document error:', error);
    return res.status(500).json({ error: 'Doküman eklenirken hata oluştu' });
  }
}

// Doküman sil
async function deleteDocument(req, res, db) {
  try {
    const { id } = req.query;
    const { documentId } = req.body;
    const { role, id: userId } = req.user;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(documentId)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    const company = await db.collection('companies').findOne({
      _id: new ObjectId(id)
    });

    if (!company) {
      return res.status(404).json({ error: 'Şirket bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && company.userId?.toString() !== userId) {
      return res.status(403).json({ error: 'Bu dokümanı silme yetkiniz yok' });
    }

    // Dokümanı sil
    const result = await db.collection('companies').updateOne(
      { _id: new ObjectId(id) },
      { 
        $pull: { documents: { id: new ObjectId(documentId) } },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ error: 'Doküman silinemedi' });
    }

    // Bildirim gönder (admin için)
    if (role !== 'admin') {
      const document = company.documents.find(d => d.id.toString() === documentId);
      if (document) {
        await sendDocumentNotification(db, company, document, 'DELETE');
      }
    }

    return res.status(200).json({
      message: 'Doküman başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    return res.status(500).json({ error: 'Doküman silinirken hata oluştu' });
  }
}

// Doküman bildirimi gönder
async function sendDocumentNotification(db, company, document, action) {
  try {
    const notification = {
      type: 'COMPANY_DOCUMENT',
      title: action === 'NEW' ? 'Yeni Doküman Yüklendi' : 'Doküman Silindi',
      message: action === 'NEW' 
        ? `${company.name} şirketi yeni bir doküman yükledi: ${document.name}`
        : `${company.name} şirketi bir doküman sildi: ${document.name}`,
      status: 'unread',
      metadata: {
        companyId: company._id,
        documentId: document.id,
        action
      },
      createdAt: new Date()
    };

    // Admin kullanıcılarını bul
    const admins = await db.collection('users')
      .find({ role: 'admin' })
      .toArray();

    // Her admin için bildirim oluştur
    const notifications = admins.map(admin => ({
      ...notification,
      userId: admin._id
    }));

    if (notifications.length > 0) {
      await db.collection('notifications').insertMany(notifications);
    }
  } catch (error) {
    console.error('Send document notification error:', error);
  }
} 