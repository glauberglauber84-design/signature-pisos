import { absoluteUrl } from '../config/siteConfig';

export const DEFAULT_OG = '/og-default.jpg';

export function canonicalFor(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return absoluteUrl(p.endsWith('/') ? p : `${p}/`);
}

export function ogImageFor(path?: string): { url: string; width: number; height: number } {
  return { url: absoluteUrl(path ?? DEFAULT_OG), width: 1200, height: 630 };
}
