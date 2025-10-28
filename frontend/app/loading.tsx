import { useTranslations } from 'next-intl';

export default function Loading() {
  // Note: useTranslations might not work in loading.tsx, so using hardcoded text
  // Loading components are simpler and don't need i18n in most cases
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );
}
