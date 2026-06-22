// Function to handle the "Select All" checkbox
function toggleCheckboxes(selectAllCheckbox) {
    const checkboxes = document.querySelectorAll(".row-checkbox");
    checkboxes.forEach((checkbox) => {
      checkbox.checked = selectAllCheckbox.checked;
      toggleRowBackground(checkbox); // Update row background
    });
    updateActionButtonState(); // Update button state based on checkboxes
  }
  
  // Function to update the background color of the selected row
  function toggleRowBackground(checkbox) {
    const row = checkbox.closest("tr");
    if (checkbox.checked) {
      row.classList.add("selected-row");
    } else {
      row.classList.remove("selected-row");
    }
    updateActionButtonState(); // Update button state whenever a row checkbox is clicked
  }
  
  // Function to update the action button state (enabled/disabled)
  function updateActionButtonState() {
    const checkboxes = document.querySelectorAll(".row-checkbox");
    const actionButton = document.getElementById("actionButton");
    const checkedCheckboxes = Array.from(checkboxes).filter(
      (checkbox) => checkbox.checked
    );
    actionButton.disabled = checkedCheckboxes.length === 0;

    // == hidden item when select more than row
    const hiddenItems =  document.querySelectorAll(".hidden-item-when-select-all");
    if(checkedCheckboxes.length>1){
      hiddenItems.forEach(element => {
        element.style.display="none";
      });
    }else{
      hiddenItems.forEach(element => {
        element.style.display="block";
      });
    }
  
  }