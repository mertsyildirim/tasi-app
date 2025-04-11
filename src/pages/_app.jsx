import '../styles/globals.css'
import { AuthProvider } from '../lib/auth-context'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Script from 'next/script'

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  // Sayfa geçişlerinde yükleme göstergesi için
  useEffect(() => {
    const handleStart = () => {
      // Yükleme başladı - burada yükleme göstergesi gösterilebilir
      console.log('Sayfa yükleniyor...');
    };
    
    const handleComplete = () => {
      // Yükleme tamamlandı - burada yükleme göstergesi gizlenebilir
      console.log('Sayfa yüklendi');
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry&v=weekly`}
        strategy="beforeInteractive"
      />
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </>
  )
}

export default MyApp; 