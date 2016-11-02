function circleHover(d, circle, tooltip){
	
	// Color transition
	circle.transition().duration(200)
		.style("fill", "black");
	
	// Opacity transition
	tooltip.transition().duration(200)
			.style("opacity", 0.9);
	
	// HTML Text in the label
	var html_text = "";
	var html_total = "<strong>Total: </strong>";
	var html_span = "<span style = 'color: " + d.color + "'>" + d.total + "</span>";
	var tooltip_gap = 20;
	
	html_text = html_total + html_span;
	
	if("profit" in d){
		
		var overall_profit_color = d.overall_profit < 0 ? "red" : "green";
		
		var html_profit = "<br><strong>Profit: </strong><span style = 'color: " + d.color + "'>" + d.profit + "</span>";
		var html_overall_profit = "<br><strong>Overall: </strong><span style = 'color: " + overall_profit_color + "'>" + d.overall_profit + "</span>";
		html_text += html_profit + html_overall_profit;
		
		tooltip_gap = 50
	}
	
	// Add HTML Text to Tooltip
	tooltip.html(html_text)
	.style("left", (d3.event.pageX - 15) + "px")
	.style("top", (d3.event.pageY - tooltip_gap) + "px");
}

function clickCircle(d,i){
	
	// Select the #Week DOM
	var week = d3.select("#week").style("display","inline");
	week.select("h4").html("Week " + (i+1));

	// Get all the keys 
	var keys = d3.keys(d);

	// Filter keys and get the necessary key-value pairs
	var week_stat =[];

	keys.forEach(function(key){
		
		if(key == "total"){
			var string = key[0].toUpperCase() + key.substring(1) + ": ";
			string = string.toUpperCase();
			week_stat.push({"string": string, "value": d[key]});
		}
		
		if(key.search(/day/i) != -1){
			var day = key[0].toUpperCase() + key.substring(1) + ": ";
			day = day.toUpperCase();
			week_stat.push({"string": day, "value": Math.round(d[key])});
		}
	});
	
	// Get average and insert it after Total
	var average = { "string": "AVERAGE:", "value": Math.round(d.total/(week_stat.length - 1)) };
	week_stat.splice(1, 0, average);

	// Remove the existing list, if any
	week.select("ul").remove();

	var list = week.append("ul");
	list.selectAll("li")
		.data(week_stat)
		.enter()
		.append('li')
		.style("margin", "10px")
		.style("font-size", "small")
		.style("text-align", "left")
		.html(function(d,i){
			
			var html_first = "<span>" + d.string + "</span>";
			var html_second = "<span style='color: green'>" + d.value + "</span>";
			
			return html_first + html_second;
			
		});
					
}

function drawCircles(svg, data, class_name, xMap, yMap, tooltip) {
	
	var height = "20px";
	var width = "60px";
	var tooltip_gap = 28
	
	var circles = svg.selectAll("." + class_name).data(data);
	
	circles.enter().append("circle")
			.attr("class", class_name)
			.attr("r", 4)
			.attr("cx", xMap)
			.attr("cy", yMap)
			.attr("fill", function(d) { return d.color; } )
			.style("opacity", 0.5)
			.on("mouseover", function(d) { 
				
				var circle = d3.select(this);
				circleHover(d,circle, tooltip);
				
			})
			.on("mouseout", function(d) {
		
				d3.select(this).transition().duration(0)
					.style("fill", function (d) {
						return d.color; 
				})
				
				tooltip.transition().duration(200).style("opacity", 0);
			})
			
			.on("click", function(d,i) { clickCircle(d,i);});
			
	return;
}

function drawLine(svg, data, class_name, valueline, color) {
	
	// Draw the path
	var path = svg.append("path")
				.attr("class", class_name)
				.attr("d", valueline(data))
				.attr("stroke", color)
				.attr("stroke-width", 2)
				.attr("fill", "none")
				.style("opacity", 0.5);
			
	
	// Get total length of the path 
	var totalLength = path.node().getTotalLength();
	
	// Animate the drawn path
	path.attr("stroke-dasharray", totalLength + " " + totalLength)
		.attr("stroke-dashoffset", totalLength)
		.transition()
        .duration(2000)
		.ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0)
		.on("end", function(){
			
			svg.selectAll(".legend").transition()
			.duration(1000)
			.style("opacity",1);
			
			svg.select("#legend-box").transition()
				.duration(500)
				.style("opacity", 1);
				
			d3.select("#stats").transition().duration(200).style("opacity",1);
			d3.select("#entry").transition().duration(200).style("opacity",1);
				
		});
}

