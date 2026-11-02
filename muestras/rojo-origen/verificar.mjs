import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '../../investigacion/herramientas/node_modules/playwright/index.mjs';

const directory = process.argv[2] ? path.resolve(process.argv[2]) : path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(path.dirname(directory));
const captures = path.join(directory, 'capturas');
fs.mkdirSync(captures, { recursive: true });
const inventory = JSON.parse(fs.readFileSync(path.join(root, 'investigacion/fuentes.json'), 'utf8'));
const expected = [...inventory.documentos_linktree, ...inventory.reservas_linktree].map(link => link.url);
const configuration = fs.existsSync(path.join(directory, 'variantes.json')) ? JSON.parse(fs.readFileSync(path.join(directory, 'variantes.json'), 'utf8')) : { defecto: 'origen', variantes: ['origen', 'barra', 'cartel', 'pizarra', 'sobremesa'] };
const modes = configuration.variantes;
const results = { fecha: new Date().toISOString(), variantes: [], controles: {}, errores: [] };
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  page.on('pageerror', error => results.errores.push(error.message));
  for (const mode of modes) {
    for (const [width, height] of [[1440, 1000], [768, 1024], [390, 844], [320, 740]]) {
      await page.setViewportSize({ width, height });
      await page.goto(`${pathToFileURL(path.join(directory, 'index.html')).href}?variante=${mode}`);
      await page.locator('img[loading=lazy]').evaluateAll(images => images.forEach(image => { image.loading = 'eager'; }));
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode().catch(() => {}))); });
      assert.equal(await page.locator('html').getAttribute('data-variante'), mode);
      assert.deepEqual(await page.locator('[data-original]').evaluateAll(links => links.map(link => link.href)), expected, 'Destinos y orden de Linktree');
      assert.equal(await page.locator('form,input,button[type=submit]').count(), 0, 'Sin reserva interna');
      assert.equal(await page.locator('.variant-nav [aria-current=page]').count(), 1);
      const state = await page.evaluate(() => {
        const bounds = element => { const rect = element.getBoundingClientRect(); return { x: rect.x, y: rect.y, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom }; };
        const title = document.querySelector('.hero h1');
        const copy = document.querySelector('.hero-copy p');
        const titleRect = bounds(title);
        const copyRect = bounds(copy);
        const boardElement = document.querySelector('.chalk-frame');
        const board = getComputedStyle(boardElement).display !== 'none' ? bounds(boardElement) : null;
        const links = bounds(document.querySelector('.link-column'));
        const list = [...document.querySelectorAll('.original-links > a')];
        const openingImage = document.querySelector('.hero-photo');
        return {
          width: innerWidth,
          openingImage: openingImage && getComputedStyle(openingImage).display !== 'none' ? openingImage.getAttribute('src').split('/').pop() : null,
          firstLinkVisible: bounds(list[0]).bottom <= innerHeight,
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
          missingImages: [...document.images].filter(image => !image.naturalWidth).map(image => image.getAttribute('src')),
          textOverflow: [...document.querySelectorAll('h1,h2,h3,.original-links strong,.variant-nav a,.brand-word')].filter(element => element.scrollWidth > element.clientWidth + 1).map(element => element.textContent.trim()),
          titleOverlap: titleRect.bottom > copyRect.y + 1,
          boardPosition: !board || (innerWidth > 760 ? board.x >= links.right : board.y >= links.bottom),
          linkOverlap: list.some((link, index) => list.slice(0, index).some(previous => { const before = bounds(previous), current = bounds(link); return before.x < current.right - 1 && before.right > current.x + 1 && before.y < current.bottom - 1 && before.bottom > current.y + 1; })),
          smallTargets: [...document.querySelectorAll('a')].filter(element => getComputedStyle(element).display !== 'none' && bounds(element).height > 0 && bounds(element).height < 43).map(element => element.textContent.trim()),
          externalWithoutProtection: [...document.querySelectorAll('a[href^="https:"]')].filter(link => link.target !== '_blank' || !link.rel.includes('noopener')).map(link => link.href),
          logoRatio: bounds(document.querySelector('.brand > img')).width / bounds(document.querySelector('.brand > img')).height,
          reducedMotion: getComputedStyle(document.documentElement).scrollBehavior === 'auto' && getComputedStyle(document.querySelector('.hero-copy')).animationName === 'none'
        };
      });
      results.variantes.push({ mode, ...state });
      if (configuration.portadas) {
        assert.equal(state.openingImage, configuration.portadas[mode], `${mode}: portada prevista a ${width}`);
        assert.equal(state.firstLinkVisible, true, `${mode}: acceso directo a enlaces a ${width}`);
      }
      assert.equal(state.horizontalOverflow, false, `${mode}: desborde a ${width}`);
      assert.deepEqual(state.missingImages, [], `${mode}: imágenes a ${width}`);
      assert.deepEqual(state.textOverflow, [], `${mode}: texto a ${width}`);
      assert.equal(state.titleOverlap, false, `${mode}: título a ${width}`);
      assert.equal(state.boardPosition, true, `${mode}: posición de pizarra a ${width}`);
      assert.equal(state.linkOverlap, false, `${mode}: solapamiento a ${width}`);
      assert.deepEqual(state.smallTargets, [], `${mode}: área táctil a ${width}`);
      assert.deepEqual(state.externalWithoutProtection, []);
      assert.equal(state.logoRatio, 1);
      assert.equal(state.reducedMotion, true);
      if (width === 1440 || width === 390) {
        const suffix = width === 1440 ? 'desktop' : 'mobile';
        await page.screenshot({ path: path.join(captures, `${mode}-${suffix}.png`), fullPage: true });
        await page.screenshot({ path: path.join(captures, `${mode}-${suffix}-inicio.png`), fullPage: false });
      }
    }
    console.log(`${mode}: 1440/768/390/320 px, siete enlaces, assets y navegación OK.`);
  }
  await page.goto(pathToFileURL(path.join(directory, 'index.html')).href);
  for (const mode of modes) {
    await page.locator(`.variant-nav a[data-variante=${mode}]`).click();
    await page.waitForLoadState('load');
    assert.equal(await page.locator('html').getAttribute('data-variante'), mode);
  }
  await page.goto(`${pathToFileURL(path.join(directory, 'index.html')).href}?variante=desconocida`);
  assert.equal(await page.locator('html').getAttribute('data-variante'), configuration.defecto);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('.skip-link').evaluate(element => element === document.activeElement), true);
  results.controles = { selectorVariantes: true, varianteInvalida: true, saltoTeclado: true, sieteDestinosExactos: true, sinFormularios: true };
  assert.deepEqual(results.errores, []);
  console.log('Selector, fallback, teclado y movimiento reducido verificados. Sin errores de JavaScript.');
} finally {
  fs.writeFileSync(path.join(directory, 'verificacion.json'), JSON.stringify(results, null, 2) + '\n');
  await browser.close();
}