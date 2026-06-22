(function () {
  const K = 'nk_facility_insurance_cases';
  const U = 'Facility Insurance Officer';
  const S = ['Draft', 'Pending Submission', 'Submitted / Awaiting Response', 'Approved', 'Partially Approved', 'Rejected', 'Cancelled / Closed'];
  const R = {
    NotRegistered: 'Patient Not Registered',
    NotEligiblePlan: 'Not Eligible for This Benefit',
    NotAuthorizedPlan: 'Not Authorized for This Plan',
    NotCoveredBenefit: 'Not Covered Benefit',
    PlanClassMismatch: 'Plan/Class Not Eligible (Mismatch)',
    OutOfNetwork: 'Out of Network',
    PolicyInactive: 'Policy Inactive / Expired',
    MissingInvalidData: 'Missing/Invalid Data',
    Other: 'Other',
  };

  const $ = id => document.getElementById(id);
  const E = {
    tb: $('qdTbody'),
    q: $('qdSearchInput'),
    qBtn: $('btnQdSearch'),
    rBtn: $('btnQdReset'),
    scope: $('qdScope'),
    exp: $('btnQdExport'),
    rows: $('qdRowsPerPage'),
    ind: $('qdPageIndicator'),
    cur: $('qdCurrentPageBadge'),
    f: $('qdFirstPage'),
    p: $('qdPrevPage'),
    n: $('qdNextPage'),
    l: $('qdLastPage'),
    all: $('checkAllVisibleQd'),
    svc: $('serviceContextNote'),
    pc: $('qdPatientCard'),
    pn: $('qdPatientName'),
    pph: $('qdPatientPhone'),
    po: $('qdPatientOrder'),
    pi: $('qdPatientInsurance'),
    bb: $('qdBulkBar'),
    bl: $('qdBulkLabel'),
    ba: $('btnBulkApprove'),
    br: $('btnBulkReject'),
    bs: $('btnBulkSend'),
    sa: $('approvedSummaryBody'),
    sn: $('notApprovedSummaryBody'),
    fs: $('qdfStatus'),
    fc: $('qdfCompany'),
    fp: $('qdfPlan'),
    fcl: $('qdfClass'),
    fm: $('qdfMainService'),
    fa: $('btnQdApplyFilter'),
    fz: $('btnQdFilterReset'),
    dt: $('qdDecisionTitle'),
    dm: $('qdDecisionMeta'),
    rw: $('qdRejectWrap'),
    rr: $('qdRejectReason'),
    rt: $('qdRejectText'),
    ds: $('btnSaveQdDecision'),
    am: $('qdApproveMeta'),
    acp: $('qdCoveragePct'),
    acf: $('qdCoverageFull'),
    arq: $('qdApproveRequested'),
    aco: $('qdApproveCovered'),
    acb: $('btnConfirmQdApprove'),
    bm: $('qdBulkRejectMeta'),
    brr: $('qdBulkRejectReason'),
    brt: $('qdBulkRejectText'),
    bc: $('btnConfirmBulkReject'),
  };

  if (!E.tb) return;

  const M = E.ds ? new bootstrap.Modal($('qd-decision-modal')) : null;
  const AM = E.acb ? new bootstrap.Modal($('qd-approve-modal')) : null;
  const BM = E.bc ? new bootstrap.Modal($('qd-bulk-reject-modal')) : null;

  let A = [];
  let P = [];
  let F = [];
  let pg = 1;
  let cid = '';
  let focusCase = '';
  let focusOrder = '';
  let scopeMode = 'order';

  const n = v => (v || '').toString().trim().toLowerCase();
  const num = v => {
    const x = Number(v);
    return Number.isFinite(x) ? x : null;
  };
  const now = () => new Date().toISOString();
  const esc = v =>
    (v || '')
      .toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  const d = v => {
    if (!v) return '-';
    const t = new Date(v);
    return Number.isNaN(t.getTime()) ? '-' : t.toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };
  const rd = k => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  };
  const wr = (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  };
  const js = (x, f) => {
    try {
      return JSON.parse(x);
    } catch {
      return f;
    }
  };
  const round2 = v => Math.round(v * 100) / 100;
  const fmtQty = v => {
    const q = num(v);
    if (q == null) return '-';
    const r = round2(q);
    return Number.isInteger(r) ? String(r) : r.toFixed(2).replace(/\.?0+$/, '');
  };
  const clampPct = v => {
    const p = num(v);
    if (p == null) return 0;
    return Math.min(100, Math.max(0, round2(p)));
  };

  const cls = s => (s === 'Approved' || s === 'Partially Approved' ? 'status-pill st-accepted' : s === 'Rejected' || s === 'Cancelled / Closed' ? 'status-pill st-cancel' : 'status-pill st-missed');
  const sh = s => `<span class="${cls(s)}">${esc(s)}</span>`;

  const bw = () => ({
    submissionType: '',
    submittedAt: '',
    referenceNo: '',
    responseAt: '',
    decision: '',
    approvedQty: null,
    approvalValidity: { from: '', to: '' },
    rejectionReasonCode: '',
    rejectionReasonText: '',
  });

  function tl(c, e, no) {
    c.timeline = Array.isArray(c.timeline) ? c.timeline : [];
    c.timeline.push({ event: e, by: U, time: now(), note: no || '' });
    c.updatedAt = now();
  }

  function norm(c) {
    c = c && typeof c === 'object' ? c : {};
    return {
      caseId: (c.caseId || '').toString(),
      orderId: (c.orderId || '').toString(),
      patient: { name: (c.patient?.name || '').toString(), phone: (c.patient?.phone || '').toString() },
      insurance: {
        companyName: (c.insurance?.companyName || '').toString(),
        companyCode: (c.insurance?.companyCode || '').toString(),
        plan: (c.insurance?.plan || '').toString(),
        class: (c.insurance?.class || '').toString(),
      },
      target: {
        type: (c.target?.type || 'Service').toString(),
        mainService: (c.target?.mainService || '').toString(),
        itemName: (c.target?.itemName || '').toString(),
        itemCode: (c.target?.itemCode || '').toString(),
        unitType: (c.target?.unitType || '').toString(),
        requestedQty: num(c.target?.requestedQty) || 0,
      },
      status: (c.status || 'Draft').toString(),
      waseel: { ...bw(), ...(c.waseel || {}) },
      requiredDocs: Array.isArray(c.requiredDocs) ? c.requiredDocs : [],
      docsMessages: Array.isArray(c.docsMessages) ? c.docsMessages : [],
      clientMessages: Array.isArray(c.clientMessages) ? c.clientMessages : [],
      internalNotes: (c.internalNotes || '').toString(),
      timeline: Array.isArray(c.timeline) ? c.timeline : [],
      updatedAt: (c.updatedAt || now()).toString(),
    };
  }

  function mg(c) {
    let ch = false;
    if (c.status === 'Need Documents') {
      c.status = n(c.waseel.referenceNo) || n(c.waseel.submittedAt) ? 'Submitted / Awaiting Response' : 'Pending Submission';
      tl(c, 'Legacy Migration', 'Legacy status migrated from Need Documents.');
      ch = true;
    }
    if (!S.includes(c.status)) {
      c.status = 'Draft';
      ch = true;
    }
    if (!Array.isArray(c.clientMessages)) {
      c.clientMessages = [];
      ch = true;
    }
    return ch;
  }

  function load() {
    let p = js(rd(K), []);
    if (!Array.isArray(p)) p = [];

    if (!p.length) {
      p = [
        {
          caseId: 'IR-1001',
          orderId: 'OR-3001',
          patient: { name: 'Fahad Al-Mutairi', phone: '0500012001' },
          insurance: { companyName: 'Bupa', companyCode: 'IN-00003', plan: 'Gold', class: 'A' },
          target: { type: 'Package', mainService: 'Hemodialysis', itemName: 'Hemodialysis - 1 Month', itemCode: 'HD-M01-13', unitType: 'Sessions', requestedQty: 13 },
          status: 'Partially Approved',
          waseel: { ...bw(), referenceNo: 'WSL-940011', decision: 'Partial', approvedQty: 9 },
        },
        {
          caseId: 'IR-1002',
          orderId: 'OR-3002',
          patient: { name: 'Noura Saleh', phone: '0500012002' },
          insurance: { companyName: 'Tawuniya', companyCode: 'IN-00002', plan: 'Silver', class: 'B' },
          target: { type: 'Package', mainService: 'Physiotherapy', itemName: 'Physiotherapy - 12 Sessions', itemCode: 'PT-S12', unitType: 'Sessions', requestedQty: 12 },
          status: 'Submitted / Awaiting Response',
          waseel: { ...bw(), referenceNo: 'WSL-940022', submissionType: 'PreAuth' },
        },
        {
          caseId: 'IR-1003',
          orderId: 'OR-3003',
          patient: { name: 'Mona Al-Qahtani', phone: '0500012003' },
          insurance: { companyName: 'MedGulf', companyCode: 'IN-00004', plan: 'Basic', class: 'General' },
          target: { type: 'Package', mainService: 'Health Companion', itemName: 'Health Companion - 8 Days', itemCode: 'HC-D08', unitType: 'Days', requestedQty: 8 },
          status: 'Rejected',
          waseel: { ...bw(), referenceNo: 'WSL-940033', decision: 'Rejected', rejectionReasonCode: 'NotCoveredBenefit' },
        },
        {
          caseId: 'IR-1004',
          orderId: 'OR-3004',
          patient: { name: 'Ahmed Al-Ghamdi', phone: '0500012004' },
          insurance: { companyName: 'GIG', companyCode: 'IN-00005', plan: 'Gold', class: 'A' },
          target: { type: 'Package', mainService: 'Laboratory Tests', itemName: 'Laboratory Tests - Checkup', itemCode: 'LAB-CHECK', unitType: 'Visits', requestedQty: 1 },
          status: 'Approved',
          waseel: { ...bw(), referenceNo: 'WSL-940044', decision: 'Approved', approvedQty: 1 },
        },
        {
          caseId: 'IR-1005',
          orderId: 'OR-3005',
          patient: { name: 'Rania Hassan', phone: '0500012005' },
          insurance: { companyName: 'BMC Insurance Co.', companyCode: 'IN-00001', plan: 'Silver', class: 'B' },
          target: { type: 'Package', mainService: 'Hemodialysis', itemName: 'Hemodialysis - 3 Months', itemCode: 'HD-M03-36', unitType: 'Sessions', requestedQty: 36 },
          status: 'Pending Submission',
          waseel: { ...bw() },
        },
        {
          caseId: 'IR-1006',
          orderId: 'OR-3006',
          patient: { name: 'Huda Al-Otaibi', phone: '0500012006' },
          insurance: { companyName: 'Bupa', companyCode: 'IN-00003', plan: 'Silver', class: 'B' },
          target: { type: 'Service', mainService: 'Telemedicine', itemName: 'Telemedicine Consultation', itemCode: 'SRV-TM-01', unitType: 'Visits', requestedQty: 1 },
          status: 'Approved',
          waseel: { ...bw(), decision: 'Approved', approvedQty: 1 },
        },
        {
          caseId: 'IR-1007',
          orderId: 'OR-3001',
          patient: { name: 'Fahad Al-Mutairi', phone: '0500012001' },
          insurance: { companyName: 'Bupa', companyCode: 'IN-00003', plan: 'Gold', class: 'A' },
          target: { type: 'Package', mainService: 'Physiotherapy', itemName: 'Physiotherapy - 3 Sessions', itemCode: 'PT-S03', unitType: 'Sessions', requestedQty: 3 },
          status: 'Rejected',
          waseel: { ...bw(), referenceNo: 'WSL-940011', decision: 'Rejected', rejectionReasonCode: 'NotCoveredBenefit', rejectionReasonText: 'Policy limit reached for bundled rehab benefit.' },
        },
      ];

      const t = now();
      p.forEach(c => {
        c.updatedAt = t;
        c.timeline = [{ event: 'Case Created', by: U, time: t, note: 'Auto-seeded for queue operations.' }];
        c.clientMessages = [];
        c.requiredDocs = [];
        c.docsMessages = [];
      });
      wr(K, JSON.stringify(p));
    }

    const z = p.map(norm);
    let dirty = false;
    z.forEach(c => {
      if (mg(c)) dirty = true;
    });
    if (dirty) wr(K, JSON.stringify(z));
    return z;
  }

  function save() {
    wr(K, JSON.stringify(A));
  }

  function find(id) {
    return A.find(x => x.caseId === id) || null;
  }

  function sv(c) {
    c.updatedAt = now();
    const i = A.findIndex(x => x.caseId === c.caseId);
    if (i >= 0) A[i] = c;
    save();
    derive();
    apply(false);
  }

  function svMany(list) {
    const m = new Map(list.map(c => [c.caseId, c]));
    A = A.map(c => m.get(c.caseId) || c);
    save();
    derive();
    apply(false);
  }

  function qry() {
    const p = new URLSearchParams(location.search);
    focusCase = (p.get('caseId') || '').trim();
    focusOrder = (p.get('orderId') || '').trim();
    const sc = (p.get('scope') || '').trim().toLowerCase();
    scopeMode = sc === 'all' ? 'all' : 'order';
  }

  function ctx() {
    const c = focusCase ? find(focusCase) : null;
    if (!focusOrder && c) focusOrder = c.orderId;

    if (!focusOrder && scopeMode === 'order') scopeMode = 'all';

    if (c && n(c.target.type) === 'service' && E.svc) {
      E.svc.classList.remove('d-none');
      E.svc.innerHTML = `<div class="semiBold fsize-13">Selected context is a Service case.</div><div class="fsize-12 text-grey mt-4">Order ${esc(c.orderId)} is not a package item. Only package items are actionable in this view.</div>`;
    }

    const showCard = scopeMode === 'order' && !!focusOrder && !!E.pc;
    const rows = A.filter(x => x.orderId === focusOrder);
    const base = rows[0] || c;
    if (E.pc) E.pc.classList.toggle('d-none', !showCard || !base);
    if (showCard && base) {
      if (E.pn) E.pn.textContent = base.patient.name || '-';
      if (E.pph) E.pph.textContent = base.patient.phone || '-';
      if (E.po) E.po.textContent = base.orderId || '-';
      if (E.pi) E.pi.textContent = base.insurance.companyName || '-';
    }
  }

  const ins = c => (scopeMode === 'order' && focusOrder ? c.orderId === focusOrder : true);

  function uniq(fn) {
    return [...new Set(P.map(fn).filter(Boolean))];
  }

  function sel(s, v, l) {
    if (!s) return;
    s.innerHTML = [`<option value="">${esc(l)}</option>`].concat(v.sort().map(x => `<option value="${esc(x.toLowerCase())}">${esc(x)}</option>`)).join('');
  }

  function derive() {
    P = A.filter(c => n(c.target.type) === 'package');
    sel(E.fs, S, 'All');
    sel(E.fc, uniq(c => c.insurance.companyName), 'All');
    sel(E.fp, uniq(c => c.insurance.plan), 'All');
    sel(E.fcl, uniq(c => c.insurance.class), 'All');
    sel(E.fm, uniq(c => c.target.mainService), 'All');
    ctx();
    sum();
  }

  function mSearch(c) {
    const q = n(E.q ? E.q.value : '');
    if (!q) return true;
    return n(c.orderId).includes(q) || n(c.patient.name).includes(q) || n(c.patient.phone).includes(q) || n(c.target.itemName).includes(q) || n(c.target.itemCode).includes(q);
  }

  function mFilter(c) {
    const st = n(E.fs ? E.fs.value : '');
    const co = n(E.fc ? E.fc.value : '');
    const pl = n(E.fp ? E.fp.value : '');
    const cl = n(E.fcl ? E.fcl.value : '');
    const ms = n(E.fm ? E.fm.value : '');
    if (st && n(c.status) !== st) return false;
    if (co && n(c.insurance.companyName) !== co) return false;
    if (pl && n(c.insurance.plan) !== pl) return false;
    if (cl && n(c.insurance.class) !== cl) return false;
    if (ms && n(c.target.mainService) !== ms) return false;
    return true;
  }

  const pp = () => {
    const x = parseInt(E.rows ? E.rows.value : '10', 10);
    return Number.isFinite(x) && x > 0 ? x : 10;
  };
  const tp = () => Math.max(1, Math.ceil(F.length / pp()));
  const aq = c => {
    const q = num(c.waseel.approvedQty);
    return q == null ? '-' : fmtQty(q);
  };

  function calcCoverage(requestedQty, coveragePct) {
    const requested = Math.max(0, num(requestedQty) || 0);
    const pct = clampPct(coveragePct);
    const covered = round2((requested * pct) / 100);
    const client = Math.max(0, round2(requested - covered));
    return { requested, pct, covered, client };
  }

  function msg(c) {
    const rq = num(c.target.requestedQty) || 0;
    const ap = num(c.waseel.approvedQty);
    const unit = c.target.unitType || '';
    const pct = rq > 0 && ap != null ? round2((ap / rq) * 100) : null;

    if (c.status === 'Approved') {
      return `Your package ${c.target.itemName} (${c.target.itemCode}) is approved for ${fmtQty(ap == null ? rq : ap)} ${unit}.`;
    }
    if (c.status === 'Partially Approved') {
      const remaining = ap == null ? rq : Math.max(0, round2(rq - ap));
      return `Your package ${c.target.itemName} is partially approved for ${fmtQty(ap)} ${unit} (${fmtQty(pct)}%). Remaining ${fmtQty(remaining)} ${unit} is client responsibility.`;
    }
    if (c.status === 'Rejected') {
      return `Your package ${c.target.itemName} was rejected by insurance: ${R[c.waseel.rejectionReasonCode] || c.waseel.rejectionReasonCode || 'Rejected'}${c.waseel.rejectionReasonText ? ` (${c.waseel.rejectionReasonText})` : ''}.`;
    }
    return `Your package ${c.target.itemName} is currently ${c.status}.`;
  }

  function send(c, note) {
    c.clientMessages = Array.isArray(c.clientMessages) ? c.clientMessages : [];
    c.clientMessages.push({
      id: `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      message: msg(c),
      sentAt: now(),
      sentBy: U,
      statusSnapshot: c.status,
      approvedQtySnapshot: c.waseel.approvedQty == null ? null : c.waseel.approvedQty,
      rejectionReasonSnapshot: c.waseel.rejectionReasonCode || '',
    });
    tl(c, 'Decision Sent to Client', note || `Status sent: ${c.status}`);
    return c;
  }

  function appr(id, bulkMode, coveragePct) {
    const c = find(id);
    if (!c) return null;

    const calc = calcCoverage(c.target.requestedQty, coveragePct == null ? 100 : coveragePct);
    const fullApproval = calc.pct >= 100 || calc.covered >= calc.requested;
    c.waseel.decision = fullApproval ? 'Approved' : 'Partial';
    c.waseel.approvedQty = fullApproval ? calc.requested : calc.covered;
    c.waseel.responseAt = now();
    c.waseel.rejectionReasonCode = '';
    c.waseel.rejectionReasonText = '';
    c.status = fullApproval ? 'Approved' : 'Partially Approved';

    const note = fullApproval
      ? `Approved ${fmtQty(calc.requested)} ${c.target.unitType} (100% coverage).`
      : `Partially approved ${fmtQty(calc.covered)} ${c.target.unitType} (${fmtQty(calc.pct)}%). Client remaining ${fmtQty(calc.client)} ${c.target.unitType}.`;
    tl(c, bulkMode ? 'Bulk Decision' : 'Decision Recorded', note);
    return c;
  }

  function rej(id, rc, rt, bulkMode) {
    const c = find(id);
    if (!c) return null;
    c.waseel.decision = 'Rejected';
    c.waseel.approvedQty = null;
    c.waseel.responseAt = now();
    c.waseel.rejectionReasonCode = rc || 'Other';
    c.waseel.rejectionReasonText = (rt || '').trim();
    c.status = 'Rejected';
    tl(c, bulkMode ? 'Bulk Decision' : 'Decision Recorded', `Rejected: ${R[c.waseel.rejectionReasonCode] || c.waseel.rejectionReasonCode}`);
    return c;
  }

  function row(c, i) {
    const sendOnly = c.status === 'Approved';
    const actions = sendOnly
      ? `<button class="action-icon js-send" type="button" title="Send Decision" data-caseid="${esc(c.caseId)}"><i class="fi fi-rr-paper-plane"></i></button>`
      : `<button class="action-icon js-approve" type="button" title="Approve" data-caseid="${esc(c.caseId)}"><i class="fi fi-rr-check"></i></button><button class="action-icon danger js-reject" type="button" title="Reject" data-caseid="${esc(c.caseId)}"><i class="fi fi-rr-cross-small"></i></button><button class="action-icon js-send" type="button" title="Send Decision" data-caseid="${esc(c.caseId)}"><i class="fi fi-rr-paper-plane"></i></button>`;
    return `<tr><td class="col-check"><input class="row-check" type="checkbox" data-caseid="${esc(c.caseId)}" /></td><td class="col-seq">${i}</td><td>${esc(c.orderId)}</td><td><div class="service-name">${esc(c.patient.name)}</div><div class="service-main">${esc(c.patient.phone)}</div></td><td><div class="service-name">${esc(c.target.itemName)}</div><div class="service-main">${esc(c.target.itemCode)}</div></td><td>${esc(fmtQty(c.target.requestedQty))} ${esc(c.target.unitType)}</td><td>${sh(c.status)}</td><td>${esc(aq(c))}</td><td>${esc(d(c.updatedAt))}</td><td class="text-center"><div class="actions-cell">${actions}</div></td></tr>`;
  }

  function ids() {
    return [...E.tb.querySelectorAll('.row-check:checked')]
      .map(x => x.getAttribute('data-caseid') || '')
      .filter(Boolean);
  }

  function bulk() {
    const a = ids();
    if (E.bb) E.bb.classList.toggle('d-none', !a.length);
    if (E.bl) E.bl.textContent = `${a.length} selected`;
  }

  function head() {
    if (!E.all) return;
    const b = [...E.tb.querySelectorAll('.row-check')];
    if (!b.length) {
      E.all.checked = false;
      E.all.indeterminate = false;
      bulk();
      return;
    }
    const c = b.filter(x => x.checked).length;
    E.all.checked = c === b.length;
    E.all.indeterminate = c > 0 && c < b.length;
    bulk();
  }

  function sum() {
    const rows = P.filter(c => ins(c));
    const ok = rows.filter(c => c.status === 'Approved');
    const no = rows.filter(c => c.status !== 'Approved');
    if (E.sa) {
      E.sa.innerHTML = ok.length
        ? ok
            .map(c => `<tr><td>${esc(c.orderId)}</td><td>${esc(c.target.itemName)}<div class="service-main">${esc(c.target.itemCode)}</div></td><td>${esc(aq(c))}</td><td>${sh(c.status)}</td></tr>`)
            .join('')
        : '<tr><td colspan="4" class="text-center text-grey">No approved packages.</td></tr>';
    }
    if (E.sn) {
      E.sn.innerHTML = no.length
        ? no
            .map(
              c =>
                `<tr><td>${esc(c.orderId)}</td><td>${esc(c.target.itemName)}<div class="service-main">${esc(c.target.itemCode)}</div></td><td>${sh(c.status)}</td><td>${esc(
                  c.status === 'Rejected' ? R[c.waseel.rejectionReasonCode] || c.waseel.rejectionReasonCode || '-' : 'Not fully approved'
                )}</td></tr>`
            )
            .join('')
        : '<tr><td colspan="4" class="text-center text-grey">No non-approved packages.</td></tr>';
    }
  }

  function rnd() {
    const t = tp();
    if (pg > t) pg = t;
    if (pg < 1) pg = 1;
    const s = (pg - 1) * pp();
    const rows = F.slice(s, s + pp());
    E.tb.innerHTML = rows.length ? rows.map((r, i) => row(r, s + i + 1)).join('') : '<tr><td colspan="10" class="text-center text-grey">No package cases found.</td></tr>';
    if (E.ind) E.ind.textContent = `Page ${pg} of ${t}`;
    if (E.cur) E.cur.textContent = String(pg);
    const disabled = t === 1;
    if (E.f) E.f.disabled = disabled || pg === 1;
    if (E.p) E.p.disabled = disabled || pg === 1;
    if (E.n) E.n.disabled = disabled || pg === t;
    if (E.l) E.l.disabled = disabled || pg === t;
    head();
  }

  function apply(resetPage) {
    F = P.filter(c => ins(c) && mSearch(c) && mFilter(c));
    if (resetPage) pg = 1;
    sum();
    rnd();
  }

  function clear() {
    if (E.fs) E.fs.value = '';
    if (E.fc) E.fc.value = '';
    if (E.fp) E.fp.value = '';
    if (E.fcl) E.fcl.value = '';
    if (E.fm) E.fm.value = '';
  }

  function refreshApproveModalStats() {
    const c = find(cid);
    if (!c) return;

    let pct = clampPct(E.acp ? E.acp.value : 100);
    const full = !!(E.acf && E.acf.checked);
    if (full) pct = 100;
    if (E.acp) {
      E.acp.value = String(pct);
      E.acp.disabled = full;
    }

    const calc = calcCoverage(c.target.requestedQty, pct);
    if (E.arq) E.arq.textContent = `${fmtQty(calc.requested)} ${c.target.unitType}`;
    if (E.aco) E.aco.textContent = `${fmtQty(calc.covered)} ${c.target.unitType} (${fmtQty(calc.pct)}%)`;
  }

  function openA(id) {
    const c = find(id);
    if (!c || !AM) return;
    cid = id;

    if (E.am) E.am.textContent = `${c.target.itemName} (${fmtQty(c.target.requestedQty)} ${c.target.unitType})`;

    const rq = num(c.target.requestedQty) || 0;
    const ap = num(c.waseel.approvedQty);
    let pct = 100;
    if (rq > 0 && ap != null) {
      pct = clampPct((ap / rq) * 100);
    }

    if (E.acp) E.acp.value = String(pct);
    if (E.acf) E.acf.checked = pct >= 100;
    refreshApproveModalStats();
    AM.show();
  }

  function openD(id) {
    const c = find(id);
    if (!c || !M) return;
    cid = id;
    if (E.dm) E.dm.textContent = c.target.itemName;
    if (E.dt) E.dt.textContent = 'Reject Package';
    if (E.rw) E.rw.classList.remove('d-none');
    if (E.rr) E.rr.value = c.waseel.rejectionReasonCode || 'NotRegistered';
    if (E.rt) E.rt.value = c.waseel.rejectionReasonText || '';
    M.show();
  }

  function openBR() {
    const a = ids();
    if (!a.length || !BM) return;
    if (E.bm) E.bm.textContent = `${a.length} package(s) selected for rejection`;
    if (E.brr) E.brr.value = 'NotRegistered';
    if (E.brt) E.brt.value = '';
    BM.show();
  }

  function bApp() {
    const a = ids();
    if (!a.length) return;
    const c = [];
    a.forEach(id => {
      const x = appr(id, true, 100);
      if (x) c.push(x);
    });
    if (c.length) svMany(c);
  }

  function bSend() {
    const a = ids();
    if (!a.length) return;
    const c = [];
    a.forEach(id => {
      const x = find(id);
      if (!x) return;
      send(x, 'Bulk decision message sent to client.');
      c.push(x);
    });
    if (c.length) svMany(c);
  }

  if (E.qBtn) E.qBtn.addEventListener('click', () => apply(true));
  if (E.q) E.q.addEventListener('input', () => apply(true));
  if (E.rBtn)
    E.rBtn.addEventListener('click', () => {
      if (E.q) E.q.value = '';
      clear();
      apply(true);
    });
  if (E.fa)
    E.fa.addEventListener('click', () => {
      apply(true);
      bootstrap.Modal.getOrCreateInstance($('qd-filter-modal')).hide();
    });
  if (E.fz)
    E.fz.addEventListener('click', () => {
      clear();
      apply(true);
    });
  if (E.rows)
    E.rows.addEventListener('change', () => {
      pg = 1;
      rnd();
    });
  if (E.f)
    E.f.addEventListener('click', () => {
      pg = 1;
      rnd();
    });
  if (E.p)
    E.p.addEventListener('click', () => {
      pg = Math.max(1, pg - 1);
      rnd();
    });
  if (E.n)
    E.n.addEventListener('click', () => {
      pg = Math.min(tp(), pg + 1);
      rnd();
    });
  if (E.l)
    E.l.addEventListener('click', () => {
      pg = tp();
      rnd();
    });
  if (E.all)
    E.all.addEventListener('change', () => {
      [...E.tb.querySelectorAll('.row-check')].forEach(cb => {
        cb.checked = E.all.checked;
      });
      head();
    });

  E.tb.addEventListener('change', e => {
    const t = e.target;
    if (!(t instanceof HTMLInputElement)) return;
    if (t.classList.contains('row-check')) head();
  });

  E.tb.addEventListener('click', e => {
    const a = e.target.closest('.js-approve');
    if (a) {
      openA(a.getAttribute('data-caseid') || '');
      return;
    }
    const r = e.target.closest('.js-reject');
    if (r) {
      openD(r.getAttribute('data-caseid') || '');
      return;
    }
    const s = e.target.closest('.js-send');
    if (s) {
      const c = find(s.getAttribute('data-caseid') || '');
      if (!c) return;
      send(c, 'Decision message sent from row action.');
      sv(c);
    }
  });

  if (E.acp) E.acp.addEventListener('input', refreshApproveModalStats);
  if (E.acf)
    E.acf.addEventListener('change', () => {
      if (E.acf.checked && E.acp) E.acp.value = '100';
      refreshApproveModalStats();
    });
  if (E.acb)
    E.acb.addEventListener('click', () => {
      const c = find(cid);
      if (!c) return;
      let pct = clampPct(E.acp ? E.acp.value : 100);
      if (E.acf && E.acf.checked) pct = 100;
      if (pct <= 0) {
        alert('Coverage percentage must be greater than 0.');
        return;
      }
      const x = appr(c.caseId, false, pct);
      if (x) sv(x);
      if (AM) AM.hide();
    });

  if (E.ds)
    E.ds.addEventListener('click', () => {
      const c = find(cid);
      if (!c) return;
      const reason = E.rr ? E.rr.value : 'Other';
      if (!reason) {
        alert('Please select a rejection reason.');
        return;
      }
      const x = rej(c.caseId, reason, E.rt ? E.rt.value : '', false);
      if (x) sv(x);
      if (M) M.hide();
    });

  if (E.ba) E.ba.addEventListener('click', bApp);
  if (E.bs) E.bs.addEventListener('click', bSend);
  if (E.br) E.br.addEventListener('click', openBR);
  if (E.bc)
    E.bc.addEventListener('click', () => {
      const a = ids();
      if (!a.length) return;
      const rc = E.brr ? E.brr.value : 'Other';
      if (!rc) {
        alert('Please select a rejection reason.');
        return;
      }
      const rt = E.brt ? E.brt.value : '';
      const c = [];
      a.forEach(id => {
        const x = rej(id, rc, rt, true);
        if (x) c.push(x);
      });
      if (c.length) svMany(c);
      if (BM) BM.hide();
    });

  if (E.exp)
    E.exp.addEventListener('click', () => {
      const a = ids();
      const rows = a.length ? F.filter(c => a.includes(c.caseId)) : F;
      if (!rows.length) {
        alert('No package cases available to export.');
        return;
      }
      const csv = v => {
        const s = (v ?? '').toString().replace(/\r?\n/g, ' ').trim();
        return /[",]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const h = ['Order ID', 'Patient', 'Package', 'Package Code', 'Requested Qty', 'Status', 'Approved Qty', 'Last Update'];
      const lines = [h.map(csv).join(',')];
      rows.forEach(c => {
        lines.push([c.orderId, c.patient.name, c.target.itemName, c.target.itemCode, `${fmtQty(c.target.requestedQty)} ${c.target.unitType}`, c.status, aq(c), d(c.updatedAt)].map(csv).join(','));
      });
      const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const aEl = document.createElement('a');
      aEl.href = url;
      aEl.download = 'queue-details-packages.csv';
      document.body.appendChild(aEl);
      aEl.click();
      aEl.remove();
      URL.revokeObjectURL(url);
    });

  qry();
  A = load();
  derive();
  apply(true);
})();
