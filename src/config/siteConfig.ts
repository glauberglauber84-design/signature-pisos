import locais from '../data/locais.json';

export type ServiceIcon = 'vinilico' | 'laminado' | 'madeira' | 'porcelanato' | 'cimento' | 'granito' | 'marmore' | 'azulejo';

export interface Service {
  slug: string;
  label: string;
  /** Uma frase factual. */
  short: string;
  icon: ServiceIcon;
  hasPhotos: boolean;
  /** piso = revestimento de piso; parede = técnica aplicada em parede. */
  surface: 'piso' | 'parede' | 'piso-e-parede';
  /** Etapas para o bloco "Como trabalhamos" (serviços sem galeria). */
  steps: string[];
  principal?: boolean;
}

export interface City {
  slug: string;
  label: string;
  principal: boolean;
  bairros: string[];
}

const services: Service[] = [
  {
    slug: 'instalacao-piso-vinilico',
    label: 'Instalação de Piso Vinílico',
    short: 'Instalação de piso vinílico em réguas ou mantas, com preparo do contrapiso.',
    icon: 'vinilico',
    hasPhotos: false,
    surface: 'piso',
    steps: [
      'Visita ou fotos do ambiente para medir a área e avaliar o contrapiso.',
      'Preparo da base: limpeza, correção de desníveis e verificação de umidade.',
      'Instalação das peças com acabamento nos cantos, soleiras e rodapés.',
      'Limpeza final e orientação de uso e conservação.',
    ],
  },
  {
    slug: 'instalacao-piso-laminado',
    label: 'Instalação de Piso Laminado',
    short: 'Instalação de piso laminado com manta niveladora e rodapé.',
    icon: 'laminado',
    hasPhotos: false,
    surface: 'piso',
    steps: [
      'Medição do ambiente e definição do sentido de instalação das réguas.',
      'Preparo do contrapiso e aplicação da manta niveladora.',
      'Encaixe das réguas com junta de dilatação nas bordas.',
      'Colocação de rodapé e perfis de acabamento nas transições.',
    ],
  },
  {
    slug: 'raspagem-restauracao-piso-madeira',
    label: 'Raspagem e Restauração de Piso de Madeira',
    short: 'Raspagem, correção de falhas e novo acabamento em pisos de madeira.',
    icon: 'madeira',
    hasPhotos: false,
    surface: 'piso',
    steps: [
      'Avaliação do estado do piso: desgaste, tacos soltos e infiltrações.',
      'Fixação ou troca de tacos e réguas danificados.',
      'Raspagem e lixamento até a madeira ficar uniforme.',
      'Aplicação de sinteco, verniz ou resina, conforme o acabamento desejado.',
    ],
  },
  {
    slug: 'porcelanato-liquido',
    label: 'Porcelanato Líquido',
    short: 'Revestimento de piso em resina autonivelante, brilhante e sem juntas.',
    icon: 'porcelanato',
    hasPhotos: true,
    surface: 'piso',
    steps: [],
    principal: true,
  },
  {
    slug: 'cimento-queimado',
    label: 'Cimento Queimado',
    short: 'Acabamento em cimento queimado aplicado e selado, sem emendas visíveis.',
    icon: 'cimento',
    hasPhotos: true,
    surface: 'piso-e-parede',
    steps: [],
  },
  {
    slug: 'granito-liquido',
    label: 'Granito Líquido',
    short: 'Revestimento decorativo com efeito de granito, aplicado em superfície contínua.',
    icon: 'granito',
    hasPhotos: false,
    surface: 'piso-e-parede',
    steps: [
      'Conversa sobre o ambiente, a cor e o efeito desejados.',
      'Preparo e regularização da superfície que vai receber o revestimento.',
      'Aplicação das camadas do produto até atingir o efeito de granito.',
      'Selagem e acabamento para proteção e fácil limpeza.',
    ],
  },
  {
    slug: 'efeito-marmore-parede',
    label: 'Efeito Mármore em Parede',
    short: 'Técnica decorativa em parede: textura, veios pintados à mão e acabamento brilhante selado.',
    icon: 'marmore',
    hasPhotos: true,
    surface: 'parede',
    steps: [],
  },
  {
    slug: 'azulejista',
    label: 'Azulejista',
    short: 'Assentamento de azulejos e revestimentos cerâmicos em paredes e pisos.',
    icon: 'azulejo',
    hasPhotos: false,
    surface: 'piso-e-parede',
    steps: [
      'Medição da área e cálculo da quantidade de material, com margem para perdas.',
      'Preparo da base e marcação do alinhamento das peças.',
      'Assentamento com argamassa adequada e espaçadores para juntas uniformes.',
      'Rejuntamento, limpeza e conferência do acabamento.',
    ],
  },
];

