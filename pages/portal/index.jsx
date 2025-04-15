'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

function PortalIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/portal/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Yönlendiriliyor...</p>
      </div>
    </div>
  );
}

export default PortalIndex; 