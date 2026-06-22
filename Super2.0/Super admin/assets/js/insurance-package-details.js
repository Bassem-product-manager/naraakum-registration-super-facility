(function () {
  "use strict";

  var store = window.NKInsurancePackageStore;
  if (!store) return;

  var detailsContent = document.getElementById("detailsContent");
  var notFoundBox = document.getElementById("detailsNotFound");
  if (!detailsContent || !notFoundBox) return;

  var packageName = document.getElementById("detailPackageName");
  var packageCode = document.getElementById("detailPackageCode");
  var packageNameValue = document.getElementById("detailPackageNameValue");
  var packageCodeValue = document.getElementById("detailPackageCodeValue");
  var mainServiceValue = document.getElementById("detailMainService");
  var unitAndCountValue = document.getElementById("detailUnitAndCount");
  var validityValue = document.getElementById("detailValidity");
  var statusPill = document.getElementById("detailStatusPill");
  var updatedAtValue = document.getElementById("detailUpdatedAt");
  var whereUsedTbody = document.getElementById("whereUsedTbody");

  var btnEdit = document.getElementById("btnEditPackage");

  var toastEl = document.getElementById("packageDetailsToast");
  var toastTimer = null;

  var currentItem = null;

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

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function norm(value) {
    return String(value || "").trim();
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
    }, 2300);
  }

  function consumeFlash() {
    var flash = store.consumeFlash();
    if (!flash || !flash.message) return;
    showToast(flash.message, flash.type);
  }

  function getParams() {
    try {
      return new URLSearchParams(window.location.search);
    } catch (err) {
      return new URLSearchParams("");
    }
  }

  function getFacilityCountByService(mainService) {
    var map = {
      hemodialysis: 12,
      physiotherapy: 18,
      "health companion": 9,
      "home nursing": 14,
      "laboratory tests": 16,
      telemedicine: 21,
      "remote follow-up": 13,
      "in-clinic doctor consultation": 11
    };
    return map[norm(mainService).toLowerCase()] || 0;
  }

  function renderWhereUsed(item) {
    var coverageValue = item.isActive ? "Yes" : "No";
    var facilityCount = getFacilityCountByService(item.mainService);

    whereUsedTbody.innerHTML =
      "<tr>" +
      "<td>Insurance Coverage</td>" +
      "<td>" +
      coverageValue +
      "</td>" +
      "<td>Preview placeholder for linked coverage rules.</td>" +
      "</tr>" +
      "<tr>" +
      "<td>Enabled by Facilities Count</td>" +
      "<td>" +
      facilityCount +
      "</td>" +
      "<td>Preview placeholder based on selected main service.</td>" +
      "</tr>";
  }

  function renderDetails(item) {
    var name = item.name || item.nameEn || item.nameAr || "-";
    packageName.textContent = name;
    packageCode.textContent = item.code || "-";
    packageNameValue.textContent = name;
    packageCodeValue.textContent = item.code || "-";
    mainServiceValue.textContent = item.mainService || "-";
    unitAndCountValue.textContent = (item.unitType || "-") + " / " + (item.unitsCount || 0);
    validityValue.textContent = store.formatValidity(item);
    updatedAtValue.textContent = item.updatedAt || "-";
    statusPill.textContent = item.isActive ? "Active" : "Inactive";
    statusPill.className = "status-pill " + (item.isActive ? "active" : "inactive");
    btnEdit.href = "insurance-package-form.html?mode=edit&id=" + encodeURIComponent(item.id);
    renderWhereUsed(item);
  }

  function showNotFound() {
    detailsContent.classList.add("d-none");
    notFoundBox.classList.remove("d-none");
  }

  function bindEvents() {
    if (!btnEdit) return;
  }

  function init() {
    initClock();
    consumeFlash();

    var params = getParams();
    var id = norm(params.get("id"));
    if (!id) {
      showNotFound();
      return;
    }

    var item = store.getById(id);
    if (!item) {
      showNotFound();
      return;
    }

    currentItem = item;
    renderDetails(item);
    bindEvents();
  }

  init();
})();
