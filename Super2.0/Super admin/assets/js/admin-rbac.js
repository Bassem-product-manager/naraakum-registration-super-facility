(function () {
  var ROLE_ALIASES = {
    admin: "super_admin",
    superadmin: "super_admin",
    manager: "ops_manager",
    operations_manager: "ops_manager",
    accountat: "finance_manager",
    accountant: "finance_manager",
    finance: "finance_manager",
    support: "support_agent",
    auditor: "read_only_auditor",
    security: "security_admin"
  };

  var ROLE_OPTIONS = [
    {
      id: "super_admin",
      label: "Super Admin",
      level: "Standard",
      description: "Full access across admin, operations, patients, settlements, and tax control."
    },
    {
      id: "ops_manager",
      label: "Operations Manager",
      level: "Standard",
      description: "Leads orders, providers, services, records workflow, and operational tracking."
    },
    {
      id: "finance_manager",
      label: "Finance Manager",
      level: "Standard",
      description: "Owns transactions, payout settlements, tax documents, and finance exports."
    },
    {
      id: "security_admin",
      label: "Security Admin",
      level: "Standard",
      description: "Controls admin account access, password policies, sessions, and security actions."
    },
    {
      id: "compliance_officer",
      label: "Compliance Officer",
      level: "Standard",
      description: "Reviews tax compliance, payout approvals, audit logs, and documentation gaps."
    },
    {
      id: "support_agent",
      label: "Support Agent",
      level: "Standard",
      description: "Handles patient support flow, messages follow-up, and case handoffs."
    },
    {
      id: "read_only_auditor",
      label: "Read-Only Auditor",
      level: "Standard",
      description: "Read-only visibility for monitoring, reports, and audit trails."
    }
  ];

  var PERMISSION_GROUPS = [
    {
      id: "admin_users",
      title: "Admin Users",
      path: "admin/users",
      actions: [
        { key: "view_any", label: "View Any", type: "Resources" },
        { key: "view", label: "View", type: "Resources" },
        { key: "create", label: "Create", type: "Resources" },
        { key: "update", label: "Update", type: "Resources" },
        { key: "suspend", label: "Suspend", type: "Resources" },
        { key: "unlock", label: "Unlock", type: "Resources" },
        { key: "force_logout", label: "Force Logout", type: "Resources" },
        { key: "reset_password", label: "Reset Password", type: "Resources" },
        { key: "delete", label: "Delete", type: "Resources" }
      ]
    },
    {
      id: "roles_permissions",
      title: "Roles & Permissions",
      path: "admin/roles",
      actions: [
        { key: "view_any", label: "View Any", type: "Resources" },
        { key: "view", label: "View", type: "Resources" },
        { key: "create", label: "Create", type: "Resources" },
        { key: "update", label: "Update", type: "Resources" },
        { key: "assign", label: "Assign Role", type: "Resources" },
        { key: "clone", label: "Clone Role", type: "Resources" },
        { key: "publish", label: "Publish Role", type: "Resources" },
        { key: "delete", label: "Delete", type: "Resources" }
      ]
    },
    {
      id: "order_management",
      title: "Order Management",
      path: "Order-Managment/*",
      actions: [
        { key: "view_any", label: "View Any", type: "Resources" },
        { key: "view", label: "View", type: "Resources" },
        { key: "create", label: "Create", type: "Resources" },
        { key: "update", label: "Update", type: "Resources" },
        { key: "assign", label: "Assign", type: "Resources" },
        { key: "reschedule", label: "Reschedule", type: "Resources" },
        { key: "cancel", label: "Cancel", type: "Resources" },
        { key: "refund", label: "Refund", type: "Resources" },
        { key: "export", label: "Export", type: "Pages" }
      ]
    },
    {
      id: "provider_management",
      title: "Provider Management",
      path: "providers/*",
      actions: [
        { key: "view_any", label: "View Any", type: "Resources" },
        { key: "view", label: "View", type: "Resources" },
        { key: "create", label: "Create", type: "Resources" },
        { key: "update", label: "Update", type: "Resources" },
        { key: "approve", label: "Approve", type: "Resources" },
        { key: "verify_kyc", label: "Verify KYC", type: "Resources" },
        { key: "manage_contract", label: "Manage Contract", type: "Resources" },
        { key: "manage_branches", label: "Manage Branches", type: "Resources" },
        { key: "set_payout_profile", label: "Set Payout Profile", type: "Resources" },
        { key: "reactivate", label: "Reactivate", type: "Resources" },
        { key: "suspend", label: "Suspend", type: "Resources" },
        { key: "ratings_view", label: "Ratings View", type: "Pages" }
      ]
    },
    {
      id: "service_management",
      title: "Service Management",
      path: "service managment/*",
      actions: [
        { key: "view_any", label: "View Any", type: "Resources" },
        { key: "view", label: "View", type: "Resources" },
        { key: "create", label: "Create", type: "Resources" },
        { key: "update", label: "Update", type: "Resources" },
        { key: "archive", label: "Archive", type: "Resources" },
        { key: "delete", label: "Delete", type: "Resources" },
        { key: "publish", label: "Publish", type: "Resources" },
        { key: "approve_price_change", label: "Approve Price Change", type: "Resources" },
        { key: "price_override", label: "Price Override", type: "Resources" }
      ]
    },
    {
      id: "provider_calendars",
      title: "Provider Calendars",
      path: "Calander/*",
      actions: [
        { key: "view_any", label: "View Any", type: "Resources" },
        { key: "view", label: "View", type: "Resources" },
        { key: "update", label: "Update", type: "Resources" },
        { key: "block_slot", label: "Block Slot", type: "Resources" },
        { key: "reassign", label: "Reassign", type: "Resources" },
        { key: "export", label: "Export", type: "Pages" }
      ]
    },
    {
      id: "patient_journey",
      title: "Patients Journey",
      path: "Patient list/*",
      actions: [
        { key: "view_any", label: "View Any", type: "Resources" },
        { key: "view", label: "View", type: "Resources" },
        { key: "update", label: "Update", type: "Resources" },
        { key: "medical_history", label: "Medical History", type: "Pages" },
        { key: "visit_record", label: "Visit Record", type: "Pages" },
        { key: "patient_ratings", label: "Patient Ratings", type: "Pages" },
        { key: "merge_profile", label: "Merge Profile", type: "Resources" },
        { key: "flag_abuse", label: "Flag Abuse", type: "Resources" },
        { key: "clear_flag", label: "Clear Flag", type: "Resources" },
        { key: "export", label: "Export", type: "Pages" }
      ]
    },
    {
      id: "messages_center",
      title: "Messages Center",
      path: "Massages/*",
      actions: [
        { key: "view_any", label: "View Any", type: "Resources" },
        { key: "view", label: "View", type: "Resources" },
        { key: "reply", label: "Reply", type: "Resources" },
        { key: "moderate", label: "Moderate", type: "Resources" },
        { key: "escalate", label: "Escalate", type: "Resources" },
        { key: "archive", label: "Archive", type: "Resources" }
      ]
    },
    {
      id: "tracking_control",
      title: "Tracking Control",
      path: "Tracking/*",
      actions: [
        { key: "view", label: "View", type: "Pages" },
        { key: "assign", label: "Assign", type: "Resources" },
        { key: "close", label: "Close", type: "Resources" },
        { key: "reopen", label: "Reopen", type: "Resources" },
        { key: "export", label: "Export", type: "Pages" }
      ]
    },
    {
      id: "payments_transactions",
      title: "Payment Transactions",
      path: "payment/transaction-orders.html",
      actions: [
        { key: "view_any", label: "View Any", type: "Resources" },
        { key: "view", label: "View", type: "Resources" },
        { key: "approve", label: "Approve", type: "Resources" },
        { key: "reconcile", label: "Reconcile", type: "Resources" },
        { key: "void_transaction", label: "Void Transaction", type: "Resources" },
        { key: "export", label: "Export", type: "Pages" }
      ]
    },
    {
      id: "payouts_settlement",
      title: "Deposits & Settlements",
      path: "payment/deposits.html",
      actions: [
        { key: "view_any", label: "View Any", type: "Resources" },
        { key: "view", label: "View", type: "Resources" },
        { key: "pay_all_orders", label: "Pay All Orders", type: "Resources" },
        { key: "pay_selected_orders", label: "Pay Selected Orders", type: "Resources" },
        { key: "create_payout", label: "Create Payout", type: "Resources" },
        { key: "approve_payout", label: "Approve Payout", type: "Resources" },
        { key: "reverse_payout", label: "Reverse Payout", type: "Resources" },
        { key: "export", label: "Export", type: "Pages" }
      ]
    },
    {
      id: "tax_control",
      title: "Tax Control Center",
      path: "payment/tax-invoices.html",
      actions: [
        { key: "view_any", label: "View Any", type: "Resources" },
        { key: "view", label: "View", type: "Resources" },
        { key: "issue", label: "Issue", type: "Resources" },
        { key: "credit_note", label: "Credit Note", type: "Resources" },
        { key: "void_doc", label: "Void Document", type: "Resources" },
        { key: "export", label: "Export", type: "Pages" }
      ]
    },
    {
      id: "insurance_billing",
      title: "Insurance Billing",
      path: "payment/insurance-invoices.html",
      actions: [
        { key: "view_any", label: "View Any", type: "Resources" },
        { key: "view", label: "View", type: "Resources" },
        { key: "submit_claim", label: "Submit Claim", type: "Resources" },
        { key: "record_payment", label: "Record Payment", type: "Resources" },
        { key: "record_denial", label: "Record Denial", type: "Resources" },
        { key: "export", label: "Export", type: "Pages" }
      ]
    },
    {
      id: "settings_control",
      title: "Settings Control",
      path: "settings/*",
      actions: [
        { key: "view", label: "View", type: "Pages" },
        { key: "update", label: "Update", type: "Resources" },
        { key: "branches", label: "Branches", type: "Resources" },
        { key: "payment_method", label: "Payment Method", type: "Resources" },
        { key: "branding", label: "Branding", type: "Resources" },
        { key: "notification_rules", label: "Notification Rules", type: "Resources" },
        { key: "security_policy", label: "Security Policy", type: "Resources" }
      ]
    },
    {
      id: "admin_tools",
      title: "Admin Tools",
      path: "admin/tools",
      actions: [
        { key: "view_audit", label: "View Audit", type: "Pages" },
        { key: "download_audit", label: "Download Audit", type: "Pages" },
        { key: "impersonate_readonly", label: "Impersonate Readonly", type: "Resources" },
        { key: "manage_integrations", label: "Manage Integrations", type: "Resources" },
        { key: "maintenance_mode", label: "Maintenance Mode", type: "Resources" }
      ]
    },
    {
      id: "reports_audit",
      title: "Reports & Audit",
      path: "audit/reports",
      actions: [
        { key: "view_any", label: "View Any", type: "Pages" },
        { key: "view", label: "View", type: "Pages" },
        { key: "export", label: "Export", type: "Pages" },
        { key: "download_audit", label: "Download Audit", type: "Pages" }
      ]
    }
  ];

  var ROLE_PRESETS = {
    super_admin: { all: true },
    ops_manager: {
      allow: {
        order_management: "*",
        provider_management: "*",
        service_management: "*",
        provider_calendars: "*",
        patient_journey: "*",
        messages_center: "*",
        tracking_control: "*",
        reports_audit: ["view_any", "view", "export"]
      }
    },
    finance_manager: {
      allow: {
        payments_transactions: "*",
        payouts_settlement: "*",
        tax_control: "*",
        insurance_billing: "*",
        reports_audit: "*",
        order_management: ["view_any", "view", "refund", "export"],
        patient_journey: ["view_any", "view"],
        settings_control: ["view", "payment_method"]
      }
    },
    security_admin: {
      allow: {
        admin_users: ["view_any", "view", "update", "suspend", "unlock", "force_logout", "reset_password"],
        roles_permissions: ["view_any", "view", "assign"],
        settings_control: ["view", "security_policy"],
        admin_tools: ["view_audit", "download_audit", "maintenance_mode"],
        reports_audit: ["view_any", "view", "download_audit"]
      }
    },
    compliance_officer: {
      allow: {
        tax_control: ["view_any", "view", "credit_note", "void_doc", "export"],
        insurance_billing: ["view_any", "view", "record_denial", "export"],
        payouts_settlement: ["view_any", "view", "approve_payout", "export"],
        reports_audit: "*",
        admin_tools: ["view_audit", "download_audit"],
        order_management: ["view_any", "view", "refund", "export"],
        patient_journey: ["view_any", "view"],
        settings_control: ["view"]
      }
    },
    support_agent: {
      allow: {
        patient_journey: ["view_any", "view", "update", "medical_history", "visit_record", "flag_abuse"],
        messages_center: ["view_any", "view", "reply", "escalate"],
        order_management: ["view_any", "view", "update"],
        provider_management: ["view_any", "view", "ratings_view"],
        tracking_control: ["view"]
      }
    },
    read_only_auditor: {
      allow: {
        order_management: ["view_any", "view", "export"],
        provider_management: ["view_any", "view"],
        service_management: ["view_any", "view"],
        provider_calendars: ["view_any", "view"],
        patient_journey: ["view_any", "view", "export"],
        payments_transactions: ["view_any", "view", "export"],
        payouts_settlement: ["view_any", "view", "export"],
        tax_control: ["view_any", "view", "export"],
        insurance_billing: ["view_any", "view", "export"],
        reports_audit: "*",
        admin_tools: ["view_audit", "download_audit"]
      }
    }
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function normalizeRoleId(value) {
    var v = (value || "").toString().trim().toLowerCase().replace(/\s+/g, "_");
    if (!v) return "";
    if (ROLE_ALIASES[v]) return ROLE_ALIASES[v];
    return v;
  }

  function permissionToken(groupId, actionKey) {
    return String(groupId || "") + ":" + String(actionKey || "");
  }

  function getAllPermissionTokens() {
    var out = [];
    PERMISSION_GROUPS.forEach(function (group) {
      (group.actions || []).forEach(function (action) {
        out.push(permissionToken(group.id, action.key));
      });
    });
    return out;
  }

  function groupByIdMap() {
    var map = {};
    PERMISSION_GROUPS.forEach(function (group) {
      map[group.id] = group;
    });
    return map;
  }

  function getPresetTokens(roleId) {
    var normalized = normalizeRoleId(roleId);
    var preset = ROLE_PRESETS[normalized];
    if (!preset) return [];
    if (preset.all) return getAllPermissionTokens();

    var out = [];
    var map = groupByIdMap();
    var allow = preset.allow || {};
    Object.keys(allow).forEach(function (groupId) {
      var group = map[groupId];
      if (!group) return;
      var allowedActions = allow[groupId];
      var keys = [];
      if (allowedActions === "*") {
        keys = (group.actions || []).map(function (action) {
          return action.key;
        });
      } else if (Array.isArray(allowedActions)) {
        keys = allowedActions.slice();
      }

      keys.forEach(function (actionKey) {
        out.push(permissionToken(groupId, actionKey));
      });
    });

    return out;
  }

  function getRoleOption(roleId) {
    var id = normalizeRoleId(roleId);
    for (var i = 0; i < ROLE_OPTIONS.length; i += 1) {
      if (ROLE_OPTIONS[i].id === id) return clone(ROLE_OPTIONS[i]);
    }
    return null;
  }

  function getRolePermissionCount(roleId) {
    return getPresetTokens(roleId).length;
  }

  function getPermissionStatsByType(tokens) {
    var active = {};
    (tokens || []).forEach(function (token) {
      active[token] = true;
    });

    var stats = {
      Resources: { selected: 0, total: 0 },
      Pages: { selected: 0, total: 0 },
      Widgets: { selected: 0, total: 0 }
    };

    PERMISSION_GROUPS.forEach(function (group) {
      (group.actions || []).forEach(function (action) {
        var type = action.type || "Resources";
        if (!stats[type]) stats[type] = { selected: 0, total: 0 };
        stats[type].total += 1;
        if (active[permissionToken(group.id, action.key)]) stats[type].selected += 1;
      });
    });
    return stats;
  }

  window.NKAdminRBAC = {
    normalizeRoleId: normalizeRoleId,
    permissionToken: permissionToken,
    getRoleOptions: function () {
      return clone(ROLE_OPTIONS);
    },
    getRoleOption: getRoleOption,
    getPermissionGroups: function () {
      return clone(PERMISSION_GROUPS);
    },
    getAllPermissionTokens: getAllPermissionTokens,
    getPresetTokens: getPresetTokens,
    getRolePermissionCount: getRolePermissionCount,
    getPermissionStatsByType: getPermissionStatsByType
  };
})();
