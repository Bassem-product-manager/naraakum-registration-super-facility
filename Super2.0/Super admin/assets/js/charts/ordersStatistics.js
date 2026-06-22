Highcharts.chart("sales-analytics-chart", {
  chart: {
    type: "column",
  //  height: "340px",
  },
  title: {
    text: "",
  },
  subtitle: {
    text: "Orders analytics ",
  },
  xAxis: {
    categories: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    crosshair: true,
    accessibility: {
      //   description: "Countries",
    },
  },
  yAxis: {
    min: 0,
    title: {
      text: "",
    },
  },
  tooltip: {
    // valueSuffix: " (1000 MT)",
  },
  plotOptions: {
    column: {
      pointPadding: 0.1,
      borderWidth: 0,
       
      dataLabels: {
        enabled: true,
        format: "{point.y}",
      },
    },
  },

  series: [
    {
      name: "Orders",
      data: [2, 5, 16, 20, 20,22, 24, 26, 28, 30,32,32],
      color: "#239ea0",
    },
 
  ],


});
