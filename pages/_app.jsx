import '../styles/globals.css'
import Head from 'next/head'
import Script from 'next/script'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { AuthProvider } from '../src/lib/auth'

function MyApp({ Component, pageProps }) {
  const router = useRouter()
  
  // Sayfa düzenini özelleştirme desteği
  const getLayout = Component.getLayout || ((page) => page)

  // Sayfa değişikliklerinde URL'i takip et
  useEffect(() => {
    const handleRouteChange = url => {
      console.log(`App navigated to: ${url}`)
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
      
      <AuthProvider>
        {getLayout(<Component {...pageProps} />)}
      </AuthProvider>
    </>
  )
}

export default MyApp 