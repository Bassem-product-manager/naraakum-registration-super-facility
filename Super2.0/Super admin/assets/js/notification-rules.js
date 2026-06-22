(function (global) {
  var RULES_STORAGE_KEY = "nk_notification_rules_v2";
  var TEMPLATES_STORAGE_KEY = "nk_notification_templates_v1";

  var MODULES = ["Providers", "Orders", "Staff", "Integrations"];
  var MODULE_EVENT_MAP = {
    Providers: [
      "provider_license_expiry",
      "provider_insurance_expiry",
      "accreditation_cbahi_expiry",
      "accreditation_jci_expiry"
    ],
    Orders: ["order_stuck"],
    Staff: ["staff_unread_queue", "staff_shift_gap"],
    Integrations: []
  };

  var EVENT_META = {
    provider_license_expiry: {
      label: "Provider License Expiry",
      module: "Providers",
      mode: "deadline",
      meaning: "Provider license is close to expiry and renewal should start now.",
      actionHint: "Open provider profile and complete renewal checklist."
    },
    provider_insurance_expiry: {
      label: "Provider Insurance Expiry",
      module: "Providers",
      mode: "deadline",
      meaning: "Provider insurance or malpractice policy is close to expiry.",
      actionHint: "Request updated insurance policy and validate the effective date."
    },
    accreditation_cbahi_expiry: {
      label: "CBAHI Accreditation Expiry",
      module: "Providers",
      mode: "deadline",
      meaning: "CBAHI accreditation for a facility is nearing expiry.",
      actionHint: "Start accreditation document refresh and readiness checks."
    },
    accreditation_jci_expiry: {
      label: "JCI Accreditation Expiry",
      module: "Providers",
      mode: "deadline",
      meaning: "JCI accreditation timeline is approaching renewal.",
      actionHint: "Review missing documents and assign an owner for renewal."
    },
    order_stuck: {
      label: "Order Stuck",
      module: "Orders",
      mode: "elapsed",
      meaning: "Order has not moved to the next status in expected time.",
      actionHint: "Check assignment and unblock the order immediately."
    },
    staff_unread_queue: {
      label: "Staff Inbox Backlog",
      module: "Staff",
      mode: "elapsed",
      meaning: "Internal staff conversations have unread items for too long.",
      actionHint: "Review staff inbox and assign response owner."
    },
    staff_shift_gap: {
      label: "Staff Shift Gap",
      module: "Staff",
      mode: "elapsed",
      meaning: "A required shift is not staffed in time.",
      actionHint: "Assign a replacement and confirm coverage."
    },

  };

  var EVENT_KEYS = Object.keys(EVENT_META);

  function makeRule(enabled, leadValue, leadUnit, repeatEveryValue, repeatEveryUnit) {
    return {
      enabled: enabled,
      leadValue: leadValue,
      leadUnit: leadUnit,
      repeatEveryValue: repeatEveryValue,
      repeatEveryUnit: repeatEveryUnit
    };
  }

  var DEFAULT_RULES = {
    modules: {
      Providers: {
        provider_license_expiry: makeRule(true, 30, "days", 7, "days"),
        provider_insurance_expiry: makeRule(true, 21, "days", 7, "days"),
        accreditation_cbahi_expiry: makeRule(true, 60, "days", 14, "days"),
        accreditation_jci_expiry: makeRule(true, 45, "days", 14, "days")
      },
      Orders: {
        order_stuck: makeRule(true, 90, "minutes", 120, "minutes")
      },
      Staff: {
        staff_unread_queue: makeRule(true, 60, "minutes", 120, "minutes"),
        staff_shift_gap: makeRule(true, 180, "minutes", 240, "minutes")
      },
      Integrations: {}
    }
  };

  var TEMPLATE_FIELD_SET = {
    in_app: ["title", "body", "actionLabel"],
    email: ["subject", "title", "body", "actionLabel"]
  };

  function makeTemplate(title, body, actionLabel, subject, placeholders) {
    return {
      placeholders: placeholders || [],
      in_app: {
        en: { title: title, body: body, actionLabel: actionLabel },
        ar: { title: title, body: body, actionLabel: actionLabel }
      },
      email: {
        en: { subject: subject, title: title, body: body, actionLabel: actionLabel },
        ar: { subject: subject, title: title, body: body, actionLabel: actionLabel }
      }
    };
  }

  var TEMPLATE_DEFAULTS = {
    provider_license_expiry: makeTemplate(
      "Provider license expiry reminder",
      "License for {provider_name} is due on {due_date}.",
      "Review provider profile",
      "License expiry reminder for {provider_name}",
      ["provider_name", "due_date", "module_name"]
    ),
    provider_insurance_expiry: makeTemplate(
      "Provider insurance expiry reminder",
      "Insurance policy for {provider_name} is due on {due_date}.",
      "Review insurance document",
      "Insurance expiry reminder for {provider_name}",
      ["provider_name", "due_date", "module_name"]
    ),
    accreditation_cbahi_expiry: makeTemplate(
      "CBAHI renewal approaching",
      "CBAHI accreditation for {provider_name} is due on {due_date}.",
      "Open accreditation checklist",
      "CBAHI renewal due for {provider_name}",
      ["provider_name", "due_date", "module_name"]
    ),
    accreditation_jci_expiry: makeTemplate(
      "JCI renewal approaching",
      "JCI accreditation for {provider_name} is due on {due_date}.",
      "Open accreditation checklist",
      "JCI renewal due for {provider_name}",
      ["provider_name", "due_date", "module_name"]
    ),
    order_stuck: makeTemplate(
      "Order is stuck",
      "Order {order_id} is stuck for {elapsed_minutes} minutes.",
      "Open order details",
      "Order {order_id} is stuck",
      ["order_id", "elapsed_minutes", "module_name"]
    ),
    staff_unread_queue: makeTemplate(
      "Staff inbox backlog",
      "Unread staff queue reached {queue_count} items.",
      "Open staff inbox",
      "Staff inbox backlog alert",
      ["queue_count", "module_name", "shift_name"]
    ),
    staff_shift_gap: makeTemplate(
      "Shift coverage gap",
      "Shift {shift_name} is unassigned for {elapsed_minutes} minutes.",
      "Assign staff now",
      "Shift coverage gap for {shift_name}",
      ["shift_name", "elapsed_minutes", "module_name"]
    ),

  };

  function cloneValue(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function toObject(value) {
    return value && typeof value === "object" ? value : {};
  }

  function toSafeNumber(value, fallback) {
    var num = Number(value);
    if (!Number.isFinite(num) || num < 0) return fallback;
    return num;
  }

  function toSafeUnit(value, fallback) {
    var v = String(value || "").toLowerCase();
    if (v === "minutes" || v === "hours" || v === "days") return v;
    return fallback;
  }

  function normalizeRule(input, fallbackRule) {
    var source = toObject(input);
    return {
      enabled: Boolean(source.enabled),
      leadValue: toSafeNumber(source.leadValue, fallbackRule.leadValue),
      leadUnit: toSafeUnit(source.leadUnit, fallbackRule.leadUnit),
      repeatEveryValue: toSafeNumber(source.repeatEveryValue, fallbackRule.repeatEveryValue),
      repeatEveryUnit: toSafeUnit(source.repeatEveryUnit, fallbackRule.repeatEveryUnit)
    };
  }

  function normalizeRulesStore(source) {
    var raw = toObject(source);
    var output = cloneValue(DEFAULT_RULES);
    var rawModules = toObject(raw.modules);

    MODULES.forEach(function (moduleKey) {
      var moduleEvents = MODULE_EVENT_MAP[moduleKey] || [];
      var rawModule = toObject(rawModules[moduleKey]);

      moduleEvents.forEach(function (eventKey) {
        var fallback = output.modules[moduleKey][eventKey];
        output.modules[moduleKey][eventKey] = normalizeRule(rawModule[eventKey], fallback);
      });
    });

    return output;
  }

  function normalizeLocaleTemplate(channelKey, payload, fallback) {
    var source = toObject(payload);
    var out = {};
    TEMPLATE_FIELD_SET[channelKey].forEach(function (fieldName) {
      var rawValue = source[fieldName];
      if (rawValue == null) {
        out[fieldName] = String(fallback[fieldName] || "");
      } else {
        out[fieldName] = String(rawValue);
      }
    });
    return out;
  }

  function normalizeTemplateEntry(eventKey, source) {
    var fallback = TEMPLATE_DEFAULTS[eventKey];
    var input = toObject(source);
    var placeholders = Array.isArray(input.placeholders) ? input.placeholders.map(String) : fallback.placeholders.slice();

    return {
      placeholders: placeholders,
      in_app: {
        en: normalizeLocaleTemplate("in_app", input.in_app && input.in_app.en, fallback.in_app.en),
        ar: normalizeLocaleTemplate("in_app", input.in_app && input.in_app.ar, fallback.in_app.ar)
      },
      email: {
        en: normalizeLocaleTemplate("email", input.email && input.email.en, fallback.email.en),
        ar: normalizeLocaleTemplate("email", input.email && input.email.ar, fallback.email.ar)
      }
    };
  }

  function normalizeTemplateStore(source) {
    var raw = toObject(source);
    var output = {};

    EVENT_KEYS.forEach(function (eventKey) {
      output[eventKey] = normalizeTemplateEntry(eventKey, raw[eventKey]);
    });

    return output;
  }

  function safeParse(json) {
    if (!json) return null;
    try {
      return JSON.parse(json);
    } catch (err) {
      return null;
    }
  }

  function readLocalStorageObject(key) {
    try {
      return safeParse(global.localStorage.getItem(key));
    } catch (err) {
      return null;
    }
  }

  function writeLocalStorageObject(key, value) {
    try {
      global.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  }

  function loadRules() {
    var stored = readLocalStorageObject(RULES_STORAGE_KEY);
    return normalizeRulesStore(stored);
  }

  function loadTemplates() {
    var stored = readLocalStorageObject(TEMPLATES_STORAGE_KEY);
    return normalizeTemplateStore(stored);
  }

  function getModuleForEvent(eventKey) {
    return EVENT_META[eventKey] && EVENT_META[eventKey].module ? EVENT_META[eventKey].module : "";
  }

  function resolveRule(rulesStore, moduleKey, eventKey) {
    var source = rulesStore && rulesStore.modules ? rulesStore : activeRules;
    var moduleRules = source.modules && source.modules[moduleKey];
    if (!moduleRules) return null;
    return moduleRules[eventKey] || null;
  }

  function setRule(moduleKey, eventKey, rulePatch) {
    if (!activeRules.modules[moduleKey] || !activeRules.modules[moduleKey][eventKey]) {
      return false;
    }

    var baseRule = activeRules.modules[moduleKey][eventKey];
    var source = toObject(rulePatch);
    var merged = {
      enabled: source.enabled != null ? source.enabled : baseRule.enabled,
      leadValue: source.leadValue != null ? source.leadValue : baseRule.leadValue,
      leadUnit: source.leadUnit != null ? source.leadUnit : baseRule.leadUnit,
      repeatEveryValue: source.repeatEveryValue != null ? source.repeatEveryValue : baseRule.repeatEveryValue,
      repeatEveryUnit: source.repeatEveryUnit != null ? source.repeatEveryUnit : baseRule.repeatEveryUnit
    };

    activeRules.modules[moduleKey][eventKey] = normalizeRule(merged, baseRule);
    writeLocalStorageObject(RULES_STORAGE_KEY, activeRules);
    return true;
  }

  function getRule(moduleKey, eventKey) {
    var rule = resolveRule(activeRules, moduleKey, eventKey);
    return rule ? cloneValue(rule) : null;
  }

  function validateTemplatePayload(channelKey, payload) {
    var fields = TEMPLATE_FIELD_SET[channelKey];
    if (!fields) return { ok: false, error: "Unsupported channel." };

    var source = toObject(payload);
    var nonEmptyCount = 0;

    fields.forEach(function (field) {
      var value = String(source[field] == null ? "" : source[field]).trim();
      if (value) nonEmptyCount += 1;
    });

    if (channelKey === "email") {
      var subjectValue = String(source.subject == null ? "" : source.subject).trim();
      if (!subjectValue) return { ok: false, error: "Email subject is required." };
    }

    if (!nonEmptyCount) return { ok: false, error: "Template cannot be empty." };
    return { ok: true };
  }

  function getTemplate(eventKey, channelKey, localeKey) {
    var eventTemplates = activeTemplates[eventKey];
    if (!eventTemplates) return null;

    var channel = channelKey === "email" ? "email" : "in_app";
    var locale = localeKey === "ar" ? "ar" : "en";
    if (!eventTemplates[channel] || !eventTemplates[channel][locale]) return null;
    return cloneValue(eventTemplates[channel][locale]);
  }

  function setTemplate(eventKey, channelKey, localeKey, payload) {
    if (!activeTemplates[eventKey]) return { ok: false, error: "Unknown event key." };

    var channel = channelKey === "email" ? "email" : "in_app";
    var locale = localeKey === "ar" ? "ar" : "en";
    var validation = validateTemplatePayload(channel, payload);
    if (!validation.ok) return validation;

    var fallback = TEMPLATE_DEFAULTS[eventKey][channel][locale];
    activeTemplates[eventKey][channel][locale] = normalizeLocaleTemplate(channel, payload, fallback);
    writeLocalStorageObject(TEMPLATES_STORAGE_KEY, activeTemplates);
    return { ok: true };
  }

  function resetTemplate(eventKey, channelKey, localeKey) {
    if (!TEMPLATE_DEFAULTS[eventKey]) return false;
    var channel = channelKey === "email" ? "email" : "in_app";
    var locale = localeKey === "ar" ? "ar" : "en";

    activeTemplates[eventKey][channel][locale] = cloneValue(TEMPLATE_DEFAULTS[eventKey][channel][locale]);
    writeLocalStorageObject(TEMPLATES_STORAGE_KEY, activeTemplates);
    return true;
  }

  function resetEventTemplates(eventKey) {
    if (!TEMPLATE_DEFAULTS[eventKey]) return false;
    activeTemplates[eventKey] = cloneValue(TEMPLATE_DEFAULTS[eventKey]);
    writeLocalStorageObject(TEMPLATES_STORAGE_KEY, activeTemplates);
    return true;
  }

  function renderTemplate(template, data) {
    if (!template || typeof template !== "object") return {};
    var context = toObject(data);

    function renderString(value) {
      var input = String(value == null ? "" : value);
      return input.replace(/\{([a-zA-Z0-9_]+)\}/g, function (full, key) {
        if (Object.prototype.hasOwnProperty.call(context, key)) return String(context[key]);
        return full;
      });
    }

    var out = {};
    Object.keys(template).forEach(function (fieldName) {
      out[fieldName] = renderString(template[fieldName]);
    });
    return out;
  }

  function collectUnknownPlaceholders(template, data) {
    var context = toObject(data);
    var unknown = {};

    Object.keys(toObject(template)).forEach(function (fieldName) {
      var text = String(template[fieldName] == null ? "" : template[fieldName]);
      var matches = text.match(/\{([a-zA-Z0-9_]+)\}/g) || [];
      matches.forEach(function (token) {
        var cleanKey = token.replace(/[{}]/g, "");
        if (!Object.prototype.hasOwnProperty.call(context, cleanKey)) unknown[cleanKey] = true;
      });
    });

    return Object.keys(unknown);
  }

  function unitToMinutes(value, unit) {
    var num = Number(value || 0);
    if (unit === "days") return num * 24 * 60;
    if (unit === "hours") return num * 60;
    return num;
  }

  function ruleLeadDays(rule) {
    if (!rule) return 0;
    if (rule.leadUnit === "days") return Number(rule.leadValue || 0);
    if (rule.leadUnit === "hours") return Number(rule.leadValue || 0) / 24;
    return Number(rule.leadValue || 0) / 1440;
  }

  function humanRuleText(rule, meta) {
    if (!rule || !rule.enabled) return "Disabled";
    var lead = String(rule.leadValue) + " " + rule.leadUnit;
    if (meta && meta.mode === "deadline") return "Alert when due date is within " + lead;
    return "Alert when condition lasts " + lead;
  }

  function humanRepeatText(rule) {
    if (!rule || !rule.enabled) return "No repeat";
    return "Repeat every " + String(rule.repeatEveryValue) + " " + rule.repeatEveryUnit;
  }

  var activeRules = loadRules();
  var activeTemplates = loadTemplates();

  global.NK_NOTIFICATION_EVENT_META = EVENT_META;
  global.NK_NOTIFICATION_EVENT_KEYS = EVENT_KEYS;
  global.NK_NOTIFICATION_MODULES = MODULES.slice();
  global.NK_NOTIFICATION_MODULE_EVENT_MAP = cloneValue(MODULE_EVENT_MAP);
  global.NK_NOTIFICATION_DEFAULT_RULES = cloneValue(DEFAULT_RULES);
  global.NK_NOTIFICATION_TEMPLATE_DEFAULTS = cloneValue(TEMPLATE_DEFAULTS);
  global.NK_NOTIFICATION_RULES_STORAGE_KEY = RULES_STORAGE_KEY;
  global.NK_NOTIFICATION_TEMPLATES_STORAGE_KEY = TEMPLATES_STORAGE_KEY;

  global.nkCloneNotificationRules = cloneValue;
  global.nkNormalizeRulesStore = normalizeRulesStore;
  global.nkResolveNotificationRule = resolveRule;
  global.nkGetRule = getRule;
  global.nkSetRule = setRule;
  global.nkLoadRulesFromStorage = function () {
    activeRules = loadRules();
    return cloneValue(activeRules);
  };
  global.nkSaveRulesToStorage = function (rulesStore) {
    activeRules = normalizeRulesStore(rulesStore);
    writeLocalStorageObject(RULES_STORAGE_KEY, activeRules);
    return cloneValue(activeRules);
  };

  global.nkGetTemplate = getTemplate;
  global.nkSetTemplate = setTemplate;
  global.nkResetTemplate = resetTemplate;
  global.nkResetEventTemplates = resetEventTemplates;
  global.nkGetAllTemplates = function () {
    return cloneValue(activeTemplates);
  };
  global.nkSaveAllTemplates = function (templatesStore) {
    activeTemplates = normalizeTemplateStore(templatesStore);
    writeLocalStorageObject(TEMPLATES_STORAGE_KEY, activeTemplates);
    return cloneValue(activeTemplates);
  };
  global.nkRenderTemplate = renderTemplate;
  global.nkCollectUnknownPlaceholders = collectUnknownPlaceholders;
  global.nkGetModuleForEvent = getModuleForEvent;
  global.nkRuleToMinutes = unitToMinutes;
  global.nkRuleLeadDays = ruleLeadDays;
  global.nkHumanRuleText = humanRuleText;
  global.nkHumanRepeatText = humanRepeatText;
})(window);

