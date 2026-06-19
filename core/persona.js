'use strict';

const { makeRng } = require('./identity');

/**
 * Personalidad + stats + estrellas + variante SHINY del buddy.
 * Todo determinista: se deriva del identityHash con una semilla desplazada,
 * así es estable e independiente de la elección de especie/rareza.
 */

const TRAITS = [
  'Sarcástico y agudo',
  'Dulce y motivador',
  'Caótico y creativo',
  'Sabio y tranquilo',
  'Travieso y juguetón',
  'Leal y trabajador',
  'Soñador y curioso',
  'Directo y sin filtro',
  'Optimista incurable',
  'Misterioso y observador',
  'Intenso y ambicioso',
  'Relajado y zen',
];

const STAT_LABELS = ['CREATIVIDAD', 'ENFOQUE', 'ENERGÍA', 'CAOS', 'CARISMA'];

const STARS_BY_RARITY = { comun: 2, raro: 3, epico: 4, legendario: 5 };

function starsFor(rarityKey) {
  const n = STARS_BY_RARITY[rarityKey] || 2;
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

/**
 * @param {object} buddy { identityHash?, name, rarity }
 * @returns {{ trait, shiny, stats:Array<{label,value}>, stars }}
 */
function buildPersona(buddy = {}) {
  // Si no hay identityHash (buddy muy viejo), derivar de su nombre.
  let seed = buddy.identityHash;
  if (typeof seed !== 'number') {
    seed = 0;
    const s = String(buddy.name || 'buddy');
    for (let i = 0; i < s.length; i++) seed = (seed * 31 + s.charCodeAt(i)) >>> 0;
  }
  const rng = makeRng((seed ^ 0x9e3779b9) >>> 0);

  const trait = TRAITS[Math.floor(rng() * TRAITS.length)];
  const shiny = rng() < 0.06; // ~1 de cada 17: coleccionable

  let stats = STAT_LABELS.map((label) => ({ label, value: 35 + Math.floor(rng() * 66) }));
  // Legendario y shiny vienen "subidos": al menos un stat al tope.
  if (buddy.rarity === 'legendario' || buddy.rarity === 'epico' || shiny) {
    const i = Math.floor(rng() * stats.length);
    stats[i] = { ...stats[i], value: Math.max(stats[i].value, 88 + Math.floor(rng() * 13)) };
  }

  return { trait, shiny, stats, stars: starsFor(buddy.rarity) };
}

module.exports = { buildPersona, starsFor, TRAITS, STAT_LABELS };
