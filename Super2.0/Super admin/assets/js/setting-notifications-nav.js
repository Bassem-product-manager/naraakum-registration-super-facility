(function () {
  var searchEl = document.getElementById("notifSearchInput");
  var moduleEl = document.getElementById("scopeFilter");
  var statusEl = document.getElementById("statusFilter");
  var listEl = document.getElementById("notificationsList");
  var detailsEl = document.getElementById("notificationDetails");

  if (!searchEl || !moduleEl || !statusEl || !listEl || !detailsEl) return;

  function tickKsaClock() {
    var el = document.getElementById("ksaTime");
    if (!el) return;

    function tick() {
      try {
        var fmt = new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Riyadh",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        });
        el.textContent = fmt.format(new Date());
      } catch (err) {
        el.textContent = new Date().toLocaleTimeString("en-US", { hour12: true });
      }
    }

    tick();
    setInterval(tick, 1000);
  }

  tickKsaClock();

  var eventMeta = window.NK_NOTIFICATION_EVENT_META || {};
  var loadRules = window.nkLoadRulesFromStorage || function () {
    return window.NK_NOTIFICATION_DEFAULT_RULES || { modules: {} };
  };
  var resolveRule = window.nkResolveNotificationRule || function (rules, moduleKey, eventKey) {
    return rules && rules.modules && rules.modules[moduleKey] ? rules.modules[moduleKey][eventKey] : null;
  };
  var ruleToMinutes = window.nkRuleToMinutes || function (value, unit) {
    var n = Number(value || 0);
    if (unit === "days") return n * 1440;
    if (unit === "hours") return n * 60;
    return n;
  };
  var ruleLeadDays = window.nkRuleLeadDays || function (rule) {
    if (!rule) return 0;
    return Number(rule.leadValue || 0);
  };
  var humanRuleText = window.nkHumanRuleText || function () { return ""; };
  var humanRepeatText = window.nkHumanRepeatText || function () { return ""; };
  var getTemplate = window.nkGetTemplate || function () { return null; };
  var renderTemplate = window.nkRenderTemplate || function (tpl) { return tpl || {}; };

  var rulesStore = loadRules();

  function isoDaysFromNow(days) {
    var d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString();
  }

  function isoHoursAgo(hours) {
    return new Date(Date.now() - hours * 3600000).toISOString();
  }

  function previewText(message) {
    var txt = String(message == null ? "" : message).trim();
    if (!txt) return "-";
    return txt.length > 90 ? txt.slice(0, 90) + "..." : txt;
  }

  function buildTemplateData(seed) {
    return {
      provider_name: seed.entity,
      due_date: seed.dueDate ? new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "2-digit" }).format(new Date(seed.dueDate)) : "N/A",
      module_name: seed.module,
      order_id: seed.referenceId || "N/A",
      elapsed_minutes: String(seed.elapsedMinutes || 0),
      queue_count: String(seed.queueCount || 0),
      shift_name: seed.shiftName || seed.entity || "N/A",
      webhook_name: seed.webhookName || seed.entity || "N/A"
    };
  }

  var seedEvents = [
    {
      id: "N-1001",
      eventKey: "provider_license_expiry",
      module: "Providers",
      scope: "Facility",
      entity: "Al Noor Medical Complex",
      severity: "Warning",
      dueDate: isoDaysFromNow(18),
      createdAt: isoHoursAgo(2),
      status: "Unread",
      referenceId: "FAC-2201",
      relatedHref: "../providers/facilities.html"
    },
    {
      id: "N-1002",
      eventKey: "provider_insurance_expiry",
      module: "Providers",
      scope: "Individuals",
      entity: "Dr. Ahmed Al Harbi",
      severity: "Critical",
      dueDate: isoDaysFromNow(6),
      createdAt: isoHoursAgo(4),
      status: "Unread",
      referenceId: "IND-1180",
      relatedHref: "../providers/Individuals.html"
    },
    {
      id: "N-1003",
      eventKey: "accreditation_cbahi_expiry",
      module: "Providers",
      scope: "Facility",
      entity: "Al Noor Medical Complex",
      severity: "Info",
      dueDate: isoDaysFromNow(58),
      createdAt: isoHoursAgo(12),
      status: "Read",
      referenceId: "CBAHI-910",
      relatedHref: "../providers/facility-details.html"
    },
    {
      id: "N-1004",
      eventKey: "accreditation_jci_expiry",
      module: "Providers",
      scope: "Facility",
      entity: "Future Care Hospital",
      severity: "Warning",
      dueDate: isoDaysFromNow(30),
      createdAt: isoHoursAgo(8),
      status: "Unread",
      referenceId: "JCI-422",
      relatedHref: "../providers/facilities.html"
    },
    {
      id: "N-1005",
      eventKey: "order_stuck",
      module: "Orders",
      scope: "Pharmacy",
      entity: "Central Pharmacy - Riyadh",
      severity: "Warning",
      elapsedMinutes: 110,
      dueDate: isoDaysFromNow(1),
      createdAt: isoHoursAgo(3),
      status: "Unread",
      referenceId: "OD-120034",
      relatedHref: "../Order-Managment/order-details-pharmacy.html"
    },
    {
      id: "N-1006",
      eventKey: "sla_breached",
      module: "Orders",
      scope: "Facility",
      entity: "Al Noor Medical Complex",
      severity: "Critical",
      elapsedMinutes: 160,
      dueDate: isoDaysFromNow(1),
      createdAt: isoHoursAgo(5),
      status: "Unread",
      referenceId: "SLA-99104",
      relatedHref: "../Order-Managment/order-details-facility.html"
    },
    {
      id: "N-1007",
      eventKey: "staff_unread_queue",
      module: "Staff",
      scope: "Staff",
      entity: "Operations Team Inbox",
      severity: "Warning",
      elapsedMinutes: 95,
      queueCount: 8,
      createdAt: isoHoursAgo(2),
      status: "Unread",
      referenceId: "MSG-OPS-18",
      relatedHref: "../Massages/Staff-massages.html"
    },
    {
      id: "N-1008",
      eventKey: "staff_shift_gap",
      module: "Staff",
      scope: "Staff",
      entity: "Evening Triage Shift",
      severity: "Critical",
      elapsedMinutes: 240,
      shiftName: "Evening Triage Shift",
      createdAt: isoHoursAgo(6),
      status: "Unread",
      referenceId: "SHIFT-TR-77",
      relatedHref: "../Massages/Staff-massages.html"
    },
    {
      id: "N-1009",
      eventKey: "webhook_failure",
      module: "Integrations",
      scope: "Integrations",
      entity: "Payment Provider Webhook",
      severity: "Critical",
      elapsedMinutes: 28,
      webhookName: "Payment Callback",
      createdAt: isoHoursAgo(1),
      status: "Unread",
      referenceId: "WH-77821",
      relatedHref: "../Setting/payment_methods.html"
    },
    {
      id: "N-1010",
      eventKey: "webhook_signature_mismatch",
      module: "Integrations",
      scope: "Integrations",
      entity: "Payment Signature Validator",
      severity: "Warning",
      elapsedMinutes: 15,
      webhookName: "Payment Signature Validator",
      createdAt: isoHoursAgo(10),
      status: "Read",
      referenceId: "WH-77410",
      relatedHref: "../Setting/payment_methods.html"
    },
    {
      id: "N-1011",
      eventKey: "order_stuck",
      module: "Orders",
      scope: "Facility",
      entity: "City Care Facility",
      severity: "Warning",
      elapsedMinutes: 135,
      createdAt: isoHoursAgo(11),
      status: "Read",
      referenceId: "OD-120046",
      relatedHref: "../Order-Managment/facility-order-details.html"
    },
    {
      id: "N-1012",
      eventKey: "provider_insurance_expiry",
      module: "Providers",
      scope: "Pharmacy",
      entity: "Al Noor Insurance",
      severity: "Info",
      dueDate: isoDaysFromNow(44),
      createdAt: isoHoursAgo(16),
      status: "Read",
      referenceId: "INS-0041",
      relatedHref: "../providers/insurances.html"
    }
  ];

  function shouldTrigger(seed, resolvedRule) {
    if (!resolvedRule || !resolvedRule.enabled) return false;

    var meta = eventMeta[seed.eventKey] || {};

    if (meta.mode === "deadline") {
      if (!seed.dueDate) return false;
      var due = new Date(seed.dueDate);
      if (Number.isNaN(due.getTime())) return false;
      var daysToDue = (due.getTime() - Date.now()) / 86400000;
      return daysToDue <= ruleLeadDays(resolvedRule);
    }

    var elapsed = Number(seed.elapsedMinutes || 0);
    return elapsed >= ruleToMinutes(resolvedRule.leadValue, resolvedRule.leadUnit);
  }

  function buildNotificationsFromRules() {
    return seedEvents
      .filter(function (seed) {
        var rule = resolveRule(rulesStore, seed.module, seed.eventKey);
        return shouldTrigger(seed, rule);
      })
      .map(function (seed) {
        var meta = eventMeta[seed.eventKey] || {};
        var rule = resolveRule(rulesStore, seed.module, seed.eventKey);

        var data = buildTemplateData(seed);
        var inAppTemplate = getTemplate(seed.eventKey, "in_app", "en") || { title: "", body: "", actionLabel: "" };
        var renderedInApp = renderTemplate(inAppTemplate, data);

        var title = renderedInApp.title || (meta.label || seed.eventKey);
        var message = renderedInApp.body || "Notification triggered by configured rule.";
        var actionLabel = renderedInApp.actionLabel || "Open related page";

        return {
          id: seed.id,
          eventKey: seed.eventKey,
          module: seed.module,
          scope: seed.scope,
          entity: seed.entity,
          severity: seed.severity,
          title: title,
          preview: previewText(message),
          message: message,
          status: seed.status,
          createdAt: seed.createdAt,
          dueDate: seed.dueDate || null,
          referenceId: seed.referenceId || null,
          relatedHref: seed.relatedHref || "#",
          actionLabel: actionLabel,
          ruleText: humanRuleText(rule, meta),
          repeatText: humanRepeatText(rule),
          meaning: meta.meaning || "",
          actionHint: meta.actionHint || ""
        };
      })
      .sort(function (a, b) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  var state = {
    notifications: buildNotificationsFromRules(),
    selectedId: null,
    filters: {
      search: "",
      module: "All",
      status: "All"
    }
  };

  var summaryEls = {
    total: document.getElementById("summaryTotal"),
    unread: document.getElementById("summaryUnread"),
    critical: document.getElementById("summaryCritical"),
    dueSoon: document.getElementById("summaryDueSoon")
  };

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function fmtDateTime(value) {
    if (!value) return "N/A";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  }

  function fmtDate(value) {
    if (!value) return "N/A";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit"
    }).format(date);
  }

  function severityClass(severity) {
    if (severity === "Critical") return "sev-critical";
    if (severity === "Warning") return "sev-warning";
    return "sev-info";
  }

  function getById(id) {
    return state.notifications.find(function (item) {
      return item.id === id;
    }) || null;
  }

  function getVisible() {
    var query = state.filters.search.trim().toLowerCase();

    return state.notifications.filter(function (item) {
      if (state.filters.module !== "All" && item.module !== state.filters.module) return false;
      if (state.filters.status !== "All" && item.status !== state.filters.status) return false;

      if (query) {
        var searchable = [item.title, item.entity, item.referenceId, item.module, item.scope]
          .join(" ")
          .toLowerCase();
        if (searchable.indexOf(query) === -1) return false;
      }

      return true;
    });
  }

  function renderSummary(visible) {
    var now = new Date();
    var limit = new Date();
    limit.setDate(limit.getDate() + 30);

    var unread = 0;
    var critical = 0;
    var dueSoon = 0;

    visible.forEach(function (item) {
      if (item.status === "Unread") unread += 1;
      if (item.severity === "Critical") critical += 1;

      if (item.dueDate && item.status !== "Resolved") {
        var due = new Date(item.dueDate);
        if (!Number.isNaN(due.getTime()) && due >= now && due <= limit) dueSoon += 1;
      }
    });

    if (summaryEls.total) summaryEls.total.textContent = String(visible.length);
    if (summaryEls.unread) summaryEls.unread.textContent = String(unread);
    if (summaryEls.critical) summaryEls.critical.textContent = String(critical);
    if (summaryEls.dueSoon) summaryEls.dueSoon.textContent = String(dueSoon);
  }

  function renderList(visible) {
    if (!visible.length) {
      listEl.innerHTML = '<div class="empty-list">No alerts match the current filters or rule states.</div>';
      return;
    }

    listEl.innerHTML = visible.map(function (item) {
      var selected = item.id === state.selectedId ? "is-selected" : "";
      var unread = item.status === "Unread" ? "is-unread" : "";

      return [
        '<button type="button" class="notif-item ' + selected + ' ' + unread + '" data-id="' + esc(item.id) + '">',
        '<div class="notif-top"><span class="sev ' + severityClass(item.severity) + '">' + esc(item.severity) + '</span>' + (item.status === "Unread" ? '<span class="status-dot" aria-hidden="true"></span>' : "") + '</div>',
        '<p class="notif-title">' + esc(item.title) + '</p>',
        '<p class="notif-preview">' + esc(item.preview) + '</p>',
        '<div class="notif-meta">' + esc(item.module) + ' | ' + esc(item.scope) + ' | ' + esc(fmtDateTime(item.createdAt)) + '</div>',
        "</button>"
      ].join("");
    }).join("");
  }

  function renderDetails(item) {
    if (!item) {
      detailsEl.innerHTML = '<div class="details-empty">Select an alert to view details.</div>';
      return;
    }

    var readToggleLabel = item.status === "Unread" ? "Mark as read" : "Mark unread";
    var readToggleAction = item.status === "Unread" ? "mark-read" : "mark-unread";

    detailsEl.innerHTML = [
      '<div class="notif-top"><h4 class="details-title">' + esc(item.title) + '</h4><span class="sev ' + severityClass(item.severity) + '">' + esc(item.severity) + '</span></div>',
      '<p class="details-message">' + esc(item.message) + '</p>',
      '<div class="details-grid">',
      '<div class="field"><span class="label">Module</span><span class="value">' + esc(item.module) + '</span></div>',
      '<div class="field"><span class="label">Scope</span><span class="value">' + esc(item.scope) + '</span></div>',
      '<div class="field"><span class="label">Entity</span><span class="value">' + esc(item.entity) + '</span></div>',
      '<div class="field"><span class="label">Status</span><span class="value">' + esc(item.status) + '</span></div>',
      '<div class="field"><span class="label">Due date</span><span class="value">' + esc(fmtDate(item.dueDate)) + '</span></div>',
      '<div class="field"><span class="label">Reference ID</span><span class="value">' + esc(item.referenceId || "N/A") + '</span></div>',
      '<div class="field"><span class="label">Created</span><span class="value">' + esc(fmtDateTime(item.createdAt)) + '</span></div>',
      '</div>',
      '<div class="explain">',
      '<p>Why this alert fired: ' + esc(item.ruleText) + '.</p>',
      '<p>Repeat policy: ' + esc(item.repeatText) + '.</p>',
      '<p>Business meaning: ' + esc(item.meaning || "N/A") + '.</p>',
      '<p>Action: ' + esc(item.actionHint || "N/A") + '.</p>',
      '</div>',
      '<div class="details-actions">',
      '<button type="button" class="nk-btn nk-btn-outline" data-action="' + esc(readToggleAction) + '">' + esc(readToggleLabel) + '</button>',
      '<button type="button" class="nk-btn nk-btn-solid" data-action="resolve" ' + (item.status === "Resolved" ? "disabled" : "") + '>Resolve</button>',
      '<a class="inline-link" href="' + esc(item.relatedHref || "#") + '">' + esc(item.actionLabel || "Open related page") + '</a>',
      '</div>'
    ].join("");
  }

  function render() {
    var visible = getVisible();

    if (state.selectedId && !visible.some(function (item) { return item.id === state.selectedId; })) {
      state.selectedId = visible.length ? visible[0].id : null;
    }
    if (!state.selectedId && visible.length) {
      state.selectedId = visible[0].id;
    }

    renderSummary(visible);
    renderList(visible);
    renderDetails(state.selectedId ? getById(state.selectedId) : null);

    var markAllBtn = document.getElementById("btnMarkAllRead");
    if (markAllBtn) {
      markAllBtn.disabled = !visible.some(function (item) { return item.status === "Unread"; });
    }
  }

  searchEl.addEventListener("input", function (event) {
    state.filters.search = event.target.value || "";
    render();
  });

  moduleEl.addEventListener("change", function (event) {
    state.filters.module = event.target.value || "All";
    render();
  });

  statusEl.addEventListener("change", function (event) {
    state.filters.status = event.target.value || "All";
    render();
  });

  var markAllBtn = document.getElementById("btnMarkAllRead");
  if (markAllBtn) {
    markAllBtn.addEventListener("click", function () {
      getVisible().forEach(function (item) {
        if (item.status === "Unread") item.status = "Read";
      });
      render();
    });
  }

  var exportBtn = document.getElementById("btnExportNotifications");
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      var rows = getVisible();
      var cols = ["id", "module", "scope", "title", "severity", "status", "entity", "referenceId", "createdAt", "dueDate"];

      function csvCell(value) {
        var text = String(value == null ? "" : value);
        if (text.indexOf('"') !== -1) text = text.replace(/\"/g, '""');
        if (/[\n\r,]/.test(text)) text = '"' + text + '"';
        return text;
      }

      var csv = [cols.join(",")].concat(
        rows.map(function (row) {
          return cols.map(function (col) { return csvCell(row[col]); }).join(",");
        })
      ).join("\r\n");

      var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = "notifications-export.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  listEl.addEventListener("click", function (event) {
    var itemEl = event.target.closest(".notif-item");
    if (!itemEl) return;

    var id = itemEl.getAttribute("data-id");
    if (!id) return;

    state.selectedId = id;

    var selected = getById(id);
    if (selected && selected.status === "Unread") {
      selected.status = "Read";
    }

    render();
  });

  detailsEl.addEventListener("click", function (event) {
    var actionEl = event.target.closest("[data-action]");
    if (!actionEl || !state.selectedId) return;

    var item = getById(state.selectedId);
    if (!item) return;

    var action = actionEl.getAttribute("data-action");

    if (action === "mark-read") {
      item.status = "Read";
      render();
      return;
    }

    if (action === "mark-unread") {
      item.status = "Unread";
      render();
      return;
    }

    if (action === "resolve") {
      item.status = "Resolved";
      render();
    }
  });

  render();
})();

