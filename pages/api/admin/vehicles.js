import { connectToDatabase } from '../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(req, res, authOptions);
    console.log('Session:', session);

    if (!session) {
      return res.status(401).json({ error: 'Oturum bulunamadı' });
    }

    // Veritabanı bağlantısı
    const { db } = await connectToDatabase();

    // HTTP metoduna göre işlem yap
    switch (req.method) {
      case 'GET':
        return await getVehicles(req, res, db);
      case 'POST':
        return await createVehicle(req, res, db);
      case 'PUT':
        return await updateVehicle(req, res, db);
      case 'DELETE':
        return await deleteVehicle(req, res, db);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Vehicles API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Araçları listele
async function getVehicles(req, res, db) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Arama filtresi oluştur
    let filter = {};
    if (req.query.search) {
      filter = {
        $or: [
          { plateNumber: { $regex: req.query.search, $options: 'i' } },
          { brand: { $regex: req.query.search, $options: 'i' } },
          { model: { $regex: req.query.search, $options: 'i' } }
        ]
      };
    }

    // Toplam araç sayısını al
    const total = await db.collection('vehicles').countDocuments(filter);
    
    // Araçları getir
    const vehicles = await db.collection('vehicles')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    return res.status(200).json({
      vehicles,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Get Vehicles Error:', error);
    return res.status(500).json({ error: 'Araçlar listelenirken bir hata oluştu' });
  }
}

// Yeni araç oluştur
async function createVehicle(req, res, db) {
  try {
    const { plateNumber, brand, model, year, capacity, status } = req.body;

    // Zorunlu alanları kontrol et
    if (!plateNumber || !brand || !model) {
      return res.status(400).json({ error: 'Plaka, marka ve model alanları zorunludur' });
    }

    // Plaka numarasının benzersiz olduğunu kontrol et
    const existingVehicle = await db.collection('vehicles').findOne({ plateNumber });
    if (existingVehicle) {
      return res.status(400).json({ error: 'Bu plaka numarası zaten kayıtlı' });
    }

    // Yeni araç oluştur
    const newVehicle = {
      plateNumber,
      brand,
      model,
      year,
      capacity,
      status: status || 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('vehicles').insertOne(newVehicle);
    return res.status(201).json({ vehicle: { ...newVehicle, _id: result.insertedId } });
  } catch (error) {
    console.error('Create Vehicle Error:', error);
    return res.status(500).json({ error: 'Araç oluşturulurken bir hata oluştu' });
  }
}

// Araç güncelle
async function updateVehicle(req, res, db) {
  try {
    const { id } = req.query;
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz araç ID' });
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    delete updateData._id; // _id alanını güncelleme verisinden çıkar

    const result = await db.collection('vehicles').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return res.status(404).json({ error: 'Araç bulunamadı' });
    }

    return res.status(200).json({ vehicle: result.value });
  } catch (error) {
    console.error('Update Vehicle Error:', error);
    return res.status(500).json({ error: 'Araç güncellenirken bir hata oluştu' });
  }
}

// Araç sil
async function deleteVehicle(req, res, db) {
  try {
    const { id } = req.query;
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz araç ID' });
    }

    const result = await db.collection('vehicles').findOneAndDelete({
      _id: new ObjectId(id)
    });

    if (!result.value) {
      return res.status(404).json({ error: 'Araç bulunamadı' });
    }

    return res.status(200).json({ message: 'Araç başarıyla silindi' });
  } catch (error) {
    console.error('Delete Vehicle Error:', error);
    return res.status(500).json({ error: 'Araç silinirken bir hata oluştu' });
  }
} 