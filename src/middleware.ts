import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Bakım modu ayarları
interface MaintenanceConfig {
  homeEnabled: boolean;
  portalEnabled: boolean;
}

// Bakım modunun aktif olup olmadığını belirleyen değişkenler
const MAINTENANCE_MODE: MaintenanceConfig = {
  homeEnabled: false,  // Anasayfa bakım modu
  portalEnabled: false // Portal bakım modu
};

// Bakım modundan muaf tutulacak IP adresleri
const ALLOWED_IPS = [
  '127.0.0.1',      // Localhost
  '::1',            // Localhost IPv6
  // Geliştirme veya test amaçlı IP'leri buraya ekleyebilirsiniz
];

// Bakım modundan muaf tutulacak sayfa yolları
const EXEMPTED_PATHS = [
  '/maintenance',   // Bakım sayfasının kendisi
  '/api/health',    // Durum kontrolü için API endpoint
  '/_next',         // Next.js asset'leri
  '/favicon.ico',   // Favicon
  '/logo.png',      // Logo
  '/admin',         // Admin paneli tamamen muaf
];

export function middleware(request: NextRequest) {
  // İstek yapılan yolu al
  const path = request.nextUrl.pathname;
  
  // Admin sayfalarını her zaman muaf tut
  if (path.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Muaf tutulan yollara erişime izin ver
  for (const exemptedPath of EXEMPTED_PATHS) {
    if (path.startsWith(exemptedPath)) {
      return NextResponse.next();
    }
  }

  // Gelen IP adresini kontrol et
  const ip = request.ip || '0.0.0.0';
  if (ALLOWED_IPS.includes(ip)) {
    return NextResponse.next();
  }

  // Portal bakım modu kontrolü
  if (MAINTENANCE_MODE.portalEnabled && path.startsWith('/portal')) {
    const maintenanceUrl = new URL('/maintenance', request.url);
    return NextResponse.rewrite(maintenanceUrl);
  }

  // Anasayfa bakım modu kontrolü
  if (MAINTENANCE_MODE.homeEnabled && path === '/') {
    const maintenanceUrl = new URL('/maintenance', request.url);
    return NextResponse.rewrite(maintenanceUrl);
  }

  // Diğer tüm isteklere izin ver
  return NextResponse.next();
}

// Bu middleware'in hangi yollarda çalışacağını belirt
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 