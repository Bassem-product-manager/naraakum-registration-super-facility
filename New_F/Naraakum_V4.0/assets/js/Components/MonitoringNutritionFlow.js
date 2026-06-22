let currentStep = 0;

const nutritionFlowStorageKey = "naraakum-monitoring-nutrition-flow";
const userLoginSteps = Array.from(document.querySelectorAll(".UserLoginWizard-step"));
const nutritionFlowStartIndex = 4;
const nutritionRecommendationStepIndex = 10;

const monitoringOptionInputs = Array.from(
  document.querySelectorAll(".monitoring-type-item input[type='checkbox']"),
);
const monitoringDietOption = document.getElementById("monitoringDietOption");
const monitoringServiceSubmit = document.getElementById("monitoringServiceSubmit");
const monitoringServiceSubmitLabel = document.querySelector(
  "[data-service-submit-label]",
);

const monitoringSelectorStage = document.getElementById("monitoringSelectorStage");
const monitoringPackagesStage = document.getElementById("monitoringPackagesStage");
const nutritionFinalQuestions = document.getElementById("nutritionFinalQuestions");
const nutritionRecommendationView = document.getElementById("nutritionRecommendationView");
const nutritionFinalStepAction = document.querySelector("[data-final-step-action]");

const recommendedPlanTitleNodes = Array.from(
  document.querySelectorAll("[data-recommended-plan-title]"),
);
const recommendedPlanSummaryNodes = Array.from(
  document.querySelectorAll("[data-recommended-plan-summary]"),
);
const selectedPackageLabelNodes = Array.from(
  document.querySelectorAll("[data-selected-package-label]"),
);
const recommendationReasonNodes = {
  1: Array.from(document.querySelectorAll('[data-recommendation-reason="1"]')),
  2: Array.from(document.querySelectorAll('[data-recommendation-reason="2"]')),
  3: Array.from(document.querySelectorAll('[data-recommendation-reason="3"]')),
};

const nutritionPackageInputs = Array.from(
  document.querySelectorAll("input[name='nutritionPackage']"),
);
const nutritionPackageCards = Array.from(
  document.querySelectorAll(".wizard-package-card"),
);

const registrationGender = document.getElementById("registrationGender");
const registrationBirthDate = document.getElementById("registrationBirthDate");
const serviceWeight = document.getElementById("serviceWeight");
const serviceHeight = document.getElementById("serviceHeight");

const nutritionBirthDate = document.getElementById("nutritionBirthDate");
const nutritionWeight = document.getElementById("nutritionWeight");
const nutritionHeight = document.getElementById("nutritionHeight");
const nutritionTargetWeight = document.getElementById("nutritionTargetWeight");
const nutritionWeeklyActivityFrequency = document.getElementById(
  "nutritionWeeklyActivityFrequency",
);
const nutritionDislikedFoods = document.getElementById("nutritionDislikedFoods");
const nutritionPlanNotes = document.getElementById("nutritionPlanNotes");

const packageLabels = {
  free: "باكدج البداية المجانية",
  balance: "باكدج التوازن الذكي",
  progress: "باكدج النزول المستمر",
  control: "باكدج التحكم الكامل",
};

const dietPreferenceLabels = {
  balanced: "النظام المتوازن",
  "high-protein": "النظام الغني بالبروتين",
  "low-carb": "النظام القليل بالكربوهيدرات",
  vegetarian: "النظام النباتي",
  "dairy-free": "النظام الخالي من الألبان",
  "gluten-free": "النظام الخالي من القمح",
};

