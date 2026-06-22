$(document).ready(function () {
 
  $(".sports-slider").owlCarousel({
    items: 1,
    animateIn: 'fadeIn',
    animateOut: 'fadeOut',
    loop: true,
    autoplay: true,
    autoplayTimeout: 4000,
    smartSpeed: 800,
    autoplayHoverPause: false,
    nav: false,
    dots: false,
    // navText: ["", ""],
    // mouseDrag: false,
    // touchDrag:false,
    // pullDrag:false,
    // freeDrag:false,
    // stagePadding: 0,
    // margin: 0,
    // responsiveClass: false,
    // rtl: true,
  });

    //features-slider
  $(".features-slider").owlCarousel({
    loop: false,
    margin: 16,
    autoplay: false,
    autoplayTimeout: 5000,
    smartSpeed: 800,
    autoplayHoverPause: false,
    responsiveClass: false,
    nav: true,
    navText: ["", ""],
    dots: true,
    responsive: {
      0: {
        items: 1.2,
        center: true,
        loop: true,
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


  
});
