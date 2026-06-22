/**
 * Shared Layout (Sidebar & Navbar) Injection
 * Extracted from Defult.html to be used across pages.
 */

const sidebarHTML = `
<aside class="side-menu" style="display:flex;flex-direction:column;">
  <div class="side-menu-logo">
    <img src="assets/images/logo.svg" alt="Naraakum" />
    <p class="text-grey fsize-12">BMC Dashboard / ID: 999999</p>
  </div>

  <ul class="side-menu-list" style="flex:1;display:flex;flex-direction:column;">
    <li>
      <a href="index.html" class="menu-list-item" id="menu-home"><span>Home</span></a>
    </li>

    <li>
      <a href="OrderManagement.html" class="menu-list-item" id="menu-orders"><span>Order Management</span></a>
    </li>

    <!-- Staff Management -->
    <li id="menu-staff">
      <a class="menu-list-item">
        <span>Staff Management</span>
        <i class="fi fi-rr-caret-down"></i>
      </a>
      <div class="sub-list">
        <a href="StaffManagement.html">
          <i class="fi fi-rr-angle-small-right"></i>
          <span>Staff</span>
        </a>

        <a href="AddEmployee.html" class="add-provider-link">
          <span class="plus-icon">+</span>
          <span>Add Provider</span>
        </a>

        <a href="Rating.html">
          <i class="fi fi-rr-angle-small-right"></i>
          <span>Rating</span>
        </a>

        <a href="PerformanceFollowUp.html">
          <i class="fi fi-rr-angle-small-right"></i>
          <span>Performance</span>
        </a>
      </div>
    </li>

    <!-- Services & Packages -->
    <li id="menu-services">
      <a class="menu-list-item">
        <span>Services &amp; Packages</span>
        <i class="fi fi-rr-caret-down"></i>
      </a>

      <div class="sub-list">
        <a href="ServicesAndPackages.html">
          <i class="fi fi-rr-angle-small-right"></i>
          <span>Main Services</span>
        </a>

        <a href="AddNewServices_Step1.html" class="add-provider-link">
          <span class="plus-icon">+</span>
          <span>Add Services</span>
        </a>

        <a href="CustomPrice.html">
          <i class="fi fi-rr-angle-small-right"></i>
          <span>Custom Price</span>
        </a>

        <a href="Rates.html">
          <i class="fi fi-rr-angle-small-right"></i>
          <span>Rates</span>
        </a>

        <a href="Coupons.html">
          <i class="fi fi-rr-angle-small-right"></i>
          <span>Coupons</span>
        </a>
      </div>
    </li>

    <!-- Tracking -->


    <!-- Manage Calendar (Dropdown) -->
    <li id="menu-calendar">
      <a class="menu-list-item">
        <span>Manage Calendar</span>
        <i class="fi fi-rr-caret-down"></i>
      </a>

      <div class="sub-list">
        <a href="ManageCalendar.html#branch">
          <i class="fi fi-rr-angle-small-right"></i>
          <span>Branch Calendar</span>
        </a>

        <a href="ManageCalendar.html#staff">
          <i class="fi fi-rr-angle-small-right"></i>
          <span>Staff Calendar</span>
        </a>
      </div>
    </li>


    <!-- List of Patients -->
    <li id="menu-patients">
      <a class="menu-list-item">
        <span>List of Patients</span>
        <i class="fi fi-rr-caret-down"></i>
      </a>

      <div class="sub-list">
        <a href="MoreServices.html"><i class="fi fi-rr-angle-small-right"></i><span>List of Patients</span></a>
        <a href="MoreServices.html"><i class="fi fi-rr-angle-small-right"></i><span>Rate</span></a>
      </div>
    </li>
    
    <!-- Messages -->
    <li id="menu-messages">
      <a class="menu-list-item">
        <span>Messages</span>
        <i class="fi fi-rr-caret-down"></i>
      </a>

      <div class="sub-list">
        <a href="Messages.html"><i class="fi fi-rr-angle-small-right"></i><span>All</span></a>
        <a href="Messages.html?type=Staff"><i class="fi fi-rr-angle-small-right"></i><span>Staff</span></a>
        <a href="Messages.html?type=Patients"><i class="fi fi-rr-angle-small-right"></i><span>Patient</span></a>
        <a href="Messages.html?type=System"><i class="fi fi-rr-angle-small-right"></i><span>System</span></a>
      </div>
    </li>

    <!-- Payment Management -->
    <li id="menu-payment">
      <a class="menu-list-item">
        <span>Payment Management</span>
        <i class="fi fi-rr-caret-down"></i>
      </a>

      <div class="sub-list">
        <a href="TransactionOrders.html"><i class="fi fi-rr-angle-small-right"></i><span>Transaction
            Orders</span></a>
        <a href="Deposits.html"><i class="fi fi-rr-angle-small-right"></i><span>Deposits</span></a>
        <a href="TaxInvoices.html"><i class="fi fi-rr-angle-small-right"></i><span>Tax Invoices</span></a>

      </div>
    </li>

    <!-- Facility Settings -->
    <li id="menu-facility">
      <a class="menu-list-item">
        <span>Facility Settings</span>
        <i class="fi fi-rr-caret-down"></i>
      </a>

      <div class="sub-list">
        <a href="HospitalInformation.html"><i class="fi fi-rr-angle-small-right"></i><span> facility
            Information</span></a>
        <a href="PaymentMethod.html"><i class="fi fi-rr-angle-small-right"></i><span>Payment Method</span></a>
        <a href="Branches.html"><i class="fi fi-rr-angle-small-right"></i><span>Branches</span></a>
      </div>
    </li>
    
    <li>
      <a href="Tracking.html" class="menu-list-item"><span>Tracking</span></a>
    </li>

    <li id="menu-admin">
      <a class="menu-list-item">
        <span>Admin</span>
        <i class="fi fi-rr-caret-down"></i>
      </a>

      <div class="sub-list">
        <a href="MoreServices.html"><i class="fi fi-rr-angle-small-right"></i><span>Admins</span></a>
        <a href="MoreServices.html"><i class="fi fi-rr-angle-small-right"></i><span>Role & permission</span></a>
      </div>
    </li>
    
    <!-- More -->
    <li id="menu-more">
      <a class="menu-list-item">
        <span>More</span>
        <i class="fi fi-rr-caret-down"></i>
      </a>

      <div class="sub-list">
        <a href="Terms.html"><i class="fi fi-rr-angle-small-right"></i><span>Terms and Conditions</span></a>
        <a href="Complaints.html"><i class="fi fi-rr-angle-small-right"></i><span>Complaint &amp;
            Suggestions</span></a>
      </div>
    </li>

    <li style="margin-top:auto;">
      <a href="Logout.html" class="menu-list-item logout-link"><span>Log Out</span></a>
    </li>
  </ul>
</aside>
`;

