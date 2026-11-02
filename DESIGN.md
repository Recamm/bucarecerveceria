# Bucaré: Rojo de origen, madera y pizarra

## Alcance aprobado

Prueba visual solicitada el 02/11/2026. El usuario eligió como dirección inicial Rojo de origen y pidió varias mini páginas con rojo, madera cálida, luz de bar y dibujos de tiza en una pizarra a la derecha. La referencia adjunta orienta el ambiente; las fotografías que se utilicen se identificarán en los assets.

La primera web presenta el bar y reemplaza Linktree. Mantener los siete enlaces comerciales existentes y su orden: promociones, cartas Florida/Olivos/Tren y reservas externas por WhatsApp Florida/Brew Pub/Tren. No formularios, calendarios, reservas internas, checkout, backend ni cuentas. No modificar las funciones o los destinos organizados por el bar.

## Sistema compartido

- Rojo de Instagram: #C1282D. Blanco: #FFFFFF. Tiza: #F7F2DF. Carbón: #242724. Verde de apoyo: #355C46. La madera proviene de fotografías reales, no de pintar toda la web marrón.
- Tipografías locales: Archivo Black para identidad editorial, DM Sans para enlaces y lectura. Instrument Serif sólo en la variante Sobremesa; tipografía de tiza para notas dibujadas, nunca para información imprescindible.
- Logo principal: avatar de Instagram BU / CA / RÉ. Intentar recuperar una imagen pública de mayor resolución. Si se amplía o limpia el JPEG, documentar el proceso y no presentarlo como archivo maestro ni vector oficial.
- Fotografía real a sangre, nombre de la marca visible desde el primer viewport y primera sección siguiente insinuada. Sin hero dentro de tarjeta, sin intro, sin scroll bloqueado.
- Lista de enlaces clara a la izquierda; pizarra decorativa ilustrada a la derecha. En móvil la pizarra pasa debajo sin ocultar enlaces ni cambiar su orden.
- Radios pequeños; el marco de madera corresponde a la pizarra, no a todas las secciones. Una animación de entrada breve y prescindible; respetar reducción de movimiento.

## Cinco alternativas

1. **Rojo y roble**: cabecera roja, fotografía cálida y pizarra tradicional. Referencia base más próxima al pedido.
2. **Barra nocturna**: carbón, rojo de firma y fotografía de barra; luz cálida como protagonista.
3. **Cartel de barrio**: composición más gráfica, rojo y blanco, titulares fuertes y madera como contrapunto.
4. **Tiza y birra**: pizarra y lettering dominantes, rojo contenido, enlaces de lectura inmediata.
5. **Sobremesa**: blanco cálido, rojo e identidad editorial más tranquila; misma información y funciones.

Las cinco propuestas son variaciones de una misma dirección de marca, no cinco logos nuevos. Se entregan en `muestras/rojo-origen/`, sin sustituir el catálogo anterior ni los informes.

## Implementación y comprobación

HTML/CSS/JavaScript estáticos, sin dependencias de runtime nuevas. Reutilizar tipografías, Lucide y Playwright existentes. Assets preparados en `assets/rojo-origen/` con procedencia y originales conservados.

Comprobar: cinco variantes navegables por URL, siete destinos idénticos al inventario, ausencia de formularios/reservas internas, imágenes cargadas, logo sin deformación, teclado y foco, ningún desborde o solapamiento a 1440/768/390/320 px. Guardar capturas comparables. Los dibujos son decorativos; las cartas y contactos siempre serán texto y enlaces reales.

## Pendiente de la primera serie

El usuario conservó Rojo y roble como base y pidió una nueva serie más simple, descrita abajo. Para publicar: dominio, material fotográfico con permisos y, si existe, logo original. Ninguna de esas decisiones bloquea esta prueba visual local.

## Segunda serie: simplificación solicitada

El feedback posterior conserva únicamente **Rojo y roble** como base y descarta la imagen inicial de las latas/canillas. La nueva prioridad es una página muy simple, minimalista, limpia e intuitiva. Esta decisión reemplaza la portada fotográfica obligatoria y la pizarra dominante de la primera serie, que queda archivada sin alteraciones visuales.

