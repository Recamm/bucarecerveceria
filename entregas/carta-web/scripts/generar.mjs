import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const groups = { cervezas: 'Cervezas', cocina: 'Cocina', bebidas: 'Bebidas', bucafe: 'Bucafé' };
const currency = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
const icon = '<img src="assets/arrow-up-right.svg" alt="" width="20" height="20">';
const instagram = 'https://www.instagram.com/bucarecerveceria/';

export const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const text = value => assert.equal(typeof value, 'string', 'Se esperaba un texto');
const identifier = value => assert.match(value, /^[a-z0-9]+(?:-[a-z0-9]+)*$/u, 'Identificador inválido');
const amount = value => assert.ok(value === null || (Number.isSafeInteger(value) && value >= 0), 'Importe inválido');

function validateMetadata(document) {
  assert.equal(document.version, 1);
  assert.ok(['borrador', 'confirmado'].includes(document.estado));
  assert.match(document.fechaFuente, /^\d{4}-\d{2}-\d{2}$/u);
  assert.equal(new Date(`${document.fechaFuente}T00:00:00Z`).toISOString().slice(0, 10), document.fechaFuente);
}

export function validarCarta(document) {
  validateMetadata(document);
  assert.equal(document.moneda, 'ARS');
  assert.ok(['florida', 'olivos', 'tren'].includes(document.sucursal.id));
  text(document.sucursal.nombre);
  text(document.sucursal.direccion);
  assert.match(document.sucursal.whatsapp, /^https:\/\/wa\.me\/\d+$/u);
  assert.ok(Array.isArray(document.condiciones));
  document.condiciones.forEach(text);
  assert.ok(Array.isArray(document.categorias) && document.categorias.length > 0);
  const seen = new Set([...Object.keys(groups), 'contenido', 'page-title', 'buscar']);
  for (const category of document.categorias) {
    identifier(category.id);
    assert.ok(!seen.has(category.id), `Identificador repetido: ${category.id}`);
    seen.add(category.id);
    assert.ok(Object.hasOwn(groups, category.grupo));
    text(category.nombre);
    assert.ok(Array.isArray(category.notas));
    category.notas.forEach(text);
    assert.ok(Array.isArray(category.productos) && category.productos.length > 0);
    for (const product of category.productos) {
      identifier(product.id);
      assert.ok(!seen.has(product.id), `Identificador repetido: ${product.id}`);
      seen.add(product.id);
      text(product.nombre);
      assert.ok(product.nombre.trim().length > 0);
      text(product.descripcion);
      assert.equal(typeof product.vegetariano, 'boolean');
      assert.ok(product.presentacion === null || typeof product.presentacion === 'string');
      assert.ok(Array.isArray(product.precios) && product.precios.length > 0);
      for (const price of product.precios) {
        assert.ok(price.presentacion === null || typeof price.presentacion === 'string');
        amount(price.importe);
      }
      assert.ok(Array.isArray(product.adicionales));
      for (const extra of product.adicionales) { text(extra.nombre); amount(extra.importe); }
    }
  }
  return document;
}

function validatePromotions(document) {
  validateMetadata(document);
  assert.ok(Array.isArray(document.promociones) && document.promociones.length > 0);
  const seen = new Set();
  for (const promotion of document.promociones) {
    identifier(promotion.id);
    assert.ok(!seen.has(promotion.id));
    seen.add(promotion.id);
    [promotion.nombre, promotion.resumen, promotion.alcance].forEach(text);
    assert.ok(Array.isArray(promotion.condiciones));
    promotion.condiciones.forEach(text);
    assert.ok(Array.isArray(promotion.ofertas));
    for (const offer of promotion.ofertas) { text(offer.nombre); amount(offer.importe); }
  }
  return document;
}

const draftNote = state => state === 'borrador' ? '<p class="draft-note">Borrador · Precios y condiciones pendientes de confirmar.</p>' : '';
const money = value => value === null ? 'Consultar' : escapeHTML(currency.format(value));
const list = (items, className = '') => items.length ? `<ul class="${className}">${items.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ul>` : '';

