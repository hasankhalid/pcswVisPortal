
  let dataToPlayGlob;
  let distScale, categScale, colScale, radScale, categLabelScale, divColScale

  let Divisions = ["Bahawalpur", "DG Khan", "Faisalabad", "Gujranwala", "Lahore", "Multan", "Rawalpindi","Sahiwal","Sargodha"];
  let bubCategs = ["Physical Violence - Last 12 months","Physical Violence - Ever"];
  async function readAndDraw(){
    let data = await d3.csv('./js/files/attitudesVAW.csv')
    console.log(data);
    console.log(wide_to_long(data));

    dataToPlayGlob = data;
    let arrOfArr = preProcess(data);



    console.log(arrOfArr);

    let districts = arrOfArr.map(d => d.key);
    let categories = arrOfArr[0].values.map(d => d.Category);
    let everViol = data.map(d => d["Physical Violence - Ever"]);

    console.log(districts);
    console.log(categories);



    var svg_width = 800;
    var svg_height = 820;
    var margins = {
      top: 50,
      bottom: 40,
      right: 30,
      left: 150
    }

    var height = svg_height - margins.top - margins.bottom;
    var width = svg_width - margins.left - margins.right;

    var alphArray = ("abcdefghijklmnopqrstuvwxyz").toUpperCase().split("");

    distScale = d3.scaleOrdinal().domain(districts);
    categScale = d3.scaleOrdinal().domain(categories);
    categLabelScale = d3.scaleOrdinal().domain(categories).range(alphArray);
    divColScale = d3.scaleOrdinal(d3.schemePaired).domain(Divisions);


    radScale = d3.scaleSqrt()
                .domain([0, d3.max(everViol)])
                .range([0, 20]);

    colScale = d3.scaleLinear().domain([0, 100]).range(['#F5F5F5', '#880E4F'])

    let xInterval = width/ categScale.domain().length;
    categScale.range(d3.range(0, width + 1, xInterval));

    let yInterval = height/ distScale.domain().length;
    distScale.range(d3.range(0, height + 1, yInterval));

    //create tooltip
    var toolTipConfig = {
      idPrefix : 'p-tooltip',
      templateSelector : '#p-tooltip',
      selectorDataMap : {
        '.s-p__tooltip-header h1 .sp-data' : function(d){
          return d.District;
        },
        '.s-p__value-cat' : function(d){
          return d.Category;
        },
        '.s-p__value-val' : function(d){
          return parseFloat(d.Value).toFixed(2) + '%';
        }
      }
    };

    var toolTip = Tooltip(toolTipConfig);


    var svg_g = d3.select("#vaw_heat_container")
                    .append("svg")
                    .attr("width", svg_width)
                    .attr("height", svg_height)
                    .append("g")
                    .attr("transform", "translate("+ margins.left + ", "+ margins.top +")");

    let rows = svg_g.selectAll('.row')
      .data(arrOfArr)
      .enter()
      .append('g')
      .attr("class", d => d.key)
      .classed('row', true)
      .attr('transform', d => d.key == "Punjab" ? `translate(0, ${distScale(d.key) + 20})` : `translate(0, ${distScale(d.key)})`);

    let distLabelSize = 14;
    let distLabels = rows.append('text')
        .classed('dist-label', 'true')
        .text(d => d.key)
        .style('text-anchor', 'end')
        .style('font-size', d => d.key == "Punjab" ? distLabelSize+2 : distLabelSize)
        .style('font-weight', d => Divisions.includes(d.key)| d.key == "Punjab" ? "700": "400");

    distLabels.attr('transform', `translate(-10, ${(yInterval/2) + (distLabelSize/4) })`);


    let padding = 1

    rows.selectAll('.cell')
      .data(d => d.values)
      .enter()
      .append('rect')
      .attr('x', d => categScale(d.Category))
      .attr('y', 0)
      .attr('height', yInterval - padding)
      .attr('width', xInterval - padding)
      .attr("class", "cell")
      .style('fill', d => {
        // console.log()
        return colScale(+d.Value);
      })
      .style('fill-opacity', d => bubCategs.includes(d.Category) | d.District == "Punjab" ? 0: 1)
      .attr('data-visible', d => bubCategs.includes(d.Category) | d.District == "Punjab" ? 'false': 'true')
      .style('stroke', 'none')

      rows.selectAll('rect[data-visible = true]')
        .on('mousemove', function(d){
          toolTip.createTooltip(d, d3.event);
        })
        .on('mouseout', function(d){
          toolTip.removeTooltip(d);
        });


    rows.selectAll('.bubbles')
      .data(d => d.values)
      .enter()
      .append('circle')
      .attr('cx', d => categScale(d.Category) + xInterval/2)
      .attr('cy', d => yInterval/2)
      .attr('r', d => bubCategs.includes(d.Category) | d.District == "Punjab" ? radScale(d.Value) : 0)
      //.attr('fill', d => d.District == 'Punjab' ? '#E91E63' : divColScale(divisionDict[d.District]))
      .attr('fill', '#E91E63')
      .attr('fill-opacity', 0.5)
      .on('mousemove', function(d){
        toolTip.createTooltip(d, d3.event);
        console.log(d);
      })
      .on('mouseout', function(d){
        toolTip.removeTooltip(d);
      });

    svg_g.append('g')
        .attr('transform', 'translate(0, -15)')
        .selectAll('text')
        .data(categories)
        .enter()
        .append('text')
        .style('text-anchor', 'middle')
        .style('font-size', distLabelSize + 4)
        .style('font-weight', d => bubCategs.includes(d)  ? 700 : 400)
        .style('fill', d => bubCategs.includes(d) ? '#E91E63' : 'black')
        .text(d => categLabelScale(d))
        .attr('x', d => categScale(d) + xInterval/2)


    d3.select('#vaw_heat_description')
      .select('#perceptionStuff')
      .selectAll('p')
      .data(categories.filter(d => !bubCategs.includes(d)))
      .enter()
      .append('p')
      .attr('class', 'CategListElem')
      //.classed('CategListElem'. true)
      .html(d => `<span class= "categLabel">${categLabelScale(d)}:</span> ${d}`)


    d3.select('#LegendsAndStuff')
      .select('#violOccurenceStuff')
      .selectAll('p')
      .data(categories.filter(d => bubCategs.includes(d)))
      .enter()
      .append('p')
      //.classed('CategListElem'. true)
      .attr('class', 'CategListElem')
      .html(d => `<span class= "categLabel">${categLabelScale(d)}:</span> ${d}`)

    d3.select('#legendsContain')
      .append('svg')
      .attr('width', 300)
      .attr('height', 200)
      .attr('id', 'legendSVG')

    //drawCircLegend().updateCellSize(10);

    var circLegendG = d3.select('#legendSVG')
      .append('g')
      .attr('id', 'circLegendGroup')
      .attr('transform', 'translate(20, 50)')
      .call(drawCircLegend);

    var contColLegendG = d3.select('#legendSVG')
      .append('g')
      .attr('id', 'contColLegGroup')
      .attr('transform', 'translate(20, 140)')
      .call(drawContLegend);

    function drawCircLegend(selection) {
      let cellSize = 45;
      let groups = selection.selectAll('g')
              .data([20, 40, 60, 80, 100])
              .enter()
              .append('g')
              .attr('transform', (d,i) => `translate(${i*cellSize}, 0)`)

      groups.append('circle')
            .attr('r', d => radScale(d))
            .style('fill', 'none')
            .style('stroke', 'black')
            .style('stroke-width', '1px');

      groups.append('text')
            .text(d => `${d}%`)
            .attr('transform', `translate(${0}, 50)`)
            .style('text-anchor', 'middle')
            .style('font-size', '12px');

      function updateCellSize(value){
        cellSize = value;
      }

      return {
        updateCellSize : updateCellSize
      }
    }

    function drawContLegend(selection) {
      let rectWidth = 200;
      let rectHeight = 10;

      let barG = selection.append('g');

      var linGrad = barG.append("defs")
                      .append("svg:linearGradient")
                      .attr("id", "gradient")
                      .attr("x1", "0%")
                      .attr("y1", "100%")
                      .attr("x2", "100%")
                      .attr("y2", "100%")
                      .attr("spreadMethod", "pad");

      linGrad.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", '#F5F5F5')
        .attr("stop-opacity", 1);

      linGrad.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#880E4F")
        .attr("stop-opacity", 1);

      barG.append('rect')
        .attr('width', rectWidth)
        .attr('height', rectHeight)
        .attr('rx', 2)
        .attr('ry', 2)
        .style("fill", "url(#gradient)")
        //.style('stroke', '#212121')
        //  .style('stroke-width', '0.5px')

      barG.selectAll('text')
        .data([0, 100])
        .enter()
        .append('text')
        .text( d => d + '%')
        .attr('transform', d => `translate(${d * 2}, 25)`)
        .style('text-anchor', 'middle')

    }



  }

  readAndDraw();

  function upDate(newData){
    let newArrOfArr = preProcess(newData);

    let districts = newArrOfArr.map(d => d.key);
    let categories = newArrOfArr[0].values.map(d => d.Category);

    distScale.domain(districts);
    categScale.domain(categories);

    let rows = d3.select('#vaw_heat_container svg')
                  .select('g')
                  .selectAll('.row')
                  .data(newArrOfArr, d => d.key)
                  .transition()
                  .duration(1500)
                  .attr('transform', d => d.key == "Punjab" ? `translate(0, ${distScale(d.key) + 20})` : `translate(0, ${distScale(d.key)})`);
  }

  function preProcess(dataset){
    let longData = wide_to_long(dataset);
    let arrOfArr = d3.nest()
                    .key(d => d.District)
                    .entries(longData);
    return arrOfArr;
  }

  function wide_to_long(wide_dataset){
      // input data with years as separate columns
      // converting to long data with just 'Year' as column
      var long_data = [];
      wide_dataset.forEach(function(row){
        Object.keys(row).forEach( function(colname) {
          // make a new row for each year in the long data
          if(colname != "District") {
            long_data.push({"District": row["District"], "Value": row[colname], "Category": colname});
          }
        });
      })
      return long_data;
  }

  function removeSpaces(string){
    return string.remove(/ /g, "");
  }

  function sortDistDesc(data, variable){
    // seperate districts from Punjab
    let dists = data.filter(d => d.District != "Punjab");
    let punjab = data.filter(d => d.District == "Punjab");

    dists.sort(function(a,b) {
      return b[variable] - a[variable];
    });

    return dists.concat(punjab);
  }

