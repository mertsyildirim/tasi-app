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
          return await getDocuments(req, res, db);
        case 'POST':
          return await addDocument(req, res, db);
        case 'PUT':
          return await updateDocument(req, res, db);
        case 'DELETE':
          return await deleteDocument(req, res, db);
        default:
          res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Vehicle documents API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Belgeleri getir
async function getDocuments(req, res, db) {
  try {
    const { id, vehicleId } = req.query;
    const { role, id: userId } = req.user;
    const { status, type } = req.query;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Şirket ve araç kontrolü
    const company = await db.collection('companies').findOne({
      _id: new ObjectId(id)
    });

    if (!company) {
      return res.status(404).json({ error: 'Şirket bulunamadı' });
    }

    const vehicle = await db.collection('vehicles').findOne({
      _id: new ObjectId(vehicleId),
      companyId: new ObjectId(id)
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Araç bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && company.userId?.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Bu aracın belgelerini görüntüleme yetkiniz yok' });
    }

    // Filtreleri oluştur
    const query = {
      vehicleId: new ObjectId(vehicleId)
    };

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    // Belgeleri getir
    const documents = await db.collection('vehicle_documents')
      .find(query)
      .sort({ expiryDate: 1 })
      .toArray();

    // Belgeleri kategorize et
    const categorizedDocs = {
      active: documents.filter(doc => 
        doc.status === 'active' && new Date(doc.expiryDate) > new Date()
      ),
      expired: documents.filter(doc => 
        doc.status === 'active' && new Date(doc.expiryDate) <= new Date()
      ),
      pending: documents.filter(doc => doc.status === 'pending'),
      rejected: documents.filter(doc => doc.status === 'rejected')
    };

    // Yakında süresi dolacak belgeleri bul
    const expiringDocs = documents.filter(doc => {
      if (doc.status !== 'active') return false;
      const expiryDate = new Date(doc.expiryDate);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiryDate > new Date() && expiryDate <= thirtyDaysFromNow;
    });

    return res.status(200).json({
      documents: categorizedDocs,
      metadata: {
        total: documents.length,
        active: categorizedDocs.active.length,
        expired: categorizedDocs.expired.length,
        pending: categorizedDocs.pending.length,
        rejected: categorizedDocs.rejected.length,
        expiringSoon: expiringDocs
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    return res.status(500).json({ error: 'Belgeler getirilirken hata oluştu' });
  }
}

// Yeni belge ekle
async function addDocument(req, res, db) {
  try {
    const { id, vehicleId } = req.query;
    const { role, id: userId } = req.user;
    const documentData = req.body;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Zorunlu alanları kontrol et
    const requiredFields = ['type', 'number', 'issueDate', 'expiryDate', 'fileUrl'];
    const missingFields = requiredFields.filter(field => !documentData[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Eksik alanlar var',
        fields: missingFields
      });
    }

    // Şirket ve araç kontrolü
    const company = await db.collection('companies').findOne({
      _id: new ObjectId(id)
    });

    if (!company) {
      return res.status(404).json({ error: 'Şirket bulunamadı' });
    }

    const vehicle = await db.collection('vehicles').findOne({
      _id: new ObjectId(vehicleId),
      companyId: new ObjectId(id)
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Araç bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && company.userId?.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Bu araca belge ekleme yetkiniz yok' });
    }

    // Belge durumunu belirle
    const status = role === 'admin' ? 'active' : 'pending';

    // Yeni belge oluştur
    const newDocument = {
      vehicleId: new ObjectId(vehicleId),
      companyId: new ObjectId(id),
      type: documentData.type,
      number: documentData.number,
      issueDate: new Date(documentData.issueDate),
      expiryDate: new Date(documentData.expiryDate),
      fileUrl: documentData.fileUrl,
      status,
      notes: documentData.notes || '',
      createdAt: new Date(),
      createdBy: new ObjectId(userId),
      updatedAt: new Date(),
      updatedBy: new ObjectId(userId)
    };

    // Belgeyi ekle
    const result = await db.collection('vehicle_documents')
      .insertOne(newDocument);

    if (!result.insertedId) {
      return res.status(400).json({ error: 'Belge eklenemedi' });
    }

    // Araç belgelerini güncelle
    await updateVehicleDocumentStatus(db, vehicleId);

    return res.status(201).json({
      message: 'Belge başarıyla eklendi',
      document: newDocument
    });
  } catch (error) {
    console.error('Add document error:', error);
    return res.status(500).json({ error: 'Belge eklenirken hata oluştu' });
  }
}

// Belge güncelle
async function updateDocument(req, res, db) {
  try {
    const { id, vehicleId } = req.query;
    const { documentId } = req.body;
    const { role, id: userId } = req.user;
    const updateData = req.body;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(vehicleId) || !ObjectId.isValid(documentId)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Şirket ve araç kontrolü
    const company = await db.collection('companies').findOne({
      _id: new ObjectId(id)
    });

    if (!company) {
      return res.status(404).json({ error: 'Şirket bulunamadı' });
    }

    const vehicle = await db.collection('vehicles').findOne({
      _id: new ObjectId(vehicleId),
      companyId: new ObjectId(id)
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Araç bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && company.userId?.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Bu belgeyi güncelleme yetkiniz yok' });
    }

    // Belgeyi kontrol et
    const existingDocument = await db.collection('vehicle_documents').findOne({
      _id: new ObjectId(documentId),
      vehicleId: new ObjectId(vehicleId)
    });

    if (!existingDocument) {
      return res.status(404).json({ error: 'Belge bulunamadı' });
    }

    // Güncellenecek alanları hazırla
    const updateFields = {};
    ['type', 'number', 'issueDate', 'expiryDate', 'fileUrl', 'status', 'notes']
      .forEach(field => {
        if (updateData[field] !== undefined) {
          updateFields[field] = field === 'issueDate' || field === 'expiryDate'
            ? new Date(updateData[field])
            : updateData[field];
        }
      });

    // Sadece admin belge durumunu değiştirebilir
    if (updateFields.status && role !== 'admin') {
      delete updateFields.status;
    }

    // Belgeyi güncelle
    const result = await db.collection('vehicle_documents').updateOne(
      { _id: new ObjectId(documentId) },
      {
        $set: {
          ...updateFields,
          updatedAt: new Date(),
          updatedBy: new ObjectId(userId)
        }
      }
    );

    if (!result.modifiedCount) {
      return res.status(400).json({ error: 'Belge güncellenemedi' });
    }

    // Araç belgelerini güncelle
    await updateVehicleDocumentStatus(db, vehicleId);

    return res.status(200).json({
      message: 'Belge başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Update document error:', error);
    return res.status(500).json({ error: 'Belge güncellenirken hata oluştu' });
  }
}

// Belge sil
async function deleteDocument(req, res, db) {
  try {
    const { id, vehicleId } = req.query;
    const { documentId } = req.body;
    const { role, id: userId } = req.user;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(vehicleId) || !ObjectId.isValid(documentId)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Şirket ve araç kontrolü
    const company = await db.collection('companies').findOne({
      _id: new ObjectId(id)
    });

    if (!company) {
      return res.status(404).json({ error: 'Şirket bulunamadı' });
    }

    const vehicle = await db.collection('vehicles').findOne({
      _id: new ObjectId(vehicleId),
      companyId: new ObjectId(id)
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Araç bulunamadı' });
    }

    // Yetki kontrolü
    if (role !== 'admin' && company.userId?.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Bu belgeyi silme yetkiniz yok' });
    }

    // Belgeyi kontrol et
    const document = await db.collection('vehicle_documents').findOne({
      _id: new ObjectId(documentId),
      vehicleId: new ObjectId(vehicleId)
    });

    if (!document) {
      return res.status(404).json({ error: 'Belge bulunamadı' });
    }

    // Belgeyi sil
    const result = await db.collection('vehicle_documents').deleteOne({
      _id: new ObjectId(documentId)
    });

    if (!result.deletedCount) {
      return res.status(400).json({ error: 'Belge silinemedi' });
    }

    // Araç belgelerini güncelle
    await updateVehicleDocumentStatus(db, vehicleId);

    return res.status(200).json({
      message: 'Belge başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    return res.status(500).json({ error: 'Belge silinirken hata oluştu' });
  }
}

// Araç belge durumunu güncelle
async function updateVehicleDocumentStatus(db, vehicleId) {
  try {
    // Tüm aktif belgeleri getir
    const documents = await db.collection('vehicle_documents')
      .find({
        vehicleId: new ObjectId(vehicleId),
        status: 'active'
      })
      .toArray();

    // Belge durumlarını kontrol et
    const now = new Date();
    const hasExpiredDocs = documents.some(doc => new Date(doc.expiryDate) <= now);
    const hasExpiringDocs = documents.some(doc => {
      const expiryDate = new Date(doc.expiryDate);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiryDate > now && expiryDate <= thirtyDaysFromNow;
    });

    // Araç belge durumunu güncelle
    await db.collection('vehicles').updateOne(
      { _id: new ObjectId(vehicleId) },
      {
        $set: {
          documentStatus: hasExpiredDocs ? 'expired' : hasExpiringDocs ? 'expiring' : 'valid',
          updatedAt: new Date()
        }
      }
    );
  } catch (error) {
    console.error('Update vehicle document status error:', error);
  }
} 