import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function PortalLayout({ children, title }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/portal/dashboard">
                  <Image
                    src="/portal_logo.png"
                    alt="Taşı Portal Logo"
                    width={120}
                    height={40}
                    className="cursor-pointer"
                    priority
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50">
        {children}
      </main>
    </div>
  );
} 