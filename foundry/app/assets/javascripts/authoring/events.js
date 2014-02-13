/* events.js
 * ---------------------------------------------
 * 
 */

 var RECTANGLE_WIDTH = 100,
    RECTANGLE_HEIGHT = 100;

var event_counter = 0;

var DRAGBAR_WIDTH = 8;

// leftResize: resize the rectangle by dragging the left handle
function leftResize(d) {
    var taskRect = timeline_svg.selectAll("#rect_" + d.groupNum);
    var rightX = $("#rt_rect_" + d.groupNum).get(0).x.animVal.value;
    var dragX = d3.event.x - (d3.event.x%(X_WIDTH)) - DRAGBAR_WIDTH/2;
    var newX = Math.max(0, Math.min(rightX - 50, dragX));
    taskRect.attr("x", newX);

    //Update task rectangle graphics
    $("#lt_rect_" + d.groupNum).attr("x", newX - DRAGBAR_WIDTH/2 + 4);
    $("#title_text_" + d.groupNum).attr("x", newX + 10);
    $("#time_text_" + d.groupNum).attr("x", newX + 10);
    taskRect.attr("width", rightX - newX);
    updateTime(d.groupNum);

    //Update event member lines
    var indexOfJSON = getEventJSONIndex(d.groupNum);
    var numEventMembers = flashTeamsJSON["events"][indexOfJSON].members.length;
    for (i = 1; i <= numEventMembers; i++) {
        $("#event_" + d.groupNum + "_eventMemLine_" + i).attr("x", (newX+4));
        $("#event_" + d.groupNum + "_eventMemLine_" + i).attr("width", (rightX - newX - 4));        
    }

    //Update popover
    $("#rect_" + d.groupNum).popover("show");
    var hrs = Math.floor(((rightX-newX)/100));
    var min = (((rightX-newX)%(Math.floor(((rightX-newX)/100))*100))/25*15);
    var title = $("#eventName_" + d.groupNum).attr("placeholder");
    var startHr = Math.floor(newX/100);
    var startMin = newX%100/25*15;
    if(startMin == 57.599999999999994) {
        startHr++;
        startMin = 0;
    } else startMin += 2.41
    startMin = Math.floor(startMin);
    $("#rect_" + d.groupNum).popover("hide");
    var eventNotes = flashTeamsJSON["events"][getEventJSONIndex(d.groupNum)].notes;
    updateEventPopover(d.groupNum, title, startHr, startMin, hrs, min, eventNotes);
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
        $("#event_" + d.groupNum + "_eventMemLine_" + i).attr("width", (newX-leftX-8));        
    }
}

//Called when the right dragbar of a task rectangle is dragged
var drag_right = d3.behavior.drag()
    .on("drag", rightResize);

//Called when the left dragbar of a task rectangle is dragged
var drag_left = d3.behavior.drag()
    .on("drag", leftResize);

//VCom Calculates where to snap event block to when created
function calcSnap(mouseX, mouseY) {
    var snapX = Math.floor(mouseX - (mouseX%50) - DRAGBAR_WIDTH/2),
        snapY = Math.floor(mouseY/RECTANGLE_HEIGHT) * RECTANGLE_HEIGHT;
    return [snapX, snapY];
}

//Draws event and adds it to the JSON when the timeline is clicked and overlay is off
function mousedown() {
    //WRITE IF CASE, IF INTERACTION DRAWING, STOP
    if(DRAWING_HANDOFF==true || DRAWING_COLLAB==true) {
        alert("Please click on another event or the same event to cancel");
        return;
    }
    event_counter++; //To generate id
    var point = d3.mouse(this);
    
    var snapPoint = calcSnap(point[0], point[1]);
    var groupNum = drawEvents(snapPoint[0], snapPoint[1], null, null, null);
    fillPopover(snapPoint[0], groupNum, true, null, null);
};

timeline_svg.append("rect")
    .attr("class", "background")
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT)
    .attr("fill", "white")
    .attr("fill-opacity", 0)
    .on("mousedown", mousedown);

function addEvent() {
    event_counter++;
    var point = [0,0];
    var snapPoint = calcSnap(point[0], point[1]);
    var groupNum = drawEvents(snapPoint[0], snapPoint[1], null, null, null);
    fillPopover(snapPoint[0], groupNum, true, null, null);
}

