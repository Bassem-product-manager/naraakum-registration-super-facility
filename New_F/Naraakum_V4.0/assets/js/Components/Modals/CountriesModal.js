(function() {
  const countryRadios = document.querySelectorAll(
    '#Modal-countries-list input[type="radio"]'
  );
  const submitButton = document.querySelector('[data-name="submit-country"]');

  // اجعل الزر مفعل إذا كانت أي دولة مختارة مسبقًا
  submitButton.disabled = ![...countryRadios].some(radio => radio.checked);

  // استمع لأي تغيير في اختيار الدولة
  countryRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      submitButton.disabled = false; // فعّل الزر عند اختيار دولة
    });
  });
})();


