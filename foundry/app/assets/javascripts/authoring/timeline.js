/* Timeline.js
 * ---------------------------------------------
 * Code that manages the workflow timeline in Foundry.
 */

var XTicks = 100,
    YTicks = 5;

var SVG_WIDTH = 4850,
    SVG_HEIGHT = 570;

var STEP_WIDTH = 25,
    HOUR_WIDTH = 100;

var TIMELINE_HOURS = 48;
var TOTAL_HOUR_PIXELS = TIMELINE_HOURS*HOUR_WIDTH;

var x = d3.scale.linear()
    .domain([0, TOTAL_HOUR_PIXELS])
    .range([0, TOTAL_HOUR_PIXELS]);

var y = d3.scale.linear() 
    .domain([15, 600])
    .range([15, 600]);

var current = undefined;
var currentUserEvents = [];
var currentUserIds = [];
var upcomingEvent; 

var overlayIsOn = false;


var timeline_svg = d3.select("#timeline-container").append("svg")
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT)
    .attr("class", "chart");

//console.log("APPENDED TIMELINE TO DOM!");

//CHART CODE (http://synthesis.sbecker.net/articles/2012/07/11/learning-d3-part-4-intro-to-svg-gr_hics)
//Draw x grid lines
timeline_svg.selectAll("line.x")
    .data(x.ticks(XTicks))
    .enter().append("line")
    .attr("class", "x")
    .attr("x1", x)
    .attr("x2", x)
    .attr("y1", 15)
    .attr("y2", SVG_HEIGHT-50)
    .style("stroke", "rgba(100, 100, 100, .5)");

var yLines = y.ticks(YTicks);
for (i = 0; i<yLines.length; i++) {
    yLines[i] += 17;
}

//Draw y axis grid lines
timeline_svg.selectAll("line.y")
    .data(yLines) 
    .enter().append("line")
    .attr("class", "y")
    .attr("x1", 0)
    .attr("x2", SVG_WIDTH-50)
    .attr("y1", y)
    .attr("y2", y)
    .style("stroke", "#d3d1d1");

var numMins = -30;

//Add X Axis Labels
timeline_svg.selectAll(".rule")
    .data(x.ticks(XTicks)) 
    .enter().append("text")
    .attr("x", x)
    .attr("y", 15)
    .attr("dy", -3)
    .attr("text-anchor", "middle")
    .text(function(d) {
        numMins+= 30;
        var hours = Math.floor(numMins/60);
        var minutes = numMins%60;
        if (minutes == 0 && hours == 0) return ".     .      .    .    0:00";
        else if (minutes == 0) return hours + ":00";
        else return hours + ":" + minutes; 
    });

//Darker First X and Y line
timeline_svg.append("line")
    .attr("x1", 0)
    .attr("x2", SVG_WIDTH-50)
    .attr("y1", 15)
    .attr("y2", 15)
    .style("stroke", "#000")
    .style("stroke-width", "4")
timeline_svg.append("line")
    .attr("y1", 15)
    .attr("y2", SVG_HEIGHT-50)
    .style("stroke", "#000")
    .style("stroke-width", "4")

var task_g = timeline_svg.selectAll(".task_g");

//Set the width of the timeline header row so add time button is all the way to the right
document.getElementById("timeline-header").style.width = SVG_WIDTH - 50 + "px";

//Turn on the overlay so a user cannot continue to draw events when focus is on a popover
function overlayOn() {
    console.log("overlay on");
    //$("#overlay").css("display", "block");
};

//Remove the overlay so a user can draw events again
function overlayOff() {
    console.log("overlay off");
    $(".task_rectangle").popover("hide");
    //$("#overlay").css("display", "none");
};

//Access a particular "event" in the JSON by its id number and return its index in the JSON array of events
function getEventJSONIndex(idNum) {
    var num_events = flashTeamsJSON["events"].length;
    for (var i = 0; i < num_events; i++) {
        if (flashTeamsJSON["events"][i].id == idNum) {
            return i;
        }
    }
};

