(function () {
  function qs(name) {
    var url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function updateUrl(orderNo, invoiceType) {
    if (!window.history || !window.history.replaceState) return;

    var url = new URL(window.location.href);
    url.searchParams.set("order", orderNo);
    url.searchParams.set("invoice", invoiceType);
    var entity = qs("entity");
    if (entity) url.searchParams.set("entity", entity);
    window.history.replaceState({}, "", url.toString());
  }

  function navigate(orderNo, invoiceType) {
    var url = new URL(window.location.href);
    url.searchParams.set("order", orderNo);
    url.searchParams.set("invoice", invoiceType);
    var entity = qs("entity");
    if (entity) url.searchParams.set("entity", entity);
    window.location.href = url.toString();
  }

  function formatDate(value) {
    if (!value) return "-";
    var d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-GB") + " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  }

  function renderInvoiceTemplate(invoiceData) {
    var row = invoiceData.row;
    var invoiceType = invoiceData.invoiceType;

    var billToTitle = "Patient";
    if (invoiceType === "provider") billToTitle = "Provider";
    if (invoiceType === "naraakum") billToTitle = "Naraakum";

    var billToValue = row.patientName;
    if (invoiceType === "provider") billToValue = row.providerName;
    if (invoiceType === "naraakum") billToValue = "Naraakum Financial Office";

    var typeBadgeText = "Patient Copy";
    if (invoiceType === "provider") typeBadgeText = "Provider Copy";
    if (invoiceType === "naraakum") typeBadgeText = "Naraakum Copy";

    return [
      '<div class="invoice-sheet">',
      '<div class="invoice-top">',
      '<div>',
      '<h3 id="invoiceTypeTitle">' + invoiceData.invoiceLabel + '</h3>',
      '<p class="text-grey fsize-12 mb-0">Invoice No: <strong>' + invoiceData.invoiceNo + '</strong></p>',
      '<p class="text-grey fsize-12 mb-0">Issue Date: <strong>' + formatDate(invoiceData.issueDate) + '</strong></p>',
      '</div>',
      '<div class="invoice-badges">',
      '<span class="invoice-badge">' + typeBadgeText + '</span>',
      '<span class="invoice-badge">Order: ' + row.orderNo + '</span>',
      '<span class="invoice-badge">Transaction: ' + row.transactionNo + '</span>',
      '</div>',
      '</div>',

      '<div class="invoice-metrics">',
      '<div class="invoice-metric"><div class="label">Price</div><div class="value">' + window.NKPaymentData.formatMoney(row.basePrice) + '</div></div>',
      '<div class="invoice-metric"><div class="label">VAT (15%)</div><div class="value">' + window.NKPaymentData.formatMoney(row.vatAmount) + '</div></div>',
      '<div class="invoice-metric"><div class="label">Price Fees</div><div class="value">' + window.NKPaymentData.formatMoney(row.priceFees) + '</div></div>',
      '<div class="invoice-metric"><div class="label">Total Price</div><div class="value">' + window.NKPaymentData.formatMoney(row.totalPrice) + '</div></div>',
      '</div>',

      '<div class="invoice-grid">',
      '<div class="invoice-card">',
      '<h6>Institution</h6>',
      '<p><strong>' + row.institutionName + '</strong></p>',
      '<p>Institution Code: <strong>' + row.institutionCode + '</strong></p>',
      '<p>Provider Code: <strong>' + row.providerCode + '</strong></p>',
      '<p>Provider Type: <strong>' + row.providerType + '</strong></p>',
      '</div>',
      '<div class="invoice-card">',
      '<h6>Bill To (' + billToTitle + ')</h6>',
      '<p><strong>' + billToValue + '</strong></p>',
      '<p>Patient Name: <strong>' + row.patientName + '</strong></p>',
      '<p>Item Type: <strong>' + row.itemType + '</strong></p>',
      '<p>Payment Method: <strong>' + row.paymentMethod + '</strong></p>',
      '</div>',
      '</div>',

      '<div class="table-responsive mt-24">',
      '<table class="staff-table naraakum-table table-tight">',
      '<thead><tr><th>Description</th><th class="text-end">Amount</th></tr></thead>',
      '<tbody>',
      '<tr><td class="invoice-line-title">Price</td><td class="text-end">' + window.NKPaymentData.formatMoney(row.basePrice) + '</td></tr>',
      '<tr><td class="invoice-line-title">VAT (15%)</td><td class="text-end">' + window.NKPaymentData.formatMoney(row.vatAmount) + '</td></tr>',
      '<tr><td class="invoice-line-title">Price Fees</td><td class="text-end">' + window.NKPaymentData.formatMoney(row.priceFees) + '</td></tr>',
      '<tr class="invoice-line-total"><td><strong>Total Price</strong></td><td class="text-end"><strong>' + window.NKPaymentData.formatMoney(row.totalPrice) + '</strong></td></tr>',
      '</tbody>',
      '</table>',
      '</div>',

      '<div class="invoice-grid mt-16">',
      '<div class="invoice-card">',
      '<h6>Deposit</h6>',
      '<p>Required: <strong>' + window.NKPaymentData.formatMoney(row.depositRequired) + '</strong></p>',
      '<p>Paid: <strong>' + window.NKPaymentData.formatMoney(row.depositPaid) + '</strong></p>',
      '<p>Refunded: <strong>' + window.NKPaymentData.formatMoney(row.refundAmount) + '</strong></p>',
      '<p>Remaining: <strong>' + window.NKPaymentData.formatMoney(row.remaining) + '</strong></p>',
      '<p>Status: <strong>' + row.depositStatus + '</strong></p>',
      '</div>',
      '<div class="invoice-card">',
      '<h6>Dates</h6>',
      '<p>Order Date: <strong>' + formatDate(row.orderDate) + '</strong></p>',
      '<p>Scheduled Date: <strong>' + formatDate(row.scheduledDate) + '</strong></p>',
      '</div>',
      '</div>',
      '</div>'
    ].join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("invoiceRoot");
    var typeTabs = document.getElementById("invoiceTypeTabs");
    var orderSelect = document.getElementById("invoiceOrderSelect");
    var backToLedger = document.getElementById("invoiceBackToLedger");
    var btnPrint = document.getElementById("btnInvoicePrint");
    var btnDownload = document.getElementById("btnInvoiceDownload");

    if (!root || !window.NKPaymentData) return;

    var rows = window.NKPaymentData
      .getTransactions()
      .slice()
      .sort(function (a, b) {
        return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
      });

    if (!rows.length) {
      root.innerHTML = '<div class="empty-state">No invoices data available.</div>';
      return;
    }

    var requestedType = window.NKPaymentData.normalizeInvoiceType(qs("invoice"));
    var requestedOrder = qs("order");
    var requestedEntity = (qs("entity") || "").toString().trim().toUpperCase();

    if (requestedEntity) {
      rows = rows.filter(function (row) {
        return (row.providerCode || "").toString().trim().toUpperCase() === requestedEntity;
      });
    }

    if (!rows.length) {
      root.innerHTML = '<div class="empty-state">No invoices found for the selected entity.</div>';
      return;
    }

    var invoiceData = requestedOrder
      ? window.NKPaymentData.getInvoiceByOrder(requestedOrder, requestedType)
      : null;

    if (
      invoiceData &&
      requestedEntity &&
      (invoiceData.row.providerCode || "").toString().trim().toUpperCase() !== requestedEntity
    ) {
      invoiceData = null;
    }

    if (!invoiceData) {
      invoiceData = window.NKPaymentData.getInvoiceByOrder(rows[0].orderNo, requestedType);
    }

    if (!invoiceData) {
      root.innerHTML = '<div class="empty-state">No invoice found for the requested order.</div>';
      return;
    }

    updateUrl(invoiceData.row.orderNo, invoiceData.invoiceType);
    root.innerHTML = renderInvoiceTemplate(invoiceData);

    if (backToLedger && requestedEntity) {
      backToLedger.classList.remove("d-none");
      backToLedger.href = "entity-ledger.html?entity=" + encodeURIComponent(requestedEntity);
    }

    if (orderSelect) {
      orderSelect.innerHTML = rows
        .map(function (row) {
          var selected = row.orderNo === invoiceData.row.orderNo ? ' selected' : '';
          return '<option value="' + row.orderNo + '"' + selected + '>' + row.orderNo + ' - ' + row.patientName + '</option>';
        })
        .join("");

      orderSelect.addEventListener("change", function () {
        navigate(orderSelect.value, invoiceData.invoiceType);
      });
    }

    if (typeTabs) {
      var encodedOrder = encodeURIComponent(invoiceData.row.orderNo);
      var entityQuery = requestedEntity ? "&entity=" + encodeURIComponent(requestedEntity) : "";
      typeTabs.innerHTML = [
        '<a class="btn btn-primary-revers btn-32 ' + (invoiceData.invoiceType === "patient" ? "active" : "") + '" href="tax-invoices.html?order=' + encodedOrder + '&invoice=patient' + entityQuery + '">Patient Invoice</a>',
        '<a class="btn btn-primary-revers btn-32 ' + (invoiceData.invoiceType === "naraakum" ? "active" : "") + '" href="tax-invoices.html?order=' + encodedOrder + '&invoice=naraakum' + entityQuery + '">Naraakum Invoice</a>',
        '<a class="btn btn-primary-revers btn-32 ' + (invoiceData.invoiceType === "provider" ? "active" : "") + '" href="tax-invoices.html?order=' + encodedOrder + '&invoice=provider' + entityQuery + '">Provider Invoice</a>'
      ].join(" ");
    }

    if (btnPrint) {
      btnPrint.addEventListener("click", function () {
        window.print();
      });
    }

    if (btnDownload) {
      btnDownload.addEventListener("click", function () {
        var lines = [
          invoiceData.invoiceLabel,
          "Invoice No: " + invoiceData.invoiceNo,
          "Order: " + invoiceData.row.orderNo,
          "Institution: " + invoiceData.row.institutionName + " (" + invoiceData.row.institutionCode + ")",
          "Provider Code: " + invoiceData.row.providerCode,
          "Patient: " + invoiceData.row.patientName,
          "Price: " + window.NKPaymentData.formatMoney(invoiceData.row.basePrice),
          "VAT 15%: " + window.NKPaymentData.formatMoney(invoiceData.row.vatAmount),
          "Price Fees: " + window.NKPaymentData.formatMoney(invoiceData.row.priceFees),
          "Total Price: " + window.NKPaymentData.formatMoney(invoiceData.row.totalPrice)
        ];

        var blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8;" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = invoiceData.invoiceNo + ".txt";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
    }
  });
})();
