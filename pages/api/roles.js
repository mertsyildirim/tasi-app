import { setupCORS, handleOptionsRequest, sendSuccess, sendError } from '../../src/lib/api-utils';
import { getAllRoles } from '../../src/lib/permissions';

export default async function handler(req, res) {
  // CORS ayarlarını ekle
  setupCORS(res);
  
  // OPTIONS isteğini işle
  if (handleOptionsRequest(req, res)) {
    return;
  }
  
  try {
    switch (req.method) {
      case 'GET':
        return await getRoles(req, res);
      default:
        res.setHeader('Allow', ['GET']);
        return sendError(res, `Method ${req.method} not allowed`, 405);
    }
  } catch (error) {
    console.error('API Hatası:', error);
    return sendError(res, 'Sunucu hatası', 500);
  }
}

/**
 * Sistemdeki tüm rolleri döndürür
 */
async function getRoles(req, res) {
  try {
    // Tüm rolleri al
    const roles = getAllRoles().map(role => ({
      id: role.id,
      name: role.name,
      permissionCount: role.permissions.length
    }));
    
    return sendSuccess(res, { roles });
  } catch (error) {
    console.error('Roller alınırken hata:', error);
    return sendError(res, 'Roller alınırken bir hata oluştu', 500);
  }
} 