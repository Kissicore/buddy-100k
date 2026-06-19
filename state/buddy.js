'use strict';

const fs = require('fs');
const path = require('path');

const { DIR, ensureDir } = require('./config');
const { getIdentity } = require('../core/identity');
const { pickBuddy, getSpecies, SPECIES } = require('../core/roster');

const BUDDY_PATH = path.join(DIR, 'buddy.json');

function exists() {
  return fs.existsSync(BUDDY_PATH);
}

function load() {
  try {
    const data = JSON.parse(fs.readFileSync(BUDDY_PATH, 'utf8'));
    if (data && data.species && data.name && data.rarity) return data;
    return null;
  } catch (_) {
    return null;
  }
}

function save(buddy) {
  ensureDir();
  fs.writeFileSync(BUDDY_PATH, JSON.stringify(buddy, null, 2));
  return buddy;
}

/**
 * Crea (eclosiona) un buddy determinista para la identidad actual.
 * No escribe a disco; eso lo decide el caller (para poder animar antes).
 *
 * @param {object} [opts]
 * @param {string} [opts.identity]  fuerza la identidad
 * @param {string|number} [opts.salt]  re-rollea otra criatura para la misma persona
 * @param {string} [opts.forceSpecies]  fija la especie (comando "pick")
 * @param {string} [opts.nowIso]
 */
function generate(opts = {}) {
  // Compat: si llaman generate("identidad") como antes.
  if (typeof opts === 'string') opts = { identity: opts };
  const { identity, hash, rng } = getIdentity(opts.identity, opts.salt);
  const picked = pickBuddy(rng);
  if (opts.forceSpecies && getSpecies(opts.forceSpecies)) {
    const sp = getSpecies(opts.forceSpecies);
    picked.species = sp.key;
    // re-elige un nombre acorde a la especie elegida
    picked.name = sp.names[Math.floor(rng() * sp.names.length)];
  }
  return {
    ...picked,
    bornAt: opts.nowIso || new Date().toISOString(),
    identityHash: hash,
    salt: opts.salt || null,
  };
}

/** Renombra el buddy guardado. */
function rename(newName) {
  const b = loadOrNull();
  if (!b) return null;
  b.name = String(newName).trim().slice(0, 24);
  return save(b);
}

const SPECIES_KEYS = SPECIES.map((s) => s.key);

/**
 * Devuelve el buddy existente o null. Si está corrupto, lo borra para re-eclosionar.
 */
function loadOrNull() {
  if (!exists()) return null;
  const b = load();
  if (!b) {
    try { fs.unlinkSync(BUDDY_PATH); } catch (_) {}
    return null;
  }
  return b;
}

module.exports = { BUDDY_PATH, exists, load, save, generate, loadOrNull, rename, SPECIES_KEYS };
