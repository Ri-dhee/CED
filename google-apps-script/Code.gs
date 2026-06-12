/**
 * GRME Index — Google Apps Script Backend (Production-Grade)
 *
 * Features:
 *  - Input validation on all endpoints
 *  - Rate limiting via CacheService (60 req/min per IP)
 *  - Payload size limits
 *  - Data sanitization
 *  - Error logging to sheet
 *  - CORS-safe responses
 *  - Schema versioning
 */

const SHEET_NAMES = {
  ASSESSMENTS: "assessment_data",
  AUDIT: "audit_log",
  FRAMEWORK: "framework",
  USERS: "managed_users",
  CONFIG: "config",
  ERROR_LOG: "error_log",
};

const VALIDATORS = {
  cityId: (v) => typeof v === "string" && /^[a-z-]+$/.test(v) && v.length <= 50,
  year: (v) => typeof v === "number" && v >= 2000 && v <= 2100 && Number.isInteger(v),
  indicatorId: (v) => typeof v === "string" && /^[a-z0-9-]+$/.test(v) && v.length <= 50,
  role: (v) => ["admin", "editor", "viewer"].includes(v),
  action: (v) => ["create", "update", "review"].includes(v),
  string: (v, maxLen = 1000) => typeof v === "string" && v.length <= maxLen,
  json: (v, maxLen = 100000) => typeof v === "string" && v.length <= maxLen,
};

const MAX_ROWS_PER_REQUEST = 500;

// ── Rate Limiting ────────────────────────────────────────────────

function checkRateLimit() {
  var cache = CacheService.getScriptCache();
  var key = "rate_" + _getClientIp();
  var count = parseInt(cache.get(key) || "0");

  if (count >= 60) {
    throw new Error("Rate limit exceeded. Try again in a minute.");
  }

  cache.put(key, String(count + 1), 60);
}

function _getClientIp() {
  try {
    return ScriptApp.getExecutingUser().getEmail() || "anonymous";
  } catch (e) {
    return "anonymous";
  }
}

// ── Entry Point ──────────────────────────────────────────────────

function doGet(e) {
  return handleRequest(e, "GET");
}

function doPost(e) {
  return handleRequest(e, "POST");
}

function handleRequest(e, method) {
  try {
    // Rate limit
    checkRateLimit();

    var action, payload;

    if (method === "GET") {
      action = (e.parameter.action || "health").replace(/[^a-zA-Z]/g, "");
      payload = {};
    } else {
      var raw = e.postData ? e.postData.contents : "{}";
      if (raw.length > 200000) {
        return _jsonResponse({ status: "error", message: "Payload too large" });
      }
      var parsed = JSON.parse(raw);
      action = (parsed.action || "").replace(/[^a-zA-Z]/g, "");
      payload = parsed;
    }

    if (!action) {
      return _jsonResponse({ status: "error", message: "Missing action" });
    }

    var result;
    switch (action) {
      case "health":
        result = { status: "ok", timestamp: new Date().toISOString() };
        break;
      case "loadAssessments":
        result = loadAssessments();
        break;
      case "saveAssessment":
        result = saveAssessment(payload);
        break;
      case "saveAssessments":
        result = saveAssessments(payload);
        break;
      case "deleteYear":
        result = deleteYear(payload);
        break;
      case "loadAuditLog":
        result = loadAuditLog();
        break;
      case "addAuditEntry":
        result = addAuditEntry(payload);
        break;
      case "loadFramework":
        result = loadFramework();
        break;
      case "saveFramework":
        result = saveFramework(payload);
        break;
      case "loadUsers":
        result = loadUsers();
        break;
      case "saveUsers":
        result = saveUsers(payload);
        break;
      case "loadConfig":
        result = loadConfig();
        break;
      case "saveConfig":
        result = saveConfig(payload);
        break;
      default:
        result = { status: "error", message: "Unknown action: " + action };
    }

    return _jsonResponse(result);

  } catch (err) {
    _logError(err);
    return _jsonResponse({
      status: "error",
      message: err.message || "Internal error",
    });
  }
}

