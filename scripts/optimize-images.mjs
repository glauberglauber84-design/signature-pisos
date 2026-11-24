// Gera derivados otimizados (avif/webp/jpg) em public/img, sem upscale,
// public/og-default.jpg (1200x630) e src/config/images.generated.json.
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'fotos-originais');
const OUT = join(root, 'public', 'img');
mkdirSync(OUT, { recursive: true });

const WIDTHS = [320, 480, 640, 736];

// [id, servico, uso, alt, opts]; uso: hero | card | galeria | antes-depois
const PHOTOS = [
  ['foto-29', 'efeito-marmore-parede', 'hero', 'Parede de TV em efeito mármore branco com veios dourados e cinza, do piso ao teto, com nicho em mármore na base'],
  ['foto-24', 'efeito-marmore-parede', 'galeria', 'Parede de sala com efeito mármore branco e veios cinza, TV de parede e iluminação de LED azul no teto'],
  ['foto-14', 'efeito-marmore-parede', 'card', 'Parede de quarto com efeito mármore claro e veios dourados e escuros em linhas diagonais, acabamento brilhante'],
  ['foto-25', 'efeito-marmore-parede', 'galeria', 'Parede branca de sala com efeito mármore e veios dourados, piso de madeira'],
  ['foto-26', 'efeito-marmore-parede', 'galeria', 'Parede longa de sala com veios dourados finos em efeito mármore, acima do piso de madeira'],
  ['foto-27', 'efeito-marmore-parede', 'galeria', 'Parede de apartamento com efeito mármore bege e veios dourados, refletindo a luz do lustre'],
  ['foto-28', 'efeito-marmore-parede', 'galeria', 'Parede com efeito mármore em tons de creme e dourado ao lado de uma porta de madeira'],
  ['foto-13', 'efeito-marmore-parede', 'galeria', 'Parede de sala com efeito mármore bege e veios dourados, acima do rodapé marrom'],
  ['foto-17', 'efeito-marmore-parede', 'galeria', 'Parede com efeito mármore em veios finos e ramificados em dourado e cinza'],
  ['foto-18', 'efeito-marmore-parede', 'galeria', 'Parede de sala com efeito mármore branco e veios cinza e dourados, tomadas e spots no teto'],
  ['foto-19', 'efeito-marmore-parede', 'galeria', 'Parede de sala com faixa curva em tons de ocre e marrom em efeito mármore'],
  ['foto-21', 'efeito-marmore-parede', 'galeria', 'Parede de escada com efeito mármore claro e veios dourados, ao lado dos degraus de madeira'],
  ['foto-16', 'efeito-marmore-parede', 'galeria', 'Parede de sala recebendo efeito mármore, com escada e aspirador de obra ao lado, piso em porcelanato'],
  ['foto-09', 'porcelanato-liquido', 'card', 'Piso de cozinha em porcelanato líquido bege brilhante, com bancada branca e armários vermelhos'],
  ['foto-02', 'porcelanato-liquido', 'galeria', 'Piso de corredor em porcelanato líquido bege com reflexo de luz, durante a aplicação'],
  ['foto-05', 'porcelanato-liquido', 'galeria', 'Piso de banheiro em porcelanato líquido branco marmorizado com veios cinza', { bottomPct: 0.08 }],
  ['foto-06', 'porcelanato-liquido', 'galeria', 'Piso em porcelanato líquido cinza metalizado com reflexos, em ambiente com rodapé grafite'],
  ['foto-01', 'porcelanato-liquido', 'antes-depois', 'Antes e depois: piso de cerâmica cinza trocado por porcelanato líquido branco brilhante'],
  ['foto-07', 'porcelanato-liquido', 'antes-depois', 'Antes e depois de piso de banheiro: cerâmica antiga e acabamento liso em porcelanato líquido branco'],
  ['foto-08', 'porcelanato-liquido', 'antes-depois', 'Antes e depois de cozinha: piso cerâmico bege e porcelanato líquido branco liso e brilhante'],
  ['foto-10', 'porcelanato-liquido', 'antes-depois', 'Antes e depois de cozinha de apartamento: piso cerâmico claro e porcelanato líquido branco com reflexos'],
  ['foto-31', 'cimento-queimado', 'card', 'Banheiro com paredes em cimento queimado cinza aplicado, com bancada de pedra preta'],
  ['foto-32', 'cimento-queimado', 'galeria', 'Detalhe de parede em cimento queimado cinza com textura de desempenadeira'],
  ['foto-35', 'cimento-queimado', 'galeria', 'Paredes de cimento queimado cinza ao lado de uma porta branca'],
  ['foto-36', 'cimento-queimado', 'galeria', 'Parede de banheiro com a base do cimento queimado aplicada em manchas, antes do acabamento'],
  ['foto-37', 'cimento-queimado', 'galeria', 'Banheiro com paredes em cimento queimado cinza, vaso sanitário e bancada protegida'],
  // Fotos adicionadas apos autorizacao do cliente (todas as 39 liberadas, exceto duplicatas 15/22/23 da foto-14).
  ['foto-03', 'porcelanato-liquido', 'galeria', 'Piso brilhante em resina azul acinzentada numa sala com lareira, refletindo a janela e os móveis'],
  ['foto-04', 'porcelanato-liquido', 'galeria', 'Piso branco marmorizado com veios escuros e acabamento brilhante, em um cômodo com rodapé branco'],
  ['foto-11', 'porcelanato-liquido', 'galeria', 'Corredor longo com piso claro marmorizado e brilhante, janelas à esquerda e fita azul de proteção nos pilares'],
  ['foto-12', 'porcelanato-liquido', 'galeria', 'Piso de cozinha branco marmorizado com veios cinza e acabamento brilhante, entre armários brancos', { bottomPct: 0.12 }],
  ['foto-20', 'obras', 'galeria', 'Parede cinza com textura de concreto e veios escuros irregulares, acabamento brilhante, ao lado de piso claro'],
  ['foto-30', 'cimento-queimado', 'galeria', 'Banheiro em obra com paredes em cimento queimado cinza, bancada protegida com plástico e fitas verdes de proteção'],
  ['foto-33', 'cimento-queimado', 'galeria', 'Parede de cimento queimado cinza com textura manchada de desempenadeira, acima de bancada protegida'],
  ['foto-34', 'cimento-queimado', 'galeria', 'Canto de parede em cimento queimado cinza claro com textura de desempenadeira, ao lado de bancada protegida'],
  ['foto-38', 'cimento-queimado', 'galeria', 'Vaso sanitário branco em banheiro com paredes em cimento queimado cinza e fita verde de proteção no piso'],
  ['foto-39', 'cimento-queimado', 'galeria', 'Parede de cimento queimado em tons de cinza e marrom com textura aplicada à desempenadeira'],
];

