/**
 * Rol tabanlı erişim kontrolü (RBAC) için yetki tanımları
 * 
 * Her rol için erişim izinleri tanımlanmıştır.
 * Bu tanımlar, hangi rolün hangi API endpoint'lerine 
 * ve hangi işlemlere erişebileceğini belirler.
 */

// İzin tanımlamaları ve rol bazlı yetki sistemi
// Bu dosya, uygulama genelinde kullanılacak izinleri ve rolleri tanımlar

/**
 * İzin türleri - Her modül için ayrı izinler tanımlanır
 */
const PERMISSIONS = {
  // Taşıyıcı/Şirket İzinleri
  CARRIER_VIEW: 'carrier-view',     // Taşıyıcıları görüntüleme
  CARRIER_ADD: 'carrier-add',       // Taşıyıcı ekleme
  CARRIER_EDIT: 'carrier-edit',     // Taşıyıcı düzenleme
  CARRIER_DELETE: 'carrier-delete', // Taşıyıcı silme
  
  // Sürücü İzinleri
  DRIVER_VIEW: 'driver-view',       // Sürücüleri görüntüleme
  DRIVER_ADD: 'driver-add',         // Sürücü ekleme
  DRIVER_EDIT: 'driver-edit',       // Sürücü düzenleme
  DRIVER_DELETE: 'driver-delete',   // Sürücü silme
  
  // Müşteri İzinleri
  CUSTOMER_VIEW: 'customer-view',    // Müşterileri görüntüleme
  CUSTOMER_ADD: 'customer-add',      // Müşteri ekleme
  CUSTOMER_EDIT: 'customer-edit',    // Müşteri düzenleme
  CUSTOMER_DELETE: 'customer-delete', // Müşteri silme
  
  // Sipariş/Taşıma İzinleri
  ORDER_VIEW: 'order-view',         // Siparişleri görüntüleme
  ORDER_ADD: 'order-add',           // Sipariş ekleme
  ORDER_EDIT: 'order-edit',         // Sipariş düzenleme
  ORDER_DELETE: 'order-delete',     // Sipariş silme
  
  // Ayarlar İzinleri
  SETTINGS_VIEW: 'settings-view',   // Ayarları görüntüleme
  SETTINGS_EDIT: 'settings-edit',   // Ayarları düzenleme
  
  // Kullanıcı Yönetimi İzinleri
  USER_MANAGEMENT: 'user-management',         // Kullanıcı yönetimi
  PERMISSION_MANAGEMENT: 'permission-management'  // İzin yönetimi
};

/**
 * Rol tanımları - Her rol için varsayılan izinler atanır
 */
const ROLES = {
  // Süper Admin - Tüm izinlere sahiptir
  ADMIN: 'admin',
  
  // İçerik Editörü - Belirli içerik yönetim izinlerine sahiptir
  EDITOR: 'editor',
  
  // Destek Ekibi - Müşteri ve sipariş görüntüleme izinlerine sahiptir
  SUPPORT: 'support',
  
  // Müşteri - Sadece kendi içeriğini görebilir
  CUSTOMER: 'customer',
  
  // Sürücü - Sürücü portalına erişebilir
  DRIVER: 'driver',
  
  // Taşıma Şirketi - Şirket portalına erişebilir
  COMPANY: 'company'
};

/**
 * Rol izinleri - Her rol için hangi izinlerin otomatik olarak verileceğini tanımlar
 */
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    // Admin tüm izinlere sahiptir
    PERMISSIONS.CARRIER_VIEW, PERMISSIONS.CARRIER_ADD, PERMISSIONS.CARRIER_EDIT, PERMISSIONS.CARRIER_DELETE,
    PERMISSIONS.DRIVER_VIEW, PERMISSIONS.DRIVER_ADD, PERMISSIONS.DRIVER_EDIT, PERMISSIONS.DRIVER_DELETE,
    PERMISSIONS.CUSTOMER_VIEW, PERMISSIONS.CUSTOMER_ADD, PERMISSIONS.CUSTOMER_EDIT, PERMISSIONS.CUSTOMER_DELETE,
    PERMISSIONS.ORDER_VIEW, PERMISSIONS.ORDER_ADD, PERMISSIONS.ORDER_EDIT, PERMISSIONS.ORDER_DELETE,
    PERMISSIONS.SETTINGS_VIEW, PERMISSIONS.SETTINGS_EDIT,
    PERMISSIONS.USER_MANAGEMENT, PERMISSIONS.PERMISSION_MANAGEMENT
  ],
  
  [ROLES.EDITOR]: [
    // Editör sadece belirli içerik yönetim izinlerine sahiptir
    PERMISSIONS.CARRIER_VIEW, PERMISSIONS.CARRIER_ADD, PERMISSIONS.CARRIER_EDIT,
    PERMISSIONS.DRIVER_VIEW, PERMISSIONS.DRIVER_ADD, PERMISSIONS.DRIVER_EDIT,
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.ORDER_VIEW, PERMISSIONS.ORDER_ADD, PERMISSIONS.ORDER_EDIT,
    PERMISSIONS.SETTINGS_VIEW
  ],
  
  [ROLES.SUPPORT]: [
    // Destek ekibi sadece görüntüleme ve düzenleme izinlerine sahiptir
    PERMISSIONS.CARRIER_VIEW,
    PERMISSIONS.DRIVER_VIEW,
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.ORDER_VIEW, PERMISSIONS.ORDER_EDIT,
    PERMISSIONS.SETTINGS_VIEW
  ],
  
  [ROLES.CUSTOMER]: [
    // Müşteri sadece kendi içeriğini görebilir
  ],
  
  [ROLES.DRIVER]: [
    // Sürücü sadece kendi içeriğini görebilir
  ],
  
  [ROLES.COMPANY]: [
    // Şirket sadece kendi içeriğini görebilir
  ]
};

