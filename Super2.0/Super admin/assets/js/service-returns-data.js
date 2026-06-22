(function () {
  var STORAGE_KEY = "nk_service_returns_v1";

  function round2(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  function toNumber(value, fallback) {
    var n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function toInt(value, fallback) {
    var n = Math.floor(toNumber(value, fallback));
    if (!Number.isFinite(n)) return fallback;
    return n;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeSourceType(value) {
    var key = (value || "").toString().trim().toLowerCase();
    if (key === "facility" || key === "individual") return key;
    return "";
  }

  function normalizeCancelStatus(value) {
    var key = (value || "").toString().trim().toLowerCase();
    if (key === "failed") return "failed";
    if (key === "cancelled" || key === "canceled") return "cancelled";
    return "";
  }

  function normalizeCancelSource(value, sourceType) {
    var key = (value || "").toString().trim().toLowerCase();
    if (key === "customer" || key === "facility" || key === "individual") return key;
    if (sourceType === "individual") return "individual";
    if (sourceType === "facility") return "facility";
    return "customer";
  }

  function normalizeCancelType(value) {
    var key = (value || "").toString().trim().toLowerCase();
    var allowed = {
      customer_cancelled: true,
      patient_not_found: true,
      session_no_show: true,
      provider_unavailable: true,
      other: true
    };
    return allowed[key] ? key : "other";
  }

  function normalizeRefundMethod(value) {
    var key = (value || "").toString().trim().toLowerCase();
    if (key === "wallet") return "wallet";
    if (key === "card") return "card";
    if (key === "cash") return "cash";
    if (key === "bank-transfer" || key === "bank" || key === "bank transfer") return "bank-transfer";
    return "card";
  }

  function normalizeOverride(value) {
    var key = (value || "").toString().trim().toLowerCase();
    if (key === "approved" || key === "rejected") return key;
    return "none";
  }

  function normalizeDecision(value) {
    var key = (value || "").toString().trim().toLowerCase();
    if (key === "approved" || key === "rejected" || key === "pending") return key;
    return "pending";
  }

  function toIsoDate(value) {
    if (!value) return "";
    var raw = String(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    var date = new Date(raw);
    if (Number.isNaN(date.getTime())) return "";
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, "0");
    var d = String(date.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function parseRequestedQty(value) {
    if (typeof value === "number") return Math.max(1, Math.floor(value));
    var text = (value || "").toString().trim();
    if (!text) return 1;

    var firstNumber = text.match(/(\d+(\.\d+)?)/);
    if (!firstNumber) return 1;

    var qty = Math.floor(Number(firstNumber[1]));
    if (!Number.isFinite(qty) || qty <= 0) return 1;
    return qty;
  }

  function formatMoney(value) {
    return round2(toNumber(value, 0)).toFixed(2) + " SAR";
  }

  function formatDate(value) {
    var iso = toIsoDate(value);
    if (!iso) return "-";
    var date = new Date(iso + "T00:00:00");
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
  }

  function sourcePrefix(sourceType) {
    return sourceType === "individual" ? "RI" : "RF";
  }

  function makeReturnId(sourceType, orderNo) {
    return sourcePrefix(sourceType) + "-" + String(orderNo || "").trim();
  }

  function mapPaymentMethodToRefund(paymentMethod) {
    var key = (paymentMethod || "").toString().trim().toLowerCase();
    if (key === "wallet") return "wallet";
    if (key === "bank") return "bank-transfer";
    if (key === "cash") return "cash";
    return "card";
  }

  function makeDefaultLine(entry, idx) {
    return {
      id: entry.id + "-L" + String(idx + 1).padStart(2, "0"),
      name: "Service",
      mainService: "General Service",
      requestedReturnQty: 1,
      approvedQty: null,
      unitPrice: 0,
      lineDecision: "pending",
      reason: entry.cancelNote || "Service return request"
    };
  }

  function normalizeLine(line, idx, entry) {
    var item = Object.assign({}, makeDefaultLine(entry, idx), line || {});
    item.id = item.id || (entry.id + "-L" + String(idx + 1).padStart(2, "0"));
    item.name = (item.name || "Service").toString();
    item.mainService = (item.mainService || item.name || "General Service").toString();
    item.requestedReturnQty = Math.max(0, toInt(item.requestedReturnQty, parseRequestedQty(item.requestedReturnQty)));
    item.unitPrice = round2(toNumber(item.unitPrice, 0));
    item.reason = (item.reason || entry.cancelNote || "Service return request").toString();

    var decision = normalizeDecision(item.lineDecision);
    var approvedQtyRaw = item.approvedQty;
    var approvedQty = approvedQtyRaw === null || approvedQtyRaw === undefined || approvedQtyRaw === ""
      ? null
      : Math.max(0, toInt(approvedQtyRaw, 0));

    if (approvedQty !== null && approvedQty > item.requestedReturnQty) {
      approvedQty = item.requestedReturnQty;
    }

    if (decision === "approved") {
      if (approvedQty === null || approvedQty <= 0) approvedQty = item.requestedReturnQty || 0;
      if (approvedQty <= 0) decision = "rejected";
    } else if (decision === "rejected") {
      approvedQty = 0;
    } else if (approvedQty !== null) {
      decision = approvedQty > 0 ? "approved" : "rejected";
    }

    if (decision === "pending" && approvedQty !== null) {
      decision = approvedQty > 0 ? "approved" : "rejected";
    }

    if (decision === "pending" && approvedQty === null) {
      item.approvedQty = null;
    } else {
      item.approvedQty = Math.max(0, toInt(approvedQty, 0));
    }

    item.lineDecision = decision;
    return item;
  }

  function applyOverride(items, override) {
    var mode = normalizeOverride(override);
    if (mode === "none") return items.slice();

    return items.map(function (item) {
      var next = Object.assign({}, item);
      if (mode === "approved") {
        next.lineDecision = "approved";
        next.approvedQty = next.requestedReturnQty;
      } else if (mode === "rejected") {
        next.lineDecision = "rejected";
        next.approvedQty = 0;
      }
      return next;
    });
  }

  function computeReturnStatus(items, override) {
    var rows = applyOverride(Array.isArray(items) ? items : [], override);
    if (!rows.length) return "Under Review";
    if (rows.some(function (item) { return normalizeDecision(item.lineDecision) === "pending"; })) return "Under Review";
    if (rows.every(function (item) { return toNumber(item.approvedQty, 0) === 0; })) return "Rejected";
    if (rows.every(function (item) { return toNumber(item.approvedQty, 0) === toNumber(item.requestedReturnQty, 0); })) return "Approved (Full)";
    return "Approved (Partial)";
  }

  function computeSubtotal(items, override) {
    var rows = applyOverride(Array.isArray(items) ? items : [], override);
    return round2(rows.reduce(function (sum, item) {
      var qty = toNumber(item.approvedQty, 0);
      if (qty <= 0) return sum;
      return sum + qty * toNumber(item.unitPrice, 0);
    }, 0));
  }

  function computeFinalAmount(entry) {
    var subtotal = computeSubtotal(entry.items || [], entry.orderDecisionOverride);
    var fees = round2(toNumber(entry.fees, 0));
    var shippingAdj = round2(toNumber(entry.shippingAdjustment, 0));
    return round2(subtotal + shippingAdj - fees);
  }

  function computeRefundStatus(current, returnStatus, finalAmount) {
    var key = (current || "").toString().trim();
    if (key === "Released" || key === "Failed") return key;
    if ((returnStatus === "Approved (Full)" || returnStatus === "Approved (Partial)") && toNumber(finalAmount, 0) > 0) {
      return "Ready to Release";
    }
    return "Not Released";
  }

  function computeDecisionCounts(items) {
    var counts = { total: 0, approved: 0, rejected: 0, pending: 0 };
    if (!Array.isArray(items)) return counts;

    items.forEach(function (item) {
      var decision = normalizeDecision(item.lineDecision);
      counts.total += 1;
      counts[decision] += 1;
    });
    return counts;
  }

  function normalizeReturn(raw) {
    var entry = Object.assign({
      id: "",
      sourceType: "",
      orderNo: "",
      orderIdDisplay: "",
      providerName: "",
      providerCode: "",
      patientName: "",
      patientCode: "",
      city: "",
      returnDate: "",
      cancelStatus: "cancelled",
      cancelSource: "customer",
      cancelType: "other",
      cancelNote: "",
      fees: 0,
      shippingAdjustment: 0,
      refundMethod: "card",
      refundStatus: "Not Released",
      orderDecisionOverride: "none",
      items: []
    }, raw || {});

    entry.sourceType = normalizeSourceType(entry.sourceType);
    entry.orderNo = (entry.orderNo || "").toString().trim();
    entry.orderIdDisplay = (entry.orderIdDisplay || entry.orderNo).toString();
    entry.id = (entry.id || makeReturnId(entry.sourceType || "facility", entry.orderNo)).toString();
    entry.providerName = (entry.providerName || "").toString();
    entry.providerCode = (entry.providerCode || "").toString();
    entry.patientName = (entry.patientName || "").toString();
    entry.patientCode = (entry.patientCode || "").toString();
    entry.city = (entry.city || "").toString();
    entry.returnDate = toIsoDate(entry.returnDate);
    entry.cancelStatus = normalizeCancelStatus(entry.cancelStatus) || "cancelled";
    entry.cancelSource = normalizeCancelSource(entry.cancelSource, entry.sourceType);
    entry.cancelType = normalizeCancelType(entry.cancelType);
    entry.cancelNote = (entry.cancelNote || "").toString();
    entry.fees = round2(toNumber(entry.fees, 0));
    entry.shippingAdjustment = round2(toNumber(entry.shippingAdjustment, 0));
    entry.refundMethod = normalizeRefundMethod(entry.refundMethod);
    entry.orderDecisionOverride = normalizeOverride(entry.orderDecisionOverride);

    entry.items = Array.isArray(entry.items) ? entry.items.map(function (item, idx) {
      return normalizeLine(item, idx, entry);
    }) : [];

    if (entry.orderDecisionOverride !== "none" && entry.refundStatus !== "Released") {
      entry.items = applyOverride(entry.items, entry.orderDecisionOverride).map(function (item, idx) {
        return normalizeLine(item, idx, entry);
      });
    }

    entry.computedReturnStatus = computeReturnStatus(entry.items, "none");
    entry.computedSubtotal = computeSubtotal(entry.items, "none");
    entry.computedFinalRefund = computeFinalAmount(entry);
    entry.refundStatus = computeRefundStatus(
      String(entry.refundStatus || "Not Released"),
      entry.computedReturnStatus,
      entry.computedFinalRefund
    );
    entry.computedRefundStatus = entry.refundStatus;
    entry.computedDecisionCounts = computeDecisionCounts(entry.items);
    entry.approvedItemsCount = entry.items.filter(function (item) {
      return toNumber(item.approvedQty, 0) > 0;
    }).length;
    entry.locked = entry.refundStatus === "Released";

    return entry;
  }

  function normalizeAll(list) {
    if (!Array.isArray(list)) return [];
    return list.map(normalizeReturn);
  }

  function buildItemsFromOrder(entry, order) {
    var services = Array.isArray(order.services) ? order.services : [];
    var rows = services.map(function (service, idx) {
      var requestedQty = parseRequestedQty(service.qty);
      return {
        id: entry.id + "-L" + String(idx + 1).padStart(2, "0"),
        name: (service.name || "Service").toString(),
        mainService: (service.mainService || service.name || "General Service").toString(),
        requestedReturnQty: requestedQty,
        approvedQty: null,
        unitPrice: round2(toNumber(service.price, 0)),
        lineDecision: "pending",
        reason: entry.cancelNote || "Service return request"
      };
    });

    if (rows.length) return rows;

    return [
      {
        id: entry.id + "-L01",
        name: "Service Charge",
        mainService: "General Service",
        requestedReturnQty: 1,
        approvedQty: null,
        unitPrice: round2(toNumber(order.order && order.order.total, 0)),
        lineDecision: "pending",
        reason: entry.cancelNote || "Service return request"
      }
    ];
  }

  function isEligibleOrder(order) {
    if (!order) return false;
    var sourceType = normalizeSourceType(order.providerType);
    if (!sourceType) return false;
    var cancelStatus = normalizeCancelStatus(order.order && order.order.status);
    return cancelStatus === "cancelled" || cancelStatus === "failed";
  }

  function buildFromOrder(order) {
    var sourceType = normalizeSourceType(order.providerType);
    var cancelStatus = normalizeCancelStatus(order.order && order.order.status);
    var cancellation = (order.order && order.order.cancellation) || {};
    var entry = {
      id: makeReturnId(sourceType, order.orderNo),
      sourceType: sourceType,
      orderNo: (order.orderNo || "").toString(),
      orderIdDisplay: (order.orderNo || "").toString(),
      providerName: (order.institutionName || "").toString(),
      providerCode: (order.institutionCode || "").toString(),
      patientName: (order.patient && order.patient.name ? order.patient.name : "").toString(),
      patientCode: (order.patient && order.patient.patientCode ? order.patient.patientCode : "").toString(),
      city: (order.patient && order.patient.city ? order.patient.city : "").toString(),
      returnDate: toIsoDate(order.order && order.order.scheduledDate) || toIsoDate(order.order && order.order.orderDate),
      cancelStatus: cancelStatus,
      cancelSource: normalizeCancelSource(cancellation.source, sourceType),
      cancelType: normalizeCancelType(cancellation.type),
      cancelNote: (cancellation.note || "").toString(),
      fees: 0,
      shippingAdjustment: 0,
      refundMethod: mapPaymentMethodToRefund(order.order && order.order.paymentMethod),
      refundStatus: "Not Released",
      orderDecisionOverride: "none",
      items: []
    };

    entry.items = buildItemsFromOrder(entry, order);
    return normalizeReturn(entry);
  }

  function candidateOrdersFromApi() {
    var api = window.NKOrderDetailsData;
    if (!api || typeof api.listOrders !== "function") return [];

    var sourceTypes = ["facility", "individual"];
    var result = [];
    sourceTypes.forEach(function (sourceType) {
      var rows = api.listOrders(sourceType) || [];
      rows.forEach(function (order) {
        if (!isEligibleOrder(order)) return;
        result.push(buildFromOrder(order));
      });
    });
    return result;
  }

  function mergeLines(baseLines, storedLines) {
    if (!Array.isArray(baseLines)) return [];
    if (!Array.isArray(storedLines) || !storedLines.length) return baseLines.slice();

    var byId = {};
    storedLines.forEach(function (line) {
      var key = (line && line.id ? String(line.id) : "").trim();
      if (key) byId[key] = line;
    });

    return baseLines.map(function (line) {
      var key = String(line.id || "").trim();
      var fromStored = key ? byId[key] : null;
      if (!fromStored) return line;
      return Object.assign({}, line, {
        approvedQty: fromStored.approvedQty,
        lineDecision: fromStored.lineDecision,
        reason: fromStored.reason || line.reason
      });
    });
  }

  function mergeGeneratedWithStored(generated, stored) {
    var storedMap = {};
    (Array.isArray(stored) ? stored : []).forEach(function (entry) {
      var sourceType = normalizeSourceType(entry && entry.sourceType);
      var orderNo = (entry && entry.orderNo ? String(entry.orderNo) : "").trim();
      if (!sourceType || !orderNo) return;
      storedMap[sourceType + "::" + orderNo] = entry;
    });

    return generated.map(function (entry) {
      var key = entry.sourceType + "::" + entry.orderNo;
      var oldEntry = storedMap[key];
      if (!oldEntry) return entry;

      var merged = Object.assign({}, entry, {
        fees: oldEntry.fees,
        shippingAdjustment: oldEntry.shippingAdjustment,
        refundMethod: oldEntry.refundMethod,
        refundStatus: oldEntry.refundStatus,
        orderDecisionOverride: oldEntry.orderDecisionOverride
      });
      merged.items = mergeLines(entry.items, oldEntry.items);
      return normalizeReturn(merged);
    });
  }

  function readStoredList() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (err) {
      return [];
    }
  }

  function save(list) {
    var normalized = normalizeAll(list || []);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch (err) {
      // Keep UI usable in environments where localStorage is restricted.
    }
    return normalized;
  }

  function load(sourceType) {
    var generated = candidateOrdersFromApi();
    var stored = readStoredList();
    var merged = mergeGeneratedWithStored(generated, stored);
    var normalized = save(merged);

    var typeKey = normalizeSourceType(sourceType);
    if (!typeKey) return normalized;
    return normalized.filter(function (entry) {
      return entry.sourceType === typeKey;
    });
  }

  function findById(id) {
    var target = (id || "").toString().trim();
    if (!target) return null;
    var rows = load();
    for (var i = 0; i < rows.length; i += 1) {
      if (String(rows[i].id) === target) return rows[i];
    }
    return null;
  }

  function release(returnId) {
    var targetId = (returnId || "").toString().trim();
    if (!targetId) return { ok: false, reason: "invalid_id" };

    var list = load();
    var index = list.findIndex(function (entry) {
      return String(entry.id) === targetId;
    });
    if (index === -1) return { ok: false, reason: "not_found" };

    var entry = list[index];
    var isApproved = entry.computedReturnStatus === "Approved (Full)" || entry.computedReturnStatus === "Approved (Partial)";
    var canRelease = isApproved && entry.computedFinalRefund > 0 && entry.computedRefundStatus === "Ready to Release";
    if (!canRelease) return { ok: false, reason: "not_ready", entry: entry };

    entry.refundStatus = "Released";
    entry.releasedAt = new Date().toISOString();
    list[index] = normalizeReturn(entry);
    save(list);
    return { ok: true, entry: list[index] };
  }

  window.NKServiceReturns = {
    STORAGE_KEY: STORAGE_KEY,
    load: load,
    save: save,
    findById: findById,
    normalizeReturn: normalizeReturn,
    computeReturnStatus: computeReturnStatus,
    computeFinalAmount: computeFinalAmount,
    computeRefundStatus: computeRefundStatus,
    release: release,
    formatMoney: formatMoney,
    formatDate: formatDate,
    clone: clone,
    normalizeRefundMethod: normalizeRefundMethod
  };
})();
