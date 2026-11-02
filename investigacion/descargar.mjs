import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const sources = JSON.parse(fs.readFileSync(path.join(root, 'fuentes.json'), 'utf8'));
const records = [];

function download(id, url, relativePath) {
  const destination = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  const result = spawnSync('curl', ['-L', '--fail', '--silent', '--show-error', '--max-time', '90', '--retry', '1', url, '-o', destination], { encoding: 'utf8' });
  const record = { id, url, obtenido_en: new Date().toISOString(), archivo: `investigacion/${relativePath}`, exito: result.status === 0 };
  if (record.exito) {
    const bytes = fs.readFileSync(destination);
    record.bytes = bytes.length;
    record.sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
    if (relativePath.endsWith('.original')) {
      const extension = bytes.subarray(0, 5).toString() === '%PDF-' ? '.pdf' : bytes[0] === 0xff && bytes[1] === 0xd8 ? '.jpg' : bytes.subarray(1, 4).toString() === 'PNG' ? '.png' : '.original';
      const renamed = destination.replace(/\.original$/, extension);
      if (renamed !== destination) fs.renameSync(destination, renamed);
      record.archivo = `investigacion/${relativePath.replace(/\.original$/, extension)}`;
      record.formato = extension.slice(1);
      if (extension === '.pdf') {
        const textPath = path.join(root, 'textos', `${id}.txt`);
        fs.mkdirSync(path.dirname(textPath), { recursive: true });
        const extraction = spawnSync('pdftotext', ['-layout', renamed, textPath], { encoding: 'utf8' });
        record.extraccion_texto = extraction.status === 0 ? `investigacion/textos/${id}.txt` : extraction.stderr.trim();
      }
    }
  } else {
    record.error = result.stderr.trim();
  }
  records.push(record);
  console.log(`${record.exito ? 'OK' : 'ERROR'} ${id}: ${record.archivo}${record.bytes ? ` (${record.bytes} bytes)` : ''}`);
  fs.writeFileSync(path.join(root, 'descargas.json'), `${JSON.stringify(records, null, 2)}\n`);
  return record;
}

if (process.argv.includes('--adicional')) {
  const additional = JSON.parse(fs.readFileSync(path.join(root, 'material-adicional.json'), 'utf8'));
  records.push(...JSON.parse(fs.readFileSync(path.join(root, 'descargas.json'), 'utf8')));
  for (const asset of additional.archivos) download(asset.id, asset.url, asset.archivo);
  process.exit(records.some(record => !record.exito) ? 1 : 0);
}

download('linktree', 'https://linktr.ee/bucarecerveceria', 'linktree.html');
const html = fs.readFileSync(path.join(root, 'linktree.html'), 'utf8');
const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
if (match) {
  const data = JSON.parse(match[1]);
  fs.writeFileSync(path.join(root, 'linktree-datos.json'), `${JSON.stringify(data.props.pageProps, null, 2)}\n`);
  const props = data.props.pageProps;
  const avatar = props.account?.profilePictureUrl ?? props.account?.avatarUrl;
  if (avatar) download('logo-linktree', avatar, 'imagenes/logo-publicado.original');
}
for (const document of sources.documentos_linktree) {
  download(document.id, `https://drive.google.com/uc?export=download&id=${document.drive_id}`, `originales/${document.id}.original`);
}
download('instagram', sources.fuentes_principales[0].url, 'instagram.html');
download('maps', sources.fuentes_principales[2].url, 'maps.html');
for (const [index, url] of sources.referencias_diseno.entries()) {
  download(`referencia-${index + 1}`, url, `referencias/${index + 1}.html`);
}