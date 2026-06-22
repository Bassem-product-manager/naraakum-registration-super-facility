(function () {
  "use strict";

  var STORE_KEY = "nk_naraakum_contracts_dataset_v1";

  var el = {
    contractSearchInput: document.getElementById("contractSearchInput"),
    exportContractsBtn: document.getElementById("exportContractsBtn"),
    contractsTableBody: document.getElementById("contractsTableBody"),
    contractsEmptyState: document.getElementById("contractsEmptyState"),
    viewContractName: document.getElementById("viewContractName"),
    viewPdfName: document.getElementById("viewPdfName"),
    viewDescription: document.getElementById("viewDescription"),
    viewUpdatedAt: document.getElementById("viewUpdatedAt"),
    contractViewModal: document.getElementById("contractViewModal"),
    ksaTime: document.getElementById("ksaTime")
  };

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
    saveRecords([
      {
        id: "CNT-00001",
        contractName: "Naraakum Facility Master Contract",
        pdfName: "facility_master_contract_v1.pdf",
        pdfDataUrl: "",
        description: "Baseline contract terms between Naraakum and facility providers.",
        createdAt: stamp,
        updatedAt: stamp
      },
      {
        id: "CNT-00002",
        contractName: "Naraakum Service Level Contract",
        pdfName: "service_level_contract_v1.pdf",
        pdfDataUrl: "",
        description: "Service-level obligations, support flow, and compliance statements.",
        createdAt: stamp,
        updatedAt: stamp
      }
    ]);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
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

  function csvEscape(value) {
    var s = String(value == null ? "" : value).replace(/\r?\n/g, " ").trim();
    return /[",]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function getSearchQuery() {
    return (el.contractSearchInput && el.contractSearchInput.value || "").trim().toLowerCase();
  }

  function filterRecords(records) {
    var q = getSearchQuery();
    if (!q) return records.slice();
    return records.filter(function (row) {
      var contractName = String(row.contractName || "").toLowerCase();
      var pdfName = String(row.pdfName || "").toLowerCase();
      var description = String(row.description || "").toLowerCase();
      return contractName.indexOf(q) > -1 || pdfName.indexOf(q) > -1 || description.indexOf(q) > -1;
    });
  }

  function renderTable() {
    if (!el.contractsTableBody) return;
    var rows = filterRecords(loadRecords());

    if (!rows.length) {
      el.contractsTableBody.innerHTML = "";
      if (el.contractsEmptyState) el.contractsEmptyState.classList.remove("d-none");
      return;
    }
    if (el.contractsEmptyState) el.contractsEmptyState.classList.add("d-none");

    el.contractsTableBody.innerHTML = rows
      .map(function (row) {
        return (
          "<tr>" +
          "<td><span class=\"cid-chip\">" + escapeHtml(row.id || "-") + "</span></td>" +
          "<td>" + escapeHtml(row.contractName || "-") + "</td>" +
          "<td>" + escapeHtml(row.description || "-") + "</td>" +
          "<td>" + escapeHtml(row.pdfName || "-") + (row.pdfDataUrl ? " (PDF)" : "") + "</td>" +
          "<td>" + escapeHtml(formatDateTime(row.updatedAt)) + "</td>" +
          "<td>" +
          '<div class="actions-cell">' +
          '<button type="button" class="btn-action btn-view" data-view-id="' + escapeHtml(row.id || "") + '">' +
          '<i class="fi fi-rr-eye"></i><span>View</span>' +
          "</button>" +
          '<button type="button" class="btn-action btn-download" data-download-id="' + escapeHtml(row.id || "") + '">' +
          '<i class="fi fi-rr-download"></i><span>Download Contract</span>' +
          "</button>" +
          "</div>" +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function openViewModal(record) {
    if (!record) return;
    if (el.viewContractName) el.viewContractName.textContent = record.contractName || "-";
    if (el.viewPdfName) el.viewPdfName.textContent = record.pdfName || "-";
    if (el.viewDescription) el.viewDescription.textContent = record.description || "-";
    if (el.viewUpdatedAt) el.viewUpdatedAt.textContent = formatDateTime(record.updatedAt);

    if (window.bootstrap && el.contractViewModal) {
      var modal = (bootstrap.Modal.getInstance && bootstrap.Modal.getInstance(el.contractViewModal)) || new bootstrap.Modal(el.contractViewModal);
      modal.show();
    }
  }

  function downloadContractMetadata(record) {
    if (!record) return;

    if (record.pdfDataUrl) {
      var pdfLink = document.createElement("a");
      pdfLink.href = record.pdfDataUrl;
      pdfLink.download = record.pdfName || String(record.id || "contract") + ".pdf";
      document.body.appendChild(pdfLink);
      pdfLink.click();
      pdfLink.remove();
      return;
    }

    var body = [
      "Naraakum Contract Metadata",
      "-------------------------",
      "Contract ID: " + (record.id || "-"),
      "Contract Name: " + (record.contractName || "-"),
      "PDF Name: " + (record.pdfName || "-"),
      "Description: " + (record.description || "-"),
      "Updated At: " + formatDateTime(record.updatedAt)
    ].join("\n");

    var blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = String(record.id || "contract") + "_metadata.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportCsv() {
    var rows = filterRecords(loadRecords());
    var headers = ["Contract ID", "Contract Name", "Description", "PDF Name", "Updated At"];
    var lines = [headers.map(csvEscape).join(",")];
    rows.forEach(function (row) {
      lines.push([
        row.id || "",
        row.contractName || "",
        row.description || "",
        row.pdfName || "",
        formatDateTime(row.updatedAt)
      ].map(csvEscape).join(","));
    });

    var blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "naraakum-contracts.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function onTableClick(event) {
    var records = loadRecords();

    var viewBtn = event.target.closest("[data-view-id]");
    if (viewBtn) {
      var viewId = viewBtn.getAttribute("data-view-id");
      var row = records.find(function (item) {
        return item.id === viewId;
      });
      openViewModal(row);
      return;
    }

    var downloadBtn = event.target.closest("[data-download-id]");
    if (downloadBtn) {
      var downloadId = downloadBtn.getAttribute("data-download-id");
      var rec = records.find(function (item) {
        return item.id === downloadId;
      });
      downloadContractMetadata(rec);
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

  function bindEvents() {
    if (el.contractSearchInput) {
      el.contractSearchInput.addEventListener("input", renderTable);
    }
    if (el.exportContractsBtn) {
      el.exportContractsBtn.addEventListener("click", exportCsv);
    }
    if (el.contractsTableBody) {
      el.contractsTableBody.addEventListener("click", onTableClick);
    }
  }

  initClock();
  seedIfEmpty();
  bindEvents();
  renderTable();
})();
