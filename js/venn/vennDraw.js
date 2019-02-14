var sets = [{"sets":["Physical"],"figure":19.5,"labels":"physical","size":19.5},
            {"sets":["Psychological"],"figure":33.9,"labels":"psychological","size":33.9},
            {"sets":["Sexual"],"figure":7.8,"labels":"sexual","size":7.8},
            {"sets":["Physical", "Sexual"],"figure":5.5,"labels":"physical and sexual","size":5.5},
            {"sets":["Psychological", "Physical"],"figure":17.4,"labels":"psychological and physical","size":17.4},
            {"sets":["Sexual","Psychological"],"figure":7.0,"labels":"psychological and sexual","size":7.0},
            {"sets":["Sexual","Psychological", "Physical"],"figure":5.2,"labels":"psychological, physical and sexual","size":5.2}];

// color list for classes
let colList = ['#FCD74E', '#CA0068', '#D34FFF'];

var chart = venn.VennDiagram()
    .width(500 * 1.2)
    .height(400 * 1.2)

var div = d3v3.select("#vaw_venn_container").datum(sets).call(chart);
    div.selectAll("text").style("fill", "black");
    div.selectAll(".venn-circle path")
            .style("fill-opacity", .4)
            .style("stroke-width", 1)
            .style("stroke-opacity", 1)
            .style("stroke", "#424242");

// select first 3 paths which represent individual classes
var selectCircles = d3v3.selectAll('g.venn-area path').filter((d, i) => i < 3);
selectCircles.style('fill', (d, i) => colList[i]);

var tooltip = d3v3.select("#vaw_venn_container").append("div")
    .attr("class", "venntooltip");


div.selectAll("g")
    .on("mouseover", function(d, i) {
        // sort all the areas relative to the current item
        venn.sortAreas(div, d);

        // Display a tooltip with the current size
        tooltip.transition().duration(20).style("opacity", 1);
        tooltip.text(d.size + "% of ever married women experienced " + d.labels + " violence from Spouse");

        // highlight the current path
        // highlight the current path
        var selection = d3v3.select(this).transition("tooltip").duration(400);
        selection.select("path")
            .style("stroke-width", 1)
            .style("fill-opacity", d.sets.length == 1 ? .4 : 0)
            .style("stroke-opacity", 1);
    })

    .on("mousemove", function() {
      tooltip.style("top", (d3v3.event.pageY - 28) + "px");
      if (d3v3.event.pageX < window.innerWidth/2) {
        tooltip.style("left", (d3v3.event.pageX +10) + "px");
      }
      else {
        tooltip.style("left", (d3v3.event.pageX - 175) + "px")
      }
    })

    .on("mouseout", function(d, i) {
        tooltip.transition().duration(750).style("opacity", 0);
        var selection = d3v3.select(this).transition("tooltip").duration(400);
        selection.select("path")
            .style("stroke-width", 1)
            .style("fill-opacity", d.sets.length == 1 ? .4 : 0)
            .style("stroke-opacity", 1);
    });
