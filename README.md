# 🐱 Buddy 100K

Tu **mascota de terminal** que te habla con tus pendientes del día. Nace **única para ti**, te saluda al abrir Claude Code y te ayuda a arrancar el día. Un regalo de **FÓRMULA 100K**.

> Inspirado en la idea de una mascota viva en la terminal — pero **de verdad** y conectada a tus tareas reales.

## ✨ Qué hace

- **Nace contigo (eclosión 🥚→🐣):** la primera vez que la invocas, un huevito se rompe y nace tu criatura. Es determinista: tu cuenta siempre genera la misma mascota.
- **18 especies + rareza:** Gato Jefe (la estrella morada ⭐), búho, dragoncito, zorro, pingüino y más. Cada una puede salir Común, Rara, Épica o ✨ Legendaria.
- **Te habla con tus pendientes:** lee tus recordatorios y te dice qué tienes hoy, con ánimo según tu carga (relajado, alerta, ¡a celebrar! o dormido de madrugada).
- **Te saluda al abrir Claude Code** y también lo invocas cuando quieras con `/buddy`.

## 📥 Instalación

Dentro de **Claude Code**:

```
/plugin marketplace add Kissicore/buddy-100k
/plugin install buddy-100k@buddy-100k
```

(O con la ruta local: `/plugin marketplace add /ruta/a/BUDDY-100K`)

Reinicia Claude Code y tu buddy nacerá al abrir. 🎉

> Requiere Node.js 18+ (ya lo tienes si usas Claude Code).

## 🎮 Comandos

| Comando | Qué hace |
|---|---|
| `/buddy` | Muestra tu mascota + pendientes de hoy |
| `/buddy card` | Ficha completa: especie, rareza, nombre, stats |
| `/buddy pet` | Acaricia a tu buddy 🐾 |
| `/buddy mute` | Silencia el saludo automático al abrir |
| `/buddy unmute` | Reactiva el saludo |

## 📋 De dónde saca tus pendientes

Por defecto, **sin configurar nada**:

1. **Apple Reminders** (macOS) — tus recordatorios con vencimiento hoy o atrasados.
2. **`TODO.md`** — un archivo simple en tu carpeta o en tu home. Formato:
   ```markdown
   - [ ] Grabar mi reel
   - [ ] Editar el VSL !          ← el "!" o "(urgente)" lo marca urgente
   - [x] Esto ya está hecho       ← ignorado
   ```

Cross-platform: en Windows/Linux simplemente usa `TODO.md`.

## ⚙️ Configuración

Vive en `~/.buddy-100k/`:
- `buddy.json` — tu mascota (no la edites, es tu identidad).
- `config.json` — fuentes activas, silencio, ruta de TODO.

### Add-on Bento (solo Andrea)
Para enganchar pendientes de SMMA-BENTO, añade `"bento"` a `sources` en `config.json` y define:
```bash
export BENTO_API_URL="https://.../pendings"
export BENTO_API_KEY="tu-token"
```

## 🧪 Desarrollo

```bash
npm test          # tests nativos de Node
node bin/buddy.js # corre el buddy a mano
```

Variables útiles: `BUDDY_HOME` (carpeta de estado), `BUDDY_IDENTITY` (forzar identidad), `FORCE_COLOR=1`, `BUDDY_DEBUG=1`.

---

Hecho con 💜 por [Andrea Vega — FÓRMULA 100K](https://www.instagram.com/andreaestratega/)
