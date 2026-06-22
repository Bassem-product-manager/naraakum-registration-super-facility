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
    inputCardImage.src = "assets/images/v-card-mada.svg";
  } else if (
    radio_item.checked &&
    radio_item.getAttribute("data-card-type") == "visa"
  ) {
    inputCardImage.src = "assets/images/v-card-visa.svg";
  } else if (
    radio_item.checked &&
    radio_item.getAttribute("data-card-type") == "masterCard"
  ) {
    inputCardImage.src = "assets/images/v-card-master-card.svg";
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
    inputCardImage.src = "assets/images/v-card-mada.svg";
  } else if (
    radio_item.checked &&
    radio_item.getAttribute("data-card-type") == "visa"
  ) {
    inputCardImage.src = "assets/images/v-card-visa.svg";
  } else if (
    radio_item.checked &&
    radio_item.getAttribute("data-card-type") == "masterCard"
  ) {
    inputCardImage.src = "assets/images/v-card-master-card.svg";
  } else if (
    radio_item.checked &&
    radio_item.getAttribute("data-card-type") == "other"
  ) {
    inputCardImage.src = "";
  }
};