const navbarHTML = `
<header class="page-header">
  <div class="page-name">
    <button type="button" id="open-menu-btn">
      <i class="fi fi-rr-menu-burger"></i>
    </button>
    <h2 id="page-header-title">Page Title</h2>
  </div>

  <div class="member-side d-flex align-items-center gap-2">
    <!-- Notifications -->
    <div class="Orders notifcation-box dropdown">
      <div class="notifcation-icon" data-bs-toggle="dropdown" aria-expanded="false" data-bs-auto-close="outside">
        Notifications
        <span class="fsize-12 surface-secondary-400">10+</span>
      </div>

      <ul class="dropdown-menu dropdown-menu-start">
        <li class="dropdown-item d-flex justify-content-between">
          <span class="fsize-14 text-grey">Title</span>
          <span class="fsize-14 text-grey">Time</span>
        </li>
        <li class="dropdown-item">
          <a href="#" class="d-flex justify-content-between">
            <span class="fsize-14 semiBold">New request</span>
            <span class="fsize-14 bold">Now</span>
          </a>
        </li>
        <div class="dropdown-divider"></div>
        <li><a href="#" class="dropdown-item text-center fsize-14 semiBold">View all</a></li>
      </ul>
    </div>
    
    <!-- Clock Host -->
    <div id="ksaClockHost" class="ms-1"></div>

    <div class="language-box">
      <a class="active" href="#"><img src="assets/images/en.png" alt="En" /><span>En</span></a>
      <a href="#"><img src="assets/images/ar.jpg" alt="AR" /><span>AR</span></a>
    </div>

    <div class="user dropdown">
      <figure class="avatar dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
        <img src="assets/images/avatar.svg" alt="avatar" />
      </figure>
      <ul class="dropdown-menu">
        <li>
          <div class="p-12 pb-0">
            <b class="fsize-14 bold">Abeer Owdeh</b>
            <p class="fsize-12 text-grey mb-1" style="white-space: nowrap;">Role : Admin / BMC Dashboard</p>
            <p class="fsize-12 text-grey"> </p>
          </div>
        </li>
        <div class="dropdown-divider"></div>
        <li><a class="dropdown-item fsize-14" href="#">Edit My info</a></li>
        <li><a class="dropdown-item text-red fsize-14" href="#">Logout</a></li>
      </ul>
    </div>
  </div>
</header>
`;

