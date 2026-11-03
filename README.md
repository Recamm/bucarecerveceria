# Bucaré: investigación, manual y propuestas

Entrega inicial del **02/11/2026**, con cartas imprimibles añadidas el **03/11/2026**. Diseño aprobado: **Índice**. Incluye dos sitios independientes, reemplazo de Linktree y cartas/promociones web, más una carpeta separada para impresión. Las muestras originales se conservan intactas; ninguna entrega está publicada.

## Abrir primero

- [Índice: reemplazo de Linktree](entregas/linktree/index.html).
- [Índice: cartas y promociones web](entregas/carta-web/index.html).
- [Índice: nuevas cartas imprimibles y PDF A4](entregas/cartas-imprimibles/index.html).
- [Documentación de las dos entregas](entregas/README.md).
- [Muestras minimalistas conservadas](muestras/minimal/index.html).
- [Serie anterior: cinco variantes de rojo, madera y pizarra](muestras/rojo-origen/index.html).
- [Catálogo visual: 12 direcciones + 6 tratamientos tipográficos](propuestas/index.html).
- [Informe del local](informes/01-informe-del-local.md).
- [Cartas completas: 36 páginas, separadas por sucursal](informes/02-cartas-completas.md).
- [Manual de marca adaptado](informes/03-manual-de-marca.md).
- [Análisis de las seis referencias](informes/04-referencias-de-diseno.md).

El catálogo abre directamente como archivo HTML, sin servidor, y usa fuentes, fotos e iconos locales. Permite favoritos, filtros, descargar selección JSON e imprimir lo visible. Los favoritos se guardan en ese navegador cuando el almacenamiento local está disponible.

## Entregas aprobadas

Las carpetas `entregas/linktree/` y `entregas/carta-web/` tienen sus propios recursos, sin dependencias de ejecución externas. El primer sitio conserva exactamente los siete destinos originales, sin selector de propuestas ni JavaScript. El segundo cambia sólo los cuatro destinos de cartas/promos por páginas HTML y mantiene los tres WhatsApp.

Cada carta web conserva 22 categorías y 116 productos, con precios por sucursal, descripciones y adicionales. Las tres promociones incluyen sus condiciones conocidas. Búsqueda progresiva, lectura sin JavaScript y datos JSON editables sin panel. El usuario confirmó los precios el **03/11/2026**: se retiraron los avisos de borrador y las notas editoriales, y el descuento en efectivo y el happy hour son visibles sin desplegables.

[Guía de mantenimiento](entregas/carta-web/README.md) y [resultados de la verificación](entregas/verificacion/resultado.json). Se verificó que el original no cambió y que el reemplazo conserva el diseño aprobado. Las seis páginas se comprobaron a 1440/768/390/320 px. No se enviaron mensajes ni se desplegó ninguna versión.

## Cartas imprimibles

Nueva carpeta separada con el estilo Índice, dos columnas, blanco y rojo, tipografías locales y precios alineados. [Florida](entregas/cartas-imprimibles/menu-florida.pdf), [Olivos](entregas/cartas-imprimibles/menu-olivos.pdf) y [Tren](entregas/cartas-imprimibles/menu-tren.pdf): 6 páginas A4 por sucursal, con las 22 categorías y 116 productos completos. [Promociones](entregas/cartas-imprimibles/promos.pdf): 3 páginas A4. Todos incluyen HTML y PDF, sin cambiar las otras entregas.

[Abrir las cartas](entregas/cartas-imprimibles/index.html), [guía de impresión y mantenimiento](entregas/cartas-imprimibles/README.md) y [verificación](entregas/cartas-imprimibles/verificacion/resultado.json). Se reutilizan los datos editables de carta-web, con precios confirmados y sin advertencias editoriales. El descuento en efectivo y el happy hour están destacados en el encabezado de cada página de carta.

## Exploración minimalista

El feedback conserva Rojo y roble como base, pero pide una experiencia mucho más simple y descarta su foto de inicio. Las nuevas propuestas mantienen los siete destinos originales y su orden, sin reservas internas ni funciones nuevas.

| Variante | Tratamiento |
| --- | --- |
| Esencial | Cabecera roja y una única lista sobre blanco. Exploración previa. |
| Índice | **Diseño elegido.** Más espacio en blanco, título editorial y enlaces en tres columnas en escritorio; lista en celular. Sin foto inicial. |
| Pizarra sutil | Blanco y rojo, con una pizarra pequeña como único acento de madera. Sin foto inicial. |
| El local | Una franja breve con la fachada real de Florida, distinta de la imagen descartada, seguida de los enlaces. |

Se aplicó la claridad de Hozon, el espacio y fotografía del lugar de STILL / FORM, y el rojo dosificado de Tòpas, basándose en el [análisis previo de las referencias](informes/04-referencias-de-diseno.md). Sin bandas decorativas, animaciones, galerías, titulares repetidos ni secciones duplicadas de locales. El selector superior es sólo para comparar las propuestas.

