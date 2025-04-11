import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="tr">
      <Head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <meta name="theme-color" content="#EA580C" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 