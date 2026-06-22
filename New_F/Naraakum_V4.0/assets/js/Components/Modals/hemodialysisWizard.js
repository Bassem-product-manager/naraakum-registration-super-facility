
// -------------------------------WIZARD------------------------------------------
let currentStep = 0;
const steps = document.querySelectorAll(".wizard-step");
// Show the current step
function showStep() {
  steps.forEach((step, index) => {
    step.classList.remove("active");
    if (index === currentStep) {
      step.classList.add("active");
    }
  });
}

// Move forward or backward through the steps
function moveStep(step) {
  currentStep += step;
  // Prevent going beyond the range of steps
  if (currentStep < 0) {
    currentStep = 0;
  } else if (currentStep >= steps.length) {
    currentStep = steps.length - 1;
  }
  showStep();
}
showStep();

// ------------------------------- dates & Slots ----------------------------------
let dateEl = document.querySelectorAll(".modal-date-bar .date-btn-item");
let slotsEl = document.querySelectorAll(".modal-slots-list .slots-item");

for (let i = 0; i < dateEl.length; i++) {
  dateEl[i].onclick = function () {
    var c = 0;
    while (c < dateEl.length) {
      dateEl[c++].className = "date-btn-item";
    }
    dateEl[i].className = "date-btn-item active";
  };
}

for (let i = 0; i < slotsEl.length; i++) {
  slotsEl[i].onclick = function () {
    var c = 0;
    while (c < slotsEl.length) {
      slotsEl[c++].className = "slots-item";
    }
    slotsEl[i].className = "slots-item active";
  };
}
