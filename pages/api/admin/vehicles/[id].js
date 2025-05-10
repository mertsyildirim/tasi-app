import { connectToDatabase } from '../../../../lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    // Oturum kontrolü
    const session = await getServerSession(req, res, authOptions);
    console.log('Session:', session);

    if (!session) {
      return res.status(401).json({ error: 'Oturum bulunamadı' });
    }

    // ID kontrolü
    const { id } = req.query;
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz araç ID' });
    }

    // Veritabanı bağlantısı
    const { db } = await connectToDatabase();

    // HTTP metoduna göre işlem yap
    switch (req.method) {
      case 'GET':
        return await getVehicle(req, res, db, id);
      case 'PUT':
        return await updateVehicle(req, res, db, id);
      case 'DELETE':
        return await deleteVehicle(req, res, db, id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Vehicle Detail API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Araç detaylarını getir
async function getVehicle(req, res, db, id) {
  try {
    const vehicle = await db.collection('vehicles').findOne({
      _id: new ObjectId(id)
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Araç bulunamadı' });
    }

    return res.status(200).json({ vehicle });
  } catch (error) {
    console.error('Get Vehicle Error:', error);
    return res.status(500).json({ error: 'Araç detayları alınırken bir hata oluştu' });
  }
}

// Araç güncelle
async function updateVehicle(req, res, db, id) {
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    delete updateData._id; // _id alanını güncelleme verisinden çıkar

    // Zorunlu alanları kontrol et
    if (!updateData.plateNumber || !updateData.brand || !updateData.model) {
      return res.status(400).json({ error: 'Plaka, marka ve model alanları zorunludur' });
    }

    // Plaka numarasının benzersiz olduğunu kontrol et (kendi ID'si hariç)
    const existingVehicle = await db.collection('vehicles').findOne({
      _id: { $ne: new ObjectId(id) },
      plateNumber: updateData.plateNumber
    });

    if (existingVehicle) {
      return res.status(400).json({ error: 'Bu plaka numarası başka bir araç tarafından kullanılıyor' });
    }

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
async function deleteVehicle(req, res, db, id) {
  try {
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