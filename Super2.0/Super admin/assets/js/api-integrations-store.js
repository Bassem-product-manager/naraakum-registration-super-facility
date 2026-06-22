(function () {
  var STORAGE_KEY = "nk_api_integrations";
  var memoryStore = null;

  var DEFAULT_INTEGRATIONS = [
    {
      id: "PROV-001",
      name: "Aramex Connect",
      code: "ARMX-SHP",
      type: "Shipping",
      baseUrl: "https://api.aramex.example/v2",
      authMethod: "OAuth2",
      environment: "Production",
      status: "Active",
      description: "Regional shipping connector for outbound and reverse deliveries.",
      credentials: {
        clientId: "armx-client-prod",
        clientSecret: "armx-secret-prod-39A1",
        apiKey: "",
        token: "armx-token-987654",
        username: "",
        password: "",
        tokenExpiry: "2026-12-31 23:59 UTC"
      },
      allowedIps: ["18.212.10.4", "52.31.88.19"],
      webhookUrl: "https://admin.naraakum.com/hooks/provider/prov-001",
      capabilities: ["Create Shipment", "Track Shipment", "Cancel Shipment", "Create Return", "Get Label", "Estimate Cost"],
      events: [
        { name: "shipment.created", enabled: true, notes: "Triggered after shipment booking." },
        { name: "shipment.updated", enabled: true, notes: "Triggered on status transitions." },
        { name: "shipment.cancelled", enabled: false, notes: "Disabled for staged workflow." }
      ],
      logs: [
        { at: "2026-02-16 14:22", endpoint: "/shipments/create", result: "Success", message: "Shipment ARX-8821 accepted." },
        { at: "2026-02-16 12:09", endpoint: "/shipments/track", result: "Success", message: "Live status retrieved." },
        { at: "2026-02-15 18:44", endpoint: "/shipments/cancel", result: "Error", message: "Cancellation window expired." }
      ]
    },
    {
      id: "PROV-002",
      name: "PayTabs Gateway",
      code: "PAYT-PMT",
      type: "Payments",
      baseUrl: "https://api.paytabs.example/v1",
      authMethod: "API Key",
      environment: "Production",
      status: "Active",
      description: "Primary payment orchestration for card and wallet transactions.",
      credentials: {
        clientId: "",
        clientSecret: "",
        apiKey: "paytabs-live-key-7781",
        token: "",
        username: "",
        password: "",
        tokenExpiry: ""
      },
      allowedIps: ["13.48.201.76"],
      webhookUrl: "https://admin.naraakum.com/hooks/provider/prov-002",
      capabilities: ["Create Invoice", "Capture Payment", "Void Transaction", "Refund Payment", "Tokenize Card", "Check Balance"],
      events: [
        { name: "invoice.created", enabled: true, notes: "Sent when an invoice is generated." },
        { name: "payment.succeeded", enabled: true, notes: "Captured payments only." },
        { name: "payment.refunded", enabled: true, notes: "Sent on full and partial refunds." }
      ],
      logs: [
        { at: "2026-02-16 15:33", endpoint: "/payments/capture", result: "Success", message: "Transaction PTX-20318 captured." },
        { at: "2026-02-16 10:11", endpoint: "/payments/refund", result: "Success", message: "Refund queued for settlement." },
        { at: "2026-02-15 09:52", endpoint: "/invoices/create", result: "Success", message: "Invoice INV-77190 created." }
      ]
    },
    {
      id: "PROV-003",
      name: "Twilio Messaging Hub",
      code: "TWIL-MSG",
      type: "Messaging",
      baseUrl: "https://api.twilio.example/2010-04-01",
      authMethod: "Token",
      environment: "Sandbox",
      status: "Inactive",
      description: "Messaging stack for SMS notifications and OTP verification.",
      credentials: {
        clientId: "",
        clientSecret: "",
        apiKey: "",
        token: "twilio-sandbox-token-4385",
        username: "",
        password: "",
        tokenExpiry: "2026-11-10 08:00 UTC"
      },
      allowedIps: ["34.120.55.110", "34.120.55.111"],
      webhookUrl: "https://admin.naraakum.com/hooks/provider/prov-003",
      capabilities: ["Send SMS", "Verify OTP", "Resend OTP", "Template Messaging", "Delivery Reports", "Short URL Tracking"],
      events: [
        { name: "message.sent", enabled: true, notes: "Outgoing SMS event." },
        { name: "otp.verified", enabled: true, notes: "OTP verification callback." },
        { name: "message.failed", enabled: true, notes: "Failure reason included." }
      ],
      logs: [
        { at: "2026-02-14 21:17", endpoint: "/sms/send", result: "Success", message: "Message accepted by carrier queue." },
        { at: "2026-02-14 21:01", endpoint: "/otp/verify", result: "Error", message: "OTP code expired." },
        { at: "2026-02-14 20:48", endpoint: "/otp/send", result: "Success", message: "OTP sent to +9665xxxxxxx." }
      ]
    },
    {
      id: "PROV-004",
      name: "LabWare Bridge",
      code: "LABW-LAB",
      type: "Lab",
      baseUrl: "https://api.labware.example/core",
      authMethod: "Basic",
      environment: "Production",
      status: "Inactive",
      description: "Integration layer for lab orders, specimen tracking, and result retrieval.",
      credentials: {
        clientId: "",
        clientSecret: "",
        apiKey: "",
        token: "",
        username: "labware_admin",
        password: "labware-pass-2026",
        tokenExpiry: ""
      },
      allowedIps: ["44.203.92.14", "44.203.92.15"],
      webhookUrl: "https://admin.naraakum.com/hooks/provider/prov-004",
      capabilities: ["Create Lab Order", "Track Specimen", "Fetch Results", "Cancel Test", "Attach PDF Report", "Acknowledge Result"],
      events: [
        { name: "order.created", enabled: true, notes: "Lab order received and validated." },
        { name: "result.ready", enabled: true, notes: "Result payload is available." },
        { name: "specimen.rejected", enabled: false, notes: "Temporarily muted by QA." }
      ],
      logs: [
        { at: "2026-02-16 07:50", endpoint: "/results/fetch", result: "Error", message: "Timeout from upstream lab node." },
        { at: "2026-02-15 17:31", endpoint: "/orders/create", result: "Success", message: "Order LAB-8822 opened." },
        { at: "2026-02-15 17:29", endpoint: "/orders/create", result: "Error", message: "Missing specimen container code." }
      ]
    },
    {
      id: "PROV-005",
      name: "Moyasar Checkout",
      code: "MOYS-PMT",
      type: "Payments",
      baseUrl: "https://api.moyasar.example/v1",
      authMethod: "API Key",
      environment: "Sandbox",
      status: "Active",
      description: "Sandbox payment gateway for QA and staging transactions.",
      credentials: {
        clientId: "",
        clientSecret: "",
        apiKey: "moyasar-test-key-1900",
        token: "",
        username: "",
        password: "",
        tokenExpiry: ""
      },
      allowedIps: ["52.10.77.22"],
      webhookUrl: "https://admin.naraakum.com/hooks/provider/prov-005",
      capabilities: ["Create Invoice", "Authorize Payment", "Refund Payment", "Token Vault", "Payment Status", "Reconcile Batch"],
      events: [
        { name: "payment.authorized", enabled: true, notes: "Issued on auth hold." },
        { name: "payment.captured", enabled: true, notes: "Issued after capture." },
        { name: "refund.completed", enabled: true, notes: "Posted after bank confirmation." }
      ],
      logs: [
        { at: "2026-02-15 14:40", endpoint: "/payments/authorize", result: "Success", message: "Auth hold completed." },
        { at: "2026-02-15 14:58", endpoint: "/payments/capture", result: "Success", message: "Captured successfully." },
        { at: "2026-02-15 16:10", endpoint: "/payments/refund", result: "Success", message: "Refund reference RF-6102 queued." }
      ]
    },
    {
      id: "PROV-006",
      name: "Internal Tools API",
      code: "INTL-OTH",
      type: "Other",
      baseUrl: "https://internal-api.naraakum.local/v1/gateway",
      authMethod: "Token",
      environment: "Production",
      status: "Inactive",
      description: "Internal provider for custom workflows and background automations.",
      credentials: {
        clientId: "",
        clientSecret: "",
        apiKey: "",
        token: "internal-token-main-778",
        username: "",
        password: "",
        tokenExpiry: "2027-01-01 00:00 UTC"
      },
      allowedIps: ["10.1.40.15", "10.1.40.16"],
      webhookUrl: "https://admin.naraakum.com/hooks/provider/prov-006",
      capabilities: ["Custom Action A", "Custom Action B", "Sync Job Trigger", "Alert Pipeline", "Webhook Replay", "Queue Drain"],
      events: [
        { name: "job.completed", enabled: true, notes: "Emitted when background job completes." },
        { name: "job.failed", enabled: true, notes: "Error payload includes stack trace id." },
        { name: "queue.alert", enabled: false, notes: "Disabled during load testing." }
      ],
      logs: [
        { at: "2026-02-16 09:19", endpoint: "/jobs/trigger", result: "Success", message: "Nightly sync started." },
        { at: "2026-02-16 09:31", endpoint: "/jobs/status", result: "Success", message: "Sync completed with warnings." },
        { at: "2026-02-16 09:33", endpoint: "/alerts/push", result: "Success", message: "Ops alert dispatched." }
      ]
    },
    {
      id: "PROV-007",
      name: "SMSA Freight API",
      code: "SMSA-SHP",
      type: "Shipping",
      baseUrl: "https://api.smsa.example/shipment/v3",
      authMethod: "OAuth2",
      environment: "Sandbox",
      status: "Active",
      description: "Sandbox shipping integration for freight and dispatch synchronization.",
      credentials: {
        clientId: "smsa-sandbox-client",
        clientSecret: "smsa-sandbox-secret",
        apiKey: "",
        token: "smsa-sandbox-token",
        username: "",
        password: "",
        tokenExpiry: "2026-12-30 22:00 UTC"
      },
      allowedIps: ["23.44.10.98"],
      webhookUrl: "https://admin.naraakum.com/hooks/provider/prov-007",
      capabilities: ["Create Shipment", "Track Shipment", "Cancel Shipment", "Create Return"],
      events: [
        { name: "shipment.created", enabled: true, notes: "Triggered when a shipment is booked." },
        { name: "shipment.delivered", enabled: true, notes: "Triggered when shipment is delivered." }
      ],
      logs: [
        { at: "2026-02-17 10:20", endpoint: "/shipment/create", result: "Success", message: "Shipment SMSA-45621 created." },
        { at: "2026-02-17 11:05", endpoint: "/shipment/track", result: "Success", message: "Status fetched for SMSA-45621." }
      ]
    }
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeStatus(value) {
    var status = String(value || "")
      .trim()
      .toLowerCase();
    if (status === "active") return "Active";
    if (status === "inactive") return "Inactive";
    if (status === "disabled" || status === "error") return "Inactive";
    return "Active";
  }

  function normalizeEnvironment(value) {
    var env = String(value || "")
      .trim()
      .toLowerCase();
    return env === "sandbox" ? "Sandbox" : "Production";
  }

  function normalizeAuthMethod(value) {
    var map = {
      oauth2: "OAuth2",
      "api key": "API Key",
      apikey: "API Key",
      basic: "Basic",
      token: "Token"
    };
    var key = String(value || "")
      .trim()
      .toLowerCase();
    return map[key] || "Token";
  }

  function normalizeCredentials(raw) {
    var input = raw || {};
    return {
      clientId: String(input.clientId || ""),
      clientSecret: String(input.clientSecret || ""),
      apiKey: String(input.apiKey || ""),
      token: String(input.token || ""),
      username: String(input.username || ""),
      password: String(input.password || ""),
      tokenExpiry: String(input.tokenExpiry || "")
    };
  }

  function normalizeEvent(raw) {
    var item = raw || {};
    return {
      name: String(item.name || "").trim(),
      enabled: !!item.enabled,
      notes: String(item.notes || "").trim()
    };
  }

  function normalizeLog(raw) {
    var item = raw || {};
    return {
      at: String(item.at || "").trim(),
      endpoint: String(item.endpoint || "").trim(),
      result: String(item.result || "Success").trim(),
      message: String(item.message || "").trim()
    };
  }

  function normalizeIntegration(raw, index) {
    var item = raw || {};
    var fallbackId = "PROV-" + String(index + 1).padStart(3, "0");
    return {
      id: String(item.id || fallbackId)
        .trim()
        .toUpperCase(),
      name: String(item.name || "Integration " + String(index + 1)).trim(),
      code: String(item.code || "CODE-" + String(index + 1).padStart(3, "0"))
        .trim()
        .toUpperCase(),
      type: String(item.type || "Other").trim() || "Other",
      baseUrl: String(item.baseUrl || "").trim(),
      authMethod: normalizeAuthMethod(item.authMethod),
      environment: normalizeEnvironment(item.environment),
      status: normalizeStatus(item.status),
      description: String(item.description || "").trim(),
      credentials: normalizeCredentials(item.credentials),
      allowedIps: Array.isArray(item.allowedIps)
        ? item.allowedIps
            .map(function (ip) {
              return String(ip || "").trim();
            })
            .filter(Boolean)
        : [],
      webhookUrl: String(item.webhookUrl || "").trim(),
      capabilities: Array.isArray(item.capabilities)
        ? item.capabilities
            .map(function (cap) {
              return String(cap || "").trim();
            })
            .filter(Boolean)
        : [],
      events: Array.isArray(item.events)
        ? item.events.map(normalizeEvent).filter(function (ev) {
            return !!ev.name;
          })
        : [],
      logs: Array.isArray(item.logs)
        ? item.logs.map(normalizeLog).filter(function (lg) {
            return !!(lg.at || lg.endpoint || lg.message);
          })
        : []
    };
  }

  function safeRead() {
    if (memoryStore) return clone(memoryStore);
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      memoryStore = clone(parsed);
      return parsed;
    } catch (err) {
      return null;
    }
  }

  function safeSave(rows) {
    memoryStore = clone(rows);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
      return true;
    } catch (err) {
      return true;
    }
  }

  function ensureSeedData() {
    var rows = safeRead();
    if (!Array.isArray(rows) || !rows.length) {
      rows = clone(DEFAULT_INTEGRATIONS);
    }
    var normalized = rows.map(normalizeIntegration);
    safeSave(normalized);
    return clone(normalized);
  }

  function getAll() {
    return ensureSeedData();
  }

  function getById(id) {
    var key = String(id || "")
      .trim()
      .toUpperCase();
    if (!key) return null;
    var rows = ensureSeedData();
    for (var i = 0; i < rows.length; i += 1) {
      if (rows[i].id === key) return clone(rows[i]);
    }
    return null;
  }

  function nextIntegrationId(rows) {
    var max = 0;
    rows.forEach(function (row) {
      var match = /^PROV-(\d+)$/i.exec(String(row.id || ""));
      if (!match) return;
      var num = parseInt(match[1], 10);
      if (!Number.isNaN(num) && num > max) max = num;
    });
    return "PROV-" + String(max + 1).padStart(3, "0");
  }

  function createIntegration(payload) {
    var input = payload || {};
    var name = String(input.name || "").trim();
    var code = String(input.code || "")
      .trim()
      .toUpperCase();
    var type = String(input.type || "").trim();
    var baseUrl = String(input.baseUrl || "").trim();
    var authMethod = String(input.authMethod || "").trim();
    var environment = String(input.environment || "").trim();

    if (!name || !code || !type || !baseUrl || !authMethod || !environment) {
      return { ok: false, message: "Please complete all required fields." };
    }

    var rows = ensureSeedData();
    var duplicate = rows.some(function (row) {
      return String(row.code || "").toUpperCase() === code;
    });
    if (duplicate) {
      return { ok: false, message: "Integration code already exists." };
    }

    var now = new Date();
    var nowText = now.toISOString().slice(0, 16).replace("T", " ");
    var normalized = normalizeIntegration(
      {
        id: nextIntegrationId(rows),
        name: name,
        code: code,
        type: type,
        baseUrl: baseUrl,
        authMethod: authMethod,
        environment: environment,
        status: input.active === false ? "Inactive" : "Active",
        description: String(input.description || "New integration created from API Management.").trim(),
        credentials: input.credentials || {},
        allowedIps: input.allowedIps || [],
        webhookUrl: String(input.webhookUrl || "").trim(),
        capabilities: input.capabilities || [],
        events: input.events || [
          { name: "integration.created", enabled: true, notes: "Default creation event." }
        ],
        logs: input.logs || [
          { at: nowText, endpoint: "/integrations/create", result: "Success", message: "Integration profile created." }
        ]
      },
      rows.length
    );

    rows.push(normalized);
    safeSave(rows);
    return { ok: true, integration: clone(normalized) };
  }

  function setStatus(id, status) {
    var key = String(id || "")
      .trim()
      .toUpperCase();
    if (!key) return { ok: false, message: "Integration ID is required." };

    var rows = ensureSeedData();
    for (var i = 0; i < rows.length; i += 1) {
      if (rows[i].id !== key) continue;
      rows[i].status = normalizeStatus(status);
      safeSave(rows);
      return { ok: true, integration: clone(rows[i]) };
    }

    return { ok: false, message: "Integration not found." };
  }

  function setIntegrationActive(id) {
    return setStatus(id, "Active");
  }

  function setIntegrationInactive(id) {
    return setStatus(id, "Inactive");
  }

  window.NKApiIntegrationsStore = {
    STORAGE_KEY: STORAGE_KEY,
    ensureSeedData: ensureSeedData,
    getAll: getAll,
    getById: getById,
    createIntegration: createIntegration,
    setIntegrationActive: setIntegrationActive,
    setIntegrationInactive: setIntegrationInactive,
    normalizeStatus: normalizeStatus
  };
})();
