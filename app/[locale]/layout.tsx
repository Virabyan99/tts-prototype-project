import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Noto_Sans } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const notoSans = Noto_Sans({ subsets: ['latin'], variable: '--font-noto-sans' });

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages({ locale: locale || 'en' });

  return {
    title: 'TTS Note-Taking App',
    description: 'TTS Note-Taking App is a versatile, free multilingual note-taking application with text-to-speech (TTS) functionality. Supporting English, Spanish, and French, it features automatic language detection with Franc, rich text editing via Lexical, persistent local storage using IndexedDB, and state management with Zustand. Ideal for users needing seamless note-taking with voice playback in multiple languages.',
    keywords: [
      'tts note taking',
      'multilingual notes',
      'text to speech app',
      'language detection',
      'note taking with tts',
      'franc language detection',
      'lexical editor',
      'indexeddb storage',
      'english notes',
      'spanish notes',
      'french notes'
    ],
    authors: [{ name: 'TTS Note-Taking Team' }],
    creator: 'TTS Note-Taking Team',
    publisher: 'TTS Note-Taking Team',
    applicationName: 'TTS Note-Taking App',
    generator: 'Next.js',
    metadataBase: new URL('https://tts-note-taking.example.com'),
    alternates: {
      canonical: '/',
      languages: {
        'en-US': '/en',
        'es-ES': '/es',
        'fr-FR': '/fr',
      },
    },
    openGraph: {
      title: 'TTS Note-Taking App',
      description: 'A multilingual note-taking app with text-to-speech functionality, supporting English, Spanish, and French. Features include language detection, persistent storage, and more.',
      url: 'https://tts-note-taking.example.com',
      siteName: 'TTS Note-Taking App',
      images: [
        {
          url: '/placeholder-logo.png', // Assume a placeholder; replace with actual if available
          width: 1200,
          height: 630,
          alt: 'TTS Note-Taking App Preview',
        },
      ],
      locale: locale || 'en',
      type: 'website',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: '/placeholder-logo.png', // Assume placeholder
      shortcut: '/placeholder-logo.png',
      apple: '/placeholder-logo.png',
    },
    category: 'productivity',
    other: {
      'mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black',
      'apple-mobile-web-app-title': 'TTS Note-Taking App',
      'theme-color': '#ffffff',
    },
  };
}

export async function generateViewport(): Promise<Viewport> {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  };
}

export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'es' },
    { locale: 'fr' },
  ];
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  let messages;
  try {
    messages = await getMessages({ locale });
  } catch (error) {
    notFound();
  }
  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSans.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}