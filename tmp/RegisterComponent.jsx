import React from 'react';
import Link from 'next/link';

export default function TasiyiciKayit() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: '#FEF3C7',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          marginBottom: '1rem',
          color: '#1F2937'
        }}>
          Taşıyıcı Kayıt
        </h1>
        <p style={{ 
          color: '#4B5563',
          marginBottom: '1.5rem'
        }}>
          Taşı.app taşıyıcı ağına katılın. Bu sayfa bakım modundadır.
        </p>
        <Link href="/portal/login" style={{
          display: 'inline-block',
          backgroundColor: '#EA580C',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.25rem',
          textDecoration: 'none',
          fontWeight: '500',
          marginTop: '1rem'
        }}>
          Giriş Sayfasına Dön
        </Link>
      </div>
    </div>
  );
} 