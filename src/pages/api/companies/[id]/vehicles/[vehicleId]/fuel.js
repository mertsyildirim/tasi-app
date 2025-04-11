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
          return await getFuelRecords(req, res, db);
        case 'POST':
          return await addFuelRecord(req, res, db);
        case 'PUT':
          return await updateFuelRecord(req, res, db);
        case 'DELETE':
          return await deleteFuelRecord(req, res, db);
        default:
          res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Vehicle fuel API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Yakıt kayıtlarını getir
async function getFuelRecords(req, res, db) {
  try {
    const { id, vehicleId } = req.query;
    const { role, id: userId } = req.user;
    const { startDate, endDate, limit = 50 } = req.query;

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
      return res.status(403).json({ error: 'Bu aracın yakıt kayıtlarını görüntüleme yetkiniz yok' });
    }

    // Filtreleri oluştur
    const query = {
      vehicleId: new ObjectId(vehicleId)
    };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Yakıt kayıtlarını getir
    const fuelRecords = await db.collection('vehicle_fuel')
      .find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .toArray();

    // İstatistikleri hesapla
    const stats = fuelRecords.reduce((acc, record) => {
      acc.totalLiters += record.liters;
      acc.totalCost += record.cost;
      if (record.kilometers) {
        const prevRecord = fuelRecords.find(r => 
          r.date < record.date && r.kilometers && r.liters
        );
        if (prevRecord) {
          const distance = record.kilometers - prevRecord.kilometers;
          const consumption = (record.liters / distance) * 100;
          acc.consumptionData.push({
            date: record.date,
            consumption
          });
        }
      }
      return acc;
    }, { totalLiters: 0, totalCost: 0, consumptionData: [] });

    // Ortalama tüketimi hesapla
    const avgConsumption = stats.consumptionData.length > 0
      ? stats.consumptionData.reduce((sum, data) => sum + data.consumption, 0) / stats.consumptionData.length
      : null;

    return res.status(200).json({
      records: fuelRecords,
      metadata: {
        total: fuelRecords.length,
        totalLiters: stats.totalLiters,
        totalCost: stats.totalCost,
        averageConsumption: avgConsumption,
        consumptionTrend: stats.consumptionData
      }
    });
  } catch (error) {
    console.error('Get fuel records error:', error);
    return res.status(500).json({ error: 'Yakıt kayıtları getirilirken hata oluştu' });
  }
}

// Yeni yakıt kaydı ekle
async function addFuelRecord(req, res, db) {
  try {
    const { id, vehicleId } = req.query;
    const { role, id: userId } = req.user;
    const fuelData = req.body;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Zorunlu alanları kontrol et
    const requiredFields = ['date', 'liters', 'cost', 'kilometers'];
    const missingFields = requiredFields.filter(field => !fuelData[field]);
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
      return res.status(403).json({ error: 'Bu araca yakıt kaydı ekleme yetkiniz yok' });
    }

    // Kilometre kontrolü
    const lastRecord = await db.collection('vehicle_fuel')
      .findOne(
        { vehicleId: new ObjectId(vehicleId) },
        { sort: { kilometers: -1 } }
      );

    if (lastRecord && fuelData.kilometers <= lastRecord.kilometers) {
      return res.status(400).json({ error: 'Kilometre değeri son kayıttan küçük olamaz' });
    }

    // Yeni yakıt kaydı oluştur
    const newFuelRecord = {
      vehicleId: new ObjectId(vehicleId),
      companyId: new ObjectId(id),
      date: new Date(fuelData.date),
      liters: parseFloat(fuelData.liters),
      cost: parseFloat(fuelData.cost),
      kilometers: parseInt(fuelData.kilometers),
      location: fuelData.location || null,
      notes: fuelData.notes || '',
      fuelType: fuelData.fuelType || vehicle.fuelType,
      createdAt: new Date(),
      createdBy: new ObjectId(userId),
      updatedAt: new Date(),
      updatedBy: new ObjectId(userId)
    };

    // Yakıt kaydını ekle
    const result = await db.collection('vehicle_fuel')
      .insertOne(newFuelRecord);

    if (!result.insertedId) {
      return res.status(400).json({ error: 'Yakıt kaydı eklenemedi' });
    }

    // Aracın kilometre bilgisini güncelle
    await db.collection('vehicles').updateOne(
      { _id: new ObjectId(vehicleId) },
      {
        $set: {
          currentKilometers: newFuelRecord.kilometers,
          lastFuel: {
            date: newFuelRecord.date,
            liters: newFuelRecord.liters,
            cost: newFuelRecord.cost
          },
          updatedAt: new Date()
        }
      }
    );

    return res.status(201).json({
      message: 'Yakıt kaydı başarıyla eklendi',
      fuelRecord: newFuelRecord
    });
  } catch (error) {
    console.error('Add fuel record error:', error);
    return res.status(500).json({ error: 'Yakıt kaydı eklenirken hata oluştu' });
  }
}