function getStats(full_data){
	
	// Statistical variables
	var total_spent = d3.sum(full_data, function(d){ return d.total; });
	var weekly_average = Math.round(total_spent/full_data.length);
	var max_exepense = d3.max(full_data, function(d) { return d.total; });
	var min_expense = d3.min(full_data, function(d) { return d.total; });
	
	// Store the strings in a JSON Array 
	var html_list = [
		{"string":"TOTAL: ", "amt": total_spent},
		{"string":"AVERAGE: ", "amt": weekly_average},
		{"string":"MINIMUM: ", "amt": min_expense},
		{"string":"MAXIMUM: ", "amt": max_exepense }
	];
	
	// Append to list 
	var list = d3.select("#stats").append("ul");
	
	// Append all the data to the list
	list.selectAll("li")
		.data(html_list)
		.enter()
		.append('li')
		.style("margin", "10px")
		.style("font-size", "small")
		.style("text-align", "left")
		.html(function(d) {
			
			var html_first = "<span>" + d.string + "</span>";
			var html_second = "<span style='color: green'>" + d.amt + "</span>";
			
			return html_first + html_second;
			
		});
}

function legendEffect(d, hover){
	
	// Extract text from data 
	var text = d.text;
	
	// Variables affected 
	var opacity = 0.5;
	var radius = 4
	
	// Set opacity value depending on hovering or not
	if(hover) {
		
		opacity = 1;
		radius = 6;
		
	}
	
	switch(text){
		
		case "Overbudget": {
			
			var red_circles = d3.selectAll(".full").filter( 
				function() { return d3.select(this).attr("fill") == "red"; 
			});
			
			red_circles.transition().duration(200)
				.attr("r", radius)
				.style("opacity", opacity);
			
			break;
			
		}
			
		case "Full week": {
			
			var blue_circles = d3.selectAll(".full").filter(
				function() { return d3.select(this).attr("fill") == "blue";
			});
				
			blue_circles.transition()
				.duration(200)
				.attr("r", radius)
				.style("opacity", opacity);

			break;
		}
			
		case "Weekdays": {
				
			d3.selectAll(".weekdays").transition()
				.duration(200)
				.attr("r", radius)
				.style("opacity", opacity);
				
			break;
			
		}
		
	}
}

function drawLegend(svg, width, height) {
	
	// Create legend box
	svg.append("rect")
		.attr("id", "legend-box")
		.attr("x", 15)
		.attr("y", height - 85)
		.attr("width", 120)
		.attr("height", 80)
		.style("opacity", 0);
	
	// Give array
	var legend_data = [ { "color": "red", "text":"Overbudget"}, 
						{"color":"blue", "text":"Full week"}, 
						{"color": "#B8860B", "text":"Weekdays"}];
	
	// Draw Legend
	var legend = svg.selectAll(".legend")
					.data(legend_data)
					.enter().append("g")
					.attr("class", "legend")
					.style("opacity",0)
					.attr("transform", function(d, i) { 
						return "translate(" + (-width + 40) + "," + (i * 25 + (height - 80)) + ")"; 
					});
					
	// Draw legend colored rectangles
	legend.append("rect")
		.attr("x", width - 18)
		.attr("width", 18)
		.attr("height", 18)
		.style("fill", function(d) { return d.color; });
		
	// Add Text 
	legend.append("text")
		.attr("x", width + 12)
		.attr("y", 10)
		.attr("dy", ".35em")
		.style("font-size", "small")
		.style("text-anchor", "start")
		.text(function(d) { return d.text ;});
		
	legend.on("mouseover", function(d) {
			
			d3.select(this).style("font-weight", "bold")
				.style("font-size", "12px");
				
			legendEffect(d, true);
			
		}).on("mouseout", function(d) {
			d3.select(this).style("font-weight", "normal")
				.style("font-size", "small");
			
			legendEffect(d, false);
			
		});
		
}

