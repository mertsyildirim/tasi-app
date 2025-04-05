import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import dynamic from 'next/dynamic'

const inter = Inter({ subsets: ['latin'] })

const Header = dynamic(() => import('./(musteri)/components/Header'), {
  ssr: false
})

const Footer = dynamic(() => import('./(musteri)/components/Footer'), {
  ssr: false
})

export const metadata: Metadata = {
  title: 'Taşı App',
  description: 'Taşıma işleriniz için güvenilir çözüm ortağınız',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
} 