(function () {
  var moduleSelect = document.getElementById("moduleSelect");
  var eventSelect = document.getElementById("eventSelect");
  var groupedListEl = document.getElementById("groupedEventList");
  var channelTabsEl = document.getElementById("channelTabs");
  var localeTabsEl = document.getElementById("localeTabs");
  var subjectRowEl = document.getElementById("templateSubjectRow");
  var subjectEl = document.getElementById("templateSubject");
  var titleEl = document.getElementById("templateTitle");
  var bodyEl = document.getElementById("templateBody");
  var actionEl = document.getElementById("templateActionLabel");
  var placeholderListEl = document.getElementById("placeholderList");
  var unknownNoteEl = document.getElementById("unknownPlaceholderNote");
  var statusEl = document.getElementById("templateStatusNote");
  var editorEventTitleEl = document.getElementById("editorEventTitle");
  var backToRulesLinkEl = document.getElementById("backToRulesLink");

  var previewEls = {
    inAppTitle: document.getElementById("previewInAppTitle"),
    inAppBody: document.getElementById("previewInAppBody"),
    inAppAction: document.getElementById("previewInAppAction"),
    emailSubject: document.getElementById("previewEmailSubject"),
    emailTitle: document.getElementById("previewEmailTitle"),
    emailBody: document.getElementById("previewEmailBody"),
    emailAction: document.getElementById("previewEmailAction")
  };

  if (!moduleSelect || !groupedListEl || !channelTabsEl || !localeTabsEl || !titleEl || !bodyEl || !actionEl) {
    return;
  }

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

  var modules = window.NK_NOTIFICATION_MODULES || ["Providers", "Orders", "Staff", "Integrations"];
  var moduleEventMap = window.NK_NOTIFICATION_MODULE_EVENT_MAP || {};
  var eventMeta = window.NK_NOTIFICATION_EVENT_META || {};
  var templateDefaults = window.NK_NOTIFICATION_TEMPLATE_DEFAULTS || {};

  var getTemplate = window.nkGetTemplate || function () { return null; };
  var setTemplate = window.nkSetTemplate || function () { return { ok: false, error: "Template API unavailable." }; };
  var resetTemplate = window.nkResetTemplate || function () { return false; };
  var renderTemplate = window.nkRenderTemplate || function (tpl) { return tpl || {}; };
  var unknownPlaceholders = window.nkCollectUnknownPlaceholders || function () { return []; };

  var query = new URLSearchParams(window.location.search || "");
  var initialModule = query.get("module");
  var initialEvent = query.get("event");

  var state = {
    module: modules.indexOf(initialModule) !== -1 ? initialModule : modules[0],
    event: "",
    channel: "in_app",
    locale: "en",
    focusedField: bodyEl
  };

  function moduleEvents(moduleKey) {
    return Array.isArray(moduleEventMap[moduleKey]) ? moduleEventMap[moduleKey] : [];
  }

  function safeText(value) {
    return String(value == null ? "" : value);
  }

  function showStatus(message, type) {
    if (!statusEl) return;
    statusEl.className = "status-note show status-" + (type || "success");
    statusEl.textContent = message;
  }

  function hideStatus() {
    if (!statusEl) return;
    statusEl.className = "status-note";
    statusEl.textContent = "";
  }

  function updateUrlAndBackLink() {
    var params = new URLSearchParams();
    params.set("module", state.module);
    if (state.event) params.set("event", state.event);

    var nextUrl = window.location.pathname + "?" + params.toString();
    window.history.replaceState({}, "", nextUrl);

    if (backToRulesLinkEl) {
      backToRulesLinkEl.setAttribute("href", "./Notifications.html?" + params.toString());
    }
  }

  function sampleData() {
    return {
      provider_name: "Al Noor Medical Complex",
      due_date: "2026-04-20",
      module_name: state.module,
      order_id: "OD-120034",
      elapsed_minutes: "90",
      queue_count: "8",
      shift_name: "Evening Triage Shift",
      webhook_name: "Payment Callback"
    };
  }

  function getActiveEventPlaceholders() {
    var defaults = templateDefaults[state.event];
    if (!defaults || !Array.isArray(defaults.placeholders)) return [];
    return defaults.placeholders.slice();
  }

  function setChannelTabStyles() {
    channelTabsEl.querySelectorAll(".segment-tab[data-channel]").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-channel") === state.channel);
    });

    if (subjectRowEl) {
      subjectRowEl.style.display = state.channel === "email" ? "block" : "none";
    }
  }

  function setLocaleTabStyles() {
    localeTabsEl.querySelectorAll(".segment-tab[data-locale]").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-locale") === state.locale);
    });
  }

  function renderModuleSelect() {
    moduleSelect.innerHTML = modules.map(function (moduleKey) {
      return '<option value="' + moduleKey + '" ' + (moduleKey === state.module ? "selected" : "") + '>' + moduleKey + '</option>';
    }).join("");
  }

  function renderEventSelect() {
    if (!eventSelect) return;

    var events = moduleEvents(state.module);
    if (!events.length) {
      eventSelect.innerHTML = '<option value="">No events</option>';
      state.event = "";
      return;
    }

    if (!state.event || events.indexOf(state.event) === -1) {
      if (initialEvent && events.indexOf(initialEvent) !== -1) {
        state.event = initialEvent;
        initialEvent = "";
      } else {
        state.event = events[0];
      }
    }

    eventSelect.innerHTML = events.map(function (eventKey) {
      var meta = eventMeta[eventKey] || {};
      var label = meta.label || eventKey;
      return '<option value="' + eventKey + '" ' + (eventKey === state.event ? "selected" : "") + '>' + label + '</option>';
    }).join("");
  }

  function renderGroupedEvents() {
    groupedListEl.innerHTML = modules.map(function (moduleKey) {
      var items = moduleEvents(moduleKey).map(function (eventKey) {
        var meta = eventMeta[eventKey] || {};
        var label = meta.label || eventKey;
        var activeClass = moduleKey === state.module && eventKey === state.event ? "active" : "";
        return '<button type="button" class="event-item ' + activeClass + '" data-module="' + moduleKey + '" data-event="' + eventKey + '">' + label + '</button>';
      }).join("");

      return '<section class="event-group"><h6 class="event-group-title">' + moduleKey + '</h6>' + items + '</section>';
    }).join("");
  }

  function getCurrentDraftTemplate() {
    var draft = {
      title: safeText(titleEl.value).trim(),
      body: safeText(bodyEl.value).trim(),
      actionLabel: safeText(actionEl.value).trim()
    };

    if (state.channel === "email") {
      draft.subject = safeText(subjectEl.value).trim();
    }

    return draft;
  }

  function loadFormFromStorage() {
    if (!state.event) return;

    var tpl = getTemplate(state.event, state.channel, state.locale) || {};
    if (subjectEl) subjectEl.value = safeText(tpl.subject);
    titleEl.value = safeText(tpl.title);
    bodyEl.value = safeText(tpl.body);
    actionEl.value = safeText(tpl.actionLabel);

    setChannelTabStyles();
    setLocaleTabStyles();

    var meta = eventMeta[state.event] || {};
    if (editorEventTitleEl) {
      editorEventTitleEl.textContent = (meta.label || state.event) + " Template";
    }
  }

  function renderPlaceholderButtons() {
    var placeholders = getActiveEventPlaceholders();
    if (!placeholders.length) {
      placeholderListEl.innerHTML = '<span class="text-grey fsize-12">No placeholders configured.</span>';
      return;
    }

    placeholderListEl.innerHTML = placeholders.map(function (key) {
      return '<button type="button" class="placeholder-btn" data-token="{' + key + '}">{' + key + '}</button>';
    }).join("");
  }

  function renderPreview() {
    if (!state.event) return;

    var previewContext = sampleData();
    var inAppTemplate = getTemplate(state.event, "in_app", state.locale) || { title: "", body: "", actionLabel: "" };
    var emailTemplate = getTemplate(state.event, "email", state.locale) || { subject: "", title: "", body: "", actionLabel: "" };

    var draft = getCurrentDraftTemplate();
    if (state.channel === "in_app") {
      inAppTemplate = {
        title: draft.title,
        body: draft.body,
        actionLabel: draft.actionLabel
      };
    } else {
      emailTemplate = {
        subject: draft.subject,
        title: draft.title,
        body: draft.body,
        actionLabel: draft.actionLabel
      };
    }

    var renderedInApp = renderTemplate(inAppTemplate, previewContext);
    var renderedEmail = renderTemplate(emailTemplate, previewContext);

    if (previewEls.inAppTitle) previewEls.inAppTitle.textContent = safeText(renderedInApp.title) || "-";
    if (previewEls.inAppBody) previewEls.inAppBody.textContent = safeText(renderedInApp.body) || "-";
    if (previewEls.inAppAction) previewEls.inAppAction.textContent = safeText(renderedInApp.actionLabel) || "-";

    if (previewEls.emailSubject) previewEls.emailSubject.textContent = safeText(renderedEmail.subject) || "-";
    if (previewEls.emailTitle) previewEls.emailTitle.textContent = safeText(renderedEmail.title) || "-";
    if (previewEls.emailBody) previewEls.emailBody.textContent = safeText(renderedEmail.body) || "-";
    if (previewEls.emailAction) previewEls.emailAction.textContent = safeText(renderedEmail.actionLabel) || "-";

    var activeTemplateForWarning = state.channel === "in_app"
      ? { title: draft.title, body: draft.body, actionLabel: draft.actionLabel }
      : { subject: draft.subject, title: draft.title, body: draft.body, actionLabel: draft.actionLabel };

    var unknown = unknownPlaceholders(activeTemplateForWarning, previewContext);
    if (unknownNoteEl) {
      if (unknown.length) {
        unknownNoteEl.className = "warn-note show";
        unknownNoteEl.textContent = "Unknown placeholders: " + unknown.join(", ") + ". They will stay unchanged in output.";
      } else {
        unknownNoteEl.className = "warn-note";
        unknownNoteEl.textContent = "";
      }
    }
  }

  function saveCurrentTemplate() {
    if (!state.event) return;

    var payload = getCurrentDraftTemplate();
    var result = setTemplate(state.event, state.channel, state.locale, payload);

    if (!result || !result.ok) {
      showStatus(result && result.error ? result.error : "Template could not be saved.", "error");
      return;
    }

    showStatus("Template saved.", "success");
    renderPreview();
  }

  function insertTokenIntoFocusedField(token) {
    var target = state.focusedField && typeof state.focusedField.value === "string" ? state.focusedField : bodyEl;
    if (!target) return;

    var start = typeof target.selectionStart === "number" ? target.selectionStart : target.value.length;
    var end = typeof target.selectionEnd === "number" ? target.selectionEnd : target.value.length;
    var currentValue = target.value || "";

    target.value = currentValue.slice(0, start) + token + currentValue.slice(end);

    var cursor = start + token.length;
    if (typeof target.setSelectionRange === "function") {
      target.setSelectionRange(cursor, cursor);
    }
    target.focus();

    renderPreview();
  }

  function attachFieldFocusTracking() {
    [subjectEl, titleEl, bodyEl, actionEl].forEach(function (el) {
      if (!el) return;
      el.addEventListener("focus", function () {
        state.focusedField = el;
      });

      el.addEventListener("input", function () {
        hideStatus();
        renderPreview();
      });
    });
  }

  function syncAllViews() {
    renderModuleSelect();
    renderEventSelect();
    renderGroupedEvents();
    loadFormFromStorage();
    renderPlaceholderButtons();
    renderPreview();
    updateUrlAndBackLink();
  }

  moduleSelect.addEventListener("change", function () {
    state.module = moduleSelect.value;
    state.event = "";
    hideStatus();
    syncAllViews();
  });

  if (eventSelect) {
    eventSelect.addEventListener("change", function () {
      state.event = eventSelect.value;
      hideStatus();
      syncAllViews();
    });
  }

  groupedListEl.addEventListener("click", function (event) {
    var button = event.target.closest(".event-item");
    if (!button) return;

    var moduleKey = button.getAttribute("data-module");
    var eventKey = button.getAttribute("data-event");
    if (!moduleKey || !eventKey) return;

    state.module = moduleKey;
    state.event = eventKey;
    hideStatus();
    syncAllViews();
  });

  channelTabsEl.addEventListener("click", function (event) {
    var button = event.target.closest(".segment-tab[data-channel]");
    if (!button) return;

    var channel = button.getAttribute("data-channel");
    if (!channel || channel === state.channel) return;

    state.channel = channel;
    hideStatus();
    loadFormFromStorage();
    renderPreview();
    updateUrlAndBackLink();
  });

  localeTabsEl.addEventListener("click", function (event) {
    var button = event.target.closest(".segment-tab[data-locale]");
    if (!button) return;

    var locale = button.getAttribute("data-locale");
    if (!locale || locale === state.locale) return;

    state.locale = locale;
    hideStatus();
    loadFormFromStorage();
    renderPreview();
  });

  placeholderListEl.addEventListener("click", function (event) {
    var button = event.target.closest(".placeholder-btn");
    if (!button) return;

    var token = button.getAttribute("data-token");
    if (!token) return;
    insertTokenIntoFocusedField(token);
  });

  var saveBtn = document.getElementById("btnSaveTemplate");
  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      saveCurrentTemplate();
    });
  }

  var resetBtn = document.getElementById("btnResetTemplate");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      if (!state.event) return;
      var ok = resetTemplate(state.event, state.channel, state.locale);
      if (!ok) {
        showStatus("Could not reset this template.", "error");
        return;
      }
      showStatus("Template reset to defaults.", "success");
      loadFormFromStorage();
      renderPreview();
    });
  }

  attachFieldFocusTracking();

  if (moduleEvents(state.module).indexOf(initialEvent) !== -1) {
    state.event = initialEvent;
  }

  syncAllViews();
})();