async function loadBase(file, opts) {
  const buf0 = await sharp(join(SRC, `${file}.jpeg`)).rotate().toBuffer();
  const meta = await sharp(buf0).metadata();
  const width = meta.width;
  let height = meta.height;
  let buf = buf0;
  if (opts?.bottomPct) {
    height = Math.round(height * (1 - opts.bottomPct));
    buf = await sharp(buf0).extract({ left: 0, top: 0, width, height }).toBuffer();
  }
  return { buf, width, height };
}

const generated = [];
for (const [id, servico, uso, alt, opts] of PHOTOS) {
  const { buf, width, height } = await loadBase(id, opts);
  const cap = Math.min(width, 736);
  const widths = [...new Set([...WIDTHS.filter((w) => w < cap), cap])];
  for (const w of widths) {
    const h = Math.round((height * w) / width);
    const r = () => sharp(buf).resize(w, h, { withoutEnlargement: true });
    await r().avif({ quality: 50, effort: 4 }).toFile(join(OUT, `${id}-${w}.avif`));
    await r().webp({ quality: 74 }).toFile(join(OUT, `${id}-${w}.webp`));
    await r().jpeg({ quality: 78, mozjpeg: true }).toFile(join(OUT, `${id}-${w}.jpg`));
  }
  const maxW = widths[widths.length - 1];
  generated.push({ id, widths, width: maxW, height: Math.round((height * maxW) / width), alt, servico, uso });
}
writeFileSync(join(root, 'src/config/images.generated.json'), JSON.stringify(generated, null, 2));

console.log(`ok: ${generated.length} fotos`);
