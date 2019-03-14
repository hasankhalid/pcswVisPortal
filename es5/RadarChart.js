//Practically all this code comes from https://github.com/alangrafu/radar-chart-d3
//I only made some additions and aesthetic adjustments to make the chart look better
//(of course, that is only my point of view)
//Such as a better placement of the titles at each line end,
//adding numbers that reflect what each circular level stands for
//Not placing the last level and slight differences in color
//
//For a bit of extra information check the blog about it:
//http://nbremer.blogspot.nl/2013/09/making-d3-radar-chart-look-bit-better.html
var toolTipConfig = {
  idPrefix: 'r-tooltip',
  templateSelector: '#radar-tooltip',
  selectorDataMap: {
    '.s-p__tooltip-header h1': function (d) {
      return d.axis;
    },
    '.sp-minority': function (d, i) {
      return computeValues.call(this, d, i)[0];
    },
    '.sp-baseline': function (d, i) {
      return computeValues.call(this, d, i)[1];
    }
  }
};
var toolTip = Tooltip(toolTipConfig);

function computeValues(d, i) {
  var index = "ind" + i;
  var selectSeries = d3.select(this).attr('class').replace('radar-chart-', '');
  var compSeries = selectSeries == "serie0" ? "serie1" : "serie0";
  var ind = d.axis; // getting value of comparison serie datum

  var compDatumValue = d3.selectAll(`.radar-chart-${compSeries}`).data().filter(function (d, i) {
    return d.axis == ind;
  })[0].value;
  d3.select(`.legend.${index}`).transition('label-bold').duration(200).style('font-weight', 'bold');
  d3.selectAll(`.legend:not(.${index})`).transition('label-bold').duration(200).style('fill', 'grey');
  var minority = selectSeries == "serie0" ? d.value : compDatumValue;
  var baseline = selectSeries == "serie1" ? d.value : compDatumValue;
  return [minority, baseline];
}

