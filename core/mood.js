'use strict';

/**
 * Calcula el ánimo del buddy a partir de los pendientes y la hora.
 *
 * Reglas:
 *   - de madrugada (00:00–06:00) => sleeping
 *   - 0 pendientes               => celebrating
 *   - 1–3 pendientes             => relaxed
 *   - 4+ pendientes (o urgentes) => alert
 *
 * @param {Array<{title:string, urgent?:boolean}>} pendings
 * @param {number} [hour] hora 0-23 (inyectable para tests)
 * @returns {'sleeping'|'celebrating'|'relaxed'|'alert'}
 */
function computeMood(pendings, hour) {
  const list = Array.isArray(pendings) ? pendings : [];
  const h = typeof hour === 'number' ? hour : new Date().getHours();

  if (h < 6) return 'sleeping';
  if (list.length === 0) return 'celebrating';

  const urgentCount = list.filter((p) => p && p.urgent).length;
  if (list.length >= 4 || urgentCount >= 1) return 'alert';
  return 'relaxed';
}

module.exports = { computeMood };
