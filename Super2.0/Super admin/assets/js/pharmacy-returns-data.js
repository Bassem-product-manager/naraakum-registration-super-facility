(function () {
  var STORAGE_KEY = "nkPharmacyReturnsStateV1";

  function round2(num) {
    return Math.round((Number(num) + Number.EPSILON) * 100) / 100;
  }

  function toNumber(value, fallback) {
    var n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function cleanQty(value) {
    if (value === null || value === undefined || value === "") return null;
    var n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.floor(n));
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function seedData() {
    return [
      {
        id: "1235",
        orderId: "PO-89012",
        returnType: "Partial",
        purchaseDate: "2026-01-28",
        returnDate: "2026-02-13",
        customerName: "Ahmed Al-Qahtani",
        customerPhone: "+966 55 123 4488",
        address: "King Fahd Road, Riyadh 12214",
        mapLink: "#",
        shipping: {
          method: "Courier pickup",
          carrier: "Aramex",
          trackingNo: "ARX9382115",
          shippingCost: 12.5,
          shippingPayer: "Platform"
        },
        shippingAdjustment: 0,
        fees: 2,
        refundStatus: "Not Released",
        refundMethod: "card",
        items: [
          {
            id: "1235-1",
            name: "Omformin",
            strength: "850 mg",
            form: "Tablet",
            purchasedQty: 3,
            requestedReturnQty: 2,
            approvedQty: 1,
            unitPrice: 21.5,
            reason: "Wrong strength dispensed",
            packageCondition: "Opened",
            returnImage: "../assets/images/Omformin.webp",
            lineDecision: "approved",
            note: "One strip approved.",
            nonReturnable: false,
            availability: "Available"
          },
          {
            id: "1235-2",
            name: "BACLOFEN",
            strength: "10 mg",
            form: "Tablet",
            purchasedQty: 1,
            requestedReturnQty: 1,
            approvedQty: 1,
            unitPrice: 31,
            reason: "Side effect after first dose",
            packageCondition: "Closed",
            returnImage: "../assets/images/BACLOFEN.png",
            lineDecision: "approved",
            note: "Seal intact.",
            nonReturnable: false,
            availability: "Available"
          },
          {
            id: "1235-3",
            name: "Johnsons Baby Cream",
            strength: "50 ml",
            form: "Cream",
            purchasedQty: 1,
            requestedReturnQty: 1,
            approvedQty: 0,
            unitPrice: 19,
            reason: "Personal care item policy",
            packageCondition: "Opened",
            returnImage: "../assets/images/Johnsons.jpeg",
            lineDecision: "rejected",
            note: "Non-returnable item.",
            nonReturnable: true,
            availability: "Unavailable"
          }
        ]
      },
      {
        id: "1236",
        orderId: "PO-89019",
        returnType: "Full",
        purchaseDate: "2026-02-01",
        returnDate: "2026-02-10",
        customerName: "Noura Al-Mutairi",
        customerPhone: "+966 54 244 1188",
        address: "Prince Sultan Rd, Jeddah 23435",
        mapLink: "#",
        shipping: {
          method: "Drop-off",
          carrier: "Aramex",
          trackingNo: "ARX9430012",
          shippingCost: 0,
          shippingPayer: "Customer"
        },
        shippingAdjustment: 0,
        fees: 1,
        refundStatus: "Released",
        refundMethod: "wallet",
        items: [
          {
            id: "1236-1",
            name: "ABACAVIR",
            strength: "300 mg",
            form: "Tablet",
            purchasedQty: 1,
            requestedReturnQty: 1,
            approvedQty: 1,
            unitPrice: 74,
            reason: "Duplicate purchase",
            packageCondition: "Closed",
            returnImage: "../assets/images/ABACAVIR.png",
            lineDecision: "approved",
            note: "Validated.",
            nonReturnable: false,
            availability: "Available"
          },
          {
            id: "1236-2",
            name: "Uripan",
            strength: "100 ml",
            form: "Syrup",
            purchasedQty: 2,
            requestedReturnQty: 2,
            approvedQty: 2,
            unitPrice: 18,
            reason: "Doctor changed prescription",
            packageCondition: "Closed",
            returnImage: "../assets/images/Uripan.png",
            lineDecision: "approved",
            note: "All units sealed.",
            nonReturnable: false,
            availability: "Available"
          }
        ]
      },
      {
        id: "1237",
        orderId: "PO-89028",
        returnType: "Item",
        purchaseDate: "2026-02-07",
        returnDate: "2026-02-15",
        customerName: "Faisal Al-Harbi",
        customerPhone: "+966 50 992 3452",
        address: "Al Khobar Corniche, Khobar 31952",
        mapLink: "#",
        shipping: {
          method: "Courier pickup",
          carrier: "Aramex",
          trackingNo: "ARX9488173",
          shippingCost: 15,
          shippingPayer: "Pharmacy"
        },
        shippingAdjustment: 0,
        fees: 0,
        refundStatus: "Not Released",
        refundMethod: "bank-transfer",
        items: [
          {
            id: "1237-1",
            name: "GLUCO Test Kit",
            strength: "Model G2",
            form: "Device",
            purchasedQty: 1,
            requestedReturnQty: 1,
            approvedQty: null,
            unitPrice: 89,
            reason: "Device screen malfunction",
            packageCondition: "Damaged",
            returnImage: "../assets/images/GLUCO.jpeg",
            lineDecision: "pending",
            note: "Waiting inspection.",
            nonReturnable: false,
            availability: "Available"
          }
        ]
      },
      {
        id: "1238",
        orderId: "PO-89034",
        returnType: "Full",
        purchaseDate: "2026-01-23",
        returnDate: "2026-02-11",
        customerName: "Huda Al-Shehri",
        customerPhone: "+966 56 400 9012",
        address: "Al Aziziyah, Makkah 24243",
        mapLink: "#",
        shipping: {
          method: "Drop-off",
          carrier: "Aramex",
          trackingNo: "ARX9511078",
          shippingCost: 0,
          shippingPayer: "Customer"
        },
        shippingAdjustment: 0,
        fees: 0,
        refundStatus: "Not Released",
        refundMethod: "card",
        items: [
          {
            id: "1238-1",
            name: "Digital Thermometer",
            strength: "N/A",
            form: "Device",
            purchasedQty: 1,
            requestedReturnQty: 1,
            approvedQty: 0,
            unitPrice: 35,
            reason: "Return window exceeded",
            packageCondition: "Opened",
            returnImage: "../assets/images/Thermometer.jpeg",
            lineDecision: "rejected",
            note: "Policy rejection.",
            nonReturnable: false,
            availability: "Unavailable"
          },
          {
            id: "1238-2",
            name: "Molfix Diapers",
            strength: "Size 3",
            form: "Pack",
            purchasedQty: 2,
            requestedReturnQty: 2,
            approvedQty: 0,
            unitPrice: 42,
            reason: "Opened package",
            packageCondition: "Opened",
            returnImage: "../assets/images/molfix.webp",
            lineDecision: "rejected",
            note: "Policy rejection.",
            nonReturnable: false,
            availability: "Unavailable"
          }
        ]
      },
      {
        id: "1239",
        orderId: "PO-89051",
        returnType: "Partial",
        purchaseDate: "2026-01-30",
        returnDate: "2026-02-09",
        customerName: "Sami Al-Otaibi",
        customerPhone: "+966 58 311 8420",
        address: "Al Malqa, Riyadh 13524",
        mapLink: "#",
        shipping: {
          method: "Courier pickup",
          carrier: "Aramex",
          trackingNo: "ARX9526615",
          shippingCost: 10,
          shippingPayer: "Platform"
        },
        shippingAdjustment: -5,
        fees: 0,
        refundStatus: "Failed",
        refundMethod: "wallet",
        items: [
          {
            id: "1239-1",
            name: "BACLOFEN",
            strength: "25 mg",
            form: "Tablet",
            purchasedQty: 2,
            requestedReturnQty: 2,
            approvedQty: 1,
            unitPrice: 28,
            reason: "Partial blister damage",
            packageCondition: "Damaged",
            returnImage: "../assets/images/BACLOFEN.png",
            lineDecision: "approved",
            note: "Approved one unit.",
            nonReturnable: false,
            availability: "Available"
          },
          {
            id: "1239-2",
            name: "CeraVe Moisturizing Cream",
            strength: "170 g",
            form: "Cream",
            purchasedQty: 1,
            requestedReturnQty: 1,
            approvedQty: 0,
            unitPrice: 49,
            reason: "Opened personal care item",
            packageCondition: "Opened",
            returnImage: "../assets/images/ceraVe.webp",
            lineDecision: "rejected",
            note: "Rejected after review.",
            nonReturnable: false,
            availability: "Unavailable"
          }
        ]
      },
      {
        id: "1240",
        orderId: "PO-89060",
        returnType: "Item",
        purchaseDate: "2026-02-06",
        returnDate: "2026-02-16",
        customerName: "Mona Al-Zahrani",
        customerPhone: "+966 57 922 6601",
        address: "Al Rawdah, Jeddah 23433",
        mapLink: "#",
        shipping: {
          method: "Courier pickup",
          carrier: "Aramex",
          trackingNo: "ARX9564502",
          shippingCost: 8,
          shippingPayer: "Pharmacy"
        },
        shippingAdjustment: 0,
        fees: 0,
        refundStatus: "Not Released",
        refundMethod: "cash",
        items: [
          {
            id: "1240-1",
            name: "Omformin",
            strength: "850 mg",
            form: "Tablet",
            purchasedQty: 1,
            requestedReturnQty: 1,
            approvedQty: 1,
            unitPrice: 21.5,
            reason: "Wrong product delivered",
            packageCondition: "Closed",
            returnImage: "../assets/images/Omformin.webp",
            lineDecision: "approved",
            note: "Ready for release.",
            nonReturnable: false,
            availability: "Available"
          }
        ]
      }
    ];
  }

  function normalizeLine(line) {
    var item = Object.assign({}, line || {});
    item.requestedReturnQty = Math.max(0, Math.floor(toNumber(item.requestedReturnQty, 0)));
    item.purchasedQty = Math.max(0, Math.floor(toNumber(item.purchasedQty, 0)));
    item.unitPrice = round2(toNumber(item.unitPrice, 0));
    item.lineDecision = String(item.lineDecision || "pending").toLowerCase();

    if (item.nonReturnable) {
      item.approvedQty = 0;
      item.lineDecision = "rejected";
      return item;
    }

    var qty = cleanQty(item.approvedQty);
    if (qty === null) {
      if (item.lineDecision === "approved") {
        item.approvedQty = Math.min(Math.max(1, 1), item.requestedReturnQty);
      } else if (item.lineDecision === "rejected") {
        item.approvedQty = 0;
      } else {
        item.approvedQty = null;
        item.lineDecision = "pending";
      }
      return item;
    }

    item.approvedQty = Math.min(qty, item.requestedReturnQty);
    if (item.lineDecision === "rejected") item.approvedQty = 0;
    if (item.approvedQty > 0) item.lineDecision = "approved";
    else if (item.lineDecision !== "pending") item.lineDecision = "rejected";

    return item;
  }

  function normalizeRefundMethod(value) {
    var method = String(value || "").trim().toLowerCase();
    if (method === "card" || method === "wallet" || method === "bank-transfer" || method === "cash") {
      return method;
    }
    return "card";
  }

  function computeDecisionCounts(items) {
    var counts = { approved: 0, rejected: 0, pending: 0, total: 0 };
    if (!Array.isArray(items)) return counts;

    for (var i = 0; i < items.length; i += 1) {
      var row = items[i] || {};
      var decision = String(row.lineDecision || "pending").toLowerCase();
      if (decision !== "approved" && decision !== "rejected" && decision !== "pending") {
        decision = "pending";
      }
      counts[decision] += 1;
      counts.total += 1;
    }
    return counts;
  }

  function computeReturnStatus(items) {
    if (!Array.isArray(items) || !items.length) return "Under Review";
    if (items.some(function (item) { return item.lineDecision === "pending"; })) return "Under Review";
    if (items.every(function (item) { return toNumber(item.approvedQty, 0) === 0; })) return "Rejected";
    if (items.every(function (item) { return toNumber(item.approvedQty, 0) === toNumber(item.requestedReturnQty, 0); })) {
      return "Approved (Full)";
    }
    return "Approved (Partial)";
  }

  function computeSubtotal(items) {
    if (!Array.isArray(items)) return 0;
    return round2(items.reduce(function (sum, item) {
      var qty = toNumber(item.approvedQty, 0);
      if (qty <= 0) return sum;
      return sum + qty * toNumber(item.unitPrice, 0);
    }, 0));
  }

  function computeFinalAmount(entry) {
    var subtotal = computeSubtotal(entry.items || []);
    var shippingAdj = round2(toNumber(entry.shippingAdjustment, 0));
    var fees = round2(toNumber(entry.fees, 0));
    return round2(subtotal + shippingAdj - fees);
  }

  function computeRefundStatus(current, returnStatus, finalAmount) {
    if (current === "Released" || current === "Failed") return current;
    if ((returnStatus === "Approved (Full)" || returnStatus === "Approved (Partial)") && finalAmount > 0) {
      return "Ready to Release";
    }
    return "Not Released";
  }

  function normalizeReturn(raw) {
    var entry = Object.assign({}, raw || {});
    entry.items = Array.isArray(entry.items) ? entry.items.map(normalizeLine) : [];
    entry.shippingAdjustment = round2(toNumber(entry.shippingAdjustment, 0));
    entry.fees = round2(toNumber(entry.fees, 0));
    entry.refundMethod = normalizeRefundMethod(entry.refundMethod);
    entry.shipping = Object.assign({
      method: "-",
      carrier: "-",
      trackingNo: "-",
      shippingCost: 0,
      shippingPayer: "-"
    }, entry.shipping || {});

    entry.computedReturnStatus = computeReturnStatus(entry.items);
    entry.computedSubtotal = computeSubtotal(entry.items);
    entry.computedFinalRefund = computeFinalAmount(entry);
    entry.refundStatus = computeRefundStatus(
      String(entry.refundStatus || "Not Released"),
      entry.computedReturnStatus,
      entry.computedFinalRefund
    );
    entry.computedRefundStatus = entry.refundStatus;
    entry.approvedItemsCount = entry.items.filter(function (item) { return toNumber(item.approvedQty, 0) > 0; }).length;
    entry.computedDecisionCounts = computeDecisionCounts(entry.items);
    return entry;
  }

  function normalizeAll(list) {
    if (!Array.isArray(list)) return [];
    return list.map(normalizeReturn);
  }

  function save(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list || []));
    } catch (err) {
      // local file contexts or strict privacy settings may block storage.
      // Keep data in-memory flow working without hard failure.
    }
  }

  function load() {
    var seeded = seedData();
    var source = seeded;

    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) source = parsed;
      }
    } catch (err) {
      source = seeded;
    }

    var normalized = normalizeAll(source);
    save(normalized);
    return normalized;
  }

  function findById(list, id) {
    if (!Array.isArray(list)) return null;
    var target = String(id || "");
    for (var i = 0; i < list.length; i += 1) {
      if (String(list[i].id) === target) return list[i];
    }
    return null;
  }

  function formatMoney(value) {
    return round2(toNumber(value, 0)).toFixed(2) + " SAR";
  }

  function formatDate(value) {
    if (!value) return "-";
    var d = new Date(String(value) + "T00:00:00");
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
  }

  window.NKReturns = {
    STORAGE_KEY: STORAGE_KEY,
    seedData: seedData,
    load: load,
    save: save,
    clone: clone,
    findById: findById,
    normalizeReturn: normalizeReturn,
    normalizeAll: normalizeAll,
    normalizeRefundMethod: normalizeRefundMethod,
    computeReturnStatus: computeReturnStatus,
    computeDecisionCounts: computeDecisionCounts,
    computeSubtotal: computeSubtotal,
    computeFinalAmount: computeFinalAmount,
    computeRefundStatus: computeRefundStatus,
    formatMoney: formatMoney,
    formatDate: formatDate
  };
})();
