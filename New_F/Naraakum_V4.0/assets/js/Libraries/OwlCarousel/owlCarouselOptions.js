$(document).ready(function () {
  // Hero Services Carousel
  $(".ServicesCarousel.owl-carousel").owlCarousel({
    loop: false,
    rtl: true,
    margin: 16,
    autoplay: false,
    autoplayTimeout: 5000,
    smartSpeed: 800,
    autoplayHoverPause: false,
    nav: true,
    navText: ["", ""],
    dots: true,

    responsive: {
      0: {
        items: 1,
        stagePadding: 24, // ← بديل آمن لـ items:1.2
        loop: false,
        center: false,
        mouseDrag: true,
        touchDrag: true,
        nav: false,
      },

      600: {
        items: 2,
        stagePadding: 24, // ← بديل آمن لـ items:1.2
        loop: false,
        center: false,
        mouseDrag: true,
        touchDrag: true,
        nav: false,
      },

      768: {
        items: 3,
        stagePadding: 24, // ← بديل آمن لـ items:1.2
        loop: false,
        center: false,
        mouseDrag: true,
        touchDrag: true,
        nav: false,
      },

      1200: {
        items: 4,
        mouseDrag: false,
        touchDrag: false,
        pullDrag: false,
        freeDrag: false,
      },
    },
  });

  // Hero HomeVisits Carousel
  $(".HomeVisitsCarousel").owlCarousel({
    loop: false,
    rtl: true,
    margin: 16,
    autoplay: false,
    autoplayTimeout: 5000,
    smartSpeed: 800,
    autoplayHoverPause: false,
    nav: true,
    navText: ["", ""],
    dots: true,

    responsive: {
      0: {
        items: 2,
        stagePadding: 24, // ← بديل آمن لـ items:1.2
        loop: false,
        center: false,
        mouseDrag: true,
        touchDrag: true,
        nav: false,
      },

      600: {
        items: 3,
        stagePadding: 24, // ← بديل آمن لـ items:1.2
        loop: false,
        center: false,
        mouseDrag: true,
        touchDrag: true,
        nav: false,
      },

      768: {
        items: 4,
        stagePadding: 24, // ← بديل آمن لـ items:1.2
        loop: false,
        center: false,
        mouseDrag: true,
        touchDrag: true,
        nav: false,
      },

      1200: {
        items: 6,
        mouseDrag: false,
        touchDrag: false,
        pullDrag: false,
        freeDrag: false,
      },
    },
  });

  //bolgCarouselr
  $(".bolgCarousel").owlCarousel({
    loop: false,
    rtl: true,
    margin: 16,
    autoplay: false,
    autoplayTimeout: 5000,
    smartSpeed: 800,
    autoplayHoverPause: false,
    // responsiveClass: false,
    nav: true,
    navText: ["", ""],
    dots: true,
    responsive: {
      0: {
        items: 1,
        stagePadding: 24, // ← بديل آمن لـ items:1.2

        loop: false,
        mouseDrag: true,
        touchDrag: true,
        nav: false,
      },
      600: {
        items: 2,
      },
      768: {
        items: 3,
        mouseDrag: true,
        touchDrag: true,
      },

      1200: {
        items: 4,
        mouseDrag: false,
        touchDrag: false,
        pullDrag: false,
        freeDrag: false,
      },
    },
  });

  //ph card AvailableProductsItems
  $(".AvailableProductsItems").owlCarousel({
    rtl: true,
    margin: 8,
    loop: false,
    autoWidth: true,
    nav: false,
    navText: ["", ""],
    dots: false,
  });

  //ph card AvailableProductsItems
  $(".pharmacyTabsCarousel").owlCarousel({
    rtl: true,
    margin: 8,
    loop: false,
    autoWidth: true,
    nav: false,
    navText: ["", ""],
    dots: false,
    mouseDrag: false,
  });
  //PharmacyOptionsRow
  $(".PharmacyOptionsRow").owlCarousel({
    rtl: true,
    margin: 8,
    loop: false,
    autoWidth: true,
    nav: false,
    navText: ["", ""],
    dots: false,
    mouseDrag: true,
  });

  //SummaryTabsItems
  $(".SummaryTabsItems").owlCarousel({
    rtl: true,
    margin: 8,
    loop: false,
    autoWidth: true,
    nav: false,
    navText: ["", ""],
    dots: false,
    mouseDrag: true,
  });

  // radioCarousel
  $(".radioCarousel").owlCarousel({
    rtl: true,
    margin: 8,
    loop: false,
    dots: false,
    nav: true,
    navText: ["", ""],

    responsive: {
      0: {
        autoWidth: true,
        mouseDrag: false,
        touchDrag: true,
      },
      1200: {
        items: 5,
        mouseDrag: false,
        touchDrag: false,
        pullDrag: false,
        freeDrag: false,
      },
    },
  });
});
