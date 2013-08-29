/* Timeline.js
 * ---------------------------------------------
 * 
 * 
 */

var foundryJSONObject = {
    "members": [],
    "events": []
};

var XTicks = 50,
    YTicks = 5;

//CHANGE TO ALL CAPS AND BETTER NAME LATER
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

//STARTER VALUES, MAY BE A PROBLEM LATER
var RECTANGLE_WIDTH = 100,
    RECTANGLE_HEIGHT = 100;

var event_counter = 0;

var DRAGBAR_WIDTH = 8;

var drag = d3.behavior.drag()
    .origin(Object)
    .on("drag", function (d) {
        var group = this.parentNode;
        var oldX = d.x;
        var groupNumber = this.id.split("_")[1];

        var rectWidth = $("#rect_" + groupNumber)[0].width.animVal.value;

        //Horiztonal draggingx
        var dragX = d3.event.x - (d3.event.x%(X_WIDTH)) - DRAGBAR_WIDTH/2;
        var newX = Math.max(0, Math.min(SVG_WIDTH-rectWidth, dragX));
        if (d3.event.dx + d.x < 0) d.x = 0 - (DRAGBAR_WIDTH/2);
        else d.x = newX;

        //Vertical Dragging
        var Y_WIDTH = RECTANGLE_HEIGHT;
        var dragY = d3.event.y - (d3.event.y%(Y_WIDTH)) + 17;
        var newY = Math.min(SVG_HEIGHT - RECTANGLE_HEIGHT, dragY);
        if (d3.event.dy + d.y < 20) d.y = 17;
        else d.y = newY;

        redraw(group, rectWidth);
    });

var drag_right = d3.behavior.drag()
    .origin(Object)
    .on("drag", rightResize);

var drag_left = d3.behavior.drag()
    .origin(Object)
    .on("drag", leftResize);

var timeline_svg = d3.select("#timeline-container").append("svg")
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT)
    .attr("class", "chart");

// leftResize: resize the rectangle by dragging the left handle
function leftResize(d) {
    var taskRect = timeline_svg.selectAll("#rect_" + d.groupNum);
    var rightX = $("#rt_rect_" + d.groupNum).get(0).x.animVal.value;
    var dragX = d3.event.x - (d3.event.x%(X_WIDTH)) - DRAGBAR_WIDTH/2;
    var newX = Math.max(0, Math.min(rightX - 25, dragX));

    taskRect.attr("x", newX);
    $("#lt_rect_" + d.groupNum).attr("x", newX - DRAGBAR_WIDTH/2);
    $("#title_text_" + d.groupNum).attr("x", newX + 10);
    $("#time_text_" + d.groupNum).attr("x", newX + 10);
    $("#acronym_text_" + d.groupNum).attr("x", newX + 10);
    taskRect.attr("width", rightX - newX);
    updateTime(d.groupNum);
}

// rightResize: resize the rectangle by dragging the right handle
function rightResize(d) {
    var taskRect = timeline_svg.selectAll("#rect_" + d.groupNum);
    var leftX = $("#lt_rect_" + d.groupNum).get(0).x.animVal.value;
    var dragX = d3.event.x - (d3.event.x%(X_WIDTH)) - (DRAGBAR_WIDTH/2);
    var newx = Math.max(leftX + 50, Math.min(dragX, SVG_WIDTH));

    $(this).attr("x", newx);
    taskRect.attr("width", newx - leftX);
    updateTime(d.groupNum);
}

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
    .style("stroke", "#5F5A5A");

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

timeline_svg.append("rect")
    .attr("class", "background")
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT)
    .attr("fill", "white")
    .attr("fill-opacity", 0)
    .on("mousedown", mousedown);

var task_groups = [],
    task_g = timeline_svg.selectAll(".task_g");

function mousedown() {
    event_counter++; //To generate id
    var point = d3.mouse(this);
    var snapX = Math.floor(point[0] - (point[0]%(XTicks)) - DRAGBAR_WIDTH/2),
        snapY = Math.floor(point[1]/RECTANGLE_HEIGHT) * RECTANGLE_HEIGHT;

    drawEvents(snapX, snapY);

    //D3, Exit to Remove Deleted Data
    task_g = timeline_svg.selectAll(".task_g").data(task_groups, function(d) {return d.id});
    task_g.exit().remove();

    addPopovers();
};

