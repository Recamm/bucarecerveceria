# Bucaré: investigación, manual y propuestas

Entrega del **02/11/2026**. La web final del restaurante todavía no se implementó: esta entrega reúne información y opciones de marca para elegir antes de construirla.

## Abrir primero

- [Catálogo visual: 12 direcciones + 6 tratamientos tipográficos](propuestas/index.html).
- [Informe del local](informes/01-informe-del-local.md).
- [Cartas completas: 36 páginas, separadas por sucursal](informes/02-cartas-completas.md).
- [Manual de marca adaptado](informes/03-manual-de-marca.md).
- [Análisis de las seis referencias](informes/04-referencias-de-diseno.md).

El catálogo abre directamente como archivo HTML, sin servidor, y usa fuentes, fotos e iconos locales. Permite favoritos, filtros, descargar selección JSON e imprimir lo visible. Los favoritos se guardan en ese navegador cuando el almacenamiento local está disponible.

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
| investigacion/herramientas | Dependencias locales de exportación y pruebas; no forman parte de la web del restaurante |

## Límites importantes

No se promete información inaccesible: no se pudo revisar el feed completo de Instagram, toda la galería/opiniones de Maps, horarios semanales ni interiores de las otras dos sucursales. Los metadatos públicos de Instagram sí se recuperaron. La carpeta conserva **todo el contenido de los cuatro PDFs**, no solamente sus miniaturas.

Precios y promociones están fechados al consultar, no confirmados comercialmente. No se anuncia happy hour como 2x1, no se combinan descuentos y no se interpreta un guion de precio como stock. Logos recuperados no son vectores ni originales de imprenta. Fotos para investigación; confirmar permisos y estado actual antes de publicar.

Para completar lo bloqueado: exportación oficial de Meta entregada por el titular, horarios y condiciones escritos, logo vectorial, fotos actuales y enlaces Maps de Olivos/Tren. **No hace falta entregar contraseñas.**

## Reproducibilidad

```sh
node investigacion/descargar.mjs
node investigacion/descargar.mjs --adicional
python3 investigacion/analizar.py
node propuestas/preparar.mjs
node investigacion/exportar.mjs
```

Las primeras cuatro órdenes vuelven a consultar fuentes externas y pueden cambiar archivos/datos de la captura. `analizar.py` necesita Pillow, `pdfinfo` y `pdftotext`; además consulta el avatar público de Instagram. `exportar.mjs` necesita las dependencias locales de Playwright/Marked y un Chromium compatible. No enviar mensajes de reservas para hacer pruebas.

Para repetir también las capturas externas de diseño: `node investigacion/exportar.mjs --referencias`. La última pasada registró timeouts de escritorio en tres referencias; los seis HTML y las capturas integradas anteriores siguen archivados. La exportación normal no necesita acceder a esas webs. Navegador: `node investigacion/herramientas/node_modules/playwright/cli.js install chromium`.

Seleccionar una dirección no aprueba automáticamente un rediseño del logo. Primera recomendación: **12 Esencial Bucaré**, **01 Rojo de origen** o **02 Editorial de barrio**; **04/10** si se prioriza el lugar, y **08** como línea Bucafé.