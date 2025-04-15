import { connectToDatabase } from '../../lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();

    const testUsers = [
      {
        name: 'Test Müşteri',
        email: 'customer@test.com',
        password: await bcrypt.hash('test123', 10),
        roles: ['customer'],
        phone: '0555 111 1111',
        address: 'Test Mahallesi, Müşteri Sokak No:1 İstanbul',
        notifications: true,
        language: 'tr',
        taxNumber: '11111111111',
        billingAddress: 'Fatura Mahallesi, Müşteri Sokak No:1 İstanbul',
        profile: {
          avatarUrl: '/images/default-avatar.png',
          bio: 'Test müşteri hesabı',
          completedOrders: 12,
          rating: 4.7
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Test Taşıyıcı',
        email: 'carrier@test.com',
        password: await bcrypt.hash('test123', 10),
        roles: ['carrier'],
        phone: '0555 222 2222',
        address: 'Test Mahallesi, Taşıyıcı Sokak No:2 Ankara',
        notifications: true,
        language: 'tr',
        taxNumber: '22222222222',
        billingAddress: 'Fatura Mahallesi, Taşıyıcı Sokak No:2 Ankara',
        profile: {
          avatarUrl: '/images/default-avatar.png',
          bio: 'Test taşıma şirketi',
          completedOrders: 35,
          rating: 4.4
        },
        companyName: 'Test Taşıma Şirketi',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mehmet Yılmaz',
        email: 'driver@test.com',
        password: await bcrypt.hash('test123', 10),
        roles: ['driver'],
        phone: '0555 333 3333',
        address: 'Test Mahallesi, Sürücü Sokak No:3 İzmir',
        notifications: true,
        language: 'tr',
        profile: {
          avatarUrl: '/images/default-avatar.png',
          bio: 'Profesyonel sürücü',
          completedOrders: 78,
          rating: 4.8
        },
        driverStatus: 'active',
        driverDetails: {
          licensePlate: '34 ABC 123',
          vehicleType: 'Kamyonet',
          vehicleMake: 'Ford',
          vehicleModel: 'Transit',
          vehicleYear: 2020,
          licenseNumber: 'S1234567',
          licenseExpiryDate: '2026-05-15'
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ali Demir',
        email: 'driver2@test.com',
        password: await bcrypt.hash('test123', 10),
        roles: ['driver'],
        phone: '0555 444 5555',
        address: 'Merkez Mahallesi, Ana Cadde No:42 Bursa',
        notifications: true,
        language: 'tr',
        profile: {
          avatarUrl: '/images/default-avatar.png',
          bio: 'Uzun yol şoförü',
          completedOrders: 45,
          rating: 4.5
        },
        driverStatus: 'inactive',
        driverDetails: {
          licensePlate: '16 XYZ 789',
          vehicleType: 'Tır',
          vehicleMake: 'Mercedes',
          vehicleModel: 'Actros',
          vehicleYear: 2019,
          licenseNumber: 'S7654321',
          licenseExpiryDate: '2025-11-20'
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Test Admin',
        email: 'admin@test.com',
        password: await bcrypt.hash('test123', 10),
        roles: ['admin'],
        phone: '0555 999 9999',
        address: 'Test Mahallesi, Admin Sokak No:4 Bursa',
        notifications: true,
        language: 'tr',
        profile: {
          avatarUrl: '/images/default-avatar.png',
          bio: 'Sistem yöneticisi',
          completedOrders: 0,
          rating: 5.0
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Önce mevcut test kullanıcılarını sil
    await db.collection('users').deleteMany({
      email: { $in: testUsers.map(user => user.email) }
    });

    // Yeni test kullanıcılarını ekle
    const result = await db.collection('users').insertMany(testUsers);

    res.status(200).json({
      message: 'Test kullanıcıları başarıyla eklendi',
      count: result.insertedCount,
      users: testUsers.map(({ password, ...user }) => user)
    });
  } catch (error) {
    console.error('Test users error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
} 