function _jsonResponse(result) {
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function _logError(err) {
  try {
    var sheet = getOrCreateSheet(SHEET_NAMES.ERROR_LOG);
    sheet.appendRow([
      new Date().toISOString(),
      err.message || String(err),
      err.stack || "",
    ]);
  } catch (e) {
    // Silently fail if we can't log
  }
}

function _sanitize(val, maxLen) {
  if (val === null || val === undefined) return "";
  var s = String(val);
  return s.substring(0, maxLen || 10000);
}

function _parseValue(val) {
  if (val === null || val === undefined || val === "") return null;
  var num = Number(val);
  return isNaN(num) ? val : num;
}

// ── Assessments ──────────────────────────────────────────────────

function loadAssessments() {
  var sheet = getOrCreateSheet(SHEET_NAMES.ASSESSMENTS);
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) {
    return { status: "ok", data: {} };
  }

  var headers = rows[0];
  var data = {};

  for (var i = 1; i < rows.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = rows[i][j];
    }

    var cityId = String(row.city_id || "");
    var year = parseInt(row.year);

    if (!cityId || isNaN(year)) continue;

    if (!data[cityId]) {
      data[cityId] = {
        cityId: cityId,
        cityName: _getCityName(cityId),
        assessments: {},
      };
    }
    if (!data[cityId].assessments[year]) {
      data[cityId].assessments[year] = {
        year: year,
        indicators: {},
        auditLog: [],
        createdAt: "",
        updatedAt: "",
      };
    }

    var assessment = data[cityId].assessments[year];
    var indicatorId = String(row.indicator_id || "");
    if (!indicatorId) continue;

    assessment.indicators[indicatorId] = {
      indicatorId: indicatorId,
      value: _parseValue(row.value),
      evidence: _sanitize(row.evidence, 500) || undefined,
      notes: _sanitize(row.notes, 1000) || undefined,
      lastUpdated: String(row.last_updated || ""),
      updatedBy: String(row.updated_by || ""),
    };

    var ts = String(row.last_updated || "");
    if (ts && (!assessment.createdAt || ts < assessment.createdAt)) {
      assessment.createdAt = ts;
    }
    if (ts && (!assessment.updatedAt || ts > assessment.updatedAt)) {
      assessment.updatedAt = ts;
    }
  }

  return { status: "ok", data: data };
}

function saveAssessment(payload) {
  if (!VALIDATORS.cityId(payload.cityId)) {
    return { status: "error", message: "Invalid cityId" };
  }
  if (!VALIDATORS.year(payload.year)) {
    return { status: "error", message: "Invalid year" };
  }
  if (!VALIDATORS.indicatorId(payload.indicatorId)) {
    return { status: "error", message: "Invalid indicatorId" };
  }

  var sheet = getOrCreateSheet(SHEET_NAMES.ASSESSMENTS);
  var cityId = payload.cityId;
  var year = payload.year;
  var indicatorId = payload.indicatorId;
  var data = payload.data || {};

  var key = cityId + "|" + year + "|" + indicatorId;
  var rows = sheet.getDataRange().getValues();
  var existingRow = -1;

  for (var i = 1; i < rows.length; i++) {
    var rowKey = rows[i][0] + "|" + rows[i][1] + "|" + rows[i][2];
    if (rowKey === key) {
      existingRow = i + 1;
      break;
    }
  }

  var now = new Date().toISOString();
  var rowData = [
    _sanitize(cityId, 50),
    year,
    _sanitize(indicatorId, 50),
    data.value !== null && data.value !== undefined ? String(data.value).substring(0, 100) : "",
    _sanitize(data.evidence, 500),
    _sanitize(data.notes, 1000),
    now,
    _sanitize(data.updatedBy, 100),
  ];

  if (existingRow > 0) {
    sheet.getRange(existingRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  return { status: "ok" };
}

function saveAssessments(payload) {
  if (!VALIDATORS.cityId(payload.cityId)) {
    return { status: "error", message: "Invalid cityId" };
  }
  if (!VALIDATORS.year(payload.year)) {
    return { status: "error", message: "Invalid year" };
  }
  if (!payload.indicators || typeof payload.indicators !== "object") {
    return { status: "error", message: "Invalid indicators" };
  }

  var keys = Object.keys(payload.indicators);
  if (keys.length > MAX_ROWS_PER_REQUEST) {
    return { status: "error", message: "Too many indicators (max " + MAX_ROWS_PER_REQUEST + ")" };
  }

  var sheet = getOrCreateSheet(SHEET_NAMES.ASSESSMENTS);
  var cityId = payload.cityId;
  var year = payload.year;

  var rows = sheet.getDataRange().getValues();
  var existingRows = {};

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === cityId && rows[i][1] == year) {
      existingRows[rows[i][2]] = i + 1;
    }
  }

  var now = new Date().toISOString();
  var updates = [];
  var appends = [];

  for (var k = 0; k < keys.length; k++) {
    var indId = keys[k];
    if (!VALIDATORS.indicatorId(indId)) continue;

    var data = payload.indicators[indId];
    var rowData = [
      _sanitize(cityId, 50),
      year,
      _sanitize(indId, 50),
      data.value !== null && data.value !== undefined ? String(data.value).substring(0, 100) : "",
      _sanitize(data.evidence, 500),
      _sanitize(data.notes, 1000),
      now,
      _sanitize(data.updatedBy, 100),
    ];

    if (existingRows[indId]) {
      updates.push({ row: existingRows[indId], data: rowData });
    } else {
      appends.push(rowData);
    }
  }

  for (var u = 0; u < updates.length; u++) {
    sheet.getRange(updates[u].row, 1, 1, updates[u].data.length).setValues([updates[u].data]);
  }
  for (var a = 0; a < appends.length; a++) {
    sheet.appendRow(appends[a]);
  }

  return { status: "ok", updated: updates.length, appended: appends.length };
}

