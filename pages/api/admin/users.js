import { MongoClient, ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'tasiapp';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, error: 'Token bulunamadı' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.roles?.includes('admin') && decoded.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Bu işlem için yetkiniz yok' });
    }

    await client.connect();
    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const filter = {
      $or: [
        { role: 'admin' },
        { roles: 'admin' }
      ]
    };

    if (search) {
      filter.$or.push(
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      );
    }

    const [users, total] = await Promise.all([
      usersCollection
        .find(filter)
        .skip(skip)
        .limit(limit)
        .toArray(),
      usersCollection.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      users: users.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        roles: user.roles,
        isActive: user.isActive
      })),
      totalPages,
      currentPage: page
    });

  } catch (error) {
    console.error('Kullanıcıları getirme hatası:', error);
    return res.status(500).json({ success: false, error: 'Sunucu hatası' });
  } finally {
    await client.close();
  }
} 