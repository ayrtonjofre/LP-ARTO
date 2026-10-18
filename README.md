# ARTO Café de Especialidad

Demo de una landing estática para ARTO, Rosario. HTML, CSS y JavaScript sin framework, dependencias ni paso de compilación.

## Verla en tu computadora

Requiere Node.js 22 o posterior. Desde la carpeta del proyecto:

```powershell
npm.cmd run dev
```

Abrí **http://127.0.0.1:4173** en Chrome, Firefox, Edge o el navegador que prefieras. Dejá la terminal abierta; para detener el servidor, presioná Ctrl+C. No hace falta ejecutar `npm install`.

En macOS/Linux se usa `npm run dev`. También podés servir la carpeta `dist` con cualquier servidor HTTP estático.

## Subir el repositorio manualmente

Git versiona los archivos; GitHub almacena el repositorio. Ninguno de los dos publica por sí solo esta página: para obtener una URL de la web hay que activar **GitHub Pages**.

1. Creá un repositorio en GitHub y usá `main` como rama principal.
2. Subí los archivos con GitHub Desktop o tu cliente de Git. El `.gitignore` ya excluye respaldos, perfiles de navegador, configuración local y archivos de entorno.
3. Asegurate de incluir `dist` y `.github/workflows/pages.yml`: son esenciales para publicar.
4. No se inicializó Git, no se crearon commits ni se configuraron remotos desde esta entrega.

Si usás **Add file → Upload files** en la web de GitHub, el `.gitignore` no filtra lo que seleccionás: no subas `.local-backup`, `.openai` ni `.vscode`. Incluí las carpetas `.github`, `dist`, `scripts` y los archivos de documentación/configuración de la raíz.

`private: true` en `package.json` evita publicar el paquete en npm; no define la privacidad del repositorio de GitHub.

## Publicar con GitHub Pages

El workflow incluido utiliza la [plantilla oficial para sitios estáticos](https://github.com/actions/starter-workflows/blob/main/pages/static.yml), publicando **solo `dist`**. No publica los scripts, la investigación ni los respaldos locales.

1. En tu repositorio, entrá a **Settings → Pages**.
2. En **Build and deployment → Source**, elegí **GitHub Actions**.
3. Entrá a **Actions → Publicar en GitHub Pages → Run workflow**, elegí `main` y ejecutalo. Si hubo un intento fallido antes de activar Pages, volvé a ejecutarlo.
4. Al finalizar correctamente, encontrás la URL en el despliegue y en **Settings → Pages → Visit site**.

Después de activarlo, cada push a `main` vuelve a publicar la versión actual. Este proyecto no necesita dominio propio ni servidor Node en producción: GitHub Pages sirve directamente los archivos estáticos.

La URL habitual será `https://TU_USUARIO.github.io/NOMBRE_DEL_REPOSITORIO/`. Las rutas de los assets son relativas, por lo que funcionan bajo el nombre del repositorio.

**Importante:** no elijas “Deploy from a branch” apuntando a la raíz ni a `/docs`: el sitio está en `dist` y este proyecto está preparado para publicarlo mediante Actions.

Con GitHub Free, Pages requiere un repositorio público. La disponibilidad para repositorios privados depende del plan. Revisá la [documentación de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site). El sitio publicado es accesible públicamente; esta entrega no activa Pages ni cambia la privacidad por vos.

## Estructura del repositorio

```text
.github/workflows/pages.yml  Publicación de dist en GitHub Pages
dist/                       Sitio completo, listo para servir
  index.html
  styles.css
  script.js
  assets/                   Ilustraciones y licencia de íconos
scripts/
  dev.mjs                   Servidor HTTP local
  check-layout.mjs          Verificación con Chrome
DESIGN-RESEARCH.md           Referencias y decisiones de diseño
package.json                Comandos y requisito de Node.js
.editorconfig               Formato y codificación UTF-8
.gitattributes              Finales de línea y archivos binarios
.gitignore                  Exclusiones del repositorio
```

`dist` no es una salida descartable de compilación: **contiene el código fuente y debe subirse a GitHub**.

## Verificación

```powershell
npm.cmd run check
npm.cmd run check:layout
```

La primera orden comprueba la sintaxis del JavaScript del sitio. La segunda requiere Chrome en su ubicación habitual de Windows; puede configurarse otra ubicación con `CHROME_PATH`.

Se comprueban ocho anchos entre 320 y 1920 px, desbordamientos y superposiciones entre bloques, los tres programas, navegación por teclado, menú, preguntas frecuentes, pausa, movimiento reducido, parallax y contenido sin JavaScript.

Las capturas y perfiles de prueba se guardan en **`.local-backup/qa/`**, excluida de Git; ya no ensucian la raíz. Se puede verificar un servidor activo definiendo `ARTO_PREVIEW_URL`.

Las pruebas bloquean las fuentes y la fotografía externas para revisar sus respaldos. No verifican la descarga de esos recursos. El workflow de publicación no ejecuta esta prueba de Chrome, que está preparada para el entorno local de Windows.

## Assets y alcance de la demo

Los dos PNG y las escenas SVG son composiciones ilustrativas de la demo, no documentación de clases. La fotografía del interior se conserva desde la [ficha de TripAdvisor de ARTO](https://www.tripadvisor.com.ar/Restaurant_Review-g312809-d17734645-Reviews-Arto_Cafeteria-Rosario_Province_of_Santa_Fe_Litoral.html), con respaldo si falla.

Lora y Manrope se solicitan a Google Fonts. TT Norms Pro es la primera opción de la pila CSS cuando está instalada; el repositorio no contiene archivos de esa fuente. Publicar en GitHub no modifica esta situación.

Los íconos funcionales son [Phosphor Regular](https://github.com/phosphor-icons/core); su licencia MIT se conserva en `dist/assets/PHOSPHOR-LICENSE.txt`. No se asignó una licencia abierta al conjunto del proyecto.

Las referencias y decisiones están en [DESIGN-RESEARCH.md](DESIGN-RESEARCH.md).

## Limpieza y recuperación

Las capturas históricas, perfiles temporales, logs, el paquete de entrega anterior y la copia antigua del arte se movieron a `.local-backup/cleanup-20261017-211526/`. No se borraron definitivamente.

La configuración de Sites se conserva localmente en `.openai`, fuera del versionado. No se necesita para GitHub Pages.