//Creates graphical elements from array of data (task_rectangles)
function  drawEvents(x, y, d, title, totalMinutes) {
    if (title == null) {
        title = "New Event";
    }
    if (totalMinutes == null) {
        totalMinutes = 60;
    }

    var numHoursInt = Math.floor(totalMinutes/60);
    var numHoursDec = totalMinutes/60;
    var minutesLeft = totalMinutes%60;
    
    var task_g;
    var groupNum;
    if (d === null) {
        task_g = timeline_svg.append("g")
        .data([{x: x, y: y+17, id: "task_g_" + event_counter, class: "task_g", groupNum: event_counter, completed: false}]);
        groupNum = event_counter;
    } else {
        task_g = timeline_svg.append("g").data(d);
        groupNum = d[0].groupNum;
   }

    //Task Rectangle, Holds Event Info
    var task_rectangle = task_g.append("rect")
        .attr("class", "task_rectangle")
        .attr("x", function(d) {return d.x})
        .attr("y", function(d) {return d.y})
        .attr("id", function(d) {
            return "rect_" + groupNum; })
        .attr("groupNum", groupNum)
        .attr("height", RECTANGLE_HEIGHT)
        .attr("width", RECTANGLE_WIDTH*numHoursDec)
        .attr("fill", "#C9C9C9")
        .attr("fill-opacity", .6)
        .attr("stroke", "#5F5A5A")
        .attr('pointer-events', 'all')
        .on("click", function(d) {
            drawInteraction(d.groupNum) })
        .call(drag);

    //Right Dragbar
    var rt_rect = task_g.append("rect")
        .attr("class", "rt_rect")
        .attr("x", function(d) { 
            return d.x + RECTANGLE_WIDTH*numHoursDec; })
        .attr("y", function(d) {return d.y})
        .attr("id", function(d) {
            return "rt_rect_" + groupNum; })
        .attr("groupNum", groupNum)
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
            return "lt_rect_" + groupNum; })
        .attr("groupNum", groupNum)
        .attr("height", RECTANGLE_HEIGHT)
        .attr("width", DRAGBAR_WIDTH)
        .attr("fill", "#00")
        .attr("fill-opacity", .6)
        .attr('pointer-events', 'all')
        .call(drag_left);

    //Add title text
    var title_text = task_g.append("text")
        .text(function (d) {
            return title;
        })
        .attr("class", "title_text")
        .attr("id", function(d) { return "title_text_" + groupNum; })
        .attr("groupNum", groupNum)
        .attr("x", function(d) {return d.x + 10})
        .attr("y", function(d) {return d.y + 14})
        .attr("font-weight", "bold")
        .attr("font-size", "12px");

    //Add duration text
    var time_text = task_g.append("text")
        .text(function (d) {
            return numHoursInt+"hrs "+minutesLeft+"min";
        })
        .attr("class", "time_text")
        .attr("id", function(d) {return "time_text_" + groupNum;})
        .attr("groupNum", groupNum)
        .attr("x", function(d) {return d.x + 10})
        .attr("y", function(d) {return d.y + 26})
        .attr("font-size", "12px");

    //Add the 2 Interaction Buttons: Handoff and Collaboration
    var handoff_btn = task_g.append("image")
        .attr("xlink:href", "/assets/rightArrow.png")
        .attr("class", "handoff_btn")
        .attr("id", function(d) {return "handoff_btn_" + groupNum;})
        .attr("groupNum", groupNum)
        .attr("width", 16)
        .attr("height", 16)
        .attr("x", function(d) {return d.x+RECTANGLE_WIDTH*numHoursDec-18})
        .attr("y", function(d) {return d.y+23})
        .on("click", writeHandoff);
    var collab_btn = task_g.append("image")
        .attr("xlink:href", "/assets/doubleArrow.png")
        .attr("class", "collab_btn")
        .attr("id", function(d) {return "collab_btn_" + groupNum;})
        .attr("groupNum", groupNum)
        .attr("width", 16)
        .attr("height", 16)
        .attr("x", function(d) {return d.x+RECTANGLE_WIDTH*numHoursDec-38; })
        .attr("y", function(d) {return d.y+23})
        .on("click", writeCollaboration);

    task_groups.push(task_g);

    return groupNum;
};

//Redraw a single task rectangle after it is dragged
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
};

//Delete a task rectangle, all of its relevant components, and remove the event from the JSON
function deleteRect (rectId) {
    $("#rect_" + rectId).popover("destroy");
    $("#rect_" + rectId).remove();
    $("#lt_rect_" + rectId).remove();
    $("#rt_rect_" + rectId).remove();
    $("#title_text_" + rectId).remove();
    $("#time_text_" + rectId).remove();
    $("#collab_btn_" + rectId).remove();
    $("#handoff_btn_" + rectId).remove();

    var indexOfJSON = getEventJSONIndex(rectId);
    for (i = 1; i <= flashTeamsJSON["events"][indexOfJSON].members.length; i++) {
        $("#event_" + rectId + "_eventMemLine_" + i).remove();
    }
    //Remove from JSON
    flashTeamsJSON["events"].splice(indexOfJSON, 1);
};

