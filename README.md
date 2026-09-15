# GiraTapanti

Aplicación web estática para consultar y curar un catálogo visual de especies observadas en Tapantí.

## Qué cambió frente a la versión live anterior

- El catálogo ya no depende de 4 especies demo embebidas en `app.js`.
- La app ahora carga `tapanti_curada_100_confirmada.json` como fuente principal de 100 fichas.
- Las tarjetas muestran más metadatos: grupo, familia, badge taxonómico, autoridad, anatomía, fisiología, etología, curiosidad y conservación.
- La búsqueda y los filtros quedaron preparados para trabajar con un catálogo amplio.
- La edición de URL pública de imagen sigue siendo local y segura, pero ahora solo persiste los overrides de imagen en `localStorage`.

## Archivos principales

- `/home/runner/work/GiraTapanti/GiraTapanti/index.html` — estructura principal de la interfaz.
- `/home/runner/work/GiraTapanti/GiraTapanti/styles.css` — tema oscuro, layout responsive y estilos de fichas.
- `/home/runner/work/GiraTapanti/GiraTapanti/app.js` — carga del JSON, filtros, render seguro y persistencia local de imágenes.
- `/home/runner/work/GiraTapanti/GiraTapanti/tapanti_curada_100_confirmada.json` — catálogo estático editable de 100 especies.

## Cómo usarla

1. Sirve la raíz del repositorio con un servidor estático, por ejemplo:
   ```bash
   cd /home/runner/work/GiraTapanti/GiraTapanti
   python3 -m http.server 4173
   ```
2. Abre `http://localhost:4173` en un navegador moderno.
3. Usa el buscador o los filtros de **Grupo**, **Familia** y **Estado**.
4. En cada ficha puedes:
   - revisar la información curada de la especie,
   - abrir iNaturalist o la fuente complementaria,
   - pegar una nueva **URL pública de imagen**,
   - presionar **Guardar** para conservarla en este navegador.
5. Para volver al estado inicial de la ficha, deja el campo de la imagen vacío y guarda nuevamente.

## Persistencia local

Las URLs de imagen personalizadas se guardan en:

```text
tapanti.speciesCatalog.images.v2
```

Si existían datos de la versión anterior (`tapanti.speciesCatalog.v1`), la app intenta reutilizar sus imágenes guardadas como migración ligera.

## Mantenimiento del catálogo

- Edita `tapanti_curada_100_confirmada.json` si necesitas ajustar especies o metadatos.
- Cada registro admite campos como `id`, `sciName`, `commonName`, `group`, `badge`, `badgeClass`, `autoridad`, `anatomia`, `fisiologia`, `etologia`, `curiosidad`, `conservacion`, `inatUrl`, `specUrl` y `specLabel`.
- La app sigue siendo compatible con GitHub Pages porque todo se sirve desde la raíz del repositorio.
