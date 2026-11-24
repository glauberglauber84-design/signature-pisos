import generated from './images.generated.json';

export interface Photo {
  id: string;
  widths: number[];
  width: number;
  height: number;
  alt: string;
  servico: string;
  uso: 'hero' | 'card' | 'galeria' | 'antes-depois';
}

export const photos: Photo[] = generated as Photo[];

export function getPhoto(id: string): Photo {
  const p = photos.find((x) => x.id === id);
  if (!p) throw new Error(`Foto desconhecida: ${id}`);
  return p;
}

/** Fotos de galeria de um serviço (inclui hero e card; exclui antes/depois). */
export function galleryFor(servico: string): Photo[] {
  return photos.filter((p) => p.servico === servico && p.uso !== 'antes-depois');
}

export function beforeAfterFor(servico: string): Photo[] {
  return photos.filter((p) => p.servico === servico && p.uso === 'antes-depois');
}

export function cardPhotoFor(servico: string): Photo | undefined {
  return photos.find((p) => p.servico === servico && p.uso === 'card');
}

/** Foto de capa por serviço; só existe para serviços com fotos reais. */
const cover: Record<string, string> = {
  'efeito-marmore-parede': 'foto-29',
  'porcelanato-liquido': 'foto-09',
  'cimento-queimado': 'foto-31',
};
export function coverFor(servico: string): Photo | undefined {
  const id = cover[servico];
  return id ? getPhoto(id) : undefined;
}

export const heroPhoto = getPhoto('foto-29');

/** Todas as fotos publicadas (galeria geral "Obras"). */
export function allPhotos(): Photo[] {
  return photos;
}
