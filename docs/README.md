# Bucaré en GitHub Pages

Portada estática con dos accesos: Linktree y Carta web. Conserva el estilo Índice aprobado: blanco, rojo #C1282D, Instrument Serif, DM Sans y logo local. Sin JavaScript en la portada ni dependencias de runtime nuevas.

## Publicación

1. Subir los cambios al repositorio de GitHub.
2. En **Settings > Pages**, seleccionar **Deploy from a branch**.
3. Elegir la rama que contiene estos archivos y la carpeta **/docs**; guardar.

La portada se publica en la URL de GitHub Pages del repositorio. Los dos destinos viven dentro de esta carpeta y usan rutas relativas, compatibles tanto con sitios de repositorio como con dominio propio.

## Actualización

Las fuentes originales siguen en `entregas/linktree/` y `entregas/carta-web/`. Después de cambiarlas, ejecutar desde la raíz:

```sh
node entregas/preparar-pages.mjs
```

El comando actualiza las copias de HTML, CSS, JavaScript y assets en `docs/`, sin modificar la portada ni los originales. Los datos y generadores de la carta permanecen fuera del sitio público; si cambian los JSON, regenerar primero la carta con su comando habitual.

Para revisar localmente, abrir `docs/index.html` en el navegador. No hace falta un servidor ni una compilación para publicar esta carpeta.