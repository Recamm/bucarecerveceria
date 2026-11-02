import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { marked } from './herramientas/node_modules/marked/lib/marked.esm.js';
import { chromium } from './herramientas/node_modules/playwright/index.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const reportsPath = path.join(root, 'informes');
const capturePath = path.join(root, 'propuestas', 'capturas');
fs.mkdirSync(capturePath, { recursive: true });
const reportFiles = fs.readdirSync(reportsPath).filter(filename => filename.endsWith('.md'));
const documentCss = `
*{box-sizing:border-box;letter-spacing:0}body{margin:0;background:#f8faf7;color:#202420;font:16px/1.65 'DM Sans',sans-serif}header{padding:22px max(20px,calc((100% - 960px)/2));border-bottom:1px solid #d8ded6;display:flex;gap:20px;flex-wrap:wrap;font-size:13px}a{color:#a82026;text-underline-offset:3px}article{max-width:960px;margin:40px auto;padding:0 24px}h1,h2,h3{line-height:1.2;break-after:avoid}h1{font:700 40px/1.15 'Space Grotesk',sans-serif}h2{margin-top:36px;font-size:25px}h3{margin-top:26px;font-size:20px}p,li{overflow-wrap:anywhere}table{width:100%;border-collapse:collapse;font-size:13px;display:block;overflow-x:auto}th,td{text-align:left;border-bottom:1px solid #d8ded6;padding:9px;vertical-align:top}th{background:#e4ece3;font-weight:700}table td{min-width:100px}pre{padding:16px;background:#edf1eb;overflow-x:auto;font:11px/1.45 'IBM Plex Mono',monospace}code{font-family:'IBM Plex Mono',monospace;font-size:.9em}pre code{font-size:inherit}blockquote{border-left:3px solid #c1282d;padding-left:18px;margin-left:0;color:#465146}article img{display:block;max-width:100%;max-height:480px;object-fit:contain;height:auto;margin:20px 0}h1+p strong{color:#54614f}li{margin-bottom:6px}@media(max-width:600px){h1{font-size:30px}h2{font-size:23px}article{padding:0 18px;margin-top:24px}header{padding:18px}}@media print{@page{size:A4;margin:16mm 14mm}body{background:white;font-size:10px;-webkit-print-color-adjust:exact;print-color-adjust:exact}header{display:none}article{padding:0;margin:0;max-width:none}h1{font-size:28px}h2{font-size:19px;margin-top:25px}h3{font-size:14px}table{display:table;font-size:8px;overflow:visible;table-layout:fixed}table td{min-width:0}th,td{padding:5px;overflow-wrap:anywhere}thead{display:table-header-group}tr{break-inside:avoid}pre{font-size:8px;padding:10px;white-space:pre-wrap;overflow-wrap:anywhere}article img{max-height:260px;break-inside:avoid}a{color:#202420}blockquote{break-inside:avoid}}
`;

