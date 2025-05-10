import { connectToDatabase } from '../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
  try {
    // MongoDB bağlantısı
    await connectToDatabase();

    // Kullanıcı ID'si
    const { id } = req.query;

    // HTTP metoduna göre işlemler
    switch (req.method) {
      case 'GET':
        return await getUser(req, res, id);
      case 'PUT':
        return await updateUser(req, res, id);
      case 'DELETE':
        return await deleteUser(req, res, id);
      default:
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
}

/**
 * Belirli bir kullanıcıyı getiren fonksiyon (GET /api/users/:id)
 */
async function getUser(req, res, id) {
  try {
    // Kullanıcıyı bul ve şifre alanını hariç tut
    const user = await User.findById(id).select('-password');
    
    // Kullanıcı bulunamadı
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Kullanıcı bilgilerini döndür
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get User Error:', error);
    return res.status(500).json({ message: 'Kullanıcı getirilirken hata oluştu', error: error.message });
  }
}

/**
 * Belirli bir kullanıcıyı güncelleyen fonksiyon (PUT /api/users/:id)
 */
async function updateUser(req, res, id) {
  try {
    const { name, email, phone, role, company, address, taxNumber, taxOffice, isActive } = req.body;
    
    // Güncellenecek kullanıcıyı bul
    let user = await User.findById(id);
    
    // Kullanıcı bulunamadı
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Email değiştirilmek isteniyorsa mevcut kontrolü yap
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
      }
    }
    
    // Kullanıcıyı güncelle
    user = await User.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phone,
        role,
        company,
        address,
        taxNumber,
        taxOffice,
        isActive,
        updatedAt: Date.now()
      },
      {
        new: true, // Güncellenmiş dokümanı döndür
        runValidators: true // Validasyonları çalıştır
      }
    ).select('-password');
    
    // Güncellenen kullanıcı bilgilerini döndür
    return res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla güncellendi',
      user
    });
  } catch (error) {
    console.error('Update User Error:', error);
    
    // Validation hatalarını işle
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validasyon hatası', errors: validationErrors });
    }
    
    return res.status(500).json({ message: 'Kullanıcı güncellenirken hata oluştu', error: error.message });
  }
}

/**
 * Belirli bir kullanıcıyı silen fonksiyon (DELETE /api/users/:id)
 */
async function deleteUser(req, res, id) {
  try {
    // Kullanıcıyı bul
    const user = await User.findById(id);
    
    // Kullanıcı bulunamadı
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Kullanıcıyı sil (Gerçek silme yerine isActive = false yapılabilir)
    await User.findByIdAndDelete(id);
    
    // Başarı mesajı döndür
    return res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla silindi'
    });
  } catch (error) {
    console.error('Delete User Error:', error);
    return res.status(500).json({ message: 'Kullanıcı silinirken hata oluştu', error: error.message });
  }
} 