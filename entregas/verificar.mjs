import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '../investigacion/herramientas/node_modules/playwright/index.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(directory);
const output = path.join(directory, 'verificacion');
fs.mkdirSync(output, { recursive: true });
const inventory = JSON.parse(fs.readFileSync(path.join(root, 'investigacion/fuentes.json'), 'utf8'));
const destinations = [...inventory.documentos_linktree, ...inventory.reservas_linktree].map(link => link.url);
const originalHashes = { 'index.html': '33f2d60bbe2a7cead8849bce0a4b6af45e46353b6d38e714875ee5f1e1dd6e34', 'estilos.css': '8442f8b9ac4bdad2d094f144054b9ea1eb1854e1f114f3f885c883aeda87b68f', 'variantes.js': '24e70c9b280b831850cfe4e63be60449ca41145b43e0c50a7864de66ef286441' };
const result = { fecha: new Date().toISOString(), paginas: [], controles: {}, errores: [] };
const browser = await chromium.launch({ headless: true });
const url = relative => pathToFileURL(path.join(directory, relative)).href;

async function settle(page) {
  await page.locator('img[loading=lazy]').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); });
}

async function visualSignature(page) {
  return page.evaluate(() => {
    const origin = document.querySelector('.site-header').getBoundingClientRect().top;
    return [...document.querySelectorAll('.site-header,.hero,.original-links > a,.site-footer')].map(element => {
      const bounds = element.getBoundingClientRect(), style = getComputedStyle(element);
      return { x: bounds.x, y: bounds.y - origin, width: bounds.width, height: bounds.height, color: style.color, font: style.font };
    });
  });
}

async function verifyMenuNavigation(page) {
  for (const [width, height] of [[1440, 1000], [768, 1024], [390, 844], [320, 740]]) {
    await page.setViewportSize({ width, height });
    await page.goto(url('carta-web/menu-florida.html'));
    await settle(page);
    const progress = page.getByRole('progressbar', { name: 'Avance de lectura de la carta' });
    assert.equal(await progress.count(), 1, 'Falta el avance de lectura');
    await page.waitForFunction(() => document.querySelector('.category-nav a[aria-current="location"]'));
    assert.equal(await page.locator('.category-nav a[aria-current="location"]').getAttribute('href'), '#cervezas');
    const initial = await progress.evaluate(element => element.value);
    await page.evaluate(() => document.querySelector('#cocina').scrollIntoView());
    await page.waitForFunction(() => document.querySelector('.category-nav a[aria-current="location"]')?.hash === '#cocina');
    assert.ok(await progress.evaluate(element => element.value) > initial);
    const position = await page.locator('.category-nav').evaluate(element => { const bounds = element.getBoundingClientRect(); return { top: bounds.top, bottom: bounds.bottom }; });
    assert.ok(position.top >= -1 && position.bottom < height, `Categorías fuera de pantalla a ${width}`);
    assert.ok((await page.locator('[data-current-section]').textContent()).includes('Cocina'));
    await page.evaluate(() => document.querySelector('#pizzas').scrollIntoView());
    await page.waitForFunction(() => document.querySelector('[data-current-section]').textContent.includes('Pizzas'));
    assert.equal(await page.locator('.category-nav a[aria-current="location"]').getAttribute('href'), '#cocina');
    await page.locator('.category-nav a[href="#bucafe"]').click();
    await page.waitForFunction(() => document.querySelector('.category-nav a[aria-current="location"]')?.hash === '#bucafe');
    if (width <= 760) {
      assert.equal(await page.evaluate(() => document.querySelector('#bucafe').getBoundingClientRect().top >= document.querySelector('.category-nav').getBoundingClientRect().bottom), true, 'La navegación tapa el título');
    }
    const middle = await progress.evaluate(element => element.value);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForFunction(() => document.querySelector('.reading-progress').value === 100);
    assert.ok(await progress.evaluate(element => element.value) >= middle);
    await page.screenshot({ path: path.join(output, `menu-navegacion-${width}.png`) });
    await page.goto(url('carta-web/menu-florida.html') + '?buscar=mojito');
    await settle(page);
    await page.waitForFunction(() => document.querySelector('.category-nav a[aria-current="location"]')?.hash === '#bebidas');
    assert.ok((await page.locator('[data-current-section]').textContent()).includes('Tragos'));
    await page.getByRole('searchbox').fill('zzzz-no-existe');
    await page.waitForFunction(() => !document.querySelector('.category-nav a[aria-current="location"]'));
    assert.equal(await progress.evaluate(element => element.value), 0);
    await page.getByRole('button', { name: 'Limpiar' }).click();
    await page.waitForFunction(() => document.querySelector('.category-nav a[aria-current="location"]')?.hash === '#cervezas');
    console.log(`${width}px: avance, sección actual, categorías fijas, anclas y filtros OK.`);
  }
}

