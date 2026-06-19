'use strict';

const { colorize, renderSprite, supportsColor } = require('./render');
const { getSpecies } = require('./roster');

const EGG_FRAMES = [
  ['    ____', '   /    \\', '  |      |', '  |      |', '   \\____/'],
  ['    ____', '   /    \\', '  |  ~   |', '  |      |', '   \\____/'],
  ['    _∕\\_', '   /    \\', '  | ~ ~  |', '  |   ~  |', '   \\____/'],
  ['    _∕\\_', '   /\\  ╱ \\', '  |~╲ ~╱ |', '  | ~╲╱~ |', '   \\____/'],
  ['   .∕\\╱.', '   /╲  ╱\\', '  |_╲~╱_~|', '  |~ ╳ ~|', '   \\_╱╲_/'],
  ['  💥 ✦ 💥', '   crack!', '   ╲ | ╱', '  ── 🐣 ──', '   ╱ | ╲'],
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Mueve el cursor arriba N líneas para repintar el frame en sitio.
function up(n) {
  return `\x1b[${n}A`;
}

/**
 * Animación de eclosión: el huevito se agrieta y nace el buddy.
 * En terminales sin TTY hace una versión estática (sin parpadeo).
 *
 * @param {object} buddy { species, name, rarity }
 * @param {object} [opts] { animate?:bool, out?:stream, delay?:number }
 */
async function hatch(buddy, opts = {}) {
  const out = opts.out || process.stdout;
  const animate = opts.animate !== undefined ? opts.animate : supportsColor();
  const delay = opts.delay || 280;
  const species = getSpecies(buddy.species);

  out.write('\n  Naciendo tu Buddy 100K...\n\n');

  if (!animate) {
    // Versión estática para logs / no-TTY
    out.write(EGG_FRAMES[EGG_FRAMES.length - 1].join('\n') + '\n\n');
  } else {
    let prevLines = 0;
    for (const frame of EGG_FRAMES) {
      if (prevLines) out.write(up(prevLines));
      const text = frame.map((l) => colorize(l, 'magenta', opts)).join('\n');
      out.write(text + '\n');
      prevLines = frame.length;
      // eslint-disable-next-line no-await-in-loop
      await sleep(delay);
    }
    out.write('\n');
  }

  out.write('\n' + renderSprite(buddy, 'celebrating', opts) + '\n\n');
  out.write(
    '  ¡' + colorize(buddy.name, species.color, opts) + ' ha nacido! 🎉\n' +
    '  Es tu ' + species.label + (species.star ? ' ⭐' : '') + ', único para ti.\n\n'
  );
}

module.exports = { hatch, EGG_FRAMES };