//Add one of the team members to an event, includes a bar to represent it on the task rectangle
//and a pill in the popover that can be deleted, both of the specified color of the member
function addEventMember(eventId, memberIndex) {
    var memberName = flashTeamsJSON["members"][memberIndex].role;
    console.log("Adding member ", memberName);
    //Update JSON
    var indexOfEvent = getEventJSONIndex(eventId);
    flashTeamsJSON["events"][indexOfEvent].members.push(memberName);
    var numMembers = flashTeamsJSON["events"][indexOfEvent].members.length;

    //Grab color of member
    var newColor;
    for (i = 0; i < flashTeamsJSON["members"].length; i++) {
        if (flashTeamsJSON["members"][i].role == memberName) newColor = flashTeamsJSON["members"][i].color;
    }

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

    //Change color of rect
    for (i = 0; i < flashTeamsJSON["members"].length; i++) {
         if (flashTeamsJSON["members"][i].role == memberName){
             if (i == current){
                 $("#rect_" + eventId).attr("fill", newColor)
                     .attr("fill-opacity", .4);   
             }
         } 
     }
}

//Remove a team member from an event
function deleteEventMember(eventId, memberNum, memberName) {
    //Delete the line
    $("#event_" + eventId + "_eventMemLine_" + memberNum).remove();
    if (memberNum == current){
         $("#rect_" + eventId).attr("fill", "#C9C9C9")
     }

    //Update the JSON
    var indexOfJSON = getEventJSONIndex(eventId);
    for (i = 0; i < flashTeamsJSON["events"][indexOfJSON].members.length; i++) {
        if (flashTeamsJSON["events"][indexOfJSON].members[i] == memberName) {
            flashTeamsJSON["events"][indexOfJSON].members.splice(i, 1);
            //START HERE IF YOU WANT TO SHIFT UP MEMBER LINES AFTER DELETION
            break;
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
    var eventNotes = flashTeamsJSON["events"][getEventJSONIndex(idNum)].notes;
    updateEventPopover(idNum, title, startHr, startMin, hours, minutes, eventNotes);
    $("#rect_" + idNum).popover("hide");

    //Update JSON
    var indexOfJSON = getEventJSONIndex(idNum);
    flashTeamsJSON["events"][indexOfJSON].duration = (hours*60) + minutes;
    flashTeamsJSON["events"][indexOfJSON].startTime = parseInt((startHr*60)) + parseInt(startMin);
}

//Change the starting location of a task rectangle and its relevant components when the user changes info in the popover
function updateStartPlace(idNum, startHr, startMin, width) {
    var newX = (startHr*100) + (startMin/15*25) - 4;
    $("#rect_" + idNum).attr("x", newX);
    $("#rt_rect_" + idNum).attr("x", newX + width);
    $("#lt_rect_" + idNum).attr("x", newX);
    $("#title_text_" + idNum).attr("x", newX + 10);
    $("#time_text_" + idNum).attr("x", newX + 10);
    $("#handoff_btn_" + idNum).attr("x", newX + width - 18);
    $("#collab_btn_" + idNum).attr("x", newX + width - 38);

    var indexOfJSON = getEventJSONIndex(idNum);
    for (i = 1; i <= flashTeamsJSON["events"][indexOfJSON].members.length; i++) {
        $("#event_" + idNum + "_eventMemLine_" + i).attr("x", newX+8);
    }
}

//Update the width and total runtime of an event when a user changes the info in the popover
function updateWidth(idNum, hrs, min) {
    var newWidth = (hrs * 100) + (min/15*25);
    var newX = $("#rect_" + idNum).get(0).x.animVal.value + newWidth;

    $("#rt_rect_" + idNum).attr("x", newX);
    $("#handoff_btn_" + idNum).attr("x", newX-18);
    $("#collab_btn_" + idNum).attr("x", newX-38);

    var indexOfJSON = getEventJSONIndex(idNum);
    for (i = 1; i <= flashTeamsJSON["events"][indexOfJSON].members.length; i++) {
        $("#event_" + idNum + "_eventMemLine_" + i).attr("width", newWidth-8);
    }

    $("#rect_" + idNum).attr("width", newWidth);
    updateTime(idNum);
}