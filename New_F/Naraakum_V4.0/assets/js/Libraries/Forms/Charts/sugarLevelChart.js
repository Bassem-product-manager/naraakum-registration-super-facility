    
      const sugarDataByDay = {
        "2025-04-29": [95, 110, 140, 120, 130, 115, 100],
        "2025-04-28": [90, 105, 125, 118, 135, 120, 110],
        "2025-04-27": [100, 115, 150, 130, 140, 125, 105],
      };

      const times = [
        "08:00 ص",
        "10:00 ص",
        "12:00 م",
        "02:00 م",
        "04:00 م",
        "06:00 م",
        "08:00 م",
      ];

      const chart = Highcharts.chart("bloodSugarChart", {
        chart: { type: "line" },
        title: { text: null },

        xAxis: {
          categories: times,
          title: { text: "الوقت" },
        },

        yAxis: {
          min: 50,
          max: 200,
          title: { text: "مستوى السكر (mg/dL)" },
          plotBands: [
            {
              from: 50,
              to: 80,
              color: "rgba(255,0,0,0.08)",
              label: { text: "منخفض" },
            },
            {
              from: 80,
              to: 140,
              color: "rgba(0,255,0,0.08)",
              label: { text: "معتدل" },
            },
            {
              from: 140,
              to: 200,
              color: "rgba(255,165,0,0.12)",
              label: { text: "مرتفع" },
            },
          ],
        },

        tooltip: {
          valueSuffix: " mg/dL",
        },

        series: [
          {
            name: "مستوى السكر",
            color: "#2f80ed",
            lineWidth: 3,
            data: sugarDataByDay["2025-04-29"],
          },
        ],
      });
    