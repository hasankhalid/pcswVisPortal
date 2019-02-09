/*jshint esversion : 6*/
function HeatBubbleMap({
    containerSelector,
    data /*[{key : '.+', rValues :[{}], cValues :[{}]}]*/ ,
    toolTipConfig,
    colorArr,
    labelMapSelector,
    colorLegendSelector,
    fontColor = '#000'
} = {}) {

    var toolTip = Tooltip(toolTipConfig);

    var svg_width = 800;
    var svg_height = 820;
    var margins = {
        top: 50,
        bottom: 40,
        right: 30,
        left: 150
    };

    var cLegendSvg = d3.select(colorLegendSelector)
    	.append('svg')
    	.attr('viewBox', '0 0 240 50')
    	.attr('width', 240)
    	.attr('height', 50);

    var height = svg_height - margins.top - margins.bottom;
    var width = svg_width - margins.left - margins.right;

    var svg = d3.select(containerSelector)
	        .append("svg")
	        .attr('viewBox', `0 0 ${svg_width} ${svg_height}`)
	        .style("max-width", svg_width);

    var alphArray = ("abcdefghijklmnopqrstuvwxyz").toUpperCase().split("");

    function create(){
    	var allCategories = getAllCategories(data);
	    var rowNames = data.map((d) => d.key);
	    var rowNameYScale = d3.scaleOrdinal().domain(rowNames);
	    var colLabelXScale = d3.scaleOrdinal().domain(allCategories);
	    var categLabelScale = d3.scaleOrdinal().domain(allCategories).range(alphArray);

	    var radScale = d3.scaleSqrt()
	        .domain([0, 100]) //change later
	        .range([0, 20]);

	    var colorScale = d3.scaleLinear().domain([0, 100]).range(colorArr);

	    var xInterval = width / colLabelXScale.domain().length;
	    TESTx = xInterval;
	    colLabelXScale.range(d3.range(0, width + 1, xInterval));

	    let yInterval = height / rowNameYScale.domain().length;
	    rowNameYScale.range(d3.range(0, height + 1, yInterval));

	    //move to create function
	    //create all rows

	    var svg_g = svg.append('g')
	    	.attr("transform", "translate("+ margins.left + ", "+ margins.top +")");

	    let rows = svg_g.selectAll('g')
	        .data(data)
	        .enter()
	        .append('g')
	        .attr("class", d => d.key)
	        .attr('transform', (d) => `translate(0, ${rowNameYScale(d.key)})`);
	    //.classed('row', true)

	    //create Labels
	    let rowLabelSize = 14;
	    let rowLabels = rows.append('text')
	        //.classed('dist-label', 'true')
	        .text(d => d.key)
	        .style('text-anchor', 'end')
	        .style('fill', fontColor);

	    fadeIn({selection : rowLabels});

	    /*.style('font-size', d => d.key == "Punjab" ? distLabelSize+2 : distLabelSize)
	    .style('font-weight', d => Divisions.includes(d.key)| d.key == "Punjab" ? "700": "400");*/

	    rowLabels.attr('transform', `translate(-10, ${(yInterval/2) + (rowLabelSize/4) })`);

	    let padding = 1;

	    var rects = rows.selectAll('rect')
	        .data(d => d.rValues)
	        .enter()
	        .append('rect')
	        .attr('x', d => colLabelXScale(d.Category))
	        .attr('y', 0)
	        .attr('height', yInterval - padding)
	        .attr('width', xInterval - padding)
	        //.attr("class", "cell")
	        .style('fill', d => {
	            // console.log()
	            return colorScale(+d.Value);
	        })
	        .style('stroke', 'none')
	        .on('mousemove', function(d) {
	            toolTip.createTooltip(d, d3.event);
	        })
	        .on('mouseout', function(d) {
	            toolTip.removeTooltip(d);
	        });

	    fadeIn({
	    	selection : rects,
	    	delay : function(d,i){
	    		return Math.random() * i * 20;
	    	},
	    	duration : 350
	    });

	    var labels = svg_g.append('g')
	        .attr('transform', 'translate(0, -15)')
	        .selectAll('text')
	        .data(allCategories)
	        .enter()
	        .append('text')
	        .style('text-anchor', 'middle')
	        .style('font-size', rowLabelSize + 4)
	        //.style('font-weight', d => bubCategs.includes(d)  ? 700 : 400)
	        .style('fill', fontColor)
	        .text(d => categLabelScale(d))
	        .attr('x', d => colLabelXScale(d) + xInterval / 2);

	    fadeIn({selection : labels});

	    //create legend
	    drawContLegend(colorLegendSelector);

	    d3.select(labelMapSelector)
	      .selectAll('p')
	      .data(allCategories)
	      .enter()
	      .append('p')
	      .html(d => `<strong>${categLabelScale(d)}:</strong> ${d}`);
    }

    function getAllCategories(data) {
        console.log(data);
        var firstRow = data[0];

        if (!firstRow) {
            throw new Error('Empty data passed to HeatBubbleMap');
        }

        var cVals = firstRow.cValues ? firstRow.cValues : [];
        var rVals = firstRow.rValues ? firstRow.rValues : [];

        return rVals.map((d) => d.Category).concat(cVals.map((d) => d.Category));
    }

    function drawContLegend(selector) {

        let rectWidth = 200;
        let rectHeight = 10;

        let barG = cLegendSvg.append('g');

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
            .text(d => d + '%')
            .attr('transform', d => `translate(${d * 2}, 25)`)
            .style('text-anchor', (d,i)=> i === 0 ? 'start' : 'middle')
            .style('fill', fontColor);
    }

    function destroy(){
    	//remove svg g
		var gTransition = d3.selectAll(containerSelector + ' > svg > g')
			.transition()
			.duration(200)
			.style('opacity',0)
			.delay((d,i)=>i * (20))
			.remove();

		//remove legends
		var lTransition = d3.selectAll(colorLegendSelector + ' > svg > g')
			.transition()
			.duration(200)
			.style('opacity',0)
			.delay((d,i)=>i * (20))
			.remove();

		var mapTransition = d3.selectAll(labelMapSelector + ' > p')
			.transition()
			.duration(200)
			.style('opacity',0)
			.delay((d,i)=>i * (20))
			.remove(); 

		return Promise.all([
			waitForTransitions(gTransition),
			waitForTransitions(mapTransition),
			waitForTransitions(lTransition),
		]);
	}

	async function update(newData){
		await destroy();
		await new Promise((resolve)=>{setTimeout(resolve,50);});
		data = newData;
		create();
	}

	function waitForTransitions(t){

		var count = 0;

		t.on('start.sequence', function(){
			count++;
		});
		
		return new Promise(function(resolve){
			t.on('end.sequence', function(){
				--count;
				if(count === 0){
					resolve(t);
				}	
			});
		});
	}

	function fadeIn({selection, 
		finalOpacity = 1, 
		duration=250, 
		delay = function(){return 0}} = {}){
		selection.style('opacity', 0)
				.transition()
				.duration(duration)
				.delay(delay)
				.style('opacity', finalOpacity);
	}

	return {
		create : create,
		destroy : destroy,
		update : update
	};
}