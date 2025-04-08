import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // URL'yi kontrol et
    const hostname = window.location.hostname;
    const path = window.location.pathname;
    
    console.log("Ana sayfa yüklendi, hostname:", hostname, "path:", path);

    // Eğer portal.tasiapp.com ise ve ana sayfadaysa, portal dashboard'a yönlendir
    if (hostname.includes('portal.tasiapp.com') && (path === '/' || path === '')) {
      console.log("Portal domain için portal/dashboard'a yönlendiriliyor");
      router.push('/portal/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-6">TaşıApp</h1>
        <p className="text-xl mb-6">Nakliye ve lojistik çözümleri için en iyi platform</p>
        <div className="flex justify-center space-x-4">
          <a 
            href="/musteri" 
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Müşteri Girişi
          </a>
          <a 
            href="/portal/login" 
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Portal Girişi
          </a>
        </div>
      </div>
    </div>
  );
} 