import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/** Artigos publicados, do mais novo para o mais antigo. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', (p) => !p.data.rascunho);
  return posts.sort((a, b) => b.data.data.valueOf() - a.data.data.valueOf());
}

export const formatDate = (d: Date): string =>
  new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
