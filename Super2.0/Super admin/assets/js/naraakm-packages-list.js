(function () {
  "use strict";

  var store = window.NKNaraakmPackageStore;
  if (!store) return;

  var tbody = document.getElementById("naraakmPackagesTbody");
  if (!tbody) return;

  var searchInput = document.getElementById("naraakmPackagesSearchInput");
  var btnSearch = document.getElementById("btnNaraakmPackagesSearch");
  var btnReset = document.getElementById("btnNaraakmPackagesReset");

  var filterMainService = document.getElementById("npfMainService");
  var filterStatus = document.getElementById("npfStatus");
  var btnApplyFilter = document.getElementById("btnNaraakmPackagesApplyFilter");
  var btnFilterReset = document.getElementById("btnNaraakmPackagesFilterReset");
  var filterModalEl = document.getElementById("naraakm-packages-filter-modal");

  var rowsSelect = document.getElementById("naraakmPackagesRowsPerPage");
  var pageIndicator = document.getElementById("naraakmPackagesPageIndicator");
  var pageBadge = document.getElementById("naraakmPackagesCurrentPageBadge");
  var btnFirst = document.getElementById("naraakmPackagesFirstPage");
  var btnPrev = document.getElementById("naraakmPackagesPrevPage");
  var btnNext = document.getElementById("naraakmPackagesNextPage");
  var btnLast = document.getElementById("naraakmPackagesLastPage");

  var deleteModalEl = document.getElementById("deleteNaraakmPackageModal");
  var deleteMessage = document.getElementById("deleteNaraakmPackageMessage");
  var btnConfirmDelete = document.getElementById("btnConfirmDeleteNaraakmPackage");

  var toastEl = document.getElementById("naraakmPackagesToast");
  var toastTimer = null;

  var state = {
    rows: [],
    filteredRows: [],
    currentPage: 1,
    pendingDeleteId: ""
  };
  var INCLUDED_SERVICES_PREVIEW_COUNT = 2;

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

  function toNum(value, fallback) {
    var n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function formatCompactNumber(value) {
    var n = Math.round((toNum(value, 0) + Number.EPSILON) * 100) / 100;
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
  }

  function formatMoney(value) {
    var n = Math.round((toNum(value, 0) + Number.EPSILON) * 100) / 100;
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + " SAR";
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

  function getMainServicesArray(item) {
    var mains = Array.isArray(item.mainServices) ? item.mainServices : [item.mainService];
    var map = {};
    var output = [];

    mains.forEach(function (main) {
      var value = String(main || "").trim();
      var key = value.toLowerCase();
      if (!key || map[key]) return;
      map[key] = true;
      output.push(value);
    });

    return output;
  }

  function populateMainServiceFilterOptions() {
    var options = ['<option value="">All</option>'];
    store.getMainServices(store.getAll()).forEach(function (mainService) {
      var safe = escapeHtml(mainService);
      options.push('<option value="' + safe.toLowerCase() + '">' + safe + "</option>");
    });
    filterMainService.innerHTML = options.join("");
  }

  function syncRows() {
    state.rows = store.getAll();
  }

  function itemSearchText(item) {
    var includedNames = (item.bundleItems || [])
      .map(function (entry) {
        return entry.serviceName || "";
      })
      .join(" ");
    var mains = getMainServicesArray(item).join(" ");

    return [item.name || "", item.nameEn || "", item.nameAr || "", item.code || "", mains, includedNames].join(" ");
  }

  function matchesSearch(item) {
    var query = norm(searchInput.value);
    if (!query) return true;
    return norm(itemSearchText(item)).indexOf(query) !== -1;
  }

  function matchesFilters(item) {
    var mainService = norm(filterMainService.value);
    var status = norm(filterStatus.value);

    if (mainService) {
      var mains = getMainServicesArray(item).map(norm);
      if (mains.indexOf(mainService) === -1) return false;
    }

    if (status) {
      var rowStatus = item.isActive ? "active" : "inactive";
      if (rowStatus !== status) return false;
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

  function formatCommission(item) {
    if (norm(item.commissionType) === "fixed") {
      return formatCompactNumber(item.commissionValue || item.commissionAmount || 0);
    }
    return formatCompactNumber(item.commissionValue || 0) + "%";
  }

  function getIncludedServiceNames(item) {
    var items = Array.isArray(item.bundleItems) ? item.bundleItems : [];
    var seen = {};
    var names = [];

    items.forEach(function (entry) {
      var value = String((entry && entry.serviceName) || "").trim();
      var key = value.toLowerCase();
      if (!key || seen[key]) return;
      seen[key] = true;
      names.push(value);
    });

    return names;
  }

  function includedServicesCell(item) {
    var names = getIncludedServiceNames(item);
    if (!names.length) return "-";

    var previewCount = Math.max(1, INCLUDED_SERVICES_PREVIEW_COUNT);
    var hasMore = names.length > previewCount;

    var listHtml = names
      .map(function (name, index) {
        return (
          '<li class="included-service-item' +
          (index >= previewCount ? " is-extra d-none" : "") +
          '">' +
          escapeHtml(name) +
          "</li>"
        );
      })
      .join("");

    var toggleHtml = hasMore
      ? '<button type="button" class="included-services-toggle" data-action="toggle-included-services" aria-expanded="false">More</button>'
      : "";

    return (
      '<div class="included-services-wrap">' +
      '<div class="included-services-count">' +
      names.length +
      " services" +
      "</div>" +
      '<ul class="included-services-list">' +
      listHtml +
      "</ul>" +
      toggleHtml +
      "</div>"
    );
  }

  function mainServicesLabel(item) {
    var mains = getMainServicesArray(item);
    if (!mains.length) return "-";
    if (mains.length <= 2) return mains.join(", ");
    return mains.slice(0, 2).join(", ") + " +" + (mains.length - 2);
  }

  function rowTemplate(item, seq) {
    var encodedId = encodeURIComponent(item.id);
    var packageName = item.name || item.nameEn || item.nameAr || "-";

    return (
      "<tr data-id='" +
      escapeHtml(item.id) +
      "'>" +
      '<td class="col-seq"><span class="row-seq">' +
      seq +
      "</span></td>" +
      '<td class="col-name"><div class="package-name">' +
      escapeHtml(packageName) +
      "</div></td>" +
      '<td class="col-code"><span class="service-code-badge">' +
      escapeHtml(item.code || "-") +
      "</span></td>" +
      '<td class="col-main"><div class="main-services-text">' +
      escapeHtml(mainServicesLabel(item)) +
      "</div></td>" +
      '<td class="col-included">' +
      includedServicesCell(item) +
      "</td>" +
      '<td class="col-subtotal col-money">' +
      formatMoney(item.subtotal || 0) +
      "</td>" +
      '<td class="col-commission">' +
      escapeHtml(formatCommission(item)) +
      "</td>" +
      '<td class="col-final col-money">' +
      formatMoney(item.finalTotal || 0) +
      "</td>" +
      '<td class="col-active">' +
      '<label class="switch m-0">' +
      '<input data-action="toggle-active" type="checkbox" ' +
      (item.isActive ? "checked" : "") +
      ">" +
      '<span class="slider"></span>' +
      "</label>" +
      "</td>" +
      '<td class="col-actions">' +
      '<div class="package-actions">' +
      '<div class="dropdown action-dropdown">' +
      '<button type="button" class="btn btn-primary-revers btn-32 table-icon-btn action-pencil-btn dropdown-toggle" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false" title="Actions">' +
      '<i class="fi fi-rr-edit"></i>' +
      "</button>" +
      '<ul class="dropdown-menu action-dropdown-menu">' +
      '<li><a class="dropdown-item action-menu-item" href="naraakm-package-form.html?mode=edit&id=' +
      encodedId +
      '"><i class="fi fi-rr-edit"></i><span>Edit</span></a></li>' +
      '<li><button type="button" class="dropdown-item action-menu-item action-menu-item-danger" data-action="open-delete"><i class="fi fi-rr-trash"></i><span>Delete</span></button></li>' +
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
        "<p>No Naraakm package found.</p>" +
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
    tbody.querySelectorAll('[data-action="toggle-included-services"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var wrapper = btn.closest(".included-services-wrap");
        if (!wrapper) return;

        var extras = wrapper.querySelectorAll(".included-service-item.is-extra");
        if (!extras.length) return;

        var expanded = btn.getAttribute("aria-expanded") === "true";
        extras.forEach(function (node) {
          node.classList.toggle("d-none", expanded);
        });

        btn.setAttribute("aria-expanded", expanded ? "false" : "true");
        btn.textContent = expanded ? "More" : "Less";
      });
    });

    tbody.querySelectorAll('[data-action="toggle-active"]').forEach(function (input) {
      input.addEventListener("change", function () {
        var row = input.closest("tr");
        var id = row ? row.getAttribute("data-id") : "";
        store.toggleActive(id, input.checked);
        syncRows();
        applyAll(false);
      });
    });

    tbody.querySelectorAll('[data-action="open-delete"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var row = btn.closest("tr");
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
    filterStatus.value = "";
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