var RadarChart = {
  draw: function (id, d, options) {
    var cfg = {
      radius: 4.5,
      w: 600,
      h: 600,
      factor: 1,
      factorLegend: .85,
      levels: 3,
      maxValue: 0,
      radians: 2 * Math.PI,
      opacityArea: 0.3,
      ToRight: 5,
      TranslateX: 80,
      TranslateY: 30,
      ExtraWidthX: 100,
      ExtraWidthY: 100,
      color: d3.scaleOrdinal().range(["#009688", "#EA80FC"])
    };

    if ('undefined' !== typeof options) {
      for (var i in options) {
        if ('undefined' !== typeof options[i]) {
          cfg[i] = options[i];
        }
      }
    } //cfg.maxValue = Math.max(cfg.maxValue, d3.max(d, function(i){return d3.max(i.map(function(o){return o.value;}))}));


    cfg.maxValue = 90;
    var allAxis = d[0].map(function (i, j) {
      return i.axis;
    });
    var total = allAxis.length;
    var radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);
    var Format = d3.format('.1f');
    var FormatAxis = d3.format('.0f');
    d3.select(id).select("svg").remove();
    var g = d3.select(id).append("svg") //.attr("width", cfg.w+cfg.ExtraWidthX)
    //.attr("height", cfg.h+cfg.ExtraWidthY)
    .attr('viewBox', `0 0 ${cfg.w + cfg.ExtraWidthX - 100} ${cfg.h + cfg.ExtraWidthY}`).attr("preserveAspectRatio", "xMinYMid meet").append("g").attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");
    ;
    var tooltip; //Circular segments

    for (var j = 0; j < cfg.levels - 1; j++) {
      var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
      g.selectAll(".levels").data(allAxis).enter().append("svg:line").attr("x1", function (d, i) {
        return levelFactor * (1 - cfg.factor * Math.sin(i * cfg.radians / total));
      }).attr("y1", function (d, i) {
        return levelFactor * (1 - cfg.factor * Math.cos(i * cfg.radians / total));
      }).attr("x2", function (d, i) {
        return levelFactor * (1 - cfg.factor * Math.sin((i + 1) * cfg.radians / total));
      }).attr("y2", function (d, i) {
        return levelFactor * (1 - cfg.factor * Math.cos((i + 1) * cfg.radians / total));
      }).attr("class", "line").style("stroke", "grey").style("stroke-opacity", "0.75").style("stroke-width", "0.3px").attr("transform", "translate(" + (cfg.w / 2 - levelFactor) + ", " + (cfg.h / 2 - levelFactor) + ")");
    } //Text indicating at what % each level is


    for (var j = 0; j < cfg.levels; j++) {
      var levelFactor = cfg.factor * radius * ((j + 1) / cfg.levels);
      g.selectAll(".levels").data([1]) //dummy data
      .enter().append("svg:text").attr("x", function (d) {
        return levelFactor * (1 - cfg.factor * Math.sin(0));
      }).attr("y", function (d) {
        return levelFactor * (1 - cfg.factor * Math.cos(0));
      }).attr("class", "legend").style("font-family", "sans-serif").style("font-size", "10px").attr("transform", "translate(" + (cfg.w / 2 - levelFactor + cfg.ToRight) + ", " + (cfg.h / 2 - levelFactor) + ")").attr("fill", "#737373").text(FormatAxis((j + 1) * cfg.maxValue / cfg.levels) + '%');
    }

    var series = 0;
    var dataValues;
    var axis = g.selectAll(".axis").data(allAxis).enter().append("g").attr("class", "axis");
    axis.append("line").attr("x1", cfg.w / 2).attr("y1", cfg.h / 2).attr("x2", function (d, i) {
      return cfg.w / 2 * (1 - cfg.factor * Math.sin(i * cfg.radians / total));
    }).attr("y2", function (d, i) {
      return cfg.h / 2 * (1 - cfg.factor * Math.cos(i * cfg.radians / total));
    }).attr("class", "line").style("stroke", "grey").style("stroke-width", "1px");
    axis.append("text").attr("class", function (d, i) {
      return "legend" + " ind" + i;
    }).text(function (d, i) {
      return d;
    }) //.style("font-family", "sans-serif")
    .style("font-size", "11px").attr("text-anchor", "middle").attr("dy", "1.5em").attr("transform", function (d, i) {
      return "translate(0, -10)";
    }).attr("x", function (d, i) {
      return cfg.w / 2 * (1 - cfg.factorLegend * Math.sin(i * cfg.radians / total)) - 60 * Math.sin(i * cfg.radians / total);
    }).attr("y", function (d, i) {
      return cfg.h / 2 * (1 - Math.cos(i * cfg.radians / total)) - 20 * Math.cos(i * cfg.radians / total);
    });
    d.forEach(function (y, x) {
      dataValues = [];
      g.selectAll(".nodes").data(y, function (j, i) {
        dataValues.push([cfg.w / 2 * (1 - parseFloat(Math.max(j.value, 0)) / cfg.maxValue * cfg.factor * Math.sin(i * cfg.radians / total)), cfg.h / 2 * (1 - parseFloat(Math.max(j.value, 0)) / cfg.maxValue * cfg.factor * Math.cos(i * cfg.radians / total))]);
      });
      dataValues.push(dataValues[0]);
      g.selectAll(".area").data([dataValues]).enter().append("polygon").attr("class", "radar-chart-serie" + series).style("stroke-width", "2px").style("stroke", cfg.color(series)).attr("points", function (d) {
        var str = "";

        for (var pti = 0; pti < d.length; pti++) {
          str = str + d[pti][0] + "," + d[pti][1] + " ";
        }

        return str;
      }).style("fill", function (j, i) {
        return cfg.color(series);
      }).style("fill-opacity", cfg.opacityArea).on('mouseover', function (d) {
        z = "polygon." + d3.select(this).attr("class");
        g.selectAll("polygon").transition(200).style("fill-opacity", 0.1);
        g.selectAll(z).transition(200).style("fill-opacity", .7);
      }).on('mouseout', function () {
        g.selectAll("polygon").transition(200).style("fill-opacity", cfg.opacityArea);
      });
      series++;
    });
    series = 0;
    d.forEach(function (y, x) {
      g.selectAll(".nodes").data(y).enter().append("svg:circle").attr("class", "radar-chart-serie" + series).attr('r', cfg.radius).attr("alt", function (j) {
        return Math.max(j.value, 0);
      }).attr("cx", function (j, i) {
        dataValues.push([cfg.w / 2 * (1 - parseFloat(Math.max(j.value, 0)) / cfg.maxValue * cfg.factor * Math.sin(i * cfg.radians / total)), cfg.h / 2 * (1 - parseFloat(Math.max(j.value, 0)) / cfg.maxValue * cfg.factor * Math.cos(i * cfg.radians / total))]);
        return cfg.w / 2 * (1 - Math.max(j.value, 0) / cfg.maxValue * cfg.factor * Math.sin(i * cfg.radians / total));
      }).attr("cy", function (j, i) {
        return cfg.h / 2 * (1 - Math.max(j.value, 0) / cfg.maxValue * cfg.factor * Math.cos(i * cfg.radians / total));
      }).attr("data-id", function (j) {
        return j.axis;
      }).style("fill", cfg.color(series)).style("fill-opacity", .9).on('mouseover', function (d, i) {
        computeValues.call(this, d, i);
        newX = parseFloat(d3.select(this).attr('cx')) - 10;
        newY = parseFloat(d3.select(this).attr('cy')) - 8;
        tooltip.attr('x', newX).attr('y', newY).text(Format(d.value)) //.transition(200)
        .style('opacity', 1).style('font-size', '13px');
        z = "polygon." + d3.select(this).attr("class");
        g.selectAll("polygon").transition(200).style("fill-opacity", 0.1);
        g.selectAll(z).transition(200).style("fill-opacity", .7);
        toolTip.createTooltip.call(this, d, d3.event, i); // make the axis text label bold
      }).on('mouseout', function (d, i) {
        toolTip.removeTooltip.call(this, d, d3.event, i);
        var index = "ind" + i; // make the axis text label normal

        d3.select(`.legend.${index}`).transition('label-bold').duration(200).style('font-weight', 'normal');
        d3.selectAll(`.legend:not(.${index})`).transition('label-bold').duration(200).style('fill', 'black');
        tooltip //.transition(200)
        .style('opacity', 0).style('font-size', '0px');
        g.selectAll("polygon").transition(200).style("fill-opacity", cfg.opacityArea);
      });
      series++;
    }); //Tooltip

    tooltip = g.append('text').style('opacity', 0).style('font-family', 'sans-serif').style('font-size', '0px');
  }
};