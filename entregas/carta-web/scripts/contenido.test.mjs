import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseCarta } from './importar-cartas.mjs';
import { escapeHTML, validarCarta, renderCarta } from './generar.mjs';

const products = categories => categories.flatMap(category => category.productos);

test('mantiene las dos presentaciones de cerveza y los precios no informados', () => {
  const parsed = parseCarta('BUCA CERO Pinta Lata\nCerveza Rubia Sin Alc.   $7300   -\nRubia sin alcohol.\fSOURs Pinta Lata\nMISTERIO DE PIRLONE | Kettle Sour   -    -\nCon frutas.');
  const items = products(parsed);
  assert.deepEqual(items[0].precios, [{ presentacion: 'Pinta', importe: 7300 }, { presentacion: 'Lata x473cc', importe: null }]);
  assert.deepEqual(items[1].precios.map(price => price.importe), [null, null]);
  assert.equal(items[0].descripcion, 'Rubia sin alcohol.');
});

test('asocia un precio posterior al título y uno anterior al título siguiente', () => {
  const parsed = parseCarta('PARA PICAR\nPROVOLETA v\n  $17800\nCon tomates.\n $21000\nHONGOS CONFITADOS v\nCon pan.');
  const items = products(parsed);
  assert.deepEqual(items.map(item => item.precios[0].importe), [17800, 21000]);
  assert.deepEqual(items.map(item => item.vegetariano), [true, true]);
});

test('conserva una marca vegetariana separada y los adicionales', () => {
  const parsed = parseCarta('DULCE Y SALADO\nTOSTADO JyQ    $8400\nCon queso.\nOpcional Huevo Revuelto  + $2200\nv\nTOSTADAS   $6300\nCon mermelada.');
  const items = products(parsed);
  assert.equal(items[0].vegetariano, false);
  assert.deepEqual(items[0].adicionales, [{ nombre: 'Huevo Revuelto', importe: 2200 }]);
  assert.equal(items[1].vegetariano, true);
});

test('separa condiciones de categoría y descripción del producto', () => {
  const parsed = parseCarta('MENÚ EJECUTIVO\nTodos los platos incluyen bebida y café.\nValido de 10am a 18pm\nMOZZA   $27800\nv\nCon mozzarella.');
  assert.deepEqual(parsed[0].notas, ['Todos los platos incluyen bebida y café.', 'Valido de 10am a 18pm']);
  assert.equal(parsed[0].productos[0].descripcion, 'Con mozzarella.');
  assert.equal(parsed[0].productos[0].vegetariano, true);
});

test('no aplica la presentación en copa a extras ni bebidas posteriores', () => {
  const parsed = parseCarta('CAFÉ\nEN COPA:\nICED LATTE $5800\nCon hielo.\nEXTRAS: Vainilla-Caramelo-Crema $2000\nSUBMARINO $5600\nLeche con chocolate.\nTÉ $3900\nConsultar opciones.');
  assert.deepEqual(products(parsed).map(item => item.presentacion), ['en copa', null, null, null]);
});

for (const branch of ['florida', 'olivos', 'tren']) {
  test(`carta completa ${branch}: conserva todos los importes y las doce páginas`, () => {
    const source = fs.readFileSync(new URL(`../../../investigacion/textos/menu-${branch}.txt`, import.meta.url), 'utf8');
    const parsed = parseCarta(source);
    const items = products(parsed);
    const expected = [...source.matchAll(/\$(\d+)/g)].map(match => Number(match[1])).sort((first, second) => first - second);
    const actual = items.flatMap(item => [...item.precios.map(price => price.importe), ...item.adicionales.map(extra => extra.importe)]).filter(price => price !== null).sort((first, second) => first - second);
    assert.deepEqual(actual, expected);
    assert.deepEqual([...new Set(items.map(item => item.pagina))].sort((first, second) => first - second), Array.from({ length: 12 }, (_, index) => index + 1));
    assert.equal(parsed.length, 22);
    assert.equal(items.find(item => item.nombre === 'ROQUE').precios[0].importe, 25200);
    assert.equal(items.find(item => item.nombre === 'TARTA DE JAMON Y QUESO').precios[0].importe, 18300);
    const sour = items.find(item => item.nombre.startsWith('MISTERIO DE PIRLONE'));
    assert.equal(sour.precios[0].importe, branch === 'tren' ? 8500 : null);
  });
}

const florida = JSON.parse(fs.readFileSync(new URL('../datos/florida.json', import.meta.url), 'utf8'));

test('la generación escapa texto editable en vez de interpretarlo como HTML', () => {
  assert.equal(escapeHTML('<script>"&</script>'), '&lt;script&gt;&quot;&amp;&lt;/script&gt;');
  const document = structuredClone(florida);
  document.categorias[0].productos[0].nombre = '<img src=x onerror=alert(1)>';
  const html = renderCarta(document);
  assert.equal(html.includes('<img src=x onerror='), false);
  assert.equal(html.includes('&lt;img src=x onerror='), true);
});

test('la validación rechaza importes negativos, IDs repetidos y contactos ajenos a WhatsApp', () => {
  const invalidPrice = structuredClone(florida);
  invalidPrice.categorias[0].productos[0].precios[0].importe = -1;
  assert.throws(() => validarCarta(invalidPrice));
  const duplicate = structuredClone(florida);
  duplicate.categorias.push(duplicate.categorias[0]);
  assert.throws(() => validarCarta(duplicate));
  const invalidLink = structuredClone(florida);
  invalidLink.sucursal.whatsapp = 'javascript:alert(1)';
  assert.throws(() => validarCarta(invalidLink));
});

test('el HTML incluye todos los productos y representa el guion sin precio cero ni falta de stock', () => {
  const html = renderCarta(florida);
  assert.equal((html.match(/data-producto=/g) || []).length, 116);
  assert.equal(html.includes('Consultar'), true);
  assert.equal(html.includes('Agotado'), false);
  assert.equal(html.includes('Borrador'), false);
  assert.equal(html.includes('pendientes de confirmar'), false);
  assert.equal(html.includes('<details class="conditions"'), false);
  assert.equal(html.includes('<section class="conditions"'), true);
  for (const condition of florida.condiciones) assert.equal(html.includes(escapeHTML(condition)), true);
  assert.equal(html.includes('type="search"'), true);
});

test('las advertencias de borrador sólo aparecen si los datos vuelven a ese estado', () => {
  assert.equal(florida.estado, 'confirmado');
  const document = structuredClone(florida);
  document.estado = 'borrador';
  assert.equal(renderCarta(document).includes('Borrador'), true);
});