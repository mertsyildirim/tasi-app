export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // JWT token ile ilgili bir işlem olmadığı için sadece başarılı yanıt döndürüyoruz
  // Client tarafında token silinmesi gerekecek
  return res.status(200).json({ message: 'Başarıyla çıkış yapıldı' });
} 