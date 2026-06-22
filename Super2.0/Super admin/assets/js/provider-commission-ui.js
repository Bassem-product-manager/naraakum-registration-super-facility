(function () {
  var store = window.NKProviderCommissionStore;
  if (!store) return;

  var modalInstance = null;
  var currentContext = null;

  function byId(id) {
    return document.getElementById(id);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getParam(name) {
    try {
      return new URL(window.location.href).searchParams.get(name) || "";
    } catch (e) {
      return "";
    }
  }

  function inferProviderType() {
    var path = window.location.pathname.toLowerCase();
    if (path.indexOf("pharm") > -1) return "pharmacy";
    if (path.indexOf("individual") > -1 || path.indexOf("individuals") > -1) return "individual";
    return "facility";
  }

  function typeLabel(type) {
    var normalized = store.normalizeProviderType(type);
    if (normalized === "pharmacy") return "Pharmacy";
    if (normalized === "individual") return "Individual";
    return "Facility";
  }

  function scopeLabel(scope) {
    if (scope === "self_pay") return "Self-pay orders";
    if (scope === "insurance") return "Insurance orders";
    return "All orders";
  }

  function statusLabel(status) {
    return status === "draft" ? "Draft" : "Active";
  }

  function addStyles() {
    if (byId("providerCommissionStyles")) return;
    var style = document.createElement("style");
    style.id = "providerCommissionStyles";
    style.textContent = [
      ".providers-table .col-commission{width:155px;text-align:center;}",
      ".commission-cell{display:flex;align-items:center;justify-content:center;gap:6px;}",
      ".commission-pill{height:30px;min-width:96px;padding:0 10px;border-radius:999px;border:1px solid rgba(15,140,140,.24);background:rgba(15,140,140,.07);color:#0b6f6f;font-size:12px;font-weight:900;display:inline-flex;align-items:center;justify-content:center;white-space:nowrap;}",
      ".commission-pill.is-empty{border-color:rgba(152,162,179,.28);background:rgba(152,162,179,.10);color:#667085;}",
      ".commission-config-btn{width:30px;height:30px;border-radius:10px;border:1px solid rgba(16,24,40,.12);background:#fff;color:#0f8c8c;display:inline-flex;align-items:center;justify-content:center;}",
      ".commission-config-btn:hover{background:rgba(15,140,140,.08);}",
      ".commission-detail-card .commission-hero{border:1px solid rgba(15,140,140,.16);background:rgba(15,140,140,.05);border-radius:12px;padding:12px;display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;}",
      ".commission-detail-card .commission-value{font-size:22px;font-weight:1000;color:#0b6f6f;line-height:1;}",
      ".commission-detail-card .commission-sub{margin:4px 0 0;color:#667085;font-size:12px;font-weight:800;}",
      ".commission-meta-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;}",
      ".commission-meta{border:1px solid rgba(16,24,40,.08);border-radius:10px;padding:8px;background:#fff;}",
      ".commission-meta .l{font-size:11px;color:#98a2b3;font-weight:800;}",
      ".commission-meta .v{margin-top:2px;font-size:12px;color:#101828;font-weight:900;}",
      ".commission-mode-segment{display:grid;grid-template-columns:1fr 1fr;border:1px solid rgba(16,24,40,.14);border-radius:10px;overflow:hidden;background:#f8fafc;}",
      ".commission-mode-segment input{display:none;}",
      ".commission-mode-segment label{height:36px;margin:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:#475467;cursor:pointer;border-right:1px solid rgba(16,24,40,.10);}",
      ".commission-mode-segment label:last-child{border-right:0;}",
      ".commission-mode-segment input:checked + label{background:rgba(15,140,140,.14);color:#0b6f6f;}",
      ".commission-error{display:none;margin-top:6px;color:#b42318;font-size:12px;font-weight:800;}",
      ".commission-error.show{display:block;}",
      "@media(max-width:992px){.commission-meta-grid{grid-template-columns:1fr;}.providers-table .col-commission{width:auto;}}"
    ].join("\n");
    document.head.appendChild(style);
  }

  function ensureModal() {
    if (byId("providerCommissionModal")) return;

    var wrap = document.createElement("div");
    wrap.innerHTML =
      '<div class="modal fade" id="providerCommissionModal" tabindex="-1" aria-hidden="true">' +
      '  <div class="modal-dialog modal-dialog-centered">' +
      '    <div class="modal-content">' +
      '      <div class="modal-header">' +
      '        <div>' +
      '          <h5 class="modal-title mb-0" id="commissionModalTitle">Provider Commission</h5>' +
      '          <div class="text-grey fsize-12" id="commissionModalMeta">-</div>' +
      "        </div>" +
      '        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' +
      "      </div>" +
      '      <div class="modal-body">' +
      '        <div class="field-wrap mb-12">' +
      '          <label class="fsize-12 text-grey semiBold mb-6 d-block">Commission Type</label>' +
      '          <div class="commission-mode-segment">' +
      '            <input id="commissionModePercent" name="commissionMode" type="radio" value="percent" checked />' +
      '            <label for="commissionModePercent">Percentage</label>' +
      '            <input id="commissionModeFixed" name="commissionMode" type="radio" value="fixed" />' +
      '            <label for="commissionModeFixed">Fixed SAR</label>' +
      "          </div>" +
      "        </div>" +
      '        <div class="field-wrap mb-12">' +
      '          <label class="fsize-12 text-grey semiBold mb-6 d-block" for="commissionValue">Commission Value</label>' +
      '          <input id="commissionValue" type="number" min="0" step="0.01" class="form-control form-control-32" placeholder="Enter value" />' +
      '          <div class="commission-error" id="commissionValueError">Commission value must be greater than 0.</div>' +
      "        </div>" +
      "      </div>" +
      '      <div class="modal-footer d-flex justify-content-between">' +
      '        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>' +
      '        <button type="button" class="btn btn-primary" id="btnSaveProviderCommission"><i class="fi fi-rr-disk"></i><span>Save Commission</span></button>' +
      "      </div>" +
      "    </div>" +
      "  </div>" +
      "</div>";
    document.body.appendChild(wrap.firstElementChild);

    ["commissionModePercent", "commissionModeFixed", "commissionValue"].forEach(function (id) {
      var el = byId(id);
      if (!el) return;
      el.addEventListener("input", clearCommissionError);
      el.addEventListener("change", clearCommissionError);
    });

    byId("btnSaveProviderCommission").addEventListener("click", saveModalRule);
  }

  function selectedMode() {
    var checked = document.querySelector('input[name="commissionMode"]:checked');
    return checked ? checked.value : "percent";
  }

  function buildRuleFromModal() {
    var existingRule = currentContext ? store.getRule(currentContext.providerType, currentContext.providerCode) : {};
    return store.normalizeRule({
      providerType: currentContext ? currentContext.providerType : "facility",
      providerCode: currentContext ? currentContext.providerCode : "",
      mode: selectedMode(),
      value: byId("commissionValue").value,
      appliesTo: existingRule.appliesTo || "all_orders",
      status: existingRule.status || "active",
      notes: existingRule.notes || ""
    });
  }

  function clearCommissionError() {
    var node = byId("commissionValueError");
    if (node) node.classList.remove("show");
  }

  function openModal(context) {
    currentContext = context || {};
    ensureModal();

    var rule = store.getRule(currentContext.providerType, currentContext.providerCode);
    byId("commissionModalTitle").textContent = "Provider Commission";
    byId("commissionModalMeta").textContent = typeLabel(currentContext.providerType) + " - " + (currentContext.providerName || currentContext.providerCode);
    byId("commissionModePercent").checked = rule.mode !== "fixed";
    byId("commissionModeFixed").checked = rule.mode === "fixed";
    byId("commissionValue").value = rule.value > 0 ? rule.value : "";
    clearCommissionError();

    var modalEl = byId("providerCommissionModal");
    if (window.bootstrap && window.bootstrap.Modal) {
      modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
      modalInstance.show();
    } else {
      modalEl.classList.add("show");
      modalEl.style.display = "block";
    }
  }

  function saveModalRule() {
    var rule = buildRuleFromModal();
    if (!store.isConfigured(rule)) {
      byId("commissionValueError").textContent = "Commission value must be greater than 0.";
      byId("commissionValueError").classList.add("show");
      return;
    }
    if (rule.mode === "percent" && rule.value > 100) {
      byId("commissionValueError").textContent = "Percentage cannot exceed 100%.";
      byId("commissionValueError").classList.add("show");
      return;
    }

    store.setRule(rule);
    refreshAll();
    document.dispatchEvent(new CustomEvent("nk:provider-commission-updated", { detail: rule }));

    if (modalInstance) modalInstance.hide();
    else byId("providerCommissionModal").style.display = "none";
  }

  function commissionCellHtml(row) {
    var providerType = row.getAttribute("data-type") || inferProviderType();
    var providerCode = row.getAttribute("data-code") || "";
    var providerName = row.getAttribute("data-name") || "";
    var rule = store.getRule(providerType, providerCode);
    var configured = store.isConfigured(rule);

    return (
      '<div class="commission-cell">' +
      '<span class="commission-pill ' + (configured ? "" : "is-empty") + '" data-provider-commission data-provider-type="' + esc(providerType) + '" data-provider-code="' + esc(providerCode) + '">' +
      esc(store.formatRuleSummary(rule)) +
      "</span>" +
      '<button type="button" class="commission-config-btn" title="Configure commission" data-commission-action data-provider-type="' + esc(providerType) + '" data-provider-code="' + esc(providerCode) + '" data-provider-name="' + esc(providerName) + '">' +
      '<i class="fi fi-rr-settings-sliders"></i>' +
      "</button>" +
      "</div>"
    );
  }

  function enhanceProviderTables() {
    qsa("#providersTable").forEach(function (table) {
      if (table.getAttribute("data-commission-ready") === "1") return;

      var actionsHead = table.querySelector("thead tr th.col-actions");
      if (actionsHead) {
        var th = document.createElement("th");
        th.className = "col-commission text-center";
        th.textContent = "Commission";
        actionsHead.parentNode.insertBefore(th, actionsHead);
      }

      qsa("tbody tr[data-code]", table).forEach(function (row) {
        var actionCell = row.querySelector("td.col-actions");
        if (!actionCell) return;
        var td = document.createElement("td");
        td.className = "text-center col-commission";
        td.innerHTML = commissionCellHtml(row);
        actionCell.parentNode.insertBefore(td, actionCell);
      });

      table.setAttribute("data-commission-ready", "1");
    });
  }

  function getDetailContext() {
    var providerType = inferProviderType();
    var providerCode = (getParam("code") || "").toUpperCase();
    var title = byId("sumFacilityName");
    var providerName = title && title.textContent && title.textContent !== "-" ? title.textContent.trim() : providerCode;
    if (!providerCode) return null;
    return { providerType: providerType, providerCode: providerCode, providerName: providerName };
  }

  function detailCardHtml(ctx) {
    var rule = store.getRule(ctx.providerType, ctx.providerCode);
    var configured = store.isConfigured(rule);

    return (
      '<div class="nk-card commission-detail-card" id="providerCommissionCard">' +
      '  <div class="nk-card-title">' +
      "    <h4>Commercial Commission</h4>" +
      '    <button type="button" class="btn-mini" data-commission-action data-provider-type="' + esc(ctx.providerType) + '" data-provider-code="' + esc(ctx.providerCode) + '" data-provider-name="' + esc(ctx.providerName) + '">' +
      '      <i class="fi fi-rr-settings-sliders"></i><span>Configure</span>' +
      "    </button>" +
      "  </div>" +
      '  <div class="commission-hero">' +
      "    <div>" +
      '      <div class="commission-value" data-provider-commission data-provider-type="' + esc(ctx.providerType) + '" data-provider-code="' + esc(ctx.providerCode) + '">' + esc(store.formatRuleSummary(rule)) + "</div>" +
      '      <p class="commission-sub">' + esc(configured ? "Applied to provider order settlements" : "No commission rule configured") + "</p>" +
      "    </div>" +
      '    <span class="commission-pill ' + (configured ? "" : "is-empty") + '">' + esc(statusLabel(rule.status)) + "</span>" +
      "  </div>" +
      '  <div class="commission-meta-grid">' +
      '    <div class="commission-meta"><div class="l">Type</div><div class="v" data-commission-mode>' + esc(rule.mode === "fixed" ? "Fixed SAR" : "Percentage") + "</div></div>" +
      '    <div class="commission-meta"><div class="l">Scope</div><div class="v" data-commission-scope>' + esc(scopeLabel(rule.appliesTo)) + "</div></div>" +
      '    <div class="commission-meta"><div class="l">Updated</div><div class="v" data-commission-updated>' + esc(rule.updatedAt ? rule.updatedAt.slice(0, 10) : "-") + "</div></div>" +
      "  </div>" +
      "</div>"
    );
  }

  function enhanceDetailPage() {
    if (byId("providerCommissionCard")) return;
    var overview = byId("tab-overview");
    if (!overview) return;
    var ctx = getDetailContext();
    if (!ctx) return;

    var firstCard = overview.querySelector(".nk-card");
    var wrapper = document.createElement("div");
    wrapper.innerHTML = detailCardHtml(ctx);

    if (firstCard && firstCard.nextSibling) {
      overview.insertBefore(wrapper.firstElementChild, firstCard.nextSibling);
    } else {
      overview.appendChild(wrapper.firstElementChild);
    }
  }

  function refreshAll() {
    qsa("[data-provider-commission]").forEach(function (node) {
      var rule = store.getRule(node.getAttribute("data-provider-type"), node.getAttribute("data-provider-code"));
      var configured = store.isConfigured(rule);
      node.textContent = store.formatRuleSummary(rule);
      node.classList.toggle("is-empty", !configured);
    });

    var detail = byId("providerCommissionCard");
    if (detail) {
      var ctx = getDetailContext();
      if (ctx) {
        var rule = store.getRule(ctx.providerType, ctx.providerCode);
        var sub = detail.querySelector(".commission-sub");
        var status = detail.querySelector(".commission-hero .commission-pill");
        var mode = detail.querySelector("[data-commission-mode]");
        var scope = detail.querySelector("[data-commission-scope]");
        var updated = detail.querySelector("[data-commission-updated]");
        var configured = store.isConfigured(rule);
        if (sub) sub.textContent = configured ? "Applied to provider order settlements" : "No commission rule configured";
        if (status) {
          status.textContent = statusLabel(rule.status);
          status.classList.toggle("is-empty", !configured);
        }
        if (mode) mode.textContent = rule.mode === "fixed" ? "Fixed SAR" : "Percentage";
        if (scope) scope.textContent = scopeLabel(rule.appliesTo);
        if (updated) updated.textContent = rule.updatedAt ? rule.updatedAt.slice(0, 10) : "-";
      }
    }
  }

  function bindActions() {
    document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-commission-action]");
      if (!btn) return;
      event.preventDefault();
      openModal({
        providerType: btn.getAttribute("data-provider-type") || inferProviderType(),
        providerCode: btn.getAttribute("data-provider-code") || getParam("code"),
        providerName: btn.getAttribute("data-provider-name") || ""
      });
    });
  }

  function init() {
    addStyles();
    ensureModal();
    enhanceDetailPage();
    refreshAll();
    bindActions();
  }

  document.addEventListener("DOMContentLoaded", function () {
    window.setTimeout(init, 0);
  });
})();
