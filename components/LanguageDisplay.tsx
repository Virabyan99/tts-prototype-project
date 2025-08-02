'use client';

import { useAppStore } from '@/lib/store';
import { useTranslations } from 'next-intl';

// Map ISO 639-3 codes to human-readable names
const languageNames: Record<string, string> = {
  eng: 'English',
  spa: 'Spanish',
  fra: 'French',
};

export default function LanguageDisplay() {
  const detectedLanguage = useAppStore((state) => state.detectedLanguage);
  const t = useTranslations();
  const languageName = languageNames[detectedLanguage] || 'Unknown';

  return (
    <div className="mt-2 text-sm text-gray-600">
      {t('languageLabel', { language: languageName })}
    </div>
  );
}