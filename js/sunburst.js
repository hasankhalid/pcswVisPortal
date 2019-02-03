// defining color and layer type ordinal scale in global scope
const scalColCateg = d3.scaleOrdinal();
const layerTypeScale = d3.scaleOrdinal();

// Dimensions of sunburst.
let sunWidth = 850;
let height = sunWidth/5 * 4; // 5:4 aspect ratio
let radius = Math.min(sunWidth, height) / 2;

// Breadcrumb dimensions: width, height, spacing, width of tip/tail.
let b = {
  w: 100, h: 80, s: 5, t: 15
};

// Total size of all segments; we set this later, after loading the data.
let totalSize;

let vis = d3.select("#sunburst_container").append("svg:svg")
    .attr("width", sunWidth)
    .attr("height", height)
    .attr("viewBox", "0 0 " + sunWidth + " " + height)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr('class', 'chartSVG')
    .append("svg:g")
    .attr("id", "container")
    // mask the whole group in svg by a circle with radial gradient
    .attr('mask', 'url(#gradientMask)')
    .style('mask', 'url(#gradientMask)')
    // center the group within the svg
    .attr("transform", "translate(" + sunWidth / 2 + "," + height / 2 + ")");

// define partition function for 2*pi circumference
let partition = d3.partition()
    .size([2 * Math.PI, radius * radius]);

// offset angle to rotate the sunburst
let offsetAngle = 0.5 * Math.PI;

// define an arc function that will return curved path given data
// partition return x0, x1 (start angle and end angle)
// and y0, y1 (inner and outer radius)
let arc = d3.arc()
    .startAngle(d => d.x0 + offsetAngle)
    .endAngle(d => d.x1 + offsetAngle)
    // give the arcs a bit of padding
    .padAngle([0.0025])
    .innerRadius(d => Math.sqrt(d.y0))
    .outerRadius(function(d) {
      let withinLayerPadding = 2;
      return Math.sqrt(d.y1) - withinLayerPadding;
    });

// async function that reads in data, conducts transforamtions and draws the visualization
async function readAndDrawSunburst(){
    // read in the data asynchronously
    let data = await d3.csv('./js/files/laborHierarchyMS.csv');

    // function takes in a sequence csv and converts it into array of arrays
    function convArrOfArr(dataset){
      let arrOfArr = dataset.map(d => {
        // each row is returned as an array of key and value
        return [d.key, +d.value];
      })
      return arrOfArr;
    }

    // list of variables that are part of the sequence
    let seqVars = ["area", "laborForce", "employment", "industry", "barrier", "maritalStatus", "empType", "placeOfWork", "informal"]
    // give each variable a layer Type to help users read the visual
    let layerTypes = ["Area", "Labor Force Participation", "Employment", "Industry", "Major barrier to work", "Marital Status", "Employment Type", "Place of work", "Informal/ formal employment in non-agriculture sectors"];



    ////// Code to assign each category to a layer type
    let categs = [];
    let categLayerType = [];
    let setCategs;
    let arrCategs;
    let idx = 0;

    // loop through each var, get all unique categories and assign a layer type
    seqVars.forEach(varble => {
      setCategs = new Set(data.map(d => d[varble]));
      arrCategs = Array.from(setCategs).filter(d => d!= "NA");
      categLayerType = categLayerType.concat(Array(arrCategs.length).fill(layerTypes[idx]));
      categs = categs.concat(arrCategs)
      idx += 1;
    })

    // updating the domain and range of the layer type scale
    layerTypeScale.domain(categs)
                  .range(categLayerType);

    // declaring labels and colors
    let labels = ["Urban", "Rural", "Not in labor force", "Labor force"];
    let colors = ['#29B6F6','#4DB6AC','#FF8F00','#8E24AA'];

    // setting the domain and range of color scale
    scalColCateg.domain(labels)
                .range(colors);

    function transformData(dataset){
      // group data based on sequences and add the weights
      let seqValues = d3.nest()
                        .key(d => d.sequence)
                        .rollup(v => d3.sum(v.map(d => d.weight)))
                        .entries(dataset);

      // converting grouped data into and array of arrays
      let arrOfArr = convArrOfArr(seqValues);
      // convert the array of arrays into a nested hierarchical json
      let json = buildHierarchy(arrOfArr);
      return json
    }

    let json = transformData(data);
    // call the createVisualization function to draw the sunburst
    createVisualization(json, scalColCateg);

    // remove all stuff from chart and trail
    function removeStuffAndRedraw(data, scale){
      //d3.select('#sequence').selectAll('*').remove();
      vis.transition()
        .duration(250)
        .style('fill-opacity', 0.0)
        .on('end', function(){
          vis.selectAll('*').remove();
          createVisualization(data, scale)
        })
    }

    // interaction with buttons
    d3.select("#ButtonContain")
      .selectAll('div').on("click", function(d, i){

        let ageGroup = d3.select(this).attr('ageGroup');

        let dataFiltered;
        let jsonFiltered;
        if (ageGroup != "All"){
          dataFiltered = data.filter(d => d.ageGroup == ageGroup);
        }
        else {
          dataFiltered = data;
        }


        // transform data and draw again
        jsonFiltered = transformData(dataFiltered);

        // remove shit
        removeStuffAndRedraw(jsonFiltered, scalColCateg);

        //createVisualization(jsonFiltered, scalColCateg);


        // enable all and then disable the clicked button

        d3.selectAll('div.button').classed('disabled', false)
        d3.select(this).classed('disabled', true);
      })
}

