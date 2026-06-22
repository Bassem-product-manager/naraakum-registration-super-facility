(function () {
  "use strict";

  var store = window.NKInsuranceRateRuleStore;
  if (!store) return;

  var form = document.getElementById("insuranceRateRuleForm");
  if (!form) return;

  var pageTitle = document.getElementById("rateRulePageTitle");
  var cardTitle = document.getElementById("rateRuleCardTitle");
  var breadcrumbCurrent = document.getElementById("rateRuleBreadcrumbCurrent");
  var alertBox = document.getElementById("insuranceRateRuleFormAlert");
  var warningBox = document.getElementById("coverageWarningBar");

  var fieldCompany = document.getElementById("rrInsuranceCompany");
  var fieldPlan = document.getElementById("rrPlan");
  var fieldClass = document.getElementById("rrClass");
  var fieldTargetType = document.getElementById("rrTargetType");
  var fieldMainService = document.getElementById("rrMainService");
  var fieldService = document.getElementById("rrService");
  var fieldPackage = document.getElementById("rrPackage");

  var serviceWrap = document.getElementById("rrServiceWrap");
  var packageWrap = document.getElementById("rrPackageWrap");
  var packageHint = document.getElementById("rrPackageHint");

  var fieldCoveragePct = document.getElementById("rrCoveragePct");
  var fieldCopayType = document.getElementById("rrCopayType");
  var fieldCopayValue = document.getElementById("rrCopayValue");
  var fieldMaxCoverageCap = document.getElementById("rrMaxCoverageCap");
  var fieldAuthRequired = document.getElementById("rrAuthRequired");
  var fieldIsActive = document.getElementById("rrIsActive");

  var authText = document.getElementById("rrAuthText");
  var activeText = document.getElementById("rrActiveText");

  var fieldPerMonth = document.getElementById("rrLimitPerMonth");
  var fieldPerYear = document.getElementById("rrLimitPerYear");

  var btnManagePlans = document.getElementById("btnManagePlans");
  var btnManageClasses = document.getElementById("btnManageClasses");
  var scopeModalEl = document.getElementById("scopeManagerModal");
  var scopeManagerTitle = document.getElementById("scopeManagerTitle");
  var scopeListLabel = document.getElementById("scopeListLabel");
  var scopeAddLabel = document.getElementById("scopeAddLabel");
  var scopeEditLabel = document.getElementById("scopeEditLabel");
  var scopeManagerList = document.getElementById("scopeManagerList");
  var scopeNewName = document.getElementById("scopeNewName");
  var scopeEditName = document.getElementById("scopeEditName");
  var btnAddScopeName = document.getElementById("btnAddScopeName");
  var btnSaveScopeEdit = document.getElementById("btnSaveScopeEdit");

  var params = new URLSearchParams(window.location.search);
  var mode = (params.get("mode") || "add").toLowerCase() === "edit" ? "edit" : "add";
  var editId = (params.get("id") || "").trim();
  var editingRule = null;

  var scopeManagerState = {
    type: "plan",
    selectedName: ""
  };

  function initClock() {
    var el = document.getElementById("ksaTime");
    if (!el) return;

    function tick() {
      try {
        var formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Riyadh",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        });
        el.textContent = formatter.format(new Date());
      } catch (err) {
        el.textContent = new Date().toLocaleTimeString("en-US", { hour12: true });
      }
    }

    tick();
    setInterval(tick, 1000);
  }

  function norm(value) {
    return String(value || "").trim();
  }

  function lower(value) {
    return norm(value).toLowerCase();
  }

  function toNumOrBlank(value) {
    var clean = norm(value);
    if (!clean) return "";
    var parsed = Number(clean);
    return Number.isFinite(parsed) ? parsed : "";
  }

  function toIntOrBlank(value) {
    var clean = norm(value);
    if (!clean) return "";
    var parsed = parseInt(clean, 10);
    return Number.isFinite(parsed) ? parsed : "";
  }

  function option(label, value, selected) {
    var isSelected = lower(value) === lower(selected) ? " selected" : "";
    return '<option value="' + value + '"' + isSelected + ">" + label + "</option>";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function showAlert(message, type) {
    if (!alertBox) return;
    alertBox.className = "alert";
    alertBox.classList.add(type === "danger" ? "alert-danger" : "alert-success");
    alertBox.classList.remove("d-none");
    alertBox.textContent = message;
  }

  function clearAlert() {
    if (!alertBox) return;
    alertBox.classList.add("d-none");
    alertBox.textContent = "";
  }

  function updateToggleTexts() {
    authText.textContent = fieldAuthRequired.checked ? "Required" : "Not Required";
    activeText.textContent = fieldIsActive.checked ? "Active" : "Inactive";
  }

  function populateStaticSelectors(selectedValues) {
    var selected = selectedValues || {};
    var selectedCompany = Object.prototype.hasOwnProperty.call(selected, "company") ? selected.company : fieldCompany.value;
    var selectedPlan = Object.prototype.hasOwnProperty.call(selected, "plan") ? selected.plan : fieldPlan.value;
    var selectedClass = Object.prototype.hasOwnProperty.call(selected, "classValue") ? selected.classValue : fieldClass.value;
    var selectedMainService = Object.prototype.hasOwnProperty.call(selected, "mainService")
      ? selected.mainService
      : fieldMainService.value;

    var companies = store.getInsuranceCompanies();
    var plans = store.getPlans();
    var classes = store.getClasses();
    var mainServices = store.getMainServices();

    fieldCompany.innerHTML = '<option value="">Select insurance company</option>';
    companies.forEach(function (item) {
      fieldCompany.innerHTML += option(item.name + " (" + item.code + ")", item.code, "");
    });
    fieldCompany.value = selectedCompany || "";

    fieldPlan.innerHTML = plans
      .map(function (item) {
        return option(item, item, selectedPlan || "Default");
      })
      .join("");
    if (selectedPlan && !plans.some(function (item) { return lower(item) === lower(selectedPlan); })) {
      fieldPlan.innerHTML += option(selectedPlan, selectedPlan, selectedPlan);
    }
    fieldPlan.value = selectedPlan || plans[0] || "";

    fieldClass.innerHTML = classes
      .map(function (item) {
        return option(item, item, selectedClass || "General");
      })
      .join("");
    if (selectedClass && !classes.some(function (item) { return lower(item) === lower(selectedClass); })) {
      fieldClass.innerHTML += option(selectedClass, selectedClass, selectedClass);
    }
    fieldClass.value = selectedClass || classes[0] || "";

    fieldMainService.innerHTML = '<option value="">Select main service</option>';
    mainServices.forEach(function (name) {
      fieldMainService.innerHTML += option(name, name, "");
    });
    fieldMainService.value = selectedMainService || "";
  }

  function getScopeItems(type) {
    return type === "class" ? store.getClasses() : store.getPlans();
  }

  function getScopeModeLabel(type) {
    return type === "class" ? "Class" : "Plan";
  }

  function updateScopeModalLabels() {
    var label = getScopeModeLabel(scopeManagerState.type);
    scopeManagerTitle.textContent = "Manage " + label + "s";
    scopeListLabel.textContent = "Current " + label + "s";
    scopeAddLabel.textContent = "Add New " + label;
    scopeEditLabel.textContent = "Edit " + label + " Name";
    scopeNewName.placeholder = "Enter " + label.toLowerCase() + " name";
    scopeEditName.placeholder = "Select " + label.toLowerCase() + " then type new name";
  }

  function renderScopeList() {
    var items = getScopeItems(scopeManagerState.type);
    if (!items.length) {
      scopeManagerList.innerHTML =
        '<div class="scope-list-item"><span class="name text-grey">No items found.</span></div>';
      return;
    }

    scopeManagerList.innerHTML = items
      .map(function (item) {
        var isSelected = lower(item) === lower(scopeManagerState.selectedName);
        return (
          '<div class="scope-list-item' +
          (isSelected ? " is-selected" : "") +
          '">' +
          '<span class="name">' +
          escapeHtml(item) +
          "</span>" +
          '<button type="button" class="btn btn-primary-revers btn-32" data-action="scope-edit" data-name="' +
          encodeURIComponent(item) +
          '">' +
          '<i class="fi fi-rr-edit"></i><span>Edit</span>' +
          "</button>" +
          "</div>"
        );
      })
      .join("");

    scopeManagerList.querySelectorAll('[data-action="scope-edit"]').forEach(function (button) {
      button.addEventListener("click", function () {
        var encoded = button.getAttribute("data-name") || "";
        scopeManagerState.selectedName = decodeURIComponent(encoded);
        scopeEditName.value = scopeManagerState.selectedName;
        btnSaveScopeEdit.disabled = false;
        renderScopeList();
      });
    });
  }

  function refreshScopeSelectors(overrideValues) {
    var selectedPlan = overrideValues && overrideValues.plan ? overrideValues.plan : fieldPlan.value;
    var selectedClass = overrideValues && overrideValues.classValue ? overrideValues.classValue : fieldClass.value;

    populateStaticSelectors({
      company: fieldCompany.value,
      plan: selectedPlan,
      classValue: selectedClass,
      mainService: fieldMainService.value
    });
  }

  function openScopeManager(type) {
    if (!scopeModalEl || !window.bootstrap) return;
    scopeManagerState.type = type === "class" ? "class" : "plan";
    scopeManagerState.selectedName = scopeManagerState.type === "class" ? fieldClass.value : fieldPlan.value;
    scopeNewName.value = "";
    scopeEditName.value = scopeManagerState.selectedName || "";
    btnSaveScopeEdit.disabled = !scopeManagerState.selectedName;
    updateScopeModalLabels();
    renderScopeList();
    bootstrap.Modal.getOrCreateInstance(scopeModalEl).show();
  }

  function addScopeItem() {
    var value = norm(scopeNewName.value);
    if (!value) return;

    var saved =
      scopeManagerState.type === "class" ? store.upsertClass("", value) : store.upsertPlan("", value);
    if (!saved) return;

    scopeManagerState.selectedName = saved;
    scopeNewName.value = "";
    scopeEditName.value = saved;
    btnSaveScopeEdit.disabled = false;

    if (scopeManagerState.type === "class") {
      refreshScopeSelectors({ classValue: saved });
    } else {
      refreshScopeSelectors({ plan: saved });
    }

    showAlert(getScopeModeLabel(scopeManagerState.type) + " saved successfully.", "success");
    renderScopeList();
  }

  function saveScopeEdit() {
    if (!scopeManagerState.selectedName) return;
    var newName = norm(scopeEditName.value);
    if (!newName) return;

    var saved =
      scopeManagerState.type === "class"
        ? store.upsertClass(scopeManagerState.selectedName, newName)
        : store.upsertPlan(scopeManagerState.selectedName, newName);
    if (!saved) return;

    scopeManagerState.selectedName = saved;
    if (scopeManagerState.type === "class") {
      refreshScopeSelectors({ classValue: saved });
    } else {
      refreshScopeSelectors({ plan: saved });
    }

    showAlert(getScopeModeLabel(scopeManagerState.type) + " updated successfully.", "success");
    renderScopeList();
  }

  function populateServiceOptions(selectedCode) {
    var mainService = fieldMainService.value;
    var list = store.getServicesByMainService(mainService);
    var html = '<option value="">Select service</option>';
    list.forEach(function (item) {
      html += option(item.name + " (" + item.code + ")", item.code, selectedCode || "");
    });
    fieldService.innerHTML = html;
  }

  function populatePackageOptions(selectedCode) {
    var mainService = fieldMainService.value;
    if (!mainService) {
      fieldPackage.innerHTML = '<option value="">Select package</option>';
      packageHint.classList.remove("d-none");
      packageHint.textContent = "Select main service first.";
      return;
    }

    var packages = store.getPackages().filter(function (item) {
      return lower(item.mainService) === lower(mainService);
    });

    var html = '<option value="">Select package</option>';
    packages.forEach(function (item) {
      html += option(item.name + " (" + item.code + ")", item.code, selectedCode || "");
    });

    if (selectedCode && !packages.some(function (item) { return lower(item.code) === lower(selectedCode); })) {
      html += option("Current value (" + selectedCode + ")", selectedCode, selectedCode);
    }

    fieldPackage.innerHTML = html;

    if (!packages.length) {
      packageHint.classList.remove("d-none");
      packageHint.textContent = "No packages found. Create Insurance Packages first.";
    } else {
      packageHint.classList.add("d-none");
      packageHint.textContent = "";
    }
  }

  function toggleTargetFields() {
    var type = lower(fieldTargetType.value);
    var isService = type !== "package";

    serviceWrap.classList.toggle("d-none", !isService);
    packageWrap.classList.toggle("d-none", isService);

    if (isService) {
      fieldPackage.value = "";
      populateServiceOptions(fieldService.value);
    } else {
      fieldService.value = "";
      populatePackageOptions(fieldPackage.value);
    }
  }

  function toggleCopayState() {
    var isNone = lower(fieldCopayType.value) === "none";
    fieldCopayValue.disabled = isNone;
    if (isNone) {
      fieldCopayValue.value = "";
    }
    updateWarning();
  }

  function updateWarning() {
    var coverage = toNumOrBlank(fieldCoveragePct.value);
    var copayType = lower(fieldCopayType.value);
    var copayValue = toNumOrBlank(fieldCopayValue.value);

    if (copayType === "percent" && coverage !== "" && copayValue !== "" && Number(coverage) + Number(copayValue) > 100) {
      warningBox.classList.remove("d-none");
      warningBox.textContent = "Warning: Coverage % + Copay % is greater than 100%.";
      return;
    }

    warningBox.classList.add("d-none");
    warningBox.textContent = "";
  }

  function selectedCompany() {
    var code = fieldCompany.value;
    return store.getInsuranceCompanies().find(function (item) {
      return lower(item.code) === lower(code);
    }) || null;
  }

  function readPayload() {
    var company = selectedCompany();
    var targetType = lower(fieldTargetType.value) === "package" ? "package" : "service";
    var targetCode = targetType === "package" ? norm(fieldPackage.value) : norm(fieldService.value);
    var target = null;

    if (targetType === "service") {
      target = store.findService(fieldMainService.value, targetCode);
    } else {
      target = store.findPackage(fieldMainService.value, targetCode);
    }

    return {
      id: mode === "edit" && editingRule ? editingRule.id : "",
      insuranceCompanyCode: company ? company.code : "",
      insuranceCompanyName: company ? company.name : "",
      plan: norm(fieldPlan.value),
      class: norm(fieldClass.value),
      targetType: targetType,
      mainService: norm(fieldMainService.value),
      targetCode: target ? target.code : targetCode,
      targetName: target ? target.name : "",
      unit: targetType === "service" ? (target && target.unit) || "" : (target && target.unitType) || "",
      unitsCount: targetType === "package" ? ((target && target.unitsCount) || "") : "",
      covered: true,
      coveragePct: toNumOrBlank(fieldCoveragePct.value),
      copayType: fieldCopayType.value,
      copayValue: toNumOrBlank(fieldCopayValue.value),
      maxCoverageCap: toNumOrBlank(fieldMaxCoverageCap.value),
      authRequired: !!fieldAuthRequired.checked,
      limits: {
        perMonth: toIntOrBlank(fieldPerMonth.value),
        perYear: toIntOrBlank(fieldPerYear.value)
      },
      isActive: !!fieldIsActive.checked
    };
  }

  function validate(payload) {
    if (!payload.insuranceCompanyCode) return "Insurance Company is required.";
    if (!payload.plan) return "Plan is required.";
    if (!payload.class) return "Class is required.";
    if (!payload.targetType) return "Target Type is required.";
    if (!payload.mainService) return "Main Service is required.";

    if (payload.targetType === "service" && !payload.targetCode) {
      return "Service is required.";
    }

    if (payload.targetType === "package" && !payload.targetCode) {
      return "Package is required.";
    }

    if (payload.targetType === "package" && !store.getPackages().length && mode !== "edit") {
      return "No packages found. Create Insurance Packages first.";
    }

    if (lower(payload.copayType) !== "none" && payload.copayValue === "") {
      return "Copay Value is required when Copay Type is not None.";
    }

    return "";
  }

  function applyModeLabels() {
    var isEdit = mode === "edit";
    var title = isEdit ? "Edit Rate Rule" : "Add Rate Rule";
    var crumb = isEdit ? "Edit" : "Add";
    document.title = "Naraakum | " + title;
    pageTitle.textContent = title;
    cardTitle.textContent = title;
    breadcrumbCurrent.textContent = crumb;
  }

  function fillForm(rule) {
    fieldCompany.value = rule.insuranceCompanyCode || "";
    fieldPlan.value = rule.plan || "Default";
    fieldClass.value = rule.class || "General";
    fieldTargetType.value = lower(rule.targetType) === "package" ? "package" : "service";
    fieldMainService.value = rule.mainService || "";

    populateServiceOptions(rule.targetType === "service" ? rule.targetCode : "");
    populatePackageOptions(rule.targetType === "package" ? rule.targetCode : "");

    if (rule.targetType === "service") fieldService.value = rule.targetCode || "";
    if (rule.targetType === "package") fieldPackage.value = rule.targetCode || "";

    fieldCoveragePct.value = rule.coveragePct === "" ? "" : rule.coveragePct;
    fieldCopayType.value = rule.copayType || "None";
    fieldCopayValue.value = rule.copayValue === "" ? "" : rule.copayValue;
    fieldMaxCoverageCap.value = rule.maxCoverageCap === "" ? "" : rule.maxCoverageCap;
    fieldAuthRequired.checked = !!rule.authRequired;
    fieldIsActive.checked = !!rule.isActive;

    fieldPerMonth.value = rule.limits && rule.limits.perMonth !== "" ? rule.limits.perMonth : "";
    fieldPerYear.value = rule.limits && rule.limits.perYear !== "" ? rule.limits.perYear : "";

    toggleTargetFields();
    toggleCopayState();
    updateToggleTexts();
    updateWarning();
  }

  function saveRule() {
    clearAlert();
    var payload = readPayload();
    var error = validate(payload);
    if (error) {
      showAlert(error, "danger");
      return;
    }

    var saved = store.upsertRule(payload);
    if (!saved) {
      showAlert("Unable to save rate rule.", "danger");
      return;
    }

    store.setFlash(mode === "edit" ? "Rate rule updated successfully." : "Rate rule added successfully.", "success");
    window.location.href = "insurance-rate-sheet.html";
  }

  function bindEvents() {
    if (btnManagePlans) {
      btnManagePlans.addEventListener("click", function () {
        openScopeManager("plan");
      });
    }

    if (btnManageClasses) {
      btnManageClasses.addEventListener("click", function () {
        openScopeManager("class");
      });
    }

    if (btnAddScopeName) {
      btnAddScopeName.addEventListener("click", function () {
        addScopeItem();
      });
    }

    if (btnSaveScopeEdit) {
      btnSaveScopeEdit.addEventListener("click", function () {
        saveScopeEdit();
      });
    }

    if (scopeNewName) {
      scopeNewName.addEventListener("keydown", function (event) {
        if (event.key !== "Enter") return;
        event.preventDefault();
        addScopeItem();
      });
    }

    if (scopeEditName) {
      scopeEditName.addEventListener("keydown", function (event) {
        if (event.key !== "Enter") return;
        event.preventDefault();
        saveScopeEdit();
      });
    }

    if (scopeModalEl) {
      scopeModalEl.addEventListener("hidden.bs.modal", function () {
        scopeManagerState.selectedName = "";
        scopeNewName.value = "";
        scopeEditName.value = "";
        btnSaveScopeEdit.disabled = true;
      });
    }

    fieldTargetType.addEventListener("change", function () {
      toggleTargetFields();
    });

    fieldMainService.addEventListener("change", function () {
      populateServiceOptions("");
      populatePackageOptions("");
    });

    fieldCopayType.addEventListener("change", toggleCopayState);
    fieldCoveragePct.addEventListener("input", updateWarning);
    fieldCopayValue.addEventListener("input", updateWarning);

    [fieldAuthRequired, fieldIsActive].forEach(function (node) {
      node.addEventListener("change", updateToggleTexts);
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      saveRule();
    });
  }

  function initMode() {
    applyModeLabels();
    populateStaticSelectors();
    populateServiceOptions("");
    populatePackageOptions("");
    toggleTargetFields();
    toggleCopayState();
    updateToggleTexts();

    if (mode !== "edit") return;

    if (!editId) {
      store.setFlash("Rate rule not found.", "danger");
      window.location.href = "insurance-rate-sheet.html";
      return;
    }

    editingRule = store.getRuleById(editId);
    if (!editingRule) {
      store.setFlash("Rate rule not found.", "danger");
      window.location.href = "insurance-rate-sheet.html";
      return;
    }

    fillForm(editingRule);
  }

  function init() {
    initClock();
    initMode();
    bindEvents();
  }

  init();
})();
