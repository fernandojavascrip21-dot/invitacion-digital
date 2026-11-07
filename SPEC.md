# SPEC — Invitación digital: Bautizo de Bastian Antonio

## 1. Objetivo
Versión web interactiva de la invitación de referencia (`references/WhatsApp Image 2026-11-06 at 21.40.13.jpeg`). El invitado ve un **sobre cerrado**; al hacer clic, el sobre se abre y la **carta se despliega** mostrando la invitación completa, con animaciones llamativas y fieles al estilo de la imagen. Se comparte por WhatsApp como un enlace.

## 2. Contenido (textual, tomado de la referencia)
- Título: «Mi bautizo»
- Nombre: **Bastian Antonio**
- Frase: «Un ángel bajó del cielo para sonreírle a la vida, hoy lo presentamos ante Dios para sellar su fe»
- Fecha (listón): **Sábado 28 de noviembre de 2026**
- Rito bautismal: Parroquia de San Miguel Arcángel — 1:00 pm
- Recepción: Terraza Huerta La Bendición, Brizuela 570 — 2:00 pm
- Mis padres: Ashley Malta · Jesús Flores
- Mis padrinos: Suzet Rodríguez · Juan Flores

## 3. Estilo visual (derivado de la referencia)
| Elemento | Especificación |
|---|---|
| Fondo | Azul cielo muy claro con textura de acuarela (#E8F0FA → #F4F8FD) |
| Azul principal (texto) | ~#1F4E9C (azul marino medio) |
| Baby blue (color de marca, sobre y acentos) | #89CFF0 (variantes #A9DCF5 / #6FB8E0) |
| Azul listones/nubes | #BBD3F0 / #DCE9F7 |
| Dorado (estrellas, líneas, óvalo) | ~#E5B13A |
| Marco | Óvalo con doble línea fina (dorada + azul) |
| Tipografía título/nombre | Serif caligráfica con swashes (Google Fonts: *Pinyon Script* o *Cormorant Garamond* italic + versalitas) |
| Tipografía texto | Serif clásica (*Cormorant Garamond* / *Playfair Display*); frases en cursiva |
| Ilustraciones | Acuarela: carrusel con caballito, 2 caballitos mecedores espejados, nubes, estrellas doradas, moños azules, listón |
| Separadores | Línea dorada + estrella central |

**Assets**: recortar/vectorizar desde la imagen de referencia (carrusel, caballitos, nubes, moños, listón) como PNG/WebP con transparencia; si la calidad no alcanza, recrearlos en SVG con estilo acuarela suave. *(Ver preguntas abiertas.)*

## 4. Experiencia / flujo
1. **Pantalla de sobre (inicio)**
   - Fondo cielo con nubes en parallax suave y estrellas que titilan.
   - Sobre color **baby blue** (#89CFF0, con solapa interior ligeramente más clara #A9DCF5 y sombras #6FB8E0) con sello/moño con una estrella dorada.
   - Texto invitando: «Toca para abrir» + pequeño latido/flotación del sobre.
2. **Clic en el sobre** (secuencia ~4–5 s)
   1. El moño/sello se desata o rompe con un destello dorado.
   2. La solapa superior rota 180° (3D, `perspective`) abriendo el sobre.
   3. La carta sube desde dentro del sobre.
   4. La carta se agranda/despliega hasta ocupar la pantalla; el sobre se desliza hacia abajo y se desvanece.
   5. Ráfaga de estrellas doradas / confeti suave de estrellas.
3. **Carta (invitación)** — scroll vertical o pantalla única, con revelado escalonado:
   - El óvalo se dibuja (stroke animado), el carrusel aparece con leve balanceo/rotación del caballito.
   - «Mi bautizo» y «Bastian Antonio» entran con efecto de escritura/fade + blur.
   - Listón de fecha se desenrolla de izquierda a derecha.
   - Bloques Rito / Recepción / Padres / Padrinos aparecen en cascada con estrellas separadoras girando al entrar.
   - Caballitos mecedores se balancean continuamente (loop); nubes derivan lentamente; estrellas titilan.
   - Moño inferior se «anuda» al final.
4. **Acciones** (botones discretos al final, mismo estilo):
   - «Cómo llegar» (Google Maps de Parroquia y de Terraza).
   - «Agregar al calendario» (archivo .ics o enlace Google Calendar).
   - «Confirmar asistencia» por WhatsApp (mensaje prellenado) — opcional, ver preguntas.
5. Botón mute/play si se incluye música (opcional).

## 5. Requisitos técnicos
- **Stack**: HTML + CSS + JS vanilla (sin build) + **GSAP** (CDN, versión fija) para la timeline; alternativa CSS puro con `@keyframes` si se prefiere cero dependencias.
- **Estructura**:
  ```
  index.html
  css/styles.css
  js/main.js
  assets/ (img/, fonts opcionales, audio opcional)
  ```
- **Mobile-first** (el 95 % lo abrirá desde WhatsApp): diseñada para 360–430 px de ancho; en escritorio, la carta se centra con proporción ~ 3:4 (como la imagen) y fondo de cielo.
- **Rendimiento**: animar solo `transform`/`opacity`; imágenes WebP optimizadas (<1.5 MB total ideal); carga rápida del sobre antes que el resto (preload).
- **Accesibilidad**: sobre es un `<button>` con `aria-label`, accesible por teclado (Enter/Espacio); respeta `prefers-reduced-motion` (animación reducida/apertura directa); contraste del texto azul sobre fondo claro ≥ 4.5:1.
- **Compartir**: metas Open Graph (título, descripción, imagen de vista previa) para que WhatsApp muestre una tarjeta bonita; `lang="es"`.
- **Hosting**: sitio estático (GitHub Pages / Netlify / Vercel).

## 6. Criterios de aceptación
- [ ] Al cargar se ve el sobre cerrado con animación de espera; no hay contenido de la carta visible.
- [ ] Un clic/tap (o Enter) dispara la secuencia completa y termina mostrando toda la información sin errores de texto vs. §2.
- [ ] La apariencia (colores, tipografía, ilustraciones, óvalo, listón, separadores) es reconociblemente la de la referencia.
- [ ] Funciona fluido (~60 fps) en un móvil de gama media y en Chrome/Safari/Firefox recientes.
- [ ] Sin scroll horizontal en 320–1440 px.
- [ ] Con `prefers-reduced-motion` la invitación se muestra sin animaciones intensas.
- [ ] Previsualización correcta al compartir el enlace.

## 7. Fuera de alcance (v1)
Backend, base de datos de invitados, RSVP con panel de control, múltiples idiomas.

## 8. Preguntas abiertas
1. **Ilustraciones**: ¿tienes los assets originales (carrusel, caballitos, nubes) en PNG/transparente, o los extraigo de la imagen JPEG (calidad limitada) / los recreo en SVG?
2. **Música**: ¿añadir música de fondo (p. ej. nana suave)? Si sí, ¿cuál archivo?
3. **RSVP**: ¿botón de confirmar por WhatsApp? ¿A qué número?
4. **Mapas**: ¿enlaces/direcciones exactas de la Parroquia y de la Terraza (Brizuela 570, ciudad)?
5. ~~Color del sobre~~ — decidido: **baby blue**.
6. **Hosting/dominio**: ¿dónde lo publicarás?

## 9. Plan de implementación
1. Preparar assets (recortes/SVG) y fuentes.
2. Maquetar la carta estática fiel a la referencia (HTML/CSS).
3. Construir el sobre 3D (solapa, carta interior, sello).
4. Timeline GSAP: apertura → despliegue → revelado escalonado → loops ambientales.
5. Botones de acción, metas OG, reduced-motion.
6. Pruebas en móvil/escritorio y ajuste de rendimiento.
7. Publicación.
