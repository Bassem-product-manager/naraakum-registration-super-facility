(function () {
  function qs(name) {
    var url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function norm(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function normalizeOrderNo(orderNo) {
    return (orderNo || "").toString().trim().toLowerCase();
  }

  function round2(value) {
    var num = Number(value);
    if (!Number.isFinite(num)) return 0;
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  function formatDateCell(value) {
    if (!value) return { date: "-", time: "-" };
    var dt = new Date(value);
    if (Number.isNaN(dt.getTime())) return { date: "-", time: "-" };
    return {
      date: dt.toLocaleDateString("en-GB"),
      time: dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
    };
  }

  function classificationMeta(value) {
    if (value === "payable") return { text: "Payable Now", cls: "classification-payable" };
    if (value === "expected") return { text: "Expected", cls: "classification-expected" };
    return { text: "Excluded", cls: "classification-excluded" };
  }

  function statusLabel(value) {
    var map = {
      completed: "Completed",
      refunded: "Refunded",
      not_yet: "Not Yet",
      canceled: "Canceled"
    };
    return map[norm(value)] || "Pending";
  }

  function payoutModeLabel(mode) {
    if (mode === "all") return "Pay All";
    if (mode === "selected") return "Pay Selected Orders";
    if (mode === "legacy-custom") return "Legacy (Migrated)";
    return "Pay All";
  }

  function escapeAttr(value) {
    return String(value || "").replace(/"/g, "&quot;");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function methodLabel(value) {
    var v = norm(value);
    if (v === "wallet") return "Wallet";
    if (v === "card") return "Card";
    return "Bank";
  }

  function normalizeDestinationItem(item, prefix, index) {
    if (typeof item === "string") {
      var text = item.trim();
      if (!text) return null;
      return { id: prefix + "-" + String(index + 1), label: text };
    }
    if (!item || typeof item !== "object") return null;
    var id = String(item.id || item.code || prefix + "-" + String(index + 1)).trim();
    var label = String(item.label || item.name || item.title || id).trim();
    if (!id || !label) return null;
    return { id: id, label: label };
  }

  function sanitizeDestinationList(list, prefix) {
    if (!Array.isArray(list)) return [];
    var out = [];
    list.forEach(function (item, idx) {
      var normalized = normalizeDestinationItem(item, prefix, idx);
      if (!normalized) return;
      out.push(normalized);
    });
    return out;
  }

  function parseStorageJson(key) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }

  function readDestinationStorage() {
    var out = { bank: [], wallet: [] };
    var combined = parseStorageJson("nk_payout_destinations_v1");
    if (combined && typeof combined === "object") {
      out.bank = sanitizeDestinationList(combined.bank, "bank");
      out.wallet = sanitizeDestinationList(combined.wallet, "wallet");
    }

    if (!out.bank.length) {
      out.bank = sanitizeDestinationList(parseStorageJson("nk_bank_accounts_v1"), "bank");
    }
    if (!out.wallet.length) {
      out.wallet = sanitizeDestinationList(parseStorageJson("nk_wallet_accounts_v1"), "wallet");
    }
    return out;
  }

  function getDefaultDestinations(ledger) {
    var entity = (ledger && ledger.institutionName) || "Entity";
    return {
      bank: [
        { id: "bank-rajhi-main", label: entity + " - Al Rajhi Bank (**** 4512)" },
        { id: "bank-ncb-ops", label: entity + " - SNB Current (**** 9023)" }
      ],
      wallet: [
        { id: "wallet-stc-main", label: entity + " - STC Pay Wallet" },
        { id: "wallet-urpay-ops", label: entity + " - UrPay Wallet" }
      ]
    };
  }

  function sumLinkedAmount(rows) {
    var total = 0;
    (rows || []).forEach(function (row) {
      total = round2(total + round2(row && row.amount));
    });
    return total;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var dataApi = window.NKPaymentData;
    if (!dataApi || typeof dataApi.getEntityLedger !== "function") return;

    var entityCode = (qs("entity") || "").toString().trim().toUpperCase();
    var currentLedger = null;

    var state = {
      mode: "all",
      selectedOrders: Object.create(null)
    };

    function buildOrderDetailsHref(row) {
      var providerType = currentLedger ? norm(currentLedger.providerType) : "";
      var itemType = row ? norm(row.itemType) : "";
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
        encodeURIComponent(row.orderNo) +
        "&providerType=" +
        encodeURIComponent(mode) +
        "&from=ledger&entity=" +
        encodeURIComponent(entityCode)
      );
    }

    var ledgerEmptyState = document.getElementById("ledgerEmptyState");
    var ledgerContent = document.getElementById("ledgerContent");
    var ledgerCrumbEntity = document.getElementById("ledgerCrumbEntity");

    var ledgerInstitutionName = document.getElementById("ledgerInstitutionName");
    var ledgerProviderCode = document.getElementById("ledgerProviderCode");
    var ledgerProviderType = document.getElementById("ledgerProviderType");

    var kpiTotalOrders = document.getElementById("kpiTotalOrders");
    var kpiCompletedValue = document.getElementById("kpiCompletedValue");
    var kpiRefundsValue = document.getElementById("kpiRefundsValue");
    var kpiPaidOut = document.getElementById("kpiPaidOut");
    var kpiPayableNow = document.getElementById("kpiPayableNow");
    var kpiExpectedValue = document.getElementById("kpiExpectedValue");

    var payoutCurrentPayable = document.getElementById("payoutCurrentPayable");
    var payoutAmount = document.getElementById("payoutAmount");
    var payoutMethod = document.getElementById("payoutMethod");
    var bankAccountWrap = document.getElementById("bankAccountWrap");
    var walletAccountWrap = document.getElementById("walletAccountWrap");
    var payoutBankAccount = document.getElementById("payoutBankAccount");
    var payoutWalletAccount = document.getElementById("payoutWalletAccount");
    var payoutModeLabelEl = document.getElementById("payoutModeLabel");
    var payoutSelectedOrdersCount = document.getElementById("payoutSelectedOrdersCount");
    var payoutSelectedAmount = document.getElementById("payoutSelectedAmount");
    var payoutValidationMessage = document.getElementById("payoutValidationMessage");
    var btnCreatePayout = document.getElementById("btnCreatePayout");
    var selectAllPayableOrders = document.getElementById("selectAllPayableOrders");
    var ordersTable = document.getElementById("ordersTable");

    var ordersBody = document.getElementById("ordersBody");
    var invoiceBody = document.getElementById("invoiceBody");
    var refundBody = document.getElementById("refundBody");
    var settlementBody = document.getElementById("settlementBody");

    var payoutDestinations = { bank: [], wallet: [] };

    var linkedOrdersModalEl = document.getElementById("linkedOrdersModal");
    var linkedOrdersTitle = document.getElementById("linkedOrdersTitle");
    var linkedOrdersBody = document.getElementById("linkedOrdersBody");
    var linkedOrdersModal = null;
    if (linkedOrdersModalEl && window.bootstrap && window.bootstrap.Modal) {
      linkedOrdersModal = window.bootstrap.Modal.getOrCreateInstance(linkedOrdersModalEl);
    }

    function setTab(tabName) {
      var name = norm(tabName) || "orders";
      var tabs = document.querySelectorAll(".tab-btn");
      var panels = document.querySelectorAll(".tab-panel");

      tabs.forEach(function (btn) {
        var active = norm(btn.getAttribute("data-tab")) === name;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
      });

      panels.forEach(function (panel) {
        var active = norm(panel.id.replace("panel-", "")) === name;
        panel.classList.toggle("active", active);
      });
    }

    function fillDestinationSelect(selectEl, items, emptyLabel) {
      if (!selectEl) return;
      var list = Array.isArray(items) ? items : [];
      if (!list.length) {
        selectEl.innerHTML = '<option value="">' + escapeHtml(emptyLabel || "No options") + "</option>";
        return;
      }
      selectEl.innerHTML = list
        .map(function (item) {
          return '<option value="' + escapeAttr(item.id) + '">' + escapeHtml(item.label) + "</option>";
        })
        .join("");
    }

    function resolveDestinations(ledger) {
      var stored = readDestinationStorage();
      var fallback = getDefaultDestinations(ledger);
      return {
        bank: stored.bank.length ? stored.bank : fallback.bank,
        wallet: stored.wallet.length ? stored.wallet : fallback.wallet
      };
    }

    function syncMethodDestinationUI() {
      var method = norm(payoutMethod ? payoutMethod.value : "bank");
      var isWallet = method === "wallet";
      if (bankAccountWrap) bankAccountWrap.classList.toggle("d-none", isWallet);
      if (walletAccountWrap) walletAccountWrap.classList.toggle("d-none", !isWallet);
    }

    function getSelectedDestination() {
      var method = norm(payoutMethod ? payoutMethod.value : "bank");
      var selectEl = method === "wallet" ? payoutWalletAccount : payoutBankAccount;
      if (!selectEl) return null;
      var id = String(selectEl.value || "").trim();
      if (!id) return null;
      var label = "";
      if (selectEl.selectedIndex >= 0 && selectEl.options[selectEl.selectedIndex]) {
        label = selectEl.options[selectEl.selectedIndex].text || "";
      }
      return {
        type: method === "wallet" ? "wallet" : "bank",
        id: id,
        label: label || id
      };
    }

    function applySelectionModeUI() {
      var selectable = state.mode === "selected";
      if (ordersTable) ordersTable.classList.toggle("selection-disabled", !selectable);
      if (!selectable) {
        if (selectAllPayableOrders) {
          selectAllPayableOrders.checked = false;
          selectAllPayableOrders.indeterminate = false;
        }
      }
    }

    function getSelectableOrders() {
      if (!currentLedger || !Array.isArray(currentLedger.orders)) return [];
      return currentLedger.orders.filter(function (row) {
        return !!row.isSelectable;
      });
    }

    function cleanupSelectionState() {
      if (!currentLedger) {
        state.selectedOrders = Object.create(null);
        return;
      }

      var allowed = Object.create(null);
      getSelectableOrders().forEach(function (row) {
        allowed[normalizeOrderNo(row.orderNo)] = true;
      });

      Object.keys(state.selectedOrders).forEach(function (key) {
        if (!allowed[key]) delete state.selectedOrders[key];
      });
    }

    function getSelectedOrders() {
      if (!currentLedger || !Array.isArray(currentLedger.orders)) return [];
      return currentLedger.orders.filter(function (row) {
        return !!row.isSelectable && !!state.selectedOrders[normalizeOrderNo(row.orderNo)];
      });
    }

    function getSelectedAmount() {
      return round2(
        getSelectedOrders().reduce(function (sum, row) {
          return sum + round2(row.payableOutstanding);
        }, 0)
      );
    }

    function setValidation(message, ok) {
      if (!payoutValidationMessage) return;
      payoutValidationMessage.classList.remove("ok");
      payoutValidationMessage.classList.remove("error");
      payoutValidationMessage.textContent = message || "";
      if (!message) return;
      payoutValidationMessage.classList.add(ok ? "ok" : "error");
    }

    function syncModeButtons() {
      var buttons = document.querySelectorAll(".payout-mode-btn");
      buttons.forEach(function (btn) {
        var active = norm(btn.getAttribute("data-mode")) === state.mode;
        btn.classList.toggle("active", active);
      });
      applySelectionModeUI();
    }

    function syncSelectAllCheckbox() {
      if (!selectAllPayableOrders) return;
      if (state.mode !== "selected") {
        selectAllPayableOrders.checked = false;
        selectAllPayableOrders.indeterminate = false;
        selectAllPayableOrders.disabled = true;
        return;
      }

      var selectable = getSelectableOrders();
      if (!selectable.length) {
        selectAllPayableOrders.checked = false;
        selectAllPayableOrders.indeterminate = false;
        selectAllPayableOrders.disabled = true;
        return;
      }

      selectAllPayableOrders.disabled = false;
      var selectedCount = selectable.filter(function (row) {
        return !!state.selectedOrders[normalizeOrderNo(row.orderNo)];
      }).length;

      selectAllPayableOrders.checked = selectedCount > 0 && selectedCount === selectable.length;
      selectAllPayableOrders.indeterminate = selectedCount > 0 && selectedCount < selectable.length;
    }

    function syncPayoutPanel() {
      if (!currentLedger) return;

      var payableNow = round2(currentLedger.kpis ? currentLedger.kpis.payableNow : 0);
      var selectedAmount = getSelectedAmount();
      var selectedCount = getSelectedOrders().length;
      var showSelected = state.mode === "selected";

      if (payoutCurrentPayable) payoutCurrentPayable.textContent = dataApi.formatMoney(payableNow);
      if (payoutModeLabelEl) payoutModeLabelEl.textContent = payoutModeLabel(state.mode);
      if (payoutSelectedOrdersCount) payoutSelectedOrdersCount.textContent = String(showSelected ? selectedCount : 0);
      if (payoutSelectedAmount) payoutSelectedAmount.textContent = dataApi.formatMoney(showSelected ? selectedAmount : 0);

      if (payoutAmount) {
        if (state.mode === "all") {
          payoutAmount.readOnly = true;
          payoutAmount.value = payableNow > 0 ? payableNow.toFixed(2) : "";
        } else {
          payoutAmount.readOnly = true;
          payoutAmount.value = selectedAmount > 0 ? selectedAmount.toFixed(2) : "";
        }
      }

      var amount = round2(payoutAmount ? payoutAmount.value : 0);
      var valid = false;
      var message = "";

      if (!(payableNow > 0)) {
        message = "No payable balance available for payout.";
      } else if (state.mode === "all") {
        if (Math.abs(amount - payableNow) > 0.009) {
          message = "Pay All requires exact current payable amount.";
        } else {
          valid = true;
          message = "Ready to create payout for all payable orders.";
        }
      } else if (state.mode === "selected") {
        if (selectedCount < 1) {
          message = "Select at least one payable order.";
        } else if (Math.abs(amount - selectedAmount) > 0.009) {
          message = "Selected mode requires exact selected outstanding amount.";
        } else {
          valid = true;
          message = "Ready to create payout for selected orders.";
        }
      } else {
        message = "Invalid payout mode.";
      }

      if (btnCreatePayout) btnCreatePayout.disabled = !valid;
      setValidation(message, valid);
      syncSelectAllCheckbox();
    }

    function setMode(mode) {
      var next = norm(mode);
      if (next !== "all" && next !== "selected") return;
      state.mode = next;
      if (next === "all") {
        state.selectedOrders = Object.create(null);
      }
      syncModeButtons();
      syncPayoutPanel();
      renderOrders(currentLedger ? currentLedger.orders || [] : []);
    }

    function renderOrders(rows) {
      if (!ordersBody) return;
      var colspan = state.mode === "selected" ? 15 : 14;
      if (!rows.length) {
        ordersBody.innerHTML = '<tr><td colspan="' + colspan + '" class="text-center text-grey">No orders found</td></tr>';
        syncSelectAllCheckbox();
        return;
      }

      ordersBody.innerHTML = rows
        .map(function (row) {
          var d = formatDateCell(row.orderDate);
          var scheduled = formatDateCell(row.scheduledDate);
          var cls = classificationMeta(row.classification);
          var previewHref = buildOrderDetailsHref(row);
          var key = normalizeOrderNo(row.orderNo);
          var checkboxHtml = "";

          if (state.mode === "selected" && row.isSelectable) {
            var checked = state.selectedOrders[key] ? " checked" : "";
            checkboxHtml =
              '<input class="order-select js-order-select" type="checkbox" data-order="' +
              escapeAttr(row.orderNo) +
              '"' +
              checked +
              ' />';
          } else if (state.mode === "selected") {
            var reason = row.selectionReason || "Not selectable";
            checkboxHtml = '<input class="order-select" type="checkbox" disabled title="' + escapeAttr(reason) + '" />';
          } else {
            checkboxHtml = "";
          }

          return [
            "<tr>",
            '<td class="select-cell">' + checkboxHtml + "</td>",
            "<td>" + row.orderNo + "</td>",
            "<td>" + row.transactionNo + "</td>",
            "<td>" + row.patientName + "</td>",
            "<td>" + statusLabel(row.status) + "</td>",
            "<td>" + row.itemType + "</td>",
            "<td>" + methodLabel(row.paymentMethod) + "</td>",
            "<td>" + d.date + "<br><span class=\"text-grey fsize-12\">" + d.time + "</span></td>",
            "<td>" + scheduled.date + "<br><span class=\"text-grey fsize-12\">" + scheduled.time + "</span></td>",
            "<td>" + dataApi.formatMoney(row.basePrice) + "</td>",
            "<td>" + dataApi.formatMoney(row.refundAmount) + "</td>",
            "<td>" + dataApi.formatMoney(row.settledAmount || 0) + "</td>",
            "<td>" + dataApi.formatMoney(row.payableOutstanding || 0) + "</td>",
            '<td><span class="' + cls.cls + '">' + cls.text + "</span></td>",
            '<td class="text-center"><a href="' + previewHref + '" class="btn btn-primary-revers btn-32"><i class="fi fi-rr-eye"></i></a></td>',
            "</tr>"
          ].join("");
        })
        .join("");

      syncSelectAllCheckbox();
    }

    function renderInvoices(rows) {
      if (!invoiceBody) return;
      if (!rows.length) {
        invoiceBody.innerHTML = '<tr><td colspan="5" class="text-center text-grey">No completed orders found</td></tr>';
        return;
      }

      invoiceBody.innerHTML = rows
        .map(function (row) {
          var href = buildOrderDetailsHref(row);
          return [
            "<tr>",
            "<td>" + row.orderNo + "</td>",
            "<td>" + row.patientName + "</td>",
            "<td>" + statusLabel(row.status) + "</td>",
            "<td>" + dataApi.formatMoney(row.basePrice) + "</td>",
            '<td class="text-center"><a href="' + href + '" class="btn btn-primary btn-32">Preview</a></td>',
            "</tr>"
          ].join("");
        })
        .join("");
    }

    function renderRefunds(rows) {
      if (!refundBody) return;
      if (!rows.length) {
        refundBody.innerHTML = '<tr><td colspan="5" class="text-center text-grey">No refunds found</td></tr>';
        return;
      }

      refundBody.innerHTML = rows
        .map(function (row) {
          var d = formatDateCell(row.orderDate);
          return [
            "<tr>",
            "<td>" + row.orderNo + "</td>",
            "<td>" + row.patientName + "</td>",
            "<td>" + statusLabel(row.status) + "</td>",
            "<td>" + dataApi.formatMoney(row.refundAmount) + "</td>",
            "<td>" + d.date + " " + d.time + "</td>",
            "</tr>"
          ].join("");
        })
        .join("");
    }

    function renderSettlements(rows) {
      if (!settlementBody) return;
      if (!rows.length) {
        settlementBody.innerHTML = '<tr><td colspan="9" class="text-center text-grey">No payouts posted yet</td></tr>';
        return;
      }

      settlementBody.innerHTML = rows
        .map(function (row) {
          var d = formatDateCell(row.createdAt);
          var linkedOrders = Array.isArray(row.linkedOrders) ? row.linkedOrders : [];
          var linkedCount = linkedOrders.length;
          var linkedAmount = round2(row.linkedAmount || sumLinkedAmount(linkedOrders));
          var destinationText = escapeHtml(row.destinationLabel || row.destinationId || "-");
          var action =
            linkedCount > 0
              ? '<button type="button" class="btn btn-primary-revers btn-32 js-view-linked" data-settlement="' +
                escapeAttr(row.settlementId) +
                '"><i class="fi fi-rr-eye"></i></button>'
              : "-";
          return [
            "<tr>",
            "<td>" + row.settlementId + "</td>",
            "<td>" + d.date + " " + d.time + "</td>",
            "<td>" + payoutModeLabel(row.mode) + "</td>",
            "<td>" + linkedCount + "</td>",
            "<td>" + dataApi.formatMoney(linkedAmount) + "</td>",
            "<td>" + dataApi.formatMoney(row.amount) + "</td>",
            "<td>" + methodLabel(row.method) + "</td>",
            "<td>" + destinationText + "</td>",
            '<td class="text-center">' + action + "</td>",
            "</tr>"
          ].join("");
        })
        .join("");
    }

    function openLinkedOrdersModal(settlementId) {
      if (!linkedOrdersModalEl || !linkedOrdersBody || !currentLedger) return;
      var found = (currentLedger.settlements || []).find(function (row) {
        return String(row.settlementId) === String(settlementId);
      });
      if (!found) return;

      var linkedOrders = Array.isArray(found.linkedOrders) ? found.linkedOrders : [];
      if (linkedOrdersTitle) linkedOrdersTitle.textContent = "Linked Orders - " + found.settlementId;

      if (!linkedOrders.length) {
        linkedOrdersBody.innerHTML = '<p class="mb-0 text-grey">No linked orders found for this settlement.</p>';
      } else {
        linkedOrdersBody.innerHTML = [
          '<div class="table-responsive">',
          '  <table class="staff-table naraakum-table table-tight">',
          "    <thead>",
          "      <tr>",
          "        <th>Order No</th>",
          "        <th>Amount</th>",
          "      </tr>",
          "    </thead>",
          "    <tbody>",
          linkedOrders
            .map(function (row) {
              return "<tr><td>" + row.orderNo + "</td><td>" + dataApi.formatMoney(row.amount) + "</td></tr>";
            })
            .join(""),
          "    </tbody>",
          "  </table>",
          "</div>"
        ].join("");
      }

      if (linkedOrdersModal) {
        linkedOrdersModal.show();
      } else {
        linkedOrdersModalEl.classList.add("show");
        linkedOrdersModalEl.style.display = "block";
      }
    }

    function renderLedger(ledger) {
      currentLedger = ledger;
      if (!ledger) {
        if (ledgerEmptyState) ledgerEmptyState.classList.remove("d-none");
        if (ledgerContent) ledgerContent.classList.add("d-none");
        return;
      }

      cleanupSelectionState();

      if (ledgerEmptyState) ledgerEmptyState.classList.add("d-none");
      if (ledgerContent) ledgerContent.classList.remove("d-none");

      if (ledgerCrumbEntity) ledgerCrumbEntity.textContent = ledger.institutionName + " (" + ledger.providerCode + ")";
      if (ledgerInstitutionName) ledgerInstitutionName.textContent = ledger.institutionName;
      if (ledgerProviderCode) ledgerProviderCode.textContent = ledger.providerCode;
      if (ledgerProviderType) ledgerProviderType.textContent = ledger.providerType;

      if (kpiTotalOrders) kpiTotalOrders.textContent = String(ledger.kpis.totalOrders);
      if (kpiCompletedValue) kpiCompletedValue.textContent = dataApi.formatMoney(ledger.kpis.completedValue);
      if (kpiRefundsValue) kpiRefundsValue.textContent = dataApi.formatMoney(ledger.kpis.refundsValue);
      if (kpiPaidOut) kpiPaidOut.textContent = dataApi.formatMoney(ledger.kpis.paidOut);
      if (kpiPayableNow) kpiPayableNow.textContent = dataApi.formatMoney(ledger.kpis.payableNow);
      if (kpiExpectedValue) kpiExpectedValue.textContent = dataApi.formatMoney(ledger.kpis.expectedValue);

      payoutDestinations = resolveDestinations(ledger);
      fillDestinationSelect(payoutBankAccount, payoutDestinations.bank, "No bank accounts configured");
      fillDestinationSelect(payoutWalletAccount, payoutDestinations.wallet, "No wallets configured");
      if (payoutMethod) payoutMethod.value = "bank";
      syncMethodDestinationUI();

      renderOrders(ledger.orders || []);
      renderInvoices(ledger.completedInvoices || []);
      renderRefunds(ledger.refunds || []);
      renderSettlements(ledger.settlements || []);
      syncModeButtons();
      syncPayoutPanel();
    }

    function loadLedger() {
      renderLedger(dataApi.getEntityLedger(entityCode));
    }

    function buildPayoutPayload() {
      var selectedDestination = getSelectedDestination();
      var payload = {
        amount: round2(payoutAmount ? payoutAmount.value : 0),
        method: payoutMethod ? payoutMethod.value : "bank",
        mode: state.mode
      };
      if (selectedDestination) {
        payload.destinationType = selectedDestination.type;
        payload.destinationId = selectedDestination.id;
        payload.destinationLabel = selectedDestination.label;
      }
      if (state.mode === "selected") {
        payload.selectedOrderNos = getSelectedOrders().map(function (row) {
          return row.orderNo;
        });
      }
      return payload;
    }

    function handleCreatePayout() {
      if (!currentLedger) return;
      var payload = buildPayoutPayload();

      var res = dataApi.createEntityPayout(entityCode, payload);
      if (!res.ok) {
        setValidation(res.message || "Unable to create payout", false);
        return;
      }

      state.selectedOrders = Object.create(null);
      setValidation("Payout created successfully.", true);
      loadLedger();
      setTab("settlements");
    }

    document.addEventListener("click", function (event) {
      var tabBtn = event.target.closest(".tab-btn");
      if (tabBtn) {
        setTab(tabBtn.getAttribute("data-tab"));
        return;
      }

      var modeBtn = event.target.closest(".payout-mode-btn");
      if (modeBtn) {
        setMode(modeBtn.getAttribute("data-mode"));
        return;
      }

      var linkedBtn = event.target.closest(".js-view-linked");
      if (linkedBtn) {
        openLinkedOrdersModal(linkedBtn.getAttribute("data-settlement"));
      }
    });

    document.addEventListener("change", function (event) {
      var target = event.target;
      if (!target) return;

      if (target.id === "selectAllPayableOrders") {
        if (state.mode !== "selected") {
          target.checked = false;
          return;
        }
        var selectable = getSelectableOrders();
        if (target.checked) {
          selectable.forEach(function (row) {
            state.selectedOrders[normalizeOrderNo(row.orderNo)] = true;
          });
        } else {
          selectable.forEach(function (row) {
            delete state.selectedOrders[normalizeOrderNo(row.orderNo)];
          });
        }
        syncPayoutPanel();
        renderOrders(currentLedger ? currentLedger.orders || [] : []);
        return;
      }

      if (target.classList.contains("js-order-select")) {
        if (state.mode !== "selected") {
          target.checked = false;
          return;
        }
        var key = normalizeOrderNo(target.getAttribute("data-order"));
        if (!key) return;
        if (target.checked) state.selectedOrders[key] = true;
        else delete state.selectedOrders[key];
        syncPayoutPanel();
        syncSelectAllCheckbox();
      }
    });

    if (payoutAmount) {
      payoutAmount.addEventListener("input", function () {
        syncPayoutPanel();
      });
    }

    if (payoutMethod) {
      payoutMethod.addEventListener("change", function () {
        syncMethodDestinationUI();
        syncPayoutPanel();
      });
    }

    if (btnCreatePayout) btnCreatePayout.addEventListener("click", handleCreatePayout);

    setTab("orders");
    loadLedger();
  });
})();
