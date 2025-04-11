import { connectToDatabase } from '@/lib/mongodb';
import { authMiddleware } from '@/middleware/auth';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    // İşlemin başlangıç zamanını kaydet
    const startTime = new Date();
    console.log(`--- Konum API isteği başladı: ${startTime.toISOString()} ---`);
    console.log(`IP: ${req.headers['x-forwarded-for'] || req.socket.remoteAddress}, Metot: ${req.method}, URL: ${req.url}`);
    
    // CORS başlıklarını ekle - Tüm kaynaklardan gelen isteklere izin ver
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // OPTIONS isteğine hemen yanıt ver
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Client-side renderlanması için kritik, bağlantı hatası veriyorsa ilk burada görürüz
    try {
      console.log('1. MongoDB bağlantı kontrolü başlıyor...');
      const dbConnection = await connectToDatabase();
      console.log('1. MongoDB ön kontrolü başarılı, bağlantı sağlandı');
      
      // DB bağlantı kontrolü ve ping testi
      try {
        console.log('2. MongoDB ping testi başlatılıyor...');
        await dbConnection.db.admin().ping();
        console.log('2. MongoDB ping testi başarılı');
        
        // Gerekli indeksleri kontrol et ve oluştur
        try {
          const indexes = await dbConnection.db.collection('driver_locations').listIndexes().toArray();
          const hasLocationIndex = indexes.some(index => index.name === 'location_2dsphere');
          
          if (!hasLocationIndex) {
            console.log('Konum indeksi oluşturuluyor...');
            await dbConnection.db.collection('driver_locations').createIndex(
              { "location": "2dsphere" },
              { background: true }
            );
            console.log('Konum indeksi başarıyla oluşturuldu');
          } else {
            console.log('Konum indeksi zaten mevcut');
          }
          
          const hasDriverTimestampIndex = indexes.some(index => 
            index.name === 'driverId_timestamp' || 
            (index.key && index.key.driverId && index.key.timestamp)
          );
          
          if (!hasDriverTimestampIndex) {
            console.log('Sürücü-zaman indeksi oluşturuluyor...');
            await dbConnection.db.collection('driver_locations').createIndex(
              { driverId: 1, timestamp: -1 },
              { background: true }
            );
            console.log('Sürücü-zaman indeksi başarıyla oluşturuldu');
          } else {
            console.log('Sürücü-zaman indeksi zaten mevcut');
          }
        } catch (indexError) {
          console.warn('İndeks oluşturulurken hata:', indexError);
          // İndeks hatası kritik değil, devam et
        }
      } catch (pingError) {
        console.error('2. MongoDB ping hatası (beklenmedik): ', pingError);
        throw new Error(`MongoDB ping başarısız: ${pingError.message}`);
      }
    } catch (dbCheckError) {
      console.error('MongoDB ön kontrol hatası:', dbCheckError);
      return res.status(200).json({ 
        success: false,
        error: 'Veritabanı bağlantısı kurulamadı, lütfen daha sonra tekrar deneyin',
        code: 'DB_CONNECTION_ERROR' 
      });
    }
    
    await authMiddleware(req, res, async () => {
      const { method } = req;

      switch (method) {
        case 'GET':
          return await getDriverLocation(req, res);
        case 'POST':
          return await updateDriverLocation(req, res);
        default:
          res.setHeader('Allow', ['GET', 'POST']);
          return res.status(405).json({ error: `Method ${method} not allowed` });
      }
    });
    
    // İşlem süresini hesapla ve logla
    const endTime = new Date();
    const processingTime = endTime - startTime;
    console.log(`--- Konum API isteği tamamlandı: ${endTime.toISOString()}, Süre: ${processingTime}ms ---`);
  } catch (error) {
    console.error('Sürücü konum API ana hata:', error);
    
    // Client hatayı her durumda doğru bir şekilde işleyebilsin diye HTTP 200 dönüyoruz
    try {
      return res.status(200).json({ 
        success: false, 
        error: 'Sunucu hatası, ancak konum izleme devam ediyor', 
        code: 'SERVER_ERROR',
        message: error.message,
        name: error.name || 'UnknownError'
      });
    } catch (finalError) {
      // Son çare, düz HTTP yanıtı
      console.error('Son çare HTTP yanıtı gönderiliyor:', finalError);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Critical server error' }));
    }
  }
}

