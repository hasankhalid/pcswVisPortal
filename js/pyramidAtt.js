// declare variable that will hold the data that is read in
let attComp;

let heightSVG = 450;
let widthSVG = 700;
let margins = {
  top: 50 ,
  bottom: 50,
  right: 20,
  left: 150
}

let width = widthSVG - margins.left - margins.right;
let height = heightSVG - margins.top - margins.bottom;

let SVG = d3.select('svg#vaw_perception_svg')
          //  .attr("height", heightSVG)
          //  .attr("width", widthSVG)
            .attr('viewBox', `0 0 ${widthSVG} ${heightSVG}`)
            .attr("preserveAspectRatio", "xMinYMid meet");

let SVGG = SVG.append('g')
              .attr('id', 'chartGroup')
              .attr('transform', `translate(${margins.left}, ${margins.top})`);

let interv

let x = d3.scaleLinear();
let menScale, womenScale;

async function readAndDraw(){
  attComp = await d3.csv('./js/files/AttMenWomPhy.csv');

  let attCompFilt = attComp.filter(d => d.Type == "Total" | d.Type == "Gap" );

  interv = height/ attCompFilt.length;

  SVGG.append('g')
      .attr('transform', `translate(${width/2}, -20)`)
      .classed('half-titles', 'true')
      .selectAll('text')
      .data(['Women', 'Men'])
      .enter()
      .append('text')
      .text(d => d)
      .style('text-anchor', 'middle')
      .attr('x', (d,i) => {
        let symVal = 80
        let Y = [-symVal, symVal]
        return Y[i];
      });

  let barGroups = SVGG.selectAll('g.barGroup')
                      .data(attCompFilt)
                      .enter()
                      .append('g')
                      .classed('barGroup', true)
                      .attr('transform', (d,i) => `translate(${width/2}, ${(i+1)*interv})`);

  let padding = 5;

  let gapBwBars = 0;
  let effWidth = (width/2) - gapBwBars;

  //let maxBarrVal = d3.max(barrs.concat(majorBarrs));
  let maxBarrVal = 85;

  x.domain([0, 100]).range([0, effWidth]);

  menScale = d3.scaleLinear().domain(x.domain()).range([0, -effWidth]);
  womenScale = d3.scaleLinear().domain(x.domain()).range([0, effWidth]);


  let barsRight = barGroups.append('rect')
                          .attr('transform', `translate(${gapBwBars}, 0)`)
                          .attr('height', interv - padding)
                          .attr('width', d => {
                            return x(d['Men-agree']);
                          })
                          .attr('y', - (interv - padding / 2))
                          .attr('class', "bar right")
                          .style('fill', '#9C27B0');

  barGroups.append('text')
          .attr('transform', `translate(${gapBwBars}, 0)`)
          .text(d => d.CategoryAlph == "" ? d.Category : "  " + d.Category)
          .attr('x', -(width/2 - 2) - margins.left)
          .attr('y', -8)
          .style('text-anchor', 'start')
          .style('font-size', `${interv - 8}px`)
          .style('font-weight', d => d.CategoryAlph == "" ? 'bold' : '')

  let barsLeft = barGroups.append('rect')
                          .attr('transform', `translate(${-gapBwBars}, 0)`)
                          .attr('height', interv - padding)
                          .attr('width', d => x(d.Women))
                          .attr('y', - (interv - (padding / 2)))
                          .attr('x', d => -x(d.Women))
                          .attr('class', "bar left")
                          .style('fill', '#F06292');

  /* Initialization */
  function initializeAxes() {

    var axis = d3.axisBottom()
      .scale(menScale)
      //.tickSize(tickSize)
      .ticks(6)
      .tickFormat(function(d) {
        return d + (d === 100 ? '%' : '');
      });

    let axisLeft = SVGG.append('g')
        .attr("class", "men axis")
        .attr('transform', `translate(${width/2}, ${height+5})`);

    d3.select(".men.axis")
      .call(axis);

    let axisRight = SVGG.append('g')
        .attr("class", "women axis")
        .attr('transform', `translate(${width/2}, ${height+5})`);

    axis.scale(womenScale);
    d3.select(".women.axis")
      .call(axis);

    d3.selectAll('.axis text')
      .style('font-size', '12px')
  }

  // draw axis
  initializeAxes();



};


readAndDraw();

function transBars(area, transDur, partialAgree){
  let filtData = attComp.filter(d => d.Type == area | d.Type == "Gap" );
  SVGG.selectAll('g.barGroup')
      .data(filtData);

  console.log(SVGG.selectAll('g.barGroup').data());

  SVGG.selectAll('rect.bar.left')
      .data(filtData)
      .transition()
      .duration(transDur)
      .attr('width', d => {
        //console.log(d);
        return x(d.Women)
      })
      .attr('x', d => -x(d.Women));

  SVGG.selectAll('rect.bar.right')
      .data(filtData)
      .transition()
      .duration(transDur)
      .attr('width', d => partialAgree ? x(d['Men-both']) : x(d['Men-agree']))
}
