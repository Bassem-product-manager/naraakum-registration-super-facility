(function () {
  function qs(name) {
    var url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function statusLabel(value) {
    var key = (value || "").toString().trim().toLowerCase();
    var map = {
      pending: "Pending",
      "in-progress": "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
      canceled: "Cancelled",
      failed: "Failed",
      accepted: "Accepted"
    };
    return map[key] || "Pending";
  }

  function statusClass(value) {
    var key = (value || "").toString().trim().toLowerCase();
    if (key === "completed") return "st-completed";
    if (key === "in-progress") return "st-progress";
    if (key === "cancelled" || key === "canceled") return "st-cancelled";
    if (key === "failed") return "st-failed";
    return "st-pending";
  }

  function fmtMoney(value) {
    var n = Number(value) || 0;
    return n.toFixed(2) + " SAR";
  }

  function fmtDate(value) {
    if (!value) return "-";
    var d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-GB");
  }

  function fmtDateTime(value) {
    if (!value) return "-";
    var d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-GB") + " " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  }

  function makeStars(stars) {
    var count = Math.max(0, Math.min(5, parseInt(stars, 10) || 0));
    var html = '<div class="stars">';
    for (var i = 1; i <= 5; i += 1) {
      html += i <= count ? '<i class="fi fi-sr-star"></i>' : '<i class="fi fi-rr-star"></i>';
    }
    html += "</div>";
    return html;
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setHtml(id, value) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = value;
  }

  function show(el, state) {
    if (!el) return;
    el.classList.toggle("d-none", !state);
  }

  function breadcrumbMeta(from, providerType, entityCode) {
    var source = (from || "").toString().trim().toLowerCase();
    if (source === "facility-orders") return { href: "facilities-order.html", label: "Facility Orders" };
    if (source === "pharmacy-orders") return { href: "pharmacy-order.html", label: "Pharmacy Orders" };
    if (source === "individual-orders") return { href: "Individuals-order.html", label: "Individual Orders" };
    if (source === "facility-returns") return { href: "returns-facility.html", label: "Facility Return" };
    if (source === "individual-returns") return { href: "returns-individual.html", label: "Individual Return" };
    if (source === "pharmacy-returns") return { href: "returns-list.html", label: "Pharmacy Return" };
    if (source === "transaction-orders") return { href: "../payment/transaction-orders.html", label: "Transaction Orders" };
    if (source === "insurance-invoices") return { href: "../payment/insurance-invoices.html", label: "Insurance Invoices" };
    if (source === "ledger") {
      return {
        href: entityCode ? "../payment/entity-ledger.html?entity=" + encodeURIComponent(entityCode) : "../payment/entity-ledger.html",
        label: "Entity Ledger"
      };
    }

    if (providerType === "pharmacy") return { href: "pharmacy-order.html", label: "Pharmacy Orders" };
    if (providerType === "individual") return { href: "Individuals-order.html", label: "Individual Orders" };
    return { href: "facilities-order.html", label: "Facility Orders" };
  }

  function renderServices(record) {
    var tbody = document.getElementById("serviceTbody");
    if (!tbody) return;
    var rows = record.services || [];

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-grey">No services available for this order.</td></tr>';
      return;
    }

    tbody.innerHTML = rows
      .map(function (row) {
        return [
          "<tr>",
          "<td>" + row.qty + "</td>",
          "<td>" + row.name + "</td>",
          '<td><span class="status-pill ' + statusClass(row.status) + '">' + statusLabel(row.status) + "</span></td>",
          "<td>" + row.providerName + "</td>",
          "<td>" + row.phone + "</td>",
          "<td>" + row.email + "</td>",
          '<td class="text-end"><b>' + fmtMoney(row.price) + "</b></td>",
          "</tr>"
        ].join("");
      })
      .join("");
  }

  function renderMedications(record) {
    var tbody = document.getElementById("medicationTbody");
    if (!tbody) return;
    var rows = record.medications || [];

    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="9" class="text-center text-grey">No medications available for this order.</td></tr>';
      return;
    }

    tbody.innerHTML = rows
      .map(function (row) {
        return [
          "<tr>",
          "<td>" + row.name + "</td>",
          "<td>" + row.form + "</td>",
          "<td>" + row.strength + "</td>",
          "<td>" + row.qty + "</td>",
          "<td>" + fmtMoney(row.unitPrice) + "</td>",
          "<td>" + (Number(row.vatRate || 0) * 100).toFixed(0) + "%</td>",
          "<td>" + (row.fulfillment || "-") + "</td>",
          '<td><span class="status-pill ' + statusClass(row.dispenseStatus) + '">' + statusLabel(row.dispenseStatus) + "</span></td>",
          '<td class="text-end"><b>' + fmtMoney(row.total) + "</b></td>",
          "</tr>"
        ].join("");
      })
      .join("");
  }

  function renderMap(record) {
    var frame = document.getElementById("patientMap");
    if (!frame || !record || !record.patient) return;

    var lat = record.patient.mapLat;
    var lng = record.patient.mapLng;
    frame.src = "https://www.google.com/maps?q=" + encodeURIComponent(lat + "," + lng) + "&z=13&output=embed";
  }

  function renderRating(record) {
    var rating = record.rating || {};
    setHtml("ratingStars", makeStars(rating.stars || 0));
    setText("ratingComment", rating.comment || "-");
    setText("ratingDate", fmtDateTime(rating.createdAt));
  }

  function renderOrder(record, providerType) {
    setText("odOrderNoTop", record.orderNo);
    setText("odOrderNo", record.orderNo);
    setText("odInstitutionName", record.institutionName || "-");
    setText("odInstitutionCode", record.institutionCode || "-");
    setText("odProviderType", providerType || "-");

    setText("odStatusText", statusLabel(record.order.status));
    setText("odOrderDate", fmtDate(record.order.orderDate));
    setText("odScheduledDate", fmtDate(record.order.scheduledDate));
    setText("odPaymentMethod", record.order.paymentMethod || "-");

    setText("odSubtotal", fmtMoney(record.order.subtotal));
    setText("odVat", fmtMoney(record.order.vat));
    setText("odFees", fmtMoney(record.order.fees));
    setText("odTotal", fmtMoney(record.order.total));

    setText("odPatientName", record.patient.name || "-");
    setText("odPatientAge", String(record.patient.age || "-"));
    setText("odPatientPhone", record.patient.phone || "-");
    setText("odPatientGender", record.patient.gender || "-");
    setText("odPatientNationality", record.patient.nationality || "-");
    setText("odPatientCity", record.patient.city || "-");

    var statusPill = document.getElementById("odStatusPill");
    if (statusPill) {
      statusPill.className = "status-pill " + statusClass(record.order.status);
      statusPill.textContent = statusLabel(record.order.status);
    }

    renderMap(record);
    renderRating(record);
    renderServices(record);
    renderMedications(record);
  }

  function initClock() {
    var el = document.getElementById("ksaTime");
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
      } catch (err) {
        el.textContent = new Date().toLocaleTimeString("en-US", { hour12: true });
      }
    }

    tick();
    setInterval(tick, 1000);
  }

  document.addEventListener("DOMContentLoaded", function () {
    initClock();

    var dataApi = window.NKOrderDetailsData;
    if (!dataApi) return;

    var orderNo = (qs("order") || "").toString().trim();
    var requestedType = (qs("providerType") || "").toString().trim().toLowerCase();
    var from = (qs("from") || "").toString().trim().toLowerCase();
    var entity = (qs("entity") || "").toString().trim().toUpperCase();

    var detailMode = (document.body.getAttribute("data-detail-mode") || "facility").toLowerCase();

    var lookupType = requestedType || detailMode;
    var record = dataApi.getOrder(orderNo, lookupType);
    var providerType = requestedType || (record ? record.providerType : "facility");

    var orderEmpty = document.getElementById("orderEmptyState");
    var orderContent = document.getElementById("orderDetailsContent");

    if (!record) {
      show(orderEmpty, true);
      show(orderContent, false);
      var fallbackBack = dataApi.getBackHref(from, requestedType || detailMode, entity);
      var emptyBack = document.getElementById("emptyBackLink");
      if (emptyBack) emptyBack.setAttribute("href", fallbackBack);
      return;
    }

    if (detailMode === "pharmacy" && providerType !== "pharmacy") providerType = "pharmacy";
    if (detailMode === "facility" && providerType === "pharmacy") providerType = "facility";

    show(orderEmpty, false);
    show(orderContent, true);

    var backHref = dataApi.getBackHref(from, providerType, entity);
    var backLink = document.getElementById("backLink");
    if (backLink) backLink.setAttribute("href", backHref);

    var breadcrumb = breadcrumbMeta(from, providerType, entity);
    var breadcrumbLink = document.getElementById("breadcrumbOrdersLink");
    if (breadcrumbLink) {
      breadcrumbLink.setAttribute("href", breadcrumb.href);
      breadcrumbLink.textContent = breadcrumb.label;
    }

    setText("breadcrumbProvider", providerType === "pharmacy" ? "Pharmacy" : providerType === "individual" ? "Individual" : "Facility");

    renderOrder(record, providerType);

    var serviceSection = document.getElementById("serviceSection");
    var medSection = document.getElementById("medicationSection");

    show(serviceSection, providerType !== "pharmacy");
    show(medSection, providerType === "pharmacy");

    var printBtn = document.getElementById("downloadPdfBtn");
    if (printBtn) {
      printBtn.addEventListener("click", function (event) {
        event.preventDefault();
        window.print();
      });
    }
  });
})();
