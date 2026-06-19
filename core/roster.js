'use strict';

/**
 * Roster de Buddy 100K.
 *
 * Cada especie trae 4 caras ASCII según el ánimo:
 *   relaxed | alert | celebrating | sleeping
 *
 * El Gato Jefe morado es la estrella; el resto son ~17 criaturas distintas.
 * La especie, rareza y nombre se asignan de forma DETERMINISTA por usuario
 * (ver pickBuddy()).
 */

// Cada cara es un array de líneas (se pinta tal cual).
const SPECIES = [
  {
    key: 'gato-jefe',
    label: 'Gato Jefe',
    color: 'magenta',
    star: true,
    faces: {
      relaxed:     ['   ♛', '  /\\_/\\', ' ( o.o )', ' (  ω  )', ' (")_(")'],
      alert:       ['   ♛', '  /\\_/\\', ' ( O.O )', ' ( !ω! )', ' (")_(")'],
      celebrating: ['   ♛', '  /\\_/\\', ' ( ^▽^ )', ' ( ♪ω♪ )', ' (")_(")'],
      sleeping:    ['   ♛', '  /\\_/\\', ' ( -.- )', ' ( zω  )', ' (")_(")'],
    },
    names: ['Michi', 'Don Gato', 'Felino', 'Bigotes', 'Rey', 'Garras'],
  },
  {
    key: 'gato',
    label: 'Gatito',
    color: 'yellow',
    faces: {
      relaxed:     [' /\\_/\\', '( o.o )', ' > ^ <'],
      alert:       [' /\\_/\\', '( O.O )', ' > ! <'],
      celebrating: [' /\\_/\\', '( ^.^ )', ' \\>♪<'],
      sleeping:    [' /\\_/\\', '( u.u )', ' > z <'],
    },
    names: ['Pelusa', 'Tom', 'Luna', 'Salem', 'Nube'],
  },
  {
    key: 'buho',
    label: 'Búho',
    color: 'cyan',
    faces: {
      relaxed:     [' ,___,', ' {o,o}', ' /)_)', '  " "'],
      alert:       [' ,___,', ' {O,O}', ' /)!)', '  " "'],
      celebrating: [' ,___,', ' {^,^}', ' /)♪)', '  " "'],
      sleeping:    [' ,___,', ' {-,-}', ' /)_)', '  z z'],
    },
    names: ['Hootie', 'Atenea', 'Sabio', 'Ulú', 'Plumas'],
  },
  {
    key: 'dragon',
    label: 'Dragoncito',
    color: 'red',
    faces: {
      relaxed:     ['  __', ' (oo)~', ' /||\\', ' ^^^^'],
      alert:       ['  __', ' (OO)≈', ' /||\\', ' ^^!^'],
      celebrating: ['  __', ' (^^)≈', ' /||\\', ' ^^♪^'],
      sleeping:    ['  __', ' (--)~', ' /||\\', ' z^^^'],
    },
    names: ['Chispa', 'Draco', 'Brasa', 'Llamita', 'Fuego'],
  },
  {
    key: 'zorro',
    label: 'Zorro',
    color: 'red',
    faces: {
      relaxed:     [' /\\..../\\', ' ( o.o )', '  (>w<) '],
      alert:       [' /\\..../\\', ' ( O.O )', '  (>!<) '],
      celebrating: [' /\\..../\\', ' ( ^.^ )', '  (>♪<) '],
      sleeping:    [' /\\..../\\', ' ( -.- )', '  (>z<) '],
    },
    names: ['Rojo', 'Foxy', 'Astuto', 'Canela', 'Naranja'],
  },
  {
    key: 'pinguino',
    label: 'Pingüino',
    color: 'cyan',
    faces: {
      relaxed:     ['  (o-o)', ' <( . )>', '  ^   ^'],
      alert:       ['  (O-O)', ' <( ! )>', '  ^   ^'],
      celebrating: ['  (^-^)', ' <( ♪ )>', '  ^   ^'],
      sleeping:    ['  (-_-)', ' <( z )>', '  ^   ^'],
    },
    names: ['Pingu', 'Frac', 'Tux', 'Hielo', 'Pico'],
  },
  {
    key: 'conejo',
    label: 'Conejo',
    color: 'magenta',
    faces: {
      relaxed:     [' (\\(\\ ', ' ( -.-)', ' o(")(")'],
      alert:       [' (\\(\\ ', ' ( O.O)', ' o(")(")'],
      celebrating: [' (\\(\\ ', ' ( ^.^)', ' o(")(")♪'],
      sleeping:    [' (\\(\\ ', ' ( u.u)', ' o(")(") z'],
    },
    names: ['Saltarín', 'Coco', 'Orejas', 'Nieve', 'Brinco'],
  },
  {
    key: 'oso',
    label: 'Osito',
    color: 'yellow',
    faces: {
      relaxed:     [' ʕ•ᴥ•ʔ', '  oso '],
      alert:       [' ʕ•!•ʔ', '  oso '],
      celebrating: [' ʕ^ᴥ^ʔ', ' ♪oso♪'],
      sleeping:    [' ʕ-ᴥ-ʔ', ' z oso'],
    },
    names: ['Bruno', 'Teddy', 'Miel', 'Pardo', 'Achú'],
  },
  {
    key: 'panda',
    label: 'Panda',
    color: 'white',
    faces: {
      relaxed:     [' ⊂(•ᴥ•)⊃', '   panda'],
      alert:       [' ⊂(•!•)⊃', '   panda'],
      celebrating: [' ⊂(^ᴥ^)⊃', '  ♪panda'],
      sleeping:    [' ⊂(-ᴥ-)⊃', '  z panda'],
    },
    names: ['Bambú', 'Po', 'Mei', 'Yin', 'Tao'],
  },
  {
    key: 'rana',
    label: 'Ranita',
    color: 'green',
    faces: {
      relaxed:     [' (o)(o)', '  \\__/ ', ' croac'],
      alert:       [' (O)(O)', '  \\!_/ ', ' croac'],
      celebrating: [' (^)(^)', '  \\♪_/ ', ' croac'],
      sleeping:    [' (-)(-)', '  \\z_/ ', ' croac'],
    },
    names: ['Sapito', 'Kero', 'Charco', 'Verdín', 'Brinquitos'],
  },
  {
    key: 'pulpo',
    label: 'Pulpo',
    color: 'magenta',
    faces: {
      relaxed:     ['  (o o)', '  ( . )', ' \\(\\/)/'],
      alert:       ['  (O O)', '  ( ! )', ' \\(\\/)/'],
      celebrating: ['  (^ ^)', '  ( ♪ )', ' \\(\\/)/'],
      sleeping:    ['  (- -)', '  ( z )', ' \\(\\/)/'],
    },
    names: ['Tentáculo', 'Inky', 'Octo', 'Tinta', 'Olas'],
  },
  {
    key: 'unicornio',
    label: 'Unicornio',
    color: 'magenta',
    faces: {
      relaxed:     ['   \\', ' <(o.o)', '  /(")(")'],
      alert:       ['   \\', ' <(O.O)', '  /(")(")'],
      celebrating: ['   \\✦', ' <(^.^)', '  /(")(")♪'],
      sleeping:    ['   \\', ' <(-.-)', '  /(")(") z'],
    },
    names: ['Estrella', 'Iris', 'Brillo', 'Arcoíris', 'Mágico'],
  },
  {
    key: 'lobo',
    label: 'Lobo',
    color: 'white',
    faces: {
      relaxed:     [' /\\   /\\', '(  o.o  )', ' ) ^^^ (', '  (___) '],
      alert:       [' /\\   /\\', '(  O.O  )', ' ) !!! (', '  (___) '],
      celebrating: [' /\\   /\\', '(  ^.^  )', ' ) ♪♪♪ (', '  (___) '],
      sleeping:    [' /\\   /\\', '(  -.-  )', ' ) zzz (', '  (___) '],
    },
    names: ['Lobo', 'Fang', 'Aullido', 'Gris', 'Luna'],
  },
  {
    key: 'mapache',
    label: 'Mapache',
    color: 'white',
    faces: {
      relaxed:     [' (>^.^<)', ' /m m m\\'],
      alert:       [' (>O.O<)', ' /m!m m\\'],
      celebrating: [' (>^▽^<)', ' /m♪m m\\'],
      sleeping:    [' (>-.-<)', ' /m z m\\'],
    },
    names: ['Bandido', 'Rocky', 'Antifaz', 'Travieso', 'Rayas'],
  },
  {
    key: 'koala',
    label: 'Koala',
    color: 'white',
    faces: {
      relaxed:     [' @( o.o )@', '   (   ) '],
      alert:       [' @( O.O )@', '   ( ! ) '],
      celebrating: [' @( ^.^ )@', '   ( ♪ ) '],
      sleeping:    [' @( -.- )@', '   ( z ) '],
    },
    names: ['Eucalipto', 'Blinky', 'Abrazo', 'Suave', 'Gomita'],
  },
  {
    key: 'leon',
    label: 'León',
    color: 'yellow',
    faces: {
      relaxed:     [' ,@@@@@,', ' { o.o }', ' { >v< }', '  \\@@@/'],
      alert:       [' ,@@@@@,', ' { O.O }', ' { >!< }', '  \\@@@/'],
      celebrating: [' ,@@@@@,', ' { ^.^ }', ' { >♪< }', '  \\@@@/'],
      sleeping:    [' ,@@@@@,', ' { -.- }', ' { >z< }', '  \\@@@/'],
    },
    names: ['Simba', 'Melena', 'Rugido', 'Rey', 'Dorado'],
  },
  {
    key: 'erizo',
    label: 'Erizo',
    color: 'magenta',
    faces: {
      relaxed:     [' /\\/\\/\\', '( o.o )', '  ""  '],
      alert:       [' /\\/\\/\\', '( O.O )', '  !!  '],
      celebrating: [' /\\/\\/\\', '( ^.^ )', '  ♪♪  '],
      sleeping:    [' /\\/\\/\\', '( -.- )', '  zz  '],
    },
    names: ['Púas', 'Sonic', 'Espinas', 'Bolita', 'Pincho'],
  },
  {
    key: 'fantasma',
    label: 'Fantasmita',
    color: 'cyan',
    faces: {
      relaxed:     [' .-""-.', '( o  o )', ' )    (', ' `~~~~`'],
      alert:       [' .-""-.', '( O  O )', ' )  ! (', ' `~~~~`'],
      celebrating: [' .-""-.', '( ^  ^ )', ' ) ♪  (', ' `~~~~`'],
      sleeping:    [' .-""-.', '( -  - )', ' ) z  (', ' `~~~~`'],
    },
    names: ['Boo', 'Casper', 'Niebla', 'Susurro', 'Velo'],
  },
];

