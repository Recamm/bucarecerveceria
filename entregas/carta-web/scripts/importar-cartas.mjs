import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const definitions = [
  ['BUCA CERO', 'Buca Cero', 'cervezas'], ['LAGERS', 'Lagers', 'cervezas'],
  ['MALTOSAS', 'Maltosas', 'cervezas'], ['SOURS', 'Sours', 'cervezas'],
  ['PALE ALES', 'Pale ales', 'cervezas'], ['IPAS', 'IPAs', 'cervezas'],
  ['PARA PICAR', 'Para picar', 'cocina'], ['PIZZAS', 'Pizzas', 'cocina'],
  ['ENSALADAS', 'Ensaladas', 'cocina'], ['TARTAS', 'Tartas', 'cocina'],
  ['HAMBURGUESAS', 'Hamburguesas', 'cocina'], ['ENTRE PANES', 'Entre panes', 'cocina'],
  ['PLATOS', 'Platos', 'cocina'], ['POSTRES', 'Postres', 'cocina'],
  ['MENÚ EJECUTIVO', 'Menú ejecutivo', 'cocina'], ['MENÚ INFANTIL', 'Menú infantil', 'cocina'],
  ['TRAGOS', 'Tragos', 'bebidas'], ['VINOS', 'Vinos', 'bebidas'],
  ['OTRAS BEBIDAS', 'Otras bebidas', 'bebidas'], ['CAFÉ', 'Café', 'bucafe'],
  ['DULCE Y SALADO', 'Dulce y salado', 'bucafe'], ['COMBOS', 'Combos', 'bucafe']
];

