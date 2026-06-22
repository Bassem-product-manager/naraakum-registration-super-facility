const multipleSelectDropdown = document.querySelectorAll(
    ".multiple-select-dropdown"
  );

  multipleSelectDropdown.forEach((item) => {
    item.addEventListener("click", () => {
      const selectedOptions = [];
      const checkboxes = item.querySelectorAll(".form-check-input");
      const selectedList = item.querySelector(".selected-items");
      selectedList.innerHTML = "";

      checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
          selectedOptions.push(checkbox.value);
        }
      });
 
      if (selectedOptions.length === 0) {
        selectedList.innerHTML = "----";
      } else {
        selectedOptions.forEach((option) => {
          const listItem = document.createElement("span");
          listItem.textContent = option;
          selectedList.appendChild(listItem);
        });
      }
    });
    
  });