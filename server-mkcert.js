const fs = require('fs');
const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// SSL sertifikalarının yolunu belirtin 
// Not: Bu dosyalar mkcert ile oluşturulmalı
// Örnek: mkcert -install && mkcert localhost 127.0.0.1
const certFolder = path.join(process.cwd(), 'certs');

// SSL sertifikası yoksa kullanıcıya bilgi ver
if (!fs.existsSync(path.join(certFolder, 'localhost-key.pem')) || 
    !fs.existsSync(path.join(certFolder, 'localhost.pem'))) {
  console.error('\n❌ SSL sertifikaları bulunamadı. Aşağıdaki adımları izleyin:');
  console.error('1. mkcert aracını yükleyin: https://github.com/FiloSottile/mkcert#installation');
  console.error('2. Proje klasöründe "certs" adında bir klasör oluşturun');
  console.error('3. Şu komutları çalıştırın:');
  console.error('   mkcert -install');
  console.error('   mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost.pem localhost 127.0.0.1');
  console.error('4. Bu dosyayı tekrar çalıştırın\n');
  process.exit(1);
}

// SSL sertifikalarını oku
const sslOptions = {
  key: fs.readFileSync(path.join(certFolder, 'localhost-key.pem')),
  cert: fs.readFileSync(path.join(certFolder, 'localhost.pem'))
};

const PORT = 3000;

app.prepare().then(() => {
  createServer(sslOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      
      // Next.js tarafından istek işleniyor
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Hata:', err);
      res.statusCode = 500;
      res.end('Dahili sunucu hatası');
    }
  }).listen(PORT, (err) => {
    if (err) throw err;
    console.log(`\n🔒 HTTPS sunucusu çalışıyor: https://localhost:${PORT}`);
    console.log(`👍 Güvenli bir konum API'si için artık doğrudan bu URL'yi kullanabilirsiniz\n`);
  });
}); 