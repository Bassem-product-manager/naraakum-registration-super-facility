(function () {
  const CASES_KEY = "nk_facility_insurance_cases";
  const table = document.getElementById("ordersTable");
  if (!table) return;

  const tbody = document.getElementById("ordersTbody");
  if (!tbody) return;

  const searchInput = document.getElementById("ordersSearchInput");
  const btnSearch = document.getElementById("btnOrdersSearch");
  const btnReset = document.getElementById("btnOrdersReset");
  const scopeSelect = document.getElementById("ordersMergeScope");
  const rowsSelect = document.getElementById("ordersRowsPerPage");
  const indicator = document.getElementById("ordersPageIndicator");
  const currentBadge = document.getElementById("ordersCurrentPageBadge");
  const btnFirst = document.getElementById("ordersFirstPage");
  const btnPrev = document.getElementById("ordersPrevPage");
  const btnNext = document.getElementById("ordersNextPage");
  const btnLast = document.getElementById("ordersLastPage");
  const checkAllVisible = document.getElementById("checkAllVisibleOrders");
  const ofMainService = document.getElementById("ofMainService");
  const ofService = document.getElementById("ofService");
  const ofStatus = document.getElementById("ofStatus");
  const ofOrderType = document.getElementById("ofOrderType");
  const ofAssignment = document.getElementById("ofAssignment");
  const ofDateFrom = document.getElementById("ofDateFrom");
  const ofDateTo = document.getElementById("ofDateTo");
  const btnApplyFilter = document.getElementById("btnOrdersApplyFilter");
  const btnFilterReset = document.getElementById("btnOrdersFilterReset");
  const btnExport = document.getElementById("btnOrdersExport");

  const assignModalEl = document.getElementById("assignModal");
  const assignModal = assignModalEl ? bootstrap.Modal.getOrCreateInstance(assignModalEl) : null;
  const doctorListEl = document.getElementById("doctorList");
  const assignSearchEl = document.getElementById("assignSearch");

  const doctors = [
    { name: "Dr. Walled", spec: "Cardiology" },
    { name: "Dr. Mohamed", spec: "Radiology" },
    { name: "Dr. Sara", spec: "Dermatology" },
    { name: "Dr. Ahmed", spec: "Internal Medicine" },
    { name: "Dr. Mona", spec: "Pediatrics" },
    { name: "Nurse Mona", spec: "Home Care" },
  ];

  const pendingStatuses = new Set(["draft", "pending submission", "submitted / awaiting response"]);
  const approvedStatuses = new Set(["approved", "partially approved"]);
  const rejectedStatuses = new Set(["rejected", "cancelled / closed"]);
  const approvalOnlyOrderStatuses = new Set(["under review", "draft", "pending submission", "submitted / awaiting response"]);

  const seedRows = [
    { orderNo: "BR03-OR-00001", patient: "Fahad Al-Mutairi", gender: "Male", age: 45, service: "Hemodialysis - 1 Month", main: "Hemodialysis", orderAt: "2026-03-01T13:26:00", scheduledAt: "2026-02-08T09:15:00", price: 1105.0, status: "Accepted", assignment: "Dr. Walled", insuranceEligible: true },
    { orderNo: "BR03-OR-00002", patient: "Noura Saleh", gender: "Female", age: 32, service: "Physiotherapy - 12 Sessions", main: "Physiotherapy", orderAt: "2026-03-01T13:26:00", scheduledAt: "2026-02-12T11:30:00", price: 1020.0, status: "In Progress", assignment: "", insuranceEligible: false },
    { orderNo: "BR03-OR-00003", patient: "Mona Al-Qahtani", gender: "Female", age: 40, service: "Health Companion - 8 Days", main: "Health Companion", orderAt: "2026-03-01T13:26:00", scheduledAt: "2026-02-11T10:20:00", price: 680.0, status: "In Progress", assignment: "Dr. Mohamed", insuranceEligible: true },
    { orderNo: "BR03-OR-00004", patient: "Ahmed Al-Ghamdi", gender: "Male", age: 38, service: "Laboratory Tests - Checkup", main: "Laboratory Tests", orderAt: "2026-03-01T13:26:00", scheduledAt: "2026-02-09T08:50:00", price: 85.0, status: "Completed", assignment: "Dr. Ahmed", insuranceEligible: false },
    { orderNo: "BR03-OR-00005", patient: "Huda Al-Otaibi", gender: "Female", age: 36, service: "Telemedicine Consultation", main: "Telemedicine", orderAt: "2026-03-01T13:26:00", scheduledAt: "2026-02-14T10:00:00", price: 60.0, status: "Accepted", assignment: "Dr. Sara", insuranceEligible: true },
    { orderNo: "BR03-OR-00006", patient: "Saeed Al-Harbi", gender: "Male", age: 41, service: "Physiotherapy - 6 Sessions", main: "Physiotherapy", orderAt: "2026-03-01T13:26:00", scheduledAt: "2026-02-10T09:25:00", price: 510.0, status: "Cancelled", assignment: "Nurse Mona", insuranceEligible: false },
    { orderNo: "BR03-OR-00007", patient: "Rania Hassan", gender: "Female", age: 29, service: "Hemodialysis - 3 Months", main: "Hemodialysis", orderAt: "2026-03-01T13:26:00", scheduledAt: "2026-03-01T14:34:00", price: 3060.0, status: "Under Review", assignment: "", insuranceEligible: true },
    { orderNo: "BR03-OR-00008", patient: "Majed Al-Dossary", gender: "Male", age: 47, service: "Home Wound Dressing", main: "Nursing Visit", orderAt: "2026-03-01T13:26:00", scheduledAt: "2026-02-15T09:10:00", price: 300.0, status: "In Progress", assignment: "Dr. Mona", insuranceEligible: false },
    { orderNo: "BR03-OR-00009", patient: "Lina Al-Shammari", gender: "Female", age: 31, service: "Home Nursing Visit", main: "Home Care", orderAt: "2026-03-01T13:26:00", scheduledAt: "2026-03-01T13:26:00", price: 240.0, status: "Accepted", assignment: "Dr. Walled", insuranceEligible: true },
    { orderNo: "BR03-OR-00010", patient: "Khaled Salem", gender: "Male", age: 43, service: "Laboratory Tests - Sugar", main: "Laboratory Tests", orderAt: "2026-03-01T13:26:00", scheduledAt: "2026-03-01T13:26:00", price: 85.0, status: "Missed", assignment: "", insuranceEligible: false },
    { orderNo: "BR03-OR-00011", patient: "Yara Fahmy", gender: "Female", age: 34, service: "Physiotherapy Session", main: "Physiotherapy", orderAt: "2026-03-01T13:26:00", scheduledAt: "2026-02-16T10:40:00", price: 120.0, status: "In Progress", assignment: "Dr. Sara", insuranceEligible: true },
    { orderNo: "BR03-OR-00012", patient: "Bader Al-Qahtani", gender: "Male", age: 50, service: "Health Companion - 12 Days", main: "Health Companion", orderAt: "2026-03-01T13:26:00", scheduledAt: "2026-02-18T12:10:00", price: 900.0, status: "Cancelled", assignment: "Dr. Mohamed", insuranceEligible: true },
    { orderNo: "BR03-OR-00013", patient: "John Doe", gender: "Male", age: 45, service: "Consultation", main: "Cardiology", orderAt: "2026-01-16T10:15:00", scheduledAt: "2026-01-20T01:30:00", price: 401.35, status: "Accepted", assignment: "Dr. Walled", insuranceEligible: false },
    { orderNo: "BR03-OR-00014", patient: "Jane Roe", gender: "Female", age: 32, service: "X-Ray Scan", main: "Radiology", orderAt: "2026-01-16T11:05:00", scheduledAt: "2026-01-20T09:00:00", price: 115.0, status: "In Progress", assignment: "", insuranceEligible: false },
    { orderNo: "BR03-OR-00015", patient: "Mike Lee", gender: "Male", age: 28, service: "Annual Checkup", main: "General", orderAt: "2026-01-15T03:20:00", scheduledAt: "2026-01-21T02:15:00", price: 0.0, status: "Completed", assignment: "Dr. Ahmed", insuranceEligible: false },
  ];

  let orders = [];
  let filteredOrders = [];
  let currentPage = 1;
  const selectedOrders = new Set();
  let activeAssignOrderNo = "";

  function norm(v) {
    return (v || "").toString().trim().toLowerCase();
  }

  function esc(v) {
    return (v || "")
      .toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function parseJson(v, fallback) {
    try {
      return JSON.parse(v);
    } catch {
      return fallback;
    }
  }

  function readInsuranceCases() {
    try {
      const raw = localStorage.getItem(CASES_KEY);
      const list = parseJson(raw, []);
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  function formatDateTop(v) {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
  }

  function formatDateSub(v) {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  }

  function dateCell(v) {
    return `<div class="date-top">${esc(formatDateTop(v))}</div><div class="date-sub">${esc(formatDateSub(v))}</div>`;
  }

  function statusClass(status) {
    const s = norm(status);
    if (s === "insurance waiting") return "status-pill st-underreview";
    if (s === "insurance rejected") return "status-pill st-cancel";
    if (s === "accepted") return "status-pill st-accepted";
    if (s === "under review") return "status-pill st-underreview";
    if (s === "in progress") return "status-pill st-progress";
    if (s === "cancelled") return "status-pill st-cancel";
    if (s === "completed") return "status-pill st-complete";
    if (s === "missed") return "status-pill st-missed";
    return "status-pill st-pending";
  }

  function toFixedPrice(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n.toFixed(2) : "0.00";
  }

  function normalizeInsuranceOrderId(v) {
    const s = (v || "").toString().trim().toUpperCase();
    if (!s) return "";
    const m = s.match(/OR[-\s]?0*(\d{1,8})$/i);
    if (!m) return "";
    return `OR-${parseInt(m[1], 10)}`;
  }

  function mapOrderNoToInsuranceOrderId(orderNo) {
    const s = (orderNo || "").toString().toUpperCase();
    const m = s.match(/-(\d{1,6})$/);
    if (!m) return "";
    const serial = parseInt(m[1], 10);
    if (!Number.isFinite(serial)) return "";
    return `OR-${2000 + serial}`;
  }

  function extractOrderSerial(orderNo) {
    const s = (orderNo || "").toString().toUpperCase();
    const m = s.match(/-(\d{1,6})$/);
    if (!m) return 0;
    const serial = parseInt(m[1], 10);
    return Number.isFinite(serial) ? serial : 0;
  }

  function buildFallbackInsuranceCases() {
    const companyPool = [
      { companyName: "Bupa Arabia", plan: "Gold", class: "A" },
      { companyName: "Tawuniya", plan: "Silver", class: "B" },
      { companyName: "MedGulf", plan: "Platinum", class: "A" },
      { companyName: "AlRajhi Takaful", plan: "Standard", class: "C" },
    ];

    const statusBySerial = {
      1: ["approved"],
      3: ["rejected"],
      5: ["submitted / awaiting response"],
      7: ["approved", "rejected"],
      9: ["pending submission"],
      11: ["approved"],
      12: ["rejected"],
    };

    return seedRows.flatMap((row, rowIndex) => {
      if (!row.insuranceEligible) return [];
      const serial = extractOrderSerial(row.orderNo);
      if (!serial) return [];
      const orderId = `OR-${2000 + serial}`;
      const statuses = statusBySerial[serial] || ["submitted / awaiting response"];

      return statuses.map((status, idx) => {
        const company = companyPool[(serial + idx) % companyPool.length];
        return {
          caseId: `DEMO-${orderId}-${idx + 1}`,
          orderId,
          status,
          insurance: {
            companyName: company.companyName,
            plan: company.plan,
            class: company.class,
          },
          createdAt: row.orderAt || `2026-03-0${(rowIndex % 9) + 1}T09:00:00`,
        };
      });
    });
  }

  function normalizeOrderStatusForType(status, orderType) {
    const fallback = status || "In Progress";
    if (orderType !== "regular") return fallback;
    if (approvalOnlyOrderStatuses.has(norm(fallback))) return "In Progress";
    return fallback;
  }

  function isInsuranceWaiting(insuranceStatus) {
    const s = norm(insuranceStatus);
    return s === "pending" || s === "mixed";
  }

  function deriveDisplayStatus(baseStatus, insuranceMeta) {
    if (insuranceMeta.orderType !== "insurance") return normalizeOrderStatusForType(baseStatus, "regular");
    if (norm(insuranceMeta.insuranceStatus) === "rejected") return "Insurance Rejected";
    if (isInsuranceWaiting(insuranceMeta.insuranceStatus)) return "Insurance Waiting";
    return normalizeOrderStatusForType(baseStatus, "insurance");
  }

  function canAssign(order) {
    if (order.orderType === "regular") return true;
    return norm(order.insuranceStatus) === "approved";
  }

  function aggregateInsurance(list) {
    if (!list.length) {
      return {
        orderType: "regular",
        orderTypeLabel: "Regular",
        orderTypeClass: "st-order-regular",
        insuranceStatus: "na",
        insuranceStatusLabel: "-",
        insuranceStatusClass: "",
        company: "-",
        planClass: "-",
        casesCount: 0,
      };
    }

    const statuses = list.map((c) => norm(c && c.status));
    const hasPending = statuses.some((s) => pendingStatuses.has(s));
    const approvedCount = statuses.filter((s) => approvedStatuses.has(s)).length;
    const rejectedCount = statuses.filter((s) => rejectedStatuses.has(s)).length;

    let insuranceStatus = "pending";
    let insuranceStatusLabel = "Pending";
    let insuranceStatusClass = "status-pill st-ins-pending";

    if (!hasPending) {
      if (approvedCount > 0 && rejectedCount === 0) {
        insuranceStatus = "approved";
        insuranceStatusLabel = "Approved";
        insuranceStatusClass = "status-pill st-ins-approved";
      } else if (rejectedCount > 0 && approvedCount === 0) {
        insuranceStatus = "rejected";
        insuranceStatusLabel = "Rejected";
        insuranceStatusClass = "status-pill st-ins-rejected";
      } else {
        insuranceStatus = "mixed";
        insuranceStatusLabel = "Mixed";
        insuranceStatusClass = "status-pill st-ins-mixed";
      }
    }

    const companies = [...new Set(list.map((c) => (c && c.insurance && c.insurance.companyName ? c.insurance.companyName : "")).filter(Boolean))];
    const plans = [...new Set(list.map((c) => `${(c && c.insurance && c.insurance.plan) || "-"}/${(c && c.insurance && c.insurance.class) || "-"}`))];

    const company = companies.length > 2 ? `${companies[0]} +${companies.length - 1}` : (companies.join(" / ") || "-");
    const planClass = plans.length === 1 ? plans[0] : plans.length > 1 ? "Multiple plans/classes" : "-";

    return {
      orderType: "insurance",
      orderTypeLabel: "Insurance",
      orderTypeClass: "st-order-insurance",
      insuranceStatus,
      insuranceStatusLabel,
      insuranceStatusClass,
      company,
      planClass,
      casesCount: list.length,
    };
  }

  function buildOrders() {
    const storedInsuranceCases = readInsuranceCases();
    const insuranceCases = storedInsuranceCases.length ? storedInsuranceCases : buildFallbackInsuranceCases();
    const casesByOrder = new Map();

    insuranceCases.forEach((c) => {
      const orderId = normalizeInsuranceOrderId(c && c.orderId);
      if (!orderId) return;
      const bucket = casesByOrder.get(orderId) || [];
      bucket.push(c);
      casesByOrder.set(orderId, bucket);
    });

    orders = seedRows.map((row) => {
      const insOrderId = mapOrderNoToInsuranceOrderId(row.orderNo);
      const list = row.insuranceEligible ? (casesByOrder.get(insOrderId) || []) : [];
      const ins = aggregateInsurance(list);
      const displayStatus = deriveDisplayStatus(row.status, ins);
      const assignEnabled = canAssign({ ...ins, insuranceStatus: ins.insuranceStatus });
      const assignment = assignEnabled ? row.assignment : "";

      return {
        ...row,
        status: displayStatus,
        assignment,
        assignEnabled,
        orderDateKey: (row.orderAt || "").slice(0, 10),
        dataAssignment: assignEnabled ? (assignment ? assignment : "assign") : "locked",
        insuranceOrder: ins.orderType === "insurance" ? insOrderId : "",
        ...ins,
      };
    });
  }

  function fillSelect(selectEl, values, allLabel) {
    if (!selectEl) return;
    const current = selectEl.value;
    const uniq = [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const options = [`<option value="">${esc(allLabel)}</option>`]
      .concat(uniq.map((v) => `<option value="${esc(norm(v))}">${esc(v)}</option>`));
    selectEl.innerHTML = options.join("");
    if ([...selectEl.options].some((o) => o.value === current)) selectEl.value = current;
  }

  function initFilterOptions() {
    fillSelect(ofMainService, orders.map((o) => o.main), "All");
    fillSelect(ofService, orders.map((o) => o.service), "All");
    fillSelect(ofStatus, orders.map((o) => o.status), "All");
    fillSelect(ofAssignment, ["Assign", "Locked"].concat(doctors.map((d) => d.name)), "All");
  }

  function renderDoctors(filter) {
    if (!doctorListEl) return;
    const q = norm(filter);
    const list = doctors.filter((d) => !q || norm(d.name).includes(q) || norm(d.spec).includes(q));
    doctorListEl.innerHTML = list
      .map((d) => `
        <div class="doc-item" role="button" tabindex="0" data-name="${esc(d.name)}">
          <div class="doc-left">
            <div class="doc-avatar"><i class="fi fi-rr-user" style="color: var(--nk-green);"></i></div>
            <div class="doc-meta">
              <p class="doc-name">${esc(d.name)}</p>
              <p class="doc-spec">${esc(d.spec)}</p>
            </div>
          </div>
          <div class="doc-action"><i class="fi fi-rr-check" style="color: var(--nk-green);"></i>Assign</div>
        </div>
      `)
      .join("");
  }

  function openAssign(orderNo) {
    if (!assignModal || !assignModalEl) return;
    activeAssignOrderNo = orderNo;
    if (assignSearchEl) assignSearchEl.value = "";
    renderDoctors("");
    assignModal.show();
    setTimeout(() => assignSearchEl && assignSearchEl.focus(), 100);
  }

  function setAssignment(orderNo, doctorName) {
    const idx = orders.findIndex((o) => o.orderNo === orderNo);
    if (idx < 0) return;
    orders[idx].assignment = doctorName;
    orders[idx].dataAssignment = doctorName ? doctorName : "assign";
    applyAll(false);
  }

  function renderRow(o, seq) {
    const checked = selectedOrders.has(o.orderNo) ? "checked" : "";
    const assignCell = o.assignEnabled
      ? (o.assignment
        ? `<span class="assign-name" role="button" tabindex="0">${esc(o.assignment)}</span>`
        : `<button type="button" class="assign-btn"><i class="fi fi-rr-user-add"></i>Assign</button>`)
      : `<span class="assign-name is-disabled" title="${esc(o.orderType === "insurance" ? "Insurance decision is required before assigning." : "Assignment is disabled.")}">Assign</span>`;

    const insuranceBangClass = norm(o.insuranceStatus) === "approved" ? "success" : "warn";
    const insuranceAction = o.orderType === "insurance"
      ? `<a class="action-icon ${insuranceBangClass} js-insurance-details" href="queue-details.html?orderId=${encodeURIComponent(o.insuranceOrder)}&scope=order" title="Insurance (${esc(String(o.casesCount))} case${o.casesCount > 1 ? "s" : ""})"><span class="icon-bang">!</span></a>`
      : `<span class="action-icon is-disabled" title="Regular order (no insurance approval needed)"><span class="icon-bang">!</span></span>`;

    return `
      <tr data-order-no="${esc(o.orderNo)}" data-order-type="${esc(o.orderType)}" data-insurance-status="${esc(o.insuranceStatus)}" data-ins-order="${esc(o.insuranceOrder)}" data-ins-cases="${esc(String(o.casesCount))}" data-assign-enabled="${o.assignEnabled ? "1" : "0"}">
        <td class="col-check"><input class="row-check" type="checkbox" data-order="${esc(o.orderNo)}" ${checked} /></td>
        <td class="col-seq"><span class="row-seq">${seq}</span></td>
        <td class="col-code"><span class="staff-code order-code">${esc(o.orderNo)}</span></td>
        <td>
          <div class="patient-cell">
            <div class="patient-avatar"><img src="../assets/images/avatar.svg" alt="patient" /></div>
            <div class="patient-info">
              <p class="name">${esc(o.patient)}</p>
              <div class="meta">${esc(o.gender)}, ${esc(String(o.age))}</div>
            </div>
          </div>
        </td>
        <td><div class="service-name">${esc(o.service)}</div><div class="service-main">${esc(o.main)}</div></td>
        <td>${dateCell(o.orderAt)}</td>
        <td>${dateCell(o.scheduledAt)}</td>
        <td class="price-cell"><span class="bold">${esc(toFixedPrice(o.price))}</span> SR</td>
        <td><span class="${esc(statusClass(o.status))}">${esc(o.status)}</span></td>
        <td class="order-type-cell"><span class="status-pill ${esc(o.orderTypeClass)}">${esc(o.orderTypeLabel)}</span></td>
        <td class="assign-cell">${assignCell}</td>
        <td class="invoice-cell"><a class="invoice-btn" href="#" title="Invoice"><i class="fi fi-rr-receipt"></i>Invoice</a></td>
        <td class="col-actions">
          <div class="actions-cell">
            <a class="action-icon" href="orders-details.html?order=${encodeURIComponent(o.orderNo)}" title="Preview"><i class="fi fi-rr-eye"></i></a>
            ${insuranceAction}
            <button class="action-icon danger" type="button" title="Cancel"><i class="fi fi-rr-cross-small"></i></button>
          </div>
        </td>
      </tr>
    `;
  }

  function getOrderData(o) {
    return {
      order: norm(o.orderNo),
      patient: norm(o.patient),
      assignment: norm(o.dataAssignment),
      service: norm(o.service),
      main: norm(o.main),
      status: norm(o.status),
      orderType: norm(o.orderType),
      insuranceStatus: norm(o.insuranceStatus),
      insuranceCompany: norm(o.company),
      planClass: norm(o.planClass),
      insuranceOrder: norm(o.insuranceOrder),
      orderDate: norm(o.orderDateKey),
    };
  }

  function matchesSearch(o) {
    const q = norm(searchInput ? searchInput.value : "");
    if (!q) return true;
    const d = getOrderData(o);
    return (
      d.order.includes(q) ||
      d.patient.includes(q) ||
      d.assignment.includes(q) ||
      d.status.includes(q) ||
      d.orderType.includes(q) ||
      d.insuranceOrder.includes(q)
    );
  }

  function matchesFilters(o) {
    const d = getOrderData(o);
    const ms = norm(ofMainService ? ofMainService.value : "");
    const s = norm(ofService ? ofService.value : "");
    const st = norm(ofStatus ? ofStatus.value : "");
    const ot = norm(ofOrderType ? ofOrderType.value : "");
    const as = norm(ofAssignment ? ofAssignment.value : "");
    const from = norm(ofDateFrom ? ofDateFrom.value : "");
    const to = norm(ofDateTo ? ofDateTo.value : "");

    if (ms && d.main !== ms) return false;
    if (s && d.service !== s) return false;
    if (st && d.status !== st) return false;
    if (ot && d.orderType !== ot) return false;

    if (as) {
      if (as === "assign") {
        if (d.assignment !== "assign") return false;
      } else if (as === "locked") {
        if (d.assignment !== "locked") return false;
      } else if (d.assignment !== as) {
        return false;
      }
    }

    if (from && d.orderDate && d.orderDate < from) return false;
    if (to && d.orderDate && d.orderDate > to) return false;
    return true;
  }

  function matchesScope(o) {
    const scope = norm(scopeSelect ? scopeSelect.value : "all");
    if (scope === "insurance-only") return o.orderType === "insurance";
    if (scope === "needs-decision") return o.orderType === "insurance" && isInsuranceWaiting(o.insuranceStatus);
    return true;
  }

  function perPageVal() {
    const v = rowsSelect ? rowsSelect.value : "10";
    if (v === "all") return Math.max(1, filteredOrders.length);
    const n = parseInt(v, 10);
    return Number.isFinite(n) && n > 0 ? n : 10;
  }

  function totalPages() {
    const p = perPageVal();
    return Math.max(1, Math.ceil(filteredOrders.length / p));
  }

  function visibleOrders() {
    const p = perPageVal();
    const start = (currentPage - 1) * p;
    const end = start + p;
    return filteredOrders.slice(start, end);
  }

  function updateHeaderCheckbox() {
    if (!checkAllVisible) return;
    const vis = visibleOrders();
    if (!vis.length) {
      checkAllVisible.checked = false;
      checkAllVisible.indeterminate = false;
      return;
    }
    const checkedCount = vis.filter((o) => selectedOrders.has(o.orderNo)).length;
    checkAllVisible.checked = checkedCount === vis.length;
    checkAllVisible.indeterminate = checkedCount > 0 && checkedCount < vis.length;
  }

  function render() {
    const pages = totalPages();
    if (currentPage > pages) currentPage = pages;
    if (currentPage < 1) currentPage = 1;

    const vis = visibleOrders();
    if (!vis.length) {
      tbody.innerHTML = '<tr><td colspan="13" class="text-center text-grey">No orders found.</td></tr>';
    } else {
      const start = (currentPage - 1) * perPageVal();
      tbody.innerHTML = vis.map((o, i) => renderRow(o, start + i + 1)).join("");
    }

    if (indicator) indicator.textContent = `Page ${currentPage} of ${pages}`;
    if (currentBadge) currentBadge.textContent = String(currentPage);

    const disableNav = (rowsSelect && rowsSelect.value === "all") || pages === 1;
    if (btnFirst) btnFirst.disabled = disableNav || currentPage === 1;
    if (btnPrev) btnPrev.disabled = disableNav || currentPage === 1;
    if (btnNext) btnNext.disabled = disableNav || currentPage === pages;
    if (btnLast) btnLast.disabled = disableNav || currentPage === pages;

    updateHeaderCheckbox();
  }

  function applyAll(resetPage) {
    filteredOrders = orders.filter((o) => matchesSearch(o) && matchesFilters(o) && matchesScope(o));
    if (resetPage) currentPage = 1;
    render();
  }

  function resetFilters() {
    if (searchInput) searchInput.value = "";
    if (scopeSelect) scopeSelect.value = "all";
    if (ofMainService) ofMainService.value = "";
    if (ofService) ofService.value = "";
    if (ofStatus) ofStatus.value = "";
    if (ofOrderType) ofOrderType.value = "";
    if (ofAssignment) ofAssignment.value = "";
    if (ofDateFrom) ofDateFrom.value = "";
    if (ofDateTo) ofDateTo.value = "";
  }

  function csvEscape(v) {
    const s = (v ?? "").toString().replace(/\r?\n/g, " ").trim();
    if (/[",]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  }

  function exportSelected() {
    const selected = orders.filter((o) => selectedOrders.has(o.orderNo));
    if (!selected.length) {
      alert("Please select at least one order to export.");
      return;
    }

    const headers = [
      "Order No",
      "Patient Name",
      "Gender",
      "Age",
      "Service",
      "Main Service",
      "Order Date",
      "Scheduled Date",
      "Price",
      "Order Status",
      "Order Type",
      "Assignment",
    ];

    const lines = [headers.map(csvEscape).join(",")];
    selected.forEach((o) => {
      lines.push([
        o.orderNo,
        o.patient,
        o.gender,
        o.age,
        o.service,
        o.main,
        `${formatDateTop(o.orderAt)} ${formatDateSub(o.orderAt)}`,
        `${formatDateTop(o.scheduledAt)} ${formatDateSub(o.scheduledAt)}`,
        `${toFixedPrice(o.price)} SR`,
        o.status,
        o.orderTypeLabel,
        o.assignment || (o.assignEnabled ? "Assign" : "Locked"),
      ].map(csvEscape).join(","));
    });

    const csvContent = "\ufeff" + lines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders-list-2-export.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (btnSearch) btnSearch.addEventListener("click", function () { applyAll(true); });
  if (searchInput) searchInput.addEventListener("input", function () { applyAll(true); });
  if (scopeSelect) scopeSelect.addEventListener("change", function () { applyAll(true); });

  if (btnReset) {
    btnReset.addEventListener("click", function () {
      resetFilters();
      applyAll(true);
    });
  }

  if (btnApplyFilter) {
    btnApplyFilter.addEventListener("click", function () {
      applyAll(true);
      const el = document.getElementById("orders-filter-modal");
      if (el && window.bootstrap) bootstrap.Modal.getOrCreateInstance(el).hide();
    });
  }

  if (btnFilterReset) {
    btnFilterReset.addEventListener("click", function () {
      if (ofMainService) ofMainService.value = "";
      if (ofService) ofService.value = "";
      if (ofStatus) ofStatus.value = "";
      if (ofOrderType) ofOrderType.value = "";
      if (ofAssignment) ofAssignment.value = "";
      if (ofDateFrom) ofDateFrom.value = "";
      if (ofDateTo) ofDateTo.value = "";
      applyAll(true);
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
  if (btnNext) btnNext.addEventListener("click", function () { currentPage = Math.min(totalPages(), currentPage + 1); render(); });
  if (btnLast) btnLast.addEventListener("click", function () { currentPage = totalPages(); render(); });

  if (checkAllVisible) {
    checkAllVisible.addEventListener("change", function () {
      visibleOrders().forEach((o) => {
        if (checkAllVisible.checked) selectedOrders.add(o.orderNo);
        else selectedOrders.delete(o.orderNo);
      });
      render();
    });
  }

  tbody.addEventListener("change", function (e) {
    const cb = e.target.closest(".row-check");
    if (!cb) return;
    const orderNo = cb.getAttribute("data-order") || "";
    if (!orderNo) return;
    if (cb.checked) selectedOrders.add(orderNo);
    else selectedOrders.delete(orderNo);
    updateHeaderCheckbox();
  });

  tbody.addEventListener("click", function (e) {
    const assignTrigger = e.target.closest(".assign-btn, .assign-name");
    if (assignTrigger) {
      const tr = assignTrigger.closest("tr");
      const canOpen = tr ? tr.getAttribute("data-assign-enabled") === "1" : false;
      if (!canOpen) return;
      const orderNo = tr ? tr.getAttribute("data-order-no") || "" : "";
      if (orderNo) openAssign(orderNo);
      return;
    }
  });

  if (doctorListEl) {
    doctorListEl.addEventListener("click", function (e) {
      const item = e.target.closest(".doc-item");
      if (!item || !activeAssignOrderNo) return;
      const chosen = item.getAttribute("data-name") || "";
      if (!chosen) return;
      setAssignment(activeAssignOrderNo, chosen);
      if (assignModal) assignModal.hide();
    });
  }

  if (assignSearchEl) {
    assignSearchEl.addEventListener("input", function () {
      renderDoctors(assignSearchEl.value);
    });
  }

  if (btnExport) btnExport.addEventListener("click", exportSelected);

  buildOrders();
  initFilterOptions();
  renderDoctors("");
  applyAll(true);
})();
