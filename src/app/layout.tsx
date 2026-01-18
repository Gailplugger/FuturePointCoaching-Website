  import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Header, Footer } from '@/components/layout';
import { OrganizationJsonLd, LocalBusinessJsonLd, WebsiteJsonLd } from '@/components/SEO/JsonLd';
import { siteConfig } from '@/lib/constants';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} Sadulpur | Best Coaching for Class 10, 11, 12 | IIT-JEE & NEET`,
    template: `%s | ${siteConfig.name} Sadulpur`,
  },
  description: siteConfig.description,
  keywords: siteConfig.seo.keywords,
  authors: [
    { name: 'Gautam Sharma', url: siteConfig.url },
    { name: 'AstraForensics', url: 'https://astraforensics.in' },
  ],
  creator: 'AstraForensics',
  publisher: 'Future Point Coaching Institute',
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteConfig.url,
    title: `${siteConfig.name} Sadulpur - Best Coaching Institute in Churu, Rajasthan`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Future Point Coaching Institute Sadulpur',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} - Best Coaching in Sadulpur`,
    description: siteConfig.shortDescription,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'education',
  classification: 'Coaching Institute',
  other: {
    'geo.region': 'IN-RJ',
    'geo.placename': 'Sadulpur, Churu, Rajasthan',
    'geo.position': '28.4167;74.6500',
    'ICBM': '28.4167, 74.6500',
    'og:locality': 'Sadulpur',
    'og:region': 'Rajasthan',
    'og:country-name': 'India',
    'business:contact_data:street_address': 'Ghanshyam Murliwala Complex, Near Maharana Pratap Chowk',
    'business:contact_data:locality': 'Sadulpur',
    'business:contact_data:region': 'Rajasthan',
    'business:contact_data:postal_code': '331023',
    'business:contact_data:country_name': 'India',
    'business:contact_data:phone_number': '+91 8209429318',
    'business:contact_data:email': 'futurepointcoaching@gmail.com',
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
      <head>
        <OrganizationJsonLd />
        <LocalBusinessJsonLd />
        <WebsiteJsonLd />
      </head>
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
