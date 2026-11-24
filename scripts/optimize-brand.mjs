// Logo oficial (brand/logo-original.png) -> logo otimizada, favicons e og-default.jpg
import sharp from 'sharp';
import opentype from 'opentype.js';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'brand', 'logo-original.png');
const PUB = join(root, 'public');
const IMG = join(PUB, 'img');
mkdirSync(IMG, { recursive: true });
const SLOGAN = 'Cada obra leva a nossa assinatura.';

// 1) trim das margens brancas (+ respiro de 6px)
const trimmedBuf = await sharp(SRC).trim({ background: '#ffffff', threshold: 24 }).extend({ top: 6, bottom: 6, left: 6, right: 6, background: '#ffffff' }).png().toBuffer();
const tm = await sharp(trimmedBuf).metadata();
const ratio = tm.height / tm.width;

const sizes = {};
for (const w of [96, 192, 384, 640]) {
  const h = Math.round(w * ratio);
  const r = () => sharp(trimmedBuf).resize(w, h, { kernel: 'lanczos3' });
  await r().webp({ quality: 90 }).toFile(join(IMG, `logo-q-${w}.webp`));
  await r().png({ compressionLevel: 9 }).toFile(join(IMG, `logo-q-${w}.png`));
  sizes[w] = h;
}

// 1b) logo horizontal (header/rodape)
const HSRC = join(root, 'brand', 'logo-horizontal-original.png');
const hTrim = await sharp(HSRC).trim({ background: '#ffffff', threshold: 24 }).extend({ top: 4, bottom: 4, left: 4, right: 4, background: '#ffffff' }).png().toBuffer();
const hm = await sharp(hTrim).metadata();
const hRatio = hm.height / hm.width;
const hSizes = {};
for (const w of [160, 240, 320, 480, 720]) {
  const h = Math.round(w * hRatio);
  const r = () => sharp(hTrim).resize(w, h, { kernel: 'lanczos3' });
  await r().webp({ quality: 90 }).toFile(join(IMG, `logo-h-${w}.webp`));
  await r().png({ compressionLevel: 9 }).toFile(join(IMG, `logo-h-${w}.png`));
  hSizes[w] = h;
}

// 2) favicon: recorte fechado no monograma "S" (com o começo das tábuas), fundo branco.
// Coordenadas no original 1254x1254: S ocupa x 185-780, y 245-700.
const CW = 660, CH = 665;
const mono = await sharp(SRC).extract({ left: 175, top: 235, width: CW, height: 475 }).extend({ top: 95, bottom: 95, background: '#ffffff' }).png().toBuffer();
// Em tamanhos pequenos o traço fino some: engrossa o traço escuro/dourado (dilatação por 'darken' de cópias deslocadas) antes de reduzir.
const shift = async (buf, dx, dy) => {
  const ext = await sharp(buf).extend({ top: Math.max(dy, 0), bottom: Math.max(-dy, 0), left: Math.max(dx, 0), right: Math.max(-dx, 0), background: '#ffffff' }).png().toBuffer();
  return sharp(ext).extract({ left: Math.max(-dx, 0), top: Math.max(-dy, 0), width: CW, height: CH }).png().toBuffer();
};
const thicken = async (r) => {
  let cur = mono;
  for (let a = 0; a < 12; a++) {
    const t = (a * Math.PI) / 6;
    const sh = await shift(mono, Math.round(r * Math.cos(t)), Math.round(r * Math.sin(t)));
    cur = await sharp(cur).composite([{ input: sh, blend: 'darken' }]).png().toBuffer();
  }
  return cur;
};
const monoBold16 = await thicken(14);
const monoBold32 = await thicken(10);
const icon = async (size, file, src = mono) => {
  await sharp(src).resize(size, size, { kernel: 'lanczos3' }).png({ compressionLevel: 9 }).toFile(file);
};
await icon(32, join(PUB, 'favicon-32.png'), monoBold32);
await icon(180, join(PUB, 'apple-touch-icon.png'));
await icon(192, join(PUB, 'icon-192.png'));
await icon(512, join(PUB, 'icon-512.png'));
// ICO com PNGs embutidos (16/32/48)
const icoSizes = [16, 32, 48];
const pngs = await Promise.all(icoSizes.map((s) => sharp(s === 16 ? monoBold16 : monoBold32).resize(s, s, { kernel: 'lanczos3' }).png().toBuffer()));
const head = Buffer.alloc(6);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(icoSizes.length, 4);
let offset = 6 + 16 * icoSizes.length;
const entries = pngs.map((b, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(icoSizes[i], 0); e.writeUInt8(icoSizes[i], 1);
  e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
  e.writeUInt32LE(b.length, 8); e.writeUInt32LE(offset, 12);
  offset += b.length;
  return e;
});
writeFileSync(join(PUB, 'favicon.ico'), Buffer.concat([head, ...entries, ...pngs]));
writeFileSync(join(PUB, 'site.webmanifest'), JSON.stringify({
  name: 'Signature Pisos', short_name: 'Signature Pisos', lang: 'pt-BR',
  start_url: '/', display: 'browser', background_color: '#faf8f4', theme_color: '#2b2b2b',
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
}, null, 2));

// 3) OG 1200x630: logo em painel claro a esquerda + foto-29 a direita
const font = opentype.parse(new Uint8Array(readFileSync(join(root, 'node_modules/@fontsource/manrope/files/manrope-latin-700-normal.woff'))).buffer);
const textW = font.getAdvanceWidth(SLOGAN, 21);
const slo = font.getPath(SLOGAN, (570 - textW) / 2, 520, 21, { kerning: false }).toPathData(2);
const panel = `<svg xmlns="http://www.w3.org/2000/svg" width="570" height="630"><rect width="570" height="630" fill="#ffffff"/><rect x="255" y="478" width="60" height="3" fill="#b8935a"/><path d="${slo}" fill="#7a5a2a"/></svg>`;
const lw = 470;
const lh = Math.round(lw * ratio);
const logoOg = await sharp(trimmedBuf).resize(lw, lh, { kernel: 'lanczos3' }).png().toBuffer();
const hero = await sharp(join(root, 'fotos-originais', 'foto-29.jpeg')).extract({ left: 0, top: 100, width: 736, height: 736 }).resize(630, 630).toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#ffffff' } })
  .composite([
    { input: Buffer.from(panel), left: 0, top: 0 },
    { input: logoOg, left: 50, top: Math.round((440 - lh) / 2) + 20 },
    { input: hero, left: 570, top: 0 },
  ])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(join(PUB, 'og-default.jpg'));

writeFileSync(join(root, 'src/config/brand.generated.json'), JSON.stringify({ square: { heights: sizes, ratio }, horizontal: { heights: hSizes, ratio: hRatio } }, null, 2));
console.log('ok: brand', tm.width, tm.height, sizes, hm.width, hm.height, hSizes);
