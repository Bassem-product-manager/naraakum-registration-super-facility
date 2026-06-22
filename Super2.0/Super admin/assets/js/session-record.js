(function () {
  var dataApi = window.NKPatientsData;
  if (!dataApi) return;

  var params = new URLSearchParams(window.location.search || "");
  var patientCode = params.get("patient") || "";
  var recordId = params.get("record") || "";

  var patient = dataApi.getPatientByCode(patientCode);
  if (!patient) return;

  var records = dataApi.getPatientVisits(patientCode).slice();
  var selectedRecord = records.find(function (item) {
    return item.recordId === recordId;
  }) || null;

  var session =
    selectedRecord ||
    records.find(function (item) {
      return item.recordType === "session";
    }) ||
    null;

  var providerEl = document.getElementById("srProvider");
  var hospitalEl = document.getElementById("srHospital");
  var sessionDateEl = document.getElementById("srSessionDate");
  var headerDateEl = document.getElementById("srHeaderDate");
  var contextEl = document.getElementById("srPatientContext");
  var backProfileEl = document.getElementById("srBackToProfile");
  var breadcrumbProfileEl = document.getElementById("srBreadcrumbProfile");
  var medsBody = document.getElementById("srMedsBody");
  var servicesBody = document.getElementById("srServicesBody");
  var treatmentDescription = document.getElementById("srTreatmentDescription");

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

  function titleize(value) {
    if (!value) return "-";
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function findOrderById(orderId) {
    return (
      dataApi.orders.find(function (order) {
        return order.orderId === orderId;
      }) || null
    );
  }

  function showTypeRedirect(recordType, targetRecordId) {
    if (recordType !== "visit") return;

    var host = document.querySelector(".vr-wrap");
    if (!host || document.getElementById("srTypeRedirect")) return;

    var note = document.createElement("div");
    note.id = "srTypeRedirect";
    note.className = "surface-light-50 p-12 radius-8 fsize-13";
    note.innerHTML =
      'This selected record is a <b>Visit Record</b>. ' +
      '<a href="visit-record.html?patient=' +
      encodeURIComponent(patientCode) +
      "&record=" +
      encodeURIComponent(targetRecordId || "") +
      '">Open the visit record page</a>.';

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
  if (contextEl) contextEl.textContent = "Patient: " + patient.name + " (" + patient.patientCode + ")";

  if (!session) {
    if (treatmentDescription) {
      treatmentDescription.textContent = "No session record available for this patient.";
    }
    if (medsBody) {
      medsBody.innerHTML = '<tr><td colspan="7" class="text-center text-grey">No medications linked to this session</td></tr>';
    }
    if (servicesBody) {
      servicesBody.innerHTML = '<tr><td colspan="2" class="text-center text-grey">No services linked to this session</td></tr>';
    }
    return;
  }

  showTypeRedirect(session.recordType, session.recordId);

  if (providerEl) providerEl.textContent = session.providerName || "-";
  if (hospitalEl) hospitalEl.textContent = session.hospitalName || "-";
  if (sessionDateEl) sessionDateEl.textContent = formatDate(session.visitDate);
  if (headerDateEl) {
    var dateLabel = session.recordType === "visit" ? "Visit Date" : "Session Date";
    headerDateEl.innerHTML = dateLabel + ': <b class="surface-secondary-400">' + formatDate(session.visitDate) + "</b>";
  }

  var linkedOrder = findOrderById(session.orderId);
  if (treatmentDescription) {
    var orderText = linkedOrder ? " Linked Order: " + linkedOrder.orderNo + "." : "";
    treatmentDescription.textContent = (session.notes || "No notes available.") + orderText;
  }

  if (medsBody) {
    var meds = dataApi.getPatientMeds(patientCode).filter(function (item) {
      if (session.recordId) return item.recordId === session.recordId || item.orderId === session.orderId;
      return true;
    });

    if (!meds.length) {
      medsBody.innerHTML = '<tr><td colspan="7" class="text-center text-grey">No medications linked to this session</td></tr>';
    } else {
      medsBody.innerHTML = meds
        .map(function (item) {
          return (
            "<tr>" +
            "<td><b>" + escapeHtml(item.name) + "</b></td>" +
            "<td>" + escapeHtml(titleize(item.type)) + "</td>" +
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
      if (session.recordId) return item.recordId === session.recordId || item.orderId === session.orderId;
      return true;
    });

    if (!services.length) {
      servicesBody.innerHTML = '<tr><td colspan="2" class="text-center text-grey">No services linked to this session</td></tr>';
    } else {
      servicesBody.innerHTML = services
        .map(function (item) {
          return "<tr><td>" + escapeHtml(item.name) + "</td><td>" + (item.qty || 0) + "</td></tr>";
        })
        .join("");
    }
  }
})();
