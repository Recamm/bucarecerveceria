# Assets: rojo, madera y pizarra

Usados por las [cinco mini páginas](../../muestras/rojo-origen/index.html). Las decisiones visuales están en [DESIGN.md](../../DESIGN.md).

## Logo de Instagram

- [Original JPG, 100 × 100 px](logo-instagram-original.jpg): avatar público archivado de Instagram, rojo con BU / CA / RÉ.
- [PNG transparente, 256 × 256 px](logo-instagram-256.png): uso en la mini página.
- [PNG transparente, 1024 × 1024 px](logo-instagram-1024.png): ampliación disponible para composición.

Se intentó obtener una versión pública mayor, sin conseguirla. Los PNG se ampliaron con Lanczos, enfoque suave y máscara circular con transparencia. **No recuperan detalle inexistente ni son un vector oficial**. No se redibujó el logo ni se sustituyó por el avatar diferente de Linktree. Para impresión o gran formato, pedir el original al bar.

## Fotografías y materiales

- [Barra de Florida](barra.webp), [fachada](fachada.webp) y [salón](salon.webp): versiones WebP optimizadas de las fotos públicas ya archivadas en la investigación. No son fotografías del resto de las sucursales.
- [Madera real](madera-real.webp): recorte de la fotografía de la barra, usado en el marco de la pizarra.
- [Textura de pizarra](pizarra.webp): bitmap generado localmente, sin atribuirlo a una pizarra fotografiada.
- [Dibujos de bar](dibujos-pizarra.svg): ilustración decorativa creada para estas muestras, con birra, hamburguesa, café y pizza. No son iconos de interfaz.

La fotografía compartida en el chat guio el estilo de madera/pizarra, pero no se presenta ninguna de estas imágenes como una copia del adjunto. Confirmar permisos y vigencia de las fotografías antes de publicar comercialmente.

## Fuentes e iconos

Caveat 600 se conserva localmente con su [licencia OFL](caveat-LICENSE.txt). Archivo Black, DM Sans e Instrument Serif se reutilizan desde la carpeta de fuentes del catálogo. Los indicadores de enlace son los iconos Lucide ya archivados, con su licencia original. Para trasladar las muestras, conservar también esas carpetas compartidas.

## Procedencia y preparación

El [registro estructurado](procedencia.json) conserva fuentes, método, dimensiones, tamaños y hashes de los archivos preparados. El [script de preparación](preparar.py) permite regenerarlos con Pillow y curl desde las fuentes archivadas; también consulta el avatar público y descarga la versión fijada de Caveat. Volver a ejecutarlo puede cambiar esos archivos y requiere conexión.