[Resultado de las dieciséis comprobaciones](muestras/minimal/verificacion.json), [Esencial en escritorio](muestras/minimal/capturas/esencial-desktop.png), [Esencial en celular](muestras/minimal/capturas/esencial-mobile.png) e [Índice en escritorio](muestras/minimal/capturas/indice-desktop.png). Además de enlaces, teclado, imágenes y tamaños, se verifica que haya acceso a los enlaces en la primera pantalla y que cada variante tenga sólo la portada prevista. Pruebas en Chromium; Safari y dispositivos físicos no comprobados.

## Serie anterior: rojo, madera y pizarra

Se conserva para comparar, sin reemplazar las muestras previas. Ambas series abren directamente como HTML, sin servidor ni nuevas dependencias de ejecución.

| Variante | Tratamiento |
| --- | --- |
| Rojo y roble | Base elegida para simplificar; su foto inicial fue descartada. |
| Barra nocturna | Carbón, rojo y tiza cálida; más ambiente de bar. |
| Cartel de barrio | Más rojo, tipografía contundente y nombre centrado. |
| Tiza y birra | Más pizarra y escritura a mano, manteniendo legibles los contactos. |
| Sobremesa | Blanco, verde y tipografía editorial; más tranquilo, con presencia de Bucafé. |

Las cinco preservan **los siete enlaces originales de Linktree y su orden**: promociones, tres cartas y tres contactos de WhatsApp. No hay formularios, calendario, reservas internas ni cambios en la organización del bar. No se enviaron mensajes para probarlos.

El logo utilizado es el de Instagram, no el de Linktree: [original y ampliaciones con procedencia](assets/rojo-origen/README.md). La foto enviada se tomó como referencia visual; las fotografías incorporadas son las imágenes públicas de Florida ya archivadas en la investigación, no una copia del adjunto.

[Decisiones de diseño](DESIGN.md), [resultado de las 20 comprobaciones de tamaño/variante](muestras/rojo-origen/verificacion.json), [captura de escritorio](muestras/rojo-origen/capturas/origen-desktop.png) y [captura de celular](muestras/rojo-origen/capturas/origen-mobile.png). Se comprobaron destinos, selector, fallback, teclado, movimiento reducido, imágenes, área táctil y desbordes en Chromium. No equivale a certificar Safari/iPhone ni accesibilidad completa.

La variante elegida es Índice; el resto se conserva como exploración. Para publicar las entregas, confirmar datos, dominio/alojamiento y, de estar disponible, logo original de mayor calidad. No se necesita fotografía para el diseño elegido.

## PDF y versiones de lectura

- [Informe del local en PDF](informes/01-informe-del-local.pdf) y [HTML](informes/01-informe-del-local.html).
- [Cartas completas en PDF](informes/02-cartas-completas.pdf) y [HTML](informes/02-cartas-completas.html).
- [Manual de marca en PDF](informes/03-manual-de-marca.pdf) y [HTML](informes/03-manual-de-marca.html).
- [Referencias en PDF](informes/04-referencias-de-diseno.pdf) y [HTML](informes/04-referencias-de-diseno.html).
- [Catálogo imprimible con las 12 direcciones](propuestas/catalogo-12-direcciones.pdf).
- [Lámina comparativa de las 12 direcciones](propuestas/lamina-12-direcciones.jpg).

Hay capturas individuales de las 12 variantes en escritorio y celular dentro de la carpeta de propuestas. La validación comprobó imágenes, fuentes, desbordes y solapamientos a 1440, 768, 390 y 320 px, además de favoritos, persistencia, filtros y exportación de selección. No es una certificación completa de accesibilidad de una web de producción.

[Resultado de pruebas locales](investigacion/verificacion.json) y [observaciones/capturas de referencias](investigacion/referencias/verificacion-desktop.json).

## Documentos originales

- [Promociones, 3 páginas](investigacion/originales/promos.pdf).
- [Florida, 12 páginas](investigacion/originales/menu-florida.pdf).
- [Olivos / Brew Pub, 12 páginas](investigacion/originales/menu-olivos.pdf).
- [Tren, 12 páginas](investigacion/originales/menu-tren.pdf).
- [Promociones: transcripción visual de las tres páginas](investigacion/textos/promos-transcripcion.md).

## Identidad y evidencia

