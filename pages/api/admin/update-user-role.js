import { connectDB } from '../../../lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user.roles.includes('super_admin')) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email, roles } = req.body;

    if (!email || !roles) {
      return res.status(400).json({ error: 'Email ve roller gereklidir' });
    }

    const db = await connectDB();
    const users = db.collection('users');

    const result = await users.updateOne(
      { email },
      { $set: { roles } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Kullanıcı rolleri güncellendi' 
    });

  } catch (error) {
    console.error('Rol güncelleme hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
} 