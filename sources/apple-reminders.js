'use strict';

const { execFile } = require('child_process');

/**
 * Lee recordatorios de la app Recordatorios de macOS vía osascript (AppleScript).
 * Devuelve los NO completados con vencimiento hoy o atrasados.
 *
 * Solo funciona en macOS. En cualquier otro SO, o si falla / no hay permisos,
 * devuelve [] sin romper.
 */

const SCRIPT = `
set output to ""
set today to current date
set hour of today to 23
set minute of today to 59
set second of today to 59
tell application "Reminders"
  repeat with l in lists
    repeat with r in (reminders in l whose completed is false)
      try
        set dd to due date of r
        if dd is not missing value and dd ≤ today then
          set output to output & (name of r) & "\t" & "1" & "\n"
        end if
      end try
    end repeat
  end repeat
end tell
return output
`;

function isMac() {
  return process.platform === 'darwin';
}

function runOsascript() {
  return new Promise((resolve) => {
    execFile('osascript', ['-e', SCRIPT], { timeout: 8000 }, (err, stdout) => {
      if (err) return resolve('');
      resolve(stdout || '');
    });
  });
}

function parse(raw) {
  const out = [];
  for (const line of String(raw).split('\n')) {
    if (!line.trim()) continue;
    const [title] = line.split('\t');
    if (title && title.trim()) {
      out.push({ title: title.trim(), urgent: true, source: 'reminders' });
    }
  }
  return out;
}

async function fetchPendings() {
  if (!isMac()) return [];
  try {
    const raw = await runOsascript();
    return parse(raw);
  } catch (_) {
    return [];
  }
}

module.exports = { fetchPendings, parse, isMac };
