# At. Pedro Muñoz C.F. · Web oficial

Web del **Atlético Pedro Muñoz C.F.** (Segunda Autonómica, Grupo 3, FFCM) y de su **equipo juvenil** (Juvenil Territorial, Grupo 3). Pensada sobre todo para el móvil, que es como la consulta la afición, y adaptada también al ordenador.

Se pueden ver los resultados, la clasificación, la plantilla con la ficha de cada jugador y las estadísticas de la temporada. La afición vota al MVP de cada partido, recibe avisos y hace pedidos a la tienda del club por WhatsApp. Todo se gestiona desde un panel de administración, sin tocar código.

<!-- Capturas: guarda las imágenes en docs/capturas/ y descomenta esta línea
<p align="center">
  <img src="docs/capturas/inicio.png" width="240" alt="Portada" />
  <img src="docs/capturas/jugador.png" width="240" alt="Ficha de jugador" />
  <img src="docs/capturas/partido.png" width="240" alt="Página de partido" />
</p>
-->

**Tecnologías:** React 19 · TypeScript · Vite · Tailwind CSS v4 · Supabase (Postgres, Auth, Storage y Edge Functions) · Vitest · Vercel

---

## Qué ofrece

### Para la afición
- **Portada** con el último resultado, el próximo partido, la votación del MVP abierta y las clasificaciones internas de goleadores y MVPs.
- **Primer equipo y juvenil** desde un selector en la portada, con la misma estructura (`/` y `/juvenil`).
- **Partidos**: calendario y resultados. Cada partido tiene su página con el marcador, la cronología (goles y cambios de los dos equipos), las alineaciones de ambos y el MVP votado.
- **Plantilla** en carrusel y **ficha de jugador** con foto, dorsal, posición y estadísticas: partidos, minutos, goles, asistencias y tarjetas. Los porteros muestran además porterías a cero y paradas.
- **Estadísticas** con clasificaciones por cada dato y **tabla de la liga**.
- **Votación del MVP**: el club abre y cierra cada votación, y se permite un voto por dispositivo.
- **Avisos (notificaciones push)**: con un botón en la portada, cada aficionado activa los avisos de su equipo y le llega una notificación cuando se abre la votación del MVP y cuando está el resultado final. En iPhone funcionan con la web añadida a la pantalla de inicio.
- **Tienda**: artículos con foto, precio y modelos. El botón «Pedir por WhatsApp» abre el chat del club con el artículo y el modelo ya escritos.
- **Pie de página** con las redes sociales y un mosaico con los logos de los patrocinadores.

### Para el club (panel `/admin`)
- **Importar actas de la FFCM**: se pega el texto del acta y la web saca las alineaciones, los minutos, los goles y los cambios de los dos equipos. También se puede editar todo a mano.
- **Fotos de jugadores**: se suben desde el panel y se recortan solas en el navegador, tanto la plantilla horizontal del club como una foto vertical.
- **Imagen del MVP para Instagram**: al cerrar la votación, el panel genera una imagen vertical (1080×1350) con la foto del ganador, sus votos y el resultado. Está dibujada con canvas y en el móvil se comparte directamente.
- Gestión de **jugadores** (dorsal, posición, asistencias, paradas y tarjetas), **clasificación**, **votaciones del MVP**, **tienda** y **patrocinadores** (logos subidos a Storage).
- **Varios administradores**: solo se pueden registrar los emails que otro administrador haya invitado.

---

## Decisiones técnicas

- **Las estadísticas se calculan, no se guardan.** Partidos, minutos, goles y porterías a cero salen de las alineaciones de cada acta (`src/data/build.ts`). Así nunca dejan de cuadrar con los partidos. Lo que no aparece en el acta (asistencias, paradas y tarjetas) se guarda a mano en cada jugador.
- **Lector de actas probado con actas reales.** `src/data/acta.ts` interpreta el texto copiado de la web de la FFCM. Los tests usan actas reales como fixtures y comparan los resultados con las estadísticas del propio club.
- **Seguridad con Row Level Security.** La lectura es pública y solo pueden escribir los emails de la tabla `admins` (función `is_admin()`). Los votos no se pueden leer desde el cliente: se emiten y se cuentan con funciones RPC `security definer`. Un trigger en `auth.users` impide registrarse a quien no esté invitado.
- **Funciona aunque falle el backend.** Lleva una copia local de los datos que se muestra al instante y se sustituye por la de Supabase cuando esta responde.
- **Avisos con Web Push y una función edge.** El panel llama a la función `avisos` de Supabase, que comprueba que quien llama es administrador, envía la notificación firmada con VAPID a las suscripciones del equipo y la apunta para no repetirla. Las suscripciones solo se escriben con funciones RPC y no se pueden leer desde la web.
- **El panel se carga aparte** (`React.lazy`): el público no descarga su código.
- **Imágenes optimizadas.** Los scripts con `sharp` recortan las fotos de los jugadores, quitan el fondo de los escudos y generan WebP. Las imágenes que se suben desde el panel se reducen en el navegador antes de enviarlas.
- **Diseño propio** en rojo, con Barlow Condensed y formas inclinadas, a partir de un mockup de ficha de jugador y de carrusel de plantilla.

---

## Estructura

```
src/
  pages/        Páginas públicas (Home, Matches, MatchPage, Squad, Player, Stats, Table, Shop)
  admin/        Panel de administración
  components/   Cabecera, barra inferior, tarjetas, escudos, iconos…
  data/         Tipos, cálculo de estadísticas, lector de actas, datos de respaldo y acceso a Supabase
  lib/          Cliente de Supabase y utilidades de imagen
supabase/
  migrations/   Esquema, políticas RLS, funciones y datos
scripts/        Procesado de fotos, escudos y tienda, y carga inicial (seed)
```

---

## Ejecutarlo en local

Hace falta Node 22 o superior y un proyecto de Supabase.

```bash
npm install
cp .env.example .env.local   # VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

Base de datos (con la [CLI de Supabase](https://supabase.com/docs/guides/cli)):

```bash
npx supabase link --project-ref <tu-proyecto>
npx supabase db push
```

Otros comandos:

```bash
npm test          # tests con Vitest
npm run build     # comprobación de tipos y build de producción
npm run lint      # oxlint
```

Para entrar al panel, añade tu email a la tabla `public.admins` y crea la cuenta desde `/admin`.

---

## Despliegue

Está preparada para Vercel. `vercel.json` redirige todas las rutas a la SPA. Hay que configurar las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` y añadir el dominio a la *Site URL* y a las *Redirect URLs* de Supabase Auth.

---

Datos de los partidos: actas oficiales de la Federación de Fútbol de Castilla-La Mancha y estadísticas del propio club. Escudos y fotos propiedad de sus respectivos clubes.
