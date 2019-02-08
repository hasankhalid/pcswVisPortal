function createFinPyramid() {

  // declare variable that will hold the data that is read in
  let finIncComp;
  // define margins for the visualization
  let heightSVG = 760;
  let widthSVG = 820;
  let margins = {
    top: 50 ,
    bottom: 30,
    right: 140,
    left: 40
  }

  // defining the width and height after adjusting margins
  let width = widthSVG - margins.left - margins.right;
  let height = heightSVG - margins.top - margins.bottom;

  // defining SVG and SVGG
  let SVG = d3.select('svg#finIncPyramid')
              .attr("height", heightSVG)
              .attr("width", widthSVG);

  let SVGG = SVG.append('g')
                .attr('id', 'chartGroup')
                .attr('transform', `translate(${margins.left}, ${margins.top})`);

  // bar interval for bars
  let interv

  // defining scales
  let x = d3.scaleLinear();

  // async function
  async function readAndDraw(){
    let finIncComp = await d3.csv('./js/files/finIncDet.csv');

    // compute interv
    interv = height/ finIncComp.length;

    // titles for halves
    SVGG.append('g')
        .attr('transform', `translate(${width/2}, -20)`)
        .classed('half-titles', 'true')
        .selectAll('text')
        .data(['Access to credit', 'Financial inclusion'])
        .enter()
        .append('text')
        .text(d => d)
        .style('text-anchor', 'middle')
        .attr('x', (d,i) => {
          let symVal = 80
          let Y = [-symVal, symVal]
          return Y[i];
        })
        .style('font-weight', 'bold');


    // padding b/w bars
    let padding = 4;
    // distance b/w halves
    let gapBwBars = 0;
    // effWidth calculated by keeping gapBwBars under consideration
    let effWidth = (width/2) - gapBwBars;

    //let maxBarrVal = d3.max(barrs.concat(majorBarrs));
    let maxBarrVal = 25;

    // updating domain and range of x scale
    x.domain([0, maxBarrVal + 5]).range([0, effWidth]);

    // define scales for halves just in case
    let creditScale = d3.scaleLinear().domain(x.domain()).range([0, -effWidth]);
    let bankScale = d3.scaleLinear().domain(x.domain()).range([0, effWidth]);

    // lines that show Punjab avg
    SVGG.selectAll('line.avgMarker')
        .data([3.621362686, 8.8056])
        .enter()
        .append('line')
        .classed('avgMarker', true)
        .attr('x1', (d, i) => i == 0 ? (width/2) - x(d) - gapBwBars: (width/2) + x(d) + gapBwBars)
        .attr('x2', (d, i) => i == 0 ? (width/2) - x(d) - gapBwBars: (width/2) + x(d) + gapBwBars)
        .attr('y1', 0)
        .attr('y2', height + 5)
        .style('stroke', 'grey')
        .style('stroke-dasharray', 2)
        .style('stroke-width', '1.0px')
        .style('stroke-opacity', '0.5');


    // bar groups translated all the way down the chart
    let barGroups = SVGG.selectAll('g.barGroup')
                        .data(finIncComp)
                        .enter()
                        .append('g')
                        .classed('barGroup', true)
                        .attr('transform', (d,i) => `translate(${width/2}, ${(i+1)*interv})`);


    // define colors for halves and darkening factor
    let barRightCol = d3.rgb('#EC407A');
    let barLeftCol = d3.rgb('#BA68C8');
    let darkenFactor = 0.4


    // drawing bars to the right
    let barsRight1 = barGroups.append('rect')
                            .attr('transform', `translate(${gapBwBars}, 0)`)
                            .attr('height', interv - padding)
                            .attr('width', d => x(d.accountBank))
                            .attr('y', - (interv - padding / 2))
                            .style('fill', barRightCol);
                            //.style('fill', '#8c96c6')

                            // #8c96c6 #8856a7 #810f7c

    let barsRight2 = barGroups.append('rect')
                            .attr('transform', `translate(${gapBwBars}, 0)`)
                            .attr('height', interv - padding)
                            .attr('width', d => x(d.accountsOther))
                            .attr('x', d => x(d.accountBank))
                            .attr('y', - (interv - padding / 2))
                            .style('fill', barRightCol.darker(darkenFactor));
                            //.style('fill', '#8856a7')

    let barsRight3 = barGroups.append('rect')
                            .attr('transform', `translate(${gapBwBars}, 0)`)
                            .attr('height', interv - padding)
                            .attr('width', d => x(d.finInc - d.account))
                            .attr('x', d => x(d.account))
                            .attr('y', - (interv - padding / 2))
                            .style('fill', barRightCol.darker(darkenFactor).darker(darkenFactor));
                            //.style('fill', '#810f7c')

    // adding bar labels
    let textBarsRight = barGroups.append('text')
                            //.attr('transform', `translate(${gapBwBars}, 0)`)
                            .text(d => round2Dec(d.finInc, 1))
                            .attr('x', d => x(d.finInc) + 5)
                            .attr('y', -4)
                            .style('text-anchor', 'start')
                            .style('font-size', `${interv - 6}px`)
                            .style('font-weight', d => d.finInc == 0 | d.category == "Punjab" ? 'bold' : '')
                            .style('opacity', d => d.finInc == 0 ? 0 : 1);

    // drawing bars to the left
    let barsLeft1 = barGroups.append('rect')
                            .attr('transform', `translate(${-gapBwBars}, 0)`)
                            .attr('height', interv - padding)
                            .attr('width', d => x(d.accessCreditOth))
                            .attr('y', - (interv - (padding / 2)))
                            .attr('x', d => -x(d.accessCreditOth))
                            .style('fill', barLeftCol);
                            //.style('fill', '#dd1c77')

    let barsLeft2 = barGroups.append('rect')
                            .attr('transform', `translate(${-gapBwBars}, 0)`)
                            .attr('height', interv - padding)
                            .attr('width', d => x(d.accessCreditBus))
                            .attr('y', - (interv - (padding / 2)))
                            .attr('x', d => x(- d.accessCreditBus - d.accessCreditOth))
                            .style('fill', barLeftCol.darker(darkenFactor));
                            //.style('fill', '#df65b0')

    // adding text labels to the left
    let textBarsLeft = barGroups.append('text')
                            //.attr('transform', `translate(${gapBwBars}, 0)`)
                            .text(d => {
                              console.log(round2Dec(d.accessCredit, 1));
                              console.log(d.accessCredit);
                              return round2Dec(d.accessCredit, 1);
                            })
                            .attr('x', d => -(x(d.accessCredit) + 5))
                            .attr('y', -4)
                            .style('text-anchor', 'end')
                            .style('font-size', `${interv - 6}px`)
                            .style('font-weight', d => d.finInc == 0 | d.category == "Punjab" ? 'bold' : '')
                            .style('opacity', d => d.finInc == 0 ? 0 : 1);

    // lines to separate bar groups
    barGroups.append('line')
            .attr('transform', `translate(${-width/2}, ${0})`)
            .attr('x1', 0)
            .attr('x2', width - gapBwBars)
            .attr('y1', 0)
            .attr('y2', 0)
            .style('stroke', 'black')
            .style('stroke-width', '0.5px')
            .style('stroke-opacity', '0.2');

    // labels for categories
    barGroups.append('text')
            .attr('transform', `translate(${gapBwBars}, 0)`)
            .text(d => d.category)
            .attr('x', d => d.finInc == 0 | d.category == "Punjab" ? -(width/2 - 2) : -(width/2 - 10))
            .attr('y', -4)
            .style('text-anchor', 'start')
            .style('font-size', `${interv - 6}px`)
            .style('font-weight', d => d.finInc == 0 | d.category == "Punjab" ? 'bold' : '')

    // scale to describe props of categories
    let radScale = d3.scaleSqrt().domain([0, 100]).range([0, 15])

    // draw circs that show relative props of categories
    barGroups.append('circle')
            .attr('cx', -width/2-10)
            .attr('cy', -interv/2)
            .attr('r', d => radScale(d.prop))
            .style('fill', 'purple')
            .style('fill-opacity', 0.25)


    /* Initialization */
    function initializeAxes() {

      var axis = d3.axisBottom()
        .scale(creditScale)
        //.tickSize(tickSize)
        .ticks(6)
        .tickFormat(function(d) {
          return d + (d === (maxBarrVal + 5) ? '%' : '');
        });

      let axisLeft = SVGG.append('g')
          .attr("class", "credit axis")
          .attr('transform', `translate(${width/2}, ${height+5})`);

      d3.select(".credit.axis")
        .call(axis);

      let axisRight = SVGG.append('g')
          .attr("class", "bank axis")
          .attr('transform', `translate(${width/2}, ${height+5})`);

      axis.scale(bankScale);
      d3.select(".bank.axis")
        .call(axis);
    }

    // draw axis
    initializeAxes();

    // function for drawing nested circle legend
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
                 .attr('dy', -25)
                 .attr('dx', -15)
                 .style('font-size', '12px')
                 .style('text-anchor', 'start');

        let radius = bubScale(d3.max(bubArray));
        // hard code params such as Padding and font size for now
        let legLabelPadding = 5;
        let legLabFontSize = 8;

        const circGroups = legendGroup.selectAll('circle')
                 .data(bubArray)
                 .enter()
                 .append('g')
                 .classed('circLegendGroup', true)
                 .attr('transform', d => `translate(0, ${radius - radScale(d)})`);

        circGroups.append('circle')
                 .attr('r', d => radScale(d))
                 .style('fill', 'purple')
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

    // draw color legend
    let ordRightBars = d3.scaleOrdinal()
                    .domain(["Have account (Bank)", "Have account (other inst.)", "Use Mobile transaction", "Credit not for business", "Credit for business"])
                    .range([ barRightCol, barRightCol.darker(darkenFactor), barRightCol.darker(darkenFactor).darker(darkenFactor), barLeftCol, barLeftCol.darker(darkenFactor)]);

    let svg = d3.select("svg#finIncPyramid");

    svg.append("g")
      .attr("class", "legendOrdFinIncType")
      .attr("transform", "translate(590 ,52)")
      .style('font-size', '10px');

    let legendOrdFinIncType = d3.legendColor()
    .shapePadding(2.6)
    .scale(ordRightBars);

    svg.select(".legendOrdFinIncType")
      .call(legendOrdFinIncType);

    // draw nested circle legend
    makeNestCircLegend(CSSSelect = 'svg#finIncPyramid', [602, 200], [50, 100], radScale, "Percentage Scale")
  };

  // call the async function
  readAndDraw();

  // function to round numbers to desired precision
  function round2Dec(num, decimal){
    return Math.round(num * (10**decimal))/ (10**decimal);
  }
}
