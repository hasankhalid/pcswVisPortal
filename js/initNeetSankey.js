/*jshint esversion:6*/

var state = {};
var sankey;

d3.csv('./js/files/data.csv').then((data)=>{

	state.originalData = data;
	var neetData = data.filter((d)=>d.ageGroup==='15-24')
						.filter((d)=>{return d.education === "Intermediate" || d.education === "Graduation" || d.education === "Masters or above" ;});
	state.currData = neetData;
	state.originalData = neetData;
	state.currTotalWeight = state.currData.reduce((a,d)=>a + parseFloat(d.weight),0);
	var res = getLabourForceGraph(state.currData);

	sankey = SankeyChart({
		data : res,
		nodeWidth : 15,
		nodePadding: 10,
		width : 1300,
		height : 800,
		svgSelector : '#sankey_container svg',
		pToolTipConfig : {
			idPrefix : 'p-tooltip',
			dataId : 'index',
			templateSelector : '#p-tooltip',
			selectorDataMap : {
				'.s-p__tooltip-header h1' : function(d){
					return d.source.name + ' → ' + d.target.name;
				},
				'.s-p__value-source' : function(d){
					return ((d.value / d.source.value) * 100).toFixed(2) + '%'; 
				},
				'.s-p__value-target' : function(d){
					return ((d.value / d.target.value) * 100).toFixed(2) + '%'; 
				}, 
				'.s-p__value-total' : function(d){
					return ((parseFloat(d.value) / state.currTotalWeight) * 100).toFixed(2) + '%'; 
				}
			}
		},
		rToolTipConfig : {
			idPrefix : 'r-tooltip',
			dataId : 'index',
			templateSelector : '#r-tooltip',
			selectorDataMap : {
				'.s-p__tooltip-header h1' : function(d){
					return d.name;
				}, 
				'.s-p__value' : function(d){
					return ((parseFloat(d.value) / state.currTotalWeight) * 100).toFixed(2) + '%'; 
				}
			}
		},
		nodeAlignment : d3.sankeyRight
	});

	sankey.create();
});

function buildGraph(data,colArr){
	var nodes = new Array(colArr.length);

	for(let i = 0; i < nodes.length; i++){
		nodes[i] = {};
	}

	data.forEach(function(row){
		for(var i = 1; i < colArr.length; i++){
			var startNode = row[colArr[i - 1]];
			var endNode = row[colArr[i]];

			var startGroup = nodes[i - 1];
			startGroup[startNode] = startGroup[startNode] || {};

			var endGroup = nodes[i];
			endGroup[endNode] = endGroup[endNode] || {};

			if(startGroup[startNode][endNode]){
				startGroup[startNode][endNode] = startGroup[startNode][endNode] + parseFloat(row.weight);
			}else{
				startGroup[startNode][endNode] = parseFloat(row.weight);
			}
		}
	});

	tNodes = nodes;

	var nodesArr = nodes.reduce((a,d,i)=>{
		return a.concat(Object.keys(d).map((d)=>{return {name: d, col : colArr[i]};}));
		}, []);

	var nodesDict = {};

	nodesArr.forEach((d,i)=>{nodesDict[d.name + '-' + d.col] = i});

	var edgesArr = [];

	for(var i = 1; i < nodes.length; i++){
		var startGroup = nodes[i - 1];
		var endGroup = nodes[i];

		for(var j in startGroup){
			
			var edgesObj = startGroup[j];
			var sourceIndex = nodesDict[j + '-' + colArr[i - 1]];

			for(var k in edgesObj){
				edgesArr.push({
					source : sourceIndex,
					target : nodesDict[k + '-' + colArr[i]],
					value : edgesObj[k]
				});
			}
		}
	}

	return {nodes : nodesArr, links : edgesArr, test : nodes};
}

function getUniqueValCountObj(colArr, data){
	var obj = {};
	
	colArr.forEach(function(col){
		obj[col] = {};
	});

	data.forEach(function(row){
		colArr.forEach(function(col){
			obj[col][row[col]] = obj[col][row[col]] || 0;
			obj[col][row[col]] = obj[col][row[col]] + parseFloat(row.weight);
		});
	});

	return obj;
}

function buildSankeyGraph(nodes, links,data){
	
}

function getUniqueValues(col,data){
	var valDict = {};

	data.forEach((d)=>{
		valDict[d[col]] = true;
	});

	return Object.keys(valDict);
}