Aplicación de las referencias originales: claridad y navegación corta de Hozon; espacio en blanco y una fotografía real del lugar en STILL / FORM; rojo de Tòpas dosificado, sin afiche ni animación. YAAS, Henrietta y Mâm Cơm quedan como contexto, no como motivo para añadir efectos o narración. Se usa el análisis y las capturas ya archivadas, no se afirma una nueva visita a esos sitios.

Cuatro alternativas en `muestras/minimal/`:

1. **Esencial**: cabecera roja, blanco y una sola lista. Sin fotografía inicial.
2. **Índice**: nombre editorial centrado y grilla de enlaces en escritorio. Sin fotografía inicial; lista simple en móvil.
3. **Pizarra sutil**: lista sobre blanco, rojo contenido y una única pizarra pequeña a la derecha. Sin fotografía inicial.
4. **El local**: fachada real de Florida en una franja fotográfica breve, sin la imagen rechazada. Cartas y contactos inmediatamente después.

Se eliminan bandas de frases, sombras, rotaciones, titulares repetidos, galería inferior y secciones duplicadas de sucursales. Los nombres, las direcciones y los siete destinos permanecen en los enlaces originales. No se añaden reservas internas ni funciones nuevas. Tipografías y paleta se mantienen; no se rediseña el logo.

Comprobación de esta serie: cuatro URLs, dieciséis combinaciones de tamaño/variante, mismas comprobaciones de enlaces, teclado e imágenes; además verificar ausencia de la imagen rechazada y presencia de los enlaces dentro del primer viewport. El runner anterior se reutiliza admitiendo una carpeta de muestras, sin duplicar la infraestructura de pruebas.

## Dirección aprobada: Índice

El usuario eligió **Índice**. No modificar `muestras/minimal/` ni sus variantes. Se separan dos entregas independientes:

- `entregas/linktree/`: mismo Índice sin el selector de propuestas, con los siete enlaces externos originales, sin JavaScript necesario y con assets locales propios.
- `entregas/carta-web/`: mismo lenguaje visual; promociones y las tres cartas pasan a páginas HTML locales. Los tres contactos de WhatsApp no cambian. Sin pedidos, carrito, reservas internas, backend ni cuentas.

Decisiones confirmadas mediante consulta: usar todo el contenido descargado **como borrador**, pendiente de confirmar antes de publicar; mantenerlo en archivos de datos editables, **sin panel de administración**. Separar contenido, presentación y generación estática. Ninguna descarga de PDF será necesaria para leer la segunda entrega.

Comprobar el diseño aprobado contra la copia independiente, conservar las huellas de la muestra original y probar ambas entregas en 1440/768/390/320 px. En la carta web verificar contenido por sucursal, precios y condiciones de fuente, navegación local, búsquedas sin resultados, teclado y ausencia de errores. Todos los HTML deben ser legibles sin JavaScript; éste mejora la búsqueda y el seguimiento de lectura.

## Navegación persistente de la carta web

Mejora solicitada: indicar el avance y la ubicación actual dentro de la carta, con acceso permanente a los apartados en celular. Se reutiliza la navegación de grupos existente: lateral en escritorio, superior y sticky en móvil. Apartado activo con `aria-current="location"`, texto de grupo/subcategoría y una barra nativa `progress` con el porcentaje de lectura del contenido visible. Sin animaciones de carga ficticias ni cambios de datos, portada, Linktree o muestras.

Los saltos reservan el alto real de la barra y el scroll-padding existente para no ocultar títulos. El indicador se actualiza al filtrar, al cambiar el tamaño y durante el desplazamiento, agrupando el trabajo en requestAnimationFrame. Sin resultados no hay sección activa; sin JavaScript siguen funcionando los enlaces y la navegación fija, sin indicador dinámico.

Verificado en 1440/768/390/320 px: desplazamiento, sección y subcategoría activas, progreso hasta 100%, anclas móviles sin solapamiento, filtros/limpieza y navegación móvil sin JavaScript. Las otras entregas y el contenido comercial no cambian.