/* Timeline.js
 * ---------------------------------------------
 * Code that manages the workflow timeline in Foundry. 
 * 
 */


var flashTeamsJSON = {
    "title" : "New Flash Team",
    "id" : 1,
    "events": [],        //{"title", "id", "startTime", "duration", "notes", "members", "dri"}
    "members": [],       //{"id", "role", "skills":[], "color", "counter"}
    "interactions" : []  //{"event1", "event2", "type", "description"}
};

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
        updateEventPopover(groupNum, title, startHour, startMin, hours, min);  
        $("#rect_" + groupNum).popover("hide");     

        //Vertical Dragging
        var Y_WIDTH = RECTANGLE_HEIGHT;
        var dragY = d3.event.y - (d3.event.y%(Y_WIDTH)) + 17;
        var newY = Math.min(SVG_HEIGHT - RECTANGLE_HEIGHT, dragY);
        if (d3.event.dy + d.y < 20) d.y = 17;
        else d.y = newY;

        redraw(group, rectWidth, groupNum);

        //Update JSON
        //NOT DONE
    });

//Called when the right dragbar of a task rectangle is dragged
var drag_right = d3.behavior.drag()
    .origin(Object)
    .on("drag", rightResize);

//Called when the left dragbar of a task rectangle is dragged
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
    var newX = Math.max(0, Math.min(rightX - 50, dragX));

    taskRect.attr("x", newX);

    //Update task rectangle graphics
    $("#lt_rect_" + d.groupNum).attr("x", newX - DRAGBAR_WIDTH/2);
    $("#title_text_" + d.groupNum).attr("x", newX + 10);
    $("#time_text_" + d.groupNum).attr("x", newX + 10);
    $("#acronym_text_" + d.groupNum).attr("x", newX + 10);
    taskRect.attr("width", rightX - newX);
    updateTime(d.groupNum);

    //Update event member lines
    var indexOfJSON = getEventJSONIndex(d.groupNum);
    var numEventMembers = flashTeamsJSON["events"][indexOfJSON].members.length;
    for (i = 1; i <= numEventMembers; i++) {
        $("#event_" + d.groupNum + "_eventMemLine_" + i).attr("x", (newX + 4))
        $("#event_" + d.groupNum + "_eventMemLine_" + i).attr("width", (rightX - newX-4));
    }

    //Update popover
    $("#rect_" + d.groupNum).popover("show");
    var hrs = Math.floor(((rightX-newX)/100));
    var min = (((rightX-newX)%(Math.floor(((rightX-newX)/100))*100))/25*15);
    var title = $("#eventName_" + d.groupNum).attr("placeholder");
    var startHr = newX-(newX%100)/100;
    var startMin = newX%100/25*15;
    $("#rect_" + d.groupNum).popover("hide");
    updateEventPopover(d.groupNum, title, startHr, startMin, hrs, min);
}

