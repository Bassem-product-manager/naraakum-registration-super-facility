(function () {
  "use strict";

  var store = window.NKInsuranceRateRuleStore;
  if (!store) return;

  var params = new URLSearchParams(window.location.search);
  var id = (params.get("id") || "").trim();

  var emptyBox = document.getElementById("rateRuleDetailsEmpty");
  var contentWrap = document.getElementById("rateRuleDetailsContent");

  var nameEl = document.getElementById("rrdName");
  var subEl = document.getElementById("rrdSub");
  var statusPill = document.getElementById("rrdStatusPill");
  var editLink = document.getElementById("rrdEditLink");
  var duplicateBtn = document.getElementById("rrdDuplicateBtn");
  var deleteBtn = document.getElementById("rrdDeleteBtn");
  var backLink = document.getElementById("rrdBackLink");

  var infoType = document.getElementById("rrdType");
  var infoCode = document.getElementById("rrdCode");
  var infoMainService = document.getElementById("rrdMainService");
  var infoScope = document.getElementById("rrdScope");
  var infoCoverage = document.getElementById("rrdCoverage");
  var infoCopay = document.getElementById("rrdCopay");
  var infoAuth = document.getElementById("rrdAuth");
  var infoCap = document.getElementById("rrdCap");
  var infoUnit = document.getElementById("rrdUnit");
  var infoUnitsCount = document.getElementById("rrdUnitsCount");
  var infoUpdatedAt = document.getElementById("rrdUpdatedAt");

  var limitsPerMonth = document.getElementById("rrdLimitMonth");
  var limitsPerYear = document.getElementById("rrdLimitYear");

  var deleteModalEl = document.getElementById("deleteRateRuleDetailsModal");
  var btnConfirmDelete = document.getElementById("btnConfirmDeleteRateRuleDetails");
  var toastEl = document.getElementById("insuranceRateDetailsToast");
  var toastTimer = null;

  function initClock() {
    var el = document.getElementById("ksaTime");
    if (!el) return;

    function tick() {
      try {
        var formatter = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Riyadh",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        });
        el.textContent = formatter.format(new Date());
      } catch (err) {
        el.textContent = new Date().toLocaleTimeString("en-US", { hour12: true });
      }
    }

    tick();
    setInterval(tick, 1000);
  }

  function norm(value) {
    return String(value || "").trim().toLowerCase();
  }

  function showToast(message, type) {
    if (!toastEl || !message) return;
    toastEl.textContent = message;
    toastEl.classList.remove("info", "danger");
    if (type === "danger") toastEl.classList.add("danger");
    else if (type === "info") toastEl.classList.add("info");
    toastEl.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2200);
  }

  function labelOrDash(value) {
    var clean = String(value == null ? "" : value).trim();
    return clean || "-";
  }

  function fill(rule) {
    nameEl.textContent = labelOrDash(rule.targetName);
    subEl.textContent =
      (rule.targetType === "package" ? "Package" : "Service") +
      " | " +
      labelOrDash(rule.mainService) +
      " | " +
      labelOrDash(rule.targetCode);

    statusPill.textContent = rule.isActive ? "Active" : "Inactive";
    statusPill.classList.toggle("active", !!rule.isActive);
    statusPill.classList.toggle("inactive", !rule.isActive);

    editLink.href = "insurance-rate-rule-form.html?mode=edit&id=" + encodeURIComponent(rule.id);
    duplicateBtn.setAttribute("data-id", rule.id);
    deleteBtn.setAttribute("data-id", rule.id);

    infoType.textContent = rule.targetType === "package" ? "Package" : "Service";
    infoCode.textContent = labelOrDash(rule.targetCode);
    infoMainService.textContent = labelOrDash(rule.mainService);
    infoScope.textContent = labelOrDash(rule.insuranceCompanyName) + " / " + labelOrDash(rule.plan) + " / " + labelOrDash(rule.class);
    infoCoverage.textContent = store.formatCoverage(rule);
    infoCopay.textContent = store.formatCopay(rule);
    infoAuth.textContent = rule.authRequired ? "Yes" : "No";
    infoCap.textContent = rule.maxCoverageCap === "" ? "-" : "SAR " + rule.maxCoverageCap;
    infoUnit.textContent = labelOrDash(rule.unit);
    infoUnitsCount.textContent = rule.unitsCount === "" ? "-" : String(rule.unitsCount);
    infoUpdatedAt.textContent = labelOrDash(rule.updatedAt);

    limitsPerMonth.textContent = rule.limits && rule.limits.perMonth !== "" ? rule.limits.perMonth : "-";
    limitsPerYear.textContent = rule.limits && rule.limits.perYear !== "" ? rule.limits.perYear : "-";
  }

  function setNotFound() {
    contentWrap.classList.add("d-none");
    emptyBox.classList.remove("d-none");
  }

  function bindEvents(rule) {
    duplicateBtn.addEventListener("click", function () {
      var duplicated = store.duplicateRule(rule.id);
      if (!duplicated) {
        showToast("Unable to duplicate this rate rule.", "danger");
        return;
      }
      store.setFlash("Rate rule duplicated successfully.", "success");
      window.location.href = "insurance-rate-rule-details.html?id=" + encodeURIComponent(duplicated.id);
    });

    deleteBtn.addEventListener("click", function () {
      if (!window.bootstrap || !deleteModalEl) return;
      bootstrap.Modal.getOrCreateInstance(deleteModalEl).show();
    });

    btnConfirmDelete.addEventListener("click", function () {
      var removed = store.removeRule(rule.id);
      if (!removed) {
        showToast("Unable to delete this rate rule.", "danger");
        return;
      }
      store.setFlash("Rate rule deleted.", "info");
      window.location.href = "insurance-rate-sheet.html";
    });

    backLink.addEventListener("click", function (event) {
      event.preventDefault();
      window.location.href = "insurance-rate-sheet.html";
    });
  }

  function init() {
    initClock();
    if (!id) {
      setNotFound();
      return;
    }

    var rule = store.getRuleById(id);
    if (!rule) {
      setNotFound();
      return;
    }

    fill(rule);
    bindEvents(rule);
  }

  init();
})();
