# Mi bienestar · Ana

Dashboard de **bienestar y enfoque** construido con **HTML5, CSS3 y JavaScript puro (Vanilla ES6+)**, sin frameworks ni librerías de UI. Basado en el diseño `plastilina.jpg`, con la temática de sesiones de calma, meditación y concentración y el nombre **Ana**.

## Cómo abrir

Abrir `index.html` directamente, o servir la carpeta con cualquier servidor estático (por ejemplo `http://localhost:4173`).

## Estructura

| Archivo | Contenido |
|---|---|
| `index.html` | Estructura semántica, iconos SVG y textos de la temática Bienestar |
| `styles.css` | Paleta original, sombras clay, grano mate y responsive |
| `app.js` | Mini-player, búsqueda, selector de periodo, gráficos y tooltips |
| `assets/` | Imágenes HD derivadas del original, con textos adaptados |

## Contenido

- **Sidebar**: Mi bienestar, Mis sesiones, Favoritos, Listas, Podcasts, Actividad, Ajustes + Go Premium.
- **Hero**: `Good Morning, Ana! 🌿` · *Let's enjoy some calm today!* · `Empezar sesión`.
- **KPIs**: Meditaciones `48`, Minutos de calma `312`, Horas de enfoque `34.6`, Racha `7 días`.
- **Gráficos**: `Tiempo de calma` (Lun–Dom, con selector Esta semana / Semana pasada) y `Tipos de sesión` (Calma 45 %, Sueño 25 %, Enfoque 15 %, Respiración 10 %, Otros 5 %).
- **Inferior**: `Sesiones recientes`, `Daily Mix` (*Chill Mibes · 80 sesiones*) y `Descubre nuevas sesiones`.

## Fidelidad visual

Los colores se muestrearon de `plastilina.jpg` y las ilustraciones proceden de recortes HD del propio original. Los textos incrustados en los banners se reemplazaron conservando el estilo, la tipografía y los fondos. La textura mate se refuerza con un grano sutil (`feTurbulence`).

## Reproductor

El mini-player **reproduce música ambiental real y libre**, generada en el navegador con la Web Audio API: acordes suaves con respiración lenta, arpegios, filtro low-pass y reverberación. No hay archivos de audio externos ni licencias de terceros; cada sesión tiene su propia combinación de acordes. El botón de play/pause funde la señal y suspend/reanuda el contexto de audio.

## Pie de página

`Creado por Jonathan Toro ·` seguido de un icono de 18 px con tu logo (`assets/portafolio-jt.jpg`). Al hacer clic abre https://jon-torlen.github.io/ en pestaña nueva.

## Interactividad

- Navegación lateral con pestaña activa.
- Búsqueda en vivo sobre *Sesiones recientes* y *Daily Mix*.
- Mini-player flotante con play/pause y progreso simulado.
- Selector de periodo que redibuja el gráfico de barras.
- Tooltips en barras y segmentos de la dona.
- Diseño responsive y adaptado a dispositivos táctiles y movimiento reducido.
