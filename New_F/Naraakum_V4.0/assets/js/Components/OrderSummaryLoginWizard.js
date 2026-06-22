let currentStep = 0;
const steps = document.querySelectorAll(".UserLoginWizard-step");

function showStep() {
  steps.forEach((step, index) => {
    step.classList.remove("active");
    if (index === currentStep) {
      step.classList.add("active");
    }
  });
}

function moveStep(step) {
  currentStep += step;

  if (currentStep < 0) currentStep = 0;
  if (currentStep >= steps.length) currentStep = steps.length - 1;

  showStep();
}

showStep();

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
