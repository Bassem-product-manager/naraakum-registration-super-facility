(function () {
  function initClock() {
    var ksaEl = document.getElementById("ksaTime");
    if (!ksaEl) return;

    function tick() {
      try {
        var fmt = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Riyadh",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        });
        ksaEl.textContent = fmt.format(new Date());
      } catch (err) {
        ksaEl.textContent = new Date().toLocaleTimeString("en-US", { hour12: true });
      }
    }

    tick();
    setInterval(tick, 1000);
  }

  function normalizeType(value) {
    var key = String(value || "").trim().toLowerCase();
    if (key === "individual" || key === "facility") return key;
    return "";
  }

  function listHref(type) {
    return type === "individual" ? "returns-individual.html" : "returns-facility.html";
  }

  function sourceTypeLabel(type) {
    return type === "individual" ? "Individual Return" : "Facility Return";
  }

  function statusClass(status) {
    if (status === "Approved (Full)") return "r-approved-full";
    if (status === "Approved (Partial)") return "r-approved-partial";
    if (status === "Rejected") return "r-rejected";
    return "r-under-review";
  }

  function refundClass(status) {
    if (status === "Ready to Release") return "f-ready";
    if (status === "Released") return "f-released";
    if (status === "Failed") return "f-failed";
    return "f-not-released";
  }

  function cancelStatusLabel(value) {
    return String(value || "").toLowerCase() === "failed" ? "Failed" : "Cancelled";
  }

  function cancelSourceLabel(value) {
    var key = String(value || "").toLowerCase();
    if (key === "facility") return "Facility";
    if (key === "individual") return "Individual";
    return "Customer";
  }

  function cancelTypeLabel(value) {
    var key = String(value || "").toLowerCase();
    if (key === "customer_cancelled") return "Customer Cancelled";
    if (key === "patient_not_found") return "Patient Not Found";
    if (key === "session_no_show") return "Session No Show";
    if (key === "provider_unavailable") return "Provider Unavailable";
    return "Other";
  }

  function refundMethodLabel(value) {
    var key = String(value || "").toLowerCase();
    if (key === "wallet") return "Wallet";
    if (key === "bank-transfer") return "Bank Transfer";
    if (key === "cash") return "Cash";
    return "Card";
  }

  function esc(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setAnchorState(el, enabled, href, title) {
    if (!el) return;
    if (enabled) {
      el.classList.remove("is-disabled");
      el.setAttribute("href", href || "#");
      el.removeAttribute("aria-disabled");
      if (title) el.setAttribute("title", title);
      else el.removeAttribute("title");
      return;
    }

    el.classList.add("is-disabled");
    el.setAttribute("href", "#");
    el.setAttribute("aria-disabled", "true");
    if (title) el.setAttribute("title", title);
  }

  function orderDetailsHref(entry) {
    var from = entry.sourceType === "individual" ? "individual-returns" : "facility-returns";
    return "order-details-facility.html?order=" + encodeURIComponent(entry.orderNo) + "&providerType=" + encodeURIComponent(entry.sourceType) + "&from=" + encodeURIComponent(from);
  }

  function normalizeDecision(value) {
    var key = String(value || "").toLowerCase();
    if (key === "approved" || key === "rejected" || key === "pending") return key;
    return "pending";
  }

  function fmtDateTime(value) {
    if (!value) return "-";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-GB") + " " + date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (!el) return;
    var text = value === null || value === undefined || value === "" ? "-" : String(value);
    el.textContent = text;
  }

  function serviceStatusLabel(value) {
    var key = String(value || "").toLowerCase();
    if (key === "in-progress") return "In Progress";
    if (key === "completed") return "Completed";
    if (key === "accepted") return "Accepted";
    if (key === "cancelled" || key === "canceled" || key === "rejected") return "Cancelled";
    if (key === "failed") return "Failed";
    if (key === "approved") return "Approved";
    return "Pending";
  }

  function serviceStatusClass(value) {
    var key = String(value || "").toLowerCase();
    if (key === "in-progress") return "ss-progress";
    if (key === "completed" || key === "accepted" || key === "approved") return "ss-completed";
    if (key === "cancelled" || key === "canceled" || key === "failed" || key === "rejected") return "ss-cancelled";
    return "ss-pending";
  }

  function recordTypeLabel(value) {
    return String(value || "").toLowerCase() === "session" ? "Session" : "Visit";
  }

  function recordTypeClass(value) {
    return String(value || "").toLowerCase() === "session" ? "record-session" : "record-visit";
  }

  document.addEventListener("DOMContentLoaded", function () {
    initClock();

    if (!window.NKServiceReturns) return;

    var query = new URLSearchParams(window.location.search || "");
    var requestedId = String(query.get("returnId") || query.get("id") || "").trim();
    var requestedOrderNo = String(query.get("orderNo") || query.get("order") || "").trim();
    var requestedType = normalizeType(query.get("sourceType"));

    var emptyState = document.getElementById("emptyState");
    var detailsContent = document.getElementById("detailsContent");
    var alertBox = document.getElementById("alertBox");
    var itemSearch = document.getElementById("itemSearch");
    var itemsWrap = document.getElementById("itemsWrap");
    var itemsEmpty = document.getElementById("itemsEmpty");
    var itemsTbody = document.getElementById("itemsTbody");
    var decisionFilterBar = document.getElementById("decisionFilterBar");
    var decisionBadge = document.getElementById("decisionBadge");
    var feesInput = document.getElementById("feesInput");
    var refundMethodSelect = document.getElementById("refundMethodSelect");
    var releaseBtn = document.getElementById("releaseBtn");
    var successBox = document.getElementById("successBox");
    var orderLink = document.getElementById("orderLink");
    var patientProfileBtn = document.getElementById("patientProfileBtn");
    var latestRecordBtn = document.getElementById("latestRecordBtn");
    var legacyReturnLines = document.getElementById("legacyReturnLines");
    var serviceLinesWrap = document.getElementById("serviceLinesWrap");
    var serviceLinesEmpty = document.getElementById("serviceLinesEmpty");
    var serviceLinesTbody = document.getElementById("serviceLinesTbody");
    var serviceMapWrap = document.getElementById("serviceMapWrap");
    var serviceMapFrame = document.getElementById("serviceMapFrame");
    var serviceMapEmpty = document.getElementById("serviceMapEmpty");
    var serviceMapLink = document.getElementById("serviceMapLink");
    var recordLinesWrap = document.getElementById("recordLinesWrap");
    var recordLinesEmpty = document.getElementById("recordLinesEmpty");
    var recordLinesTbody = document.getElementById("recordLinesTbody");
    var returnsListLink = document.getElementById("returnsListLink");
    var emptyBackLink = document.getElementById("emptyBackLink");
    var headBackLink = document.getElementById("headBackLink");
    var panelBackLink = document.getElementById("panelBackLink");
    var orderOverrideSelect = document.getElementById("orderOverrideSelect");

    var releaseModalEl = document.getElementById("releaseModal");
    var releaseModal = window.bootstrap ? bootstrap.Modal.getOrCreateInstance(releaseModalEl) : null;

    var allReturns = [];
    var current = null;
    var currentIndex = -1;
    var activeLineFilter = "all";
    var currentOrderRecord = null;
    var resolvedPatientCode = "";
    var resolvedPatientRecords = [];

    function showAlert(type, text) {
      if (!text) {
        alertBox.className = "alert-mini d-none";
        alertBox.textContent = "";
        return;
      }
      alertBox.className = "alert-mini " + (type === "error" ? "alert-err" : "alert-ok");
      alertBox.textContent = text;
    }

    function findCurrentIndex() {
      if (requestedId) {
        return allReturns.findIndex(function (entry) {
          return String(entry.id) === requestedId;
        });
      }

      if (requestedOrderNo) {
        return allReturns.findIndex(function (entry) {
          return String(entry.orderNo) === requestedOrderNo && (!requestedType || entry.sourceType === requestedType);
        });
      }

      if (requestedType) {
        return allReturns.findIndex(function (entry) {
          return entry.sourceType === requestedType;
        });
      }

      return allReturns.length ? 0 : -1;
    }

    function syncCurrentFromStore() {
      allReturns = NKServiceReturns.load();
      currentIndex = findCurrentIndex();
      if (currentIndex === -1) {
        current = null;
        return;
      }
      current = allReturns[currentIndex];
      requestedId = current.id;
    }

    function persist() {
      if (!current || currentIndex < 0) return;
      current = NKServiceReturns.normalizeReturn(current);
      allReturns[currentIndex] = current;
      NKServiceReturns.save(allReturns);
      syncCurrentFromStore();
    }

    function isReleased() {
      return current && current.computedRefundStatus === "Released";
    }

    function canRelease() {
      if (!current || isReleased()) return false;
      var approved = current.computedReturnStatus === "Approved (Full)" || current.computedReturnStatus === "Approved (Partial)";
      return approved && Number(current.computedFinalRefund || 0) > 0 && current.computedRefundStatus === "Ready to Release";
    }

    function updateBackLinks(type) {
      var href = listHref(type);
      if (returnsListLink) {
        returnsListLink.href = href;
        returnsListLink.textContent = sourceTypeLabel(type);
      }
      if (emptyBackLink) emptyBackLink.href = href;
      if (headBackLink) headBackLink.href = href;
      if (panelBackLink) panelBackLink.href = href;
    }

    function getOrderRecord(entry) {
      if (!window.NKOrderDetailsData || typeof NKOrderDetailsData.getOrder !== "function") return null;
      return NKOrderDetailsData.getOrder(entry.orderNo, entry.sourceType) || null;
    }

    function resolvePatientCode(entry, orderRecord) {
      var directCode = String(entry.patientCode || "").trim();
      if (directCode) return directCode;

      var fromOrder = String(orderRecord && orderRecord.patient && orderRecord.patient.patientCode || "").trim();
      if (fromOrder) return fromOrder;

      if (!window.NKPatientsData || !Array.isArray(NKPatientsData.patients)) return "";
      var candidateName = String(entry.patientName || orderRecord && orderRecord.patient && orderRecord.patient.name || "").trim().toLowerCase();
      if (!candidateName) return "";

      var byName = NKPatientsData.patients.find(function (row) {
        return String(row && row.name || "").trim().toLowerCase() === candidateName;
      });
      return byName && byName.patientCode ? String(byName.patientCode) : "";
    }

    function getPatientRecords(patientCode) {
      if (!window.NKPatientsData || !patientCode) return [];
      if (typeof NKPatientsData.getSortedPatientRecords === "function") {
        return NKPatientsData.getSortedPatientRecords(patientCode) || [];
      }
      if (typeof NKPatientsData.getPatientVisits === "function") {
        return NKPatientsData.getPatientVisits(patientCode) || [];
      }
      return [];
    }

    function recordHref(patientCode, row) {
      var recordType = row && row.recordType ? row.recordType : "visit";
      var route = String(recordType || "").toLowerCase() === "session" ? "Session-record.html" : "visit-record.html";
      if (window.NKPatientsData && typeof NKPatientsData.getRecordRoute === "function") {
        route = NKPatientsData.getRecordRoute(recordType) || route;
      }
      return "../Patient list/" + route + "?patient=" + encodeURIComponent(patientCode) + "&record=" + encodeURIComponent(row && row.recordId || "");
    }

    function getLatestRecord(patientCode, records) {
      if (!patientCode) return null;
      var rows = Array.isArray(records) ? records : [];
      if (!rows.length) return null;
      var latest = rows[0];
      return {
        href: recordHref(patientCode, latest),
        label: String(latest.recordType || "").toLowerCase() === "session" ? "Open latest session record" : "Open latest visit record"
      };
    }

    function deriveServiceType(entry, orderRecord) {
      var chunks = [];
      if (orderRecord && Array.isArray(orderRecord.services)) {
        orderRecord.services.forEach(function (row) {
          chunks.push(String(row.name || ""));
          chunks.push(String(row.qty || ""));
        });
      }
      chunks.push(String(entry.cancelType || ""));
      var bag = chunks.join(" ").toLowerCase();
      if (bag.indexOf("home") !== -1 || bag.indexOf("visit") !== -1) return "Home Visit";
      if (bag.indexOf("session") !== -1) return "Session";
      return entry.sourceType === "individual" ? "Individual Service" : "Facility Service";
    }

    function resolveContext() {
      currentOrderRecord = getOrderRecord(current);
      resolvedPatientCode = resolvePatientCode(current, currentOrderRecord);
      resolvedPatientRecords = getPatientRecords(resolvedPatientCode);
    }

    function renderHead() {
      document.getElementById("rdId").textContent = "#" + current.id;
      document.getElementById("chipType").textContent = cancelTypeLabel(current.cancelType);

      var chipStatus = document.getElementById("chipStatus");
      chipStatus.className = "status-badge " + statusClass(current.computedReturnStatus);
      chipStatus.textContent = current.computedReturnStatus;

      var chipRefund = document.getElementById("chipRefund");
      chipRefund.className = "status-badge " + refundClass(current.computedRefundStatus);
      chipRefund.textContent = current.computedRefundStatus;
    }

    function renderSummary() {
      document.getElementById("fOrderId").textContent = current.orderNo || "-";
      document.getElementById("fPurchaseDate").textContent = current.providerName || "-";
      document.getElementById("fReturnDate").textContent = NKServiceReturns.formatDate(current.returnDate);
      document.getElementById("fCustomer").textContent = current.patientName || "-";
      document.getElementById("fPhone").textContent = resolvedPatientCode || current.patientCode || "-";
      document.getElementById("fAddress").textContent = current.city || "-";
      document.getElementById("fMap").textContent = cancelTypeLabel(current.cancelType);
      document.getElementById("fMap").setAttribute("href", "#");

      var cancelDetails = cancelStatusLabel(current.cancelStatus) + " by " + cancelSourceLabel(current.cancelSource);
      if (current.cancelNote) cancelDetails += " - " + current.cancelNote;
      document.getElementById("fTracking").textContent = cancelDetails;

      if (orderLink) orderLink.href = orderDetailsHref(current);

      if (resolvedPatientCode) {
        setAnchorState(
          patientProfileBtn,
          true,
          "../Patient list/patient-profile.html?patient=" + encodeURIComponent(resolvedPatientCode),
          "Open patient profile"
        );
      } else {
        setAnchorState(patientProfileBtn, false, "#", "Patient code is not available for this return");
      }

      var latestRecord = getLatestRecord(resolvedPatientCode, resolvedPatientRecords);
      if (latestRecord) {
        setAnchorState(latestRecordBtn, true, latestRecord.href, latestRecord.label);
      } else if (!resolvedPatientCode) {
        setAnchorState(latestRecordBtn, false, "#", "Patient code is not available for this return");
      } else {
        setAnchorState(latestRecordBtn, false, "#", "No session/visit records found");
      }

      current.refundMethod = NKServiceReturns.normalizeRefundMethod(current.refundMethod);
      document.getElementById("sumSubtotal").textContent = NKServiceReturns.formatMoney(current.computedSubtotal || 0);
      var sumShippingAdj = document.getElementById("sumShippingAdj");
      if (sumShippingAdj) {
        sumShippingAdj.textContent = NKServiceReturns.formatMoney(current.shippingAdjustment || 0);
      }
      document.getElementById("sumFinal").textContent = NKServiceReturns.formatMoney(current.computedFinalRefund || 0);
      feesInput.value = Number(current.fees || 0).toFixed(2);
      refundMethodSelect.value = current.refundMethod;
      if (orderOverrideSelect) {
        orderOverrideSelect.value = current.orderDecisionOverride || "none";
      }

      if (decisionBadge) {
        decisionBadge.className = "status-badge " + statusClass(current.computedReturnStatus);
        decisionBadge.textContent = current.computedReturnStatus;
      }

      var sumRefundBadge = document.getElementById("sumRefundBadge");
      sumRefundBadge.className = "status-badge " + refundClass(current.computedRefundStatus);
      sumRefundBadge.textContent = current.computedRefundStatus;

      var locked = isReleased();
      feesInput.disabled = locked;
      refundMethodSelect.disabled = locked;
      if (orderOverrideSelect) {
        orderOverrideSelect.disabled = locked;
      }
      releaseBtn.disabled = !canRelease();
      successBox.classList.toggle("d-none", !locked);
    }

    function renderServiceDetails() {
      if (legacyReturnLines) legacyReturnLines.classList.add("d-none");

      var orderStatus = currentOrderRecord && currentOrderRecord.order ? currentOrderRecord.order.status : current.cancelStatus;
      setText("sdServiceType", deriveServiceType(current, currentOrderRecord));
      setText("sdScheduledAt", fmtDateTime(currentOrderRecord && currentOrderRecord.order ? currentOrderRecord.order.scheduledDate : ""));
      setText("sdOrderDate", fmtDateTime(currentOrderRecord && currentOrderRecord.order ? currentOrderRecord.order.orderDate : ""));
      setText("sdProvider", currentOrderRecord && currentOrderRecord.institutionName || current.providerName || "-");
      setText("sdServiceStatus", serviceStatusLabel(orderStatus));
      setText("sdPaymentMethod", currentOrderRecord && currentOrderRecord.order ? currentOrderRecord.order.paymentMethod : "-");
      setText("sdVisitType", deriveServiceType(current, currentOrderRecord));
      setText("sdPatientCity", currentOrderRecord && currentOrderRecord.patient ? currentOrderRecord.patient.city : current.city || "-");

      var lat = Number(currentOrderRecord && currentOrderRecord.patient ? currentOrderRecord.patient.mapLat : NaN);
      var lng = Number(currentOrderRecord && currentOrderRecord.patient ? currentOrderRecord.patient.mapLng : NaN);
      var hasCoords = Number.isFinite(lat) && Number.isFinite(lng);
      setText("sdCoordinates", hasCoords ? lat.toFixed(4) + ", " + lng.toFixed(4) : "-");

      if (hasCoords) {
        var mapHref = "https://www.google.com/maps?q=" + encodeURIComponent(lat + "," + lng);
        if (serviceMapFrame) serviceMapFrame.src = mapHref + "&z=13&output=embed";
        if (serviceMapWrap) serviceMapWrap.classList.remove("d-none");
        if (serviceMapEmpty) serviceMapEmpty.classList.add("d-none");
        setAnchorState(serviceMapLink, true, mapHref, "Open patient location on Google Maps");
      } else {
        if (serviceMapFrame) serviceMapFrame.src = "about:blank";
        if (serviceMapWrap) serviceMapWrap.classList.add("d-none");
        if (serviceMapEmpty) serviceMapEmpty.classList.remove("d-none");
        setAnchorState(serviceMapLink, false, "#", "Location coordinates are not available");
      }

      if (!serviceLinesTbody || !serviceLinesWrap || !serviceLinesEmpty) return;

      var rows = [];
      if (currentOrderRecord && Array.isArray(currentOrderRecord.services) && currentOrderRecord.services.length) {
        rows = currentOrderRecord.services.slice();
      } else {
        rows = (current.items || []).map(function (item) {
          return {
            name: item.name,
            qty: item.requestedReturnQty,
            status: item.lineDecision,
            providerName: current.providerName,
            phone: "-",
            email: "-",
            price: Number(item.unitPrice || 0)
          };
        });
      }

      serviceLinesTbody.innerHTML = "";
      if (!rows.length) {
        serviceLinesWrap.classList.add("d-none");
        serviceLinesEmpty.classList.remove("d-none");
        return;
      }

      serviceLinesWrap.classList.remove("d-none");
      serviceLinesEmpty.classList.add("d-none");

      rows.forEach(function (row) {
        var status = row.status || row.dispenseStatus || "pending";
        var qty = row.qty != null ? row.qty : row.requestedReturnQty != null ? row.requestedReturnQty : "-";
        var providerName = row.providerName || current.providerName || "-";
        var phone = row.phone || "-";
        var email = row.email || "-";
        var price = Number(row.price != null ? row.price : row.unitPrice != null ? row.unitPrice : 0);
        var tr = document.createElement("tr");
        tr.innerHTML = [
          "<td>" + esc(row.name || "-") + "</td>",
          "<td>" + esc(qty) + "</td>",
          '<td><span class="service-status-pill ' + serviceStatusClass(status) + '">' + esc(serviceStatusLabel(status)) + "</span></td>",
          "<td>" + esc(providerName) + "</td>",
          "<td>" + esc(phone) + "</td>",
          "<td>" + esc(email) + "</td>",
          '<td class="text-end"><strong>' + NKServiceReturns.formatMoney(price) + "</strong></td>"
        ].join("");
        serviceLinesTbody.appendChild(tr);
      });
    }

    function renderRecordLines() {
      if (!recordLinesTbody || !recordLinesWrap || !recordLinesEmpty) return;
      recordLinesTbody.innerHTML = "";

      if (!resolvedPatientCode || !resolvedPatientRecords.length) {
        recordLinesWrap.classList.add("d-none");
        recordLinesEmpty.classList.remove("d-none");
        return;
      }

      recordLinesWrap.classList.remove("d-none");
      recordLinesEmpty.classList.add("d-none");

      resolvedPatientRecords.slice(0, 8).forEach(function (row) {
        var href = recordHref(resolvedPatientCode, row);
        var tr = document.createElement("tr");
        tr.innerHTML = [
          "<td>" + esc(row.recordId || "-") + "</td>",
          '<td><span class="record-type-pill ' + recordTypeClass(row.recordType) + '">' + esc(recordTypeLabel(row.recordType)) + "</span></td>",
          "<td>" + esc(row.providerName || "-") + "</td>",
          "<td>" + esc(fmtDateTime(row.visitDate)) + "</td>",
          '<td class="text-end"><a class="link-inline" href="' + esc(href) + '">Open</a></td>'
        ].join("");
        recordLinesTbody.appendChild(tr);
      });
    }

    function renderDecisionFilters() {
      if (!decisionFilterBar) return;
      var counts = current.computedDecisionCounts || { total: 0, approved: 0, rejected: 0, pending: 0 };
      document.getElementById("filterAllCount").textContent = "(" + Number(counts.total || 0) + ")";
      document.getElementById("filterApprovedCount").textContent = "(" + Number(counts.approved || 0) + ")";
      document.getElementById("filterRejectedCount").textContent = "(" + Number(counts.rejected || 0) + ")";
      document.getElementById("filterPendingCount").textContent = "(" + Number(counts.pending || 0) + ")";

      decisionFilterBar.querySelectorAll("[data-filter]").forEach(function (chip) {
        chip.classList.toggle("is-active", chip.getAttribute("data-filter") === activeLineFilter);
      });
    }

    function matchesFilter(item, queryText) {
      var decision = normalizeDecision(item.lineDecision);
      if (activeLineFilter !== "all" && decision !== activeLineFilter) return false;
      if (!queryText) return true;
      var bag = (item.name + " " + item.mainService + " " + item.reason).toLowerCase();
      return bag.indexOf(queryText) !== -1;
    }

    function renderItems() {
      var locked = isReleased();
      var q = String(itemSearch.value || "").trim().toLowerCase();
      var rows = (current.items || []).filter(function (item) {
        return matchesFilter(item, q);
      });

      itemsTbody.innerHTML = "";
      if (!rows.length) {
        itemsWrap.classList.add("d-none");
        itemsEmpty.classList.remove("d-none");
        return;
      }

      itemsWrap.classList.remove("d-none");
      itemsEmpty.classList.add("d-none");

      rows.forEach(function (item) {
        var idx = current.items.indexOf(item);
        var approvedQtyText = item.approvedQty === null || item.approvedQty === undefined ? "" : String(item.approvedQty);
        var lineTotal = Number(item.approvedQty || 0) * Number(item.unitPrice || 0);
        var tr = document.createElement("tr");
        tr.innerHTML = [
          "<td>" + esc(item.name || "-") + "</td>",
          "<td>" + esc(item.mainService || "-") + "</td>",
          '<td class="text-center">' + Number(item.requestedReturnQty || 0) + "</td>",
          '<td><input class="form-control qty-input approved-qty" data-idx="' + idx + '" type="number" min="0" step="1" value="' + esc(approvedQtyText) + '" ' + (locked ? "disabled" : "") + " /></td>",
          "<td>" + NKServiceReturns.formatMoney(item.unitPrice || 0) + "</td>",
          '<td class="line-total">' + NKServiceReturns.formatMoney(lineTotal) + "</td>",
          "<td>" + esc(item.reason || "-") + "</td>",
          '<td><select class="form-control line-decision" data-idx="' + idx + '" ' + (locked ? "disabled" : "") + ">" +
            '<option value="pending"' + (item.lineDecision === "pending" ? " selected" : "") + ">Pending</option>" +
            '<option value="approved"' + (item.lineDecision === "approved" ? " selected" : "") + ">Approved</option>" +
            '<option value="rejected"' + (item.lineDecision === "rejected" ? " selected" : "") + ">Rejected</option>" +
          "</select></td>"
        ].join("");
        itemsTbody.appendChild(tr);
      });
    }

    function rerender() {
      persist();
      resolveContext();
      renderHead();
      renderSummary();
      renderServiceDetails();
      renderRecordLines();
      renderDecisionFilters();
      renderItems();
    }

    function updateQty(index, rawValue) {
      if (isReleased()) return;
      var item = current.items[index];
      if (!item) return;

      current.orderDecisionOverride = "none";
      if (rawValue === "") {
        item.approvedQty = null;
        item.lineDecision = "pending";
        return;
      }

      var value = Number(rawValue);
      if (!Number.isFinite(value)) value = 0;
      value = Math.floor(value);
      if (value < 0) value = 0;
      if (value > item.requestedReturnQty) value = item.requestedReturnQty;

      item.approvedQty = value;
      item.lineDecision = value > 0 ? "approved" : "rejected";
    }

    function updateDecision(index, value) {
      if (isReleased()) return;
      var item = current.items[index];
      if (!item) return;

      current.orderDecisionOverride = "none";
      if (value === "approved") {
        var qty = Number(item.approvedQty || 0);
        if (qty <= 0) qty = item.requestedReturnQty || 1;
        if (qty > item.requestedReturnQty) qty = item.requestedReturnQty;
        item.approvedQty = qty;
        item.lineDecision = "approved";
        return;
      }

      if (value === "rejected") {
        item.approvedQty = 0;
        item.lineDecision = "rejected";
        return;
      }

      item.approvedQty = null;
      item.lineDecision = "pending";
    }

    function applyOverride(value) {
      if (isReleased()) return;
      current.orderDecisionOverride = value;

      if (value === "approved") {
        current.items.forEach(function (item) {
          item.approvedQty = item.requestedReturnQty;
          item.lineDecision = "approved";
        });
      } else if (value === "rejected") {
        current.items.forEach(function (item) {
          item.approvedQty = 0;
          item.lineDecision = "rejected";
        });
      }
    }

    syncCurrentFromStore();
    if (!current) {
      updateBackLinks(requestedType || "facility");
      if (emptyState) emptyState.classList.remove("d-none");
      return;
    }

    updateBackLinks(current.sourceType);
    resolveContext();
    detailsContent.classList.remove("d-none");

    if (itemSearch) {
      itemSearch.addEventListener("input", function () {
        renderItems();
      });
    }

    if (decisionFilterBar) {
      decisionFilterBar.addEventListener("click", function (event) {
        var target = event.target;
        if (!(target instanceof HTMLElement)) return;
        var chip = target.closest("[data-filter]");
        if (!chip) return;
        activeLineFilter = chip.getAttribute("data-filter") || "all";
        renderDecisionFilters();
        renderItems();
      });
    }

    if (itemsTbody) {
      itemsTbody.addEventListener("change", function (event) {
        var target = event.target;
        if (!(target instanceof HTMLElement)) return;

        if (target.classList.contains("approved-qty")) {
          updateQty(Number(target.getAttribute("data-idx")), target.value);
          showAlert("", "");
          rerender();
          return;
        }

        if (target.classList.contains("line-decision")) {
          updateDecision(Number(target.getAttribute("data-idx")), target.value);
          showAlert("", "");
          rerender();
        }
      });
    }

    if (orderOverrideSelect) {
      orderOverrideSelect.addEventListener("change", function () {
        applyOverride(orderOverrideSelect.value);
        showAlert("", "");
        rerender();
      });
    }

    if (feesInput) {
      feesInput.addEventListener("change", function () {
        if (isReleased()) return;
        current.fees = Number(feesInput.value || 0);
        showAlert("", "");
        rerender();
      });
    }

    if (refundMethodSelect) {
      refundMethodSelect.addEventListener("change", function () {
        if (isReleased()) return;
        current.refundMethod = NKServiceReturns.normalizeRefundMethod(refundMethodSelect.value);
        showAlert("", "");
        rerender();
      });
    }

    if (releaseBtn) {
      releaseBtn.addEventListener("click", function () {
        if (!canRelease() || !releaseModal) return;

        document.getElementById("mReturnId").textContent = current.id;
        document.getElementById("mOrderId").textContent = current.orderNo;
        document.getElementById("mAmount").textContent = NKServiceReturns.formatMoney(current.computedFinalRefund || 0);
        document.getElementById("mRefundMethod").textContent = refundMethodLabel(current.refundMethod);
        document.getElementById("mApprovedCount").textContent = String(current.approvedItemsCount || 0);
        releaseModal.show();
      });
    }

    document.getElementById("confirmReleaseBtn").addEventListener("click", function () {
      var result = NKServiceReturns.release(current.id);
      if (!result || !result.ok) {
        showAlert("error", "This return is not ready for release.");
        if (releaseModal) releaseModal.hide();
        return;
      }
      syncCurrentFromStore();
      showAlert("ok", "Refund released and return is now locked.");
      resolveContext();
      renderHead();
      renderSummary();
      renderServiceDetails();
      renderRecordLines();
      renderDecisionFilters();
      renderItems();
      if (releaseModal) releaseModal.hide();
    });

    resolveContext();
    renderHead();
    renderSummary();
    renderServiceDetails();
    renderRecordLines();
    renderDecisionFilters();
    renderItems();
  });
})();
