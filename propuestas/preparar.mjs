import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const fonts = [
  ['DM Sans', 'dm-sans', 400], ['DM Sans', 'dm-sans', 600], ['DM Sans', 'dm-sans', 700],
  ['Archivo Black', 'archivo-black', 400], ['Instrument Serif', 'instrument-serif', 400],
  ['Fraunces', 'fraunces', 600], ['Barlow Condensed', 'barlow-condensed', 700],
  ['Bodoni Moda', 'bodoni-moda', 600], ['Space Grotesk', 'space-grotesk', 700],
  ['IBM Plex Mono', 'ibm-plex-mono', 400], ['Bricolage Grotesque', 'bricolage-grotesque', 700]
];
const records = [];
const rules = [];
fs.mkdirSync(path.join(root, 'fuentes'), { recursive: true });
fs.mkdirSync(path.join(root, 'iconos'), { recursive: true });

function download(url, relativePath) {
  const destination = path.join(root, relativePath);
  const result = spawnSync('curl', ['-L', '--fail', '--silent', '--show-error', '--max-time', '60', '--retry', '1', url, '-o', destination], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`${url}: ${result.stderr}`);
  const bytes = fs.readFileSync(destination);
  records.push({ url, archivo: `propuestas/${relativePath}`, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), fecha: new Date().toISOString() });
}

for (const [family, identifier, weight] of fonts) {
  const filename = `${identifier}-latin-${weight}-normal.woff2`;
  download(`https://cdn.jsdelivr.net/npm/@fontsource/${identifier}@latest/files/${filename}`, `fuentes/${filename}`);
  rules.push(`@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:swap;src:url('./fuentes/${filename}') format('woff2');}`);
}
for (const identifier of new Set(fonts.map(font => font[1]))) {
  download(`https://cdn.jsdelivr.net/npm/@fontsource/${identifier}@latest/LICENSE`, `fuentes/${identifier}-LICENSE.txt`);
}
for (const icon of ['star', 'check', 'printer', 'download', 'arrow-up-right', 'external-link']) {
  download(`https://cdn.jsdelivr.net/npm/lucide-static@0.468.0/icons/${icon}.svg`, `iconos/${icon}.svg`);
}
download('https://cdn.jsdelivr.net/npm/lucide-static@0.468.0/LICENSE', 'iconos/LICENSE.txt');
fs.writeFileSync(path.join(root, 'fuentes.css'), `${rules.join('\n')}\n`);
fs.writeFileSync(path.join(root, 'recursos.json'), `${JSON.stringify(records, null, 2)}\n`);
for (const record of records.filter(record => record.archivo.endsWith('.woff2'))) {
  if (fs.readFileSync(path.join(path.dirname(root), record.archivo)).subarray(0, 4).toString() !== 'wOF2') throw new Error(`No es WOFF2: ${record.archivo}`);
}
console.log(`Recursos locales verificados: ${fonts.length} fuentes, 9 licencias tipográficas, 6 iconos Lucide y su licencia.`);