(function () {
  var ENTITIES_KEY = "nk_entities";
  var INDEX_KEY = "nk_payment_methods_index";
  var METHODS_PREFIX = "nk_payment_methods_";
  var memoryStore = {};

  var DEFAULT_ENTITIES = [
    { id: "FC-00001", name: "BMC Hospital", code: "FC-00001", type: "facility" },
    { id: "FC-00002", name: "Al Salam Medical Center", code: "FC-00002", type: "facility" },
    { id: "PH-00001", name: "Al Dawaa Pharmacy", code: "PH-00001", type: "pharmacy" },
    { id: "PH-00002", name: "Future Care Pharmacy", code: "PH-00002", type: "pharmacy" },
    { id: "DR-00001", name: "Dr. Ahmed Ali", code: "DR-00001", type: "individual" },
    { id: "NR-00001", name: "Nurse Mona Saleh", code: "NR-00001", type: "individual" }
  ];

  var DEFAULT_METHODS = {
    "FC-00001": [
      {
        methodType: "bank",
        label: "Primary Settlement Account",
        currency: "SAR",
        isDefault: true,
        status: "verified",
        lastUsedAt: "2026-02-15T08:30:00Z",
        bank: {
          beneficiaryName: "BMC Hospital",
          iban: "SA0380000000608010167519",
          bankName: "Al Rajhi Bank",
          country: "KSA",
          attachmentName: "iban-letter.pdf"
        }
      },
      {
        methodType: "wallet",
        label: "Backup Wallet",
        currency: "SAR",
        isDefault: false,
        status: "draft",
        wallet: {
          provider: "STC Pay",
          providerOther: "",
          walletId: "stcpay-bmc-7788",
          ownerName: "BMC Treasury"
        }
      }
    ],
    "FC-00002": [
      {
        methodType: "bank",
        label: "Weekly Settlement",
        currency: "SAR",
        isDefault: false,
        status: "pending",
        reviewSubmittedAt: "2026-02-12T10:00:00Z",
        bank: {
          beneficiaryName: "Al Salam Medical Center",
          iban: "SA5120000001234567890123",
          bankName: "SNB",
          country: "KSA",
          attachmentName: "swift.pdf"
        }
      }
    ],
    "PH-00001": [
      {
        methodType: "wallet",
        label: "Operations Wallet",
        currency: "SAR",
        isDefault: true,
        status: "verified",
        lastUsedAt: "2026-02-13T10:20:00Z",
        wallet: {
          provider: "UrPay",
          providerOther: "",
          walletId: "urpay-ph0001-1944",
          ownerName: "Al Dawaa Operations"
        }
      },
      {
        methodType: "bank",
        label: "USD Backup Account",
        currency: "USD",
        isDefault: false,
        status: "disabled",
        statusBeforeDisable: "verified",
        bank: {
          beneficiaryName: "Al Dawaa Pharmacy",
          iban: "SA4420000003456789012345",
          bankName: "Riyad Bank",
          country: "KSA",
          attachmentName: ""
        }
      }
    ],
    "PH-00002": [
      {
        methodType: "wallet",
        label: "Daily Wallet",
        currency: "SAR",
        isDefault: true,
        status: "verified",
        wallet: {
          provider: "STC Pay",
          providerOther: "",
          walletId: "fcphwallet9981",
          ownerName: "Future Care Payments"
        }
      }
    ],
    "DR-00001": [
      {
        methodType: "bank",
        label: "Doctor Transfer",
        currency: "SAR",
        isDefault: true,
        status: "verified",
        bank: {
          beneficiaryName: "Dr. Ahmed Ali",
          iban: "SA9380000009876543210123",
          bankName: "Alinma Bank",
          country: "KSA",
          attachmentName: ""
        }
      }
    ],
    "NR-00001": [
      {
        methodType: "wallet",
        label: "Nursing Wallet",
        currency: "SAR",
        isDefault: false,
        status: "draft",
        wallet: {
          provider: "Other",
          providerOther: "MyWalletX",
          walletId: "nurse-wallet-6622",
          ownerName: "Mona Saleh"
        }
      }
    ]
  };

  function nowIso() {
    return new Date().toISOString();
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function safeParse(key, fallback) {
    if (Object.prototype.hasOwnProperty.call(memoryStore, key)) {
      return clone(memoryStore[key]);
    }
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      if (parsed == null) return fallback;
      memoryStore[key] = clone(parsed);
      return parsed;
    } catch (err) {
      return fallback;
    }
  }

  function safeStore(key, value) {
    memoryStore[key] = clone(value);
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      // Keep in-memory fallback for file:// or blocked storage.
      return true;
    }
  }

  function normalizeEntityId(value) {
    return String(value || "").trim().toUpperCase();
  }

  function normalizeIban(value) {
    return String(value || "")
      .replace(/\s+/g, "")
      .toUpperCase();
  }

  function normalizeWalletId(value) {
    return String(value || "")
      .replace(/\s+/g, "")
      .toLowerCase();
  }

  function normalizeStatus(status) {
    var value = String(status || "").trim().toLowerCase();
    if (value === "unverified") return "draft";
    if (value === "draft" || value === "pending" || value === "verified" || value === "disabled") return value;
    return "draft";
  }

  function toTypeLabel(type) {
    return type === "wallet" ? "Wallet" : "Bank";
  }

  function toStatusLabel(status) {
    var value = normalizeStatus(status);
    if (value === "verified") return "Verified";
    if (value === "pending") return "Pending";
    if (value === "disabled") return "Disabled";
    return "Draft";
  }

  function getMethodsKey(entityId) {
    return METHODS_PREFIX + normalizeEntityId(entityId);
  }

  function getLast4(value) {
    var text = String(value || "").trim().replace(/\s+/g, "");
    if (!text) return "";
    return text.slice(-4);
  }

  function genMethodId() {
    var rand = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    return "pm-" + Date.now().toString(36) + "-" + rand;
  }

  function encodeSecret(value) {
    try {
      return btoa(unescape(encodeURIComponent(String(value || ""))));
    } catch (err) {
      return "";
    }
  }

  function decodeSecret(value) {
    try {
      return decodeURIComponent(escape(atob(String(value || ""))));
    } catch (err) {
      return "";
    }
  }

  function getEntities() {
    var rows = safeParse(ENTITIES_KEY, []);
    if (Array.isArray(rows) && rows.length) return clone(rows);
    safeStore(ENTITIES_KEY, DEFAULT_ENTITIES);
    return clone(DEFAULT_ENTITIES);
  }

  function getEntityByCode(code) {
    var id = normalizeEntityId(code);
    if (!id) return null;
    var entities = getEntities();
    for (var i = 0; i < entities.length; i += 1) {
      var row = entities[i];
      if (normalizeEntityId(row.id) === id || normalizeEntityId(row.code) === id) {
        return clone(row);
      }
    }
    return null;
  }

  function resolveEntityFromQuery(urlSearch) {
    var params = new URLSearchParams(urlSearch || window.location.search || "");
    var raw = params.get("entityId") || params.get("entity");
    if (!raw) return null;
    return getEntityByCode(raw);
  }

  function normalizeRow(entityId, row) {
    var createdAt = row && row.createdAt ? row.createdAt : nowIso();
    var methodType = row && row.methodType === "wallet" ? "wallet" : "bank";
    var status = normalizeStatus(row && row.status);
    var result = {
      id: row && row.id ? String(row.id) : genMethodId(),
      entityId: normalizeEntityId(entityId),
      methodType: methodType,
      label: String((row && row.label) || "").trim(),
      currency: String((row && row.currency) || "SAR")
        .trim()
        .toUpperCase(),
      isDefault: !!(row && row.isDefault),
      status: status,
      statusBeforeDisable: row && row.statusBeforeDisable ? normalizeStatus(row.statusBeforeDisable) : null,
      lastUsedAt: (row && row.lastUsedAt) || null,
      reviewSubmittedAt: (row && row.reviewSubmittedAt) || null,
      reviewNotes: row && row.reviewNotes ? String(row.reviewNotes) : null,
      createdAt: createdAt,
      updatedAt: (row && row.updatedAt) || createdAt,
      bank: null,
      wallet: null
    };

    if (methodType === "bank") {
      var rawIbanStored = row && row.bank ? row.bank.ibanStored : "";
      var rawPlainIban = row && row.bank ? row.bank.iban : "";
      var normalizedIban = normalizeIban(rawPlainIban || decodeSecret(rawIbanStored));
      result.bank = {
        beneficiaryName: String((row && row.bank && row.bank.beneficiaryName) || "").trim(),
        ibanStored: encodeSecret(normalizedIban),
        ibanLast4: getLast4(normalizedIban || (row && row.bank && row.bank.ibanLast4) || ""),
        bankName: String((row && row.bank && row.bank.bankName) || "").trim(),
        country: String((row && row.bank && row.bank.country) || "KSA")
          .trim()
          .toUpperCase(),
        attachmentName: String((row && row.bank && row.bank.attachmentName) || "").trim()
      };
    } else {
      var rawWalletStored = row && row.wallet ? row.wallet.walletIdStored : "";
      var rawWalletId = row && row.wallet ? row.wallet.walletId : "";
      var normalizedWallet = String(rawWalletId || decodeSecret(rawWalletStored) || "").trim();
      result.wallet = {
        provider: String((row && row.wallet && row.wallet.provider) || "Other").trim() || "Other",
        providerOther: String((row && row.wallet && row.wallet.providerOther) || "").trim(),
        walletIdStored: encodeSecret(normalizedWallet),
        walletIdLast4: getLast4(normalizedWallet || (row && row.wallet && row.wallet.walletIdLast4) || ""),
        ownerName: String((row && row.wallet && row.wallet.ownerName) || "").trim()
      };
    }

    if (result.status === "disabled" && !result.statusBeforeDisable) {
      result.statusBeforeDisable = "draft";
    }

    return result;
  }

  function normalizeMethods(entityId, rows) {
    if (!Array.isArray(rows)) return [];
    return rows.map(function (row) {
      return normalizeRow(entityId, row);
    });
  }

  function ensureDefaultIntegrity(methods) {
    var rows = methods || [];
    rows.forEach(function (row) {
      if (row.status !== "verified" || row.status === "disabled") {
        row.isDefault = false;
      }
    });

    var eligible = rows.filter(function (row) {
      return row.status === "verified";
    });

    if (!eligible.length) return rows;

    var defaults = eligible.filter(function (row) {
      return !!row.isDefault;
    });

    if (defaults.length === 1) return rows;

    var winner = defaults.length ? defaults[0] : eligible[0];
    rows.forEach(function (row) {
      row.isDefault = row.id === winner.id;
    });
    return rows;
  }

  function seedMethodFromTemplate(entityId, template) {
    return normalizeRow(entityId, {
      id: genMethodId(),
      entityId: normalizeEntityId(entityId),
      methodType: template.methodType,
      label: template.label,
      currency: template.currency,
      isDefault: !!template.isDefault,
      status: template.status,
      statusBeforeDisable: template.statusBeforeDisable || null,
      lastUsedAt: template.lastUsedAt || null,
      reviewSubmittedAt: template.reviewSubmittedAt || null,
      reviewNotes: template.reviewNotes || null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      bank: template.bank || null,
      wallet: template.wallet || null
    });
  }

  function seedMethodsIfMissing(entityId) {
    var code = normalizeEntityId(entityId);
    if (!code) return;
    var key = getMethodsKey(code);
    var existing = safeParse(key, null);
    if (Array.isArray(existing) && existing.length) return;

    var templates = DEFAULT_METHODS[code] || [];
    var rows = templates.map(function (tpl) {
      return seedMethodFromTemplate(code, tpl);
    });
    ensureDefaultIntegrity(rows);
    safeStore(key, rows);
  }

  function getPaymentMethods(entityId) {
    var code = normalizeEntityId(entityId);
    if (!code) return [];
    seedMethodsIfMissing(code);
    var key = getMethodsKey(code);
    var rows = safeParse(key, []);
    var normalized = ensureDefaultIntegrity(normalizeMethods(code, rows));
    safeStore(key, normalized);

    return normalized
      .slice()
      .sort(function (a, b) {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      })
      .map(function (row) {
        return clone(row);
      });
  }

  function savePaymentMethods(entityId, methods) {
    var code = normalizeEntityId(entityId);
    if (!code) return false;
    var rows = ensureDefaultIntegrity(normalizeMethods(code, methods || []));
    var ok = safeStore(getMethodsKey(code), rows);
    if (ok) rebuildIndex();
    return ok;
  }

  function readComparableValue(method) {
    if (!method) return "";
    if (method.methodType === "bank" && method.bank && method.bank.ibanStored) {
      return normalizeIban(decodeSecret(method.bank.ibanStored));
    }
    if (method.methodType === "wallet" && method.wallet && method.wallet.walletIdStored) {
      return normalizeWalletId(decodeSecret(method.wallet.walletIdStored));
    }
    return "";
  }

  function validatePayload(entityId, payload, options) {
    var opts = options || {};
    var methodType = payload.methodType === "wallet" ? "wallet" : payload.methodType === "bank" ? "bank" : "";
    var label = String(payload.label || "").trim();
    var currency = String(payload.currency || "")
      .trim()
      .toUpperCase();
    var errors = {};

    if (!methodType) errors.methodType = "Select payment method type.";
    if (!label) errors.label = "Label is required.";
    if (!currency) errors.currency = "Currency is required.";

    var methods = getPaymentMethods(entityId);
    var others = methods.filter(function (row) {
      return String(row.id) !== String(opts.methodId || "");
    });
    var existing = opts.existing || null;

    if (methodType === "bank") {
      var bank = payload.bank || {};
      var beneficiaryName = String(bank.beneficiaryName || "").trim();
      var country = String(bank.country || "KSA")
        .trim()
        .toUpperCase();
      var inputIban = normalizeIban(bank.iban);
      var existingIban = existing && existing.bank ? normalizeIban(decodeSecret(existing.bank.ibanStored)) : "";
      var comparableIban = inputIban || existingIban;

      if (!beneficiaryName) errors.beneficiaryName = "Beneficiary name is required.";
      if (!comparableIban) {
        errors.iban = "IBAN is required.";
      } else if (country === "KSA") {
        if (!/^SA[A-Z0-9]{13,32}$/.test(comparableIban)) {
          errors.iban = "KSA IBAN must start with SA and use a valid format.";
        }
      } else if (!/^[A-Z0-9]{15,34}$/.test(comparableIban)) {
        errors.iban = "Invalid IBAN format.";
      }

      if (comparableIban) {
        var duplicateIban = others.some(function (row) {
          return row.methodType === "bank" && readComparableValue(row) === comparableIban;
        });
        if (duplicateIban) errors.iban = "This IBAN already exists for this entity.";
      }
    }

    if (methodType === "wallet") {
      var wallet = payload.wallet || {};
      var provider = String(wallet.provider || "").trim();
      var providerOther = String(wallet.providerOther || "").trim();
      var ownerName = String(wallet.ownerName || "").trim();
      var inputWallet = String(wallet.walletId || "").trim();
      var existingWallet = existing && existing.wallet ? String(decodeSecret(existing.wallet.walletIdStored || "") || "").trim() : "";
      var comparableWallet = normalizeWalletId(inputWallet || existingWallet);

      if (!provider) errors.walletProvider = "Wallet provider is required.";
      if (provider === "Other" && !providerOther) errors.walletProviderOther = "Enter the other wallet provider name.";
      if (!ownerName) errors.walletOwnerName = "Owner name is required.";
      if (!comparableWallet) {
        errors.walletId = "Wallet ID is required.";
      } else if (comparableWallet.length < 6) {
        errors.walletId = "Wallet ID must be at least 6 characters.";
      }

      if (comparableWallet) {
        var duplicateWallet = others.some(function (row) {
          return row.methodType === "wallet" && readComparableValue(row) === comparableWallet;
        });
        if (duplicateWallet) errors.walletId = "This wallet ID already exists for this entity.";
      }
    }

    return {
      ok: Object.keys(errors).length === 0,
      errors: errors
    };
  }

  function normalizeMethodPayload(entityId, payload, existing) {
    var now = nowIso();
    var methodType = payload.methodType === "wallet" ? "wallet" : "bank";
    var row = existing
      ? clone(existing)
      : {
          id: genMethodId(),
          entityId: normalizeEntityId(entityId),
          createdAt: now,
          status: "draft",
          reviewSubmittedAt: null,
          reviewNotes: null
        };

    row.entityId = normalizeEntityId(entityId);
    row.methodType = methodType;
    row.label = String(payload.label || "").trim();
    row.currency = String(payload.currency || "SAR")
      .trim()
      .toUpperCase();
    row.updatedAt = now;
    row.lastUsedAt = row.lastUsedAt || null;
    row.status = normalizeStatus(row.status);
    row.reviewSubmittedAt = row.reviewSubmittedAt || null;
    row.reviewNotes = row.reviewNotes || null;
    row.isDefault = !!payload.isDefault;

    if (!existing) {
      row.status = "draft";
      row.statusBeforeDisable = null;
      row.isDefault = false;
    }

    if (methodType === "bank") {
      var bankPayload = payload.bank || {};
      var existingIban = existing && existing.bank ? decodeSecret(existing.bank.ibanStored || "") : "";
      var inputIban = normalizeIban(bankPayload.iban);
      var finalIban = inputIban || normalizeIban(existingIban);

      row.bank = {
        beneficiaryName: String(bankPayload.beneficiaryName || "").trim(),
        ibanStored: encodeSecret(finalIban),
        ibanLast4: getLast4(finalIban),
        bankName: String(bankPayload.bankName || "").trim(),
        country: String(bankPayload.country || "KSA")
          .trim()
          .toUpperCase(),
        attachmentName: String(bankPayload.attachmentName || "").trim()
      };
      row.wallet = null;
    } else {
      var walletPayload = payload.wallet || {};
      var existingWallet = existing && existing.wallet ? decodeSecret(existing.wallet.walletIdStored || "") : "";
      var inputWallet = String(walletPayload.walletId || "").trim();
      var finalWallet = inputWallet || existingWallet;

      row.wallet = {
        provider: String(walletPayload.provider || "").trim(),
        providerOther: String(walletPayload.providerOther || "").trim(),
        walletIdStored: encodeSecret(finalWallet),
        walletIdLast4: getLast4(finalWallet),
        ownerName: String(walletPayload.ownerName || "").trim()
      };
      row.bank = null;
    }

    return row;
  }

  function upsertMethod(entityId, payload, options) {
    var opts = options || {};
    var methods = getPaymentMethods(entityId);
    var existing = null;
    var index = -1;

    if (opts.isEdit) {
      for (var i = 0; i < methods.length; i += 1) {
        if (String(methods[i].id) === String(opts.methodId)) {
          existing = methods[i];
          index = i;
          break;
        }
      }
      if (!existing) return { ok: false, message: "Payment method not found." };
    }

    var validation = validatePayload(entityId, payload, {
      methodId: opts.methodId,
      existing: existing
    });
    if (!validation.ok) return { ok: false, errors: validation.errors };

    var normalized = normalizeMethodPayload(entityId, payload, existing);

    if (opts.isEdit && index > -1) methods[index] = normalized;
    else methods.push(normalized);

    if (normalized.isDefault) {
      methods.forEach(function (row) {
        if (row.id !== normalized.id) row.isDefault = false;
      });
    }

    savePaymentMethods(entityId, methods);
    return { ok: true, method: clone(normalized) };
  }

  function createPaymentMethod(entityId, payload) {
    return upsertMethod(entityId, payload, { isEdit: false });
  }

  function updatePaymentMethod(entityId, methodId, payload) {
    return upsertMethod(entityId, payload, { isEdit: true, methodId: methodId });
  }

  function findMethod(entityId, methodId) {
    var methods = getPaymentMethods(entityId);
    for (var i = 0; i < methods.length; i += 1) {
      if (String(methods[i].id) === String(methodId)) {
        return { methods: methods, row: methods[i], index: i };
      }
    }
    return null;
  }

  function submitMethodForReview(entityId, methodId, reviewNotes) {
    var found = findMethod(entityId, methodId);
    if (!found) return { ok: false, message: "Payment method not found." };
    if (found.row.status === "disabled") {
      return { ok: false, message: "Enable this method before submitting for review." };
    }
    if (found.row.status === "verified") {
      return { ok: false, message: "This method is already verified." };
    }

    found.row.status = "pending";
    found.row.reviewSubmittedAt = nowIso();
    found.row.reviewNotes = reviewNotes ? String(reviewNotes).trim() : null;
    found.row.updatedAt = nowIso();
    found.row.isDefault = false;
    savePaymentMethods(entityId, found.methods);
    return { ok: true };
  }

  function verifyMethod(entityId, methodId) {
    var found = findMethod(entityId, methodId);
    if (!found) return { ok: false, message: "Payment method not found." };
    if (found.row.status === "disabled") {
      return { ok: false, message: "Enable this method before verification." };
    }
    if (found.row.status !== "pending") {
      return { ok: false, message: "Only pending methods can be verified." };
    }

    found.row.status = "verified";
    found.row.updatedAt = nowIso();
    savePaymentMethods(entityId, found.methods);
    return { ok: true };
  }

  function setDefaultMethod(entityId, methodId) {
    var found = findMethod(entityId, methodId);
    if (!found) return { ok: false, message: "Payment method not found." };
    if (found.row.status !== "verified") {
      return { ok: false, message: "Only verified methods can be set as default." };
    }
    if (found.row.status === "disabled") {
      return { ok: false, message: "Disabled methods cannot be set as default." };
    }

    found.methods.forEach(function (row) {
      row.isDefault = String(row.id) === String(methodId);
      row.updatedAt = nowIso();
    });
    savePaymentMethods(entityId, found.methods);
    return { ok: true };
  }

  function disableMethod(entityId, methodId) {
    var found = findMethod(entityId, methodId);
    if (!found) return { ok: false, message: "Payment method not found." };

    if (found.row.status !== "disabled") {
      found.row.statusBeforeDisable = normalizeStatus(found.row.status || "draft");
      found.row.status = "disabled";
      found.row.isDefault = false;
      found.row.updatedAt = nowIso();
      savePaymentMethods(entityId, found.methods);
    }

    return { ok: true };
  }

  function enableMethod(entityId, methodId) {
    var found = findMethod(entityId, methodId);
    if (!found) return { ok: false, message: "Payment method not found." };

    if (found.row.status === "disabled") {
      found.row.status = normalizeStatus(found.row.statusBeforeDisable || "draft");
      if (found.row.status === "disabled") found.row.status = "draft";
      found.row.statusBeforeDisable = null;
      found.row.updatedAt = nowIso();
      savePaymentMethods(entityId, found.methods);
    }

    return { ok: true };
  }

  function deleteMethod(entityId, methodId) {
    var methods = getPaymentMethods(entityId);
    var before = methods.length;
    var filtered = methods.filter(function (row) {
      return String(row.id) !== String(methodId);
    });
    if (before === filtered.length) return { ok: false, message: "Payment method not found." };
    savePaymentMethods(entityId, filtered);
    return { ok: true };
  }

  function maskDestination(method) {
    if (!method) return "-";
    if (method.methodType === "bank") {
      var bankName = (method.bank && method.bank.bankName) || "Bank";
      var bankLast4 = (method.bank && method.bank.ibanLast4) || "----";
      return bankName + " ****" + bankLast4;
    }
    var provider = (method.wallet && method.wallet.provider) || "Wallet";
    if (provider === "Other") {
      provider = (method.wallet && method.wallet.providerOther) || "Wallet";
    }
    var walletLast4 = (method.wallet && method.wallet.walletIdLast4) || "----";
    return provider + " ****" + walletLast4;
  }

  function rebuildIndex() {
    var entities = getEntities();
    var indexRows = [];

    entities.forEach(function (entity) {
      var code = normalizeEntityId(entity.id || entity.code);
      var rows = normalizeMethods(code, safeParse(getMethodsKey(code), []));
      rows.forEach(function (method) {
        indexRows.push({
          entityId: code,
          methodId: method.id,
          methodType: method.methodType,
          status: normalizeStatus(method.status),
          isDefault: !!method.isDefault,
          currency: method.currency,
          updatedAt: method.updatedAt
        });
      });
    });

    safeStore(INDEX_KEY, indexRows);
    return clone(indexRows);
  }

  function ensureSeedData() {
    var entities = getEntities();
    if (!entities.length) {
      safeStore(ENTITIES_KEY, DEFAULT_ENTITIES);
      entities = clone(DEFAULT_ENTITIES);
    }

    entities.forEach(function (entity) {
      seedMethodsIfMissing(entity.id || entity.code);
    });

    rebuildIndex();
  }

  window.NKPaymentMethodsStore = {
    ENTITIES_KEY: ENTITIES_KEY,
    INDEX_KEY: INDEX_KEY,
    METHODS_PREFIX: METHODS_PREFIX,
    ensureSeedData: ensureSeedData,
    resolveEntityFromQuery: resolveEntityFromQuery,
    getEntities: getEntities,
    getEntityByCode: getEntityByCode,
    getPaymentMethods: getPaymentMethods,
    createPaymentMethod: createPaymentMethod,
    updatePaymentMethod: updatePaymentMethod,
    setDefaultMethod: setDefaultMethod,
    submitMethodForReview: submitMethodForReview,
    verifyMethod: verifyMethod,
    disableMethod: disableMethod,
    enableMethod: enableMethod,
    deleteMethod: deleteMethod,
    maskDestination: maskDestination,
    rebuildIndex: rebuildIndex,
    decodeSecret: decodeSecret,
    encodeSecret: encodeSecret,
    normalizeEntityId: normalizeEntityId,
    normalizeIban: normalizeIban,
    normalizeWalletId: normalizeWalletId,
    normalizeStatus: normalizeStatus,
    toTypeLabel: toTypeLabel,
    toStatusLabel: toStatusLabel
  };
})();