- [Logo realmente descargado de Instagram, 100 × 100 px](investigacion/imagenes/logo-instagram.jpg): círculo rojo y BU / CA / RÉ.
- [Logo ilustrado de Linktree, 598 × 599 px](investigacion/imagenes/logo-publicado.jpg): versión distinta, no confundir con Instagram.
- [Lámina de ocho fotos de Florida](investigacion/imagenes/contacto-florida.jpg).
- [Fuentes y enlaces](investigacion/fuentes.json), [registro de descargas y hashes](investigacion/descargas.json), [datos del negocio](investigacion/negocio.json).
- [Metadatos Instagram](investigacion/instagram-metadatos.json), [metadatos PDF](investigacion/pdf-metadatos.json), [paleta Instagram](investigacion/paleta-instagram.json), [paleta Linktree](investigacion/paleta-muestreada.json).

## Organización

| Carpeta | Contenido |
| --- | --- |
| informes | Investigación, anexo completo, manual y referencias; versiones de lectura HTML/PDF generadas por exportación |
| investigacion/originales | Los cuatro PDFs completos descargados de Linktree |
| investigacion/textos | Extracciones de carta y transcripción visual de promociones |
| investigacion/imagenes | Logos, fotos públicas, lámina de contacto y vistas de PDFs |
| investigacion/referencias | HTML y texto recuperados de las seis referencias; capturas y comprobaciones visuales |
| propuestas | Catálogo interactivo, doce fichas, fuentes e iconos con licencias |
| muestras/rojo-origen | Cinco variantes de la mini página, pruebas y capturas |
| muestras/minimal | Exploración conservada: cuatro variantes, incluida la original de Índice |
| entregas/linktree | Índice independiente con los siete destinos externos |
| entregas/carta-web | Índice con cartas/promos HTML, datos editables y generación estática |
| entregas/cartas-imprimibles | Cartas con estilo Índice en HTML/PDF A4, generador y verificación de impresión |
| entregas/verificacion | Pruebas consolidadas y capturas de ambas entregas |
| assets/rojo-origen | Logo Instagram original/ampliado, fotos WebP, madera, pizarra, dibujos y procedencia |
| investigacion/herramientas | Dependencias locales de exportación y pruebas; no forman parte de la web del restaurante |

## Límites importantes

No se promete información inaccesible: no se pudo revisar el feed completo de Instagram, toda la galería/opiniones de Maps, horarios semanales ni interiores de las otras dos sucursales. Los metadatos públicos de Instagram sí se recuperaron. La carpeta conserva **todo el contenido de los cuatro PDFs**, no solamente sus miniaturas.

Los informes y fuentes archivados conservan su estado histórico de investigación; los precios de las entregas actuales fueron confirmados por el usuario el 03/11/2026. No se anuncia happy hour como 2x1, no se combinan descuentos y no se interpreta un guion de precio como stock. Logos recuperados no son vectores ni originales de imprenta. Fotos para investigación; confirmar permisos y estado actual antes de publicar.

Para completar lo bloqueado: exportación oficial de Meta entregada por el titular, horarios y condiciones escritos, logo vectorial, fotos actuales y enlaces Maps de Olivos/Tren. **No hace falta entregar contraseñas.**

## Reproducibilidad

Para regenerar y verificar las entregas:

```sh
node --test entregas/carta-web/scripts/contenido.test.mjs
node entregas/carta-web/scripts/generar.mjs
node entregas/carta-web/scripts/generar.mjs --comprobar
node entregas/verificar.mjs
```

Para regenerar y verificar las nuevas cartas imprimibles:

```sh
node entregas/cartas-imprimibles/generar.mjs
node entregas/cartas-imprimibles/exportar.mjs
```

Para comprobar la serie minimalista, usando el runner y el Playwright/Chromium ya instalados:

```sh
node muestras/rojo-origen/verificar.mjs muestras/minimal
```

Para comprobar la serie anterior:

```sh
node muestras/rojo-origen/verificar.mjs
```

Para repetir la investigación y sus documentos anteriores:

```sh
node investigacion/descargar.mjs
node investigacion/descargar.mjs --adicional
python3 investigacion/analizar.py
node propuestas/preparar.mjs
node investigacion/exportar.mjs
```

Las primeras cuatro órdenes vuelven a consultar fuentes externas y pueden cambiar archivos/datos de la captura. `analizar.py` necesita Pillow, `pdfinfo` y `pdftotext`; además consulta el avatar público de Instagram. `exportar.mjs` necesita las dependencias locales de Playwright/Marked y un Chromium compatible. No enviar mensajes de reservas para hacer pruebas.

Para repetir también las capturas externas de diseño: `node investigacion/exportar.mjs --referencias`. La última pasada registró timeouts de escritorio en tres referencias; los seis HTML y las capturas integradas anteriores siguen archivados. La exportación normal no necesita acceder a esas webs. Navegador: `node investigacion/herramientas/node_modules/playwright/cli.js install chromium`.

El usuario aprobó **Índice**, sus dos sitios y las cartas imprimibles, y confirmó los precios el 03/11/2026. No se rediseñó el logo. La muestra original, las otras variantes y la investigación permanecen archivadas. Ninguna entrega se publicó.