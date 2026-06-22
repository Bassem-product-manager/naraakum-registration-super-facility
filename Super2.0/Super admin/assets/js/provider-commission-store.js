(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.NKProviderCommissionStore = factory();
  }
})(typeof window !== "undefined" ? window : globalThis, function () {
  var STORAGE_KEY = "nk_provider_commission_rules_v1";

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

  function nowIso() {
    return new Date().toISOString();
  }

  function normalizeProviderType(value) {
    var type = lower(value);
    if (type === "pharm" || type === "pharmacy") return "pharmacy";
    if (type === "individual" || type === "doctor" || type === "staff") return "individual";
    return "facility";
  }

  function normalizeMode(value) {
    return lower(value) === "fixed" ? "fixed" : "percent";
  }

  function normalizeAppliesTo(value) {
    var scope = lower(value);
    if (scope === "self_pay") return "self_pay";
    if (scope === "insurance") return "insurance";
    return "all_orders";
  }

  function normalizeStatus(value) {
    return lower(value) === "draft" ? "draft" : "active";
  }

  function ruleKey(providerType, providerCode) {
    return normalizeProviderType(providerType) + ":" + upper(providerCode);
  }

  function normalizeRule(rule) {
    var input = rule || {};
    var value = round2(input.value);

    return {
      providerType: normalizeProviderType(input.providerType),
      providerCode: upper(input.providerCode),
      mode: normalizeMode(input.mode),
      value: value > 0 ? value : 0,
      appliesTo: normalizeAppliesTo(input.appliesTo),
      status: normalizeStatus(input.status),
      notes: norm(input.notes),
      updatedAt: input.updatedAt || nowIso()
    };
  }

  function emptyRule(providerType, providerCode) {
    return normalizeRule({
      providerType: providerType,
      providerCode: providerCode,
      mode: "percent",
      value: 0,
      appliesTo: "all_orders",
      status: "active"
    });
  }

  function isConfigured(rule) {
    return !!rule && Number(rule.value) > 0;
  }

  function formatNumber(value) {
    var num = round2(value);
    return num % 1 === 0 ? String(num) : num.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  }

  function formatRuleSummary(rule) {
    var normalized = normalizeRule(rule);
    if (!isConfigured(normalized)) return "Not set";
    if (normalized.mode === "fixed") return "Fixed " + normalized.value.toFixed(2) + " SAR";
    return formatNumber(normalized.value) + "%";
  }

  function calculateCommission(amount, rule) {
    var base = round2(amount);
    var normalized = normalizeRule(rule);
    if (!isConfigured(normalized)) return 0;
    if (normalized.mode === "fixed") return normalized.value;
    return round2(base * normalized.value / 100);
  }

  function readAll() {
    if (typeof localStorage === "undefined") return {};
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function writeAll(data) {
    if (typeof localStorage === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data || {}));
    } catch (e) {
      // Storage may be disabled in private browsing.
    }
  }

  function getRule(providerType, providerCode) {
    var key = ruleKey(providerType, providerCode);
    var all = readAll();
    return all[key] ? normalizeRule(all[key]) : emptyRule(providerType, providerCode);
  }

  function setRule(rule) {
    var normalized = normalizeRule(rule);
    if (!normalized.providerCode) return normalized;
    var all = readAll();
    all[ruleKey(normalized.providerType, normalized.providerCode)] = normalized;
    writeAll(all);
    return normalized;
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    normalizeRule: normalizeRule,
    normalizeProviderType: normalizeProviderType,
    normalizeMode: normalizeMode,
    normalizeAppliesTo: normalizeAppliesTo,
    normalizeStatus: normalizeStatus,
    ruleKey: ruleKey,
    getRule: getRule,
    setRule: setRule,
    isConfigured: isConfigured,
    formatRuleSummary: formatRuleSummary,
    calculateCommission: calculateCommission,
    round2: round2
  };
});
