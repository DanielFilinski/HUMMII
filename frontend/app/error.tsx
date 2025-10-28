'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('common');

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
      <h2 className="text-2xl font-bold mb-4">{t('error')}</h2>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        {t('tryAgain')}
      </button>
      <Link
        href="/"
        className="mt-4 px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition-colors"
      >
        {t('returnHome')}
      </Link>
    </div>
  );
}
