'use strict';

const os = require('os');

/**
 * FNV-1a 32-bit hash — determinista, sin dependencias.
 * Mismo string de entrada => mismo número, siempre.
 */
function fnv1a(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    // multiplicación FNV con desbordamiento a 32 bits
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0; // a entero sin signo de 32 bits
}

/**
 * Genera una secuencia determinista de números a partir de una semilla.
 * Mulberry32: PRNG diminuto y reproducible.
 */
function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Determina el identificador estable del usuario.
 * Preferencia: variable de entorno explícita (la pone el plugin con el email
 * de la cuenta de Claude) -> usuario del SO + hostname (fallback universal).
 */
function resolveIdentity() {
  const explicit =
    process.env.BUDDY_IDENTITY ||
    process.env.CLAUDE_USER_EMAIL ||
    process.env.CLAUDE_ACCOUNT_EMAIL;
  if (explicit && explicit.trim()) return explicit.trim().toLowerCase();

  let userInfoName = 'user';
  try {
    userInfoName = os.userInfo().username || 'user';
  } catch (_) {
    /* algunos entornos sin passwd entry */
  }
  return `${userInfoName}@${os.hostname()}`.toLowerCase();
}

/**
 * Devuelve { identity, hash, rng } para alimentar la generación del buddy.
 */
function getIdentity(override) {
  const identity = (override && String(override)) || resolveIdentity();
  const hash = fnv1a(identity);
  return { identity, hash, rng: makeRng(hash) };
}

module.exports = { fnv1a, makeRng, resolveIdentity, getIdentity };