//Creates graphical elements from array of data (task_rectangles)
function  drawEvents(x, y) {
    var task_g = timeline_svg.append("g")
        .data([{x: x, y: y+17, id: "task_g_" + event_counter, class: "task_g", groupNum: event_counter}]);

    //Task Rectangle, Holds Event Info
    var task_rectangle = task_g.append("rect")
        .attr("class", "task_rectangle")
        .attr("x", function(d) {return d.x})
        .attr("y", function(d) {return d.y})
        .attr("id", function(d) {
            return "rect_" + event_counter; })
        .attr("groupNum", event_counter)
        .attr("height", RECTANGLE_HEIGHT)
        .attr("width", RECTANGLE_WIDTH)
        .attr("fill", "#C9C9C9")
        .attr("fill-opacity", .6)
        .attr("stroke", "#5F5A5A")
        .attr('pointer-events', 'all')
        .call(drag);    //FIX DRAGGING

    //Right Dragbar
    var rt_rect = task_g.append("rect")
        .attr("class", "rt_rect")
        .attr("x", function(d) { 
            return d.x + RECTANGLE_WIDTH; })
        .attr("y", function(d) {return d.y})
        .attr("id", function(d) {
            return "rt_rect_" + event_counter; })
        .attr("groupNum", event_counter)
        .attr("height", RECTANGLE_HEIGHT)
        .attr("width", DRAGBAR_WIDTH)
        .attr("fill", "#00")
        .attr("fill-opacity", .6)
        .attr('pointer-events', 'all')
        .call(drag_right); 

    //Left Dragbar
    var lt_rect = task_g.append("rect")
        .attr("class", "lt_rect")
        .attr("x", function(d) { return d.x})
        .attr("y", function(d) {return d.y})
        .attr("id", function(d) {
            return "lt_rect_" + event_counter; })
        .attr("groupNum", event_counter)
        .attr("height", RECTANGLE_HEIGHT)
        .attr("width", DRAGBAR_WIDTH)
        .attr("fill", "#00")
        .attr("fill-opacity", .6)
        .attr('pointer-events', 'all')
        .call(drag_left);

    //ADD TITLE
    var title_text = task_g.append("text")
        .text(function (d) {
            return "New Event";
        })
        .attr("class", "title_text")
        .attr("id", function(d) { return "title_text_" + event_counter; })
        .attr("groupNum", event_counter)
        .attr("x", function(d) {return d.x + 10})
        .attr("y", function(d) {return d.y + 14})
        .attr("font-weight", "bold")
        .attr("font-size", "12px");

    //ADD TIME
    var time_text = task_g.append("text")
        .text(function (d) {
            return "1hrs 0min";
        })
        .attr("class", "time_text")
        .attr("id", function(d) {return "time_text_" + event_counter;})
        .attr("groupNum", event_counter)
        .attr("x", function(d) {return d.x + 10})
        .attr("y", function(d) {return d.y + 26})
        .attr("font-size", "12px");


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
        .attr("groupNum", event_counter)
        .attr("x", function(d) {return d.x + 10})
        .attr("y", function(d) {return d.y + RECTANGLE_HEIGHT - 10});

    task_groups.push(task_g);    
};

function redraw(group, newWidth) {
    var d3Group = d3.select(group)
    d3Group.selectAll(".task_rectangle")
        .attr("x", function(d) {return d.x})
        .attr("y", function(d) {return d.y});

    //WHEN RESIZING WORKS, NEED TO USE NEW DATA, SIZE
    d3Group.selectAll(".rt_rect")
        .attr("x", function(d) {return d.x + newWidth})
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
        .attr("y", function(d) {return d.y + RECTANGLE_HEIGHT - 10});
}

function addPopovers() {
    //Add Popovers
    timeline_svg.selectAll("#rect_" + event_counter).each(
        function(d) {
            $(this).popover({
                placement: "right",
                html: "true",
                class: "event",
                style: "width: 500",
                id: '"popover' + event_counter + '"',
                trigger: "click",
                title: '<input type ="text" name="eventName" id="eventName_' + event_counter + '" placeholder="New Event">',
                content: '<form name="eventForm_' + event_counter + '">'
                +'<h10>Total Runtime: <input type = "text" name = "totalruntime" placeholder="1hrs 0min"></h10>' 
                +'Happening From: <input type ="time" style="width:90px" name="starttime"><br> ' 
                +'To: <input type = "time" style="width:90px" name="endtime">'
                +'<br>Members<input class="eventMemberInput" id="eventMember_' + event_counter + 'style="width:60px" type="text" name="members" onclick="addMemAuto()">'
                +'<button class="btn" type="button" onclick="addEventMember(' + event_counter +')">+Add</button>'
                +'<ul class="nav nav-pills" id="eventMembers_' + event_counter + '"> </ul>'
                +'<br><p><button type="button" id="delete" onclick="deleteRect(' + event_counter +');">Delete</button>       ' 
                +'<button type="button" id="save" onclick="hidePopover(' + event_counter + ');">Save</button> </p>' 
                +'</form>',
                container: $("#timeline-container")
            });
            $(this).popover("show"); 
        });
};

function addMemAuto() {
    $(".eventMemberInput").each(function() {
        $(this).autocomplete({
            source: currentMembers
        });
    })
}

function hidePopover (popId) {
    var newTitle = $("#eventName_" + popId).val();
    if (!newTitle == "") $("#title_text_" + popId).text(newTitle);
    $("#eventName_" + popId).attr("placeholder", newTitle);

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

function addEventMember(memId) {
    var memberName = $("#eventMember_" + memId).val();
    console.log(memberName, 'added to event.');

}

function updateTime(idNum) {
    var eventLength = $("#rect_" + idNum)[0].width.animVal.value;
    var hours = Math.floor(eventLength/100);
    var minutes = (eventLength%(hours*100))/25*15;

    $("#time_text_" + idNum).text(hours + "hrs " + minutes + "min");
}




