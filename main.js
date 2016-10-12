function intialize() {
	
	// For the graph
	var margin = {top: 50, right: 30, bottom: 50, left: 50};
	var width = 960 - margin.left - margin.right;
	var height = 540 - margin.top - margin.bottom;

	//For X-Axis functions
	var xScale = d3.scale.linear().range([0, width]);
	var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
	
	//For Y-Axis functions 
	var yScale = d3.scale.linear().range([height,0]);
	var yAxis = d3.svg.axis().scale(yScale).orient("left");
}

intialize()