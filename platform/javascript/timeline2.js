var width = 960,
    height = 500;

var rectangle_width = 100,
    rectangle_height = 50;

var event_counter = 0;

var timeline_svg = d3.select("#timeline-container").append("svg")
    .attr("width", width)
    .attr("height", height);

timeline_svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "white")
    .on("mousedown", mousedown);

//Taken from d3.gantt By Dimitry Kudrayvtsev
//START WORKING HERE -AT
var margin = { //MAY NEED TO ADJUST
    top : 20,
    right : 40,
    bottom : 20,
    left : 150
};
var timeDomainStart = d3.time.day.offset(new Date(),-3);
var timeDomainEnd = d3.time.hour.offset(new Date(),+3);
var timeDomainMode = "fixed";
var tickFormat = "%H:%M";
var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickFormat)).tickSubdivide(true)
        .tickSize(8).tickPadding(8);
var yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);
var x = d3.time.scale().domain([ timeDomainStart, timeDomainEnd ]).range([ 0, width ]).clamp(true);
var y = d3.scale.ordinal().rangeRoundBands([ 0, height - margin.top - margin.bottom ], .1); //SET DOMAIN
var timeDomain = 10; //ARBITRARY LENGTH FOR INITIAL TIMELINE, CHOOSE BETTER TIME
var initAxis = function() {
    x = d3.time.scale().domain([ timeDomainStart, timeDomainEnd ]).range([ 0, width ]).clamp(true);
    y = d3.scale.ordinal()rangeRoundBands([ 0, height - margin.top - margin.bottom ], .1); //SET DOMAIN
    xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(d3.time.format(tickFormat)).tickSubdivide(true)
        .tickSize(8).tickPadding(8);
    yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0);
    };


var task_rectangles = [],
    task_rectangle = timeline_svg.selectAll(".task_rectangle");


restart();

function mousedown() {
    event_counter++;
    var point = d3.mouse(this),
        task_rectangle = {x: point[0], y: point[1]},
        t = task_rectangles.push(task_rectangle);

        console.log("yey");

    restart();
}

//Creates graphical elements from array of data (task_rectangles)
function restart() {
    task_rectangle = task_rectangle.data(task_rectangles); 

    task_rectangle.enter().insert("rect")
        .attr("class", "task_rectangle")
        .attr("x", function(d) { return d.x; }) //note: d is data
        .attr("y", function(d) { return d.y; })
        .attr("id", function(d) {return d.id; }) //WORK HERE
        .attr("height", rectangle_height)
        .attr("width", rectangle_width)
        .attr("fill", "red")
        .attr("fill-opacity", .5)
        .attr('pointer-events', 'all')
        /*.on('click', function() { //BREAKS AUTHORING OF RECTANGLES
            $(this).popover('toggle'){
            title: 'New Event',
            placement: 'right',
            content: '<button id="delete">Delete</button>'
            }).parent().delegate('button#delete', 'click', function() {
                //ADD DELETE CODE
            })
        })*/
            
};