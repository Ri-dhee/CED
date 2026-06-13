/**
 * snapshot-state.js — GRME localStorage snapshot/restore utility
 *
 * USAGE:
 *   node scripts/snapshot-state.js <command> [file]
 *
 * Commands:
 *   save   [file]   Generate a snapshot JSON template (default: grme-snapshot.json)
 *   check  [file]   Validate snapshot file structure (default: grme-snapshot.json)
 *   list             List all grme-*.json files in the current directory
 *
 * BROWSER EXPORT (paste in DevTools console):
 *   copy(JSON.stringify({
 *     "grme-user": localStorage.getItem("grme-user"),
 *     "grme-data": localStorage.getItem("grme-data"),
 *     "grme-managed-users": localStorage.getItem("grme-managed-users"),
 *     "grme-framework": localStorage.getItem("grme-framework"),
 *   }, null, 2))
 *
 * BROWSER IMPORT (paste in DevTools console):
 *   const state = <paste snapshot JSON here>;
 *   Object.entries(state).forEach(([k, v]) => {
 *     if (v !== null) localStorage.setItem(k, v);
 *   });
 *   console.log("State restored — reload the page.");
 */

const fs = require("fs");
const path = require("path");

const STORAGE_KEYS = [
  "grme-user",
  "grme-data",
  "grme-managed-users",
  "grme-framework",
];

function generateTemplate() {
  const snapshot = {};
  for (const key of STORAGE_KEYS) {
    snapshot[key] = null;
  }
  return snapshot;
}

function validateSnapshot(data) {
  const errors = [];
  for (const key of STORAGE_KEYS) {
    if (!(key in data)) {
      errors.push(`Missing key: ${key}`);
    } else if (data[key] !== null) {
      try {
        JSON.parse(data[key]);
      } catch {
        errors.push(`Key "${key}" is not valid JSON`);
      }
    }
  }
  return errors;
}

function saveSnapshot(filePath) {
  const snapshot = generateTemplate();
  fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2));
  console.log(`Snapshot template saved to ${filePath}`);
  console.log("Fill in the values by running the BROWSER EXPORT snippet,");
  console.log("then paste the result into this file.");
}

function checkSnapshot(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    console.error(`Invalid JSON in ${filePath}`);
    process.exit(1);
  }
  const errors = validateSnapshot(data);
  if (errors.length === 0) {
    console.log(`Snapshot ${filePath} is valid.`);
    for (const key of STORAGE_KEYS) {
      const val = data[key];
      const preview = val !== null ? `${val.slice(0, 60)}... (${val.length} chars)` : "null";
      console.log(`  ${key}: ${preview}`);
    }
  } else {
    console.error(`Snapshot ${filePath} has ${errors.length} issue(s):`);
    for (const err of errors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }
}

function listSnapshots() {
  const cwd = process.cwd();
  const files = fs
    .readdirSync(cwd)
    .filter((f) => f.startsWith("grme-") && f.endsWith(".json"));
  if (files.length === 0) {
    console.log("No grme-*.json files found in the current directory.");
    console.log("Run: node scripts/snapshot-state.js save");
  } else {
    console.log("Snapshot files in current directory:");
    for (const f of files) {
      const stat = fs.statSync(path.join(cwd, f));
      console.log(`  ${f} (${(stat.size / 1024).toFixed(1)} KB)`);
    }
  }
}

const command = process.argv[2] || "save";
const fileArg = process.argv[3] || "grme-snapshot.json";

switch (command) {
  case "save":
    saveSnapshot(fileArg);
    break;
  case "check":
    checkSnapshot(fileArg);
    break;
  case "list":
    listSnapshots();
    break;
  default:
    console.error(`Unknown command: ${command}`);
    console.error("Usage: node scripts/snapshot-state.js <save|check|list> [file]");
    process.exit(1);
}
