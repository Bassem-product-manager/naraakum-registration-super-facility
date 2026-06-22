(function () {
  const searchInput = document.querySelectorAll(".specialty-search");
  const listItems = document.querySelectorAll(".Modal-specialties-list li");
  const specialtyRadios = document.querySelectorAll(
    '.Modal-specialties-list input[type="radio"]',
  );
  const submitSpecialtyButton = document.querySelectorAll(
    '[data-name="submit-specialty"]',
  );

  submitSpecialtyButton.forEach((button) => {
    button.disabled = true;
  });

  searchInput.forEach((input) => {
    input.addEventListener("input", function () {
      const query = this.value.trim().toLowerCase();
      listItems.forEach((li) => {
        const text = li.querySelector("p").textContent.toLowerCase();
        li.style.display = text.includes(query) ? "" : "none";
      });
    });
  });

  specialtyRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      submitSpecialtyButton.forEach((button) => {
        button.disabled = false;
      });
    });
  });
})();
