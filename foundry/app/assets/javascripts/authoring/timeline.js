/* Timeline.js
 * ---------------------------------------------
 * Code that manages the workflow timeline in Foundry.
 */

var XTicks = 50,
    YTicks = 5;

var SVG_WIDTH = 2450,
    SVG_HEIGHT = 570;

var X_WIDTH = 25;
    Y_WIDTH = 100;

var timelineHours = 25;
var hours = timelineHours*Y_WIDTH;

var x = d3.scale.linear()
    .domain([0, hours])
    .range([0, hours]);

var y = d3.scale.linear() 
    .domain([15, 600])
    .range([15, 600]);

var RECTANGLE_WIDTH = 100,
    RECTANGLE_HEIGHT = 100;

var event_counter = 0;

var DRAGBAR_WIDTH = 8;

var current = 1;
var currentUserEvents = [];
var upcomingEvent; 

//Called when task rectangles are dragged
var drag = d3.behavior.drag()
    .origin(Object)
    .on("drag", function (d) {
        var group = this.parentNode;
        var oldX = d.x;
        var groupNum = this.id.split("_")[1];
        var rectWidth = $("#rect_" + groupNum)[0].width.animVal.value;

        //Horiztonal draggingx
        var dragX = d3.event.x - (d3.event.x%(X_WIDTH)) - DRAGBAR_WIDTH/2;
        var newX = Math.max(0, Math.min(SVG_WIDTH-rectWidth, dragX));
        if (d3.event.dx + d.x < 0) d.x = 0 - (DRAGBAR_WIDTH/2);
        else d.x = newX;

        //Update event popover
        var startHour = Math.floor((d.x/100));
        var startMin = (d.x%100/25*15);
        if(startMin == 57.599999999999994) {
            startHour++;
            startMin = 0;
        } else {
            startMin += 2.41
            startMin = Math.floor(startMin);
        }
        $("#rect_" + groupNum).popover("show");
        var title = $("#eventName_" + groupNum).attr("placeholder");
        var hours = $("#hours_" + groupNum).attr("placeholder");
        var min = $("#minutes_" + groupNum).attr("placeholder");
        var eventNotes = flashTeamsJSON["events"][getEventJSONIndex(groupNum)].notes;
        updateEventPopover(groupNum, title, startHour, startMin, hours, min, eventNotes);  
        $("#rect_" + groupNum).popover("hide");

        //Vertical Dragging
        var dragY = d3.event.y - (d3.event.y%(RECTANGLE_HEIGHT)) + 17;
        var newY = Math.min(SVG_HEIGHT - RECTANGLE_HEIGHT, dragY);
        if (d3.event.dy + d.y < 20) d.y = 17;
        else d.y = newY;

        redraw(group, rectWidth, groupNum);

        //Update JSON
        var indexOfJSON = getEventJSONIndex(groupNum);
        flashTeamsJSON["events"][indexOfJSON].startTime = (startHour*60 + startMin);
    });

var timeline_svg = d3.select("#timeline-container").append("svg")
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT)
    .attr("class", "chart");

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
    .style("stroke", "#000");

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

//For Interactions
//START HERE
timeline_svg.append("defs").append("marker")
    .attr("id", "arrowhead")
    .attr("markerWidth", 5)
    .attr("markerHeight", 4)
    .append("path")
        .attr("d", "M 0,0 V 4 L6,2 Z");

var task_g = timeline_svg.selectAll(".task_g");

//OLD CODE: Stop following the position of the mouse
/*function handoffMouseClick() {
    //SET INDICATOR TO FALSE, WHEN CLICKED ANYWHERE
    timeline_svg.on("mousemove", null);
}*/

//Turn on the overlay so a user cannot continue to draw events when focus is on a popover
function overlayOn() {
    document.getElementById("overlay").style.display = "block";
}

//Remove the overlay so a user can draw events again
function overlayOff() {
    $(".task_rectangle").popover("hide");
    document.getElementById("overlay").style.display = "none";
}

//Access a particular "event" in the JSON by its id number and return its index in the JSON array of events
function getEventJSONIndex(idNum) {
    for (i = 0; i < flashTeamsJSON["events"].length; i++) {
        if (flashTeamsJSON["events"][i].id == idNum) {
            return i;
        }
    }
}

//VCom Time expansion button trial 
function addTime() {
    calcAddHours(timelineHours);
    
    //Recalculate 'x' based on added hours
    var x = d3.scale.linear()
    .domain([0, hours])
    .range([0, hours]);
    
    //Reset overlay and svg width
    document.getElementById("overlay").style.width = SVG_WIDTH + 50 + "px";
    timeline_svg.attr("width", SVG_WIDTH);
    
    //Remove all exising grid lines
    timeline_svg.selectAll("line").remove();
    
    //Redraw all x-axis grid lines
    timeline_svg.selectAll("line.x")
    .data(x.ticks(XTicks)) 
    .enter().append("line")
    .attr("class", "x")
    .attr("x1", x)
    .attr("x2", x)
    .attr("y1", 15)
    .attr("y2", SVG_HEIGHT-50)
    .style("stroke", "#000");
    
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
    .style("stroke-width", "4")
    
    timeline_svg.append("line")
    .attr("y1", 15)
    .attr("y2", SVG_HEIGHT-50)
    .style("stroke", "#000")
    .style("stroke-width", "4")
    
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
    .on("mousedown", mousedown);
    
}

//VCom Calculates how many hours to add when user expands timeline
function calcAddHours(currentHours) {
    timelineHours = currentHours + Math.floor(currentHours/3);
    hours = timelineHours * Y_WIDTH;
    
    SVG_WIDTH = timelineHours * 100 + 50;
    XTicks = timelineHours * 2;
}