const goalConfigurations = {
  maintain: {
    title: "الحفاظ على الوزن",
    summary: "ترشيح أولي يركز على تثبيت الوزن وتنظيم الوجبات بطريقة عملية قابلة للاستمرار.",
    suggestedPackage: "balance",
  },
  "muscle-gain": {
    title: "اكتساب العضلات",
    summary: "ترشيح أولي يركز على دعم الكتلة العضلية ورفع جودة التغذية اليومية بشكل واضح.",
    suggestedPackage: "control",
  },
  "weight-loss": {
    title: "خسارة الوزن",
    summary: "ترشيح أولي يركز على تقليل الوزن بشكل تدريجي مع متابعة أوضح للنتائج والالتزام.",
    suggestedPackage: "progress",
  },
};

function setCheckedValue(name, value) {
  const input = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (input) {
    input.checked = true;
  }
}

function getCheckedValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`)?.value || "";
}

function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(
    (input) => input.value,
  );
}

function setCheckedValues(name, values = []) {
  const normalizedValues = Array.isArray(values) ? values : [];
  document.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.checked = normalizedValues.includes(input.value);
  });
}

function setTextContent(nodes, value) {
  nodes.forEach((node) => {
    node.textContent = value;
  });
}

function parseMetricValue(rawValue) {
  const cleanedValue = String(rawValue || "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");
  const parsedValue = Number.parseFloat(cleanedValue);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function getNumericProfileMetrics() {
  const weightValue = parseMetricValue(nutritionWeight?.value || serviceWeight?.value);
  const heightValue = parseMetricValue(nutritionHeight?.value || serviceHeight?.value);
  return { weightValue, heightValue };
}

function getFallbackGoalByMetrics() {
  const { weightValue, heightValue } = getNumericProfileMetrics();
  const bmiValue =
    weightValue > 0 && heightValue > 0
      ? weightValue / Math.pow(heightValue / 100, 2)
      : 0;

  if (bmiValue >= 25) return "weight-loss";
  if (bmiValue > 0 && bmiValue < 20) return "muscle-gain";
  return "maintain";
}

function getRecommendedPlan() {
  const selectedGoal = getCheckedValue("nutritionGoal") || getFallbackGoalByMetrics();
  const goalConfiguration =
    goalConfigurations[selectedGoal] || goalConfigurations.maintain;

  const selectedDietPreference = getCheckedValue("nutritionDietPreference");
  const dietPreferenceLabel =
    dietPreferenceLabels[selectedDietPreference] || "الأسلوب الغذائي الذي اخترته";

  const { weightValue, heightValue } = getNumericProfileMetrics();
  const targetWeightValue = parseMetricValue(nutritionTargetWeight?.value);
  const activityLevelValue = getCheckedValue("nutritionDailyActivityLevel");
  const healthConditionValue = getCheckedValue("nutritionHealthCondition");

  const profileReason =
    weightValue > 0 && heightValue > 0
      ? `البيانات الحالية مثل الوزن ${weightValue} كجم والطول ${heightValue} سم تجعل ${goalConfiguration.title} مسارًا مناسبًا كبداية.`
      : `البيانات المدخلة الحالية تجعل ${goalConfiguration.title} مسارًا مناسبًا كبداية قبل الدخول في التخصيص الأعمق.`;
  const targetReason =
    targetWeightValue > 0
      ? `الوزن المستهدف ${targetWeightValue} كجم يساعدنا على ضبط سرعة التقدم ومراجعة النتائج بشكل واقعي.`
      : `${dietPreferenceLabel} يساعدنا على بناء الوجبات والبدائل بشكل أقرب لأسلوبك اليومي.`;
  const activityReason =
    activityLevelValue || healthConditionValue
      ? "إجابات النشاط والحالة الصحية ستدخل في ضبط السعرات والبدائل قبل بدء المتابعة."
      : "بعد اختيار الباكدج نثبت مستوى الدعم المناسب ثم نبدأ المتابعة.";

  return {
    title: goalConfiguration.title,
    summary: goalConfiguration.summary,
    suggestedPackage: goalConfiguration.suggestedPackage,
    reasons: [
      profileReason,
      targetReason,
      activityReason,
    ],
  };
}

function hasMonitoringSelection() {
  return monitoringOptionInputs.some((input) => input.checked);
}

function syncSelectedPackageLabel() {
  const selectedPackageValue = getCheckedValue("nutritionPackage");
  const selectedPackageLabel =
    packageLabels[selectedPackageValue] || "اختر من الجانب الآخر";
  setTextContent(selectedPackageLabelNodes, selectedPackageLabel);
}

function highlightSuggestedPackage(suggestedPackage) {
  nutritionPackageCards.forEach((card) => {
    const cardValue = card.querySelector("input")?.value;
    card.classList.toggle("is-suggested", cardValue === suggestedPackage);
  });
}

function isRecommendationVisible() {
  return Boolean(nutritionRecommendationView && !nutritionRecommendationView.hidden);
}

function setRecommendationVisibility(shouldShow) {
  if (nutritionFinalQuestions) {
    nutritionFinalQuestions.hidden = shouldShow;
  }

  if (nutritionRecommendationView) {
    nutritionRecommendationView.hidden = !shouldShow;
  }

  if (nutritionFinalStepAction) {
    nutritionFinalStepAction.textContent = shouldShow ? "ابدأ الخطة" : "عرض أنسب خطة";
  }

  if (shouldShow) {
    applyRecommendationContent();
  }
}

function applyRecommendationContent() {
  const recommendation = getRecommendedPlan();

  setTextContent(recommendedPlanTitleNodes, recommendation.title);
  setTextContent(recommendedPlanSummaryNodes, recommendation.summary);

  Object.entries(recommendationReasonNodes).forEach(([reasonIndex, nodes]) => {
    const reasonValue = recommendation.reasons[Number(reasonIndex) - 1] || "";
    setTextContent(nodes, reasonValue);
  });

  if (!getCheckedValue("nutritionPackage") && recommendation.suggestedPackage) {
    setCheckedValue("nutritionPackage", recommendation.suggestedPackage);
  }

  highlightSuggestedPackage(recommendation.suggestedPackage);
  syncSelectedPackageLabel();
}

function syncServiceTrigger() {
  if (!monitoringServiceSubmit || !monitoringServiceSubmitLabel) return;

  if (monitoringDietOption?.checked) {
    monitoringServiceSubmit.classList.add("is-nutrition");
    monitoringServiceSubmitLabel.textContent = "إكمال إعداد الخطة";
  } else {
    monitoringServiceSubmit.classList.remove("is-nutrition");
    monitoringServiceSubmitLabel.textContent = "التسجيل بالخدمة";
  }
}

function syncLeftSideStage() {
  const shouldShowPackagesStage =
    Boolean(monitoringDietOption?.checked) &&
    currentStep === nutritionRecommendationStepIndex &&
    isRecommendationVisible();

  if (monitoringSelectorStage) {
    monitoringSelectorStage.hidden = shouldShowPackagesStage;
  }

  if (monitoringPackagesStage) {
    monitoringPackagesStage.hidden = !shouldShowPackagesStage;
  }

  if (shouldShowPackagesStage) {
    applyRecommendationContent();
  }
}

function showStep() {
  userLoginSteps.forEach((step, index) => {
    step.classList.toggle("active", index === currentStep);
  });

  syncServiceTrigger();

  if (currentStep >= nutritionFlowStartIndex) {
    syncNutritionDefaultsFromSignup();
  }

  syncLeftSideStage();
}

function clearStepError(stepIndex = currentStep) {
  const errorBox = userLoginSteps[stepIndex]?.querySelector(".nutrition-step-error");
  if (!errorBox) return;

  errorBox.textContent = "";
  errorBox.classList.remove("is-visible");
}

function setStepError(message, stepIndex = currentStep) {
  const errorBox = userLoginSteps[stepIndex]?.querySelector(".nutrition-step-error");
  if (!errorBox) return;

  errorBox.textContent = message;
  errorBox.classList.add("is-visible");
}

function syncNutritionDefaultsFromSignup() {
  const nutritionGenderValue = getCheckedValue("nutritionGenderOption");
  if (registrationGender && !nutritionGenderValue) {
    setCheckedValue("nutritionGenderOption", registrationGender.value);
  }

  if (registrationBirthDate && nutritionBirthDate && !nutritionBirthDate.value) {
    nutritionBirthDate.value = registrationBirthDate.value;
  }

  if (serviceWeight && nutritionWeight && !nutritionWeight.value) {
    nutritionWeight.value = serviceWeight.value;
  }

  if (serviceHeight && nutritionHeight && !nutritionHeight.value) {
    nutritionHeight.value = serviceHeight.value;
  }
}

function syncBackToSignupFields() {
  const selectedNutritionGender = getCheckedValue("nutritionGenderOption");
  if (registrationGender && selectedNutritionGender) {
    registrationGender.value = selectedNutritionGender;
  }

  if (registrationBirthDate && nutritionBirthDate?.value) {
    registrationBirthDate.value = nutritionBirthDate.value;
  }

  if (serviceWeight && nutritionWeight?.value) {
    serviceWeight.value = nutritionWeight.value;
  }

  if (serviceHeight && nutritionHeight?.value) {
    serviceHeight.value = nutritionHeight.value;
  }
}

function collectNutritionState() {
  return {
    goal: getCheckedValue("nutritionGoal"),
    gender: getCheckedValue("nutritionGenderOption"),
    birthDate: nutritionBirthDate?.value || "",
    weight: nutritionWeight?.value || "",
    height: nutritionHeight?.value || "",
    dietPreference: getCheckedValue("nutritionDietPreference"),
    targetWeight: nutritionTargetWeight?.value || "",
    dailyActivityLevel: getCheckedValue("nutritionDailyActivityLevel"),
    exercisePractice: getCheckedValue("nutritionExercisePractice"),
    activityTypes: getCheckedValues("nutritionActivityType"),
    weeklyActivityFrequency: nutritionWeeklyActivityFrequency?.value || "",
    mealsPerDay: getCheckedValue("nutritionMealsPerDay"),
    snackFrequency: getCheckedValue("nutritionSnackFrequency"),
    healthCondition: getCheckedValue("nutritionHealthCondition"),
    medicationUse: getCheckedValue("nutritionMedicationUse"),
    foodAllergies: getCheckedValues("nutritionFoodAllergy"),
    dislikedFoods: nutritionDislikedFoods?.value || "",
    restaurantFrequency: getCheckedValue("nutritionRestaurantFrequency"),
    dailyDrinks: getCheckedValues("nutritionDailyDrinks"),
    planNotes: nutritionPlanNotes?.value || "",
    selectedPackage: getCheckedValue("nutritionPackage"),
    monitoringTypes: monitoringOptionInputs
      .filter((input) => input.checked)
      .map((input) => input.value),
  };
}

function persistNutritionState() {
  try {
    sessionStorage.setItem(
      nutritionFlowStorageKey,
      JSON.stringify(collectNutritionState()),
    );
  } catch (_error) {
    // Ignore storage failures and keep the flow usable.
  }
}

function hydrateNutritionState() {
  try {
    const rawValue = sessionStorage.getItem(nutritionFlowStorageKey);
    if (!rawValue) return;

    const savedState = JSON.parse(rawValue);
    if (!savedState || typeof savedState !== "object") return;

    if (savedState.goal) {
      setCheckedValue("nutritionGoal", savedState.goal);
    }

    if (savedState.gender) {
      setCheckedValue("nutritionGenderOption", savedState.gender);
    }

    if (savedState.birthDate && nutritionBirthDate) {
      nutritionBirthDate.value = savedState.birthDate;
    }

    if (savedState.weight && nutritionWeight) {
      nutritionWeight.value = savedState.weight;
    }

    if (savedState.height && nutritionHeight) {
      nutritionHeight.value = savedState.height;
    }

    if (savedState.dietPreference) {
      setCheckedValue("nutritionDietPreference", savedState.dietPreference);
    }

    if (savedState.targetWeight && nutritionTargetWeight) {
      nutritionTargetWeight.value = savedState.targetWeight;
    }

    if (savedState.dailyActivityLevel) {
      setCheckedValue("nutritionDailyActivityLevel", savedState.dailyActivityLevel);
    }

    if (savedState.exercisePractice) {
      setCheckedValue("nutritionExercisePractice", savedState.exercisePractice);
    }

    if (Array.isArray(savedState.activityTypes)) {
      setCheckedValues("nutritionActivityType", savedState.activityTypes);
    }

    if (savedState.weeklyActivityFrequency && nutritionWeeklyActivityFrequency) {
      nutritionWeeklyActivityFrequency.value = savedState.weeklyActivityFrequency;
    }

    if (savedState.mealsPerDay) {
      setCheckedValue("nutritionMealsPerDay", savedState.mealsPerDay);
    }

    if (savedState.snackFrequency) {
      setCheckedValue("nutritionSnackFrequency", savedState.snackFrequency);
    }

    if (savedState.healthCondition) {
      setCheckedValue("nutritionHealthCondition", savedState.healthCondition);
    }

    if (savedState.medicationUse) {
      setCheckedValue("nutritionMedicationUse", savedState.medicationUse);
    }

    if (Array.isArray(savedState.foodAllergies)) {
      setCheckedValues("nutritionFoodAllergy", savedState.foodAllergies);
    }

    if (savedState.dislikedFoods && nutritionDislikedFoods) {
      nutritionDislikedFoods.value = savedState.dislikedFoods;
    }

    if (savedState.restaurantFrequency) {
      setCheckedValue("nutritionRestaurantFrequency", savedState.restaurantFrequency);
    }

    if (Array.isArray(savedState.dailyDrinks)) {
      setCheckedValues("nutritionDailyDrinks", savedState.dailyDrinks);
    }

    if (savedState.planNotes && nutritionPlanNotes) {
      nutritionPlanNotes.value = savedState.planNotes;
    }

    if (savedState.selectedPackage) {
      setCheckedValue("nutritionPackage", savedState.selectedPackage);
    }

    if (Array.isArray(savedState.monitoringTypes)) {
      monitoringOptionInputs.forEach((input) => {
        input.checked = savedState.monitoringTypes.includes(input.value);
      });
    }
  } catch (_error) {
    // Ignore malformed session state and continue with fresh inputs.
  }
}

function validateNutritionStep(stepIndex) {
  clearStepError(stepIndex);

  if (stepIndex === 4 && !getCheckedValue("nutritionGoal")) {
    setStepError("اختر الهدف من الخطة قبل المتابعة.", stepIndex);
    return false;
  }

  if (stepIndex === 5 && !getCheckedValue("nutritionGenderOption")) {
    setStepError("اختر الجنس لإكمال إعداد الخطة.", stepIndex);
    return false;
  }

  if (stepIndex === 6) {
    if (!nutritionBirthDate?.value || !nutritionWeight?.value || !nutritionHeight?.value) {
      setStepError("أكمل تاريخ الميلاد والطول والوزن أولاً.", stepIndex);
      return false;
    }
  }

  if (stepIndex === 7 && !getCheckedValue("nutritionDietPreference")) {
    setStepError("اختر النظام الغذائي المفضل لديك.", stepIndex);
    return false;
  }

  if (stepIndex === nutritionRecommendationStepIndex) {
    if (!isRecommendationVisible()) {
      return true;
    }

    if (!getCheckedValue("nutritionPackage")) {
      setStepError("اختر الباكدج المناسبة أولاً قبل بدء الخطة.", stepIndex);
      return false;
    }
  }

  return true;
}

function handleMonitoringServiceStep() {
  clearStepError(3);

  if (!hasMonitoringSelection()) {
    setStepError("اختر نوع متابعة واحدًا على الأقل قبل التسجيل بالخدمة.", 3);
    return;
  }

  if (monitoringDietOption?.checked) {
    syncNutritionDefaultsFromSignup();
    persistNutritionState();
    currentStep = nutritionFlowStartIndex;
    showStep();
    return;
  }

  persistNutritionState();
  window.location.href = "MonitoringStep_2.html";
}

function handleFlowCompletion() {
  if (!validateNutritionStep(currentStep)) {
    return;
  }

  syncBackToSignupFields();
  persistNutritionState();
  window.location.href = "MonitoringNutritionProviders.html?source=nutrition-flow";
}

function moveStep(step) {
  if (step > 0) {
    if (currentStep === 3) {
      handleMonitoringServiceStep();
      return;
    }

    if (currentStep >= nutritionFlowStartIndex) {
      if (!validateNutritionStep(currentStep)) {
        return;
      }

      if (
        currentStep === nutritionRecommendationStepIndex &&
        !isRecommendationVisible()
      ) {
        setRecommendationVisibility(true);
        syncLeftSideStage();
        persistNutritionState();
        return;
      }

      if (currentStep === userLoginSteps.length - 1) {
        handleFlowCompletion();
        return;
      }
    }

    currentStep = Math.min(currentStep + 1, userLoginSteps.length - 1);
    persistNutritionState();
    showStep();
    return;
  }

  if (step < 0) {
    clearStepError(currentStep);

    if (
      currentStep === nutritionRecommendationStepIndex &&
      isRecommendationVisible()
    ) {
      setRecommendationVisibility(false);
      syncLeftSideStage();
      return;
    }

    currentStep = Math.max(currentStep + step, 0);
    showStep();
  }
}

function toggleIdentity() {
  const checkbox = document.getElementById("saudiCheckbox");
  const identityField = document.getElementById("identityField");
  if (!checkbox || !identityField) return;

  identityField.style.display = checkbox.checked ? "block" : "none";
}

monitoringOptionInputs.forEach((input) => {
  input.addEventListener("change", () => {
    clearStepError(3);
    syncServiceTrigger();
    syncLeftSideStage();
    persistNutritionState();
  });
});

nutritionPackageInputs.forEach((input) => {
  input.addEventListener("change", () => {
    clearStepError(nutritionRecommendationStepIndex);
    syncSelectedPackageLabel();
    persistNutritionState();
  });
});

document
  .querySelectorAll(
    "input[name='nutritionGoal'], input[name='nutritionGenderOption'], input[name='nutritionDietPreference'], input[name='nutritionDailyActivityLevel'], input[name='nutritionExercisePractice'], input[name='nutritionActivityType'], input[name='nutritionMealsPerDay'], input[name='nutritionSnackFrequency'], input[name='nutritionHealthCondition'], input[name='nutritionMedicationUse'], input[name='nutritionFoodAllergy'], input[name='nutritionRestaurantFrequency'], input[name='nutritionDailyDrinks'], #nutritionBirthDate, #nutritionWeight, #nutritionHeight, #nutritionTargetWeight, #nutritionWeeklyActivityFrequency, #nutritionDislikedFoods, #nutritionPlanNotes, #serviceWeight, #serviceHeight",
  )
  .forEach((field) => {
    field.addEventListener("change", () => {
      clearStepError();
      if (currentStep >= nutritionRecommendationStepIndex) {
        applyRecommendationContent();
      }
      persistNutritionState();
    });

    field.addEventListener("input", () => {
      clearStepError();
      if (currentStep >= nutritionRecommendationStepIndex) {
        applyRecommendationContent();
      }
      persistNutritionState();
    });
  });

hydrateNutritionState();
syncSelectedPackageLabel();
showStep();