// call th async function to read in data and draw the visualization
readAndDrawSunburst();


// Main function to draw and set up the visualization, once we have the data.
function createVisualization(json, colScale) {

  // Basic setup of page elements.
  initializeBreadcrumbTrail();
  // Bounding circle underneath the sunburst, to make it easier to detect
  // when the mouse leaves the parent g.
  vis.transition()
    .duration(250)
    .style('fill-opacity', 1);

  vis.append("svg:circle")
      .attr("r", radius)
      .style("opacity", 0);

  // data for defining the radial gradient
  let radGradData = [{"offset": "40%", "stop-opacity": 1, "stop-color": "white"}, {"offset": "100%", "stop-opacity": .65, "stop-color": "white"}];

  let SVG = d3.select('svg.chartSVG')

  // add a radial gradient in defs
  SVG.append('defs')
      .append('radialGradient')
      .attr('id', 'radOpacGrad')
      .selectAll('stop')
      .data(radGradData)
      .enter()
      .append('stop')
      .attr('offset', d => d.offset)
      .attr('stop-opacity', d=> d[["stop-opacity"]])
      .attr('stop-color', d=> d[["stop-color"]]);

  // add a circle that is filled by the gradient. This will be used to mask the chart
  SVG.select('defs')
      .append('mask')
      .attr('id', 'gradientMask')
      .append('g')
      .append('svg:circle')
      .attr('r', radius)
      .style('fill', 'url(#radOpacGrad)');


  // Turn the data into a d3 hierarchy and calculate the sums.
  let root = d3.hierarchy(json)
      .sum(function(d) { return d.size; })
      .sort(function(a, b) {
        if (a.parent.data.name != "Rural"){
          return b.value - a.value;
        } else {
          return a.value - b.value;
        }

      });

  // For efficiency, filter nodes to keep only those large enough to see.
  let nodes = partition(root).descendants()
      // This is where very small nodes get filtered
      .filter(function(d) {
          return (d.x1 - d.x0 > 0.005); // 0.005 radians = 0.29 degrees
      });



  let path = vis.data([json]).selectAll("path")
      .data(nodes)
      .enter().append("svg:path")
      .attr("display", function(d) { return d.depth ? null : "none"; })
      .attr("d", arc)
      .attr("fill-rule", "evenodd")
      .style("fill", d => scalColCateg(getParentCol(d)))
      .style("opacity", 1)
      .on("mouseover", mouseover);

  // Add the mouseleave handler to the bounding circle.
  d3.select("#container").on("mouseleave", mouseleave);

  // Get total size of the tree = value of root node from partition.
  totalSize = path.datum().value;

  /*// draw legend
  SVG.append("g")
    .attr("class", "legendOrdinal")
    .attr("transform", "translate(60 ,60)");

  let legendOrdinal = d3.legendColor()
    .shapePadding(2)
    .scale(scalColCateg)
    .cellFilter(function(d){ return d.label !== "root" });

  SVG.select(".legendOrdinal")
    .call(legendOrdinal);

  d3.select(".legendOrdinal").append('text')
    .classed('legendTitle', true)
    .text('Layer colors')
    .attr('transform', 'translate(0, -10)');
*/
 };

