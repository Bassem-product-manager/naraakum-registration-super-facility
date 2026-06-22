(function () {
  "use strict";

  var state = {
    range: "30",
    anchorDate: null
  };

  function asArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function safeNumber(value) {
    var num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }

  function safeText(value) {
    return (value || "").toString();
  }

  function parseDate(value) {
    if (!value) return null;
    var raw = String(value).trim();
    if (!raw) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      var onlyDate = new Date(raw + "T00:00:00Z");
      if (!Number.isNaN(onlyDate.getTime())) return onlyDate;
    }

    var dt = new Date(raw);
    return Number.isNaN(dt.getTime()) ? null : dt;
  }

  function startOfUtcDay(date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
  }

  function endOfUtcDay(date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
  }

  function isoDate(date) {
    return date.toISOString().slice(0, 10);
  }

  function formatDate(value) {
    var dt = parseDate(value);
    if (!dt) return "-";
    return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  function formatKsaDateTime(value) {
    var dt = value instanceof Date ? value : parseDate(value);
    if (!dt) return "-";
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Riyadh",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).format(dt);
  }

  function formatMoney(value, paymentApi) {
    if (paymentApi && typeof paymentApi.formatMoney === "function") {
      return paymentApi.formatMoney(value);
    }
    return safeNumber(value).toFixed(2) + " SAR";
  }

  function formatPercent(value) {
    return (safeNumber(value) * 100).toFixed(1).replace(/\.0$/, "") + "%";
  }

  function formatDeltaMoney(value, paymentApi) {
    if (!Number.isFinite(value)) return "N/A";
    if (Math.abs(value) < 0.005) return "No change";
    return (value > 0 ? "+" : "-") + formatMoney(Math.abs(value), paymentApi);
  }

  function formatCompactMoney(value, paymentApi) {
    var amount = safeNumber(value);
    var absAmount = Math.abs(amount);
    if (absAmount >= 1000000) return (amount / 1000000).toFixed(2).replace(/\.00$/, "") + "M SAR";
    if (absAmount >= 1000) return (amount / 1000).toFixed(2).replace(/\.00$/, "") + "K SAR";
    return formatMoney(amount, paymentApi);
  }

  function getSources() {
    var paymentApi = window.NKPaymentData;
    var patientsApi = window.NKPatientsData;
    var serviceReturnsApi = window.NKServiceReturns;
    var pharmacyReturnsApi = window.NKReturns;

    var transactions = null;
    var patientOrders = null;
    var serviceReturns = null;
    var pharmacyReturns = null;

    try {
      transactions = paymentApi && typeof paymentApi.getTransactions === "function" ? asArray(paymentApi.getTransactions()) : null;
    } catch (err) {
      transactions = null;
    }

    try {
      patientOrders = patientsApi && Array.isArray(patientsApi.orders) ? patientsApi.orders.slice() : null;
    } catch (err) {
      patientOrders = null;
    }

    try {
      serviceReturns = serviceReturnsApi && typeof serviceReturnsApi.load === "function" ? asArray(serviceReturnsApi.load()) : null;
    } catch (err) {
      serviceReturns = null;
    }

    try {
      pharmacyReturns = pharmacyReturnsApi && typeof pharmacyReturnsApi.load === "function" ? asArray(pharmacyReturnsApi.load()) : null;
    } catch (err) {
      pharmacyReturns = null;
    }

    return {
      paymentApi: paymentApi || null,
      patientsApi: patientsApi || null,
      serviceReturnsApi: serviceReturnsApi || null,
      pharmacyReturnsApi: pharmacyReturnsApi || null,
      transactions: transactions,
      patientOrders: patientOrders,
      serviceReturns: serviceReturns,
      pharmacyReturns: pharmacyReturns
    };
  }

  function detectAnchorDate(data) {
    var timestamps = [];

    asArray(data.transactions).forEach(function (row) {
      var orderDate = parseDate(row.orderDate || row.scheduledDate);
      if (orderDate) timestamps.push(orderDate.getTime());
    });

    asArray(data.patientOrders).forEach(function (row) {
      var createdAt = parseDate(row.createdAt);
      if (createdAt) timestamps.push(createdAt.getTime());
    });

    asArray(data.serviceReturns).forEach(function (row) {
      var returnDate = parseDate(row.returnDate || row.releasedAt);
      if (returnDate) timestamps.push(returnDate.getTime());
    });

    asArray(data.pharmacyReturns).forEach(function (row) {
      var pharmacyReturnDate = parseDate(row.returnDate || row.releasedAt);
      if (pharmacyReturnDate) timestamps.push(pharmacyReturnDate.getTime());
    });

    if (!timestamps.length) return new Date();
    return new Date(Math.max.apply(null, timestamps));
  }

  function getRangeWindow(range, anchorDate) {
    var anchor = anchorDate instanceof Date ? anchorDate : new Date();
    var to = endOfUtcDay(anchor);
    if (range === "all") {
      return { from: null, to: to };
    }

    var days = Number(range);
    if (!Number.isFinite(days) || days <= 0) days = 30;

    var from = startOfUtcDay(anchor);
    from.setUTCDate(from.getUTCDate() - (days - 1));
    return { from: from, to: to };
  }

  function inRange(value, windowRange) {
    var dt = parseDate(value);
    if (!dt) return false;
    if (!windowRange.from) return dt.getTime() <= windowRange.to.getTime();
    return dt.getTime() >= windowRange.from.getTime() && dt.getTime() <= windowRange.to.getTime();
  }

  function buildDateFilters(windowRange) {
    if (!windowRange.from) return {};
    return {
      dateFrom: isoDate(windowRange.from),
      dateTo: isoDate(windowRange.to)
    };
  }

  function setText(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function statusMeta(status) {
    var key = safeText(status).trim().toLowerCase();
    if (key === "completed") return { cls: "st-completed", label: "Completed" };
    if (key === "refunded") return { cls: "st-refunded", label: "Refunded" };
    if (key === "canceled" || key === "cancelled") return { cls: "st-canceled", label: "Canceled" };
    return { cls: "st-notyet", label: "Not Yet" };
  }

  function buildOrderDetailsHref(row) {
    var providerType = safeText(row.providerType).trim().toLowerCase();
    var itemType = safeText(row.itemType).trim().toLowerCase();
    var page = "order-details-facility.html";
    var mode = "facility";

    if (providerType === "pharmacy" || itemType === "product") {
      page = "order-details-pharmacy.html";
      mode = "pharmacy";
    } else if (providerType === "individual") {
      mode = "individual";
    }

    return (
      "Order-Managment/" +
      page +
      "?order=" +
      encodeURIComponent(row.orderNo || "") +
      "&providerType=" +
      encodeURIComponent(mode) +
      "&from=transaction-orders"
    );
  }

  function renderUnavailable(hostId) {
    var host = document.getElementById(hostId);
    if (!host) return;
    host.innerHTML = '<div class="widget-unavailable">Data source unavailable</div>';
  }

  function renderEmpty(hostId) {
    var host = document.getElementById(hostId);
    if (!host) return;
    host.innerHTML = '<div class="widget-empty">No data in the selected range</div>';
  }

  function renderKpis(data, filteredTransactions, filteredPatientOrders, dateFilters) {
    var paymentApi = data.paymentApi;

    if (!Array.isArray(data.transactions)) {
      setText("kpiGrossRevenue", "--");
      setText("kpiNetCollected", "--");
      setText("kpiOutstanding", "--");
      setText("kpiRefunded", "--");
    } else {
      var gross = 0;
      var collected = 0;
      var outstanding = 0;
      var refunded = 0;

      filteredTransactions.forEach(function (row) {
        var status = safeText(row.transactionStatus).toLowerCase();
        var isCanceled = status === "canceled" || status === "cancelled";
        if (!isCanceled) gross += safeNumber(row.totalPrice);
        collected += safeNumber(row.depositPaid);
        outstanding += safeNumber(row.remaining);
        refunded += safeNumber(row.refundAmount);
      });

      setText("kpiGrossRevenue", formatMoney(gross, paymentApi));
      setText("kpiNetCollected", formatMoney(collected, paymentApi));
      setText("kpiOutstanding", formatMoney(outstanding, paymentApi));
      setText("kpiRefunded", formatMoney(refunded, paymentApi));
    }

    if (!Array.isArray(data.patientOrders)) {
      setText("kpiActiveOrders", "--");
      setText("kpiCompletionRate", "--");
      setText("kpiCompletionMeta", "Data source unavailable");
    } else {
      var pending = 0;
      var ongoing = 0;
      var completed = 0;
      var canceled = 0;

      filteredPatientOrders.forEach(function (row) {
        var status = safeText(row.status).toLowerCase();
        if (status === "pending") pending += 1;
        else if (status === "ongoing") ongoing += 1;
        else if (status === "completed") completed += 1;
        else if (status === "canceled" || status === "cancelled") canceled += 1;
      });

      var denominator = pending + ongoing + completed + canceled;
      var completionRate = denominator > 0 ? completed / denominator : 0;

      setText("kpiActiveOrders", String(pending + ongoing));
      setText("kpiCompletionRate", formatPercent(completionRate));
      setText("kpiCompletionMeta", completed + " completed / " + denominator + " total");
    }

    var hasPayoutApi =
      paymentApi &&
      typeof paymentApi.getEntityPayoutSummaries === "function" &&
      typeof paymentApi.getEntityDashboardTotals === "function";

    if (!hasPayoutApi) {
      setText("kpiEntitiesDue", "--");
    } else {
      try {
        var payoutRows = paymentApi.getEntityPayoutSummaries(dateFilters);
        var payoutTotals = paymentApi.getEntityDashboardTotals(payoutRows);
        setText("kpiEntitiesDue", String(safeNumber(payoutTotals.entitiesDue)));
      } catch (err) {
        setText("kpiEntitiesDue", "--");
      }
    }

    var hasInsuranceKpiApi = paymentApi && typeof paymentApi.getInsuranceClaimKpis === "function";
    if (!hasInsuranceKpiApi) {
      setText("kpiInsuranceOutstanding", "--");
      setText("kpiInsuranceMeta", "Data source unavailable");
    } else {
      try {
        var insuranceKpis = paymentApi.getInsuranceClaimKpis(dateFilters);
        setText("kpiInsuranceOutstanding", formatMoney(insuranceKpis.outstandingAmount, paymentApi));
        setText("kpiInsuranceMeta", safeNumber(insuranceKpis.outstandingClaims) + " outstanding claims");
      } catch (err) {
        setText("kpiInsuranceOutstanding", "--");
        setText("kpiInsuranceMeta", "Data source unavailable");
      }
    }
  }

  function buildDailySeries(transactions, windowRange) {
    var bucket = {};
    var minDate = null;
    var maxDate = windowRange.to;

    transactions.forEach(function (row) {
      var dt = parseDate(row.orderDate || row.scheduledDate);
      if (!dt) return;
      var day = isoDate(dt);
      if (!bucket[day]) {
        bucket[day] = { gross: 0, collected: 0 };
      }

      var status = safeText(row.transactionStatus).toLowerCase();
      var isCanceled = status === "canceled" || status === "cancelled";
      if (!isCanceled) bucket[day].gross += safeNumber(row.totalPrice);
      bucket[day].collected += safeNumber(row.depositPaid);

      if (!minDate || dt.getTime() < minDate.getTime()) minDate = dt;
    });

    if (!minDate) minDate = windowRange.from || windowRange.to;

    var start = windowRange.from ? new Date(windowRange.from.getTime()) : startOfUtcDay(minDate);
    var end = new Date(maxDate.getTime());
    if (start.getTime() > end.getTime()) start = new Date(end.getTime());

    var days = [];
    var cursor = new Date(start.getTime());
    while (cursor.getTime() <= end.getTime()) {
      var key = isoDate(cursor);
      var rowData = bucket[key] || { gross: 0, collected: 0 };
      days.push({
        key: key,
        label: formatDate(cursor),
        gross: rowData.gross,
        collected: rowData.collected
      });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return days;
  }

  function pathFromValues(values, xStep, topPad, leftPad, plotHeight) {
    if (!values.length) return "";
    var out = [];
    for (var i = 0; i < values.length; i += 1) {
      var x = leftPad + xStep * i;
      var y = topPad + plotHeight - values[i] * plotHeight;
      out.push((i === 0 ? "M " : "L ") + x.toFixed(2) + " " + y.toFixed(2));
    }
    return out.join(" ");
  }

  function polarToCartesian(cx, cy, radius, angleDeg) {
    var radians = (angleDeg * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(radians),
      y: cy + radius * Math.sin(radians)
    };
  }

  function donutSlicePath(cx, cy, outerRadius, innerRadius, startAngle, endAngle) {
    if (endAngle <= startAngle) return "";

    var outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
    var outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
    var innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
    var innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
    var largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return [
      "M",
      outerStart.x.toFixed(2),
      outerStart.y.toFixed(2),
      "A",
      outerRadius.toFixed(2),
      outerRadius.toFixed(2),
      "0",
      largeArc,
      "1",
      outerEnd.x.toFixed(2),
      outerEnd.y.toFixed(2),
      "L",
      innerEnd.x.toFixed(2),
      innerEnd.y.toFixed(2),
      "A",
      innerRadius.toFixed(2),
      innerRadius.toFixed(2),
      "0",
      largeArc,
      "0",
      innerStart.x.toFixed(2),
      innerStart.y.toFixed(2),
      "Z"
    ].join(" ");
  }

  function renderFinancialTrend(data, filteredTransactions, windowRange) {
    if (!Array.isArray(data.transactions)) {
      renderUnavailable("financialTrendHost");
      return;
    }

    if (!filteredTransactions.length) {
      renderEmpty("financialTrendHost");
      return;
    }

    var host = document.getElementById("financialTrendHost");
    if (!host) return;

    host.innerHTML =
      [
        '<div class="chart-shell"><svg id="financialTrendSvg" viewBox="0 0 860 240" aria-label="Financial trend chart"></svg><div class="trend-tooltip" id="trendTooltip" hidden></div></div>',
        '<div class="trend-insights" id="trendInsights"></div>',
        '<div class="trend-mini-wrap">',
        '<table class="trend-mini-table">',
        "<thead><tr><th>Date</th><th>Gross</th><th>Collected</th><th>Collection %</th></tr></thead>",
        '<tbody id="trendMiniTbody"></tbody>',
        "</table>",
        "</div>"
      ].join("");

    var series = buildDailySeries(filteredTransactions, windowRange);
    var svg = document.getElementById("financialTrendSvg");
    if (!svg) return;

    var width = 860;
    var height = 240;
    var leftPad = 44;
    var rightPad = 16;
    var topPad = 16;
    var bottomPad = 34;
    var plotWidth = width - leftPad - rightPad;
    var plotHeight = height - topPad - bottomPad;
    var xStep = series.length > 1 ? plotWidth / (series.length - 1) : 0;

    var maxGross = 0;
    var maxCollected = 0;
    series.forEach(function (item) {
      if (item.gross > maxGross) maxGross = item.gross;
      if (item.collected > maxCollected) maxCollected = item.collected;
    });
    var maxValue = Math.max(maxGross, maxCollected, 1);

    var normalizedGross = series.map(function (item) {
      return item.gross / maxValue;
    });
    var normalizedCollected = series.map(function (item) {
      return item.collected / maxValue;
    });

    var grossLine = pathFromValues(normalizedGross, xStep, topPad, leftPad, plotHeight);
    var collectedLine = pathFromValues(normalizedCollected, xStep, topPad, leftPad, plotHeight);

    var lastX = leftPad + (series.length > 1 ? xStep * (series.length - 1) : 0);
    var firstX = leftPad;
    var baseY = topPad + plotHeight;
    var areaPath = grossLine + " L " + lastX.toFixed(2) + " " + baseY.toFixed(2) + " L " + firstX.toFixed(2) + " " + baseY.toFixed(2) + " Z";

    var gridLines = [];
    for (var i = 0; i <= 4; i += 1) {
      var y = topPad + (plotHeight / 4) * i;
      gridLines.push('<line x1="' + leftPad + '" y1="' + y.toFixed(2) + '" x2="' + (width - rightPad) + '" y2="' + y.toFixed(2) + '" stroke="#e6edf1" stroke-width="1" />');
    }

    var labelPoints = [0, Math.floor((series.length - 1) / 2), series.length - 1];
    var labels = [];
    var seen = {};
    labelPoints.forEach(function (idx) {
      if (idx < 0 || idx >= series.length || seen[idx]) return;
      seen[idx] = true;
      var x = leftPad + (series.length > 1 ? xStep * idx : 0);
      labels.push(
        '<text x="' +
          x.toFixed(2) +
          '" y="' +
          (height - 10) +
          '" fill="#667085" font-size="11" text-anchor="' +
          (idx === 0 ? "start" : idx === series.length - 1 ? "end" : "middle") +
          '">' +
          series[idx].label +
          "</text>"
      );
    });

    var yLabels = [
      { value: maxValue, y: topPad + 4 },
      { value: maxValue / 2, y: topPad + plotHeight / 2 + 4 },
      { value: 0, y: topPad + plotHeight + 4 }
    ];

    var yAxisLabels = yLabels
      .map(function (item) {
        return (
          '<text x="8" y="' +
          item.y.toFixed(2) +
          '" fill="#7a8899" font-size="11">' +
          formatMoney(item.value, data.paymentApi).replace(" SAR", "") +
          "</text>"
        );
      })
      .join("");

    var markerParts = [];
    series.forEach(function (item, idx) {
      if (item.gross <= 0 && item.collected <= 0) return;

      var x = leftPad + (series.length > 1 ? xStep * idx : 0);
      var yGross = topPad + plotHeight - (item.gross / maxValue) * plotHeight;
      var yCollected = topPad + plotHeight - (item.collected / maxValue) * plotHeight;

      if (item.gross > 0) {
        markerParts.push(
          '<circle class="trend-point trend-point-gross" cx="' +
            x.toFixed(2) +
            '" cy="' +
            yGross.toFixed(2) +
            '" r="3.3" fill="#0f8c8c" stroke="#ffffff" stroke-width="1"></circle>'
        );
        markerParts.push(
          '<circle class="trend-hit" data-idx="' +
            idx +
            '" data-series="gross" cx="' +
            x.toFixed(2) +
            '" cy="' +
            yGross.toFixed(2) +
            '" r="10" fill="transparent"></circle>'
        );
      }

      if (item.collected > 0) {
        markerParts.push(
          '<circle class="trend-point trend-point-collected" cx="' +
            x.toFixed(2) +
            '" cy="' +
            yCollected.toFixed(2) +
            '" r="3" fill="#2fb5b5" stroke="#ffffff" stroke-width="1"></circle>'
        );
        markerParts.push(
          '<circle class="trend-hit" data-idx="' +
            idx +
            '" data-series="collected" cx="' +
            x.toFixed(2) +
            '" cy="' +
            yCollected.toFixed(2) +
            '" r="10" fill="transparent"></circle>'
        );
      }
    });
    var markers = markerParts.join("");

    svg.innerHTML =
      [
        '<defs><linearGradient id="grossAreaGrad" x1="0" y1="0" x2="0" y2="1">',
        '<stop offset="0%" stop-color="rgba(15,140,140,0.30)" />',
        '<stop offset="100%" stop-color="rgba(15,140,140,0.03)" />',
        "</linearGradient></defs>",
        gridLines.join(""),
        '<path d="' + areaPath + '" fill="url(#grossAreaGrad)"></path>',
        '<path d="' + grossLine + '" fill="none" stroke="#0f8c8c" stroke-width="3" stroke-linecap="round"></path>',
        '<path d="' + collectedLine + '" fill="none" stroke="#2fb5b5" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="5 5"></path>',
        markers,
        labels.join(""),
        yAxisLabels
      ].join("");

    var grossTotal = series.reduce(function (sum, item) {
      return sum + item.gross;
    }, 0);
    var collectedTotal = series.reduce(function (sum, item) {
      return sum + item.collected;
    }, 0);

    var activeDaysRows = series.filter(function (item) {
      return item.gross > 0 || item.collected > 0;
    });
    var scanRows = activeDaysRows.length ? activeDaysRows : series.slice();

    var peakRow = scanRows[0];
    var lowRow = scanRows[0];
    scanRows.forEach(function (item) {
      if (item.gross > peakRow.gross) peakRow = item;
      if (item.gross < lowRow.gross) lowRow = item;
    });

    var collectionRate = grossTotal > 0 ? collectedTotal / grossTotal : 0;

    var insights = document.getElementById("trendInsights");
    if (insights) {
      insights.innerHTML = [
        { label: "Peak Gross Day", value: formatDate(peakRow.key) + " | " + formatMoney(peakRow.gross, data.paymentApi) },
        { label: "Lowest Gross Day", value: formatDate(lowRow.key) + " | " + formatMoney(lowRow.gross, data.paymentApi) },
        { label: "Collection Rate", value: formatPercent(collectionRate) },
        { label: "Active Days", value: String(activeDaysRows.length) + " days" }
      ]
        .map(function (item) {
          return '<div class="trend-insight"><div class="k">' + item.label + '</div><div class="v">' + item.value + "</div></div>";
        })
        .join("");
    }

    var miniTbody = document.getElementById("trendMiniTbody");
    if (miniTbody) {
      miniTbody.innerHTML = series
        .slice(-6)
        .reverse()
        .map(function (item) {
          var rowRate = item.gross > 0 ? item.collected / item.gross : 0;
          return [
            "<tr>",
            "<td>" + formatDate(item.key) + "</td>",
            "<td>" + formatMoney(item.gross, data.paymentApi) + "</td>",
            "<td>" + formatMoney(item.collected, data.paymentApi) + "</td>",
            "<td>" + formatPercent(rowRate) + "</td>",
            "</tr>"
          ].join("");
        })
        .join("");
    }

    var tooltip = document.getElementById("trendTooltip");
    var chartShell = host.querySelector(".chart-shell");
    var hitPoints = svg.querySelectorAll(".trend-hit");

    function showTrendTooltip(index, seriesName, event, point) {
      if (!tooltip || !chartShell) return;
      if (index < 0 || index >= series.length) return;

      var row = series[index];
      var prevRow = index > 0 ? series[index - 1] : null;
      var focusSeries = seriesName === "collected" ? "collected" : "gross";
      var pointLabel = focusSeries === "collected" ? "Collected point" : "Gross point";
      var rowRate = row.gross > 0 ? row.collected / row.gross : 0;
      var grossDelta = prevRow ? row.gross - prevRow.gross : NaN;
      var collectedDelta = prevRow ? row.collected - prevRow.collected : NaN;

      tooltip.innerHTML =
        '<b>' +
        formatDate(row.key) +
        "</b><br>" +
        pointLabel +
        ": " +
        formatMoney(row[focusSeries], data.paymentApi) +
        "<br>" +
        "Gross: " +
        formatMoney(row.gross, data.paymentApi) +
        "<br>" +
        "Collected: " +
        formatMoney(row.collected, data.paymentApi) +
        "<br>" +
        "Collection: " +
        formatPercent(rowRate) +
        "<br>" +
        "Gross Change: " +
        formatDeltaMoney(grossDelta, data.paymentApi) +
        "<br>" +
        "Collected Change: " +
        formatDeltaMoney(collectedDelta, data.paymentApi);

      tooltip.hidden = false;

      var shellRect = chartShell.getBoundingClientRect();
      var baseX = event && typeof event.clientX === "number" ? event.clientX : 0;
      var baseY = event && typeof event.clientY === "number" ? event.clientY : 0;
      if (!baseX || !baseY) {
        var pointRect = point ? point.getBoundingClientRect() : shellRect;
        baseX = pointRect.left + pointRect.width / 2;
        baseY = pointRect.top + pointRect.height / 2;
      }

      var left = baseX - shellRect.left + 12;
      var top = baseY - shellRect.top - 10;
      var maxLeft = chartShell.clientWidth - tooltip.offsetWidth - 8;
      var maxTop = chartShell.clientHeight - tooltip.offsetHeight - 8;

      if (left > maxLeft) left = maxLeft;
      if (top > maxTop) top = maxTop;
      if (top < 8) top = 8;
      if (left < 8) left = 8;

      tooltip.style.left = left + "px";
      tooltip.style.top = top + "px";
    }

    function hideTrendTooltip() {
      if (!tooltip) return;
      tooltip.hidden = true;
    }

    hitPoints.forEach(function (point) {
      var index = Number(point.getAttribute("data-idx"));
      var seriesName = safeText(point.getAttribute("data-series")).toLowerCase();
      point.addEventListener("mouseenter", function (event) {
        showTrendTooltip(index, seriesName, event, point);
      });
      point.addEventListener("mousemove", function (event) {
        showTrendTooltip(index, seriesName, event, point);
      });
      point.addEventListener("focus", function () {
        showTrendTooltip(index, seriesName, null, point);
      });
      point.addEventListener("blur", hideTrendTooltip);
      point.addEventListener("mouseleave", hideTrendTooltip);
    });

    if (chartShell) {
      chartShell.addEventListener("mouseleave", hideTrendTooltip);
    }

    setText("financialTrendLabel", "Gross " + formatMoney(grossTotal, data.paymentApi) + " | Collected " + formatMoney(collectedTotal, data.paymentApi));
  }

  function renderOrderMix(data, filteredTransactions) {
    var host = document.getElementById("orderMixHost");
    if (!host) return;

    if (!Array.isArray(data.transactions)) {
      renderUnavailable("orderMixHost");
      return;
    }

    if (!filteredTransactions.length) {
      renderEmpty("orderMixHost");
      return;
    }

    host.innerHTML =
      '<div class="mix-geo-grid">' +
      '<div class="mix-geo-chart-wrap">' +
      '<div class="mix-geo-chart">' +
      '<svg id="mixGeoSvg" viewBox="0 0 260 260" aria-label="Order mix geometric chart"></svg>' +
      '<div class="mix-geo-center" id="mixGeoCenter"></div>' +
      '<div class="mix-geo-tooltip" id="mixGeoTooltip" hidden></div>' +
      "</div>" +
      '<div class="mix-geo-ring-tags">' +
      '<span class="mix-ring-tag" data-ring-key="count" tabindex="0">Outer: Orders</span>' +
      '<span class="mix-ring-tag" data-ring-key="value" tabindex="0">Mid: Gross</span>' +
      '<span class="mix-ring-tag" data-ring-key="collected" tabindex="0">Inner: Collected</span>' +
      "</div>" +
      "</div>" +
      '<div class="mix-geo-legend" id="mixGeoLegend"></div>' +
      "</div>" +
      '<div class="mix-summary" id="mixSummary"></div>';

    var groups = {
      facility: {
        key: "facility",
        label: "Facility",
        count: 0,
        value: 0,
        collected: 0,
        outstanding: 0,
        refunded: 0,
        canceled: 0,
        cls: "mix-facility",
        color: "#0f8c8c"
      },
      pharmacy: {
        key: "pharmacy",
        label: "Pharmacy",
        count: 0,
        value: 0,
        collected: 0,
        outstanding: 0,
        refunded: 0,
        canceled: 0,
        cls: "mix-pharmacy",
        color: "#2fb5b5"
      },
      individual: {
        key: "individual",
        label: "Individual",
        count: 0,
        value: 0,
        collected: 0,
        outstanding: 0,
        refunded: 0,
        canceled: 0,
        cls: "mix-individual",
        color: "#7acfcf"
      }
    };

    filteredTransactions.forEach(function (row) {
      var type = safeText(row.providerType).toLowerCase();
      if (!groups[type]) type = "facility";

      groups[type].count += 1;
      var status = safeText(row.transactionStatus).toLowerCase();
      var isCanceled = status === "canceled" || status === "cancelled";
      if (!isCanceled) groups[type].value += safeNumber(row.totalPrice);
      if (isCanceled) groups[type].canceled += 1;
      groups[type].collected += safeNumber(row.depositPaid);
      groups[type].outstanding += safeNumber(row.remaining);
      groups[type].refunded += safeNumber(row.refundAmount);
    });

    var rows = [groups.facility, groups.pharmacy, groups.individual];
    var totalCount = rows.reduce(function (sum, row) {
      return sum + row.count;
    }, 0);
    var totalValue = rows.reduce(function (sum, row) {
      return sum + row.value;
    }, 0);
    var totalCollected = rows.reduce(function (sum, row) {
      return sum + row.collected;
    }, 0);
    var totalOutstanding = rows.reduce(function (sum, row) {
      return sum + row.outstanding;
    }, 0);
    var totalRefunded = rows.reduce(function (sum, row) {
      return sum + row.refunded;
    }, 0);
    var totalCanceled = rows.reduce(function (sum, row) {
      return sum + row.canceled;
    }, 0);
    var totalCollectionRate = totalValue > 0 ? totalCollected / totalValue : 0;

    var summary = document.getElementById("mixSummary");
    if (summary) {
      summary.innerHTML = [
        '<div class="mix-summary-card"><div class="k">Total Orders</div><div class="v">' + totalCount + "</div></div>",
        '<div class="mix-summary-card"><div class="k">Total Gross</div><div class="v">' + formatMoney(totalValue, data.paymentApi) + "</div></div>",
        '<div class="mix-summary-card"><div class="k">Collected</div><div class="v">' + formatMoney(totalCollected, data.paymentApi) + "</div></div>",
        '<div class="mix-summary-card"><div class="k">Outstanding</div><div class="v">' + formatMoney(totalOutstanding, data.paymentApi) + "</div></div>",
        '<div class="mix-summary-card"><div class="k">Collection Rate</div><div class="v">' + formatPercent(totalCollectionRate) + "</div></div>",
        '<div class="mix-summary-card"><div class="k">Refunded</div><div class="v">' + formatMoney(totalRefunded, data.paymentApi) + '</div><div class="sub">Canceled: ' + totalCanceled + "</div></div>"
      ].join("");
    }

    var rings = [
      { key: "count", total: totalCount, outer: 114, inner: 88, label: "Orders" },
      { key: "value", total: totalValue, outer: 80, inner: 56, label: "Gross" },
      { key: "collected", total: totalCollected, outer: 48, inner: 28, label: "Collected" }
    ];

    var ringMap = {};
    rings.forEach(function (ring) {
      ringMap[ring.key] = ring;
    });

    var rowByKey = {};
    rows.forEach(function (row) {
      rowByKey[row.key] = row;
    });

    function formatRingMetric(ringKey, value) {
      if (ringKey === "count") return String(Math.round(safeNumber(value)));
      return formatCompactMoney(value, data.paymentApi);
    }

    var geoSvg = document.getElementById("mixGeoSvg");
    if (geoSvg) {
      var cx = 130;
      var cy = 130;
      var geoParts = [];
      var segIndex = 0;

      rings.forEach(function (ring, ringIndex) {
        var cursor = -90;
        var ringHasData = false;
        rows.forEach(function (row) {
          var rowValue = safeNumber(row[ring.key]);
          var ratio = ring.total > 0 ? rowValue / ring.total : 0;
          var sweep = ratio * 360;
          if (sweep <= 0) return;

          ringHasData = true;
          var nextAngle = cursor + sweep;
          var d = donutSlicePath(cx, cy, ring.outer, ring.inner, cursor, nextAngle);
          var segmentOpacity = 0.95 - ringIndex * 0.17;
          var metricValueText = ring.key === "count" ? row.count + " orders" : formatMoney(rowValue, data.paymentApi);
          geoParts.push(
            '<path class="mix-geo-segment seg-ring-' +
              ring.key +
              " seg-provider-" +
              row.key +
              '" data-provider-key="' +
              row.key +
              '" data-provider-label="' +
              row.label +
              '" data-ring-key="' +
              ring.key +
              '" data-ring-label="' +
              ring.label +
              '" data-value="' +
              rowValue.toFixed(2) +
              '" data-share="' +
              (ratio * 100).toFixed(2) +
              '" fill="' +
              row.color +
              '" style="--base-opacity:' +
              segmentOpacity.toFixed(2) +
              ";--slice-delay:" +
              (segIndex * 45).toFixed(0) +
              'ms" d="' +
              d +
              '" stroke="#ffffff" stroke-width="1" tabindex="0"><title>' +
              ring.label +
              " - " +
              row.label +
              ": " +
              metricValueText +
              " (" +
              (ratio * 100).toFixed(1) +
              "%)</title></path>"
          );
          segIndex += 1;
          cursor = nextAngle;
        });

        if (!ringHasData) {
          geoParts.push(
            '<circle cx="' +
              cx +
              '" cy="' +
              cy +
              '" r="' +
              ((ring.outer + ring.inner) / 2).toFixed(2) +
              '" fill="none" stroke="#e8eef3" stroke-width="' +
              (ring.outer - ring.inner).toFixed(2) +
              '"></circle>'
          );
        }
      });

      geoParts.push('<circle cx="' + cx + '" cy="' + cy + '" r="22" fill="#ffffff" stroke="#dbe7ee" stroke-width="1.1"></circle>');
      geoSvg.innerHTML = geoParts.join("");
    }

    var geoCenter = document.getElementById("mixGeoCenter");
    var geoTooltip = document.getElementById("mixGeoTooltip");
    var chartWrap = host.querySelector(".mix-geo-chart-wrap");

    function setGeoCenter(title, primary, secondary, isFocus) {
      if (!geoCenter) return;
      geoCenter.innerHTML =
        '<div class="t">' +
        title +
        '</div><div class="n">' +
        primary +
        '</div><div class="s">' +
        secondary +
        "</div>";
      geoCenter.classList.toggle("is-focus", !!isFocus);

      var numberEl = geoCenter.querySelector(".n");
      if (!numberEl) return;
      var len = safeText(primary).length;
      numberEl.classList.toggle("is-wide", len >= 8);
      numberEl.classList.toggle("is-small", len >= 12);
    }

    var defaultCenterTitle = "Order Mix";
    var defaultCenterPrimary = String(totalCount);
    var defaultCenterSecondary = formatCompactMoney(totalValue, data.paymentApi);
    setGeoCenter(defaultCenterTitle, defaultCenterPrimary, defaultCenterSecondary, false);

    function animateDefaultCenterCount(targetCount) {
      if (!geoCenter) return;
      var numberEl = geoCenter.querySelector(".n");
      if (!numberEl) return;

      var target = Math.max(0, Math.round(safeNumber(targetCount)));
      var start = null;
      var duration = 620;

      function tick(timestamp) {
        if (!start) start = timestamp;
        var progress = Math.min(1, (timestamp - start) / duration);
        var value = Math.round(target * progress);
        if (!geoCenter.classList.contains("is-focus")) numberEl.textContent = String(value);
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    }

    animateDefaultCenterCount(totalCount);

    var geoLegend = document.getElementById("mixGeoLegend");
    if (geoLegend) {
      geoLegend.innerHTML = rows
        .map(function (row) {
          var countShare = totalCount > 0 ? (row.count / totalCount) * 100 : 0;
          var grossShare = totalValue > 0 ? (row.value / totalValue) * 100 : 0;
          var collectedShare = totalCollected > 0 ? (row.collected / totalCollected) * 100 : 0;
          return [
            '<div class="mix-geo-item" data-provider-key="' + row.key + '" tabindex="0">',
            '<div class="mix-geo-item-top"><span class="mix-dot ' + row.cls + '"></span><span>' + row.label + "</span></div>",
            '<div class="mix-geo-item-metrics">',
            "<span>Orders " + countShare.toFixed(1) + "%</span>",
            "<span>Gross " + grossShare.toFixed(1) + "%</span>",
            "<span>Collected " + collectedShare.toFixed(1) + "%</span>",
            "</div>",
            "</div>"
          ].join("");
        })
        .join("");
    }

    function showGeoTooltip(event, sourceEl, html) {
      if (!geoTooltip || !chartWrap || !html) return;
      geoTooltip.innerHTML = html;
      geoTooltip.hidden = false;

      var wrapRect = chartWrap.getBoundingClientRect();
      var baseX = event && typeof event.clientX === "number" ? event.clientX : 0;
      var baseY = event && typeof event.clientY === "number" ? event.clientY : 0;
      if (!baseX || !baseY) {
        var targetRect = sourceEl ? sourceEl.getBoundingClientRect() : wrapRect;
        baseX = targetRect.left + targetRect.width / 2;
        baseY = targetRect.top + targetRect.height / 2;
      }

      var left = baseX - wrapRect.left + 14;
      var top = baseY - wrapRect.top - 14;
      var maxLeft = chartWrap.clientWidth - geoTooltip.offsetWidth - 8;
      var maxTop = chartWrap.clientHeight - geoTooltip.offsetHeight - 8;

      if (left > maxLeft) left = maxLeft;
      if (top > maxTop) top = maxTop;
      if (top < 8) top = 8;
      if (left < 8) left = 8;

      geoTooltip.style.left = left + "px";
      geoTooltip.style.top = top + "px";
    }

    function hideGeoTooltip() {
      if (!geoTooltip) return;
      geoTooltip.hidden = true;
    }

    var segments = geoSvg ? geoSvg.querySelectorAll(".mix-geo-segment") : [];
    var legendItems = host.querySelectorAll(".mix-geo-item");
    var ringTags = host.querySelectorAll(".mix-ring-tag");

    function resetGeoFocus() {
      if (geoSvg) geoSvg.classList.remove("is-focused");
      segments.forEach(function (seg) {
        seg.classList.remove("is-related");
        seg.classList.remove("is-active");
      });
      legendItems.forEach(function (item) {
        item.classList.remove("is-active");
        item.classList.remove("is-muted");
      });
      ringTags.forEach(function (tag) {
        tag.classList.remove("is-active");
      });
      setGeoCenter(defaultCenterTitle, defaultCenterPrimary, defaultCenterSecondary, false);
      hideGeoTooltip();
    }

    function focusProvider(providerKey, ringKey) {
      var row = rowByKey[providerKey];
      if (!row || !geoSvg) return;
      geoSvg.classList.add("is-focused");

      segments.forEach(function (seg) {
        var sameProvider = safeText(seg.getAttribute("data-provider-key")) === providerKey;
        var sameRing = safeText(seg.getAttribute("data-ring-key")) === ringKey;
        seg.classList.toggle("is-related", sameProvider);
        seg.classList.toggle("is-active", sameProvider && sameRing);
      });

      legendItems.forEach(function (item) {
        var sameProvider = safeText(item.getAttribute("data-provider-key")) === providerKey;
        item.classList.toggle("is-active", sameProvider);
        item.classList.toggle("is-muted", !sameProvider);
      });

      ringTags.forEach(function (tag) {
        var sameRing = safeText(tag.getAttribute("data-ring-key")) === ringKey;
        tag.classList.toggle("is-active", sameRing);
      });
    }

    function focusRingOnly(ringKey) {
      var ring = ringMap[ringKey];
      if (!ring || !geoSvg) return;
      geoSvg.classList.add("is-focused");

      segments.forEach(function (seg) {
        var sameRing = safeText(seg.getAttribute("data-ring-key")) === ringKey;
        seg.classList.toggle("is-related", sameRing);
        seg.classList.toggle("is-active", sameRing);
      });

      legendItems.forEach(function (item) {
        item.classList.remove("is-muted");
        item.classList.remove("is-active");
      });

      ringTags.forEach(function (tag) {
        var sameRing = safeText(tag.getAttribute("data-ring-key")) === ringKey;
        tag.classList.toggle("is-active", sameRing);
      });

      var primary = ringKey === "count" ? String(totalCount) : formatCompactMoney(ring.total, data.paymentApi);
      setGeoCenter(ring.label + " Ring", primary, "Total", true);
    }

    segments.forEach(function (seg) {
      function onSegmentHover(event) {
        var providerKey = safeText(seg.getAttribute("data-provider-key"));
        var providerLabel = safeText(seg.getAttribute("data-provider-label"));
        var ringKey = safeText(seg.getAttribute("data-ring-key"));
        var ringLabel = safeText(seg.getAttribute("data-ring-label"));
        var rawValue = safeNumber(seg.getAttribute("data-value"));
        var share = safeNumber(seg.getAttribute("data-share"));

        focusProvider(providerKey, ringKey);
        setGeoCenter(providerLabel, formatRingMetric(ringKey, rawValue), ringLabel + " | " + share.toFixed(1) + "%", true);
        showGeoTooltip(
          event,
          seg,
          "<b>" +
            providerLabel +
            "</b><br>" +
            ringLabel +
            ": " +
            formatRingMetric(ringKey, rawValue) +
            "<br>Share: " +
            share.toFixed(1) +
            "%"
        );
      }

      seg.addEventListener("mouseenter", onSegmentHover);
      seg.addEventListener("mousemove", onSegmentHover);
      seg.addEventListener("focus", function () {
        onSegmentHover(null);
      });
      seg.addEventListener("blur", resetGeoFocus);
    });

    legendItems.forEach(function (item) {
      function onLegendHover(event) {
        var providerKey = safeText(item.getAttribute("data-provider-key"));
        var row = rowByKey[providerKey];
        if (!row) return;

        if (geoSvg) geoSvg.classList.add("is-focused");
        segments.forEach(function (seg) {
          var sameProvider = safeText(seg.getAttribute("data-provider-key")) === providerKey;
          seg.classList.toggle("is-related", sameProvider);
          seg.classList.toggle("is-active", sameProvider);
        });

        legendItems.forEach(function (entry) {
          var sameProvider = safeText(entry.getAttribute("data-provider-key")) === providerKey;
          entry.classList.toggle("is-active", sameProvider);
          entry.classList.toggle("is-muted", !sameProvider);
        });

        ringTags.forEach(function (tag) {
          tag.classList.remove("is-active");
        });

        var providerCollectionRate = row.value > 0 ? row.collected / row.value : 0;
        setGeoCenter(row.label, row.count + " orders", formatCompactMoney(row.value, data.paymentApi), true);
        showGeoTooltip(
          event,
          item,
          "<b>" +
            row.label +
            "</b><br>Gross: " +
            formatMoney(row.value, data.paymentApi) +
            "<br>Collected: " +
            formatMoney(row.collected, data.paymentApi) +
            "<br>Collection: " +
            formatPercent(providerCollectionRate)
        );
      }

      item.addEventListener("mouseenter", onLegendHover);
      item.addEventListener("mousemove", onLegendHover);
      item.addEventListener("focus", function () {
        onLegendHover(null);
      });
      item.addEventListener("blur", resetGeoFocus);
    });

    ringTags.forEach(function (tag) {
      function onRingHover(event) {
        var ringKey = safeText(tag.getAttribute("data-ring-key"));
        var ring = ringMap[ringKey];
        if (!ring) return;
        focusRingOnly(ringKey);
        showGeoTooltip(
          event,
          tag,
          "<b>" +
            ring.label +
            " Ring</b><br>Total: " +
            (ringKey === "count" ? String(totalCount) + " orders" : formatMoney(ring.total, data.paymentApi))
        );
      }

      tag.addEventListener("mouseenter", onRingHover);
      tag.addEventListener("mousemove", onRingHover);
      tag.addEventListener("focus", function () {
        onRingHover(null);
      });
      tag.addEventListener("blur", resetGeoFocus);
    });

    if (chartWrap) {
      chartWrap.addEventListener("mouseleave", resetGeoFocus);
    }
  }

  function renderTopProviders(data, dateFilters) {
    var canLoadTopProviders =
      data.paymentApi &&
      typeof data.paymentApi.getEntityPayoutSummaries === "function";

    if (!canLoadTopProviders) {
      renderUnavailable("topProvidersHost");
      return;
    }

    var rows;
    try {
      rows = asArray(data.paymentApi.getEntityPayoutSummaries(dateFilters)).slice().sort(function (a, b) {
        return safeNumber(b.payableNow) - safeNumber(a.payableNow);
      });
    } catch (err) {
      renderUnavailable("topProvidersHost");
      return;
    }

    rows = rows.slice(0, 5);
    if (!rows.length) {
      renderEmpty("topProvidersHost");
      return;
    }

    var host = document.getElementById("topProvidersHost");
    if (!host) return;

    host.innerHTML =
      [
        '<table class="mini-table">',
        "<thead><tr><th>Provider</th><th>Type</th><th>Payable Now</th><th>Paid Out</th><th>Status</th></tr></thead>",
        '<tbody id="topProvidersTbody"></tbody>',
        "</table>"
      ].join("");

    var tbody = document.getElementById("topProvidersTbody");
    if (!tbody) return;

    tbody.innerHTML = rows
      .map(function (row) {
        return [
          "<tr>",
          '<td><a href="payment/entity-ledger.html?entity=' +
            encodeURIComponent(row.providerCode || "") +
            '" class="text-decoration-none">' +
            safeText(row.providerName || row.institutionName || "Provider") +
            "</a></td>",
          "<td>" + safeText(row.providerType || "-") + "</td>",
          "<td>" + formatMoney(row.payableNow, data.paymentApi) + "</td>",
          "<td>" + formatMoney(row.paidOut, data.paymentApi) + "</td>",
          "<td>" + safeText(row.statusLabel || row.status || "-") + "</td>",
          "</tr>"
        ].join("");
      })
      .join("");
  }

  function renderReturnsAndClaims(data, filteredServiceReturns, filteredPharmacyReturns) {
    var host = document.getElementById("returnsWatchHost");
    if (!host) return;

    host.innerHTML = '<div class="watch-grid" id="returnsWatchGrid"></div>';

    var hasServiceSource = Array.isArray(data.serviceReturns);
    var hasPharmacySource = Array.isArray(data.pharmacyReturns);
    var hasAnyReturnSource = hasServiceSource || hasPharmacySource;

    var cardsGrid = document.getElementById("returnsWatchGrid");
    if (!cardsGrid) return;

    if (!hasAnyReturnSource) {
      cardsGrid.innerHTML = '<div class="widget-unavailable" style="grid-column: 1/-1;">Data source unavailable</div>';
      return;
    }

    var totals = {
      underReview: 0,
      approved: 0,
      rejected: 0,
      readyToRelease: 0,
      released: 0,
      failed: 0
    };

    filteredServiceReturns.concat(filteredPharmacyReturns).forEach(function (entry) {
      var returnStatus = safeText(entry.computedReturnStatus || entry.returnStatus).trim();
      var refundStatus = safeText(entry.computedRefundStatus || entry.refundStatus).trim();

      if (returnStatus === "Under Review") totals.underReview += 1;
      else if (returnStatus.indexOf("Approved") === 0) totals.approved += 1;
      else if (returnStatus === "Rejected") totals.rejected += 1;

      if (refundStatus === "Ready to Release") totals.readyToRelease += 1;
      else if (refundStatus === "Released") totals.released += 1;
      else if (refundStatus === "Failed") totals.failed += 1;
    });

    cardsGrid.innerHTML = [
      { label: "Under Review", value: totals.underReview },
      { label: "Approved", value: totals.approved },
      { label: "Rejected", value: totals.rejected },
      { label: "Ready to Release", value: totals.readyToRelease },
      { label: "Released", value: totals.released },
      { label: "Failed", value: totals.failed }
    ]
      .map(function (item) {
        return [
          '<div class="watch-card">',
          '<div class="w-k">' + item.label + "</div>",
          '<div class="w-v">' + item.value + "</div>",
          "</div>"
        ].join("");
      })
      .join("");
  }

  function renderRecentTransactions(data, filteredTransactions) {
    if (!Array.isArray(data.transactions)) {
      renderUnavailable("recentTransactionsHost");
      return;
    }

    if (!filteredTransactions.length) {
      renderEmpty("recentTransactionsHost");
      return;
    }

    var rows = filteredTransactions
      .slice()
      .sort(function (a, b) {
        var da = parseDate(a.orderDate || a.scheduledDate);
        var db = parseDate(b.orderDate || b.scheduledDate);
        var ta = da ? da.getTime() : 0;
        var tb = db ? db.getTime() : 0;
        return tb - ta;
      })
      .slice(0, 8);

    var host = document.getElementById("recentTransactionsHost");
    if (!host) return;

    host.innerHTML =
      [
        '<table class="mini-table">',
        "<thead><tr><th>#</th><th>Transaction</th><th>Patient</th><th>Provider</th><th>Order Date</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>",
        '<tbody id="recentTransactionsTbody"></tbody>',
        "</table>"
      ].join("");

    var tbody = document.getElementById("recentTransactionsTbody");
    if (!tbody) return;

    tbody.innerHTML = rows
      .map(function (row, index) {
        var status = statusMeta(row.transactionStatus);
        return [
          "<tr>",
          "<td>" + (index + 1) + "</td>",
          "<td>" + safeText(row.transactionNo || "-") + "</td>",
          "<td>" + safeText(row.patientName || "-") + "</td>",
          '<td><a href="payment/entity-ledger.html?entity=' +
            encodeURIComponent(row.providerCode || "") +
            '" class="text-decoration-none">' +
            safeText(row.providerName || row.institutionName || "-") +
            "</a></td>",
          "<td>" + formatDate(row.orderDate || row.scheduledDate) + "</td>",
          "<td>" + formatMoney(row.totalPrice, data.paymentApi) + "</td>",
          '<td><span class="status-pill ' + status.cls + '">' + status.label + "</span></td>",
          '<td><div class="d-flex align-items-center gap-2">' +
            '<a class="btn btn-light btn-32" href="' +
            buildOrderDetailsHref(row) +
            '" title="Order details"><i class="fi fi-rr-eye"></i></a>' +
            "</div></td>",
          "</tr>"
        ].join("");
      })
      .join("");
  }

  function applyRangeChipState() {
    var chips = document.querySelectorAll("#rangeChips .range-chip");
    chips.forEach(function (chip) {
      var isActive = safeText(chip.getAttribute("data-range")) === state.range;
      chip.classList.toggle("is-active", isActive);
    });
  }

  function updateLastUpdatedLabel(windowRange) {
    var updatedAtText = formatKsaDateTime(new Date());
    var rangeText = "All Time";
    if (windowRange.from) {
      rangeText = formatDate(windowRange.from) + " - " + formatDate(windowRange.to);
    }

    setText("homeLastUpdated", "Last updated: " + updatedAtText + " | Range: " + rangeText);
  }

  function renderDashboard() {
    var data = getSources();

    state.anchorDate = detectAnchorDate(data);
    var windowRange = getRangeWindow(state.range, state.anchorDate);
    var dateFilters = buildDateFilters(windowRange);

    var filteredTransactions = asArray(data.transactions).filter(function (row) {
      return inRange(row.orderDate || row.scheduledDate, windowRange);
    });

    var filteredPatientOrders = asArray(data.patientOrders).filter(function (row) {
      return inRange(row.createdAt, windowRange);
    });

    var filteredServiceReturns = asArray(data.serviceReturns).filter(function (row) {
      return inRange(row.returnDate || row.releasedAt, windowRange);
    });

    var filteredPharmacyReturns = asArray(data.pharmacyReturns).filter(function (row) {
      return inRange(row.returnDate || row.releasedAt, windowRange);
    });

    renderKpis(data, filteredTransactions, filteredPatientOrders, dateFilters);
    renderFinancialTrend(data, filteredTransactions, windowRange);
    renderOrderMix(data, filteredTransactions);
    renderTopProviders(data, dateFilters);
    renderReturnsAndClaims(data, filteredServiceReturns, filteredPharmacyReturns);
    renderRecentTransactions(data, filteredTransactions);
    updateLastUpdatedLabel(windowRange);
  }

  function bindEvents() {
    var rangeChips = document.getElementById("rangeChips");
    if (rangeChips) {
      rangeChips.addEventListener("click", function (event) {
        var target = event.target.closest(".range-chip");
        if (!target) return;
        var nextRange = safeText(target.getAttribute("data-range"));
        if (!nextRange || nextRange === state.range) return;

        state.range = nextRange;
        applyRangeChipState();
        renderDashboard();
      });
    }

    var refreshBtn = document.getElementById("btnRefreshHome");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", function () {
        renderDashboard();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindEvents();
    applyRangeChipState();
    renderDashboard();
  });
})();
