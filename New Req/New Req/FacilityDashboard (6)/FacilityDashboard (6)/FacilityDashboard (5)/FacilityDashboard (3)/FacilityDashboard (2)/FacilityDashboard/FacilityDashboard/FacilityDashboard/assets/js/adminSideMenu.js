$(document).ready(function () {
  // preloader -----------------------------------------------
  $(".preloader").fadeOut("slow");

  // tooltip ---------------------------------------
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  // Ensure active menu items are expanded on load
  $(".side-menu-list > li.active > .sub-list").show();

  // Guard: If shared-layout.js is active, skip the legacy sidebar toggle
  if (!window.isSharedLayout) {
    // Toggle side menu ------------------------------------------------
    $("#open-menu-btn").click(function () {
      $(".side-menu").toggleClass("toggle-side-menu");
    });

    // resposive hide Menu ---------------------------------------
    function hideSideMenu() {
      if ($(window).width() < 1200) {
        $(".side-menu").addClass("toggle-side-menu");
      } else {
        $(".side-menu").removeClass("toggle-side-menu");
      }
    }
    hideSideMenu();
    $(window).resize(function () {
      hideSideMenu();
    });

    // Sub menu ------------------------------------------------
    $(".side-menu-list > li > .menu-list-item").click(function () {
      const $sub = $(this).parent().find(".sub-list");
      if ($sub.length) {
        $sub.slideToggle(200);
        $(this).parent().siblings().children().next().slideUp(200);
        return false; // prevent navigation only when toggling sub-menu
      }
      // otherwise allow link navigation to proceed
    });
  }
  const tooltipList = [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );

  // Auto-set active sidebar link based on current page filename
  (function () {
    try {
      const path = window.location.pathname || "";
      const file = path.substring(path.lastIndexOf("/") + 1) || "index.html";
      // match links that end with the current filename (handles relative hrefs)
      const $links = $(`.side-menu-list a[href$="${file}"]`);
      if ($links.length) {
        $links.each(function () {
          $(this).addClass("active");
          const $li = $(this).closest("li");
          $li.addClass("active");
          const $parent = $(this).closest(".sub-list");
          if ($parent.length) $parent.show();
        });
      }
    } catch (err) {
      // fail silently
    }
  })();
});
