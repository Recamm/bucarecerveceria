import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { escapeHTML, validarCarta } from '../carta-web/scripts/generar.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(directory, '../carta-web');
const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const plan = [
  { title: 'Cervezas', columns: [['buca-cero', 'lagers', 'maltosas'], ['sours', 'pale-ales', 'ipas']] },
  { title: 'Cocina', columns: [['para-picar'], ['pizzas', 'ensaladas', 'tartas']] },
  { title: 'Cocina', columns: [['hamburguesas', 'entre-panes'], ['platos', 'postres', 'menu-infantil']] },
  { title: 'Menús y combos', columns: [['menu-ejecutivo'], ['combos']] },
  { title: 'Bebidas', compact: true, columns: [['tragos'], ['vinos', 'otras-bebidas']] },
  { title: 'Bucafé', columns: [['cafe'], ['dulce-y-salado']] }
];
const money = value => value === null ? 'Consultar' : escapeHTML(currency.format(value));
const list = (items, className = '') => items.length ? `<ul class="${className}">${items.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>` : '';
const draft = document => document.estado === 'borrador' ? '<p class="draft">Borrador · Precios y condiciones pendientes de confirmar.</p>' : '';

function layout(title, content, filename = null) {
  const toolbar = filename ? `<nav class="screen-toolbar" aria-label="Documento"><a href="index.html">Cartas</a><span>${escapeHTML(title)}</span><a href="${filename}.pdf" download>PDF</a><button type="button" data-print hidden>Imprimir</button></nav>` : '';
  return `<!doctype html>
<html lang="es-AR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>${escapeHTML(title)} · Bucaré</title>
  <link rel="icon" href="assets/logo.png" type="image/png">
  <link rel="stylesheet" href="estilos.css">
  ${filename ? '<script src="imprimir.js" defer></script>' : ''}
</head>
<body class="${filename ? 'print-document' : 'index-page'}">
  <a class="skip-link" href="#contenido">Ir al contenido</a>
  ${toolbar}
  ${content}
</body>
</html>
`;
}

function header(title, branch, number, conditions = []) {
  return `<header class="sheet-header"><div class="masthead"><div class="brand"><img src="assets/logo.png" alt="" width="36" height="36"><span>Bucaré</span></div><div class="branch"><strong>${escapeHTML(branch.nombre)}</strong><span>${escapeHTML(branch.direccion)}</span></div></div><div class="heading"><h2 id="hoja-${number}">${escapeHTML(title)}</h2><span>Cervecería</span></div>${list(conditions, 'benefits')}</header>`;
}

function footer(document, number, total) {
  return `<footer class="sheet-footer">${draft(document)}<div class="folio"><span>${document.moneda === 'ARS' ? 'Precios en ARS · ' : ''}@bucarecerveceria</span><span>${number} / ${total}</span></div></footer>`;
}

function renderProduct(product) {
  const simplePrice = product.precios.length === 1 && !product.precios[0].presentacion;
  return `<article class="product" data-producto="${product.id}"><div class="product-top"><h4>${escapeHTML(product.nombre)}</h4>${simplePrice ? `<span class="amount">${money(product.precios[0].importe)}</span>` : ''}</div>${product.presentacion ? `<p class="presentation">${escapeHTML(product.presentacion)}</p>` : ''}${product.descripcion ? `<p class="description">${escapeHTML(product.descripcion)}</p>` : ''}${!simplePrice ? `<dl class="prices">${product.precios.map(price => `<div><dt>${escapeHTML(price.presentacion || 'Precio')}</dt><dd>${money(price.importe)}</dd></div>`).join('')}</dl>` : ''}${product.vegetariano ? '<p class="vegetarian">Vegetariano</p>' : ''}${product.adicionales.map(extra => `<p class="extra">${escapeHTML(extra.nombre)}: + ${money(extra.importe)}</p>`).join('')}</article>`;
}

function renderCategory(category) {
  return `<section class="category" data-categoria="${category.id}"><h3>${escapeHTML(category.nombre)}</h3>${list(category.notas, 'category-notes')}${category.productos.map(renderProduct).join('')}</section>`;
}

export function renderCarta(document) {
  validarCarta(document);
  assert.deepEqual(plan.flatMap(sheet => sheet.columns.flat()).sort(), document.categorias.map(category => category.id).sort(), 'Revisar la paginación: hay categorías nuevas, repetidas o ausentes');
  const categories = new Map(document.categorias.map(category => [category.id, category]));
  const sheets = plan.map((sheet, index) => `<section class="sheet${sheet.compact ? ' compact' : ''}" aria-labelledby="hoja-${index + 1}">${header(sheet.title, document.sucursal, index + 1, document.condiciones)}<div class="sheet-body columns">${sheet.columns.map(column => `<div class="column">${column.map(id => renderCategory(categories.get(id))).join('')}</div>`).join('')}</div>${footer(document, index + 1, plan.length)}</section>`).join('\n');
  return layout(`Menú ${document.sucursal.nombre}`, `<main id="contenido"><h1 class="sr-only">Menú ${escapeHTML(document.sucursal.nombre)}</h1>${sheets}</main>`, `menu-${document.sucursal.id}`);
}