// rightResize: resize the rectangle by dragging the right handle
function rightResize(d) {
    var taskRect = timeline_svg.selectAll("#rect_" + d.groupNum);
    var leftX = $("#lt_rect_" + d.groupNum).get(0).x.animVal.value;
    var dragX = d3.event.x - (d3.event.x%(X_WIDTH)) - (DRAGBAR_WIDTH/2);
    var newX = Math.max(leftX + 50, Math.min(dragX, SVG_WIDTH));

    $(this).attr("x", newX);
    $("#handoff_btn_" + d.groupNum).attr("x", newX-18);
    $("#collab_btn_" + d.groupNum).attr("x", newX - 38);
    taskRect.attr("width", newX - leftX);
    updateTime(d.groupNum);

    var indexOfJSON = getEventJSONIndex(d.groupNum);
    var numEventMembers = flashTeamsJSON["events"][indexOfJSON].members.length;
    for (i = 1; i <= numEventMembers; i++) {
        $("#event_" + d.groupNum + "_eventMemLine_" + i).attr("width", (newX - leftX-4));
    }
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

    //Find the start time
    var startHr = (snapX-(snapX%100))/100;
    var startMin = (snapX%100)/25*15;
    if(startMin == 57.599999999999994) {
        startHr++;
        startMin = 0;
    } else startMin += 2.4
    var startTimeinMinutes = (startHr*60) + startMin;

    //D3, Exit to Remove Deleted Data
    task_g = timeline_svg.selectAll(".task_g").data(task_groups, function(d) {return d.id});
    task_g.exit().remove();

    addEventPopover(startHr, startMin);

    var newEvent = {"title":"New Event", "id":event_counter, "startTime": startTimeinMinutes, "duration":60, "members":[], "dri":"", "notes":""};
    flashTeamsJSON.events.push(newEvent);
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
        .call(drag);

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

    //Add title text
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

    //Add duration text
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


    //Add the 2 Interaction Buttons: Handoff and Collaboration
    var handoff_btn = task_g.append("image")
        .attr("xlink:href", "images/rightArrow.png")
        .attr("class", "handoff_btn")
        .attr("id", function(d) {return "handoff_btn_" + event_counter;})
        .attr("width", 16)
        .attr("height", 16)
        .attr("x", function(d) {return d.x+RECTANGLE_WIDTH-18})
        .attr("y", function(d) {return d.y+23})
        .on("click", writeHandoff);
    var collab_btn = task_g.append("image")
        .attr("xlink:href", "images/doubleArrow.png")
        .attr("class", "collab_btn")
        .attr("id", function(d) {return "collab_btn_" + event_counter;})
        .attr("width", 16)
        .attr("height", 16)
        .attr("x", function(d) {return d.x+RECTANGLE_WIDTH-38; })
        .attr("y", function(d) {return d.y+23})
        .on("click", writeCollaboration);

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

function redraw(group, newWidth, gNum) {
    var d3Group = d3.select(group)
    d3Group.selectAll(".task_rectangle")
        .attr("x", function(d) {return d.x})
        .attr("y", function(d) {return d.y});
    d3Group.selectAll(".rt_rect")
        .attr("x", function(d) {return d.x + newWidth})
        .attr("y", function(d) {return d.y});
    d3Group.selectAll(".lt_rect")
        .attr("x", function(d) {return d.x}) 
        .attr("y", function(d) {return d.y});
    d3Group.selectAll(".title_text")
        .attr("x", function(d) {return d.x + 10})
        .attr("y", function(d) {return d.y + 14});
    d3Group.selectAll(".time_text")
        .attr("x", function(d) {return d.x + 10})
        .attr("y", function(d) {return d.y + 26});
    d3Group.selectAll(".acronym_text")
        .attr("x", function(d) {return d.x + 10})
        .attr("y", function(d) {return d.y + RECTANGLE_HEIGHT - 10});
    d3Group.selectAll(".handoff_btn")
        .attr("x", function(d) {return d.x + newWidth - 18})
        .attr("y", function(d) {return d.y + 23});
    d3Group.selectAll(".collab_btn")
        .attr("x", function(d) {return d.x + newWidth - 38})
        .attr("y", function(d) {return d.y + 23});

    //Redraw member lines
    var indexOfJSON = getEventJSONIndex(gNum);
    for (i = 1; i <= flashTeamsJSON["events"][indexOfJSON].members.length; i++) {
        $("#event_" + gNum + "_eventMemLine_" + i)
            .attr("x", function(d) {return ($("#rect_" + gNum)[0].x.animVal.value + 8); })
            .attr("y", function(d) {return ($("#rect_" + gNum)[0].y.animVal.value + 40 + ((i-1)*8))});
    }
}

function addEventPopover(startHr, startMin) {
    //Add Popovers
    timeline_svg.selectAll("#rect_" + event_counter).each(
        function(d) {
            $(this).popover({
                placement: "right",
                html: "true",
                class: "event",
                style: "width: 650",
                id: '"popover' + event_counter + '"',
                trigger: "click",
                title: '<input type ="text" name="eventName" id="eventName_' + event_counter + '" placeholder="New Event" >',
                content: '<form name="eventForm_' + event_counter + '">'
                +'<b>Event Start:          </b>' 
                +'<input type="number" id="startHr_' + event_counter + '" placeholder="' + startHr + '" min="0" style="width:35px">'
                +'<input type="number" id="startMin_' + event_counter + '" placeholder="' + startMin + '" min="0" step="15" max="45" style="width:35px"><br>'
                +'<b>Total Runtime: </b><br>' 
                +'Hours: <input type = "number" id="hours_' + event_counter + '" placeholder="1" min="0" style="width:35px"/>          ' 
                +'Minutes: <input type = "number" id = "minutes_' + event_counter + '" placeholder="00" style="width:35px" min="0" step="15" max="45"/><br>'
                +'<br>Members<br><input class="eventMemberInput" id="eventMember_' + event_counter + '" style="width:140px" type="text" name="members" onclick="addMemAuto()">'
                +'<button class="btn" type="button" onclick="addEventMember(' + event_counter +')">+Add</button>'
                +'<ul class="nav nav-pills" id="eventMembers_' + event_counter + '"> </ul>'
                +'Notes: <textarea rows="3" id="notes_' + event_counter + '"> </textarea>'
                +'<br><br><p><button type="button" id="delete" onclick="deleteRect(' + event_counter +');">Delete</button>       ' 
                +'<button type="button" id="save" onclick="saveEventInfo(' + event_counter + ');">Save</button> </p>' 
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

function saveEventInfo (popId) {
    //Update title
    var newTitle = $("#eventName_" + popId).val();
    if (!newTitle == "") $("#title_text_" + popId).text(newTitle);
    else newTitle = $("#eventName_" + popId).attr("placeholder");

    //Get Start Time
    var startHour = $("#startHr_" + popId).val();    
    if (startHour == "") startHour = parseInt($("#startHr_" + popId).attr("placeholder"));
    var startMin = $("#startMin_" + popId).val();
    if (startMin == "") startMin = parseInt($("#startMin_" + popId).attr("placeholder"));

    //Update width
    var newHours = $("#hours_" + popId).val();
    var newMin = $("#minutes_" + popId).val();
    if (newHours == "") newHours = parseInt($("#hours_" + popId)[0].placeholder);
    if (newMin == "") newMin = parseInt($("#minutes_" + popId)[0].placeholder);
    var newWidth = (newHours * 100) + (newMin/15*25);
    updateWidth(popId, newHours, newMin);
    updateStartPlace(popId, startHour, startMin, newWidth);

    //Update event members
    //NEED TO DO

    //Update Popover
    updateEventPopover(popId, newTitle, startHour, startMin, newHours, newMin);

    $("#rect_" + popId).popover("hide");

    //Update JSON
    var indexOfJSON = getEventJSONIndex(popId);
    flashTeamsJSON["events"][indexOfJSON].eventName = newTitle;
    flashTeamsJSON["events"][indexOfJSON].hours = newHours;
    flashTeamsJSON["events"][indexOfJSON].minutes = newMin;
    flashTeamsJSON["events"][indexOfJSON].eventName = newTitle;
};

function deleteRect (rectId) {
    $("#rect_" + rectId).popover("destroy");
    $("#rect_" + rectId).remove();
    $("#lt_rect_" + rectId).remove();
    $("#rt_rect_" + rectId).remove();
    $("#title_text_" + rectId).remove();
    $("#time_text_" + rectId).remove();
    $("#acronym_text_" + rectId).remove();
    $("#collab_btn_" + rectId).remove();
    $("#handoff_btn_" + rectId).remove();

    //Remove from JSON
    var indexOfJSON = getEventJSONIndex(rectId);
    flashTeamsJSON["events"].splice(indexOfJSON, 1);
};

function addEventMember(eventId) {
    var memberName = $("#eventMember_" + eventId).val();

    //Update JSON
    var indexOfJSON = getEventJSONIndex(eventId);
    flashTeamsJSON["events"][indexOfJSON].members.push(memberName);
    var numMembers = flashTeamsJSON["events"][indexOfJSON].members.length;
    $("#eventMembers_" + eventId).append('<li class="active" id="event_' + eventId + '_eventMemPill_' + numMembers + '"><a>' + memberName 
        + '<div class="close" onclick="deleteEventMember(' + eventId + ', ' + numMembers + ', &#39' + memberName + '&#39)">  X</div> </a><li>');

    //Grab color of member
    var newColor;
    for (i = 0; i < flashTeamsJSON["members"].length; i++) {
        if (flashTeamsJSON["members"][i].role == memberName) {
            newColor = flashTeamsJSON["members"][i].color;
        }
    }
    var pillLi = document.getElementById("event_" + eventId + "_eventMemPill_" + numMembers);
    pillLi.childNodes[0].style.backgroundColor = newColor;

    //Add new line to represent member
    var group = $("#rect_" + eventId)[0].parentNode;
    var thisGroup = d3.select(group);
    thisGroup.append("rect")
        .attr("class", "member_line")
        .attr("id", function(d) {
            return "event_" + eventId + "_eventMemLine_" + numMembers;
        })
        .attr("x", function(d) {
            return parseInt($("#rect_" + eventId).attr("x")) + 8;})
        .attr("y", function(d) {
            return parseInt($("#rect_" + eventId).attr("y")) + 40 + ((numMembers-1)*8);})
        .attr("groupNum", eventId)
        .attr("height", 5)
        .attr("width", function(d) {
            return parseInt($("#rect_" + eventId).attr("width")) - 8;})
        .attr("fill", newColor)
        .attr("fill-opacity", .9);
    //Clear Input
    $("#eventMember_" + eventId).val("");
}

function deleteEventMember(eventId, memberNum, memberName) {
    //Delete the pill and line
    $("#event_" + eventId + "_eventMemPill_" + memberNum).remove();
    $("#event_" + eventId + "_eventMemLine_" + memberNum).remove();

    //Update the JSON
    var indexOfJSON = getEventJSONIndex(eventId);
    for (i = 0; i < flashTeamsJSON["events"][indexOfJSON].members.length; i++) {
        if (flashTeamsJSON["events"][indexOfJSON].members[i] == memberName) {
            flashTeamsJSON["events"][indexOfJSON].members.splice(i, 1);
        }
    }
}

//Updates the physical task rectangle representation of start and duration, also update JSON
function updateTime(idNum) {
    var eventLength = $("#rect_" + idNum)[0].width.animVal.value;
    var hours = Math.floor(eventLength/100);
    if (hours == 0) var minutes = (eventLength)/25*15;
    else var minutes = (eventLength%(hours*100))/25*15;
    
    $("#time_text_" + idNum).text(hours + "hrs " + minutes + "min");

    $("#rect_" + idNum).popover("show");
    var title = $("#eventName_" + idNum).attr("placeholder");
    var startHr = $("#startHr_" + idNum).attr("placeholder");
    var startMin = $("#startMin_" + idNum).attr("placeholder");
    updateEventPopover(idNum, title, startHr, startMin, hours, minutes);
    $("#rect_" + idNum).popover("hide");

    //Update JSON
    var indexOfJSON = getEventJSONIndex(idNum);
    flashTeamsJSON["events"][indexOfJSON].duration = (hours*60) + minutes;
    flashTeamsJSON["events"][indexOfJSON].startTime = (startHr*60) + startMin;
}

function updateStartPlace(idNum, startHr, startMin, width) {
    var newX = (startHr*100) + (startMin/15*25) - 4;
    $("#rect_" + idNum).attr("x", newX);
    $("#rt_rect_" + idNum).attr("x", newX + width);
    $("#lt_rect_" + idNum).attr("x", newX);
    $("#title_text_" + idNum).attr("x", newX + 10);
    $("#time_text_" + idNum).attr("x", newX + 10);
    $("#acronym_text_" + idNum).attr("x", newX + 10);
    $("#handoff_btn_" + idNum).attr("x", newX + width - 18);
    $("#collab_btn_" + idNum).attr("x", newX + width - 38);
}

function updateWidth(idNum, hrs, min) {
    var newWidth = (hrs * 100) + (min/15*25);
    var newX = $("#rect_" + idNum).get(0).x.animVal.value + newWidth;

    $("#rt_rect_" + idNum).attr("x", newX);
    $("#handoff_btn_" + idNum).attr("x", newX-18);
    $("#collab_btn_" + idNum).attr("x", newX-38);

    $("#rect_" + idNum).attr("width", newWidth);
    updateTime(idNum);
}

function updateEventPopover(idNum, title, startHr, startMin, hrs, min) {
    $("#rect_" + idNum).data('popover').options.title = '<input type ="text" name="eventName" id="eventName_' + event_counter + '" placeholder="' + title + '">';

    $("#rect_" + idNum).data('popover').options.content = '<form name="eventForm_' + event_counter + '">'
        +'<b>Event Start</b><br>' 
        +'<input type="number" id="startHr_' + event_counter + '" placeholder="' + startHr + '" min="0" style="width:35px">'
        +'<input type="number" id="startMin_' + event_counter + '" placeholder="' + startMin + '" step="15" max="45" min="0" style="width:35px"><br>'
        +'<b>Total Runtime: </b><br>' 
        +'Hours: <input type = "number" id="hours_' + event_counter + '" placeholder="' + hrs + '" min="0" style="width:35px"/>          ' 
        +'Minutes: <input type = "number" id = "minutes_' + event_counter + '" placeholder="' + min + '" style="width:35px" min="0" step="15" max="45" min="0"/>'
        +'<br>Members<br><input class="eventMemberInput" id="eventMember_' + event_counter + '" style="width:140px" type="text" name="members" onclick="addMemAuto()">'
        +'<button class="btn" type="button" onclick="addEventMember(' + event_counter +')">+Add</button>'
        +'<ul class="nav nav-pills" id="eventMembers_' + event_counter + '"> </ul>'
        +'Notes: <textarea rows="3" id="notes_' + event_counter + '"> </textarea>'
        +'<br><br><p><button type="button" id="delete" onclick="deleteRect(' + event_counter +');">Delete</button>       ' 
        +'<button type="button" id="save" onclick="saveEventInfo(' + event_counter + ');">Save</button> </p>' 
        +'</form>';

    var indexOfJSON = getEventJSONIndex(idNum);
}

function writeHandoff() {
    console.log("Trying to write a handoff");
    var m = d3.mouse(this);
    console.log("x: " + m[0] + " y: " + m[1]);
    line = timeline_svg.append("line")
        .attr("x1", m[0])
        .attr("y1", m[1])
        .attr("x2", m[0])
        .attr("y2", m[1])
        .attr("stroke-width", 2)
        .attr("stroke", "black");
    
    timeline_svg.on("mousemove", handoffMouseMove);
}

function handoffMouseMove() {
    console.log("in da mousemove");
    var m = d3.mouse(this);
    line.attr("x2", m[0])
        .attr("y2", m[1]);

    timeline_svg.on("click", handoffMouseClick);
}

function handoffMouseClick() {
    timeline_svg.on("mousemove", null);
}

function writeCollaboration() {
    console.log("Trying to write a collaboration");

}

function getEventJSONIndex(idNum) {
    for (i = 0; i < flashTeamsJSON["events"].length; i++) {
        if (flashTeamsJSON["events"][i].id == idNum) {
            return i;
        }
    }
}




