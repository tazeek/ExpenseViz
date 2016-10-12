// For the graph
var margin = {top: 50, right: 30, bottom: 50, left: 50};
var width = 960 - margin.left - margin.right;
var height = 540 - margin.top - margin.bottom;

//For X-Axis functions
var xScale = d3.scale.linear().range([0, width]);
var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(20);

//For Y-Axis functions 
var yScale = d3.scale.linear().range([height,0]);
var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(20);

//Add graph to the canvas of the webpage
var svg = d3.select("body").append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				
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
		
		for(x in keys) { 
			sum += +d[keys[x]];
		}
		
		// Round up the sum 
		sum = Math.round(sum);
		
		// Calculate profit
		profit = budget - sum;
		
		// Make a JSON out of the statistics
		week_stat = { "week_number": +d.week, "total": sum, "profit": profit };
		
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
	
	console.log(weeks_array)

	return
});

//python -m http.server 8000 --bind 127.0.0.1