const seen = new Map<string, City>();
for (const l of locais as Array<{ cidade: string; cidadeLabel: string; principal: boolean; bairros: string[] }>) {
  if (!seen.has(l.cidade)) seen.set(l.cidade, { slug: l.cidade, label: l.cidadeLabel, principal: l.principal, bairros: l.bairros });
}
const cities: City[] = [...seen.values()];

const slogan = 'Cada obra leva a nossa assinatura.';
const tagline = 'Pisos e revestimentos em São Paulo e Grande SP';

export const siteConfig = {
  name: 'Signature Pisos',
  slogan,
  tagline,
  description: `${tagline}. ${slogan}`,
  url: (import.meta.env.PUBLIC_SITE_URL as string | undefined) || 'https://signaturepisos.com.br', // PLACEHOLDER: confirmar domínio
  locale: 'pt-BR',
  logo: {
    alt: 'Signature Pisos',
    /** Horizontal (header/rodapé), recortada; largura base 160 x altura 42 (2x = 320). */
    horizontal: { base: '/img/logo-h-', widths: [160, 240, 320, 480, 720] as const, width: 160, height: 42, ogSrc: '/img/logo-h-720.png' },
    /** Quadrada (Sobre, JSON-LD); largura base 192 x altura 122. */
    square: { base: '/img/logo-q-', widths: [96, 192, 384, 640] as const, width: 192, height: 122, ogSrc: '/img/logo-q-640.png' },
  },
  whatsapp: {
    url: 'https://wa.me/5511939329439',
    defaultMessage: 'Olá! Vim pelo site da Signature Pisos e gostaria de um orçamento.',
    label: 'Chamar no WhatsApp',
    cta: 'Pedir orçamento no WhatsApp',
  },
  areaAtendimento: {
    resumo: 'São Paulo (SP), Osasco, Cotia, Barueri, Santana de Parnaíba e Alphaville',
    sp: ['Barra Funda', 'Vila Leopoldina', 'Perdizes', 'Vila Mariana', 'Região Central', 'Zona Sul'],
  },
  responsavel: { nome: '[A DEFINIR]', cargo: 'Responsável técnico', bio: '[A DEFINIR]' },
  form: {
    provider: 'web3forms' as 'web3forms' | 'formspree' | 'whatsapp-only',
    endpoint: 'https://api.web3forms.com/submit',
    accessKey: (import.meta.env.PUBLIC_FORM_KEY as string | undefined) || 'SUBSTITUIR_PELA_CHAVE', // PLACEHOLDER
    fallbackToWhatsApp: true,
  },
  colors: { graphite: '#2b2b2b', gold: '#b8935a', accentStrong: '#7a5a2a' },
  mapEmbed: { enabled: false, src: '' },
  services,
  cities,
};

export function whatsappLink(message: string = siteConfig.whatsapp.defaultMessage): string {
  return `${siteConfig.whatsapp.url}?text=${encodeURIComponent(message)}`;
}

export function getService(slug: string): Service {
  const s = services.find((x) => x.slug === slug);
  if (!s) throw new Error(`Serviço desconhecido: ${slug}`);
  return s;
}

export function getCity(slug: string): City {
  const c = cities.find((x) => x.slug === slug);
  if (!c) throw new Error(`Cidade desconhecida: ${slug}`);
  return c;
}

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.url.endsWith('/') ? siteConfig.url : `${siteConfig.url}/`).toString();
}

export const placeholders = {
  formKey: siteConfig.form.accessKey === 'SUBSTITUIR_PELA_CHAVE',
};
