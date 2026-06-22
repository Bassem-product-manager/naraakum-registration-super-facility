(function () {
  "use strict";

  var STORE_KEY = "nk_naraakum_contracts_dataset_v1";

  var el = {
    contractNameInput: document.getElementById("contractNameInput"),
    contractPdfInput: document.getElementById("contractPdfInput"),
    contractPdfMeta: document.getElementById("contractPdfMeta"),
    contractDescriptionInput: document.getElementById("contractDescriptionInput"),
    saveContractBtn: document.getElementById("saveContractBtn"),
    clearContractBtn: document.getElementById("clearContractBtn"),
    contractsFormHint: document.getElementById("contractsFormHint"),
    ksaTime: document.getElementById("ksaTime")
  };

  var selectedFile = null;

  function loadRecords() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function saveRecords(records) {
    localStorage.setItem(STORE_KEY, JSON.stringify(records || []));
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function nextId(records) {
    var max = 0;
    records.forEach(function (row) {
      var id = String(row.id || "");
      var match = id.match(/(\d+)$/);
      if (!match) return;
      var n = parseInt(match[1], 10);
      if (Number.isFinite(n) && n > max) max = n;
    });
    return "CNT-" + String(max + 1).padStart(5, "0");
  }

  function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(String(reader.result || ""));
      };
      reader.onerror = function () {
        reject(new Error("Cannot read file."));
      };
      reader.readAsDataURL(file);
    });
  }

  function showHint(message, type) {
    if (!el.contractsFormHint) return;
    el.contractsFormHint.textContent = message || "";
    el.contractsFormHint.classList.remove("success", "error");
    if (type) el.contractsFormHint.classList.add(type);
  }

  function clearForm() {
    selectedFile = null;
    if (el.contractNameInput) el.contractNameInput.value = "";
    if (el.contractPdfInput) el.contractPdfInput.value = "";
    if (el.contractDescriptionInput) el.contractDescriptionInput.value = "";
    if (el.contractPdfMeta) el.contractPdfMeta.textContent = "No file selected.";
  }

  function validateForm(name, description, file) {
    if (!name) return "Contract Name is required.";
    if (!file) return "PDF file is required.";
    if (!description) return "Description is required.";
    return "";
  }

  async function saveForm() {
    try {
      var contractName = (el.contractNameInput && el.contractNameInput.value || "").trim();
      var description = (el.contractDescriptionInput && el.contractDescriptionInput.value || "").trim();
      var error = validateForm(contractName, description, selectedFile);
      if (error) {
        showHint(error, "error");
        return;
      }

      showHint("Uploading PDF and saving contract...", "");
      var dataUrl = await readFileAsDataUrl(selectedFile);
      var records = loadRecords();
      var stamp = nowIso();

      records.unshift({
        id: nextId(records),
        contractName: contractName,
        pdfName: selectedFile.name,
        pdfDataUrl: dataUrl,
        description: description,
        createdAt: stamp,
        updatedAt: stamp
      });

      saveRecords(records);
      showHint("Contract saved. Redirecting to contracts table...", "success");
      window.setTimeout(function () {
        window.location.href = "terms-contracts.html";
      }, 500);
    } catch (err) {
      showHint("Failed to save contract file.", "error");
    }
  }

  function bindEvents() {
    if (el.contractPdfInput) {
      el.contractPdfInput.addEventListener("change", function () {
        var file = el.contractPdfInput.files && el.contractPdfInput.files[0];
        if (!file) {
          selectedFile = null;
          if (el.contractPdfMeta) el.contractPdfMeta.textContent = "No file selected.";
          return;
        }
        selectedFile = file;
        if (el.contractPdfMeta) {
          var sizeKb = Math.max(1, Math.round(file.size / 1024));
          el.contractPdfMeta.textContent = "Selected: " + file.name + " (" + sizeKb + " KB)";
        }
      });
    }

    if (el.saveContractBtn) el.saveContractBtn.addEventListener("click", saveForm);

    if (el.clearContractBtn) {
      el.clearContractBtn.addEventListener("click", function () {
        clearForm();
        showHint("Form cleared.", "");
      });
    }
  }

  function initClock() {
    if (!el.ksaTime) return;
    function tick() {
      try {
        var fmt = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Riyadh",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        });
        el.ksaTime.textContent = fmt.format(new Date());
      } catch (err) {
        el.ksaTime.textContent = new Date().toLocaleTimeString("en-US", { hour12: true });
      }
    }
    tick();
    setInterval(tick, 1000);
  }

  initClock();
  bindEvents();
})();
