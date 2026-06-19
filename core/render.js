'use strict';

const { getSpecies, getRarity } = require('./roster');
const { buildPersona } = require('./persona');

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

const RARITY_LABEL = {
  comun: 'COMÚN',
  raro: 'RARO',
  epico: 'ÉPICO',
  legendario: 'LEGENDARIO',
};

// Barra de progreso de un stat (0–100) con bloques.
function statBar(value, opts = {}, color) {
  const width = 10;
  const filled = Math.max(0, Math.min(width, Math.round((value / 100) * width)));
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
  return colorize(bar, color, opts);
}

// Línea de cabecera con estrellas + rareza + (SHINY).
function headerLine(buddy, persona, opts) {
  const rarity = getRarity(buddy.rarity);
  const rc = rarity.color || 'yellow';
  let head = colorize(`${persona.stars} ${RARITY_LABEL[buddy.rarity] || ''}`.trim(), rc, opts);
  if (persona.shiny) head += '   ' + colorize('✨ SHINY ✨', 'yellow', opts);
  return head;
}

/**
 * Vista principal: cabecera + sprite + nombre + personalidad + mensaje + pendientes.
 */
function renderBuddy({ buddy, mood, message, pendings = [] }, opts = {}) {
  const species = getSpecies(buddy.species);
  const rarity = getRarity(buddy.rarity);
  const color = rarity.color || species.color;
  const persona = buildPersona(buddy);

  const lines = [];
  lines.push('  ' + headerLine(buddy, persona, opts) + colorize('   ' + species.label.toUpperCase(), 'dim', opts));
  lines.push('');
  lines.push(renderSprite(buddy, mood, opts));
  lines.push('');
  lines.push('  ' + colorize(buddy.name, color, opts) + (species.star ? ' ⭐' : ''));
  lines.push('  ' + colorize(`"${persona.trait}"`, 'dim', opts));
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
 * Ficha completa (/buddy card) — al estilo "trading card".
 */
function renderCard({ buddy, mood, message, pendings = [] }, opts = {}) {
  const species = getSpecies(buddy.species);
  const rarity = getRarity(buddy.rarity);
  const color = rarity.color || species.color;
  const persona = buildPersona(buddy);
  const born = buddy.bornAt ? new Date(buddy.bornAt).toLocaleDateString() : '—';

  const W = 34;
  const top = '╭' + '─'.repeat(W) + '╮';
  const bot = '╰' + '─'.repeat(W) + '╯';

  const lines = [];
  lines.push(colorize(top, color, opts));
  lines.push('  ' + headerLine(buddy, persona, opts));
  lines.push('  ' + colorize(species.label.toUpperCase() + (species.star ? ' ⭐' : ''), 'dim', opts));
  lines.push('');
  lines.push(renderSprite(buddy, mood, opts));
  lines.push('');
  lines.push('  ' + colorize(buddy.name, color, opts));
  lines.push('  ' + colorize(`"${persona.trait}"`, 'dim', opts));
  lines.push('');
  for (const s of persona.stats) {
    const label = (s.label + ' ').padEnd(12, ' ');
    lines.push(`  ${label}${statBar(s.value, opts, color)} ${String(s.value).padStart(3)}`);
  }
  lines.push('');
  lines.push('  ' + colorize(`Nació ${born} · ${pendings.length} pendiente${pendings.length === 1 ? '' : 's'} hoy`, 'dim', opts));
  lines.push(colorize(bot, color, opts));
  if (message) {
    lines.push('');
    lines.push(message);
  }
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
