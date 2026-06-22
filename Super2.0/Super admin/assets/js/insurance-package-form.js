(function () {
  "use strict";

  var store = window.NKInsurancePackageStore;
  if (!store) return;

  var form = document.getElementById("insurancePackageForm");
  if (!form) return;

  var pageTitle = document.getElementById("formPageTitle");
  var cardTitle = document.getElementById("formCardTitle");
  var breadcrumbCurrent = document.getElementById("formBreadcrumbCurrent");
  var alertBox = document.getElementById("insurancePackageFormAlert");

  var fieldNameAr = document.getElementById("pkgNameAr");
  var fieldNameEn = document.getElementById("pkgNameEn");
  var fieldCode = document.getElementById("pkgCode");
  var fieldMainService = document.getElementById("pkgMainService");
  var fieldAuthRequired = document.getElementById("pkgAuthRequired");
  var authRequiredStateText = document.getElementById("pkgAuthRequiredStateText");
  var fieldUnitType = document.getElementById("pkgUnitType");
  var fieldUnitsCount = document.getElementById("pkgUnitsCount");
  var fieldValidityType = document.getElementById("pkgValidityType");
  var fieldValidityValue = document.getElementById("pkgValidityValue");
  var fieldMaxPerDay = document.getElementById("pkgMaxPerDay");
  var fieldDescription = document.getElementById("pkgDescription");
  var fieldIsActive = document.getElementById("pkgIsActive");
  var activeStateText = document.getElementById("pkgActiveStateText");

  var params = new URLSearchParams(window.location.search);
  var mode = (params.get("mode") || "add").toLowerCase() === "edit" ? "edit" : "add";
  var editId = (params.get("id") || "").trim();
  var editingItem = null;

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

  function toInt(value, fallback) {
    var parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function showAlert(message, type) {
    if (!alertBox) return;
    alertBox.className = "alert";
    if (type === "success") alertBox.classList.add("alert-success");
    else alertBox.classList.add("alert-danger");
    alertBox.classList.remove("d-none");
    alertBox.textContent = message;
  }

  function clearAlert() {
    if (!alertBox) return;
    alertBox.classList.add("d-none");
    alertBox.textContent = "";
  }

  function updateActiveStateText() {
    activeStateText.textContent = fieldIsActive.checked ? "Active" : "Inactive";
  }

  function updateAuthRequiredStateText() {
    if (!fieldAuthRequired || !authRequiredStateText) return;
    authRequiredStateText.textContent = fieldAuthRequired.checked ? "Required" : "Not Required";
  }

  function setPageMode() {
    var isEdit = mode === "edit";
    var title = isEdit ? "Edit Package" : "Add Package";
    var breadcrumb = isEdit ? "Edit" : "Add";
    document.title = "Naraakum | " + title;
    pageTitle.textContent = title;
    cardTitle.textContent = title;
    breadcrumbCurrent.textContent = breadcrumb;
  }

  function populateMainServiceOptions(selectedValue) {
    var services = store.getMainServices(store.getAll());
    var html = '<option value="">Select service</option>';
    html += services
      .map(function (name) {
        var selected = norm(name) === norm(selectedValue) ? " selected" : "";
        return '<option value="' + name + '"' + selected + ">" + name + "</option>";
      })
      .join("");
    fieldMainService.innerHTML = html;
  }

  function fillForm(item) {
    fieldNameAr.value = item.nameAr || "";
    fieldNameEn.value = item.nameEn || item.name || "";
    fieldCode.value = item.code || "";
    populateMainServiceOptions(item.mainService || "");
    if (fieldAuthRequired) fieldAuthRequired.checked = !!item.authRequired;
    fieldUnitType.value = item.unitType || "";
    fieldUnitsCount.value = item.unitsCount || "";
    fieldValidityType.value = item.validityType || "Days";
    fieldValidityValue.value = item.validityValue || "";
    fieldMaxPerDay.value = item.maxPerDay || "";
    fieldDescription.value = item.description || "";
    fieldIsActive.checked = !!item.isActive;
    updateActiveStateText();
    updateAuthRequiredStateText();
  }

  function readFormPayload() {
    var nameAr = norm(fieldNameAr.value);
    var nameEn = norm(fieldNameEn.value);
    var unitsCount = toInt(fieldUnitsCount.value, 0);
    var validityValue = toInt(fieldValidityValue.value, 0);

    return {
      id: mode === "edit" && editingItem ? editingItem.id : "",
      nameAr: nameAr,
      nameEn: nameEn,
      name: nameEn || nameAr,
      code: norm(fieldCode.value),
      mainService: norm(fieldMainService.value),
      authRequired: fieldAuthRequired ? !!fieldAuthRequired.checked : false,
      unitType: norm(fieldUnitType.value),
      unitsCount: unitsCount,
      validityType: norm(fieldValidityType.value) || "Days",
      validityValue: validityValue,
      maxPerDay: norm(fieldMaxPerDay.value),
      description: norm(fieldDescription.value),
      isActive: !!fieldIsActive.checked
    };
  }

  function validatePayload(payload) {
    if (!payload.nameAr && !payload.nameEn) return "Package Name (Arabic) or Package Name (English) is required.";
    if (!payload.mainService) return "Service is required.";
    if (!payload.unitType) return "Unit Type is required.";
    if (payload.unitsCount <= 0) return "Units Count must be greater than 0.";
    if (payload.validityValue <= 0) return "Validity Value must be greater than 0.";
    return "";
  }

  function savePackage() {
    clearAlert();
    var payload = readFormPayload();
    var validationError = validatePayload(payload);
    if (validationError) {
      showAlert(validationError, "danger");
      return;
    }

    var saved = store.upsert(payload);
    if (!saved) {
      showAlert("Unable to save package.", "danger");
      return;
    }

    store.setFlash(mode === "edit" ? "Package updated successfully." : "Package created successfully.", "success");
    window.location.href = "insurance-packages.html";
  }

  function consumeFlashInline() {
    var flash = store.consumeFlash();
    if (!flash || !flash.message) return;
    showAlert(flash.message, flash.type === "danger" ? "danger" : "success");
  }

  function initMode() {
    setPageMode();
    populateMainServiceOptions("");
    updateActiveStateText();
    updateAuthRequiredStateText();

    if (mode !== "edit") return;

    if (!editId) {
      store.setFlash("Package not found.", "danger");
      window.location.href = "insurance-packages.html";
      return;
    }

    editingItem = store.getById(editId);
    if (!editingItem) {
      store.setFlash("Package not found.", "danger");
      window.location.href = "insurance-packages.html";
      return;
    }

    fillForm(editingItem);
  }

  function bindEvents() {
    fieldIsActive.addEventListener("change", updateActiveStateText);
    if (fieldAuthRequired) fieldAuthRequired.addEventListener("change", updateAuthRequiredStateText);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      savePackage();
    });
  }

  function init() {
    initClock();
    consumeFlashInline();
    initMode();
    bindEvents();
  }

  init();
})();
