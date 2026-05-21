const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '../data/processed_processes.json');

function initDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([]));
  }
}

function getProcessed() {
  initDB();
  const data = fs.readFileSync(DB_PATH, 'utf-8');
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function saveProcessed(newIds) {
  const current = getProcessed();
  const updated = [...new Set([...current, ...newIds])]; // Evitar duplicados internamente
  fs.writeFileSync(DB_PATH, JSON.stringify(updated, null, 2));
}

function filterNewProcesses(processes) {
  const processed = getProcessed();
  const newProcesses = processes.filter(p => !processed.includes(p.numProceso));
  return newProcesses;
}

module.exports = { filterNewProcesses, saveProcessed };
