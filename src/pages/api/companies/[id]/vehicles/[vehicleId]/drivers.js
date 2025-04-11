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
          return await getVehicleDrivers(req, res, db);
        case 'POST':
          return await assignDriver(req, res, db);
        case 'DELETE':
          return await unassignDriver(req, res, db);
        default:
          res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Vehicle drivers API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Araç sürücülerini getir
async function getVehicleDrivers(req, res, db) {
  try {
    const { id, vehicleId } = req.query;
    const { role, id: userId } = req.user;

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
      return res.status(403).json({ error: 'Bu aracın sürücülerini görüntüleme yetkiniz yok' });
    }

    // Mevcut ve geçmiş sürücüleri getir
    const currentDriver = await db.collection('drivers')
      .findOne({
        vehicleId: new ObjectId(vehicleId),
        status: 'active'
      });

    const previousDrivers = await db.collection('drivers')
      .find({
        vehicleId: new ObjectId(vehicleId),
        status: { $ne: 'active' }
      })
      .sort({ updatedAt: -1 })
      .toArray();

    // Sürücü detaylarını getir
    const driverIds = [
      ...(currentDriver ? [currentDriver.userId] : []),
      ...previousDrivers.map(d => d.userId)
    ].filter(id => id);

    const users = driverIds.length > 0
      ? await db.collection('users')
        .find({ _id: { $in: driverIds.map(id => new ObjectId(id)) } })
        .toArray()
      : [];

    // Sürücü bilgilerini birleştir
    const enrichDriver = (driver) => {
      if (!driver) return null;
      const user = users.find(u => u._id.toString() === driver.userId.toString());
      return user ? {
        ...driver,
        name: user.name,
        email: user.email,
        phone: user.phone
      } : driver;
    };

    return res.status(200).json({
      currentDriver: enrichDriver(currentDriver),
      previousDrivers: previousDrivers.map(enrichDriver),
      metadata: {
        hasActiveDriver: !!currentDriver,
        totalAssignments: previousDrivers.length + (currentDriver ? 1 : 0)
      }
    });
  } catch (error) {
    console.error('Get vehicle drivers error:', error);
    return res.status(500).json({ error: 'Sürücü bilgileri getirilirken hata oluştu' });
  }
}

// Sürücü ata
async function assignDriver(req, res, db) {
  try {
    const { id, vehicleId } = req.query;
    const { driverId } = req.body;
    const { role, id: userId } = req.user;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(vehicleId) || !ObjectId.isValid(driverId)) {
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
      return res.status(403).json({ error: 'Bu araca sürücü atama yetkiniz yok' });
    }

    // Sürücüyü kontrol et
    const driver = await db.collection('drivers').findOne({
      _id: new ObjectId(driverId),
      companyId: new ObjectId(id)
    });

    if (!driver) {
      return res.status(404).json({ error: 'Sürücü bulunamadı' });
    }

    // Sürücünün başka aktif aracı var mı kontrol et
    const existingAssignment = await db.collection('drivers').findOne({
      userId: driver.userId,
      status: 'active',
      vehicleId: { $exists: true }
    });

    if (existingAssignment) {
      return res.status(400).json({ error: 'Sürücü başka bir araca atanmış durumda' });
    }

    // Mevcut aktif sürücüyü pasife çek
    await db.collection('drivers').updateMany(
      {
        vehicleId: new ObjectId(vehicleId),
        status: 'active'
      },
      {
        $set: {
          status: 'inactive',
          endDate: new Date(),
          updatedAt: new Date(),
          updatedBy: new ObjectId(userId)
        }
      }
    );

    // Yeni sürücüyü ata
    const result = await db.collection('drivers').updateOne(
      { _id: new ObjectId(driverId) },
      {
        $set: {
          vehicleId: new ObjectId(vehicleId),
          status: 'active',
          startDate: new Date(),
          updatedAt: new Date(),
          updatedBy: new ObjectId(userId)
        }
      }
    );

    if (!result.modifiedCount) {
      return res.status(400).json({ error: 'Sürücü ataması yapılamadı' });
    }

    // Aracın sürücü bilgisini güncelle
    await db.collection('vehicles').updateOne(
      { _id: new ObjectId(vehicleId) },
      {
        $set: {
          currentDriver: {
            id: driver._id,
            userId: driver.userId,
            startDate: new Date()
          },
          updatedAt: new Date()
        }
      }
    );

    return res.status(200).json({
      message: 'Sürücü başarıyla atandı'
    });
  } catch (error) {
    console.error('Assign driver error:', error);
    return res.status(500).json({ error: 'Sürücü atanırken hata oluştu' });
  }
}

// Sürücü atamasını kaldır
async function unassignDriver(req, res, db) {
  try {
    const { id, vehicleId } = req.query;
    const { role, id: userId } = req.user;

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
      return res.status(403).json({ error: 'Bu aracın sürücü atamasını kaldırma yetkiniz yok' });
    }

    // Aktif sürücüyü bul
    const activeDriver = await db.collection('drivers').findOne({
      vehicleId: new ObjectId(vehicleId),
      status: 'active'
    });

    if (!activeDriver) {
      return res.status(404).json({ error: 'Araca atanmış aktif sürücü bulunamadı' });
    }

    // Aktif taşıma var mı kontrol et
    const activeTransport = await db.collection('transports').findOne({
      vehicleId: new ObjectId(vehicleId),
      status: { $in: ['assigned', 'in_progress'] }
    });

    if (activeTransport) {
      return res.status(400).json({ error: 'Devam eden taşıma olduğu için sürücü ataması kaldırılamaz' });
    }

    // Sürücü atamasını kaldır
    const result = await db.collection('drivers').updateOne(
      { _id: activeDriver._id },
      {
        $set: {
          status: 'inactive',
          endDate: new Date(),
          updatedAt: new Date(),
          updatedBy: new ObjectId(userId)
        },
        $unset: { vehicleId: "" }
      }
    );

    if (!result.modifiedCount) {
      return res.status(400).json({ error: 'Sürücü ataması kaldırılamadı' });
    }

    // Aracın sürücü bilgisini güncelle
    await db.collection('vehicles').updateOne(
      { _id: new ObjectId(vehicleId) },
      {
        $unset: { currentDriver: "" },
        $set: { updatedAt: new Date() }
      }
    );

    return res.status(200).json({
      message: 'Sürücü ataması başarıyla kaldırıldı'
    });
  } catch (error) {
    console.error('Unassign driver error:', error);
    return res.status(500).json({ error: 'Sürücü ataması kaldırılırken hata oluştu' });
  }
} 