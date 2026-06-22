(function (global) {
  "use strict";

  var STORAGE_KEY = "nk_naraakm_packages_v1";
  var FLASH_KEY = "nk_naraakm_packages_flash_v1";
  var MAX_COMMISSION_PERCENT = 22;

  var SERVICE_CATALOG = [
    { id: "NS-1001", mainService: "Nephrology", serviceName: "Hemodialysis Session", basePrice: 350, active: true },
    { id: "NS-1002", mainService: "Nephrology", serviceName: "Dialysis Consumables Kit", basePrice: 120, active: true },
    { id: "NS-1003", mainService: "Nephrology", serviceName: "Nephrologist Follow-up", basePrice: 240, active: true },

    { id: "NS-2001", mainService: "Physiotherapy", serviceName: "Home Physiotherapy Session", basePrice: 180, active: true },
    { id: "NS-2002", mainService: "Physiotherapy", serviceName: "Post-Operative Rehab Session", basePrice: 220, active: true },
    { id: "NS-2003", mainService: "Physiotherapy", serviceName: "Electrotherapy Session", basePrice: 170, active: true },

    { id: "NS-3001", mainService: "Laboratory", serviceName: "CBC Home Collection", basePrice: 95, active: true },
    { id: "NS-3002", mainService: "Laboratory", serviceName: "Comprehensive Metabolic Panel", basePrice: 210, active: true },
    { id: "NS-3003", mainService: "Laboratory", serviceName: "HbA1c Test", basePrice: 130, active: true },

    { id: "NS-4001", mainService: "Home Nursing", serviceName: "Nursing Visit (8 Hours)", basePrice: 320, active: true },
    { id: "NS-4002", mainService: "Home Nursing", serviceName: "Wound Dressing Visit", basePrice: 190, active: true },
    { id: "NS-4003", mainService: "Home Nursing", serviceName: "Medication Administration Visit", basePrice: 160, active: true }
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function norm(value) {
    return String(value || "").trim();
  }

  function lower(value) {
    return norm(value).toLowerCase();
  }

  function upper(value) {
    return norm(value).toUpperCase();
  }

  function toNum(value, fallback) {
    var n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function toInt(value, fallback) {
    var n = parseInt(value, 10);
    return Number.isFinite(n) ? n : fallback;
  }

  function pad(value, size) {
    return String(value).padStart(size, "0");
  }

  function roundMoney(value) {
    return Math.round((toNum(value, 0) + Number.EPSILON) * 100) / 100;
  }

  function uniqueStrings(values) {
    var list = Array.isArray(values) ? values : [];
    var map = {};
    var output = [];

    list.forEach(function (entry) {
      var value = norm(entry);
      var key = lower(value);
      if (!key || map[key]) return;
      map[key] = true;
      output.push(value);
    });

    return output;
  }

  function nowStamp() {
    var now = new Date();
    var y = now.getFullYear();
    var m = pad(now.getMonth() + 1, 2);
    var d = pad(now.getDate(), 2);
    var h = pad(now.getHours(), 2);
    var mm = pad(now.getMinutes(), 2);
    return y + "-" + m + "-" + d + " " + h + ":" + mm;
  }

  function normalizeService(item, index) {
    var source = item || {};
    var basePrice = roundMoney(toNum(source.basePrice, 0));

    return {
      id: upper(source.id) || ("NS-" + pad(index + 1, 4)),
      mainService: norm(source.mainService),
      serviceName: norm(source.serviceName),
      basePrice: basePrice < 0 ? 0 : basePrice,
      active: Object.prototype.hasOwnProperty.call(source, "active") ? !!source.active : true
    };
  }

  function getCatalog() {
    return SERVICE_CATALOG.map(normalizeService);
  }

  function buildCatalogMap() {
    var map = {};
    getCatalog().forEach(function (service) {
      map[upper(service.id)] = service;
    });
    return map;
  }

  function normalizeCommissionType(value) {
    var key = lower(value);
    if (key === "fixed") return "fixed";
    return "percent";
  }

  function normalizeReferenceIds(values) {
    var source = Array.isArray(values) ? values : [];
    var normalized = source.map(function (entry) {
      return upper(entry);
    });
    return uniqueStrings(normalized);
  }

  function normalizeMainServices(mainServices, fallbackMainService, bundleItems) {
    var values = [];
    if (Array.isArray(mainServices)) values = values.concat(mainServices);
    else if (norm(mainServices)) values.push(mainServices);

    if (norm(fallbackMainService)) values.push(fallbackMainService);

    var bundle = Array.isArray(bundleItems) ? bundleItems : [];
    bundle.forEach(function (item) {
      values.push(item && item.mainService);
    });

    return uniqueStrings(values);
  }

  function normalizeBundleItem(item, catalogMap) {
    var source = item || {};
    var serviceId = upper(source.serviceId || source.id);
    var catalogService = serviceId ? catalogMap[serviceId] : null;

    var serviceName = norm(source.serviceName);
    var mainService = norm(source.mainService);
    var basePrice = roundMoney(toNum(source.basePrice, 0));
    var quantity = toInt(source.quantity, 1);

    if (catalogService) {
      serviceId = catalogService.id;
      if (!serviceName) serviceName = catalogService.serviceName;
      if (!mainService) mainService = catalogService.mainService;
      if (basePrice <= 0) basePrice = catalogService.basePrice;
    }

    if (!serviceId) return null;
    if (!serviceName) serviceName = "Service";
    if (quantity <= 0) quantity = 1;
    if (basePrice < 0) basePrice = 0;

    return {
      serviceId: serviceId,
      serviceName: serviceName,
      mainService: mainService,
      basePrice: roundMoney(basePrice),
      quantity: quantity,
      lineTotal: roundMoney(basePrice * quantity)
    };
  }

  function mergeBundleItems(items) {
    var source = Array.isArray(items) ? items : [];
    var map = {};

    source.forEach(function (item) {
      if (!item) return;
      var id = upper(item.serviceId || item.id);
      if (!id) return;

      var current = map[id];
      var basePrice = roundMoney(toNum(item.basePrice, 0));
      var quantity = Math.max(1, toInt(item.quantity, 1));
      var serviceName = norm(item.serviceName);
      var mainService = norm(item.mainService);

      if (!current) {
        map[id] = {
          serviceId: id,
          serviceName: serviceName || "Service",
          mainService: mainService,
          basePrice: basePrice,
          quantity: quantity
        };
        return;
      }

      current.quantity += quantity;
      if (!current.serviceName && serviceName) current.serviceName = serviceName;
      if (!current.mainService && mainService) current.mainService = mainService;
      if (basePrice > 0) current.basePrice = basePrice;
    });

    return Object.keys(map)
      .map(function (id) {
        var row = map[id];
        return {
          serviceId: row.serviceId,
          serviceName: row.serviceName || "Service",
          mainService: row.mainService,
          basePrice: roundMoney(row.basePrice),
          quantity: Math.max(1, toInt(row.quantity, 1)),
          lineTotal: roundMoney(row.basePrice * row.quantity)
        };
      })
      .sort(function (a, b) {
        var aMain = lower(a.mainService);
        var bMain = lower(b.mainService);
        if (aMain < bMain) return -1;
        if (aMain > bMain) return 1;
        if (lower(a.serviceName) < lower(b.serviceName)) return -1;
        if (lower(a.serviceName) > lower(b.serviceName)) return 1;
        return 0;
      });
  }

  function calculateTotals(bundleItems, commissionType, commissionValue) {
    var items = Array.isArray(bundleItems) ? bundleItems : [];
    var validItems = mergeBundleItems(items);

    var subtotal = validItems.reduce(function (sum, item) {
      return sum + roundMoney(item.lineTotal);
    }, 0);
    subtotal = roundMoney(subtotal);

    var type = normalizeCommissionType(commissionType);
    var value = toNum(commissionValue, 0);
    if (value < 0) value = 0;
    if (type === "percent" && value > MAX_COMMISSION_PERCENT) value = MAX_COMMISSION_PERCENT;

    var commissionAmount = type === "fixed" ? value : (subtotal * value) / 100;
    commissionAmount = roundMoney(commissionAmount);

    var finalTotal = roundMoney(subtotal + commissionAmount);

    return {
      subtotal: subtotal,
      commissionType: type,
      commissionValue: type === "percent" ? roundMoney(value) : roundMoney(value),
      commissionAmount: commissionAmount,
      finalTotal: finalTotal,
      servicesCount: validItems.length
    };
  }

  function createSeed() {
    var catalog = buildCatalogMap();
    var firstManual = mergeBundleItems([
      normalizeBundleItem({ serviceId: "NS-1001", quantity: 8 }, catalog),
      normalizeBundleItem({ serviceId: "NS-1002", quantity: 8 }, catalog),
      normalizeBundleItem({ serviceId: "NS-1003", quantity: 2 }, catalog)
    ]);

    var secondManual = mergeBundleItems([
      normalizeBundleItem({ serviceId: "NS-2001", quantity: 6 }, catalog),
      normalizeBundleItem({ serviceId: "NS-2002", quantity: 2 }, catalog)
    ]);

    return [
      {
        id: "NRP-0001",
        name: "Dialysis Home Bundle",
        nameEn: "Dialysis Home Bundle",
        nameAr: "",
        code: "NRP-DIAL-01",
        mainServices: ["Nephrology"],
        manualBundleItems: firstManual,
        bundleItems: firstManual,
        referencedPackageIds: [],
        commissionType: "percent",
        commissionValue: 12,
        description: "Bundle for recurrent dialysis and follow-up.",
        isActive: true,
        updatedAt: "2026-03-25 11:20"
      },
      {
        id: "NRP-0002",
        name: "Rehab Recovery Package",
        nameEn: "Rehab Recovery Package",
        nameAr: "",
        code: "NRP-REHAB-01",
        mainServices: ["Physiotherapy"],
        manualBundleItems: secondManual,
        bundleItems: secondManual,
        referencedPackageIds: [],
        commissionType: "fixed",
        commissionValue: 120,
        description: "Focused package for post-op physiotherapy.",
        isActive: true,
        updatedAt: "2026-03-26 09:45"
      }
    ];
  }

  function normalizePackage(item, index) {
    var source = item || {};
    var catalogMap = buildCatalogMap();

    var manualRaw = Array.isArray(source.manualBundleItems) ? source.manualBundleItems : source.bundleItems;
    var manualBundleItems = mergeBundleItems(
      (Array.isArray(manualRaw) ? manualRaw : [])
        .map(function (entry) {
          return normalizeBundleItem(entry, catalogMap);
        })
        .filter(Boolean)
    );

    var bundleRaw = Array.isArray(source.bundleItems) ? source.bundleItems : manualBundleItems;
    var bundleItems = mergeBundleItems(
      (Array.isArray(bundleRaw) ? bundleRaw : [])
        .map(function (entry) {
          return normalizeBundleItem(entry, catalogMap);
        })
        .filter(Boolean)
    );
    if (!bundleItems.length && manualBundleItems.length) {
      bundleItems = clone(manualBundleItems);
    }

    var nameEn = norm(source.nameEn);
    var nameAr = norm(source.nameAr);
    var fallbackName = norm(source.name) || nameEn || nameAr || "Untitled Package";

    var commissionType = normalizeCommissionType(source.commissionType);
    var commissionValue = toNum(source.commissionValue, 0);
    if (commissionValue < 0) commissionValue = 0;
    if (commissionType === "percent" && commissionValue > MAX_COMMISSION_PERCENT) {
      commissionValue = MAX_COMMISSION_PERCENT;
    }

    var totals = calculateTotals(bundleItems, commissionType, commissionValue);
    var mainServices = normalizeMainServices(source.mainServices, source.mainService, bundleItems);

    var id = upper(source.id) || ("NRP-" + pad(index + 1, 4));
    var referencedPackageIds = normalizeReferenceIds(source.referencedPackageIds).filter(function (entry) {
      return upper(entry) !== id;
    });

    return {
      id: id,
      name: fallbackName,
      nameEn: nameEn || (nameAr ? "" : fallbackName),
      nameAr: nameAr,
      code: upper(source.code),
      mainServices: mainServices,
      mainService: mainServices[0] || "",
      manualBundleItems: manualBundleItems,
      bundleItems: bundleItems,
      referencedPackageIds: referencedPackageIds,
      commissionType: totals.commissionType,
      commissionValue: totals.commissionValue,
      commissionAmount: totals.commissionAmount,
      subtotal: totals.subtotal,
      finalTotal: totals.finalTotal,
      servicesCount: totals.servicesCount,
      description: norm(source.description),
      isActive: Object.prototype.hasOwnProperty.call(source, "isActive") ? !!source.isActive : true,
      updatedAt: norm(source.updatedAt) || nowStamp()
    };
  }

  function loadRaw() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      return null;
    }
  }

  function saveRaw(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items || []));
  }

  function ensureData() {
    var loaded = loadRaw();
    if (!Array.isArray(loaded) || !loaded.length) {
      var seeded = createSeed().map(normalizePackage);
      saveRaw(seeded);
      return seeded;
    }

    var normalized = loaded.map(normalizePackage);
    saveRaw(normalized);
    return normalized;
  }

  function nextId(items) {
    var max = 0;
    (items || []).forEach(function (item) {
      var match = norm(item && item.id).match(/^NRP-(\d+)$/i);
      if (!match) return;
      var num = toInt(match[1], 0);
      if (num > max) max = num;
    });
    return "NRP-" + pad(max + 1, 4);
  }

  function uniqueCode(candidate, items, excludeId) {
    var list = Array.isArray(items) ? items : [];
    var base = upper(candidate);
    if (!base) {
      base = "NRP-" + pad(list.length + 1, 4);
    }

    var code = base;
    var i = 2;
    while (
      list.some(function (item) {
        if (!item) return false;
        if (excludeId && lower(item.id) === lower(excludeId)) return false;
        return upper(item.code) === code;
      })
    ) {
      code = base + "-" + i;
      i += 1;
    }

    return code;
  }

  function getAll() {
    return clone(ensureData());
  }

  function getById(id) {
    var key = lower(id);
    if (!key) return null;
    var found = ensureData().find(function (item) {
      return lower(item.id) === key;
    });
    return found ? clone(found) : null;
  }

  function buildBundleFromPackageIds(packageIds, excludeId) {
    var ids = normalizeReferenceIds(packageIds || []);
    var list = ensureData();
    var items = [];
    var excluded = upper(excludeId);

    ids.forEach(function (id) {
      if (excluded && id === excluded) return;
      var found = list.find(function (entry) {
        return upper(entry.id) === id;
      });
      if (!found || !Array.isArray(found.bundleItems)) return;
      items = items.concat(found.bundleItems);
    });

    return mergeBundleItems(items);
  }

  function composeBundle(manualBundleItems, packageIds, excludeId) {
    var catalogMap = buildCatalogMap();
    var manual = mergeBundleItems(
      (Array.isArray(manualBundleItems) ? manualBundleItems : [])
        .map(function (entry) {
          return normalizeBundleItem(entry, catalogMap);
        })
        .filter(Boolean)
    );
    var linked = buildBundleFromPackageIds(packageIds, excludeId);
    return mergeBundleItems(manual.concat(linked));
  }

  function upsert(input) {
    var items = ensureData();
    var payload = normalizePackage(input, items.length);
    var targetId = lower(input && input.id);
    var existingIndex = items.findIndex(function (item) {
      return lower(item.id) === targetId;
    });

    if (existingIndex > -1) {
      var existing = items[existingIndex];
      payload.id = existing.id;
      payload.code = uniqueCode(payload.code || existing.code, items, existing.id);
      payload.referencedPackageIds = payload.referencedPackageIds.filter(function (id) {
        return upper(id) !== upper(existing.id);
      });
      payload.updatedAt = nowStamp();
      items[existingIndex] = Object.assign({}, existing, payload);
      saveRaw(items);
      return clone(items[existingIndex]);
    }

    payload.id = nextId(items);
    payload.code = uniqueCode(payload.code, items);
    payload.referencedPackageIds = payload.referencedPackageIds.filter(function (id) {
      return upper(id) !== upper(payload.id);
    });
    payload.updatedAt = nowStamp();
    items.unshift(payload);
    saveRaw(items);
    return clone(payload);
  }

  function remove(id) {
    var key = lower(id);
    if (!key) return false;
    var items = ensureData();
    var next = items.filter(function (item) {
      return lower(item.id) !== key;
    });
    if (next.length === items.length) return false;
    saveRaw(next);
    return true;
  }

  function toggleActive(id, isActive) {
    var key = lower(id);
    if (!key) return null;
    var items = ensureData();
    var found = items.find(function (item) {
      return lower(item.id) === key;
    });
    if (!found) return null;
    found.isActive = !!isActive;
    found.updatedAt = nowStamp();
    saveRaw(items);
    return clone(found);
  }

  function getMainServices(items) {
    var source = Array.isArray(items) ? items : ensureData();
    var values = [];

    getCatalog().forEach(function (service) {
      values.push(service.mainService);
    });

    source.forEach(function (item) {
      var mains = Array.isArray(item.mainServices) ? item.mainServices : [item.mainService];
      mains.forEach(function (main) {
        values.push(main);
      });
    });

    return uniqueStrings(values);
  }

  function getSubServicesByMain(mainServices) {
    var selected = Array.isArray(mainServices)
      ? uniqueStrings(mainServices).map(lower)
      : [lower(mainServices)].filter(Boolean);

    return getCatalog().filter(function (service) {
      if (!service.active) return false;
      if (!selected.length) return true;
      return selected.indexOf(lower(service.mainService)) !== -1;
    });
  }

  function setFlash(message, type) {
    try {
      sessionStorage.setItem(
        FLASH_KEY,
        JSON.stringify({
          message: norm(message),
          type: norm(type) || "success"
        })
      );
    } catch (err) {
      // noop
    }
  }

  function consumeFlash() {
    try {
      var raw = sessionStorage.getItem(FLASH_KEY);
      if (!raw) return null;
      sessionStorage.removeItem(FLASH_KEY);
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      return {
        message: norm(parsed.message),
        type: norm(parsed.type) || "success"
      };
    } catch (err) {
      return null;
    }
  }

  global.NKNaraakmPackageStore = {
    keys: {
      storage: STORAGE_KEY,
      flash: FLASH_KEY
    },
    limits: {
      maxCommissionPercent: MAX_COMMISSION_PERCENT
    },
    getAll: getAll,
    getById: getById,
    upsert: upsert,
    remove: remove,
    toggleActive: toggleActive,
    getMainServices: getMainServices,
    getServiceCatalog: getCatalog,
    getSubServicesByMain: getSubServicesByMain,
    mergeBundleItems: mergeBundleItems,
    buildBundleFromPackageIds: buildBundleFromPackageIds,
    composeBundle: composeBundle,
    calculateTotals: calculateTotals,
    setFlash: setFlash,
    consumeFlash: consumeFlash
  };
})(window);
