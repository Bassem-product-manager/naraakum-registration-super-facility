(function () {
  function qs(name) {
    var url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function safe(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(value) {
    if (!value) return "-";
    var dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleDateString("en-GB");
  }

  function formatDateTime(value) {
    if (!value) return "-";
    var dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "-";
    return dt.toLocaleDateString("en-GB") + " " + dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  }

  function buildOrderDetailsHref(claim) {
    var providerType = (claim && claim.providerType || "").toString().trim().toLowerCase();
    var itemType = (claim && claim.itemType || "").toString().trim().toLowerCase();
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
      encodeURIComponent(claim.orderNo || "") +
      "&providerType=" +
      encodeURIComponent(mode) +
      "&from=insurance-invoices"
    );
  }

  function readAmountPrompt(title, initialValue) {
    var raw = prompt(title, String(initialValue));
    if (raw == null) return null;
    var n = Number(raw);
    if (!Number.isFinite(n) || n < 0) return { error: "Invalid amount value" };
    return { value: n };
  }

  document.addEventListener("DOMContentLoaded", function () {
    var dataApi = window.NKPaymentData;
    if (!dataApi || typeof dataApi.getInsuranceClaimBundle !== "function") return;

    var state = {
      claimId: (qs("claim") || "").toString().trim().toUpperCase(),
      activeDocType: "claim",
      bundle: null
    };

    var els = {
      crumbClaim: document.getElementById("crumbClaim"),
      sumClaimNo: document.getElementById("sumClaimNo"),
      sumInsuranceName: document.getElementById("sumInsuranceName"),
      sumPolicyNo: document.getElementById("sumPolicyNo"),
      sumLifecycle: document.getElementById("sumLifecycle"),
      sumRemittance: document.getElementById("sumRemittance"),
      sumOrderNo: document.getElementById("sumOrderNo"),
      sumTransactionNo: document.getElementById("sumTransactionNo"),
      sumProvider: document.getElementById("sumProvider"),
      sumPatient: document.getElementById("sumPatient"),
      sumClaimAmount: document.getElementById("sumClaimAmount"),
      sumApprovedAmount: document.getElementById("sumApprovedAmount"),
      sumPaidAmount: document.getElementById("sumPaidAmount"),
      sumOutstanding: document.getElementById("sumOutstanding"),
      btnBackToList: document.getElementById("btnBackToList"),
      btnOpenOrder: document.getElementById("btnOpenOrder"),
      docTabs: document.getElementById("docTabs"),
      docPanel: document.getElementById("docPanel"),
      manualDocType: document.getElementById("manualDocType"),
      manualInvoiceNo: document.getElementById("manualInvoiceNo"),
      manualAmount: document.getElementById("manualAmount"),
      manualDocFile: document.getElementById("manualDocFile"),
      manualNote: document.getElementById("manualNote"),
      btnSaveManualDoc: document.getElementById("btnSaveManualDoc"),
      manualDocsBody: document.getElementById("manualDocsBody"),
      transitionList: document.getElementById("transitionList"),
      statusFlash: document.getElementById("statusFlash"),
      timeline: document.getElementById("claimTimeline")
    };

    function setFlash(text, ok) {
      if (!els.statusFlash) return;
      els.statusFlash.className = "flash-msg " + (ok ? "ok" : "err");
      els.statusFlash.textContent = text || "";
    }

    function docLabel(doc) {
      if (doc.docType === "insurance_invoice") return "Insurance Invoice";
      if (doc.docType === "remittance_credit") return "Remittance / Credit";
      return "Claim";
    }

    function normalizeDocType(value) {
      var v = (value || "").toString().trim().toLowerCase();
      if (v === "claim" || v === "insurance_invoice" || v === "remittance_credit") return v;
      return "claim";
    }

    function renderSummary(claim) {
      if (!claim) return;

      var lifecycle = dataApi.insuranceStatusLabel ? dataApi.insuranceStatusLabel(claim.lifecycleStatus) : claim.lifecycleStatus;
      var remittance = dataApi.insuranceRemittanceLabel ? dataApi.insuranceRemittanceLabel(claim.remittanceStatus) : claim.remittanceStatus;

      if (els.crumbClaim) els.crumbClaim.textContent = claim.claimId;
      if (els.sumClaimNo) els.sumClaimNo.textContent = claim.claimId;
      if (els.sumInsuranceName) els.sumInsuranceName.textContent = claim.insuranceName + " (" + claim.insuranceCode + ")";
      if (els.sumPolicyNo) els.sumPolicyNo.textContent = "Policy: " + (claim.policyNo || "-");
      if (els.sumLifecycle) els.sumLifecycle.textContent = "Lifecycle: " + lifecycle;
      if (els.sumRemittance) els.sumRemittance.textContent = "Remittance: " + remittance;
      if (els.sumOrderNo) els.sumOrderNo.textContent = claim.orderNo || "-";
      if (els.sumTransactionNo) els.sumTransactionNo.textContent = claim.transactionNo || "-";
      if (els.sumProvider) els.sumProvider.textContent = (claim.providerName || "-") + " (" + (claim.providerCode || "-") + ")";
      if (els.sumPatient) els.sumPatient.textContent = claim.patientName || "-";
      if (els.sumClaimAmount) els.sumClaimAmount.textContent = dataApi.formatMoney(claim.claimAmount || 0);
      if (els.sumApprovedAmount) els.sumApprovedAmount.textContent = dataApi.formatMoney(claim.approvedAmount || 0);
      if (els.sumPaidAmount) els.sumPaidAmount.textContent = dataApi.formatMoney(claim.paidAmount || 0);
      if (els.sumOutstanding) els.sumOutstanding.textContent = dataApi.formatMoney(claim.outstandingAmount || 0);

      if (els.btnOpenOrder) els.btnOpenOrder.href = buildOrderDetailsHref(claim);
      if (els.btnBackToList) {
        els.btnBackToList.href = "insurance-invoices.html?insuranceCode=" + encodeURIComponent(claim.insuranceCode || "");
      }
    }

    function renderDocPanel(doc) {
      if (!els.docPanel) return;
      if (!doc) {
        els.docPanel.innerHTML = '<div class="text-grey fsize-13">No document available for this state.</div>';
        return;
      }

      var html = [
        '<div class="title">' + safe(docLabel(doc)) + "</div>",
        '<div class="muted mt-4">Document No: <b>' + safe(doc.docNo || "-") + "</b></div>",
        '<div class="muted mt-4">Manual uploads for this type: <b>' + String(Number(doc.manualCount || 0)) + "</b></div>",
        '<div class="doc-preview-grid">',
        '  <div class="summary-item"><div class="label">Issue Date</div><div class="value">' + safe(formatDate(doc.issueDate)) + "</div></div>",
        '  <div class="summary-item"><div class="label">Status</div><div class="value">' + safe(doc.status || "-") + "</div></div>",
        '  <div class="summary-item"><div class="label">Amount</div><div class="value">' + safe(dataApi.formatMoney(doc.amount || 0)) + "</div></div>",
        '  <div class="summary-item"><div class="label">Description</div><div class="value">' + safe(doc.note || "-") + "</div></div>",
        "</div>"
      ].join("");
      els.docPanel.innerHTML = html;
    }

    function renderDocTabs(bundle) {
      if (!els.docTabs) return;
      var docs = (bundle && bundle.documents) || [];
      if (!docs.length) {
        els.docTabs.innerHTML = "";
        renderDocPanel(null);
        return;
      }

      var available = docs.map(function (doc) { return doc.docType; });
      if (available.indexOf(state.activeDocType) === -1) {
        state.activeDocType = docs[0].docType;
      }

      els.docTabs.innerHTML = "";
      docs.forEach(function (doc) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "doc-tab-btn" + (doc.docType === state.activeDocType ? " active" : "");
        btn.textContent = docLabel(doc);
        btn.addEventListener("click", function () {
          state.activeDocType = normalizeDocType(doc.docType);
          renderDocTabs(bundle);
        });
        els.docTabs.appendChild(btn);
      });

      var selected = null;
      for (var i = 0; i < docs.length; i += 1) {
        if (docs[i].docType === state.activeDocType) {
          selected = docs[i];
          break;
        }
      }
      renderDocPanel(selected || docs[0]);
      if (els.manualDocType) els.manualDocType.value = state.activeDocType;
    }

    function renderManualDocs(bundle) {
      if (!els.manualDocsBody) return;
      var rows = (bundle && bundle.manualDocs) || [];
      if (!rows.length) {
        els.manualDocsBody.innerHTML = '<tr><td colspan="6" class="text-center text-grey">No manual uploads yet.</td></tr>';
        return;
      }

      els.manualDocsBody.innerHTML = rows
        .map(function (row) {
          return [
            "<tr>",
            "<td>" + safe(docLabel({ docType: row.docType })) + "</td>",
            "<td>" + safe(row.fileName || "-") + "</td>",
            "<td>" + safe(row.invoiceNo || "-") + "</td>",
            "<td>" + safe(dataApi.formatMoney(row.amount || 0)) + "</td>",
            "<td>" + safe(formatDateTime(row.uploadedAt)) + "</td>",
            '<td class="text-center"><button type="button" class="btn btn-primary-revers btn-32 js-del-manual" data-doc-id="' + safe(row.id) + '"><i class="fi fi-rr-trash"></i></button></td>',
            "</tr>"
          ].join("");
        })
        .join("");
    }

    function saveManualDoc() {
      var bundle = state.bundle;
      if (!bundle || !bundle.claim) return;
      var docType = els.manualDocType ? els.manualDocType.value : state.activeDocType;
      var invoiceNo = els.manualInvoiceNo ? els.manualInvoiceNo.value : "";
      var amountRaw = els.manualAmount ? els.manualAmount.value : "";
      var note = els.manualNote ? els.manualNote.value : "";
      var fileName = "";

      if (els.manualDocFile && els.manualDocFile.files && els.manualDocFile.files[0]) {
        fileName = els.manualDocFile.files[0].name || "";
      }

      if (!fileName) {
        setFlash("Please choose a file for manual upload.", false);
        return;
      }

      var payload = {
        docType: docType,
        invoiceNo: invoiceNo,
        amount: amountRaw ? Number(amountRaw) : 0,
        fileName: fileName,
        note: note
      };

      var res = dataApi.saveInsuranceManualDoc(bundle.claim.claimId, payload);
      if (!res || !res.ok) {
        setFlash((res && res.message) || "Unable to save manual upload.", false);
        return;
      }

      if (els.manualInvoiceNo) els.manualInvoiceNo.value = "";
      if (els.manualAmount) els.manualAmount.value = "";
      if (els.manualNote) els.manualNote.value = "";
      if (els.manualDocFile) els.manualDocFile.value = "";

      state.activeDocType = docType;
      state.bundle = dataApi.getInsuranceClaimBundle(bundle.claim.claimId);
      renderAll();
      setFlash("Manual upload saved.", true);
    }

    function bindManualDelete() {
      if (!els.manualDocsBody) return;
      Array.prototype.slice.call(els.manualDocsBody.querySelectorAll(".js-del-manual")).forEach(function (btn) {
        btn.addEventListener("click", function () {
          var bundle = state.bundle;
          if (!bundle || !bundle.claim) return;
          var docId = btn.getAttribute("data-doc-id") || "";
          if (!docId) return;
          var ok = confirm("Delete this manual upload?");
          if (!ok) return;
          var res = dataApi.removeInsuranceManualDoc(bundle.claim.claimId, docId);
          if (!res || !res.ok) {
            setFlash((res && res.message) || "Unable to delete upload.", false);
            return;
          }
          state.bundle = dataApi.getInsuranceClaimBundle(bundle.claim.claimId);
          renderAll();
          setFlash("Manual upload deleted.", true);
        });
      });
    }

    function renderTimeline(bundle) {
      if (!els.timeline) return;
      var rows = (bundle && bundle.timeline) || [];
      if (!rows.length) {
        els.timeline.innerHTML = '<li class="timeline-item"><div class="meta">No timeline records found.</div></li>';
        return;
      }

      els.timeline.innerHTML = rows
        .map(function (item) {
          var statusLabel = dataApi.insuranceStatusLabel ? dataApi.insuranceStatusLabel(item.status) : item.status;
          return [
            '<li class="timeline-item">',
            '  <div class="head">',
            '    <span class="status">' + safe(statusLabel) + "</span>",
            '    <span class="meta">' + safe(formatDateTime(item.at)) + "</span>",
            "  </div>",
            '  <div class="meta mt-4">Actor: ' + safe(item.actor || "-") + "</div>",
            item.note ? '<div class="meta mt-4">' + safe(item.note) + "</div>" : "",
            "</li>"
          ].join("");
        })
        .join("");
    }

    function applyTransition(nextStatus) {
      var bundle = state.bundle;
      if (!bundle || !bundle.claim) return;

      var payload = {};
      var next = (nextStatus || "").toString().trim().toLowerCase();

      if (next === "approved") {
        var approvedRes = readAmountPrompt("Approved amount", bundle.claim.approvedAmount > 0 ? bundle.claim.approvedAmount : bundle.claim.claimAmount);
        if (approvedRes == null) return;
        if (approvedRes.error) return setFlash(approvedRes.error, false);
        payload.approvedAmount = approvedRes.value;
      } else if (next === "partially_paid") {
        var partialRes = readAmountPrompt("Paid amount (partial)", bundle.claim.approvedAmount > 0 ? bundle.claim.approvedAmount * 0.5 : bundle.claim.claimAmount * 0.5);
        if (partialRes == null) return;
        if (partialRes.error) return setFlash(partialRes.error, false);
        payload.paidAmount = partialRes.value;
      } else if (next === "denied") {
        var code = prompt("Denial code", bundle.claim.denialCode || "DENIAL");
        if (code == null) return;
        var reason = prompt("Denial reason", bundle.claim.denialReason || "Claim denied by payer review.");
        if (reason == null) return;
        payload.denialCode = String(code || "DENIAL").trim().toUpperCase();
        payload.denialReason = String(reason || "").trim();
      } else if (next === "appealed") {
        var appealReason = prompt("Appeal note", "Appeal submitted by claims team.");
        if (appealReason == null) return;
        payload.denialReason = String(appealReason || "").trim();
      }

      var note = prompt("Internal note (optional)", "");
      if (note != null) payload.note = String(note || "").trim();

      var res = dataApi.updateInsuranceClaimStatus(bundle.claim.claimId, next, payload);
      if (!res || !res.ok) {
        setFlash((res && res.message) || "Unable to update claim status.", false);
        return;
      }
      setFlash("Claim status updated to " + (dataApi.insuranceStatusLabel ? dataApi.insuranceStatusLabel(next) : next) + ".", true);
      state.bundle = res.bundle || dataApi.getInsuranceClaimBundle(bundle.claim.claimId);
      renderAll();
    }

    function renderTransitions(bundle) {
      if (!els.transitionList) return;
      var options = (bundle && bundle.allowedTransitions) || [];
      if (!options.length) {
        els.transitionList.innerHTML = '<span class="text-grey fsize-12">No further transitions available.</span>';
        return;
      }
      els.transitionList.innerHTML = "";
      options.forEach(function (status) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn btn-primary-revers btn-32";
        btn.textContent = dataApi.insuranceStatusLabel ? dataApi.insuranceStatusLabel(status) : status;
        btn.addEventListener("click", function () {
          applyTransition(status);
        });
        els.transitionList.appendChild(btn);
      });
    }

    function renderAll() {
      var bundle = state.bundle;
      if (!bundle || !bundle.claim) return;
      renderSummary(bundle.claim);
      renderDocTabs(bundle);
      renderManualDocs(bundle);
      bindManualDelete();
      renderTimeline(bundle);
      renderTransitions(bundle);
    }

    function initClaimId() {
      if (state.claimId) return;
      var rows = dataApi.getInsuranceClaims({});
      if (!rows.length) return;
      state.claimId = rows[0].claimId;
      var url = new URL(window.location.href);
      url.searchParams.set("claim", state.claimId);
      window.history.replaceState({}, "", url.toString());
    }

    initClaimId();
    if (!state.claimId) {
      setFlash("No claim available.", false);
      return;
    }

    state.bundle = dataApi.getInsuranceClaimBundle(state.claimId);
    if (!state.bundle || !state.bundle.claim) {
      setFlash("Claim not found.", false);
      return;
    }
    state.activeDocType = ((state.bundle.documents || [])[0] || {}).docType || "claim";
    if (els.btnSaveManualDoc) els.btnSaveManualDoc.addEventListener("click", saveManualDoc);
    renderAll();
  });
})();
