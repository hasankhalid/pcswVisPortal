function drawBars() {
  var data = {
    labels: [
      'Psychological', 'Physical', 'Sexual'
    ],
    series: [
      {
        label: 'Currently Married',
        values: [33.3, 18.4, 7.6]
      },
      {
        label: 'Widowed/ divorced/ Separated',
        values: [42.5, 33.5, 10.5]
      }]
  };

  var chartWidth       = 400,
      barHeight        = 20,
      groupHeight      = barHeight * data.series.length,
      gapBetweenGroups = 10,
      spaceForLabels   = 100,
      spaceForLegend   = 225;

  // Zip the series data together (first values, second values, etc.)
  var zippedData = [];
  for (var i=0; i<data.labels.length; i++) {
    for (var j=0; j<data.series.length; j++) {
      zippedData.push(data.series[j].values[i]);
    }
  }

  // Color scale
  var color = d3.scaleOrdinal().range(['#FFA726', '#8E24AA']);
  var chartHeight = barHeight * zippedData.length + gapBetweenGroups * data.labels.length;

  var x = d3.scaleLinear()
      .domain([0, d3.max(zippedData)])
      .range([0, chartWidth]);

  var y = d3.scaleLinear()
      .range([chartHeight + gapBetweenGroups, 0]);

  var yAxis = d3.axisLeft()
      .scale(y)
      .tickFormat('')
      .tickSize(0);

  // Specify the chart area and dimensions
  var chart = d3.select(".chart")
    //  .attr("width", spaceForLabels + chartWidth + spaceForLegend)
    //  .attr("height", chartHeight)
      .attr("viewBox", "0 0 " + (spaceForLabels + chartWidth + spaceForLegend) + " " + chartHeight)
      .attr("preserveAspectRatio", "xMinYMin meet");

  // Create bars
  var bar = chart.selectAll("g")
      .data(zippedData)
      .enter().append("g")
      .attr("transform", function(d, i) {
        return "translate(" + spaceForLabels + "," + (i * barHeight + gapBetweenGroups * (0.5 + Math.floor(i/data.series.length))) + ")";
      });

  // Create rectangles of the correct width
  bar.append("rect")
      .attr("fill", function(d,i) { return color(i % data.series.length); })
      .attr("class", "bar")
      .attr("width", x)
      .attr("height", barHeight - 1);

  // Add text label in bar
  bar.append("text")
      .attr("x", function(d) { return x(d) - 3; })
      .attr("y", barHeight / 2)
      .attr("dy", ".35em")
      .text(function(d) { return d + "%"; });

  // Draw labels
  bar.append("text")
      .attr("class", "label")
      .attr("x", function(d) { return - 10; })
      .attr("y", groupHeight / 2)
      .attr("dy", ".35em")
      .text(function(d,i) {
        if (i % data.series.length === 0)
          return data.labels[Math.floor(i/data.series.length)];
        else
          return ""});

  chart.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + spaceForLabels + ", " + -gapBetweenGroups/2 + ")")
        .call(yAxis);

  // Draw legend
  var legendRectSize = 12,
      legendSpacing  = 3;

  var legend = chart.selectAll('.legend')
      .data(data.series)
      .enter()
      .append('g')
      .attr('transform', function (d, i) {
          var height = legendRectSize + legendSpacing;
          var offset = -gapBetweenGroups/2;
          var horz = spaceForLabels + chartWidth + 40 - legendRectSize;
          var vert = i * height - offset;
          return 'translate(' + horz + ',' + vert + ')';
      });

  legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('fill', function (d, i) { return color(i); })
      .style('stroke', function (d, i) { return color(i); });

  legend.append('text')
      .attr('class', 'legend')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(function (d) { return d.label; });
}
