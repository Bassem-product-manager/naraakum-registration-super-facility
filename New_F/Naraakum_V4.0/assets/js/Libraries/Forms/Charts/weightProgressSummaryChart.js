/* Weight progress summary chart for MonitoringWeightDiet page */
document.addEventListener("DOMContentLoaded", function () {
  if (typeof Highcharts === "undefined") {
    return;
  }

  const pieContainer = document.getElementById("summaryPieChart");
  if (!pieContainer) {
    return;
  }

  const summaryData = {
    progress: 62,
    referenceWeight: "80.0 كجم",
    weightChange: "-2.4 كجم",
    remainingGoal: "4.0 كجم",
    adherence: "86%",
    measurements: "18",
    breakdown: [
      { name: "مستقر", y: 40, color: "#4caf50" },
      { name: "يتحسن", y: 35, color: "#239EA0" },
      { name: "يحتاج متابعة", y: 25, color: "#ff9800" },
    ],
  };

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = value;
    }
  };

  setText("progressValue", summaryData.progress + "%");
  setText("referenceWeightValue", summaryData.referenceWeight);
  setText("weightChangeValue", summaryData.weightChange);
  setText("remainingGoalValue", summaryData.remainingGoal);
  setText("adherenceValue", summaryData.adherence);
  setText("measurementsValue", summaryData.measurements);

  Highcharts.chart("summaryPieChart", {
    chart: { type: "pie" },
    title: { text: null },
    tooltip: { pointFormat: "<b>{point.y}%</b>" },
    plotOptions: {
      pie: {
        allowPointSelect: false,
        borderWidth: 0,
        dataLabels: {
          enabled: true,
          format: "{point.y}%",
          distance: -28,
          style: {
            color: "#fff",
            fontSize: "13px",
            fontWeight: "bold",
            textOutline: "none",
          },
        },
      },
    },
    series: [
      {
        name: "النسبة",
        data: summaryData.breakdown,
      },
    ],
    credits: { enabled: false },
  });
});

