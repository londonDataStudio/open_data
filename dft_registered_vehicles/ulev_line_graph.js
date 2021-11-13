
// set the dimensions and margins of the graph
let padding = {top: 70, right: 50, bottom:50, left:60};

//console.log(JSON.stringify(data));

const secondary_data = d3.group(data.all_bev, d => d.borough);
data = data.all_ulev


// group the data: I want to draw one line per group
const sumstat = d3.group(data, d => d.borough);
    

// Add X axis --> it is a date format
let x = d3.scaleTime()
  .domain(d3.extent(data, function(d) { return new Date(d.quarter); }))
  .range([ padding.left, width - padding.right]);
svg.append("g")
  .attr("class", "axis x")
  .attr("transform", "translate(0," + (height-padding.bottom) + ")")
  .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%Y-%m")));

// Add Y axis
let y = d3.scaleLinear()
  .domain([0, d3.max(data, function(d) { return +d.count; })])
  .range([ height - padding.bottom, padding.top ]);
svg.append("g")
  .attr("class", "axis y")
  .attr("transform", "translate(" + padding.left + ", 0)")
  .call(d3.axisLeft(y));
  
  
// gridlines in y axis function
function make_y_gridlines() {		
    return d3.axisLeft(y)
}

// add the Y gridlines
svg.append("g")			
    .attr("class", "grid")
    .attr("transform", "translate(" + padding.left + ", 0)")
    .call(make_y_gridlines()
        .tickSize(-width + padding.left + padding.right)
        .tickFormat("")
    )
  

const WestCol = "#0B1279"  ;
const OthCol = "lightgrey";

// Draw the line
svg.selectAll(".allline")
    .data(sumstat)
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
      
      
  
// Draw the line
/*svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", function(d){return d.borough.split(" ").join("") + " alllines"})
    .attr("cx", d => x(new Date(d.quarter)))
    .attr("cy", d => y(d.count))
    .attr("r", 1)*/

// create a tooltip

// remove previous tooltip
if (document.getElementById("onlytooltip") !== null){
  document.getElementById("onlytooltip").remove();
}

