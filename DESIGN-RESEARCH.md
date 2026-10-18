# ARTO — investigación y dirección de diseño

Consulta: 17 de octubre de 2026.

## Conclusión

La dirección más adecuada para esta demo es una cafetería editorial e ilustrada: información inmediata, escenas de café conectadas entre sí y movimiento de baja intensidad. El problema no se resolvía agregando más elementos; había que cambiar la relación entre marca, texto, imagen y acciones.

La selección se hizo por su utilidad para este encargo, no como un ranking universal de sitios. Se contrastaron webs públicas, casos publicados por sus autores y documentación técnica. Las valoraciones y decisiones que siguen son criterio de diseño aplicado a ARTO; no son resultados de pruebas comerciales ni mediciones de conversión de esas referencias.

## Referencias seleccionadas

### Cito Café — cercanía y recorrido comercial

[Cito Café](https://citocafe.com.ar/) sigue siendo la referencia principal del encargo: presenta su propuesta, la carta, el local y el contacto en una sola página, con lenguaje directo y contexto rosarino.

Aplicación: explicar desde la portada qué es ARTO y qué puede hacer el visitante. Carta y cursos quedan accesibles sin atravesar una marca gigante. La dirección vive junto al logo, no en una columna distante.

Límite: no se trasladaron textos, reseñas, estadísticas, imágenes ni datos de Cito a ARTO.

### Kenao — una identidad visual que conecta escenas

El [caso de Kenao, publicado por Sitebyr](https://sitebyr.com/kenao-cafe/), describe una taza que acompaña el recorrido entre historia, marca y menú. Es una referencia especialmente pertinente para conectar las cuatro ilustraciones existentes, en lugar de tratarlas como cuatro íconos independientes.

Aplicación: los objetos de café y la rama componen la portada; taza y planta reaparecen en el cierre. La continuidad surge de los mismos colores, proporciones y ritmos.

Límite: no se copió una taza que viaje por todo el documento. En ARTO cada escena conserva su espacio; el contenido nunca depende de seguir una animación ni de completar un scroll forzado.

### Firewatch — profundidad por capas, con moderación

[Firewatch, de Campo Santo](https://www.firewatchgame.com/), aporta una referencia útil para pensar la profundidad ilustrada. El [análisis de Creative Bloq, actualizado en marzo de 2026](https://www.creativebloq.com/web-design/parallax-scrolling-1131762), destaca sus capas de parallax y la ausencia de secuestro del desplazamiento.

Aplicación: fondo, objetos y luz tienen desplazamientos diferentes y acotados. “La casa” combina una imagen panorámica local, tipografía y una capa de luz. Los textos permanecen quietos y legibles.

Límite: no se reutilizaron sus assets. Tampoco se incorporó una escena de videojuego, desplazamiento horizontal ni un efecto cinematográfico que condicione la navegación.

### DRYPT — sistema de marca, no piezas inconexas

[DRYPT, de MarkaWorks](https://dribbble.com/shots/27616421-DRYPT-Coffee-Shop-Branding), describe una identidad que articula tipografía expresiva, tonos terrosos y aplicaciones de marca. Es una referencia de branding, no una página web lista para reproducir.

Aplicación: mantener el mismo lenguaje en logo, botones, ilustraciones y footer. Lora aporta el gesto editorial; el texto conserva la pila tipográfica solicitada. La paleta de ARTO continúa siendo crema, salvia, caramelo y espresso.

Límite: no se descargaron ni copiaron logotipos, envases o artes de ese diseñador.

### Onyx Coffee Lab — el visual debe explicar el café

Las [Brew Guides de Onyx Coffee Lab](https://onyxcoffeelab.com/en-int/pages/brew-guides) relacionan cada preparación con métodos y variables concretas. El valor para ARTO es didáctico: un recurso visual tiene más sentido si ayuda a entender qué se va a explorar.

Aplicación: cada programa tiene una escena propia. Barista inicial muestra una extracción; Latte art, el vertido de leche y una figura en la taza; Métodos, un filtro y una jarra. Las animaciones son SVG originales integrados al HTML.

Límite: no se importaron recetas, cantidades ni promesas educativas de Onyx. Las escenas son ilustraciones de procesos, no fotografías que pretendan documentar clases reales de ARTO.

### The People Vs Coffee — cerrar con una acción clara

[The People Vs Coffee](https://www.thepeoplevscoffee.com/) explica su propuesta de cafetería itinerante y ofrece contacto directo dentro de su recorrido.

Aplicación: el final no es un bloque de datos aislado. Repite la invitación del inicio y reúne cómo llegar, WhatsApp, dirección, horarios e Instagram.

Límite: no se añadieron formularios, reservas ni servicios que ARTO no hubiera declarado.

### Procoffee y Daraj — referencias complementarias

[Procoffee, de Techwitpro](https://dribbble.com/shots/26903372-Procoffee-A-smoother-way-to-shop-great-coffee-website), se presenta como un concepto de e-commerce. Sirve como criterio de jerarquía y navegación guiada, pero no justifica agregar una tienda a esta landing.

El [caso Daraj de Novu Studios](https://www.novustudios.com/work/daraj) describe un relato educativo sobre origen y preparación. Se tomó esa conexión entre explicación y experiencia, sin copiar las secciones fijadas al scroll, las tarjetas horizontales ni sus cifras de rendimiento, que no se verificaron independientemente.

## Qué cambió en cada apartado

| Apartado | Decisión implementada |
| --- | --- |
| Navegación | Marca compacta con descriptor; dirección contigua; enlaces con estados de interacción y carta como acción principal. La dirección sigue visible en móvil. |
| Portada | Mensaje contextual y escena animada de las cuatro piezas; desaparecen el wordmark gigante y la imagen separada debajo. |
| La casa | Se conservan título, textos e Instagram. Las dos fotos externas recortadas se sustituyen por un panorama local con parallax y luz en capas. |
| Pasá, estás en ARTO | Se preservan estructura, fotografía y bloque caramelo. Una breve nota editorial aporta continuidad sin rehacer la sección. |
| Cursos | Selector de tres programas, sin números. Una escena y su explicación comparten la composición. Los temas pasan a prosa, sin filas ni divisores de tabla. |
| Cierre | La invitación, el arte y las acciones forman una misma composición; dirección, horarios y redes quedan agrupados debajo. |

## Movimiento: por qué no GIF

Se eligió animación web porque permite mover por separado los objetos existentes y mantener los cursos nítidos a cualquier tamaño, sin exportar secuencias de imágenes.

La [guía de rendimiento de web.dev](https://web.dev/articles/animations-guide) recomienda priorizar transformaciones y opacidad. Esa es la base de las animaciones ambientales: no se animan márgenes, posiciones de layout ni tamaños de los bloques. El parallax se actualiza con requestAnimationFrame solamente cuando se necesita, con desplazamientos máximos de 24 px en escritorio y amplitud menor en móvil. No hay librería de animación.

El [criterio de pausa de W3C](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide) fundamenta el control “Pausar movimiento”. Además, el sitio respeta prefers-reduced-motion, pausa escenas fuera de pantalla y suspende movimiento al ocultar la pestaña. Esto no equivale a certificar toda la página como conforme a WCAG.

El selector sigue el [patrón de pestañas de WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/): estado seleccionado, relación con el panel, flechas, Home y End. Sin JavaScript aparecen los tres programas y la navegación móvil no queda escondida.

## Verificación y límites

Se probaron los tres programas y la geometría en 320, 360, 390, 768, 1024, 1280, 1440 y 1920 px. También menú, Escape, teclado, preguntas frecuentes, clics rápidos, pausa, movimiento reducido, parallax acotado y contenido sin JavaScript.

Las capturas del entorno usan fuentes de respaldo y el respaldo del interior: no verifican la descarga de Google Fonts ni la fotografía externa de TripAdvisor. Las ilustraciones de portada, casa y cursos sí se verificaron localmente.

Se mantuvo el contenido existente de cursos sin inventar fechas, precios, cupos ni certificaciones. No se simularon publicaciones de Instagram. TT Norms Pro permanece como primera opción de la pila CSS, pero no hay archivos de esa fuente incorporados al repositorio.

La identidad de Sites existente se conserva localmente, fuera del versionado. El repositorio incorpora un workflow de GitHub Pages que publica únicamente `dist`. La subida a GitHub y la activación de Pages quedan a cargo del propietario; no se realizó ninguna publicación automática desde este entorno.
