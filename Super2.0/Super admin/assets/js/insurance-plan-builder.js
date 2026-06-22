(function (global) {
  "use strict";

  var STYLE_ID = "nk-insurance-plan-builder-style";

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".nkpb-shell{display:grid;gap:12px;}",
      ".nkpb-topbar{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center;}",
      ".nkpb-muted{font-size:12px;color:#667085;font-weight:700;}",
      ".nkpb-validation{font-size:12px;font-weight:900;}",
      ".nkpb-validation.ok{color:#067647;}",
      ".nkpb-validation.err{color:#b42318;}",
      ".nkpb-plan-tabs,.nkpb-class-tabs{display:flex;gap:8px;flex-wrap:wrap;}",
      ".nkpb-tab-btn{height:32px;padding:0 12px;border-radius:999px;border:1px solid rgba(15,140,140,.24);background:#fff;color:#0f8c8c;font-size:12px;font-weight:900;display:inline-flex;align-items:center;gap:6px;cursor:pointer;}",
      ".nkpb-tab-btn.is-active{background:rgba(15,140,140,.1);}",
      ".nkpb-card{border:1px solid #e6eaef;border-radius:12px;padding:12px;background:#fff;}",
      ".nkpb-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;}",
      ".nkpb-field label{display:block;margin-bottom:6px;color:#667085;font-size:12px;font-weight:800;}",
      ".nkpb-field .form-control{height:36px;}",
      ".nkpb-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}",
      ".nkpb-table-wrap{overflow:auto;border:1px solid rgba(16,24,40,.08);border-radius:10px;}",
      ".nkpb-table{width:100%;border-collapse:collapse;min-width:980px;}",
      ".nkpb-scroll-x{overflow-x:auto;overflow-y:hidden;max-width:100%;height:14px;border:1px solid rgba(16,24,40,.08);border-top:0;border-radius:0 0 10px 10px;background:#f8fafc;}",
      ".nkpb-scroll-x-inner{height:1px;}",
      ".nkpb-table th,.nkpb-table td{padding:8px;border-bottom:1px solid rgba(16,24,40,.08);vertical-align:middle;}",
      ".nkpb-table th{background:#f8fafc;font-size:12px;color:#344054;font-weight:900;white-space:nowrap;}",
      ".nkpb-table td{font-size:12px;color:#101828;font-weight:700;}",
      ".nkpb-service-name{font-weight:900;color:#101828;}",
      ".nkpb-service-main{font-size:11px;color:#667085;font-weight:700;margin-top:2px;}",
      ".nkpb-select{height:32px;border-radius:8px;border:1px solid rgba(16,24,40,.15);padding:0 8px;background:#fff;}",
      ".nkpb-inline{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}",
      ".nkpb-empty{padding:12px;border:1px dashed rgba(16,24,40,.2);border-radius:10px;color:#667085;font-size:12px;font-weight:700;}",
      ".nkpb-errors{margin:0;padding-left:18px;color:#b42318;font-size:12px;font-weight:700;display:grid;gap:4px;}",
      "@media (max-width:992px){.nkpb-grid{grid-template-columns:1fr;}}"
    ].join("");
    document.head.appendChild(style);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function norm(value) {
    return String(value || "").trim();
  }

  function toNum(value, fallback) {
    var n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function ensureStore() {
    return global.NKInsurancePlanStore || null;
  }

  function ensureCatalog() {
    if (global.NKInsuranceServiceCatalog && typeof global.NKInsuranceServiceCatalog.getServices === "function") {
      return global.NKInsuranceServiceCatalog.getServices();
    }
    return [];
  }

  function uniqueName(base, list) {
    var i = 1;
    var next = base;
    var set = {};
    list.forEach(function (name) {
      set[norm(name).toLowerCase()] = true;
    });
    while (set[norm(next).toLowerCase()]) {
      i += 1;
      next = base + " " + i;
    }
    return next;
  }

  function PlanBuilder(options) {
    this.opts = options || {};
    this.store = ensureStore();
    this.container = this.opts.container || null;
    this.insuranceCode = norm(this.opts.insuranceCode);
    this.services = clone(this.opts.services || ensureCatalog());
    this.onChange = typeof this.opts.onChange === "function" ? this.opts.onChange : null;
    this.readonly = !!this.opts.readonly;
    this.selectedMainService = "";

    if (!this.store || !this.container) return;
    injectStyle();

    var initial = this.opts.initialValue || this.store.buildDefaultConfig(this.insuranceCode);
    this.state = this.store.normalizeConfig(initial, this.insuranceCode);
    this.selectedPlanId = "";
    this.selectedClassId = "";
    this.syncSelection();
    this.render();
  }

  PlanBuilder.prototype.syncSelection = function () {
    var plans = Array.isArray(this.state && this.state.plans) ? this.state.plans : [];
    if (!plans.length) {
      this.selectedPlanId = "";
      this.selectedClassId = "";
      return;
    }

    var selectedPlan = plans.find(
      function (plan) {
        return plan.planId === this.selectedPlanId;
      }.bind(this)
    );
    if (!selectedPlan) selectedPlan = plans[0];
    this.selectedPlanId = selectedPlan.planId;

    var classes = Array.isArray(selectedPlan.classes) ? selectedPlan.classes : [];
    var selectedClass = classes.find(
      function (planClass) {
        return planClass.classId === this.selectedClassId;
      }.bind(this)
    );
    if (!selectedClass) selectedClass = classes[0];
    this.selectedClassId = selectedClass ? selectedClass.classId : "";
  };

  PlanBuilder.prototype.getCurrentPlan = function () {
    return (this.state.plans || []).find(
      function (plan) {
        return plan.planId === this.selectedPlanId;
      }.bind(this)
    );
  };

  PlanBuilder.prototype.getCurrentClass = function () {
    var plan = this.getCurrentPlan();
    if (!plan) return null;
    return (plan.classes || []).find(
      function (planClass) {
        return planClass.classId === this.selectedClassId;
      }.bind(this)
    );
  };

  PlanBuilder.prototype.touch = function () {
    this.state.updatedAt = this.store.nowIso();
    this.state = this.store.normalizeConfig(this.state, this.insuranceCode || this.state.insuranceCode);
    this.syncSelection();
    this.render();
    if (this.onChange) this.onChange(this.getValue(), this.validate());
  };

  PlanBuilder.prototype.getValue = function () {
    return clone(this.state);
  };

  PlanBuilder.prototype.setValue = function (config) {
    this.state = this.store.normalizeConfig(config, this.insuranceCode || (config && config.insuranceCode));
    this.syncSelection();
    this.render();
  };

  PlanBuilder.prototype.validate = function () {
    return this.store.validateConfig(this.state);
  };

  PlanBuilder.prototype.addPlan = function () {
    var existingNames = (this.state.plans || []).map(function (plan) {
      return plan.planName;
    });
    var base = "Plan " + String((this.state.plans || []).length + 1);
    var name = uniqueName(base, existingNames);
    var created = this.store.defaultPlan((this.state.plans || []).length + 1);
    created.planName = name;
    this.state.plans.push(created);
    this.selectedPlanId = created.planId;
    this.selectedClassId = created.classes[0].classId;
    this.touch();
  };

  PlanBuilder.prototype.deletePlan = function (planId) {
    if ((this.state.plans || []).length <= 1) {
      alert("At least one plan is required.");
      return;
    }
    this.state.plans = this.state.plans.filter(function (plan) {
      return plan.planId !== planId;
    });
    this.touch();
  };

  PlanBuilder.prototype.addClass = function () {
    var plan = this.getCurrentPlan();
    if (!plan) return;
    var existingNames = (plan.classes || []).map(function (item) {
      return item.className;
    });
    var className = uniqueName("General", existingNames);
    var created = this.store.defaultClass(className);
    plan.classes.push(created);
    this.selectedClassId = created.classId;
    this.touch();
  };

  PlanBuilder.prototype.deleteClass = function () {
    var plan = this.getCurrentPlan();
    if (!plan) return;
    if ((plan.classes || []).length <= 1) {
      alert("Each plan needs at least one class.");
      return;
    }
    plan.classes = plan.classes.filter(
      function (planClass) {
        return planClass.classId !== this.selectedClassId;
      }.bind(this)
    );
    this.touch();
  };

  PlanBuilder.prototype.copyRules = function (sourceClassId) {
    var plan = this.getCurrentPlan();
    var targetClass = this.getCurrentClass();
    if (!plan || !targetClass) return;
    if (!sourceClassId) return;
    if (sourceClassId === targetClass.classId) return;
    var sourceClass = (plan.classes || []).find(function (planClass) {
      return planClass.classId === sourceClassId;
    });
    if (!sourceClass) return;
    targetClass.rules = clone(sourceClass.rules || []);
    this.touch();
  };

  PlanBuilder.prototype.resetRules = function () {
    var targetClass = this.getCurrentClass();
    if (!targetClass) return;
    targetClass.rules = this.services.map(this.store.defaultRule);
    this.touch();
  };

  PlanBuilder.prototype.updateRule = function (serviceId, mutator) {
    var planClass = this.getCurrentClass();
    if (!planClass) return;
    var rule = (planClass.rules || []).find(function (item) {
      return norm(item.serviceId).toUpperCase() === norm(serviceId).toUpperCase();
    });
    if (!rule) return;
    mutator(rule);
    this.touch();
  };

  PlanBuilder.prototype.getMainServiceOptions = function () {
    var set = {};
    (this.services || []).forEach(function (service) {
      var key = norm(service.main);
      if (!key) return;
      set[key] = service.main;
    });
    return Object.keys(set).sort().map(function (key) { return set[key]; });
  };

  PlanBuilder.prototype.renderValidation = function () {
    var validation = this.validate();
    var message = this.container.querySelector("[data-role='validation']");
    var errorsWrap = this.container.querySelector("[data-role='errors']");
    if (!message || !errorsWrap) return;

    if (validation.ok) {
      message.className = "nkpb-validation ok";
      message.textContent = "Configuration is valid.";
      errorsWrap.innerHTML = "";
      return;
    }

    message.className = "nkpb-validation err";
    message.textContent = "Validation failed (" + validation.errors.length + " issue(s)).";
    errorsWrap.innerHTML = "<ul class='nkpb-errors'>" +
      validation.errors.slice(0, 8).map(function (err) {
        return "<li>" + err.message + "</li>";
      }).join("") +
      "</ul>";
  };

  PlanBuilder.prototype.render = function () {
    if (!this.container) return;
    if (!this.state || !Array.isArray(this.state.plans)) {
      this.container.innerHTML = "<div class='nkpb-empty'>Unable to render plan builder.</div>";
      return;
    }

    var plan = this.getCurrentPlan();
    var planClass = this.getCurrentClass();

    if (!plan || !planClass) {
      this.container.innerHTML = "<div class='nkpb-empty'>No plans found.</div>";
      return;
    }

    var classes = plan.classes || [];
    var mainOptions = this.getMainServiceOptions();
    var filteredServices = this.selectedMainService
      ? this.services.filter(
        function (service) {
          return norm(service.main).toLowerCase() === norm(this.selectedMainService).toLowerCase();
        }.bind(this)
      )
      : this.services.slice();

    var rows = filteredServices
      .map(
        function (service) {
          var rule = (planClass.rules || []).find(function (item) {
            return norm(item.serviceId).toUpperCase() === norm(service.id).toUpperCase();
          });
          if (!rule) rule = this.store.defaultRule(service);

          return [
            "<tr data-service-id='", service.id, "'>",
            "<td class='text-center'><input data-role='rule-active' type='checkbox' ", rule.active ? "checked" : "", this.readonly ? " disabled" : "", "></td>",
            "<td><div class='nkpb-service-name'>", service.service, "</div><div class='nkpb-service-main'>", service.main, "</div></td>",
            "<td><input data-role='coveragePercent' class='form-control form-control-32' type='number' min='0' max='100' step='1' value='", rule.coveragePercent, "'", this.readonly ? " disabled" : "", "></td>",
            "<td><select data-role='copayType' class='nkpb-select' ", this.readonly ? "disabled" : "", ">",
            "<option value='none' ", rule.copayType === "none" ? "selected" : "", ">None</option>",
            "<option value='fixed' ", rule.copayType === "fixed" ? "selected" : "", ">Fixed</option>",
            "<option value='percent' ", rule.copayType === "percent" ? "selected" : "", ">Percent</option>",
            "</select></td>",
            "<td><input data-role='copayValue' class='form-control form-control-32' type='number' min='0' step='0.01' value='", rule.copayValue, "'", this.readonly ? " disabled" : "", "></td>",
            "<td><input data-role='maxCoveragePerVisit' class='form-control form-control-32' type='number' min='0' step='0.01' value='", rule.maxCoveragePerVisit, "'", this.readonly ? " disabled" : "", "></td>",
            "<td class='text-center'><input data-role='preAuthRequired' type='checkbox' ", rule.preAuthRequired ? "checked" : "", this.readonly ? " disabled" : "", "></td>",
            "</tr>"
          ].join("");
        }.bind(this)
      )
      .join("");

    if (!rows) {
      rows = "<tr><td colspan='7' class='text-center nkpb-muted'>No sub services found for selected main service.</td></tr>";
    }

    this.container.innerHTML = [
      "<div class='nkpb-shell'>",
      "<div class='nkpb-topbar'>",
      "<div class='nkpb-inline'>",
      "<button type='button' class='btn btn-primary btn-32' data-act='add-plan' ", this.readonly ? "disabled" : "", "><i class='fi fi-rr-plus'></i><span>Add Plan</span></button>",
      "<span class='nkpb-muted'>Plans: ", this.state.plans.length, " | Classes in selected plan: ", classes.length, "</span>",
      "</div>",
      "<div data-role='validation' class='nkpb-validation'>-</div>",
      "</div>",
      "<div data-role='errors'></div>",
      "<div class='nkpb-plan-tabs'>",
      this.state.plans
        .map(
          function (item) {
            return "<button type='button' class='nkpb-tab-btn " + (item.planId === this.selectedPlanId ? "is-active" : "") +
              "' data-plan-id='" + item.planId + "'>" + item.planName + "</button>";
          }.bind(this)
        )
        .join(""),
      "</div>",
      "<div class='nkpb-card'>",
      "<div class='nkpb-grid'>",
      "<div class='nkpb-field'><label>Plan Name</label><input data-role='planName' class='form-control form-control-32' value='" + plan.planName + "'" + (this.readonly ? " disabled" : "") + "></div>",
      "<div class='nkpb-field'><label>Plan Code (Optional)</label><input data-role='planCode' class='form-control form-control-32' value='" + (plan.planCode || "") + "'" + (this.readonly ? " disabled" : "") + "></div>",
      "<div class='nkpb-field'><label>Plan Status</label><div class='nkpb-inline'><input data-role='planActive' type='checkbox' " + (plan.isActive ? "checked" : "") + (this.readonly ? " disabled" : "") + "><span class='nkpb-muted'>Active</span></div></div>",
      "</div>",
      "<div class='nkpb-actions mt-8'>",
      "<button type='button' class='btn btn-primary-revers btn-32' data-act='delete-plan' " + (this.readonly ? "disabled" : "") + "><i class='fi fi-rr-trash'></i><span>Delete Plan</span></button>",
      "</div>",
      "</div>",
      "<div class='nkpb-card'>",
      "<div class='nkpb-topbar'>",
      "<div class='nkpb-class-tabs'>",
      classes
        .map(
          function (item) {
            return "<button type='button' class='nkpb-tab-btn " + (item.classId === this.selectedClassId ? "is-active" : "") +
              "' data-class-id='" + item.classId + "'>" + item.className + "</button>";
          }.bind(this)
        )
        .join(""),
      "</div>",
      "<button type='button' class='btn btn-primary btn-32' data-act='add-class' " + (this.readonly ? "disabled" : "") + "><i class='fi fi-rr-plus'></i><span>Add Class</span></button>",
      "</div>",
      "<div class='nkpb-grid mt-8'>",
      "<div class='nkpb-field'><label>Class Name</label><input data-role='className' class='form-control form-control-32' value='" + planClass.className + "'" + (this.readonly ? " disabled" : "") + "></div>",
      "<div class='nkpb-field'><label>Main Service</label><select class='nkpb-select w-100' data-role='mainServiceFilter'><option value=''>All main services</option>" +
        mainOptions.map(
          function (name) {
            return "<option value='" + name + "' " + (norm(this.selectedMainService).toLowerCase() === norm(name).toLowerCase() ? "selected" : "") + ">" + name + "</option>";
          }.bind(this)
        ).join("") +
      "</select></div>",
      "<div class='nkpb-field'><label>Bulk Actions</label><div class='nkpb-actions'>",
      "<button type='button' class='btn btn-secondary btn-32' data-act='reset-rules' " + (this.readonly ? "disabled" : "") + "><i class='fi fi-rr-rotate-right'></i><span>Reset</span></button>",
      "<button type='button' class='btn btn-primary-revers btn-32' data-act='delete-class' " + (this.readonly ? "disabled" : "") + "><i class='fi fi-rr-trash'></i><span>Delete Class</span></button>",
      "</div></div>",
      "</div>",
      "<div class='nkpb-table-wrap mt-10'>",
      "<table class='nkpb-table'>",
      "<thead><tr>",
      "<th class='text-center'>Active</th>",
      "<th>Service</th>",
      "<th>Coverage %</th>",
      "<th>Copay Type</th>",
      "<th>Copay Value</th>",
      "<th>Max Coverage / Visit (SAR)</th>",
      "<th class='text-center'>Pre-Auth</th>",
      "</tr></thead>",
      "<tbody>",
      rows,
      "</tbody>",
      "</table>",
      "</div>",
      "<div class='nkpb-scroll-x' data-role='table-scroll'><div class='nkpb-scroll-x-inner' data-role='table-scroll-inner'></div></div>",
      "</div>",
      "</div>"
    ].join("");

    this.bind();
    this.renderValidation();
  };

  PlanBuilder.prototype.bind = function () {
    var root = this.container;
    var self = this;
    if (!root) return;

    root.querySelectorAll("[data-plan-id]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        self.selectedPlanId = btn.getAttribute("data-plan-id");
        self.touch();
      });
    });

    root.querySelectorAll("[data-class-id]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        self.selectedClassId = btn.getAttribute("data-class-id");
        self.touch();
      });
    });

    var addPlanBtn = root.querySelector("[data-act='add-plan']");
    if (addPlanBtn) addPlanBtn.addEventListener("click", function () { self.addPlan(); });

    var deletePlanBtn = root.querySelector("[data-act='delete-plan']");
    if (deletePlanBtn) {
      deletePlanBtn.addEventListener("click", function () {
        if (!confirm("Delete selected plan?")) return;
        self.deletePlan(self.selectedPlanId);
      });
    }

    var addClassBtn = root.querySelector("[data-act='add-class']");
    if (addClassBtn) addClassBtn.addEventListener("click", function () { self.addClass(); });

    var deleteClassBtn = root.querySelector("[data-act='delete-class']");
    if (deleteClassBtn) {
      deleteClassBtn.addEventListener("click", function () {
        if (!confirm("Delete selected class?")) return;
        self.deleteClass();
      });
    }

    var planNameInput = root.querySelector("[data-role='planName']");
    if (planNameInput) {
      planNameInput.addEventListener("change", function () {
        var plan = self.getCurrentPlan();
        if (!plan) return;
        plan.planName = norm(planNameInput.value) || plan.planName;
        self.touch();
      });
    }

    var planCodeInput = root.querySelector("[data-role='planCode']");
    if (planCodeInput) {
      planCodeInput.addEventListener("change", function () {
        var plan = self.getCurrentPlan();
        if (!plan) return;
        plan.planCode = norm(planCodeInput.value);
        self.touch();
      });
    }

    var planActiveInput = root.querySelector("[data-role='planActive']");
    if (planActiveInput) {
      planActiveInput.addEventListener("change", function () {
        var plan = self.getCurrentPlan();
        if (!plan) return;
        plan.isActive = !!planActiveInput.checked;
        self.touch();
      });
    }

    var classNameInput = root.querySelector("[data-role='className']");
    if (classNameInput) {
      classNameInput.addEventListener("change", function () {
        var planClass = self.getCurrentClass();
        if (!planClass) return;
        planClass.className = norm(classNameInput.value) || planClass.className;
        self.touch();
      });
    }

    var mainServiceFilter = root.querySelector("[data-role='mainServiceFilter']");
    if (mainServiceFilter) {
      mainServiceFilter.addEventListener("change", function () {
        self.selectedMainService = norm(mainServiceFilter.value);
        self.render();
      });
    }

    var resetBtn = root.querySelector("[data-act='reset-rules']");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        if (!confirm("Reset rules to default values?")) return;
        self.resetRules();
      });
    }

    var tableWrap = root.querySelector(".nkpb-table-wrap");
    var tableEl = root.querySelector(".nkpb-table");
    var bottomScroll = root.querySelector("[data-role='table-scroll']");
    var bottomScrollInner = root.querySelector("[data-role='table-scroll-inner']");
    if (tableWrap && tableEl && bottomScroll && bottomScrollInner) {
      bottomScrollInner.style.width = tableEl.scrollWidth + "px";
      var syncFromTable = function () {
        bottomScroll.scrollLeft = tableWrap.scrollLeft;
      };
      var syncFromBottom = function () {
        tableWrap.scrollLeft = bottomScroll.scrollLeft;
      };
      tableWrap.addEventListener("scroll", syncFromTable);
      bottomScroll.addEventListener("scroll", syncFromBottom);
      window.addEventListener("resize", function () {
        bottomScrollInner.style.width = tableEl.scrollWidth + "px";
        syncFromTable();
      });
      syncFromTable();
    }

    root.querySelectorAll("tr[data-service-id]").forEach(function (row) {
      var serviceId = row.getAttribute("data-service-id");
      if (!serviceId) return;

      var activeInput = row.querySelector("[data-role='rule-active']");
      if (activeInput) {
        activeInput.addEventListener("change", function () {
          self.updateRule(serviceId, function (rule) {
            rule.active = !!activeInput.checked;
          });
        });
      }

      var coverageInput = row.querySelector("[data-role='coveragePercent']");
      if (coverageInput) {
        coverageInput.addEventListener("change", function () {
          self.updateRule(serviceId, function (rule) {
            var n = toNum(coverageInput.value, rule.coveragePercent);
            rule.coveragePercent = clamp(n, 0, 100);
          });
        });
      }

      var copayTypeSelect = row.querySelector("[data-role='copayType']");
      if (copayTypeSelect) {
        copayTypeSelect.addEventListener("change", function () {
          self.updateRule(serviceId, function (rule) {
            var t = norm(copayTypeSelect.value).toLowerCase();
            if (t !== "none" && t !== "fixed" && t !== "percent") t = "percent";
            rule.copayType = t;
            if (t === "none") rule.copayValue = 0;
          });
        });
      }

      var copayValueInput = row.querySelector("[data-role='copayValue']");
      if (copayValueInput) {
        copayValueInput.addEventListener("change", function () {
          self.updateRule(serviceId, function (rule) {
            var n = toNum(copayValueInput.value, rule.copayValue);
            if (rule.copayType === "percent") n = clamp(n, 0, 100);
            if (n < 0) n = 0;
            rule.copayValue = n;
          });
        });
      }

      var maxInput = row.querySelector("[data-role='maxCoveragePerVisit']");
      if (maxInput) {
        maxInput.addEventListener("change", function () {
          self.updateRule(serviceId, function (rule) {
            var n = toNum(maxInput.value, rule.maxCoveragePerVisit);
            if (n < 0) n = 0;
            rule.maxCoveragePerVisit = n;
          });
        });
      }

      var preAuthInput = row.querySelector("[data-role='preAuthRequired']");
      if (preAuthInput) {
        preAuthInput.addEventListener("change", function () {
          self.updateRule(serviceId, function (rule) {
            rule.preAuthRequired = !!preAuthInput.checked;
          });
        });
      }
    });
  };

  function create(options) {
    return new PlanBuilder(options);
  }

  global.NKInsurancePlanBuilder = {
    create: create
  };
})(window);
