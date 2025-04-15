import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
console.log('MongoDB URI:', MONGODB_URI ? 'Tanımlı' : 'Tanımlı Değil');

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(MONGODB_URI);
  clientPromise = client.connect();
}

export async function connectToDatabase() {
  try {
    console.log('MongoDB bağlantısı kuruluyor...');
    const client = await clientPromise;
    const db = client.db('tasi_app');
    console.log('MongoDB bağlantısı başarılı!');
    return { client, db };
  } catch (error) {
    console.error('MongoDB Bağlantı Hatası:', error.message);
    throw new Error('Veritabanına bağlanılamadı: ' + error.message);
  }
} 