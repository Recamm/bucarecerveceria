const variants = globalThis.BUCARE_VARIANTES;
const container = document.querySelector('#direcciones');
const familyFilter = document.querySelector('#family-filter');
const viewButtons = [...document.querySelectorAll('[data-view]')];
const downloadButton = document.querySelector('#download-selection');
const storageKey = 'bucare-direcciones-favoritas-v1';
let selectedView = 'todas';
let favorites = new Set();

try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(stored)) favorites = new Set(stored.filter(id => variants.some(variant => variant.id === id)));
} catch {
  favorites = new Set();
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function icon(name, size = 16) {
  return `<img src="iconos/${name}.svg" alt="" width="${size}" height="${size}">`;
}

for (const family of new Set(variants.map(variant => variant.familia))) {
  const option = document.createElement('option');
  option.value = family;
  option.textContent = family;
  familyFilter.append(option);
}

for (const variant of variants) {
  const article = document.createElement('article');
  article.className = 'direction';
  article.dataset.id = variant.id;
  article.setAttribute('aria-labelledby', `title-${variant.id}`);
  const logo = variant.logo === 'ilustrado' ? 'logo-publicado.jpg' : 'logo-instagram.jpg';
  const details = [['Conservar', variant.conservar], ['Aplicaciones', variant.aplicacion], ['Movimiento', variant.movimiento], ['Riesgo', variant.riesgo]];
  const title = variant.layout === 'bucafe' ? 'Bucafé' : variant.layout === 'editorial' || variant.layout === 'mesa' || variant.layout === 'sobremesa' ? 'Bucaré' : 'BUCARÉ';
  article.innerHTML = `
    <header class="direction-heading">
      <div><div class="direction-meta"><span class="direction-number">${variant.id}</span><span class="direction-category">${escapeHtml(variant.familia)}</span>${variant.recomendada ? `<span class="recommendation">${icon('check', 12)} Selección inicial</span>` : ''}</div><h3 id="title-${variant.id}">${escapeHtml(variant.nombre)}</h3></div>
      <button class="icon-button favorite-button" type="button" aria-pressed="false" aria-label="Guardar ${escapeHtml(variant.nombre)} como favorita" title="Guardar como favorita">${icon('star', 20)}</button>
    </header>
    <div class="mockup ${variant.layout}" style="--variant-bg:${variant.fondo};--variant-ink:${variant.tinta};--variant-accent:${variant.acento};--display-font:'${variant.display}';--text-font:'${variant.texto}';--display-size:${variant.escala.split(' / ')[0]}">
      <div class="mock-top"><img class="mock-logo" src="../investigacion/imagenes/${logo}" alt="${variant.logo === 'ilustrado' ? 'Logo ilustrado publicado en Linktree' : 'Logo publicado en Instagram'}" width="44" height="44"><span class="mock-top-label">BUCARÉ CERVECERÍA<br>FLORIDA · OLIVOS · TREN</span></div>
      <p class="display">${title}</p><p class="mock-frase">${escapeHtml(variant.frase)}</p><p class="mock-tag">${variant.layout === 'afiche' ? 'TODOS LOS DÍAS · TRES LOCALES' : variant.layout === 'bucafe' ? 'LÍNEA DE CAFETERÍA · PROPUESTA' : 'BIRRA · COCINA · ENCUENTRO'}</p>
      <img class="mock-photo" src="../investigacion/imagenes/${variant.imagen}" alt="Fotografía pública de Florida, utilizada como muestra de composición" width="600" height="400" loading="lazy">
      <div class="mock-actions"><a href="../investigacion/originales/menu-florida.pdf" target="_blank" rel="noopener">Carta Florida ${icon('arrow-up-right', 13)}</a><a href="https://wa.me/5491141966543" target="_blank" rel="noopener noreferrer">Reservar Florida ${icon('arrow-up-right', 13)}</a></div>
    </div>
    <p class="photo-note">Muestra con foto de Florida. ${variant.layout === 'mesa' ? 'Imagen histórica: no representa un plato vigente identificado. ' : ''}Textos de campaña y composición propuestos.</p>
    <ul class="palette" aria-label="Paleta propuesta">${variant.paleta.map(color => `<li><span class="palette-swatch" style="background:${color}" aria-hidden="true"></span><span class="palette-code">${color}</span></li>`).join('')}</ul>
    <p class="direction-description">${escapeHtml(variant.detalle)}</p>
    <div class="spec-line"><span><strong>${escapeHtml(variant.display)}</strong> + ${escapeHtml(variant.texto)}</span><span>Esfuerzo: ${escapeHtml(variant.esfuerzo)}</span></div>
    <div class="spec-line"><span>Referencia: ${escapeHtml(variant.referencia)}</span></div>
    <details><summary>Criterios de aplicación</summary><dl>${details.map(([label, value]) => `<dt>${label}</dt><dd>${escapeHtml(value)}</dd>`).join('')}</dl></details>
  `;
  article.querySelector('.favorite-button').addEventListener('click', () => {
    if (favorites.has(variant.id)) favorites.delete(variant.id);
    else favorites.add(variant.id);
    try { localStorage.setItem(storageKey, JSON.stringify([...favorites])); } catch {}
    updateView();
  });
  container.append(article);
}

function updateView() {
  let visible = 0;
  for (const article of container.children) {
    const variant = variants.find(item => item.id === article.dataset.id);
    const selected = favorites.has(variant.id);
    const visibleInView = selectedView === 'todas' || (selectedView === 'recomendadas' && variant.recomendada) || (selectedView === 'favoritas' && selected);
    article.hidden = !visibleInView || (familyFilter.value !== 'todas' && variant.familia !== familyFilter.value);
    if (!article.hidden) visible += 1;
    const button = article.querySelector('.favorite-button');
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', `${selected ? 'Quitar' : 'Guardar'} ${variant.nombre} ${selected ? 'de favoritas' : 'como favorita'}`);
    button.title = selected ? 'Quitar de favoritas' : 'Guardar como favorita';
  }
  for (const button of viewButtons) button.setAttribute('aria-pressed', String(button.dataset.view === selectedView));
  document.querySelector('#favorite-count').textContent = String(favorites.size);
  document.querySelector('#empty-state').hidden = visible > 0;
  document.querySelector('#selection-status').textContent = `${visible} propuestas visibles. ${favorites.size} favoritas.`;
  downloadButton.disabled = favorites.size === 0;
}

for (const button of viewButtons) button.addEventListener('click', () => { selectedView = button.dataset.view; updateView(); });
familyFilter.addEventListener('change', updateView);
document.querySelector('#print-catalog').addEventListener('click', () => window.print());
window.addEventListener('beforeprint', () => { for (const details of document.querySelectorAll('details')) { details.dataset.wasOpen = String(details.open); details.open = true; } });
window.addEventListener('afterprint', () => { for (const details of document.querySelectorAll('details')) details.open = details.dataset.wasOpen === 'true'; });
downloadButton.addEventListener('click', () => {
  const selection = { marca: 'Bucaré Cervecería', estado: 'Propuestas sin aprobación de marca', exportado_en: new Date().toISOString(), favoritas: variants.filter(variant => favorites.has(variant.id)) };
  const url = URL.createObjectURL(new Blob([JSON.stringify(selection, null, 2)], { type: 'application/json' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'bucare-seleccion-de-marca.json';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
updateView();