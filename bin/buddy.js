#!/usr/bin/env node
'use strict';

const { readConfig, setMuted } = require('../state/config');
const buddyState = require('../state/buddy');
const { collectPendings } = require('../sources');
const { computeMood } = require('../core/mood');
const { speak, petLine } = require('../core/voice');
const { renderBuddy, renderCard } = require('../core/render');
const { hatch } = require('../core/hatch');

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

  try {
    switch (cmd) {
      case 'card':
        await cmdCard();
        break;
      case 'pet':
        await cmdPet();
        break;
      case 'mute':
        cmdMute(true);
        break;
      case 'unmute':
        cmdMute(false);
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
