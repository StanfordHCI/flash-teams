var diagram_width = $("#diagram-container").width(),
    diagram_height = 300,
    diagram_margin = 20;

var workers = {
    "nodes": [
        {"name": "UX Researcher", "id": 0, "color": "green"},
        {"name": "Web Developer 1", "id": 1, "color": "blue"},
        {"name": "Web Developer 2", "id": 2, "color": "blue"},
        {"name": "Web Developer 3", "id": 3, "color": "blue"},
        {"name": "UI Designer", "id": 4, "color": "red"}
    ],
    "links": [
        {"source":1,"target":2,"value":1},
        {"source":2,"target":3,"value":8},
        {"source":3,"target":1,"value":10},
        {"source":0,"target":2,"value":6},
    ]
}

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-120)
    .linkDistance(60)
    .size([diagram_width, diagram_height]);

// Create the SVG canvas
var diagram_svg = d3.select("#diagram-container").append("svg")
    .attr("width", diagram_width)
    .attr("height", diagram_height);
    // .style("background-color", "white");

force.nodes(workers.nodes)
    .links(workers.links)
    .start();

var link = diagram_svg.selectAll(".link")
    .data(workers.links)
    .enter().append("line")
    .attr("class", "link")
    .style("stroke-width", function(d) { return 2*Math.sqrt(d.value); });

var node = diagram_svg.selectAll(".node")
    .data(workers.nodes)
    .enter().append("circle")
    .attr("class", "node")
    .attr("r", 10)
    .style("fill", function(d) { return d.color; })
    .call(force.drag);

node.append("title")
    .text(function(d) { return d.name; });

force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
});


$(window).resize(function() {
    diagram_width = $("#diagram-container").width();
    diagram_svg.attr("width", diagram_width);
    force.size([diagram_width, diagram_height])
        .start();
});