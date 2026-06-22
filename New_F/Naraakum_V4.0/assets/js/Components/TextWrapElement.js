$(function () {
  let limit = 40;

  document.querySelectorAll(".text-wrap-element").forEach(function (wrapper) {
    let textElement = wrapper.querySelector(".text");
    let toggleBtn = wrapper.querySelector(".show-full-text");

    let fullText = textElement.textContent.trim();

    if (fullText.length > limit) {
      let shortText = fullText.substring(0, limit) + "...";
      textElement.textContent = shortText;
      toggleBtn.textContent = "المزيد";

      toggleBtn.onclick = function () {
        if (toggleBtn.textContent === "المزيد") {
          textElement.textContent = fullText;
          toggleBtn.textContent = "اخفاء";
        } else {
          textElement.textContent = shortText;
          toggleBtn.textContent = "المزيد";
        }
      };
    }
  });
});
