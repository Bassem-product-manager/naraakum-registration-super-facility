(function () {
  function norm(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function statusMeta(status) {
    if (status === "due") return { text: "Due", cls: "st-pending status-due" };
    if (status === "partially_settled") return { text: "Partially Settled", cls: "st-complete status-partially" };
    return { text: "Settled", cls: "st-complete status-settled" };
  }

  function csvEscape(value) {
    var s = (value == null ? "" : String(value)).replace(/\r?\n/g, " ").trim();
    if (/[",]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var dataApi = window.NKPaymentData;
    if (!dataApi || typeof dataApi.getEntityPayoutSummaries !== "function") return;

    var rows = [];
    var filtered = [];
    var currentPage = 1;

    var tbody = document.getElementById("depTbody");
    var searchInput = document.getElementById("depSearchInput");
    var btnSearch = document.getElementById("btnDepSearch");
    var btnReset = document.getElementById("btnDepReset");
    var btnExport = document.getElementById("btnDepExport");

    var fType = document.getElementById("fDepType");
    var fStatus = document.getElementById("fDepStatus");
    var fDateFrom = document.getElementById("fDepDateFrom");
    var fDateTo = document.getElementById("fDepDateTo");
    var btnApplyFilter = document.getElementById("btnDepApplyFilter");
    var btnFilterReset = document.getElementById("btnDepFilterReset");

    var rowsSelect = document.getElementById("depRowsPerPage");
    var indicator = document.getElementById("depPageIndicator");
    var currentBadge = document.getElementById("depCurrentPageBadge");
    var btnFirst = document.getElementById("depFirstPage");
    var btnPrev = document.getElementById("depPrevPage");
    var btnNext = document.getElementById("depNextPage");
    var btnLast = document.getElementById("depLastPage");

    var kpiPayableNow = document.getElementById("depKpiPayableNow");
    var kpiRefunds = document.getElementById("depKpiRefunds");
    var kpiPaidOut = document.getElementById("depKpiPaidOut");
    var kpiEntitiesDue = document.getElementById("depKpiEntitiesDue");

    function reloadRows() {
      rows = dataApi.getEntityPayoutSummaries();
    }

    function perPageValue() {
      var v = rowsSelect && rowsSelect.value;
      if (v === "all") return filtered.length || 1;
      var n = Number(v);
      return Number.isFinite(n) && n > 0 ? n : 10;
    }

    function pagesCount() {
      var perPage = perPageValue();
      return Math.max(1, Math.ceil(filtered.length / perPage));
    }

    function matchesSearch(row) {
      var q = norm(searchInput && searchInput.value);
      if (!q) return true;

      var text = [row.institutionName, row.providerName, row.providerCode, row.providerType].join(" ").toLowerCase();
      return text.indexOf(q) !== -1;
    }

    function matchesFilters(row) {
      var type = norm(fType && fType.value);
      var status = norm(fStatus && fStatus.value);
      var from = norm(fDateFrom && fDateFrom.value);
      var to = norm(fDateTo && fDateTo.value);

      if (type && norm(row.providerType) !== type) return false;
      if (status && norm(row.status) !== status) return false;

      var oldest = row.oldestDueDate ? row.oldestDueDate.slice(0, 10) : "";
      if ((from || to) && !oldest) return false;
      if (from && oldest && oldest < from) return false;
      if (to && oldest && oldest > to) return false;

      return true;
    }

    function updateKpis() {
      var totals = dataApi.getEntityDashboardTotals(filtered);
      if (kpiPayableNow) kpiPayableNow.textContent = dataApi.formatMoney(totals.totalPayableNow);
      if (kpiRefunds) kpiRefunds.textContent = dataApi.formatMoney(totals.totalRefunds);
      if (kpiPaidOut) kpiPaidOut.textContent = dataApi.formatMoney(totals.totalPaidOut);
      if (kpiEntitiesDue) kpiEntitiesDue.textContent = String(totals.entitiesDue);
    }

    function render() {
      if (!tbody) return;

      var pages = pagesCount();
      if (currentPage > pages) currentPage = pages;
      if (currentPage < 1) currentPage = 1;

      var perPage = perPageValue();
      var start = (currentPage - 1) * perPage;
      var pageRows = filtered.slice(start, start + perPage);

      if (!pageRows.length) {
        tbody.innerHTML = '<tr><td colspan="12" class="text-center text-grey">No entities found</td></tr>';
      } else {
        tbody.innerHTML = pageRows
          .map(function (row, index) {
            var status = statusMeta(row.status);
            var openLink = 'entity-ledger.html?entity=' + encodeURIComponent(row.providerCode);
            return [
              "<tr>",
              "<td>" + (start + index + 1) + "</td>",
              "<td>" + row.institutionName + "</td>",
              '<td><span class="staff-code">' + row.providerCode + "</span></td>",
              "<td>" + row.providerType + "</td>",
              "<td>" + row.totalOrders + "</td>",
              "<td>" + dataApi.formatMoney(row.completedValue) + "</td>",
              '<td class="money-negative">' + dataApi.formatMoney(row.refundsValue) + "</td>",
              "<td>" + dataApi.formatMoney(row.paidOut) + "</td>",
              "<td><strong>" + dataApi.formatMoney(row.payableNow) + "</strong></td>",
              "<td>" + dataApi.formatMoney(row.expectedValue) + "</td>",
              '<td><span class="status-pill ' + status.cls + '">' + status.text + "</span></td>",
              '<td class="text-center"><a href="' + openLink + '" class="btn btn-primary btn-32">Open Ledger (Pay Modes)</a></td>',
              "</tr>"
            ].join("");
          })
          .join("");
      }

      if (indicator) indicator.textContent = "Page " + currentPage + " of " + pages;
      if (currentBadge) currentBadge.textContent = String(currentPage);
      if (btnFirst) btnFirst.disabled = currentPage <= 1;
      if (btnPrev) btnPrev.disabled = currentPage <= 1;
      if (btnNext) btnNext.disabled = currentPage >= pages;
      if (btnLast) btnLast.disabled = currentPage >= pages;

      updateKpis();
    }

    function applyFilters() {
      reloadRows();
      filtered = rows.filter(function (row) {
        return matchesSearch(row) && matchesFilters(row);
      });
      currentPage = 1;
      render();
    }

    if (btnSearch) btnSearch.addEventListener("click", applyFilters);
    if (searchInput) searchInput.addEventListener("input", applyFilters);

    if (btnReset) {
      btnReset.addEventListener("click", function () {
        if (searchInput) searchInput.value = "";
        if (fType) fType.value = "";
        if (fStatus) fStatus.value = "";
        if (fDateFrom) fDateFrom.value = "";
        if (fDateTo) fDateTo.value = "";
        applyFilters();
      });
    }

    if (btnApplyFilter) btnApplyFilter.addEventListener("click", applyFilters);

    if (btnFilterReset) {
      btnFilterReset.addEventListener("click", function () {
        if (fType) fType.value = "";
        if (fStatus) fStatus.value = "";
        if (fDateFrom) fDateFrom.value = "";
        if (fDateTo) fDateTo.value = "";
      });
    }

    if (rowsSelect) rowsSelect.addEventListener("change", function () {
      currentPage = 1;
      render();
    });

    if (btnFirst) btnFirst.addEventListener("click", function () {
      currentPage = 1;
      render();
    });
    if (btnPrev) btnPrev.addEventListener("click", function () {
      currentPage = Math.max(1, currentPage - 1);
      render();
    });
    if (btnNext) btnNext.addEventListener("click", function () {
      currentPage += 1;
      render();
    });
    if (btnLast) btnLast.addEventListener("click", function () {
      currentPage = pagesCount();
      render();
    });

    if (btnExport) {
      btnExport.addEventListener("click", function () {
        if (!filtered.length) return;

        var headers = [
          "Institution Name",
          "Provider Code",
          "Entity Type",
          "Total Orders",
          "Completed Value",
          "Refunds",
          "Paid Out",
          "Payable Now",
          "Expected",
          "Status"
        ];

        var lines = [headers.map(csvEscape).join(",")];
        filtered.forEach(function (row) {
          lines.push(
            [
              row.institutionName,
              row.providerCode,
              row.providerType,
              row.totalOrders,
              row.completedValue.toFixed(2),
              row.refundsValue.toFixed(2),
              row.paidOut.toFixed(2),
              row.payableNow.toFixed(2),
              row.expectedValue.toFixed(2),
              row.statusLabel
            ]
              .map(csvEscape)
              .join(",")
          );
        });

        var blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "entity-payout-summary.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    }

    applyFilters();
  });
})();
