(function () {
  "use strict";

  var store = window.NKShippingCompaniesStore;
  if (!store) return;
  var apiStore = window.NKApiIntegrationsStore || null;

  store.ensureSeedData();
  if (apiStore && typeof apiStore.ensureSeedData === "function") apiStore.ensureSeedData();

  var missingState = document.getElementById("shippingMissingState");
  var content = document.getElementById("shippingDetailsContent");

  var params = new URLSearchParams(window.location.search);
  var codeParam = (params.get("code") || "").toUpperCase();
  var codeFallback = (sessionStorage.getItem("lastShippingCode") || "").toUpperCase();
  var companyCode = codeParam || codeFallback;

  if (!companyCode) {
    if (missingState) missingState.classList.remove("d-none");
    return;
  }

  var company = store.getByCode(companyCode);
  if (!company) {
    if (missingState) missingState.classList.remove("d-none");
    return;
  }

  if (content) content.classList.remove("d-none");
  sessionStorage.setItem("lastShippingCode", company.code);

  var tabButtons = Array.prototype.slice.call(document.querySelectorAll(".tab-btn[data-tab-target]"));
  var tabPanels = Array.prototype.slice.call(document.querySelectorAll(".nk-tab-panel[data-tab-id], .tab-panel[data-tab-id]"));

  var docsTableBody = document.getElementById("documentsTableBody");
  var docsMsg = document.getElementById("documentsInlineMsg");

  var integrationToggle = document.getElementById("companyIntegrationToggle");
  var integrationMsg = document.getElementById("integrationInlineMsg");
  var webhookMsg = document.getElementById("webhookInlineMsg");
  var credentialsList = document.getElementById("credentialsList");
  var btnTestWebhook = document.getElementById("btnTestWebhook");
  var btnDownloadIntegrationLogs = document.getElementById("btnDownloadIntegrationLogs");

  var decisionMsg = document.getElementById("decisionInlineMsg");
  var btnApprove = document.getElementById("btnApprove");
  var btnReject = document.getElementById("btnReject");
  var btnSuspend = document.getElementById("btnSuspend");
  var btnBan = document.getElementById("btnBan");

  var docModalEl = document.getElementById("docPreviewModal");
  var docModalTitle = document.getElementById("docPreviewTitle");
  var docModalBody = document.getElementById("docPreviewBody");

  function norm(value) {
    return String(value == null ? "" : value).trim().toLowerCase();
  }

  function escHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function titleCase(value) {
    var text = String(value == null ? "" : value).trim();
    if (!text) return "-";
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function formatDate(value) {
    var raw = String(value == null ? "" : value).trim();
    if (!raw) return "-";
    var normalized = raw.indexOf("T") > -1 ? raw : raw.replace(" ", "T");
    var date = new Date(normalized);
    if (Number.isNaN(date.getTime())) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        var parts = raw.split("-");
        return parts[2] + "/" + parts[1] + "/" + parts[0];
      }
      return raw;
    }
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function formatDateTime(value) {
    var raw = String(value == null ? "" : value).trim();
    if (!raw) return "-";
    var date = new Date(raw.indexOf("T") > -1 ? raw : raw.replace(" ", "T"));
    if (Number.isNaN(date.getTime())) return raw;
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  }

  function companyStatusKey(status) {
    if (store && typeof store.normalizeCompanyStatus === "function") return store.normalizeCompanyStatus(status);
    var key = norm(status).replace(/[_\s]+/g, "-");
    if (key === "approved" || key === "rejected" || key === "suspended" || key === "banned" || key === "needs-info") return key;
    return "pending";
  }

  function companyStatusLabel(status) {
    var key = companyStatusKey(status);
    if (key === "approved") return "Approved";
    if (key === "rejected") return "Rejected";
    if (key === "suspended") return "Suspended";
    if (key === "banned") return "Banned";
    if (key === "needs-info") return "Needs Info";
    return "Pending";
  }

  function companyStatusClass(status) {
    return companyStatusKey(status);
  }

  function decisionHint(status) {
    var key = companyStatusKey(status);
    if (key === "approved") return "This company is approved. You can suspend or ban if needed.";
    if (key === "rejected") return "This company was rejected. Decision actions are now read-only.";
    if (key === "suspended") return "This company is suspended. Decision actions are now read-only.";
    if (key === "banned") return "This company is banned. Decision actions are now read-only.";
    if (key === "needs-info") return "Company needs information. Approve or reject after re-check.";
    return "Company is pending review. Approve or reject the onboarding.";
  }

  function integrationStatusLabel(status) {
    var key = norm(status);
    if (key === "active") return "Active";
    if (key === "pending") return "Pending";
    if (key === "error") return "Error";
    return "Inactive";
  }

  function integrationStatusClass(status) {
    var key = norm(status);
    if (key === "active") return "active";
    if (key === "pending") return "pending";
    if (key === "error") return "error";
    return "inactive";
  }

  function documentStatusLabel(status) {
    var key = norm(status);
    if (key === "approved") return "Approved";
    if (key === "rejected") return "Rejected";
    if (key === "missing") return "Missing";
    return "Pending";
  }

  function documentStatusClass(status) {
    var key = norm(status);
    if (key === "approved") return "approved";
    if (key === "rejected") return "rejected";
    if (key === "missing") return "missing";
    return "pending";
  }

  function showInlineMsg(el, text, type) {
    if (!el) return;
    el.textContent = text || "";
    el.className = "inline-msg show " + (type || "info");
    window.clearTimeout(el.__hideTimer);
    el.__hideTimer = window.setTimeout(function () {
      el.className = "inline-msg info";
      el.textContent = "";
    }, 2800);
  }

  function getIntegrationProvider() {
    var integration = company.integration || {};
    var providerId = String(integration.providerId || "").toUpperCase();
    if (!providerId || !apiStore || typeof apiStore.getById !== "function") return null;
    return apiStore.getById(providerId);
  }

  function getDocumentRows() {
    var docs = company.documents || {};
    return [
      { key: "commercialRegistration", title: "Commercial Registration", model: docs.commercialRegistration || {} },
      { key: "ownerIdentity", title: "Owner Identity", model: docs.ownerIdentity || {} },
      { key: "bankAccountLetter", title: "Bank Account Letter", model: docs.bankAccountLetter || {} }
    ];
  }

  function isIntegrationLockedByDecision() {
    var status = companyStatusKey(company.status);
    return status === "suspended" || status === "banned";
  }

  function maskValue(value) {
    if (!value) return "-";
    var str = String(value);
    return "........" + str.slice(-4);
  }

  function csvEscape(value) {
    var txt = String(value == null ? "" : value).replace(/\r?\n/g, " ").trim();
    if (/[\",]/.test(txt)) return '"' + txt.replace(/\"/g, '""') + '"';
    return txt;
  }

  function getCredentialItems(provider) {
    if (!provider) return [];
    var out = [];
    var credentials = provider.credentials || {};
    var auth = String(provider.authMethod || "").trim();
    if (auth === "OAuth2") {
      out.push({ label: "Client ID", value: credentials.clientId || "" });
      out.push({ label: "Client Secret", value: credentials.clientSecret || "" });
      out.push({ label: "Access Token", value: credentials.token || "" });
    } else if (auth === "API Key") {
      out.push({ label: "API Key", value: credentials.apiKey || "" });
    } else if (auth === "Basic") {
      out.push({ label: "Username", value: credentials.username || "" });
      out.push({ label: "Password", value: credentials.password || "" });
    } else if (auth === "Token") {
      out.push({ label: "Token", value: credentials.token || "" });
    }
    return out.filter(function (item) {
      return !!item.value;
    });
  }

  function showTab(targetId) {
    tabButtons.forEach(function (btn) {
      var active = btn.getAttribute("data-tab-target") === targetId;
      btn.classList.toggle("is-active", active);
    });
    tabPanels.forEach(function (panel) {
      var active = panel.getAttribute("data-tab-id") === targetId;
      panel.classList.toggle("is-active", active);
      panel.classList.toggle("d-none", !active);
    });
  }

  function refreshCompany() {
    company = store.getByCode(company.code) || company;
  }

  function renderSummary() {
    var integration = company.integration || {};
    var progress = store.getDocumentProgress(company);
    var companyStatus = companyStatusKey(company.status);

    var summaryLogo = document.getElementById("summaryLogo");
    if (summaryLogo) {
      summaryLogo.src = company.logo || "../assets/images/logo.svg";
      summaryLogo.alt = company.name || "Shipping Company";
    }

    var summaryName = document.getElementById("summaryName");
    if (summaryName) summaryName.textContent = company.name || "Shipping Company";
    var summaryCode = document.getElementById("summaryCode");
    if (summaryCode) summaryCode.textContent = company.code || "-";
    var summaryEmail = document.getElementById("summaryEmail");
    if (summaryEmail) summaryEmail.textContent = company.email || "-";
    var summaryContact = document.getElementById("summaryContact");
    if (summaryContact) summaryContact.textContent = (company.contactName || "-") + " / " + (company.phone || "-");

    var summaryDocProgress = document.getElementById("summaryDocProgress");
    if (summaryDocProgress) summaryDocProgress.textContent = String(progress.approved) + "/" + String(progress.total) + " approved";

    var summaryIntegration = document.getElementById("summaryIntegrationStatusChip");
    if (summaryIntegration) summaryIntegration.innerHTML = '<i class="fi fi-rr-plug"></i><span>Integration: ' + escHtml(integrationStatusLabel(integration.status)) + "</span>";

    var summaryStatus = document.getElementById("summaryCompanyStatus");
    if (summaryStatus) {
      summaryStatus.className = "status-pill " + companyStatusClass(companyStatus);
      summaryStatus.textContent = companyStatusLabel(companyStatus);
    }
  }

  function renderOverview() {
    var integration = company.integration || {};
    var map = {
      ovCompanyCode: company.code,
      ovCompanyName: company.name,
      ovCity: company.city,
      ovEmail: company.email,
      ovContactName: company.contactName,
      ovPhone: company.phone,
      ovCompanyStatus: companyStatusLabel(company.status),
      ovIntegrationStatus: integrationStatusLabel(integration.status),
      ovIntegrationProvider: integration.providerId || integration.providerCode || "Not linked",
      ovDecisionUpdatedAt: formatDateTime(company.decisionUpdatedAt),
      ovUpdatedAt: formatDate(company.updatedAt)
    };
    Object.keys(map).forEach(function (id) {
      var node = document.getElementById(id);
      if (node) node.textContent = map[id] || "-";
    });
  }

  function renderDocuments() {
    if (!docsTableBody) return;

    var rows = getDocumentRows();
    docsTableBody.innerHTML = rows
      .map(function (row) {
        var model = row.model || {};
        var reason = model.rejectionReason ? '<div class="doc-reason">Reason: ' + escHtml(model.rejectionReason) + "</div>" : "";
        return (
          "<tr>" +
          "<td>" +
          escHtml(row.title) +
          "</td>" +
          "<td>" +
          escHtml(model.number || "-") +
          "</td>" +
          "<td>" +
          escHtml(model.fileName || "-") +
          "</td>" +
          "<td>" +
          escHtml(formatDate(model.updatedAt)) +
          "</td>" +
          '<td><span class="doc-pill ' +
          documentStatusClass(model.status) +
          '">' +
          documentStatusLabel(model.status) +
          "</span>" +
          reason +
          "</td>" +
          '<td class="text-end"><div class="doc-actions">' +
          '<button type="button" class="btn-mini view" data-doc-action="view" data-doc-key="' +
          escHtml(row.key) +
          '"><i class="fi fi-rr-eye"></i><span>View</span></button>' +
          '<button type="button" class="btn-mini warning" data-doc-action="reupload" data-doc-key="' +
          escHtml(row.key) +
          '"><i class="fi fi-rr-upload"></i><span>Re-upload</span></button>' +
          '<button type="button" class="btn-mini approve icon" data-doc-action="approve" data-doc-key="' +
          escHtml(row.key) +
          '" title="Approve"><i class="fi fi-rr-check"></i><span>Approve</span></button>' +
          '<button type="button" class="btn-mini danger icon" data-doc-action="reject" data-doc-key="' +
          escHtml(row.key) +
          '" title="Reject"><i class="fi fi-rr-cross-small"></i><span>Reject</span></button>' +
          "</div></td>" +
          "</tr>"
        );
      })
      .join("");

    var progress = store.getDocumentProgress(company);
    var docProgressChip = document.getElementById("documentsProgressChip");
    if (docProgressChip) docProgressChip.textContent = String(progress.approved) + "/" + String(progress.total) + " Approved";
  }

  function renderIntegration() {
    var integration = company.integration || {};
    var provider = getIntegrationProvider();
    var statusLabel = integrationStatusLabel(integration.status);
    var statusClass = integrationStatusClass(integration.status);
    var providerId = provider ? provider.id : String(integration.providerId || "").toUpperCase();
    var locked = isIntegrationLockedByDecision();

    var statusNode = document.getElementById("integrationStatusBadge");
    if (statusNode) {
      statusNode.className = "status-pill " + statusClass;
      statusNode.textContent = statusLabel;
    }

    var stateText = document.getElementById("integrationActiveStateText");
    if (stateText) {
      stateText.textContent = locked ? statusLabel + " (Locked)" : statusLabel;
      stateText.className = "state-text " + (norm(integration.status) === "active" ? "active" : "inactive");
    }

    if (integrationToggle) {
      integrationToggle.checked = norm(integration.status) === "active";
      integrationToggle.disabled = locked;
      integrationToggle.title = locked ? "Integration is locked for suspended or banned companies." : "";
    }

    var fields = {
      integrationProviderName: provider ? provider.name : "Provider not linked",
      integrationProviderCode: provider ? provider.code : integration.providerCode || "-",
      integrationType: provider ? provider.type : "Shipping",
      integrationEnvironment: provider ? provider.environment : titleCase(integration.environment),
      integrationStatusText: statusLabel,
      integrationLastSync: integration.lastSyncAt || "-",
      integrationFailureRate: integration.failureRate || "-",
      integrationBaseUrl: provider ? provider.baseUrl || "-" : "-",
      integrationNotes: provider ? provider.description || integration.notes || "-" : integration.notes || "No linked API provider description.",
      authMethodValue: provider ? provider.authMethod || "-" : "-",
      tokenExpiryValue: provider && provider.credentials && provider.credentials.tokenExpiry ? provider.credentials.tokenExpiry : "Not applicable",
      webhookUrlValue: provider ? provider.webhookUrl || "-" : "-"
    };
    Object.keys(fields).forEach(function (id) {
      var node = document.getElementById(id);
      if (node) node.textContent = fields[id];
    });

    var linkBtn = document.getElementById("btnReviewIntegration");
    if (linkBtn) {
      if (providerId) {
        linkBtn.classList.remove("d-none");
        linkBtn.setAttribute("href", "../Setting/api-details.html?id=" + encodeURIComponent(providerId));
      } else {
        linkBtn.classList.add("d-none");
        linkBtn.setAttribute("href", "#");
      }
    }

    if (credentialsList) {
      var creds = getCredentialItems(provider);
      credentialsList.innerHTML = creds.length
        ? creds
            .map(function (item, idx) {
              var real = String(item.value || "");
              var id = "shipCredValue" + String(idx);
              return (
                '<div class="credential-row"><div><div class="cred-label">' +
                escHtml(item.label) +
                '</div><div class="cred-value" data-real="' +
                escHtml(real) +
                '" data-open="0" id="' +
                id +
                '">' +
                escHtml(maskValue(real)) +
                '</div></div><button type="button" class="reveal-btn" data-target="' +
                id +
                '" aria-label="Reveal"><i class="fi fi-rr-eye"></i></button></div>'
              );
            })
            .join("")
        : '<div class="meta-box"><div class="value">No sensitive fields available for this auth method.</div></div>';
    }

    var ipsNode = document.getElementById("allowedIpsList");
    if (ipsNode) {
      var ips = provider && Array.isArray(provider.allowedIps) ? provider.allowedIps : [];
      ipsNode.innerHTML = ips.length
        ? ips
            .map(function (ip) {
              return "<li>" + escHtml(ip) + "</li>";
            })
            .join("")
        : "<li>No restrictions configured.</li>";
    }

    var capabilityList = document.getElementById("integrationCapabilities");
    if (capabilityList) {
      var capabilities = provider && Array.isArray(provider.capabilities) ? provider.capabilities : [];
      capabilityList.innerHTML = capabilities.length
        ? capabilities
            .map(function (cap) {
              return '<span class="cap-chip">' + escHtml(cap) + "</span>";
            })
            .join("")
        : '<span class="nk-muted">No capabilities available for this integration.</span>';
    }

    var eventsBody = document.getElementById("integrationEventsBody");
    if (eventsBody) {
      var events = provider && Array.isArray(provider.events) ? provider.events : [];
      eventsBody.innerHTML = events.length
        ? events
            .map(function (ev) {
              return "<tr><td>" + escHtml(ev.name || "-") + "</td><td><span class='" + (ev.enabled ? "badge-yes" : "badge-no") + "'>" + (ev.enabled ? "Enabled" : "Disabled") + "</span></td><td>" + escHtml(ev.notes || "-") + "</td></tr>";
            })
            .join("")
        : '<tr><td colspan="3" class="empty-row">No integration events available.</td></tr>';
    }

    var logsBody = document.getElementById("integrationLogsBody");
    if (logsBody) {
      var logs = provider && Array.isArray(provider.logs) ? provider.logs : [];
      logsBody.innerHTML = logs.length
        ? logs
            .map(function (log) {
              var success = norm(log.result) === "success";
              return "<tr><td>" + escHtml(log.at || "-") + "</td><td>" + escHtml(log.endpoint || "-") + "</td><td><span class='" + (success ? "result-success" : "result-error") + "'>" + escHtml(log.result || "-") + "</span></td><td>" + escHtml(log.message || "-") + "</td></tr>";
            })
            .join("")
        : '<tr><td colspan="4" class="empty-row">No logs available.</td></tr>';
    }
  }

  function renderDecisionPanel() {
    var status = companyStatusKey(company.status);
    var statusLabel = companyStatusLabel(status);

    var dpStatus = document.getElementById("dpStatus");
    if (dpStatus) {
      dpStatus.className = "status-pill " + companyStatusClass(status);
      dpStatus.textContent = statusLabel;
    }

    var dpTargetName = document.getElementById("dpTargetName");
    if (dpTargetName) dpTargetName.textContent = company.name || "Shipping Company";

    var dpTargetMeta = document.getElementById("dpTargetMeta");
    if (dpTargetMeta) dpTargetMeta.textContent = (company.code || "-") + " / " + (company.contactName || "-");

    var hint = document.getElementById("dpHint");
    if (hint) hint.textContent = decisionHint(status);

    var reasonWrap = document.getElementById("dpReasonWrap");
    var reasonText = document.getElementById("dpReasonText");
    var hasReason = !!String(company.decisionReason || "").trim();
    if (reasonWrap) reasonWrap.classList.toggle("d-none", !hasReason);
    if (reasonText) reasonText.textContent = hasReason ? company.decisionReason : "-";

    var reviewState = typeof store.canReview === "function" ? store.canReview(status) : status === "pending" || status === "needs-info";
    var enforceState = typeof store.canEnforce === "function" ? store.canEnforce(status) : status === "approved";

    if (btnApprove) btnApprove.classList.toggle("d-none", !reviewState);
    if (btnReject) btnReject.classList.toggle("d-none", !reviewState);
    if (btnSuspend) btnSuspend.classList.toggle("d-none", !enforceState);
    if (btnBan) btnBan.classList.toggle("d-none", !enforceState);

    var list = document.getElementById("dpAuditList");
    if (list) {
      var audit = Array.isArray(company.audit) ? company.audit.slice().reverse() : [];
      list.innerHTML = audit.length
        ? audit
            .map(function (row) {
              return '<div class="audit-item"><h5>' + escHtml(row.title || "Status Updated") + '</h5><div class="time">' + escHtml(formatDateTime(row.time)) + '</div><div class="note">' + escHtml(row.note || "-") + "</div></div>";
            })
            .join("")
        : '<div class="audit-empty">No decision actions recorded yet.</div>';
    }
  }

  function renderAll() {
    renderSummary();
    renderOverview();
    renderDocuments();
    renderIntegration();
    renderDecisionPanel();
  }

  function openDocumentPreview(docKey) {
    var row = getDocumentRows().find(function (item) {
      return item.key === docKey;
    });
    if (!row || !docModalEl) return;

    var model = row.model || {};
    if (docModalTitle) docModalTitle.textContent = row.title;
    if (docModalBody) {
      docModalBody.innerHTML =
        '<p><strong>File:</strong> ' +
        escHtml(model.fileName || "-") +
        "</p>" +
        '<p><strong>Number:</strong> ' +
        escHtml(model.number || "-") +
        "</p>" +
        '<p><strong>Status:</strong> ' +
        escHtml(documentStatusLabel(model.status)) +
        "</p>" +
        '<p><strong>Last Updated:</strong> ' +
        escHtml(formatDate(model.updatedAt)) +
        "</p>" +
        (model.rejectionReason ? '<p><strong>Rejection Reason:</strong> ' + escHtml(model.rejectionReason) + "</p>" : "");
    }

    if (window.bootstrap) {
      var modal = bootstrap.Modal.getInstance(docModalEl) || new bootstrap.Modal(docModalEl);
      modal.show();
    }
  }

  function handleDocumentAction(action, docKey) {
    if (!action || !docKey) return;

    if (action === "view") {
      openDocumentPreview(docKey);
      return;
    }

    if (action === "approve") {
      var approveResult = store.setDocumentStatus(company.code, docKey, "approved", "");
      if (!approveResult || !approveResult.ok) {
        showInlineMsg(docsMsg, (approveResult && approveResult.message) || "Unable to approve document.", "error");
        return;
      }
      refreshCompany();
      renderAll();
      showInlineMsg(docsMsg, "Document approved successfully.", "success");
      return;
    }

    if (action === "reject") {
      var reason = window.prompt("Rejection reason:", "Document data is incomplete.");
      if (reason === null) return;
      var rejectResult = store.setDocumentStatus(company.code, docKey, "rejected", reason);
      if (!rejectResult || !rejectResult.ok) {
        showInlineMsg(docsMsg, (rejectResult && rejectResult.message) || "Unable to reject document.", "error");
        return;
      }
      refreshCompany();
      renderAll();
      showInlineMsg(docsMsg, "Document rejected and reason has been saved.", "success");
      return;
    }

    if (action === "reupload") {
      var currentDoc = getDocumentRows().find(function (item) {
        return item.key === docKey;
      });
      var currentName = currentDoc && currentDoc.model ? currentDoc.model.fileName : "document.pdf";
      var fileName = window.prompt("New file name:", currentName || "document.pdf");
      if (fileName === null) return;
      var uploadResult = store.setDocumentFileName(company.code, docKey, fileName);
      if (!uploadResult || !uploadResult.ok) {
        showInlineMsg(docsMsg, (uploadResult && uploadResult.message) || "Unable to update document file.", "error");
        return;
      }
      refreshCompany();
      renderAll();
      showInlineMsg(docsMsg, "Document file updated and moved to pending review.", "success");
    }
  }

  function handleCompanyDecision(action) {
    if (!store || typeof store.setCompanyDecision !== "function") return;
    var reason = "";

    if (action === "reject") {
      reason = window.prompt("Rejection reason (required):", "Company profile is incomplete.");
      if (reason === null) return;
      if (!String(reason).trim()) {
        showInlineMsg(decisionMsg, "Rejection reason is required.", "error");
        return;
      }
    }

    if (action === "suspend") {
      reason = window.prompt("Suspend reason (optional):", "");
      if (reason === null) return;
    }

    if (action === "ban") {
      var ok = window.confirm("Are you sure you want to ban this company?");
      if (!ok) return;
      reason = window.prompt("Ban reason (optional):", "");
      if (reason === null) return;
    }

    var result = store.setCompanyDecision(company.code, action, reason);
    if (!result || !result.ok) {
      showInlineMsg(decisionMsg, (result && result.message) || "Unable to apply decision.", "error");
      return;
    }

    refreshCompany();
    renderAll();

    var messages = {
      approve: "Company has been approved.",
      reject: "Company has been rejected.",
      suspend: "Company has been suspended.",
      ban: "Company has been banned."
    };
    showInlineMsg(decisionMsg, messages[action] || "Decision updated.", "success");
  }

  function onIntegrationToggleChange() {
    if (!integrationToggle) return;
    if (isIntegrationLockedByDecision()) {
      integrationToggle.checked = norm((company.integration || {}).status) === "active";
      showInlineMsg(integrationMsg, "Integration is locked while company is suspended or banned.", "error");
      return;
    }

    var shouldBeActive = !!integrationToggle.checked;
    var targetStatus = shouldBeActive ? "active" : "inactive";
    var localResult = store.setIntegrationStatus(company.code, targetStatus);
    if (!localResult || !localResult.ok) {
      integrationToggle.checked = !shouldBeActive;
      showInlineMsg(integrationMsg, (localResult && localResult.message) || "Unable to change integration status.", "error");
      return;
    }

    var integration = company.integration || {};
    var providerId = String(integration.providerId || "").toUpperCase();
    if (providerId && apiStore && typeof apiStore.setIntegrationActive === "function") {
      var apiResult = shouldBeActive ? apiStore.setIntegrationActive(providerId) : apiStore.setIntegrationInactive(providerId);
      if (!apiResult || !apiResult.ok) {
        integrationToggle.checked = !shouldBeActive;
        store.setIntegrationStatus(company.code, shouldBeActive ? "inactive" : "active");
        showInlineMsg(integrationMsg, (apiResult && apiResult.message) || "Unable to sync provider integration status.", "error");
        refreshCompany();
        renderAll();
        return;
      }
    }

    refreshCompany();
    renderAll();
    showInlineMsg(integrationMsg, "Integration status changed to " + integrationStatusLabel(targetStatus) + ".", "success");
  }

  function onCredentialsRevealClick(event) {
    var target = event.target;
    if (!(target instanceof Element)) return;
    var btn = target.closest(".reveal-btn");
    if (!btn) return;
    var id = btn.getAttribute("data-target");
    var valueEl = id ? document.getElementById(id) : null;
    if (!valueEl) return;

    var open = valueEl.getAttribute("data-open") === "1";
    var real = valueEl.getAttribute("data-real") || "";
    valueEl.textContent = open ? maskValue(real) : real;
    valueEl.setAttribute("data-open", open ? "0" : "1");
    btn.innerHTML = open ? '<i class="fi fi-rr-eye"></i>' : '<i class="fi fi-rr-eye-crossed"></i>';
  }

  function onTestWebhookClick() {
    var provider = getIntegrationProvider();
    var url = provider && provider.webhookUrl ? provider.webhookUrl : "this endpoint";
    showInlineMsg(webhookMsg, "Webhook test sent to " + url + ".", "success");
  }

  function onDownloadLogsClick() {
    var provider = getIntegrationProvider();
    var logs = provider && Array.isArray(provider.logs) ? provider.logs : [];
    if (!logs.length) {
      showInlineMsg(integrationMsg, "No logs available for export.", "info");
      return;
    }

    var headers = ["Date/Time", "Endpoint", "Result", "Message"];
    var lines = [headers.map(csvEscape).join(",")];
    logs.forEach(function (log) {
      lines.push([log.at, log.endpoint, log.result, log.message].map(csvEscape).join(","));
    });

    var csv = "\ufeff" + lines.join("\n");
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = (provider && provider.id ? provider.id : company.code) + "-integration-logs.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  tabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var target = btn.getAttribute("data-tab-target");
      if (target) showTab(target);
    });
  });

  if (docsTableBody) {
    docsTableBody.addEventListener("click", function (event) {
      var target = event.target;
      if (!(target instanceof Element)) return;
      var actionBtn = target.closest("[data-doc-action]");
      if (!actionBtn) return;
      handleDocumentAction(actionBtn.getAttribute("data-doc-action"), actionBtn.getAttribute("data-doc-key"));
    });
  }

  if (integrationToggle) integrationToggle.addEventListener("change", onIntegrationToggleChange);
  if (credentialsList) credentialsList.addEventListener("click", onCredentialsRevealClick);
  if (btnTestWebhook) btnTestWebhook.addEventListener("click", onTestWebhookClick);
  if (btnDownloadIntegrationLogs) btnDownloadIntegrationLogs.addEventListener("click", onDownloadLogsClick);
  if (btnApprove) btnApprove.addEventListener("click", function () { handleCompanyDecision("approve"); });
  if (btnReject) btnReject.addEventListener("click", function () { handleCompanyDecision("reject"); });
  if (btnSuspend) btnSuspend.addEventListener("click", function () { handleCompanyDecision("suspend"); });
  if (btnBan) btnBan.addEventListener("click", function () { handleCompanyDecision("ban"); });

  renderAll();
  showTab("tab-overview");
})();
