import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Portal subdomain kontrolü
  if (request.headers.get('host')?.includes('portal.tasiapp.com')) {
    // Auth token kontrolü
    const token = request.cookies.get('auth_token')
    
    // Ana sayfaya gelen istekler için yönlendirme
    if (request.nextUrl.pathname === '/') {
      // Token varsa dashboard'a, yoksa login'e yönlendir
      if (token) {
        return NextResponse.redirect(new URL('/portal/dashboard', request.url))
      } else {
        return NextResponse.redirect(new URL('/portal/login', request.url))
      }
    }

    // /portal'a gelen istekler için yönlendirme
    if (request.nextUrl.pathname === '/portal') {
      if (token) {
        return NextResponse.redirect(new URL('/portal/dashboard', request.url))
      } else {
        return NextResponse.redirect(new URL('/portal/login', request.url))
      }
    }

    // Giriş yapmamış kullanıcıları login sayfasına yönlendir
    if (!token && !request.nextUrl.pathname.includes('/portal/login')) {
      return NextResponse.redirect(new URL('/portal/login', request.url))
    }
  }

  return NextResponse.next()
}

// Middleware'in çalışacağı path'leri belirt
export const config = {
  matcher: [
    // Portal subdomain için tüm istekler
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      has: [
        {
          type: 'host',
          value: 'portal.tasiapp.com',
        },
      ],
    },
  ],
} 