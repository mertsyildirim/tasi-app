import { connectToDatabase } from '../../../lib/mongodb'
import { sign } from 'jsonwebtoken'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { phone, otp } = req.body

    if (!phone || !otp) {
      return res.status(400).json({ error: 'Telefon numarası ve OTP gereklidir' })
    }

    // Veritabanı bağlantısı
    const { db } = await connectToDatabase()

    // OTP'yi kontrol et
    const otpRecord = await db.collection('otps').findOne({
      phone,
      otp,
      used: false,
      expiresAt: { $gt: new Date() }
    })

    if (!otpRecord) {
      return res.status(400).json({ error: 'Geçersiz veya süresi dolmuş OTP' })
    }

    // OTP'yi kullanıldı olarak işaretle
    await db.collection('otps').updateOne(
      { _id: otpRecord._id },
      { $set: { used: true } }
    )

    // Kullanıcıyı bul
    const user = await db.collection('users').findOne({ phone })
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' })
    }

    // JWT token oluştur
    const token = sign(
      { 
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Kullanıcının son giriş tarihini güncelle
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    )

    res.status(200).json({ 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('OTP doğrulama hatası:', error)
    res.status(500).json({ error: 'OTP doğrulanırken bir hata oluştu' })
  }
} 