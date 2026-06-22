(function () {
  var store = window.patientFollowUpData;

  if (!store || !window.renderFacilityDashboardShell) return;

  var params = new URLSearchParams(window.location.search);
  var patientSlug = params.get("patient") || store.patient.slug;
  var patientCode = params.get("code") || store.patient.code;
  var reportType = store.helpers.normalizeReportType(params.get("reportType"));
  var patientName = store.helpers.humanizePatient(patientSlug);
  var reportData = store.reports[reportType] || store.reports["blood-sugar"];

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function setText(id, value) {
    var element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function normalizeDateValue(value) {
    if (!value) return null;
    var safeDate = value instanceof Date ? new Date(value) : new Date(value);
    if (isNaN(safeDate.getTime())) return null;
    return new Date(safeDate.getFullYear(), safeDate.getMonth(), safeDate.getDate());
  }

  function toDateKey(value) {
    var safeDate = normalizeDateValue(value);
    return safeDate ? safeDate.toISOString().slice(0, 10) : "";
  }

  function formatEnglishDate(value, options) {
    var safeDate = normalizeDateValue(value);
    if (!safeDate) return "";
    return safeDate.toLocaleDateString(
      "en-US",
      options || { month: "short", day: "2-digit", year: "numeric" }
    );
  }

  function formatAxisDate(value) {
    return formatEnglishDate(value, { month: "short", day: "2-digit" });
  }

  function metricGrid(items) {
    return (
      '<div class="fu-metric-grid">' +
      items
        .map(function (item) {
          return (
            '<div class="fu-metric"><p>' +
            escapeHtml(item.label) +
            "</p><strong>" +
            escapeHtml(item.value) +
            "</strong></div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function summaryList(items) {
    return (
      '<div class="fu-summary-list">' +
      items
        .map(function (item) {
          return (
            '<div class="fu-summary-item"><p>' +
            escapeHtml(item.label) +
            "</p><strong>" +
            escapeHtml(item.value) +
            "</strong></div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function fallbackImage(label) {
    var safeLabel = (label || "Meal").slice(0, 22);
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1000" viewBox="0 0 1200 1000">' +
      '<defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#eff8f8"/><stop offset="100%" stop-color="#d9eceb"/></linearGradient></defs>' +
      '<rect width="1200" height="1000" fill="url(#g)"/>' +
      '<circle cx="600" cy="430" r="200" fill="#ffffff" opacity="0.96"/>' +
      '<circle cx="600" cy="430" r="126" fill="#239ea0" opacity="0.18"/>' +
      '<rect x="370" y="748" width="460" height="82" rx="41" fill="#ffffff" opacity="0.96"/>' +
      '<text x="600" y="801" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="700" fill="#234646">' +
      escapeHtml(safeLabel) +
      "</text></svg>";

    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }

  function attachMealImage(img, url, label) {
    img.onerror = function () {
      img.onerror = null;
      img.src = fallbackImage(label);
    };
    img.src = url;
  }

  function buildVisitSwitches() {
    return (
      '<a class="fu-btn ' +
      (reportType === "blood-sugar" ? "is-primary" : "") +
      '" href="visit-record.html?patient=' +
      encodeURIComponent(patientSlug) +
      "&code=" +
      encodeURIComponent(patientCode) +
      '&reportType=blood-sugar">Blood Sugar Report</a>' +
      '<a class="fu-btn ' +
      (reportType === "diet-weight" ? "is-primary" : "") +
      '" href="visit-record.html?patient=' +
      encodeURIComponent(patientSlug) +
      "&code=" +
      encodeURIComponent(patientCode) +
      '&reportType=diet-weight">Diet &amp; Weight Report</a>'
    );
  }

  function bloodSugarHtml(data) {
    return (
      '<section class="fu-card">' +
      '<div class="fu-card-head"><h3>' +
      escapeHtml(data.pageHeading) +
      "</h3></div>" +
      '<div class="fu-card-body">' +
      metricGrid(data.metrics) +
      "</div>" +
      "</section>" +
      '<section class="fu-card">' +
      '<div class="fu-card-head"><h3>Blood Sugar Indicators</h3></div>' +
      '<div class="fu-card-body">' +
      '<div class="fu-date-filter">' +
      '<div class="fu-date-filter-copy"><span class="fu-date-filter-chip">Graph Date</span><b>Blood sugar graph date</b><small>Pick an English date to redraw the blood sugar graph through that day.</small></div>' +
      '<label class="fu-date-input-wrap"><i class="fi fi-rr-calendar"></i><input type="date" class="fu-date-input" id="blood-sugar-date-picker" aria-label="Blood sugar graph date"></label>' +
      "</div>" +
      '<div class="chart-range-pills blood-sugar-comparison-pills" id="blood-sugar-comparison-pills"></div>' +
      '<div class="blood-compare-graph-card">' +
      '<div class="fu-legend blood-compare-legend" id="blood-sugar-overlay-legend"></div>' +
      '<svg class="fu-chart-svg blood-compare-graph" id="blood-sugar-compare-graph" viewBox="0 0 760 300" preserveAspectRatio="none" aria-label="Normalized blood sugar comparison chart"></svg>' +
      '<div class="fu-chart-footer"><span>All selected indicators are normalized for comparison</span><span id="blood-sugar-overlay-footer">Latest values shown in legend</span></div>' +
      '<div class="blood-point-tooltip" id="blood-sugar-point-tooltip"></div>' +
      "</div>" +
      "</div>" +
      "</section>" +
      '<section class="fu-card">' +
      '<div class="fu-card-head"><h3>Insulin Future Dose Plan</h3></div>' +
      '<div class="fu-card-body">' +
      '<div class="chart-range-pills insulin-comparison-pills" id="insulin-comparison-pills"></div>' +
      '<div class="comparison-summary-grid mt-16">' +
      '<div class="comparison-summary-card"><p>Today&#39;s baseline</p><b id="insulin-today-value">34 units</b><span id="insulin-today-meta">4 dose windows logged today</span></div>' +
      '<div class="comparison-summary-card" id="insulin-baseline-card"><p>Future plan dose</p><b id="insulin-baseline-value">33 units</b><span id="insulin-baseline-meta">13/12/2023</span></div>' +
      "</div>" +
      '<div class="comparison-focus-card mt-16">' +
      '<div class="comparison-focus-head"><div><h6>Future dose by time</h6><p>Review the planned future dose for each insulin window.</p></div><span class="comparison-focus-chip" id="insulin-dose-list-chip">1 future windows changed from today</span></div>' +
      '<div class="dose-session-list" id="insulin-dose-session-list"></div>' +
      "</div>" +
      "</div>" +
      "</section>" +
      '<section class="fu-card">' +
      '<div class="fu-card-head"><h3>Blood Sugar Control Summary</h3></div>' +
      '<div class="fu-card-body">' +
      summaryList(data.summary) +
      "</div>" +
      "</section>"
    );
  }

  function dietWeightHtml(data) {
    return (
      '<section class="fu-card">' +
      '<div class="fu-card-head"><h3>' +
      escapeHtml(data.pageHeading) +
      "</h3></div>" +
      '<div class="fu-card-body">' +
      metricGrid(data.metrics) +
      "</div>" +
      "</section>" +
      '<section class="fu-card">' +
      '<div class="fu-card-head"><div><h3>Weight Comparison</h3><p id="diet-weight-chart-subtitle"></p></div><span class="comparison-state-chip" id="diet-weight-comparison-chip"></span></div>' +
      '<div class="fu-card-body">' +
      '<p class="fu-subtitle" style="margin-top:0">' +
      escapeHtml(data.comparison.copy) +
      '</p><div class="fu-date-filter">' +
      '<div class="fu-date-filter-copy"><span class="fu-date-filter-chip">Graph Date</span><b>Weight graph date</b><small>Select a logged date to redraw the weight graph.</small></div>' +
      '<label class="fu-date-input-wrap"><i class="fi fi-rr-calendar"></i><input type="date" class="fu-date-input" id="diet-weight-date-picker" aria-label="Weight graph date"></label>' +
      '</div><div class="fu-trend-graph-card">' +
      '<svg class="fu-chart-svg fu-trend-graph" id="diet-weight-trend-graph" viewBox="0 0 760 300" preserveAspectRatio="none" aria-label="Weight trend graph"></svg>' +
      '<div class="fu-chart-footer"><span id="diet-weight-graph-footer">Showing weight records through Dec 12, 2023</span><span id="diet-weight-selected-date-note">Selected date: Dec 12, 2023</span></div>' +
      '<div class="blood-point-tooltip" id="diet-weight-point-tooltip"></div>' +
      "</div>" +
      "</div>" +
      "</section>" +
      '<section class="fu-card">' +
      '<div class="fu-card-head"><div><h3>Meal Schedule</h3><p>Review the current meal schedule and update planned meals by timeline.</p></div><span class="fu-count" id="diet-meal-list-chip"></span></div>' +
      '<div class="fu-card-body">' +
      '<div class="fu-section-intro"><h5>Meals by time</h5><p>Review the current meal schedule and update planned meals by timeline.</p></div>' +
      '<div class="chart-range-pills diet-meal-filter" id="diet-meal-filter-pills"></div>' +
      '<div class="diet-meal-grid" id="diet-meal-session-list"></div>' +
      "</div>" +
      "</section>" +
      '<div class="fu-modal-backdrop d-none" id="diet-meal-ingredients-panel">' +
      '<div class="fu-modal-card fu-modal-card-wide" role="dialog" aria-modal="true" aria-labelledby="diet-meal-ingredients-title">' +
      '<button type="button" class="fu-modal-close" id="diet-meal-ingredients-close" aria-label="Close">&times;</button>' +
      '<div class="fu-modal-head"><div class="fu-modal-title-group"><h4 id="diet-meal-ingredients-title">Meal ingredients</h4><p id="diet-meal-ingredients-subtitle">Ingredients for the selected meal.</p></div></div>' +
      '<div class="diet-meal-details-sheet">' +
      '<h5 id="diet-meal-ingredients-name"></h5>' +
      '<p id="diet-meal-ingredients-copy"></p>' +
      '<ul class="diet-meal-ingredients-list" id="diet-meal-ingredients-list"></ul>' +
      "</div>" +
      "</div>" +
      "</div>" +
      '<section class="fu-card"><div class="fu-card-body">' +
      summaryList(data.summary) +
      "</div></section>" +
      '<section class="fu-insight"><h4>Doctor Insight</h4><p>' +
      escapeHtml(data.insight) +
      "</p></section>"
    );
  }

  function formatIndicatorValue(value, unit) {
    return typeof value === "number" ? value + " " + unit : "Not updated";
  }

  function formatDose(value) {
    return typeof value === "number" ? value + " units" : "Not set";
  }

  function formatWeight(value) {
    return typeof value === "number" ? value.toFixed(1) + " kg" : "Not updated";
  }

  function formatWeightDelta(value) {
    return (value > 0 ? "+" : "") + value.toFixed(1) + " kg";
  }

  function getWeightDeltaState(currentValue, baselineValue) {
    if (typeof currentValue !== "number" || typeof baselineValue !== "number") {
      return {
        deltaText: "--",
        deltaClass: "is-pending",
        badgeText: "Awaiting update",
        badgeClass: "is-pending"
      };
    }

    var delta = currentValue - baselineValue;

    if (delta > 0) {
      return {
        deltaText: formatWeightDelta(delta),
        deltaClass: "is-up",
        badgeText: "Higher",
        badgeClass: "is-up"
      };
    }

    if (delta < 0) {
      return {
        deltaText: formatWeightDelta(delta),
        deltaClass: "is-down",
        badgeText: "Lower",
        badgeClass: "is-down"
      };
    }

    return {
      deltaText: formatWeightDelta(delta),
      deltaClass: "is-flat",
      badgeText: "Stable",
      badgeClass: "is-flat"
    };
  }

  function initBloodSugarIndicators(data) {
    var pills = document.getElementById("blood-sugar-comparison-pills");
    var datePicker = document.getElementById("blood-sugar-date-picker");
    var graph = document.getElementById("blood-sugar-compare-graph");
    var legend = document.getElementById("blood-sugar-overlay-legend");
    var footer = document.getElementById("blood-sugar-overlay-footer");
    var tooltip = document.getElementById("blood-sugar-point-tooltip");
    var graphCard = graph ? graph.closest(".blood-compare-graph-card") : null;

    if (!pills || !graph || !legend || !footer || !tooltip || !graphCard) return;

    var indicatorMap = {};
    data.indicatorSeries.forEach(function (item) {
      indicatorMap[item.key] = item;
    });

    var state = {
      selectedKeys: data.indicatorSeries.map(function (item) {
        return item.key;
      }),
      selectedDateKey: toDateKey(data.indicatorSeries[0].points[data.indicatorSeries[0].points.length - 1].date)
    };

    function getSelectedDate() {
      return normalizeDateValue(state.selectedDateKey);
    }

    function getVisiblePoints(indicator) {
      var selectedDate = getSelectedDate();
      var filteredPoints = indicator.points.filter(function (point) {
        return +normalizeDateValue(point.date) <= +selectedDate;
      });
      return filteredPoints.length ? filteredPoints : indicator.points.slice(0, 1);
    }

    function hideTooltip() {
      tooltip.classList.remove("is-visible");
    }

    function renderGraph() {
      var activeKeys = state.selectedKeys.slice();
      var activeIndicators = activeKeys.map(function (key) {
        return {
          key: key,
          indicator: indicatorMap[key],
          points: getVisiblePoints(indicatorMap[key])
        };
      });
      var graphWidth = 760;
      var graphHeight = 300;
      var leftPad = 58;
      var rightPad = 20;
      var topPad = 16;
      var bottomPad = 42;
      var chartWidth = graphWidth - leftPad - rightPad;
      var chartHeight = graphHeight - topPad - bottomPad;
      var pointCount = activeIndicators.length
        ? Math.max.apply(
            null,
            activeIndicators.map(function (indicator) {
              return indicator.points.length;
            })
          )
        : 0;

      function xFor(index) {
        return leftPad + (chartWidth / Math.max(pointCount - 1, 1)) * index;
      }

      function yFor(value, indicatorData) {
        var values = indicatorData.points.map(function (point) {
          return point.value;
        });
        var min = Math.min.apply(null, values.concat(indicatorData.indicator.range || []));
        var max = Math.max.apply(null, values.concat(indicatorData.indicator.range || []));
        var span = max - min || 1;
        var normalized = ((value - min) / span) * 100;

        return topPad + ((100 - normalized) / 100) * chartHeight;
      }

      if (!activeKeys.length) {
        graph.innerHTML =
          '<text x="' +
          graphWidth / 2 +
          '" y="' +
          graphHeight / 2 +
          '" text-anchor="middle" fill="#6b7c86" font-size="18">Select at least one indicator</text>';
        footer.textContent = "Select at least one indicator";
        hideTooltip();
        return;
      }

      var gridValues = [0, 25, 50, 75, 100];
      var axisLabels = activeIndicators[0].points;

      graph.innerHTML =
        '<rect x="' +
        leftPad +
        '" y="' +
        topPad +
        '" width="' +
        chartWidth +
        '" height="' +
        chartHeight / 3 +
        '" fill="rgba(217, 151, 54, 0.10)"></rect>' +
        '<rect x="' +
        leftPad +
        '" y="' +
        (topPad + chartHeight / 3) +
        '" width="' +
        chartWidth +
        '" height="' +
        chartHeight / 3 +
        '" fill="rgba(35, 158, 160, 0.10)"></rect>' +
        '<rect x="' +
        leftPad +
        '" y="' +
        (topPad + (chartHeight / 3) * 2) +
        '" width="' +
        chartWidth +
        '" height="' +
        chartHeight / 3 +
        '" fill="rgba(110, 86, 207, 0.08)"></rect>' +
        gridValues
          .map(function (value) {
            var y = topPad + ((100 - value) / 100) * chartHeight;
            return (
              '<line x1="' +
              leftPad +
              '" y1="' +
              y +
              '" x2="' +
              (graphWidth - rightPad) +
              '" y2="' +
              y +
              '" stroke="rgba(27, 43, 52, 0.10)" stroke-width="1"></line>' +
              '<text x="' +
              (leftPad - 10) +
              '" y="' +
              (y + 4) +
              '" text-anchor="end" fill="#6b7c86" font-size="12">' +
              value +
              "%</text>"
            );
          })
          .join("") +
        axisLabels
          .map(function (point, index) {
            return (
              '<text x="' +
              xFor(index) +
              '" y="' +
              (graphHeight - 10) +
              '" text-anchor="middle" fill="#6b7c86" font-size="12">' +
              escapeHtml(formatAxisDate(point.date)) +
              "</text>"
            );
          })
          .join("") +
        activeKeys
          .map(function (key) {
            var indicatorData = activeIndicators.find(function (item) {
              return item.key === key;
            });
            if (!indicatorData) return "";
            var indicator = indicatorData.indicator;
            var values = indicatorData.points.map(function (point) {
              return point.value;
            });
            var min = Math.min.apply(null, values.concat(indicator.range || []));
            var max = Math.max.apply(null, values.concat(indicator.range || []));
            var span = max - min || 1;
            var path = indicatorData.points
              .map(function (point, index) {
                return (index === 0 ? "M " : " L ") + xFor(index) + " " + yFor(point.value, indicatorData);
              })
              .join("");
            var points = indicatorData.points
              .map(function (point, index) {
                var percent = Math.round(((point.value - min) / span) * 100);
                var isSelectedDate = toDateKey(point.date) === state.selectedDateKey;
                return (
                  '<circle cx="' +
                  xFor(index) +
                  '" cy="' +
                  yFor(point.value, indicatorData) +
                  '" r="11" fill="transparent" data-indicator-label="' +
                  escapeHtml(indicator.label) +
                  '" data-point-label="' +
                  escapeHtml(formatEnglishDate(point.date)) +
                  '" data-point-value="' +
                  escapeHtml(formatIndicatorValue(point.value, indicator.unit)) +
                  '" data-point-percent="' +
                  percent +
                  '"></circle>' +
                  '<circle class="blood-indicator-point' +
                  (isSelectedDate ? " is-selected-date" : "") +
                  '" cx="' +
                  xFor(index) +
                  '" cy="' +
                  yFor(point.value, indicatorData) +
                  '" r="' +
                  (isSelectedDate ? "7" : "6") +
                  '" fill="' +
                  indicator.color +
                  '" stroke="#ffffff" stroke-width="3" pointer-events="none"></circle>'
                );
              })
              .join("");

            return (
              '<path d="' +
              path +
              '" fill="none" stroke="' +
              indicator.color +
              '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>' +
              points
            );
          })
          .join("");

      footer.textContent = "Showing indicators through " + formatEnglishDate(getSelectedDate());
      hideTooltip();
    }

    function renderLegend() {
      if (!state.selectedKeys.length) {
        legend.innerHTML = '<span class="blood-compare-empty">No indicator is selected.</span>';
        return;
      }

      legend.innerHTML = state.selectedKeys
        .map(function (key) {
          var indicator = indicatorMap[key];
          var visiblePoints = getVisiblePoints(indicator);
          var latestPoint = visiblePoints[visiblePoints.length - 1];
          return (
            '<span class="blood-compare-legend-item">' +
            '<i style="background:' +
            indicator.color +
            '"></i>' +
            escapeHtml(indicator.label) +
            " • " +
            escapeHtml(formatIndicatorValue(latestPoint.value, indicator.unit)) +
            "</span>"
          );
        })
        .join("");
    }

    function renderPills() {
      pills.innerHTML = data.indicatorSeries
        .map(function (indicator) {
          var activeClass = state.selectedKeys.indexOf(indicator.key) >= 0 ? " active" : "";
          return (
            '<button type="button" class="range-pill-btn' +
            activeClass +
            '" data-blood-indicator-key="' +
            indicator.key +
            '">' +
            escapeHtml(indicator.label) +
            "</button>"
          );
        })
        .join("");
    }

    function renderAll() {
      renderPills();
      renderLegend();
      renderGraph();
    }

    pills.addEventListener("click", function (event) {
      var button = event.target.closest("[data-blood-indicator-key]");
      if (!button) return;

      var key = button.getAttribute("data-blood-indicator-key");
      var index = state.selectedKeys.indexOf(key);

      if (index >= 0) {
        state.selectedKeys.splice(index, 1);
      } else if (indicatorMap[key]) {
        state.selectedKeys.push(key);
      }

      renderAll();
    });

    graph.addEventListener("mousemove", function (event) {
      var point = event.target.closest && event.target.closest("[data-indicator-label]");
      if (!point || !graph.contains(point)) {
        hideTooltip();
        return;
      }

      var rect = graphCard.getBoundingClientRect();
      var tooltipX = Math.max(12, Math.min(event.clientX - rect.left + 14, rect.width - 220));
      var tooltipY = Math.max(12, event.clientY - rect.top - 18);

      tooltip.style.left = tooltipX + "px";
      tooltip.style.top = tooltipY + "px";
      tooltip.innerHTML =
        "<b>" +
        escapeHtml(point.getAttribute("data-indicator-label")) +
        "</b><span>" +
        escapeHtml(point.getAttribute("data-point-label")) +
        " result: " +
        escapeHtml(point.getAttribute("data-point-value")) +
        "</span><span>Graph position: " +
        escapeHtml(point.getAttribute("data-point-percent")) +
        "%</span>";
      tooltip.classList.add("is-visible");
    });

    graphCard.addEventListener("mouseleave", hideTooltip);

    if (datePicker) {
      datePicker.min = toDateKey(data.indicatorSeries[0].points[0].date);
      datePicker.max = toDateKey(data.indicatorSeries[0].points[data.indicatorSeries[0].points.length - 1].date);
      datePicker.value = state.selectedDateKey;
      datePicker.addEventListener("change", function () {
        if (!datePicker.value) return;
        state.selectedDateKey = datePicker.value;
        renderAll();
      });
    }

    renderAll();
  }

  function initInsulinFuturePlan(data) {
    var insulinData = clone(data.insulin);
    var pills = document.getElementById("insulin-comparison-pills");
    var chip = document.getElementById("insulin-dose-list-chip");
    var list = document.getElementById("insulin-dose-session-list");
    if (!pills || !chip || !list) {
      return;
    }

    var state = {
      selectedFutureKey: insulinData.futureOptions[0].key
    };

    function getSelectedFuturePlan() {
      return insulinData.futurePlans[state.selectedFutureKey];
    }

    function getFutureOption() {
      return (
        insulinData.futureOptions.find(function (option) {
          return option.key === state.selectedFutureKey;
        }) || insulinData.futureOptions[0]
      );
    }

    function getDoseTotal(series) {
      return series.reduce(function (sum, value) {
        return sum + (typeof value === "number" ? value : 0);
      }, 0);
    }

    function getChangedDoseCount(todaySeries, futureSeries) {
      return todaySeries.reduce(function (count, todayValue, index) {
        return todayValue !== futureSeries[index] ? count + 1 : count;
      }, 0);
    }

    function renderFuturePills() {
      pills.innerHTML = insulinData.futureOptions
        .map(function (option) {
          var activeClass = option.key === state.selectedFutureKey ? " active" : "";
          return (
            '<button type="button" class="range-pill-btn' +
            activeClass +
            '" data-insulin-future-key="' +
            option.key +
            '">' +
            escapeHtml(option.pillLabel) +
            "</button>"
          );
        })
        .join("");
    }

    function renderDoseRows() {
      var futurePlan = getSelectedFuturePlan();
      var option = getFutureOption();

      list.innerHTML = insulinData.doseWindows
        .map(function (doseWindow, index) {
          var todayValue = insulinData.today[index];
          var futureValue = futurePlan[index];
          return (
            '<div class="dose-session-row is-future-dose-row">' +
            '<div class="dose-session-slot"><b>' +
            escapeHtml(doseWindow.label) +
            "</b><span>" +
            escapeHtml(doseWindow.timeLabel) +
            "</span></div>" +
            '<div class="dose-session-value"><small>Today</small><b>' +
            escapeHtml(formatDose(todayValue)) +
            "</b></div>" +
            '<div class="dose-session-value"><small>' +
            escapeHtml(option.label) +
            "</small><b>" +
            escapeHtml(formatDose(futureValue)) +
            "</b></div>" +
            "</div>"
          );
        })
        .join("");
    }

    function renderFuturePlan() {
      var option = getFutureOption();
      var futurePlan = getSelectedFuturePlan();
      var todayTotal = getDoseTotal(insulinData.today);
      var futureTotal = getDoseTotal(futurePlan);
      var changedCount = getChangedDoseCount(insulinData.today, futurePlan);

      renderFuturePills();
      setText("insulin-today-value", formatDose(todayTotal));
      setText("insulin-today-meta", insulinData.today.length + " dose windows logged today");
      setText("insulin-baseline-value", formatDose(futureTotal));
      setText("insulin-baseline-meta", option.date + " - future plan");
      chip.textContent = changedCount ? changedCount + " future windows changed from today" : "Matches today's baseline";
      renderDoseRows();
    }

    pills.addEventListener("click", function (event) {
      var button = event.target.closest("[data-insulin-future-key]");
      if (!button) return;

      state.selectedFutureKey = button.getAttribute("data-insulin-future-key") || insulinData.futureOptions[0].key;
      renderFuturePlan();
    });

    renderFuturePlan();
  }

  function initDietWeightComparison(data) {
    var comparisonData = clone(data.comparison);
    var datePicker = document.getElementById("diet-weight-date-picker");
    var graph = document.getElementById("diet-weight-trend-graph");
    var footer = document.getElementById("diet-weight-graph-footer");
    var note = document.getElementById("diet-weight-selected-date-note");
    var tooltip = document.getElementById("diet-weight-point-tooltip");
    var graphCard = graph ? graph.closest(".fu-trend-graph-card") : null;

    if (!datePicker || !graph || !footer || !note || !tooltip || !graphCard) return;

    var records = comparisonData.records
      .map(function (record) {
        return {
          dateKey: toDateKey(record.date),
          dateObj: normalizeDateValue(record.date),
          value: record.value,
          meta: record.meta || "Morning check-in"
        };
      })
      .sort(function (a, b) {
        return +a.dateObj - +b.dateObj;
      });

    var recordMap = {};
    records.forEach(function (record) {
      recordMap[record.dateKey] = record;
    });

    var state = {
      selectedDateKey: records[records.length - 1].dateKey
    };

    function hideTooltip() {
      tooltip.classList.remove("is-visible");
    }

    function render() {
      var selectedRecord = recordMap[state.selectedDateKey] || records[records.length - 1];
      var visibleRecords = records.filter(function (record) {
        return +record.dateObj <= +selectedRecord.dateObj;
      });
      var graphWidth = 760;
      var graphHeight = 300;
      var leftPad = 58;
      var rightPad = 20;
      var topPad = 16;
      var bottomPad = 42;
      var chartWidth = graphWidth - leftPad - rightPad;
      var chartHeight = graphHeight - topPad - bottomPad;
      var values = visibleRecords
        .map(function (record) {
          return record.value;
        })
        .concat(typeof comparisonData.goalValue === "number" ? [comparisonData.goalValue] : []);
      var minValue = Math.floor((Math.min.apply(null, values) - 1) * 2) / 2;
      var maxValue = Math.ceil((Math.max.apply(null, values) + 1) * 2) / 2;
      var valueRange = maxValue - minValue || 1;

      function xFor(index) {
        return leftPad + (chartWidth / Math.max(visibleRecords.length - 1, 1)) * index;
      }

      function yFor(value) {
        return topPad + ((maxValue - value) / valueRange) * chartHeight;
      }

      var tickValues = [0, 1, 2, 3, 4].map(function (index) {
        return maxValue - (valueRange / 4) * index;
      });
      var linePath = visibleRecords
        .map(function (record, index) {
          return (index === 0 ? "M " : " L ") + xFor(index) + " " + yFor(record.value);
        })
        .join("");
      var areaPath =
        linePath +
        " L " +
        xFor(visibleRecords.length - 1) +
        " " +
        (graphHeight - bottomPad) +
        " L " +
        xFor(0) +
        " " +
        (graphHeight - bottomPad) +
        " Z";

      graph.innerHTML =
        '<defs><linearGradient id="diet-weight-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#0f8c8c" stop-opacity="0.28"/><stop offset="100%" stop-color="#0f8c8c" stop-opacity="0.03"/></linearGradient></defs>' +
        tickValues
          .map(function (value) {
            var y = yFor(value);
            return (
              '<line x1="' +
              leftPad +
              '" y1="' +
              y +
              '" x2="' +
              (graphWidth - rightPad) +
              '" y2="' +
              y +
              '" stroke="rgba(27, 43, 52, 0.10)" stroke-width="1"></line>' +
              '<text x="' +
              (leftPad - 10) +
              '" y="' +
              (y + 4) +
              '" text-anchor="end" fill="#6b7c86" font-size="12">' +
              value.toFixed(1) +
              "</text>"
            );
          })
          .join("") +
        (typeof comparisonData.goalValue === "number"
          ? '<line x1="' +
            leftPad +
            '" y1="' +
            yFor(comparisonData.goalValue) +
            '" x2="' +
            (graphWidth - rightPad) +
            '" y2="' +
            yFor(comparisonData.goalValue) +
            '" stroke="#0f9f61" stroke-width="2" stroke-dasharray="6 6"></line>'
          : "") +
        visibleRecords
          .map(function (record, index) {
            return (
              '<text x="' +
              xFor(index) +
              '" y="' +
              (graphHeight - 10) +
              '" text-anchor="middle" fill="#6b7c86" font-size="12">' +
              escapeHtml(formatAxisDate(record.dateObj)) +
              "</text>"
            );
          })
          .join("") +
        '<path d="' +
        areaPath +
        '" fill="url(#diet-weight-fill)"></path>' +
        '<path d="' +
        linePath +
        '" fill="none" stroke="#0f8c8c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>' +
        visibleRecords
          .map(function (record, index) {
            var isSelected = record.dateKey === selectedRecord.dateKey;
            return (
              '<circle cx="' +
              xFor(index) +
              '" cy="' +
              yFor(record.value) +
              '" r="11" fill="transparent" data-point-value="' +
              escapeHtml(formatWeight(record.value)) +
              '" data-point-date="' +
              escapeHtml(formatEnglishDate(record.dateObj)) +
              '" data-point-meta="' +
              escapeHtml(record.meta) +
              '"></circle>' +
              '<circle class="blood-indicator-point' +
              (isSelected ? " is-selected-date" : "") +
              '" cx="' +
              xFor(index) +
              '" cy="' +
              yFor(record.value) +
              '" r="' +
              (isSelected ? "7" : "6") +
              '" fill="' +
              (isSelected ? "#173534" : "#0f8c8c") +
              '" stroke="#ffffff" stroke-width="3" pointer-events="none"></circle>'
            );
          })
          .join("");

      setText("diet-weight-chart-subtitle", "Weight graph / " + formatEnglishDate(selectedRecord.dateObj));
      setText("diet-weight-comparison-chip", formatWeight(selectedRecord.value));
      footer.textContent = "Showing weight records through " + formatEnglishDate(selectedRecord.dateObj);
      note.textContent = "Selected date: " + formatEnglishDate(selectedRecord.dateObj) + " • " + formatWeight(selectedRecord.value);
      hideTooltip();
    }

    datePicker.min = records[0].dateKey;
    datePicker.max = records[records.length - 1].dateKey;
    datePicker.value = state.selectedDateKey;
    datePicker.addEventListener("change", function () {
      if (!datePicker.value) return;
      state.selectedDateKey = datePicker.value;
      render();
    });

    graph.addEventListener("mousemove", function (event) {
      var point = event.target.closest && event.target.closest("[data-point-value]");
      if (!point || !graph.contains(point)) {
        hideTooltip();
        return;
      }

      var rect = graphCard.getBoundingClientRect();
      var tooltipX = Math.max(12, Math.min(event.clientX - rect.left + 14, rect.width - 220));
      var tooltipY = Math.max(12, event.clientY - rect.top - 18);

      tooltip.style.left = tooltipX + "px";
      tooltip.style.top = tooltipY + "px";
      tooltip.innerHTML =
        "<b>" +
        escapeHtml(point.getAttribute("data-point-value")) +
        "</b><span>" +
        escapeHtml(point.getAttribute("data-point-date")) +
        "</span><span>" +
        escapeHtml(point.getAttribute("data-point-meta")) +
        "</span>";
      tooltip.classList.add("is-visible");
    });

    graphCard.addEventListener("mouseleave", hideTooltip);

    render();
  }

  function initDietMeals(data) {
    var mealsData = clone(data.meals);
    var pills = document.getElementById("diet-meal-filter-pills");
    var chip = document.getElementById("diet-meal-list-chip");
    var list = document.getElementById("diet-meal-session-list");
    var panel = document.getElementById("diet-meal-ingredients-panel");
    var closeBtn = document.getElementById("diet-meal-ingredients-close");

    if (!pills || !chip || !list || !panel || !closeBtn) return;

    var state = {
      selectedFilter: mealsData.filterOptions[0].key
    };

    function getFilterLabel(key) {
      var option = mealsData.filterOptions.find(function (item) {
        return item.key === key;
      });

      return option ? option.label : mealsData.filterOptions[0].label;
    }

    function getVisibleMeals() {
      return mealsData.collections[state.selectedFilter] || mealsData.collections.current || [];
    }

    function getChipText() {
      if (state.selectedFilter !== "current") {
        return "Planned meals for " + getFilterLabel(state.selectedFilter);
      }

      var visibleMeals = getVisibleMeals();
      var completed = visibleMeals.filter(function (meal) {
        return meal.temporalState === "current-completed";
      }).length;
      var upcoming = visibleMeals.filter(function (meal) {
        return meal.temporalState === "current-upcoming";
      }).length;

      return completed + " completed • " + upcoming + " upcoming";
    }

    function getStateBadge(meal) {
      if (state.selectedFilter !== "current") {
        return { label: getFilterLabel(state.selectedFilter), className: "is-future" };
      }

      if (meal.temporalState === "current-completed") {
        return { label: "Completed", className: "is-completed" };
      }

      if (meal.temporalState === "current-upcoming") {
        return { label: "Upcoming", className: "is-upcoming" };
      }

      return { label: "Future", className: "is-future" };
    }

    function getCardClass(meal) {
      if (meal.temporalState === "current-completed") return "is-current-completed";
      if (meal.temporalState === "current-upcoming") return "is-current-upcoming";
      return "is-future";
    }

    function openIngredients(meal) {
      setText("diet-meal-ingredients-title", meal.slot + " Ingredients");
      setText("diet-meal-ingredients-subtitle", "Ingredients for the selected meal.");
      setText("diet-meal-ingredients-name", meal.title);
      setText(
        "diet-meal-ingredients-copy",
        state.selectedFilter === "current"
          ? "Current package meal composition."
          : "Planned meal composition for " + getFilterLabel(state.selectedFilter) + "."
      );

      var ingredientsList = document.getElementById("diet-meal-ingredients-list");
      ingredientsList.innerHTML = meal.ingredients
        .map(function (ingredient) {
          return "<li>" + escapeHtml(ingredient) + "</li>";
        })
        .join("");

      panel.classList.remove("d-none");
    }

    function closeIngredients() {
      panel.classList.add("d-none");
    }

    function renderFilters() {
      pills.innerHTML = mealsData.filterOptions
        .map(function (option) {
          var activeClass = option.key === state.selectedFilter ? " active" : "";
          return (
            '<button type="button" class="range-pill-btn' +
            activeClass +
            '" data-diet-meal-filter="' +
            option.key +
            '">' +
            escapeHtml(option.label) +
            "</button>"
          );
        })
        .join("");
    }

    function renderMeals() {
      chip.textContent = getChipText();
      list.innerHTML = "";

      getVisibleMeals().forEach(function (meal) {
        var badge = getStateBadge(meal);
        var row = document.createElement("article");
        row.className = "diet-meal-row " + getCardClass(meal);

        var slotCell = document.createElement("div");
        slotCell.className = "diet-meal-slot-cell";
        slotCell.innerHTML =
          "<b>" + escapeHtml(meal.slot) + "</b><span>" + escapeHtml(meal.timeLabel) + "</span>";

        var mealCell = document.createElement("div");
        mealCell.className = "diet-meal-meal-cell";

        var panelCard = document.createElement("div");
        panelCard.className = "diet-meal-panel";

        var media = document.createElement("div");
        media.className = "diet-meal-panel__media";

        var img = document.createElement("img");
        img.alt = meal.title;
        attachMealImage(img, meal.image, meal.slot);
        media.appendChild(img);

        var body = document.createElement("div");
        body.className = "diet-meal-panel__body";

        var head = document.createElement("div");
        head.className = "diet-meal-panel__head";

        var summary = document.createElement("div");
        summary.className = "diet-meal-panel__summary";

        var title = document.createElement("h4");
        title.className = "diet-meal-panel__title";
        title.textContent = meal.title;

        var stateBadge = document.createElement("span");
        stateBadge.className = "diet-meal-state " + badge.className;
        stateBadge.textContent = badge.label;

        var meta = document.createElement("p");
        meta.className = "diet-meal-panel__meta";
        meta.textContent = meal.ingredients.join(" / ");

        var actions = document.createElement("div");
        actions.className = "diet-meal-panel__actions is-single";

        var ingredientsButton = document.createElement("button");
        ingredientsButton.type = "button";
        ingredientsButton.className = "diet-meal-action-btn ingredients-btn";
        ingredientsButton.setAttribute("data-diet-meal-ingredients", meal.slotKey);
        ingredientsButton.innerHTML = '<i class="fi fi-rr-eye"></i><span>Ingredients</span>';

        summary.appendChild(title);
        head.appendChild(summary);
        head.appendChild(stateBadge);
        actions.appendChild(ingredientsButton);
        body.appendChild(head);
        body.appendChild(meta);
        body.appendChild(actions);
        panelCard.appendChild(media);
        panelCard.appendChild(body);
        mealCell.appendChild(panelCard);
        row.appendChild(slotCell);
        row.appendChild(mealCell);
        list.appendChild(row);
      });
    }

    pills.addEventListener("click", function (event) {
      var button = event.target.closest("[data-diet-meal-filter]");
      if (!button) return;

      state.selectedFilter = button.getAttribute("data-diet-meal-filter") || mealsData.filterOptions[0].key;
      renderFilters();
      renderMeals();
    });

    list.addEventListener("click", function (event) {
      var button = event.target.closest("[data-diet-meal-ingredients]");
      if (!button) return;

      var meal = getVisibleMeals().find(function (item) {
        return item.slotKey === button.getAttribute("data-diet-meal-ingredients");
      });

      if (meal) openIngredients(meal);
    });

    closeBtn.addEventListener("click", closeIngredients);
    panel.addEventListener("click", function (event) {
      if (event.target === panel) closeIngredients();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.classList.contains("d-none")) {
        closeIngredients();
      }
    });

    renderFilters();
    renderMeals();
  }

  function initReport() {
    window.renderFacilityDashboardShell({
      title: "Follow-Up Report",
      breadcrumbs: [
        { label: "Home", href: "../index.html" },
        { label: "Patients", href: "patients-list.html" },
        { label: "Follow-Up Report" }
      ],
      contentHtml:
        '<div class="fu-shell">' +
        '<section class="fu-card">' +
        '<div class="fu-card-body">' +
        '<div class="fu-metric-grid">' +
        '<div class="fu-metric"><p>Care Provider</p><strong id="fuTopProvider"></strong></div>' +
        '<div class="fu-metric"><p>Hospital</p><strong id="fuTopHospital"></strong></div>' +
        '<div class="fu-metric"><p>Record Date</p><strong id="fuTopDate"></strong></div>' +
        '<div class="fu-metric"><p>Report Type</p><strong id="fuTopType"></strong></div>' +
        "</div>" +
        '<div class="fu-report-actions mt-16">' +
        '<button type="button" class="fu-btn is-solid" id="fuPrintReport"><i class="fi fi-rr-download"></i>Download PDF</button>' +
        '<div class="fu-btn-row" id="fuVisitSwitches"></div>' +
        "</div>" +
        "</div>" +
        "</section>" +
        '<div class="fu-chip-row">' +
        '<span class="fu-chip"><i class="fi fi-rr-user"></i> Patient: <b>' +
        escapeHtml(patientName) +
        "</b></span>" +
        '<span class="fu-chip"><i class="fi fi-rr-clock"></i> Last Updated: <b id="fuTopUpdated"></b></span>' +
        '<span class="fu-chip"><i class="fi fi-rr-calendar"></i> Record Date: <b id="fuTopDateChip"></b></span>' +
        "</div>" +
        '<div class="fu-report-grid" id="fuVisitDynamic"></div>' +
        "</div>"
    });

    setText("fuTopProvider", store.patient.careProvider);
    setText("fuTopHospital", store.patient.hospital);
    setText("fuTopDate", store.patient.recordDate);
    setText("fuTopType", reportData.label);
    setText("fuTopUpdated", reportData.lastUpdated);
    setText("fuTopDateChip", store.patient.recordDate);
    document.getElementById("fuVisitSwitches").innerHTML = buildVisitSwitches();
    document.getElementById("fuVisitDynamic").innerHTML =
      reportType === "diet-weight" ? dietWeightHtml(reportData) : bloodSugarHtml(reportData);

    if (reportType === "diet-weight") {
      initDietWeightComparison(reportData);
      initDietMeals(reportData);
    } else {
      initBloodSugarIndicators(reportData);
      initInsulinFuturePlan(reportData);
    }

    document.getElementById("fuPrintReport").addEventListener("click", function () {
      window.print();
    });

    document.title = "Naraakum | " + reportData.label + " Report";
  }

  initReport();
})();