const compact = value => value.replace(/\s+/gu, ' ').trim();
const slug = value => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function parseCarta(source) {
  const categories = [];
  let category = null;
  let item = null;
  let pendingPrices = null;
  let pendingVegetarian = false;
  let presentation = null;

  function finishItem() {
    if (!item) return;
    if (!item.precios.length) throw new Error(`Falta precio de fuente: ${item.nombre}`);
    item.descripcion = compact(item.descripcion.join(' '));
    category.productos.push(item);
    item = null;
  }

  function beginItem(name, prices, page) {
    if (!category) throw new Error(`Producto sin categoría: ${name}`);
    finishItem();
    if (category.id === 'cafe' && /^EXTRAS:/iu.test(name)) presentation = null;
    const marked = /\s+v$/u.test(name);
    item = {
      id: `${category.id}-${category.productos.length + 1}`,
      nombre: compact(name.replace(/\s+v$/u, '')),
      descripcion: [],
      vegetariano: marked || pendingVegetarian,
      presentacion: presentation,
      precios: prices || pendingPrices || [],
      adicionales: [],
      pagina: page
    };
    pendingPrices = null;
    pendingVegetarian = false;
  }

  const pages = source.split('\f').filter(page => page.trim());
  for (const [pageIndex, page] of pages.entries()) {
    for (const raw of page.split(/\r?\n/u)) {
      const line = compact(raw);
      if (!line) continue;
      const upper = line.toLocaleUpperCase('es-AR');
      const heading = upper.replace(/\s+PINTA\b.*$/u, '').replace(/^(PIZZAS)\s+30 CM.*$/u, '$1');
      const definition = definitions.find(([key]) => key === heading);
      if (definition) {
        finishItem();
        if (pendingPrices) throw new Error(`Precio sin producto antes de ${heading}`);
        category = { id: slug(definition[1]), nombre: definition[1], grupo: definition[2], notas: [], productos: [] };
        if (heading === 'PIZZAS') category.notas.push('30 cm - 6 porciones');
        categories.push(category);
        presentation = null;
        continue;
      }
      if (/^(FLORIDA|BREW PUB|TREN|BUCARÉ|CERVEZAS|MENÚ|BEBIDAS|BUCAFÉ|PINTA\s+LATA|X473CC|V VEGETARIANO)$/u.test(upper)) continue;
      if (/^-10\s*%$/u.test(upper) || /^(EFECTIVO(?: BUCARÉ)?|HAPPY HOUR|DE 18 A 20HS|EN TODOS LOS ESTILOS)$/u.test(upper)) continue;
      if (!category) throw new Error(`Línea sin categoría en página ${pageIndex + 1}: ${line}`);
      if (/^EN (JARRITO|TAZA|COPA):$/u.test(upper)) {
        finishItem();
        presentation = line.replace(':', '').toLocaleLowerCase('es-AR');
        continue;
      }
      if (line === 'v') {
        if (item && item.descripcion.length === 0) item.vegetariano = true;
        else pendingVegetarian = true;
        continue;
      }
      const pricePart = line.match(/(?:\$\d+|-)(?:\s+(?:\$\d+|-))*\s*$/u);
      if (pricePart) {
        const label = compact(line.slice(0, pricePart.index));
        const values = [...pricePart[0].matchAll(/\$(\d+)|(-)/gu)].map(match => match[1] ? Number(match[1]) : null);
        const prices = values.map((value, index) => ({ presentacion: category.grupo === 'cervezas' ? ['Pinta', 'Lata x473cc'][index] : null, importe: value }));
        if (/^Opcional\s/iu.test(label)) {
          if (!item || values.length !== 1) throw new Error(`Adicional sin producto: ${line}`);
          item.adicionales.push({ nombre: compact(label.replace(/^Opcional\s+/iu, '').replace(/\+$/u, '')), importe: values[0] });
        } else if (label) beginItem(label, prices, pageIndex + 1);
        else if (item && item.precios.length === 0 && item.descripcion.length === 0) item.precios = prices;
        else {
          if (pendingPrices) throw new Error(`Dos precios sueltos en página ${pageIndex + 1}`);
          pendingPrices = prices;
        }
        continue;
      }
      const possibleName = line.replace(/\s+v$/u, '').replace(/\by\b/gu, 'Y').replace(/\bJyQ\b/gu, 'JYQ');
      if (/\p{L}/u.test(possibleName) && possibleName === possibleName.toLocaleUpperCase('es-AR')) beginItem(line, null, pageIndex + 1);
      else if (item) item.descripcion.push(line);
      else category.notas.push(line);
    }
  }
  finishItem();
  if (pendingPrices) throw new Error('Precio sin producto al final de la carta');
  if (!categories.length || categories.some(section => !section.productos.length)) throw new Error('Carta sin productos o con categoría vacía');
  return categories;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const root = path.resolve(directory, '../..');
  const branches = [
    { id: 'florida', nombre: 'Florida', direccion: 'Av. San Martín 2800', whatsapp: 'https://wa.me/5491141966543' },
    { id: 'olivos', nombre: 'Olivos', direccion: 'Gob. Ugarte 2328', whatsapp: 'https://wa.me/5491123266242' },
    { id: 'tren', nombre: 'Tren', direccion: 'Av. Maipú 2298 · Plaza de los Inmigrantes, Olivos', whatsapp: 'https://wa.me/5491165686545' }
  ];
  const outputs = branches.map(branch => path.join(directory, 'datos', `${branch.id}.json`));
  if (!process.argv.includes('--sobrescribir') && outputs.some(output => fs.existsSync(output))) throw new Error('Ya existen datos editables. No se sobrescriben sin --sobrescribir.');
  const documents = branches.map(branch => {
    const source = fs.readFileSync(path.join(root, 'investigacion/textos', `menu-${branch.id}.txt`), 'utf8');
    const document = { version: 1, estado: 'borrador', fechaFuente: '2026-11-02', moneda: 'ARS', fuente: `menu-${branch.id}.pdf`, sucursal: branch, condiciones: ['-10% en efectivo, según carta publicada.', 'Happy hour de 18 a 20 hs en todos los estilos. La carta no indica el beneficio concreto.'], categorias: parseCarta(source) };
    const expected = [...source.matchAll(/\$(\d+)/g)].map(match => Number(match[1])).sort((first, second) => first - second);
    const actual = document.categorias.flatMap(category => category.productos.flatMap(product => [...product.precios, ...product.adicionales].map(price => price.importe))).filter(price => price !== null).sort((first, second) => first - second);
    if (JSON.stringify(expected) !== JSON.stringify(actual)) throw new Error(`No coinciden todos los precios de ${branch.id}`);
    return document;
  });
  fs.mkdirSync(path.join(directory, 'datos'), { recursive: true });
  documents.forEach((document, index) => {
    fs.writeFileSync(outputs[index], JSON.stringify(document, null, 2) + '\n');
    console.log(`${document.sucursal.nombre}: ${document.categorias.length} categorías, ${document.categorias.reduce((total, category) => total + category.productos.length, 0)} productos.`);
  });
}