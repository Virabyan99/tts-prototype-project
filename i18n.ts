import { createNavigation } from 'next-intl/navigation';

export const locales = ['en', 'es', 'fr'] as const;
export const localePrefix = 'always';
export const defaultLocale = 'en';

export const { Link, redirect, usePathname, useRouter } = createNavigation({
  locales,
  localePrefix,
  defaultLocale,
});