// Rareza: pesos acumulados. La suma de weight debe dar 100.
const RARITIES = [
  { key: 'comun',      label: 'Común',      weight: 60, ornament: '',    color: null },
  { key: 'raro',       label: 'Raro',       weight: 25, ornament: '·',   color: 'cyan' },
  { key: 'epico',      label: 'Épico',      weight: 12, ornament: '✦',   color: 'magenta' },
  { key: 'legendario', label: 'Legendario', weight: 3,  ornament: '✨',  color: 'yellow' },
];

function pickRarity(roll /* 0..1 */) {
  let acc = 0;
  const target = roll * 100;
  for (const r of RARITIES) {
    acc += r.weight;
    if (target < acc) return r;
  }
  return RARITIES[0];
}

/**
 * Asigna especie + rareza + nombre de forma determinista usando el rng.
 * Devuelve un objeto serializable para guardar en buddy.json.
 */
function pickBuddy(rng) {
  const species = SPECIES[Math.floor(rng() * SPECIES.length)];
  const rarity = pickRarity(rng());
  const name = species.names[Math.floor(rng() * species.names.length)];
  return {
    species: species.key,
    rarity: rarity.key,
    name,
  };
}

function getSpecies(key) {
  return SPECIES.find((s) => s.key === key) || SPECIES[0];
}

function getRarity(key) {
  return RARITIES.find((r) => r.key === key) || RARITIES[0];
}

module.exports = {
  SPECIES,
  RARITIES,
  pickRarity,
  pickBuddy,
  getSpecies,
  getRarity,
};
