(function () {
  "use strict";

  var store = window.NKInsurancePackageStore;
  if (!store) return;

  var tbody = document.getElementById("insurancePackagesTbody");
  if (!tbody) return;

  var searchInput = document.getElementById("insurancePackagesSearchInput");
  var btnSearch = document.getElementById("btnInsurancePackagesSearch");
  var btnReset = document.getElementById("btnInsurancePackagesReset");

  var filterMainService = document.getElementById("ipfMainService");
  var filterUnitType = document.getElementById("ipfUnitType");
  var filterStatus = document.getElementById("ipfStatus");
  var filterValidityType = document.getElementById("ipfValidityType");
  var btnApplyFilter = document.getElementById("btnInsurancePackagesApplyFilter");
  var btnFilterReset = document.getElementById("btnInsurancePackagesFilterReset");
  var filterModalEl = document.getElementById("insurance-packages-filter-modal");

  var rowsSelect = document.getElementById("insurancePackagesRowsPerPage");
  var pageIndicator = document.getElementById("insurancePackagesPageIndicator");
  var pageBadge = document.getElementById("insurancePackagesCurrentPageBadge");
  var btnFirst = document.getElementById("insurancePackagesFirstPage");
  var btnPrev = document.getElementById("insurancePackagesPrevPage");
  var btnNext = document.getElementById("insurancePackagesNextPage");
  var btnLast = document.getElementById("insurancePackagesLastPage");

  var deleteModalEl = document.getElementById("deletePackageModal");
  var deleteMessage = document.getElementById("deletePackageMessage");
  var btnConfirmDelete = document.getElementById("btnConfirmDeletePackage");

  var toastEl = document.getElementById("insurancePackagesToast");
  var toastTimer = null;

  var state = {
    rows: [],
    filteredRows: [],
    currentPage: 1,
    pendingDeleteId: ""
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
    }, 2300);
  }

  function consumeFlash() {
    var flash = store.consumeFlash();
    if (!flash || !flash.message) return;
    showToast(flash.message, flash.type);
  }

  function initTooltips() {
    if (!window.bootstrap) return;
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (node) {
      bootstrap.Tooltip.getOrCreateInstance(node);
    });
  }

  function populateMainServiceFilterOptions() {
    var services = store.getMainServices(store.getAll());
    filterMainService.innerHTML =
      '<option value="">All</option>' +
      services
        .map(function (name) {
          var safe = escapeHtml(name);
          return '<option value="' + safe.toLowerCase() + '">' + safe + "</option>";
        })
        .join("");
  }

  function syncRows() {
    state.rows = store.getAll();
  }

  function matchesSearch(item) {
    var query = norm(searchInput.value);
    if (!query) return true;
    return (
      norm(item.name).includes(query) ||
      norm(item.code).includes(query) ||
      norm(item.mainService).includes(query)
    );
  }

  function matchesFilters(item) {
    var mainService = norm(filterMainService.value);
    var unitType = norm(filterUnitType.value);
    var status = norm(filterStatus.value);
    var validityType = norm(filterValidityType.value);

    if (mainService && norm(item.mainService) !== mainService) return false;
    if (unitType && norm(item.unitType) !== unitType) return false;
    if (status) {
      var rowStatus = item.isActive ? "active" : "inactive";
      if (rowStatus !== status) return false;
    }
    if (validityType && norm(item.validityType) !== validityType) return false;

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

  function rowTemplate(item, seq) {
    var packageName = item.name || item.nameEn || item.nameAr || "-";
    var encodedId = encodeURIComponent(item.id);

    return (
      "<tr data-id='" +
      escapeHtml(item.id) +
      "'>" +
      '<td class="col-seq"><span class="row-seq">' +
      seq +
      "</span></td>" +
      '<td><div class="package-name">' +
      escapeHtml(packageName) +
      "</div></td>" +
      "<td><span class='service-code-badge'>" +
      escapeHtml(item.code || "-") +
      "</span></td>" +
      "<td>" +
      escapeHtml(item.mainService || "-") +
      "</td>" +
      "<td>" +
      escapeHtml(item.unitType || "-") +
      "</td>" +
      "<td>" +
      escapeHtml(item.unitsCount) +
      "</td>" +
      "<td>" +
      escapeHtml(store.formatValidity(item)) +
      "</td>" +
      '<td class="text-center">' +
      '<label class="switch m-0">' +
      '<input data-action="toggle-active" type="checkbox" ' +
      (item.isActive ? "checked" : "") +
      " />" +
      '<span class="slider"></span>' +
      "</label>" +
      "</td>" +
      "<td>" +
      escapeHtml(item.updatedAt || "-") +
      "</td>" +
      '<td class="text-end">' +
      '<div class="package-actions">' +
      '<a class="btn btn-primary-revers btn-32 table-icon-btn" href="insurance-package-details.html?id=' +
      encodedId +
      '" title="View">' +
      '<i class="fi fi-rr-eye"></i>' +
      "</a>" +
      '<div class="dropdown">' +
      '<button type="button" class="btn btn-primary-revers btn-32 table-icon-btn action-trigger dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" title="Actions">' +
      '<i class="fi fi-rr-edit"></i>' +
      "</button>" +
      '<ul class="dropdown-menu dropdown-menu-end">' +
      '<li><a class="dropdown-item" href="insurance-package-form.html?mode=edit&id=' +
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
        '<tr><td colspan="10">' +
        '<div class="empty-state">' +
        '<i class="fi fi-rr-box-open-full"></i>' +
        "<p>No package templates found.</p>" +
        "</div>" +
        "</td></tr>";
      return;
    }

    tbody.innerHTML = current
      .map(function (item, index) {
        return rowTemplate(item, start + index + 1);
      })
      .join("");
  }

  function bindRowEvents() {
    tbody.querySelectorAll('[data-action="toggle-active"]').forEach(function (input) {
      input.addEventListener("change", function () {
        var row = input.closest("tr");
        var id = row ? row.getAttribute("data-id") : "";
        store.toggleActive(id, input.checked);
        syncRows();
        applyAll(false);
      });
    });

    tbody.querySelectorAll('[data-action="open-delete"]').forEach(function (button) {
      button.addEventListener("click", function () {
        var row = button.closest("tr");
        var id = row ? row.getAttribute("data-id") : "";
        if (!id) return;
        var item = state.rows.find(function (entry) {
          return entry.id === id;
        });
        if (!item) return;
        state.pendingDeleteId = id;
        deleteMessage.textContent = 'Delete "' + (item.name || item.code || "selected package") + '"?';
        if (window.bootstrap && deleteModalEl) {
          bootstrap.Modal.getOrCreateInstance(deleteModalEl).show();
        }
      });
    });
  }

  function applyAll(resetPage) {
    if (resetPage !== false) state.currentPage = 1;
    state.filteredRows = state.rows.filter(function (item) {
      return matchesSearch(item) && matchesFilters(item);
    });

    renderFooter();
    renderRows();
    bindRowEvents();
  }

  function resetFilters() {
    filterMainService.value = "";
    filterUnitType.value = "";
    filterStatus.value = "";
    filterValidityType.value = "";
  }

  function resetAll() {
    searchInput.value = "";
    resetFilters();
    syncRows();
    applyAll();
  }

  function bindGlobalEvents() {
    btnSearch.addEventListener("click", function () {
      applyAll();
    });

    searchInput.addEventListener("input", function () {
      applyAll();
    });

    btnReset.addEventListener("click", function () {
      resetAll();
    });

    btnApplyFilter.addEventListener("click", function () {
      applyAll();
      if (window.bootstrap && filterModalEl) {
        bootstrap.Modal.getInstance(filterModalEl)?.hide();
      }
    });

    btnFilterReset.addEventListener("click", function () {
      resetFilters();
      applyAll();
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
      var removed = store.remove(state.pendingDeleteId);
      state.pendingDeleteId = "";
      if (window.bootstrap && deleteModalEl) {
        bootstrap.Modal.getInstance(deleteModalEl)?.hide();
      }
      if (!removed) return;
      syncRows();
      applyAll(false);
      showToast("Package deleted successfully.", "info");
    });
  }

  function init() {
    initClock();
    initTooltips();
    populateMainServiceFilterOptions();
    syncRows();
    bindGlobalEvents();
    applyAll();
    consumeFlash();
  }

  init();
})();
