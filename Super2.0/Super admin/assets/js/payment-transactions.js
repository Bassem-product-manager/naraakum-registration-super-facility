(function () {
  function norm(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function formatDateCell(value) {
    if (!value) return { date: "-", time: "-" };

    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return { date: "-", time: "-" };

    return {
      date: date.toLocaleDateString("en-GB"),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
    };
  }

  function statusPill(status) {
    var map = {
      completed: { cls: "st-complete", text: "Completed" },
      not_yet: { cls: "st-pending", text: "Not Yet" },
      refunded: { cls: "st-cancel", text: "Refunded" }
    };

    return map[status] || { cls: "st-pending", text: "Pending" };
  }

  function buildOrderDetailsHref(row) {
    var providerType = norm(row && row.providerType);
    var itemType = norm(row && row.itemType);
    var page = "order-details-facility.html";
    var mode = "facility";

    if (providerType === "pharmacy" || itemType === "product") {
      page = "order-details-pharmacy.html";
      mode = "pharmacy";
    } else if (providerType === "individual") {
      mode = "individual";
    }

    return (
      "../Order-Managment/" +
      page +
      "?order=" +
      encodeURIComponent(row.orderNo) +
      "&providerType=" +
      encodeURIComponent(mode) +
      "&from=transaction-orders"
    );
  }

  function renderInvoices(row) {
    var href = buildOrderDetailsHref(row);
    return ['<div class="invoice-actions">', '<a class="action-icon" href="' + href + '" title="Order Details"><i class="fi fi-rr-eye"></i></a>', "</div>"].join("");
  }

  function csvEscape(value) {
    var s = (value == null ? "" : String(value)).replace(/\r?\n/g, " ").trim();
    if (/[",]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var dataApi = window.NKPaymentData;
    if (!dataApi) return;

    var tableBody = document.getElementById("txTbody");
    var searchInput = document.getElementById("txSearchInput");
    var btnSearch = document.getElementById("btnTxSearch");
    var btnReset = document.getElementById("btnTxReset");
    var btnExport = document.getElementById("btnTxExport");

    var rowsSelect = document.getElementById("txRowsPerPage");
    var indicator = document.getElementById("txPageIndicator");
    var currentBadge = document.getElementById("txCurrentPageBadge");
    var btnFirst = document.getElementById("txFirstPage");
    var btnPrev = document.getElementById("txPrevPage");
    var btnNext = document.getElementById("txNextPage");
    var btnLast = document.getElementById("txLastPage");

    var fType = document.getElementById("fTxProviderType");
    var fItemType = document.getElementById("fTxItemType");
    var fStatus = document.getElementById("fTxStatus");
    var fMethod = document.getElementById("fTxMethod");
    var fDateFrom = document.getElementById("fTxDateFrom");
    var fDateTo = document.getElementById("fTxDateTo");
    var btnApplyFilter = document.getElementById("btnTxApplyFilter");
    var btnFilterReset = document.getElementById("btnTxFilterReset");

    var kpiTotal = document.getElementById("txKpiTotal");
    var kpiVat = document.getElementById("txKpiVat");
    var kpiFees = document.getElementById("txKpiFees");

    var rows = dataApi
      .getTransactions()
      .slice()
      .sort(function (a, b) {
        return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
      });

    var filtered = rows.slice();
    var currentPage = 1;

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

      var haystack = [
        row.transactionNo,
        row.orderNo,
        row.patientName,
        row.providerName,
        row.providerCode,
        row.institutionName,
        row.institutionCode,
        row.itemType,
        row.paymentMethod
      ]
        .join(" ")
        .toLowerCase();

      return haystack.indexOf(q) !== -1;
    }

    function matchesFilters(row) {
      var type = norm(fType && fType.value);
      var itemType = norm(fItemType && fItemType.value);
      var status = norm(fStatus && fStatus.value);
      var method = norm(fMethod && fMethod.value);
      var from = norm(fDateFrom && fDateFrom.value);
      var to = norm(fDateTo && fDateTo.value);

      if (type && row.providerType !== type) return false;
      if (itemType && row.itemType !== itemType) return false;
      if (status && row.transactionStatus !== status) return false;
      if (method && row.paymentMethod !== method) return false;

      var dateOnly = row.orderDate ? row.orderDate.slice(0, 10) : "";
      if (from && dateOnly && dateOnly < from) return false;
      if (to && dateOnly && dateOnly > to) return false;

      return true;
    }

    function updateKpis() {
      var total = filtered.reduce(function (sum, row) {
        return sum + row.totalPrice;
      }, 0);

      var vat = filtered.reduce(function (sum, row) {
        return sum + row.vatAmount;
      }, 0);

      var fees = filtered.reduce(function (sum, row) {
        return sum + row.priceFees;
      }, 0);

      if (kpiTotal) kpiTotal.textContent = dataApi.formatMoney(total);
      if (kpiVat) kpiVat.textContent = dataApi.formatMoney(vat);
      if (kpiFees) kpiFees.textContent = dataApi.formatMoney(fees);
    }

    function render() {
      if (!tableBody) return;

      var pages = pagesCount();
      if (currentPage > pages) currentPage = pages;
      if (currentPage < 1) currentPage = 1;

      var perPage = perPageValue();
      var start = (currentPage - 1) * perPage;
      var pageRows = filtered.slice(start, start + perPage);

      if (!pageRows.length) {
        tableBody.innerHTML = '<tr><td colspan="16" class="text-center text-grey">No transactions found</td></tr>';
      } else {
        tableBody.innerHTML = pageRows
          .map(function (row, index) {
            var orderDate = formatDateCell(row.orderDate);
            var scheduledDate = formatDateCell(row.scheduledDate);
            var status = statusPill(row.transactionStatus);

            return [
              "<tr>",
              '<td>' + (start + index + 1) + "</td>",
              '<td><span class="staff-code">' + row.transactionNo + "</span></td>",
              '<td><span class="semiBold">' + row.orderNo + "</span></td>",
              '<td>' + row.institutionName + "</td>",
              '<td><span class="staff-code">' + row.institutionCode + "</span></td>",
              '<td>' + row.patientName + "</td>",
              '<td><a class="staff-code" href="entity-ledger.html?entity=' + encodeURIComponent(row.providerCode) + '">' + row.providerCode + "</a></td>",
              '<td><span class="badge bg-light text-dark">' + row.itemType + "</span></td>",
              '<td><div class="date-top">' + orderDate.date + '</div><div class="date-sub">' + orderDate.time + "</div></td>",
              '<td><div class="date-top">' + scheduledDate.date + '</div><div class="date-sub">' + scheduledDate.time + "</div></td>",
              '<td>' + dataApi.formatMoney(row.basePrice) + "</td>",
              '<td>' + dataApi.formatMoney(row.vatAmount) + "</td>",
              '<td>' + dataApi.formatMoney(row.priceFees) + "</td>",
              '<td><strong>' + dataApi.formatMoney(row.totalPrice) + "</strong></td>",
              '<td><span class="status-pill ' + status.cls + '">' + status.text + "</span></td>",
              '<td class="text-center">' + renderInvoices(row) + "</td>",
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
        if (fItemType) fItemType.value = "";
        if (fStatus) fStatus.value = "";
        if (fMethod) fMethod.value = "";
        if (fDateFrom) fDateFrom.value = "";
        if (fDateTo) fDateTo.value = "";
        applyFilters();
      });
    }

    if (btnApplyFilter) {
      btnApplyFilter.addEventListener("click", function () {
        applyFilters();
      });
    }

    if (btnFilterReset) {
      btnFilterReset.addEventListener("click", function () {
        if (fType) fType.value = "";
        if (fItemType) fItemType.value = "";
        if (fStatus) fStatus.value = "";
        if (fMethod) fMethod.value = "";
        if (fDateFrom) fDateFrom.value = "";
        if (fDateTo) fDateTo.value = "";
      });
    }

    if (rowsSelect) {
      rowsSelect.addEventListener("change", function () {
        currentPage = 1;
        render();
      });
    }

    if (btnFirst) btnFirst.addEventListener("click", function () { currentPage = 1; render(); });
    if (btnPrev) btnPrev.addEventListener("click", function () { currentPage = Math.max(1, currentPage - 1); render(); });
    if (btnNext) btnNext.addEventListener("click", function () { currentPage += 1; render(); });
    if (btnLast) btnLast.addEventListener("click", function () { currentPage = pagesCount(); render(); });

    if (btnExport) {
      btnExport.addEventListener("click", function () {
        if (!filtered.length) return;

        var headers = [
          "Transaction",
          "Order No",
          "Institution Name",
          "Institution Code",
          "Customer",
          "Provider Code",
          "Item Type",
          "Order Date",
          "Scheduled Date",
          "Price",
          "VAT 15%",
          "Price Fees",
          "Total Price",
          "Status"
        ];

        var lines = [headers.map(csvEscape).join(",")];

        filtered.forEach(function (row) {
          lines.push(
            [
              row.transactionNo,
              row.orderNo,
              row.institutionName,
              row.institutionCode,
              row.patientName,
              row.providerCode,
              row.itemType,
              row.orderDate,
              row.scheduledDate,
              row.basePrice.toFixed(2),
              row.vatAmount.toFixed(2),
              row.priceFees.toFixed(2),
              row.totalPrice.toFixed(2),
              row.transactionStatus
            ]
              .map(csvEscape)
              .join(",")
          );
        });

        var csv = "\ufeff" + lines.join("\n");
        var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "transactions-export.csv";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    }

    applyFilters();
  });
})();
