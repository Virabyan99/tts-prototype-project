import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  if (!locale) {
    console.warn('Locale is undefined, defaulting to "en"');
    locale = 'en'; // Fallback to default locale
  }
  const messages = (await import(`../messages/${locale}.json`)).default;
  return {
    locale, // Include the locale property
    messages, // Include the messages property
  };
});