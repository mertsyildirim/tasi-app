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
          return await getExpenses(req, res, db);
        case 'POST':
          return await addExpense(req, res, db);
        case 'PUT':
          return await updateExpense(req, res, db);
        case 'DELETE':
          return await deleteExpense(req, res, db);
        default:
          res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Vehicle expenses API error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Masraf kayıtlarını getir
async function getExpenses(req, res, db) {
  try {
    const { id, vehicleId } = req.query;
    const { role, id: userId } = req.user;
    const { startDate, endDate, type, limit = 50 } = req.query;

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
      return res.status(403).json({ error: 'Bu aracın masraf kayıtlarını görüntüleme yetkiniz yok' });
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

    if (type) {
      query.type = type;
    }

    // Masraf kayıtlarını getir
    const expenses = await db.collection('vehicle_expenses')
      .find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .toArray();

    // İstatistikleri hesapla
    const stats = expenses.reduce((acc, expense) => {
      acc.totalAmount += expense.amount;
      acc.byType[expense.type] = (acc.byType[expense.type] || 0) + expense.amount;
      return acc;
    }, { totalAmount: 0, byType: {} });

    // Aylık masraf trendini hesapla
    const monthlyTrend = expenses.reduce((acc, expense) => {
      const month = expense.date.toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + expense.amount;
      return acc;
    }, {});

    return res.status(200).json({
      expenses,
      metadata: {
        total: expenses.length,
        totalAmount: stats.totalAmount,
        byType: stats.byType,
        monthlyTrend: Object.entries(monthlyTrend)
          .map(([month, amount]) => ({ month, amount }))
          .sort((a, b) => a.month.localeCompare(b.month))
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    return res.status(500).json({ error: 'Masraf kayıtları getirilirken hata oluştu' });
  }
}

// Yeni masraf kaydı ekle
async function addExpense(req, res, db) {
  try {
    const { id, vehicleId } = req.query;
    const { role, id: userId } = req.user;
    const expenseData = req.body;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(vehicleId)) {
      return res.status(400).json({ error: 'Geçersiz ID' });
    }

    // Zorunlu alanları kontrol et
    const requiredFields = ['type', 'amount', 'date', 'description'];
    const missingFields = requiredFields.filter(field => !expenseData[field]);
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
      return res.status(403).json({ error: 'Bu araca masraf kaydı ekleme yetkiniz yok' });
    }

    // Yeni masraf kaydı oluştur
    const newExpense = {
      vehicleId: new ObjectId(vehicleId),
      companyId: new ObjectId(id),
      type: expenseData.type,
      amount: parseFloat(expenseData.amount),
      date: new Date(expenseData.date),
      description: expenseData.description,
      provider: expenseData.provider || null,
      invoiceNumber: expenseData.invoiceNumber || null,
      attachments: expenseData.attachments || [],
      notes: expenseData.notes || '',
      createdAt: new Date(),
      createdBy: new ObjectId(userId),
      updatedAt: new Date(),
      updatedBy: new ObjectId(userId)
    };

    // Masraf kaydını ekle
    const result = await db.collection('vehicle_expenses')
      .insertOne(newExpense);

    if (!result.insertedId) {
      return res.status(400).json({ error: 'Masraf kaydı eklenemedi' });
    }

    // Aracın masraf bilgilerini güncelle
    await db.collection('vehicles').updateOne(
      { _id: new ObjectId(vehicleId) },
      {
        $inc: { totalExpenses: newExpense.amount },
        $set: { updatedAt: new Date() }
      }
    );

    return res.status(201).json({
      message: 'Masraf kaydı başarıyla eklendi',
      expense: newExpense
    });
  } catch (error) {
    console.error('Add expense error:', error);
    return res.status(500).json({ error: 'Masraf kaydı eklenirken hata oluştu' });
  }
}

// Masraf kaydını güncelle
async function updateExpense(req, res, db) {
  try {
    const { id, vehicleId } = req.query;
    const { expenseId } = req.body;
    const { role, id: userId } = req.user;
    const updateData = req.body;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(vehicleId) || !ObjectId.isValid(expenseId)) {
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
      return res.status(403).json({ error: 'Bu masraf kaydını güncelleme yetkiniz yok' });
    }

    // Masraf kaydını kontrol et
    const existingExpense = await db.collection('vehicle_expenses').findOne({
      _id: new ObjectId(expenseId),
      vehicleId: new ObjectId(vehicleId)
    });

    if (!existingExpense) {
      return res.status(404).json({ error: 'Masraf kaydı bulunamadı' });
    }

    // Güncellenecek alanları hazırla
    const updateFields = {};
    ['type', 'amount', 'date', 'description', 'provider', 'invoiceNumber', 'attachments', 'notes']
      .forEach(field => {
        if (updateData[field] !== undefined) {
          updateFields[field] = field === 'date' ? new Date(updateData[field]) :
            field === 'amount' ? parseFloat(updateData[field]) :
            updateData[field];
        }
      });

    // Masraf kaydını güncelle
    const result = await db.collection('vehicle_expenses').updateOne(
      { _id: new ObjectId(expenseId) },
      {
        $set: {
          ...updateFields,
          updatedAt: new Date(),
          updatedBy: new ObjectId(userId)
        }
      }
    );

    if (!result.modifiedCount) {
      return res.status(400).json({ error: 'Masraf kaydı güncellenemedi' });
    }

    // Eğer tutar değiştiyse aracın toplam masraf bilgisini güncelle
    if (updateFields.amount !== undefined) {
      const difference = updateFields.amount - existingExpense.amount;
      await db.collection('vehicles').updateOne(
        { _id: new ObjectId(vehicleId) },
        {
          $inc: { totalExpenses: difference },
          $set: { updatedAt: new Date() }
        }
      );
    }

    return res.status(200).json({
      message: 'Masraf kaydı başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Update expense error:', error);
    return res.status(500).json({ error: 'Masraf kaydı güncellenirken hata oluştu' });
  }
}

// Masraf kaydını sil
async function deleteExpense(req, res, db) {
  try {
    const { id, vehicleId } = req.query;
    const { expenseId } = req.body;
    const { role, id: userId } = req.user;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(vehicleId) || !ObjectId.isValid(expenseId)) {
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
      return res.status(403).json({ error: 'Bu masraf kaydını silme yetkiniz yok' });
    }

    // Masraf kaydını kontrol et
    const expense = await db.collection('vehicle_expenses').findOne({
      _id: new ObjectId(expenseId),
      vehicleId: new ObjectId(vehicleId)
    });

    if (!expense) {
      return res.status(404).json({ error: 'Masraf kaydı bulunamadı' });
    }

    // Masraf kaydını sil
    const result = await db.collection('vehicle_expenses').deleteOne({
      _id: new ObjectId(expenseId)
    });

    if (!result.deletedCount) {
      return res.status(400).json({ error: 'Masraf kaydı silinemedi' });
    }

    // Aracın toplam masraf bilgisini güncelle
    await db.collection('vehicles').updateOne(
      { _id: new ObjectId(vehicleId) },
      {
        $inc: { totalExpenses: -expense.amount },
        $set: { updatedAt: new Date() }
      }
    );

    return res.status(200).json({
      message: 'Masraf kaydı başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    return res.status(500).json({ error: 'Masraf kaydı silinirken hata oluştu' });
  }
} 