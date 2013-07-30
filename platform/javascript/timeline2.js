/*
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
    rectangle_height = 50;

var event_counter = 0;

var timeline_svg = d3.select("#timeline-container").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart");

//CHART CODE (http://synthesis.sbecker.net/articles/2012/07/11/learning-d3-part-4-intro-to-svg-graphics)
//START WORKING HERE -AT
//Draw x grid lines
timeline_svg.selectAll("line.x")
    .data(x.ticks(10)) //CHOOSE TICKS LATER
    .enter().append("line")
    .attr("class", "x")
    .attr("x1", x)
    .attr("x2", x)
    .attr("y1", 0)
    .attr("y2", height-50)
    .style("stroke", "#000");

//Draw y axis grid lines
timeline_svg.selectAll("line.y")
    .data(y.ticks(10)) //CHOOSE TICKS LATER
    .enter().append("line")
    .attr("class", "y")
    .attr("x1", 0)
    .attr("x2", width-50)
    .attr("y1", y)
    .attr("y2", y)
    .style("stroke", "#5F5A5A");

//Add X Axis Labels
timeline_svg.selectAll(".rule")
    .data(x.ticks(10)) //ADJUST LATER
    .enter().append("text")
    .attr("x", x)
    .attr("y", 0)
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
    var point = d3.mouse(this),
        task_rectangle = {x: point[0], y: point[1], id: event_counter};
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
        .attr("fill", "red")
        .attr("fill-opacity", .6)
        .attr("stroke", "#5F5A5A")
        .attr('pointer-events', 'all') 
        .on('click', function(d) { 
            $("a[rel=eventpopover]").toggle(); //toggles visibility of elements, PROBLEM: SELECTS ALL EVENT POPOVERS
            console.log("You clicked rect" + d.id); //DEBUGGING
        });
    
    task_rectangle = timeline_svg.selectAll(".task_rectangle").data(task_rectangles, function (d) { return d.id});
    task_rectangle.exit().remove(); 

    timeline_svg.selectAll(".task_rectangle").each(
        function(d) {
            $(this).popover({
                placement: "bottom",
                html: "true",
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


    //Event Popover
    /*$("#timeline-container").css("position","relative");
    $("#timeline-container").append($("<a>", 
    {
        href: "#",
        class: "event",
        id: event_counter, 
        rel: "eventpopover", 
        position:"absolute",
        "data-toggle": "popover",
        title: '<form name="eventHeaderForm_' + event_counter + '"><input type = "text" name="eventtitle"></form>',
        html: "+", //TOGGLES ON THIS
    }).css("position","absolute").css("left",dx+90).css("top",dy+100)); //Ethan Fast help

    $("a[rel=eventpopover]").popover({
        placement: "bottom",
        html: "true",
        content: '<form name="eventForm_' + event_counter + '"><h10>Total Runtime: <input type = "text" name = "totalruntime"></h10>' 
            +'Happening From: <input type = "time" name="starttime"><br>' + ' To: <input type = "time" name="endtime>'
            +'Members<input type = "textfield" name="members"><br>'
            +'<p><button type="button" id="delete" onclick="deleteRect(' + event_counter +');">Delete</button>  ' 
            +'<button type="button" id="done" onclick="hidePopover(' + event_counter + ');">Done</button> </p>' 
            +'</form>'
    });*/
};

function hidePopover(popId) {
    $("#" + popId).popover("hide");

    console.log("You hid popover" + popId);
}

function deleteRect(rectId) {
    $("#" + rectId).popover("destroy");
    
    var element = null;
    var index = 0;
    for (var i = 0; i < task_rectangles.length; i++) {
        element = task_rectangles[i];
        console.log("rectId", element.id, "index", i);
        if (element.id == rectId) {
            task_rectangles.splice(i, 1);
            restart();
            console.log("Deleted rect" + rectId + ", task_rectangles length is now " + task_rectangles.length);
            break;
        }
    }
    
};


