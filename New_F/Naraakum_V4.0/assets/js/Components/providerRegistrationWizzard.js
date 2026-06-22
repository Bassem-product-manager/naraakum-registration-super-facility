let currentStep = 0;
const steps = document.querySelectorAll(".RegistrationWizzard-step");

function RegistrationShowStep() {
  steps.forEach((step, index) => {
    step.classList.remove("active");
    if (index === currentStep) {
      step.classList.add("active");
    }
  });
}

function RegistrationMoveStep(step) {
  currentStep += step;

  if (currentStep < 0) currentStep = 0;
  if (currentStep >= steps.length) currentStep = steps.length - 1;

  RegistrationShowStep();
}

RegistrationShowStep();

//Identity checkbox
function toggleIdentity() {
  const checkbox = document.getElementById("saudiCheckbox");
  const identityField = document.getElementById("identityField");
  if (checkbox.checked) {
    identityField.style.display = "block";
  } else {
    identityField.style.display = "none";
  }
}
