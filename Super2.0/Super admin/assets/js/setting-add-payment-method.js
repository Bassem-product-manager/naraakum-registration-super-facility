(function () {
  function getQueryParam(name) {
    var url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function norm(value) {
    return String(value || "")
      .trim()
      .toLowerCase();
  }

  function normalizeEntityId(value) {
    return String(value || "")
      .trim()
      .toUpperCase();
  }

  function normalizeIban(value) {
    return String(value || "")
      .replace(/\s+/g, "")
      .toUpperCase();
  }

  function normalizeMobile(value) {
    return String(value || "")
      .replace(/\s+/g, "")
      .trim();
  }

  function normalizeMobileForCompare(value) {
    return normalizeMobile(value).replace(/^\+/, "");
  }

  function last4(value) {
    var clean = String(value || "").replace(/\s+/g, "");
    if (!clean) return "";
    return clean.slice(-4);
  }

  function uid() {
    var random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    return "pm_" + Date.now().toString(36) + "_" + random;
  }

  function methodsKey(entityId) {
    return "nk_payment_methods_" + normalizeEntityId(entityId);
  }

  function setFieldError(id, message) {
    var node = document.getElementById(id);
    if (!node) return;
    node.textContent = message || "";
    node.classList.toggle("d-none", !message);
  }

  function clearFieldErrors() {
    var nodes = document.querySelectorAll(".field-error");
    nodes.forEach(function (node) {
      node.textContent = "";
      node.classList.add("d-none");
    });
  }

  function setFormMessage(text, kind) {
    var box = document.getElementById("pmFormMessage");
    if (!box) return;

    if (!text) {
      box.classList.add("d-none");
      box.textContent = "";
      box.classList.remove("alert-danger");
      box.classList.remove("alert-success");
      return;
    }

    box.classList.remove("d-none");
    box.textContent = text;
    box.classList.toggle("alert-danger", kind === "error");
    box.classList.toggle("alert-success", kind !== "error");
  }

  function readMethods(entityId) {
    try {
      var raw = localStorage.getItem(methodsKey(entityId));
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function saveMethods(entityId, methods) {
    try {
      localStorage.setItem(methodsKey(entityId), JSON.stringify(methods));
      return true;
    } catch (err) {
      return false;
    }
  }

  function selectedMethodType() {
    var checked = document.querySelector('input[name="pmMethodType"]:checked');
    return checked ? norm(checked.value) : "";
  }

  document.addEventListener("DOMContentLoaded", function () {
    var store = window.NKPaymentMethodsStore || null;
    if (store && typeof store.ensureSeedData === "function") {
      store.ensureSeedData();
    }

    var rawEntityId = getQueryParam("entityId");
    var entityId = store && typeof store.normalizeEntityId === "function" ? store.normalizeEntityId(rawEntityId) : normalizeEntityId(rawEntityId);
    var entity = store && typeof store.getEntityByCode === "function" ? store.getEntityByCode(entityId) : null;

    var missingState = document.getElementById("pmAddMissingEntity");
    var content = document.getElementById("pmAddContent");
    var backLinks = document.querySelectorAll(".js-back-to-list");

    var bankFields = document.getElementById("bankFields");
    var walletFields = document.getElementById("walletFields");

    var labelInput = document.getElementById("pmLabel");
    var activeInput = document.getElementById("pmActive");

    var beneficiaryInput = document.getElementById("pmBeneficiaryName");
    var ibanInput = document.getElementById("pmIban");
    var bankNameInput = document.getElementById("pmBankName");

    var walletProviderInput = document.getElementById("pmWalletProvider");
    var walletOwnerInput = document.getElementById("pmWalletOwnerName");
    var walletMobileInput = document.getElementById("pmWalletMobile");

    var saveButton = document.getElementById("btnSaveMethod");

    function backUrl() {
      return "payment_methods.html?entityId=" + encodeURIComponent(entityId);
    }

    function setMissingState() {
      if (missingState) missingState.classList.remove("d-none");
      if (content) content.classList.add("d-none");
      backLinks.forEach(function (node) {
        node.setAttribute("href", "payment_methods.html");
      });
    }

    function setValidState() {
      if (missingState) missingState.classList.add("d-none");
      if (content) content.classList.remove("d-none");

      backLinks.forEach(function (node) {
        node.setAttribute("href", backUrl());
      });
    }

    function toggleTypeFields() {
      var type = selectedMethodType();
      var wallet = type === "wallet";
      if (bankFields) bankFields.classList.toggle("d-none", wallet);
      if (walletFields) walletFields.classList.toggle("d-none", !wallet);
      clearFieldErrors();
      setFormMessage("");
    }

    function extractRowIban(row) {
      if (!row || !row.bank) return "";
      if (row.bank.iban) return normalizeIban(row.bank.iban);

      if (row.bank.ibanStored && store && typeof store.decodeSecret === "function") {
        return normalizeIban(store.decodeSecret(row.bank.ibanStored));
      }
      return "";
    }

    function extractRowWalletMobile(row) {
      if (!row || !row.wallet) return "";
      if (row.wallet.mobile) return normalizeMobileForCompare(row.wallet.mobile);
      if (row.wallet.walletId) return normalizeMobileForCompare(row.wallet.walletId);

      if (row.wallet.walletIdStored && store && typeof store.decodeSecret === "function") {
        return normalizeMobileForCompare(store.decodeSecret(row.wallet.walletIdStored));
      }
      return "";
    }

    function validate(type) {
      var valid = true;
      clearFieldErrors();

      if (type !== "bank" && type !== "wallet") {
        setFieldError("errMethodType", "Select a payment method type.");
        return false;
      }

      var existing = readMethods(entityId);

      if (type === "bank") {
        var beneficiaryName = String((beneficiaryInput && beneficiaryInput.value) || "").trim();
        var ibanRaw = String((ibanInput && ibanInput.value) || "");
        var ibanValue = normalizeIban(ibanRaw);

        if (!beneficiaryName) {
          setFieldError("errBeneficiaryName", "Beneficiary name is required.");
          valid = false;
        }

        if (!ibanValue) {
          setFieldError("errIban", "IBAN is required.");
          valid = false;
        } else if (!/^SA[A-Z0-9]{22}$/.test(ibanValue)) {
          setFieldError("errIban", "IBAN must start with SA and be exactly 24 characters.");
          valid = false;
        } else {
          var duplicateIban = existing.some(function (row) {
            return extractRowIban(row) === ibanValue;
          });
          if (duplicateIban) {
            setFieldError("errIban", "This IBAN already exists for this entity.");
            valid = false;
          }
        }
      }

      if (type === "wallet") {
        var provider = String((walletProviderInput && walletProviderInput.value) || "").trim();
        var ownerName = String((walletOwnerInput && walletOwnerInput.value) || "").trim();
        var mobileRaw = String((walletMobileInput && walletMobileInput.value) || "");
        var mobileValue = normalizeMobile(mobileRaw);
        var mobileComparable = normalizeMobileForCompare(mobileValue);

        if (!provider) {
          setFieldError("errWalletProvider", "Wallet provider is required.");
          valid = false;
        }

        if (!ownerName) {
          setFieldError("errWalletOwnerName", "Owner name is required.");
          valid = false;
        }

        if (!mobileValue) {
          setFieldError("errWalletMobile", "Mobile number is required.");
          valid = false;
        } else if (!/^\+?\d{9,15}$/.test(mobileValue)) {
          setFieldError("errWalletMobile", "Mobile must be 9-15 digits and may start with +.");
          valid = false;
        } else {
          var duplicateMobile = existing.some(function (row) {
            return extractRowWalletMobile(row) === mobileComparable;
          });
          if (duplicateMobile) {
            setFieldError("errWalletMobile", "This mobile number already exists for this entity.");
            valid = false;
          }
        }
      }

      return valid;
    }

    function buildRecord(type) {
      var now = new Date().toISOString();
      var existing = readMethods(entityId);
      var label = String((labelInput && labelInput.value) || "").trim();
      var isFirstMethod = existing.length === 0;
      var makeDefault = isFirstMethod;
      var active = !!(activeInput && activeInput.checked);

      var record = {
        id: uid(),
        type: type,
        methodType: type,
        label: label || "",
        active: active,
        isDefault: makeDefault,
        currency: "SAR",
        status: active ? "verified" : "disabled",
        createdAt: now,
        updatedAt: now,
        bank: null,
        wallet: null
      };

      if (type === "bank") {
        var ibanValue = normalizeIban((ibanInput && ibanInput.value) || "");
        var ibanLast4 = last4(ibanValue);
        record.bank = {
          beneficiaryName: String((beneficiaryInput && beneficiaryInput.value) || "").trim(),
          iban: ibanValue,
          bankName: String((bankNameInput && bankNameInput.value) || "").trim(),
          last4: ibanLast4,
          ibanLast4: ibanLast4
        };
      } else {
        var mobileValue = normalizeMobile((walletMobileInput && walletMobileInput.value) || "");
        var mobileLast4 = last4(normalizeMobileForCompare(mobileValue));
        record.wallet = {
          provider: String((walletProviderInput && walletProviderInput.value) || "").trim(),
          ownerName: String((walletOwnerInput && walletOwnerInput.value) || "").trim(),
          mobile: mobileValue,
          last4: mobileLast4,
          walletId: mobileValue,
          walletIdLast4: mobileLast4
        };
      }

      if (makeDefault) {
        existing.forEach(function (row) {
          row.isDefault = false;
        });
      }
      existing.push(record);

      return { rows: existing, record: record };
    }

    function saveRecord() {
      clearFieldErrors();
      setFormMessage("");

      var type = selectedMethodType();
      if (!validate(type)) {
        setFormMessage("Please fix validation errors.", "error");
        return;
      }

      var output = buildRecord(type);
      var ok = saveMethods(entityId, output.rows);
      if (!ok) {
        setFormMessage("Could not save payment method. Please try again.", "error");
        return;
      }

      window.location.href = backUrl() + "&saved=1";
    }

    if (!entityId || !entity) {
      setMissingState();
      return;
    }

    setValidState();
    toggleTypeFields();

    if (activeInput) activeInput.checked = true;

    document.querySelectorAll('input[name="pmMethodType"]').forEach(function (radio) {
      radio.addEventListener("change", toggleTypeFields);
    });

    if (saveButton) {
      saveButton.addEventListener("click", saveRecord);
    }
  });
})();
