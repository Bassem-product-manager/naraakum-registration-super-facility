(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.NKServiceMarkupsStore = factory();
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  var STORAGE_KEY = "nk_service_markups_v1";

  var FACILITY_SERVICES = [
    { facilityCode: "FC-00001", facilityName: "Dr. Bassam Medical Center", mainServiceId: "home_care", mainServiceName: "Home Care", serviceId: "nutrition_care", serviceName: "Nutrition Care" },
    { facilityCode: "FC-00001", facilityName: "Dr. Bassam Medical Center", mainServiceId: "clinical_services", mainServiceName: "Clinical Services", serviceId: "doctor_visit", serviceName: "Doctor Visit" },
    { facilityCode: "FC-00002", facilityName: "Al Noor Medical Center", mainServiceId: "home_care", mainServiceName: "Home Care", serviceId: "nursing_visit", serviceName: "Nursing Visit" },
    { facilityCode: "FC-00003", facilityName: "Green Valley Clinic", mainServiceId: "rehabilitation", mainServiceName: "Rehabilitation", serviceId: "physiotherapy", serviceName: "Physiotherapy" },
    { facilityCode: "FC-00004", facilityName: "Future Care Hospital", mainServiceId: "renal_care", mainServiceName: "Renal Care", serviceId: "home_dialysis", serviceName: "Home Dialysis" }
  ];

  function norm(value) {
    return String(value == null ? "" : value).trim();
  }

  function lower(value) {
    return norm(value).toLowerCase();
  }

  function upper(value) {
    return norm(value).toUpperCase();
  }

  function round2(value) {
    var num = Number(value);
    if (!Number.isFinite(num)) return 0;
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  function id() {
    return "sm-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function normalizeMarkupType(value) {
    var v = lower(value).replace(/[\s-]+/g, "_");
    if (v === "flat" || v === "flat_amount" || v === "amount" || v === "fixed") return "flat_amount";
    return "percentage";
  }

  function normalizePricingLevel(value) {
    var v = lower(value).replace(/[\s-]+/g, "_");
    if (v === "insurance") return "insurance";
    if (v === "premium") return "premium";
    if (v === "self_pay" || v === "selfpay") return "self_pay";
    return "standard";
  }

  function markupTypeLabel(value) {
    return normalizeMarkupType(value) === "flat_amount" ? "Flat Amount" : "Percentage";
  }

  function pricingLevelLabel(value) {
    var v = normalizePricingLevel(value);
    if (v === "self_pay") return "Self-Pay";
    if (v === "insurance") return "Insurance";
    if (v === "premium") return "Premium";
    return "Standard";
  }

  function normalizeMarkup(input) {
    var row = input || {};
    return {
      id: norm(row.id) || id(),
      facilityCode: upper(row.facilityCode),
      facilityName: norm(row.facilityName),
      mainServiceId: lower(row.mainServiceId).replace(/[\s-]+/g, "_"),
      mainServiceName: norm(row.mainServiceName),
      serviceId: lower(row.serviceId).replace(/[\s-]+/g, "_"),
      serviceName: norm(row.serviceName),
      pricingLevel: normalizePricingLevel(row.pricingLevel),
      markupType: normalizeMarkupType(row.markupType),
      amount: round2(row.amount),
      createdAt: row.createdAt || nowIso(),
      updatedAt: row.updatedAt || nowIso()
    };
  }

  function formatNumber(value) {
    var n = round2(value);
    return n % 1 === 0 ? String(n) : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  }

  function formatAmount(row) {
    var item = normalizeMarkup(row);
    if (item.markupType === "flat_amount") return item.amount.toFixed(2) + " SAR";
    return formatNumber(item.amount) + "%";
  }

  function facilityServiceValue(row) {
    var item = row || {};
    return upper(item.facilityCode) + "|" + lower(item.serviceId).replace(/[\s-]+/g, "_");
  }

  function mainServiceLabel(row) {
    var item = row || {};
    return norm(item.mainServiceName) || "Main Service";
  }

  function findFacilityService(value) {
    var target = norm(value);
    for (var i = 0; i < FACILITY_SERVICES.length; i += 1) {
      if (facilityServiceValue(FACILITY_SERVICES[i]) === target) return FACILITY_SERVICES[i];
    }
    return null;
  }

  function validateMarkup(row) {
    var item = normalizeMarkup(row);
    var errors = {};
    if (!item.facilityCode || !item.serviceId) errors.facilityService = "Hospital service is required.";
    if (!(item.amount > 0)) errors.amount = "Amount must be greater than 0.";
    if (item.markupType === "percentage" && item.amount > 100) errors.amount = "Percentage cannot exceed 100.";
    return { ok: Object.keys(errors).length === 0, errors: errors };
  }

  function readAll() {
    if (typeof localStorage === "undefined") return [];
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(normalizeMarkup) : [];
    } catch (e) {
      return [];
    }
  }

  function writeAll(rows) {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify((rows || []).map(normalizeMarkup)));
    } catch (e) {
      // localStorage may be unavailable.
    }
  }

  function list() {
    return readAll().sort(function (a, b) {
      return String(b.updatedAt).localeCompare(String(a.updatedAt));
    });
  }

  function upsert(row) {
    var item = normalizeMarkup(row);
    var validation = validateMarkup(item);
    if (!validation.ok) return { ok: false, errors: validation.errors };

    var rows = readAll();
    var found = false;
    rows = rows.map(function (existing) {
      if (existing.id !== item.id) return existing;
      found = true;
      item.createdAt = existing.createdAt || item.createdAt;
      item.updatedAt = nowIso();
      return item;
    });
    if (!found) rows.push(item);
    writeAll(rows);
    return { ok: true, row: item };
  }

  function remove(idValue) {
    var target = norm(idValue);
    var rows = readAll().filter(function (row) {
      return row.id !== target;
    });
    writeAll(rows);
    return { ok: true };
  }

  function get(idValue) {
    var target = norm(idValue);
    var rows = readAll();
    for (var i = 0; i < rows.length; i += 1) {
      if (rows[i].id === target) return rows[i];
    }
    return null;
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    FACILITY_SERVICES: FACILITY_SERVICES,
    normalizeMarkup: normalizeMarkup,
    normalizeMarkupType: normalizeMarkupType,
    normalizePricingLevel: normalizePricingLevel,
    markupTypeLabel: markupTypeLabel,
    pricingLevelLabel: pricingLevelLabel,
    formatAmount: formatAmount,
    facilityServiceValue: facilityServiceValue,
    mainServiceLabel: mainServiceLabel,
    findFacilityService: findFacilityService,
    validateMarkup: validateMarkup,
    list: list,
    get: get,
    upsert: upsert,
    remove: remove
  };
});