for (const filename of reportFiles) {
  const markdown = fs.readFileSync(path.join(reportsPath, filename), 'utf8');
  const title = markdown.split('\n')[0].replace(/^#\s+/, '');
  let html = marked.parse(markdown);
  for (const target of reportFiles) html = html.replaceAll(`href="${target}"`, `href="${target.replace(/\.md$/, '.html')}"`);
  const document = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><link rel="stylesheet" href="../propuestas/fuentes.css"><style>${documentCss}</style></head><body><header><a href="../propuestas/index.html">Bucaré · Catálogo visual</a><a href="01-informe-del-local.html">El local</a><a href="03-manual-de-marca.html">Manual</a><a href="04-referencias-de-diseno.html">Referencias</a><a href="${filename.replace(/\.md$/, '.pdf')}">PDF</a></header><article>${html}</article></body></html>`;
  fs.writeFileSync(path.join(reportsPath, filename.replace(/\.md$/, '.html')), document);
}

async function ready(page) {
  await page.locator('img[loading="lazy"]').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
  });
}

const browser = await chromium.launch({ headless: true, timeout: 20000 });
const referenceVerificationPath = path.join(root, 'investigacion', 'referencias', 'verificacion-desktop.json');
const previousReferences = fs.existsSync(referenceVerificationPath) ? JSON.parse(fs.readFileSync(referenceVerificationPath, 'utf8')).resultados : [];
const verification = { fecha: new Date().toISOString(), viewports: [], referencias: process.argv.includes('--referencias') ? [] : previousReferences, errores: [] };
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(10000);
  page.on('pageerror', error => verification.errores.push(error.message));
  await page.goto(pathToFileURL(path.join(root, 'propuestas', 'index.html')).href);
  await ready(page);
  assert.equal(await page.locator('.direction').count(), 12);
  assert.equal(await page.locator('.treatment').count(), 6);

  for (const [width, height] of [[1440, 1000], [768, 1024], [390, 844], [320, 740]]) {
    await page.setViewportSize({ width, height });
    const result = await page.evaluate(() => ({
      width: innerWidth,
      overflow: document.documentElement.scrollWidth > innerWidth,
      missingImages: [...document.images].filter(image => !image.naturalWidth).map(image => image.getAttribute('src')),
      overflowingText: [...document.querySelectorAll('.display,.mock-frase,.direction-heading h3,.palette-code,.treatment>div')].filter(element => element.scrollWidth > element.clientWidth + 1).map(element => element.textContent),
      fonts: document.fonts.status,
      overlaps: [...document.querySelectorAll('.mockup')].flatMap(mockup => {
        const title = mockup.querySelector('.display').getBoundingClientRect();
        const phrase = mockup.querySelector('.mock-frase').getBoundingClientRect();
        const actions = mockup.querySelector('.mock-actions').getBoundingClientRect();
        const issues = [];
        if (title.bottom > phrase.top + 1) issues.push(mockup.className + ': título y frase');
        if (phrase.bottom > actions.top + 1) issues.push(mockup.className + ': frase y acciones');
        return issues;
      })
    }));
    verification.viewports.push(result);
    assert.equal(result.overflow, false, `Desborde de página a ${width}px`);
    assert.deepEqual(result.missingImages, [], `Imágenes faltantes a ${width}px`);
    assert.deepEqual(result.overflowingText, [], `Texto desbordado a ${width}px`);
    assert.deepEqual(result.overlaps, [], `Solapamiento a ${width}px`);
    if (width === 1440 || width === 390) {
      const size = width === 1440 ? 'desktop' : 'mobile';
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: path.join(capturePath, `catalogo-${size}.png`), fullPage: false });
      for (const article of await page.locator('.direction').all()) {
        const id = await article.getAttribute('data-id');
        await article.screenshot({ path: path.join(capturePath, `${id}-${size}.png`) });
      }
    }
  }

  await page.locator('[data-id="01"] .favorite-button').click();
  await page.locator('[data-id="02"] .favorite-button').click();
  assert.equal(await page.locator('#favorite-count').innerText(), '2');
  await page.getByRole('button', { name: 'Favoritas 2' }).click();
  assert.equal(await page.locator('.direction:visible').count(), 2);
  await page.reload();
  await ready(page);
  assert.equal(await page.locator('#favorite-count').innerText(), '2');
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#download-selection').click();
  const download = await downloadEvent;
  const selection = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
  assert.equal(selection.favoritas.length, 2);
  await page.getByRole('button', { name: 'Selección inicial', exact: true }).click();
  assert.equal(await page.locator('.direction:visible').count(), 5);
  await page.locator('#family-filter').selectOption('Continuidad');
  assert.equal(await page.locator('.direction:visible').count(), 2);
  await page.locator('#family-filter').selectOption('todas');
  await page.getByRole('button', { name: 'Todas 12', exact: true }).click();
  await page.locator('[data-id="01"] .favorite-button').click();
  await page.locator('[data-id="02"] .favorite-button').click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('details').evaluateAll(elements => elements.forEach(element => { element.open = true; }));
  await page.pdf({ path: path.join(root, 'propuestas', 'catalogo-12-direcciones.pdf'), format: 'A4', printBackground: true });
  verification.controles = { favoritos: true, persistencia: true, descarga_json: true, filtros: true };
  console.log('Catálogo: 12 variantes, 6 tratamientos, imágenes y texto correctos en 1440/768/390/320 px. Favoritos, persistencia, descarga y filtros OK.');

  for (const filename of reportFiles) {
    const htmlPath = path.join(reportsPath, filename.replace(/\.md$/, '.html'));
    await page.goto(pathToFileURL(htmlPath).href);
    await ready(page);
    const missingImages = await page.locator('article img').evaluateAll(images => images.filter(image => !image.naturalWidth).map(image => image.src));
    assert.deepEqual(missingImages, []);
    await page.pdf({ path: htmlPath.replace(/\.html$/, '.pdf'), format: 'A4', printBackground: true });
    console.log(`PDF: ${filename.replace(/\.md$/, '.pdf')}`);
  }

  if (process.argv.includes('--referencias')) {
    const urls = JSON.parse(fs.readFileSync(path.join(root, 'investigacion', 'fuentes.json'), 'utf8')).referencias_diseno;
    for (const [index, url] of urls.entries()) {
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
        await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
        const evidence = await page.evaluate(() => ({ titulo: document.title, ancho: innerWidth, fuentes: [...new Set([...document.querySelectorAll('h1,h2,p,body')].map(element => getComputedStyle(element).fontFamily))].slice(0, 6), texto_inicial: document.body.innerText.slice(0, 1800) }));
        await page.screenshot({ path: path.join(root, 'investigacion', 'referencias', 'capturas', `${index + 1}-desktop.png`), fullPage: false });
        verification.referencias.push({ url, ...evidence });
        console.log(`Referencia ${index + 1}: ${evidence.titulo}`);
      } catch (error) {
        verification.referencias.push({ url, error: error.message });
        console.log(`Referencia ${index + 1}: captura no disponible`);
      }
    }
  }
  assert.equal(verification.errores.length, 0);
} finally {
  if (process.argv.includes('--referencias')) fs.writeFileSync(referenceVerificationPath, JSON.stringify({ fecha: verification.fecha, resultados: verification.referencias }, null, 2) + '\n');
  fs.writeFileSync(path.join(root, 'investigacion', 'verificacion.json'), JSON.stringify(verification, null, 2) + '\n');
  await browser.close();
}