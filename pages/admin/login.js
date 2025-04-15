import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
      <div className="text-white text-center">
        <p className="text-lg mb-2">Yönlendiriliyor...</p>
        <div className="w-8 h-8 border-t-2 border-b-2 border-yellow-500 rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
} 