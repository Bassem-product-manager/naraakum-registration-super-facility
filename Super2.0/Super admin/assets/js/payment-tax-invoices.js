(function () {
  function norm(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function uniq(values) {
    var out = [];
    var seen = {};
    (values || []).forEach(function (v) {
      var k = String(v || "");
      if (!k || seen[k]) return;
      seen[k] = true;
      out.push(k);
    });
    return out;
  }

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search || "");
    return params.get(name);
  }

  function setQuery(orderNo, docType) {
    var url = new URL(window.location.href);
    if (orderNo) url.searchParams.set("order", orderNo);
    if (docType) url.searchParams.set("invoice", docType);
    var from = getQueryParam("from");
    var entity = getQueryParam("entity");
    if (from) url.searchParams.set("from", from);
    if (entity) url.searchParams.set("entity", entity);
    window.history.replaceState({}, "", url.toString());
  }

  function safe(text) {
    return String(text == null ? "" : text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function badgeForStatus(status) {
    var s = norm(status);
    if (s === "issued") return '<span class="badge-soft green">Issued</span>';
    if (s === "draft") return '<span class="badge-soft orange">Draft</span>';
    if (s === "canceled") return '<span class="badge-soft">Canceled</span>';
    return '<span class="badge-soft">' + safe(status || "-") + "</span>";
  }

  function toDocTypeLabel(dataApi, docType) {
    var t = dataApi.normalizeTaxDocType(docType);
    return dataApi.getTaxDocLabel(t || docType);
  }

  function listAvailableDocTypesForOrder(dataApi, orderNo) {
    var docs = dataApi.getTaxDocuments({ orderNo: orderNo });
    var types = uniq(
      docs.map(function (doc) {
        return doc.docType;
      })
    );

    var preferredOrder = ["patient", "naraakum", "provider", "credit"];
    return preferredOrder.filter(function (t) {
      return types.indexOf(t) !== -1;
    });
  }

  function makeLineItems(doc, breakdown) {
    var vatRate = Number(doc.vatRate || 0.15);
    var items = [];

    if (doc.docType === "patient") {
      items.push({
        name: doc.providerType === "pharmacy" ? "Medication / Product" : "Healthcare Service",
        qty: 1,
        unit: breakdown.patientTaxableBase,
        vatRate: vatRate,
        vatAmount: breakdown.patientVat,
        total: breakdown.patientTaxableBase + breakdown.patientVat
      });
    } else if (doc.docType === "naraakum") {
      items.push({
        name: "Platform Commission / Service Fee",
        qty: 1,
        unit: breakdown.naraakumTaxableBase,
        vatRate: vatRate,
        vatAmount: breakdown.naraakumVat,
        total: breakdown.naraakumTaxableBase + breakdown.naraakumVat
      });
    } else if (doc.docType === "provider") {
      items.push({
        name: "Provider VAT Context (Reference)",
        qty: 1,
        unit: breakdown.patientTaxableBase,
        vatRate: vatRate,
        vatAmount: breakdown.providerVatContext,
        total: breakdown.patientTaxableBase + breakdown.providerVatContext
      });
    } else if (doc.docType === "credit") {
      var creditVat = Math.abs(Number(breakdown.creditVat || 0));
      var creditBase = Math.abs(Number(doc.taxableBase || 0));
      items.push({
        name: "Credit Note Adjustment",
        qty: 1,
        unit: -creditBase,
        vatRate: vatRate,
        vatAmount: -creditVat,
        total: -(creditBase + creditVat)
      });
    }

    return items;
  }

  function buildInvoiceHtml(dataApi, doc) {
    if (!doc) {
      return '<div class="invoice-paper"><span class="badge-soft orange"><i class="fi fi-rr-info"></i><span>No document found for this selection.</span></span></div>';
    }

    var breakdown = dataApi.getTaxBreakdownByOrder(doc.orderNo);
    if (!breakdown) {
      return '<div class="invoice-paper"><span class="badge-soft orange"><i class="fi fi-rr-info"></i><span>Order data not found.</span></span></div>';
    }

    var items = makeLineItems(doc, breakdown);

    var flagsHtml = (doc.complianceFlags || [])
      .map(function (flag) {
        return '<span class="badge-soft orange"><i class="fi fi-rr-info"></i><span>' + safe(flag) + "</span></span>";
      })
      .join(" ");

    var rowsHtml = items
      .map(function (it) {
        return (
          "<tr>" +
          "<td>" + safe(it.name) + "</td>" +
          "<td>" + safe(it.qty) + "</td>" +
          "<td>" + dataApi.formatMoney(it.unit) + "</td>" +
          "<td>" + (Number(it.vatRate || 0) * 100).toFixed(0) + "%</td>" +
          "<td>" + dataApi.formatMoney(it.vatAmount) + "</td>" +
          "<td>" + dataApi.formatMoney(it.total) + "</td>" +
          "</tr>"
        );
      })
      .join("");

    var matrixRows = [
      "<tr><td>Tax on Patient</td><td>" + dataApi.formatMoney(breakdown.patientTaxableBase) + "</td><td>" + (Number(breakdown.vatRate || 0) * 100).toFixed(0) + "%</td><td>" + dataApi.formatMoney(breakdown.patientVat) + "</td></tr>",
      "<tr><td>Tax on Naraakum</td><td>" + dataApi.formatMoney(breakdown.naraakumTaxableBase) + "</td><td>" + (Number(breakdown.vatRate || 0) * 100).toFixed(0) + "%</td><td>" + dataApi.formatMoney(breakdown.naraakumVat) + "</td></tr>",
      "<tr><td>Provider VAT Context</td><td>" + dataApi.formatMoney(breakdown.patientTaxableBase) + "</td><td>" + (Number(breakdown.vatRate || 0) * 100).toFixed(0) + "%</td><td>" + dataApi.formatMoney(breakdown.providerVatContext) + "</td></tr>",
      "<tr><td>Credit VAT</td><td>-</td><td>-</td><td>" + dataApi.formatMoney(-Math.abs(breakdown.creditVat || 0)) + "</td></tr>",
      "<tr><td><b>Net VAT</b></td><td>-</td><td>-</td><td><b>" + dataApi.formatMoney(breakdown.netVat) + "</b></td></tr>"
    ].join("");

    return [
      '<div class="invoice-paper">',
      '  <div class="inv-top">',
      '    <div class="inv-brand">',
      '      <img src="../assets/images/logo.svg" alt="Naraakum" />',
      '      <div>',
      '        <div class="name">' + safe(toDocTypeLabel(dataApi, doc.docType)) + "</div>",
      '        <div class="sub">Tax Control Center Document</div>',
      "      </div>",
      "    </div>",
      '    <div class="inv-meta">',
      '      <div class="row"><span class="k">Invoice No</span><span class="v mono">' + safe(doc.invoiceNo) + "</span></div>",
      '      <div class="row"><span class="k">Order No</span><span class="v mono">' + safe(doc.orderNo) + "</span></div>",
      '      <div class="row"><span class="k">Transaction</span><span class="v mono">' + safe(doc.transactionNo) + "</span></div>",
      '      <div class="row"><span class="k">Issue Date</span><span class="v">' + safe(doc.issueDate) + "</span></div>",
      '      <div class="row"><span class="k">Status</span><span class="v">' + safe(doc.status) + "</span></div>",
      "    </div>",
      "  </div>",
      '  <div class="inv-hr"></div>',
      '  <div class="inv-grid-2">',
      '    <div class="inv-card">',
      '      <div class="h">Seller</div>',
      '      <div class="line"><span class="k">Name</span><span class="v">' + safe(doc.sellerName) + "</span></div>",
      '      <div class="line"><span class="k">Code</span><span class="v mono">' + safe(doc.sellerCode || "-") + "</span></div>",
      '      <div class="line"><span class="k">VAT No</span><span class="v mono">' + safe(doc.sellerVatNo || "-") + "</span></div>",
      "    </div>",
      '    <div class="inv-card">',
      '      <div class="h">Buyer</div>',
      '      <div class="line"><span class="k">Name</span><span class="v">' + safe(doc.buyerName) + "</span></div>",
      '      <div class="line"><span class="k">Code</span><span class="v mono">' + safe(doc.buyerCode || "-") + "</span></div>",
      '      <div class="line"><span class="k">VAT No</span><span class="v mono">' + safe(doc.buyerVatNo || "-") + "</span></div>",
      "    </div>",
      "  </div>",
      '  <div class="inv-hr"></div>',
      '  <div class="inv-card">',
      '    <div class="h">Order Financial Snapshot</div>',
      '    <div class="line"><span class="k">Price</span><span class="v">' + dataApi.formatMoney(breakdown.price) + "</span></div>",
      '    <div class="line"><span class="k">VAT (15%)</span><span class="v">' + dataApi.formatMoney(breakdown.patientVat + breakdown.naraakumVat) + "</span></div>",
      '    <div class="line"><span class="k">Price Fees</span><span class="v">' + dataApi.formatMoney(breakdown.priceFees) + "</span></div>",
      '    <div class="line"><span class="k">Total Price</span><span class="v">' + dataApi.formatMoney(breakdown.totalPrice) + "</span></div>",
      "  </div>",
      '  <table class="inv-items">',
      "    <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>VAT %</th><th>VAT</th><th>Total</th></tr></thead>",
      "    <tbody>" + rowsHtml + "</tbody>",
      "  </table>",
      '  <div class="inv-hr"></div>',
      '  <div class="inv-card">',
      '    <div class="h">Tax Responsibility Matrix</div>',
      '    <table class="tax-alloc">',
      "      <thead><tr><th>Tax Component</th><th>Taxable Base</th><th>Rate</th><th>Amount</th></tr></thead>",
      "      <tbody>" + matrixRows + "</tbody>",
      "    </table>",
      "  </div>",
      flagsHtml ? '<div class="inv-hr"></div><div class="d-flex gap-2 flex-wrap">' + flagsHtml + "</div>" : "",
      "</div>"
    ].join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var dataApi = window.NKPaymentData;
    if (!dataApi || typeof dataApi.getTaxDocuments !== "function") return;

    var page = 1;
    var filteredDocs = [];
    var viewerOrderNo = "";
    var viewerDocType = "patient";

    var tbody = document.getElementById("invTbody");
    var pageSelect = document.getElementById("pageSelect");
    var pageInfo = document.getElementById("pageInfo");

    function currentFilters() {
      return {
        dateFrom: document.getElementById("fFrom") ? document.getElementById("fFrom").value : "",
        dateTo: document.getElementById("fTo") ? document.getElementById("fTo").value : "",
        entityType: document.getElementById("fEntityType") ? document.getElementById("fEntityType").value : "",
        docType: document.getElementById("fDocType") ? document.getElementById("fDocType").value : "",
        status: document.getElementById("fStatus") ? document.getElementById("fStatus").value : "",
        providerCode: document.getElementById("fProviderCode") ? document.getElementById("fProviderCode").value : "",
        search: document.getElementById("fSearch") ? document.getElementById("fSearch").value : "",
        entity: getQueryParam("entity") || ""
      };
    }

    function rowsPerPage() {
      var v = Number(document.getElementById("rowsPerPage") && document.getElementById("rowsPerPage").value);
      return Number.isFinite(v) && v > 0 ? v : 10;
    }

    function renderKpis(filters) {
      var k = dataApi.getTaxKpis(filters);

      document.getElementById("kpiIssued").textContent = String(k.issuedDocs || 0);
      document.getElementById("kpiCreditNotes").textContent = String(k.creditNotes || 0);
      document.getElementById("kpiPatientVat").textContent = dataApi.formatMoney(k.patientVat || 0);
      document.getElementById("kpiNaraakumVat").textContent = dataApi.formatMoney(k.naraakumVat || 0);
      document.getElementById("kpiProviderVat").textContent = dataApi.formatMoney(k.providerVatContext || 0);
      document.getElementById("kpiVat").textContent = dataApi.formatMoney(k.netVat || 0);
      document.getElementById("kpiGross").textContent = dataApi.formatMoney(k.grossTaxableAmount || 0);
    }

    function renderPageControls(totalPages) {
      if (!pageSelect) return;
      pageSelect.innerHTML = "";
      for (var i = 1; i <= totalPages; i += 1) {
        var opt = document.createElement("option");
        opt.value = String(i);
        opt.textContent = String(i);
        if (i === page) opt.selected = true;
        pageSelect.appendChild(opt);
      }
      if (pageInfo) pageInfo.textContent = page + " / " + totalPages;

      var prev = document.getElementById("btnPrevPage");
      var next = document.getElementById("btnNextPage");
      if (prev) prev.disabled = page <= 1;
      if (next) next.disabled = page >= totalPages;
    }

    function openDocInViewer(orderNo, docType) {
      viewerOrderNo = orderNo;
      viewerDocType = dataApi.normalizeTaxDocType(docType || "patient") || "patient";
      setQuery(viewerOrderNo, viewerDocType);
      renderViewer();
    }

    function renderList() {
      var filters = currentFilters();
      filteredDocs = dataApi.getTaxDocuments(filters);
      renderKpis(filters);

      var badge = document.getElementById("invCountBadge");
      if (badge) badge.innerHTML = '<i class="fi fi-rr-list"></i><span>' + filteredDocs.length + " Docs</span>";

      var rpp = rowsPerPage();
      var totalPages = Math.max(1, Math.ceil(filteredDocs.length / rpp));
      if (page > totalPages) page = totalPages;
      if (page < 1) page = 1;

      var start = (page - 1) * rpp;
      var slice = filteredDocs.slice(start, start + rpp);

      if (!slice.length) {
        tbody.innerHTML = '<tr><td colspan="14" class="text-center text-grey">No tax documents found</td></tr>';
      } else {
        tbody.innerHTML = slice
          .map(function (doc, idx) {
            var flags = (doc.complianceFlags || []).length
              ? '<span class="badge-soft orange"><i class="fi fi-rr-shield-exclamation"></i><span>' + safe((doc.complianceFlags || [])[0]) + "</span></span>"
              : '<span class="badge-soft green"><i class="fi fi-rr-shield-check"></i><span>OK</span></span>';

            return [
              "<tr>",
              "<td>" + (start + idx + 1) + "</td>",
              '<td class="mono">' + safe(doc.invoiceNo) + "</td>",
              "<td>" + safe(toDocTypeLabel(dataApi, doc.docType)) + "</td>",
              '<td class="mono">' + safe(doc.orderNo) + "</td>",
              '<td class="mono">' + safe(doc.transactionNo) + "</td>",
              "<td>" + safe(doc.providerName) + "<br><span class=\"fsize-12 text-grey mono\">" + safe(doc.providerCode) + "</span></td>",
              "<td>" + safe(doc.patientName) + "</td>",
              "<td>" + safe(doc.issueDate) + "</td>",
              "<td>" + dataApi.formatMoney(doc.taxableBase) + "</td>",
              "<td>" + dataApi.formatMoney(doc.vatAmount) + "</td>",
              "<td>" + dataApi.formatMoney(doc.totalAmount) + "</td>",
              "<td>" + badgeForStatus(doc.status) + "</td>",
              "<td>" + flags + "</td>",
              '<td class="text-center"><div class="d-flex justify-content-center gap-2 flex-wrap">' +
                '<button class="btn btn-primary-revers btn-32" data-act="view" data-order="' + safe(doc.orderNo) + '" data-type="' + safe(doc.docType) + '"><i class="fi fi-rr-eye"></i></button>' +
                '<button class="btn btn-primary-revers btn-32" data-act="print" data-order="' + safe(doc.orderNo) + '" data-type="' + safe(doc.docType) + '"><i class="fi fi-rr-print"></i></button>' +
                '<button class="btn btn-primary-revers btn-32" data-act="download" data-order="' + safe(doc.orderNo) + '" data-type="' + safe(doc.docType) + '"><i class="fi fi-rr-download"></i></button>' +
              "</div></td>",
              "</tr>"
            ].join("");
          })
          .join("");
      }

      renderPageControls(totalPages);
      bindRowActions();
    }

    function bindRowActions() {
      if (!tbody) return;
      Array.prototype.slice.call(tbody.querySelectorAll("button[data-act]")).forEach(function (btn) {
        btn.addEventListener("click", function () {
          var orderNo = btn.getAttribute("data-order") || "";
          var docType = btn.getAttribute("data-type") || "patient";
          var action = btn.getAttribute("data-act") || "view";

          openDocInViewer(orderNo, docType);
          if (action === "print") {
            setTimeout(function () {
              window.print();
            }, 50);
          }
          if (action === "download") {
            setTimeout(downloadCurrentInvoiceHtml, 50);
          }
        });
      });
    }

    function renderViewerTabs() {
      var tabs = document.getElementById("invoiceTypeTabs");
      if (!tabs) return;

      var available = listAvailableDocTypesForOrder(dataApi, viewerOrderNo);
      if (!available.length) {
        tabs.innerHTML = "";
        return;
      }

      if (available.indexOf(viewerDocType) === -1) viewerDocType = available[0];

      tabs.innerHTML = "";
      available.forEach(function (type) {
        var chip = document.createElement("div");
        chip.className = "tab-chip" + (type === viewerDocType ? " active" : "");
        chip.setAttribute("data-type", type);
        chip.innerHTML = '<span class="dot"></span><span>' + safe(toDocTypeLabel(dataApi, type)) + "</span>";
        chip.addEventListener("click", function () {
          viewerDocType = type;
          renderViewer();
          setQuery(viewerOrderNo, viewerDocType);
        });
        tabs.appendChild(chip);
      });
    }

    function renderOrderSelect() {
      var sel = document.getElementById("invoiceOrderSelect");
      if (!sel) return;

      var orders = uniq(
        dataApi
          .getTaxDocuments({ entity: getQueryParam("entity") || "" })
          .map(function (doc) {
            return doc.orderNo;
          })
      );

      sel.innerHTML = "";
      orders.forEach(function (orderNo) {
        var opt = document.createElement("option");
        opt.value = orderNo;
        opt.textContent = orderNo;
        sel.appendChild(opt);
      });

      if (!viewerOrderNo && orders.length) viewerOrderNo = orders[0];
      if (viewerOrderNo) sel.value = viewerOrderNo;

      sel.addEventListener("change", function (e) {
        viewerOrderNo = e.target.value;
        viewerDocType = "patient";
        renderViewer();
        setQuery(viewerOrderNo, viewerDocType);
      });
    }

    function renderViewer() {
      var root = document.getElementById("invoiceRoot");
      if (!root) return;

      var doc = dataApi.getTaxDocument(viewerOrderNo, viewerDocType);
      renderViewerTabs();

      if (!doc) {
        root.innerHTML = '<div class="invoice-paper"><span class="badge-soft orange"><i class="fi fi-rr-info"></i><span>No document for this selection.</span></span></div>';
        return;
      }

      root.innerHTML = buildInvoiceHtml(dataApi, doc);
    }

    function downloadCurrentInvoiceHtml() {
      var root = document.getElementById("invoiceRoot");
      if (!root) return;
      var html =
        "<!doctype html><html><head><meta charset=\"utf-8\"/><title>Tax Document</title><style>" +
        document.querySelector("style").innerHTML +
        "</style><link rel=\"stylesheet\" href=\"../assets/css/MainStyle.css\" /></head><body><div style=\"padding:12px;max-width:920px;margin:0 auto\">" +
        root.innerHTML +
        "</div></body></html>";

      var blob = new Blob([html], { type: "text/html;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "tax-document-" + (viewerOrderNo || "doc") + ".html";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    function exportCsv() {
      var header = ["InvoiceNo", "DocType", "Status", "OrderNo", "TransactionNo", "Provider", "ProviderCode", "Patient", "IssueDate", "TaxableBase", "VAT", "Total"];
      var rows = filteredDocs.map(function (doc) {
        return [
          doc.invoiceNo,
          doc.docType,
          doc.status,
          doc.orderNo,
          doc.transactionNo,
          doc.providerName,
          doc.providerCode,
          doc.patientName,
          doc.issueDate,
          Number(doc.taxableBase || 0).toFixed(2),
          Number(doc.vatAmount || 0).toFixed(2),
          Number(doc.totalAmount || 0).toFixed(2)
        ];
      });

      var csv = [header].concat(rows)
        .map(function (line) {
          return line
            .map(function (cell) {
              return '"' + String(cell == null ? "" : cell).replace(/"/g, '""') + '"';
            })
            .join(",");
        })
        .join("\n");

      var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "tax-invoices-export.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    function initButtons() {
      var applyBtn = document.getElementById("btnApply");
      var resetBtn = document.getElementById("btnReset");
      var exportBtn = document.getElementById("btnExportCsv");
      var printBtn = document.getElementById("btnInvoicePrint");
      var downloadBtn = document.getElementById("btnInvoiceDownload");
      var clearBtn = document.getElementById("btnViewerClear");
      var prevBtn = document.getElementById("btnPrevPage");
      var nextBtn = document.getElementById("btnNextPage");
      var rows = document.getElementById("rowsPerPage");

      if (applyBtn) applyBtn.addEventListener("click", function () {
        page = 1;
        renderList();
      });

      if (resetBtn) {
        resetBtn.addEventListener("click", function () {
          ["fFrom", "fTo", "fEntityType", "fDocType", "fStatus", "fProviderCode", "fSearch"].forEach(function (id) {
            var el = document.getElementById(id);
            if (!el) return;
            el.value = "";
          });
          page = 1;
          renderList();
        });
      }

      if (exportBtn) exportBtn.addEventListener("click", exportCsv);
      if (printBtn) printBtn.addEventListener("click", function () { window.print(); });
      if (downloadBtn) downloadBtn.addEventListener("click", downloadCurrentInvoiceHtml);

      if (clearBtn) {
        clearBtn.addEventListener("click", function () {
          viewerOrderNo = "";
          viewerDocType = "patient";
          var root = document.getElementById("invoiceRoot");
          var tabs = document.getElementById("invoiceTypeTabs");
          if (tabs) tabs.innerHTML = "";
          if (root) {
            root.innerHTML = '<div class="invoice-paper"><span class="badge-soft"><i class="fi fi-rr-info"></i><span>Select any document from the list to preview it here</span></span></div>';
          }
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          page = Math.max(1, page - 1);
          renderList();
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          var totalPages = Math.max(1, Math.ceil(filteredDocs.length / rowsPerPage()));
          page = Math.min(totalPages, page + 1);
          renderList();
        });
      }

      if (pageSelect) {
        pageSelect.addEventListener("change", function (e) {
          page = Number(e.target.value || 1);
          renderList();
        });
      }

      if (rows) {
        rows.addEventListener("change", function () {
          page = 1;
          renderList();
        });
      }
    }

    function initLedgerBackButton() {
      var from = getQueryParam("from");
      var entity = getQueryParam("entity");
      if (from === "ledger" || entity) {
        var btn = document.getElementById("invoiceBackToLedger");
        if (!btn) return;
        btn.classList.remove("d-none");
        btn.href = entity ? "entity-ledger.html?entity=" + encodeURIComponent(entity) : "entity-ledger.html";
      }
    }

    function initKsaClock() {
      function pad(n) {
        return n < 10 ? "0" + n : "" + n;
      }

      function tick() {
        try {
          var d = new Date();
          var utc = d.getTime() + d.getTimezoneOffset() * 60000;
          var ksa = new Date(utc + 3 * 3600000);

          var h = ksa.getHours();
          var m = ksa.getMinutes();
          var ampm = h >= 12 ? "PM" : "AM";
          h = h % 12;
          if (h === 0) h = 12;

          var str = pad(h) + ":" + pad(m) + " " + ampm;
          var el = document.getElementById("ksaTime");
          if (el) el.textContent = str;
        } catch (err) {
          // ignore
        }
      }

      tick();
      setInterval(tick, 15000);
    }

    function applyQueryDefaults() {
      var requestedOrder = (getQueryParam("order") || "").toString().trim();
      var requestedType = dataApi.normalizeTaxDocType(getQueryParam("invoice"));
      var requestedEntity = (getQueryParam("entity") || "").toString().trim();

      if (requestedEntity) {
        var providerCodeInput = document.getElementById("fProviderCode");
        if (providerCodeInput) providerCodeInput.value = requestedEntity;
      }

      renderList();

      if (requestedOrder) {
        viewerOrderNo = requestedOrder;
        viewerDocType = requestedType || "patient";
      } else {
        var docs = dataApi.getTaxDocuments(currentFilters());
        if (docs.length) {
          viewerOrderNo = docs[0].orderNo;
          viewerDocType = docs[0].docType;
        }
      }

      renderOrderSelect();
      renderViewer();
    }

    initButtons();
    initLedgerBackButton();
    initKsaClock();
    applyQueryDefaults();
  });
})();
