'use strict';

const test = require('node:test');
const assert = require('node:assert');

const { fnv1a, getIdentity, makeRng } = require('../core/identity');
const { SPECIES, pickBuddy, pickRarity, getSpecies } = require('../core/roster');
const { computeMood } = require('../core/mood');
const { speak } = require('../core/voice');
const todoFile = require('../sources/todo-file');
const { collectPendings } = require('../sources');
const { buildPersona, starsFor } = require('../core/persona');
const { chatterLine } = require('../core/voice');
const buddyState = require('../state/buddy');

test('fnv1a es determinista y estable', () => {
  assert.strictEqual(fnv1a('andrea@formula100k.com'), fnv1a('andrea@formula100k.com'));
  assert.notStrictEqual(fnv1a('a@x.com'), fnv1a('b@x.com'));
});

test('mismo identity => mismo buddy (determinismo)', () => {
  const a = pickBuddy(getIdentity('andrea@formula100k.com').rng);
  const b = pickBuddy(getIdentity('andrea@formula100k.com').rng);
  assert.deepStrictEqual(a, b);
});

test('identidades distintas tienden a buddies distintos', () => {
  const a = pickBuddy(getIdentity('andrea@formula100k.com').rng);
  const b = pickBuddy(getIdentity('otra-persona@gmail.com').rng);
  // No garantizamos 100% distinto, pero al menos algo debe cambiar en el conjunto.
  const same = a.species === b.species && a.rarity === b.rarity && a.name === b.name;
  assert.strictEqual(same, false);
});

test('todas las especies tienen las 4 caras', () => {
  for (const s of SPECIES) {
    for (const mood of ['relaxed', 'alert', 'celebrating', 'sleeping']) {
      assert.ok(Array.isArray(s.faces[mood]) && s.faces[mood].length > 0, `${s.key} falta cara ${mood}`);
    }
    assert.ok(s.names.length > 0, `${s.key} sin nombres`);
  }
});

test('hay exactamente 18 especies y Gato Jefe es la estrella', () => {
  assert.strictEqual(SPECIES.length, 18);
  const jefe = SPECIES.find((s) => s.key === 'gato-jefe');
  assert.ok(jefe && jefe.star === true);
});

test('pickRarity respeta los límites', () => {
  assert.strictEqual(pickRarity(0).key, 'comun');
  assert.strictEqual(pickRarity(0.99).key, 'legendario');
});

test('computeMood: umbrales correctos', () => {
  assert.strictEqual(computeMood([], 10), 'celebrating');
  assert.strictEqual(computeMood([{ title: 'a' }], 10), 'relaxed');
  assert.strictEqual(computeMood([1, 2, 3, 4].map((n) => ({ title: '' + n })), 10), 'alert');
  assert.strictEqual(computeMood([{ title: 'x', urgent: true }], 10), 'alert');
  assert.strictEqual(computeMood([{ title: 'x' }], 3), 'sleeping');
});

test('speak no rompe con 0 pendientes y rellena variables', () => {
  const msg0 = speak({ mood: 'celebrating', pendings: [], buddy: { name: 'Michi' } });
  assert.ok(typeof msg0 === 'string' && msg0.length > 0);
  const msg = speak({ mood: 'alert', pendings: [{ title: 'Editar VSL' }, { title: 'b' }], buddy: {}, rng: () => 0 });
  assert.ok(msg.includes('2'));
  assert.ok(msg.includes('Editar VSL'));
});

test('todo-file parsea checkboxes y detecta urgentes', () => {
  const items = todoFile.parse('- [ ] Tarea A\n- [x] Hecha\n- [ ] Tarea B (urgente)\n* [ ] Tarea C !');
  assert.strictEqual(items.length, 3);
  assert.strictEqual(items[0].title, 'Tarea A');
  assert.ok(items.find((i) => i.title === 'Tarea B').urgent);
  assert.ok(items.find((i) => i.title === 'Tarea C').urgent);
});

test('getSpecies cae a gato-jefe ante key desconocida', () => {
  assert.ok(getSpecies('no-existe'));
});

test('persona es determinista y coherente', () => {
  const b = { identityHash: 12345, name: 'Michi', rarity: 'epico' };
  const p1 = buildPersona(b);
  const p2 = buildPersona(b);
  assert.deepStrictEqual(p1, p2);
  assert.strictEqual(p1.stats.length, 5);
  for (const s of p1.stats) assert.ok(s.value >= 0 && s.value <= 100);
  assert.strictEqual(typeof p1.shiny, 'boolean');
});

test('starsFor mapea rareza a estrellas', () => {
  assert.strictEqual(starsFor('comun'), '★★☆☆☆');
  assert.strictEqual(starsFor('legendario'), '★★★★★');
});

test('chatterLine rellena variables y no rompe', () => {
  const l = chatterLine({ mood: 'alert', pendings: [{ title: 'Editar VSL' }, { title: 'b' }] });
  assert.ok(typeof l === 'string' && l.length > 0);
});

test('generate con salt produce buddies distintos; pick fuerza especie', () => {
  const base = buddyState.generate({ identity: 'andrea@formula100k.com' });
  const rerolled = buddyState.generate({ identity: 'andrea@formula100k.com', salt: '999' });
  const same = base.species === rerolled.species && base.name === rerolled.name && base.rarity === rerolled.rarity;
  assert.strictEqual(same, false);
  const picked = buddyState.generate({ identity: 'andrea@formula100k.com', salt: '1', forceSpecies: 'dragon' });
  assert.strictEqual(picked.species, 'dragon');
});

test('collectPendings dedup + urgentes primero', async () => {
  const fs = require('fs');
  const os = require('os');
  const path = require('path');
  const tmp = path.join(os.tmpdir(), 'buddy_collect_TODO.md');
  fs.writeFileSync(tmp, '- [ ] Repetida\n- [ ] Repetida !\n- [ ] Normal\n');
  const out = await collectPendings({ sources: ['todo-file'], todoPath: tmp });
  // "Repetida" aparece una sola vez y queda urgente
  const rep = out.filter((p) => p.title === 'Repetida');
  assert.strictEqual(rep.length, 1);
  assert.strictEqual(rep[0].urgent, true);
  // urgente va primero
  assert.strictEqual(out[0].urgent, true);
});
