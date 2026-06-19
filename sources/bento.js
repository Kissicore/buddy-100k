'use strict';

/**
 * Add-on de Andrea: pendientes desde SMMA-BENTO.
 *
 * NO viene activo en la versión pública. Se activa añadiendo "bento" a
 * config.sources y configurando las variables de entorno:
 *   BENTO_API_URL  -> endpoint que devuelve pendientes (JSON array o {pendings:[...]})
 *   BENTO_API_KEY  -> Bearer token (BENTO MCP / API)
 *
 * Si faltan las variables o falla la red, devuelve [] sin romper el saludo.
 * Usa fetch nativo (Node 18+).
 */

function normalize(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((it) => {
      if (typeof it === 'string') return { title: it, urgent: false, source: 'bento' };
      const title = it.title || it.titulo || it.name || it.descripcion || it.task;
      if (!title) return null;
      const urgent = Boolean(it.urgent || it.urgente || it.priority === 'alta' || it.prioridad === 'alta');
      return { title: String(title), urgent, source: 'bento' };
    })
    .filter(Boolean);
}

async function fetchPendings() {
  const url = process.env.BENTO_API_URL;
  const key = process.env.BENTO_API_KEY;
  if (!url || !key || typeof fetch !== 'function') return [];

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!res.ok) return [];
    const data = await res.json();
    const items = Array.isArray(data) ? data : data.pendings || data.pendientes || data.items || [];
    return normalize(items);
  } catch (_) {
    return [];
  }
}

module.exports = { fetchPendings, normalize };
