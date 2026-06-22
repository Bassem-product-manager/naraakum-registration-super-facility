// ====== مصدر البيانات (واحد فقط) ======
const chartData = {
  high:   { label: 'مرتفع',    value: 30, color: '#ff9800' },
  normal: { label: 'فى الهدف', value: 25, color: '#4caf50' },
  low:    { label: 'منخفض',    value: 45, color: '#EC4949' },

  change: 47,
  average: 180,
  drops: 4
};

let chartInstance = null;

// ====== تحديث النصوص الجانبية ======
function updateStats(data) {
  document.getElementById('highValue').textContent   = data.high.value + '%';
  document.getElementById('normalValue').textContent = data.normal.value + '%';
  document.getElementById('lowValue').textContent    = data.low.value + '%';

  document.getElementById('changeValue').textContent = data.change + '%';
  document.getElementById('avgValue').textContent    = data.average + ' mg/dL';
  document.getElementById('dropsValue').textContent  = data.drops;
}

// ====== إنشاء / تحديث الشارت ======
function renderChart(data) {

  const seriesData = [
    { name: data.high.label,   y: data.high.value,   color: data.high.color },
    { name: data.normal.label, y: data.normal.value, color: data.normal.color },
    { name: data.low.label,    y: data.low.value,    color: data.low.color }
  ];

  if (chartInstance) {
    chartInstance.series[0].setData(seriesData, true);
    return;
  }

  chartInstance = Highcharts.chart('summaryPieChart', {
    chart: {
      type: 'pie'
    },
    title: { text: null },
    tooltip: {
      pointFormat: '<b>{point.y}%</b>'
    },

  plotOptions: {
    pie: {
      allowPointSelect: false,
      borderWidth: 0,
      dataLabels: {
        enabled: true,
        format: '{point.y}%',
        distance: -30, // 👈 يخلي الرقم داخل القطاع
        style: {
          color: '#fff',
          fontSize: '14px',
          fontWeight: 'bold',
          textOutline: 'none'
        }
      }
    }
  },

    series: [{
      name: 'النسبة',
      data: seriesData
    }],
    credits: { enabled: false }
  });
}

// ====== تحديث الكل مرة واحدة ======
function updateAll(data) {
  updateStats(data);
  renderChart(data);
}

// ====== تشغيل أولي ======
document.addEventListener('DOMContentLoaded', function () {
  updateAll(chartData);
});

// ====== مثال تغيير ديناميكي (اختياري) ======
/*
setTimeout(() => {
  chartData.high.value   = 60;
  chartData.normal.value = 30;
  chartData.low.value    = 10;
  chartData.change       = 52;
  chartData.average      = 175;
  chartData.drops        = 3;

  updateAll(chartData);
}, 3000);
*/
