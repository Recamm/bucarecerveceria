# Cartas imprimibles: Índice

Nueva entrega separada de Linktree, carta web y muestras. Conserva el blanco, rojo #C1282D, Instrument Serif y DM Sans del estilo aprobado. No modifica los documentos originales ni añade funciones comerciales.

## Abrir e imprimir

- [Índice de cartas](index.html), con vista HTML, descarga PDF y botón de impresión.
- [Florida, PDF](menu-florida.pdf) · [HTML](menu-florida.html).
- [Olivos, PDF](menu-olivos.pdf) · [HTML](menu-olivos.html).
- [Tren, PDF](menu-tren.pdf) · [HTML](menu-tren.html).
- [Promociones, PDF](promos.pdf) · [HTML](promos.html).

Cada sucursal tiene **6 páginas A4 verticales**, con sus **22 categorías y 116 productos completos**. Promociones tiene 3 páginas: happy hour, cumpleaños y latas. Las cartas se distribuyen en cervezas, dos páginas de cocina, menú ejecutivo/combos, bebidas y Bucafé. Dos columnas, precios alineados, condiciones y folios. Sin portada vacía ni fondos de tinta.

Imprimir preferentemente el PDF en papel **A4, orientación vertical y escala 100 % / tamaño real**. Los márgenes están incluidos: 15 mm laterales, 13 mm arriba y 11 mm abajo. Se puede imprimir a una cara o a doble cara; en este último caso, cada menú ocupa 3 hojas físicas. No hay sangrado ni marcas de corte. Para imprimir desde HTML, seleccionar A4, sin márgenes adicionales ni encabezados/pies del navegador. La barra de herramientas no se imprime.

Todos los HTML abren como archivos locales, sin servidor ni conexión. Tienen sus propias fuentes, logo e icono. Sin JavaScript se conserva la lectura completa y la descarga de PDF; la impresión sigue disponible desde el navegador.

## Estado comercial

**Precios confirmados por el usuario el 03/11/2026.** Se retiraron el aviso de borrador y las aclaraciones editoriales de todos los HTML y PDF. La fuente archivada sigue siendo del 02/11/2026. El descuento del 10% en efectivo y el happy hour de 18 a 20 hs aparecen destacados en el encabezado de cada página de carta. No se publicó ninguna entrega.

Los importes que no estaban cargados dicen «Consultar», nunca cero ni agotado. Se conservan las marcas vegetarianas explícitas de la fuente, sin inferir otros atributos. No se inventa el beneficio del happy hour ni se acumulan descuentos. La promoción de cumpleaños conserva la semana de cumpleaños y el DNI, sin las notas de investigación. El logo es el recurso recuperado y ampliado de Instagram, no un original vectorial de imprenta.

## Mantenimiento

La única fuente editable sigue siendo [los JSON de carta-web](../carta-web/datos). No duplicar precios ni editar los HTML generados. El generador reutiliza su validación de datos y su escape HTML; la entrega final abre independientemente, pero para regenerarla se necesita el repositorio completo.

Desde la raíz, con Node 20 o posterior:

```sh
node entregas/cartas-imprimibles/generar.mjs
node entregas/cartas-imprimibles/exportar.mjs
```

El primer comando genera HTML y copia solamente los recursos necesarios con sus licencias. El segundo comprueba que esos archivos estén actualizados, exporta los cuatro PDF y verifica la entrega. Usa Playwright/Chromium ya instalados en investigacion/herramientas y las herramientas existentes de Poppler: pdfinfo, pdftotext, pdffonts y pdftoppm. No instala dependencias ni consulta fuentes externas.

La paginación es deliberada y fija. Si se agrega/elimina una categoría, la generación falla para evitar omisiones. Si crece un texto o se agregan productos, la exportación detecta cuando dejan de entrar en su hoja; ajustar la distribución o el espaciado antes de entregar. Tras actualizar contenido hay que ejecutar **ambos comandos** para no conservar un PDF viejo.

Para comprobar sólo la vigencia de HTML y recursos:

```sh
node entregas/cartas-imprimibles/generar.mjs --comprobar
```

## Verificación

[Resultado reproducible](verificacion/resultado.json). Se comprueban productos, descripciones, precios, adicionales, marcas vegetarianas, notas, condiciones, escape HTML y cobertura de categorías; beneficios legibles en cada encabezado y presentes en cada página PDF; ausencia de advertencias editoriales y de borrador en los documentos confirmados; área imprimible sin recortes, formato/número real de páginas PDF y fuentes incrustadas. Lectura de los cinco HTML a 1440/768/390/320 px, enlaces locales, botón de impresión y lectura sin JavaScript. Capturas del índice y vistas rasterizadas del PDF de Florida y promociones en verificacion/.

Pruebas en Chromium y revisión de PDF, no en Safari ni en una impresora física. Color RGB para impresión habitual; no es un archivo CMYK/PDF-X con sangrado para una imprenta industrial.