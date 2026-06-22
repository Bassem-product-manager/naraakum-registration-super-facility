$(function () {
  const icons = document.querySelectorAll(".favIcon");

  icons.forEach(function (icon) {
    icon.addEventListener("click", function () {
      if (icon.classList.contains("fi-rr-heart")) {
        // تفعيل المفضلة
        icon.classList.remove("fi-rr-heart");
        icon.classList.add("fi-sr-heart");
      } else {
        // إلغاء التفعيل
        icon.classList.remove("fi-sr-heart");
        icon.classList.add("fi-rr-heart");
      }
    });
  });
});
