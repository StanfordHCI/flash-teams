var width = 960,
    height = 500;

var rectangle_width = 100,
    rectangle_height = 50;

var timeline_svg = d3.select("#timeline-container").append("svg")
    .attr("width", width)
    .attr("height", height);

timeline_svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "white")
    .on("mousedown", mousedown);

var task_rectangles = [],
    task_rectangle = timeline_svg.selectAll(".task_rectangle");


restart();

function mousedown() {
    var point = d3.mouse(this),
        task_rectangle = {x: point[0], y: point[1]},
        t = task_rectangles.push(task_rectangle);

        console.log("yey");

    restart();
}

function restart() {
    task_rectangle = task_rectangle.data(task_rectangles);

    task_rectangle.enter().insert("rect")
        .attr("class", "task_rectangle")
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; })
        .attr("height", rectangle_height)
        .attr("width", rectangle_width)
        .attr("fill", "red")
        .attr("fill-opacity", .5);
}