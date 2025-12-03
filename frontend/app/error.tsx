'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: Replace with proper error logging service (e.g., Sentry)
    // This is a placeholder - in production, log to error monitoring service
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Application error:', error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h2 className="text-2xl font-bold mb-4">Ошибка</h2>
      <p className="text-text-secondary mb-6">Что-то пошло не так</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-hover transition-colors"
      >
        Попробовать снова
      </button>
      <Link
        href="/"
        className="mt-4 px-4 py-2 bg-background-secondary text-text-primary rounded hover:bg-surface-hover transition-colors"
      >
        Вернуться на главную
      </Link>
    </div>
  );
}