function plotScatter(full_data, weekdays_data, budget) {
	
	// Get the maximum spent in a week and round to nearest 50
	var week_max = Math.max.apply(Math,full_data.map(function(week){return week.total;}));
	week_max = Math.round(week_max / 10) * 10;
	
	// Number of ticks
	var x_ticks = full_data.length;
	var y_ticks = week_max/50;
	
	// For the graph
	var margin = {top: 50, right: 30, bottom: 60, left: 100};
	var width = 960 - margin.left - margin.right;
	var height = 540 - margin.top - margin.bottom;
	
	// Plot X-Axis values 
	var xScale = d3.scaleLinear().range([0, width]);
	var xAxis = d3.axisBottom().scale(xScale).ticks(x_ticks);
	var xValue = function(data) { return data.week_number;}
	var xMap = function(data) { return xScale(xValue(data));}
	
	// Grid lines for X-Axis 
	xAxis.tickSizeInner(-height).tickSizeOuter(0).tickPadding(10);
	
	// Plot Y-Axis values
	var yScale = d3.scaleLinear().range([height,0]);
	var yAxis = d3.axisLeft().scale(yScale).ticks(y_ticks);
	var yValue = function(data) { return data["total"]; }
	var yMap = function(data) { return yScale(yValue(data)); }
	
	// Grid lines for Y-Axis
	yAxis.tickSizeInner(-width).tickSizeOuter(0).tickPadding(10);
	
	// Prepare Tooltip
	var tooltip = d3.select("body").append("div")
			.attr("class", "tooltip")				
			.style("opacity", 0);
	
	// Prepare domain for X-Axis and Y-Axis
	xScale.domain([1, x_ticks]);
	yScale.domain([0, week_max]);
	
	// Add graph to the canvas of the webpage
	var svg = d3.select("#chart").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				
	// Adding Background color
	svg.append("rect")
		.attr("width", width)
		.attr("height", height)
		.attr("fill", "#FFFFE0");
	
	// Plot X-Axis 
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);
		
	svg.append("text")
		.attr("class", "label")
		.attr("transform", "translate(" + (width/2) + "," + ( height + 50) + ")")
		.style("font-size", "13px")
		.style("font-weight", "bold")
		.style("text-anchor", "middle")
		.text("Week Number");
		
	// Plot Y-Axis 
	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis);
		
	svg.append("text")
		.attr("class", "label")
		.attr("transform", "translate("+ -70 +","+(height/2)+")rotate(-90)")
		.attr("dy", ".71em")
		.style("font-size", "13px")
		.style("font-weight", "bold")
		.style("text-anchor", "middle")
		.text("Total Expenses");
	
	// Add Title
	svg.append("text")
        .attr("x", (width / 2) + 10)     
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "13px")
		.style("font-weight", "bold")
        .style("text-decoration", "underline")
        .text("Weekly Expenses");
		
	// Draw budget line 
	svg.append("line")
		.style("stroke","red")
		.style("stroke-width", 2)
		.attr("class", "budget")
		.attr("x1", xScale(1))
		.attr("y1", yScale(budget))
		.attr("x2", xScale(x_ticks))
		.attr("y2", yScale(budget))
		.style("opacity", 0.5);
		
	// Define the line first 
	var valueline = d3.line()
					.x(function(data) { return xScale(data.week_number); })
					.y(function(data) { return yScale(data.total); });
					
	// Draw Legend
	drawLegend(svg, width, height);
	
	// Get Statistics
	getStats(full_data);
					
	// LINE PLOT  
	drawLine(svg, full_data, "full_line", valueline, "blue");
	drawLine(svg, weekdays_data, "weekdays_line", valueline, "#B8860B");
	
	// SCATTER PLOT 
	drawCircles(svg, full_data, "full", xMap, yMap, tooltip)
	drawCircles(svg, weekdays_data, "weekdays", xMap, yMap, tooltip)
	
				
	return; 
		
}

