   const ageSlider = document.getElementById("age-range");
      const minAge = document.getElementById("min-age");
      const maxAge = document.getElementById("max-age");

      noUiSlider.create(ageSlider, {
        start: [20, 40],
        connect: true,
        range: {
          min: 0,
          max: 100,
        },
        step: 1,
        tooltips: false,
        format: {
          to: (value) => Math.round(value),
          from: (value) => Number(value),
        },
      });

      ageSlider.noUiSlider.on("update", function (values, handle) {
        minAge.textContent = values[0];
        maxAge.textContent = values[1];
      });