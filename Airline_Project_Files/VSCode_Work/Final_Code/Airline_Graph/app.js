var svgWidth = 1420;
var svgHeight = 550;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 150
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "PASSENGERS";

// function used for updating x-scale var upon click on axis label
function xScale(Clean_Largest_Airlines_USA_2, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(Clean_Largest_Airlines_USA_2, d => d[chosenXAxis]) * 0.68,
      d3.max(Clean_Largest_Airlines_USA_2, d => d[chosenXAxis]) * 16.0
    ])
    .range([0, width]);

  return xLinearScale;

}

function xScale2(Clean_Largest_Airlines_USA_2, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(Clean_Largest_Airlines_USA_2, d => d[chosenXAxis]) * 0.5,
      d3.max(Clean_Largest_Airlines_USA_2, d => d[chosenXAxis]) * 1.05
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "PASSENGERS") {
    var label = "Passengers:";
  }
  else {
    var label = "# of Passenger Miles";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -90])
    .html(function(d) {
      return (`${d.CARRIER_NAME}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, Operating_Revenue_in_thousands) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("Clean_Largest_Airlines_USA_2.csv", function(err, Clean_Largest_Airlines_USA_2) {
  if (err) throw err;

  // parse data
  Clean_Largest_Airlines_USA_2.forEach(function(data) {
    data.Passengers = +data.Passengers;
    data.Operating_Revenue_in_thousands = +data.Operating_Revenue_in_thousands;
    data.Passenger_Miles = +data.Passenger_Miles;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(Clean_Largest_Airlines_USA_2, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(Clean_Largest_Airlines_USA_2, d => d.Operating_Revenue_in_thousands)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(Clean_Largest_Airlines_USA_2)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.Operating_Revenue_in_thousands))
    .attr("r", 10)
    .attr("stroke", "black")
    .attr("fill", "red")
    .attr("opacity", ".5");

  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var hairLengthLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "PASSENGERS") // value to grab for event listener
    .classed("active", true)
    .text("Number of Passengers");

  var albumsLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "Passenger_Miles") // value to grab for event listener
    .classed("inactive", true)
    .text("# of Passenger Miles");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 60 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Operating Revenue (000s)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXaxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        if (chosenXAxis == "PASSENGERS") {
          xLinearScale = xScale(Clean_Largest_Airlines_USA_2, chosenXAxis);
        } else {xLinearScale = xScale2(Clean_Largest_Airlines_USA_2, chosenXAxis);
        }

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "Passenger_Miles") {
          albumsLabel
            .classed("active", true)
            .classed("inactive", false);
          hairLengthLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          albumsLabel
            .classed("active", false)
            .classed("inactive", true);
          hairLengthLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
});

/////////chart 2
d3.csv("Clean_Largest_Airlines_USA_2.csv").then(function(data3) {
  data3.forEach(function(d) {
    d.Operating_rev_per_passenger = +d.Operating_rev_per_passenger;
    
  })
});

var rev_per_passenger = []
  for (x in chart2_data)
  rev_per_passenger.push(chart2_data[x].Operating_rev_per_passenger)

var svg = d3.select(".chart2")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
svg.append("rect")
  .classed("bar", true) // for bonus
  .data(rev_per_passenger)
  .attr("width", 100)
  .attr("height", function(d) {
    return d * 10;
  })
  .attr("x", 0)
  .attr("y", 0);


/* d3.csv("Clean_Largest_Airlines_USA_2.csv", function(err, chart2_data) {
  if (err) throw err;

  // parse data
  chart2_data.forEach(function(data2) {
    data2.Passengers = +data2.Passengers;
    data2.Operating_Revenue_in_thousands = +data2.Operating_Revenue_in_thousands;
    data2.Passenger_Miles = +data2.Passenger_Miles
    data2.Operating_rev_per_passenger = +data2.Operating_rev_per_passenger;
  });  */
/* var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`)
  .classed("bar", true) // for bonus
  .data(rev_per_passenger)
  .attr("width", 100)
  .attr("height", function(d) {
    return d * 10;
  })
  .attr("x", 0)
  .attr("y", 0);
 */

