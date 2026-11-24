import locais from '../data/locais.json';
import { siteConfig } from '../config/siteConfig';

export interface Loc {
  servico: string;
  servicoLabel: string;
  cidade: string;
  cidadeLabel: string;
  estado: string;
  principal: boolean;
  bairros: string[];
  servicoPrincipal?: boolean;
}

export interface FaqItem {
  pergunta: string;
  resposta: string;
}

export interface PageContent {
  title: string;
  description: string;
  h1: string;
  hero_subtitle: string;
  sobre_texto: string;
  faq: FaqItem[];
}

export interface HubContent {
  title: string;
  description: string;
  h1: string;
  intro: string;
}

export interface HomeContent {
  title: string;
  description: string;
  h1: string;
  hero_subtitle: string;
  intro: string;
}

export const allLocs = locais as Loc[];

const modules = import.meta.glob('/src/data/pages/*.json', { eager: true }) as Record<string, { default: unknown }>;
const byName = new Map<string, unknown>();
for (const [path, mod] of Object.entries(modules)) {
  const name = path.split('/').pop()!.replace(/\.json$/, '');
  byName.set(name, mod.default);
}

const allowMissing = (): boolean => import.meta.env.DEV === true || process.env.ALLOW_MISSING_CONTENT === '1';

export const pageSlug = (l: Pick<Loc, 'servico' | 'cidade'>): string => `${l.servico}-${l.cidade}`;

export interface Loaded<T> {
  data: T;
  missing: boolean;
}

function fallbackPage(l: Loc): PageContent {
  return {
    title: `${l.servicoLabel} em ${l.cidadeLabel} | Signature Pisos`,
    description: `${l.servicoLabel} em ${l.cidadeLabel}. ${siteConfig.slogan}`,
    h1: `${l.servicoLabel} em ${l.cidadeLabel}`,
    hero_subtitle: siteConfig.tagline,
    sobre_texto: `${siteConfig.name} atende ${l.cidadeLabel}. ${siteConfig.slogan}`,
    faq: [],
  };
}

export function getPageData(servico: string, cidade: string): Loaded<PageContent> {
  const loc = allLocs.find((l) => l.servico === servico && l.cidade === cidade);
  if (!loc) throw new Error(`Local desconhecido: ${servico}-${cidade}`);
  const raw = byName.get(`${servico}-${cidade}`) as PageContent | undefined;
  if (raw) return { data: raw, missing: false };
  return { data: fallbackPage(loc), missing: true };
}

export function getHubData(slug: string): Loaded<HubContent> {
  const raw = byName.get(`_servico-${slug}`) as HubContent | undefined;
  if (raw) return { data: raw, missing: false };
  const label = siteConfig.services.find((s) => s.slug === slug)?.label ?? slug;
  return {
    data: {
      title: `${label} em São Paulo e Grande SP | Signature Pisos`,
      description: `${label}. ${siteConfig.slogan}`,
      h1: label,
      intro: siteConfig.tagline,
    },
    missing: true,
  };
}

export function getHome(): Loaded<HomeContent> {
  const raw = byName.get('_home') as HomeContent | undefined;
  if (raw) return { data: raw, missing: false };
  return {
    data: {
      title: `${siteConfig.name} | Pisos e revestimentos em SP`,
      description: siteConfig.description,
      h1: `${siteConfig.name}: pisos e revestimentos em São Paulo e Grande SP`,
      hero_subtitle: siteConfig.slogan,
      intro: siteConfig.tagline,
    },
    missing: true,
  };
}

let validated = false;
/** Valida presença, limites e unicidade. Falha o build, exceto com ALLOW_MISSING_CONTENT=1 ou em dev. */
export function validateContent(): void {
  if (validated) return;
  validated = true;
  const problems: string[] = [];
  const missing: string[] = [];
  const titles = new Map<string, string>();
  const descs = new Map<string, string>();
  const h1s = new Map<string, string>();

  const check = (name: string, c: { title?: string; description?: string; h1?: string }): void => {
    if (!c.title || c.title.length > 60) problems.push(`${name}: title ausente ou >60 (${c.title?.length ?? 0})`);
    if (!c.description || c.description.length > 155)
      problems.push(`${name}: description ausente ou >155 (${c.description?.length ?? 0})`);
    if (!c.h1) problems.push(`${name}: h1 ausente`);
  };

  for (const l of allLocs) {
    const name = pageSlug(l);
    const raw = byName.get(name) as PageContent | undefined;
    if (!raw) {
      missing.push(`${name}.json`);
      continue;
    }
    check(name, raw);
    if (!Array.isArray(raw.faq) || raw.faq.length < 3) problems.push(`${name}: faq precisa de pelo menos 3 itens`);
    if (!raw.hero_subtitle || !raw.sobre_texto) problems.push(`${name}: hero_subtitle/sobre_texto ausentes`);
    const pairs: Array<[Map<string, string>, string, string | undefined]> = [
      [titles, 'title', raw.title],
      [descs, 'description', raw.description],
      [h1s, 'h1', raw.h1],
    ];
    for (const [map, key, val] of pairs) {
      const k = (val ?? '').trim().toLowerCase();
      const prev = map.get(k);
      if (k && prev) problems.push(`${name}: ${key} duplicado com ${prev}`);
      else map.set(k, name);
    }
  }
  for (const s of siteConfig.services) {
    const n = `_servico-${s.slug}`;
    const raw = byName.get(n) as HubContent | undefined;
    if (!raw) missing.push(`${n}.json`);
    else {
      check(n, raw);
      if (!raw.intro) problems.push(`${n}: intro ausente`);
    }
  }
  const home = byName.get('_home') as HomeContent | undefined;
  if (!home) missing.push('_home.json');
  else {
    check('_home', home);
    if (!home.hero_subtitle || !home.intro) problems.push('_home: hero_subtitle/intro ausentes');
  }

  const lines: string[] = [];
  if (missing.length) lines.push(`Arquivos de conteudo faltando (${missing.length}):\n  - ${missing.join('\n  - ')}`);
  if (problems.length) lines.push(`Problemas de validacao (${problems.length}):\n  - ${problems.join('\n  - ')}`);
  if (lines.length) {
    const msg = `[conteudo] ${lines.join('\n')}`;
    if (allowMissing()) console.warn(`${msg}\n[conteudo] ALLOW_MISSING_CONTENT ativo: seguindo com fallback e noindex.`);
    else throw new Error(msg);
  }
}

export const cityLocs = (cidade: string): Loc[] => allLocs.filter((l) => l.cidade === cidade);
export const serviceLocs = (servico: string): Loc[] => allLocs.filter((l) => l.servico === servico);
