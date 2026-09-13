# GiraTapanti

Aplicación web estática para **identificación y curación de especies** observadas en Tapantí. La interfaz fue reconstruida para replicar el estilo visual de fichas oscuras con borde, paneles informativos y edición de imagen pública por especie.

## Qué incluye

- Catálogo inicial con especies sembradas y contenido descriptivo listo para usar.
- Fichas con estado de curación, familia, nombre científico/común e imagen de referencia.
- Campo **URL pública** con botón **Guardar** para actualizar la imagen de cada especie.
- Persistencia local mediante `localStorage`, de modo que la URL guardada sobrevive a recargas del navegador.
- Enlace **Abrir imagen** que solo se habilita cuando la URL actual es válida.
- Validación segura para aceptar únicamente URLs absolutas `http` o `https`.
- Diseño responsive para escritorio, tablet y móvil.

## Archivos principales

- `/home/runner/work/GiraTapanti/GiraTapanti/index.html` — estructura principal de la app.
- `/home/runner/work/GiraTapanti/GiraTapanti/styles.css` — tema oscuro, layout responsive y estilos de las fichas.
- `/home/runner/work/GiraTapanti/GiraTapanti/app.js` — catálogo sembrado, filtros, validación, render seguro y persistencia.

## Cómo usar la app

1. Abre `/home/runner/work/GiraTapanti/GiraTapanti/index.html` en tu navegador.
2. Usa el buscador o los filtros de **Familia** y **Estado** para localizar especies.
3. En cada ficha puedes:
   - revisar la imagen de referencia,
   - pegar una nueva **URL pública**,
   - presionar **Guardar**,
   - abrir la imagen actual con **Abrir imagen**.
4. Si quieres volver a la imagen sembrada originalmente, deja el campo vacío y pulsa **Guardar**.

## Persistencia local

La app guarda las URLs personalizadas por especie en la clave de `localStorage`:

```text
tapanti.speciesCatalog.v1
```

Esto ocurre solo en el navegador/dispositivo actual.

## Recomendaciones para las imágenes

- Usa enlaces públicos directos y accesibles por navegador.
- La validación bloquea protocolos inseguros como `javascript:` o `data:`.
- Si una imagen falla al cargar, la ficha muestra un marcador visual de respaldo sin romper la interfaz.

## Desarrollo local

Como es una app estática, no requiere instalación de dependencias. Si prefieres servirla desde un servidor local:

```bash
cd /home/runner/work/GiraTapanti/GiraTapanti
python3 -m http.server 4173
```

Luego visita `http://localhost:4173`.
