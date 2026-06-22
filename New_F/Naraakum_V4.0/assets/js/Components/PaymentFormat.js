function formatCardNumber(event) {
  const input = event.target;
  let value = input.value.replace(/\D/g, ""); // Remove non-numeric characters
  value = value.replace(/(\d{4})(?=\d)/g, "$1 "); // Add space every 4 digits
  input.value = value;
}

function formatCardCVV(event) {
  const input = event.target;
  let value = input.value.replace(/\D/g, ""); // Remove non-numeric characters
  input.value = value;
}

function formatExpiryDate(event) {
  const input = event.target;
  let value = input.value.replace(/\D/g, ""); // Remove non-numeric characters
  if (value.length >= 3) {
    value = value.slice(0, 2) + "/" + value.slice(2, 4); // Add slash after MM
  }
  input.value = value;
}

/*-----------------------------------------------------------------*/
let paymentCardOptions = document.querySelectorAll(
  "input[name='paymentCardOptions']"
);

let inputCardImage = document.querySelector(".input-card-icon img");

paymentCardOptions.forEach((radio_item) => {
  radio_item.addEventListener("click", () => {
    paymentCardOptionsHandler(radio_item);
  });

  if (
    radio_item.checked &&
    radio_item.getAttribute("data-card-type") == "mada"
  ) {
    inputCardImage.src = "assets/images/Pay_Mada.png";
  } else if (
    radio_item.checked &&
    radio_item.getAttribute("data-card-type") == "visa"
  ) {
    inputCardImage.src = "assets/images/Pay_Visa.png";
  } else if (
    radio_item.checked &&
    radio_item.getAttribute("data-card-type") == "masterCard"
  ) {
    inputCardImage.src = "assets/images/Pay_Mastercard.png";
  } else if (
    radio_item.checked &&
    radio_item.getAttribute("data-card-type") == "other"
  ) {
    inputCardImage.src = "";
  }
});

const paymentCardOptionsHandler = (radio_item) => {
  if (
    radio_item.checked &&
    radio_item.getAttribute("data-card-type") == "mada"
  ) {
    inputCardImage.src = "assets/images/Pay_Mada.png";
  } else if (
    radio_item.checked &&
    radio_item.getAttribute("data-card-type") == "visa"
  ) {
    inputCardImage.src = "assets/images/Pay_Visa.png";
  } else if (
    radio_item.checked &&
    radio_item.getAttribute("data-card-type") == "masterCard"
  ) {
    inputCardImage.src = "assets/images/Pay_Mastercard.png";
  } else if (
    radio_item.checked &&
    radio_item.getAttribute("data-card-type") == "other"
  ) {
    inputCardImage.src = "";
  }
};
