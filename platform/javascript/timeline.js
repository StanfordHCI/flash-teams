/* Timeline.js
 * ---------------------------------------------
 * 
 * 
 */

var XTicks = 25,
    YTicks = 5;

var width = 960,
    height = 500;

var x = d3.scale.linear()
    .domain([0, 900])
    .range([0, 900]);

var y = d3.scale.linear() 
    .domain([15, 480])
    .range([15, 480]);

//STARTER VALUES, MAY BE A PROBLEM LATER
var rectangle_width = 100,
    rectangle_height = 100;

var event_counter = 0;

var dragbar_width = 8;

var drag = d3.behavior.drag()
    .origin(Object)
    .on("drag", function (d) {
        var group = this.parentNode;

        //Horiztonal draggingx
        var dragX = (d3.event.dx - (d3.event.dx%(XTicks)));
        var newX = Math.max(0, Math.min(width-rectangle_width, dragX));

        d.x += d3.event.dx;
        //ADD Y??
        redraw(group);
        console.log(d);

       /* //Dragbars
        var idNum = this.id.split("_")[3]; //Get id number by parsing task_rectangle's id
        var w = this.width.animVal.value; //Get animated width of this task_rectangle
        thisrt_rect = timeline_svg.selectAll("#rt_rect_" + idNum);
        thisrt_rect.attr("x", function(d) {return newX + w - (dragbar_width/2)});
        thislt_rect = timeline_svg.selectAll("#lt_rect_" + idNum);
        thislt_rect.attr("x", function(d) {return newX - (dragbar_width/2)});*/
    });

/*var drag_right = d3.behavior.drag()
    .origin(Object)
    .on("drag", rightResize);*/


var timeline_svg = d3.select("#timeline-container").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("class", "chart");


// leftResize: resize the rectangle by dragging the left handle
/*function leftResize(d) {
    var old_x = d.x;

    d.x = Math.max(0, Math.min(d.x + rectangle_width - (dragbar_width / 2), d3.event.x));
    rectangle_width = rectangle_width + (old_x - d.x);

    drag_rectangle.attr("x", function(d) { return d.x; })
        .attr("width", rectangle_width);

    dragbar_left.attr("x", function(d) { return d.x - (dragbar_width / 2); });
}*/

// rightResize: resize the rectangle by dragging the right handle
function rightResize(d) {
    var taskRect = timeline_svg.selectAll("#rect_" + d.id);
    var taskRectWidth = taskRect.attr("width");
    var leftX = timeline_svg.selectAll("#lt_rect_" + d.id).x;
    var dragx = Math.max(leftX + dragbar_width/2, Math.min(width, d.x + taskRectWidth + d3.event.dx)); //BROKEN
    //rect_width = 200; 
    //$(this).attr("x", d.x = dragx);
    console.log("rectWidth", rect_width);

    //console.log("oldWidth", taskRect.width);
    taskRect.attr("width", rect_width);
    //console.log("newWidth", taskRect.width);
}


//CHART CODE (http://synthesis.sbecker.net/articles/2012/07/11/learning-d3-part-4-intro-to-svg-graphics)
//Draw x grid lines
timeline_svg.selectAll("line.x")
    .data(x.ticks(XTicks))
    .enter().append("line")
    .attr("class", "x")
    .attr("x1", x)
    .attr("x2", x)
    .attr("y1", 15)
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

//START HERE, FIX AXIS LABELS
var formatAsHours = d3.format("%I");
var numMins = -30;

//Add X Axis Labels, FIX THIS
timeline_svg.selectAll(".rule")
    .data(x.ticks(XTicks)) 
    .enter().append("text")
    .attr("tickformat", formatAsHours)
    .attr("x", x)
    .attr("y", 15)
    .attr("dy", -3)
    .attr("text-anchor", "middle")
    .text(function(d) {
        numMins+= 30;
        var hours = Math.floor(numMins/60);
        var minutes = numMins%60;
        var hourLabel = hours + ":" + minutes; 
        return hourLabel;
    });

//Darker First X and Y line
timeline_svg.append("line")
    .attr("x1", 0)
    .attr("x2", width-50)
    .attr("y1", 15)
    .attr("y2", 15)
    .style("stroke", "#000")
    .style("stroke-width", "4")
timeline_svg.append("line")
    .attr("y1", 15)
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

var task_groups = [],
    task_g = timeline_svg.selectAll(".task_g");


function mousedown() {
    event_counter++; //To generate id
    var point = d3.mouse(this);
    var snapX = Math.floor(point[0] - (point[0]%(XTicks/2))),
        snapY = Math.floor(point[1]/rectangle_height) * rectangle_height;

    drawEvents(snapX, snapY);

 

    //D3, Exit to Remove Deleted Data
    task_g = timeline_svg.selectAll(".task_g").data(task_groups, function(d) {return d.id});
    task_g.exit().remove();

    addPopovers();
};

