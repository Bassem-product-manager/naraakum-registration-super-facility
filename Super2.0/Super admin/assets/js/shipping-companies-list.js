(function () {
  "use strict";

  var store = window.NKShippingCompaniesStore;
  if (!store) return;

  store.ensureSeedData();

  var tbody = document.getElementById("shippingCompaniesBody");
  if (!tbody) return;

  var searchInput = document.getElementById("shippingSearchInput");
  var btnSearch = document.getElementById("btnShippingSearch");
  var btnReset = document.getElementById("btnShippingReset");
  var btnExport = document.getElementById("btnShippingExport");

  var filterStatus = document.getElementById("shippingFilterStatus");
  var filterCity = document.getElementById("shippingFilterCity");
  var filterProvider = document.getElementById("shippingFilterProvider");
  var filterDocs = document.getElementById("shippingFilterDocs");
  var btnApplyFilter = document.getElementById("btnShippingApplyFilter");
  var btnFilterReset = document.getElementById("btnShippingFilterReset");

  var inlineFeedback = document.getElementById("shippingInlineFeedback");

  var rowsSelect = document.getElementById("shippingRowsPerPage");
  var indicator = document.getElementById("shippingPageIndicator");
  var currentBadge = document.getElementById("shippingCurrentPageBadge");
  var btnFirst = document.getElementById("shippingFirstPage");
  var btnPrev = document.getElementById("shippingPrevPage");
  var btnNext = document.getElementById("shippingNextPage");
  var btnLast = document.getElementById("shippingLastPage");

  var allRows = [];
  var filteredRows = [];
  var currentPage = 1;

  function escHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function norm(value) {
    return String(value == null ? "" : value).trim().toLowerCase();
  }

  function titleCase(value) {
    var txt = String(value == null ? "" : value).trim();
    if (!txt) return "-";
    return txt.charAt(0).toUpperCase() + txt.slice(1);
  }

  function statusLabel(status) {
    var key = norm(status);
    if (key === "active") return "Active";
    if (key === "pending") return "Pending";
    if (key === "error") return "Error";
    return "Inactive";
  }

  function isEnabledStatus(status) {
    return norm(status) !== "inactive";
  }

  function isDecisionLocked(status) {
    var key = norm(status).replace(/[_\s]+/g, "-");
    return key === "suspended" || key === "banned";
  }

  function uniqueSorted(values) {
    var set = new Set();
    values.forEach(function (value) {
      var key = norm(value);
      if (key) set.add(key);
    });
    return Array.from(set).sort(function (a, b) {
      return a.localeCompare(b);
    });
  }

  function showInlineFeedback(text, type) {
    if (!inlineFeedback) return;

    inlineFeedback.textContent = text || "";
    inlineFeedback.className = "inline-feedback show " + (type || "info");

    window.clearTimeout(inlineFeedback.__timer);
    inlineFeedback.__timer = window.setTimeout(function () {
      inlineFeedback.className = "inline-feedback info";
      inlineFeedback.textContent = "";
    }, 2600);
  }

  function clearInlineFeedback() {
    if (!inlineFeedback) return;
    window.clearTimeout(inlineFeedback.__timer);
    inlineFeedback.className = "inline-feedback info";
    inlineFeedback.textContent = "";
  }

  function renderRows() {
    var rows = store.getAll();

    tbody.innerHTML = rows
      .map(function (company, index) {
        var integration = company.integration || {};
        var progress = store.getDocumentProgress(company);
        var companyStatus = typeof store.normalizeCompanyStatus === "function" ? store.normalizeCompanyStatus(company.status) : norm(company.status);
        var providerCode = String(integration.providerCode || "").trim().toUpperCase();
        var providerId = String(integration.providerId || "").trim().toUpperCase();
        var providerText = providerId || providerCode || "Not linked";
        var providerState = providerText === "Not linked" ? "unlinked" : "linked";
        var docsState = progress.percent >= 100 ? "complete" : "incomplete";
        var isEnabled = isEnabledStatus(integration.status);
        var lockedDecision = isDecisionLocked(companyStatus);

        return (
          '<tr data-code="' +
          escHtml(company.code) +
          '" data-name="' +
          escHtml(company.name) +
          '" data-city="' +
          escHtml(company.city) +
          '" data-email="' +
          escHtml(company.email) +
          '" data-contact="' +
          escHtml(company.contactName) +
          '" data-phone="' +
          escHtml(company.phone) +
          '" data-status="' +
          escHtml(integration.status) +
          '" data-company-status="' +
          escHtml(companyStatus) +
          '" data-provider="' +
          escHtml(providerText) +
          '" data-provider-link="' +
          escHtml(providerState) +
          '" data-doc-state="' +
          escHtml(docsState) +
          '" data-doc-progress="' +
          escHtml(progress.percent) +
          '">' +
          '<td class="col-seq"><span class="row-seq">' +
          String(index + 1) +
          '</span></td>' +
          '<td><span class="code-chip">' +
          escHtml(company.code) +
          "</span></td>" +
          '<td><div class="company-wrap">' +
          '<img class="company-logo" src="' +
          escHtml(company.logo || "../assets/images/logo.svg") +
          '" alt="Company" />' +
          '<div><span class="company-name">' +
          escHtml(company.name) +
          '</span><span class="company-city">' +
          escHtml(titleCase(company.city)) +
          "</span></div></div></td>" +
          "<td>" +
          escHtml(company.email || "-") +
          "</td>" +
          '<td><span class="contact-name">' +
          escHtml(company.contactName || "-") +
          '</span><span class="contact-phone">' +
          escHtml(company.phone || "-") +
          "</span></td>" +
          '<td class="integration-cell text-center">' +
          '<div class="toggle-wrap">' +
          '<input class="status-toggle integration-toggle-input" type="checkbox" role="switch" data-code="' +
          escHtml(company.code) +
          '"' +
          (isEnabled ? " checked" : "") +
          (lockedDecision ? ' disabled title="Locked: company is suspended or banned."' : "") +
          " />" +
          "</div>" +
          "</td>" +
          '<td class="text-center"><a class="link-details" href="../Order-Managment/shipping-company-details.html?code=' +
          encodeURIComponent(company.code) +
          '"><i class="fi fi-rr-eye"></i><span>Details</span></a></td>' +
          "</tr>"
        );
      })
      .join("");

    allRows = Array.prototype.slice.call(tbody.querySelectorAll("tr"));
    fillFilterOptions();
  }

  function fillFilterOptions() {
    if (!filterCity) return;

    var values = uniqueSorted(
      allRows.map(function (tr) {
        return tr.getAttribute("data-city") || "";
      })
    );

    var current = norm(filterCity.value);
    var options = ['<option value="">All</option>']
      .concat(
        values.map(function (value) {
          return '<option value="' + escHtml(value) + '">' + escHtml(titleCase(value)) + "</option>";
        })
      )
      .join("");

    filterCity.innerHTML = options;
    if (current && values.indexOf(current) > -1) {
      filterCity.value = current;
    }
  }

  function getRowModel(tr) {
    return {
      code: norm(tr.getAttribute("data-code")),
      name: norm(tr.getAttribute("data-name")),
      city: norm(tr.getAttribute("data-city")),
      email: norm(tr.getAttribute("data-email")),
      contact: norm(tr.getAttribute("data-contact")),
      phone: norm(tr.getAttribute("data-phone")),
      status: norm(tr.getAttribute("data-status")),
      provider: norm(tr.getAttribute("data-provider")),
      providerLink: norm(tr.getAttribute("data-provider-link")),
      docState: norm(tr.getAttribute("data-doc-state")),
      docProgress: norm(tr.getAttribute("data-doc-progress"))
    };
  }

  function matchesSearch(tr) {
    var q = norm(searchInput && searchInput.value);
    if (!q) return true;

    var row = getRowModel(tr);
    return (
      row.code.indexOf(q) > -1 ||
      row.name.indexOf(q) > -1 ||
      row.city.indexOf(q) > -1 ||
      row.email.indexOf(q) > -1 ||
      row.contact.indexOf(q) > -1 ||
      row.phone.indexOf(q) > -1 ||
      row.provider.indexOf(q) > -1 ||
      row.status.indexOf(q) > -1
    );
  }

  function matchesFilters(tr) {
    var row = getRowModel(tr);
    var status = norm(filterStatus && filterStatus.value);
    var city = norm(filterCity && filterCity.value);
    var provider = norm(filterProvider && filterProvider.value);
    var docs = norm(filterDocs && filterDocs.value);

    if (status && row.status !== status) return false;
    if (city && row.city !== city) return false;
    if (provider && row.providerLink !== provider) return false;
    if (docs && row.docState !== docs) return false;
    return true;
  }

  function perPageValue() {
    if (!rowsSelect) return filteredRows.length || 1;
    var value = rowsSelect.value;
    if (value === "all") return filteredRows.length || 1;
    var parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
  }

  function totalPages() {
    var size = perPageValue();
    return Math.max(1, Math.ceil(filteredRows.length / (size || 1)));
  }

  function ensureEmptyRow() {
    var existing = document.getElementById("shippingEmptyStateRow");
    if (existing) existing.remove();

    if (filteredRows.length) return;

    var row = document.createElement("tr");
    row.id = "shippingEmptyStateRow";
    row.innerHTML = '<td colspan="7" class="empty-row">No shipping companies match your current search or filters.</td>';
    tbody.appendChild(row);
  }

  function render() {
    allRows.forEach(function (tr) {
      tr.classList.add("d-none");
    });

    var pages = totalPages();
    if (currentPage < 1) currentPage = 1;
    if (currentPage > pages) currentPage = pages;

    if (filteredRows.length) {
      if (rowsSelect && rowsSelect.value === "all") {
        filteredRows.forEach(function (tr) {
          tr.classList.remove("d-none");
        });
      } else {
        var size = perPageValue();
        var start = (currentPage - 1) * size;
        var end = start + size;
        filteredRows.slice(start, end).forEach(function (tr) {
          tr.classList.remove("d-none");
        });
      }
    }

    var visibleRows = allRows.filter(function (tr) {
      return !tr.classList.contains("d-none");
    });

    visibleRows.forEach(function (tr, index) {
      var seq = tr.querySelector(".row-seq");
      if (seq) seq.textContent = String(index + 1);
    });

    if (indicator) indicator.textContent = "Page " + String(currentPage) + " of " + String(pages);
    if (currentBadge) currentBadge.textContent = String(currentPage);

    var navDisabled = (rowsSelect && rowsSelect.value === "all") || pages <= 1 || !filteredRows.length;

    if (btnFirst) btnFirst.disabled = navDisabled || currentPage === 1;
    if (btnPrev) btnPrev.disabled = navDisabled || currentPage === 1;
    if (btnNext) btnNext.disabled = navDisabled || currentPage === pages;
    if (btnLast) btnLast.disabled = navDisabled || currentPage === pages;

    ensureEmptyRow();
  }

  function applyAll() {
    filteredRows = allRows.filter(function (tr) {
      return matchesSearch(tr) && matchesFilters(tr);
    });
    currentPage = 1;
    render();
  }

  function csvEscape(value) {
    var text = String(value == null ? "" : value).replace(/\r?\n/g, " ").trim();
    if (/[\",]/.test(text)) return '"' + text.replace(/\"/g, '""') + '"';
    return text;
  }

  if (btnSearch) btnSearch.addEventListener("click", applyAll);
  if (searchInput) searchInput.addEventListener("input", applyAll);

  if (btnReset) {
    btnReset.addEventListener("click", function () {
      if (searchInput) searchInput.value = "";
      if (filterStatus) filterStatus.value = "";
      if (filterCity) filterCity.value = "";
      if (filterProvider) filterProvider.value = "";
      if (filterDocs) filterDocs.value = "";
      applyAll();
    });
  }

  if (btnApplyFilter) {
    btnApplyFilter.addEventListener("click", function () {
      applyAll();
      var modalEl = document.getElementById("shippingFilterModal");
      if (!modalEl || !window.bootstrap) return;
      var modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.hide();
    });
  }

  if (btnFilterReset) {
    btnFilterReset.addEventListener("click", function () {
      if (filterStatus) filterStatus.value = "";
      if (filterCity) filterCity.value = "";
      if (filterProvider) filterProvider.value = "";
      if (filterDocs) filterDocs.value = "";
      applyAll();
    });
  }

  if (rowsSelect) {
    rowsSelect.addEventListener("change", function () {
      currentPage = 1;
      render();
    });
  }

  if (btnFirst) {
    btnFirst.addEventListener("click", function () {
      currentPage = 1;
      render();
    });
  }

  if (btnPrev) {
    btnPrev.addEventListener("click", function () {
      currentPage = Math.max(1, currentPage - 1);
      render();
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", function () {
      currentPage = Math.min(totalPages(), currentPage + 1);
      render();
    });
  }

  if (btnLast) {
    btnLast.addEventListener("click", function () {
      currentPage = totalPages();
      render();
    });
  }

  if (btnExport) {
    btnExport.addEventListener("click", function () {
      var rows = filteredRows.length ? filteredRows : allRows;
      if (!rows.length) return;

      var headers = [
        "Company Code",
        "Company Name",
        "City",
        "Email",
        "Contact Name",
        "Phone",
        "Integration Status",
        "Provider",
        "Provider Linked",
        "Documents Completion"
      ];
      var lines = [headers.map(csvEscape).join(",")];

      rows.forEach(function (tr) {
        var model = getRowModel(tr);

        lines.push(
          [
            (tr.getAttribute("data-code") || "").toUpperCase(),
            tr.getAttribute("data-name") || "",
            titleCase(tr.getAttribute("data-city") || ""),
            tr.getAttribute("data-email") || "",
            tr.getAttribute("data-contact") || "",
            tr.getAttribute("data-phone") || "",
            statusLabel(model.status),
            tr.getAttribute("data-provider") || "",
            model.providerLink === "linked" ? "Yes" : "No",
            (tr.getAttribute("data-doc-progress") || "0") + "%"
          ]
            .map(csvEscape)
            .join(",")
        );
      });

      var csv = "\ufeff" + lines.join("\n");
      var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = "shipping-companies-export.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    });
  }

  tbody.addEventListener("change", function (event) {
    var target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (!target.classList.contains("integration-toggle-input")) return;

    var row = target.closest("tr");
    var decisionStatus = norm(row && row.getAttribute("data-company-status"));
    if (isDecisionLocked(decisionStatus)) {
      target.checked = norm(row && row.getAttribute("data-status")) === "active";
      showInlineFeedback("Integration is locked because this company is suspended or banned.", "error");
      return;
    }

    var code = String(target.getAttribute("data-code") || "").toUpperCase();
    if (!code) return;

    var shouldEnable = !!target.checked;
    var targetStatus = shouldEnable ? "active" : "inactive";

    var result = store.setIntegrationStatus(code, targetStatus);
    if (!result || !result.ok) {
      target.checked = !shouldEnable;
      showInlineFeedback((result && result.message) || "Unable to update integration status.", "error");
      return;
    }

    renderRows();
    applyAll();
    clearInlineFeedback();
  });

  tbody.addEventListener("click", function (event) {
    var target = event.target;
    if (!(target instanceof Element)) return;
    var link = target.closest('a[href*="shipping-company-details.html?code="]');
    if (!link) return;

    try {
      var url = new URL(link.href, window.location.href);
      var code = (url.searchParams.get("code") || "").toUpperCase();
      if (code) sessionStorage.setItem("lastShippingCode", code);
    } catch (err) {
      // ignore
    }
  });

  renderRows();
  applyAll();
})();
