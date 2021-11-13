// set the dimensions and margins of the graph
const padding = {top: 70, right: 50, bottom:50, left:60};

const WestCol = "#0B1279" ;
const OthCol = "lightgrey";

// x Axis
const x = d3.scaleTime().domain(d3.extent(data.all_ulev, function(d) { return new Date(d.quarter); })).range([ padding.left, width - padding.right]);
const xAxis = d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%Y-%m"));
svg.append("g")
  .attr("class", "axis x")
  .attr("transform", "translate(0," + (height-padding.bottom) + ")");
  
// y Axis
const y = d3.scaleLinear().domain([0, d3.max(data.all_ulev, function(d) { return +d.count; })]).range([ height - padding.bottom, padding.top ]);
const yAxis = d3.axisLeft(y);
svg.append("g")
  .attr("class", "axis y")
  .attr("transform", "translate(" + padding.left + ", 0)");
  
function update(data_arg){
  // Create the X axis:

  svg.selectAll(".x").transition()
    .duration(3000)
    .call(xAxis);

  // create the Y axis
  svg.selectAll(".y")
    .transition()
    .duration(3000)
    .call(yAxis);
    
    
  // Draw the line
  svg.selectAll(".allline")
    .data([data_arg], function(d){return d})
    .join("path")
      .attr("class", function(d){return d[0].split(" ").join("") + " alllines"})
      .attr("fill", "none")
      .attr("stroke", function(d,i){
        return (d[0] == "Westminster" ? WestCol : OthCol);
      })
      .attr("stroke-width", 1)
      .attr("d", function(d){
        return d3.line()
          .x(function(d) { 
            //console.log(x(d.quarter));
            return x(new Date(d.quarter)); 
          })
          .y(function(d) { 
            //console.log(x(d.count));
            return y(d.count); 
          })

          (d[1])
      })
    
}


//console.log(d3.group(data.all_ulev, d => d.borough));

data.all_ulev = d3.group(data.all_ulev, d => d.borough);

update(data.all_ulev);

d3.select("#htmlwidget_container")
  .append("button")
  .attr("id", "testbutton")
  .style("position", "absolute")
  .style("display", "inline-block")
  .style("color", "darkblue")
  .style("top", 55 + "px")
  .style("left", 60 + "px")
  .html("Test Button")
  .on("click", function(){
    update(d3.group(data.all_bev, d => d.borough))
  })


