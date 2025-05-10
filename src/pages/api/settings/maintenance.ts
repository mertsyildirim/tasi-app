import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const MAINTENANCE_CONFIG_PATH = path.join(process.cwd(), 'maintenance.json');

// Bakım modu ayarlarını kaydet
const saveMaintenanceConfig = (config: { homeEnabled: boolean; portalEnabled: boolean }) => {
  fs.writeFileSync(MAINTENANCE_CONFIG_PATH, JSON.stringify(config, null, 2));
};

// Bakım modu ayarlarını yükle
const loadMaintenanceConfig = (): { homeEnabled: boolean; portalEnabled: boolean } => {
  try {
    if (fs.existsSync(MAINTENANCE_CONFIG_PATH)) {
      const config = JSON.parse(fs.readFileSync(MAINTENANCE_CONFIG_PATH, 'utf-8'));
      return {
        homeEnabled: Boolean(config.homeEnabled),
        portalEnabled: Boolean(config.portalEnabled)
      };
    }
  } catch (error) {
    console.error('Bakım modu ayarları yüklenirken hata:', error);
  }
  
  return {
    homeEnabled: false,
    portalEnabled: false
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Sadece admin kullanıcılarının erişimine izin ver
  // TODO: Admin kontrolü eklenecek

  if (req.method === 'GET') {
    // Bakım modu ayarlarını getir
    const config = loadMaintenanceConfig();
    return res.status(200).json(config);
  }
  
  if (req.method === 'POST') {
    try {
      const { homeEnabled, portalEnabled } = req.body;
      
      // Ayarları kaydet
      const config = {
        homeEnabled: Boolean(homeEnabled),
        portalEnabled: Boolean(portalEnabled)
      };
      
      saveMaintenanceConfig(config);
      
      return res.status(200).json({ success: true, config });
    } catch (error) {
      console.error('Bakım modu ayarları kaydedilirken hata:', error);
      return res.status(500).json({ error: 'Bakım modu ayarları kaydedilemedi.' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
} 