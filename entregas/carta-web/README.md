# Bucaré: carta web

[index.html](index.html)

Versión del diseño **Índice** con las cartas y promociones en páginas HTML, sin abrir ni descargar PDF. Las tres reservas mantienen los WhatsApp originales. No hay pedidos, carrito, backend, panel ni cuentas.

## Contenido

- [datos/florida.json](datos/florida.json), [datos/olivos.json](datos/olivos.json) y [datos/tren.json](datos/tren.json): 22 categorías y 116 productos por sucursal, descripciones, precios, adicionales, marcas vegetarianas publicadas y página de procedencia.
- [datos/promos.json](datos/promos.json): las tres promociones y todas sus condiciones conocidas.
- [scripts/generar.mjs](scripts/generar.mjs): valida los datos, escapa los textos y genera las cinco páginas antes de publicarlas.
- [buscar.js](buscar.js): búsqueda local y seguimiento opcional de lectura, sin servidor ni llamadas externas. Ignora tildes y mayúsculas, permite enlaces de búsqueda y muestra un estado sin resultados.
- [estilos.css](estilos.css), [base.css](base.css) y `assets/`: presentación y recursos propios. La base conserva el diseño aprobado; no depende del otro sitio para navegar ni regenerar.

Las páginas se pueden leer sin JavaScript. No se cargan los JSON con `fetch`: el contenido ya está dentro del HTML, por lo que también funciona abriendo archivos locales.

## Navegación de la carta

Las categorías permanecen a la vista: en una columna lateral en escritorio y en una barra superior fija al recorrer el menú en celular. Los enlaces saltan a Cervezas, Cocina, Bebidas o Bucafé sin tapar sus títulos. El apartado actual se resalta y la línea inferior indica también la subcategoría, por ejemplo, Cocina · Pizzas.

La barra roja y su porcentaje representan el avance de lectura de la carta, no una descarga. Se recalculan al desplazarse, redimensionar o filtrar productos. Sin resultados no se marca un apartado y el avance vuelve a cero. Sin JavaScript se oculta el indicador dinámico, pero se conservan los enlaces y la navegación fija.

## Actualizar

1. Editar el JSON de la sucursal o las promociones. Conservar IDs únicos, campos y tipos.
2. Desde esta carpeta, ejecutar `node scripts/generar.mjs` con Node 20 o superior.
3. Ejecutar `node scripts/generar.mjs --comprobar` y abrir las páginas generadas para revisar los cambios.
4. Publicar los cinco HTML junto con CSS, JavaScript y assets. No hay un panel ni sincronización automática.

Ejemplo de precio editable:

```json
{ "presentacion": "Pinta", "importe": 7300 }
```

Los importes son números enteros en pesos, sin `$` ni separadores. `null` significa **precio no informado**: se muestra así, nunca como cero ni como agotado. Las marcas vegetarianas sólo reflejan la `v` de la carta; no certifican alérgenos ni aptitud vegana/celíaca.

No editar los HTML generados: se reemplazan al regenerar. El generador valida todas las fuentes antes de escribir y rechaza importes negativos, IDs repetidos, fechas inválidas y contactos fuera de WhatsApp. Los textos se tratan como texto, no HTML.

## Borrador y procedencia

Los datos provienen de los cuatro PDFs públicos archivados el **02/11/2026**; el usuario autorizó usarlos como borrador. `estado` permanece en `borrador`: muestra el aviso y añade `noindex`. Esto no es un control de privacidad ni confirma vigencia. Cambiar a `confirmado` y actualizar `fechaFuente` sólo después de revisar realmente la carta con el bar.

Se preservan todos los importes de las doce páginas de cada carta, incluidos el precio de la sour en Tren y su ausencia en Florida/Olivos. La moneda ARS se interpreta por contexto, pendiente de confirmación. Se mantienen erratas de las fuentes, sin convertirlas en información nueva.

Happy hour no se anuncia como 2x1, la promo cumpleaños no se extiende a locales no indicados y los descuentos no se suman entre sí. Las condiciones no publicadas se señalan en vez de inventarse.

[scripts/importar-cartas.mjs](scripts/importar-cartas.mjs) se usó para la conversión inicial y requiere los textos archivados del repositorio. No forma parte de la actualización normal. Se niega a sobrescribir datos existentes salvo `--sobrescribir`, opción que descarta las ediciones de esos JSON: no usarla para cambiar precios.

## Pruebas y publicación

Desde la raíz del repositorio: `node --test entregas/carta-web/scripts/contenido.test.mjs` y `node entregas/verificar.mjs`. Resultados y capturas en la carpeta de verificación de entregas. Revisión en Chromium a 1440/768/390/320 px; Safari y dispositivos físicos no comprobados.

Para alojar sólo el sitio, publicar HTML/CSS/JavaScript/assets, no los scripts de trabajo ni las pruebas. No se configuró dominio ni alojamiento. Confirmar precios, promociones, marca y contactos antes de hacer pública esta versión.