//Creates graphical elements from array of data (task_rectangles)
function  drawEvents(x, y) {
    var task_g = timeline_svg.append("g")
        .data([{x: x, y: y, id: "task_g_" + event_counter, class: "task_g"}]);

    //Task Rectangle, Holds Event Info
    var task_rectangle = task_g.append("rect")
        .attr("class", "task_rectangle")
        .attr("x", function(d) {return d.x})
        .attr("y", function(d) {return d.y})
        .attr("id", function(d) {
            return "rect_" + event_counter; })
        .attr("height", rectangle_height)
        .attr("width", rectangle_width)
        .attr("fill", "#C9C9C9")
        .attr("fill-opacity", .6)
        .attr("stroke", "#5F5A5A")
        .attr('pointer-events', 'all')
        .call(drag);    //FIX DRAGGING

    //Right Dragbar
    var rt_rect = task_g.append("rect")
        .attr("class", "rt_rect")
        .attr("x", function(d) { 
            return d.x + rectangle_width; })
        .attr("y", function(d) {return d.y})
        .attr("id", function(d) {
            return "rt_rect_" + event_counter; })
        .attr("height", rectangle_height)
        .attr("width", dragbar_width)
        .attr("fill", "#00")
        .attr("fill-opacity", .6)
        .attr('pointer-events', 'all'); 

    //Left Dragbar
    var lt_rect = task_g.append("rect")
        .attr("class", "lt_rect")
        .attr("x", function(d) { return d.x})
        .attr("y", function(d) {return d.y})
        .attr("id", function(d) {
            return "lt_rect_" + event_counter; })
        .attr("height", rectangle_height)
        .attr("width", dragbar_width)
        .attr("fill", "#00")
        .attr("fill-opacity", .6)
        .attr('pointer-events', 'all');

    //ADD TITLE
    var title_text = task_g.append("text")
        .text(function (d) {
            return "New Event";
        })
        .attr("class", "title_text")
        .attr("id", function(d) { return "title_text_" + event_counter; })
        .attr("x", function(d) {return d.x + 10})
        .attr("y", function(d) {return d.y + 14})
        .attr("font-weight", "bold")
        .attr("font-size", "12px")
        .call(drag);

    //ADD TIME
    var time_text = task_g.append("text")
        .text(function (d) {
            return "1hrs 0min";
        })
        .attr("class", "time_text")
        .attr("id", function(d) {return "time_text_" + event_counter;})
        .attr("x", function(d) {return d.x + 10})
        .attr("y", function(d) {return d.y + 26})
        .attr("font-size", "12px")
        .call(drag);


    //ADD INTERACTION BUTTONS

    //ADD MEMBER LINES

    //MAY DELETE LATER, DYNAMICALLY ADDED
    //ADD ACRONYMS FOR MEMBERS
    var acronym_text = task_g.append("text")
        .text(function (d) {
            return "[  ]";
        })
        .attr("class", "acronym_text")
        .attr("id", function(d) {return "acronym_text_" + event_counter;})
        .attr("x", function(d) {return d.x + 10})
        .attr("y", function(d) {return d.y + rectangle_height - 10});

    task_groups.push(task_g);    

};

function redraw(group) {
    var d3Group = d3.select(group)
    d3Group.selectAll(".task_rectangle")
        .attr("x", function(d) {return d.x})
        .attr("y", function(d) {return d.y});

    //WHEN RESIZING WORKS, NEED TO USE NEW DATA, SIZE
    d3Group.selectAll(".rt_rect")
        .attr("x", function(d) {return d.x + rectangle_width})
        .attr("y", function(d) {return d.y});
    d3Group.selectAll(".lt_rect")
        .attr("x", function(d) {return d.x})
        .attr("y", function(d) {return d.y});
    d3Group.selectAll(".title_text")
        .attr("x", function(d) {return d.x + 10})
        .attr("y", function(d) {return d.y + 14})
    d3Group.selectAll(".time_text")
        .attr("x", function(d) {return d.x + 10})
        .attr("y", function(d) {return d.y + 26})
    d3Group.selectAll(".acronym_text")
        .attr("x", function(d) {return d.x + 10})
        .attr("y", function(d) {return d.y + rectangle_height - 10});

    //REDRAW EACH ITEM INDIVIDUALLY
}

function addPopovers() {
    //Add Popovers
    timeline_svg.selectAll(".task_rectangle").each(
        function(d) {
            $(this).popover({
                placement: "right",
                html: "true",
                class: "event",
                id: '"popover' + event_counter + '"',
                trigger: "click",
                title: '<form name="eventHeaderForm_' + event_counter + '"><input type ="text" name="eventName"' 
                    + 'id="eventName_' + event_counter + '" placeholder="New Event"></form>',
                        content: '<form name="eventForm_' + event_counter + '">'
                    +'<h10>Total Runtime: <input type = "text" name = "totalruntime" placeholder="1hrs 0min"></h10>' 
                    +'Happening From: <input type = "time" name="starttime"><br>' + ' To: <input type = "time" name="endtime>'
                    +'Members<input type = "textfield" name="members"><br>'
                    +'<p><button type="button" id="delete" onclick="deleteRect(' + event_counter +');">Delete</button>  ' 
                    +'<button type="button" id="done" onclick="hidePopover(' + event_counter + ');">Done</button> </p>' 
                    +'</form>',
                container: $("#timeline-container")
            });
        });
};

function hidePopover (popId) {
    $("#rect_" + popId).popover("hide");
};

function deleteRect (rectId) {
    $("#rect_" + rectId).popover("destroy");

    //WOULD BE BETTER AS A DELETE OF THE GROUP, BUT TEMP FIX
    $("#rect_" + rectId).remove();
    $("#lt_rect_" + rectId).remove();
    $("#rt_rect_" + rectId).remove();
    $("#title_text_" + rectId).remove();
    $("#time_text_" + rectId).remove();
    $("#acronym_text_" + rectId).remove();

};