// Fade all but the current sequence, and show it in the breadcrumb trail.
function mouseover(d) {
  // get urban/ rural and denominator for urban/ rural
  let areaSize = getUrbRurWeight(d);
  let area = getUrbRurWeight(d).area;

  // calculate all relevant percentages to be shown in visual
  let percentage = (100 * d.value / totalSize).toPrecision(3);
  let percArea = (100 * d.value / areaSize.weight).toPrecision(3);
  let parSize = d3.sum(d.parent.children.map(d => d.value));
  let percRelPar = (100 * d.value / parSize).toPrecision(3);

  // percentage strings
  let percentageString = percentage + "%";
  if (percentage < 0.1) {
    percentageString = "< 0.1%";
  }

  let percRelParString = percRelPar + "%";
  if (percRelPar < 1) {
    percRelPar = "< 0.1%";
  }

  // Add percentages on to the visual
  d3.select("#percentage")
      .text(percRelParString);

  d3.select("#percentGlobal")
      .text(`${percArea}%`);

  d3.select("#UrbRurTitle")
      .text(area);

  d3.select("#explanation")
      .style("visibility", "");

  let hoveredName = d.data.name;

  // showing and styling type of Layer
  d3.select("#NodeTypeText")
    .html(d => {
      return `<span id ="NodeTypeTextSpan" style="color: rgb(142, 36, 170);">${layerTypeScale(hoveredName)}</span>`
    })
    .style("opacity", 1);

  d3.select("#NodeTypeTextSpan").style('font-weight', 'bold');



  let sequenceArray = d.ancestors().reverse();
  sequenceArray.shift(); // remove root node from the array
  // update the breadcrumb trail
  updateBreadcrumbs(sequenceArray, percentageString);

  // Fade all the segments.
  d3.selectAll("path")
      .style("opacity", 0.3);

  // Then highlight only those that are an ancestor of the current segment.
  vis.selectAll("path")
      .filter(function(node) {
                // if node exists in sequence (greater or equal to zero)
                return (sequenceArray.indexOf(node) >= 0);
              })
      .style("opacity", 1);
}

// Restore everything to full opacity when moving off the visualization.
function mouseleave(d) {

  // Hide the breadcrumb trail
  /*d3.select("#trail")
      .style("visibility", "hidden"); */

  d3.selectAll(".labelContainer").remove();

  d3.select('#trail')
    .append('div')
    .classed('labelContainer', true)
    .style('background', 'linear-gradient(145deg, rgba(142,36,170,1) 0%, rgba(186,104,200,1) 100%)')
    .style('color', 'white')
    .html(function() {
      return '<p>Hover the graph for details</p>'
    });

  // Deactivate all segments during transition.
  d3.selectAll("path").on("mouseover", null);

  // Transition each segment to full opacity and then reactivate it.
  d3.selectAll("path")
      .transition()
      .duration(1000)
      .style("opacity", 1)
      .on("end", function() {
              d3.select(this).on("mouseover", mouseover); // reactive mouseover after transition ends
            });

  d3.select("#explanation")
      .style("visibility", "hidden");

  // opacity of Node Text Type and endlabel
  d3.select("#NodeTypeText")
      .style("opacity", 0);

  d3.select("#endlabel")
      .style("opacity", 0);
}

