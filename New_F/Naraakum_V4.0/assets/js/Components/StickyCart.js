$(function () {
    let lastScroll2 = 0;
const $cartBox = $(".StickyCartBox");
const defaultTop = 24; // القيمة الأصلية من الـ SASS

$(window).on("scroll", function () {
  const currentScroll = $(this).scrollTop();

  if (currentScroll < lastScroll2) {
    // المستخدم بيرجع لفوق → زود المسافة من الأعلى
    let newTop = defaultTop + 80; // 20px زيادة كمثال
    $cartBox.css("top", newTop + "px");
  } else {
    // المستخدم بينزل → رجع القيمة الافتراضية
    $cartBox.css("top", defaultTop + "px");
  }

  lastScroll2 = currentScroll;
});

});