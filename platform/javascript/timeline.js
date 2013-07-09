var w = 600,
h = 300,
m = 20;

var rectangle_width = 100,
rectangle_height = 50;

var dragbar_width = 20;

var drag = d3.behavior.drag()
    .origin(Object)
    .on("drag", dragMove);

var drag_right = d3.behavior.drag()
    .origin(Object)
    .on("drag", rightResize);

var drag_left = d3.behavior.drag()
    .origin(Object)
    .on("drag", leftResize);

// Create the SVG canvas
var svg = d3.select("#timeline-container").append("svg")
    .attr("width", w)
    .attr("height", h)
    .style("background-color", "white");

// Create the rectangle group
var newg = svg.append("g")
    .data([{x: m, y: m}]);

// Create the red rectangle
var drag_rectangle = newg.append("rect")
    .attr("x", function(d) { return d.x; })
    .attr("y", function(d) { return d.y; })
    .attr("height", rectangle_height)
    .attr("width", rectangle_width)
    .attr("fill", "red")
    .attr("fill-opacity", .5)
    .attr("cursor", "move")
    .call(drag);

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
    .call(drag_right);

// dragMove: move the rectangle by dragging
function dragMove(d) {
    drag_rectangle.attr("x", d.x = Math.max(0, Math.min(w - rectangle_width, d3.event.x)))
    dragbar_left.attr("x", function(d) { return d.x - (dragbar_width/2); })
    dragbar_right.attr("x", function(d) { return d.x + rectangle_width - (dragbar_width/2); });
}

// leftResize: resize the rectangle by dragging the left handle
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
}