function initializeBreadcrumbTrail() {
  //d3.select("#trailAndPercent").remove();
  // Add the svg area.
/*  var trailAndPercent = d3.select("#sequence").append("div")
      .style("width", '100%')
      .attr("id", "trailAndPercent");
  // Add the label at the end, for the percentage.
  trailAndPercent.append('div')
                .attr('id', 'trail') */
  d3.select('#trailAndPercent').append('div')
        .attr('id', 'endlabelDiv')
        .append('p')
        .attr('id', 'endlabel')
        .style('color', 'black')
}


// Update the breadcrumb trail to show the current sequence and percentage.
function updateBreadcrumbs(nodeArray, percentageString) {
  d3.selectAll(".labelContainer").remove();

  // Data join; key function combines name and depth (= position in sequence).
  var trail = d3.select("#trail")
      .selectAll("div")
      .data(nodeArray, function(d) {
        return d.data.name + d.depth;
      });

  // Remove exiting nodes.
  trail.exit().remove();

  // Add breadcrumb and label for entering nodes.
  var entering = trail.enter().append("div").attr('class', 'labelContainer');
  // color for entering breadcrumbs
  entering.style('background', function(d) { return scalColCateg(getParentCol(d)); });
  // adding html to the p tag
  entering.html(function(d) {
    return '<span style="color: white">' + d.data.name + ' </span><i class="fas fa-angle-right"></i>'
  });

  // Now move and update the percentage at the end.
  d3.select("#trailAndPercent").select("#endlabel")
      .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
      .attr("y", b.h / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
      .style('opacity', 1)
      .text(percentageString + " (Punjab)");

  // Make the breadcrumb trail visible, if it's hidden.
  d3.select("#trail")
      .style("visibility", "");

}


// Take a 2-column CSV and transform it into a hierarchical structure suitable
// for a partition layout. The first column is a sequence of step names, from
// root to leaf, separated by hyphens. The second column is a count of how
// often that sequence occurred.
function buildHierarchy(csv) {
  var root = {"name": "root", "children": []};
  for (var i = 0; i < csv.length; i++) {
    var sequence = csv[i][0];
    var size = +csv[i][1];
    if (isNaN(size)) { // e.g. if this is a header row
      continue;
    }
    var parts = sequence.split("-");
    // console.log("parts", parts)
    var currentNode = root;
    for (var j = 0; j < parts.length; j++) {
      var children = currentNode["children"];
      var nodeName = parts[j];
      var childNode;
      if (j + 1 < parts.length) {
        // Not yet at the end of the sequence; move down the tree.
        var foundChild = false;
        for (var k = 0; k < children.length; k++) {
          if (children[k]["name"] == nodeName) {
            childNode = children[k];
            foundChild = true;
            break;
          }
        }
        // If we don't already have a child node for this branch, create it.
        if (!foundChild) {
          childNode = {"name": nodeName, "children": []};
          children.push(childNode);
        }
        currentNode = childNode;
      } else {
        // Reached the end of the sequence; create a leaf node.
        childNode = {"name": nodeName, "size": size};
        children.push(childNode);
      }
    }
  }

  return root;
};

// recursively get a parent given a defined list of parents
function getParentCol(datum){
  let coloredCategs = ["Urban", "Rural", "Not in labor force", "Labor force", "root"];
  if (coloredCategs.includes(datum.data.name)){
    return datum.data.name;
  }
  else {
    return getParentCol(datum.parent);
  }
}

// get whether Urban or Rural in ancestors and its value
function getUrbRurWeight(datum){
  let categs = ["Urban", "Rural"];
  if (categs.includes(datum.data.name)){
    return {
      area: datum.data.name,
      weight: datum.value
    };
  }
  else {
    return getUrbRurWeight(datum.parent);
  }
}
