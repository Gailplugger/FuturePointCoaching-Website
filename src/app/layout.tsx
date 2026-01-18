  import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Header, Footer } from '@/components/layout';
import { siteConfig } from '@/lib/constants';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'coaching',
    'institute',
    'education',
    'CBSE',
    'science',
    'commerce',
    'arts',
    'class 10',
    'class 11',
    'class 12',
    'Sadulpur',
    'Churu',
    'Rajasthan',
    'Future Point',
    'IIT-JEE',
    'NEET',
  ],
  authors: [{ name: 'AstraForensics', url: 'https://astraforensics.in' }],
  creator: 'AstraForensics',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#0a1628',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1 pt-20">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
