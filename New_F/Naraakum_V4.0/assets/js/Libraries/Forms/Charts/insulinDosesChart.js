Highcharts.chart('insulinDosesChart', {
  chart: {
    type: 'scatter',
    zoomType: 'x'
  },

  title: {
    text: ''
  },

  xAxis: {
    type: 'datetime',
    title: {
      text: 'الوقت خلال اليوم'
    },
    tickInterval: 60 * 60 * 1000, // كل ساعة
    labels: {
      format: '{value:%H:%M}'
    },
    min: Date.UTC(2026, 0, 1, 6, 0),
    max: Date.UTC(2026, 0, 1, 23, 0)
  },

  yAxis: {
    min: 0,
    max: 10,
    tickInterval: 2,
    title: {
      text: 'الجرعة (وحدات)'
    }
  },

  tooltip: {
    useHTML: true,
    formatter: function () {
      return `
        <b>${Highcharts.dateFormat('%H:%M', this.x)}</b><br>
        ${this.y} وحدة
      `;
    }
  },

  legend: {
    enabled: false
  },

  plotOptions: {
    scatter: {
      marker: {
        radius: 6,
        fillColor: '#239EA0',
        lineWidth: 1,
        lineColor: '#239EA0'
      }
    }
  },

  series: [{
    name: 'جرعات الإنسولين',
    data: [
      [Date.UTC(2026, 0, 1, 7, 0), 8],
      [Date.UTC(2026, 0, 1, 12, 30), 6],
      [Date.UTC(2026, 0, 1, 18, 0), 10],
      [Date.UTC(2026, 0, 1, 22, 0), 4]
    ]
  }]
});