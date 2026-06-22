(function () {
  var DEFAULT_FEE_RATE = 0.1;
  var DEFAULT_VAT_RATE = 0.15;
  var STORAGE_KEY = "nk_payment_deposit_overrides_v1";
  var ENTITY_SETTLEMENTS_KEY = "nk_payment_entity_settlements_v1";
  var INSURANCE_CLAIMS_KEY = "nk_payment_insurance_claims_v1";
  var INSURANCE_TIMELINE_KEY = "nk_payment_insurance_timeline_v1";
  var INSURANCE_MANUAL_DOCS_KEY = "nk_payment_insurance_manual_docs_v1";
  var INSURANCE_CARRIER_POOL = [
    { code: "IN-00001", name: "BMC Insurance Co." },
    { code: "IN-00002", name: "Al Noor Insurance" },
    { code: "IN-00003", name: "Green Shield Takaful" },
    { code: "IN-00004", name: "Future Care Insurance" }
  ];

  var transactionsRaw = [
    {
      orderId: "ord-1001",
      orderNo: "12-03-000011",
      transactionNo: "TR-00001",
      providerType: "facility",
      providerName: "BMC Hospital",
      providerCode: "FC-00001",
      institutionName: "BMC Hospital",
      institutionCode: "FC-00001",
      patientName: "Sara Ibrahim",
      itemType: "service",
      orderDate: "2026-02-12T10:30:00Z",
      scheduledDate: "2026-02-13T12:00:00Z",
      basePrice: 400,
      feeRate: 0.1,
      vatRate: 0.15,
      depositRate: 0.3,
      depositPaid: 120,
      refundAmount: 0,
      paymentMethod: "card",
      transactionStatus: "completed"
    },
    {
      orderId: "ord-1002",
      orderNo: "31-03-000012",
      transactionNo: "TR-00002",
      providerType: "pharmacy",
      providerName: "Al Noor Pharmacy",
      providerCode: "PH-00002",
      institutionName: "Al Noor Pharmacy",
      institutionCode: "PH-00002",
      patientName: "Mohamed Said",
      itemType: "product",
      orderDate: "2026-02-11T09:10:00Z",
      scheduledDate: "2026-02-11T09:30:00Z",
      basePrice: 115,
      feeRate: 0.1,
      vatRate: 0.15,
      depositRate: 1,
      depositPaid: 126.5,
      refundAmount: 0,
      paymentMethod: "wallet",
      transactionStatus: "completed"
    },
    {
      orderId: "ord-1003",
      orderNo: "45-03-000023",
      transactionNo: "TR-00003",
      providerType: "individual",
      providerName: "Dr. Noura Hassan",
      providerCode: "DR-00003",
      institutionName: "Naraakum Individuals Network",
      institutionCode: "DR-00003",
      patientName: "Yousef Adel",
      itemType: "service",
      orderDate: "2026-02-10T12:05:00Z",
      scheduledDate: "2026-02-12T13:00:00Z",
      basePrice: 345,
      feeRate: 0.12,
      vatRate: 0.15,
      depositRate: 0.3,
      depositPaid: 80,
      refundAmount: 0,
      paymentMethod: "bank",
      transactionStatus: "not_yet"
    },
    {
      orderId: "ord-1004",
      orderNo: "62-03-000024",
      transactionNo: "TR-00004",
      providerType: "individual",
      providerName: "Nurse Mona Saleh",
      providerCode: "NR-00001",
      institutionName: "Naraakum Individuals Network",
      institutionCode: "NR-00001",
      patientName: "Nora Al Qahtani",
      itemType: "service",
      orderDate: "2026-02-09T08:20:00Z",
      scheduledDate: "2026-02-10T10:00:00Z",
      basePrice: 210,
      feeRate: 0.1,
      vatRate: 0.15,
      depositRate: 0.3,
      depositPaid: 30,
      refundAmount: 20,
      paymentMethod: "card",
      transactionStatus: "refunded"
    },
    {
      orderId: "ord-1005",
      orderNo: "98-03-000014",
      transactionNo: "TR-00005",
      providerType: "pharmacy",
      providerName: "Future Care Pharmacy",
      providerCode: "PH-00004",
      institutionName: "Future Care Pharmacy",
      institutionCode: "PH-00004",
      patientName: "Hassan Kamal",
      itemType: "product",
      orderDate: "2026-02-08T15:45:00Z",
      scheduledDate: "2026-02-08T16:30:00Z",
      basePrice: 90,
      feeRate: 0.1,
      vatRate: 0.15,
      depositRate: 1,
      depositPaid: 0,
      refundAmount: 0,
      paymentMethod: "wallet",
      transactionStatus: "not_yet"
    },
    {
      orderId: "ord-1006",
      orderNo: "12-03-000001",
      transactionNo: "TR-00006",
      providerType: "facility",
      providerName: "BMC Hospital",
      providerCode: "FC-00001",
      institutionName: "BMC Hospital",
      institutionCode: "FC-00001",
      patientName: "Jane Roe",
      itemType: "service",
      orderDate: "2026-02-07T11:20:00Z",
      scheduledDate: "2026-02-08T09:00:00Z",
      basePrice: 280,
      feeRate: 0.1,
      vatRate: 0.15,
      depositRate: 0.3,
      depositPaid: 106.26,
      refundAmount: 0,
      paymentMethod: "card",
      transactionStatus: "completed"
    },
    {
      orderId: "ord-1007",
      orderNo: "77-03-000105",
      transactionNo: "TR-00007",
      providerType: "facility",
      providerName: "BMC Hospital",
      providerCode: "FC-00001",
      institutionName: "BMC Hospital",
      institutionCode: "FC-00001",
      patientName: "Ali Rashad",
      itemType: "service",
      orderDate: "2026-02-06T08:10:00Z",
      scheduledDate: "2026-02-07T11:00:00Z",
      basePrice: 190,
      feeRate: 0.1,
      vatRate: 0.15,
      depositRate: 0.3,
      depositPaid: 0,
      refundAmount: 0,
      paymentMethod: "bank",
      transactionStatus: "canceled"
    },
    {
      orderId: "ord-1008",
      orderNo: "29-03-000231",
      transactionNo: "TR-00008",
      providerType: "pharmacy",
      providerName: "Al Noor Pharmacy",
      providerCode: "PH-00002",
      institutionName: "Al Noor Pharmacy",
      institutionCode: "PH-00002",
      patientName: "Mariam Adel",
      itemType: "product",
      orderDate: "2026-02-14T10:00:00Z",
      scheduledDate: "2026-02-14T11:00:00Z",
      basePrice: 160,
      feeRate: 0.1,
      vatRate: 0.15,
      depositRate: 1,
      depositPaid: 184,
      refundAmount: 0,
      paymentMethod: "wallet",
      transactionStatus: "completed"
    }
  ];

  function round2(value) {
    var num = Number(value) || 0;
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }

  function formatMoney(value) {
    return round2(value).toFixed(2) + " SAR";
  }

  function normalizeInvoiceType(value) {
    var v = (value || "").toString().trim().toLowerCase();
    if (v === "customer") return "patient";
    if (v === "patient" || v === "naraakum" || v === "provider") return v;
    return "patient";
  }

  function getInvoiceLabel(invoiceType) {
    if (invoiceType === "provider") return "Provider Invoice";
    if (invoiceType === "naraakum") return "Naraakum Invoice";
    return "Patient Invoice";
  }

  function normalizeOrderNo(orderNo) {
    return (orderNo || "").toString().trim().toLowerCase();
  }

  function normText(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function entityKey(value) {
    return (value || "").toString().trim().toUpperCase();
  }

  function parseDate(value) {
    var dt = new Date(value);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  function loadOverrides() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return {};
      return parsed;
    } catch (err) {
      return {};
    }
  }

  function persistOverrides(overrides) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides || {}));
    } catch (err) {
      // ignore storage issues
    }
  }

  function getOverride(orderNo) {
    var key = normalizeOrderNo(orderNo);
    if (!key) return null;
    return loadOverrides()[key] || null;
  }

  function setOverride(orderNo, patch) {
    var key = normalizeOrderNo(orderNo);
    if (!key) return;
    var all = loadOverrides();
    all[key] = Object.assign({}, all[key] || {}, patch || {});
    persistOverrides(all);
  }

  function clearOverride(orderNo) {
    var key = normalizeOrderNo(orderNo);
    if (!key) return;
    var all = loadOverrides();
    if (!all[key]) return;
    delete all[key];
    persistOverrides(all);
  }

  function applyOverride(raw) {
    var ov = getOverride(raw.orderNo);
    if (!ov) return Object.assign({}, raw);

    var merged = Object.assign({}, raw);
    if (Number.isFinite(Number(ov.depositPaid))) merged.depositPaid = Number(ov.depositPaid);
    if (Number.isFinite(Number(ov.refundAmount))) merged.refundAmount = Number(ov.refundAmount);
    if (ov.paymentMethod) merged.paymentMethod = ov.paymentMethod;
    if (ov.transactionStatus) merged.transactionStatus = ov.transactionStatus;
    return merged;
  }

  function resolveProviderCommission(row, basePrice, fallbackFeeRate) {
    var feeRate = Number(fallbackFeeRate);
    if (!Number.isFinite(feeRate)) feeRate = DEFAULT_FEE_RATE;

    var resolved = {
      feeRate: feeRate,
      priceFees: round2(basePrice * feeRate),
      commissionMode: "percent",
      commissionValue: round2(feeRate * 100)
    };

    var commissionApi = window.NKProviderCommissionStore;
    if (!commissionApi || typeof commissionApi.getRule !== "function") return resolved;

    var providerCode = row.providerCode || row.institutionCode || "";
    var rule = commissionApi.getRule(row.providerType, providerCode);
    if (!commissionApi.isConfigured(rule)) return resolved;

    resolved.priceFees = commissionApi.calculateCommission(basePrice, rule);
    resolved.feeRate = basePrice > 0 ? round2(resolved.priceFees / basePrice) : 0;
    resolved.commissionMode = rule.mode;
    resolved.commissionValue = rule.value;
    return resolved;
  }

  function computeFinancials(row) {
    var basePrice = round2(row.basePrice);
    var vatRate = Number(row.vatRate);
    if (!Number.isFinite(vatRate)) vatRate = DEFAULT_VAT_RATE;

    var commission = resolveProviderCommission(row, basePrice, row.feeRate);
    var feeRate = commission.feeRate;
    var priceFees = commission.priceFees;
    var vatAmount = round2((basePrice + priceFees) * vatRate);
    var totalPrice = round2(basePrice + priceFees + vatAmount);

    var depositRate = Number(row.depositRate);
    if (!Number.isFinite(depositRate)) depositRate = row.itemType === "product" ? 1 : 0.3;
    var depositRequired = round2(totalPrice * depositRate);
    var grossPaid = round2(row.depositPaid);
    var refundAmount = round2(row.refundAmount);
    var paidNet = round2(Math.max(0, grossPaid - refundAmount));
    var remaining = round2(Math.max(0, depositRequired - paidNet));

    var depositStatus = "pending";
    if (refundAmount > 0) depositStatus = "refunded";
    else if (paidNet >= depositRequired && depositRequired > 0) depositStatus = "received";

    return {
      basePrice: basePrice,
      feeRate: feeRate,
      commissionMode: commission.commissionMode,
      commissionValue: commission.commissionValue,
      vatRate: vatRate,
      priceFees: priceFees,
      vatAmount: vatAmount,
      totalPrice: totalPrice,
      depositRate: depositRate,
      depositRequired: depositRequired,
      grossPaid: grossPaid,
      paidNet: paidNet,
      refundAmount: refundAmount,
      remaining: remaining,
      depositStatus: depositStatus
    };
  }

  function enrichRow(raw) {
    var merged = applyOverride(raw);
    var money = computeFinancials(merged);
    return {
      orderId: merged.orderId,
      orderNo: merged.orderNo,
      transactionNo: merged.transactionNo,
      providerType: merged.providerType,
      providerName: merged.providerName,
      providerCode: merged.providerCode,
      institutionName: merged.institutionName,
      institutionCode: merged.institutionCode,
      patientName: merged.patientName,
      itemType: merged.itemType,
      orderDate: merged.orderDate,
      scheduledDate: merged.scheduledDate,
      paymentMethod: merged.paymentMethod,
      transactionStatus: normText(merged.transactionStatus),
      basePrice: money.basePrice,
      feeRate: money.feeRate,
      commissionMode: money.commissionMode,
      commissionValue: money.commissionValue,
      vatRate: money.vatRate,
      priceFees: money.priceFees,
      vatAmount: money.vatAmount,
      totalPrice: money.totalPrice,
      depositRate: money.depositRate,
      depositRequired: money.depositRequired,
      depositPaidGross: money.grossPaid,
      depositPaid: money.paidNet,
      refundAmount: money.refundAmount,
      remaining: money.remaining,
      depositStatus: money.depositStatus
    };
  }

  function getTransactions() {
    return transactionsRaw.map(enrichRow);
  }

  function byOrderNo(orderNo) {
    var target = normalizeOrderNo(orderNo);
    if (!target) return null;
    var rows = getTransactions();
    for (var i = 0; i < rows.length; i += 1) {
      if (normalizeOrderNo(rows[i].orderNo) === target) return rows[i];
    }
    return null;
  }

  function getInvoiceByOrder(orderNo, invoiceType) {
    var row = byOrderNo(orderNo);
    if (!row) return null;
    var normalizedType = normalizeInvoiceType(invoiceType);
    return {
      invoiceType: normalizedType,
      invoiceLabel: getInvoiceLabel(normalizedType),
      invoiceNo: "INV-" + normalizedType.slice(0, 3).toUpperCase() + "-" + row.orderNo.replace(/[^0-9]/g, ""),
      issueDate: new Date().toISOString(),
      row: row
    };
  }

  function normalizeTaxDocType(value) {
    var v = (value || "").toString().trim().toLowerCase();
    if (!v) return "";
    if (v === "customer") return "patient";
    if (v === "platform") return "naraakum";
    if (v === "patient" || v === "naraakum" || v === "provider" || v === "credit") return v;
    return "";
  }

  function getTaxDocLabel(docType) {
    if (docType === "patient") return "Patient Invoice";
    if (docType === "naraakum") return "Naraakum Invoice";
    if (docType === "provider") return "Provider Tax Context";
    if (docType === "credit") return "Credit Note";
    return "Tax Document";
  }

  function defaultProviderVatNo(providerCode, providerType) {
    var code = (providerCode || "").toString().trim().toUpperCase();
    var type = normText(providerType);

    if (!code) return "";
    if (type === "individual" || code.indexOf("DR-") === 0 || code.indexOf("NR-") === 0) return "";
    if (code === "PH-00004") return "";

    var digits = code.replace(/[^\d]/g, "");
    if (!digits) return "";
    return ("31" + digits + "000000000000").slice(0, 15);
  }

  function getProviderProfile(row) {
    var providerCode = row.providerCode || row.institutionCode || "";
    var providerName = row.providerName || row.institutionName || "Provider";
    var providerType = row.providerType || "facility";
    var vatNo = defaultProviderVatNo(providerCode, providerType);

    return {
      name: providerName,
      code: providerCode,
      type: providerType,
      vatNo: vatNo,
      address: "Saudi Arabia"
    };
  }

  function getPatientProfile(row, index) {
    var i = Number(index) + 1;
    return {
      name: row.patientName || "Patient",
      code: "PT-" + String(i).padStart(5, "0"),
      vatNo: "",
      address: "Saudi Arabia"
    };
  }

  function getNaraakumProfile() {
    return {
      name: "Naraakum Platform",
      code: "NRK-00001",
      vatNo: "310000000000001",
      address: "Riyadh, Saudi Arabia"
    };
  }

  function taxDocStatusFromTransaction(status) {
    var s = normText(status);
    if (s === "completed" || s === "refunded") return "issued";
    if (s === "not_yet") return "draft";
    if (s === "canceled") return "canceled";
    return "draft";
  }

  function buildInvoiceNo(orderNo, docType) {
    var prefix = "DOC";
    if (docType === "patient") prefix = "PAT";
    else if (docType === "naraakum") prefix = "NRK";
    else if (docType === "provider") prefix = "CTX";
    else if (docType === "credit") prefix = "CRN";
    return "TAX-" + prefix + "-" + String(orderNo || "").replace(/[^\d]/g, "");
  }

  function computeCreditVat(row) {
    var refund = round2(Math.max(0, row.refundAmount));
    if (refund <= 0) return 0;
    var total = round2(Math.max(0.0001, row.totalPrice));
    var ratio = Math.min(1, refund / total);
    return round2(row.vatAmount * ratio);
  }

  function getTaxBreakdownByOrder(orderNo) {
    var row = byOrderNo(orderNo);
    if (!row) return null;

    var patientTaxableBase = round2(row.basePrice);
    var naraakumTaxableBase = round2(row.priceFees);
    var vatRate = Number(row.vatRate || DEFAULT_VAT_RATE);
    var patientVat = round2(patientTaxableBase * vatRate);
    var naraakumVat = round2(naraakumTaxableBase * vatRate);
    var providerVatContext = patientVat;
    var creditVat = computeCreditVat(row);
    var netVat = round2(patientVat + naraakumVat - creditVat);
    var grossTaxableAmount = round2(patientTaxableBase + naraakumTaxableBase - round2(creditVat / Math.max(vatRate, 0.0001)));

    return {
      orderNo: row.orderNo,
      transactionNo: row.transactionNo,
      price: row.basePrice,
      priceFees: row.priceFees,
      totalPrice: row.totalPrice,
      vatRate: vatRate,
      patientTaxableBase: patientTaxableBase,
      naraakumTaxableBase: naraakumTaxableBase,
      patientVat: patientVat,
      naraakumVat: naraakumVat,
      providerVatContext: providerVatContext,
      creditVat: creditVat,
      netVat: netVat,
      grossTaxableAmount: grossTaxableAmount
    };
  }

  function buildComplianceFlags(row, docType, status, providerProfile) {
    var flags = [];
    if (!providerProfile.vatNo) flags.push("Missing VAT No");
    if (status === "draft") flags.push("Draft");
    if (status === "canceled") flags.push("Canceled");
    if (row.transactionStatus === "refunded") flags.push("Refunded");
    if (docType === "credit") flags.push("Credit Note Linked");
    if (docType === "provider") flags.push("Context Only");
    return flags;
  }

  function makeTaxDoc(row, docType, docStatus, index) {
    var breakdown = getTaxBreakdownByOrder(row.orderNo) || {};
    var provider = getProviderProfile(row);
    var patient = getPatientProfile(row, index);
    var naraakum = getNaraakumProfile();

    var seller = provider;
    var buyer = patient;
    var taxableBase = 0;
    var vatAmount = 0;
    var totalAmount = 0;
    var referenceOnly = false;

    if (docType === "patient") {
      seller = provider;
      buyer = patient;
      taxableBase = breakdown.patientTaxableBase || 0;
      vatAmount = breakdown.patientVat || 0;
      totalAmount = round2(taxableBase + vatAmount);
    } else if (docType === "naraakum") {
      seller = naraakum;
      buyer = provider;
      taxableBase = breakdown.naraakumTaxableBase || 0;
      vatAmount = breakdown.naraakumVat || 0;
      totalAmount = round2(taxableBase + vatAmount);
    } else if (docType === "provider") {
      seller = provider;
      buyer = naraakum;
      taxableBase = breakdown.patientTaxableBase || 0;
      vatAmount = breakdown.providerVatContext || 0;
      totalAmount = round2(taxableBase + vatAmount);
      referenceOnly = true;
    } else if (docType === "credit") {
      seller = provider;
      buyer = patient;
      var creditVat = breakdown.creditVat || 0;
      taxableBase = round2(-(creditVat / Math.max(breakdown.vatRate || DEFAULT_VAT_RATE, 0.0001)));
      vatAmount = round2(-creditVat);
      totalAmount = round2(taxableBase + vatAmount);
    }

    var issueDate = row.orderDate ? String(row.orderDate).slice(0, 10) : new Date().toISOString().slice(0, 10);
    var flags = buildComplianceFlags(row, docType, docStatus, provider);

    return {
      id: buildInvoiceNo(row.orderNo, docType),
      invoiceNo: buildInvoiceNo(row.orderNo, docType),
      docType: docType,
      docLabel: getTaxDocLabel(docType),
      status: docStatus,
      issueDate: issueDate,
      orderNo: row.orderNo,
      transactionNo: row.transactionNo,
      providerType: row.providerType,
      providerName: provider.name,
      providerCode: provider.code,
      patientName: patient.name,
      sellerName: seller.name,
      sellerCode: seller.code,
      sellerVatNo: seller.vatNo || "",
      buyerName: buyer.name,
      buyerCode: buyer.code,
      buyerVatNo: buyer.vatNo || "",
      taxableBase: round2(taxableBase),
      vatAmount: round2(vatAmount),
      totalAmount: round2(totalAmount),
      vatRate: Number(row.vatRate || DEFAULT_VAT_RATE),
      sourceStatus: row.transactionStatus,
      referenceOnly: referenceOnly,
      complianceFlags: flags,
      breakdown: breakdown
    };
  }

  function buildTaxDocumentsFromRow(row, index) {
    var docs = [];
    var txStatus = normText(row.transactionStatus);
    var docStatus = taxDocStatusFromTransaction(txStatus);

    if (txStatus === "completed" || txStatus === "refunded" || txStatus === "not_yet") {
      docs.push(makeTaxDoc(row, "patient", docStatus, index));
      if (row.priceFees > 0) docs.push(makeTaxDoc(row, "naraakum", docStatus, index));
      docs.push(makeTaxDoc(row, "provider", docStatus, index));

      if (txStatus === "refunded" && row.refundAmount > 0) {
        docs.push(makeTaxDoc(row, "credit", "issued", index));
      }
      return docs;
    }

    if (txStatus === "canceled") {
      docs.push(makeTaxDoc(row, "patient", "canceled", index));
    }

    return docs;
  }

  function getTaxDocuments(filters) {
    var f = filters || {};
    var rows = getTransactions();
    var docs = [];

    rows.forEach(function (row, index) {
      docs = docs.concat(buildTaxDocumentsFromRow(row, index));
    });

    var docType = normalizeTaxDocType(f.docType || f.invoiceType);
    var status = normText(f.status);
    var entityType = normText(f.entityType || f.providerType);
    var providerCode = entityKey(f.providerCode || f.entity);
    var orderNo = normalizeOrderNo(f.orderNo);
    var search = normText(f.search);
    var dateFrom = normText(f.dateFrom || f.from);
    var dateTo = normText(f.dateTo || f.to);

    return docs
      .filter(function (doc) {
        if (docType && doc.docType !== docType) return false;
        if (status && normText(doc.status) !== status) return false;
        if (entityType && normText(doc.providerType) !== entityType) return false;
        if (providerCode && entityKey(doc.providerCode) !== providerCode) return false;
        if (orderNo && normalizeOrderNo(doc.orderNo) !== orderNo) return false;

        var issueDate = (doc.issueDate || "").toString().slice(0, 10);
        if (dateFrom && issueDate && issueDate < dateFrom) return false;
        if (dateTo && issueDate && issueDate > dateTo) return false;

        if (search) {
          var text = [
            doc.invoiceNo,
            doc.orderNo,
            doc.transactionNo,
            doc.providerName,
            doc.providerCode,
            doc.patientName,
            doc.sellerName,
            doc.buyerName,
            doc.docType,
            doc.status,
            (doc.complianceFlags || []).join(" ")
          ]
            .join(" ")
            .toLowerCase();
          if (text.indexOf(search) === -1) return false;
        }

        return true;
      })
      .sort(function (a, b) {
        var da = new Date(a.issueDate).getTime();
        var db = new Date(b.issueDate).getTime();
        if (db !== da) return db - da;
        return a.invoiceNo < b.invoiceNo ? -1 : 1;
      });
  }

  function getTaxKpis(filters) {
    var docs = getTaxDocuments(filters);
    var issuedDocs = docs.filter(function (doc) {
      return doc.status === "issued";
    });

    var patientVat = 0;
    var naraakumVat = 0;
    var providerVatContext = 0;
    var creditVat = 0;
    var grossTaxableAmount = 0;
    var grossTotal = 0;

    issuedDocs.forEach(function (doc) {
      if (doc.docType === "patient") {
        patientVat = round2(patientVat + doc.vatAmount);
        grossTaxableAmount = round2(grossTaxableAmount + doc.taxableBase);
        grossTotal = round2(grossTotal + doc.totalAmount);
      } else if (doc.docType === "naraakum") {
        naraakumVat = round2(naraakumVat + doc.vatAmount);
        grossTaxableAmount = round2(grossTaxableAmount + doc.taxableBase);
        grossTotal = round2(grossTotal + doc.totalAmount);
      } else if (doc.docType === "provider") {
        providerVatContext = round2(providerVatContext + doc.vatAmount);
      } else if (doc.docType === "credit") {
        creditVat = round2(creditVat + Math.abs(doc.vatAmount));
        grossTaxableAmount = round2(grossTaxableAmount + doc.taxableBase);
        grossTotal = round2(grossTotal + doc.totalAmount);
      }
    });

    var netVat = round2(patientVat + naraakumVat - creditVat);

    return {
      totalDocs: docs.length,
      issuedDocs: issuedDocs.length,
      creditNotes: issuedDocs.filter(function (doc) {
        return doc.docType === "credit";
      }).length,
      patientVat: patientVat,
      naraakumVat: naraakumVat,
      providerVatContext: providerVatContext,
      creditVat: creditVat,
      netVat: netVat,
      grossTaxableAmount: grossTaxableAmount,
      grossTotal: grossTotal
    };
  }

  function getTaxDocument(orderNo, docType) {
    var order = byOrderNo(orderNo);
    if (!order) return null;

    var normalizedType = normalizeTaxDocType(docType || "patient") || "patient";
    var docs = buildTaxDocumentsFromRow(order, 0);
    for (var i = 0; i < docs.length; i += 1) {
      if (docs[i].docType === normalizedType) return docs[i];
    }
    return null;
  }

  function getDeposits() {
    return getTransactions().map(function (row, index) {
      return {
        depositId: "DP-" + String(index + 1).padStart(6, "0"),
        orderNo: row.orderNo,
        transactionNo: row.transactionNo,
        patientName: row.patientName,
        institutionName: row.institutionName,
        paymentMethod: row.paymentMethod,
        required: row.depositRequired,
        paid: row.depositPaid,
        paidGross: row.depositPaidGross,
        refunded: row.refundAmount,
        remaining: row.remaining,
        status: row.depositStatus,
        dueDate: row.scheduledDate,
        providerCode: row.providerCode
      };
    });
  }

  function loadEntitySettlements() {
    try {
      var raw = localStorage.getItem(ENTITY_SETTLEMENTS_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function persistEntitySettlements(entries) {
    try {
      localStorage.setItem(ENTITY_SETTLEMENTS_KEY, JSON.stringify(entries || []));
    } catch (err) {
      // ignore storage issues
    }
  }

  function nextSettlementId(entries) {
    var max = 0;
    (entries || []).forEach(function (entry) {
      var digits = String(entry && entry.settlementId ? entry.settlementId : "").replace(/[^\d]/g, "");
      var num = Number(digits);
      if (Number.isFinite(num) && num > max) max = num;
    });
    return "ST-" + String(max + 1).padStart(6, "0");
  }

  function normalizeDirection(value) {
    var v = normText(value);
    if (v === "payout" || v === "collection") return v;
    return "";
  }

  function normalizePayoutMode(value) {
    var v = normText(value);
    if (v === "all" || v === "selected") return v;
    if (v === "custom" || v === "legacy-custom") return "legacy-custom";
    return "";
  }

  function classifyOrder(row) {
    var status = normText(row.transactionStatus);
    var completedLike = status === "completed" || status === "refunded";
    var expected = status === "not_yet";
    var excluded = status === "canceled";

    var completedValue = completedLike ? round2(row.basePrice) : 0;
    var refundValue = completedLike ? round2(Math.max(0, row.refundAmount)) : 0;
    var expectedValue = expected ? round2(row.basePrice) : 0;

    var classification = "excluded";
    if (completedLike) classification = "payable";
    else if (expected) classification = "expected";

    return {
      classification: classification,
      completedValue: completedValue,
      refundValue: refundValue,
      expectedValue: expectedValue,
      payableNowComponent: completedLike ? round2(Math.max(0, completedValue - refundValue)) : 0,
      excluded: excluded
    };
  }

  function payoutStatus(payableBeforePayout, paidOut, payableNow) {
    if (payableBeforePayout <= 0 || payableNow <= 0) return "settled";
    if (paidOut > 0) return "partially_settled";
    return "due";
  }

  function payoutStatusLabel(status) {
    if (status === "due") return "Due";
    if (status === "partially_settled") return "Partially Settled";
    return "Settled";
  }

  function orderOutstanding(order) {
    var due = round2(order && order.payableComponent);
    var settled = round2(order && order.settledAmount);
    return round2(Math.max(0, due - settled));
  }

  function orderTimeValue(order, fallbackMax) {
    var dt = parseDate(order && order.orderDate) || parseDate(order && order.scheduledDate);
    if (dt) return dt.getTime();
    return fallbackMax ? Number.MAX_SAFE_INTEGER : 0;
  }

  function sortOrdersFifo(rows) {
    return (rows || []).slice().sort(function (a, b) {
      return orderTimeValue(a, true) - orderTimeValue(b, true);
    });
  }

  function normalizeLinkedOrders(rows) {
    if (!Array.isArray(rows)) return [];
    var result = [];
    rows.forEach(function (row) {
      var orderNo = row && row.orderNo ? String(row.orderNo).trim() : "";
      var amount = round2(row && row.amount);
      if (!orderNo || !(amount > 0)) return;
      result.push({ orderNo: orderNo, amount: amount });
    });
    return result;
  }

  function mergeLinkedOrders(rows) {
    var map = {};
    var order = [];

    (rows || []).forEach(function (row) {
      var key = normalizeOrderNo(row && row.orderNo);
      var amount = round2(row && row.amount);
      if (!key || !(amount > 0)) return;
      if (!map[key]) {
        map[key] = {
          orderNo: row.orderNo,
          amount: 0
        };
        order.push(key);
      }
      map[key].amount = round2(map[key].amount + amount);
    });

    return order.map(function (key) {
      return map[key];
    });
  }

  function sumLinkedAmount(rows) {
    var total = 0;
    (rows || []).forEach(function (row) {
      total = round2(total + round2(row && row.amount));
    });
    return total;
  }

  function applyLinkedOrders(entries, orders) {
    var links = normalizeLinkedOrders(entries);
    if (!links.length) return [];

    var resolved = [];
    links.forEach(function (link) {
      var key = normalizeOrderNo(link.orderNo);
      if (!key) return;

      var target = null;
      for (var i = 0; i < orders.length; i += 1) {
        if (normalizeOrderNo(orders[i].orderNo) === key) {
          target = orders[i];
          break;
        }
      }

      if (!target || target.classification !== "payable") return;

      var outstanding = orderOutstanding(target);
      if (!(outstanding > 0)) return;

      var applied = round2(Math.min(outstanding, link.amount));
      if (!(applied > 0)) return;

      target.settledAmount = round2((target.settledAmount || 0) + applied);
      resolved.push({
        orderNo: target.orderNo,
        amount: applied
      });
    });

    return mergeLinkedOrders(resolved);
  }

  function allocateFifoOrders(orders, requestedAmount, applyToOrders) {
    var left = round2(requestedAmount);
    if (!(left > 0)) return [];

    var candidates = sortOrdersFifo(orders).filter(function (order) {
      return order.classification === "payable";
    });

    var allocations = [];
    candidates.forEach(function (order) {
      if (!(left > 0.0009)) return;

      var available = applyToOrders === false ? round2(order.payableOutstanding) : orderOutstanding(order);
      if (!(available > 0)) return;

      var applied = round2(Math.min(available, left));
      if (!(applied > 0)) return;

      if (applyToOrders !== false) {
        order.settledAmount = round2((order.settledAmount || 0) + applied);
      }

      left = round2(left - applied);
      allocations.push({
        orderNo: order.orderNo,
        amount: applied
      });
    });

    return mergeLinkedOrders(allocations);
  }

  function buildEntityMaps() {
    var txRows = getTransactions();
    var settlementRows = loadEntitySettlements();
    var byEntity = {};

    txRows.forEach(function (row) {
      var code = entityKey(row.providerCode);
      if (!code) return;

      if (!byEntity[code]) {
        byEntity[code] = {
          providerCode: code,
          providerName: row.providerName,
          providerType: row.providerType,
          institutionName: row.institutionName,
          institutionCode: row.institutionCode || code,
          totalOrders: 0,
          completedValue: 0,
          refundsValue: 0,
          expectedValue: 0,
          excludedCount: 0,
          payableBeforePayout: 0,
          paidOut: 0,
          payableNow: 0,
          status: "settled",
          statusLabel: "Settled",
          oldestDueDate: "",
          orders: [],
          settlements: []
        };
      }

      var info = classifyOrder(row);
      var target = byEntity[code];
      target.totalOrders += 1;
      target.completedValue = round2(target.completedValue + info.completedValue);
      target.refundsValue = round2(target.refundsValue + info.refundValue);
      target.expectedValue = round2(target.expectedValue + info.expectedValue);
      if (info.excluded) target.excludedCount += 1;

      target.orders.push({
        orderId: row.orderId,
        orderNo: row.orderNo,
        transactionNo: row.transactionNo,
        patientName: row.patientName,
        status: row.transactionStatus,
        itemType: row.itemType,
        paymentMethod: row.paymentMethod,
        orderDate: row.orderDate,
        scheduledDate: row.scheduledDate,
        basePrice: row.basePrice,
        refundAmount: row.refundAmount,
        classification: info.classification,
        payableComponent: info.payableNowComponent,
        settledAmount: 0,
        payableOutstanding: info.payableNowComponent,
        isPayableNow: false,
        isSelectable: false,
        selectionReason: "",
        expectedComponent: info.expectedValue,
        invoiceType: "provider"
      });
    });

    settlementRows
      .slice()
      .sort(function (a, b) {
        var aDate = parseDate(a && a.createdAt);
        var bDate = parseDate(b && b.createdAt);
        var at = aDate ? aDate.getTime() : 0;
        var bt = bDate ? bDate.getTime() : 0;
        return at - bt;
      })
      .forEach(function (entry) {
      var code = entityKey(entry.providerCode);
      if (!code || !byEntity[code]) return;
      if ((entry.status || "posted") !== "posted") return;
      if (normalizeDirection(entry.direction) !== "payout") return;

      var entity = byEntity[code];
      var requestedAmount = round2(entry.amount);
      var mode = normalizePayoutMode(entry.mode);
      var linked = applyLinkedOrders(entry.linkedOrders, entity.orders);

      if (!linked.length && requestedAmount > 0) {
        linked = allocateFifoOrders(entity.orders, requestedAmount, true);
        if (!mode) mode = "legacy-custom";
      }

      var linkedAmount = sumLinkedAmount(linked);

      entity.settlements.push({
        settlementId: entry.settlementId || nextSettlementId(entity.settlements),
        providerCode: code,
        providerName: entry.providerName || entity.providerName,
        direction: "payout",
        amount: requestedAmount,
        linkedAmount: linkedAmount,
        linkedOrders: linked,
        method: entry.method || "bank",
        destinationType: entry.destinationType || "",
        destinationId: entry.destinationId || "",
        destinationLabel: entry.destinationLabel || "",
        createdAt: entry.createdAt || new Date().toISOString(),
        status: entry.status || "posted",
        mode: mode || "legacy-custom"
      });
    });

    Object.keys(byEntity).forEach(function (code) {
      var entity = byEntity[code];
      entity.orders.forEach(function (order) {
        order.settledAmount = round2(order.settledAmount);
        order.payableOutstanding = order.classification === "payable" ? orderOutstanding(order) : 0;
        order.isPayableNow = order.classification === "payable" && order.payableOutstanding > 0.009;
        order.isSelectable = order.isPayableNow;

        if (order.classification === "expected") {
          order.selectionReason = "Expected (not due yet)";
        } else if (order.classification === "excluded") {
          order.selectionReason = "Excluded (canceled)";
        } else if (!order.isSelectable) {
          order.selectionReason = "Already Settled";
        } else {
          order.selectionReason = "";
        }
      });

      entity.payableBeforePayout = round2(
        entity.orders.reduce(function (sum, row) {
          return round2(sum + (row.classification === "payable" ? round2(row.payableComponent) : 0));
        }, 0)
      );

      entity.paidOut = round2(
        entity.orders.reduce(function (sum, row) {
          return round2(sum + round2(row.settledAmount));
        }, 0)
      );

      entity.payableNow = round2(
        entity.orders.reduce(function (sum, row) {
          return round2(sum + (row.classification === "payable" ? round2(row.payableOutstanding) : 0));
        }, 0)
      );

      entity.status = payoutStatus(entity.payableBeforePayout, entity.paidOut, entity.payableNow);
      entity.statusLabel = payoutStatusLabel(entity.status);

      var dueDates = entity.orders
        .filter(function (order) {
          return order.isPayableNow;
        })
        .map(function (order) {
          return parseDate(order.scheduledDate);
        })
        .filter(function (dt) {
          return !!dt;
        })
        .sort(function (a, b) {
          return a.getTime() - b.getTime();
        });

      entity.oldestDueDate = dueDates.length ? dueDates[0].toISOString() : "";

      entity.orders.sort(function (a, b) {
        return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
      });

      entity.settlements.sort(function (a, b) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    });

    return byEntity;
  }

  function getEntityPayoutSummaries(filters) {
    var entityMap = buildEntityMaps();
    var all = Object.keys(entityMap)
      .map(function (code) {
        return entityMap[code];
      })
      .sort(function (a, b) {
        return b.payableNow - a.payableNow;
      });

    var f = filters || {};
    var search = normText(f.search);
    var type = normText(f.providerType);
    var status = normText(f.status);
    var dateFrom = normText(f.dateFrom);
    var dateTo = normText(f.dateTo);

    return all.filter(function (row) {
      if (type && normText(row.providerType) !== type) return false;
      if (status && normText(row.status) !== status) return false;

      if (search) {
        var text = [row.institutionName, row.providerName, row.providerCode, row.providerType].join(" ").toLowerCase();
        if (text.indexOf(search) === -1) return false;
      }

      var oldest = row.oldestDueDate ? row.oldestDueDate.slice(0, 10) : "";
      if (dateFrom && oldest && oldest < dateFrom) return false;
      if (dateTo && oldest && oldest > dateTo) return false;
      return true;
    });
  }

  function getEntityLedger(providerCode) {
    var code = entityKey(providerCode);
    if (!code) return null;

    var all = buildEntityMaps();
    if (!all[code]) return null;

    var entity = all[code];
    var completedInvoices = entity.orders.filter(function (row) {
      return row.status === "completed" || row.status === "refunded";
    });
    var refunds = entity.orders.filter(function (row) {
      return row.refundAmount > 0;
    });

    return {
      providerCode: entity.providerCode,
      providerName: entity.providerName,
      providerType: entity.providerType,
      institutionName: entity.institutionName,
      institutionCode: entity.institutionCode,
      kpis: {
        totalOrders: entity.totalOrders,
        completedValue: entity.completedValue,
        refundsValue: entity.refundsValue,
        paidOut: entity.paidOut,
        payableNow: entity.payableNow,
        expectedValue: entity.expectedValue
      },
      status: entity.status,
      statusLabel: entity.statusLabel,
      oldestDueDate: entity.oldestDueDate,
      orders: entity.orders.slice(),
      completedInvoices: completedInvoices,
      refunds: refunds,
      settlements: entity.settlements.slice()
    };
  }

  function createEntityPayout(providerCode, payload) {
    var code = entityKey(providerCode);
    if (!code) return { ok: false, message: "Entity code is required" };

    var summary = getEntityLedger(code);
    if (!summary) return { ok: false, message: "Entity not found" };

    var amount = round2(payload && payload.amount);
    if (!(amount > 0)) return { ok: false, message: "Invalid amount" };
    if (amount - summary.kpis.payableNow > 0.009) return { ok: false, message: "Amount exceeds payable now" };

    var method = normText(payload && payload.method);
    if (method !== "bank" && method !== "wallet") method = "bank";
    var destinationType = normText(payload && payload.destinationType);
    if (destinationType !== "bank" && destinationType !== "wallet") destinationType = method;
    var destinationId = String((payload && payload.destinationId) || "").trim();
    var destinationLabel = String((payload && payload.destinationLabel) || "").trim();

    var mode = normalizePayoutMode(payload && payload.mode);
    if (!mode || mode === "legacy-custom") mode = "all";

    var payableOrders = (summary.orders || []).filter(function (row) {
      return row.isSelectable;
    });
    if (!payableOrders.length) return { ok: false, message: "No payable orders available" };

    var linkedOrders = [];
    if (mode === "all") {
      var requiredAll = round2(summary.kpis.payableNow);
      if (Math.abs(amount - requiredAll) > 0.009) {
        return { ok: false, message: "Pay All requires exact current payable amount" };
      }
      linkedOrders = payableOrders
        .map(function (row) {
          return {
            orderNo: row.orderNo,
            amount: round2(row.payableOutstanding)
          };
        })
        .filter(function (row) {
          return row.amount > 0;
        });
    } else if (mode === "selected") {
      var selectedRaw = Array.isArray(payload && payload.selectedOrderNos) ? payload.selectedOrderNos : [];
      var selectedMap = {};
      selectedRaw.forEach(function (orderNo) {
        var key = normalizeOrderNo(orderNo);
        if (!key) return;
        selectedMap[key] = true;
      });

      linkedOrders = payableOrders
        .filter(function (row) {
          return !!selectedMap[normalizeOrderNo(row.orderNo)];
        })
        .map(function (row) {
          return {
            orderNo: row.orderNo,
            amount: round2(row.payableOutstanding)
          };
        })
        .filter(function (row) {
          return row.amount > 0;
        });

      if (!linkedOrders.length) {
        return { ok: false, message: "Select at least one payable order" };
      }

      var selectedTotal = sumLinkedAmount(linkedOrders);
      if (Math.abs(amount - selectedTotal) > 0.009) {
        return { ok: false, message: "Selected mode requires exact selected outstanding amount" };
      }
    } else {
      return { ok: false, message: "Invalid payout mode" };
    }

    var linkedAmount = sumLinkedAmount(linkedOrders);
    if (!(linkedAmount > 0)) return { ok: false, message: "Linked payout amount is invalid" };
    if ((mode === "all" || mode === "selected") && Math.abs(linkedAmount - amount) > 0.009) {
      return { ok: false, message: "Payout amount must match linked orders total" };
    }

    var entries = loadEntitySettlements();
    var entry = {
      settlementId: nextSettlementId(entries),
      providerCode: code,
      providerName: summary.providerName,
      direction: "payout",
      amount: amount,
      linkedAmount: linkedAmount,
      linkedOrders: linkedOrders,
      method: method,
       destinationType: destinationType,
       destinationId: destinationId,
       destinationLabel: destinationLabel,
      mode: mode,
      createdAt: new Date().toISOString(),
      status: "posted"
    };

    entries.push(entry);
    persistEntitySettlements(entries);
    return { ok: true, entry: entry };
  }

  function getEntityDashboardTotals(rows) {
    var list = Array.isArray(rows) ? rows : getEntityPayoutSummaries();
    var totals = {
      totalPayableNow: 0,
      totalRefunds: 0,
      totalPaidOut: 0,
      entitiesDue: 0
    };

    list.forEach(function (row) {
      totals.totalPayableNow = round2(totals.totalPayableNow + row.payableNow);
      totals.totalRefunds = round2(totals.totalRefunds + row.refundsValue);
      totals.totalPaidOut = round2(totals.totalPaidOut + row.paidOut);
      if (row.payableNow > 0.009) totals.entitiesDue += 1;
    });

    return totals;
  }

  function normalizeInsuranceLifecycleStatus(value) {
    var v = normText(value);
    if (
      v === "submitted" ||
      v === "in_review" ||
      v === "approved" ||
      v === "partially_paid" ||
      v === "paid" ||
      v === "denied" ||
      v === "appealed" ||
      v === "closed"
    ) {
      return v;
    }
    return "submitted";
  }

  function normalizeInsuranceLifecycleFilter(value) {
    var v = normText(value);
    if (!v) return "";
    if (
      v === "submitted" ||
      v === "in_review" ||
      v === "approved" ||
      v === "partially_paid" ||
      v === "paid" ||
      v === "denied" ||
      v === "appealed" ||
      v === "closed"
    ) {
      return v;
    }
    return "";
  }

  function normalizeInsuranceRemittanceStatus(value) {
    var v = normText(value);
    if (v === "pending" || v === "partial" || v === "paid" || v === "rejected") return v;
    return "pending";
  }

  function normalizeInsuranceRemittanceFilter(value) {
    var v = normText(value);
    if (!v) return "";
    if (v === "pending" || v === "partial" || v === "paid" || v === "rejected") return v;
    return "";
  }

  function insuranceStatusLabel(status) {
    var s = normalizeInsuranceLifecycleStatus(status);
    if (s === "in_review") return "In Review";
    if (s === "partially_paid") return "Partially Paid";
    if (s === "appealed") return "Appealed";
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function insuranceRemittanceLabel(status) {
    var s = normalizeInsuranceRemittanceStatus(status);
    if (s === "partial") return "Partial";
    if (s === "rejected") return "Rejected";
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function insuranceDocTypesForStatus(status) {
    var s = normalizeInsuranceLifecycleStatus(status);
    if (s === "submitted" || s === "in_review") return ["claim"];
    if (s === "approved") return ["claim", "insurance_invoice"];
    return ["claim", "insurance_invoice", "remittance_credit"];
  }

  function insuranceOutstandingAmount(claim) {
    return round2(Math.max(0, round2(claim.approvedAmount) - round2(claim.paidAmount)));
  }

  function isoDateOnly(value) {
    var dt = parseDate(value);
    if (!dt) return new Date().toISOString().slice(0, 10);
    return dt.toISOString().slice(0, 10);
  }

  function addDaysToDateOnly(value, days) {
    var dt = parseDate(isoDateOnly(value) + "T00:00:00Z");
    if (!dt) dt = new Date();
    dt.setUTCDate(dt.getUTCDate() + (parseInt(days, 10) || 0));
    return dt.toISOString().slice(0, 10);
  }

  function timelineAtDate(value, hour) {
    var dt = parseDate(isoDateOnly(value) + "T00:00:00Z");
    if (!dt) dt = new Date();
    dt.setUTCHours(Math.max(0, Math.min(23, Number(hour) || 9)), 0, 0, 0);
    return dt.toISOString();
  }

  function insuranceClaimIdentity(claimId, fallbackIndex) {
    var id = (claimId || "").toString().trim().toUpperCase();
    if (id) return id;
    return "CLM-2026-" + String(Number(fallbackIndex) + 1).padStart(6, "0");
  }

  function insurancePolicyNo(index, insuranceCode) {
    var digits = String(insuranceCode || "").replace(/[^\d]/g, "");
    var suffix = digits ? digits.slice(-4) : "0000";
    return "POL-" + suffix + "-" + String(Number(index) + 1).padStart(6, "0");
  }

  function normalizeInsuranceClaim(raw, index) {
    var carrier = INSURANCE_CARRIER_POOL[index % INSURANCE_CARRIER_POOL.length] || INSURANCE_CARRIER_POOL[0];
    var claimAmount = round2(Math.max(0, Number(raw && raw.claimAmount)));
    var approvedAmount = round2(Math.max(0, Number(raw && raw.approvedAmount)));
    var paidAmount = round2(Math.max(0, Number(raw && raw.paidAmount)));
    var lifecycleStatus = normalizeInsuranceLifecycleStatus(raw && raw.lifecycleStatus);
    var remittanceStatus = normalizeInsuranceRemittanceStatus(raw && raw.remittanceStatus);
    var claimId = insuranceClaimIdentity(raw && raw.claimId, index);

    if (!(claimAmount > 0)) {
      claimAmount = round2(Math.max(0, Number(raw && raw.totalPrice)));
    }
    if (!(claimAmount > 0)) claimAmount = 1;

    if (lifecycleStatus === "submitted" || lifecycleStatus === "in_review") {
      approvedAmount = 0;
      paidAmount = 0;
      remittanceStatus = "pending";
    } else if (lifecycleStatus === "approved") {
      if (!(approvedAmount > 0)) approvedAmount = round2(claimAmount * 0.85);
      approvedAmount = round2(Math.min(claimAmount, approvedAmount));
      paidAmount = round2(Math.min(Math.max(0, paidAmount), approvedAmount));
      remittanceStatus = paidAmount > 0 ? (paidAmount >= approvedAmount ? "paid" : "partial") : "pending";
    } else if (lifecycleStatus === "partially_paid") {
      if (!(approvedAmount > 0)) approvedAmount = round2(claimAmount * 0.8);
      approvedAmount = round2(Math.min(claimAmount, approvedAmount));
      if (!(paidAmount > 0 && paidAmount < approvedAmount)) paidAmount = round2(approvedAmount * 0.45);
      paidAmount = round2(Math.min(approvedAmount, Math.max(0, paidAmount)));
      remittanceStatus = paidAmount >= approvedAmount ? "paid" : "partial";
    } else if (lifecycleStatus === "paid") {
      if (!(approvedAmount > 0)) approvedAmount = round2(claimAmount * 0.9);
      approvedAmount = round2(Math.min(claimAmount, approvedAmount));
      paidAmount = approvedAmount;
      remittanceStatus = "paid";
    } else if (lifecycleStatus === "denied" || lifecycleStatus === "closed") {
      approvedAmount = round2(Math.min(claimAmount, Math.max(0, approvedAmount)));
      paidAmount = round2(Math.min(approvedAmount, Math.max(0, paidAmount)));
      remittanceStatus = "rejected";
    } else if (lifecycleStatus === "appealed") {
      approvedAmount = round2(Math.min(claimAmount, Math.max(0, approvedAmount)));
      paidAmount = round2(Math.min(approvedAmount, Math.max(0, paidAmount)));
      remittanceStatus = "pending";
    }

    var payerShare = round2(Number(raw && raw.payerShare));
    if (!Number.isFinite(payerShare)) payerShare = approvedAmount;
    payerShare = round2(Math.min(claimAmount, Math.max(0, payerShare)));

    var patientShare = round2(Number(raw && raw.patientShare));
    if (!Number.isFinite(patientShare)) patientShare = round2(Math.max(0, claimAmount - payerShare));
    patientShare = round2(Math.max(0, claimAmount - payerShare));

    if (lifecycleStatus === "submitted" || lifecycleStatus === "in_review") {
      payerShare = 0;
      patientShare = claimAmount;
    }

    var denialCode = String((raw && raw.denialCode) || "").trim().toUpperCase();
    var denialReason = String((raw && raw.denialReason) || "").trim();
    if (lifecycleStatus === "denied" || lifecycleStatus === "appealed" || lifecycleStatus === "closed") {
      if (!denialCode) denialCode = lifecycleStatus === "appealed" ? "APPEAL" : "DENIAL";
      if (!denialReason) {
        denialReason = lifecycleStatus === "appealed" ? "Claim appealed and pending payer decision." : "Claim denied by payer rules validation.";
      }
    } else {
      denialCode = "";
      denialReason = "";
    }

    var insuranceCode = entityKey((raw && raw.insuranceCode) || carrier.code);
    var insuranceName = String((raw && raw.insuranceName) || carrier.name || "Insurance");
    var serviceDate = isoDateOnly((raw && raw.serviceDate) || (raw && raw.scheduledDate) || (raw && raw.orderDate));
    var submissionDate = isoDateOnly((raw && raw.submissionDate) || serviceDate);
    var updatedAt = (raw && raw.updatedAt) ? String(raw.updatedAt) : timelineAtDate(submissionDate, 9);
    if (!parseDate(updatedAt)) updatedAt = timelineAtDate(submissionDate, 9);

    var normalized = {
      claimId: claimId,
      orderNo: String((raw && raw.orderNo) || "").trim(),
      transactionNo: String((raw && raw.transactionNo) || "").trim(),
      insuranceCode: insuranceCode,
      insuranceName: insuranceName,
      providerCode: String((raw && raw.providerCode) || "").trim().toUpperCase(),
      providerType: normText(raw && raw.providerType),
      providerName: String((raw && raw.providerName) || (raw && raw.institutionName) || "").trim(),
      patientName: String((raw && raw.patientName) || "").trim(),
      policyNo: String((raw && raw.policyNo) || insurancePolicyNo(index, insuranceCode)).trim().toUpperCase(),
      serviceDate: serviceDate,
      submissionDate: submissionDate,
      updatedAt: updatedAt,
      claimAmount: round2(claimAmount),
      approvedAmount: round2(approvedAmount),
      paidAmount: round2(paidAmount),
      patientShare: round2(patientShare),
      payerShare: round2(payerShare),
      lifecycleStatus: lifecycleStatus,
      remittanceStatus: remittanceStatus,
      denialCode: denialCode,
      denialReason: denialReason,
      itemType: normText(raw && raw.itemType)
    };

    normalized.outstandingAmount = insuranceOutstandingAmount(normalized);
    normalized.documentsCount = insuranceDocTypesForStatus(normalized.lifecycleStatus).length;
    return normalized;
  }

  function insuranceSeedStatuses() {
    return [
      { lifecycleStatus: "submitted", remittanceStatus: "pending", approvedRate: 0, paidRate: 0 },
      { lifecycleStatus: "in_review", remittanceStatus: "pending", approvedRate: 0, paidRate: 0 },
      { lifecycleStatus: "approved", remittanceStatus: "pending", approvedRate: 0.86, paidRate: 0 },
      { lifecycleStatus: "partially_paid", remittanceStatus: "partial", approvedRate: 0.82, paidRate: 0.5 },
      { lifecycleStatus: "paid", remittanceStatus: "paid", approvedRate: 0.91, paidRate: 1 },
      { lifecycleStatus: "denied", remittanceStatus: "rejected", approvedRate: 0, paidRate: 0, denialCode: "POLICY_LIMIT", denialReason: "Claim exceeds policy annual limit." },
      { lifecycleStatus: "appealed", remittanceStatus: "pending", approvedRate: 0, paidRate: 0, denialCode: "DOC_MISSING", denialReason: "Appeal submitted for missing attachment request." },
      { lifecycleStatus: "closed", remittanceStatus: "rejected", approvedRate: 0, paidRate: 0, denialCode: "DUPLICATE", denialReason: "Claim closed as duplicate submission." }
    ];
  }

  function buildDefaultInsuranceClaims() {
    var statuses = insuranceSeedStatuses();
    return getTransactions()
      .filter(function (row) {
        var type = normText(row.providerType);
        return type === "facility" || type === "pharmacy";
      })
      .map(function (row, index) {
      var carrier = INSURANCE_CARRIER_POOL[index % INSURANCE_CARRIER_POOL.length] || INSURANCE_CARRIER_POOL[0];
      var seed = statuses[index % statuses.length];
      var claimAmount = round2(row.totalPrice);
      var approvedAmount = round2(claimAmount * Number(seed.approvedRate || 0));
      var paidAmount = round2(approvedAmount * Number(seed.paidRate || 0));
      var serviceDate = isoDateOnly(row.scheduledDate || row.orderDate);
      var submissionDate = addDaysToDateOnly(serviceDate, 1);
      var updatedDate = addDaysToDateOnly(submissionDate, Math.min(4, index + 1));

      return normalizeInsuranceClaim(
        {
          claimId: insuranceClaimIdentity("", index),
          orderNo: row.orderNo,
          transactionNo: row.transactionNo,
          insuranceCode: carrier.code,
          insuranceName: carrier.name,
          providerCode: row.providerCode,
          providerType: row.providerType,
          providerName: row.providerName,
          patientName: row.patientName,
          policyNo: insurancePolicyNo(index, carrier.code),
          serviceDate: serviceDate,
          submissionDate: submissionDate,
          updatedAt: timelineAtDate(updatedDate, 10 + (index % 6)),
          claimAmount: claimAmount,
          approvedAmount: approvedAmount,
          paidAmount: paidAmount,
          patientShare: round2(Math.max(0, claimAmount - approvedAmount)),
          payerShare: approvedAmount,
          lifecycleStatus: seed.lifecycleStatus,
          remittanceStatus: seed.remittanceStatus,
          denialCode: seed.denialCode || "",
          denialReason: seed.denialReason || "",
          itemType: row.itemType
        },
        index
      );
    });
  }

  function loadInsuranceClaimsFromStorage() {
    try {
      var raw = localStorage.getItem(INSURANCE_CLAIMS_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch (err) {
      return null;
    }
  }

  function persistInsuranceClaims(entries) {
    try {
      localStorage.setItem(INSURANCE_CLAIMS_KEY, JSON.stringify(entries || []));
    } catch (err) {
      // ignore storage issues
    }
  }

  function loadInsuranceTimelineMap() {
    try {
      var raw = localStorage.getItem(INSURANCE_TIMELINE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
      return parsed;
    } catch (err) {
      return null;
    }
  }

  function persistInsuranceTimelineMap(map) {
    try {
      localStorage.setItem(INSURANCE_TIMELINE_KEY, JSON.stringify(map || {}));
    } catch (err) {
      // ignore storage issues
    }
  }

  function loadInsuranceManualDocsMap() {
    try {
      var raw = localStorage.getItem(INSURANCE_MANUAL_DOCS_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
      return parsed;
    } catch (err) {
      return {};
    }
  }

  function persistInsuranceManualDocsMap(map) {
    try {
      localStorage.setItem(INSURANCE_MANUAL_DOCS_KEY, JSON.stringify(map || {}));
    } catch (err) {
      // ignore storage issues
    }
  }

  function normalizeInsuranceManualDoc(item, claimId, index) {
    var docType = normalizeDocTypeForUpload(item && item.docType);
    var id = String((item && item.id) || "").trim();
    if (!id) id = String(claimId || "CLM") + "-UPL-" + String(Number(index) + 1);
    var amount = round2(Number(item && item.amount));
    if (!Number.isFinite(amount) || amount < 0) amount = 0;
    var uploadedAt = String((item && item.uploadedAt) || "").trim();
    if (!parseDate(uploadedAt)) uploadedAt = new Date().toISOString();

    return {
      id: id,
      claimId: String(claimId || "").toUpperCase(),
      docType: docType,
      invoiceNo: String((item && item.invoiceNo) || "").trim().toUpperCase(),
      amount: amount,
      fileName: String((item && item.fileName) || "manual-upload.pdf").trim(),
      note: String((item && item.note) || "").trim(),
      uploadedAt: uploadedAt
    };
  }

  function normalizeDocTypeForUpload(value) {
    var v = normText(value);
    if (v === "claim" || v === "insurance_invoice" || v === "remittance_credit") return v;
    return "claim";
  }

  function getInsuranceManualDocs(claimId, docType) {
    var target = String(claimId || "").trim().toUpperCase();
    if (!target) return [];
    var map = loadInsuranceManualDocsMap();
    var list = Array.isArray(map[target]) ? map[target] : [];
    var normalized = list.map(function (item, index) {
      return normalizeInsuranceManualDoc(item, target, index);
    });
    var type = normalizeDocTypeForUpload(docType);
    if (!docType) return normalized.sort(function (a, b) { return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(); });
    return normalized.filter(function (row) { return row.docType === type; }).sort(function (a, b) { return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(); });
  }

  function saveInsuranceManualDoc(claimId, payload) {
    var target = String(claimId || "").trim().toUpperCase();
    if (!target) return { ok: false, message: "Claim ID is required" };
    var docType = normalizeDocTypeForUpload(payload && payload.docType);
    var fileName = String((payload && payload.fileName) || "").trim();
    if (!fileName) return { ok: false, message: "File name is required" };

    var map = loadInsuranceManualDocsMap();
    var list = Array.isArray(map[target]) ? map[target].slice() : [];
    var nextItem = normalizeInsuranceManualDoc(
      {
        id: target + "-UPL-" + String(Date.now()),
        docType: docType,
        invoiceNo: payload && payload.invoiceNo,
        amount: payload && payload.amount,
        fileName: fileName,
        note: payload && payload.note,
        uploadedAt: new Date().toISOString()
      },
      target,
      list.length
    );

    list.push(nextItem);
    map[target] = list;
    persistInsuranceManualDocsMap(map);
    return { ok: true, item: nextItem };
  }

  function removeInsuranceManualDoc(claimId, docId) {
    var target = String(claimId || "").trim().toUpperCase();
    var id = String(docId || "").trim();
    if (!target || !id) return { ok: false, message: "Claim ID and document ID are required" };

    var map = loadInsuranceManualDocsMap();
    var list = Array.isArray(map[target]) ? map[target] : [];
    var before = list.length;
    list = list.filter(function (item) {
      return String(item && item.id) !== id;
    });
    if (list.length === before) return { ok: false, message: "Document not found" };
    map[target] = list;
    persistInsuranceManualDocsMap(map);
    return { ok: true };
  }

  function normalizeInsuranceTimelineEntries(entries, claim) {
    if (!Array.isArray(entries)) return [];
    return entries
      .map(function (entry, index) {
        var at = String((entry && entry.at) || "").trim();
        if (!parseDate(at)) at = timelineAtDate(claim.submissionDate, 9 + index);
        return {
          id: String((entry && entry.id) || claim.claimId + "-TL-" + String(index + 1)).trim(),
          claimId: claim.claimId,
          status: normalizeInsuranceLifecycleStatus(entry && entry.status),
          action: String((entry && entry.action) || "Status Updated").trim(),
          note: String((entry && entry.note) || "").trim(),
          actor: String((entry && entry.actor) || "System User").trim(),
          at: at
        };
      })
      .sort(function (a, b) {
        return new Date(a.at).getTime() - new Date(b.at).getTime();
      });
  }

  function buildDefaultInsuranceTimeline(claim) {
    var status = normalizeInsuranceLifecycleStatus(claim.lifecycleStatus);
    var steps = ["submitted"];
    if (status === "in_review") steps = ["submitted", "in_review"];
    else if (status === "approved") steps = ["submitted", "in_review", "approved"];
    else if (status === "partially_paid") steps = ["submitted", "in_review", "approved", "partially_paid"];
    else if (status === "paid") steps = ["submitted", "in_review", "approved", "paid"];
    else if (status === "denied") steps = ["submitted", "in_review", "denied"];
    else if (status === "appealed") steps = ["submitted", "in_review", "denied", "appealed"];
    else if (status === "closed") steps = ["submitted", "in_review", "denied", "closed"];

    var notesByStep = {
      submitted: "Claim submitted by provider.",
      in_review: "Claim moved to payer review.",
      approved: "Claim approved for settlement.",
      partially_paid: "Partial remittance posted.",
      paid: "Full remittance posted.",
      denied: claim.denialReason || "Claim denied by payer validation.",
      appealed: "Appeal submitted with supporting documents.",
      closed: "Case closed."
    };

    return steps.map(function (step, index) {
      var dateBase = addDaysToDateOnly(claim.submissionDate, index);
      return {
        id: claim.claimId + "-TL-" + String(index + 1),
        claimId: claim.claimId,
        status: step,
        action: insuranceStatusLabel(step),
        note: notesByStep[step] || "",
        actor: index === steps.length - 1 ? "Claims Officer" : "System User",
        at: index === steps.length - 1 ? claim.updatedAt : timelineAtDate(dateBase, 9 + index)
      };
    });
  }

  function ensureInsuranceSeedData() {
    var storedClaims = loadInsuranceClaimsFromStorage();
    var claims = Array.isArray(storedClaims) && storedClaims.length ? storedClaims : buildDefaultInsuranceClaims();
    claims = claims.map(function (claim, index) {
      return normalizeInsuranceClaim(claim, index);
    });
    persistInsuranceClaims(claims);

    var storedTimelineMap = loadInsuranceTimelineMap();
    var timelineMap = storedTimelineMap && typeof storedTimelineMap === "object" ? storedTimelineMap : {};
    var changed = !storedTimelineMap;

    claims.forEach(function (claim) {
      var current = timelineMap[claim.claimId];
      if (!Array.isArray(current) || !current.length) {
        timelineMap[claim.claimId] = buildDefaultInsuranceTimeline(claim);
        changed = true;
        return;
      }
      var normalized = normalizeInsuranceTimelineEntries(current, claim);
      timelineMap[claim.claimId] = normalized;
    });

    if (changed) persistInsuranceTimelineMap(timelineMap);
    return { claims: claims, timelineMap: timelineMap };
  }

  function getInsuranceAllowedTransitions(status) {
    var current = normalizeInsuranceLifecycleStatus(status);
    var map = {
      submitted: ["in_review", "denied"],
      in_review: ["approved", "denied"],
      approved: ["partially_paid", "paid"],
      partially_paid: ["paid", "denied"],
      denied: ["appealed", "closed"],
      appealed: ["approved", "denied"],
      paid: [],
      closed: []
    };
    return (map[current] || []).slice();
  }

  function getInsuranceClaims(filters) {
    var seed = ensureInsuranceSeedData();
    var claims = seed.claims.slice();
    var manualMap = loadInsuranceManualDocsMap();
    var f = filters || {};
    var claimId = (f.claimId || "").toString().trim().toUpperCase();
    var insuranceCode = entityKey(f.insuranceCode || f.insurerCode || f.payerCode);
    var providerType = normText(f.providerType || f.entityType);
    var lifecycleStatus = normalizeInsuranceLifecycleFilter(f.lifecycleStatus || f.status);
    var remittanceStatus = normalizeInsuranceRemittanceFilter(f.remittanceStatus);
    var dateFrom = normText(f.dateFrom || f.from);
    var dateTo = normText(f.dateTo || f.to);
    var search = normText(f.search);

    return claims
      .filter(function (claim) {
        var type = normText(claim.providerType);
        if (type !== "facility" && type !== "pharmacy") return false;
        if (claimId && claim.claimId !== claimId) return false;
        if (insuranceCode && entityKey(claim.insuranceCode) !== insuranceCode) return false;
        if (providerType && normText(claim.providerType) !== providerType) return false;
        if (lifecycleStatus && claim.lifecycleStatus !== lifecycleStatus) return false;
        if (remittanceStatus && claim.remittanceStatus !== remittanceStatus) return false;

        var date = (claim.submissionDate || "").slice(0, 10);
        if (dateFrom && date && date < dateFrom) return false;
        if (dateTo && date && date > dateTo) return false;

        if (search) {
          var text = [
            claim.claimId,
            claim.orderNo,
            claim.transactionNo,
            claim.insuranceCode,
            claim.insuranceName,
            claim.providerCode,
            claim.providerName,
            claim.patientName,
            claim.policyNo,
            claim.lifecycleStatus,
            claim.remittanceStatus,
            claim.denialCode,
            claim.denialReason
          ]
            .join(" ")
            .toLowerCase();
          if (text.indexOf(search) === -1) return false;
        }

        return true;
      })
      .map(function (claim) {
        var out = Object.assign({}, claim);
        var manual = Array.isArray(manualMap[out.claimId]) ? manualMap[out.claimId] : [];
        out.manualUploadsCount = manual.length;
        return out;
      })
      .sort(function (a, b) {
        var da = new Date(a.updatedAt).getTime();
        var db = new Date(b.updatedAt).getTime();
        if (db !== da) return db - da;
        return a.claimId < b.claimId ? -1 : 1;
      });
  }

  function getInsuranceClaimKpis(filters) {
    var rows = getInsuranceClaims(filters);
    var kpis = {
      totalClaims: rows.length,
      submitted: 0,
      inReview: 0,
      approved: 0,
      partiallyPaid: 0,
      paid: 0,
      denied: 0,
      appealed: 0,
      closed: 0,
      outstandingAmount: 0,
      outstandingClaims: 0
    };

    rows.forEach(function (claim) {
      if (claim.lifecycleStatus === "submitted") kpis.submitted += 1;
      else if (claim.lifecycleStatus === "in_review") kpis.inReview += 1;
      else if (claim.lifecycleStatus === "approved") kpis.approved += 1;
      else if (claim.lifecycleStatus === "partially_paid") kpis.partiallyPaid += 1;
      else if (claim.lifecycleStatus === "paid") kpis.paid += 1;
      else if (claim.lifecycleStatus === "denied") kpis.denied += 1;
      else if (claim.lifecycleStatus === "appealed") kpis.appealed += 1;
      else if (claim.lifecycleStatus === "closed") kpis.closed += 1;

      var outstanding = insuranceOutstandingAmount(claim);
      kpis.outstandingAmount = round2(kpis.outstandingAmount + outstanding);
      if (outstanding > 0.009) kpis.outstandingClaims += 1;
    });

    return kpis;
  }

  function buildInsuranceDocumentBundle(claim) {
    var docTypes = insuranceDocTypesForStatus(claim.lifecycleStatus);
    var orderDigits = String(claim.orderNo || claim.claimId || "").replace(/[^\d]/g, "") || "000000";
    var docs = [];

    if (docTypes.indexOf("claim") !== -1) {
      docs.push({
        docType: "claim",
        docLabel: "Claim",
        docNo: claim.claimId,
        issueDate: claim.submissionDate,
        status: insuranceStatusLabel(claim.lifecycleStatus),
        amount: round2(claim.claimAmount),
        note: "Insurance claim submission record."
      });
    }

    if (docTypes.indexOf("insurance_invoice") !== -1) {
      docs.push({
        docType: "insurance_invoice",
        docLabel: "Insurance Invoice",
        docNo: "INV-INS-" + orderDigits,
        issueDate: addDaysToDateOnly(claim.submissionDate, 1),
        status: claim.lifecycleStatus === "denied" || claim.lifecycleStatus === "appealed" || claim.lifecycleStatus === "closed" ? "Adjusted" : "Issued",
        amount: round2(claim.approvedAmount || claim.claimAmount),
        note: "Payer-facing invoice generated from approved claim data."
      });
    }

    if (docTypes.indexOf("remittance_credit") !== -1) {
      docs.push({
        docType: "remittance_credit",
        docLabel: "Remittance / Credit",
        docNo: "RMT-" + orderDigits,
        issueDate: isoDateOnly(claim.updatedAt),
        status: insuranceRemittanceLabel(claim.remittanceStatus),
        amount: round2(claim.paidAmount),
        note: claim.denialReason || "Settlement posting and credit/adjustment record."
      });
    }

    return docs;
  }

  function getInsuranceClaimBundle(claimId) {
    var target = (claimId || "").toString().trim().toUpperCase();
    if (!target) return null;

    var seed = ensureInsuranceSeedData();
    var claim = null;
    for (var i = 0; i < seed.claims.length; i += 1) {
      if (seed.claims[i].claimId === target) {
        claim = seed.claims[i];
        break;
      }
    }
    if (!claim) return null;

    var timeline = seed.timelineMap[claim.claimId];
    if (!Array.isArray(timeline) || !timeline.length) {
      timeline = buildDefaultInsuranceTimeline(claim);
      seed.timelineMap[claim.claimId] = timeline;
      persistInsuranceTimelineMap(seed.timelineMap);
    }

    var manualDocs = getInsuranceManualDocs(claim.claimId);
    var docs = buildInsuranceDocumentBundle(claim).map(function (doc) {
      var count = manualDocs.filter(function (item) {
        return item.docType === doc.docType;
      }).length;
      var enriched = Object.assign({}, doc);
      enriched.manualCount = count;
      return enriched;
    });

    return {
      claim: claim,
      documents: docs,
      manualDocs: manualDocs,
      timeline: normalizeInsuranceTimelineEntries(timeline, claim)
        .slice()
        .sort(function (a, b) {
          return new Date(b.at).getTime() - new Date(a.at).getTime();
        }),
      allowedTransitions: getInsuranceAllowedTransitions(claim.lifecycleStatus)
    };
  }

  function updateInsuranceClaimStatus(claimId, nextStatus, payload) {
    var target = (claimId || "").toString().trim().toUpperCase();
    if (!target) return { ok: false, message: "Claim ID is required" };

    var next = normalizeInsuranceLifecycleFilter(nextStatus);
    if (!next) return { ok: false, message: "Invalid next status" };

    var seed = ensureInsuranceSeedData();
    var claims = seed.claims.slice();
    var idx = -1;
    for (var i = 0; i < claims.length; i += 1) {
      if (claims[i].claimId === target) {
        idx = i;
        break;
      }
    }
    if (idx < 0) return { ok: false, message: "Claim not found" };

    var current = claims[idx];
    var allowed = getInsuranceAllowedTransitions(current.lifecycleStatus);
    if (allowed.indexOf(next) === -1) {
      return { ok: false, message: "Transition not allowed from " + current.lifecycleStatus + " to " + next };
    }

    var input = payload || {};
    var updated = Object.assign({}, current);
    updated.lifecycleStatus = next;

    if (next === "in_review") {
      updated.remittanceStatus = "pending";
    } else if (next === "approved") {
      var approvedAmount = round2(Number(input.approvedAmount));
      if (!(approvedAmount > 0)) approvedAmount = round2(updated.claimAmount * 0.85);
      updated.approvedAmount = round2(Math.min(updated.claimAmount, approvedAmount));
      updated.paidAmount = round2(Math.min(Math.max(0, updated.paidAmount), updated.approvedAmount));
      updated.remittanceStatus = updated.paidAmount > 0 ? (updated.paidAmount >= updated.approvedAmount ? "paid" : "partial") : "pending";
      updated.denialCode = "";
      updated.denialReason = "";
    } else if (next === "partially_paid") {
      if (!(updated.approvedAmount > 0)) updated.approvedAmount = round2(updated.claimAmount * 0.85);
      var partialPaid = round2(Number(input.paidAmount));
      if (!(partialPaid > 0)) partialPaid = round2(updated.approvedAmount * 0.5);
      if (!(partialPaid > 0 && partialPaid < updated.approvedAmount)) {
        return { ok: false, message: "Partial payment must be > 0 and < approved amount" };
      }
      updated.paidAmount = partialPaid;
      updated.remittanceStatus = "partial";
    } else if (next === "paid") {
      if (!(updated.approvedAmount > 0)) {
        var paidApproved = round2(Number(input.approvedAmount));
        if (!(paidApproved > 0)) paidApproved = round2(updated.claimAmount * 0.85);
        updated.approvedAmount = round2(Math.min(updated.claimAmount, paidApproved));
      }
      updated.paidAmount = updated.approvedAmount;
      updated.remittanceStatus = "paid";
      updated.denialCode = "";
      updated.denialReason = "";
    } else if (next === "denied") {
      updated.denialCode = String(input.denialCode || updated.denialCode || "DENIAL").trim().toUpperCase();
      updated.denialReason = String(input.denialReason || input.note || updated.denialReason || "Claim denied by payer review.").trim();
      updated.remittanceStatus = "rejected";
    } else if (next === "appealed") {
      updated.denialCode = String(input.denialCode || updated.denialCode || "APPEAL").trim().toUpperCase();
      updated.denialReason = String(input.denialReason || updated.denialReason || "Appeal submitted by claims team.").trim();
      updated.remittanceStatus = "pending";
    } else if (next === "closed") {
      updated.remittanceStatus = "rejected";
    }

    updated.payerShare = round2(Math.max(0, Math.min(updated.claimAmount, updated.approvedAmount)));
    updated.patientShare = round2(Math.max(0, updated.claimAmount - updated.payerShare));
    updated.outstandingAmount = insuranceOutstandingAmount(updated);
    updated.documentsCount = insuranceDocTypesForStatus(updated.lifecycleStatus).length;
    updated.updatedAt = new Date().toISOString();

    updated = normalizeInsuranceClaim(updated, idx);
    claims[idx] = updated;
    persistInsuranceClaims(claims);

    var timelineMap = seed.timelineMap || {};
    var currentTimeline = normalizeInsuranceTimelineEntries(timelineMap[updated.claimId], updated);
    currentTimeline.push({
      id: updated.claimId + "-TL-" + String(currentTimeline.length + 1),
      claimId: updated.claimId,
      status: updated.lifecycleStatus,
      action: insuranceStatusLabel(updated.lifecycleStatus),
      note: String(input.note || input.denialReason || "").trim(),
      actor: String(input.actor || "Claims Officer").trim(),
      at: updated.updatedAt
    });
    timelineMap[updated.claimId] = currentTimeline;
    persistInsuranceTimelineMap(timelineMap);

    return {
      ok: true,
      claim: updated,
      bundle: getInsuranceClaimBundle(updated.claimId)
    };
  }

  function exportInsuranceClaimsCsv(filters) {
    var rows = getInsuranceClaims(filters);
    var header = [
      "ClaimNo",
      "OrderNo",
      "TransactionNo",
      "InsuranceCode",
      "InsuranceName",
      "ProviderCode",
      "ProviderType",
      "ProviderName",
      "PatientName",
      "PolicyNo",
      "ServiceDate",
      "SubmissionDate",
      "UpdatedAt",
      "ClaimAmount",
      "ApprovedAmount",
      "PaidAmount",
      "OutstandingAmount",
      "LifecycleStatus",
      "RemittanceStatus",
      "DenialCode",
      "DenialReason"
    ];

    var lines = [header];
    rows.forEach(function (row) {
      lines.push([
        row.claimId,
        row.orderNo,
        row.transactionNo,
        row.insuranceCode,
        row.insuranceName,
        row.providerCode,
        row.providerType,
        row.providerName,
        row.patientName,
        row.policyNo,
        row.serviceDate,
        row.submissionDate,
        row.updatedAt,
        Number(row.claimAmount || 0).toFixed(2),
        Number(row.approvedAmount || 0).toFixed(2),
        Number(row.paidAmount || 0).toFixed(2),
        Number(insuranceOutstandingAmount(row) || 0).toFixed(2),
        row.lifecycleStatus,
        row.remittanceStatus,
        row.denialCode || "",
        row.denialReason || ""
      ]);
    });

    return lines
      .map(function (line) {
        return line
          .map(function (cell) {
            return '"' + String(cell == null ? "" : cell).replace(/"/g, '""') + '"';
          })
          .join(",");
      })
      .join("\n");
  }

  function getInsuranceCodeOptions() {
    var map = {};
    getInsuranceClaims({}).forEach(function (row) {
      var code = entityKey(row.insuranceCode);
      if (!code || map[code]) return;
      map[code] = {
        insuranceCode: code,
        insuranceName: row.insuranceName
      };
    });

    return Object.keys(map)
      .sort()
      .map(function (code) {
        return map[code];
      });
  }

  // Backward-compat wrappers for old calls
  function getEntityDepositSummaries() {
    return getEntityPayoutSummaries();
  }

  function getEntityDepositStatement(providerCode) {
    return getEntityLedger(providerCode);
  }

  function settleEntityBalance(providerCode, payload) {
    var direction = normalizeDirection(payload && payload.direction);
    if (direction && direction !== "payout") {
      return { ok: false, message: "Collection is disabled in payout-only mode" };
    }
    return createEntityPayout(providerCode, payload);
  }

  function collectDeposit(orderNo, amount) {
    var row = byOrderNo(orderNo);
    if (!row) return { ok: false, message: "Order not found" };
    var value = round2(amount);
    if (value <= 0) return { ok: false, message: "Invalid amount" };

    var newGross = round2(row.depositPaidGross + value);
    setOverride(row.orderNo, {
      depositPaid: newGross,
      refundAmount: row.refundAmount
    });
    return { ok: true };
  }

  function refundDeposit(orderNo, amount) {
    var row = byOrderNo(orderNo);
    if (!row) return { ok: false, message: "Order not found" };
    var value = round2(amount);
    if (value <= 0) return { ok: false, message: "Invalid amount" };

    var maxRefundable = round2(Math.max(0, row.depositPaid));
    if (value > maxRefundable) return { ok: false, message: "Refund exceeds paid amount" };

    var newRefund = round2(row.refundAmount + value);
    setOverride(row.orderNo, {
      depositPaid: row.depositPaidGross,
      refundAmount: newRefund,
      transactionStatus: "refunded"
    });
    return { ok: true };
  }

  window.NKPaymentData = {
    round2: round2,
    formatMoney: formatMoney,
    getTransactions: getTransactions,
    getInvoiceByOrder: getInvoiceByOrder,
    normalizeInvoiceType: normalizeInvoiceType,
    getInvoiceLabel: getInvoiceLabel,
    normalizeTaxDocType: normalizeTaxDocType,
    getTaxDocLabel: getTaxDocLabel,
    getTaxDocuments: getTaxDocuments,
    getTaxKpis: getTaxKpis,
    getTaxBreakdownByOrder: getTaxBreakdownByOrder,
    getTaxDocument: getTaxDocument,
    computeFinancials: computeFinancials,
    getDeposits: getDeposits,
    collectDeposit: collectDeposit,
    refundDeposit: refundDeposit,
    clearDepositOverride: clearOverride,
    getEntityPayoutSummaries: getEntityPayoutSummaries,
    getEntityLedger: getEntityLedger,
    createEntityPayout: createEntityPayout,
    getEntityDashboardTotals: getEntityDashboardTotals,
    normalizeInsuranceLifecycleStatus: normalizeInsuranceLifecycleStatus,
    normalizeInsuranceRemittanceStatus: normalizeInsuranceRemittanceStatus,
    insuranceStatusLabel: insuranceStatusLabel,
    insuranceRemittanceLabel: insuranceRemittanceLabel,
    getInsuranceAllowedTransitions: getInsuranceAllowedTransitions,
    getInsuranceClaims: getInsuranceClaims,
    getInsuranceClaimKpis: getInsuranceClaimKpis,
    getInsuranceClaimBundle: getInsuranceClaimBundle,
    updateInsuranceClaimStatus: updateInsuranceClaimStatus,
    exportInsuranceClaimsCsv: exportInsuranceClaimsCsv,
    getInsuranceCodeOptions: getInsuranceCodeOptions,
    getInsuranceManualDocs: getInsuranceManualDocs,
    saveInsuranceManualDoc: saveInsuranceManualDoc,
    removeInsuranceManualDoc: removeInsuranceManualDoc,
    // compatibility
    getEntityDepositSummaries: getEntityDepositSummaries,
    getEntityDepositStatement: getEntityDepositStatement,
    settleEntityBalance: settleEntityBalance
  };
})();
