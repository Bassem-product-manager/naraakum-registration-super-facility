(function () {
  var dataApi = window.NKPatientsData;
  if (!dataApi) return;

  var table = document.getElementById("patientsTable");
  if (!table) return;

  var tbody = document.getElementById("patientsTbody") || table.querySelector("tbody");
  if (!tbody) return;

  var searchInput = document.getElementById("patientsSearchInput");
  var btnSearch = document.getElementById("btnPatientsSearch");
  var btnReset = document.getElementById("btnPatientsReset");

  var rowsSelect = document.getElementById("patientsRowsPerPage");
  var indicator = document.getElementById("patientsPageIndicator");
  var currentBadge = document.getElementById("patientsCurrentPageBadge");
  var btnFirst = document.getElementById("patientsFirstPage");
  var btnPrev = document.getElementById("patientsPrevPage");
  var btnNext = document.getElementById("patientsNextPage");
  var btnLast = document.getElementById("patientsLastPage");

  var pfStatus = document.getElementById("pfStatus");
  var pfBranch = document.getElementById("pfBranch");
  var btnApplyFilter = document.getElementById("btnPatientsApplyFilter");
  var btnFilterReset = document.getElementById("btnPatientsFilterReset");

  var currentPage = 1;
  var filteredPatients = dataApi.patients.slice();
  var lastOpen = { patient: null, status: null };

  function norm(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function escapeHtml(value) {
    return (value || "")
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function rowsPerPageVal() {
    var value = rowsSelect ? rowsSelect.value : "10";
    if (value === "all") return Infinity;
    var parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : 10;
  }

  function statusLabel(status) {
    if (status === "completed") return { text: "Completed", cls: "st-accepted" };
    if (status === "ongoing") return { text: "Ongoing", cls: "st-missed" };
    if (status === "canceled") return { text: "Canceled", cls: "st-cancel" };
    return { text: "Pending", cls: "st-missed" };
  }

  function formatDateTime(isoValue) {
    if (!isoValue) return "-";
    var date = new Date(isoValue);
    if (isNaN(date.getTime())) return "-";

    var datePart = date.toLocaleDateString("en-GB");
    var timePart = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    return datePart + " " + timePart;
  }

  function getPatientSearchKey(patient) {
    return [patient.patientCode, patient.name, patient.phone].map(norm).join(" ");
  }

  function buildPatientRow(patient, index) {
    var kpis = dataApi.computePatientKpis(patient.patientCode);
    var latestStatus = dataApi.getLastOrderStatus(patient.patientCode);
    var status = statusLabel(latestStatus);
    var collapseId = "collapseOrders-" + patient.patientCode;

    var rowHtml =
      '<tr class="patient-row" data-code="' +
      escapeHtml(patient.patientCode) +
      '">' +
      "<td>" +
      index +
      "</td>" +
      '<td><span class="staff-code">' +
      escapeHtml(patient.patientCode) +
      "</span></td>" +
      "<td>" +
      '  <div class="staff-cell">' +
      '    <div class="staff-avatar"><img src="../assets/images/avatar.svg" alt="patient" /></div>' +
      '    <div class="staff-info">' +
      '      <p class="name">' +
      escapeHtml(patient.name) +
      "</p>" +
      '      <div class="meta">' +
      escapeHtml(patient.nationality + " • " + patient.phone) +
      "</div>" +
      '      <div class="usage-chips">' +
      '        <span class="usage-chip">Orders: ' +
      kpis.totalOrders +
      "</span>" +
      '        <span class="usage-chip">Services: ' +
      kpis.totalServices +
      "</span>" +
      '        <span class="usage-chip">Meds: ' +
      kpis.totalMeds +
      "</span>" +
      "      </div>" +
      "    </div>" +
      "  </div>" +
      "</td>" +
      "<td><span class=\"status-pill " +
      status.cls +
      '\" data-role="statusLabel">' +
      status.text +
      "</span></td>" +
      '<td class="text-center">' +
      '  <span class="status-pill st-accepted js-open-orders" role="button" tabindex="0" data-patient="' +
      escapeHtml(patient.patientCode) +
      '" data-status="completed" aria-controls="' +
      collapseId +
      '">' +
      kpis.completed +
      "</span>" +
      "</td>" +
      '<td class="text-center">' +
      '  <span class="status-pill st-missed js-open-orders" role="button" tabindex="0" data-patient="' +
      escapeHtml(patient.patientCode) +
      '" data-status="ongoing" aria-controls="' +
      collapseId +
      '">' +
      kpis.ongoing +
      "</span>" +
      "</td>" +
      '<td class="text-center">' +
      '  <span class="status-pill st-cancel js-open-orders" role="button" tabindex="0" data-patient="' +
      escapeHtml(patient.patientCode) +
      '" data-status="canceled" aria-controls="' +
      collapseId +
      '">' +
      kpis.canceled +
      "</span>" +
      "</td>" +
      "<td>" +
      '  <div class="actions-cell">' +
      '    <a class="assign-btn edit-price-btn" href="patient-profile.html?patient=' +
      encodeURIComponent(patient.patientCode) +
      '" title="Details">' +
      '      <i class="fi fi-rr-user"></i>' +
      "      Details" +
      "    </a>" +
      '    <a class="assign-btn mh-btn" href="patient-medical-history.html?patient=' +
      encodeURIComponent(patient.patientCode) +
      '" title="Medical History">' +
      '      <i class="fi fi-rr-notebook"></i>' +
      "      Medical History" +
      "    </a>" +
      "  </div>" +
      "</td>" +
      "</tr>";

    rowHtml +=
      '<tr class="patient-orders-row">' +
      '<td colspan="8" class="p-0">' +
      '  <div class="collapse" id="' +
      collapseId +
      '">' +
      '    <div class="p-12">' +
      '      <div class="d-flex justify-content-between align-items-center mb-2">' +
      "        <div>" +
      '          <b class="fsize-14 semiBold" id="ordersTitle-' +
      escapeHtml(patient.patientCode) +
      '">Orders</b>' +
      '          <div class="fsize-12 text-grey" id="ordersSub-' +
      escapeHtml(patient.patientCode) +
      '">-</div>' +
      "        </div>" +
      "      </div>" +
      '      <div class="table-responsive">' +
      '        <table class="staff-table naraakum-table table-tight">' +
      "          <thead>" +
      "            <tr>" +
      "              <th>Order No</th>" +
      "              <th>Item</th>" +
      "              <th>Item Type</th>" +
      "              <th>Created At</th>" +
      "              <th>Price</th>" +
      "              <th>Usage</th>" +
      "            </tr>" +
      "          </thead>" +
      '          <tbody class="ordersTbody" data-patient="' +
      escapeHtml(patient.patientCode) +
      '"></tbody>' +
      "        </table>" +
      "      </div>" +
      "    </div>" +
      "  </div>" +
      "</td>" +
      "</tr>";

    return rowHtml;
  }

  function updatePager(totalPages) {
    var safeTotal = totalPages < 1 ? 1 : totalPages;
    var safeCurrent = Math.min(Math.max(currentPage, 1), safeTotal);

    if (indicator) indicator.textContent = "Page " + safeCurrent + " of " + safeTotal;
    if (currentBadge) currentBadge.textContent = safeCurrent;

    function toggle(btn, state) {
      if (!btn) return;
      btn.disabled = !!state;
    }

    toggle(btnFirst, safeCurrent <= 1);
    toggle(btnPrev, safeCurrent <= 1);
    toggle(btnNext, safeCurrent >= safeTotal);
    toggle(btnLast, safeCurrent >= safeTotal);
  }

  function render() {
    var perPage = rowsPerPageVal();
    var total = filteredPatients.length;
    var totalPages = perPage === Infinity ? 1 : Math.ceil(total / perPage) || 1;

    if (currentPage > totalPages) currentPage = totalPages;

    var start = perPage === Infinity ? 0 : (currentPage - 1) * perPage;
    var end = perPage === Infinity ? total : start + perPage;

    var pageRows = filteredPatients.slice(start, end);

    if (!pageRows.length) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center text-grey">No data available</td></tr>';
      updatePager(totalPages);
      return;
    }

    var html = "";
    pageRows.forEach(function (patient, idx) {
      html += buildPatientRow(patient, start + idx + 1);
    });

    tbody.innerHTML = html;
    updatePager(totalPages);
  }

  function applySearchAndFilter() {
    var query = norm(searchInput ? searchInput.value : "");
    var statusFilter = norm(pfStatus ? pfStatus.value : "");
    var branchFilter = norm(pfBranch ? pfBranch.value : "");

    filteredPatients = dataApi.patients.filter(function (patient) {
      var matchesSearch = !query || getPatientSearchKey(patient).indexOf(query) !== -1;
      var latestStatus = norm(dataApi.getLastOrderStatus(patient.patientCode));
      var matchesStatus = !statusFilter || latestStatus === statusFilter;
      var matchesBranch = !branchFilter || norm(patient.city) === branchFilter;

      return matchesSearch && matchesStatus && matchesBranch;
    });

    currentPage = 1;
    lastOpen = { patient: null, status: null };
    render();
  }

  function renderOrders(patientCode, status) {
    var targetTbody = tbody.querySelector('.ordersTbody[data-patient="' + patientCode + '"]');
    var title = document.getElementById("ordersTitle-" + patientCode);
    var sub = document.getElementById("ordersSub-" + patientCode);

    if (!targetTbody) return;

    var list = dataApi
      .getPatientOrders(patientCode)
      .filter(function (order) {
        return order.status === status;
      })
      .sort(function (a, b) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

    if (title) title.textContent = "Orders";
    if (sub) sub.textContent = status.toUpperCase() + " • " + list.length;

    if (!list.length) {
      targetTbody.innerHTML = '<tr><td colspan="6" class="text-center text-grey">No data available</td></tr>';
      return;
    }

    targetTbody.innerHTML = list
      .map(function (order) {
        var usage = dataApi.computeOrderUsage(order.orderId);
        var itemType = order.itemType === "product" ? "Product" : "Service";

        return (
          "<tr>" +
          "<td>" +
          escapeHtml(order.orderNo) +
          "</td>" +
          "<td>" +
          escapeHtml(order.title || "-") +
          "</td>" +
          "<td>" +
          itemType +
          "</td>" +
          "<td>" +
          escapeHtml(formatDateTime(order.createdAt)) +
          "</td>" +
          "<td>" +
          escapeHtml(order.price || "-") +
          "</td>" +
          "<td>" +
          "Meds: " +
          usage.medsQty +
          " • Services: " +
          usage.servicesQty +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function openOrders(patientCode, status) {
    var collapseEl = document.getElementById("collapseOrders-" + patientCode);
    if (!collapseEl) return;

    var instance = bootstrap.Collapse.getOrCreateInstance(collapseEl, { toggle: false });
    var isOpen = collapseEl.classList.contains("show");
    var sameClick = lastOpen.patient === patientCode && lastOpen.status === status;

    if (isOpen && sameClick) {
      instance.hide();
      lastOpen = { patient: null, status: null };
      return;
    }

    tbody.querySelectorAll(".patient-orders-row .collapse.show").forEach(function (opened) {
      if (opened.id === "collapseOrders-" + patientCode) return;
      var openedInstance = bootstrap.Collapse.getInstance(opened);
      if (openedInstance) openedInstance.hide();
      opened.classList.remove("show");
    });

    renderOrders(patientCode, status);
    instance.show();

    lastOpen = { patient: patientCode, status: status };
  }

  if (btnSearch) btnSearch.addEventListener("click", applySearchAndFilter);

  if (searchInput) {
    searchInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") applySearchAndFilter();
    });
  }

  if (btnReset) {
    btnReset.addEventListener("click", function () {
      if (searchInput) searchInput.value = "";
      if (pfStatus) pfStatus.value = "";
      if (pfBranch) pfBranch.value = "";
      applySearchAndFilter();
    });
  }

  if (btnApplyFilter) btnApplyFilter.addEventListener("click", applySearchAndFilter);

  if (btnFilterReset) {
    btnFilterReset.addEventListener("click", function () {
      if (pfStatus) pfStatus.value = "";
      if (pfBranch) pfBranch.value = "";
    });
  }

  if (rowsSelect) {
    rowsSelect.addEventListener("change", function () {
      currentPage = 1;
      render();
    });
  }

  if (btnFirst) btnFirst.addEventListener("click", function () { currentPage = 1; render(); });
  if (btnPrev) btnPrev.addEventListener("click", function () { currentPage = Math.max(1, currentPage - 1); render(); });
  if (btnNext) btnNext.addEventListener("click", function () { currentPage += 1; render(); });
  if (btnLast) {
    btnLast.addEventListener("click", function () {
      var perPage = rowsPerPageVal();
      var totalPages = perPage === Infinity ? 1 : Math.ceil(filteredPatients.length / perPage) || 1;
      currentPage = totalPages;
      render();
    });
  }

  tbody.addEventListener("click", function (event) {
    var target = event.target.closest(".js-open-orders");
    if (!target) return;

    event.preventDefault();

    var patientCode = target.getAttribute("data-patient");
    var status = target.getAttribute("data-status");
    if (!patientCode || !status) return;

    openOrders(patientCode, status);
  });

  tbody.addEventListener("keydown", function (event) {
    var target = event.target.closest(".js-open-orders");
    if (!target) return;

    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();

    var patientCode = target.getAttribute("data-patient");
    var status = target.getAttribute("data-status");
    if (!patientCode || !status) return;

    openOrders(patientCode, status);
  });

  applySearchAndFilter();
})();