//Find the total hours (duration) of the entire team
function findTotalHours() {
    var totalHours = 48; 
    for (i = 0; i < flashTeamsJSON["events"].length; i++) {
        var eventObj = flashTeamsJSON["events"][i];
        var eventStart = eventObj.startTime;
        var eventDuration = eventObj.duration;
        var eventEnd = eventStart + eventDuration;
        var hours = (eventEnd - (eventEnd%60))/60; 
        if (hours > totalHours) totalHours = hours;
    }
    //NOTE: the above cut off minutes past the hour, must add at least 1 extra hour to return val
    totalHours++; 
    return totalHours + 2; //THE 2 IS ARBITRARY FOR PADDING
}


//VCom Time expansion button trial 
function addTime() {
    calcAddHours(TIMELINE_HOURS);
    redrawTimeline();
}

function redrawTimeline() {
    //Recalculate 'x' based on added hours
    var x = d3.scale.linear()
    .domain([0, TOTAL_HOUR_PIXELS])
    .range([0, TOTAL_HOUR_PIXELS]);
    
    //Reset overlay and svg width
    document.getElementById("overlay").style.width = SVG_WIDTH + 50 + "px";
    timeline_svg.attr("width", SVG_WIDTH);
    
    //Remove all existing grid lines & background
    timeline_svg.selectAll("line").remove();
    timeline_svg.selectAll("rect.background").remove();
    
    //Redraw all x-axis grid lines
    timeline_svg.selectAll("line.x")
        .data(x.ticks(XTicks)) 
        .enter().append("line")
        .attr("class", "x")
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", 15)
        .attr("y2", SVG_HEIGHT-50)
        .style("stroke", "rgba(100, 100, 100, .5)");
    
    //Redraw all y-axis grid lines
    timeline_svg.selectAll("line.y")
        .data(yLines) 
        .enter().append("line")
        .attr("class", "y")
        .attr("x1", 0)
        .attr("x2", SVG_WIDTH-50)
        .attr("y1", y)
        .attr("y2", y)
        .style("stroke", "#d3d1d1");
    
    //Redraw darker first x and y grid lines
    timeline_svg.append("line")
        .attr("x1", 0)
        .attr("x2", SVG_WIDTH-50)
        .attr("y1", 15)
        .attr("y2", 15)
        .style("stroke", "#000")
        .style("stroke-width", "4");
    
    timeline_svg.append("line")
        .attr("y1", 15)
        .attr("y2", SVG_HEIGHT-50)
        .style("stroke", "#000")
        .style("stroke-width", "4");
    
    //Redraw Add Time Button
    document.getElementById("timeline-header").style.width = SVG_WIDTH - 50 + "px";
    
    //Remove existing X-axis labels -- can't get this to work
    //timeline_svg.selectAll(".rule").remove();
    numMins = -30;

    //Redraw X-axis labels
    timeline_svg.selectAll(".rule")
        .data(x.ticks(XTicks))
        .enter().append("text")
        .attr("x", x)
        .attr("y", 15)
        .attr("dy", -3)
        .attr("text-anchor", "middle")
        .text(function(d) {
            numMins+= 30;
            var hours = Math.floor(numMins/60);
            var minutes = numMins%60;
            if (minutes == 0 && hours == 0) return ".     .      .    .    0:00";
            else if (minutes == 0) return hours + ":00";
            else return hours + ":" + minutes; 
        });
    
    //Add ability to draw rectangles on extended timeline
    timeline_svg.append("rect")
        .attr("class", "background")
        .attr("width", SVG_WIDTH)
        .attr("height", SVG_HEIGHT)
        .attr("fill", "white")
        .attr("fill-opacity", 0)
        .on("mousedown", function() {
            var point = d3.mouse(this);
            newEvent(point);
        }); 

    //move all existing events back on top of timeline
    $(timeline_svg.selectAll('g')).each(function() {
        $('.chart').append(this);
    });
}

//VCom Calculates how many hours to add when user expands timeline manually 
function calcAddHours(currentHours) {
    TIMELINE_HOURS = currentHours + Math.floor(currentHours/3);
    TOTAL_HOUR_PIXELS = TIMELINE_HOURS * HOUR_WIDTH;
    
    SVG_WIDTH = TIMELINE_HOURS * 100 + 50;
    XTicks = TIMELINE_HOURS * 2;
}