let tooltip = d3.select("#htmlwidget_container")
    .append("div")
    .attr("id", "onlytooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("pointer-events", "none")
    .style("background-color", "rgb(255,255,255,0.6)")
    //.style("border", "1px solid darkred")
    .style("font-size", "12px")
    .style("padding", "5px")
    .style("color", "darkblue")
    .style("display", "inline-block")
    .style("white-space" , "nowrap")
    .style("top", y(d3.max(data, function(d){return d.count})*0.95) + "px")
    .style("left", x(new Date("2012-01-01")) + "px")
    .html("<p id='ttlabels'><strong>Borough:</strong> <span id='ttname' style='color:black'></span><br/><strong>Date:</strong> <span id='ttdate' style='color:black'></span><br/><strong>Count:</strong> <span id='ttcount' style='color:black'></span></p>");

let toolcircle = svg.append("circle")
  .attr("id", "toolcircle")
  .attr("cx", width/2)
  .attr("cy", height/2)
  .attr("r", 3)
  .style("visibility", "hidden")
  .style("pointer-events", "none")

let voronoi = d3.Delaunay
  .from(data, d => x(new Date(d.quarter)), d => y(d.count))
  .voronoi([padding.left, padding.top, width, height - padding.bottom])
  
svg.selectAll('.voronoi')
      // Construct a data object from each cell of our voronoi diagram
      .data( data.map(function(d,i){ return({voronoi : voronoi.renderCell(i), borough : d.borough, count : d.count, quarter : d.quarter})  }))
      .attr("class", "voronoi")
      .join('path')
        .attr('d', d => d.voronoi)
        .style("fill", "none")
        .style("pointer-events", "all")
      .on("mouseover", function(e,d){
        
        svg.selectAll(".alllines")
           .attr("opacity", 0.2)
           
        //console.log(d.borough)
        svg.selectAll("."+d.borough.split(" ").join(""))
           .attr("stroke", d.borough == "Westminster" ? WestCol : "darkred")
           .attr("opacity", 1)
        
        document.getElementById("ttname").innerHTML = d.borough;  
        document.getElementById("ttdate").innerHTML = /\d\d\d\d-\d\d/.exec(d.quarter)[0];  
        document.getElementById("ttcount").innerHTML = d.count.toLocaleString();  
        document.getElementById("ttlabels").style.color = d.borough == "Westminster" ? WestCol : "darkred";
         
        tooltip.style("visibility", "visible")
          .transition()
          .duration(400)
          .ease(d3.easeCubicOut)
          .style("top", y(d3.max(data, function(d){return d.count})*0.95 ) + "px")
          .style("left", x(new Date("2012-01-01")) + "px")
          //.style("top", y(d.count) + "px")
          //.style("left", x(new Date(d.quarter)) + "px")
        
        toolcircle.style("visibility", "visible")
          .attr("cx", x(new Date(d.quarter)))
          .attr("cy", y(d.count))
        
      })
      .on("mouseout", function(e,d){
        
        svg.selectAll(".alllines")
           .attr("opacity", 1)
           
        //console.log(d.borough)
        svg.selectAll("."+d.borough.split(" ").join(""))
           .attr("stroke", d => d[0] == "Westminster" ? WestCol : OthCol)
           
        tooltip.style("visibility", "hidden")
        toolcircle.style("visibility", "hidden")
      })
      
      
// ------------ Title, Subtitle, Source, Axis ----------------- //

svg.append("text")
        .attr("x", padding.left)            
        .attr("y", padding.top/3)
        .attr("class", "title")
        .text("Licened Ultra Low Emission Vehicles in London Boroughs");
        
svg.append("text")
        .attr("x", padding.left)            
        .attr("y", padding.top/1.5)
        .attr("class", "title subtitle")
        .text("Based on data from the Department of Transport");

svg.append("text")
        .attr("x", width - padding.right)            
        .attr("y", height )
        .attr("text-anchor", "end") 
        .attr("class", "title source")
        .html("Data source: <a class='title source' href='https://www.gov.uk/government/statistical-data-sets/all-vehicles-veh01' target='_blank'>Department of Transport</a>");

svg.append("text")
        .attr("x", width/2)            
        .attr("y", height - padding.bottom/5 )
        .attr("text-anchor", "middle") 
        .attr("class", "title subtitle")
        .text("Date");
        
svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height/2)            
        .attr("y", 10 )
        .attr("text-anchor", "middle") 
        .attr("class", "title subtitle")
        .text("Licend Ultra Low Emission Vehicles");
        

function testalert(){
  console.log("works")
}        


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
    update(secondary_data)
  })
/*
if (window.location.hostname !== "localhost"){
svg.append("text")
        .attr("x", width/2)            
        .attr("y", height/2 )
        .attr("text-anchor", "middle") 
        .attr("class", "title subtitle")
        .text("Made with ♥ by Westminster Data Studio");
}
*/


// UPDATE GRAPH

// Create a function that takes a dataset as input and update the plot:
function update(data_arg) {
  console.log('should not run');
  // Create the X axis:
  x.domain(d3.extent(data_arg, function(d) { return new Date(d.quarter); }))
  svg.selectAll(".x").transition()
    .duration(3000)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.timeFormat("%Y-%m")));

  // create the Y axis
  y.domain([0, d3.max(data_arg, function(d) { return +d.count; })])
  svg.selectAll(".y")
    .transition()
    .duration(3000)
    .call(d3.axisLeft(y));

  // Create a update selection: bind to the new data
  svg.selectAll(".alllines")
    .data(secondary_data)
     // Updata the line
    .join("path")
    .attr("class","alllines")
    .transition()
    .duration(3000)
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






      
      