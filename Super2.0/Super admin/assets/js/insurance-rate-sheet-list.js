(function () {
  "use strict";

  var store = window.NKInsuranceRateRuleStore;
  if (!store) return;

  var tbody = document.getElementById("insuranceRateRulesTbody");
  if (!tbody) return;

  var searchInput = document.getElementById("insuranceRateSearchInput");
  var btnSearch = document.getElementById("btnInsuranceRateSearch");
  var btnReset = document.getElementById("btnInsuranceRateReset");

  var modalEl = document.getElementById("insurance-rate-filter-modal");
  var modalCompany = document.getElementById("rateFilterCompany");
  var modalPlan = document.getElementById("rateFilterPlan");
  var modalClass = document.getElementById("rateFilterClass");
  var modalType = document.getElementById("rateFilterType");
  var modalMainService = document.getElementById("rateFilterMainService");
  var modalStatus = document.getElementById("rateFilterStatus");
  var modalAuthRequired = document.getElementById("rateFilterAuthRequired");
  var modalCopayType = document.getElementById("rateFilterCopayType");
  var modalCoverageMin = document.getElementById("rateFilterCoverageMin");
  var modalCoverageMax = document.getElementById("rateFilterCoverageMax");
  var btnApplyFilter = document.getElementById("btnRateApplyFilter");
  var btnResetFilter = document.getElementById("btnRateFilterReset");

  var rowsSelect = document.getElementById("insuranceRateRowsPerPage");
  var pageIndicator = document.getElementById("insuranceRatePageIndicator");
  var pageBadge = document.getElementById("insuranceRateCurrentPageBadge");
  var btnFirst = document.getElementById("insuranceRateFirstPage");
  var btnPrev = document.getElementById("insuranceRatePrevPage");
  var btnNext = document.getElementById("insuranceRateNextPage");
  var btnLast = document.getElementById("insuranceRateLastPage");

  var deleteModalEl = document.getElementById("deleteRateRuleModal");
  var deleteMessageEl = document.getElementById("deleteRateRuleMessage");
  var btnConfirmDelete = document.getElementById("btnConfirmDeleteRateRule");

  var toastEl = document.getElementById("insuranceRateToast");
  var toastTimer = null;

  var state = {
    rows: [],
    filteredRows: [],
    currentPage: 1,
    pendingDeleteId: "",
    filters: {
      search: "",
      company: "",
      plan: "",
      classValue: "",
      type: "",
      mainService: "",
      status: "",
      authRequired: "",
      copayType: "",
      coverageMin: "",
      coverageMax: ""
    }
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

  function initTooltips() {
    if (!window.bootstrap) return;
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (node) {
      bootstrap.Tooltip.getOrCreateInstance(node);
    });
  }

  function norm(value) {
    return String(value || "").trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function showToast(message, type) {
    if (!toastEl || !message) return;
    toastEl.textContent = message;
    toastEl.classList.remove("info", "danger");
    if (type === "danger") toastEl.classList.add("danger");
    else if (type === "info") toastEl.classList.add("info");
    toastEl.classList.add("show");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  function consumeFlash() {
    var flash = store.consumeFlash();
    if (!flash || !flash.message) return;
    showToast(flash.message, flash.type);
  }

  function optionHtml(value, label, selectedValue) {
    var selected = norm(selectedValue) === norm(value) ? " selected" : "";
    return '<option value="' + escapeHtml(value) + '"' + selected + ">" + escapeHtml(label) + "</option>";
  }

  function fillSelectOptions() {
    var companies = store.getInsuranceCompanies();
    var plans = store.getPlans();
    var classes = store.getClasses();
    var mainServices = store.getMainServices();

    var companyOptions = '<option value="">All</option>';
    companies.forEach(function (company) {
      companyOptions += optionHtml(company.code, company.name, "");
    });

    var planOptions = '<option value="">All</option>';
    plans.forEach(function (plan) {
      planOptions += optionHtml(plan, plan, state.filters.plan);
    });

    var classOptions = '<option value="">All</option>';
    classes.forEach(function (cls) {
      classOptions += optionHtml(cls, cls, state.filters.classValue);
    });

    var mainServiceOptions = '<option value="">All</option>';
    mainServices.forEach(function (name) {
      mainServiceOptions += optionHtml(name, name, "");
    });

    modalCompany.innerHTML = companyOptions;
    modalPlan.innerHTML = planOptions;
    modalClass.innerHTML = classOptions;
    modalType.innerHTML =
      '<option value="">All</option>' +
      optionHtml("service", "Service", "") +
      optionHtml("package", "Package", "");
    modalMainService.innerHTML = mainServiceOptions;
    modalStatus.innerHTML =
      '<option value="">All</option>' + optionHtml("active", "Active", "") + optionHtml("inactive", "Inactive", "");
  }

  function syncRows() {
    state.rows = store.getRules();
  }

  function syncModalFromState() {
    modalCompany.value = state.filters.company;
    modalPlan.value = state.filters.plan;
    modalClass.value = state.filters.classValue;
    modalType.value = state.filters.type;
    modalMainService.value = state.filters.mainService;
    modalStatus.value = state.filters.status;
    modalAuthRequired.value = state.filters.authRequired;
    modalCopayType.value = state.filters.copayType;
    modalCoverageMin.value = state.filters.coverageMin;
    modalCoverageMax.value = state.filters.coverageMax;
  }

  function readModalFilters() {
    state.filters.company = modalCompany.value;
    state.filters.plan = modalPlan.value;
    state.filters.classValue = modalClass.value;
    state.filters.type = modalType.value;
    state.filters.mainService = modalMainService.value;
    state.filters.status = modalStatus.value;
    state.filters.authRequired = modalAuthRequired.value;
    state.filters.copayType = modalCopayType.value;
    state.filters.coverageMin = modalCoverageMin.value;
    state.filters.coverageMax = modalCoverageMax.value;
  }

  function resetAdvancedFilters() {
    state.filters.authRequired = "";
    state.filters.copayType = "";
    state.filters.coverageMin = "";
    state.filters.coverageMax = "";
  }

  function resetAllFilters() {
    state.filters.search = "";
    state.filters.company = "";
    state.filters.plan = "";
    state.filters.classValue = "";
    state.filters.type = "";
    state.filters.mainService = "";
    state.filters.status = "";
    resetAdvancedFilters();
    searchInput.value = "";
    syncModalFromState();
  }

  function matchesSearch(row) {
    var query = norm(state.filters.search);
    if (!query) return true;
    return (
      norm(row.targetName).includes(query) ||
      norm(row.targetCode).includes(query) ||
      norm(row.mainService).includes(query) ||
      norm(row.insuranceCompanyName).includes(query)
    );
  }

  function matchesFilters(row) {
    if (state.filters.company && norm(row.insuranceCompanyCode) !== norm(state.filters.company)) return false;
    if (state.filters.plan && norm(row.plan) !== norm(state.filters.plan)) return false;
    if (state.filters.classValue && norm(row.class) !== norm(state.filters.classValue)) return false;
    if (state.filters.type && norm(row.targetType) !== norm(state.filters.type)) return false;
    if (state.filters.mainService && norm(row.mainService) !== norm(state.filters.mainService)) return false;

    if (state.filters.status) {
      var rowStatus = row.isActive ? "active" : "inactive";
      if (rowStatus !== norm(state.filters.status)) return false;
    }

    if (state.filters.authRequired) {
      var auth = row.authRequired ? "yes" : "no";
      if (auth !== norm(state.filters.authRequired)) return false;
    }

    if (state.filters.copayType && norm(row.copayType) !== norm(state.filters.copayType)) return false;

    var min = Number(state.filters.coverageMin);
    if (state.filters.coverageMin !== "" && Number.isFinite(min)) {
      if (row.coveragePct === "" || Number(row.coveragePct) < min) return false;
    }

    var max = Number(state.filters.coverageMax);
    if (state.filters.coverageMax !== "" && Number.isFinite(max)) {
      if (row.coveragePct === "" || Number(row.coveragePct) > max) return false;
    }

    return true;
  }

  function totalPages() {
    var perPage = parseInt(rowsSelect.value, 10) || 10;
    return Math.max(1, Math.ceil(state.filteredRows.length / perPage));
  }

  function renderFooter() {
    var pages = totalPages();
    if (state.currentPage > pages) state.currentPage = pages;
    if (state.currentPage < 1) state.currentPage = 1;

    pageIndicator.textContent = "Page " + state.currentPage + " of " + pages;
    pageBadge.textContent = String(state.currentPage);

    var disableLeft = state.currentPage <= 1;
    var disableRight = state.currentPage >= pages;
    btnFirst.disabled = disableLeft;
    btnPrev.disabled = disableLeft;
    btnNext.disabled = disableRight;
    btnLast.disabled = disableRight;
  }

  function typeBadge(type) {
    if (norm(type) === "package") {
      return '<span class="type-pill package">Package</span>';
    }
    return '<span class="type-pill service">Service</span>';
  }

  function authBadge(value) {
    var yes = !!value;
    var cls = yes ? "yes" : "no";
    return '<span class="auth-pill ' + cls + '">' + (yes ? "Yes" : "No") + "</span>";
  }

  function renderRow(row, seq) {
    var encodedId = encodeURIComponent(row.id);
    return (
      "<tr data-id='" +
      escapeHtml(row.id) +
      "'>" +
      '<td class="col-seq"><span class="row-seq">' +
      seq +
      "</span></td>" +
      "<td>" +
      typeBadge(row.targetType) +
      "</td>" +
      '<td><div class="target-name">' +
      escapeHtml(row.targetName || "-") +
      "</div></td>" +
      "<td><span class='service-code-badge'>" +
      escapeHtml(row.targetCode || "-") +
      "</span></td>" +
      '<td><div class="scope-lines"><span>' +
      escapeHtml(row.insuranceCompanyName || "-") +
      '</span><span class="muted">' +
      escapeHtml((row.plan || "-") + " / " + (row.class || "-")) +
      "</span></div></td>" +
      "<td>" +
      escapeHtml(store.formatCoverage(row)) +
      "</td>" +
      "<td>" +
      escapeHtml(store.formatCopay(row)) +
      "</td>" +
      "<td>" +
      authBadge(row.authRequired) +
      "</td>" +
      '<td class="text-center">' +
      '<label class="switch m-0">' +
      '<input data-action="toggle-status" type="checkbox" ' +
      (row.isActive ? "checked" : "") +
      " />" +
      '<span class="slider"></span>' +
      "</label>" +
      "</td>" +
      "<td>" +
      escapeHtml(row.updatedAt || "-") +
      "</td>" +
      '<td class="text-end">' +
      '<div class="package-actions">' +
      '<a class="btn btn-primary-revers btn-32 table-icon-btn" href="insurance-rate-rule-details.html?id=' +
      encodedId +
      '" title="View"><i class="fi fi-rr-eye"></i></a>' +
      '<div class="dropdown">' +
      '<button type="button" class="btn btn-primary-revers btn-32 table-icon-btn action-trigger dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" title="Actions">' +
      '<i class="fi fi-rr-edit"></i>' +
      "</button>" +
      '<ul class="dropdown-menu dropdown-menu-end">' +
      '<li><a class="dropdown-item" href="insurance-rate-rule-form.html?mode=edit&id=' +
      encodedId +
      '"><span>Edit</span></a></li>' +
      '<li><button type="button" class="dropdown-item text-danger" data-action="open-delete"><span>Delete</span></button></li>' +
      "</ul>" +
      "</div>" +
      "</div>" +
      "</td>" +
      "</tr>"
    );
  }

  function renderRows() {
    var perPage = parseInt(rowsSelect.value, 10) || 10;
    var start = (state.currentPage - 1) * perPage;
    var current = state.filteredRows.slice(start, start + perPage);

    if (!current.length) {
      tbody.innerHTML =
        '<tr><td colspan="11"><div class="empty-state"><i class="fi fi-rr-box-open-full"></i><p>No rate rules found for current filters.</p></div></td></tr>';
      return;
    }

    tbody.innerHTML = current
      .map(function (row, idx) {
        return renderRow(row, start + idx + 1);
      })
      .join("");
  }

  function bindRowEvents() {
    tbody.querySelectorAll('[data-action="toggle-status"]').forEach(function (input) {
      input.addEventListener("change", function () {
        var tr = input.closest("tr");
        var id = tr ? tr.getAttribute("data-id") : "";
        if (!id) return;
        store.toggleActive(id, input.checked);
        syncRows();
        applyFilters(false);
      });
    });

    tbody.querySelectorAll('[data-action="open-delete"]').forEach(function (button) {
      button.addEventListener("click", function () {
        var tr = button.closest("tr");
        var id = tr ? tr.getAttribute("data-id") : "";
        if (!id) return;
        var row = state.rows.find(function (item) {
          return norm(item.id) === norm(id);
        });
        state.pendingDeleteId = id;
        deleteMessageEl.textContent = row
          ? 'Delete rate rule for "' + row.targetName + '"?'
          : "Delete selected rate rule?";
        if (window.bootstrap && deleteModalEl) {
          bootstrap.Modal.getOrCreateInstance(deleteModalEl).show();
        }
      });
    });
  }

  function applyFilters(resetPage) {
    if (resetPage !== false) state.currentPage = 1;
    state.filteredRows = state.rows.filter(function (row) {
      return matchesSearch(row) && matchesFilters(row);
    });
    renderFooter();
    renderRows();
    bindRowEvents();
  }

  function bindEvents() {
    btnSearch.addEventListener("click", function () {
      state.filters.search = searchInput.value || "";
      applyFilters();
    });

    searchInput.addEventListener("input", function () {
      state.filters.search = searchInput.value || "";
      applyFilters();
    });

    btnReset.addEventListener("click", function () {
      resetAllFilters();
      syncRows();
      applyFilters();
    });

    if (modalEl) {
      modalEl.addEventListener("show.bs.modal", function () {
        syncModalFromState();
      });
    }

    btnApplyFilter.addEventListener("click", function () {
      readModalFilters();
      applyFilters();
      if (window.bootstrap && modalEl) {
        bootstrap.Modal.getOrCreateInstance(modalEl).hide();
      }
    });

    btnResetFilter.addEventListener("click", function () {
      state.filters.company = "";
      state.filters.plan = "";
      state.filters.classValue = "";
      state.filters.type = "";
      state.filters.mainService = "";
      state.filters.status = "";
      resetAdvancedFilters();
      syncModalFromState();
      applyFilters();
    });

    rowsSelect.addEventListener("change", function () {
      state.currentPage = 1;
      renderFooter();
      renderRows();
      bindRowEvents();
    });

    btnFirst.addEventListener("click", function () {
      state.currentPage = 1;
      renderFooter();
      renderRows();
      bindRowEvents();
    });

    btnPrev.addEventListener("click", function () {
      state.currentPage = Math.max(1, state.currentPage - 1);
      renderFooter();
      renderRows();
      bindRowEvents();
    });

    btnNext.addEventListener("click", function () {
      state.currentPage = Math.min(totalPages(), state.currentPage + 1);
      renderFooter();
      renderRows();
      bindRowEvents();
    });

    btnLast.addEventListener("click", function () {
      state.currentPage = totalPages();
      renderFooter();
      renderRows();
      bindRowEvents();
    });

    btnConfirmDelete.addEventListener("click", function () {
      if (!state.pendingDeleteId) return;
      var removed = store.removeRule(state.pendingDeleteId);
      state.pendingDeleteId = "";
      if (window.bootstrap && deleteModalEl) {
        bootstrap.Modal.getOrCreateInstance(deleteModalEl).hide();
      }
      if (!removed) {
        showToast("Unable to delete this rate rule.", "danger");
        return;
      }
      syncRows();
      applyFilters(false);
      showToast("Rate rule deleted.", "info");
    });
  }

  function init() {
    initClock();
    initTooltips();
    fillSelectOptions();
    resetAllFilters();
    syncRows();
    bindEvents();
    applyFilters();
    consumeFlash();
  }

  init();
})();
