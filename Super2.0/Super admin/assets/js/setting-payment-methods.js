(function () {
  function norm(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDateTime(value) {
    if (!value) return "-";
    var dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return "-";
    return (
      dt.toLocaleDateString("en-GB") +
      '<br><span class="text-grey fsize-12">' +
      dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }) +
      "</span>"
    );
  }

  function typeBadge(type) {
    return norm(type) === "wallet"
      ? '<span class="pm-type-badge pm-type-wallet">Wallet</span>'
      : '<span class="pm-type-badge pm-type-bank">Bank</span>';
  }

  function rowActionsHtml(method) {
    var id = escapeHtml(method.id);
    return (
      '<div class="dropdown">' +
      '<button type="button" class="btn btn-primary-revers btn-32 pm-action-trigger" data-bs-toggle="dropdown" aria-expanded="false" title="Actions">' +
      '<i class="fi fi-rr-edit"></i>' +
      "</button>" +
      '<ul class="dropdown-menu dropdown-menu-end">' +
      '<li><button type="button" class="dropdown-item js-row-action" data-action="edit" data-id="' +
      id +
      '">Edit</button></li>' +
      '<li><button type="button" class="dropdown-item text-red js-row-action" data-action="delete" data-id="' +
      id +
      '">Delete</button></li>' +
      "</ul>" +
      "</div>"
    );
  }

  function isMethodActive(method) {
    if (Object.prototype.hasOwnProperty.call(method || {}, "active")) {
      return !!method.active;
    }
    return norm(method && method.status) !== "disabled";
  }

  function rowActiveToggleHtml(method) {
    var id = escapeHtml(method.id);
    var checked = isMethodActive(method) ? " checked" : "";
    return (
      '<div class="form-check form-switch pm-toggle m-0">' +
      '<input class="form-check-input js-active-toggle" type="checkbox" role="switch" data-id="' +
      id +
      '"' +
      checked +
      ">" +
      "</div>"
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    var store = window.NKPaymentMethodsStore;
    if (!store) return;

    store.ensureSeedData();

    var entities = store.getEntities();
    var resolvedEntity = store.resolveEntityFromQuery(window.location.search);

    if (!resolvedEntity && entities.length) {
      resolvedEntity = entities[0];
    }

    var entityCode = resolvedEntity ? store.normalizeEntityId(resolvedEntity.id || resolvedEntity.code) : "";

    var missingState = document.getElementById("pmMissingEntity");
    var content = document.getElementById("pmContent");
    var listMessage = document.getElementById("pmListMessage");

    var searchInput = document.getElementById("pmSearchInput");
    var searchBtn = document.getElementById("btnPmSearch");
    var resetBtn = document.getElementById("btnPmReset");
    var typeFilter = document.getElementById("fPmType");
    var currencyFilter = document.getElementById("fPmCurrency");
    var applyFilterBtn = document.getElementById("btnPmApplyFilter");
    var resetFilterBtn = document.getElementById("btnPmFilterReset");
    var addBtn = document.getElementById("pmAddMethodBtn");
    var emptyAddBtn = document.getElementById("pmEmptyAddBtn");

    var tableWrap = document.getElementById("pmTableWrap");
    var tableBody = document.getElementById("pmTableBody");
    var emptyMethods = document.getElementById("pmEmptyMethods");
    var noResults = document.getElementById("pmNoResults");

    var methods = [];
    var filtered = [];

    function setListMessage(message, kind) {
      if (!listMessage) return;
      if (!message) {
        listMessage.classList.add("d-none");
        listMessage.textContent = "";
        listMessage.classList.remove("alert-danger");
        listMessage.classList.remove("alert-success");
        return;
      }
      listMessage.classList.remove("d-none");
      listMessage.textContent = message;
      listMessage.classList.toggle("alert-danger", kind === "error");
      listMessage.classList.toggle("alert-success", kind !== "error");
    }

    function addUrlForEntity(code) {
      return "add-payment-method.html?entityId=" + encodeURIComponent(code) + "&mode=create";
    }

    function editUrl(code, methodId) {
      return (
        "add-payment-method.html?entityId=" +
        encodeURIComponent(code) +
        "&mode=edit&methodId=" +
        encodeURIComponent(methodId)
      );
    }

    function setupEntityState() {
      if (!resolvedEntity) {
        if (missingState) missingState.classList.remove("d-none");
        if (content) content.classList.add("d-none");
        return false;
      }

      if (missingState) missingState.classList.add("d-none");
      if (content) content.classList.remove("d-none");

      if (addBtn) addBtn.setAttribute("href", addUrlForEntity(entityCode));
      if (emptyAddBtn) emptyAddBtn.setAttribute("href", addUrlForEntity(entityCode));

      return true;
    }

    function populateCurrencyFilter() {
      if (!currencyFilter) return;
      var current = String(currencyFilter.value || "").trim().toUpperCase();
      var map = {};
      methods.forEach(function (row) {
        var code = String(row.currency || "")
          .trim()
          .toUpperCase();
        if (code) map[code] = true;
      });

      var options = Object.keys(map).sort();
      currencyFilter.innerHTML =
        '<option value="">All Currencies</option>' +
        options
          .map(function (code) {
            return '<option value="' + escapeHtml(code) + '">' + escapeHtml(code) + "</option>";
          })
          .join("");

      if (current && map[current]) {
        currencyFilter.value = current;
      } else {
        currencyFilter.value = "";
      }
    }

    function applyFilters() {
      var q = norm(searchInput && searchInput.value);
      var t = norm(typeFilter && typeFilter.value);
      var c = norm(currencyFilter && currencyFilter.value);

      filtered = methods.filter(function (row) {
        if (t && norm(row.methodType) !== t) return false;
        if (c && norm(row.currency) !== c) return false;

        if (!q) return true;

        var text = [
          row.label,
          row.currency,
          row.methodType,
          store.maskDestination(row),
          (row.bank && row.bank.bankName) || "",
          (row.wallet && row.wallet.provider) || "",
          (row.wallet && row.wallet.providerOther) || ""
        ]
          .join(" ")
          .toLowerCase();

        return text.indexOf(q) !== -1;
      });

      renderTable();
    }

    function renderTable() {
      if (!tableBody) return;

      if (!methods.length) {
        if (tableWrap) tableWrap.classList.add("d-none");
        if (emptyMethods) emptyMethods.classList.remove("d-none");
        if (noResults) noResults.classList.add("d-none");
        return;
      }

      if (tableWrap) tableWrap.classList.remove("d-none");
      if (emptyMethods) emptyMethods.classList.add("d-none");

      if (!filtered.length) {
        tableBody.innerHTML = "";
        if (noResults) noResults.classList.remove("d-none");
        return;
      }
      if (noResults) noResults.classList.add("d-none");

      tableBody.innerHTML = filtered
        .map(function (row, index) {
          return (
            "<tr>" +
            "<td>" +
            (index + 1) +
            "</td>" +
            "<td>" +
            typeBadge(row.methodType) +
            "</td>" +
            "<td>" +
            escapeHtml(row.label || "-") +
            "</td>" +
            "<td>" +
            escapeHtml(store.maskDestination(row)) +
            "</td>" +
            '<td><span class="staff-code">' +
            escapeHtml(row.currency || "-") +
            "</span></td>" +
            "<td>" +
            rowActiveToggleHtml(row) +
            "</td>" +
            "<td>" +
            formatDateTime(row.createdAt) +
            "</td>" +
            '<td><div class="pm-actions-wrap">' +
            rowActionsHtml(row) +
            "</div></td>" +
            "</tr>"
          );
        })
        .join("");
    }

    function reloadMethods() {
      methods = store.getPaymentMethods(entityCode).map(function (row) {
        row.status = store.normalizeStatus(row.status);
        return row;
      });
      populateCurrencyFilter();
      applyFilters();
    }

    function handleAction(action, methodId) {
      if (!action || !methodId) return;
      setListMessage("");

      if (action === "edit") {
        window.location.href = editUrl(entityCode, methodId);
        return;
      }

      var result = null;
      if (action === "delete") {
        var ok = window.confirm("Delete this payment method?");
        if (!ok) return;
        result = store.deleteMethod(entityCode, methodId);
      }

      if (!result) return;
      if (!result.ok) {
        setListMessage(result.message || "Action failed.", "error");
        return;
      }

      setListMessage("Action completed successfully.", "success");
      reloadMethods();
    }

    function handleToggle(methodId, shouldBeActive, sourceInput) {
      if (!methodId) return;
      setListMessage("");

      var result = shouldBeActive ? store.enableMethod(entityCode, methodId) : store.disableMethod(entityCode, methodId);
      if (!result || !result.ok) {
        if (sourceInput) sourceInput.checked = !shouldBeActive;
        setListMessage((result && result.message) || "Unable to update activation.", "error");
        return;
      }

      setListMessage("Activation updated successfully.", "success");
      reloadMethods();
    }

    if (!setupEntityState()) return;
    reloadMethods();

    if (searchBtn) searchBtn.addEventListener("click", applyFilters);
    if (searchInput) searchInput.addEventListener("input", applyFilters);

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (searchInput) searchInput.value = "";
        if (typeFilter) typeFilter.value = "";
        if (currencyFilter) currencyFilter.value = "";
        setListMessage("");
        applyFilters();
      });
    }

    if (applyFilterBtn) {
      applyFilterBtn.addEventListener("click", function () {
        applyFilters();
      });
    }

    if (resetFilterBtn) {
      resetFilterBtn.addEventListener("click", function () {
        if (typeFilter) typeFilter.value = "";
        if (currencyFilter) currencyFilter.value = "";
      });
    }

    if (tableBody) {
      tableBody.addEventListener("click", function (event) {
        var btn = event.target.closest(".js-row-action");
        if (!btn) return;
        handleAction(btn.getAttribute("data-action"), btn.getAttribute("data-id"));
      });

      tableBody.addEventListener("change", function (event) {
        var toggle = event.target.closest(".js-active-toggle");
        if (!toggle) return;
        handleToggle(toggle.getAttribute("data-id"), !!toggle.checked, toggle);
      });
    }
  });
})();
