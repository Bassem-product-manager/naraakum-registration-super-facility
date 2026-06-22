$(document).ready(function () {
  // preloader -----------------------------------------------
  $(".preloader").fadeOut("slow");

    // sticky Nav -----------------------------------------------
    $(window).scroll(function(){
      var scroll = $(window).scrollTop();
      if (scroll > 80) {
        $(".sticky-navigation").addClass("nav-shadow");
      }
      else{
        $(".sticky-navigation").removeClass("nav-shadow");
      }
    })

});
