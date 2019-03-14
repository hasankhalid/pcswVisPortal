var w = 500,
    h = 500;
var colorscale = d3.scaleOrdinal().range(["#009688", "#EA80FC"]); // async function readAndTrans(){
// 	let data = await d3.csv('./js/files/minoritySpider.csv');
// 	let trans = [];
// 	data.columns.forEach(d => {
// 		if (d != "Category"){
// 			console.log(d);
// 			let temp = data.map(entry => {
// 				return {
// 					"axis": entry.Category,
// 					"value": +entry[[d]]/100
// 				}
// 			})
// 			trans.push(temp);
// 		}
// 	})
// }
// readAndTrans();
//Legend titles

var LegendOptions = ['Minority Survey', 'Baseline Survey'];
var d = [[{
  "axis": "Literacy Rate",
  "value": 36.2
}, {
  "axis": "Youth NEET",
  "value": 54
}, {
  "axis": "Having 12 grades or above education",
  "value": 10.6
}, {
  "axis": "Transition (HS and above) to LF",
  "value": 37.7
}, {
  "axis": "Refined LFPR",
  "value": 31.3
}, {
  "axis": "Employment rate",
  "value": 81
}, {
  "axis": "Access to credit ",
  "value": 12.5
}, {
  "axis": "Accounts in a bank",
  "value": 5.2
}, {
  "axis": "Account in other financial inst.",
  "value": 2
}, {
  "axis": "Women who earn cash or in kind",
  "value": 50.6
}, {
  "axis": "Work at home",
  "value": 59.6
}, {
  "axis": "Use modern contraceptive",
  "value": 36
}, {
  "axis": "Child marriage (before 18)",
  "value": 8.5
}, {
  "axis": "Early child bearing (before 18)",
  "value": 9
}, {
  "axis": "Consent sought for marriage",
  "value": 56
}, {
  "axis": "Physical/ sexual spousal violence",
  "value": 7.3
}], [{
  "axis": "Literacy Rate",
  "value": 48.4
}, {
  "axis": "Youth NEET",
  "value": 47
}, {
  "axis": "Having 12 grades or above education",
  "value": 22.3
}, {
  "axis": "Transition (HS and above) to LF",
  "value": 30
}, {
  "axis": "Refined LFPR",
  "value": 36.3
}, {
  "axis": "Employment rate",
  "value": 89
}, {
  "axis": "Access to credit ",
  "value": 3.6
}, {
  "axis": "Accounts in a bank",
  "value": 5.7
}, {
  "axis": "Account in other financial inst.",
  "value": 1
}, {
  "axis": "Women who earn cash or in kind",
  "value": 34.3
}, {
  "axis": "Work at home",
  "value": 72
}, {
  "axis": "Use modern contraceptive",
  "value": 36
}, {
  "axis": "Child marriage (before 18)",
  "value": 14.8
}, {
  "axis": "Early child bearing (before 18)",
  "value": 13
}, {
  "axis": "Consent sought for marriage",
  "value": 47
}, {
  "axis": "Physical/ sexual spousal violence",
  "value": 10.8
}]]; //Options for the Radar chart, other than default

var mycfg = {
  w: w,
  h: h,
  maxValue: 0.6,
  levels: 6,
  ExtraWidthX: 300 //Call function to draw the Radar chart
  //Will expect that data is in %'s

};
RadarChart.draw("#radar_container", d, mycfg); ////////////////////////////////////////////
/////////// Initiate legend ////////////////
////////////////////////////////////////////

var svg = d3.select('#radar_container').selectAll('svg').append('svg').attr("width", w + 300).attr("height", h); //Create the title for the legend

var text = svg.append("text").attr("class", "title").attr('transform', 'translate(133,0)').attr("x", w - 70).attr("y", 10).attr("font-size", "10px").attr("fill", "#404040").text("Difference between indicators"); //Initiate Legend

var legend = svg.append("g").attr("class", "legend").attr("height", 100).attr("width", 200).attr('transform', 'translate(130,20)'); //Create colour squares

legend.selectAll('rect').data(LegendOptions).enter().append("rect").attr("x", w - 65).attr("y", function (d, i) {
  return i * 20;
}).attr("width", 10).attr("height", 10).style("fill", function (d, i) {
  return colorscale(i);
}); //Create text next to squares

legend.selectAll('text').data(LegendOptions).enter().append("text").attr("x", w - 52).attr("y", function (d, i) {
  return i * 20 + 9;
}).attr("font-size", "11px").attr("fill", "#737373").text(function (d) {
  return d;
});