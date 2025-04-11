import { authMiddleware } from '@/middleware/auth';
import { deleteFile } from '@/lib/storage';

export default async function handler(req, res) {
  try {
    await authMiddleware(req, res, async () => {
      const { method } = req;

      switch (method) {
        case 'DELETE':
          return await deleteHandler(req, res);
        default:
          res.setHeader('Allow', ['DELETE']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Dosya silme API hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Dosya silme işleyicisi
async function deleteHandler(req, res) {
  try {
    const { fileUrl } = req.body;
    
    if (!fileUrl) {
      return res.status(400).json({ error: 'Dosya URL\'si veya yolu belirtilmedi' });
    }
    
    const success = await deleteFile(fileUrl);
    
    if (success) {
      return res.status(200).json({ message: 'Dosya başarıyla silindi' });
    } else {
      return res.status(400).json({ error: 'Dosya silinemedi' });
    }
  } catch (error) {
    console.error('Dosya silme hatası:', error);
    return res.status(500).json({ error: 'Dosya silinirken bir hata oluştu' });
  }
} 