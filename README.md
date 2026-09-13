# GiraTapanti

Aplicación web estática para apoyar la gira de campo a Tapantí, con catálogo de organismos y registro local de avistamientos.

## Estructura

- `index.html`: interfaz principal de la aplicación.
- `styles.css`: estilos responsivos y componentes visuales.
- `app.js`: lógica de catálogo, filtros, registro y persistencia en `localStorage`.

## Funcionalidades

- Catálogo detallado de flora, fauna y hongos.
- Filtros por texto, grupo y zona de observación.
- Ordenamiento de resultados por nombre, grupo o zona.
- Registro de avistamientos con cantidad, zona, observador y notas.
- Historial de avistamientos guardado en el navegador.
- Exportación de avistamientos a JSON.
- Borrado seguro del historial.
- Diseño responsivo para escritorio y celular.

## Ejecución

No requiere instalación de dependencias.

1. Abre `index.html` en un navegador moderno.
2. (Opcional recomendado) Si quieres evitar restricciones de `file://`, levanta un servidor estático simple desde la carpeta del repositorio:

   ```bash
   cd GiraTapanti
   python -m http.server 8080
   ```

3. Visita `http://localhost:8080`.

## Datos guardados

Los avistamientos se almacenan en el navegador con la llave:

- `tapanti.sightings.v1`

