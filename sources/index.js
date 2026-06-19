'use strict';

const todoFile = require('./todo-file');
const appleReminders = require('./apple-reminders');
const bento = require('./bento');

const ADAPTERS = {
  'todo-file': todoFile,
  'apple-reminders': appleReminders,
  bento,
};

/**
 * Corre todos los adaptadores activos (según config.sources), agrega y
 * deduplica los pendientes. Cada adaptador que falle aporta [] (nunca rompe).
 *
 * @param {object} config { sources:string[], todoPath?:string }
 * @returns {Promise<Array<{title,urgent,source}>>}
 */
async function collectPendings(config = {}) {
  const sources = Array.isArray(config.sources) && config.sources.length
    ? config.sources
    : ['apple-reminders', 'todo-file'];

  const results = await Promise.all(
    sources.map(async (key) => {
      const adapter = ADAPTERS[key];
      if (!adapter) return [];
      try {
        return (await adapter.fetchPendings(config)) || [];
      } catch (_) {
        return [];
      }
    })
  );

  const flat = results.flat();

  // Dedup por título (case-insensitive), conservando urgent=true si aparece.
  const byTitle = new Map();
  for (const item of flat) {
    if (!item || !item.title) continue;
    const k = item.title.toLowerCase();
    const prev = byTitle.get(k);
    if (prev) {
      prev.urgent = prev.urgent || item.urgent;
    } else {
      byTitle.set(k, { ...item });
    }
  }

  // Urgentes primero.
  return [...byTitle.values()].sort((a, b) => (b.urgent === a.urgent ? 0 : b.urgent ? 1 : -1));
}

module.exports = { collectPendings, ADAPTERS };