try {
  for (const [file, hash] of Object.entries(originalHashes)) {
    assert.equal(createHash('sha256').update(fs.readFileSync(path.join(root, 'muestras/minimal', file))).digest('hex'), hash, `Muestra original modificada: ${file}`);
  }
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => result.errores.push(error.message));
  page.on('requestfailed', request => result.errores.push(`${request.url()}: ${request.failure()?.errorText}`));
  await verifyMenuNavigation(page);
  for (const [width, height] of [[1440, 1000], [768, 1024], [390, 844], [320, 740]]) {
    await page.setViewportSize({ width, height });
    await page.goto(pathToFileURL(path.join(root, 'muestras/minimal/index.html')).href + '?variante=indice');
    await settle(page);
    const approved = await visualSignature(page);
    await page.goto(url('linktree/index.html'));
    await settle(page);
    assert.deepEqual(await visualSignature(page), approved, `Cambió el diseño aprobado a ${width}`);
    assert.deepEqual(await page.locator('[data-original]').evaluateAll(links => links.map(link => link.href)), destinations);
    assert.equal(await page.locator('script,.review-bar,form').count(), 0);
    for (const relative of ['linktree/index.html', 'carta-web/index.html', 'carta-web/menu-florida.html', 'carta-web/menu-olivos.html', 'carta-web/menu-tren.html', 'carta-web/promos.html']) {
      await page.goto(url(relative));
      await settle(page);
      const state = await page.evaluate(() => {
        const bounds = element => element.getBoundingClientRect();
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          brokenImages: [...document.images].filter(image => !image.naturalWidth).length,
          headings: document.querySelectorAll('h1').length,
          smallTargets: [...document.querySelectorAll('a,button,input,summary')].filter(element => { const rect = bounds(element); return rect.width > 0 && rect.height > 0 && rect.height < 43; }).map(element => element.textContent.trim()),
          unsafeExternal: [...document.querySelectorAll('a[target="_blank"]')].some(element => !element.rel.includes('noopener')),
          localLinks: [...document.querySelectorAll('a[href]')].map(element => element.href).filter(href => href.startsWith('file:')),
          products: document.querySelectorAll('[data-producto]').length
        };
      });
      assert.equal(state.overflow, false, `${relative}: desborde a ${width}`);
      assert.equal(state.brokenImages, 0);
      assert.equal(state.headings, 1);
      assert.deepEqual(state.smallTargets, [], `${relative}: área táctil a ${width}`);
      assert.equal(state.unsafeExternal, false);
      for (const href of state.localLinks) {
        const target = new URL(href);
        assert.ok(fs.existsSync(fileURLToPath(target)), `Enlace local roto: ${href}`);
        if (target.hash && target.pathname === new URL(page.url()).pathname) assert.equal(await page.locator(`[id="${target.hash.slice(1)}"]`).count(), 1);
      }
      if (relative.includes('carta-web/')) {
        assert.equal(await page.locator('a[href*="drive.google"],a[href$=".pdf"]').count(), 0);
        assert.equal(await page.locator('meta[name=robots]').count(), 0);
        assert.equal(await page.locator('.draft-note').count(), 0);
        assert.doesNotMatch(await page.locator('body').textContent(), /Borrador|pendientes de confirmar|La publicación no|No se especifican|no está indicada|no están indicadas|Fuente del/u);
      }
      if (relative.includes('/menu-')) {
        assert.equal(state.products, 116);
        assert.equal(await page.locator('details.conditions, .conditions summary').count(), 0);
        assert.equal(await page.locator('.conditions').isVisible(), true);
        assert.deepEqual(await page.locator('.conditions li').allTextContents(), ['10% de descuento en efectivo.', 'Happy hour de 18 a 20 hs en todos los estilos.']);
        const bounds = await page.locator('.conditions').boundingBox();
        assert.ok(bounds.y >= 0 && bounds.y + bounds.height <= page.viewportSize().height, 'Beneficios visibles sin desplegar ni desplazarse');
      }
      if (width === 1440 || width === 390) await page.screenshot({ path: path.join(output, `${relative.replaceAll('/', '-').replace('.html', '')}-${width}.png`), fullPage: !relative.includes('/menu-') });
      result.paginas.push({ pagina: relative, ancho: width, ...state, localLinks: state.localLinks.length });
    }
    console.log(`${width}px: seis páginas, diseño Índice, enlaces, fuentes y área táctil OK.`);
  }
  await page.goto(url('carta-web/index.html'));
  const homepage = await page.locator('[data-original]').evaluateAll(links => links.map(link => ({ href: link.getAttribute('href'), target: link.target })));
  assert.deepEqual(homepage.slice(0, 4).map(link => link.href), ['promos.html', 'menu-florida.html', 'menu-olivos.html', 'menu-tren.html']);
  assert.deepEqual(homepage.slice(4).map(link => link.href), destinations.slice(4));
  assert.ok(homepage.slice(0, 4).every(link => !link.target));
  await page.locator('[data-original="menu-florida"]').click();
  await page.waitForURL('**/menu-florida.html');
  const search = page.getByRole('searchbox');
  await search.fill('mOjItO');
  assert.equal(await page.locator('[data-producto]:visible').count(), 1);
  assert.ok((await page.locator('[data-producto]:visible').textContent()).includes('MOJITO'));
  await search.fill('cafe');
  assert.ok(await page.locator('[data-producto]:visible').count() > 0);
  await search.fill('zzzz-no-existe');
  assert.equal(await page.locator('[data-producto]:visible').count(), 0);
  assert.equal(await page.locator('.empty-state').isVisible(), true);
  await page.getByRole('button', { name: 'Limpiar' }).click();
  assert.equal(await page.locator('[data-producto]:visible').count(), 116);
  assert.equal(new URL(page.url()).searchParams.has('buscar'), false);
  await page.goto(url('carta-web/menu-tren.html') + '?buscar=misterio');
  assert.equal(await page.locator('[data-producto]:visible').count(), 1);
  assert.ok((await page.locator('[data-producto]:visible').textContent()).includes('8.500'));
  await page.goto(url('carta-web/menu-florida.html') + '?buscar=misterio');
  assert.ok((await page.locator('[data-producto]:visible').textContent()).includes('Consultar'));
  await page.goto(url('carta-web/promos.html'));
  assert.equal(await page.locator('.promotion').count(), 3);
  assert.equal(await page.locator('.promotion tbody tr').count(), 8);
  await page.goto(url('linktree/index.html'));
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('.skip-link').evaluate(element => element === document.activeElement), true);
  const noScript = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce' });
  const fallback = await noScript.newPage();
  await fallback.goto(url('carta-web/menu-florida.html'));
  assert.equal(await fallback.locator('[data-producto]').count(), 116);
  assert.equal(await fallback.locator('.search-form').isVisible(), false);
  assert.equal(await fallback.locator('.reading-state').isVisible(), false);
  await fallback.setViewportSize({ width: 390, height: 844 });
  await settle(fallback);
  await fallback.locator('.category-links a[href="#cocina"]').click();
  const fallbackPosition = await fallback.locator('.category-nav').evaluate(element => element.getBoundingClientRect().top);
  assert.ok(fallbackPosition >= -1 && fallbackPosition <= 1, 'Categorías móviles fijas también sin JavaScript');
  await fallback.goto(url('linktree/index.html'));
  assert.equal(await fallback.locator('[data-original]').count(), 7);
  await noScript.close();
  assert.deepEqual(result.errores, []);
  result.controles = { muestraOriginalIntacta: true, indiceIdenticoSinSelector: true, enlacesExternosExactos: true, cartasLocalesSinPDF: true, todasLasSucursales: true, promocionesCompletas: true, busquedaSinTildes: true, sinResultados: true, limpiar: true, enlaceDeBusqueda: true, funcionaSinJavaScript: true, teclado: true, progresoDeLectura: true, seccionYCategoriaActual: true, categoriasFijasMovil: true, anclasSinSolapamiento: true, navegacionFijaSinJavaScript: true };
  console.log('Búsqueda, estados vacíos, promociones, enlaces locales, teclado y lectura sin JavaScript OK.');
} finally {
  fs.writeFileSync(path.join(output, 'resultado.json'), JSON.stringify(result, null, 2) + '\n');
  await browser.close();
}