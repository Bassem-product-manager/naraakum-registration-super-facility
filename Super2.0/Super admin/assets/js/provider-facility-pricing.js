(function () {
  var CONTRACT_KEY = "nk_facility_contract_state";
  var PRICING_KEY_PREFIX = "nk_facility_pricing_";
  var toastTimer = null;
  var insurancePickerModal = null;
  var tempInsuranceSelection = [];

  var FACILITY_DIRECTORY = {
    "FC-00001": { name: "BMC Hospital", type: "Hospital" },
    "FC-00002": { name: "Al Noor Medical Center", type: "Medical Center" },
    "FC-00003": { name: "Green Valley Clinic", type: "Clinic" },
    "FC-00004": { name: "Future Care Hospital", type: "Hospital" }
  };

  var INSURER_DIRECTORY = ["Bupa Arabia", "Tawuniya", "Medgulf", "Cigna", "AXA", "Walaa"];

  var state = null;
  var savedState = null;

  function byId(id) {
    return document.getElementById(id);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function clone(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function getParam(name) {
    try {
      var u = new URL(window.location.href);
      return (u.searchParams.get(name) || "").trim();
    } catch (e) {
      return "";
    }
  }

  function norm(v) {
    return String(v || "").trim();
  }

  function toNum(v) {
    var n = parseFloat(String(v || "").trim());
    return Number.isFinite(n) ? n : NaN;
  }

  function isPositive(v) {
    return Number.isFinite(v) && v > 0;
  }

  function money(v) {
    return Number.isFinite(v) ? v.toFixed(2) + " SAR" : "-";
  }

  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function safeToken(v) {
    return String(v || "").replace(/[^a-zA-Z0-9_-]/g, "_");
  }

  function loadJson(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return clone(fallback);
      return JSON.parse(raw);
    } catch (e) {
      return clone(fallback);
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function contractStore() {
    return loadJson(CONTRACT_KEY, {});
  }

  function setContractState(code, contract, source) {
    var all = contractStore();
    all[code] = {
      contract: String(contract || "").toLowerCase(),
      updatedAt: nowIso(),
      source: source || "manual"
    };
    saveJson(CONTRACT_KEY, all);
  }

  function uniqueStrings(arr) {
    if (!Array.isArray(arr)) return [];
    var out = [];
    arr.forEach(function (item) {
      var value = norm(item);
      if (!value) return;
      if (out.indexOf(value) === -1) out.push(value);
    });
    return out;
  }

  function normalizeFeeMode(mode) {
    return String(mode || "").toLowerCase() === "fixed" ? "fixed" : "percent";
  }

  function defaultServices() {
    return [
      {
        id: "doctor_visit",
        labelEn: "Doctor Visit",
        labelAr: "",
        enabled: true,
        basePrice: 80,
        platformFeeMode: "percent",
        platformFeeValue: 10
      },
      {
        id: "nursing_visit",
        labelEn: "Nursing Visit",
        labelAr: "",
        enabled: true,
        basePrice: 99,
        platformFeeMode: "percent",
        platformFeeValue: 10
      },
      {
        id: "health_companion",
        labelEn: "Health Companion",
        labelAr: "",
        enabled: true,
        basePrice: 350,
        platformFeeMode: "percent",
        platformFeeValue: 10
      },
      {
        id: "home_dialysis",
        labelEn: "Home Dialysis",
        labelAr: "",
        enabled: true,
        basePrice: 100,
        platformFeeMode: "percent",
        platformFeeValue: 10
      },
      {
        id: "physiotherapy",
        labelEn: "Physiotherapy",
        labelAr: "",
        enabled: true,
        basePrice: 149,
        platformFeeMode: "percent",
        platformFeeValue: 10
      },
      {
        id: "lab_tests",
        labelEn: "Lab Tests",
        labelAr: "",
        enabled: true,
        basePrice: 300,
        platformFeeMode: "percent",
        platformFeeValue: 10
      }
    ];
  }

  function defaults(code) {
    return {
      facilityCode: code,
      savedAt: "",
      services: defaultServices(),
      insurance: {
        enabled: false,
        acceptedInsurers: []
      }
    };
  }

  function normalizeLegacyService(item, idx) {
    var fallbackId = "legacy_service_" + idx;
    var id = norm(item && item.id) || fallbackId;
    return {
      id: id,
      labelEn: norm(item && item.labelEn) || id.replace(/_/g, " "),
      labelAr: norm(item && item.labelAr),
      enabled: !!(item && item.enabled),
      basePrice: norm(item && item.basePrice) !== "" ? item.basePrice : 0,
      platformFeeMode: normalizeFeeMode(item && item.platformFeeMode),
      platformFeeValue: norm(item && item.platformFeeValue) !== "" ? item.platformFeeValue : 10
    };
  }

  function mergeService(base, incoming) {
    var src = incoming || {};
    return {
      id: base.id,
      labelEn: norm(src.labelEn) || base.labelEn,
      labelAr: norm(src.labelAr) || base.labelAr,
      enabled: Object.prototype.hasOwnProperty.call(src, "enabled") ? !!src.enabled : !!base.enabled,
      basePrice: norm(src.basePrice) !== "" ? src.basePrice : base.basePrice,
      platformFeeMode: normalizeFeeMode(src.platformFeeMode || base.platformFeeMode),
      platformFeeValue: norm(src.platformFeeValue) !== "" ? src.platformFeeValue : base.platformFeeValue
    };
  }

  function mergeState(code, raw) {
    var base = defaults(code);
    if (!raw || typeof raw !== "object") return base;

    var rawServices = Array.isArray(raw.services) ? raw.services : [];
    var serviceMap = {};

    rawServices.forEach(function (svc) {
      var key = norm(svc && svc.id);
      if (!key) return;
      serviceMap[key] = svc;
    });

    var mergedServices = base.services.map(function (svc) {
      return mergeService(svc, serviceMap[svc.id]);
    });

    rawServices.forEach(function (svc, index) {
      var key = norm(svc && svc.id);
      if (!key) return;
      var exists = mergedServices.some(function (row) {
        return row.id === key;
      });
      if (exists) return;
      mergedServices.push(normalizeLegacyService(svc, index + 1));
    });

    var out = clone(base);
    out.savedAt = raw.savedAt || "";
    out.services = mergedServices;
    out.insurance = Object.assign({}, out.insurance, raw.insurance || {});
    out.insurance.acceptedInsurers = uniqueStrings(out.insurance.acceptedInsurers);
    return out;
  }

  function pricingKey(code) {
    return PRICING_KEY_PREFIX + code;
  }

  function loadState(code) {
    return mergeState(code, loadJson(pricingKey(code), defaults(code)));
  }

  function saveState() {
    updateInsuranceEnabledFromSelection();
    state.savedAt = nowIso();
    saveJson(pricingKey(state.facilityCode), state);
    savedState = clone(state);
  }

  function getService(id) {
    return state.services.find(function (s) {
      return s.id === id;
    }) || null;
  }

  function validateService(service) {
    if (!service.enabled) return "";

    var feeMode = normalizeFeeMode(service.platformFeeMode);
    if (feeMode !== "percent" && feeMode !== "fixed") {
      return "Select platform pricing mode.";
    }

    var feeValue = toNum(service.platformFeeValue);
    if (!isPositive(feeValue)) {
      return "Platform fee value must be greater than 0.";
    }

    return "";
  }

  function validateServices() {
    var enabled = state.services.filter(function (s) {
      return !!s.enabled;
    });
    var errors = {};

    if (!enabled.length) {
      errors._card = "Enable at least one service and set platform fee.";
      return { ok: false, errors: errors };
    }

    enabled.forEach(function (svc) {
      var msg = validateService(svc);
      if (msg) errors[svc.id] = msg;
    });

    return { ok: Object.keys(errors).length === 0, errors: errors };
  }

  function validateInsurance() {
    var errors = {};
    var ins = state.insurance || {};

    if (!ins.enabled) return { ok: true, errors: errors };

    if (!Array.isArray(ins.acceptedInsurers) || !ins.acceptedInsurers.length) {
      errors.insurers = "Select at least one insurer.";
    }

    return { ok: Object.keys(errors).length === 0, errors: errors };
  }

  function gate() {
    var servicesValidation = validateServices();
    var insuranceValidation = validateInsurance();

    var issues = [];
    if (!servicesValidation.ok) issues.push("Complete self-pay pricing for enabled services.");
    if (state.insurance.enabled && !insuranceValidation.ok) issues.push("Complete required insurance fields.");

    var ready = servicesValidation.ok && (!state.insurance.enabled || insuranceValidation.ok);

    return {
      ready: ready,
      services: servicesValidation,
      insurance: insuranceValidation,
      issues: issues
    };
  }

  function setError(id, message) {
    var node = byId(id);
    if (!node) return;
    node.textContent = message || "";
    node.classList.toggle("show", !!message);
  }

  function markInvalid(id, invalid) {
    var node = byId(id);
    if (!node) return;
    node.classList.toggle("field-invalid", !!invalid);
  }

  function clearStaticErrors() {
    ["servicesCardError", "insErrInsurers"].forEach(function (id) {
      setError(id, "");
    });
  }

  function applyStaticErrors(v) {
    clearStaticErrors();
    setError("servicesCardError", v.services.errors._card || "");

    if (state.insurance.enabled) {
      setError("insErrInsurers", v.insurance.errors.insurers || "");
    }
  }

  function renderServiceRow(service) {
    var id = service.id;
    var token = safeToken(id);
    var feeMode = normalizeFeeMode(service.platformFeeMode);
    var disabled = service.enabled ? "" : "disabled";

    var html =
      '<div class="service-row ' + (service.enabled ? "" : "is-disabled") + '" data-service-id="' + esc(id) + '">' +
      '<div class="toggle-cell"><div class="form-check form-switch m-0"><input class="form-check-input" type="checkbox" data-role="enable" ' + (service.enabled ? "checked" : "") + "></div></div>" +
      "<div>" +
      '<p class="service-name">' + esc(service.labelEn) + "</p>" +
      (service.labelAr ? '<p class="service-ar">' + esc(service.labelAr) + "</p>" : "") +
      '<p class="service-base">Base: ' + money(toNum(service.basePrice)) + "</p>" +
      "</div>" +
      "<div>" +
      '<div class="mode-segment">' +
      '<input type="radio" id="fee_mode_pct_' + token + '" name="fee_mode_' + token + '" value="percent" data-role="feeMode" ' + (feeMode === "percent" ? "checked" : "") + " " + disabled + '><label for="fee_mode_pct_' + token + '">%</label>' +
      '<input type="radio" id="fee_mode_fixed_' + token + '" name="fee_mode_' + token + '" value="fixed" data-role="feeMode" ' + (feeMode === "fixed" ? "checked" : "") + " " + disabled + '><label for="fee_mode_fixed_' + token + '">Fixed</label>' +
      "</div>" +
      "</div>" +
      "<div>" +
      '<div class="fee-grid">' +
      '<input class="form-control form-control-32" data-role="feeValue" type="number" min="0" step="0.01" value="' + esc(service.platformFeeValue || "") + '" placeholder="Fee value" ' + disabled + ">" +
      "</div>" +
      "</div>" +
      '<p class="field-error row-error" data-role="rowError"></p>' +
      "</div>";

    return html;
  }

  function renderServices() {
    var wrap = byId("servicesRows");
    if (!wrap) return;
    wrap.innerHTML = state.services.map(renderServiceRow).join("");
    bindServiceRows();
    refreshRows();
  }

  function refreshRow(row, svc) {
    if (!row || !svc) return;

    row.classList.toggle("is-disabled", !svc.enabled);

    var mode = normalizeFeeMode(svc.platformFeeMode);
    qsa('[data-role="feeMode"]', row).forEach(function (radio) {
      radio.disabled = !svc.enabled;
      radio.checked = radio.value === mode;
    });

    var feeInput = row.querySelector('[data-role="feeValue"]');
    if (feeInput) {
      feeInput.disabled = !svc.enabled;
      feeInput.value = svc.platformFeeValue;
    }

    var err = svc.enabled ? validateService(svc) : "";
    var errNode = row.querySelector('[data-role="rowError"]');
    if (errNode) {
      errNode.textContent = err;
      errNode.classList.toggle("show", !!err);
    }
  }

  function refreshRows() {
    qsa(".service-row").forEach(function (row) {
      var svc = getService(row.getAttribute("data-service-id"));
      refreshRow(row, svc);
    });
  }

  function updateInsuranceEnabledFromSelection() {
    var selected = uniqueStrings(state.insurance && state.insurance.acceptedInsurers);
    state.insurance.acceptedInsurers = selected;
    state.insurance.enabled = selected.length > 0;
  }

  function updateInsuranceCount() {
    var node = byId("insuranceSelectedCount");
    if (!node) return;
    var count = (state.insurance && state.insurance.acceptedInsurers || []).length;
    node.textContent = count + " selected";
  }

  function syncInsuranceSection() {
    var open = !!(state.insurance && state.insurance.enabled);
    var fields = byId("insuranceFields");
    if (fields) fields.classList.toggle("is-open", open);
    updateInsuranceCount();
  }

  function renderAcceptedInsurersSummary() {
    var wrap = byId("acceptedInsurersWrap");
    if (!wrap) return;

    var selected = state.insurance && state.insurance.acceptedInsurers || [];
    if (!selected.length) {
      wrap.innerHTML = '<div class="field-helper">No insurers selected.</div>';
      return;
    }

    wrap.innerHTML = selected
      .map(function (name) {
        return '<label class="option-tile"><span class="form-check-label">' + esc(name) + "</span></label>";
      })
      .join("");
  }

  function renderInsurancePickerList() {
    var wrap = byId("insurancePickerList");
    if (!wrap) return;

    wrap.innerHTML = INSURER_DIRECTORY.map(function (name) {
      var checked = tempInsuranceSelection.indexOf(name) > -1 ? " checked" : "";
      return (
        '<label class="option-tile">' +
        '<input type="checkbox" class="form-check-input me-2" data-insurer-pick value="' + esc(name) + '"' + checked + ">" +
        '<span class="form-check-label">' + esc(name) + "</span>" +
        "</label>"
      );
    }).join("");

    qsa("[data-insurer-pick]", wrap).forEach(function (cb) {
      cb.addEventListener("change", function () {
        var picked = qsa("[data-insurer-pick]:checked", wrap).map(function (item) {
          return item.value;
        });
        tempInsuranceSelection = uniqueStrings(picked);
      });
    });
  }

  function openInsurancePicker() {
    tempInsuranceSelection = uniqueStrings((state.insurance && state.insurance.acceptedInsurers) || []);
    renderInsurancePickerList();

    if (!window.bootstrap) return;
    var modalEl = byId("insurancePickerModal");
    if (!modalEl) return;

    insurancePickerModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    insurancePickerModal.show();
  }

  function closeInsurancePicker() {
    if (insurancePickerModal) {
      insurancePickerModal.hide();
      return;
    }
    if (!window.bootstrap) return;
    var modalEl = byId("insurancePickerModal");
    if (!modalEl) return;
    var existing = bootstrap.Modal.getInstance(modalEl);
    if (existing) existing.hide();
  }

  function applyInsuranceSelection() {
    state.insurance.acceptedInsurers = uniqueStrings(tempInsuranceSelection);
    updateInsuranceEnabledFromSelection();
    renderAcceptedInsurersSummary();
    syncInsuranceSection();
    refreshAll();
    closeInsurancePicker();
  }

  function updateChecklist(v) {
    var checkServices = v.services.ok;
    var insuranceReady = !state.insurance.enabled || v.insurance.ok;

    function paint(key, done, text) {
      var item = document.querySelector('[data-check="' + key + '"]');
      if (!item) return;
      item.classList.toggle("is-done", !!done);

      var valueNode = byId(key === "services" ? "checkServicesValue" : "checkInsuranceValue");
      if (valueNode) valueNode.textContent = text;
    }

    paint("services", checkServices, checkServices ? "Complete" : "Incomplete");
    paint("insurance", insuranceReady, state.insurance.enabled ? (insuranceReady ? "Complete" : "Incomplete") : "Optional (Off)");

    var btnActivate = byId("btnActivateFacility");
    if (btnActivate) btnActivate.disabled = !v.ready;
  }

  function refreshAll() {
    refreshRows();
    updateInsuranceEnabledFromSelection();
    syncInsuranceSection();
    renderAcceptedInsurersSummary();

    var v = gate();
    applyStaticErrors(v);
    updateChecklist(v);
  }

  function showToast(message, type) {
    var toast = byId("pricingToast");
    if (!toast) return;
    toast.textContent = message || "Done.";
    toast.classList.toggle("info", type === "info");
    toast.classList.add("show");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("show");
    }, 2200);
  }

  function goBack() {
    window.location.href = "../providers/facility-details.html?code=" + encodeURIComponent(state.facilityCode);
  }

  function bindServiceRows() {
    qsa(".service-row").forEach(function (row) {
      var id = row.getAttribute("data-service-id");
      var svc = getService(id);
      if (!svc) return;

      var enable = row.querySelector('[data-role="enable"]');
      if (enable) {
        enable.addEventListener("change", function () {
          svc.enabled = !!enable.checked;
          refreshAll();
        });
      }

      qsa('[data-role="feeMode"]', row).forEach(function (modeInput) {
        modeInput.addEventListener("change", function () {
          if (!modeInput.checked) return;
          svc.platformFeeMode = normalizeFeeMode(modeInput.value);
          refreshAll();
        });
      });

      var feeValue = row.querySelector('[data-role="feeValue"]');
      if (feeValue) {
        feeValue.addEventListener("input", function () {
          svc.platformFeeValue = feeValue.value;
          refreshAll();
        });
      }
    });
  }

  function renderFormValues() {
    renderAcceptedInsurersSummary();
    syncInsuranceSection();
  }

  function bindGlobalEvents() {
    var openInsuranceBtn = byId("btnOpenInsurancePicker");
    if (openInsuranceBtn) {
      openInsuranceBtn.addEventListener("click", function () {
        openInsurancePicker();
      });
    }

    var applyInsuranceBtn = byId("btnSaveInsuranceSelection");
    if (applyInsuranceBtn) {
      applyInsuranceBtn.addEventListener("click", function () {
        applyInsuranceSelection();
      });
    }

    var clearInsuranceBtn = byId("btnClearInsuranceSelection");
    if (clearInsuranceBtn) {
      clearInsuranceBtn.addEventListener("click", function () {
        tempInsuranceSelection = [];
        renderInsurancePickerList();
      });
    }

    byId("btnSaveDraft").addEventListener("click", function () {
      saveState();
      setContractState(state.facilityCode, "drafted", "pricing_draft");
      showToast("Draft saved. Facility moved to Drafted.");
      refreshAll();
    });

    byId("btnCancelPricing").addEventListener("click", function () {
      goBack();
    });

    byId("btnActivateFacility").addEventListener("click", function () {
      var v = gate();
      applyStaticErrors(v);
      refreshRows();

      if (!v.ready) {
        showToast("Step 2 is incomplete. Complete required fields above.", "info");
        var checklist = byId("completionChecklist") || byId("cardServices");
        if (checklist && checklist.scrollIntoView) {
          checklist.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }

      saveState();
      setContractState(state.facilityCode, "active", "pricing_activate");
      showToast("Facility activated successfully.");

      window.setTimeout(function () {
        goBack();
      }, 450);
    });
  }

  function initClock() {
    var el = byId("ksaTime");
    if (!el) return;

    function tick() {
      try {
        var fmt = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Riyadh",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        });
        el.textContent = fmt.format(new Date());
      } catch (e) {
        el.textContent = new Date().toLocaleTimeString("en-US", { hour12: true });
      }
    }

    tick();
    setInterval(tick, 1000);
  }

  function initPage() {
    initClock();

    var code = norm(getParam("code")).toUpperCase();
    var validCode = /^FC-\d{5}$/.test(code);
    var ctx = FACILITY_DIRECTORY[code] || null;

    if (!validCode || !ctx) {
      byId("facilityPricingContent").classList.add("d-none");
      byId("facilityPricingEmpty").classList.remove("d-none");
      return;
    }

    byId("fpFacilityName").textContent = ctx.name;
    byId("fpFacilityCode").textContent = code;
    byId("fpFacilityType").textContent = ctx.type || "Facility";

    state = loadState(code);
    savedState = clone(state);

    updateInsuranceEnabledFromSelection();
    renderServices();
    renderFormValues();
    bindGlobalEvents();
    refreshAll();
  }

  initPage();
})();
