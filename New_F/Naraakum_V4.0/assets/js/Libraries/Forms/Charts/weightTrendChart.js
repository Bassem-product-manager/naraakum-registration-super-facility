/* Weight package indicators, manual readings, and meal schedule */
document.addEventListener("DOMContentLoaded", function () {
  const indicatorTabs = document.getElementById("weight-indicator-tabs");
  const chartContainer = document.getElementById("weightTrendChart");
  const legendContainer = document.getElementById("weight-chart-legend");
  const manualState = document.getElementById("weight-manual-state");
  const manualTitle = document.getElementById("weight-manual-title");
  const manualCopy = document.getElementById("weight-manual-copy");
  const manualAddButton = document.getElementById("weight-manual-add-btn");
  const chartDatePicker = document.getElementById("weight-chart-date-picker");
  const addMeasurementButton = document.getElementById(
    "weight-add-measurement-btn"
  );

  const modalEl = document.getElementById("addSugarRecordModal");
  const modalTitle = document.getElementById("addSugarRecordModalLabel");
  const measurementForm = document.getElementById("weight-measurement-form");
  const measurementInstruction = document.getElementById(
    "measurement-instruction"
  );
  const indicatorChoice = document.getElementById("measurement-indicator-choice");
  const indicatorSelect = document.getElementById("measurement-indicator-select");
  const valueInput = document.getElementById("measurement-value-input");
  const unitLabel = document.getElementById("measurement-unit-label");
  const dateInput = document.getElementById("measurement-date-input");
  const timeInput = document.getElementById("measurement-time-input");
  const conditionBlock = document.getElementById("measurement-condition-block");
  const noteBlock = document.getElementById("measurement-note-block");
  const noteInput = document.getElementById("measurement-note-input");

  const mealModeTabs = document.getElementById("meal-mode-tabs");
  const mealWeekDays = document.getElementById("meal-week-days");
  const mealScheduleTable = document.getElementById("meal-schedule-table");
  const mealIngredientsModalEl = document.getElementById("MealIngredientsModal");
  const mealIngredientsTitle = document.getElementById("meal-ingredients-title");
  const mealIngredientsTime = document.getElementById("meal-ingredients-time");
  const mealIngredientsList = document.getElementById("meal-ingredients-list");

  if (!indicatorTabs || !chartContainer || typeof Highcharts === "undefined") {
    return;
  }

  const todayIso = new Date().toISOString().slice(0, 10);

  const weightIndicators = {
    weight: {
      label: "Weight",
      addTitle: "إضافة قياس وزن",
      instruction: "ادخل الوزن الحالي",
      unit: "kg",
      unitAr: "كجم",
      color: "#239EA0",
      range: [85, 100],
      points: [93.5, 93.3, 93.0, 93.1, 92.8, 92.4, 92.0],
    },
    bmi: {
      label: "BMI",
      addTitle: "إضافة BMI",
      instruction: "ادخل قراءة BMI",
      unit: "kg/m2",
      unitAr: "kg/m2",
      color: "#7F98D8",
      range: [25, 34],
      points: [29.6, 29.5, 29.4, 29.4, 29.3, 29.2, 29.1],
    },
    bodyFat: {
      label: "Body Fat",
      addTitle: "إضافة نسبة الدهون",
      instruction: "ادخل نسبة الدهون",
      unit: "%",
      unitAr: "%",
      color: "#D99736",
      range: [29, 37],
      points: [33.8, 33.6, 33.5, 33.1, 32.9, 32.7, 32.4],
    },
    waist: {
      label: "Waist Circumference",
      addTitle: "إضافة محيط الخصر",
      instruction: "ادخل محيط الخصر",
      unit: "cm",
      unitAr: "سم",
      color: "#6E56CF",
      range: [100, 114],
      points: [108, 107.8, 107.2, 106.8, 106.4, 105.9, 105.5],
    },
    muscleMass: {
      label: "Muscle Mass",
      addTitle: "إضافة الكتلة العضلية",
      instruction: "ادخل الكتلة العضلية",
      unit: "kg",
      unitAr: "كجم",
      color: "#0F766E",
      range: [31, 40],
      points: [35.4, 35.5, 35.5, 35.6, 35.6, 35.7, 35.8],
    },
    bodyWater: {
      label: "Body Water",
      addTitle: "إضافة نسبة المياه",
      instruction: "ادخل نسبة المياه في الجسم",
      unit: "%",
      unitAr: "%",
      color: "#2F80ED",
      range: [45, 60],
      points: [47.1, 47.3, 47.5, 47.6, 47.8, 48.0, 0],
    },
    visceralFat: {
      label: "Visceral Fat",
      addTitle: "إضافة الدهون الحشوية",
      instruction: "ادخل مستوى الدهون الحشوية",
      unit: "level",
      unitAr: "level",
      color: "#C96A21",
      range: [1, 12],
      points: [13, 13, 12.8, 12.7, 12.5, 12.3, 12.1],
    },
  };

  const state = {
    selectedKeys: ["weight", "bmi", "bodyFat", "waist"],
    activeKey: "weight",
    selectedDateLabel: "",
    pendingModalMode: "active",
  };

  const categories = [
    "6 أبريل",
    "7 أبريل",
    "8 أبريل",
    "9 أبريل",
    "10 أبريل",
    "11 أبريل",
    "12 أبريل",
  ];

  const formatValue = (value, indicator) => {
    if (typeof value !== "number" || value === 0) return "لا توجد قراءة";
    return (Number.isInteger(value) ? value : value.toFixed(1)) + " " + indicator.unitAr;
  };

  const getLatestValue = (indicator) => {
    const values = indicator.points.filter((value) => typeof value === "number");
    return values.length ? values[values.length - 1] : 0;
  };

  const hasMissingActiveReading = () => {
    const indicator = weightIndicators[state.activeKey];
    if (!indicator) return false;
    return !indicator.points.length || getLatestValue(indicator) === 0;
  };

  const normalizeValue = (value, indicator) => {
    if (typeof value !== "number" || value === 0) return null;
    const values = indicator.points.filter(
      (pointValue) => typeof pointValue === "number" && pointValue !== 0
    );
    const min = Math.min.apply(null, values.concat(indicator.range || []));
    const max = Math.max.apply(null, values.concat(indicator.range || []));
    const span = max - min || 1;
    return Math.max(0, Math.min(100, ((value - min) / span) * 100));
  };

  const renderTabs = () => {
    indicatorTabs.innerHTML = Object.keys(weightIndicators)
      .map((key) => {
        const indicator = weightIndicators[key];
        const activeClass = state.selectedKeys.includes(key) ? " active" : "";
        return (
          '<button type="button" class="weight-indicator-pill' +
          activeClass +
          '" data-weight-indicator="' +
          key +
          '">' +
          indicator.label +
          "</button>"
        );
      })
      .join("");
  };

  const renderLegend = () => {
    if (!legendContainer) return;
    legendContainer.innerHTML = state.selectedKeys
      .map((key) => {
        const indicator = weightIndicators[key];
        return (
          '<span><i style="background:' +
          indicator.color +
          '"></i>' +
          indicator.label +
          " - " +
          formatValue(getLatestValue(indicator), indicator) +
          "</span>"
        );
      })
      .join("");
  };

  const renderManualState = () => {
    if (!manualState) return;
    const show = hasMissingActiveReading();
    const indicator = weightIndicators[state.activeKey];
    manualState.classList.toggle("d-none", !show);
    if (!show || !indicator) return;
    manualTitle.textContent = "لا توجد قراءة حديثة لـ " + indicator.label;
    manualCopy.textContent =
      "يمكنك إضافة قراءة " + indicator.label + " يدوياً حتى تظهر داخل المخطط.";
  };

  const renderChart = () => {
    const series = state.selectedKeys.map((key) => {
      const indicator = weightIndicators[key];
      return {
        name: indicator.label,
        data: indicator.points.map((value) => {
          const normalizedValue = normalizeValue(value, indicator);
          if (normalizedValue === null) return null;
          return {
            y: normalizedValue,
            actualValue: formatValue(value, indicator),
          };
        }),
        color: indicator.color,
        lineWidth: key === state.activeKey ? 4 : 3,
        marker: {
          radius: key === state.activeKey ? 5 : 4,
        },
      };
    });

    Highcharts.chart("weightTrendChart", {
      chart: { type: "line" },
      title: { text: null },
      xAxis: {
        categories: categories,
        title: { text: "التاريخ" },
      },
      yAxis: {
        min: 0,
        max: 100,
        title: { text: "النطاق النسبي" },
        labels: {
          format: "{value}%",
        },
        plotBands: [
          {
            from: 0,
            to: 33,
            color: "rgba(236, 73, 73, 0.12)",
            label: {
              text: "منخفض",
              align: "right",
              x: -16,
              style: { color: "#111", fontSize: "14px" },
            },
          },
          {
            from: 33,
            to: 66,
            color: "rgba(56, 199, 75, 0.12)",
            label: {
              text: "معتدل",
              align: "right",
              x: -16,
              style: { color: "#111", fontSize: "14px" },
            },
          },
          {
            from: 66,
            to: 100,
            color: "rgba(255, 193, 7, 0.16)",
            label: {
              text: "مرتفع",
              align: "right",
              x: -16,
              style: { color: "#111", fontSize: "14px" },
            },
          },
        ],
      },
      tooltip: {
        shared: true,
        useHTML: true,
        formatter: function () {
          const rows = this.points
            .map((point) => {
              return (
                '<span style="color:' +
                point.series.color +
                '">●</span> ' +
                point.series.name +
                ": <b>" +
                point.point.actualValue +
                "</b>"
              );
            })
            .join("<br>");
          return "<b>" + this.x + "</b><br>" + rows;
        },
      },
      legend: { enabled: false },
      series: series,
      credits: { enabled: false },
    });
  };

  const renderAll = () => {
    renderTabs();
    renderLegend();
    renderChart();
    renderManualState();
  };

  const fillIndicatorSelect = (keys) => {
    indicatorSelect.innerHTML = keys
      .map((key) => {
        const selected = key === state.activeKey ? " selected" : "";
        return (
          '<option value="' +
          key +
          '"' +
          selected +
          ">" +
          weightIndicators[key].label +
          "</option>"
        );
      })
      .join("");
  };

  const prepareMeasurementModal = (mode, forcedKey) => {
    const keys = state.selectedKeys.length ? state.selectedKeys : ["weight"];
    const shouldChoose = mode === "choose" && keys.length > 1 && !forcedKey;
    const key = forcedKey || (shouldChoose ? state.activeKey : state.activeKey);
    const indicator = weightIndicators[key] || weightIndicators.weight;

    state.pendingModalMode = mode || "active";
    fillIndicatorSelect(keys);
    indicatorSelect.value = key;

    indicatorChoice.classList.toggle("d-none", !shouldChoose);
    conditionBlock.classList.toggle("d-none", key !== "weight");
    noteBlock.classList.toggle("d-none", key === "weight");
    modalTitle.textContent = indicator.addTitle;
    measurementInstruction.textContent = indicator.instruction;
    unitLabel.textContent = indicator.unitAr;
    valueInput.value = "";
    dateInput.value = todayIso;
    timeInput.value = "08:00";
    noteInput.value = "";
  };

  const applyMeasurementIndicator = (key) => {
    if (!weightIndicators[key]) return;
    state.activeKey = key;
    const indicator = weightIndicators[key];
    conditionBlock.classList.toggle("d-none", key !== "weight");
    noteBlock.classList.toggle("d-none", key === "weight");
    modalTitle.textContent = indicator.addTitle;
    measurementInstruction.textContent = indicator.instruction;
    unitLabel.textContent = indicator.unitAr;
  };

  indicatorTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-weight-indicator]");
    if (!button) return;

    const key = button.getAttribute("data-weight-indicator");
    if (!weightIndicators[key]) return;
    state.activeKey = key;

    const index = state.selectedKeys.indexOf(key);
    if (index >= 0 && state.selectedKeys.length > 1) {
      state.selectedKeys.splice(index, 1);
      state.activeKey = state.selectedKeys[0] || "weight";
    } else if (index === -1) {
      state.selectedKeys.push(key);
      state.activeKey = key;
    }

    renderAll();
  });

  chartDatePicker?.addEventListener("change", (event) => {
    state.selectedDateLabel = event.target.value || "";
    renderLegend();
  });

  addMeasurementButton?.addEventListener("click", () => {
    prepareMeasurementModal("choose");
  });

  manualAddButton?.addEventListener("click", () => {
    prepareMeasurementModal("manual", state.activeKey);
  });

  document.querySelectorAll("[data-open-measurement]").forEach((taskButton) => {
    taskButton.addEventListener("click", () => {
      const key = taskButton.getAttribute("data-open-measurement") || "weight";
      if (weightIndicators[key]) {
        state.activeKey = key;
        if (!state.selectedKeys.includes(key)) state.selectedKeys.push(key);
      }
      prepareMeasurementModal("task", state.activeKey);
      renderAll();
    });
  });

  indicatorSelect?.addEventListener("change", (event) => {
    applyMeasurementIndicator(event.target.value);
  });

  modalEl?.addEventListener("show.bs.modal", () => {
    if (state.pendingModalMode === "active") {
      prepareMeasurementModal("active", state.activeKey);
    }
  });

  modalEl?.addEventListener("hidden.bs.modal", () => {
    state.pendingModalMode = "active";
  });

  measurementForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const selectedKey = indicatorChoice.classList.contains("d-none")
      ? state.activeKey
      : indicatorSelect.value;
    const indicator = weightIndicators[selectedKey];
    const value = Number.parseFloat(valueInput.value);
    if (!indicator || Number.isNaN(value)) return;

    state.activeKey = selectedKey;
    if (!state.selectedKeys.includes(selectedKey)) {
      state.selectedKeys.push(selectedKey);
    }
    indicator.points[indicator.points.length - 1] = value;

    const modal = window.bootstrap?.Modal.getInstance(modalEl);
    modal?.hide();
    renderAll();
  });

  const mealData = {
    today: [
      {
        slot: "الإفطار",
        time: "08:00 ص",
        title: "بيض مع أفوكادو وخضار",
        image: "assets/images/rasheeq/meals/meal-1.jpg",
        ingredients: ["بيض", "أفوكادو", "سبانخ", "طماطم"],
      },
      {
        slot: "الغداء",
        time: "02:00 م",
        title: "دجاج مشوي مع كينوا",
        image: "assets/images/rasheeq/meals/meal-2.jpg",
        ingredients: ["صدر دجاج", "كينوا", "خيار", "خضار ورقية"],
      },
      {
        slot: "العشاء",
        time: "08:00 م",
        title: "سلمون مع خضار",
        image: "assets/images/rasheeq/meals/meal-3.jpg",
        ingredients: ["سلمون", "بروكلي", "ليمون", "زيت زيتون"],
      },
      {
        slot: "سناك",
        time: "10:00 م",
        title: "زبادي يوناني مع مكسرات",
        image: "assets/images/rasheeq/meals/meal-4.jpg",
        ingredients: ["زبادي يوناني", "لوز", "عين جمل", "توت"],
      },
    ],
    mon: [
      ["الإفطار", "08:00 ص", "شوفان بالبروتين", "meal-1.jpg", ["شوفان", "حليب", "بروتين", "توت"]],
      ["الغداء", "02:00 م", "سلطة دجاج", "meal-2.jpg", ["دجاج", "خس", "طماطم", "خيار"]],
      ["العشاء", "08:00 م", "سمك مشوي", "meal-3.jpg", ["سمك", "خضار", "ليمون", "أرز بني"]],
    ],
    tue: [
      ["الإفطار", "08:00 ص", "أومليت أفوكادو", "meal-1.jpg", ["بيض", "أفوكادو", "سبانخ", "فلفل"]],
      ["الغداء", "02:00 م", "طبق ديك رومي", "meal-2.jpg", ["ديك رومي", "أرز بني", "بروكلي", "جزر"]],
      ["العشاء", "08:00 م", "لحم قليل الدهن", "meal-3.jpg", ["لحم", "بطاطا", "خضار", "أعشاب"]],
    ],
    wed: [
      ["الإفطار", "08:00 ص", "توست بياض البيض", "meal-1.jpg", ["بياض بيض", "توست حبوب", "أفوكادو", "طماطم"]],
      ["الغداء", "02:00 م", "سلطة فيتا", "meal-2.jpg", ["خس", "جبنة فيتا", "زيتون", "طماطم"]],
      ["العشاء", "08:00 م", "سلمون منخفض الكربوهيدرات", "meal-3.jpg", ["سلمون", "كوسة", "ليمون", "هليون"]],
    ],
    thu: [
      ["الإفطار", "08:00 ص", "راب بروتين", "meal-1.jpg", ["خبز راب", "بيض", "ديك رومي", "خيار"]],
      ["الغداء", "02:00 م", "جمبري مع خضار", "meal-2.jpg", ["جمبري", "خضار", "أرز", "بقدونس"]],
      ["العشاء", "08:00 م", "ستيك متوازن", "meal-3.jpg", ["ستيك", "بطاطا", "بروكلي", "أعشاب"]],
    ],
    fri: [
      ["الإفطار", "08:00 ص", "زبادي وتوت", "meal-4.jpg", ["زبادي", "توت", "شيا", "جرانولا"]],
      ["الغداء", "02:00 م", "باستا ديك رومي", "meal-2.jpg", ["ديك رومي", "باستا قمح", "خس", "صلصة خفيفة"]],
      ["العشاء", "08:00 م", "راب دجاج", "meal-3.jpg", ["دجاج", "راب", "شوربة", "زبادي"]],
    ],
    sat: [
      ["الإفطار", "08:00 ص", "بان كيك بروتين", "meal-1.jpg", ["بان كيك بروتين", "فراولة", "زبادي", "عسل"]],
      ["الغداء", "02:00 م", "كينوا بالدجاج", "meal-2.jpg", ["كينوا", "دجاج", "خيار", "خضار"]],
      ["العشاء", "08:00 م", "دجاج مشوي", "meal-3.jpg", ["دجاج", "كوسة", "فلفل", "أعشاب"]],
    ],
    sun: [
      ["الإفطار", "08:00 ص", "وعاء فواكه وبروتين", "meal-4.jpg", ["زبادي", "موز", "توت", "مكسرات"]],
      ["الغداء", "02:00 م", "سلطة الحصاد", "meal-2.jpg", ["خس", "فيتا", "طماطم", "زيتون"]],
      ["العشاء", "08:00 م", "سلمون وخضار", "meal-3.jpg", ["سلمون", "خضار ورقية", "ليمون", "زيت زيتون"]],
    ],
  };

  Object.keys(mealData).forEach((key) => {
    if (key === "today") return;
    mealData[key] = mealData[key].map((item) => ({
      slot: item[0],
      time: item[1],
      title: item[2],
      image: "assets/images/rasheeq/meals/" + item[3],
      ingredients: item[4],
    }));
  });

  const mealState = {
    mode: "today",
    day: "tue",
  };

  const weekDays = [
    { key: "mon", label: "الاثنين" },
    { key: "tue", label: "الثلاثاء" },
    { key: "wed", label: "الأربعاء" },
    { key: "thu", label: "الخميس" },
    { key: "fri", label: "الجمعة" },
    { key: "sat", label: "السبت" },
    { key: "sun", label: "الأحد" },
  ];

  const visibleMeals = () =>
    mealState.mode === "week" ? mealData[mealState.day] : mealData.today;

  const renderWeekDays = () => {
    if (!mealWeekDays) return;
    mealWeekDays.classList.toggle("d-none", mealState.mode !== "week");
    if (mealState.mode !== "week") {
      mealWeekDays.innerHTML = "";
      return;
    }
    mealWeekDays.innerHTML = weekDays
      .map((day) => {
        const activeClass = day.key === mealState.day ? " active" : "";
        return (
          '<button type="button" class="btn btn-outline-primary rounded-pill px-4 btn-36' +
          activeClass +
          '" data-meal-day="' +
          day.key +
          '">' +
          day.label +
          "</button>"
        );
      })
      .join("");
  };

  const renderMeals = () => {
    if (!mealScheduleTable) return;
    renderWeekDays();
    mealScheduleTable.innerHTML = visibleMeals()
      .map(
        (meal, index) =>
          '<article class="weight-meal-row">' +
          '<div class="weight-meal-slot"><b>' +
          meal.slot +
          "</b><span>" +
          meal.time +
          "</span></div>" +
          '<div class="weight-meal-main"><img class="weight-meal-image" src="' +
          meal.image +
          '" alt="' +
          meal.title +
          '"><div class="weight-meal-title"><b>' +
          meal.title +
          "</b><span>" +
          meal.ingredients.join(" / ") +
          "</span></div></div>" +
          '<button type="button" class="btn btn-outline-primary btn-36" data-meal-index="' +
          index +
          '">المكونات</button>' +
          "</article>"
      )
      .join("");
  };

  mealModeTabs?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-meal-mode]");
    if (!button) return;
    mealState.mode = button.getAttribute("data-meal-mode") || "today";
    mealModeTabs
      .querySelectorAll("[data-meal-mode]")
      .forEach((node) => node.classList.toggle("active", node === button));
    renderMeals();
  });

  mealWeekDays?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-meal-day]");
    if (!button) return;
    mealState.day = button.getAttribute("data-meal-day") || "tue";
    renderMeals();
  });

  mealScheduleTable?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-meal-index]");
    if (!button) return;
    const meal = visibleMeals()[Number(button.getAttribute("data-meal-index"))];
    if (!meal) return;
    mealIngredientsTitle.textContent = meal.title;
    mealIngredientsTime.textContent = meal.slot + " / " + meal.time;
    mealIngredientsList.innerHTML = meal.ingredients
      .map((ingredient) => "<li>" + ingredient + "</li>")
      .join("");
    window.bootstrap?.Modal.getOrCreateInstance(mealIngredientsModalEl).show();
  });

  renderAll();
  renderMeals();
});
