const { connectToDatabase } = require('../src/lib/mongodb');
const User = require('../src/models/User');
const bcrypt = require('bcryptjs');

const TEST_USERS = [
  {
    email: 'admin@tasiapp.com',
    password: 'AdminTasi2024!',
    name: 'Admin Kullanıcı',
    roles: ['admin'],
    phone: '+90 555 222 3333',
    address: 'Şişli, İstanbul',
    isActive: true,
    isFreelance: false,
    profile: {
      avatarUrl: '/profile-pics/admin.png',
      bio: 'Taşı.app Sistem Yöneticisi',
      completedOrders: 0,
      rating: 5.0
    },
    notifications: true,
    language: 'tr',
    stats: {
      totalUsers: 150,
      activeDrivers: 45,
      pendingApprovals: 12,
      monthlyRevenue: 125000
    }
  },
  {
    email: 'testbelge@test.com',
    password: 'test123',
    name: 'Test Taşıyıcı',
    roles: ['company'],
    phone: '+90 555 987 6543',
    address: 'Üsküdar, İstanbul',
    isActive: true,
    isFreelance: false,
    companyName: 'Hızlı Taşımacılık Ltd. Şti.',
    taxNumber: '1234567890',
    taxOffice: 'Üsküdar',
    documentStatus: 'APPROVED',
    profile: {
      avatarUrl: '/profile-pics/company.png',
      bio: 'Profesyonel taşımacılık hizmetleri',
      completedOrders: 25,
      rating: 4.8
    },
    notifications: true,
    language: 'tr',
    billingAddress: 'Üsküdar Vergi Dairesi Cad. No:123 Üsküdar/İstanbul',
    stats: {
      totalTrips: 156,
      totalDistance: 12500,
      totalEarnings: 85000,
      activeVehicles: 8
    }
  },
  {
    email: 'driver@tasiapp.com',
    password: 'test123',
    name: 'Sürücü Kullanıcı',
    roles: ['driver'],
    phone: '+90 555 789 1234',
    address: 'Beşiktaş, İstanbul',
    isActive: true,
    isFreelance: true,
    documentStatus: 'APPROVED',
    profile: {
      avatarUrl: '/profile-pics/driver.png',
      bio: 'Profesyonel sürücü',
      completedOrders: 15,
      rating: 4.7
    },
    notifications: true,
    language: 'tr',
    driverLicense: {
      number: 'ABC123456',
      type: 'C',
      expiryDate: '2025-12-31'
    },
    vehicle: {
      type: 'Kamyonet',
      plate: '34ABC123',
      brand: 'Ford',
      model: 'Transit',
      year: 2020,
      capacity: '1.5 ton'
    },
    stats: {
      totalTrips: 89,
      totalDistance: 5600,
      totalEarnings: 42000,
      averageRating: 4.7
    }
  },
  {
    email: 'ahmet@example.com',
    password: 'test123',
    name: 'Ahmet Yılmaz',
    roles: ['customer'],
    phone: '+90 555 123 4567',
    address: 'Kadıköy, İstanbul',
    isActive: true,
    isFreelance: false,
    profile: {
      avatarUrl: '/profile-pics/customer.png',
      bio: 'Düzenli taşıma hizmeti alan müşteri',
      completedOrders: 5,
      rating: 4.5
    },
    notifications: true,
    language: 'tr',
    billingAddress: 'Kadıköy Mah. Müşteri Sok. No:45 Kadıköy/İstanbul',
    paymentMethods: [
      {
        type: 'card',
        last4: '4242',
        expiry: '12/24',
        isDefault: true
      }
    ],
    stats: {
      totalOrders: 12,
      totalSpent: 8500,
      savedAddresses: [
        {
          title: 'Ev',
          address: 'Kadıköy Mah. Müşteri Sok. No:45 Kadıköy/İstanbul'
        },
        {
          title: 'İş',
          address: 'Levent Mah. Plaza Cad. No:123 Beşiktaş/İstanbul'
        }
      ]
    }
  }
];

async function seedUsers() {
  try {
    // Veritabanına bağlan
    await connectToDatabase();
    console.log('Veritabanına bağlandı');

    // Mevcut test kullanıcılarını sil
    await User.deleteMany({
      email: { $in: TEST_USERS.map(user => user.email) }
    });
    console.log('Eski test kullanıcıları silindi');

    // Şifreleri hash'le ve kullanıcıları ekle
    const hashedUsers = await Promise.all(
      TEST_USERS.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return { ...user, password: hashedPassword };
      })
    );

    // Kullanıcıları veritabanına ekle
    await User.insertMany(hashedUsers);
    console.log('Test kullanıcıları başarıyla eklendi');

    // Eklenen kullanıcıları göster
    const users = await User.find({ email: { $in: TEST_USERS.map(user => user.email) } })
      .select('-password');
    console.log('\nEklenen kullanıcılar:');
    users.forEach(user => {
      console.log(`\n${user.name} (${user.email}):`);
      console.log('Roller:', user.roles);
      console.log('Profil:', user.profile);
      console.log('İstatistikler:', user.stats);
    });

    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

seedUsers(); 