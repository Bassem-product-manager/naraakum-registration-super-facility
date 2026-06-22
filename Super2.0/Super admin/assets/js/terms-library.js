(function () {
  "use strict";

  var STORE_KEY = "nk_terms_creation_dataset_v1";

  var el = {
    termsSearchInput: document.getElementById("termsSearchInput"),
    termsList: document.getElementById("termsList"),
    detailTermName: document.getElementById("detailTermName"),
    detailTermId: document.getElementById("detailTermId"),
    detailTermUpdated: document.getElementById("detailTermUpdated"),
    detailTermDescription: document.getElementById("detailTermDescription"),
    detailTermPdfName: document.getElementById("detailTermPdfName"),
    btnViewTermPdf: document.getElementById("btnViewTermPdf"),
    btnDownloadTermPdf: document.getElementById("btnDownloadTermPdf"),
    ksaTime: document.getElementById("ksaTime")
  };

  var selectedId = "";

  function nowIso() {
    return new Date().toISOString();
  }

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

  function seedIfEmpty() {
    var records = loadRecords();
    if (records.length) return;
    var stamp = nowIso();
    records = [
      {
        id: "TRM-00001",
        termName: "General Platform Terms",
        pdfName: "general_terms_v1.pdf",
        pdfDataUrl: "",
        description: "General legal terms for all providers and platform users.",
        createdAt: stamp,
        updatedAt: stamp
      },
      {
        id: "TRM-00002",
        termName: "Claims and Billing Terms",
        pdfName: "claims_billing_terms_v1.pdf",
        pdfDataUrl: "",
        description: "Terms related to claims processing, billing, and payment cycle.",
        createdAt: stamp,
        updatedAt: stamp
      }
    ];
    saveRecords(records);
  }

  function formatDateTime(iso) {
    if (!iso) return "-";
    var d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString("en-GB", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function findSelected(records) {
    return records.find(function (row) {
      return row.id === selectedId;
    }) || null;
  }

  function setDetails(record) {
    if (!record) {
      if (el.detailTermName) el.detailTermName.textContent = "-";
      if (el.detailTermId) el.detailTermId.textContent = "-";
      if (el.detailTermUpdated) el.detailTermUpdated.textContent = "-";
      if (el.detailTermDescription) el.detailTermDescription.textContent = "Select a term from left side to view details.";
      if (el.detailTermPdfName) el.detailTermPdfName.textContent = "-";
      if (el.btnViewTermPdf) el.btnViewTermPdf.disabled = true;
      if (el.btnDownloadTermPdf) el.btnDownloadTermPdf.disabled = true;
      return;
    }

    if (el.detailTermName) el.detailTermName.textContent = record.termName || "-";
    if (el.detailTermId) el.detailTermId.textContent = record.id || "-";
    if (el.detailTermUpdated) el.detailTermUpdated.textContent = formatDateTime(record.updatedAt);
    if (el.detailTermDescription) el.detailTermDescription.textContent = record.description || "-";
    if (el.detailTermPdfName) el.detailTermPdfName.textContent = record.pdfName || "-";
    if (el.btnViewTermPdf) el.btnViewTermPdf.disabled = !record.pdfDataUrl;
    if (el.btnDownloadTermPdf) el.btnDownloadTermPdf.disabled = !record.pdfDataUrl;
  }

  function filteredRecords(records) {
    var q = (el.termsSearchInput && el.termsSearchInput.value || "").trim().toLowerCase();
    if (!q) return records.slice();
    return records.filter(function (row) {
      var name = String(row.termName || "").toLowerCase();
      var pdf = String(row.pdfName || "").toLowerCase();
      var desc = String(row.description || "").toLowerCase();
      return name.indexOf(q) > -1 || pdf.indexOf(q) > -1 || desc.indexOf(q) > -1;
    });
  }

  function renderList() {
    var records = filteredRecords(loadRecords());
    if (!el.termsList) return;

    if (!records.length) {
      el.termsList.innerHTML = '<div class="empty-list">No terms found.</div>';
      setDetails(null);
      return;
    }

    if (!selectedId || !records.some(function (row) { return row.id === selectedId; })) {
      selectedId = records[0].id;
    }

    el.termsList.innerHTML = records
      .map(function (row) {
        var isActive = row.id === selectedId;
        return (
          '<button type="button" class="term-item' + (isActive ? " active" : "") + '" data-term-id="' + escapeHtml(row.id) + '">' +
          '<p class="t-name">' + escapeHtml(row.termName || "-") + "</p>" +
          '<p class="t-meta">' + escapeHtml(row.pdfName || "-") + "</p>" +
          "</button>"
        );
      })
      .join("");

    setDetails(findSelected(loadRecords()));
  }

  function viewPdf() {
    var row = findSelected(loadRecords());
    if (!row || !row.pdfDataUrl) return;
    window.open(row.pdfDataUrl, "_blank");
  }

  function downloadPdf() {
    var row = findSelected(loadRecords());
    if (!row || !row.pdfDataUrl) return;
    var a = document.createElement("a");
    a.href = row.pdfDataUrl;
    a.download = row.pdfName || "term.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function bindEvents() {
    if (el.termsSearchInput) {
      el.termsSearchInput.addEventListener("input", renderList);
    }
    if (el.termsList) {
      el.termsList.addEventListener("click", function (event) {
        var item = event.target.closest("[data-term-id]");
        if (!item) return;
        selectedId = item.getAttribute("data-term-id") || "";
        renderList();
      });
    }
    if (el.btnViewTermPdf) el.btnViewTermPdf.addEventListener("click", viewPdf);
    if (el.btnDownloadTermPdf) el.btnDownloadTermPdf.addEventListener("click", downloadPdf);
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

  seedIfEmpty();
  bindEvents();
  initClock();
  renderList();
})();