/**
 * Sürücünün son konum bilgisini alır
 */
async function getDriverLocation(req, res) {
  try {
    const { db } = await connectToDatabase();
    const { id: userId, role } = req.user;
    const { driverId } = req.query;

    // Eğer driverId belirtilmişse, yetki kontrolü yap
    if (driverId) {
      if (!ObjectId.isValid(driverId)) {
        return res.status(400).json({ error: 'Geçersiz sürücü ID' });
      }

      // Yalnızca admin veya şirket yöneticisi başka sürücülerin konumunu görebilir
      if (role !== 'admin' && role !== 'company') {
        return res.status(403).json({ error: 'Yetkiniz bulunmuyor' });
      }

      const driver = await db.collection('drivers').findOne({
        _id: new ObjectId(driverId)
      });

      if (!driver) {
        return res.status(404).json({ error: 'Sürücü bulunamadı' });
      }

      // Şirket yöneticisi ise, sadece kendi şirketinin sürücülerini görebilir
      if (role === 'company') {
        const company = await db.collection('companies').findOne({
          userId: new ObjectId(userId)
        });

        if (!company || company._id.toString() !== driver.companyId.toString()) {
          return res.status(403).json({ error: 'Bu sürücünün konumunu görüntüleme yetkiniz yok' });
        }
      }

      // Son konum bilgisini getir
      const location = await db.collection('driver_locations').findOne(
        { driverId: new ObjectId(driverId) },
        { sort: { timestamp: -1 } }
      );

      return res.status(200).json({
        success: true,
        data: location || { location: null, lastUpdate: null }
      });
    } 
    // Sürücü kendi konumunu istiyorsa
    else {
      // Kullanıcı tipinin sürücü olduğunu kontrol et
      if (role !== 'driver') {
        return res.status(403).json({ error: 'Sadece sürücüler kendi konumlarını alabilir' });
      }

      // ObjectId kontrolü
      let userObjectId;
      try {
        userObjectId = new ObjectId(userId);
      } catch (idError) {
        console.error('Geçersiz ObjectId formatı:', userId, idError);
        return res.status(400).json({ error: 'Geçersiz kullanıcı ID formatı' });
      }

      // Sürücüyü bul - farklı sorgularla deneyelim
      let driver = null;
      console.log("Sürücü kaydı aranıyor, userId:", userId);
      
      try {
        // İlk olarak userId ile ara
        driver = await db.collection('drivers').findOne({
          userId: userObjectId
        });
        
        // UserId ile bulunamadıysa, _id ile de kontrol et
        if (!driver) {
          console.log("UserId ile sürücü bulunamadı, _id ile deneniyor...");
          driver = await db.collection('drivers').findOne({
            _id: userObjectId
          });
          
          // Hala bulunamadıysa, kullanıcı tablosundan driverId'yi kontrol et
          if (!driver) {
            console.log("Alternatif sürücü ID araması yapılıyor...");
            
            // Kullanıcı tablosundan önce sürücü bilgisini alalım
            const user = await db.collection('users').findOne({
              _id: userObjectId
            });
            
            if (user && user.driverId) {
              // Kullanıcı tablosunda driverId varsa, bu ID ile arayalım
              console.log("Kullanıcı tablosunda driverId bulundu:", user.driverId);
              driver = await db.collection('drivers').findOne({
                _id: new ObjectId(user.driverId)
              });
            }
          }
        }
      } catch (driverFindError) {
        console.error('Sürücü arama hatası:', driverFindError);
        return res.status(500).json({ 
          error: 'Sürücü kaydı aranırken hata oluştu',
          details: driverFindError.message
        });
      }

      if (!driver) {
        // Eğer sürücü kaydı yoksa ama kullanıcı sürücü rolündeyse, yeni kayıt oluştur
        console.log("Sürücü kaydı bulunamadı, yeni kayıt oluşturuluyor...");
        
        // Önce users tablosundan kullanıcı bilgilerini alalım
        const user = await db.collection('users').findOne({
          _id: userObjectId
        });
        
        if (!user) {
          return res.status(404).json({ error: 'Kullanıcı kaydı bulunamadı' });
        }
        
        // Yeni sürücü kaydı oluştur
        const newDriver = {
          _id: new ObjectId(),
          userId: userObjectId,
          name: user.name || 'Sürücü',
          surname: user.surname || '',
          email: user.email || '',
          phone: user.phone || '',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        try {
          const insertResult = await db.collection('drivers').insertOne(newDriver);
          console.log("Yeni sürücü kaydı oluşturuldu:", insertResult.insertedId);
          
          // Kullanıcı tablosuna driverId ekle
          await db.collection('users').updateOne(
            { _id: userObjectId },
            { $set: { driverId: newDriver._id, updatedAt: new Date() } }
          );
          
          driver = newDriver;
        } catch (createError) {
          console.error("Sürücü kaydı oluşturulurken hata:", createError);
          return res.status(500).json({ error: 'Sürücü kaydı oluşturulamadı' });
        }
      }

      // Son konum bilgisini getir
      console.log("Sürücü konum bilgisi alınıyor, driverId:", driver._id);
      const location = await db.collection('driver_locations').findOne(
        { driverId: new ObjectId(driver._id) },
        { sort: { timestamp: -1 } }
      );

      return res.status(200).json({
        success: true,
        data: location || { location: null, lastUpdate: null }
      });
    }
  } catch (error) {
    console.error('Konum bilgisi getirme hatası:', error);
    return res.status(500).json({ error: 'Konum bilgisi getirilirken hata oluştu' });
  }
}

/**
 * Sürücünün konum bilgisini günceller
 */
async function updateDriverLocation(req, res) {
  let db = null;
  try {
    // Debug: Request body'i kontrol et
    console.log('Konum API istek gövdesi:', JSON.stringify(req.body));
    console.log('Konum API kullanıcı bilgisi:', JSON.stringify(req.user));
    
    // Veritabanı bağlantısını kur
    const dbConnection = await connectToDatabase();
    db = dbConnection.db;
    
    const { id: userId, role } = req.user || { id: null, role: null };
    
    // Kullanıcı bilgilerini kontrol et
    if (!userId) {
      console.error('Kullanıcı ID\'si bulunamadı');
      return res.status(401).json({ error: 'Geçersiz kullanıcı' });
    }
    
    const { 
      latitude, 
      longitude, 
      accuracy, 
      speed, 
      heading, 
      timestamp, 
      taskId, 
      address, 
      placeId, 
      platform 
    } = req.body;

    console.log("Konum verileri alındı:", { 
      latitude, longitude, accuracy, platform,
      userId, role, timestamp: timestamp || new Date().toISOString()
    });

    // Konum bilgisi için gerekli alanları kontrol et
    if (!latitude || !longitude) {
      console.warn('Eksik konum verileri:', req.body);
      return res.status(400).json({ error: 'Konum bilgileri eksik' });
    }

    // Doğruluk kontrolü - çok düşük doğruluklu konumları reddet
    // Eğer accuracy değeri belirtilmişse ve 500 metreden büyükse uyarı ver
    const parsedAccuracy = parseFloat(accuracy);
    if (!isNaN(parsedAccuracy) && parsedAccuracy > 500) {
      console.warn(`Düşük doğruluklu konum (${parsedAccuracy}m) alındı - doğruluk sınırlaması devam ediyor`);
    }

    // Kullanıcı tipinin sürücü olduğunu kontrol et
    if (role !== 'driver') {
      console.warn(`Kullanıcı rolü sürücü değil: ${role}`);
      return res.status(403).json({ error: 'Sadece sürücüler konum bilgisi gönderebilir' });
    }

    // ObjectId kontrolü
    let userObjectId;
    try {
      userObjectId = new ObjectId(userId);
    } catch (idError) {
      console.error('Geçersiz ObjectId formatı:', userId, idError);
      return res.status(400).json({ error: 'Geçersiz kullanıcı ID formatı' });
    }

    // Sürücüyü bul
    console.log("Sürücü kaydı aranıyor, userId:", userId);
    let driver;
    try {
      // İlk olarak userId ile ara
      driver = await db.collection('drivers').findOne({
        userId: userObjectId
      });
      
      // UserId ile bulunamadıysa, _id ile de kontrol et
      if (!driver) {
        console.log("UserId ile sürücü bulunamadı, _id ile deneniyor...");
        driver = await db.collection('drivers').findOne({
          _id: userObjectId
        });
        
        // Hala bulunamadıysa, sürücü koleksiyonundaki tüm alanları kontrol et
        if (!driver) {
          console.log("Alternatif sürücü ID araması yapılıyor...");
          
          // Kullanıcı tablosundan önce sürücü bilgisini alalım
          const user = await db.collection('users').findOne({
            _id: userObjectId
          });
          
          if (user && user.driverId) {
            // Kullanıcı tablosunda driverId varsa, bu ID ile arayalım
            console.log("Kullanıcı tablosunda driverId bulundu:", user.driverId);
            driver = await db.collection('drivers').findOne({
              _id: new ObjectId(user.driverId)
            });
          }
        }
      }
    } catch (driverFindError) {
      console.error('Sürücü arama hatası:', driverFindError);
      return res.status(500).json({ 
        error: 'Sürücü kaydı aranırken hata oluştu',
        details: driverFindError.message
      });
    }

    if (!driver) {
      console.warn(`Sürücü kaydı bulunamadı, userId: ${userId}`);
      
      // Localhost veya test ortamında ise test kaydı oluştur
      const host = req.headers.host || '';
      const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
      
      if (isLocalhost) {
        console.log('Localhost ortamı için test sürücü kaydı kullanılıyor');
        // Test sürücü verileri oluştur
        driver = {
          _id: new ObjectId(),
          name: 'Test Sürücü',
          companyId: new ObjectId(),
          vehicleId: null,
          // Diğer gerekli alanlar...
        };
      } else {
        // Canlı ortamda, eğer sürücü kaydı bulunamazsa, bir tane oluşturalım
        console.log("Sürücü kaydı bulunamadı, yeni kayıt oluşturuluyor...");
        
        // Önce users tablosundan kullanıcı bilgilerini alalım
        const user = await db.collection('users').findOne({
          _id: userObjectId
        });
        
        if (!user) {
          return res.status(404).json({ error: 'Kullanıcı kaydı bulunamadı' });
        }
        
        // Yeni sürücü kaydı oluştur
        const newDriver = {
          _id: new ObjectId(),
          userId: userObjectId,
          name: user.name || 'Sürücü',
          surname: user.surname || '',
          email: user.email || '',
          phone: user.phone || '',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        try {
          const insertResult = await db.collection('drivers').insertOne(newDriver);
          console.log("Yeni sürücü kaydı oluşturuldu:", insertResult.insertedId);
          
          // Kullanıcı tablosuna driverId ekle
          await db.collection('users').updateOne(
            { _id: userObjectId },
            { $set: { driverId: newDriver._id, updatedAt: new Date() } }
          );
          
          driver = newDriver;
        } catch (createError) {
          console.error("Sürücü kaydı oluşturulurken hata:", createError);
          return res.status(500).json({ error: 'Sürücü kaydı oluşturulamadı' });
        }
      }
    }

    console.log("Sürücü kaydı bulundu:", { driverId: driver._id, driverName: driver.name });

    // Aktif görev kontrolü
    let activeTask = null;
    if (taskId) {
      if (!ObjectId.isValid(taskId)) {
        console.warn('Geçersiz taskId formatı:', taskId);
        return res.status(400).json({ error: 'Geçersiz görev ID' });
      }

      try {
        activeTask = await db.collection('tasks').findOne({
          _id: new ObjectId(taskId),
          driverId: new ObjectId(driver._id),
          status: { $in: ['assigned', 'in_progress'] }
        });
      } catch (taskFindError) {
        console.error('Görev arama hatası:', taskFindError);
        // Görevi bulamazsak hata döndürmek yerine devam ediyoruz
      }

      if (!activeTask && taskId) {
        console.warn(`Aktif görev bulunamadı, taskId: ${taskId}`);
        // Görevi bulamazsak hata döndürmek yerine devam ediyoruz
      }
    } else {
      // En son aktif görevi bul
      try {
        activeTask = await db.collection('tasks').findOne(
          {
            driverId: new ObjectId(driver._id),
            status: { $in: ['assigned', 'in_progress'] }
          },
          { sort: { updatedAt: -1 } }
        );
      } catch (findTaskError) {
        console.error('Son aktif görev arama hatası:', findTaskError);
        // Görevi bulamazsak hata döndürmek yerine devam ediyoruz
      }
    }

    // Konum kaydını oluştur
    let result;
    try {
      // Sayısal değerleri güvenli şekilde işle
      const parsedLatitude = parseFloat(latitude);
      const parsedLongitude = parseFloat(longitude);
      const parsedAccuracy = !isNaN(parseFloat(accuracy)) ? parseFloat(accuracy) : 0;
      
      if (isNaN(parsedLatitude) || isNaN(parsedLongitude)) {
        throw new Error(`Geçersiz konum değerleri: lat=${latitude}, lng=${longitude}`);
      }
      
      // En basit veri yapısıyla kaydet - GeoJSON formatını kullanma
      const extremelySimpleLocation = {
        driverUserId: userId, // String olarak kullanıcı ID'si 
        driverIdStr: driver._id.toString(), // String olarak sürücü ID'si
        driverName: driver.name || 'Bilinmeyen Sürücü',
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        accuracy: parsedAccuracy,
        timestamp: new Date(),
        createdAt: new Date(),
        platform: platform || 'unknown',
        isEmergencyFormat: true // Bu acil durum formatı
      };
      
      console.log("Basitleştirilmiş konum verisiyle deneniyor:", JSON.stringify(extremelySimpleLocation));
      
      // Basit dökümanla kayıt
      try {
        result = await db.collection('driver_locations').insertOne(extremelySimpleLocation);
        console.log("Basit veri yapısıyla kaydedildi, ID:", result.insertedId);
      }
      catch (simpleInsertError) {
        console.error("Basit veri formatıyla bile kaydedilemedi:", simpleInsertError);
        throw simpleInsertError; // Tekrar fırlat
      }
    } catch (insertError) {
      console.error('Konum kaydı eklenirken hata:', insertError);
      
      // Veritabanı işlemleri hakkında daha fazla bilgi topla
      try {
        // Koleksiyon listesini alarak veritabanı erişimini test et
        const collections = await db.listCollections().toArray();
        console.log("Mevcut koleksiyonlar:", collections.map(c => c.name).join(", "));
        
        // Driver collection'ı var mı?
        const driversCollection = collections.find(c => c.name === 'driver_locations');
        if (!driversCollection) {
          // Koleksiyon yoksa oluştur
          console.log("driver_locations koleksiyonu bulunamadı, oluşturuluyor...");
          await db.createCollection('driver_locations');
          console.log("Koleksiyon oluşturuldu");
        }
        
        // Yazma yetkisi kontrolü
        try {
          const writeTestResult = await db.collection('system_tests').insertOne({
            test: 'write_permission_check',
            timestamp: new Date()
          });
          console.log("Yazma testi başarılı:", writeTestResult.insertedId);
        } catch (writeTestError) {
          console.error("Yazma testi başarısız:", writeTestError);
        }
      } catch(dbTestError) {
        console.error("Veritabanı test hatası:", dbTestError);
      }
      
      // Hata durumunda istemciyi fazla bekletme, hata kodu dönelim
      // Ancak 500 yerine 200 dönelim ve hata durumunu error flag'i ile belirtelim
      // Böylece istemci tarafında HTTP hatası değil de normal bir yanıt olarak işlenecek
      return res.status(200).json({ 
        success: false,
        error: 'Konum kaydedilemedi, ancak izleme devam ediyor',
        errorType: 'db_error',
        details: {
          message: insertError.message,
          code: insertError.code,
          name: insertError.name
        }
      });
    }

    if (!result || !result.insertedId) {
      console.error("Konum kaydı eklenemedi:", result);
      // Hata yerine başarı mesajı dönelim ama flag'i false yapalım
      return res.status(200).json({ 
        success: false, 
        error: 'Konum kaydedilemedi, ancak izleme devam ediyor',
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        }
      });
    }

    console.log("Konum kaydı eklendi, ID:", result.insertedId);

    // Başarılı yanıt döndür ve doğruluk önerileri ekle
    const response = {
      success: true,
      message: 'Konum başarıyla güncellendi',
      data: {
        id: result.insertedId,
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          address: address || undefined
        },
        accuracy: parsedAccuracy || null,
        accuracyLevel: 'unknown',
        timestamp: timestamp ? new Date(timestamp) : new Date()
      }
    };

    // Konum doğruluğu kontrolü
    if (!isNaN(parsedAccuracy)) {
      // Doğruluk seviyesini belirle
      let accuracyLevel = 'unknown';
      if (parsedAccuracy <= 5) {
        accuracyLevel = 'high';
      } else if (parsedAccuracy <= 50) {
        accuracyLevel = 'medium';
      } else if (parsedAccuracy <= 500) {
        accuracyLevel = 'low';
      } else {
        accuracyLevel = 'very_low';
      }
      
      // Yanıta ekle
      response.data.accuracyLevel = accuracyLevel;
      
      // Doğruluk düşükse tavsiye mesajı ekle
      if (accuracyLevel === 'low' || accuracyLevel === 'very_low') {
        response.recommendation = 'Konum doğruluğunuz düşük. Konum servislerini yüksek doğruluk modunda etkinleştirmeniz önerilir.';
      }
    }

    return res.status(200).json(response);
  } catch (error) {
    console.error('Konum güncelleme hatası:', error);
    
    // Veritabanı bağlantı hatası mı kontrol et
    if (error.name === 'MongoError' || error.name === 'MongoNetworkError') {
      console.error('MongoDB bağlantı hatası:', error.code, error.message);
    }
    
    // Hata detaylarını günlüklere yaz
    try {
      console.error('Hata detayları:', JSON.stringify({
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
      }));
    } catch (logError) {
      console.error('Hata bilgilerini detaylandırırken bir sorun oluştu', logError);
    }
    
    // HTTP 500 hatasının client'ı bozmasını önlemek için 200 döndürüp hata durumunu belirtelim
    try {
      return res.status(200).json({ 
        success: false,
        error: 'Konum güncellenirken hata oluştu, ancak izleme devam ediyor',
        errorName: error.name || 'UnknownError',
        errorCode: error.code || 'UNKNOWN'
      });
    } catch (responseError) {
      // Bu noktada res.status/json çağrısında da hata olması durumunda
      // Raw HTTP yanıtı ile bitirmek zorundayız
      console.error('Yanıt oluşturulurken hata:', responseError);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: 'Fatal server error' }));
    }
  }
} 