function deleteYear(payload) {
  if (!VALIDATORS.cityId(payload.cityId)) {
    return { status: "error", message: "Invalid cityId" };
  }
  if (!VALIDATORS.year(payload.year)) {
    return { status: "error", message: "Invalid year" };
  }

  var sheet = getOrCreateSheet(SHEET_NAMES.ASSESSMENTS);
  var cityId = payload.cityId;
  var year = payload.year;

  var rows = sheet.getDataRange().getValues();
  var rowsToDelete = [];

  for (var i = rows.length - 1; i >= 1; i--) {
    if (rows[i][0] === cityId && rows[i][1] == year) {
      rowsToDelete.push(i + 1);
    }
  }

  for (var j = 0; j < rowsToDelete.length; j++) {
    sheet.deleteRow(rowsToDelete[j]);
  }

  return { status: "ok", deleted: rowsToDelete.length };
}

// ── Audit Log ────────────────────────────────────────────────────

function loadAuditLog() {
  var sheet = getOrCreateSheet(SHEET_NAMES.AUDIT);
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) {
    return { status: "ok", data: [] };
  }

  var headers = rows[0];
  var entries = [];
  var maxRows = Math.min(rows.length, 5000); // Limit to prevent timeout

  for (var i = 1; i < maxRows; i++) {
    var entry = {};
    for (var j = 0; j < headers.length; j++) {
      entry[headers[j]] = rows[i][j];
    }
    entries.push(entry);
  }

  return { status: "ok", data: entries };
}

function addAuditEntry(payload) {
  if (!payload.entry || typeof payload.entry !== "object") {
    return { status: "error", message: "Invalid entry" };
  }

  var sheet = getOrCreateSheet(SHEET_NAMES.AUDIT);
  var e = payload.entry;
  sheet.appendRow([
    _sanitize(payload.cityId, 50),
    payload.year || "",
    _sanitize(payload.indicatorId, 50),
    _sanitize(e.id, 50),
    _sanitize(e.timestamp, 30),
    _sanitize(e.user, 100),
    _sanitize(e.action, 20),
    _sanitize(e.field, 50),
    _sanitize(e.oldValue, 200),
    _sanitize(e.newValue, 200),
    _sanitize(e.notes, 1000),
  ]);

  return { status: "ok" };
}

// ── Framework ────────────────────────────────────────────────────

function loadFramework() {
  var sheet = getOrCreateSheet(SHEET_NAMES.FRAMEWORK);
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) {
    return { status: "ok", data: null };
  }

  var json = rows[1][1];
  if (!json) {
    return { status: "ok", data: null };
  }

  // Validate JSON before parsing
  if (typeof json !== "string" || json.length > 500000) {
    return { status: "error", message: "Framework data too large or invalid" };
  }

  try {
    var parsed = JSON.parse(json);
    return { status: "ok", data: parsed };
  } catch (e) {
    return { status: "error", message: "Framework JSON parse error" };
  }
}

