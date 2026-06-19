# Buddy 100K — Diseño

**Fecha:** 2026-06-19
**Autor:** Andrea Vega (FÓRMULA 100K) + Claude
**Estado:** Aprobado para implementación

## Resumen

Buddy 100K es un **plugin de Claude Code** que le da a cada persona una mascota virtual en su terminal (estilo tamagotchi). La mascota saluda al abrir Claude Code y se invoca con `/buddy`, le habla a la persona con sus **pendientes y recordatorios** del día, y nace de forma **determinista y única** por usuario (mismo usuario = misma criatura siempre).

Es un **regalo distribuible**: cualquiera lo instala y obtiene su mascota. La versión pública lee Apple Reminders + un `TODO.md`; la versión de Andrea añade Bento.

Se acompaña de un **artifact web** (página HTML) que explica cómo instalarlo, con una **animación de huevito que se rompe** 🥚💥, publicada en **domina-claude.vercel.app**.

## Objetivos

- Mascota viva en terminal, coherente con la marca (Gato Jefe morado como estrella).
- Hablar con pendientes reales (no inventados): Apple Reminders + TODO.md (todos) y Bento (Andrea).
- Único por persona vía hash determinista, con ~18 especies y rareza.
- Funcionar out-of-the-box, gratis y offline para quien lo reciba (sin API obligatoria).
- Distribuirse fácil + tener una página de instalación atractiva con animación de eclosión.

## No-objetivos (YAGNI)

- No gamificación pesada (XP, tienda, evolución multi-etapa) en v1.
- No requiere API de Claude/tokens para funcionar (modo LLM = opcional futuro).
- No sincroniza estado entre máquinas ni nube.
- No es multi-mascota por usuario (una criatura por cuenta).

## Experiencia de usuario

1. **Instalación** (ver §Distribución). Tras instalar, al abrir Claude Code:
2. **Eclosión (primera vez):** no existe `buddy.json` → animación de huevito que se rompe en la terminal → nace la criatura generada desde la identidad → se guarda el estado.
3. **Saludo automático:** en cada `SessionStart`, el buddy aparece con su cara según ánimo + resumen de pendientes de hoy (respeta `mute`).
4. **A demanda:** comandos
   - `/buddy` — muestra la mascota + pendientes del día.
   - `/buddy card` — ficha completa: especie, rareza, nombre, stats, sprite ASCII grande.
   - `/buddy pet` — interacción cariñosa (frase + animación corta).
   - `/buddy mute` / `/buddy unmute` — silencia/activa el saludo automático.

## Arquitectura

Motor en **Node.js** (cross-platform, sin dependencias pesadas; idealmente cero deps externas usando `crypto` nativo y `child_process` para AppleScript).

```
buddy-100k/
├── bin/
│   └── buddy.js              # CLI entrypoint: parsea args (card|pet|mute|unmute|<default>)
├── core/
│   ├── identity.js          # email/cuenta → semilla determinista (FNV-1a / crypto)
│   ├── roster.js            # ~18 especies + arte ASCII (varias caras) + tiers de rareza
│   ├── hatch.js             # animación de eclosión en terminal (frames ASCII)
│   ├── mood.js              # calcula ánimo desde nº/urgencia de pendientes + hora
│   ├── voice.js             # arma el mensaje con plantillas + personalidad
│   └── render.js            # pinta ASCII + colores ANSI + mensaje
├── sources/
│   ├── index.js             # carga adaptadores según config; agrega y normaliza items
│   ├── apple-reminders.js   # AppleScript vía osascript (solo macOS)
│   ├── todo-file.js         # parsea TODO.md (líneas "- [ ] ..."), cross-platform
│   └── bento.js             # add-on de Andrea: consulta pendientes SMMA-BENTO
├── state/                   # lógica de ~/.buddy-100k/
│   ├── config.js            # lee/escribe config.json (mute, sources, identity)
│   └── buddy.js             # lee/escribe buddy.json (especie, rareza, nombre, nacimiento)
├── plugin/                  # envoltura Claude Code
│   ├── .claude-plugin/      # manifest del plugin
│   ├── commands/            # /buddy, /buddy card, /buddy pet, /buddy mute|unmute
│   └── hooks/               # SessionStart → ejecuta buddy.js (respeta mute)
├── package.json
└── README.md
```

Estado en disco: `~/.buddy-100k/`
- `buddy.json` — `{ species, rarity, name, bornAt, identityHash }` (creado en eclosión, inmutable).
- `config.json` — `{ muted: bool, sources: ["apple-reminders","todo-file"], todoPath, llm: false }`.

### Identidad determinista
- Semilla = hash (FNV-1a o `crypto.createHash`) del identificador del usuario (email de la cuenta de Claude; fallback: nombre de usuario del SO + hostname).
- De la semilla se derivan: índice de especie, tier de rareza (con pesos: común 60% / raro 25% / épico 12% / legendario 3%), nombre (de listas por especie) y paleta.
- Mismo input → mismo buddy, siempre. Reproduce el "feel" del artículo.

