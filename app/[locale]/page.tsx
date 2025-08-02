'use client';

import Editor from '@/components/Editor';
import LanguageDisplay from '@/components/LanguageDisplay';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations();
  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">{t('appTitle')}</h1>
      <Editor />
      <LanguageDisplay />
    </main>
  );
}