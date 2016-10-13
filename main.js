function plotScatter(full_data, weekdays_data, budget) {
	
	// Get the maximum spent in a week and round to nearest 10
	var week_max = Math.max.apply(Math,weeks_array.map(function(week){return week.total;}))
	var week_max = Math.round(week_max / 10) * 10
	
	// Number of ticks
	var x_ticks = full_data.length
	var y_ticks = week_max/20
	
	// For the graph
	var margin = {top: 20, right: 20, bottom: 30, left: 40};
	var width = 960 - margin.left - margin.right;
	var height = 500 - margin.top - margin.bottom;
	
	// Plot X-Axis values 
	var xScale = d3.scale.linear().range([0, width]);
	var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(x_ticks).innerTickSize(-height);
	var xValue = function(data) { return data.week_number;}
	var xMap = function(data) { return xScale(xValue(data));}
	
	// Plot Y-Axis values
	var yScale = d3.scale.linear().range([height,0]);
	var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(y_ticks).innerTickSize(-width);
	var yValue = function(data) { return data["total"]; }
	var yMap = function(data) { return yScale(yValue(data)); }
	
	// Prepare domain for X-Axis and Y-Axis
	xScale.domain([0, x_ticks]);
	yScale.domain([0, week_max]);
	
	//Add graph to the canvas of the webpage
	var svg = d3.select("body").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
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
		
	// Draw budget line 
	svg.append("line")
		.style("stroke","red")
		.attr("x1", xScale(0))
		.attr("y1", yScale(budget))
		.attr("x2", xScale(x_ticks))
		.attr("y2", yScale(budget));
		
	// Define the line first 
	var valueline = d3.svg.line()
					.x(function(data) { return xScale(data.week_number); })
					.y(function(data) { return yScale(data.total); });
	
	// LINE PLOTS STARTS HERE 
						
	// Draw the line (Full week)
	svg.append("path")
		.attr("class", "full_line")
        .attr("d", valueline(full_data))
		.attr("stroke", "steelblue")
		.attr("stroke-width", 2)
		.attr("fill", "none");
		
	// Draw the line (Weekdays only)
	svg.append("path")
		.attr("class", "weekdays_line")
		.attr("d", valueline(weekdays_data))
		.attr("stroke", "green")
		.attr("stroke-width", 2)
		.attr("fill", "none");
		
	// LINE PLOTS ENDS HERE
	
	// SCATTER PLOT STARTS HERE
	
	//Full week circles 
	svg.selectAll(".full")
		.data(full_data)
		.enter().append("circle")
		.attr("class", "full")
		.attr("r", 3.5)
		.attr("cx", xMap)
		.attr("cy", yMap)
		.style("fill", function(d) { return d.color; } );
		
	// Weekdays circles 
	svg.selectAll(".weekdays")
		.data(weekdays_data)
		.enter().append("circle")
		.attr("class", "weekdays")
		.attr("r", 3.5)
		.attr("cx", xMap)
		.attr("cy", yMap)
		.style("fill", function(d) { return d.color; });
		
	// SCATTER PLOT ENDS HERE 
		
		
	return 
		
}
				
// Load the data 
// NOTE: This is the function to be replaced by Python's Flask
// NOTE: Refer to example.py for data processing
d3.csv("expense.csv", function(error, data){
	
	// Get Keys and remove 'week' from the keys
	keys = d3.keys(data[0]);
	keys.shift();
	
	// Initialize variables
	weeks_array = [];
	weekdays_array = [];
	weekends = ["saturday","sunday"];
	budget = 200;
	
	// Transferring from csv file to dictionary
	data.forEach( function(d){
		
		// Calculate total
		var full_sum = 0;
		var weekdays_sum = 0;
		
		var full_color = "blue";
		var weekdays_color = "green";
		
		for(x in keys) { 
			full_sum += +d[keys[x]];
			
			if(!weekends.includes(keys[x])) {
				weekdays_sum += +d[keys[x]];
			}
		}
		
		//Give color to the values
		if(full_sum > budget) {
			full_color = "red";
		}
		
		if(weekdays_sum > budget) {
			weekdays_color = "red";
		}
		
		// Round up the sum 
		full_sum = Math.round(full_sum);
		weekdays_sum = Math.round(weekdays_sum);
		
		// Calculate profit
		profit = budget - full_sum;
		
		// Make a JSON out of the statistics
		week_stat = { "week_number": +d.week, "total": full_sum, "profit": profit, "color": full_color };
		weekdays_stat = { "week_number": +d.week, "total": weekdays_sum, "color": weekdays_color };
		
		// Store them
		weeks_array.push(week_stat);
		weekdays_array.push(weekdays_stat);
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
	
	plotScatter(weeks_array, weekdays_array, budget);
	
	return
});

//python -m http.server 8000 --bind 127.0.0.1