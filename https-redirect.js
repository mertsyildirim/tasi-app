const express = require('express');
const http = require('http');
const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const selfsigned = require('selfsigned');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Self-signed sertifika oluştur
const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, { days: 365 });

const HTTP_PORT = 3000;
const HTTPS_PORT = 3443;

app.prepare().then(() => {
  // HTTP Sunucusu - HTTPS'e yönlendirir
  const httpApp = express();
  
  // Tüm HTTP isteklerini HTTPS'e yönlendir
  httpApp.use((req, res, next) => {
    const host = req.get('Host').replace(`:${HTTP_PORT}`, `:${HTTPS_PORT}`);
    const httpsUrl = `https://${host}${req.url}`;
    
    console.log(`🔄 HTTP isteği HTTPS'e yönlendiriliyor: ${httpsUrl}`);
    res.redirect(301, httpsUrl);
  });
  
  // HTTP sunucusunu başlat
  http.createServer(httpApp).listen(HTTP_PORT, () => {
    console.log(`\n🔄 HTTP sunucusu çalışıyor (${HTTP_PORT} portu). Tüm istekler HTTPS'e (${HTTPS_PORT} portu) yönlendirilecek`);
  });

  // HTTPS Sunucusu - Next.js uygulamasını sunar
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
  ).listen(HTTPS_PORT, (err) => {
    if (err) throw err;
    console.log(`\n🔒 HTTPS sunucusu çalışıyor: https://localhost:${HTTPS_PORT}`);
    console.log(`⚠️ Güvenilmeyen bir sertifikayla çalışıyor. Tarayıcıda "Gelişmiş" seçeneğini tıklayıp "Yine de devam et" diyerek ilerleyin`);
    console.log(`👍 Güvenli bir konum API'si için artık doğrudan bu URL'yi kullanabilirsiniz\n`);
  });
}); 