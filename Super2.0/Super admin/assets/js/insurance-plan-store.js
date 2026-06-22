(function (global) {
  "use strict";

  var KEY_ENTITIES = "nk_insurance_entities_v1";
  var KEY_PLANS = "nk_insurance_plans_v1";
  var STATIC_CODES = ["IN-00001", "IN-00002", "IN-00003", "IN-00004"];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function toDateIsoOnly() {
    return nowIso().slice(0, 10);
  }

  function addDaysIso(days) {
    var d = new Date();
    d.setDate(d.getDate() + (parseInt(days, 10) || 0));
    return d.toISOString().slice(0, 10);
  }

  function norm(value) {
    return String(value || "").trim();
  }

  function codeNorm(value) {
    return norm(value).toUpperCase();
  }

  function slug(value) {
    return norm(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "id";
  }

  function uniqueId(prefix) {
    var part = Math.random().toString(36).slice(2, 9);
    return String(prefix || "id") + "_" + part;
  }

  function toNum(value, fallback) {
    var n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function loadJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return clone(fallback);
      var parsed = JSON.parse(raw);
      if (parsed == null) return clone(fallback);
      return parsed;
    } catch (err) {
      return clone(fallback);
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getServices() {
    if (global.NKInsuranceServiceCatalog && typeof global.NKInsuranceServiceCatalog.getServices === "function") {
      return global.NKInsuranceServiceCatalog.getServices();
    }
    return [];
  }

  function defaultRule(service) {
    return {
      serviceId: norm(service && service.id),
      serviceName: norm(service && service.service),
      mainServiceName: norm(service && service.main),
      coveragePercent: 80,
      copayType: "percent",
      copayValue: 20,
      maxCoveragePerVisit: toNum(service && service.price, 0),
      preAuthRequired: false,
      active: true
    };
  }

  function defaultClass(name) {
    var services = getServices();
    return {
      classId: uniqueId("class"),
      className: norm(name) || "General",
      rules: services.map(defaultRule)
    };
  }

  function defaultPlan(index) {
    return {
      planId: uniqueId("plan"),
      planName: "Plan " + String(index || 1),
      planCode: "",
      isActive: true,
      classes: [defaultClass("General")]
    };
  }

  function buildDefaultConfig(insuranceCode) {
    return {
      insuranceCode: codeNorm(insuranceCode) || "",
      plans: [defaultPlan(1)],
      updatedAt: nowIso(),
      version: 1
    };
  }

  function normalizeRule(rule, serviceMap) {
    var service = serviceMap[codeNorm(rule && rule.serviceId)] || null;
    var out = service ? defaultRule(service) : defaultRule({});

    out.serviceId = codeNorm(rule && rule.serviceId) || codeNorm(out.serviceId);
    out.serviceName = norm(rule && rule.serviceName) || out.serviceName;
    out.mainServiceName = norm(rule && rule.mainServiceName) || out.mainServiceName;
    out.coveragePercent = toNum(rule && rule.coveragePercent, out.coveragePercent);
    out.copayType = norm(rule && rule.copayType).toLowerCase() || out.copayType;
    out.copayValue = toNum(rule && rule.copayValue, out.copayValue);
    out.maxCoveragePerVisit = toNum(rule && rule.maxCoveragePerVisit, out.maxCoveragePerVisit);
    out.preAuthRequired = !!(rule && rule.preAuthRequired);
    out.active = Object.prototype.hasOwnProperty.call(rule || {}, "active") ? !!rule.active : true;

    if (out.copayType !== "none" && out.copayType !== "fixed" && out.copayType !== "percent") {
      out.copayType = "percent";
    }
    if (out.copayType === "none") out.copayValue = 0;

    return out;
  }

  function normalizeClass(planClass, serviceMap) {
    var className = norm(planClass && planClass.className) || "General";
    var rules = Array.isArray(planClass && planClass.rules) ? planClass.rules : [];
    var byService = {};

    rules.forEach(function (rule) {
      var key = codeNorm(rule && rule.serviceId);
      if (!key) return;
      byService[key] = normalizeRule(rule, serviceMap);
    });

    Object.keys(serviceMap).forEach(function (serviceId) {
      if (!byService[serviceId]) byService[serviceId] = defaultRule(serviceMap[serviceId]);
    });

    return {
      classId: norm(planClass && planClass.classId) || uniqueId("class"),
      className: className,
      rules: Object.keys(serviceMap).map(function (serviceId) {
        return byService[serviceId];
      })
    };
  }

  function normalizePlan(plan, serviceMap, idx) {
    var classes = Array.isArray(plan && plan.classes) ? plan.classes : [];
    var normalizedClasses = classes.map(function (cls) {
      return normalizeClass(cls, serviceMap);
    });

    if (!normalizedClasses.length) normalizedClasses.push(defaultClass("General"));

    return {
      planId: norm(plan && plan.planId) || uniqueId("plan"),
      planName: norm(plan && plan.planName) || "Plan " + String(idx + 1),
      planCode: norm(plan && plan.planCode),
      isActive: Object.prototype.hasOwnProperty.call(plan || {}, "isActive") ? !!plan.isActive : true,
      classes: normalizedClasses
    };
  }

  function normalizeConfig(config, insuranceCode) {
    var services = getServices();
    var serviceMap = {};
    services.forEach(function (service) {
      serviceMap[codeNorm(service.id)] = clone(service);
    });

    var plans = Array.isArray(config && config.plans) ? config.plans : [];
    var normalizedPlans = plans.map(function (plan, idx) {
      return normalizePlan(plan, serviceMap, idx);
    });
    if (!normalizedPlans.length) normalizedPlans = [defaultPlan(1)];

    return {
      insuranceCode: codeNorm((config && config.insuranceCode) || insuranceCode),
      plans: normalizedPlans,
      updatedAt: norm(config && config.updatedAt) || nowIso(),
      version: 1
    };
  }

  function validateConfig(inputConfig) {
    var config = normalizeConfig(inputConfig, inputConfig && inputConfig.insuranceCode);
    var errors = [];
    var planNameSet = {};

    if (!Array.isArray(config.plans) || !config.plans.length) {
      errors.push({ path: "plans", message: "At least one plan is required." });
      return { ok: false, errors: errors, config: config };
    }

    config.plans.forEach(function (plan, planIdx) {
      var planNameKey = norm(plan.planName).toLowerCase();
      if (!planNameKey) {
        errors.push({ path: "plans[" + planIdx + "].planName", message: "Plan name is required." });
      } else if (planNameSet[planNameKey]) {
        errors.push({ path: "plans[" + planIdx + "].planName", message: "Plan name must be unique." });
      } else {
        planNameSet[planNameKey] = true;
      }

      if (!Array.isArray(plan.classes) || !plan.classes.length) {
        errors.push({ path: "plans[" + planIdx + "].classes", message: "Each plan needs at least one class." });
        return;
      }

      var classNameSet = {};
      plan.classes.forEach(function (planClass, classIdx) {
        var classNameKey = norm(planClass.className).toLowerCase();
        if (!classNameKey) {
          errors.push({
            path: "plans[" + planIdx + "].classes[" + classIdx + "].className",
            message: "Class name is required."
          });
        } else if (classNameSet[classNameKey]) {
          errors.push({
            path: "plans[" + planIdx + "].classes[" + classIdx + "].className",
            message: "Class name must be unique inside plan."
          });
        } else {
          classNameSet[classNameKey] = true;
        }

        var rules = Array.isArray(planClass.rules) ? planClass.rules : [];
        rules.forEach(function (rule, ruleIdx) {
          var coverage = toNum(rule.coveragePercent, NaN);
          var copayType = norm(rule.copayType).toLowerCase();
          var copayValue = toNum(rule.copayValue, NaN);
          var maxCoverage = toNum(rule.maxCoveragePerVisit, NaN);
          var basePath = "plans[" + planIdx + "].classes[" + classIdx + "].rules[" + ruleIdx + "]";

          if (!Number.isFinite(coverage) || coverage < 0 || coverage > 100) {
            errors.push({ path: basePath + ".coveragePercent", message: "Coverage must be between 0 and 100." });
          }

          if (copayType !== "none" && copayType !== "fixed" && copayType !== "percent") {
            errors.push({ path: basePath + ".copayType", message: "Copay type is invalid." });
          }

          if (copayType === "percent") {
            if (!Number.isFinite(copayValue) || copayValue < 0 || copayValue > 100) {
              errors.push({ path: basePath + ".copayValue", message: "Copay percent must be between 0 and 100." });
            }
            if (Number.isFinite(coverage) && Number.isFinite(copayValue) && coverage + copayValue > 100) {
              errors.push({
                path: basePath + ".copayValue",
                message: "Coverage + copay percent must be <= 100."
              });
            }
          }

          if (copayType === "fixed" && (!Number.isFinite(copayValue) || copayValue < 0)) {
            errors.push({ path: basePath + ".copayValue", message: "Fixed copay must be >= 0." });
          }

          if (copayType === "none" && (!Number.isFinite(copayValue) || copayValue !== 0)) {
            errors.push({ path: basePath + ".copayValue", message: "Copay must be 0 when type is none." });
          }

          if (!Number.isFinite(maxCoverage) || maxCoverage < 0) {
            errors.push({
              path: basePath + ".maxCoveragePerVisit",
              message: "Max coverage per visit must be >= 0."
            });
          }
        });
      });
    });

    return { ok: errors.length === 0, errors: errors, config: config };
  }

  function getPlanMap() {
    return loadJson(KEY_PLANS, {});
  }

  function savePlanMap(map) {
    saveJson(KEY_PLANS, map || {});
  }

  function getConfig(code) {
    var c = codeNorm(code);
    if (!c) return null;
    var map = getPlanMap();
    if (!map[c]) return null;
    return normalizeConfig(map[c], c);
  }

  function saveConfig(code, inputConfig) {
    var c = codeNorm(code || (inputConfig && inputConfig.insuranceCode));
    if (!c) return { ok: false, errors: [{ path: "insuranceCode", message: "Insurance code is required." }] };

    var result = validateConfig(Object.assign({}, inputConfig, { insuranceCode: c }));
    if (!result.ok) return result;

    var map = getPlanMap();
    var normalized = clone(result.config);
    normalized.insuranceCode = c;
    normalized.updatedAt = nowIso();
    map[c] = normalized;
    savePlanMap(map);
    return { ok: true, errors: [], config: normalized };
  }

  function initDefaultConfig(code) {
    var c = codeNorm(code);
    if (!c) return null;
    var existing = getConfig(c);
    if (existing) return existing;
    var created = buildDefaultConfig(c);
    saveConfig(c, created);
    return getConfig(c);
  }

  function getEntities() {
    var entities = loadJson(KEY_ENTITIES, []);
    if (!Array.isArray(entities)) return [];
    return entities
      .map(function (entity) {
        if (!entity || typeof entity !== "object") return null;
        var code = codeNorm(entity.code);
        if (!code) return null;
        var output = clone(entity);
        output.code = code;
        output.type = norm(output.type) || "Insurance Company";
        output.status = norm(output.status) || "pending";
        output.contract = norm(output.contract).toLowerCase() || "pending";
        output.submittedAt = norm(output.submittedAt) || toDateIsoOnly();
        output.updatedAt = norm(output.updatedAt) || output.submittedAt;
        output.completedOrders = toNum(output.completedOrders, 0);
        output.totalOrders = toNum(output.totalOrders, 0);
        output.license = output.license || {};
        output.license.number = norm(output.license.number) || norm(output.payerLicenseNo);
        output.license.issuer = norm(output.license.issuer) || "Council of Cooperative Health Insurance";
        output.license.expiry = norm(output.license.expiry) || addDaysIso(365);
        output.license.attachmentName = norm(output.license.attachmentName) || "Payer_License_Proof.pdf";
        output.documents = Array.isArray(output.documents) ? output.documents : [];
        output.source = "local";
        return output;
      })
      .filter(Boolean);
  }

  function saveEntities(entities) {
    saveJson(KEY_ENTITIES, Array.isArray(entities) ? entities : []);
  }

  function upsertEntity(entity) {
    var code = codeNorm(entity && entity.code);
    if (!code) return null;

    var list = getEntities();
    var idx = list.findIndex(function (item) {
      return codeNorm(item.code) === code;
    });
    var payload = clone(entity);
    payload.code = code;
    payload.updatedAt = nowIso().slice(0, 10);
    if (!payload.submittedAt) payload.submittedAt = payload.updatedAt;

    if (idx >= 0) list[idx] = payload;
    else list.push(payload);
    saveEntities(list);
    return payload;
  }

  function getEntity(code) {
    var c = codeNorm(code);
    if (!c) return null;
    var entities = getEntities();
    return entities.find(function (entity) {
      return codeNorm(entity.code) === c;
    }) || null;
  }

  function getAllCodes() {
    var set = {};
    STATIC_CODES.forEach(function (code) {
      set[codeNorm(code)] = true;
    });
    getEntities().forEach(function (entity) {
      set[codeNorm(entity.code)] = true;
    });
    return Object.keys(set);
  }

  function nextInsuranceCode() {
    var max = 0;
    getAllCodes().forEach(function (code) {
      var m = String(code || "").match(/^IN-(\d+)$/i);
      if (!m) return;
      var n = parseInt(m[1], 10);
      if (Number.isFinite(n) && n > max) max = n;
    });
    var next = String(max + 1).padStart(5, "0");
    return "IN-" + next;
  }

  global.NKInsurancePlanStore = {
    keys: {
      entities: KEY_ENTITIES,
      plans: KEY_PLANS
    },
    getServices: getServices,
    defaultRule: defaultRule,
    defaultClass: defaultClass,
    defaultPlan: defaultPlan,
    buildDefaultConfig: buildDefaultConfig,
    normalizeConfig: normalizeConfig,
    validateConfig: validateConfig,
    getConfig: getConfig,
    saveConfig: saveConfig,
    initDefaultConfig: initDefaultConfig,
    getEntities: getEntities,
    saveEntities: saveEntities,
    upsertEntity: upsertEntity,
    getEntity: getEntity,
    nextInsuranceCode: nextInsuranceCode,
    nowIso: nowIso,
    toDateIsoOnly: toDateIsoOnly,
    addDaysIso: addDaysIso,
    slug: slug
  };
})(window);
