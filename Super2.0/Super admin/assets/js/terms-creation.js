(function () {
  "use strict";

  var STORE_KEY = "nk_terms_creation_dataset_v1";

  var el = {
    termNameInput: document.getElementById("termNameInput"),
    termPdfInput: document.getElementById("termPdfInput"),
    termPdfMeta: document.getElementById("termPdfMeta"),
    termDescriptionInput: document.getElementById("termDescriptionInput"),
    saveTermBtn: document.getElementById("saveTermBtn"),
    clearTermBtn: document.getElementById("clearTermBtn"),
    termsFormHint: document.getElementById("termsFormHint"),
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
    return "TRM-" + String(max + 1).padStart(5, "0");
  }

  function showHint(message, type) {
    if (!el.termsFormHint) return;
    el.termsFormHint.textContent = message || "";
    el.termsFormHint.classList.remove("success", "error");
    if (type) el.termsFormHint.classList.add(type);
  }

  function clearForm() {
    selectedFile = null;
    if (el.termNameInput) el.termNameInput.value = "";
    if (el.termPdfInput) el.termPdfInput.value = "";
    if (el.termDescriptionInput) el.termDescriptionInput.value = "";
    if (el.termPdfMeta) el.termPdfMeta.textContent = "No file selected.";
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

  function validateForm(name, description, file) {
    if (!name) return "Term Name is required.";
    if (!file) return "PDF file is required.";
    if (!description) return "Description is required.";
    return "";
  }

  async function saveForm() {
    try {
      var termName = (el.termNameInput && el.termNameInput.value || "").trim();
      var description = (el.termDescriptionInput && el.termDescriptionInput.value || "").trim();
      var error = validateForm(termName, description, selectedFile);
      if (error) {
        showHint(error, "error");
        return;
      }

      showHint("Uploading PDF and saving term...", "");
      var dataUrl = await readFileAsDataUrl(selectedFile);
      var records = loadRecords();
      var stamp = nowIso();

      records.unshift({
        id: nextId(records),
        termName: termName,
        pdfName: selectedFile.name,
        pdfDataUrl: dataUrl,
        description: description,
        createdAt: stamp,
        updatedAt: stamp
      });

      saveRecords(records);
      showHint("Term saved. Redirecting to Terms table...", "success");
      window.setTimeout(function () {
        window.location.href = "terms-library.html";
      }, 500);
    } catch (err) {
      showHint("Failed to save term file.", "error");
    }
  }

  function bindEvents() {
    if (el.termPdfInput) {
      el.termPdfInput.addEventListener("change", function () {
        var file = el.termPdfInput.files && el.termPdfInput.files[0];
        if (!file) {
          selectedFile = null;
          if (el.termPdfMeta) el.termPdfMeta.textContent = "No file selected.";
          return;
        }
        selectedFile = file;
        if (el.termPdfMeta) {
          var sizeKb = Math.max(1, Math.round(file.size / 1024));
          el.termPdfMeta.textContent = "Selected: " + file.name + " (" + sizeKb + " KB)";
        }
      });
    }

    if (el.saveTermBtn) el.saveTermBtn.addEventListener("click", saveForm);

    if (el.clearTermBtn) {
      el.clearTermBtn.addEventListener("click", function () {
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
