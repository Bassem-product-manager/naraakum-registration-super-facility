(function () {
  var dataApi = window.NKPatientsData;
  if (!dataApi) return;

  var params = new URLSearchParams(window.location.search || "");
  var patientCode = params.get("patient") || "";
  var patient = dataApi.getPatientByCode(patientCode);
  if (!patient) return;

  var nameEl = document.getElementById("pmhPatientName");
  var codeLineEl = document.getElementById("pmhPatientCodeLine");
  var nationalityEl = document.getElementById("pmhNationality");
  var phoneEl = document.getElementById("pmhPhone");
  var genderEl = document.getElementById("pmhGender");

  var totalOrdersEl = document.getElementById("pmhTotalOrders");
  var pendingOngoingEl = document.getElementById("pmhPendingOngoing");
  var completedCanceledEl = document.getElementById("pmhCompletedCanceled");
  var totalServicesEl = document.getElementById("pmhTotalServices");
  var totalMedsEl = document.getElementById("pmhTotalMeds");
  var totalVisitsEl = document.getElementById("pmhTotalVisits");

  var recordsListEl = document.getElementById("pmhRecordsList");
  var recordsCountEl = document.getElementById("pmhRecordsCount");

  var backProfileLink = document.getElementById("pmhBackToProfile");
  var breadcrumbProfileLink = document.getElementById("pmhBreadcrumbProfile");

  function escapeHtml(value) {
    return (value || "")
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(isoValue) {
    if (!isoValue) return "-";
    var date = new Date(isoValue);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-GB");
  }

  function recordTypeLabel(recordType) {
    return recordType === "session" ? "Session Record" : "Visit Record";
  }

  function recordActionLabel(recordType) {
    return recordType === "session" ? "View Session Record" : "View Visit Record";
  }

  function renderRecords() {
    if (!recordsListEl) return;

    var rows = typeof dataApi.getSortedPatientRecords === "function" ? dataApi.getSortedPatientRecords(patientCode).slice() : dataApi.getPatientVisits(patientCode).slice();

    if (recordsCountEl) {
      recordsCountEl.textContent = rows.length + (rows.length === 1 ? " Record" : " Records");
    }

    if (!rows.length) {
      recordsListEl.innerHTML = '<div class="text-center text-grey p-12">No records available</div>';
      return;
    }

    recordsListEl.innerHTML = rows
      .map(function (row) {
        var route = typeof dataApi.getRecordRoute === "function" ? dataApi.getRecordRoute(row.recordType) : "visit-record.html";
        return (
          '<div class="record-item">' +
          '  <div class="record-item__top">' +
          '    <div class="record-kv">' +
          '      <p class="k">Care Provider</p>' +
          '      <p class="v">' +
          escapeHtml(row.providerName) +
          "</p>" +
          "    </div>" +
          '    <div class="record-kv">' +
          '      <p class="k">Hospital</p>' +
          '      <p class="v">' +
          escapeHtml(row.hospitalName) +
          "</p>" +
          "    </div>" +
          '    <div class="record-kv">' +
          '      <p class="k">Record Date</p>' +
          '      <p class="v">' +
          formatDate(row.visitDate) +
          "</p>" +
          "    </div>" +
          '    <div class="record-kv">' +
          '      <p class="k">Record Type</p>' +
          '      <p class="v">' +
          recordTypeLabel(row.recordType) +
          "</p>" +
          "    </div>" +
          '    <div class="record-item__actions">' +
          '      <a class="nk-pill-btn" href="' +
          escapeHtml(route) +
          "?patient=" +
          encodeURIComponent(patientCode) +
          "&record=" +
          encodeURIComponent(row.recordId) +
          '">' +
          '        <i class="fi fi-rr-eye"></i>' +
          recordActionLabel(row.recordType) +
          "      </a>" +
          "    </div>" +
          "  </div>" +
          "</div>"
        );
      })
      .join("");
  }

  if (nameEl) nameEl.textContent = patient.name;
  if (codeLineEl) codeLineEl.innerHTML = 'Patient Code: <b class="surface-secondary-400">' + escapeHtml(patient.patientCode) + "</b>";
  if (nationalityEl) nationalityEl.textContent = patient.nationality;
  if (phoneEl) phoneEl.textContent = patient.phone;
  if (genderEl) genderEl.textContent = patient.gender;

  var kpis = dataApi.computePatientKpis(patientCode);
  if (totalOrdersEl) totalOrdersEl.textContent = kpis.totalOrders;
  if (pendingOngoingEl) pendingOngoingEl.textContent = kpis.pending + " / " + kpis.ongoing;
  if (completedCanceledEl) completedCanceledEl.textContent = kpis.completed + " / " + kpis.canceled;
  if (totalServicesEl) totalServicesEl.textContent = kpis.totalServices;
  if (totalMedsEl) totalMedsEl.textContent = kpis.totalMeds;
  if (totalVisitsEl) totalVisitsEl.textContent = kpis.totalVisits;

  var profileHref = "patient-profile.html?patient=" + encodeURIComponent(patientCode);
  if (backProfileLink) backProfileLink.href = profileHref;
  if (breadcrumbProfileLink) breadcrumbProfileLink.href = profileHref;

  renderRecords();
})();