function layout({ title, description, content, state, searchable = false, home = false }) {
  return `<!doctype html>
<html lang="es-AR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#c1282d">
  <meta name="description" content="${escapeHTML(description)}">
  ${state === 'borrador' ? '<meta name="robots" content="noindex">\n  ' : ''}<title>${escapeHTML(title)} · Bucaré Cervecería</title>
  <link rel="icon" href="assets/logo.png" type="image/png">
  <link rel="stylesheet" href="estilos.css">
  ${searchable ? '<script src="buscar.js" defer></script>' : ''}
</head>
<body${home ? '' : ' class="content-page"'}>
  <a class="skip-link" href="#contenido">Ir al contenido</a>
  <header class="site-header"><div class="header-inner"><a class="brand" href="index.html" aria-label="Bucaré, inicio"><img src="assets/logo.png" alt="Bucaré" width="56" height="56"><span>Cervecería</span></a><a class="instagram" href="${instagram}" target="_blank" rel="noopener noreferrer">Instagram ${icon}</a></div></header>
  ${content}
  <footer class="site-footer"><div>Bucaré Cervecería${home ? draftNote(state) : ''}</div><a href="${instagram}" target="_blank" rel="noopener noreferrer">@bucarecerveceria ${icon}</a></footer>
</body>
</html>
`;
}

function sectionNavigation(active) {
  return `<nav class="section-nav" aria-label="Cartas y promociones">${[['florida', 'Florida'], ['olivos', 'Olivos'], ['tren', 'Tren'], ['promos', 'Promos']].map(([id, name]) => `<a href="${id === 'promos' ? 'promos' : `menu-${id}`}.html"${active === id ? ' aria-current="page"' : ''}>${name}</a>`).join('')}</nav>`;
}

function renderProduct(product) {
  return `<article class="menu-item" id="${product.id}" data-producto="${product.id}"><div class="item-copy"><h4>${escapeHTML(product.nombre)}</h4>${product.presentacion ? `<p class="presentation">${escapeHTML(product.presentacion)}</p>` : ''}${product.descripcion ? `<p>${escapeHTML(product.descripcion)}</p>` : ''}${product.vegetariano ? '<span class="vegetarian">Vegetariano</span>' : ''}${product.adicionales.map(extra => `<p class="extra">${escapeHTML(extra.nombre)}: + ${money(extra.importe)}</p>`).join('')}</div><dl class="prices">${product.precios.map(price => `<div><dt${price.presentacion ? '' : ' class="sr-only"'}>${escapeHTML(price.presentacion || 'Precio')}</dt><dd>${money(price.importe)}</dd></div>`).join('')}</dl></article>`;
}

export function renderCarta(document) {
  validarCarta(document);
  const branch = document.sucursal;
  const navigation = Object.entries(groups).filter(([id]) => document.categorias.some(category => category.grupo === id));
  const sections = navigation.map(([id, name]) => `<section class="menu-group" id="${id}" data-grupo><h2>${name}</h2>${document.categorias.filter(category => category.grupo === id).map(category => `<section class="menu-category" id="${category.id}" data-categoria><h3>${escapeHTML(category.nombre)}</h3>${list(category.notas, 'category-notes')}${category.productos.map(renderProduct).join('')}</section>`).join('')}</section>`).join('');
  const categoryNavigation = `<nav class="category-nav" aria-label="Categorías"><div class="category-links">${navigation.map(([id, name]) => `<a href="#${id}">${name}</a>`).join('')}</div><div class="reading-state" hidden><div class="reading-caption"><span data-current-section></span><span data-reading-percent>0%</span></div><progress class="reading-progress" max="100" value="0" aria-label="Avance de lectura de la carta"></progress></div></nav>`;
  const content = `<main class="content-shell" id="contenido"><a class="back-link" href="index.html">${icon} Inicio</a>${sectionNavigation(branch.id)}<div class="page-heading"><h1>Menú ${escapeHTML(branch.nombre)}</h1><p>${escapeHTML(branch.direccion)}</p>${draftNote(document.estado)}</div><section class="conditions" aria-label="Beneficios de la carta">${list(document.condiciones)}</section><form class="search-form" role="search" hidden><label for="buscar">Buscar en esta carta</label><div><input id="buscar" name="buscar" type="search" placeholder="Nombre o ingrediente" autocomplete="off"><button type="reset">Limpiar</button></div><p class="search-status" role="status" aria-live="polite"></p></form><div class="menu-layout">${categoryNavigation}<div class="menu-sections">${sections}<p class="empty-state" hidden>No encontramos productos para esta búsqueda.</p></div></div><a class="contact-link" href="${branch.whatsapp}" target="_blank" rel="noopener noreferrer">Reservas ${escapeHTML(branch.id === 'olivos' ? 'Brew Pub' : branch.nombre)} · WhatsApp ${icon}</a></main>`;
  return layout({ title: `Menú ${branch.nombre}`, description: `Carta de Bucaré ${branch.nombre}: cervezas, cocina, bebidas y Bucafé.`, content, state: document.estado, searchable: true });
}