function plotBar(full_data){
	
	// Get the keys from the JSON Array and splice keys to keep days
	var keys = d3.keys(full_data[0]);
	keys.splice(0,5);
	
	// Array to store dictionary of keys 
	var daily_total = [];
	
	keys.forEach(function(key){
		
		var total = d3.sum(full_data, function(d) { return d[key]; });
		total = Math.round(total);
		key = key[0].toUpperCase() + key.substring(1);
		daily_total.push({"day": key, "amt": total});
		
	});
	
	// Get the total highest amount spent in a day and round to nearest 50 
	var daily_max = Math.max.apply(Math,daily_total.map(function(day){return day.amt;}));
	daily_max = Math.round(daily_max / 50) * 50;

	// For the Bar Chart
	var margin = {top: 130, right: 30, bottom: 60, left: 100};
	var width = 960 - margin.left - margin.right;
	var height = 540 - margin.top - margin.bottom;
	
	// Number of ticks
	var x_ticks = daily_max.length;
	var y_ticks = Math.round(daily_max/50);
	
	// Plot X-Axis values 
	var xScale = d3.scaleBand().rangeRound([0, width]).padding(0.05);
	var xAxis = d3.axisBottom().scale(xScale).ticks(x_ticks);
	
	// Plot Y-Axis values
	var yScale = d3.scaleLinear().range([height,0]);
	var yAxis = d3.axisLeft().scale(yScale).ticks(y_ticks);
	
	// Prepare domain for X-Axis and Y-Axis
	xScale.domain(daily_total.map(function(d) { return d.day; }));
	yScale.domain([0, daily_max]);
	
	// Prepare tooltip for bar chart 
	var tooltip = d3.select("body").append("div").attr("class", "barTip");
	
	// Draw SVG
	var svg = d3.select("#barChart").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
				
	// Plot X-Axis 
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);
		
	svg.append("text")
		.attr("class", "label")
		.attr("transform", "translate(" + (width/2) + "," + ( height + 50) + ")")
		.style("font-size", "13px")
		.style("font-weight", "bold")
		.style("text-anchor", "middle")
		.text("Day");
		
	// Plot Y-Axis 
	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis);
		
	svg.append("text")
		.attr("class", "label")
		.attr("transform", "translate("+ -70 +","+(height/2)+")rotate(-90)")
		.attr("dy", ".71em")
		.style("font-size", "13px")
		.style("font-weight", "bold")
		.style("text-anchor", "middle")
		.text("Total");
		
	// Draw the bars
	svg.selectAll(".bar")
		.data(daily_total)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", function(d) { return xScale(d.day); })
		.attr("y", function(d) { return yScale(d.amt); })
		.attr("width", xScale.bandwidth())
		.attr("height", function(d) { return height - yScale(d.amt); })
		.style("opacity", 0)
		.on("mousemove", function(d) {
			
			d3.select(this).style("fill", "brown");
			var html_text = "<strong>Total:</strong> <span style='color:red'>" + d.amt + "</span>"
			
			tooltip.style("left", d3.event.pageX - 50 + "px")
					.style("top", d3.event.pageY - 70 + "px")
					.style("display", "inline-block")
					.html(html_text);
					
        }).on("mouseout", function(d) {
			
			d3.select(this).style("fill","steelblue");
			tooltip.style("display", "none");
		});
}

function prepModal(number){
	
	// Prepare array of days
	var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	
	// Get today's day number 
	var current_day = new Date().getDay();
	
	// If it is monday (1), increment number
	number = current_day == 1 ? number++ : number;
	
	// Add week number in Modal
	d3.select("#weekNum").html(number);
	
	// Add current day in Modal 
	d3.select("#day").html(days[current_day]);
}

function ajaxRequests(){
	
	// Handle requests from FORM via AJAX
	$(function() {
		$('#newInput').submit(function() {
			var reply = $.post( "/test", $(this).serialize() );
			document.getElementById('newInput').reset();
			return false;
		}); 
	})
	
	
}
				
function preProcess(error, data){
	
	//If error, then throw error 
	if(error) throw error;
	
	// Initialize variables
	weeks_array = [];
	weekdays_array = [];
	
	// Transferring from csv file to dictionary
	data.forEach( function(d){
		
		
		// Make a JSON out of the statistics
		week_stat = { "week_number": +d.week, "profit": +d.weekly_profit, "overall_profit": +d.overall_profit, 
					"color": d.week_color,"total": +d.week_total, "monday": +d.monday, "tuesday": +d.tuesday, 
					"wednesday": +d.wednesday, "thursday": +d.thursday, "friday": +d.friday, "saturday": +d.saturday, 
					"sunday": +d.sunday};
		
		weekdays_stat = { "week_number": +d.week, "color": d.weekdays_color, "total": +d.weekdays_total,
						"monday": +d.monday, "tuesday": +d.tuesday, "wednesday": +d.wednesday,
						"thursday": +d.thursday, "friday": +d.friday};
		
		// Store them
		weeks_array.push(week_stat);
		weekdays_array.push(weekdays_stat);
	});
	
	prepModal(weeks_array.length);
	plotScatter(weeks_array, weekdays_array, 200);
	plotBar(weeks_array);
	ajaxRequests();
	
	return
}

function scrolling(){

	if(document.body.scrollTop > 175){
		d3.select("#barChart").transition().duration(200).style("opacity", 1);
	} else {
		d3.select("#barChart").transition().duration(200).style("opacity", 0.5);
	}
	
	if(document.body.scrollTop > 275){
		d3.selectAll(".bar").transition().duration(200).style("opacity", 1);
		d3.select("#chart").transition().duration(200).style("opacity", 0.5);
	} else {
		d3.selectAll(".bar").transition().duration(200).style("opacity", 0);
		d3.select("#chart").transition().duration(200).style("opacity", 1);
	}
}

(function(){
	
	d3.queue()
		.defer(d3.csv, "/load")
		.await(preProcess);
})();