const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const selfsigned = require('selfsigned');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Self-signed sertifika oluştur (her başlangıçta yeniden oluşturulur)
const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, { days: 365 });

const PORT = 3000;
const HOST = '0.0.0.0'; // Tüm IP adreslerinden erişime açık

app.prepare().then(() => {
  createServer(
    {
      key: pems.private,
      cert: pems.cert,
    },
    async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        
        // Next.js tarafından istek işleniyor
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Hata:', err);
        res.statusCode = 500;
        res.end('Dahili sunucu hatası');
      }
    }
  ).listen(PORT, HOST, (err) => {
    if (err) throw err;
    console.log(`\n🔒 HTTPS sunucusu çalışıyor:`);
    console.log(`   - Local: https://localhost:${PORT}`);
    console.log(`   - Network: https://[IP_ADRESINIZ]:${PORT}`);
    console.log(`\n⚠️ Bu güvenilmeyen bir sertifikayla çalışıyor. Tarayıcınız güvenlik uyarısı gösterecektir.`);
    console.log(`   Devam etmek için tarayıcıda gelişmiş seçenekleri tıklayın ve 'Yine de devam et' seçeneğini seçin.`);
    console.log(`\n👍 Güvenli bir konum API'si için artık doğrudan bu URL'yi kullanabilirsiniz\n`);
  });
}); 