// Yakıt kaydını güncelle
async function updateFuelRecord(req, res, db) {
  try {
    const { id, vehicleId } = req.query;
    const { fuelId } = req.body;
    const { role, id: userId } = req.user;
    const updateData = req.body;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(vehicleId) || !ObjectId.isValid(fuelId)) {
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
      return res.status(403).json({ error: 'Bu yakıt kaydını güncelleme yetkiniz yok' });
    }

    // Yakıt kaydını kontrol et
    const existingFuelRecord = await db.collection('vehicle_fuel').findOne({
      _id: new ObjectId(fuelId),
      vehicleId: new ObjectId(vehicleId)
    });

    if (!existingFuelRecord) {
      return res.status(404).json({ error: 'Yakıt kaydı bulunamadı' });
    }

    // Kilometre kontrolü
    if (updateData.kilometers) {
      const otherRecords = await db.collection('vehicle_fuel')
        .find({
          vehicleId: new ObjectId(vehicleId),
          _id: { $ne: new ObjectId(fuelId) }
        })
        .sort({ kilometers: -1 })
        .toArray();

      const nextRecord = otherRecords.find(r => r.date > existingFuelRecord.date);
      const prevRecord = otherRecords.find(r => r.date < existingFuelRecord.date);

      if (nextRecord && updateData.kilometers >= nextRecord.kilometers) {
        return res.status(400).json({ error: 'Kilometre değeri sonraki kayıttan büyük olamaz' });
      }

      if (prevRecord && updateData.kilometers <= prevRecord.kilometers) {
        return res.status(400).json({ error: 'Kilometre değeri önceki kayıttan küçük olamaz' });
      }
    }

    // Güncellenecek alanları hazırla
    const updateFields = {};
    ['date', 'liters', 'cost', 'kilometers', 'location', 'notes', 'fuelType']
      .forEach(field => {
        if (updateData[field] !== undefined) {
          updateFields[field] = field === 'date' ? new Date(updateData[field]) :
            field === 'liters' || field === 'cost' ? parseFloat(updateData[field]) :
            field === 'kilometers' ? parseInt(updateData[field]) :
            updateData[field];
        }
      });

    // Yakıt kaydını güncelle
    const result = await db.collection('vehicle_fuel').updateOne(
      { _id: new ObjectId(fuelId) },
      {
        $set: {
          ...updateFields,
          updatedAt: new Date(),
          updatedBy: new ObjectId(userId)
        }
      }
    );

    if (!result.modifiedCount) {
      return res.status(400).json({ error: 'Yakıt kaydı güncellenemedi' });
    }

    // Eğer bu en son kayıtsa aracın kilometre bilgisini güncelle
    const lastRecord = await db.collection('vehicle_fuel')
      .findOne(
        { vehicleId: new ObjectId(vehicleId) },
        { sort: { date: -1 } }
      );

    if (lastRecord._id.toString() === fuelId) {
      await db.collection('vehicles').updateOne(
        { _id: new ObjectId(vehicleId) },
        {
          $set: {
            currentKilometers: updateFields.kilometers || lastRecord.kilometers,
            lastFuel: {
              date: updateFields.date || lastRecord.date,
              liters: updateFields.liters || lastRecord.liters,
              cost: updateFields.cost || lastRecord.cost
            },
            updatedAt: new Date()
          }
        }
      );
    }

    return res.status(200).json({
      message: 'Yakıt kaydı başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Update fuel record error:', error);
    return res.status(500).json({ error: 'Yakıt kaydı güncellenirken hata oluştu' });
  }
}

// Yakıt kaydını sil
async function deleteFuelRecord(req, res, db) {
  try {
    const { id, vehicleId } = req.query;
    const { fuelId } = req.body;
    const { role, id: userId } = req.user;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(vehicleId) || !ObjectId.isValid(fuelId)) {
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
      return res.status(403).json({ error: 'Bu yakıt kaydını silme yetkiniz yok' });
    }

    // Yakıt kaydını kontrol et
    const fuelRecord = await db.collection('vehicle_fuel').findOne({
      _id: new ObjectId(fuelId),
      vehicleId: new ObjectId(vehicleId)
    });

    if (!fuelRecord) {
      return res.status(404).json({ error: 'Yakıt kaydı bulunamadı' });
    }

    // Yakıt kaydını sil
    const result = await db.collection('vehicle_fuel').deleteOne({
      _id: new ObjectId(fuelId)
    });

    if (!result.deletedCount) {
      return res.status(400).json({ error: 'Yakıt kaydı silinemedi' });
    }

    // Eğer silinen kayıt son kayıtsa aracın kilometre bilgisini güncelle
    const lastRecord = await db.collection('vehicle_fuel')
      .findOne(
        {
          vehicleId: new ObjectId(vehicleId),
          _id: { $ne: new ObjectId(fuelId) }
        },
        { sort: { date: -1 } }
      );

    await db.collection('vehicles').updateOne(
      { _id: new ObjectId(vehicleId) },
      {
        $set: {
          currentKilometers: lastRecord ? lastRecord.kilometers : 0,
          lastFuel: lastRecord ? {
            date: lastRecord.date,
            liters: lastRecord.liters,
            cost: lastRecord.cost
          } : null,
          updatedAt: new Date()
        }
      }
    );

    return res.status(200).json({
      message: 'Yakıt kaydı başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete fuel record error:', error);
    return res.status(500).json({ error: 'Yakıt kaydı silinirken hata oluştu' });
  }
} 