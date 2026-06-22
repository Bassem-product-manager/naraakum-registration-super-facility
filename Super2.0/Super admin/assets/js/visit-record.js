(function () {
  var dataApi = window.NKPatientsData;
  if (!dataApi) return;

  var params = new URLSearchParams(window.location.search || "");
  var patientCode = params.get("patient") || "";
  var recordId = params.get("record") || "";

  var patient = dataApi.getPatientByCode(patientCode);
  if (!patient) return;

  var visits = dataApi.getPatientVisits(patientCode);
  var visit = visits.find(function (item) {
    return item.recordId === recordId;
  }) || visits[0] || null;

  var providerEl = document.getElementById("vrProvider");
  var hospitalEl = document.getElementById("vrHospital");
  var visitDateEl = document.getElementById("vrVisitDate");
  var headerDateEl = document.getElementById("vrHeaderDate");
  var contextEl = document.getElementById("vrPatientContext");
  var backProfileEl = document.getElementById("vrBackToProfile");
  var breadcrumbProfileEl = document.getElementById("vrBreadcrumbProfile");

  var medsBody = document.getElementById("vrMedsBody");
  var servicesBody = document.getElementById("vrServicesBody");
  var treatmentDescription = document.getElementById("vrTreatmentDescription");

  function escapeHtml(value) {
    return (value || "")
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(value) {
    if (!value) return "-";
    var date = new Date(value);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-GB");
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

    return datePart + " • " + timePart;
  }

  function findOrderById(orderId) {
    return dataApi.orders.find(function (order) {
      return order.orderId === orderId;
    }) || null;
  }

  function showTypeRedirect(recordType, recordId) {
    if (!recordType || recordType === "visit") return;

    var route = typeof dataApi.getRecordRoute === "function" ? dataApi.getRecordRoute(recordType) : "Session-record.html";
    var host = document.querySelector(".vr-wrap");
    if (!host || document.getElementById("vrTypeRedirect")) return;

    var note = document.createElement("div");
    note.id = "vrTypeRedirect";
    note.className = "surface-light-50 p-12 radius-8 fsize-13";
    note.innerHTML =
      'This selected record is a <b>Session Record</b>. ' +
      '<a href="' +
      route +
      "?patient=" +
      encodeURIComponent(patientCode) +
      "&record=" +
      encodeURIComponent(recordId || "") +
      '">Open the session record page</a>.';

    var topbar = document.querySelector(".vr-topbar");
    if (topbar) {
      topbar.insertAdjacentElement("afterend", note);
    } else {
      host.prepend(note);
    }
  }

  var profileHref = "patient-profile.html?patient=" + encodeURIComponent(patientCode);
  if (backProfileEl) backProfileEl.href = profileHref;
  if (breadcrumbProfileEl) breadcrumbProfileEl.href = profileHref;

  if (contextEl) {
    contextEl.textContent = "Patient: " + patient.name + " (" + patient.patientCode + ")";
  }

  if (visit) {
    showTypeRedirect(visit.recordType, visit.recordId);

    if (providerEl) providerEl.textContent = visit.providerName || "-";
    if (hospitalEl) hospitalEl.textContent = visit.hospitalName || "-";
    if (visitDateEl) visitDateEl.textContent = formatDate(visit.visitDate);
    if (headerDateEl) {
      var label = visit.recordType === "session" ? "Session Date" : "Visit Date";
      headerDateEl.innerHTML = label + ': <b class="surface-secondary-400">' + formatDate(visit.visitDate) + "</b>";
    }

    var linkedOrder = findOrderById(visit.orderId);
    if (treatmentDescription) {
      var extra = linkedOrder ? " Linked Order: " + linkedOrder.orderNo + "." : "";
      treatmentDescription.textContent = (visit.notes || "No notes available.") + extra;
    }
  }

  if (medsBody) {
    var meds = dataApi.getPatientMeds(patientCode).filter(function (item) {
      if (visit && visit.recordId) return item.recordId === visit.recordId || item.orderId === visit.orderId;
      return true;
    });

    if (!meds.length) {
      medsBody.innerHTML = '<tr><td colspan="7" class="text-center text-grey">No medications linked to this visit</td></tr>';
    } else {
      medsBody.innerHTML = meds
        .map(function (item) {
          return (
            "<tr>" +
            "<td><b>" + escapeHtml(item.name) + "</b></td>" +
            "<td>" + escapeHtml(item.type || "-") + "</td>" +
            "<td>-</td>" +
            "<td>" + (item.qty || 0) + "</td>" +
            "<td>-</td>" +
            "<td>Qty</td>" +
            "<td>-</td>" +
            "</tr>"
          );
        })
        .join("");
    }
  }

  if (servicesBody) {
    var services = dataApi.getPatientServices(patientCode).filter(function (item) {
      if (visit && visit.recordId) return item.recordId === visit.recordId || item.orderId === visit.orderId;
      return true;
    });

    if (!services.length) {
      servicesBody.innerHTML = '<tr><td colspan="2" class="text-center text-grey">No services linked to this visit</td></tr>';
    } else {
      servicesBody.innerHTML = services
        .map(function (item) {
          return "<tr><td>" + escapeHtml(item.name) + "</td><td>" + (item.qty || 0) + "</td></tr>";
        })
        .join("");
    }
  }

  var patientLine = document.createElement("div");
  patientLine.className = "fsize-12 text-grey";
  patientLine.textContent = "Patient Context: " + patient.name + " • " + patient.patientCode + " • Last update " + formatDateTime(patient.lastActivityAt);

  var topbar = document.querySelector(".vr-topbar");
  if (topbar && !document.getElementById("vrContextLine")) {
    patientLine.id = "vrContextLine";
    topbar.insertAdjacentElement("afterend", patientLine);
  }
})();
