$(function () {
  const stars = document.querySelectorAll('input[name="star"]');
  const result = document.getElementById("ratingResult");

  stars.forEach((star) => {
    star.addEventListener("change", () => {
      result.textContent = "التقييم المختار: " + star.value + " من 5";
    });
  });
});
