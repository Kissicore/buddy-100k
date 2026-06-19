'use strict';

const { getSpecies, getRarity } = require('./roster');

const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function supportsColor() {
  if (process.env.NO_COLOR) return false;
  if (process.env.FORCE_COLOR) return true;
  return Boolean(process.stdout && process.stdout.isTTY);
}

function colorize(text, color, { color: useColor = supportsColor() } = {}) {
  if (!useColor || !color || !ANSI[color]) return text;
  return ANSI[color] + text + ANSI.reset;
}

/**
 * Pinta el sprite de una especie en un ánimo dado, ya coloreado.
 */
function renderSprite(buddy, mood, opts = {}) {
  const species = getSpecies(buddy.species);
  const rarity = getRarity(buddy.rarity);
  const color = rarity.color || species.color;
  const faces = species.faces[mood] || species.faces.relaxed;
  return faces.map((line) => colorize(line, color, opts)).join('\n');
}

const RARITY_BADGE = {
  comun: '',
  raro: '· raro',
  epico: '✦ épico',
  legendario: '✨ LEGENDARIO',
};

/**
 * Vista principal: sprite + nombre + mensaje + lista corta de pendientes.
 */
function renderBuddy({ buddy, mood, message, pendings = [] }, opts = {}) {
  const species = getSpecies(buddy.species);
  const rarity = getRarity(buddy.rarity);
  const color = rarity.color || species.color;

  const lines = [];
  lines.push(renderSprite(buddy, mood, opts));
  lines.push('');

  const badge = RARITY_BADGE[buddy.rarity] ? '  ' + colorize(RARITY_BADGE[buddy.rarity], rarity.color || 'yellow', opts) : '';
  lines.push(colorize(buddy.name, color, { ...opts, color: opts.color }) + badge + colorize(' — ' + species.label, 'dim', opts));
  lines.push('');
  lines.push(message);

  if (pendings.length) {
    lines.push('');
    const show = pendings.slice(0, 5);
    for (const p of show) {
      const mark = p.urgent ? colorize('‼', 'red', opts) : '•';
      lines.push(`  ${mark} ${p.title}`);
    }
    if (pendings.length > show.length) {
      lines.push(colorize(`  …y ${pendings.length - show.length} más`, 'dim', opts));
    }
  }

  return lines.join('\n');
}

/**
 * Ficha completa (/buddy card).
 */
function renderCard({ buddy, mood, message, pendings = [], identity }, opts = {}) {
  const species = getSpecies(buddy.species);
  const rarity = getRarity(buddy.rarity);
  const born = buddy.bornAt ? new Date(buddy.bornAt).toLocaleDateString() : '—';

  const lines = [];
  lines.push(colorize('╭─ BUDDY 100K ─────────────╮', 'magenta', opts));
  lines.push(renderSprite(buddy, mood, opts));
  lines.push('');
  lines.push(`  Nombre:  ${colorize(buddy.name, species.color, opts)}`);
  lines.push(`  Especie: ${species.label}${species.star ? ' ⭐' : ''}`);
  lines.push(`  Rareza:  ${rarity.label} ${rarity.ornament}`);
  lines.push(`  Ánimo:   ${mood}`);
  lines.push(`  Nació:   ${born}`);
  lines.push(`  Pendientes hoy: ${pendings.length}`);
  lines.push(colorize('╰──────────────────────────╯', 'magenta', opts));
  lines.push('');
  lines.push(message);
  return lines.join('\n');
}

module.exports = {
  ANSI,
  supportsColor,
  colorize,
  renderSprite,
  renderBuddy,
  renderCard,
};
