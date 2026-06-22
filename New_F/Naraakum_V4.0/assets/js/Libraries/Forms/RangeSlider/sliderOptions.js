$(function () {
  const sugarSlider = document.getElementById("sugar-range");
  const minAge = document.getElementById("min-age");
  const maxAge = document.getElementById("max-age");

  noUiSlider.create(sugarSlider, {
    start: [90, 100],
    connect: true,
    range: {
      min: 80,
      max: 140,
    },
    step: 1,
    tooltips: false,
    format: {
      to: (value) => Math.round(value),
      from: (value) => Number(value),
    },
  });

  sugarSlider.noUiSlider.on("update", function (values, handle) {
    minAge.textContent = values[0];
    maxAge.textContent = values[1];
  });
});

/*/priceSlider =================================================================*/
$(function () {
  const priceSlider = document.getElementById("price-range");
  const minPrice = document.getElementById("min-price");
  const maxPrice = document.getElementById("max-price");

  noUiSlider.create(priceSlider, {
    start: [50, 1000],
    connect: true,
    range: {
      min: 50,
      max: 1000,
    },
    step: 1,
    tooltips: false,
    format: {
      to: (value) => Math.round(value),
      from: (value) => Number(value),
    },
  });

  priceSlider.noUiSlider.on("update", function (values, handle) {
    minPrice.textContent = values[0];
    maxPrice.textContent = values[1];
  });
});
