$(function () {
  // زرار اختيار الصيدلية
  document.querySelectorAll('[data-name="pro-select-btn"]').forEach((btn) => {
    btn.addEventListener("click", function () {
      const card = this.closest(".providerCard");
      card.classList.add("pro-selected");
    });
  });

  // زرار الإلغاء
  document.querySelectorAll('[data-name="pro-reset-btn"]').forEach((btn) => {
    btn.addEventListener("click", function () {
      const card = this.closest(".providerCard");
      card.classList.remove("pro-selected");
    });
  });
});
