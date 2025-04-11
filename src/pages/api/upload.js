import { IncomingForm } from 'formidable';
import { authMiddleware } from '@/middleware/auth';
import { uploadFile, uploadFileFromBase64 } from '@/lib/storage';

// Form-data parser için ayarlar
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  try {
    await authMiddleware(req, res, async () => {
      const { method } = req;

      switch (method) {
        case 'POST':
          return await uploadHandler(req, res);
        default:
          res.setHeader('Allow', ['POST']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
  } catch (error) {
    console.error('Dosya yükleme API hatası:', error);
    return res.status(500).json({ error: 'Sunucu hatası' });
  }
}

// Dosya yükleme işleyicisi
async function uploadHandler(req, res) {
  try {
    // İstek içeriğinin tipini kontrol et
    const contentType = req.headers['content-type'] || '';
    
    // Base64 veri kontrolü (JSON içinde)
    if (contentType.includes('application/json')) {
      const { base64String, fileName, folder } = req.body;
      
      if (!base64String) {
        return res.status(400).json({ error: 'Base64 veri bulunamadı' });
      }
      
      const result = await uploadFileFromBase64(base64String, fileName, folder);
      return res.status(200).json(result);
    }
    
    // Form-data dosya yükleme
    else if (contentType.includes('multipart/form-data')) {
      const form = new IncomingForm({
        keepExtensions: true,
        multiples: true,
      });
      
      return new Promise((resolve, reject) => {
        form.parse(req, async (err, fields, files) => {
          if (err) {
            console.error('Form işleme hatası:', err);
            return res.status(500).json({ error: 'Dosya işlenirken hata oluştu' });
          }
          
          try {
            const fileList = files.file;
            const folder = fields.folder?.[0] || '';
            
            // Tek dosya yükleme
            if (!Array.isArray(fileList)) {
              const result = await uploadFile(fileList, folder);
              return res.status(200).json(result);
            }
            
            // Çoklu dosya yükleme
            const results = await Promise.all(
              fileList.map(async (file) => {
                return await uploadFile(file, folder);
              })
            );
            
            return res.status(200).json(results);
          } catch (error) {
            console.error('Dosya yükleme hatası:', error);
            return res.status(500).json({ error: `Dosya yüklenemedi: ${error.message}` });
          }
        });
      });
    }
    
    // Desteklenmeyen içerik tipi
    else {
      return res.status(400).json({ error: 'Desteklenmeyen içerik tipi. multipart/form-data veya application/json kullanın' });
    }
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    return res.status(500).json({ error: 'Dosya yüklenirken bir hata oluştu' });
  }
} 