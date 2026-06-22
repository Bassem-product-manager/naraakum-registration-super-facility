 

// Select all phone inputs
var phoneInputs = document.querySelectorAll(".phone-input");

phoneInputs.forEach(function (input) {
  var iti = window.intlTelInput(input, {
    separateDialCode: true,
    excludeCountries: ["in", "il"],
    preferredCountries: ["sa", "eg", "ae", "sd"],
  });

  iti.promise.then(function () {
    input.addEventListener("countrychange", function () {
      onCountryChange(input, iti);
    });
  });
});

// Update the related country code input
function onCountryChange(input, iti) {
  var countryCodeInput = input
    .closest(".phone-wrapper")
    .querySelector(".country-code");

  var selectedCountryData = iti.getSelectedCountryData();
  countryCodeInput.value = selectedCountryData.dialCode;
}
