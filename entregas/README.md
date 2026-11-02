# Bucaré: entregas Índice

Dos carpetas independientes, basadas en el diseño aprobado. La muestra original de `muestras/minimal/` permanece intacta.

## Reemplazo de Linktree

[linktree/index.html](linktree/index.html)

Conserva los siete destinos externos y su orden. Mantiene el diseño de Índice, sin selector de propuestas ni JavaScript necesario. Assets propios y sin dependencias de ejecución externas.

## Cartas y promociones web

[carta-web/index.html](carta-web/index.html)

Misma identidad, con promociones y tres cartas completas en HTML. Cada sucursal conserva sus 22 categorías y 116 productos. Navegación local, búsqueda por nombre/ingrediente, lectura sin JavaScript y contactos originales de WhatsApp. Sin pedidos ni reservas internas.

Contenido aprobado sólo como **borrador**, no como información comercial vigente. Precios, condiciones, moneda y disponibilidad requieren revisión del bar antes de publicar. No se interpreta un precio ausente como cero ni como falta de stock.

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