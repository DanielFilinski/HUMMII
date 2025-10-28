import { getRequestConfig } from 'next-intl/server';
import { routing } from './i18n/routing';
import en from './messages/en.json';
import fr from './messages/fr.json';

const messages = {
  en,
  fr,
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: messages[locale as keyof typeof messages] || messages.en,
  };
});

