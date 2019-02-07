// variable for data
let decMak;
// define margins for the visualization
let heightSVG = 560;
let widthSVG = 1000;
let margins = {
  top: 20,
  bottom: 120,
  right: 150,
  left: 220
}

// defining the width and height after adjusting margins
let width = widthSVG - margins.left - margins.right;
let height = heightSVG - margins.top - margins.bottom;

// defining SVG and SVGG
let SVG = d3.select('svg#decMakComp')
            .attr("height", heightSVG)
            .attr("width", widthSVG);

let SVGG = SVG.append('g')
              .attr('id', 'chartGroup')
              .attr('transform', `translate(${margins.left}, ${margins.top})`);


// interval and scales
let interv
let x = d3.scaleLinear().range([0, width])
let radScale = d3.scaleSqrt().domain([0, 100]).range([0, 15])

// async read and draw the chart
async function readDataAndDrawDecChart(){
  let decMak = await d3.csv('./js/files/decisionMaking.csv');

  // defining the domain of scale
  x.domain([0, 60]);
  // interval for groups
  interv = height/ decMak.length;

  // define axes
  var axis = d3.axisBottom()
    .scale(x)
    .ticks(12)
    .tickFormat(function(d) {
      return d + (d === 60 ? '%' : '');
    });

  var axisGrid = d3.axisBottom()
    .scale(x)
    .tickSize(-height+10)
    .ticks(12)
    .tickFormat("");


  let axisBottom = SVGG.append('g')
      .attr("class", "x axis")
      .attr('transform', `translate(${0}, ${height+40})`);

  // draw axis
  axisBottom
    .call(axis);

  // define gridLines
  let gridLines = SVGG.append('g')
      .attr("class", "x axis gridlines")
      .attr('transform', `translate(${0}, ${height+40})`);

  // draw gridLines
  gridLines
    .call(axisGrid);

  // groups to hold encodings
  let compareGs = SVGG.selectAll('g.compareGroups')
    .data(decMak)
    .enter()
    .append('g')
    .attr('class', 'compareGroups')
    .attr('transform', (d, i) => `translate(${0}, ${(i+1) * interv})`);

  // lines with arrows to show difference
  let compLines = compareGs.append('line')
                              .attr('class', 'compLine')
                              .attr('x1', (d, i) => x(d.nonFinInc))
                              .attr('x2', (d, i) => x(d.nonFinInc))
                              .attr('y1', (d, i) => interv/2)
                              .attr('y2', (d, i) => interv/2)
                              .style('stroke', d => +d.finInc > +d.nonFinInc ? 'blue' : 'red')
                              .style('stroke-width', '2px')
                              .style('stroke-opacity', d => d.finInc != 0 ? 0.6 : 0)
                              .attr("marker-end", d => d.finInc != 0 ? "url(#arrow)" : "none")

  // circles for financially included
  let finIncCircles = compareGs.append('circle')
                              .attr('class', 'finIncCirc')
                              .attr('cx', (d, i) => x(d.nonFinInc))
                              .attr('cy', interv/ 2)
                              .attr('r', d => radScale(d.finIncWt))
                              .style('fill', 'purple')
                              .style('stroke-width', '0.5px')
                              .style('fill-opacity', d => d.finInc != 0 ? 0.5 : 0)

  // circles for not financially included
  let nonFinIncCircles = compareGs.append('circle')
                              .attr('class', 'nonFinIncCirc')
                              .attr('cx', (d, i) => x(d.nonFinInc))
                              .attr('cy', interv/ 2)
                              .attr('r', d => radScale(d.nonFinIncWt))
                              .style('fill', '#FF6F00')
                              .style('stroke-width', '0.5px')
                              .style('fill-opacity', d => d.finInc != 0 ? 0.5 : 0)

  // text labels on y axis
  let textLabels = compareGs.append('text')
                              .attr('class', 'textLabels')
                              .text(d => d.category)
                              .attr('y', interv/1.4)
                              .attr('x', -10)
                              .style('text-anchor', 'end')
                              .style('font-weight', d => d.finInc == 0 ? '700': '300');


  // draw legends
  let ordColScale = d3.scaleOrdinal()
                  .domain(["Financiall excluded", "Financially included"])
                  .range([ "rgb(255, 111, 0, 0.5)", "rgb(128, 0, 128, 0.5)"]);

  SVG.append("g")
    .attr("class", "legendOrdinal")
    .attr("transform", "translate(230,530)");

  let legendOrdinal = d3.legendColor()
    .shape("path", d3.symbol().type(d3.symbolCircle).size(150)())
    .shapePadding(0)
    .scale(ordColScale);

  SVG.select(".legendOrdinal")
    .call(legendOrdinal);

  // function for nested circle legend
  function makeNestCircLegend(CSSSelect = 'svg', transformArray, bubArray, bubScale, legendTitle){
      // appending a legendgroup
      let legendGroup = d3.select('svg')
                       .append('g')
                       .classed('legendGroup', true)
                       .attr('transform', `translate(${transformArray[0]}, ${transformArray[1]})`)

      //console.log(legendGroup);

      legendGroup.append('text')
               .text(legendTitle)
               .classed('legendTitle', true)
               .attr('dy', 0)
               .attr('dx', 45)
               .style('font-size', '14px')
               .style('text-anchor', 'start');

      let radius = bubScale(d3.max(bubArray));
      // hard code params such as Padding and font size for now
      let legLabelPadding = 5;
      let legLabFontSize = 12;

      const circGroups = legendGroup.selectAll('circle')
               .data(bubArray)
               .enter()
               .append('g')
               .classed('circLegendGroup', true)
               .attr('transform', d => `translate(0, ${radius - radScale(d)})`);

      circGroups.append('circle')
               .attr('r', d => radScale(d))
               .style('fill', 'none')
               .style('stroke', 'black')
               .style('fill-opacity', (d, i) => i == bubArray.length - 1 ? 0.25 : 0)
               .style('stroke-width', '0.75px');

      circGroups.append('text')
               .text(d => d)
               .attr('dx', radius + legLabelPadding)
               .attr('dy', d => -(radScale(d) - legLabFontSize/2))
               .style('fill', 'black')
               .style('font-family', 'Open Sans Condensed')
               .style('font-size', `${legLabFontSize}px`)
  }
  makeNestCircLegend(CSSSelect = 'svg#decMakComp', [500, 540], [10, 100], radScale, "Percent Scale (Proportion of financially excluded and included)");

  //call fire transition function
  fireTransition(1500);

}

readDataAndDrawDecChart();

// define fore transition function
function fireTransition(duration){
  d3.selectAll('line.compLine')
    .transition()
    .duration(duration)
    .attr('x2', (d, i) => +d.finInc > +d.nonFinInc ? x(d.finInc) - 4 : x(d.finInc) + 4);

  d3.selectAll('circle.finIncCirc')
    .transition()
    .duration(duration)
    .attr('cx', (d, i) => +d.finInc > +d.nonFinInc ? x(d.finInc): x(d.finInc));
}
