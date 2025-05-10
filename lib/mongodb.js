import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI ortam değişkeni tanımlanmamış');
}

const uri = process.env.MONGODB_URI;
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function connectToDatabase() {
  try {
    console.log('MongoDB bağlantısı başlatılıyor...');
    const client = await clientPromise;
    const db = client.db();
    console.log('MongoDB bağlantısı başarılı');
    return { client, db };
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    throw new Error('Veritabanına bağlanılamadı: ' + error.message);
  }
} 