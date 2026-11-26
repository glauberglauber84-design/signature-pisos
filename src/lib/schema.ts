import { absoluteUrl, siteConfig } from '../config/siteConfig';
import type { FaqItem } from './pages';

type Ld = Record<string, unknown>;

const businessId = (): string => `${absoluteUrl('/')}#negocio`;

const cityNode = (label: string): Ld => ({
  '@type': 'City',
  name: label,
  containedInPlace: { '@type': 'AdministrativeArea', name: 'São Paulo' },
});

export function websiteLd(): Ld {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${absoluteUrl('/')}#site`,
    name: siteConfig.name,
    url: absoluteUrl('/'),
    inLanguage: siteConfig.locale,
    description: siteConfig.description,
  };
}

export function localBusinessLd(): Ld {
  return {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    '@id': businessId(),
    name: siteConfig.name,
    url: absoluteUrl('/'),
    description: siteConfig.description,
    slogan: siteConfig.slogan,
    logo: { '@type': 'ImageObject', url: absoluteUrl(siteConfig.logo.square.ogSrc), width: 640, height: 408 },
    image: absoluteUrl('/og-default.jpg'),
    address: { '@type': 'PostalAddress', addressLocality: 'São Paulo', addressRegion: 'SP', addressCountry: 'BR' },
    areaServed: siteConfig.cities.map((c) => cityNode(c.label)),
  };
}

export function serviceLd(opts: {
  name: string;
  serviceType: string;
  cityLabel: string;
  url: string;
  description: string;
  image?: string;
  bairro?: boolean;
}): Ld {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    serviceType: opts.serviceType,
    description: opts.description,
    url: opts.url,
    provider: { '@id': businessId() },
    areaServed: opts.bairro
      ? { '@type': 'Place', name: opts.cityLabel, containedInPlace: cityNode('São Paulo') }
      : cityNode(opts.cityLabel),
    ...(opts.image ? { image: opts.image } : {}),
  };
}

export function breadcrumbLd(items: Array<{ name: string; path: string }>): Ld {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function faqLd(faq: FaqItem[]): Ld {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: f.resposta },
    })),
  };
}

export function collectionLd(name: string, url: string, description: string): Ld {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url,
    description,
    isPartOf: { '@id': `${absoluteUrl('/')}#site` },
  };
}
