# Bucaré: entregas Índice

Tres carpetas de entrega, basadas en el diseño aprobado. La muestra original de `muestras/minimal/` permanece intacta.

## Reemplazo de Linktree

[linktree/index.html](linktree/index.html)

Conserva los siete destinos externos y su orden. Mantiene el diseño de Índice, sin selector de propuestas ni JavaScript necesario. Assets propios y sin dependencias de ejecución externas.

## Cartas y promociones web

[carta-web/index.html](carta-web/index.html)

Misma identidad, con promociones y tres cartas completas en HTML. Cada sucursal conserva sus 22 categorías y 116 productos. Navegación local, búsqueda por nombre/ingrediente, lectura sin JavaScript y contactos originales de WhatsApp. Sin pedidos ni reservas internas.

Precios confirmados por el usuario el **03/11/2026**. Sin avisos de borrador ni notas editoriales sobre información no especificada. El descuento en efectivo y el happy hour están visibles sin desplegables. Un precio ausente se muestra como «Consultar», nunca cero ni falta de stock.

## Cartas imprimibles

[cartas-imprimibles/index.html](cartas-imprimibles/index.html)

Mismo estilo en HTML y PDF A4: seis páginas por sucursal y tres de promociones. Descuento en efectivo y happy hour destacados en cada encabezado de carta. Sin modificar importes ni ocultar condiciones comerciales reales. [Guía de impresión y mantenimiento](cartas-imprimibles/README.md).

## Comprobación

Desde la raíz del repositorio:

```sh
node --test entregas/carta-web/scripts/contenido.test.mjs
node entregas/carta-web/scripts/generar.mjs --comprobar
node entregas/verificar.mjs
```

El generador y las pruebas de contenido usan Node sin paquetes adicionales. Las pruebas de navegador reutilizan el Playwright/Chromium de la investigación. La conversión inicial compara los tres archivos de fuente archivados; por eso esas pruebas requieren el repositorio completo.

[verificacion/resultado.json](verificacion/resultado.json) conserva el resultado y las capturas están en la misma carpeta. Se comprobaron seis páginas a 1440/768/390/320 px, datos, búsquedas, teclado, enlaces y lectura sin JavaScript. La copia de enlaces se comparó geométricamente con Índice y se verificaron las huellas SHA-256 de los tres archivos originales.

Las pruebas son de Chromium, no una certificación Safari/iPhone ni una auditoría completa WCAG. No se enviaron mensajes, no se contrataron servicios y no se publicó ninguna entrega.