const express = require('express');
const next = require('next');
const https = require('https');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Tüm IP adreslerinden erişime izin ver

// SSL sertifika dosyalarının yolları
const SSL_KEY_PATH = path.join(__dirname, 'certificates', 'localhost-key.pem');
const SSL_CERT_PATH = path.join(__dirname, 'certificates', 'localhost.pem');

// SSL sertifikalarını yükle
const options = {
  key: fs.readFileSync(SSL_KEY_PATH),
  cert: fs.readFileSync(SSL_CERT_PATH)
};

app.prepare().then(() => {
  const server = express();

  // CORS ayarlarını ekle
  server.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // OPTIONS isteklerine hemen yanıt ver
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  });

  // Tüm istekleri Next.js'e yönlendir
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // HTTPS sunucusunu başlat
  https.createServer(options, server).listen(PORT, HOST, (err) => {
    if (err) throw err;
    console.log(`\n🔒 HTTPS sunucusu çalışıyor:`);
    console.log(`   - Local: https://localhost:${PORT}`);
    console.log(`   - Network: https://[IP_ADRESINIZ]:${PORT}\n`);
    console.log(`⚠️ Bu güvenilmeyen bir sertifikayla çalışıyor. Tarayıcınız güvenlik uyarısı gösterecektir.`);
    console.log(`   Devam etmek için tarayıcıda gelişmiş seçenekleri tıklayın ve 'Yine de devam et' seçeneğini seçin.\n`);
    console.log(`👍 Güvenli bir konum API'si için artık doğrudan bu URL'yi kullanabilirsiniz\n`);
  });
}); 