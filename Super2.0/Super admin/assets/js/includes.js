(function () {
  function getInlineSidebarTemplate() {
    return [
      '<aside class="side-menu">',
      '<div class="side-menu-logo">',
      '<img data-route-src="assets/images/logo.svg" alt="Naraakum" />',
      '<div class="facility-line"><p class="text-grey fsize-12 facility-name">Super Admin</p></div>',
      '</div>',
      '<ul class="side-menu-list" style="flex: 1; display: flex; flex-direction: column">',
      '<li><a data-route="Home.html" class="menu-list-item" id="menu-home"><span>Home</span></a></li>',
      '<li id="menu-orders"><a class="menu-list-item"><span>Order Management</span><i class="fi fi-rr-caret-down"></i></a><div class="sub-list"><a data-route="Order-Managment/facilities-order.html"><i class="fi fi-rr-angle-small-right"></i><span>Facility Orders</span></a><a data-route="Order-Managment/pharmacy-order.html"><i class="fi fi-rr-angle-small-right"></i><span>Pharmacy Orders</span></a><a data-route="Order-Managment/Individuals-order.html"><i class="fi fi-rr-angle-small-right"></i><span>Individual Orders</span></a><a data-route="Order-Managment/returns-facility.html"><i class="fi fi-rr-angle-small-right"></i><span>Facility Return</span></a><a data-route="Order-Managment/returns-individual.html"><i class="fi fi-rr-angle-small-right"></i><span>Individual Return</span></a><a data-route="Order-Managment/returns-list.html"><i class="fi fi-rr-angle-small-right"></i><span>Pharmacy Return</span></a></div></li>',
      '<li id="menu-provider"><a class="menu-list-item"><span>Provider Management</span><i class="fi fi-rr-caret-down"></i></a><div class="sub-list"><a data-route="providers/pharm.html"><i class="fi fi-rr-angle-small-right"></i><span>Pharmacies</span></a><a data-route="providers/facilities.html"><i class="fi fi-rr-angle-small-right"></i><span>Facilities</span></a><a data-route="providers/Individuals.html"><i class="fi fi-rr-angle-small-right"></i><span>Individuals</span></a><a data-route="providers/job-titles.html"><i class="fi fi-rr-angle-small-right"></i><span>Job Titles</span></a><a data-route="providers/positions.html"><i class="fi fi-rr-angle-small-right"></i><span>Positions</span></a><a data-route="Order-Managment/shipping-companies.html"><i class="fi fi-rr-angle-small-right"></i><span>Shipping Companies</span></a><a data-route="providers/insurances.html"><i class="fi fi-rr-angle-small-right"></i><span>Insurance</span></a><a data-route="providers/add-insurance.html"><i class="fi fi-rr-angle-small-right"></i><span>Add Insurance</span></a><a data-route="providers/providers-rating.html"><i class="fi fi-rr-angle-small-right"></i><span>Providers Ratings</span></a></div></li>',
      '<li id="menu-registration-questions"><a class="menu-list-item"><span>Registration Questions</span><i class="fi fi-rr-caret-down"></i></a><div class="sub-list"><a data-route="registration-questions/question-specialties.html"><i class="fi fi-rr-angle-small-right"></i><span>Question Specialties</span></a><a data-route="registration-questions/add-question.html"><i class="fi fi-rr-angle-small-right"></i><span>Add Question</span></a><a data-route="registration-questions/question-bank.html"><i class="fi fi-rr-angle-small-right"></i><span>Question Bank</span></a></div></li>',
      '<li id="menu-services"><a class="menu-list-item"><span>Service Management</span><i class="fi fi-rr-caret-down"></i></a><div class="sub-list"><a data-route="service managment/service-list.html"><i class="fi fi-rr-angle-small-right"></i><span>Main Service</span></a><a data-route="service managment/add-service.html"><i class="fi fi-rr-angle-small-right"></i><span>Add Main Service</span></a><a data-route="service managment/service-list.html?view=services"><i class="fi fi-rr-angle-small-right"></i><span>Services</span></a><a data-route="service managment/addsub-service.html"><i class="fi fi-rr-angle-small-right"></i><span>Add Services</span></a><a data-route="service managment/item-bank.html"><i class="fi fi-rr-angle-small-right"></i><span>Item Bank</span></a><a data-route="service managment/insurance-packages.html"><i class="fi fi-rr-angle-small-right"></i><span>Insurance Packages</span></a><a data-route="service managment/naraakm-packages.html"><i class="fi fi-rr-angle-small-right"></i><span>Naraakm Package</span></a><a data-route="service managment/naraakm-package-form.html"><i class="fi fi-rr-angle-small-right"></i><span>Add Naraakm Package</span></a><a data-route="service managment/insurance-rate-sheet.html"><i class="fi fi-rr-angle-small-right"></i><span>Insurance Rate Sheet</span></a></div></li>',
      '<li id="menu-calendar"><a class="menu-list-item"><span>Provider Calendars</span><i class="fi fi-rr-caret-down"></i></a><div class="sub-list"><a data-route="Calander/Pharmacy-calander.html"><i class="fi fi-rr-angle-small-right"></i><span>Pharmacies Calendars</span></a><a data-route="Calander/facilites-calander.html"><i class="fi fi-rr-angle-small-right"></i><span>Facilities Calendar</span></a><a data-route="Calander/individuals-calander.html"><i class="fi fi-rr-angle-small-right"></i><span>Individuals Calendars</span></a></div></li>',
      '<li id="menu-patients"><a class="menu-list-item"><span>Patients</span><i class="fi fi-rr-caret-down"></i></a><div class="sub-list"><a data-route="Patient list/patients-list.html"><i class="fi fi-rr-angle-small-right"></i><span>Patients List</span></a><a data-route="Patient list/patient-ratings.html"><i class="fi fi-rr-angle-small-right"></i><span>Patient Ratings</span></a></div></li>',
      '<li id="menu-messages"><a class="menu-list-item"><span>Messages</span><i class="fi fi-rr-caret-down"></i></a><div class="sub-list"><a data-route="Massages/Pharmacy-Massages.html"><i class="fi fi-rr-angle-small-right"></i><span>Pharmacy Messages</span></a><a data-route="Massages/faclility-massages.html"><i class="fi fi-rr-angle-small-right"></i><span>Facility Messages</span></a><a data-route="Massages/individuals-massages.html"><i class="fi fi-rr-angle-small-right"></i><span>Individuals Messages</span></a><a data-route="Massages/Staff-massages.html"><i class="fi fi-rr-angle-small-right"></i><span>Staff Messages</span></a></div></li>',
      '<li><a data-route="Tracking/Tracking.html" class="menu-list-item" id="menu-tracking"><span>Tracking</span></a></li>',
      '<li id="menu-payments"><a class="menu-list-item"><span>Payments</span><i class="fi fi-rr-caret-down"></i></a><div class="sub-list"><a data-route="payment/transaction-orders.html"><i class="fi fi-rr-angle-small-right"></i><span>Transaction Orders</span></a><a data-route="payment/deposits.html"><i class="fi fi-rr-angle-small-right"></i><span>Deposits</span></a><a data-route="payment/tax-invoices.html"><i class="fi fi-rr-angle-small-right"></i><span>Tax Invoices</span></a><a data-route="payment/insurance-invoices.html"><i class="fi fi-rr-angle-small-right"></i><span>Insurance Invoices</span></a></div></li>',
      '<li id="menu-settings"><a class="menu-list-item"><span>Settings</span><i class="fi fi-rr-caret-down"></i></a><div class="sub-list"><a data-route="Setting/payment_methods.html"><i class="fi fi-rr-angle-small-right"></i><span>Payment Methods</span></a><a data-route="Setting/service-markups.html"><i class="fi fi-rr-angle-small-right"></i><span>provider payouts</span></a><a data-route="Setting/api-management.html"><i class="fi fi-rr-angle-small-right"></i><span>API Management</span></a><a data-route="Setting/Tax.html"><i class="fi fi-rr-angle-small-right"></i><span>Tax</span></a><a data-route="Setting/Notifications.html"><i class="fi fi-rr-angle-small-right"></i><span>Notifications</span></a></div></li>',
      '<li id="menu-admin"><a class="menu-list-item"><span>Admin</span><i class="fi fi-rr-caret-down"></i></a><div class="sub-list"><a data-route="admin/admins.html"><i class="fi fi-rr-angle-small-right"></i><span>Admins</span></a><a data-route="admin/roles-permissions.html"><i class="fi fi-rr-angle-small-right"></i><span>Roles &amp; Permissions</span></a></div></li>',
      '<li id="menu-more"><a class="menu-list-item"><span>More</span><i class="fi fi-rr-caret-down"></i></a><div class="sub-list"><a data-route="terms-library.html"><i class="fi fi-rr-angle-small-right"></i><span>Naraakum Terms</span></a><a data-route="terms-creation.html"><i class="fi fi-rr-angle-small-right"></i><span>Create Term</span></a><a data-route="add-contracts.html"><i class="fi fi-rr-angle-small-right"></i><span>Add Contracts</span></a><a data-route="terms-contracts.html"><i class="fi fi-rr-angle-small-right"></i><span>Naraakum Contracts</span></a><a data-route="complaints-admin.html" id="menu-compliance"><i class="fi fi-rr-angle-small-right"></i><span>Naraakum Compliance</span></a></div></li>',
      '<li style="margin-top: auto"><a data-route="template.html" class="menu-list-item logout-link" id="menu-logout"><span>Log Out</span></a></li>',
      '</ul>',
      '</aside>'
    ].join("");
  }

  function getDirectSubList(li) {
    if (!li || !li.children) return null;
    for (var i = 0; i < li.children.length; i += 1) {
      var child = li.children[i];
      if (child && child.classList && child.classList.contains("sub-list")) {
        return child;
      }
    }
    return null;
  }

  function applyFallbackResponsiveState() {
    var menu = document.querySelector(".side-menu");
    if (!menu) return;

    if (window.innerWidth < 1200) {
      menu.classList.add("toggle-side-menu");
    } else {
      menu.classList.remove("toggle-side-menu");
    }
  }

  function bindFallbackSidebarHandlers() {
    if (window.__nkSidebarFallbackBound) return;
    window.__nkSidebarFallbackBound = true;

    document.addEventListener("click", function (event) {
      if (window.__nkAdminMenuBound) return;

      var menuBtn = event.target.closest("#open-menu-btn");
      if (menuBtn) {
        var sideMenu = document.querySelector(".side-menu");
        if (sideMenu) sideMenu.classList.toggle("toggle-side-menu");
        return;
      }

      var menuItem = event.target.closest(".side-menu-list > li > .menu-list-item");
      if (!menuItem) return;

      var parentLi = menuItem.parentElement;
      var currentSub = getDirectSubList(parentLi);
      if (!currentSub) return;

      event.preventDefault();

      var shouldOpen = currentSub.style.display !== "block";
      var topList = parentLi.parentElement ? Array.prototype.slice.call(parentLi.parentElement.children) : [];

      topList.forEach(function (li) {
        if (!li || li === parentLi) return;
        var otherSub = getDirectSubList(li);
        if (!otherSub) return;
        otherSub.style.display = "none";
      });

      currentSub.style.display = shouldOpen ? "block" : "none";
    });

    window.addEventListener("resize", function () {
      if (window.__nkAdminMenuBound) return;
      applyFallbackResponsiveState();
    });
  }

  function ensureSidebarBehavior(slot) {
    if (typeof window.initAdminSideMenu === "function") {
      window.initAdminSideMenu();
      return;
    }

    bindFallbackSidebarHandlers();
    applyFallbackResponsiveState();

    if (slot) {
      var activeSubMenus = slot.querySelectorAll(".side-menu-list li.active > .sub-list");
      activeSubMenus.forEach(function (subList) {
        subList.style.display = "block";
      });
    }
  }

  function normalizePath(value) {
    if (!value) return "";
    var output = value;
    try {
      output = decodeURIComponent(output);
    } catch (err) {
      output = value;
    }

    output = output.replace(/\\/g, "/").replace(/\/+/g, "/");
    if (output.length > 1 && output.endsWith("/")) output = output.slice(0, -1);
    return output.toLowerCase();
  }

  function joinPath(base, route) {
    var safeBase = base || "";
    if (safeBase && !safeBase.endsWith("/")) safeBase += "/";
    return safeBase + (route || "");
  }

  function applyResolvedPaths(slot, base) {
    slot.querySelectorAll("[data-route]").forEach(function (el) {
      var route = el.getAttribute("data-route");
      if (!route) return;
      el.setAttribute("href", joinPath(base, route));
    });

    slot.querySelectorAll("[data-route-src]").forEach(function (el) {
      var route = el.getAttribute("data-route-src");
      if (!route) return;
      el.setAttribute("src", joinPath(base, route));
    });
  }

  function clearActiveState(slot) {
    slot.querySelectorAll(".side-menu-list a.active, .side-menu-list a.is-active").forEach(function (el) {
      el.classList.remove("active");
      el.classList.remove("is-active");
    });

    slot.querySelectorAll(".side-menu-list li.active").forEach(function (el) {
      el.classList.remove("active");
    });
  }

  function applyActiveState(slot) {
    clearActiveState(slot);

    var currentPath = normalizePath(window.location.pathname || "");
    var links = Array.prototype.slice.call(slot.querySelectorAll(".side-menu-list a[data-route]"));

    var bestLink = null;
    var bestLength = -1;

    links.forEach(function (link) {
      var route = link.getAttribute("data-route") || "";
      var normalizedRoute = normalizePath("/" + route);
      if (!normalizedRoute) return;

      if (currentPath === normalizedRoute || currentPath.endsWith(normalizedRoute)) {
        if (normalizedRoute.length > bestLength) {
          bestLink = link;
          bestLength = normalizedRoute.length;
        }
      }
    });

    if (!bestLink) {
      var menuId = document.body.getAttribute("data-menu") || inferMenuIdFromPath(currentPath);
      if (!menuId) return;

      var menuLi = slot.querySelector("#" + menuId);
      if (!menuLi) return;

      menuLi.classList.add("active");

      var menuLink = menuLi.querySelector(".menu-list-item");
      if (menuLink) {
        menuLink.classList.add("active");
        menuLink.classList.add("is-active");
      }

      var subMenu = menuLi.querySelector(".sub-list");
      if (subMenu) subMenu.style.display = "block";
      return;
    }

    bestLink.classList.add("active");
    bestLink.classList.add("is-active");

    var directLi = bestLink.closest("li");
    if (directLi) directLi.classList.add("active");

    var parentSubList = bestLink.closest(".sub-list");
    if (parentSubList) {
      parentSubList.style.display = "block";
      var parentLi = parentSubList.closest("li");
      if (parentLi) parentLi.classList.add("active");
    }
  }

  function inferMenuIdFromPath(currentPath) {
    var mappings = [
      { segment: "/order-managment/", menuId: "menu-orders" },
      { segment: "/providers/", menuId: "menu-provider" },
      { segment: "/registration-questions/", menuId: "menu-registration-questions" },
      { segment: "/service managment/", menuId: "menu-services" },
      { segment: "/calander/", menuId: "menu-calendar" },
      { segment: "/patient list/", menuId: "menu-patients" },
      { segment: "/massages/", menuId: "menu-messages" },
      { segment: "/tracking/", menuId: "menu-tracking" },
      { segment: "/payment/", menuId: "menu-payments" },
      { segment: "/setting/", menuId: "menu-settings" },
      { segment: "/admin/", menuId: "menu-admin" }
    ];

    for (var i = 0; i < mappings.length; i += 1) {
      if (currentPath.indexOf(mappings[i].segment) !== -1) {
        return mappings[i].menuId;
      }
    }

    return "";
  }

  function sidebarLoadedEvent(slot) {
    var event = new CustomEvent("layout:sidebarLoaded", {
      bubbles: true,
      detail: { slot: slot }
    });
    document.dispatchEvent(event);
  }

  function loadSidebarIntoSlot(slot) {
    if (!slot || slot.dataset.loaded === "1") return Promise.resolve();

    var base = slot.getAttribute("data-base") || "";
    var partialPath = joinPath(base, "partials/sidebar.html");

    function hydrateSidebar(html) {
      slot.innerHTML = html;
      applyResolvedPaths(slot, base);
      applyActiveState(slot);
      ensureSidebarBehavior(slot);
      slot.dataset.loaded = "1";
      sidebarLoadedEvent(slot);
    }

    if (window.location.protocol === "file:") {
      hydrateSidebar(getInlineSidebarTemplate());
      return Promise.resolve();
    }

    return fetch(partialPath, { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Failed to load sidebar partial: " + response.status);
        }
        return response.text();
      })
      .then(function (html) {
        hydrateSidebar(html);
      })
      .catch(function (error) {
        console.error("[includes] sidebar load failed, using inline fallback", error);
        hydrateSidebar(getInlineSidebarTemplate());
      });
  }

  function initSharedSidebar() {
    var slots = Array.prototype.slice.call(document.querySelectorAll("#sidebar-slot"));
    if (!slots.length) return;

    Promise.all(
      slots.map(function (slot) {
        return loadSidebarIntoSlot(slot);
      })
    ).catch(function () {
      // fail silently, per-page content should remain accessible
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSharedSidebar);
  } else {
    initSharedSidebar();
  }
})();