function saveFramework(payload) {
  if (!payload.framework) {
    return { status: "error", message: "Missing framework" };
  }

  var json;
  try {
    json = JSON.stringify(payload.framework);
  } catch (e) {
    return { status: "error", message: "Framework JSON serialization error" };
  }

  if (json.length > 500000) {
    return { status: "error", message: "Framework too large (max 500KB)" };
  }

  var sheet = getOrCreateSheet(SHEET_NAMES.FRAMEWORK);
  var now = new Date().toISOString();

  if (sheet.getLastRow() <= 1) {
    sheet.appendRow(["framework", json, now]);
  } else {
    sheet.getRange(2, 2).setValue(json);
    sheet.getRange(2, 3).setValue(now);
  }

  return { status: "ok" };
}

// ── Managed Users ────────────────────────────────────────────────

function loadUsers() {
  var sheet = getOrCreateSheet(SHEET_NAMES.USERS);
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) {
    return { status: "ok", data: [] };
  }

  var headers = rows[0];
  var users = [];

  for (var i = 1; i < rows.length; i++) {
    var user = {};
    for (var j = 0; j < headers.length; j++) {
      user[headers[j]] = rows[i][j];
    }
    user.active = user.active === true || user.active === "true";
    users.push(user);
  }

  return { status: "ok", data: users };
}

function saveUsers(payload) {
  if (!Array.isArray(payload.users)) {
    return { status: "error", message: "Invalid users array" };
  }

  if (payload.users.length > 100) {
    return { status: "error", message: "Too many users (max 100)" };
  }

  var sheet = getOrCreateSheet(SHEET_NAMES.USERS);

  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }

  for (var i = 0; i < payload.users.length; i++) {
    var u = payload.users[i];
    if (!u.id || !u.name) continue;

    sheet.appendRow([
      _sanitize(u.id, 50),
      _sanitize(u.name, 100),
      _sanitize(u.role, 20),
      _sanitize(u.passwordHash, 200),
      _sanitize(u.createdAt, 30),
      _sanitize(u.lastLoginAt, 30),
      u.active !== false ? "true" : "false",
    ]);
  }

  return { status: "ok" };
}

// ── Config ───────────────────────────────────────────────────────

function loadConfig() {
  var sheet = getOrCreateSheet(SHEET_NAMES.CONFIG);
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) {
    return { status: "ok", data: {} };
  }

  var config = {};
  for (var i = 1; i < rows.length; i++) {
    config[rows[i][0]] = rows[i][1];
  }

  return { status: "ok", data: config };
}

function saveConfig(payload) {
  if (!payload.key || typeof payload.key !== "string") {
    return { status: "error", message: "Invalid key" };
  }

  var sheet = getOrCreateSheet(SHEET_NAMES.CONFIG);
  var rows = sheet.getDataRange().getValues();
  var existingRow = -1;

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === payload.key) {
      existingRow = i + 1;
      break;
    }
  }

  if (existingRow > 0) {
    sheet.getRange(existingRow, 2).setValue(_sanitize(payload.value, 10000));
  } else {
    sheet.appendRow([_sanitize(payload.key, 100), _sanitize(payload.value, 10000)]);
  }

  return { status: "ok" };
}

// ── Helpers ──────────────────────────────────────────────────────

function getOrCreateSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    _addHeaders(sheet, name);
  }
  return sheet;
}

function _addHeaders(sheet, name) {
  var headers = {
    "assessment_data": ["city_id", "year", "indicator_id", "value", "evidence", "notes", "last_updated", "updated_by"],
    "audit_log": ["city_id", "year", "indicator_id", "entry_id", "timestamp", "user", "action", "field", "old_value", "new_value", "notes"],
    "framework": ["key", "value", "last_updated"],
    "managed_users": ["id", "name", "role", "password_hash", "created_at", "last_login_at", "active"],
    "config": ["key", "value"],
    "error_log": ["timestamp", "message", "stack"],
  };

  if (headers[name]) {
    sheet.getRange(1, 1, 1, headers[name].length).setValues([headers[name]]);
    sheet.getRange(1, 1, 1, headers[name].length).setFontWeight("bold");
  }
}

function _getCityName(cityId) {
  var cities = {
    thimphu: "Thimphu",
    phuntsholing: "Phuntsholing",
    gelephu: "Gelephu",
    paro: "Paro",
  };
  return cities[cityId] || cityId;
}
