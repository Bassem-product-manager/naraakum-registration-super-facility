$(function () {
  // زرار اختيار الصيدلية
  document.querySelectorAll('[data-name="Ph-select-btn"]').forEach((btn) => {
    btn.addEventListener("click", function () {
      const card = this.closest(".providerCard");
      card.classList.add("ph-selected");
    });
  });

  // زرار الإلغاء
  document.querySelectorAll('[data-name="Ph-reset-btn"]').forEach((btn) => {
    btn.addEventListener("click", function () {
      const card = this.closest(".providerCard");
      card.classList.remove("ph-selected");
    });
  });
});



