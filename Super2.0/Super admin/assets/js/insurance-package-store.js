(function (global) {
  "use strict";

  var STORAGE_KEY = "nk_insurance_package_templates_v1";
  var FLASH_KEY = "nk_insurance_package_flash_v1";

  var DEFAULT_MAIN_SERVICES = [
    "Telemedicine",
    "Remote Follow-up",
    "Laboratory Tests",
    "In-Clinic Doctor Consultation",
    "Hemodialysis",
    "Physiotherapy",
    "Health Companion",
    "Home Nursing"
  ];

  var UNIT_TYPES = ["Sessions", "Visits", "Hours", "Days"];
  var VALIDITY_TYPES = ["Days", "Months"];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function norm(value) {
    return String(value || "").trim();
  }

  function upper(value) {
    return norm(value).toUpperCase();
  }

  function toInt(value, fallback) {
    var parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function pad(value, size) {
    return String(value).padStart(size, "0");
  }

  function nowStamp() {
    var now = new Date();
    var year = now.getFullYear();
    var month = pad(now.getMonth() + 1, 2);
    var day = pad(now.getDate(), 2);
    var hour = pad(now.getHours(), 2);
    var minute = pad(now.getMinutes(), 2);
    return year + "-" + month + "-" + day + " " + hour + ":" + minute;
  }

  function createSeed() {
    return [
      {
        id: "PKG-0001",
        name: "1 Month - 13 Sessions",
        nameEn: "1 Month - 13 Sessions",
        nameAr: "",
        code: "HD-M01-13",
        mainService: "Hemodialysis",
        unitType: "Sessions",
        unitsCount: 13,
        validityType: "Months",
        validityValue: 1,
        recommendedSchedule: "3 sessions/week",
        maxPerDay: "",
        description: "",
        isActive: true,
        updatedAt: "2026-02-21 10:15"
      },
      {
        id: "PKG-0002",
        name: "3 Months - 36 Sessions",
        nameEn: "3 Months - 36 Sessions",
        nameAr: "",
        code: "HD-M03-36",
        mainService: "Hemodialysis",
        unitType: "Sessions",
        unitsCount: 36,
        validityType: "Months",
        validityValue: 3,
        recommendedSchedule: "3 sessions/week",
        maxPerDay: "",
        description: "",
        isActive: true,
        updatedAt: "2026-02-21 10:22"
      },
      {
        id: "PKG-0003",
        name: "6 Months - 72 Sessions",
        nameEn: "6 Months - 72 Sessions",
        nameAr: "",
        code: "HD-M06-72",
        mainService: "Hemodialysis",
        unitType: "Sessions",
        unitsCount: 72,
        validityType: "Months",
        validityValue: 6,
        recommendedSchedule: "3 sessions/week",
        maxPerDay: "",
        description: "",
        isActive: true,
        updatedAt: "2026-02-21 10:35"
      },
      {
        id: "PKG-0004",
        name: "Single Session",
        nameEn: "Single Session",
        nameAr: "",
        code: "PT-S01",
        mainService: "Physiotherapy",
        unitType: "Sessions",
        unitsCount: 1,
        validityType: "Days",
        validityValue: 7,
        recommendedSchedule: "",
        maxPerDay: "",
        description: "",
        isActive: true,
        updatedAt: "2026-02-20 08:40"
      },
      {
        id: "PKG-0005",
        name: "3 Sessions Package",
        nameEn: "3 Sessions Package",
        nameAr: "",
        code: "PT-S03",
        mainService: "Physiotherapy",
        unitType: "Sessions",
        unitsCount: 3,
        validityType: "Days",
        validityValue: 30,
        recommendedSchedule: "3 sessions/week",
        maxPerDay: "",
        description: "",
        isActive: true,
        updatedAt: "2026-02-20 08:46"
      },
      {
        id: "PKG-0006",
        name: "6 Sessions Package",
        nameEn: "6 Sessions Package",
        nameAr: "",
        code: "PT-S06",
        mainService: "Physiotherapy",
        unitType: "Sessions",
        unitsCount: 6,
        validityType: "Days",
        validityValue: 60,
        recommendedSchedule: "3 sessions/week",
        maxPerDay: "",
        description: "",
        isActive: true,
        updatedAt: "2026-02-20 08:53"
      },
      {
        id: "PKG-0007",
        name: "12 Sessions Package",
        nameEn: "12 Sessions Package",
        nameAr: "",
        code: "PT-S12",
        mainService: "Physiotherapy",
        unitType: "Sessions",
        unitsCount: 12,
        validityType: "Days",
        validityValue: 90,
        recommendedSchedule: "3 sessions/week",
        maxPerDay: "",
        description: "",
        isActive: true,
        updatedAt: "2026-02-20 09:02"
      },
      {
        id: "PKG-0008",
        name: "8 Hours / Day",
        nameEn: "8 Hours / Day",
        nameAr: "",
        code: "HC-D08",
        mainService: "Health Companion",
        unitType: "Hours",
        unitsCount: 8,
        validityType: "Days",
        validityValue: 1,
        recommendedSchedule: "",
        maxPerDay: 1,
        description: "",
        isActive: true,
        updatedAt: "2026-02-19 13:10"
      },
      {
        id: "PKG-0009",
        name: "12 Hours / Day",
        nameEn: "12 Hours / Day",
        nameAr: "",
        code: "HC-D12",
        mainService: "Health Companion",
        unitType: "Hours",
        unitsCount: 12,
        validityType: "Days",
        validityValue: 1,
        recommendedSchedule: "",
        maxPerDay: 1,
        description: "",
        isActive: true,
        updatedAt: "2026-02-19 13:16"
      },
      {
        id: "PKG-0010",
        name: "Sugar Tests Package",
        nameEn: "Sugar Tests Package",
        nameAr: "",
        code: "LAB-SUGAR",
        mainService: "Laboratory Tests",
        unitType: "Visits",
        unitsCount: 1,
        validityType: "Days",
        validityValue: 7,
        recommendedSchedule: "",
        maxPerDay: "",
        description: "",
        isActive: true,
        updatedAt: "2026-02-18 11:04"
      },
      {
        id: "PKG-0011",
        name: "Comprehensive Check-up Package",
        nameEn: "Comprehensive Check-up Package",
        nameAr: "",
        code: "LAB-CHECK",
        mainService: "Laboratory Tests",
        unitType: "Visits",
        unitsCount: 1,
        validityType: "Days",
        validityValue: 7,
        recommendedSchedule: "",
        maxPerDay: "",
        description: "",
        isActive: false,
        updatedAt: "2026-02-18 11:12"
      },
      {
        id: "PKG-0012",
        name: "Telemedicine Starter",
        nameEn: "Telemedicine Starter",
        nameAr: "",
        code: "TM-S03",
        mainService: "Telemedicine",
        unitType: "Sessions",
        unitsCount: 3,
        validityType: "Months",
        validityValue: 1,
        recommendedSchedule: "",
        maxPerDay: "",
        description: "",
        isActive: true,
        updatedAt: "2026-02-17 09:44"
      },
      {
        id: "PKG-0013",
        name: "Remote Follow-up Monthly",
        nameEn: "Remote Follow-up Monthly",
        nameAr: "",
        code: "RF-V04",
        mainService: "Remote Follow-up",
        unitType: "Visits",
        unitsCount: 4,
        validityType: "Months",
        validityValue: 1,
        recommendedSchedule: "1 visit/week",
        maxPerDay: "",
        description: "",
        isActive: true,
        updatedAt: "2026-02-17 10:05"
      },
      {
        id: "PKG-0014",
        name: "Consultation Trio",
        nameEn: "Consultation Trio",
        nameAr: "",
        code: "CLN-V03",
        mainService: "In-Clinic Doctor Consultation",
        unitType: "Visits",
        unitsCount: 3,
        validityType: "Days",
        validityValue: 30,
        recommendedSchedule: "",
        maxPerDay: "",
        description: "",
        isActive: true,
        updatedAt: "2026-02-16 14:27"
      },
      {
        id: "PKG-0015",
        name: "Home Nursing Day Shift",
        nameEn: "Home Nursing Day Shift",
        nameAr: "",
        code: "HN-D08",
        mainService: "Home Nursing",
        unitType: "Hours",
        unitsCount: 8,
        validityType: "Days",
        validityValue: 1,
        recommendedSchedule: "",
        maxPerDay: 1,
        description: "",
        isActive: true,
        updatedAt: "2026-02-16 15:00"
      },
      {
        id: "PKG-0016",
        name: "Home Nursing Weekly",
        nameEn: "Home Nursing Weekly",
        nameAr: "",
        code: "HN-V07",
        mainService: "Home Nursing",
        unitType: "Visits",
        unitsCount: 7,
        validityType: "Months",
        validityValue: 1,
        recommendedSchedule: "",
        maxPerDay: 1,
        description: "",
        isActive: false,
        updatedAt: "2026-02-16 15:11"
      }
    ];
  }

  function loadRaw() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }

  function saveRaw(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function normalizeItem(item, index) {
    var source = item || {};
    var id = norm(source.id) || ("PKG-" + pad(index + 1, 4));
    var nameEn = norm(source.nameEn);
    var nameAr = norm(source.nameAr);
    var name = norm(source.name) || nameEn || nameAr || "Untitled Package";
    var unitType = norm(source.unitType);
    var validityType = norm(source.validityType).toLowerCase() === "months" ? "Months" : "Days";
    var unitsCount = toInt(source.unitsCount, 0);
    var validityValue = toInt(source.validityValue, 0);

    if (UNIT_TYPES.indexOf(unitType) === -1) unitType = "Sessions";
    if (unitsCount <= 0) unitsCount = 1;
    if (validityValue <= 0) validityValue = 1;

    return {
      id: id,
      name: name,
      nameEn: nameEn || (nameAr ? "" : name),
      nameAr: nameAr,
      code: upper(source.code),
      mainService: norm(source.mainService),
      unitType: unitType,
      unitsCount: unitsCount,
      validityType: validityType,
      validityValue: validityValue,
      recommendedSchedule: norm(source.recommendedSchedule),
      maxPerDay: norm(source.maxPerDay),
      description: norm(source.description),
      authRequired: Object.prototype.hasOwnProperty.call(source, "authRequired") ? !!source.authRequired : false,
      isActive: Object.prototype.hasOwnProperty.call(source, "isActive") ? !!source.isActive : true,
      updatedAt: norm(source.updatedAt) || nowStamp()
    };
  }

  function ensureData() {
    var stored = loadRaw();
    if (!Array.isArray(stored) || !stored.length) {
      var seeded = createSeed().map(normalizeItem);
      saveRaw(seeded);
      return seeded;
    }

    var normalized = stored.map(normalizeItem);
    saveRaw(normalized);
    return normalized;
  }

  function nextId(items) {
    var max = 0;
    (items || []).forEach(function (item) {
      var match = norm(item && item.id).match(/^PKG-(\d+)$/i);
      if (!match) return;
      var parsed = toInt(match[1], 0);
      if (parsed > max) max = parsed;
    });
    return "PKG-" + pad(max + 1, 4);
  }

  function uniqueCode(candidate, items, excludeId) {
    var base = upper(candidate);
    if (!base) {
      base = "PKG-" + pad((items || []).length + 1, 4);
    }

    var list = items || [];
    var code = base;
    var i = 2;
    while (
      list.some(function (item) {
        if (!item) return false;
        if (excludeId && norm(item.id) === norm(excludeId)) return false;
        return upper(item.code) === code;
      })
    ) {
      code = base + "-" + i;
      i += 1;
    }
    return code;
  }

  function getAll() {
    return clone(ensureData());
  }

  function getById(id) {
    var key = norm(id);
    if (!key) return null;
    var found = ensureData().find(function (item) {
      return norm(item.id) === key;
    });
    return found ? clone(found) : null;
  }

  function upsert(input) {
    var items = ensureData();
    var payload = normalizeItem(input, items.length);
    var targetId = norm(input && input.id);
    var existingIdx = items.findIndex(function (item) {
      return norm(item.id) === targetId;
    });

    if (existingIdx > -1) {
      var existing = items[existingIdx];
      payload.id = existing.id;
      payload.code = uniqueCode(payload.code || existing.code, items, existing.id);
      payload.updatedAt = nowStamp();
      items[existingIdx] = Object.assign({}, existing, payload);
      saveRaw(items);
      return clone(items[existingIdx]);
    }

    payload.id = nextId(items);
    payload.code = uniqueCode(payload.code, items);
    payload.updatedAt = nowStamp();
    items.unshift(payload);
    saveRaw(items);
    return clone(payload);
  }

  function remove(id) {
    var key = norm(id);
    if (!key) return false;
    var items = ensureData();
    var next = items.filter(function (item) {
      return norm(item.id) !== key;
    });
    if (next.length === items.length) return false;
    saveRaw(next);
    return true;
  }

  function duplicate(id) {
    var key = norm(id);
    if (!key) return null;
    var items = ensureData();
    var source = items.find(function (item) {
      return norm(item.id) === key;
    });
    if (!source) return null;

    var copy = clone(source);
    copy.id = nextId(items);
    copy.name = norm(source.name) ? source.name + " (Copy)" : "Package Copy";
    copy.nameEn = norm(source.nameEn) ? source.nameEn + " (Copy)" : copy.name;
    copy.code = uniqueCode((upper(source.code) || copy.id) + "-COPY", items);
    copy.updatedAt = nowStamp();

    items.unshift(copy);
    saveRaw(items);
    return clone(copy);
  }

  function toggleActive(id, isActive) {
    var key = norm(id);
    if (!key) return null;
    var items = ensureData();
    var target = items.find(function (item) {
      return norm(item.id) === key;
    });
    if (!target) return null;

    target.isActive = !!isActive;
    target.updatedAt = nowStamp();
    saveRaw(items);
    return clone(target);
  }

  function formatValidity(item) {
    var value = toInt(item && item.validityValue, 0);
    var isMonths = norm(item && item.validityType).toLowerCase() === "months";
    if (value <= 0) return "-";
    if (isMonths) return value + " " + (value === 1 ? "Month" : "Months");
    return value + " " + (value === 1 ? "Day" : "Days");
  }

  function getMainServices(items) {
    var source = Array.isArray(items) ? items : ensureData();
    var map = {};
    var ordered = [];

    DEFAULT_MAIN_SERVICES.forEach(function (name) {
      var key = norm(name).toLowerCase();
      if (!key || map[key]) return;
      map[key] = name;
      ordered.push(name);
    });

    source.forEach(function (item) {
      var value = norm(item && item.mainService);
      var key = value.toLowerCase();
      if (!key || map[key]) return;
      map[key] = value;
      ordered.push(value);
    });

    return ordered;
  }

  function setFlash(message, type) {
    try {
      sessionStorage.setItem(
        FLASH_KEY,
        JSON.stringify({
          message: norm(message),
          type: norm(type) || "success"
        })
      );
    } catch (err) {
      // noop
    }
  }

  function consumeFlash() {
    try {
      var raw = sessionStorage.getItem(FLASH_KEY);
      if (!raw) return null;
      sessionStorage.removeItem(FLASH_KEY);
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      return {
        message: norm(parsed.message),
        type: norm(parsed.type) || "success"
      };
    } catch (err) {
      return null;
    }
  }

  global.NKInsurancePackageStore = {
    keys: {
      storage: STORAGE_KEY,
      flash: FLASH_KEY
    },
    nowStamp: nowStamp,
    getAll: getAll,
    getById: getById,
    upsert: upsert,
    remove: remove,
    duplicate: duplicate,
    toggleActive: toggleActive,
    formatValidity: formatValidity,
    getMainServices: getMainServices,
    getUnitTypes: function () {
      return clone(UNIT_TYPES);
    },
    getValidityTypes: function () {
      return clone(VALIDITY_TYPES);
    },
    setFlash: setFlash,
    consumeFlash: consumeFlash
  };
})(window);
