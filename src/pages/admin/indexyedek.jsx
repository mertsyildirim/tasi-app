import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '../../lib/auth';

function AdminIndex() {
  const router = useRouter();

  // Sayfa yüklendiğinde dashboard'a yönlendir
  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">Yönlendiriliyor...</h2>
        <p className="text-gray-500 mt-2">Admin paneline yönlendiriliyorsunuz</p>
      </div>
    </div>
  );
}

export default withAuth(AdminIndex, ['admin']); 