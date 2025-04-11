export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Cookie'leri temizle
    res.setHeader('Set-Cookie', [
      'token=; Path=/; Max-Age=0; HttpOnly',
      'refreshToken=; Path=/; Max-Age=0; HttpOnly'
    ]);

    return res.status(200).json({ success: true, message: 'Çıkış başarılı' });
  } catch (error) {
    console.error('Çıkış hatası:', error);
    return res.status(500).json({ error: 'Çıkış yapılırken bir hata oluştu' });
  }
} 