'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const DIR = process.env.BUDDY_HOME || path.join(os.homedir(), '.buddy-100k');
const CONFIG_PATH = path.join(DIR, 'config.json');

const DEFAULT_CONFIG = {
  muted: false,
  sources: ['apple-reminders', 'todo-file'],
  todoPath: null, // null => autodetecta (~/TODO.md o ./TODO.md)
  llm: false,
};

function ensureDir() {
  try {
    fs.mkdirSync(DIR, { recursive: true });
  } catch (_) {
    /* ya existe o sin permisos */
  }
}

function readConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch (_) {
    return { ...DEFAULT_CONFIG };
  }
}

function writeConfig(cfg) {
  ensureDir();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
  return cfg;
}

function setMuted(muted) {
  const cfg = readConfig();
  cfg.muted = Boolean(muted);
  return writeConfig(cfg);
}

module.exports = { DIR, CONFIG_PATH, DEFAULT_CONFIG, ensureDir, readConfig, writeConfig, setMuted };
