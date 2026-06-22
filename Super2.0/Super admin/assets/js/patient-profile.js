(function () {
  var dataApi = window.NKPatientsData;
  if (!dataApi) return;

  var params = new URLSearchParams(window.location.search || "");
  var patientCode = params.get("patient") || "";
  var requestedTab = (params.get("tab") || "orders").toLowerCase();

  var emptyState = document.getElementById("profileEmpty");
  var profileWrap = document.getElementById("profileWrap");

  var patient = dataApi.getPatientByCode(patientCode);
  if (!patient) {
    if (profileWrap) profileWrap.hidden = true;
    if (emptyState) emptyState.hidden = false;
    return;
  }

  var activeTab = ["orders", "visits", "medications", "services"].indexOf(requestedTab) !== -1 ? requestedTab : "orders";
  var activeOrderStatus = "all";

  var tabButtons = Array.prototype.slice.call(document.querySelectorAll("#profileTabs [role='tab']"));
  var tabPanels = Array.prototype.slice.call(document.querySelectorAll(".tab-panel"));
  var statusButtons = Array.prototype.slice.call(document.querySelectorAll("#orderStatusFilters .status-filter"));

  var nameEl = document.getElementById("profileName");
  var codeLineEl = document.getElementById("profileCodeLine");
  var phoneEl = document.getElementById("profilePhone");
  var genderEl = document.getElementById("profileGender");
  var nationalityEl = document.getElementById("profileNationality");
  var cityEl = document.getElementById("profileCity");

  var kpiTotalOrders = document.getElementById("kpiTotalOrders");
  var kpiPending = document.getElementById("kpiPending");
  var kpiOngoing = document.getElementById("kpiOngoing");
  var kpiCompleted = document.getElementById("kpiCompleted");
  var kpiCanceled = document.getElementById("kpiCanceled");
  var kpiVisits = document.getElementById("kpiVisits");
  var kpiServices = document.getElementById("kpiServices");
  var kpiMeds = document.getElementById("kpiMeds");

  var ordersBody = document.getElementById("ordersTabBody");
  var visitsBody = document.getElementById("visitsTabBody");
  var medicationsBody = document.getElementById("medicationsTabBody");
  var servicesBody = document.getElementById("servicesTabBody");

  var medicalHistoryLink = document.getElementById("openMedicalHistory");

  function escapeHtml(value) {
    return (value || "")
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDateTime(value) {
    if (!value) return "-";
    var date = new Date(value);
    if (isNaN(date.getTime())) return "-";

    var datePart = date.toLocaleDateString("en-GB");
    var timePart = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    return datePart + "<br><span class='text-grey'>" + timePart + "</span>";
  }

  function statusText(status) {
    if (status === "pending") return "Pending";
    if (status === "ongoing") return "Ongoing";
    if (status === "completed") return "Completed";
    if (status === "canceled") return "Canceled";
    return "-";
  }

  function updateUrlTab(tab) {
    var next = new URLSearchParams(window.location.search || "");
    next.set("patient", patientCode);
    next.set("tab", tab);
    var nextUrl = window.location.pathname + "?" + next.toString();
    window.history.replaceState({}, "", nextUrl);
  }

  function findOrderById(orderId) {
    return dataApi.orders.find(function (order) {
      return order.orderId === orderId;
    }) || null;
  }

  function recordTypeLabel(recordType) {
    return recordType === "session" ? "Session" : "Visit";
  }

  function recordActionLabel(recordType) {
    return recordType === "session" ? "View Session Record" : "View Visit Record";
  }

  function renderEmptyRow(tbody, colspan) {
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="' + colspan + '" class="text-center text-grey">No data available</td></tr>';
  }

  function renderOrders() {
    if (!ordersBody) return;

    var rows = dataApi
      .getPatientOrders(patientCode)
      .slice()
      .sort(function (a, b) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

    if (activeOrderStatus !== "all") {
      rows = rows.filter(function (row) {
        return row.status === activeOrderStatus;
      });
    }

    if (!rows.length) {
      renderEmptyRow(ordersBody, 6);
      return;
    }

    ordersBody.innerHTML = rows
      .map(function (row) {
        var usage = dataApi.computeOrderUsage(row.orderId);
        var itemType = row.itemType === "product" ? "Product" : "Service";
        return (
          "<tr>" +
          "<td>" + escapeHtml(row.orderNo) + "</td>" +
          "<td>" + statusText(row.status) + "</td>" +
          "<td>" + itemType + "</td>" +
          "<td>" + formatDateTime(row.createdAt) + "</td>" +
          "<td>" + usage.medsQty + "</td>" +
          "<td>" + usage.servicesQty + "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function renderVisits() {
    if (!visitsBody) return;

    var rows = typeof dataApi.getSortedPatientRecords === "function" ? dataApi.getSortedPatientRecords(patientCode).slice() : dataApi.getPatientVisits(patientCode).slice();

    if (!rows.length) {
      renderEmptyRow(visitsBody, 6);
      return;
    }

    visitsBody.innerHTML = rows
      .map(function (row) {
        var route = typeof dataApi.getRecordRoute === "function" ? dataApi.getRecordRoute(row.recordType) : "visit-record.html";
        return (
          "<tr>" +
          "<td>" + escapeHtml(row.recordId) + "</td>" +
          "<td><span class='record-type-pill'>" + recordTypeLabel(row.recordType) + "</span></td>" +
          "<td>" + escapeHtml(row.providerName) + "</td>" +
          "<td>" + escapeHtml(row.hospitalName) + "</td>" +
          "<td>" + formatDateTime(row.visitDate) + "</td>" +
          "<td><a class='pill-btn pill-btn--ghost' href='" +
          escapeHtml(route) +
          "?patient=" +
          encodeURIComponent(patientCode) +
          "&record=" +
          encodeURIComponent(row.recordId) +
          "'>" +
          recordActionLabel(row.recordType) +
          "</a></td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function renderMedications() {
    if (!medicationsBody) return;

    var rows = dataApi
      .getPatientMeds(patientCode)
      .slice()
      .sort(function (a, b) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

    if (!rows.length) {
      renderEmptyRow(medicationsBody, 5);
      return;
    }

    medicationsBody.innerHTML = rows
      .map(function (row) {
        var order = findOrderById(row.orderId);
        var orderCode = order ? (typeof dataApi.formatMedicationOrderCode === "function" ? dataApi.formatMedicationOrderCode(order.orderNo) : order.orderNo) : "-";
        return (
          "<tr>" +
          "<td>" + escapeHtml(row.name) + "</td>" +
          "<td>" + (row.qty || 0) + "</td>" +
          "<td>" + escapeHtml(row.pharmacyName || "-") + "</td>" +
          "<td>" + formatDateTime(row.date) + "</td>" +
          "<td>" + escapeHtml(orderCode) + "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function renderServices() {
    if (!servicesBody) return;

    var rows = dataApi
      .getPatientServices(patientCode)
      .slice()
      .sort(function (a, b) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

    if (!rows.length) {
      renderEmptyRow(servicesBody, 5);
      return;
    }

    servicesBody.innerHTML = rows
      .map(function (row) {
        var order = findOrderById(row.orderId);
        var linkedOrderCode = order
          ? (typeof dataApi.formatMedicationOrderCode === "function" ? dataApi.formatMedicationOrderCode(order.orderNo) : order.orderNo)
          : "00-00-000000";
        return (
          "<tr>" +
          "<td>" + escapeHtml(row.name) + "</td>" +
          "<td>" + (row.qty || 0) + "</td>" +
          "<td>" + escapeHtml(row.type || "-") + "</td>" +
          "<td>" + formatDateTime(row.date) + "</td>" +
          "<td>" + escapeHtml(linkedOrderCode) + "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function setActiveTab(tabName) {
    activeTab = tabName;
    updateUrlTab(tabName);

    tabButtons.forEach(function (btn) {
      var isActive = btn.getAttribute("data-tab") === tabName;
      btn.setAttribute("aria-selected", isActive ? "true" : "false");
      btn.classList.toggle("is-active", isActive);
      btn.tabIndex = isActive ? 0 : -1;
    });

    tabPanels.forEach(function (panel) {
      var panelName = panel.id.replace("panel-", "");
      panel.hidden = panelName !== tabName;
    });
  }

  function bindTabs() {
    tabButtons.forEach(function (btn, index) {
      btn.addEventListener("click", function () {
        setActiveTab(btn.getAttribute("data-tab"));
      });

      btn.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;

        event.preventDefault();
        var direction = event.key === "ArrowRight" ? 1 : -1;
        var nextIndex = (index + direction + tabButtons.length) % tabButtons.length;
        tabButtons[nextIndex].focus();
        setActiveTab(tabButtons[nextIndex].getAttribute("data-tab"));
      });
    });

    statusButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        activeOrderStatus = btn.getAttribute("data-status") || "all";
        statusButtons.forEach(function (other) {
          other.classList.toggle("is-active", other === btn);
        });
        renderOrders();
      });
    });
  }

  function fillProfileHeader() {
    if (nameEl) nameEl.textContent = patient.name;
    if (codeLineEl) codeLineEl.innerHTML = 'Patient Code: <b class="surface-secondary-400">' + escapeHtml(patient.patientCode) + "</b>";
    if (phoneEl) phoneEl.textContent = patient.phone;
    if (genderEl) genderEl.textContent = patient.gender;
    if (nationalityEl) nationalityEl.textContent = patient.nationality;
    if (cityEl) cityEl.textContent = patient.city;

    if (medicalHistoryLink) {
      medicalHistoryLink.href = "patient-medical-history.html?patient=" + encodeURIComponent(patient.patientCode);
    }

    var kpis = dataApi.computePatientKpis(patientCode);
    if (kpiTotalOrders) kpiTotalOrders.textContent = kpis.totalOrders;
    if (kpiPending) kpiPending.textContent = kpis.pending;
    if (kpiOngoing) kpiOngoing.textContent = kpis.ongoing;
    if (kpiCompleted) kpiCompleted.textContent = kpis.completed;
    if (kpiCanceled) kpiCanceled.textContent = kpis.canceled;
    if (kpiVisits) kpiVisits.textContent = kpis.totalVisits;
    if (kpiServices) kpiServices.textContent = kpis.totalServices;
    if (kpiMeds) kpiMeds.textContent = kpis.totalMeds;
  }

  fillProfileHeader();
  bindTabs();
  renderOrders();
  renderVisits();
  renderMedications();
  renderServices();
  setActiveTab(activeTab);
})();
