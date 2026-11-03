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

Los importes son números enteros en pesos, sin `$` ni separadores. `null` significa **precio no cargado**: se muestra como «Consultar», nunca como cero ni como agotado. Las marcas vegetarianas sólo reflejan la `v` de la carta; no certifican alérgenos ni aptitud vegana/celíaca.

No editar los HTML generados: se reemplazan al regenerar. El generador valida todas las fuentes antes de escribir y rechaza importes negativos, IDs repetidos, fechas inválidas y contactos fuera de WhatsApp. Los textos se tratan como texto, no HTML.

## Precios confirmados y procedencia

Los datos provienen de los cuatro PDFs públicos archivados el **02/11/2026**. El usuario confirmó los precios el **03/11/2026** y pidió retirar las advertencias editoriales. Los cuatro JSON tienen `estado: confirmado`; las páginas no muestran avisos de borrador. `fechaFuente` conserva la fecha de la fuente, no la fecha de confirmación. Si un documento vuelve explícitamente a `borrador`, el generador recupera su aviso y `noindex`.

Se preservan todos los importes de las doce páginas de cada carta, incluidos el precio de la sour en Tren y su ausencia en Florida/Olivos. Los precios se presentan en ARS. Se mantienen erratas de las fuentes, sin convertirlas en información nueva.

El 10% de descuento en efectivo y el happy hour de 18 a 20 hs están siempre visibles antes del buscador, sin desplegables. Se conservan las condiciones reales de cada promoción, como el DNI para cumpleaños. Las notas sobre información no especificada en la investigación no se muestran al cliente; no se inventan beneficios, sucursales habilitadas ni acumulaciones.

[scripts/importar-cartas.mjs](scripts/importar-cartas.mjs) se usó para la conversión inicial y requiere los textos archivados del repositorio. No forma parte de la actualización normal. Se niega a sobrescribir datos existentes salvo `--sobrescribir`, opción que descarta las ediciones de esos JSON: no usarla para cambiar precios.

## Pruebas y publicación

Desde la raíz del repositorio: `node --test entregas/carta-web/scripts/contenido.test.mjs` y `node entregas/verificar.mjs`. Resultados y capturas en la carpeta de verificación de entregas. Revisión en Chromium a 1440/768/390/320 px; Safari y dispositivos físicos no comprobados.

Para alojar sólo el sitio, publicar HTML/CSS/JavaScript/assets, no los scripts de trabajo ni las pruebas. No se configuró dominio ni alojamiento y no se publicó esta entrega. La confirmación de precios no autoriza por sí sola el despliegue.