function renderPromotions(document) {
  validatePromotions(document);
  const sections = document.promociones.map(promotion => `<section class="promotion" id="${promotion.id}"><h2>${escapeHTML(promotion.nombre)}</h2><p class="promo-summary">${escapeHTML(promotion.resumen)}</p>${promotion.alcance ? `<p>${escapeHTML(promotion.alcance)}</p>` : ''}${promotion.ofertas.length ? `<table><caption class="sr-only">Precios de ${escapeHTML(promotion.nombre)}</caption><thead><tr><th scope="col">Producto</th><th scope="col">Precio</th></tr></thead><tbody>${promotion.ofertas.map(offer => `<tr><th scope="row">${escapeHTML(offer.nombre)}</th><td>${money(offer.importe)}</td></tr>`).join('')}</tbody></table>` : ''}${list(promotion.condiciones, 'promo-conditions')}</section>`).join('');
  return layout({ title: 'Promociones', description: 'Promociones de Bucaré: happy hour, cumpleaños y latas.', content: `<main class="content-shell" id="contenido"><a class="back-link" href="index.html">${icon} Inicio</a>${sectionNavigation('promos')}<div class="page-heading"><h1>Promociones</h1>${draftNote(document.estado)}</div><div class="promotions">${sections}</div></main>`, state: document.estado });
}

function renderHome(documents, promotions) {
  const links = [
    { id: 'promos', name: 'Promos', href: 'promos.html' },
    ...documents.map(document => ({ id: `menu-${document.sucursal.id}`, name: `Menú ${document.sucursal.nombre}`, detail: document.sucursal.direccion, href: `menu-${document.sucursal.id}.html` })),
    ...documents.map(document => ({ id: `reservas-${document.sucursal.id === 'olivos' ? 'brew-pub' : document.sucursal.id}`, name: `Reservas ${document.sucursal.id === 'olivos' ? 'Brew Pub' : document.sucursal.nombre}`, detail: 'WhatsApp', href: document.sucursal.whatsapp }))
  ];
  const content = `<main id="contenido"><section class="hero" aria-labelledby="page-title"><div class="hero-copy"><h1 id="page-title">Bucaré</h1><p>Florida · Olivos · Tren</p></div></section><nav class="bar-stage" aria-label="Cartas, promociones y contactos"><div class="original-links">${links.map(link => `<a data-original="${link.id}" href="${escapeHTML(link.href)}"${link.href.startsWith('https:') ? ' target="_blank" rel="noopener noreferrer"' : ''}><span><strong>${escapeHTML(link.name)}</strong>${link.detail ? `<small>${escapeHTML(link.detail)}</small>` : ''}</span>${icon}</a>`).join('')}</div></nav></main>`;
  return layout({ title: 'Florida, Olivos y Tren', description: 'Cartas, promociones y contactos de Bucaré Cervecería.', content, home: true, state: [...documents, promotions].some(document => document.estado === 'borrador') ? 'borrador' : 'confirmado' });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const documents = ['florida', 'olivos', 'tren'].map(id => {
    const document = JSON.parse(fs.readFileSync(path.join(directory, 'datos', `${id}.json`), 'utf8'));
    validarCarta(document);
    assert.equal(document.sucursal.id, id, 'El archivo no corresponde a la sucursal');
    return document;
  });
  const promotions = validatePromotions(JSON.parse(fs.readFileSync(path.join(directory, 'datos/promos.json'), 'utf8')));
  const outputs = [['index.html', renderHome(documents, promotions)], ['promos.html', renderPromotions(promotions)], ...documents.map(document => [`menu-${document.sucursal.id}.html`, renderCarta(document)])];
  if (process.argv.includes('--comprobar')) {
    outputs.forEach(([name, content]) => assert.equal(fs.readFileSync(path.join(directory, name), 'utf8'), content, `${name} no está actualizado`));
    console.log('Cinco páginas actualizadas y datos válidos.');
  } else {
    outputs.forEach(([name, content]) => fs.writeFileSync(path.join(directory, name), content));
    console.log('Generadas cinco páginas HTML desde datos locales. Sin PDF ni backend en la navegación.');
  }
}