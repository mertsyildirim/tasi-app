import { getSession } from 'next-auth/react';
import { connectToDatabase } from '../../../../lib/db';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  // Session kontrolü
  const session = await getSession({ req });
  
  if (!session || session.user.role !== 'admin') {
    return res.status(401).json({ error: 'Bu işlem için yetkiniz bulunmamaktadır.' });
      }

  // ID kontrolü
    const { id } = req.query;
  if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Geçersiz kullanıcı ID' });
    }
    
  // Veritabanı bağlantısı
  let client;

  try {
    client = await connectToDatabase();
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // GET isteği - Kullanıcı detaylarını getir
    if (req.method === 'GET') {
      const user = await usersCollection.findOne(
        { _id: new ObjectId(id) },
        { projection: { password: 0 } } // Şifreyi dahil etme
      );
    
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
      return res.status(200).json({ user });
    }
    
    // PUT isteği - Kullanıcı bilgilerini güncelle
    if (req.method === 'PUT') {
      const { name, surname, email, phone, role, status, company, password } = req.body;
      
      // Kullanıcıyı bul
      const existingUser = await usersCollection.findOne({ _id: new ObjectId(id) });
      
      if (!existingUser) {
        return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
      // E-posta değişmişse, benzersiz olduğunu kontrol et
      if (email && email !== existingUser.email) {
        const emailExists = await usersCollection.findOne({ 
          email, 
          _id: { $ne: new ObjectId(id) } 
        });
    
        if (emailExists) {
          return res.status(400).json({ error: 'Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.' });
        }
      }
      
      // Şirket hesabı için şirket adı zorunlu
      if (role === 'company' && (!company || !company.name)) {
        return res.status(400).json({ error: 'Şirket hesabı için şirket adı zorunludur.' });
      }
      
      // Güncelleme verilerini hazırla
      const updateData = {
        $set: {
          name: name || existingUser.name,
          surname: surname || existingUser.surname,
          email: email || existingUser.email,
          phone: phone || existingUser.phone,
          role: role || existingUser.role,
          status: status || existingUser.status,
          company: role === 'company' ? {
            name: company?.name || existingUser.company?.name || '',
            taxNumber: company?.taxNumber || existingUser.company?.taxNumber || '',
            address: company?.address || existingUser.company?.address || '',
            phone: company?.phone || existingUser.company?.phone || ''
          } : null,
          updatedAt: new Date()
        }
      };
      
      // Şifre güncellemesi isteniyorsa
      if (password && password.trim() !== '') {
        // Şifre güvenliği kontrolü
        if (password.length < 6) {
          return res.status(400).json({ error: 'Şifre en az 6 karakter uzunluğunda olmalıdır.' });
        }
        
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        updateData.$set.password = await bcrypt.hash(password, salt);
          }
      
      // Kullanıcıyı güncelle
      await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        updateData
      );
      
      // Güncellenmiş kullanıcıyı getir (şifre hariç)
      const updatedUser = await usersCollection.findOne(
        { _id: new ObjectId(id) },
        { projection: { password: 0 } }
        );
    
    return res.status(200).json({
      success: true,
        message: 'Kullanıcı başarıyla güncellendi',
        user: updatedUser
      });
}

    // DELETE isteği - Kullanıcıyı sil
    if (req.method === 'DELETE') {
      // Kullanıcıyı bul
      const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
      // Eğer admin kendi hesabını silmeye çalışıyorsa engelle
      if (session.user.email === user.email) {
        return res.status(400).json({ error: 'Kendi hesabınızı silemezsiniz.' });
    }
    
      // Kullanıcıyı sil
      await usersCollection.deleteOne({ _id: new ObjectId(id) });
    
    return res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla silindi'
    });
    }
    
    // Desteklenmeyen HTTP metodu
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  } finally {
    if (client) {
      await client.close();
    }
  }
} 