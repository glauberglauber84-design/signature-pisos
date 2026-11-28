import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const site = process.env.PUBLIC_SITE_URL || 'https://signaturepisos.com.br';

// /blog/ só entra no sitemap quando houver artigo publicado (antes disso fica noindex).
const blogDir = fileURLToPath(new URL('./src/content/blog/', import.meta.url));
const hasPosts = readdirSync(blogDir, { recursive: true, encoding: 'utf8' }).some(
  (f) => f.endsWith('.md') && !/(^|[\\/])_/.test(f) && !/^rascunho:\s*true/m.test(readFileSync(join(blogDir, f), 'utf8')),
);

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap({ filter: (page) => !page.includes('/404') && (hasPosts || !page.endsWith('/blog/')) })],
  vite: { plugins: [tailwindcss()] },
});