/**
 * Inject the Sidebar and Navbar into the page.
 * @param {string} activeMenuId - The ID of the menu item to set as active (e.g. 'menu-calendar').
 * @param {string} pageTitle - The title to display in the header (optional).
 */
function injectLayout(activeMenuId, pageTitle) {
  // Flag to prevent adminSideMenu.js from running conflicting logic
  window.isSharedLayout = true;

  // 0. Inject CSS (Robustness Fix: Ensure shared-layout.css is loaded)
  if (!document.querySelector('link[href*="shared-layout.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'assets/css/shared-layout.css';
    document.head.appendChild(link);
  }

  // 1. Inject Sidebar (prepend to #full-container)
  const fullContainer = document.getElementById('full-container');
  if (fullContainer) {
    fullContainer.insertAdjacentHTML('afterbegin', sidebarHTML);
  }

  // 2. Inject Navbar (prepend to .main-page)
  const mainPage = document.querySelector('.main-page');
  if (mainPage) {
    mainPage.insertAdjacentHTML('afterbegin', navbarHTML);
  }

  // 3. Set Page Title if provided
  if (pageTitle) {
    const titleEl = document.getElementById('page-header-title');
    if (titleEl) titleEl.textContent = pageTitle;
  }

  // 4. Set Active Menu Item
  if (activeMenuId) {
    const activeItem = document.getElementById(activeMenuId);
    if (activeItem) {
      activeItem.classList.add('active');
    }
  } else {
    // Auto-detect based on current URL if activeMenuId is not provided
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const link = document.querySelector(`.side-menu-list a[href^="${path}"]`);
    if (link) {
      const parentLi = link.closest('li');
      if (parentLi) parentLi.classList.add('active');
    }
  }

  // 5. Initialize Sidebar Collapse Functionality
  initSidebarCollapse();

  // 6. Initialize KSA Clock (since the host div is now injected)
  initKsaClock();
}

/**
 * Initialize Sidebar Collapse/Expand Functionality
 */
function initSidebarCollapse() {
  // Get all menu items with sub-lists
  const menuItemsWithSubs = document.querySelectorAll('.side-menu-list > li > a.menu-list-item');
  
  menuItemsWithSubs.forEach(menuLink => {
    // Check if this menu item has a sub-list (dropdown)
    const parentLi = menuLink.parentElement;
    const subList = parentLi.querySelector('.sub-list');
    
    if (subList) {
      // Add click handler
      menuLink.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Toggle this menu item
        const wasActive = parentLi.classList.contains('active');
        
        // Close all other open menus
        document.querySelectorAll('.side-menu-list > li.active').forEach(li => {
          if (li !== parentLi) {
            li.classList.remove('active');
          }
        });
        
        // Toggle current menu
        if (wasActive) {
          parentLi.classList.remove('active');
        } else {
          parentLi.classList.add('active');
        }
      });
    }
  });

  // Mobile menu toggle
  const menuBtn = document.getElementById('open-menu-btn');
  const sidebar = document.querySelector('.side-menu');
  
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', function() {
      sidebar.classList.toggle('toggle-side-menu');
    });
  }

  // Responsive Behavior: Auto-collapse on small screens
  function handleResize() {
    if (window.innerWidth < 1200) {
      sidebar.classList.add('toggle-side-menu');
    } else {
      sidebar.classList.remove('toggle-side-menu');
    }
  }
  
  if (sidebar) {
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
  }
}

/**
 * Initialize the KSA Clock script
 */
function initKsaClock() {
    var host = document.getElementById("ksaClockHost");
    if (!host) return;

    // ✅ FIX: Check if clock already exists to prevent duplication
    if (host.querySelector('.nk-clock-chip')) {
      return; // Clock already initialized, skip
    }

    host.innerHTML = `
        <div class="nk-clock-chip" title="Saudi Arabia Time">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 6v6l4 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="t" id="ksaTimeTxt">--:--</span>
          <span class="tz">KSA</span>
        </div>
      `;

    var txt = document.getElementById("ksaTimeTxt");
    function tick() {
      var now = new Date();
      if(txt) {
          txt.textContent = new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Riyadh",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
          }).format(now);
      }
    }
    tick();
    setInterval(tick, 1000);
}
