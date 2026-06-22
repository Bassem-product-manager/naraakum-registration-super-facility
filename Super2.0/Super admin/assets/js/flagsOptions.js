// Initialize the intlTelInput instance
var input = document.querySelector("#phone");
var iti = window.intlTelInput(input, {
  separateDialCode: true,
  excludeCountries: ["in", "il"],
  preferredCountries: ["sa", "eg", "ae", "sd"],
});

// Attach the onCountryChange function to the country change event
iti.promise.then(function () {
  input.addEventListener("countrychange", onCountryChange);
});

// Function to update the hidden input with the selected country's dial code
function onCountryChange(event) {
  var countryCodeInput = document.querySelector("#countryCode");
  var selectedCountryData = iti.getSelectedCountryData();
  countryCodeInput.value = selectedCountryData.dialCode;
}
