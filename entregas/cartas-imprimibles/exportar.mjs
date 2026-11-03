import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '../../investigacion/herramientas/node_modules/playwright/index.mjs';
import { renderCarta } from './generar.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const evidence = path.join(directory, 'verificacion');
const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const money = value => value === null ? 'Consultar' : currency.format(value);
const compact = value => value.normalize('NFC').replace(/\s/gu, '');
const readData = name => JSON.parse(fs.readFileSync(path.resolve(directory, '../carta-web/datos', `${name}.json`), 'utf8'));
const documents = ['florida', 'olivos', 'tren'].map(readData);
const promotions = readData('promos');
const errors = [];
const results = [];
const url = name => pathToFileURL(path.join(directory, `${name}.html`)).href;

execFileSync(process.execPath, [path.join(directory, 'generar.mjs'), '--comprobar'], { stdio: 'inherit' });
for (const command of ['pdfinfo', 'pdftotext', 'pdffonts', 'pdftoppm']) execFileSync(command, ['-v'], { stdio: 'ignore' });
const unsafe = structuredClone(documents[0]);
unsafe.categorias[0].productos[0].nombre = '<script>alert("prueba")</script>';
assert.ok(!renderCarta(unsafe).includes('<script>alert('));
assert.ok(renderCarta(unsafe).includes('&lt;script&gt;'));
const missing = structuredClone(documents[0]);
missing.categorias.pop();
assert.throws(() => renderCarta(missing), /paginación/u);

