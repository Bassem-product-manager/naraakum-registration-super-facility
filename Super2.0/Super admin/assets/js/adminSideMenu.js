(function ($) {
  if (!$) return;

  function initTooltips() {
    if (typeof bootstrap === "undefined" || !bootstrap.Tooltip) return;
    var tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    Array.prototype.slice.call(tooltipTriggerList).forEach(function (tooltipTriggerEl) {
      bootstrap.Tooltip.getOrCreateInstance(tooltipTriggerEl);
    });
  }

  function setActiveByCurrentPath() {
    var path = window.location.pathname || "";
    var file = path.substring(path.lastIndexOf("/") + 1) || "template.html";
    var $links = $('.side-menu-list a[href$="' + file + '"]');

    if (!$links.length) return;

    $links.each(function () {
      var $link = $(this);
      $link.addClass("active is-active");

      var $li = $link.closest("li");
      $li.addClass("active");

      var $parentSub = $link.closest(".sub-list");
      if ($parentSub.length) {
        $parentSub.show();
        $parentSub.closest("li").addClass("active");
      }
    });
  }

  function applyResponsiveMenuState() {
    if ($(window).width() < 1200) {
      $(".side-menu").addClass("toggle-side-menu");
    } else {
      $(".side-menu").removeClass("toggle-side-menu");
    }
  }

  function bindMenuHandlers() {
    if (window.__nkAdminMenuBound) return;
    window.__nkAdminMenuBound = true;

    $(document).on("click.nkMenuToggle", "#open-menu-btn", function () {
      $(".side-menu").toggleClass("toggle-side-menu");
    });

    $(window).on("resize.nkMenuResize", function () {
      applyResponsiveMenuState();
    });

    $(document).on("click.nkMenuSubToggle", ".side-menu-list > li > .menu-list-item", function (event) {
      var $menuItem = $(this);
      var $subMenu = $menuItem.parent().children(".sub-list");

      if (!$subMenu.length) return;

      event.preventDefault();
      $subMenu.stop(true, true).slideToggle(200);

      $menuItem
        .parent()
        .siblings()
        .children(".sub-list")
        .stop(true, true)
        .slideUp(200);
    });
  }

  function initAdminSideMenu() {
    bindMenuHandlers();
    $(".preloader").fadeOut("slow");
    initTooltips();
    applyResponsiveMenuState();

    $(".side-menu-list > li.active > .sub-list").show();
    setActiveByCurrentPath();
  }

  window.initAdminSideMenu = initAdminSideMenu;

  $(document).ready(function () {
    bindMenuHandlers();
    initAdminSideMenu();
  });

  document.addEventListener("layout:sidebarLoaded", function () {
    bindMenuHandlers();
    initAdminSideMenu();
  });
})(window.jQuery);