/**
 * İzin kontrolü - Kullanıcının belirli bir izne sahip olup olmadığını kontrol eder
 * @param {Array} userRoles - Kullanıcının rolleri
 * @param {String} permission - Kontrol edilecek izin
 * @return {Boolean} - İzin varsa true, yoksa false
 */
const hasPermission = (userRoles, permission) => {
  if (!userRoles || !permission) return false;
  
  // Admin her zaman tüm izinlere sahiptir
  if (userRoles.includes(ROLES.ADMIN)) return true;
  
  // İzin doğrudan kullanıcının rollerinde mi?
  if (userRoles.includes(permission)) return true;
  
  // Kullanıcının rolleri üzerinden izinleri kontrol et
  for (const role of userRoles) {
    if (ROLE_PERMISSIONS[role] && ROLE_PERMISSIONS[role].includes(permission)) {
      return true;
    }
  }
  
  return false;
};

/**
 * Rol listesini izinleri ile birlikte getir
 * @return {Array} - Rol ve izin sayılarını içeren nesne dizisi
 */
const getRolesWithPermissions = () => {
  return [
    {
      id: ROLES.ADMIN,
      name: 'Süper Admin',
      permissionCount: ROLE_PERMISSIONS[ROLES.ADMIN].length,
      description: 'Tam yetki'
    },
    {
      id: ROLES.EDITOR,
      name: 'İçerik Editörü',
      permissionCount: ROLE_PERMISSIONS[ROLES.EDITOR].length,
      description: 'İçerik yönetimi'
    },
    {
      id: ROLES.SUPPORT,
      name: 'Destek Ekibi',
      permissionCount: ROLE_PERMISSIONS[ROLES.SUPPORT].length,
      description: 'Destek işlemleri'
    },
    {
      id: ROLES.CUSTOMER,
      name: 'Müşteri',
      permissionCount: ROLE_PERMISSIONS[ROLES.CUSTOMER].length,
      description: 'Standart kullanıcı'
    },
    {
      id: ROLES.DRIVER,
      name: 'Sürücü',
      permissionCount: ROLE_PERMISSIONS[ROLES.DRIVER].length,
      description: 'Sürücü kullanıcısı'
    },
    {
      id: ROLES.COMPANY,
      name: 'Şirket',
      permissionCount: ROLE_PERMISSIONS[ROLES.COMPANY].length,
      description: 'Taşıma şirketi'
    }
  ];
};

/**
 * Tüm izinleri kategori bazlı listeler
 * @return {Object} - Kategori bazlı izin listesi
 */
const getAllPermissions = () => {
  return {
    carrier: [
      PERMISSIONS.CARRIER_VIEW,
      PERMISSIONS.CARRIER_ADD,
      PERMISSIONS.CARRIER_EDIT,
      PERMISSIONS.CARRIER_DELETE
    ],
    driver: [
      PERMISSIONS.DRIVER_VIEW,
      PERMISSIONS.DRIVER_ADD,
      PERMISSIONS.DRIVER_EDIT,
      PERMISSIONS.DRIVER_DELETE
    ],
    customer: [
      PERMISSIONS.CUSTOMER_VIEW,
      PERMISSIONS.CUSTOMER_ADD,
      PERMISSIONS.CUSTOMER_EDIT,
      PERMISSIONS.CUSTOMER_DELETE
    ],
    order: [
      PERMISSIONS.ORDER_VIEW,
      PERMISSIONS.ORDER_ADD,
      PERMISSIONS.ORDER_EDIT,
      PERMISSIONS.ORDER_DELETE
    ],
    settings: [
      PERMISSIONS.SETTINGS_VIEW,
      PERMISSIONS.SETTINGS_EDIT,
      PERMISSIONS.USER_MANAGEMENT,
      PERMISSIONS.PERMISSION_MANAGEMENT
    ]
  };
};

module.exports = {
  PERMISSIONS,
  ROLES,
  ROLE_PERMISSIONS,
  hasPermission,
  getRolesWithPermissions,
  getAllPermissions
}; 