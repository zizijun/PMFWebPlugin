function displaySNHoWResults(root) {
	force.gravity(.05)
		.linkDistance(150)
		.charge(-800);

	var r = 30, s = 50;

	svgg.selectAll("*").remove();

	svgg.append("svg:defs").append("marker")
		.attr("id", "arrowhead")
		.attr("refX", 17 + 3) //must be smarter way to calculate shift
		.attr("refY", 2)
		.attr("markerWidth", 6)
		.attr("markerHeight", 4)
		.attr("orient", "auto")
		.append("path")
		.attr("d", "M 0,0 V 4 L6,2 Z"); //this is actual shape for arrowhead


	link = svgg.append('svg:g').selectAll(".link");
	node = svgg.append('svg:g').selectAll(".node");

	var nodes = root.nodes;
	var links = root.links;

	// Restart the force layout
	force.nodes(nodes)
		.links(links)
		.start();

	// Update the links…
	link = link.data(links);

	// Exit any old links.
	link.exit().remove();

	// Enter any new links.
	link.enter().insert("line", ".node")
    	.attr("class", "link")
    	.attr("x1", function(d) { return d.source.x; })
    	.attr("y1", function(d) { return d.source.y; })
    	.attr("x2", function(d) { return d.target.x; })
    	.attr("y2", function(d) { return d.target.y; })
    	.attr("marker-end", "url(#arrowhead)");
	
	// Update the nodes…
	node = node.data(nodes);

	// Exit any old nodes.
	node.exit().remove();

	var drag = force.drag()
  				.on("dragstart", function(d,i){
  					//拖拽开始后设定被拖拽对象为固定
  					// solve zoom and drag conflict
  					d3.event.sourceEvent.stopPropagation();
	  				d.fixed = true;
	  			})
	  			.on("dragend", function(d,i){
					d.fixed = ($('#dragchoice').val() == 0) ? false : true;
						d3.select(this).selectAll(".node").classed("fixed", d.fixed);
		  			});
  
	node.enter().append("svg:g")
	  	.attr("class", function(d){
			if (d.label == "Cluster") {
				return "cluster";
			} else {
				return "single";
			}
	     })
	     .call(drag);

	d3.selectAll(".cluster").append("rect")
	  	.attr("x", function(d) { return -s/2; })
		.attr("y", function(d) { return -s/2; })
		.attr("width", s)
		.attr("height", s)
		.attr("class", "node type"+0);

	d3.selectAll(".single").append("circle")
	  	.attr("r", r)
		.attr("class", "node type"+1);

	node.append("svg:text")
	    .attr("class", "node text")
	    .attr("dx", 0)
	    .attr("dy", ".50em")
	    .attr("text-anchor", "middle")
	    .text(function (d) {
	    	return d.name;
		});

	//标记鼠标悬停的标签
	node.append("title")
	    .text(function(d) {
			  return d.significance; 
	 });

	d3.select(window).on("resize", resize);
	//	
//	var nodes = root.nodes;
//	var edges = root.links;
//	
//	force.gravity(1)
//	.nodes(nodes)
//	.links(edges)
//	.linkDistance(150)
//	.charge(-3000)
//	.start();
//	
//	var svg_edges = svgg.selectAll("line")
//    .data(edges)
//    .enter()
//    .append("line")
//    .style("stroke","#ccc")
//    .style("stroke-width",1);
//	
//	var edges_text = svg.selectAll(".linetext")
//	.data(edges)
//	.enter()
//	.append("text")
//	.attr("class","linetext")
//	.text(function(d){
//		return d.significance;
//	});
//	
//	var svg_nodes = svgg.selectAll("circle")
//    .data(nodes)
//    .enter()
//    .append("circle")
//    .attr("r",10)
//    .style("fill",function(d,i){
//        if(d.label == "Node"){
//        	return "red";
//        }else{
//        	return "green";
//        }
//    });
//	
//	var drag = force.drag()
//    .on("dragstart", function (d,i) {
//    	d.fixed = true;
//        console.log("拖拽状态：开始");
//    })
//    .on("dragend", function () {
//        console.log("拖拽状态：结束");
//     })
//    .on("drag", function () {
//        console.log("拖拽状态：进行中");
//    });
//	svg_nodes.call(drag);
//	
//	force.on("tick",function () {
//        console.log("进行中");
//        svg_edges.attr("x1",function(d){ return d.source.x; });
//        svg_edges.attr("y1",function(d){ return d.source.y; });
//        svg_edges.attr("x2",function(d){ return d.target.x; });
//        svg_edges.attr("y2",function(d){ return d.target.y; });
//
//        svg_nodes.attr("cx",function (d) { return d.x; });
//        svg_nodes.attr("cy",function (d) { return d.y; });
//    });
	
	
}

function linkArc(d) {
	var dx = d.target.x - d.source.x,
    dy = d.target.y - d.source.y,
    dr = Math.sqrt(dx * dx + dy * dy);
	return "M" + 
    	d.source.x + "," + 
    	d.source.y + "A" + 
    	dr + "," + dr + " 0 0,1 " + 
    	d.target.x + "," + 
    	d.target.y;
}

function showResultInHM(result){
	var nodes = result.nodes;
	var links = result.links;
	var tmplinks = {};
	var nn = [];
	$.each(links, function(i, link){
		var tmp = Number(link.significance*1).toFixed(5);
		 tmplinks[link.source.index + "," + link.target.index] = tmp*1;
	});
	$.each(nodes, function(i, node){
		nn.push(node.name);
	});
	var ns = nodes.length;
	var s="[";
	for (var i=0; i<ns; i++) {
		for (var j=0; j<ns; j++) {
			var val;
			if (tmplinks[i+","+j] === undefined) {
				val = 0;
			} else {
				val = tmplinks[i+","+j];
			}
			s+=("["+i+","+j+","+val+"]");
			if (i!=ns-1 || j!=ns-1) {
				s+=",";
			}
		}
	}
	s+="]";
	var jsonMatrix = JSON.parse(s);
	showHeatMap('heatmap-chart', 'Relationship Between Performers', nn,  nn, 'Relationship Strength', jsonMatrix, '');
}

function showHeatMap(divId, titleText, xCat, yTitleText, seriesName, seriesData, unit) {
	var chart;
	chart = new Highcharts.Chart({
        
        chart: {
        	renderTo: divId,
            type: 'heatmap'
//            marginTop: 40,
//            marginBottom: 40
        },


        title: {
            text: titleText
        },
        subtitle: {
			text: 'Source: www.pmf.org'
		},
        xAxis: {
            categories: xCat
        },

        yAxis: {
            categories: yTitleText,
            title: null
        },

        colorAxis: {
            min: 0,
            minColor: '#FFFFFF',
            maxColor: Highcharts.getOptions().colors[0]
        },

        legend: {
            align: 'right',
            layout: 'vertical',
            margin: 0,
            verticalAlign: 'top',
            y: 25,
            symbolHeight: 320
        },

        tooltip: {
            formatter: function () {
                return '<b>' + "Relationship Strength " + '</b><br>' + '<b>' + "from " + this.series.xAxis.categories[this.point.x] +" to " + this.series.yAxis.categories[this.point.y] + '</b><br>' + this.point.value;
            }
        },
        
        credits: {
    		enabled: false // remove high chart logo hyper-link
    	},

        series: [{
            name: seriesName,
            borderWidth: 1,
            data: seriesData,
            dataLabels: {
                enabled: false,
                color: 'black',
                style: {
                    textShadow: 'none'
                }
            }
        }]

    });
}