"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Перенаправляем на страницу входа в админ-панель
    router.push('/admin/login');
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: '#f5f5f5'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1890ff' }}>
          Перенаправление...
        </h1>
        <p style={{ color: '#666' }}>Пожалуйста, подождите</p>
      </div>
    </div>
  );
}