function getLabourForceGraph(data){

	var columns = ['laborForce', 'barrier', 'employment', 'industry'];
	var columnLinks = [
		['laborForce', 'employment'],
		['laborForce', 'barrier'],
		['employment', 'barrier'],
		['employment', 'industry'],
		['industry','barrier']
	];

	var laborForceVals = getUniqueValues('laborForce',data);
	var barrierVals = getUniqueValues('barrier',data);
	var employmetVals = getUniqueValues('employment',data).filter((d)=>d !== 'NA');
	var industryVals = getUniqueValues('industry',data).filter((d)=>d !== 'NA');

	var graph = {
		nodes : {},
		links : {}
	};

	addNodesToGraph(laborForceVals, 'laborForce', graph);
	addNodesToGraph(barrierVals, 'barrier', graph);
	addNodesToGraph(employmetVals, 'employment', graph);
	addNodesToGraph(industryVals, 'industry', graph);


	//add links

	barrierVals.forEach((d)=>{
		if(!graph.links['Not in labor force-laborForce']){
			graph.links['Not in labor force-laborForce'] = {};
		}
		graph.links['Not in labor force-laborForce'][d + '-barrier'] = 0;
	});

	employmetVals.forEach((d)=>{
		if(!graph.links['Labor force-laborForce']){
			graph.links['Labor force-laborForce'] = {};
		}
		graph.links['Labor force-laborForce'][d + '-employment'] = 0;
	});

	industryVals.forEach((d)=>{
		if(!graph.links['employed-employment']){
			graph.links['employed-employment'] = {};
		}
		graph.links['employed-employment'][d + '-industry'] = 0;
	});

	barrierVals.forEach((d)=>{
		if(!graph.links['unemployed-employment']){
			graph.links['unemployed-employment'] = {};
		}
		graph.links['unemployed-employment'][d + '-barrier'] = 0;
	});

	industryVals.forEach((d)=>{
		if(!graph.links[d + '-industry']){
			graph.links[d + '-industry'] = {};
		}
		barrierVals.forEach((e)=>{
			graph.links[d + '-industry'][e + '-barrier'] = 0;
		});
	});

	data.forEach((row)=>{
		columns.forEach((d)=>{
			var val = row[d];
			var node = graph.nodes[val + '-' + d];
			if(node){
				node.value = node.value + parseFloat(row.weight);
			} 
		});

		columnLinks.forEach((cl)=>{
			var source = cl[0];
			var target = cl[1];
			var linksObj = graph.links[row[source] + '-' + source];

			if(linksObj){
				var linkVal = linksObj[row[target] + '-' + target];
				if(linkVal !== undefined){
					linksObj[row[target] + '-' + target] =
						linksObj[row[target] + '-' + target] + parseFloat(row.weight);
				}
			}
		});
	});

	/*industryVals.forEach((d)=>{
		if(!graph.links[d + '-industry']){
			graph.links[d + '-industry'] = {};
		}
		barrierVals.forEach((e)=>{
			graph.links[d + '-industry'][e + '-barrier'] = 0;
		});
	});*/

	var nodesArr = [];

	var index = 0;
	for(let i in graph.nodes){
		nodesArr.push(graph.nodes[i]);
		graph.nodes[i].index = index++;
	}

	var linksArr = [];
	for(let i in graph.links){
		var linksObj = graph.links[i];
		var source = graph.nodes[i].index;
		for(let j in linksObj){
			var newLinkObj = {
				value : linksObj[j],
				source : source,
				target : graph.nodes[j].index
			};
			linksArr.push(newLinkObj);
		}
	}

	var sankeyGraph = {nodes : nodesArr, links : linksArr};

	return sankeyGraph;
}

function addNodesToGraph(nodesArr, col, graph){
	nodesArr.forEach(function(d){
		graph.nodes[d + '-' + col] = {col : col, name : d, value : 0};
	});
}

function createGradSankey(){
	state.currData = state.originalData.filter((d)=>d.education === "Graduation" || d.education === "Masters or above");
	state.currTotalWeight = state.currData.reduce((a,d)=>a + parseFloat(d.weight),0);

	var res = getLabourForceGraph(state.currData);
	sankey.update(res);
}

function createIntermediateSankey(){
	state.currData = state.originalData;
	state.currTotalWeight = state.currData.reduce((a,d)=>a + parseFloat(d.weight),0);

	var res = getLabourForceGraph(state.currData);
	sankey.update(res);
}