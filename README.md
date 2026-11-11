# ADR Motorbikes · A Dues Rodes

Landing page del taller y concesionario de motos ADR Motorbikes (Pol. Ind. Collsabadell, Barcelona).

Web estática: HTML, CSS y JavaScript sin dependencias ni paso de build.

## Estructura

- `index.html`: la página completa (hero, servicios, taller, opiniones, cita y contacto).
- `assets/adr.css` y `assets/adr.js`: estilos y comportamiento propios de la web.
- `assets/system.css`, `assets/system.js`, `assets/layout/`, `assets/motion/`…: sistema de diseño base.
- `assets/img/`: fotos del taller y logo.
- `netlify.toml`: configuración de publicación en Netlify.

## Ver en local

```bash
python -m http.server 5180
```

Y abrir http://localhost:5180

## Cambios habituales

- **Teléfono / WhatsApp:** constante `WHATSAPP` en `assets/adr.js` y los enlaces `tel:` / `wa.me` de `index.html`.
- **Horario:** la lista `dl.hours` de `index.html` y el objeto `HORARIO` de `assets/adr.js`.
- **Reseñas:** las tarjetas `.review` dentro de `#opiniones` en `index.html` (solo reseñas reales de Google).
- Tras editar `adr.css` o `adr.js`, sube el número `?v=` de su enlace en `index.html` para que los navegadores descarguen la versión nueva.
