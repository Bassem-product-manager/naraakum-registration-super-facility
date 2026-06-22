window.renderFacilityDashboardShell = (function () {
  function breadcrumbHtml(items) {
    return items
      .map(function (item, index) {
        if (item.href) {
          return (
            '<li class="breadcrumb-item active" aria-current="page"><a href="' +
            item.href +
            '">' +
            item.label +
            "</a></li>"
          );
        }

        return (
          '<li class="breadcrumb-item active" aria-current="page">' +
          item.label +
          "</li>"
        );
      })
      .join("");
  }

  function shellHtml(title, breadcrumbs, contentHtml) {
    return (
      '<div id="full-container">' +
      '<aside class="side-menu">' +
      '<div class="side-menu-logo">' +
      '<img src="../assets/images/logo.svg" alt="Naraakum" />' +
      '<div class="facility-line">' +
      '<img class="facility-mini-logo" src="../assets/images/logo.svg" alt="BMC Logo" />' +
      '<p class="text-grey fsize-12 facility-name">BMC Hospital</p>' +
      "</div>" +
      '<p class="text-grey fsize-12">ID : FD-123456</p>' +
      "</div>" +
      '<ul class="side-menu-list" style="flex: 1; display: flex; flex-direction: column">' +
      '<li><a href="../index.html" class="menu-list-item" id="menu-home"><span>Home</span></a></li>' +
      '<li id="menu-orders"><a class="menu-list-item"><span>Order Management</span><i class="fi fi-rr-caret-down"></i></a>' +
      '<div class="sub-list">' +
      '<a href="../orders/orders-list.html"><i class="fi fi-rr-angle-small-right"></i><span>Orders List</span></a>' +
      '<a href="../orders/facility-insurance-requests.html"><i class="fi fi-rr-angle-small-right"></i><span>Insurance Queue</span></a>' +
      '<a href="../payments/transaction-orders.html"><i class="fi fi-rr-angle-small-right"></i><span>Transaction Orders</span></a>' +
      "</div></li>" +
      '<li id="menu-staff"><a class="menu-list-item"><span>Staff Management</span><i class="fi fi-rr-caret-down"></i></a>' +
      '<div class="sub-list">' +
      '<a href="../staff/staff-list.html"><i class="fi fi-rr-angle-small-right"></i><span>Staff List</span></a>' +
      '<a href="../staff/ratings.html"><i class="fi fi-rr-angle-small-right"></i><span>Ratings</span></a>' +
      '<a href="../staff/performance.html"><i class="fi fi-rr-angle-small-right"></i><span>Performance</span></a>' +
      '<a href="../staff/provider-add.html" class="add-provider-link"><span class="plus-icon">+</span><span>Add Provider</span></a>' +
      "</div></li>" +
      '<li id="menu-services"><a class="menu-list-item"><span>Services &amp; Packages</span><i class="fi fi-rr-caret-down"></i></a>' +
      '<div class="sub-list">' +
      '<a href="../services/services-list.html"><i class="fi fi-rr-angle-small-right"></i><span>Main Services</span></a>' +
      '<a href="../services/services.html"><i class="fi fi-rr-angle-small-right"></i><span>Services</span></a>' +
      '<a href="../services/facility-packages.html"><i class="fi fi-rr-angle-small-right"></i><span>Packages</span></a>' +
      '<a href="../services/custom-price.html"><i class="fi fi-rr-angle-small-right"></i><span>Custom Price</span></a>' +
      '<a href="../services/coupons.html"><i class="fi fi-rr-angle-small-right"></i><span>Coupons</span></a>' +
      '<a href="../services/service-add-step-1.html" class="add-provider-link"><span class="plus-icon">+</span><span>Add Service</span></a>' +
      "</div></li>" +
      '<li id="menu-calendar"><a class="menu-list-item"><span>Calendar</span><i class="fi fi-rr-caret-down"></i></a>' +
      '<div class="sub-list">' +
      '<a href="../calendar/branch-calendar.html"><i class="fi fi-rr-angle-small-right"></i><span>Branch Calendar</span></a>' +
      '<a href="../calendar/staff-calendar.html"><i class="fi fi-rr-angle-small-right"></i><span>Staff Calendar</span></a>' +
      "</div></li>" +
      '<li id="menu-patients"><a class="menu-list-item"><span>Patients</span><i class="fi fi-rr-caret-down"></i></a>' +
      '<div class="sub-list">' +
      '<a href="../patients/patients-list.html"><i class="fi fi-rr-angle-small-right"></i><span>Patients List</span></a>' +
      '<a href="../patients/patient-ratings.html"><i class="fi fi-rr-angle-small-right"></i><span>Patient Ratings</span></a>' +
      '<a href="../patients/patient-monitoring.html"><i class="fi fi-rr-angle-small-right"></i><span>Patient Monitoring</span></a>' +
      "</div></li>" +
      '<li id="menu-messages"><a class="menu-list-item"><span>Messages</span><i class="fi fi-rr-caret-down"></i></a>' +
      '<div class="sub-list">' +
      '<a href="../messages/messages.html"><i class="fi fi-rr-angle-small-right"></i><span>All Messages</span></a>' +
      '<a href="../messages/messages-staff.html"><i class="fi fi-rr-angle-small-right"></i><span>Staff Messages</span></a>' +
      '<a href="../messages/messages-patients.html"><i class="fi fi-rr-angle-small-right"></i><span>Patient Messages</span></a>' +
      '<a href="../messages/messages-system.html"><i class="fi fi-rr-angle-small-right"></i><span>System Messages</span></a>' +
      "</div></li>" +
      '<li><a href="../tracking/tracking.html" class="menu-list-item" id="menu-tracking"><span>Tracking</span></a></li>' +
      '<li id="menu-payments"><a class="menu-list-item"><span>Payments</span><i class="fi fi-rr-caret-down"></i></a>' +
      '<div class="sub-list">' +
      '<a href="../payments/transaction-orders.html"><i class="fi fi-rr-angle-small-right"></i><span>Transaction Orders</span></a>' +
      '<a href="../payments/deposits.html"><i class="fi fi-rr-angle-small-right"></i><span>Deposits</span></a>' +
      '<a href="../payments/tax-invoices.html"><i class="fi fi-rr-angle-small-right"></i><span>Tax Invoices</span></a>' +
      "</div></li>" +
      '<li id="menu-settings"><a class="menu-list-item"><span>Facility Settings</span><i class="fi fi-rr-caret-down"></i></a>' +
      '<div class="sub-list">' +
      '<a href="../settings/facility-information.html"><i class="fi fi-rr-angle-small-right"></i><span>Facility Information</span></a>' +
      '<a href="../settings/branches.html"><i class="fi fi-rr-angle-small-right"></i><span>Branches</span></a>' +
      '<a href="../settings/facility-insurance.html"><i class="fi fi-rr-angle-small-right"></i><span>Insurance</span></a>' +
      "</div></li>" +
      '<li id="menu-admin"><a class="menu-list-item"><span>Admin</span><i class="fi fi-rr-caret-down"></i></a>' +
      '<div class="sub-list">' +
      '<a href="../admin/admins.html"><i class="fi fi-rr-angle-small-right"></i><span>Admins</span></a>' +
      '<a href="../admin/roles-permissions.html"><i class="fi fi-rr-angle-small-right"></i><span>Roles &amp; Permissions</span></a>' +
      "</div></li>" +
      '<li id="menu-more"><a class="menu-list-item"><span>More</span><i class="fi fi-rr-caret-down"></i></a>' +
      '<div class="sub-list">' +
      '<a href="../more/terms.html"><i class="fi fi-rr-angle-small-right"></i><span>Terms &amp; Conditions</span></a>' +
      '<a href="../more/complaints.html"><i class="fi fi-rr-angle-small-right"></i><span>Complaints &amp; Suggestions</span></a>' +
      "</div></li>" +
      '<li style="margin-top: auto"><a href="../auth/logout.html" class="menu-list-item logout-link" id="menu-logout"><span>Log Out</span></a></li>' +
      "</ul>" +
      "</aside>" +
      '<main class="main-page">' +
      '<header class="page-header">' +
      '<div class="page-name">' +
      '<button type="button" id="open-menu-btn"><i class="fi fi-rr-menu-burger"></i></button>' +
      "<h2>" +
      title +
      "</h2>" +
      "</div>" +
      '<div class="member-side d-flex align-items-center gap-2">' +
      '<div class="Orders notifcation-box dropdown">' +
      '<div class="notifcation-icon" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">Notifications<span class="fsize-12 surface-secondary-400">13</span></div>' +
      '<ul class="dropdown-menu dropdown-menu-start">' +
      '<li class="dropdown-item d-flex justify-content-between align-items-center"><span class="fsize-14 text-grey">Type</span><span class="fsize-14 text-grey">Details</span></li>' +
      '<li class="dropdown-item"><a href="../orders/orders-list.html" class="d-flex justify-content-between align-items-center gap-2"><span class="d-flex align-items-center gap-2"><i class="fi fi-rr-shopping-bag"></i><span class="fsize-14 semiBold">New Order</span><span class="fsize-12 surface-secondary-400">BR03-OR-00012</span></span><span class="fsize-12 text-grey">30/08/2025 - 210.00 SAR</span></a></li>' +
      '<div class="dropdown-divider"></div>' +
      '<li><a href="../messages/messages-system.html" class="dropdown-item text-center fsize-14 semiBold">View All Notifications</a></li>' +
      "</ul></div>" +
      '<div class="ksa-clock" id="ksaClock" title="Saudi Arabia Time"><span class="time" id="ksaTime">--:-- --</span><span class="tz">KSA</span></div>' +
      '<div class="language-box"><a class="active" href="#"><img src="../assets/images/en.png" alt="En" /><span>En</span></a><a href="#"><img src="../assets/images/ar.jpg" alt="ar" /><span>AR</span></a></div>' +
      '<div class="user dropdown"><figure class="avatar dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside"><img src="../assets/images/avatar.svg" alt="avatar" /></figure>' +
      '<ul class="dropdown-menu"><li><div class="p-12 pb-0"><b class="fsize-14 semiBold">Sror Rashad</b><p class="fsize-12 text-grey">Admin / Facility Dashboard</p></div></li><div class="dropdown-divider"></div><li><a class="dropdown-item fsize-14" href="../admin/admins.html">Edit Profile</a></li><li><a class="dropdown-item fsize-14 switch-account-item" href="../auth/switch-account.html"><i class="fi fi-rr-refresh"></i><span>Switch Account</span></a></li><div class="dropdown-divider"></div><li><a class="dropdown-item text-red fsize-14" href="../auth/logout.html">Logout</a></li></ul>' +
      "</div>" +
      "</div>" +
      "</header>" +
      '<div class="page-root"><nav aria-label="breadcrumb"><ol class="breadcrumb">' +
      breadcrumbHtml(breadcrumbs) +
      "</ol></nav></div>" +
      '<div class="page-content">' +
      contentHtml +
      "</div>" +
      "</main>" +
      "</div>"
    );
  }

  function tickClock() {
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
      } catch (e) {
        el.textContent = new Date().toLocaleTimeString("en-US", { hour12: true });
      }
    }

    tick();
    window.clearInterval(window.__facilityShellClock);
    window.__facilityShellClock = window.setInterval(tick, 1000);
  }

  return function renderFacilityDashboardShell(options) {
    var mount = document.getElementById(options.mountId || "app");
    if (!mount) return;

    mount.innerHTML = shellHtml(options.title, options.breadcrumbs || [], options.contentHtml || "");
    tickClock();
  };
})();
