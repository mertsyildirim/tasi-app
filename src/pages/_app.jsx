import '../styles/globals.css'
import Head from 'next/head'
import Script from 'next/script'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { AuthProvider } from '../lib/auth-context'

function MyApp({ Component, pageProps }) {
  const router = useRouter()
  
  // Sayfa düzenini özelleştirme desteği
  const getLayout = Component.getLayout || ((page) => page)

  // Sayfa değişikliklerinde URL'i takip et
  useEffect(() => {
    const handleRouteChange = url => {
      console.log(`App navigated to: ${url}`)
      
      // Google Analytics veya diğer takip kodları burada çalıştırılabilir
      
      // Sayfanın en üstüne kaydır
      window.scrollTo(0, 0)
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Taşı App - Taşıma ve Lojistik</title>
      </Head>
      
      {/* Google Maps API sadece bir kez yükleniyor */}
      <Script 
        id="google-maps-api"
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry&v=weekly`}
        strategy="afterInteractive"
        loading="async"
      />
      
      <AuthProvider>
        {getLayout(<Component {...pageProps} />)}
      </AuthProvider>
    </>
  )
}

export default MyApp 