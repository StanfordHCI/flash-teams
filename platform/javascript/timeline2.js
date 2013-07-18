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

$("#flashteam").popover({
    placement: "bottom",
    html: "true",
    title: '<h3>New Team</h3>',
    content: '<h4>Welcome.</h4>' 
    + '<p><button type="button" id="delete">Delete</button> <button type="button" id="done" onclick="$(&quot;#flashteam&quot;).popover(&quot;hide&quot;);">Done</button> </p>'
});
$("a[rel=flashpopover]").popover();

//Taken from d3.gantt By Dimitry Kudrayvtsev
//START WORKING HERE -AT
/*var margin = { //MAY NEED TO ADJUST
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
};*/


var task_rectangles = [],
    task_rectangle = timeline_svg.selectAll(".task_rectangle");


//restart();

function mousedown() {
    event_counter++; //To generate id
    var point = d3.mouse(this),
        task_rectangle = {x: point[0], y: point[1], id: event_counter},
        t = task_rectangles.push(task_rectangle);

        console.log("yey");

    restart();
}

//Creates graphical elements from array of data (task_rectangles)
function restart() {
    task_rectangle = task_rectangle.data(task_rectangles); 

    var dx; 
    var dy;
    var rectId;

    task_rectangle.enter().insert("rect")
        .attr("class", "task_rectangle")
        .attr("x", function(d) { 
            dx = d.x;
            return d.x; }) 
        .attr("y", function(d) { 
            dy = d.y;
            return d.y; })
        .attr("id", function(d) {
            rectId = "rect" + d.id;
            return rectId; }) 
        .attr("height", rectangle_height)
        .attr("width", rectangle_width)
        .attr("fill", "red")
        .attr("fill-opacity", .5)
        .attr('pointer-events', 'all') 
        .on('click', function(d) { 
            var did = d.id;
            $("a[rel=eventpopover]").toggle(); //toggles visibility of elements, PROBLEM: SELECTS ALL EVENT POPOVERS
            console.log("you clicked " + d.id); //DEBUGGING
        });

    //console.log({x: dx, y: dy})

    //Event Popover
    $("#timeline-container").css("position","relative");
    $("#timeline-container").append($("<a>", // MAYBE task_rectangle.enter().append?
    {
        href: "#",
        class: "event",
        id: event_counter, 
        rel: "eventpopover", 
        position:"absolute",
        x: dx,
        y: dy,
        "data-toggle": "popover",
        title: "New Event",
        html: "+", //TOGGLES ON THIS
        //content: $('#event_popover_content_wrapper').html()
        content: "This is a new event" + '<p><button type="button" id="delete">Delete</button></p>'
    }).css("position","absolute").css("left",dx+50).css("top",dy+90)); //Ethan Fast help

    $("a[rel=eventpopover]").popover({
        placement: "bottom",
        html: "true",
        content: '<h4>This is a new event.</h4>' 
            + '<p><button type="button" id="delete">Delete</button> <button type="button" id="done" onclick="$(&quot;#event&quot;).popover(&quot;hide&quot;);">Done</button> </p>'
    });
};