### Roster
- **Gato Jefe (morado #8B6FE8) = estrella**, más ~17 especies (búho, dragoncito, zorro, pingüino, etc.).
- Cada especie: set de caras ASCII por ánimo → `relaxed`, `alert`, `celebrating`, `sleeping`.
- Rareza modifica color/adornos (p.ej. legendario con brillos ✨).

### Fuentes de pendientes (adaptadores)
- Interfaz común: cada adaptador devuelve `[{ title, due, urgent }]`.
- `apple-reminders.js`: `osascript` que lee recordatorios con vencimiento hoy/atrasados. Si no es macOS o falla → devuelve `[]` silenciosamente.
- `todo-file.js`: lee `TODO.md` (por defecto en `~/TODO.md` o cwd), líneas `- [ ]` pendientes, `- [x]` hechas.
- `bento.js` (add-on Andrea): consulta pendientes de SMMA-BENTO. Solo se activa si está en `config.sources`. No se incluye en el paquete público por defecto.
- `sources/index.js`: corre los adaptadores activos, agrega y deduplica.

### Mood → Voice → Render
- `mood.js`: `celebrating` si 0 pendientes; `relaxed` si 1–3; `alert` si 4+; `sleeping` si es de madrugada.
- `voice.js`: plantillas por mood con variables (nº pendientes, primer pendiente). Tono Gato Jefe ("jefa", emojis felinos). **Local, sin tokens.** Modo LLM opcional desactivado por defecto.
- `render.js`: compone sprite + nombre + mensaje + lista corta de pendientes con colores ANSI.

## Integración con Claude Code (plugin)
- **Comandos**: archivos en `plugin/commands/` que ejecutan `node bin/buddy.js [sub]` y muestran su salida.
- **Hook SessionStart**: corre el saludo si `!muted`. Output breve para no estorbar.
- **mute/unmute**: escriben `config.muted`.

## Artifact web de instalación (domina-claude)

- Página **`buddy-100k.html`** nueva en `/Users/kissita/Documents/FORMULA100K/LANZAMIENTOS/domina-claude/`.
- Mismo stack que el sitio: HTML + React + Tailwind + Babel **por CDN, con `@babel/standalone@7.24.7` (versión fijada)** para evitar artifact en blanco. Verificar render real, no solo HTTP 200.
- Contenido:
  - **Hero con animación de huevito que se rompe** 🥚→grietas→💥→sale el Gato Buddy (CSS/JS, loop o al hacer click).
  - Pasos de instalación claros (copiar comando), requisitos (Claude Code), qué hace, comandos `/buddy …`.
  - Estética coherente con la serie "Domina Claude" (acento morado para amarrar con Gato Jefe).
  - CTA a IG @andreaestratega y a más regalos.
- **Enlace desde `index.html`**: añadir tarjeta/bloque "🐱 Buddy 100K — tu mascota en la terminal" que lleve a `buddy-100k.html` (estilo BONUS, como el de migrar).
- **Deploy**: `vercel --prod` desde la carpeta del proyecto (proyecto `domina-claude` ya linkeado en `.vercel/`).

## Distribución del plugin
- Repo en `~/Documents/FORMULA100K/BUDDY-100K/` (git).
- Instalación: comando único documentado en el artifact (clonar/instalar como plugin de Claude Code). Detalle exacto del mecanismo de plugin se fija en el plan de implementación.
- Cross-platform: en no-Mac, Apple Reminders se desactiva solo y queda TODO.md.

## Manejo de errores
- Cualquier fuente que falle → `[]`, nunca rompe el saludo.
- Sin identidad disponible → fallback usuario+host; nunca crashea.
- Terminal sin soporte de color/ANSI → degradar a texto plano.
- `buddy.json` corrupto → re-eclosionar avisando.

## Testing
- Unit (Node test runner nativo): `identity` (determinismo: mismo input→mismo output), `roster` (índices válidos, todas las especies tienen las 4 caras), `mood` (umbrales), `voice` (no rompe con 0 items), `todo-file` (parseo). 
- `apple-reminders`/`bento`: test con mocks de la capa de ejecución.
- Smoke manual: instalar, abrir Claude Code, ver eclosión + saludo; `/buddy card/pet/mute/unmute`.
- Artifact: abrir `buddy-100k.html` en navegador y confirmar que la animación del huevito corre y la página no sale en blanco.

## Fases de entrega
1. Motor core (identity, roster, mood, voice, render) + estado + eclosión + `todo-file`.
2. `apple-reminders` + envoltura plugin (comandos + hook) + `bento` (add-on Andrea).
3. Artifact `buddy-100k.html` con animación de huevito + tarjeta en index + deploy a Vercel.

## Decisiones tomadas
- Forma: `/buddy` + saludo automático (ambos).
- Datos: público = Apple Reminders + TODO.md; Andrea += Bento.
- Mascota: Gato Jefe estrella + ~18 especies con rareza, determinista por usuario.
- Voz: plantillas locales (sin tokens); LLM opcional futuro.
- Lenguaje: Node.js. Nombre: **Buddy 100K**.
- Artifact en domina-claude con animación de huevito; deploy `vercel --prod`.
