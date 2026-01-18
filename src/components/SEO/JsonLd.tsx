'use client';

import { siteConfig } from '@/lib/constants';

export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    alternateName: [
      'Future Point Coaching',
      'Future Point Institute',
      'Future Point Sadulpur',
      'FPC Sadulpur',
    ],
    description: siteConfig.description,
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    image: `${siteConfig.url}/og-image.png`,
    foundingDate: siteConfig.founded,
    founder: {
      '@type': 'Person',
      name: siteConfig.owner.name,
      jobTitle: siteConfig.owner.title,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Ghanshyam Murliwala Complex, Near Maharana Pratap Chowk',
      addressLocality: 'Sadulpur',
      addressRegion: 'Rajasthan',
      postalCode: '331023',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '28.4167',
      longitude: '74.6500',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: siteConfig.contact.phone,
      contactType: 'customer service',
      email: siteConfig.contact.email,
      areaServed: ['Sadulpur', 'Churu', 'Rajasthan', 'India'],
      availableLanguage: ['Hindi', 'English'],
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '21:00',
      },
    ],
    sameAs: [],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Coaching Programs',
      itemListElement: [
        {
          '@type': 'Course',
          name: 'Class 10 CBSE Coaching',
          description: 'Complete CBSE coaching for Class 10 students with focus on board exams',
          provider: { '@type': 'Organization', name: siteConfig.name },
        },
        {
          '@type': 'Course',
          name: 'Class 11 Science Coaching',
          description: 'Science stream coaching for Class 11 - Physics, Chemistry, Maths, Biology',
          provider: { '@type': 'Organization', name: siteConfig.name },
        },
        {
          '@type': 'Course',
          name: 'Class 12 Board & Competitive Exam Coaching',
          description: 'Class 12 coaching with IIT-JEE and NEET preparation',
          provider: { '@type': 'Organization', name: siteConfig.name },
        },
        {
          '@type': 'Course',
          name: 'IIT-JEE Preparation',
          description: 'Expert coaching for IIT-JEE Main and Advanced',
          provider: { '@type': 'Organization', name: siteConfig.name },
        },
        {
          '@type': 'Course',
          name: 'NEET Preparation',
          description: 'Comprehensive NEET coaching for medical aspirants',
          provider: { '@type': 'Organization', name: siteConfig.name },
        },
      ],
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '150',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function LocalBusinessJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteConfig.url}/#localbusiness`,
    name: siteConfig.name,
    description: siteConfig.shortDescription,
    url: siteConfig.url,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    image: `${siteConfig.url}/og-image.png`,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Ghanshyam Murliwala Complex, Near Maharana Pratap Chowk',
      addressLocality: 'Sadulpur',
      addressRegion: 'Rajasthan',
      postalCode: '331023',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '28.4167',
      longitude: '74.6500',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '21:00',
      },
    ],
    areaServed: [
      { '@type': 'City', name: 'Sadulpur' },
      { '@type': 'City', name: 'Churu' },
      { '@type': 'State', name: 'Rajasthan' },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebsiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    creator: {
      '@type': 'Organization',
      name: 'AstraForensics',
      url: 'https://astraforensics.in',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/notes?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