/*  d3.select('#selectorContain select').on('input', function(d, i){
    let newDat = sortDistDesc(dataToPlayGlob,  this.value);
    upDate(newDat);
  }); */

  let divisionDict = {
    'Bahawalpur': 'Bahawalpur',
    'Bahawalnagar': 'Bahawalpur',
    'RY Khan': 'Bahawalpur',
    'DG Khan': 'DG Khan' ,
    'Layyah': 'DG Khan',
    'Muzaffargarh': 'DG Khan',
    'Rajanpur': 'DG Khan',
    'Faisalabad': 'Faisalabad',
    'Chiniot': 'Faisalabad',
    'Jhang': 'Faisalabad',
    'TT Singh': 'Faisalabad',
    'Gujranwala': 'Gujranwala',
    'Gujrat': 'Gujranwala',
    'Hafizabad': 'Gujranwala',
    'Mandi Bahauddin': 'Gujranwala',
    'Narowal': 'Gujranwala',
    'Sialkot': 'Gujranwala',
    'Lahore': 'Lahore',
    'Kasur': 'Lahore',
    'Nankana Sahib': 'Lahore',
    'Sheikhupura': 'Lahore',
    'Multan': 'Multan',
    'Khanewal': 'Multan',
    'Lodhran': 'Multan',
    'Vehari': 'Multan',
    'Rawalpindi': 'Rawalpindi',
    'Attock': 'Rawalpindi',
    'Chakwal': 'Rawalpindi',
    'Jhelum': 'Rawalpindi',
    'Sahiwal': 'Sahiwal',
    'Okara': 'Sahiwal',
    'Pakpattan': 'Sahiwal',
    'Sargodha': 'Sargodha',
    'Bhakkar': 'Sargodha',
    'Khushab': 'Sargodha',
    'Mianwali': 'Sargodha'
  }
