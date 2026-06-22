(function () {
  var tbody = document.getElementById("drTbody");
  if (!tbody) return;

  var tabButtons = Array.prototype.slice.call(document.querySelectorAll(".ratings-tab-btn"));
  var searchInput = document.getElementById("drSearchInput");
  var btnSearch = document.getElementById("btnDrSearch");
  var btnReset = document.getElementById("btnDrReset");

  var drfSourceType = document.getElementById("drfSourceType");
  var drfProvider = document.getElementById("drfProvider");
  var drfRecordType = document.getElementById("drfRecordType");
  var drfStars = document.getElementById("drfStars");
  var drfDateFrom = document.getElementById("drfDateFrom");
  var drfDateTo = document.getElementById("drfDateTo");
  var drfOrderNo = document.getElementById("drfOrderNo");
  var btnApplyFilter = document.getElementById("btnDrApplyFilter");
  var btnFilterReset = document.getElementById("btnDrFilterReset");

  var rowsSelect = document.getElementById("drRowsPerPage");
  var indicator = document.getElementById("drPageIndicator");
  var currentBadge = document.getElementById("drCurrentBadge");
  var btnFirst = document.getElementById("drFirst");
  var btnPrev = document.getElementById("drPrev");
  var btnNext = document.getElementById("drNext");
  var btnLast = document.getElementById("drLast");

  var sumTotal = document.getElementById("sumTotal");
  var sumAvg = document.getElementById("sumAvg");
  var sumFacility = document.getElementById("sumFacility");
  var sumPharmacy = document.getElementById("sumPharmacy");
  var sumIndividuals = document.getElementById("sumIndividuals");

  var tabCountAll = document.getElementById("tabCountAll");
  var tabCountFacility = document.getElementById("tabCountFacility");
  var tabCountPharmacy = document.getElementById("tabCountPharmacy");
  var tabCountIndividuals = document.getElementById("tabCountIndividuals");

  var preview = {
    title: document.getElementById("drPreviewTitle"),
    ratingId: document.getElementById("drPreviewRatingId"),
    orderNo: document.getElementById("drPreviewOrderNo"),
    patient: document.getElementById("drPreviewPatient"),
    source: document.getElementById("drPreviewSource"),
    recordType: document.getElementById("drPreviewRecordType"),
    rater: document.getElementById("drPreviewRater"),
    providerCode: document.getElementById("drPreviewProviderCode"),
    status: document.getElementById("drPreviewStatus"),
    createdAt: document.getElementById("drPreviewCreatedAt"),
    stars: document.getElementById("drPreviewStars"),
    comment: document.getElementById("drPreviewComment")
  };

  var RAW_ROWS = [
    {
      ratingId: "rt-0001",
      patientCode: "PT-00001",
      patientName: "Sara Ibrahim",
      orderNo: "12-03-000011",
      sourceType: "facility",
      raterCode: "FC-00001",
      raterName: "BMC Hospital",
      recordType: "order",
      recordId: "ord-1201",
      stars: 4,
      comment: "Patient respected timing and followed preparation instructions before service.",
      createdAt: "2026-02-12T10:30:00Z",
      status: "active",
      incidentType: null
    },
    {
      ratingId: "rt-0002",
      patientCode: "PT-00001",
      patientName: "Sara Ibrahim",
      orderNo: "12-03-000011",
      sourceType: "individual",
      raterCode: "DR-00011",
      raterName: "Dr. Ahmed Ali",
      recordType: "visit",
      recordId: "rec-301",
      stars: 5,
      comment: "Excellent cooperation during the visit and very clear communication.",
      createdAt: "2026-02-12T11:20:00Z",
      status: "active",
      incidentType: null
    },
    {
      ratingId: "rt-0003",
      patientCode: "PT-00002",
      patientName: "Mohamed Said",
      orderNo: "31-03-000021",
      sourceType: "pharmacy",
      raterCode: "PH-00004",
      raterName: "Al Dawaa Pharmacy",
      recordType: "dispense",
      recordId: "dis-401",
      stars: 2,
      comment: "Patient delayed prescription pickup more than once.",
      createdAt: "2026-02-11T14:10:00Z",
      status: "active",
      incidentType: null
    },
    {
      ratingId: "rt-0004",
      patientCode: "PT-00002",
      patientName: "Mohamed Said",
      orderNo: "31-03-000022",
      sourceType: "facility",
      raterCode: "FC-00003",
      raterName: "Al Noor Hospital",
      recordType: "order",
      recordId: "ord-1202",
      stars: 3,
      comment: "Average cooperation with acceptable attendance across scheduled follow-ups.",
      createdAt: "2026-02-10T09:00:00Z",
      status: "active",
      incidentType: null
    },
    {
      ratingId: "rt-0005",
      patientCode: "PT-00002",
      patientName: "Mohamed Said",
      orderNo: "31-03-000022",
      sourceType: "individual",
      raterCode: "NR-00008",
      raterName: "Nurse Hana Salah",
      recordType: "session",
      recordId: "ses-550",
      stars: 4,
      comment: "Patient followed the treatment plan during the nursing session.",
      createdAt: "2026-02-10T09:30:00Z",
      status: "active",
      incidentType: null
    },
    {
      ratingId: "rt-0006",
      patientCode: "PT-00002",
      patientName: "Mohamed Said",
      orderNo: "31-03-000022",
      sourceType: "pharmacy",
      raterCode: "PH-00004",
      raterName: "Al Dawaa Pharmacy",
      recordType: "dispense",
      recordId: "dis-402",
      stars: 5,
      comment: "Patient shared complete insurance data and picked medications on time.",
      createdAt: "2026-02-10T10:00:00Z",
      status: "active",
      incidentType: null
    },
    {
      ratingId: "rt-0009",
      patientCode: "PT-00004",
      patientName: "Nora Al Qahtani",
      orderNo: "55-03-000032",
      sourceType: "pharmacy",
      raterCode: "PH-00010",
      raterName: "Al Hayat Pharmacy",
      recordType: "dispense",
      stars: 4,
      recordId: "dis-940",
      comment: "Good pickup behavior, but rating is hidden pending audit review.",
      createdAt: "2026-02-08T10:45:00Z",
      status: "hidden",
      incidentType: null
    },
    {
      ratingId: "rt-0010",
      patientCode: "PT-00004",
      patientName: "Nora Al Qahtani",
      orderNo: "55-03-000032",
      sourceType: "individual",
      raterCode: "NR-00003",
      raterName: "Nurse Abeer Khalid",
      recordType: "session",
      recordId: "ses-901",
      stars: 1,
      comment: "This rating is disputed and waiting for Super Admin moderation.",
      createdAt: "2026-02-08T11:45:00Z",
      status: "disputed",
      incidentType: null
    },
    {
      ratingId: "rt-0011",
      patientCode: "PT-00005",
      patientName: "Hassan Kamal",
      orderNo: "77-03-000041",
      sourceType: "facility",
      raterCode: "FC-00005",
      raterName: "Al Salam Medical City",
      recordType: "order",
      recordId: "ord-1301",
      stars: 5,
      comment: "Very cooperative patient and completed all required forms correctly.",
      createdAt: "2026-02-08T12:30:00Z",
      status: "active",
      incidentType: null
    },
    {
      ratingId: "rt-0012",
      patientCode: "PT-00005",
      patientName: "Hassan Kamal",
      orderNo: "77-03-000041",
      sourceType: "individual",
      raterCode: "DR-00021",
      raterName: "Dr. Samir Mazen",
      recordType: "visit",
      recordId: "rec-888",
      stars: 4,
      comment: "Patient adhered to medication and lab instructions before the consultation.",
      createdAt: "2026-02-08T12:35:00Z",
      status: "active",
      incidentType: null
    },
    {
      ratingId: "rt-0013",
      patientCode: "PT-00005",
      patientName: "Hassan Kamal",
      orderNo: "77-03-000041",
      sourceType: "individual",
      raterCode: "DR-00021",
      raterName: "Dr. Samir Mazen",
      recordType: "visit",
      recordId: "rec-888",
      stars: 5,
      comment: "Duplicate active rating test case.",
      createdAt: "2026-02-06T13:00:00Z",
      status: "active",
      incidentType: null
    },
    {
      ratingId: "rt-0014",
      patientCode: "PT-00006",
      patientName: "Lama Hassan",
      orderNo: "90-03-000071",
      sourceType: "individual",
      raterCode: "DR-00031",
      raterName: "Dr. Khaled Yaser",
      recordType: "visit",
      recordId: "rec-990",
      stars: 4,
      comment: "Visit completed with good patient cooperation.",
      createdAt: "2026-02-07T12:00:00Z",
      status: "active",
      incidentType: null
    },
    {
      ratingId: "rt-0015",
      patientCode: "PT-00006",
      patientName: "Lama Hassan",
      orderNo: "90-03-000071",
      sourceType: "individual",
      raterCode: "DR-00031",
      raterName: "Dr. Khaled Yaser",
      recordType: "session",
      recordId: "ses-990",
      stars: 3,
      comment: "Session completed with moderate adherence to home exercises.",
      createdAt: "2026-02-07T12:00:00Z",
      status: "active",
      incidentType: null
    }
  ];

  var currentPage = 1;
  var currentTab = "all";
  var filtered = [];

  function norm(v) {
    return (v || "").toString().trim().toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function toDate(value) {
    var dt = new Date(value);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  function formatDate(value) {
    var dt = toDate(value);
    if (!dt) return "-";
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(dt);
  }

  function formatTime(value) {
    var dt = toDate(value);
    if (!dt) return "-";
    return new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).format(dt);
  }

  function formatSourceType(value) {
    if (value === "facility") return "Facility";
    if (value === "pharmacy") return "Pharmacy";
    if (value === "individual") return "Individuals";
    return "-";
  }

  function formatRecordType(value) {
    if (!value) return "-";
    if (value === "dispense") return "Dispense";
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function formatStatus(value) {
    if (!value) return "-";
    return value.replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });
  }

  function formatIncidentType(value) {
    if (!value) return "-";
    return value.replace(/_/g, " ").replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });
  }

  function computeLevel(stars) {
    var parsed = parseInt(stars, 10);
    if (!Number.isFinite(parsed)) return null;
    if (parsed >= 4) return "high";
    if (parsed === 3) return "medium";
    return "low";
  }

  function recordPriority(recordType) {
    if (recordType === "visit") return 0;
    if (recordType === "session") return 1;
    if (recordType === "order") return 2;
    if (recordType === "dispense") return 3;
    return 9;
  }

  function sortComparator(a, b) {
    var aDate = toDate(a.createdAt);
    var bDate = toDate(b.createdAt);
    var aTime = aDate ? aDate.getTime() : 0;
    var bTime = bDate ? bDate.getTime() : 0;

    if (bTime !== aTime) return bTime - aTime;
    var typeDiff = recordPriority(a.recordType) - recordPriority(b.recordType);
    if (typeDiff !== 0) return typeDiff;
    return String(a.ratingId).localeCompare(String(b.ratingId));
  }

  function starsHTML(value) {
    var v = Math.max(0, Math.min(5, parseInt(value, 10) || 0));
    var html = '<span class="stars-wrap">';
    for (var i = 1; i <= 5; i += 1) {
      if (i <= v) html += '<i class="fi fi-sr-star" style="color:#F5C542;"></i>';
      else html += '<i class="fi fi-rr-star" style="color:#C9CED6;"></i>';
    }
    html += "</span>";
    return html;
  }

  function rowsPerPageVal() {
    var v = rowsSelect ? rowsSelect.value : "10";
    if (v === "all") return Infinity;
    var n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 10;
  }

  function snippet(text, max) {
    var t = (text || "").toString().trim();
    if (t.length <= max) return t;
    return t.slice(0, max).trim() + "...";
  }

  function isEligibleByGovernance(row) {
    if (row.sourceType === "facility") return row.recordType === "order";
    if (row.sourceType === "pharmacy") return row.recordType === "dispense";
    if (row.sourceType === "individual") return row.recordType === "visit" || row.recordType === "session";
    return false;
  }

  function dedupeKey(row) {
    return [row.patientCode, row.orderNo, row.raterCode, row.recordId].join("|");
  }

  function normalizeRows(rows) {
    return rows.map(function (row) {
      var normalized = {
        ratingId: row.ratingId || "",
        patientCode: row.patientCode || "",
        patientName: row.patientName || "",
        orderNo: row.orderNo || "",
        sourceType: norm(row.sourceType),
        raterCode: row.raterCode || "",
        raterName: row.raterName || "",
        recordType: norm(row.recordType),
        recordId: row.recordId || "",
        stars: typeof row.stars === "number" ? row.stars : null,
        level: computeLevel(row.stars),
        comment: row.comment || "",
        createdAt: row.createdAt || "",
        status: norm(row.status || "active"),
        incidentType: row.incidentType ? norm(row.incidentType) : null
      };
      if (normalized.incidentType) {
        normalized.stars = null;
        normalized.level = null;
      }
      return normalized;
    });
  }

  function applyGovernance(rows) {
    var prepared = normalizeRows(rows).sort(sortComparator);
    var activeIndex = {};

    prepared.forEach(function (row) {
      if (!isEligibleByGovernance(row)) {
        row.status = "disputed";
        row.comment += " [Governance mismatch: source cannot rate this record type.]";
      }

      if (row.status === "active") {
        var key = dedupeKey(row);
        if (activeIndex[key]) {
          row.status = "disputed";
          row.comment += " [Duplicate active rating blocked by governance key.]";
        } else {
          activeIndex[key] = true;
        }
      }

      row.level = computeLevel(row.stars);
    });

    return prepared;
  }

  var governedRows = applyGovernance(RAW_ROWS);

  function sourceChipHTML(value) {
    return '<span class="source-chip source-' + escapeHtml(value) + '">' + escapeHtml(formatSourceType(value)) + "</span>";
  }

  function recordChipHTML(value) {
    return '<span class="record-chip record-' + escapeHtml(value) + '">' + escapeHtml(formatRecordType(value)) + "</span>";
  }

  function starsCellHTML(row) {
    if (typeof row.stars === "number") return starsHTML(row.stars) + '<span class="ms-2">' + row.stars + "/5</span>";
    return "-";
  }

  function statusNoteHTML(status) {
    if (!status || status === "active") return "";
    var cls = status === "hidden" ? "status-hidden" : "status-disputed";
    return '<div class="status-note ' + cls + '">' + escapeHtml(formatStatus(status)) + "</div>";
  }

  function updateTabCounts() {
    var activeRows = governedRows.filter(function (row) {
      return row.status === "active";
    });
    if (tabCountAll) tabCountAll.textContent = activeRows.length;
    if (tabCountFacility) tabCountFacility.textContent = activeRows.filter(function (row) { return row.sourceType === "facility"; }).length;
    if (tabCountPharmacy) tabCountPharmacy.textContent = activeRows.filter(function (row) { return row.sourceType === "pharmacy"; }).length;
    if (tabCountIndividuals) tabCountIndividuals.textContent = activeRows.filter(function (row) { return row.sourceType === "individual"; }).length;
  }

  function updateSummary() {
    var kpiRows = filtered.filter(function (row) {
      return row.status === "active" && typeof row.stars === "number";
    });

    var total = kpiRows.length;
    var avg = total
      ? (kpiRows.reduce(function (acc, row) { return acc + row.stars; }, 0) / total).toFixed(1)
      : "0.0";

    if (sumTotal) sumTotal.textContent = total;
    if (sumAvg) sumAvg.textContent = avg;
    if (sumFacility) sumFacility.textContent = kpiRows.filter(function (row) { return row.sourceType === "facility"; }).length;
    if (sumPharmacy) sumPharmacy.textContent = kpiRows.filter(function (row) { return row.sourceType === "pharmacy"; }).length;
    if (sumIndividuals) sumIndividuals.textContent = kpiRows.filter(function (row) { return row.sourceType === "individual"; }).length;
  }

  function updatePager(totalPages) {
    var safeTotal = totalPages < 1 ? 1 : totalPages;
    var safeCurrent = Math.min(Math.max(currentPage, 1), safeTotal);
    if (indicator) indicator.textContent = "Page " + safeCurrent + " of " + safeTotal;
    if (currentBadge) currentBadge.textContent = safeCurrent;
    if (btnFirst) btnFirst.disabled = safeCurrent <= 1;
    if (btnPrev) btnPrev.disabled = safeCurrent <= 1;
    if (btnNext) btnNext.disabled = safeCurrent >= safeTotal;
    if (btnLast) btnLast.disabled = safeCurrent >= safeTotal;
  }

  function applyTabState() {
    tabButtons.forEach(function (button) {
      var tab = button.getAttribute("data-tab") || "all";
      var active = tab === currentTab;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  function getSearchIndex(row) {
    return norm([
      row.ratingId, row.orderNo, row.patientName, row.patientCode, row.raterName, row.raterCode,
      row.sourceType, row.recordType, row.comment
    ].join(" "));
  }

  function render() {
    tbody.innerHTML = "";

    var perPage = rowsPerPageVal();
    var total = filtered.length;
    var totalPages = perPage === Infinity ? 1 : Math.ceil(total / perPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    var start = perPage === Infinity ? 0 : (currentPage - 1) * perPage;
    var end = perPage === Infinity ? total : start + perPage;
    var visible = filtered.slice(start, end);

    if (!visible.length) {
      var emptyTr = document.createElement("tr");
      emptyTr.innerHTML = '<td colspan="9" class="empty-row">No ratings found for current filters.</td>';
      tbody.appendChild(emptyTr);
      updatePager(totalPages);
      updateSummary();
      return;
    }

    visible.forEach(function (row) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td><span class="staff-code">' + escapeHtml(row.orderNo) + "</span></td>" +
        "<td>" + recordChipHTML(row.recordType) + "</td>" +
        "<td><div class=\"d-flex flex-column gap-1\"><span class=\"semiBold\">" + escapeHtml(row.raterName) + "</span>" + sourceChipHTML(row.sourceType) + "</div></td>" +
        '<td><span class="staff-code">' + escapeHtml(row.raterCode) + "</span></td>" +
        "<td><div class=\"d-flex flex-column gap-1\"><span class=\"semiBold\">" + escapeHtml(row.patientName) + "</span><span class=\"fsize-12 text-grey\">" + escapeHtml(row.patientCode) + "</span></div></td>" +
        '<td class="text-center">' + starsCellHTML(row) + statusNoteHTML(row.status) + "</td>" +
        '<td><span class="fsize-12 text-grey comment-snippet">' + escapeHtml(snippet(row.comment, 82)) + "</span></td>" +
        '<td><div class="created-at"><span class="date">' + escapeHtml(formatDate(row.createdAt)) + '</span><span class="time">' + escapeHtml(formatTime(row.createdAt)) + "</span></div></td>" +
        '<td class="text-center"><button type="button" class="btn btn-primary-revers btn-32 js-preview" ' +
        'data-rating-id="' + escapeHtml(row.ratingId) + '" ' +
        'data-order="' + escapeHtml(row.orderNo) + '" ' +
        'data-patient="' + escapeHtml(row.patientName + " (" + row.patientCode + ")") + '" ' +
        'data-source="' + escapeHtml(formatSourceType(row.sourceType)) + '" ' +
        'data-record-type="' + escapeHtml(formatRecordType(row.recordType)) + '" ' +
        'data-rater="' + escapeHtml(row.raterName) + '" ' +
        'data-provider-code="' + escapeHtml(row.raterCode) + '" ' +
        'data-status="' + escapeHtml(formatStatus(row.status)) + '" ' +
        'data-created-at="' + escapeHtml(formatDate(row.createdAt) + " - " + formatTime(row.createdAt)) + '" ' +
        'data-stars="' + escapeHtml(typeof row.stars === "number" ? String(row.stars) : "") + '" ' +
        'data-comment="' + escapeHtml(row.comment) + '" data-bs-toggle="modal" data-bs-target="#dr-preview-modal" title="Preview">' +
        '<i class="fi fi-rr-eye" style="color: var(--nk-green, #0f8c8c);"></i></button></td>';
      tbody.appendChild(tr);
    });

    updatePager(totalPages);
    updateSummary();
  }

  function applySearchAndFilter(resetPage) {
    var q = norm(searchInput ? searchInput.value : "");
    var fSourceType = norm(drfSourceType ? drfSourceType.value : "");
    var fProvider = norm(drfProvider ? drfProvider.value : "");
    var fRecordType = norm(drfRecordType ? drfRecordType.value : "");
    var fStars = norm(drfStars ? drfStars.value : "");
    var fDateFrom = drfDateFrom && drfDateFrom.value ? new Date(drfDateFrom.value + "T00:00:00") : null;
    var fDateTo = drfDateTo && drfDateTo.value ? new Date(drfDateTo.value + "T23:59:59") : null;
    var fOrderNo = norm(drfOrderNo ? drfOrderNo.value : "");

    filtered = governedRows.filter(function (row) {
      if (currentTab !== "all" && row.sourceType !== currentTab) return false;
      if (fSourceType && row.sourceType !== fSourceType) return false;
      if (fProvider && !norm(row.raterName + " " + row.raterCode).includes(fProvider)) return false;
      if (fRecordType && row.recordType !== fRecordType) return false;
      if (fStars && parseInt(fStars, 10) !== row.stars) return false;
      if (fDateFrom || fDateTo) {
        var rowDate = toDate(row.createdAt);
        if (!rowDate) return false;
        if (fDateFrom && rowDate < fDateFrom) return false;
        if (fDateTo && rowDate > fDateTo) return false;
      }
      if (fOrderNo && !norm(row.orderNo).includes(fOrderNo)) return false;
      if (q && !getSearchIndex(row).includes(q)) return false;
      return true;
    }).sort(sortComparator);

    if (resetPage) currentPage = 1;
    render();
  }

  function resetAllFilters() {
    if (searchInput) searchInput.value = "";
    if (drfSourceType) drfSourceType.value = "";
    if (drfProvider) drfProvider.value = "";
    if (drfRecordType) drfRecordType.value = "";
    if (drfStars) drfStars.value = "";
    if (drfDateFrom) drfDateFrom.value = "";
    if (drfDateTo) drfDateTo.value = "";
    if (drfOrderNo) drfOrderNo.value = "";
    currentTab = "all";
    applyTabState();
    applySearchAndFilter(true);
  }

  tabButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      currentTab = button.getAttribute("data-tab") || "all";
      applyTabState();
      applySearchAndFilter(true);
    });
  });

  if (btnSearch) btnSearch.addEventListener("click", function () { applySearchAndFilter(true); });
  if (searchInput) searchInput.addEventListener("keydown", function (e) { if (e.key === "Enter") applySearchAndFilter(true); });
  if (btnReset) btnReset.addEventListener("click", resetAllFilters);
  if (btnApplyFilter) btnApplyFilter.addEventListener("click", function () { applySearchAndFilter(true); });
  if (btnFilterReset) btnFilterReset.addEventListener("click", resetAllFilters);
  if (rowsSelect) rowsSelect.addEventListener("change", function () { currentPage = 1; render(); });
  if (btnFirst) btnFirst.addEventListener("click", function () { currentPage = 1; render(); });
  if (btnPrev) btnPrev.addEventListener("click", function () { currentPage = Math.max(1, currentPage - 1); render(); });
  if (btnNext) btnNext.addEventListener("click", function () { currentPage += 1; render(); });
  if (btnLast) btnLast.addEventListener("click", function () {
    var perPage = rowsPerPageVal();
    var totalPages = perPage === Infinity ? 1 : Math.ceil(filtered.length / perPage) || 1;
    currentPage = totalPages;
    render();
  });

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".js-preview");
    if (!btn) return;

    if (preview.title) preview.title.textContent = btn.getAttribute("data-patient") || "-";
    if (preview.ratingId) preview.ratingId.textContent = btn.getAttribute("data-rating-id") || "-";
    if (preview.orderNo) preview.orderNo.textContent = btn.getAttribute("data-order") || "-";
    if (preview.patient) preview.patient.textContent = btn.getAttribute("data-patient") || "-";
    if (preview.source) preview.source.textContent = btn.getAttribute("data-source") || "-";
    if (preview.recordType) preview.recordType.textContent = btn.getAttribute("data-record-type") || "-";
    if (preview.rater) preview.rater.textContent = btn.getAttribute("data-rater") || "-";
    if (preview.providerCode) preview.providerCode.textContent = btn.getAttribute("data-provider-code") || "-";
    if (preview.status) preview.status.textContent = btn.getAttribute("data-status") || "-";
    if (preview.createdAt) preview.createdAt.textContent = btn.getAttribute("data-created-at") || "-";
    if (preview.comment) preview.comment.textContent = btn.getAttribute("data-comment") || "-";

    if (preview.stars) {
      var starsValue = parseInt(btn.getAttribute("data-stars") || "", 10);
      if (Number.isFinite(starsValue)) {
        preview.stars.innerHTML = starsHTML(starsValue) + '<span class="ms-2">' + starsValue + "/5</span>";
      } else {
        preview.stars.textContent = "Incident";
      }
    }
  });

  updateTabCounts();
  applyTabState();
  applySearchAndFilter(true);
})();
