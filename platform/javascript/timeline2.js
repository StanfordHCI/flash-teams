/*
 *
 *
 */

var width = 960,
    height = 500;

var rectangle_width = 100,
    rectangle_height = 50;

var event_counter = 0;

var timeline_svg = d3.select("#timeline-container").append("svg")
    .attr("width", width)
    .attr("height", height);
    //.attr("class", "chart")

//CHART CODE (http://synthesis.sbecker.net/articles/2012/07/11/learning-d3-part-4-intro-to-svg-graphics)
//START WORKING HERE -AT
/*
timeline_svg.selectAll("line.x")
    .data(x.ticks(10)) //CHOOSE TICKS LATER
    .ENTER().APPEND("LINE)
    .ATTR("CLASS", "X")
*/

timeline_svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "white")
    .on("mousedown", mousedown);

//ALL FOR DEBUGGING
$("#flashteam").popover({
    placement: "bottom",
    html: "true",
    title: '<h3>New Team</h3>',
    content: '<h4>Welcome.</h4>' 
    + '<p><button type="button" id="delete" onclick="$(&quot;#flashteam&quot;).popover(&quot;destroy&quot;);">Delete</button>  ' 
    + '<button type="button" id="done" onclick="$(&quot;#flashteam&quot;).popover(&quot;hide&quot;);">Done</button> </p>'
});
$("a[rel=flashpopover]").popover();



var task_rectangles = [],
    task_rectangle = timeline_svg.selectAll(".task_rectangle");

//restart();

function mousedown() {
    event_counter++; //To generate id
    var point = d3.mouse(this),
        task_rectangle = {x: point[0], y: point[1], id: event_counter},
        t = task_rectangles.push(task_rectangle);

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
            console.log("You clicked rect" + d.id); //DEBUGGING
        });


    //Event Popover
    $("#timeline-container").css("position","relative");
    $("#timeline-container").append($("<a>", 
    {
        href: "#",
        class: "event",
        id: event_counter, 
        rel: "eventpopover", 
        position:"absolute",
        "data-toggle": "popover",
        title: '<form><input type = "text" name="eventtitle"></form>',
        html: "+", //TOGGLES ON THIS
    }).css("position","absolute").css("left",dx+90).css("top",dy+100)); //Ethan Fast help

    $("a[rel=eventpopover]").popover({
        placement: "bottom",
        html: "true",
        content: '<form><h10>Total Runtime: <input type = "text" name = "totalruntime"></h10>' 
            +'Happening From: <input type = "time" name="starttime"><br>' + ' To: <input type = "time" name="endtime">'
            +'Members<input type = "textfield" name="members"><br>'
            +'<p><button type="button" id="delete" onclick="deleteRect(' + event_counter +');">Delete</button>  ' 
            +'<button type="button" id="done" onclick="hidePopover(' + event_counter + ');">Done</button> </p>' 
            +'</form>'
    });
};
function hidePopover(popId) {
    $("#" + popId).popover("hide");
    console.log("You hid popover" + popId);
}

function deleteRect(rectId) {
    $("#" + rectId).popover("destroy");
    d3.select("rect" + rectId).remove();
    console.log("You deleted popover" + rectId);
};


