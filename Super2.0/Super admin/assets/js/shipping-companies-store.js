(function (global) {
  "use strict";

  var STORAGE_KEY = "nk_shipping_companies_v1";
  var memoryStore = null;

  var DEFAULT_ROWS = [
    {
      code: "SHP-00001",
      name: "Aramex Saudi Arabia",
      logo: "../assets/images/aramex.png",
      email: "ops@aramex.sa",
      phone: "+966551002201",
      contactName: "Nasser Al Qahtani",
      city: "Riyadh",
      status: "approved",
      decisionReason: "",
      decisionUpdatedAt: "2026-02-14T10:15:00Z",
      audit: [{ title: "Approved", time: "14/02/2026 01:15 PM", note: "Provider onboarding approved." }],
      documents: {
        commercialRegistration: {
          label: "Commercial Registration",
          number: "1010235541",
          fileName: "aramex_cr_2026.pdf",
          status: "approved",
          updatedAt: "2026-02-14"
        },
        ownerIdentity: {
          label: "Owner Identity",
          number: "1029384756",
          fileName: "owner_id_aramex.pdf",
          status: "approved",
          updatedAt: "2026-02-14"
        },
        bankAccountLetter: {
          label: "Bank Account Letter",
          number: "IBAN ending 7519",
          fileName: "iban_aramex.pdf",
          status: "approved",
          updatedAt: "2026-02-12"
        }
      },
      bankAccount: {
        bankName: "Al Rajhi Bank",
        iban: "SA0380000000608010167519",
        beneficiaryName: "Aramex Saudi Arabia",
        accountNumberLast4: "7519",
        status: "verified",
        lastVerifiedAt: "2026-02-12"
      },
      integration: {
        status: "active",
        providerId: "PROV-001",
        providerCode: "ARMX-SHP",
        environment: "production",
        lastSyncAt: "2026-02-18 13:22",
        failureRate: "0.8%",
        notes: "Production integration is healthy and stable."
      },
      updatedAt: "2026-02-18T13:22:00Z"
    },
    {
      code: "SHP-00002",
      name: "SMSA Express",
      logo: "../assets/images/smsa.png",
      email: "integration@smsa.sa",
      phone: "+966551002202",
      contactName: "Fahad Al Mutairi",
      city: "Jeddah",
      status: "pending",
      decisionReason: "",
      decisionUpdatedAt: "2026-02-18T09:41:00Z",
      audit: [{ title: "Pending Review", time: "18/02/2026 12:41 PM", note: "Awaiting final compliance decision." }],
      documents: {
        commercialRegistration: {
          label: "Commercial Registration",
          number: "4030158821",
          fileName: "smsa_cr_2026.pdf",
          status: "approved",
          updatedAt: "2026-02-11"
        },
        ownerIdentity: {
          label: "Owner Identity",
          number: "1092873410",
          fileName: "smsa_owner_id.pdf",
          status: "pending",
          updatedAt: "2026-02-18"
        },
        bankAccountLetter: {
          label: "Bank Account Letter",
          number: "IBAN ending 9012",
          fileName: "smsa_iban_letter.pdf",
          status: "pending",
          updatedAt: "2026-02-18"
        }
      },
      bankAccount: {
        bankName: "Saudi National Bank",
        iban: "SA5120000001234567890123",
        beneficiaryName: "SMSA Express",
        accountNumberLast4: "9012",
        status: "pending",
        lastVerifiedAt: "2026-02-18"
      },
      integration: {
        status: "pending",
        providerId: "PROV-007",
        providerCode: "SMSA-SHP",
        environment: "sandbox",
        lastSyncAt: "2026-02-17 11:05",
        failureRate: "1.9%",
        notes: "Waiting for final webhook validation in sandbox."
      },
      updatedAt: "2026-02-18T09:41:00Z"
    },
    {
      code: "SHP-00003",
      name: "Naqel Express",
      logo: "../assets/images/logo.svg",
      email: "ops.integration@naqel.sa",
      phone: "+966551002203",
      contactName: "Sami Al Otaibi",
      city: "Dammam",
      status: "needs-info",
      decisionReason: "Bank account letter was rejected and needs re-upload.",
      decisionUpdatedAt: "2026-02-15T16:20:00Z",
      audit: [{ title: "Needs Information", time: "15/02/2026 07:20 PM", note: "Bank account letter was rejected and needs re-upload." }],
      documents: {
        commercialRegistration: {
          label: "Commercial Registration",
          number: "2050145520",
          fileName: "naqel_cr_2026.pdf",
          status: "approved",
          updatedAt: "2026-02-09"
        },
        ownerIdentity: {
          label: "Owner Identity",
          number: "1037442991",
          fileName: "naqel_owner_identity.pdf",
          status: "approved",
          updatedAt: "2026-02-09"
        },
        bankAccountLetter: {
          label: "Bank Account Letter",
          number: "IBAN ending 4432",
          fileName: "naqel_iban_letter.pdf",
          status: "rejected",
          updatedAt: "2026-02-15",
          rejectionReason: "Bank letter does not include official stamp."
        }
      },
      bankAccount: {
        bankName: "Riyad Bank",
        iban: "SA4420000003456789012345",
        beneficiaryName: "Naqel Express",
        accountNumberLast4: "4432",
        status: "unverified",
        lastVerifiedAt: ""
      },
      integration: {
        status: "inactive",
        providerId: "",
        providerCode: "",
        environment: "production",
        lastSyncAt: "",
        failureRate: "-",
        notes: "API provider has not been linked yet."
      },
      updatedAt: "2026-02-15T16:20:00Z"
    },
    {
      code: "SHP-00004",
      name: "SPL Logistics",
      logo: "../assets/images/inno-logo.svg",
      email: "logistics@spl.sa",
      phone: "+966551002204",
      contactName: "Maha Al Harbi",
      city: "Riyadh",
      status: "approved",
      decisionReason: "",
      decisionUpdatedAt: "2026-02-12T08:30:00Z",
      audit: [{ title: "Approved", time: "12/02/2026 11:30 AM", note: "Company approved and moved to active monitoring." }],
      documents: {
        commercialRegistration: {
          label: "Commercial Registration",
          number: "1010693314",
          fileName: "spl_cr_2026.pdf",
          status: "pending",
          updatedAt: "2026-02-16"
        },
        ownerIdentity: {
          label: "Owner Identity",
          number: "1009392204",
          fileName: "spl_owner_id.pdf",
          status: "approved",
          updatedAt: "2026-02-10"
        },
        bankAccountLetter: {
          label: "Bank Account Letter",
          number: "IBAN ending 2187",
          fileName: "spl_iban_letter.pdf",
          status: "approved",
          updatedAt: "2026-02-10"
        }
      },
      bankAccount: {
        bankName: "Alinma Bank",
        iban: "SA9380000009876543210123",
        beneficiaryName: "SPL Logistics",
        accountNumberLast4: "2187",
        status: "verified",
        lastVerifiedAt: "2026-02-10"
      },
      integration: {
        status: "error",
        providerId: "",
        providerCode: "SPL-SHP",
        environment: "production",
        lastSyncAt: "2026-02-18 08:30",
        failureRate: "17.3%",
        notes: "Token renewal failed. Review credentials and retry."
      },
      updatedAt: "2026-02-18T08:30:00Z"
    }
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function text(value) {
    return String(value == null ? "" : value).trim();
  }

  function upper(value) {
    return text(value).toUpperCase();
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function toDateIsoOnly(value) {
    if (!value) return "";
    var parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toISOString().slice(0, 10);
  }

  function formatAuditTime(input) {
    var value = input instanceof Date ? input : new Date(input || nowIso());
    if (Number.isNaN(value.getTime())) value = new Date();
    return value.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  }

  function normalizeIntegrationStatus(value) {
    var key = text(value).toLowerCase();
    if (key === "active") return "active";
    if (key === "pending") return "pending";
    if (key === "error") return "error";
    return "inactive";
  }

  function normalizeDocumentStatus(value) {
    var key = text(value).toLowerCase();
    if (key === "approved") return "approved";
    if (key === "rejected") return "rejected";
    if (key === "missing") return "missing";
    return "pending";
  }

  function normalizeBankStatus(value) {
    var key = text(value).toLowerCase();
    if (key === "verified") return "verified";
    if (key === "pending") return "pending";
    return "unverified";
  }

  function normalizeCompanyStatus(value) {
    var key = text(value).toLowerCase().replace(/[_\s]+/g, "-");
    if (key === "approved") return "approved";
    if (key === "rejected") return "rejected";
    if (key === "suspended") return "suspended";
    if (key === "banned") return "banned";
    if (key === "needs-info") return "needs-info";
    return "pending";
  }

  function canReview(status) {
    var key = normalizeCompanyStatus(status);
    return key === "pending" || key === "needs-info";
  }

  function canEnforce(status) {
    return normalizeCompanyStatus(status) === "approved";
  }

  function normalizeEnvironment(value) {
    return text(value).toLowerCase() === "sandbox" ? "sandbox" : "production";
  }

  function normalizeDocument(raw, fallbackLabel) {
    var row = raw || {};
    return {
      label: text(row.label) || text(fallbackLabel) || "Document",
      number: text(row.number),
      fileName: text(row.fileName) || "-",
      status: normalizeDocumentStatus(row.status),
      updatedAt: toDateIsoOnly(row.updatedAt) || toDateIsoOnly(nowIso()),
      rejectionReason: text(row.rejectionReason)
    };
  }

  function normalizeDocuments(raw) {
    var rows = raw || {};
    return {
      commercialRegistration: normalizeDocument(rows.commercialRegistration, "Commercial Registration"),
      ownerIdentity: normalizeDocument(rows.ownerIdentity, "Owner Identity"),
      bankAccountLetter: normalizeDocument(rows.bankAccountLetter, "Bank Account Letter")
    };
  }

  function normalizeBankAccount(raw) {
    var row = raw || {};
    var iban = text(row.iban).replace(/\s+/g, "").toUpperCase();
    return {
      bankName: text(row.bankName) || "-",
      iban: iban || "-",
      beneficiaryName: text(row.beneficiaryName) || "-",
      accountNumberLast4: text(row.accountNumberLast4) || (iban && iban.length > 4 ? iban.slice(-4) : ""),
      status: normalizeBankStatus(row.status),
      lastVerifiedAt: toDateIsoOnly(row.lastVerifiedAt)
    };
  }

  function normalizeIntegration(raw) {
    var row = raw || {};
    return {
      status: normalizeIntegrationStatus(row.status),
      providerId: upper(row.providerId),
      providerCode: upper(row.providerCode),
      environment: normalizeEnvironment(row.environment),
      lastSyncAt: text(row.lastSyncAt),
      failureRate: text(row.failureRate) || "-",
      notes: text(row.notes)
    };
  }

  function normalizeAuditEntry(raw) {
    var row = raw || {};
    return {
      title: text(row.title) || "Status Updated",
      time: text(row.time) || formatAuditTime(nowIso()),
      note: text(row.note)
    };
  }

  function normalizeAudit(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
      .map(normalizeAuditEntry)
      .filter(function (entry) {
        return !!entry.title;
      });
  }

  function statusToAuditTitle(status) {
    var key = normalizeCompanyStatus(status);
    if (key === "approved") return "Approved";
    if (key === "rejected") return "Rejected";
    if (key === "suspended") return "Suspended";
    if (key === "banned") return "Banned";
    if (key === "needs-info") return "Needs Information";
    return "Pending Review";
  }

  function defaultStatusNote(status) {
    var key = normalizeCompanyStatus(status);
    if (key === "approved") return "Company approved successfully.";
    if (key === "rejected") return "Company was rejected by reviewer.";
    if (key === "suspended") return "Company was suspended by reviewer.";
    if (key === "banned") return "Company was banned by reviewer.";
    if (key === "needs-info") return "Additional information is required.";
    return "Awaiting review.";
  }

  function deriveCompanyStatus(row) {
    if (text(row && row.status)) return normalizeCompanyStatus(row.status);

    var docs = normalizeDocuments(row && row.documents);
    var keys = Object.keys(docs);
    var hasRejectedOrMissing = keys.some(function (key) {
      var st = normalizeDocumentStatus(docs[key].status);
      return st === "rejected" || st === "missing";
    });
    if (hasRejectedOrMissing) return "needs-info";

    var allApproved = !!keys.length && keys.every(function (key) {
      return normalizeDocumentStatus(docs[key].status) === "approved";
    });
    if (allApproved && normalizeIntegrationStatus(row && row.integration && row.integration.status) === "active") {
      return "approved";
    }

    return "pending";
  }

  function normalizeCompany(raw, index) {
    var row = raw || {};
    var status = deriveCompanyStatus(row);
    var decisionReason = text(row.decisionReason);
    var decisionUpdatedAt = text(row.decisionUpdatedAt) || "";
    var audit = normalizeAudit(row.audit);

    if (!audit.length && (status !== "pending" || decisionReason)) {
      audit = [
        {
          title: statusToAuditTitle(status),
          time: decisionUpdatedAt ? formatAuditTime(decisionUpdatedAt) : formatAuditTime(nowIso()),
          note: decisionReason || defaultStatusNote(status)
        }
      ];
    }

    return {
      code: upper(row.code) || ("SHP-" + String(index + 1).padStart(5, "0")),
      name: text(row.name) || ("Shipping Company " + String(index + 1)),
      logo: text(row.logo) || "../assets/images/logo.svg",
      email: text(row.email),
      phone: text(row.phone),
      contactName: text(row.contactName) || "-",
      city: text(row.city) || "-",
      status: status,
      decisionReason: decisionReason,
      decisionUpdatedAt: decisionUpdatedAt || text(row.updatedAt),
      audit: audit,
      documents: normalizeDocuments(row.documents),
      bankAccount: normalizeBankAccount(row.bankAccount),
      integration: normalizeIntegration(row.integration),
      updatedAt: text(row.updatedAt) || nowIso()
    };
  }

  function safeRead() {
    if (memoryStore) return clone(memoryStore);
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      memoryStore = clone(parsed);
      return clone(parsed);
    } catch (err) {
      return null;
    }
  }

  function safeSave(rows) {
    memoryStore = clone(rows);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
      return true;
    } catch (err) {
      return true;
    }
  }

  function ensureSeedData() {
    var rows = safeRead();
    if (!Array.isArray(rows) || !rows.length) {
      rows = clone(DEFAULT_ROWS);
    }

    var normalized = rows.map(normalizeCompany);
    safeSave(normalized);
    return clone(normalized);
  }

  function getAll() {
    return ensureSeedData();
  }

  function getByCode(code) {
    var key = upper(code);
    if (!key) return null;

    var rows = ensureSeedData();
    for (var i = 0; i < rows.length; i += 1) {
      if (upper(rows[i].code) === key) return clone(rows[i]);
    }
    return null;
  }

  function updateCompany(code, patchFn) {
    var key = upper(code);
    if (!key) return { ok: false, message: "Company code is required." };

    var rows = ensureSeedData();
    var found = false;

    for (var i = 0; i < rows.length; i += 1) {
      if (upper(rows[i].code) !== key) continue;
      var current = clone(rows[i]);
      var next = typeof patchFn === "function" ? patchFn(current) : current;
      rows[i] = normalizeCompany(next, i);
      rows[i].updatedAt = nowIso();
      found = true;
      break;
    }

    if (!found) return { ok: false, message: "Shipping company not found." };

    safeSave(rows);
    return { ok: true, company: getByCode(key) };
  }

  function setIntegrationStatus(code, status) {
    var current = getByCode(code);
    if (!current) return { ok: false, message: "Shipping company not found." };

    var companyStatus = normalizeCompanyStatus(current.status);
    if (companyStatus === "suspended" || companyStatus === "banned") {
      return { ok: false, message: "Integration cannot be changed for suspended or banned companies." };
    }

    return updateCompany(code, function (row) {
      row.integration = row.integration || {};
      row.integration.status = normalizeIntegrationStatus(status);
      row.integration.lastSyncAt = row.integration.lastSyncAt || nowIso().slice(0, 16).replace("T", " ");
      return row;
    });
  }

  function normalizeDecisionAction(action) {
    var key = text(action).toLowerCase().replace(/[_\s]+/g, "-");
    if (key === "approve" || key === "approved") return "approved";
    if (key === "reject" || key === "rejected") return "rejected";
    if (key === "suspend" || key === "suspended") return "suspended";
    if (key === "ban" || key === "banned") return "banned";
    if (key === "needs-info") return "needs-info";
    return "";
  }

  function setCompanyDecision(code, action, reason) {
    var key = upper(code);
    if (!key) return { ok: false, message: "Company code is required." };

    var targetStatus = normalizeDecisionAction(action);
    if (!targetStatus) return { ok: false, message: "Unsupported decision action." };

    var current = getByCode(key);
    if (!current) return { ok: false, message: "Shipping company not found." };

    var currentStatus = normalizeCompanyStatus(current.status);
    if (targetStatus === currentStatus) {
      return { ok: false, message: "Company is already in this status." };
    }

    var note = text(reason);
    if (targetStatus === "rejected" && !note) {
      return { ok: false, message: "Rejection reason is required." };
    }

    var reviewTarget = targetStatus === "approved" || targetStatus === "rejected" || targetStatus === "needs-info";
    var enforceTarget = targetStatus === "suspended" || targetStatus === "banned";

    if (reviewTarget && !canReview(currentStatus)) {
      return { ok: false, message: "Company can only be approved/rejected while pending or needs-info." };
    }

    if (enforceTarget && !canEnforce(currentStatus)) {
      return { ok: false, message: "Only approved companies can be suspended or banned." };
    }

    return updateCompany(key, function (row) {
      row.status = targetStatus;
      row.decisionReason = targetStatus === "approved" ? "" : note;
      row.decisionUpdatedAt = nowIso();
      row.audit = Array.isArray(row.audit) ? row.audit : [];
      row.audit.push({
        title: statusToAuditTitle(targetStatus),
        time: formatAuditTime(new Date()),
        note: note || defaultStatusNote(targetStatus)
      });

      if (row.audit.length > 50) {
        row.audit = row.audit.slice(row.audit.length - 50);
      }

      if (targetStatus === "suspended" || targetStatus === "banned") {
        row.integration = row.integration || {};
        row.integration.status = "inactive";
      }

      return row;
    });
  }

  function setDocumentStatus(code, docKey, status, reason) {
    var key = text(docKey);
    if (!key) return { ok: false, message: "Document key is required." };

    return updateCompany(code, function (row) {
      row.documents = row.documents || {};
      if (!row.documents[key]) {
        row.documents[key] = normalizeDocument({}, key);
      }
      row.documents[key].status = normalizeDocumentStatus(status);
      row.documents[key].updatedAt = toDateIsoOnly(nowIso());
      if (row.documents[key].status === "rejected") {
        row.documents[key].rejectionReason = text(reason) || "Rejected by reviewer.";
      } else {
        row.documents[key].rejectionReason = "";
      }
      return row;
    });
  }

  function setDocumentFileName(code, docKey, fileName) {
    var key = text(docKey);
    if (!key) return { ok: false, message: "Document key is required." };

    return updateCompany(code, function (row) {
      row.documents = row.documents || {};
      if (!row.documents[key]) {
        row.documents[key] = normalizeDocument({}, key);
      }
      row.documents[key].fileName = text(fileName) || "updated_document.pdf";
      row.documents[key].status = "pending";
      row.documents[key].updatedAt = toDateIsoOnly(nowIso());
      row.documents[key].rejectionReason = "";
      return row;
    });
  }

  function getDocumentProgress(company) {
    var row = normalizeCompany(company || {}, 0);
    var docs = row.documents || {};
    var keys = Object.keys(docs);
    if (!keys.length) {
      return {
        total: 0,
        approved: 0,
        percent: 0
      };
    }

    var approved = 0;
    keys.forEach(function (key) {
      if (normalizeDocumentStatus(docs[key].status) === "approved") {
        approved += 1;
      }
    });

    return {
      total: keys.length,
      approved: approved,
      percent: Math.round((approved / keys.length) * 100)
    };
  }

  global.NKShippingCompaniesStore = {
    STORAGE_KEY: STORAGE_KEY,
    ensureSeedData: ensureSeedData,
    getAll: getAll,
    getByCode: getByCode,
    setIntegrationStatus: setIntegrationStatus,
    setCompanyDecision: setCompanyDecision,
    setDocumentStatus: setDocumentStatus,
    setDocumentFileName: setDocumentFileName,
    getDocumentProgress: getDocumentProgress,
    canReview: canReview,
    canEnforce: canEnforce,
    normalizeCompanyStatus: normalizeCompanyStatus,
    normalizeIntegrationStatus: normalizeIntegrationStatus,
    normalizeDocumentStatus: normalizeDocumentStatus
  };
})(window);
