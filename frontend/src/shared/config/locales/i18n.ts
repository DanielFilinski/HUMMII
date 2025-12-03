import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !['ru', 'en'].includes(locale)) {
    locale = 'ru';
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
