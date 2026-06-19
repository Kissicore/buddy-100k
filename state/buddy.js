'use strict';

const fs = require('fs');
const path = require('path');

const { DIR, ensureDir } = require('./config');
const { getIdentity } = require('../core/identity');
const { pickBuddy } = require('../core/roster');

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
 */
function generate(identityOverride, nowIso) {
  const { identity, hash, rng } = getIdentity(identityOverride);
  const picked = pickBuddy(rng);
  return {
    ...picked,
    bornAt: nowIso || new Date().toISOString(),
    identityHash: hash,
  };
}

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

module.exports = { BUDDY_PATH, exists, load, save, generate, loadOrNull };
