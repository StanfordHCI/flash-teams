/* Timeline2.js
 * ---------------------------------------------
 * 
 *
 */

var width = 960,
    height = 500;

var x = d3.scale.linear()
    .domain([0, 900])
    .range([0, 900]);

var y = d3.scale.linear()
    .domain([0, 450])
    .range([0, 450]);

var rectangle_width = 100,
    rectangle_height = 100;

var event_counter = 0;

//var dragbar_width = 10;

var drag = d3.behavior.drag()
    .origin(Object)
    .on("drag", function (d) {
        $(this).attr("x", d.x = Math.max(0, Math.min(width - rectangle_width, d3.event.x)));
        //dragbar_left.attr("x", function(d) { return d.x - (dragbar_width/2); })
        //dragbar_right.attr("x", function(d) { return d.x + rectangle_width - (dragbar_width/2); });
    });

/*var drag_right = d3.behavior.drag()
    .origin(Object)
    .on("drag", rightResize);

var drag_left = d3.behavior.drag()
    .origin(Object)
    .on("drag", leftResize);*/

/*
// Create the left handle
var dragbar_left = newg.append("rect")
    .attr("x", function(d) { return d.x - (dragbar_width/2); })
    .attr("y", function(d) { return d.y + (dragbar_width/2); })
    .attr("height", rectangle_height - dragbar_width)
    .attr("width", dragbar_width)
    .attr("fill", "lightblue")
    .attr("fill-opacity", .5)
    .attr("cursor", "ew-resize")
    .call(drag_left);

// Create the right handle
var dragbar_right = newg.append("rect")
    .attr("x", function(d) { return d.x + rectangle_width - (dragbar_width/2); })
    .attr("y", function(d) { return d.y + (dragbar_width/2); })
    .attr("height", rectangle_height - dragbar_width)
    .attr("width", dragbar_width)
    .attr("fill", "lightblue")
    .attr("fill-opacity", .5)
    .attr("cursor", "ew-resize")
    .call(drag_right);*/

var timeline_svg = d3.select("#timeline-container").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart");


/*// leftResize: resize the rectangle by dragging the left handle
function leftResize(d) {
    var old_x = d.x;

    d.x = Math.max(0, Math.min(d.x + rectangle_width - (dragbar_width / 2), d3.event.x));
    rectangle_width = rectangle_width + (old_x - d.x);

    drag_rectangle.attr("x", function(d) { return d.x; })
        .attr("width", rectangle_width);

    dragbar_left.attr("x", function(d) { return d.x - (dragbar_width / 2); });
}

// rightResize: resize the rectangle by dragging the right handle
function rightResize(d) {
    var dragx = Math.max(d.x + dragbar_width/2, Math.min(w, d.x + rectangle_width + d3.event.dx));
    rectangle_width = dragx - d.x;
    dragbar_right.attr("x", function(d) { return dragx - (dragbar_width/2) });
    drag_rectangle.attr("width", rectangle_width);
}*/

var XTicks = 14,
    YTicks = 5;

//CHART CODE (http://synthesis.sbecker.net/articles/2012/07/11/learning-d3-part-4-intro-to-svg-graphics)
//Draw x grid lines
timeline_svg.selectAll("line.x")
    .data(x.ticks(XTicks))
    .enter().append("line")
    .attr("class", "x")
    .attr("x1", x)
    .attr("x2", x)
    .attr("y1", 0)
    .attr("y2", height-50)
    .style("stroke", "#000");

//Draw y axis grid lines
timeline_svg.selectAll("line.y")
    .data(y.ticks(YTicks)) 
    .enter().append("line")
    .attr("class", "y")
    .attr("x1", 0)
    .attr("x2", width-50)
    .attr("y1", y)
    .attr("y2", y)
    .style("stroke", "#5F5A5A");

//Add X Axis Labels, FIX THIS
timeline_svg.selectAll(".rule")
    .data(x.ticks(XTicks)) 
    .enter().append("text")
    .attr("x", x)
    .attr("y", 20)
    .attr("dy", -3)
    .attr("text-anchor", "middle")
    .text(String);

//Darker First X and Y line
timeline_svg.append("line")
    .attr("x1", 0)
    .attr("x2", width-50)
    .style("stroke", "#000")
    .style("stroke-width", "4")
timeline_svg.append("line")
    .attr("y1", 0)
    .attr("y2", height-50)
    .style("stroke", "#000")
    .style("stroke-width", "4")


timeline_svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "white")
    .attr("fill-opacity", 0)
    .on("mousedown", mousedown);


var task_rectangles = [],
    task_rectangle = timeline_svg.selectAll(".task_rectangle");

function mousedown() {
    event_counter++; //To generate id
    var point = d3.mouse(this);
    var snapX = Math.floor(point[0]),
        snapY = Math.floor(point[1]/rectangle_height) * rectangle_height;

    var task_rectangle = {x: snapX, y: snapY, id: event_counter};

    task_rectangles.push(task_rectangle);
    restart();
}

//Creates graphical elements from array of data (task_rectangles)
function restart() {
    var dx; 
    var dy;
    var rectId;

    task_rectangle = timeline_svg.selectAll(".task_rectangle").data(task_rectangles, function (d){ return d.id}) 
        .enter().append("rect")
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
        .attr("fill", "#C9C9C9")
        .attr("fill-opacity", .6)
        .attr("stroke", "#5F5A5A")
        .attr('pointer-events', 'all')
        .call(drag);
    
    task_rectangle = timeline_svg.selectAll(".task_rectangle").data(task_rectangles, function (d) { return d.id});
    task_rectangle.exit().remove(); 

    timeline_svg.selectAll(".task_rectangle").each(
        function(d) {
            $(this).popover({
                placement: "right",
                html: "true",
                class: "event",
                id: '"popover' + event_counter + '"',
                trigger: "click",
                title: '<form name="eventHeaderForm_' + event_counter + '"><input type ="text"name="eventName"></form>',
                content: '<form name="eventForm_' + event_counter + '"><h10>Total Runtime: <input type = "text" name = "totalruntime"></h10>' 
                    +'Happening From: <input type = "time" name="starttime"><br>' + ' To: <input type = "time" name="endtime>'
                    +'Members<input type = "textfield" name="members"><br>'
                    +'<p><button type="button" id="delete" onclick="deleteRect(' + event_counter +');">Delete</button>  ' 
                    +'<button type="button" id="done" onclick="hidePopover(' + event_counter + ');">Done</button> </p>' 
                    +'</form>',
                container: $("#timeline-container")
            });
        });
};

function hidePopover(popId) {
    $("#rect" + popId).popover("hide");
};

function deleteRect(rectId) {
    $("#rect" + rectId).popover("destroy");
    var element = null;
    for (var i = 0; i < task_rectangles.length; i++) {
        element = task_rectangles[i];
        if (element.id == rectId) {
            task_rectangles.splice(i, 1);
            restart();
            break;
        }
    }
};


