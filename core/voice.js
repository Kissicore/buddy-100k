'use strict';

/**
 * La "voz" del buddy: arma el mensaje con plantillas locales (sin tokens, sin API).
 * Tono cálido y juguetón, marca FÓRMULA 100K.
 */

const LINES = {
  celebrating: [
    'No tienes pendientes para hoy. ¡A celebrar! 🎉',
    '¡Bandeja limpia! Eres imparable hoy. ✨',
    'Cero pendientes. Aprovecha y respira (o crea algo nuevo). 💜',
  ],
  relaxed: [
    'Tienes {n} para hoy. Tranqui, vamos por el primero: "{first}".',
    '{n} en la lista. Empieza por "{first}" y lo demás cae solito. 😺',
    'Día ligero: {n} pendiente{s}. "{first}" primero, ¿va?',
  ],
  alert: [
    '¡Manos a la obra! Tienes {n} para hoy. Arranca con "{first}". 💪',
    '{n} pendiente{s} esperando. Sin pánico: uno a la vez, partiendo de "{first}".',
    'Día cargado: {n}. Hazme caso, empieza por "{first}" y vamos tachando. 🔥',
  ],
  sleeping: [
    'Es de madrugada... yo durmiendo, pero te dejé {n} pendiente{s} para mañana. 😴',
    'Zzz... hay {n} en la lista. Descansa, mañana los cazamos. 🌙',
  ],
};

const PET_LINES = [
  '*ronronea* 💜 gracias, lo necesitaba.',
  '¡Otra vez! Me encanta. 😸',
  '*se estira feliz* listo, ahora a producir.',
  'Eres mi humano favorito. 🐾',
  '*amasa la pantalla* mrrp 🐾',
  '😽 me derrito. Ya, ya, sigamos trabajando.',
];

// Mensajes espontáneos que el buddy suelta mientras trabajas (hook).
const CHATTER = {
  any: [
    '¿Una pausita para agua? 💧 yo te cuido el puesto.',
    '*persiguiendo el cursor* 🐾',
    'Vas bien. Lo estás haciendo mejor de lo que crees. 💜',
    'Recuerda guardar/commitear de vez en cuando. 😺',
    '*bosteza* sigue, sigue, te miro orgulloso.',
    'Pst… respira hondo. Un paso a la vez. 🌿',
  ],
  alert: [
    '¡Ey! Aún tienes {n} en la lista. No te distraigas mucho. 👀',
    'Quedan {n} pendientes… ¿atacamos "{first}" ya? 🔥',
    'Te recuerdo con cariño: {n} cosas para hoy. 😼',
  ],
  relaxed: [
    'Día tranqui ({n} pendiente{s}). Aprovecha el momentum. ✨',
    '"{first}" sigue ahí esperándote, sin prisa pero sin pausa. 🐾',
  ],
  celebrating: [
    'Sin pendientes y aquí seguimos creando. ¡Eres una máquina! 🎉',
    'Todo al día. Brilla, que para eso naciste. ✨',
  ],
};

function pick(arr, rng) {
  const r = typeof rng === 'function' ? rng() : Math.random();
  return arr[Math.floor(r * arr.length) % arr.length];
}

/**
 * @param {object} opts
 * @param {string} opts.mood
 * @param {Array<{title:string}>} opts.pendings
 * @param {object} [opts.buddy] { name }
 * @param {function} [opts.rng] selector determinista opcional (para tests)
 */
function speak({ mood, pendings = [], buddy = {}, rng } = {}) {
  const bank = LINES[mood] || LINES.relaxed;
  const n = pendings.length;
  const first = n > 0 ? pendings[0].title : '';
  const s = n === 1 ? '' : 's';

  return pick(bank, rng)
    .replace(/\{n\}/g, String(n))
    .replace(/\{s\}/g, s)
    .replace(/\{first\}/g, first);
}

function petLine(rng) {
  return pick(PET_LINES, rng);
}

/**
 * Frase espontánea para el modo interactivo (hook). Mezcla genéricas + por ánimo.
 */
function chatterLine({ mood, pendings = [], rng } = {}) {
  const n = pendings.length;
  const first = n > 0 ? pendings[0].title : '';
  const s = n === 1 ? '' : 's';
  const moodBank = CHATTER[mood] || [];
  const bank = moodBank.concat(CHATTER.any);
  return pick(bank, rng)
    .replace(/\{n\}/g, String(n))
    .replace(/\{s\}/g, s)
    .replace(/\{first\}/g, first);
}

module.exports = { speak, petLine, chatterLine, LINES, PET_LINES, CHATTER };
