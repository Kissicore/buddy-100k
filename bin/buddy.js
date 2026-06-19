#!/usr/bin/env node
'use strict';

const { readConfig, setMuted, getLastChatterAt, setLastChatterAt } = require('../state/config');
const buddyState = require('../state/buddy');
const { collectPendings } = require('../sources');
const { computeMood } = require('../core/mood');
const { speak, petLine, chatterLine } = require('../core/voice');
const { renderBuddy, renderCard, colorize } = require('../core/render');
const { hatch } = require('../core/hatch');
const { getSpecies } = require('../core/roster');

const CHATTER_COOLDOWN_MS = 20 * 60 * 1000; // 20 min entre mensajes espontáneos
const CHATTER_PROBABILITY = 0.4; // y aun así, no siempre

async function ensureBuddy({ animate } = {}) {
  let buddy = buddyState.loadOrNull();
  if (buddy) return { buddy, hatched: false };
  // Primera vez: eclosionar.
  buddy = buddyState.generate();
  await hatch(buddy, { animate });
  buddyState.save(buddy);
  return { buddy, hatched: true };
}

async function gather(config) {
  const pendings = await collectPendings(config);
  const mood = computeMood(pendings);
  return { pendings, mood };
}

async function cmdGreet({ fromHook = false } = {}) {
  const config = readConfig();
  if (fromHook && config.muted) return; // saludo silenciado

  const { buddy, hatched } = await ensureBuddy({ animate: !fromHook });
  // Si acaba de nacer y es por el hook, no abrumes: el hatch ya saludó.
  if (hatched && fromHook) return;

  const { pendings, mood } = await gather(config);
  const message = speak({ mood, pendings, buddy });
  process.stdout.write('\n' + renderBuddy({ buddy, mood, message, pendings }) + '\n\n');
}

async function cmdCard() {
  const config = readConfig();
  const { buddy } = await ensureBuddy({ animate: true });
  const { pendings, mood } = await gather(config);
  const message = speak({ mood, pendings, buddy });
  process.stdout.write('\n' + renderCard({ buddy, mood, message, pendings }) + '\n\n');
}

async function cmdPet() {
  const { buddy } = await ensureBuddy({ animate: true });
  const config = readConfig();
  const { pendings, mood } = await gather(config);
  const sprite = renderBuddy({ buddy, mood: 'celebrating', message: petLine(), pendings: [] });
  process.stdout.write('\n' + sprite + '\n\n');
}

// Mensaje espontáneo del buddy (lo dispara el hook Stop). Discreto: respeta
// mute, un cooldown y una probabilidad para no ser pesado.
async function cmdChatter() {
  const config = readConfig();
  if (config.muted) return;

  const buddy = buddyState.loadOrNull();
  if (!buddy) return; // que no eclosione desde un hook silencioso

  const now = Date.now();
  if (now - getLastChatterAt() < CHATTER_COOLDOWN_MS) return;
  if (Math.random() > CHATTER_PROBABILITY) return;

  const { pendings, mood } = await gather(config);
  const line = chatterLine({ mood, pendings });
  setLastChatterAt(now);
  process.stdout.write('\n  ' + colorize(`🐱 ${buddy.name}:`, 'magenta') + ' ' + line + '\n');
}

async function cmdName(name) {
  if (!name || !name.trim()) {
    process.stdout.write('\n  Uso: /buddy name <nuevo nombre>\n\n');
    return;
  }
  const b = buddyState.rename(name);
  if (!b) {
    process.stdout.write('\n  Tu buddy aún no ha nacido. Abre Claude Code o corre /buddy primero.\n\n');
    return;
  }
  process.stdout.write('\n  ✅ Ahora se llama ' + colorize(b.name, 'magenta') + '. 💜\n\n');
}

async function cmdReroll() {
  const salt = String(Date.now());
  const buddy = buddyState.generate({ salt });
  await hatch(buddy, { animate: true });
  buddyState.save(buddy);
  process.stdout.write('  (re-roll: una criatura nueva para ti)\n\n');
}

async function cmdPick(speciesKey) {
  const sp = getSpecies(speciesKey);
  if (!speciesKey || sp.key !== speciesKey) {
    const list = buddyState.SPECIES_KEYS.join(', ');
    process.stdout.write('\n  Uso: /buddy pick <especie>\n  Especies: ' + list + '\n\n');
    return;
  }
  const salt = String(Date.now());
  const buddy = buddyState.generate({ salt, forceSpecies: speciesKey });
  await hatch(buddy, { animate: true });
  buddyState.save(buddy);
  process.stdout.write('  (elegiste: ' + sp.label + ')\n\n');
}

function cmdMute(muted) {
  setMuted(muted);
  process.stdout.write(
    muted
      ? '\n  🔇 Buddy en silencio. No saludará al abrir. (/buddy unmute para reactivar)\n\n'
      : '\n  🔊 Buddy reactivado. Te saludará al abrir Claude Code.\n\n'
  );
}

async function main() {
  const args = process.argv.slice(2);
  const cmd = (args[0] || '').toLowerCase();
  const rest = args.slice(1).join(' ').trim();

  try {
    switch (cmd) {
      case 'card':
        await cmdCard();
        break;
      case 'pet':
        await cmdPet();
        break;
      case 'name':
      case 'rename':
        await cmdName(rest);
        break;
      case 'reroll':
      case 'reroll!':
        await cmdReroll();
        break;
      case 'pick':
        await cmdPick((args[1] || '').toLowerCase());
        break;
      case 'mute':
        cmdMute(true);
        break;
      case 'unmute':
        cmdMute(false);
        break;
      case 'chatter':
        await cmdChatter();
        break;
      case 'hook':
      case '--hook':
        await cmdGreet({ fromHook: true });
        break;
      case '':
      case 'hi':
      case 'hello':
      default:
        await cmdGreet();
        break;
    }
  } catch (err) {
    // Nunca rompemos la terminal del usuario.
    if (process.env.BUDDY_DEBUG) console.error(err);
    process.stdout.write('\n  🐾 (tu buddy está tomando una siesta)\n\n');
  }
}

main();
