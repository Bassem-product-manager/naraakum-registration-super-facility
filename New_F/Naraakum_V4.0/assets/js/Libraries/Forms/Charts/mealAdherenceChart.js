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
    title: { text: 'الوقت خلال اليوم' },
    tickInterval: 2 * 60 * 60 * 1000,
    labels: { format: '{value:%H:%M}' },
    min: Date.UTC(2026, 0, 1, 6, 0),
    max: Date.UTC(2026, 0, 1, 23, 0)
  },
  yAxis: {
    categories: ['الإفطار', 'سناك', 'الغداء', 'سناك', 'العشاء'],
    title: { text: 'الوجبات' },
    min: 0,
    max: 4,
    tickInterval: 1
  },
  tooltip: {
    useHTML: true,
    formatter: function () {
      const statuses = {
        done: 'تم الالتزام',
        partial: 'التزام جزئي',
        missed: 'لم يتم'
      };
      return `
        <b>${Highcharts.dateFormat('%H:%M', this.x)}</b><br>
        ${this.point.meal}<br>
        ${statuses[this.point.status]}
      `;
    }
  },
  legend: { enabled: false },
  plotOptions: {
    scatter: {
      marker: {
        radius: 7,
        lineWidth: 1,
        lineColor: '#239EA0'
      }
    }
  },
  series: [{
    name: 'الالتزام بالوجبات',
    color: '#239EA0',
    data: [
      { x: Date.UTC(2026, 0, 1, 8, 0), y: 0, meal: 'الإفطار', status: 'done' },
      { x: Date.UTC(2026, 0, 1, 11, 0), y: 1, meal: 'سناك', status: 'done' },
      { x: Date.UTC(2026, 0, 1, 14, 0), y: 2, meal: 'الغداء', status: 'partial' },
      { x: Date.UTC(2026, 0, 1, 17, 0), y: 3, meal: 'سناك', status: 'done' },
      { x: Date.UTC(2026, 0, 1, 20, 0), y: 4, meal: 'العشاء', status: 'done' }
    ]
  }],
  credits: { enabled: false }
});
