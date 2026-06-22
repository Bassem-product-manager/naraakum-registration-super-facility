$(function () {
  // Sticky Navigation
  let lastScroll = 0;
  const $nav = $("#mainNav");

  $(window).on("scroll", function () {
    const currentScroll = $(this).scrollTop();
    $nav.css("top", currentScroll > lastScroll ? "-100px" : "0");
    lastScroll = currentScroll;
  });

  // Sub Menu Hover / Click
  function initDropMenu() {
    if ($(window).width() >= 1280) {
      $(".linksBox > ul > li > button.drop-arrow").off("click");
      $(".linksBox > ul > li").hover(
        function () {
          $(this).children(".drop-menu").stop(true, true).fadeIn(300);
        },
        function () {
          $(this).children(".drop-menu").stop(true, true).fadeOut(200);
        }
      );
    } else {
      $(".linksBox > ul > li").off("mouseenter mouseleave");
      $(".linksBox > ul > li > button.drop-arrow")
        .off("click")
        .on("click", function (e) {
          e.preventDefault();
          const $menu = $(this).siblings(".drop-menu");

          $(".drop-menu").not($menu).slideUp(200);

          $menu.stop(true, true).slideToggle(200);
        });
    }
  }

  initDropMenu();
  $(window).on("resize", initDropMenu);

  // Side Navigation
  function sideNavigation() {
    if ($(window).width() < 1280) {
      $(".linksBox").addClass("side-nav");
    } else {
      $(".linksBox").removeClass("side-nav").css("width", "");
      $("body").css("overflow", "inherit");
      $(".nav-backdrop").hide();
    }
  }
  sideNavigation();

  $(window).on("resize", sideNavigation);

  $(".open-side-menu").on("click", function () {
    $(".linksBox").css("width", "250px");
    $("body").css("overflow-y", "hidden");
    $(".nav-backdrop").css("display", "block");
  });

  $(".nav-backdrop").on("click", function () {
    $(".linksBox").css("width", "0");
    $(this).fadeOut();
    $("body").css("overflow-y", "inherit");
  });


  /*/*/

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

 

});
