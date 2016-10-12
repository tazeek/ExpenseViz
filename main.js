// For the graph
var margin = {top: 20, right: 20, bottom: 30, left: 40};
var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

//Add graph to the canvas of the webpage
var svg = d3.select("body").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
			
function plotScatter(data) {
	
	// Plot X-Axis values 
	var xScale = d3.scale.linear().range([0, width]);
	var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(20);
	var xValue = function(d) { return d.week_number;}
	var xMap = function(d) { return xScale(xValue(d));}
	
	// Plot Y-Axis values
	var yScale = d3.scale.linear().range([height,0]);
	var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(20);
	var yValue = function(d) { return d.total; }
	var yMap = function(d) { return yMap(yValue(d)); }
	
	// Prepare domain for X-Axis and Y-Axis
	xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
	yScale.domain([0, d3.max(data, yValue)+1]);
	
	// Plot X-Axis first 
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
		.append("text")
		.attr("class", "label")
		.attr("x", width)
		.attr("y", -6)
		.style("text-anchor", "end")
		.text("Week Number");
		
	// Plot Y-Axis next 
	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("class", "label")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Total");
		
}
				
// Load the data 
// NOTE: This is the function to be replaced by Python's Flask
// NOTE: Refer to example.py for data processing
d3.csv("expense.csv", function(error, data){
	
	// Get Keys and remove 'week' from the keys
	keys = d3.keys(data[0]);
	keys.shift();
	
	// Array to store the data 
	weeks_array = []
	budget = 200
	
	// Turn "String" into integers
	data.forEach( function(d){
		
		// Calculate total
		var sum = 0
		var color = "blue"
		
		for(x in keys) { 
			sum += +d[keys[x]];
		}
		
		//Give color to the values
		if(sum > budget) {
			color = "red"
		}
		
		// Round up the sum 
		sum = Math.round(sum);
		
		// Calculate profit
		profit = budget - sum;
		
		// Make a JSON out of the statistics
		week_stat = { "week_number": +d.week, "total": sum, "profit": profit, "color": color };
		
		weeks_array.push(week_stat);
	});
	
	// Calculate overall profit
	for(x in weeks_array) {
		week_json = weeks_array[x];
		
		//First week 
		if(x == 0){
			overall_profit = week_json.profit
		} else {
			//Based on previous week's overall 
			overall_profit = week_json.profit + weeks_array[x-1].overall_profit
		}
		
		// Store as new Key-value pair
		week_json["overall_profit"] = overall_profit
	}
	
	plotScatter(weeks_array)

	return
});

//python -m http.server 8000 --bind 127.0.0.1