'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * Lee pendientes de un archivo TODO.md (estilo Markdown checkbox).
 *   - [ ] tarea pendiente      -> pendiente
 *   - [ ] tarea !urgente       -> pendiente urgente (marca "!" o "(urgente)")
 *   - [x] tarea hecha          -> ignorada
 *
 * Cross-platform. Si no encuentra archivo, devuelve [].
 */

function candidatePaths(configuredPath) {
  if (configuredPath) return [configuredPath];
  return [
    path.join(process.cwd(), 'TODO.md'),
    path.join(os.homedir(), 'TODO.md'),
    path.join(os.homedir(), 'todo.md'),
  ];
}

function parse(content) {
  const out = [];
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^\s*[-*]\s*\[( |x|X)\]\s+(.+?)\s*$/);
    if (!m) continue;
    if (m[1].toLowerCase() === 'x') continue; // hecha
    let title = m[2];
    const urgent = /(^|\s)!|\(urgente\)|⚡/i.test(title);
    title = title.replace(/\(urgente\)/i, '').replace(/\s+!\s*$/, '').trim();
    out.push({ title, urgent, source: 'todo' });
  }
  return out;
}

async function fetchPendings(config = {}) {
  for (const p of candidatePaths(config.todoPath)) {
    try {
      if (fs.existsSync(p)) {
        return parse(fs.readFileSync(p, 'utf8'));
      }
    } catch (_) {
      /* sigue probando */
    }
  }
  return [];
}

module.exports = { fetchPendings, parse, candidatePaths };
