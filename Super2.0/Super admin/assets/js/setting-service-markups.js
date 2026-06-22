(function () {
  var store = window.NKServiceMarkupsStore;
  if (!store) return;

  var state = {
    rows: [],
    editingId: "",
    filters: {
      search: "",
      facility: "",
      mainService: "",
      service: "",
      pricingLevel: "",
      markupType: ""
    }
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function norm(value) {
    return String(value == null ? "" : value).trim().toLowerCase();
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function clearError(id) {
    var node = byId(id);
    if (!node) return;
    node.textContent = "";
    node.classList.remove("show");
  }

  function setError(id, message) {
    var node = byId(id);
    if (!node) return;
    node.textContent = message || "";
    node.classList.toggle("show", !!message);
  }

  function setInputInvalid(id, invalid) {
    var node = byId(id);
    if (!node) return;
    node.classList.toggle("field-invalid", !!invalid);
  }

  function clearFormErrors() {
    clearError("errMarkupFacilityService");
    clearError("errMarkupType");
    clearError("errMarkupAmount");
    setInputInvalid("markupFacilityService", false);
    setInputInvalid("markupType", false);
    setInputInvalid("markupAmount", false);
  }

  function servicesOptionsHtml() {
    return store.FACILITY_SERVICES.map(function (item) {
      var value = store.facilityServiceValue(item);
      return (
        '<option value="' +
        esc(value) +
        '">[' +
        esc(item.facilityName) +
        "] " +
        esc(item.mainServiceName) +
        " / " +
        esc(item.serviceName) +
        "</option>"
      );
    }).join("");
  }

  function facilityFilterOptionsHtml() {
    var seen = {};
    var options = [];
    store.FACILITY_SERVICES.forEach(function (item) {
      if (seen[item.facilityCode]) return;
      seen[item.facilityCode] = true;
      options.push('<option value="' + esc(item.facilityCode) + '">' + esc(item.facilityName) + "</option>");
    });
    return options.join("");
  }

  function mainServiceFilterOptionsHtml() {
    var seen = {};
    var options = [];
    store.FACILITY_SERVICES.forEach(function (item) {
      if (seen[item.mainServiceId]) return;
      seen[item.mainServiceId] = true;
      options.push('<option value="' + esc(item.mainServiceId) + '">' + esc(item.mainServiceName) + "</option>");
    });
    return options.join("");
  }

  function serviceFilterOptionsHtml() {
    return store.FACILITY_SERVICES.map(function (item) {
      return '<option value="' + esc(item.serviceId) + '">' + esc(item.serviceName) + "</option>";
    }).join("");
  }

  function renderSelectOptions() {
    var serviceSelect = byId("markupFacilityService");
    if (serviceSelect) {
      serviceSelect.innerHTML = '<option value="">Select a hospital service</option>' + servicesOptionsHtml();
    }

    var facilityFilter = byId("fMarkupFacility");
    if (facilityFilter) {
      facilityFilter.innerHTML = '<option value="">All Facilities</option>' + facilityFilterOptionsHtml();
    }
    var facilityFilterModal = byId("fMarkupFacilityModal");
    if (facilityFilterModal) {
      facilityFilterModal.innerHTML = '<option value="">All Facilities</option>' + facilityFilterOptionsHtml();
    }

    var mainFilter = byId("fMarkupMainService");
    if (mainFilter) {
      mainFilter.innerHTML = '<option value="">All Main Services</option>' + mainServiceFilterOptionsHtml();
    }
    var mainFilterModal = byId("fMarkupMainServiceModal");
    if (mainFilterModal) {
      mainFilterModal.innerHTML = '<option value="">All Main Services</option>' + mainServiceFilterOptionsHtml();
    }
    var serviceFilter = byId("fMarkupService");
    if (serviceFilter) {
      serviceFilter.innerHTML = '<option value="">All Services</option>' + serviceFilterOptionsHtml();
    }
    var serviceFilterModal = byId("fMarkupServiceModal");
    if (serviceFilterModal) {
      serviceFilterModal.innerHTML = '<option value="">All Services</option>' + serviceFilterOptionsHtml();
    }
  }

  function resetForm() {
    state.editingId = "";
    clearFormErrors();
    byId("markupModalTitle").textContent = "Create Service Markup";
    byId("markupFacilityService").value = "";
    byId("markupPricingLevel").value = "standard";
    byId("markupType").value = "";
    byId("markupAmount").value = "";
    updatePreview();
  }

  function openCreateModal() {
    resetForm();
    var modalEl = byId("serviceMarkupModal");
    if (window.bootstrap && window.bootstrap.Modal) {
      bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }
  }

  function openEditModal(id) {
    var row = store.get(id);
    if (!row) return;
    state.editingId = row.id;
    clearFormErrors();
    byId("markupModalTitle").textContent = "Edit Service Markup";
    byId("markupFacilityService").value = store.facilityServiceValue(row);
    byId("markupPricingLevel").value = row.pricingLevel;
    byId("markupType").value = row.markupType;
    byId("markupAmount").value = row.amount;
    updatePreview();

    var modalEl = byId("serviceMarkupModal");
    if (window.bootstrap && window.bootstrap.Modal) {
      bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }
  }

  function collectForm() {
    var selected = store.findFacilityService(byId("markupFacilityService").value);
    var base = selected || {};
    return store.normalizeMarkup({
      id: state.editingId,
      facilityCode: base.facilityCode || "",
      facilityName: base.facilityName || "",
      mainServiceId: base.mainServiceId || "",
      mainServiceName: base.mainServiceName || "",
      serviceId: base.serviceId || "",
      serviceName: base.serviceName || "",
      pricingLevel: byId("markupPricingLevel").value,
      markupType: byId("markupType").value,
      amount: byId("markupAmount").value
    });
  }

  function updatePreview() {
    var markupType = byId("markupType") ? byId("markupType").value : "";
    var amount = byId("markupAmount") ? byId("markupAmount").value : "";
    var node = byId("markupPreview");
    if (!node) return;
    var row = store.normalizeMarkup({ markupType: markupType || "percentage", amount: amount });
    node.textContent = row.amount > 0 && markupType ? store.formatAmount(row) : "-";
  }

  function saveForm(closeAfterSave) {
    clearFormErrors();
    if (!byId("markupType").value) {
      setError("errMarkupType", "Markup type is required.");
      setInputInvalid("markupType", true);
      return;
    }

    var row = collectForm();
    var result = store.upsert(row);
    if (!result.ok) {
      var errors = result.errors || {};
      if (errors.facilityService) {
        setError("errMarkupFacilityService", errors.facilityService);
        setInputInvalid("markupFacilityService", true);
      }
      if (errors.amount) {
        setError("errMarkupAmount", errors.amount);
        setInputInvalid("markupAmount", true);
      }
      return;
    }

    reload();
    if (closeAfterSave) {
      var modalEl = byId("serviceMarkupModal");
      if (window.bootstrap && window.bootstrap.Modal) {
        bootstrap.Modal.getOrCreateInstance(modalEl).hide();
      }
    } else {
      resetForm();
    }
  }

  function filteredRows() {
    var q = norm(state.filters.search);
    var facility = norm(state.filters.facility);
    var mainService = norm(state.filters.mainService);
    var service = norm(state.filters.service);
    var pricingLevel = norm(state.filters.pricingLevel);
    var markupType = norm(state.filters.markupType);

    return state.rows.filter(function (row) {
      if (facility && norm(row.facilityCode) !== facility) return false;
      if (mainService && norm(row.mainServiceId) !== mainService) return false;
      if (service && norm(row.serviceId) !== service) return false;
      if (pricingLevel && norm(row.pricingLevel) !== pricingLevel) return false;
      if (markupType && norm(row.markupType) !== markupType) return false;
      if (!q) return true;

      return [row.facilityName, row.facilityCode, row.mainServiceName, row.serviceName, store.pricingLevelLabel(row.pricingLevel), store.markupTypeLabel(row.markupType), store.formatAmount(row)]
        .join(" ")
        .toLowerCase()
        .indexOf(q) > -1;
    });
  }

  function rowHtml(row, index) {
    return (
      "<tr>" +
      '<td class="text-center">' + (index + 1) + "</td>" +
      "<td>" +
      '<span class="sm-strong">' + esc(row.facilityName) + "</span>" +
      '<span class="sm-muted">' + esc(row.facilityCode) + "</span>" +
      "</td>" +
      "<td>" +
      '<span class="sm-strong">' + esc(row.serviceName) + "</span>" +
      "</td>" +
      "<td>" +
      '<span class="sm-strong">' + esc(store.mainServiceLabel(row)) + "</span>" +
      "</td>" +
      "<td>" +
      '<span class="status-pill st-waiting">' + esc(store.pricingLevelLabel(row.pricingLevel)) + "</span>" +
      "</td>" +
      "<td>" +
      '<span class="status-pill st-complete">' + esc(store.markupTypeLabel(row.markupType)) + "</span>" +
      "</td>" +
      "<td>" +
      '<span class="staff-code">' + esc(store.formatAmount(row)) + "</span>" +
      "</td>" +
      '<td class="text-end">' +
      '<div class="dropdown d-inline-flex">' +
      '<button type="button" class="btn btn-primary-revers btn-32 sm-action-btn" data-bs-toggle="dropdown" aria-expanded="false" title="Actions"><i class="fi fi-rr-menu-dots"></i></button>' +
      '<ul class="dropdown-menu dropdown-menu-end">' +
      '<li><button type="button" class="dropdown-item js-markup-action" data-action="edit" data-id="' + esc(row.id) + '">Edit</button></li>' +
      '<li><button type="button" class="dropdown-item text-red js-markup-action" data-action="delete" data-id="' + esc(row.id) + '">Delete</button></li>' +
      "</ul>" +
      "</div>" +
      "</td>" +
      "</tr>"
    );
  }

  function renderTable() {
    var rows = filteredRows();
    var body = byId("serviceMarkupTbody");
    var tableWrap = byId("serviceMarkupTableWrap");
    var empty = byId("serviceMarkupEmpty");
    var noResults = byId("serviceMarkupNoResults");

    byId("serviceMarkupCount").textContent = String(state.rows.length);
    byId("serviceMarkupFilteredCount").textContent = String(rows.length);

    if (!state.rows.length) {
      tableWrap.classList.remove("d-none");
      body.innerHTML = "";
      empty.classList.remove("d-none");
      noResults.classList.add("d-none");
      return;
    }

    empty.classList.add("d-none");
    tableWrap.classList.remove("d-none");

    if (!rows.length) {
      body.innerHTML = "";
      noResults.classList.remove("d-none");
      return;
    }

    noResults.classList.add("d-none");
    body.innerHTML = rows.map(rowHtml).join("");
  }

  function reload() {
    state.rows = store.list();
    renderTable();
  }

  function applyFilters() {
    state.filters.search = byId("serviceMarkupSearch").value;
    state.filters.facility = byId("fMarkupFacility").value;
    state.filters.mainService = byId("fMarkupMainService").value;
    state.filters.service = byId("fMarkupService").value;
    state.filters.pricingLevel = byId("fMarkupPricingLevel").value;
    state.filters.markupType = byId("fMarkupType").value;
    syncModalFiltersFromInline();
    renderTable();
  }

  function syncModalFiltersFromInline() {
    if (byId("fMarkupFacilityModal")) byId("fMarkupFacilityModal").value = byId("fMarkupFacility").value;
    if (byId("fMarkupMainServiceModal")) byId("fMarkupMainServiceModal").value = byId("fMarkupMainService").value;
    if (byId("fMarkupServiceModal")) byId("fMarkupServiceModal").value = byId("fMarkupService").value;
    if (byId("fMarkupPricingLevelModal")) byId("fMarkupPricingLevelModal").value = byId("fMarkupPricingLevel").value;
    if (byId("fMarkupTypeModal")) byId("fMarkupTypeModal").value = byId("fMarkupType").value;
  }

  function applyModalFilters() {
    byId("fMarkupFacility").value = byId("fMarkupFacilityModal").value;
    byId("fMarkupMainService").value = byId("fMarkupMainServiceModal").value;
    byId("fMarkupService").value = byId("fMarkupServiceModal").value;
    byId("fMarkupPricingLevel").value = byId("fMarkupPricingLevelModal").value;
    byId("fMarkupType").value = byId("fMarkupTypeModal").value;
    applyFilters();
  }

  function resetFilters() {
    byId("serviceMarkupSearch").value = "";
    byId("fMarkupFacility").value = "";
    byId("fMarkupMainService").value = "";
    byId("fMarkupService").value = "";
    byId("fMarkupPricingLevel").value = "";
    byId("fMarkupType").value = "";
    syncModalFiltersFromInline();
    applyFilters();
  }

  function bindEvents() {
    byId("btnCreateServiceMarkup").addEventListener("click", openCreateModal);
    byId("btnEmptyCreateMarkup").addEventListener("click", openCreateModal);
    byId("btnMarkupSearch").addEventListener("click", applyFilters);
    byId("btnMarkupReset").addEventListener("click", resetFilters);
    byId("serviceMarkupSearch").addEventListener("input", applyFilters);
    ["fMarkupFacility", "fMarkupMainService", "fMarkupService", "fMarkupPricingLevel", "fMarkupType"].forEach(function (id) {
      var node = byId(id);
      if (node) node.addEventListener("change", applyFilters);
    });
    byId("btnApplyMarkupFilter").addEventListener("click", applyModalFilters);
    byId("btnResetMarkupFilter").addEventListener("click", resetFilters);

    ["markupFacilityService", "markupPricingLevel", "markupType", "markupAmount"].forEach(function (id) {
      var node = byId(id);
      if (!node) return;
      node.addEventListener("input", function () {
        clearFormErrors();
        updatePreview();
      });
      node.addEventListener("change", function () {
        clearFormErrors();
        updatePreview();
      });
    });

    byId("btnSaveMarkup").addEventListener("click", function () {
      saveForm(true);
    });
    byId("btnSaveMarkupAnother").addEventListener("click", function () {
      saveForm(false);
    });

    byId("serviceMarkupTbody").addEventListener("click", function (event) {
      var btn = event.target.closest(".js-markup-action");
      if (!btn) return;
      var action = btn.getAttribute("data-action");
      var id = btn.getAttribute("data-id");
      if (action === "edit") {
        openEditModal(id);
        return;
      }
      if (action === "delete") {
        if (!window.confirm("Delete this service markup?")) return;
        store.remove(id);
        reload();
      }
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

  document.addEventListener("DOMContentLoaded", function () {
    renderSelectOptions();
    bindEvents();
    initClock();
    reload();
  });
})();
