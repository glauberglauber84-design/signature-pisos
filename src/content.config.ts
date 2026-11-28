import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  // Arquivos que começam com "_" (como _modelo.md) não viram página.
  loader: glob({ pattern: ['**/*.md', '!**/_*.md'], base: './src/content/blog' }),
  schema: z.object({
    titulo: z.string(),
    /** Title da aba e do Google. */
    tituloSeo: z.string().max(60),
    descricao: z.string().max(155),
    data: z.coerce.date(),
    atualizado: z.coerce.date().optional(),
    /** Slug de um serviço: cria o link do artigo para a página do serviço. */
    servico: z.string().optional(),
    /** Caminho dentro de public/, ex.: /img/blog/nome.webp */
    imagem: z.string().optional(),
    imagemAlt: z.string().optional(),
    rascunho: z.boolean().default(false),
  }),
});

export const collections = { blog };
