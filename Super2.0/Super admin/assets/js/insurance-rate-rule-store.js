(function (global) {
  "use strict";

  var RULES_KEY = "nk_insurance_rate_rules";
  var FLASH_KEY = "nk_insurance_rate_rules_flash";
  var PACKAGES_KEY = "nk_insurance_packages";
  var PACKAGES_FALLBACK_KEY = "nk_insurance_package_templates_v1";
  var PLANS_KEY = "nk_insurance_rate_plans";
  var CLASSES_KEY = "nk_insurance_rate_classes";

  var INSURANCE_COMPANIES = [
    { code: "IN-00001", name: "BMC Insurance Co." },
    { code: "IN-00002", name: "Tawuniya" },
    { code: "IN-00003", name: "Bupa" }
  ];

  var DEFAULT_PLANS = ["Default", "Silver", "Gold"];
  var DEFAULT_CLASSES = ["General", "A", "B", "C"];
  var MAIN_SERVICE_ORDER = ["Online Consultation", "Home Visits", "Laboratory Tests", "Remote Follow-up"];

  var SERVICE_CATALOG = {
    "Online Consultation": [
      { name: "Video Consultation", code: "TM-VID", unit: "Session" },
      { name: "Audio Consultation", code: "TM-AUD", unit: "Session" }
    ],
    "Home Visits": [
      { name: "Home Doctor Visit", code: "HV-DOCTOR", unit: "Visit" },
      { name: "Home Nursing Visit", code: "HV-NURSE", unit: "Visit" },
      { name: "Physiotherapy Session", code: "HV-PT", unit: "Session" },
      { name: "Home Dialysis Session", code: "HV-HD", unit: "Session" },
      { name: "Health Companion Visit", code: "HV-COMP", unit: "Visit" }
    ],
    "Laboratory Tests": [
      { name: "Lab Sample Collection", code: "LAB-COLL", unit: "Visit" },
      { name: "Comprehensive Blood Panel", code: "LAB-CBP", unit: "Visit" }
    ],
    "Remote Follow-up": [
      { name: "Chronic Case Follow-up", code: "RF-CHR", unit: "Visit" },
      { name: "Post-Visit Follow-up", code: "RF-PV", unit: "Visit" }
    ]
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function norm(value) {
    return String(value == null ? "" : value).trim();
  }

  function lower(value) {
    return norm(value).toLowerCase();
  }

  function pad(value, size) {
    return String(value).padStart(size, "0");
  }

  function toNumOrBlank(value) {
    if (value === "" || value == null) return "";
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : "";
  }

  function toIntOrBlank(value) {
    if (value === "" || value == null) return "";
    var parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : "";
  }

  function uniqueNameList(list) {
    var out = [];
    var map = {};
    (Array.isArray(list) ? list : []).forEach(function (item) {
      var value = norm(item);
      var key = lower(value);
      if (!value || map[key]) return;
      map[key] = true;
      out.push(value);
    });
    return out;
  }

  function ensureNamedList(key, defaults) {
    var stored = readJson(key);
    var list = uniqueNameList(stored);
    if (!list.length) list = clone(defaults);
    writeJson(key, list);
    return list;
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

  function uniqueId(items) {
    var max = 0;
    (items || []).forEach(function (row) {
      var match = norm(row && row.id).match(/^RR-(\d+)$/i);
      if (!match) return;
      var num = parseInt(match[1], 10);
      if (Number.isFinite(num) && num > max) max = num;
    });
    return "RR-" + pad(max + 1, 4);
  }

  function normalizeCopayType(value) {
    var clean = lower(value);
    if (clean === "fixed") return "Fixed";
    if (clean === "percent") return "Percent";
    return "None";
  }

  function normalizeTargetType(value) {
    return lower(value) === "package" ? "package" : "service";
  }

  function mapMainService(value) {
    var key = lower(value);
    if (!key) return "";
    if (key === "online consultation" || key === "telemedicine" || key === "video consultation") return "Online Consultation";
    if (key === "home visits" || key === "home doctor visit" || key === "home nursing visit") return "Home Visits";
    if (key === "physiotherapy" || key === "hemodialysis" || key === "health companion" || key === "in-clinic doctor consultation") {
      return "Home Visits";
    }
    if (key === "laboratory tests" || key === "lab sample collection" || key === "laboratory services") return "Laboratory Tests";
    if (key === "remote follow-up") return "Remote Follow-up";
    return "";
  }

  function inferMainServiceFromCode(code) {
    var key = lower(code);
    if (!key) return "";
    if (key.indexOf("tm-") === 0) return "Online Consultation";
    if (key.indexOf("rf-") === 0) return "Remote Follow-up";
    if (key.indexOf("lab-") === 0) return "Laboratory Tests";
    if (
      key.indexOf("hv-") === 0 ||
      key.indexOf("hn-") === 0 ||
      key.indexOf("pt-") === 0 ||
      key.indexOf("hd-") === 0 ||
      key.indexOf("hc-") === 0 ||
      key.indexOf("cl-") === 0
    ) {
      return "Home Visits";
    }
    return "";
  }

  function normalizeDocs(list) {
    if (!Array.isArray(list)) return [];
    var map = {};
    var out = [];
    list.forEach(function (doc) {
      var value = norm(doc);
      if (!value) return;
      var key = lower(value);
      if (map[key]) return;
      map[key] = true;
      out.push(value);
    });
    return out;
  }

  function normalizeRule(rule, index) {
    var src = rule || {};
    var mappedMainService = mapMainService(src.mainService) || inferMainServiceFromCode(src.targetCode);
    return {
      id: norm(src.id) || ("RR-" + pad(index + 1, 4)),
      insuranceCompanyCode: norm(src.insuranceCompanyCode),
      insuranceCompanyName: norm(src.insuranceCompanyName),
      plan: norm(src.plan) || "Default",
      class: norm(src.class) || "General",
      targetType: normalizeTargetType(src.targetType),
      mainService: mappedMainService,
      targetCode: norm(src.targetCode),
      targetName: norm(src.targetName),
      unit: norm(src.unit),
      unitsCount: toIntOrBlank(src.unitsCount),
      covered: !!src.covered,
      coveragePct: toNumOrBlank(src.coveragePct),
      copayType: normalizeCopayType(src.copayType),
      copayValue: toNumOrBlank(src.copayValue),
      maxCoverageCap: toNumOrBlank(src.maxCoverageCap),
      authRequired: !!src.authRequired,
      limits: {
        perMonth: toIntOrBlank(src.limits && src.limits.perMonth),
        perYear: toIntOrBlank(src.limits && src.limits.perYear),
        approvalValidityDays: toIntOrBlank(src.limits && src.limits.approvalValidityDays)
      },
      notes: norm(src.notes),
      requiredDocs: normalizeDocs(src.requiredDocs),
      isActive: Object.prototype.hasOwnProperty.call(src, "isActive") ? !!src.isActive : true,
      updatedAt: norm(src.updatedAt) || nowStamp()
    };
  }

  function createSeedRules() {
    return [
      normalizeRule(
        {
          id: "RR-0001",
          insuranceCompanyCode: "IN-00001",
          insuranceCompanyName: "BMC Insurance Co.",
          plan: "Default",
          class: "General",
          targetType: "service",
          mainService: "Online Consultation",
          targetCode: "TM-VID",
          targetName: "Video Consultation",
          unit: "Session",
          covered: true,
          coveragePct: 80,
          copayType: "Percent",
          copayValue: 20,
          authRequired: false,
          maxCoverageCap: "",
          isActive: true,
          updatedAt: "2026-02-24 10:11"
        },
        0
      ),
      normalizeRule(
        {
          id: "RR-0002",
          insuranceCompanyCode: "IN-00002",
          insuranceCompanyName: "Tawuniya",
          plan: "Silver",
          class: "A",
          targetType: "service",
          mainService: "Home Visits",
          targetCode: "HV-DOCTOR",
          targetName: "Home Doctor Visit",
          unit: "Visit",
          covered: true,
          coveragePct: 70,
          copayType: "Fixed",
          copayValue: 50,
          authRequired: true,
          maxCoverageCap: 1000,
          isActive: true,
          updatedAt: "2026-02-24 11:33"
        },
        1
      ),
      normalizeRule(
        {
          id: "RR-0003",
          insuranceCompanyCode: "IN-00003",
          insuranceCompanyName: "Bupa",
          plan: "Gold",
          class: "General",
          targetType: "package",
          mainService: "Laboratory Tests",
          targetCode: "LAB-CHECK",
          targetName: "Comprehensive Check-up Package",
          unit: "Visits",
          unitsCount: 1,
          covered: true,
          coveragePct: 90,
          copayType: "None",
          copayValue: "",
          authRequired: false,
          maxCoverageCap: "",
          isActive: true,
          updatedAt: "2026-02-24 12:08"
        },
        2
      )
    ];
  }

  function readJson(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function ensurePlans() {
    return ensureNamedList(PLANS_KEY, DEFAULT_PLANS);
  }

  function ensureClasses() {
    return ensureNamedList(CLASSES_KEY, DEFAULT_CLASSES);
  }

  function ensureRules() {
    var rows = readJson(RULES_KEY);
    if (!Array.isArray(rows) || !rows.length) {
      var seeded = createSeedRules();
      writeJson(RULES_KEY, seeded);
      return seeded;
    }
    var normalized = rows.map(normalizeRule);
    writeJson(RULES_KEY, normalized);
    return normalized;
  }

  function normalizePackage(source, index) {
    var item = source || {};
    var name = norm(item.name) || norm(item.nameEn) || norm(item.nameAr) || "Package " + (index + 1);
    var code = norm(item.code) || "PKG-" + pad(index + 1, 3);
    var validityType = norm(item.validityType);
    var validityValue = toIntOrBlank(item.validityValue);
    return {
      id: norm(item.id) || code,
      name: name,
      code: code,
      mainService: mapMainService(item.mainService) || inferMainServiceFromCode(code),
      unitType: norm(item.unitType) || norm(item.unit) || "",
      unitsCount: toIntOrBlank(item.unitsCount),
      validityType: validityType,
      validityValue: validityValue,
      isActive: Object.prototype.hasOwnProperty.call(item, "isActive") ? !!item.isActive : true
    };
  }

  function getPackages() {
    var primary = readJson(PACKAGES_KEY);
    if (Array.isArray(primary) && primary.length) {
      return primary.map(normalizePackage);
    }

    var legacy = readJson(PACKAGES_FALLBACK_KEY);
    if (Array.isArray(legacy) && legacy.length) {
      return legacy.map(normalizePackage);
    }

    return [];
  }

  function getMainServices() {
    return clone(MAIN_SERVICE_ORDER);
  }

  function getServicesByMainService(mainService) {
    var value = mapMainService(mainService);
    if (!value) return [];
    var items = SERVICE_CATALOG[value];
    return Array.isArray(items) ? clone(items) : [];
  }

  function findService(mainService, code) {
    var key = lower(code);
    var list = getServicesByMainService(mainService);
    for (var i = 0; i < list.length; i += 1) {
      if (lower(list[i].code) === key) return clone(list[i]);
    }
    return null;
  }

  function findPackage(mainService, code) {
    var codeKey = lower(code);
    var mainKey = lower(mapMainService(mainService));
    var list = getPackages();
    for (var i = 0; i < list.length; i += 1) {
      var pkg = list[i];
      if (mainKey && lower(pkg.mainService) !== mainKey) continue;
      if (lower(pkg.code) === codeKey) return clone(pkg);
    }
    return null;
  }

  function getRules() {
    return clone(ensureRules());
  }

  function getRuleById(id) {
    var key = lower(id);
    if (!key) return null;
    var found = ensureRules().find(function (row) {
      return lower(row.id) === key;
    });
    return found ? clone(found) : null;
  }

  function upsertRule(input) {
    var rows = ensureRules();
    var payload = normalizeRule(input, rows.length);
    var key = lower(input && input.id);
    var idx = rows.findIndex(function (row) {
      return lower(row.id) === key;
    });

    payload.updatedAt = nowStamp();
    if (idx > -1) {
      payload.id = rows[idx].id;
      rows[idx] = Object.assign({}, rows[idx], payload);
      writeJson(RULES_KEY, rows);
      return clone(rows[idx]);
    }

    payload.id = uniqueId(rows);
    rows.unshift(payload);
    writeJson(RULES_KEY, rows);
    return clone(payload);
  }

  function toggleActive(id, isActive) {
    var key = lower(id);
    if (!key) return null;
    var rows = ensureRules();
    var target = rows.find(function (row) {
      return lower(row.id) === key;
    });
    if (!target) return null;
    target.isActive = !!isActive;
    target.updatedAt = nowStamp();
    writeJson(RULES_KEY, rows);
    return clone(target);
  }

  function removeRule(id) {
    var key = lower(id);
    if (!key) return false;
    var rows = ensureRules();
    var next = rows.filter(function (row) {
      return lower(row.id) !== key;
    });
    if (next.length === rows.length) return false;
    writeJson(RULES_KEY, next);
    return true;
  }

  function uniqueCode(baseCode, rows) {
    var base = norm(baseCode) || "COPY";
    var code = base;
    var count = 2;
    while (
      rows.some(function (row) {
        return lower(row.targetCode) === lower(code);
      })
    ) {
      code = base + "-" + count;
      count += 1;
    }
    return code;
  }

  function duplicateRule(id) {
    var key = lower(id);
    if (!key) return null;

    var rows = ensureRules();
    var source = rows.find(function (row) {
      return lower(row.id) === key;
    });
    if (!source) return null;

    var copy = clone(source);
    copy.id = uniqueId(rows);
    copy.targetName = norm(source.targetName) ? source.targetName + " (Copy)" : "Rate Rule Copy";
    copy.targetCode = uniqueCode(norm(source.targetCode) + "-COPY", rows);
    copy.updatedAt = nowStamp();
    rows.unshift(copy);
    writeJson(RULES_KEY, rows);
    return clone(copy);
  }

  function formatCoverage(rule) {
    if (!rule) return "-";
    if (rule.coveragePct === "" || rule.coveragePct == null) return "-";
    return Number(rule.coveragePct) + "%";
  }

  function formatCopay(rule) {
    if (!rule) return "None";
    if (rule.copayType === "Percent") {
      var p = rule.copayValue === "" ? 0 : Number(rule.copayValue);
      return p + "%";
    }
    if (rule.copayType === "Fixed") {
      var f = rule.copayValue === "" ? 0 : Number(rule.copayValue);
      return "SAR " + f;
    }
    return "None";
  }

  function hasCoverageCopayWarning(rule) {
    if (!rule || rule.copayType !== "Percent") return false;
    if (rule.coveragePct === "" || rule.copayValue === "") return false;
    return Number(rule.coveragePct) + Number(rule.copayValue) > 100;
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
      return {
        message: norm(parsed && parsed.message),
        type: norm(parsed && parsed.type) || "success"
      };
    } catch (err) {
      return null;
    }
  }

  function updateRulesScopeValue(fieldName, oldValue, newValue) {
    var oldKey = lower(oldValue);
    var nextName = norm(newValue);
    if (!oldKey || !nextName) return;

    var rows = ensureRules();
    var touched = false;
    rows.forEach(function (row) {
      if (lower(row[fieldName]) !== oldKey) return;
      row[fieldName] = nextName;
      row.updatedAt = nowStamp();
      touched = true;
    });
    if (touched) writeJson(RULES_KEY, rows);
  }

  function upsertScopeItem(listKey, defaults, fieldName, oldName, newName) {
    var nextName = norm(newName);
    if (!nextName) return null;

    var items = ensureNamedList(listKey, defaults);
    var oldKey = lower(oldName);
    var existsIdx = items.findIndex(function (item) {
      return lower(item) === lower(nextName);
    });

    if (oldKey) {
      var oldIdx = items.findIndex(function (item) {
        return lower(item) === oldKey;
      });
      if (oldIdx > -1) {
        if (existsIdx > -1 && existsIdx !== oldIdx) {
          items.splice(oldIdx, 1);
        } else {
          items[oldIdx] = nextName;
        }
        writeJson(listKey, uniqueNameList(items));
        if (oldKey !== lower(nextName)) {
          updateRulesScopeValue(fieldName, oldName, nextName);
        }
        return nextName;
      }
    }

    if (existsIdx > -1) return items[existsIdx];
    items.push(nextName);
    writeJson(listKey, uniqueNameList(items));
    return nextName;
  }

  global.NKInsuranceRateRuleStore = {
    keys: {
      rules: RULES_KEY,
      flash: FLASH_KEY,
      packages: PACKAGES_KEY,
      plans: PLANS_KEY,
      classes: CLASSES_KEY
    },
    nowStamp: nowStamp,
    getRules: getRules,
    getRuleById: getRuleById,
    upsertRule: upsertRule,
    toggleActive: toggleActive,
    removeRule: removeRule,
    duplicateRule: duplicateRule,
    getInsuranceCompanies: function () {
      return clone(INSURANCE_COMPANIES);
    },
    getPlans: function () {
      return clone(ensurePlans());
    },
    getClasses: function () {
      return clone(ensureClasses());
    },
    upsertPlan: function (oldName, newName) {
      return upsertScopeItem(PLANS_KEY, DEFAULT_PLANS, "plan", oldName, newName);
    },
    upsertClass: function (oldName, newName) {
      return upsertScopeItem(CLASSES_KEY, DEFAULT_CLASSES, "class", oldName, newName);
    },
    getMainServices: getMainServices,
    getServicesByMainService: getServicesByMainService,
    findService: findService,
    getPackages: getPackages,
    findPackage: findPackage,
    formatCoverage: formatCoverage,
    formatCopay: formatCopay,
    hasCoverageCopayWarning: hasCoverageCopayWarning,
    setFlash: setFlash,
    consumeFlash: consumeFlash
  };
})(window);