fs.mkdirSync(evidence, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('requestfailed', request => errors.push(request.url()));
  page.on('request', request => assert.ok(request.url().startsWith('file:') || request.url().startsWith('data:'), 'La entrega debe usar recursos locales'));

  async function load(name, media = 'print') {
    await page.emulateMedia({ media });
    await page.goto(url(name));
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(image => image.decode()));
    });
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('meta[name=robots]').getAttribute('content'), 'noindex');
    assert.doesNotMatch(await page.locator('body').textContent(), /La publicación no|No se especifican|no está indicada|no están indicadas|Fuente:/u);
    if ([...documents, promotions].every(document => document.estado === 'confirmado')) {
      assert.doesNotMatch(await page.locator('body').textContent(), /Borrador|pendientes de confirmar/u);
    }
  }

  async function verifyMenu(document) {
    const categories = await page.locator('[data-categoria]').evaluateAll(elements => elements.map(element => ({ id: element.dataset.categoria, name: element.querySelector('h3').textContent, notes: [...element.querySelectorAll('.category-notes li')].map(item => item.textContent) })));
    assert.deepEqual(categories.sort((first, second) => first.id.localeCompare(second.id)), document.categorias.map(category => ({ id: category.id, name: category.nombre, notes: category.notas })).sort((first, second) => first.id.localeCompare(second.id)));
    const products = await page.locator('[data-producto]').evaluateAll(elements => elements.map(element => ({ id: element.dataset.producto, name: element.querySelector('h4').textContent, description: element.querySelector('.description')?.textContent || '', presentation: element.querySelector('.presentation')?.textContent || null, vegetarian: Boolean(element.querySelector('.vegetarian')), prices: [...element.querySelectorAll('.amount, .prices dd')].map(price => price.textContent), text: element.textContent })));
    const expected = document.categorias.flatMap(category => category.productos);
    assert.equal(products.length, expected.length);
    assert.equal(new Set(products.map(product => product.id)).size, expected.length);
    for (const product of expected) {
      const actual = products.find(item => item.id === product.id);
      assert.ok(actual, `Falta ${product.id}`);
      assert.equal(actual.name, product.nombre);
      assert.equal(actual.description, product.descripcion);
      assert.equal(actual.presentation, product.presentacion);
      assert.equal(actual.vegetarian, product.vegetariano);
      assert.deepEqual(actual.prices, product.precios.map(price => money(price.importe)));
      for (const extra of product.adicionales) assert.ok(actual.text.includes(`${extra.nombre}: + ${money(extra.importe)}`));
    }
    for (const sheet of await page.locator('.sheet').all()) {
      const benefits = sheet.locator('.sheet-header .benefits');
      assert.deepEqual(await benefits.locator('li').allTextContents(), document.condiciones);
      assert.equal(await benefits.isVisible(), true);
      assert.ok(await benefits.evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize) >= 13), 'Beneficios legibles en el encabezado');
    }
  }

  async function exportPDF(name, count, document) {
    const overflow = await page.locator('.sheet-body').evaluateAll(elements => elements.map((body, index) => ({ sheet: index + 1, height: body.clientHeight, content: body.scrollHeight, width: body.clientWidth, contentWidth: body.scrollWidth })).filter(body => body.content > body.height + 1 || body.contentWidth > body.width + 1));
    assert.deepEqual(overflow, [], `${name}: contenido fuera del área A4`);
    assert.equal(await page.locator('.sheet').count(), count);
    assert.equal(await page.locator('.draft').count(), document.estado === 'borrador' ? count : 0);
    assert.equal(await page.locator('.screen-toolbar').isVisible(), false);
    const filename = path.join(directory, `${name}.pdf`);
    await page.pdf({ path: filename, preferCSSPageSize: true, printBackground: true, displayHeaderFooter: false, tagged: true, outline: true });
    const info = execFileSync('pdfinfo', [filename], { encoding: 'utf8' });
    assert.equal(Number(info.match(/^Pages:\s+(\d+)/mu)?.[1]), count, `${name}: páginas PDF inesperadas`);
    const size = info.match(/^Page size:\s+([\d.]+) x ([\d.]+)/mu);
    assert.ok(size && Math.abs(Number(size[1]) - 595.28) < 1 && Math.abs(Number(size[2]) - 841.89) < 1, 'El PDF no es A4');
    const text = execFileSync('pdftotext', [filename, '-'], { encoding: 'utf8' });
    assert.equal((text.match(/Borrador/gu) || []).length, document.estado === 'borrador' ? count : 0);
    assert.doesNotMatch(text, /La publicación no|No se especifican|no está indicada|no están indicadas|Fuente:/u);
    assert.equal(text.trim().split('\f').length, count);
    if (document.categorias) {
      for (const sheet of text.trim().split('\f')) {
        for (const condition of document.condiciones) assert.ok(compact(sheet).includes(compact(condition)), `${name}: falta un beneficio en una página PDF`);
      }
    }
    const amounts = document.categorias ? document.categorias.flatMap(category => category.productos.flatMap(product => [...product.precios, ...product.adicionales])) : document.promociones.flatMap(promotion => promotion.ofertas);
    for (const price of amounts) assert.ok(compact(text).includes(compact(money(price.importe))), `${name}: falta un precio en el PDF`);
    const fonts = execFileSync('pdffonts', [filename], { encoding: 'utf8' });
    assert.match(fonts, /InstrumentSerif/u);
    assert.match(fonts, /DMSans/u);
    for (const line of fonts.trim().split('\n').slice(2)) assert.match(line, /\byes\s+yes\s+yes\b/u, 'Fuente sin incrustación o mapeo Unicode');
    if (name === 'menu-florida' || name === 'promos') {
      execFileSync('pdftoppm', ['-scale-to', '1400', '-png', filename, path.join(evidence, name)]);
    }
    results.push({ document: name, format: 'A4', pages: count, products: document.categorias?.flatMap(category => category.productos).length || 0, embeddedFonts: true, overflow: [] });
    console.log(`${name}.pdf: ${count} páginas A4, fuentes incrustadas y contenido completo.`);
  }

  for (const document of documents) {
    const name = `menu-${document.sucursal.id}`;
    await load(name);
    await verifyMenu(document);
    await exportPDF(name, 6, document);
  }
  await load('promos');
  assert.equal(await page.locator('tbody tr').count(), promotions.promociones.flatMap(promotion => promotion.ofertas).length);
  for (const promotion of promotions.promociones) {
    const section = page.locator(`[data-promocion="${promotion.id}"]`);
    assert.equal(await section.locator('h3').textContent(), promotion.nombre);
    assert.equal(await section.locator('.promo-summary').textContent(), promotion.resumen);
    if (promotion.alcance) assert.equal(await section.locator('.promo-scope').textContent(), promotion.alcance);
    else assert.equal(await section.locator('.promo-scope').count(), 0);
    assert.deepEqual(await section.locator('.promo-conditions li').allTextContents(), promotion.condiciones);
  }
  await exportPDF('promos', 3, promotions);

  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const name of ['index', 'menu-florida', 'menu-olivos', 'menu-tren', 'promos']) {
      await load(name, 'screen');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name}: desborde a ${width}px`);
      const clipped = await page.locator('h1:not(.sr-only), h2, h3, h4, .amount, .branch, .document-link').evaluateAll(elements => elements.filter(element => element.scrollWidth > element.clientWidth + 1).map(element => element.textContent));
      assert.deepEqual(clipped, [], `${name}: texto fuera de su caja a ${width}px`);
      for (const href of await page.locator('a[href]').evaluateAll(elements => elements.map(element => element.getAttribute('href')))) {
        if (!href.startsWith('#')) assert.ok(fs.existsSync(path.resolve(directory, href)), `Destino ausente: ${href}`);
      }
      if (name === 'index' && [1440, 390].includes(width)) await page.screenshot({ path: path.join(evidence, `indice-${width}.png`), fullPage: true });
    }
    console.log(`Vista HTML: cinco páginas sin desbordes a ${width}px.`);
  }
  await load('menu-florida', 'screen');
  await page.evaluate(() => { window.print = () => { window.__printInvoked = true; }; });
  await page.getByRole('button', { name: 'Imprimir', exact: true }).click();
  await page.waitForFunction(() => window.__printInvoked === true);
  await load('index', 'screen');
  await page.getByRole('link', { name: 'Florida', exact: false }).first().click();
  assert.ok(page.url().endsWith('/menu-florida.html'));
  const noScript = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await noScript.goto(url('menu-florida'));
  assert.equal(await noScript.locator('[data-producto]').count(), 116);
  assert.equal(await noScript.getByRole('button', { name: 'Imprimir', exact: true }).isVisible(), false);
  await noScript.close();
  assert.deepEqual(errors, [], 'Errores de navegador o recursos faltantes');
  fs.writeFileSync(path.join(evidence, 'resultado.json'), JSON.stringify({ date: new Date().toISOString(), browser: 'Chromium', documents: results, widths: [1440, 768, 390, 320], contentMatchesSource: true, printButton: true, noJavaScriptReading: true, errors }, null, 2) + '\n');
  console.log('Exportación y verificación terminadas; capturas en verificacion/.');
} finally {
  await browser.close();
}