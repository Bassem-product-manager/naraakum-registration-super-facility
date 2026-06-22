(function () {
  "use strict";

  var store = window.NKNaraakmPackageStore;
  if (!store) return;

  var form = document.getElementById("naraakmPackageForm");
  if (!form) return;

  var pageTitle = document.getElementById("formPageTitle");
  var cardTitle = document.getElementById("formCardTitle");
  var breadcrumbCurrent = document.getElementById("formBreadcrumbCurrent");
  var alertBox = document.getElementById("naraakmPackageFormAlert");

  var fieldNameAr = document.getElementById("npNameAr");
  var fieldNameEn = document.getElementById("npNameEn");
  var fieldCode = document.getElementById("npCode");
  var fieldMainServiceSearch = document.getElementById("npMainServiceSearch");
  var mainServiceOptionsWrap = document.getElementById("npMainServiceOptions");
  var mainServiceSelectedWrap = document.getElementById("npMainServiceSelected");
  var fieldCommissionType = document.getElementById("npCommissionType");
  var fieldCommissionValue = document.getElementById("npCommissionValue");
  var fieldCommissionHint = document.getElementById("npCommissionHint");
  var fieldIsActive = document.getElementById("npIsActive");
  var activeStateText = document.getElementById("npActiveStateText");

  var subServicesSearch = document.getElementById("npSubServiceSearch");
  var subServicesTbody = document.getElementById("npSubServiceTbody");
  var subServicesEmpty = document.getElementById("npSubServiceEmpty");
  var btnSubServicesReset = document.getElementById("btnSubServicesReset");

  var summarySubtotal = document.getElementById("npSummarySubtotal");
  var summaryCommission = document.getElementById("npSummaryCommission");
  var summaryTotal = document.getElementById("npSummaryTotal");

  var params = new URLSearchParams(window.location.search);
  var mode = (params.get("mode") || "add").toLowerCase() === "edit" ? "edit" : "add";
  var editId = (params.get("id") || "").trim();
  var editingItem = null;

  var selectedMainServicesMap = {};
  var allMainServices = [];
  var manualSelectedItemsMap = {};
  var currentSubServices = [];

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

  function upper(value) {
    return norm(value).toUpperCase();
  }

  function toNum(value, fallback) {
    var n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function toInt(value, fallback) {
    var n = parseInt(value, 10);
    return Number.isFinite(n) ? n : fallback;
  }

  function roundMoney(value) {
    return Math.round((toNum(value, 0) + Number.EPSILON) * 100) / 100;
  }

  function formatMoney(value) {
    var amount = roundMoney(value);
    return amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + " SAR";
  }

  function uniqueStrings(values) {
    var list = Array.isArray(values) ? values : [];
    var map = {};
    var output = [];

    list.forEach(function (entry) {
      var value = norm(entry);
      var key = lower(value);
      if (!key || map[key]) return;
      map[key] = true;
      output.push(value);
    });

    return output;
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
    if (!activeStateText || !fieldIsActive) return;
    activeStateText.textContent = fieldIsActive.checked ? "Active" : "Inactive";
  }

  function updateCommissionInputRules() {
    var type = norm(fieldCommissionType.value).toLowerCase() === "fixed" ? "fixed" : "percent";
    if (type === "percent") {
      fieldCommissionValue.max = String(store.limits.maxCommissionPercent);
      fieldCommissionHint.textContent = "Percent commission max is " + store.limits.maxCommissionPercent + "%.";
      if (toNum(fieldCommissionValue.value, 0) > store.limits.maxCommissionPercent) {
        fieldCommissionValue.value = String(store.limits.maxCommissionPercent);
      }
      return;
    }

    fieldCommissionValue.removeAttribute("max");
    fieldCommissionHint.textContent = "Fixed amount has no upper limit.";
  }

  function setPageMode() {
    var isEdit = mode === "edit";
    var title = isEdit ? "Edit Naraakm Package" : "Add Naraakm Package";
    var breadcrumb = isEdit ? "Edit" : "Add";

    document.title = "Naraakum | " + title;
    if (pageTitle) pageTitle.textContent = title;
    if (cardTitle) cardTitle.textContent = title;
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = breadcrumb;
  }

  function getSelectedMainFilters() {
    return uniqueStrings(
      Object.keys(selectedMainServicesMap).map(function (key) {
        return selectedMainServicesMap[key];
      })
    );
  }

  function syncSelectedMainFilters(values) {
    selectedMainServicesMap = {};
    uniqueStrings(values || []).forEach(function (name) {
      var value = norm(name);
      var key = lower(value);
      if (!key) return;
      selectedMainServicesMap[key] = value;
    });
  }

  function toggleMainServiceSelection(value) {
    var main = norm(value);
    var key = lower(main);
    if (!key) return;
    if (selectedMainServicesMap[key]) delete selectedMainServicesMap[key];
    else selectedMainServicesMap[key] = main;
  }

  function renderSelectedMainServices() {
    var selected = getSelectedMainFilters();
    if (!selected.length) {
      mainServiceSelectedWrap.innerHTML = '<span class="np-selected-empty">No main services selected</span>';
      return;
    }

    var countChip = '<span class="np-selected-chip">Selected: ' + selected.length + "</span>";
    var selectedChips = selected
      .map(function (main) {
        return (
          '<span class="np-selected-chip">' +
          escapeHtml(main) +
          '<button type="button" data-action="remove-main" data-main="' +
          escapeHtml(main) +
          '" aria-label="Remove">x</button>' +
          "</span>"
        );
      })
      .join("");

    mainServiceSelectedWrap.innerHTML = countChip + selectedChips;
  }

  function renderMainServiceOptions() {
    var query = lower(fieldMainServiceSearch.value);
    var filtered = allMainServices.filter(function (main) {
      return !query || lower(main).indexOf(query) !== -1;
    });

    if (!filtered.length) {
      mainServiceOptionsWrap.innerHTML = '<span class="np-selected-empty">No main services found.</span>';
      renderSelectedMainServices();
      return;
    }

    mainServiceOptionsWrap.innerHTML = filtered
      .map(function (main) {
        var active = selectedMainServicesMap[lower(main)] ? " is-active" : "";
        return (
          '<button type="button" class="np-main-pill' +
          active +
          '" data-action="toggle-main" data-main="' +
          escapeHtml(main) +
          '">' +
          escapeHtml(main) +
          "</button>"
        );
      })
      .join("");

    renderSelectedMainServices();
  }

  function populateMainServices(selectedValues) {
    allMainServices = uniqueStrings(store.getMainServices(store.getAll()));
    syncSelectedMainFilters(selectedValues || []);
    renderMainServiceOptions();
  }

  function clearManualSelections() {
    manualSelectedItemsMap = {};
  }

  function setManualSelections(bundleItems) {
    clearManualSelections();
    (bundleItems || []).forEach(function (item) {
      var key = upper(item.serviceId);
      if (!key) return;
      manualSelectedItemsMap[key] = {
        serviceId: key,
        serviceName: norm(item.serviceName),
        mainService: norm(item.mainService),
        basePrice: roundMoney(item.basePrice),
        quantity: Math.max(1, toInt(item.quantity, 1))
      };
    });
  }

  function getManualSelectionsAsArray() {
    return Object.keys(manualSelectedItemsMap)
      .map(function (key) {
        var item = manualSelectedItemsMap[key];
        if (!item) return null;
        var quantity = Math.max(1, toInt(item.quantity, 1));
        var basePrice = roundMoney(item.basePrice);
        return {
          serviceId: item.serviceId,
          serviceName: item.serviceName,
          mainService: item.mainService,
          basePrice: basePrice,
          quantity: quantity,
          lineTotal: roundMoney(basePrice * quantity)
        };
      })
      .filter(Boolean);
  }

  function readCommissionPayload() {
    var type = norm(fieldCommissionType.value).toLowerCase() === "fixed" ? "fixed" : "percent";
    var value = toNum(fieldCommissionValue.value, 0);
    if (value < 0) value = 0;
    if (type === "percent" && value > store.limits.maxCommissionPercent) {
      value = store.limits.maxCommissionPercent;
    }
    return { type: type, value: value };
  }

  function findManualSelection(serviceId) {
    return manualSelectedItemsMap[upper(serviceId)] || null;
  }

  function toggleManualServiceSelection(service, isChecked) {
    var key = upper(service && service.id);
    if (!key) return;
    if (!isChecked) {
      delete manualSelectedItemsMap[key];
      refreshSummary();
      return;
    }
    manualSelectedItemsMap[key] = {
      serviceId: key,
      serviceName: norm(service.serviceName),
      mainService: norm(service.mainService),
      basePrice: roundMoney(service.basePrice),
      quantity: 1
    };
    refreshSummary();
  }

  function setManualServiceQuantity(serviceId, quantity) {
    var selected = manualSelectedItemsMap[upper(serviceId)];
    if (!selected) return;
    selected.quantity = Math.max(1, toInt(quantity, 1));
    refreshSummary();
  }

  function getFilteredSubServices() {
    var query = lower(subServicesSearch.value);
    if (!query) return currentSubServices.slice();
    return currentSubServices.filter(function (service) {
      return (
        lower(service.serviceName).indexOf(query) !== -1 ||
        lower(service.mainService).indexOf(query) !== -1 ||
        lower(service.id).indexOf(query) !== -1
      );
    });
  }

  function renderSubServices() {
    currentSubServices = store.getSubServicesByMain(getSelectedMainFilters());
    var filtered = getFilteredSubServices();

    if (!filtered.length) {
      subServicesTbody.innerHTML = "";
      subServicesEmpty.classList.remove("d-none");
      subServicesEmpty.textContent = "No sub services match current filter.";
      refreshSummary();
      return;
    }

    subServicesEmpty.classList.add("d-none");
    subServicesTbody.innerHTML = filtered
      .map(function (service) {
        var key = upper(service.id);
        var selected = findManualSelection(key);
        var isChecked = !!selected;
        var qty = selected ? selected.quantity : 1;
        var lineTotal = roundMoney((selected ? selected.basePrice : service.basePrice) * qty);

        return (
          "<tr data-service-id='" +
          escapeHtml(key) +
          "'>" +
          "<td class='text-center'>" +
          "<label class='switch m-0'>" +
          "<input data-action='toggle' type='checkbox' " +
          (isChecked ? "checked" : "") +
          ">" +
          "<span class='slider'></span>" +
          "</label>" +
          "</td>" +
          "<td>" +
          "<div class='np-service-name'>" +
          escapeHtml(service.serviceName) +
          "</div>" +
          "<div class='np-service-sub'>" +
          escapeHtml(service.id) +
          "</div>" +
          "</td>" +
          "<td>" +
          escapeHtml(service.mainService) +
          "</td>" +
          "<td>" +
          formatMoney(service.basePrice) +
          "</td>" +
          "<td>" +
          "<input data-action='qty' type='number' min='1' step='1' class='form-control form-control-32 np-qty-input' value='" +
          qty +
          "' " +
          (isChecked ? "" : "disabled") +
          ">" +
          "</td>" +
          "<td><span data-role='line-total'>" +
          formatMoney(lineTotal) +
          "</span></td>" +
          "</tr>"
        );
      })
      .join("");

    bindSubServiceRowEvents();
    refreshSummary();
  }

  function bindSubServiceRowEvents() {
    subServicesTbody.querySelectorAll("tr").forEach(function (row) {
      var serviceId = upper(row.getAttribute("data-service-id"));
      if (!serviceId) return;

      var service = currentSubServices.find(function (entry) {
        return upper(entry.id) === serviceId;
      });
      if (!service) return;

      var toggle = row.querySelector('[data-action="toggle"]');
      var qtyInput = row.querySelector('[data-action="qty"]');
      var lineTotalEl = row.querySelector('[data-role="line-total"]');

      if (toggle) {
        toggle.addEventListener("change", function () {
          toggleManualServiceSelection(service, !!toggle.checked);
          qtyInput.disabled = !toggle.checked;
          if (toggle.checked && !qtyInput.value) qtyInput.value = "1";

          var selected = findManualSelection(serviceId);
          var quantity = selected ? selected.quantity : 1;
          var lineTotal = roundMoney((selected ? selected.basePrice : service.basePrice) * quantity);
          lineTotalEl.textContent = formatMoney(lineTotal);
        });
      }

      if (qtyInput) {
        qtyInput.addEventListener("change", function () {
          var safeQty = Math.max(1, toInt(qtyInput.value, 1));
          qtyInput.value = String(safeQty);
          if (!toggle || !toggle.checked) return;
          setManualServiceQuantity(serviceId, safeQty);
          var selected = findManualSelection(serviceId);
          var lineTotal = roundMoney((selected ? selected.basePrice : service.basePrice) * safeQty);
          lineTotalEl.textContent = formatMoney(lineTotal);
        });
      }
    });
  }

  function refreshSummary() {
    var manual = getManualSelectionsAsArray();
    var commission = readCommissionPayload();
    var totals = store.calculateTotals(manual, commission.type, commission.value);

    summarySubtotal.textContent = formatMoney(totals.subtotal);
    if (totals.commissionType === "percent") {
      summaryCommission.textContent = totals.commissionValue + "% (" + formatMoney(totals.commissionAmount) + ")";
    } else {
      summaryCommission.textContent = "Fixed (" + formatMoney(totals.commissionAmount) + ")";
    }
    summaryTotal.textContent = formatMoney(totals.finalTotal);
  }

  function readFormPayload() {
    var names = {
      nameAr: norm(fieldNameAr.value),
      nameEn: norm(fieldNameEn.value)
    };

    var manualBundle = getManualSelectionsAsArray();
    var bundleItems = store.mergeBundleItems(manualBundle);
    var selectedMainFilters = getSelectedMainFilters();
    var bundleMains = uniqueStrings(
      bundleItems.map(function (item) {
        return item.mainService;
      })
    );
    var mainServices = uniqueStrings(selectedMainFilters.concat(bundleMains));
    var commission = readCommissionPayload();

    return {
      id: mode === "edit" && editingItem ? editingItem.id : "",
      nameAr: names.nameAr,
      nameEn: names.nameEn,
      name: names.nameEn || names.nameAr,
      code: norm(fieldCode.value),
      mainServices: mainServices,
      mainService: mainServices[0] || "",
      manualBundleItems: manualBundle,
      bundleItems: bundleItems,
      referencedPackageIds: [],
      commissionType: commission.type,
      commissionValue: commission.value,
      isActive: !!fieldIsActive.checked
    };
  }

  function validatePayload(payload) {
    if (!payload.nameAr && !payload.nameEn) return "Package name (Arabic or English) is required.";
    if (!Array.isArray(payload.bundleItems) || !payload.bundleItems.length) {
      return "Select at least one sub service.";
    }
    if (payload.commissionValue < 0) return "Commission value cannot be negative.";
    if (payload.commissionType === "percent" && payload.commissionValue > store.limits.maxCommissionPercent) {
      return "Commission percent cannot exceed " + store.limits.maxCommissionPercent + "%.";
    }
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

    store.setFlash(mode === "edit" ? "Naraakm package updated successfully." : "Naraakm package created successfully.", "success");
    window.location.href = "naraakm-packages.html";
  }

  function fillForm(item) {
    fieldNameAr.value = item.nameAr || "";
    fieldNameEn.value = item.nameEn || item.name || "";
    fieldCode.value = item.code || "";
    populateMainServices(item.mainServices || (item.mainService ? [item.mainService] : []));

    fieldCommissionType.value = norm(item.commissionType).toLowerCase() === "fixed" ? "fixed" : "percent";
    fieldCommissionValue.value = toNum(item.commissionValue, 0);
    fieldIsActive.checked = !!item.isActive;
    updateActiveStateText();
    updateCommissionInputRules();

    setManualSelections(item.manualBundleItems && item.manualBundleItems.length ? item.manualBundleItems : item.bundleItems || []);
    renderSubServices();
    refreshSummary();
  }

  function initMode() {
    setPageMode();
    populateMainServices([]);
    updateActiveStateText();
    updateCommissionInputRules();
    renderSubServices();

    if (mode !== "edit") return;

    if (!editId) {
      store.setFlash("Package not found.", "danger");
      window.location.href = "naraakm-packages.html";
      return;
    }

    editingItem = store.getById(editId);
    if (!editingItem) {
      store.setFlash("Package not found.", "danger");
      window.location.href = "naraakm-packages.html";
      return;
    }

    fillForm(editingItem);
  }

  function bindEvents() {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      savePackage();
    });

    fieldIsActive.addEventListener("change", updateActiveStateText);

    fieldMainServiceSearch.addEventListener("input", renderMainServiceOptions);

    mainServiceOptionsWrap.addEventListener("click", function (event) {
      var btn = event.target.closest('[data-action="toggle-main"]');
      if (!btn) return;
      var main = btn.getAttribute("data-main");
      toggleMainServiceSelection(main);
      renderMainServiceOptions();
      renderSubServices();
      refreshSummary();
    });

    mainServiceSelectedWrap.addEventListener("click", function (event) {
      var btn = event.target.closest('[data-action="remove-main"]');
      if (!btn) return;
      var main = btn.getAttribute("data-main");
      toggleMainServiceSelection(main);
      renderMainServiceOptions();
      renderSubServices();
      refreshSummary();
    });

    subServicesSearch.addEventListener("input", renderSubServices);
    btnSubServicesReset.addEventListener("click", function () {
      subServicesSearch.value = "";
      renderSubServices();
    });

    fieldCommissionType.addEventListener("change", function () {
      updateCommissionInputRules();
      refreshSummary();
    });

    fieldCommissionValue.addEventListener("input", function () {
      updateCommissionInputRules();
      refreshSummary();
    });
  }

  function init() {
    initClock();
    initMode();
    bindEvents();
    refreshSummary();
  }

  init();
})();
