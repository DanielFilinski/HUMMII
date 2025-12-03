'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('common');

  useEffect(() => {
    // TODO: Replace with proper error logging service (e.g., Sentry)
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Locale-specific error:', error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h2 className="text-2xl font-bold mb-4">{t('error')}</h2>
      <p className="text-text-secondary mb-6">
        {error.message || t('somethingWentWrong')}
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-hover transition-colors"
      >
        {t('tryAgain')}
      </button>
      <Link
        href="/"
        className="mt-4 px-4 py-2 bg-background-secondary text-text-primary rounded hover:bg-surface-hover transition-colors"
      >
        {t('returnHome')}
      </Link>
    </div>
  );
}