function renderPromotions(document) {
  assert.ok(['borrador', 'confirmado'].includes(document.estado));
  assert.match(document.fechaFuente, /^\d{4}-\d{2}-\d{2}$/u);
  assert.equal(document.promociones.length, 3);
  const sheets = document.promociones.map((promotion, index) => {
    assert.ok(promotion.ofertas.every(offer => offer.importe === null || (Number.isSafeInteger(offer.importe) && offer.importe >= 0)));
    return `<section class="sheet promo-sheet" aria-labelledby="hoja-${index + 1}">${header('Promociones', { nombre: 'Bucaré Cervecería', direccion: '@bucarecerveceria' }, index + 1)}<div class="sheet-body promo-body" data-promocion="${escapeHTML(promotion.id)}"><h3>${escapeHTML(promotion.nombre)}</h3><p class="promo-summary">${escapeHTML(promotion.resumen)}</p>${promotion.alcance ? `<p class="promo-scope">${escapeHTML(promotion.alcance)}</p>` : ''}${promotion.ofertas.length ? `<table><caption>Precios</caption><tbody>${promotion.ofertas.map(offer => `<tr><th scope="row">${escapeHTML(offer.nombre)}</th><td>${money(offer.importe)}</td></tr>`).join('')}</tbody></table>` : ''}${list(promotion.condiciones, 'promo-conditions')}</div>${footer(document, index + 1, document.promociones.length)}</section>`;
  }).join('\n');
  return layout('Promociones', `<main id="contenido"><h1 class="sr-only">Promociones Bucaré</h1>${sheets}</main>`, 'promos');
}

function renderIndex(documents, promotions) {
  const links = [...documents.map(document => ({ filename: `menu-${document.sucursal.id}`, title: document.sucursal.nombre, detail: document.sucursal.direccion, pages: plan.length })), { filename: 'promos', title: 'Promociones', detail: 'Happy hour · Cumpleaños · Latas', pages: 3 }];
  const pending = [...documents, promotions].find(document => document.estado === 'borrador');
  return layout('Cartas para imprimir', `<header class="index-header"><img src="assets/logo.png" alt="Bucaré" width="48" height="48"><span>Cervecería</span></header><main id="contenido" class="index-content"><h1>Bucaré</h1><p class="index-caption">Cartas para imprimir</p><nav class="document-list" aria-label="Cartas imprimibles">${links.map(link => `<div class="document-row"><a class="document-link" href="${link.filename}.html"><span><strong>${escapeHTML(link.title)}</strong><small>${escapeHTML(link.detail)}</small></span><img src="assets/arrow-up-right.svg" alt="" width="20" height="20"></a><div class="document-meta"><span>A4 · ${link.pages} páginas</span><a href="${link.filename}.pdf" download aria-label="Descargar PDF de ${escapeHTML(link.title)}">PDF</a></div></div>`).join('')}</nav>${pending ? draft(pending) : ''}</main><footer class="index-footer">Bucaré Cervecería · Florida, Olivos y Tren</footer>`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const documents = ['florida', 'olivos', 'tren'].map(id => {
    const document = validarCarta(JSON.parse(fs.readFileSync(path.join(source, 'datos', `${id}.json`), 'utf8')));
    assert.equal(document.sucursal.id, id);
    return document;
  });
  const promotions = JSON.parse(fs.readFileSync(path.join(source, 'datos/promos.json'), 'utf8'));
  const outputs = [['index.html', renderIndex(documents, promotions)], ...documents.map(document => [`menu-${document.sucursal.id}.html`, renderCarta(document)]), ['promos.html', renderPromotions(promotions)]];
  const assets = ['logo.png', 'arrow-up-right.svg', 'LICENSE.txt', 'dm-sans-LICENSE.txt', 'instrument-serif-LICENSE.txt', 'dm-sans-latin-400-normal.woff2', 'dm-sans-latin-600-normal.woff2', 'instrument-serif-latin-400-normal.woff2'];
  if (process.argv.includes('--comprobar')) {
    for (const [filename, content] of outputs) assert.equal(fs.readFileSync(path.join(directory, filename), 'utf8'), content, `${filename} no está actualizado`);
    for (const filename of assets) assert.deepEqual(fs.readFileSync(path.join(directory, 'assets', filename)), fs.readFileSync(path.join(source, 'assets', filename)));
    console.log('Cartas imprimibles actualizadas; contenido y recursos locales coinciden.');
  } else {
    fs.mkdirSync(path.join(directory, 'assets'), { recursive: true });
    for (const filename of assets) fs.copyFileSync(path.join(source, 'assets', filename), path.join(directory, 'assets', filename));
    for (const [filename, content] of outputs) fs.writeFileSync(path.join(directory, filename), content);
    console.log('Generados índice, tres cartas de seis hojas y promociones de tres hojas.');
  }
}