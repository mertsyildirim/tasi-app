import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { FaCheckCircle } from 'react-icons/fa';

export default function RegisterSuccess() {
  const router = useRouter();

  useEffect(() => {
    // 5 saniye sonra giriş sayfasına yönlendir
    const timer = setTimeout(() => {
      router.push('/portal/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Head>
        <title>Kayıt Başarılı - TaşıApp</title>
        <meta name="description" content="TaşıApp Taşıyıcı Portalı Kayıt Başarılı" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <FaCheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Kayıt İşlemi Başarılı
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Hesabınız başarıyla oluşturuldu. Giriş yapabilmek için e-posta adresinize gönderilen onay linkine tıklayın.
            </p>
          </div>

          <div className="mt-8">
            <Link
              href="/portal/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Giriş Yap
            </Link>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p>5 saniye içinde giriş sayfasına yönlendirileceksiniz...</p>
          </div>
        </div>
      </div>
    </>
  );
} 