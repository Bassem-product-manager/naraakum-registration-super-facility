(function () {
  function norm(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function qs(name) {
    var url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function formatDateTime(value) {
    if (!value) return "-";
    var dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleDateString("en-GB") + " " + dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  }

  function safe(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function lifecyclePill(status, label) {
    var cls = norm(status);
    return '<span class="status-pill ' + cls + '">' + safe(label || status || "-") + "</span>";
  }

  function remittancePill(status, label) {
    var cls = norm(status);
    return '<span class="remit-pill ' + cls + '">' + safe(label || status || "-") + "</span>";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var dataApi = window.NKPaymentData;
    if (!dataApi || typeof dataApi.getInsuranceClaims !== "function") return;

    var state = {
      rows: [],
      filtered: [],
      page: 1
    };

    var els = {
      tbody: document.getElementById("insTbody"),
      rowsPerPage: document.getElementById("insRowsPerPage"),
      pageIndicator: document.getElementById("insPageIndicator"),
      currentBadge: document.getElementById("insCurrentPageBadge"),
      firstPage: document.getElementById("insFirstPage"),
      prevPage: document.getElementById("insPrevPage"),
      nextPage: document.getElementById("insNextPage"),
      lastPage: document.getElementById("insLastPage"),
      fFrom: document.getElementById("fInsFrom"),
      fTo: document.getElementById("fInsTo"),
      fCode: document.getElementById("fInsCode"),
      fProviderType: document.getElementById("fInsProviderType"),
      fLifecycle: document.getElementById("fInsLifecycle"),
      fRemittance: document.getElementById("fInsRemittance"),
      search: document.getElementById("insSearchInput"),
      btnApply: document.getElementById("btnInsApply"),
      btnReset: document.getElementById("btnInsReset"),
      btnExport: document.getElementById("btnInsExport"),
      kpiSubmitted: document.getElementById("kpiInsSubmitted"),
      kpiReview: document.getElementById("kpiInsReview"),
      kpiApproved: document.getElementById("kpiInsApproved"),
      kpiPartial: document.getElementById("kpiInsPartial"),
      kpiPaid: document.getElementById("kpiInsPaid"),
      kpiDenied: document.getElementById("kpiInsDenied"),
      kpiAppealed: document.getElementById("kpiInsAppealed"),
      kpiOutstanding: document.getElementById("kpiInsOutstanding")
    };

    function filters() {
      return {
        dateFrom: els.fFrom ? els.fFrom.value : "",
        dateTo: els.fTo ? els.fTo.value : "",
        insuranceCode: els.fCode ? els.fCode.value : "",
        providerType: els.fProviderType ? els.fProviderType.value : "",
        lifecycleStatus: els.fLifecycle ? els.fLifecycle.value : "",
        remittanceStatus: els.fRemittance ? els.fRemittance.value : "",
        search: els.search ? els.search.value : ""
      };
    }

    function populateInsuranceCodes() {
      if (!els.fCode) return;
      var options = [];
      if (typeof dataApi.getInsuranceCodeOptions === "function") options = dataApi.getInsuranceCodeOptions();
      if (!Array.isArray(options) || !options.length) {
        var map = {};
        dataApi.getInsuranceClaims({}).forEach(function (row) {
          var code = String(row.insuranceCode || "").trim().toUpperCase();
          if (!code || map[code]) return;
          map[code] = {
            insuranceCode: code,
            insuranceName: row.insuranceName || code
          };
        });
        options = Object.keys(map)
          .sort()
          .map(function (code) {
            return map[code];
          });
      }

      var current = els.fCode.value || "";
      els.fCode.innerHTML = '<option value="">All</option>' +
        options
          .map(function (item) {
            var code = String(item.insuranceCode || "").toUpperCase();
            var selected = current && current === code ? " selected" : "";
            return '<option value="' + safe(code) + '"' + selected + ">" + safe(code + " - " + (item.insuranceName || code)) + "</option>";
          })
          .join("");
    }

    function perPage() {
      if (!els.rowsPerPage) return state.filtered.length || 1;
      var v = els.rowsPerPage.value;
      if (v === "all") return state.filtered.length || 1;
      var n = Number(v);
      return Number.isFinite(n) && n > 0 ? n : 10;
    }

    function pagesCount() {
      return Math.max(1, Math.ceil(state.filtered.length / perPage()));
    }

    function renderKpis() {
      var k = dataApi.getInsuranceClaimKpis(filters());
      if (els.kpiSubmitted) els.kpiSubmitted.textContent = String(k.submitted || 0);
      if (els.kpiReview) els.kpiReview.textContent = String(k.inReview || 0);
      if (els.kpiApproved) els.kpiApproved.textContent = String(k.approved || 0);
      if (els.kpiPartial) els.kpiPartial.textContent = String(k.partiallyPaid || 0);
      if (els.kpiPaid) els.kpiPaid.textContent = String(k.paid || 0);
      if (els.kpiDenied) els.kpiDenied.textContent = String(k.denied || 0);
      if (els.kpiAppealed) els.kpiAppealed.textContent = String(k.appealed || 0);
      if (els.kpiOutstanding) els.kpiOutstanding.textContent = dataApi.formatMoney(k.outstandingAmount || 0);
    }

    function renderTable() {
      if (!els.tbody) return;

      var totalPages = pagesCount();
      if (state.page > totalPages) state.page = totalPages;
      if (state.page < 1) state.page = 1;

      var start = (state.page - 1) * perPage();
      var rows = state.filtered.slice(start, start + perPage());

      if (!rows.length) {
        els.tbody.innerHTML = '<tr><td colspan="16" class="text-center text-grey">No insurance claims found</td></tr>';
      } else {
        els.tbody.innerHTML = rows
          .map(function (row, idx) {
            var lifecycleLabel = dataApi.insuranceStatusLabel ? dataApi.insuranceStatusLabel(row.lifecycleStatus) : row.lifecycleStatus;
            var remittanceLabel = dataApi.insuranceRemittanceLabel ? dataApi.insuranceRemittanceLabel(row.remittanceStatus) : row.remittanceStatus;
            var outstanding = Number(row.outstandingAmount || 0);
            return [
              "<tr>",
              "<td>" + (start + idx + 1) + "</td>",
              '<td><span class="staff-code">' + safe(row.claimId) + "</span></td>",
              '<td><span class="staff-code">' + safe(row.orderNo) + "</span></td>",
              "<td>" + safe(row.insuranceName) + '<br><span class="fsize-12 text-grey">' + safe(row.insuranceCode) + "</span></td>",
              "<td>" + safe(row.providerName) + '<br><span class="fsize-12 text-grey">' + safe(row.providerCode) + "</span></td>",
              "<td>" + safe(row.patientName) + "</td>",
              "<td>" + dataApi.formatMoney(row.claimAmount) + "</td>",
              "<td>" + dataApi.formatMoney(row.approvedAmount) + "</td>",
              "<td>" + dataApi.formatMoney(row.paidAmount) + "</td>",
              "<td><strong>" + dataApi.formatMoney(outstanding) + "</strong></td>",
              "<td>" + String(row.documentsCount || 0) + "</td>",
              "<td>" + String(row.manualUploadsCount || 0) + "</td>",
              "<td>" + lifecyclePill(row.lifecycleStatus, lifecycleLabel) + "</td>",
              "<td>" + remittancePill(row.remittanceStatus, remittanceLabel) + "</td>",
              "<td>" + safe(formatDateTime(row.updatedAt)) + "</td>",
              '<td class="text-center"><a href="insurance-invoice-details.html?claim=' + encodeURIComponent(row.claimId) + '" class="btn btn-primary btn-32">Open</a></td>',
              "</tr>"
            ].join("");
          })
          .join("");
      }

      if (els.pageIndicator) els.pageIndicator.textContent = "Page " + state.page + " of " + totalPages;
      if (els.currentBadge) els.currentBadge.textContent = String(state.page);
      if (els.firstPage) els.firstPage.disabled = state.page <= 1;
      if (els.prevPage) els.prevPage.disabled = state.page <= 1;
      if (els.nextPage) els.nextPage.disabled = state.page >= totalPages;
      if (els.lastPage) els.lastPage.disabled = state.page >= totalPages;
    }

    function applyFilters() {
      state.rows = dataApi.getInsuranceClaims({});
      state.filtered = dataApi.getInsuranceClaims(filters());
      state.page = 1;
      renderKpis();
      renderTable();
    }

    function resetFilters() {
      ["fFrom", "fTo", "fCode", "fProviderType", "fLifecycle", "fRemittance", "search"].forEach(function (key) {
        if (!els[key]) return;
        els[key].value = "";
      });
      applyFilters();
    }

    function exportCsv() {
      var csv = dataApi.exportInsuranceClaimsCsv(filters());
      var blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "insurance-invoices-export.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }

    function applyQueryDefaults() {
      var insuranceCode = (qs("insuranceCode") || "").toString().trim().toUpperCase();
      var lifecycleStatus = (qs("lifecycleStatus") || "").toString().trim().toLowerCase();
      if (insuranceCode && els.fCode) els.fCode.value = insuranceCode;
      if (lifecycleStatus && els.fLifecycle) els.fLifecycle.value = lifecycleStatus;
    }

    if (els.btnApply) els.btnApply.addEventListener("click", applyFilters);
    if (els.btnReset) els.btnReset.addEventListener("click", resetFilters);
    if (els.btnExport) els.btnExport.addEventListener("click", exportCsv);
    if (els.search) els.search.addEventListener("input", applyFilters);
    if (els.rowsPerPage) {
      els.rowsPerPage.addEventListener("change", function () {
        state.page = 1;
        renderTable();
      });
    }
    if (els.firstPage) els.firstPage.addEventListener("click", function () { state.page = 1; renderTable(); });
    if (els.prevPage) els.prevPage.addEventListener("click", function () { state.page = Math.max(1, state.page - 1); renderTable(); });
    if (els.nextPage) els.nextPage.addEventListener("click", function () { state.page += 1; renderTable(); });
    if (els.lastPage) els.lastPage.addEventListener("click", function () { state.page = pagesCount(); renderTable(); });

    populateInsuranceCodes();
    applyQueryDefaults();
    applyFilters();
  });
})();
