/* events.js
 * ---------------------------------------------
 * 
 */

 var RECTANGLE_WIDTH = 100,
    RECTANGLE_HEIGHT = 90;

var ROW_HEIGHT = 100;

var event_counter = 0;

var DRAGBAR_WIDTH = 8;

$(document).ready(function(){
    timeline_svg.append("rect")
    .attr("class", "background")
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT)
    .attr("fill", "white")
    .attr("fill-opacity", 0)
    .on("mousedown", mousedown);
});

// leftResize: resize the rectangle by dragging the left handle
function leftResize(d) {

    if(isUser) { // user page
        return;
    }
    var groupNum = d.groupNum;
    var indexOfJSON = getEventJSONIndex(d.groupNum);
    var ev = flashTeamsJSON["events"][indexOfJSON];

    var taskRect = timeline_svg.selectAll("#rect_" + groupNum);
    var rightX = $("#rt_rect_" + groupNum).get(0).x.animVal.value;
    var dragX = d3.event.x - (d3.event.x%(X_WIDTH)) - DRAGBAR_WIDTH/2;
    var newX = Math.max(0, Math.min(rightX - 50, dragX));

    ev.x = newX;

    //Check for interactions, delete
    for (var i = 0; i < flashTeamsJSON["interactions"].length; i++) {
        var interaction = flashTeamsJSON["interactions"][i];
        if (interaction.event1 == d.groupNum || interaction.event2 == d.groupNum) {
            deleteInteraction(interaction.id);
            //ADD WARNING THAT THEY DELETED B/C THEY MOVED
        }
    }

    var startTimeObj = getStartTime(newX);
    ev.startTime = startTimeObj["startTime"];
    ev.startHr = startTimeObj["startHr"];
    ev.startMin = startTimeObj["startMin"];

    var durationObj = getDuration(newX, rightX);
    ev.duration = durationObj["duration"];

    $(this).attr("x", newX);
    $("#title_text_" + d.groupNum).attr("x", newX + 10);
    $("#time_text_" + d.groupNum).attr("x", newX + 10);
    $("#handoffs_" + d.groupNum).attr("x", newX + 10);
    taskRect.attr("width", rightX - newX);
    taskRect.attr("x", newX);
    updateTime(d.groupNum);

    flashTeamsJSON["events"][indexOfJSON] = ev;
    console.log("runtime: " + flashTeamsJSON["events"][indexOfJSON].duration);

    //drawEvent(ev);
}

// rightResize: resize the rectangle by dragging the right handle
function rightResize(d) {
    if(isUser) { // user page
        return;
    }
    var taskRect = timeline_svg.selectAll("#rect_" + d.groupNum);
    var leftX = $("#lt_rect_" + d.groupNum).get(0).x.animVal.value;
    var dragX = d3.event.x - (d3.event.x%(X_WIDTH)) - (DRAGBAR_WIDTH/2);
    var newX = Math.max(leftX + 50, Math.min(dragX, SVG_WIDTH));

    //Update position of latter half of event items
    $(this).attr("x", newX);
    $("#handoff_btn_" + d.groupNum).attr("x", newX-18);
    $("#collab_btn_" + d.groupNum).attr("x", newX - 38);
    taskRect.attr("width", newX - leftX);
    updateTime(d.groupNum);

    //Check for interactions, delete
    for (i = 0; i < flashTeamsJSON["interactions"].length; i++) {
        var interaction = flashTeamsJSON["interactions"][i];
        if (interaction.event1 == d.groupNum || interaction.event2 == d.groupNum) {
            deleteInteraction(interaction.id);
            //ADD WARNING THAT THEY DELETED B/C THEY MOVED
        }
    }

    //Update JSON
    var indexOfJSON = getEventJSONIndex(d.groupNum);
    var numEventMembers = flashTeamsJSON["events"][indexOfJSON].members.length;
    for (i = 1; i <= numEventMembers; i++) {
        $("#event_" + d.groupNum + "_eventMemLine_" + i).attr("width", (newX-leftX-8));        
    }
}

//Called when task rectangles are dragged
var drag = d3.behavior.drag()
    .origin(Object)
    .on("drag", function (d) {
        if(isUser) { // user page
            return;
        }

        if (DRAWING_HANDOFF || DRAWING_COLLAB) {
            return;
        }
        var group = this.parentNode;
        var oldX = d.x;
        var groupNum = this.id.split("_")[1];
        var rectWidth = $("#rect_" + groupNum)[0].width.animVal.value;

        //Horizontal draggingx
        var dragX = d3.event.x - (d3.event.x%(X_WIDTH)) - DRAGBAR_WIDTH/2;
        var newX = Math.max((0 - (DRAGBAR_WIDTH/2)), Math.min(SVG_WIDTH-rectWidth, dragX));
        if (d3.event.dx + d.x < 0) newX = (0 - (DRAGBAR_WIDTH/2));
        d.x = newX;

        //Update event popover
        if (d.x == (0 - (DRAGBAR_WIDTH/2))) var startHour = 0;
        else var startHour = Math.floor((d.x/100));
        
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
        var eventNotes = flashTeamsJSON["events"][getEventJSONIndex(groupNum)].notes;
        //updateEventPopover(groupNum, title, startHour, startMin, hours, min, eventNotes);  
        $("#rect_" + groupNum).popover("hide");

        //Vertical Dragging
        var dragY = d3.event.y - (d3.event.y%(ROW_HEIGHT)) + 17 + 5;
        var newY = Math.min(SVG_HEIGHT - ROW_HEIGHT, dragY);
        if (d3.event.dy + d.y < 20) d.y = 17;
        else d.y = newY;

        //Check for interactions, delete
        for (i = 0; i < flashTeamsJSON["interactions"].length; i++) {
            var interaction = flashTeamsJSON["interactions"][i];
            if (interaction.event1 == groupNum || interaction.event2 == groupNum) {
                deleteInteraction(interaction.id);
                //ADD WARNING THAT THEY DELETED B/C THEY MOVED
            }
        }
        
        //Redraw event
        redraw(group, rectWidth, groupNum);
        //Update JSON
        var indexOfJSON = getEventJSONIndex(groupNum);
        flashTeamsJSON["events"][indexOfJSON].startHr = startHour
        flashTeamsJSON["events"][indexOfJSON].startMin = startMin
        flashTeamsJSON["events"][indexOfJSON].startTime = (startHour*60 + startMin);
        flashTeamsJSON["events"][indexOfJSON].x = newX;
        flashTeamsJSON["events"][indexOfJSON].y = Math.floor(newY/ROW_HEIGHT) * ROW_HEIGHT + 5;
        updateStatus(false);
    });

//Called when the right dragbar of a task rectangle is dragged
var drag_right = d3.behavior.drag()
    .on("drag", rightResize);

//Called when the left dragbar of a task rectangle is dragged
var drag_left = d3.behavior.drag()
    .on("drag", leftResize);
    
//VCom Calculates where to snap event block to when created
function calcSnap(mouseX, mouseY) {
    var snapX = Math.floor(mouseX - (mouseX%50) - DRAGBAR_WIDTH/2),
        snapY = Math.floor(mouseY/ROW_HEIGHT) * ROW_HEIGHT + 5;
    return [snapX, snapY];
}

// mousedown on timeline => creates new event and draws it
function mousedown() {
    // interactions
    if(DRAWING_HANDOFF==true || DRAWING_COLLAB==true) {
        alert("Please click on another event or the same event to cancel");
        return;
    }

    if (d3.event.button != 0) { //don't do anything if not left click
        return;
    }

    if (overlayIsOn) {
        overlayOff();
        return;
    } 

    //Close all open popovers
    for (i = 0; i<flashTeamsJSON["events"].length; i++) {
        var idNum = flashTeamsJSON["events"][i].id;
        $(timeline_svg.selectAll("g#g_"+idNum)[0][0]).popover('hide');
    }

    if(isUser) { // user page
        return;
    }

    // get mouse coords
    var point = d3.mouse(this);

    // get coords where event should snap to
    var snapPoint = calcSnap(point[0], point[1]);
  
    if(!checkWithinTimelineBounds(snapPoint)){ return; }

    // create event
    var eventObj = createEvent(snapPoint);
    
    // render event
    drawEvent(eventObj);
    
    // render event popover
    drawPopover(eventObj, true, true);

    // save
    updateStatus(false);
};

function checkWithinTimelineBounds(snapPoint) {
    return ((snapPoint[1] < 505) && (snapPoint[0] < 2396));
};

function getStartTime(mouseX) {
    var startHr = (mouseX-(mouseX%100))/100;
    var startMin = (mouseX%100)/25*15;
    if(startMin == 57.599999999999994) {
        startHr++;
        startMin = 0;
    } else startMin += 2.4
    var startTimeinMinutes = parseInt((startHr*60)) + parseInt(startMin);

    return {"startHr":startHr, "startMin":startMin, "startTimeinMinutes":startTimeinMinutes};
};

function getDuration(leftX, rightX) {
    var hrs = Math.floor(((rightX-leftX)/100));
    var min = (((rightX-leftX)%(Math.floor(((rightX-leftX)/100))*100))/25*15);
    var durationInMinutes = parseInt((hrs*60)) + parseInt(min);

    return {"duration":durationInMinutes, "hrs":hrs, "min":min};
};

function createEvent(snapPoint) {
    event_counter++;
    var startTimeObj = getStartTime(snapPoint[0]);
    var newEvent = {"title":"New Event", "id":event_counter, "x": snapPoint[0], "y": snapPoint[1], 
        "startTime": startTimeObj["startTimeinMinutes"], "duration":60, "members":[], 
        "dri":"", "notes":"", "startHr": startTimeObj["startHr"], 
        "startMin": startTimeObj["startMin"], "gdrive":[], "completed_x":null};
      //add new event to flashTeams database
    if (flashTeamsJSON.events.length == 0){
        createNewFolder($("#flash_team_name").val());
    }
    flashTeamsJSON.events.push(newEvent);
    return newEvent;
};

function getEventFromId(id) {
    var events = flashTeamsJSON.events;
    for(var i=0;i<events.length;i++){
        var ev = events[i];
        if(ev.id == id){
            return ev;
        }
    }
    return null;
};

function updateEvent(id, dataObj) {
    var ev = getEventFromId(id);
    if(!ev){
        return;
    }

    if(dataObj["title"]){
        ev["title"] = dataObj["title"];
    }
    if(dataObj["x"]){
        ev["x"] = dataObj["x"];
    }
    if(dataObj["y"]){
        ev["y"] = dataObj["y"];
    }
    if(dataObj["startTime"]){
        ev["startTime"] = dataObj["startTime"];
    }
    if(dataObj["duration"]){
        ev["duration"] = dataObj["duration"];
    }
    if(dataObj["members"]){
        ev["members"] = dataObj["members"];
    }
    if(dataObj["dri"]){
        ev["dri"] = dataObj["dri"];
    }
    if(dataObj["notes"]){
        ev["notes"] = dataObj["notes"];
    }
    if(dataObj["startHr"]){
        ev["startHr"] = dataObj["startHr"];
    }
    if(dataObj["startMin"]){
        ev["startMin"] = dataObj["startMin"];
    }
    if(dataObj["gdrive"]){
        ev["gdrive"] = dataObj["gdrive"];
    }
    if(dataObj["completed"]){
        ev["completed"] = dataObj["completed"];
    }

    updateStatus();
};

// TODO: rewrite this
function addEvent() { // events library box in the sidebar
    var point = [0,0];
    var snapPoint = calcSnap(point[0], point[1]);
    var eventObj = createEvent(snapPoint);

    // render event
    drawEvent(eventObj);
    
    // render event popover
    drawPopover(eventObj, true, true);

    // save
    updateStatus(false);
};

function getWidth(ev) {
    var durationInMinutes = ev.duration;
    var hrs = parseFloat(durationInMinutes)/parseFloat(60);
    return hrs*RECTANGLE_WIDTH;
};

//Creates graphical elements from array of data (task_rectangles)
function  drawEvent(eventObj) {
    var title = eventObj["title"];
    var totalMinutes = eventObj["duration"];
    var x = eventObj["x"];
    var y = eventObj["y"];
    var groupNum = eventObj["id"];

    var numHoursInt = Math.floor(totalMinutes/60);
    var numHoursDec = totalMinutes/60;
    var minutesLeft = totalMinutes%60;
    
    // remove any existing task group with same id
    removeTask(groupNum);

    var new_data = {id: "task_g_" + groupNum, class: "task_g", groupNum: groupNum, x: x, y: y+17};
    task_groups.push(new_data);

    console.log(task_groups);

    // create task group
    var task_g = timeline_svg.selectAll("g")
                .data(task_groups, function(d){ return d.groupNum; })
                .enter()
                .append("g")
                .attr("id", "g_" + groupNum);
    
    //Task Rectangle, Holds Event Info
    var task_rectangle = task_g.append("rect")
        .attr("class", "task_rectangle")
        .attr("x", function(d) {return d.x})
        .attr("y", function(d) {return d.y})
        .attr("id", function(d) {
            return "rect_" + groupNum; })
        .attr("groupNum", groupNum)
        .attr("height", RECTANGLE_HEIGHT)
        .attr("width", getWidth(eventObj))
        .attr("fill", "#C9C9C9")
        .attr("fill-opacity", .6)
        .attr("stroke", "#5F5A5A")
        .attr('pointer-events', 'all')
        .on("click", function(d) {
            if (d3.event.defaultPrevented) {
                console.log('drag event already in progress.');
                return;
            }
            eventMousedown(d.groupNum); })
        .call(drag);

    //Right Dragbar
    var rt_rect = task_g.append("rect")
        .attr("class", "rt_rect")
        .attr("x", function(d) { 
            return d.x + getWidth(eventObj); })
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

    //Add gdrive link
    var gdrive_link = task_g.append("text")
        .text("Upload")
        .attr("style", "cursor:pointer; text-decoration:underline; text-decoration:bold;")
        .attr("class", "gdrive_link")
        .attr("id", function(d) {return "handoffs_" + groupNum;})
        .attr("groupNum", groupNum)
        .attr("x", function(d) {return d.x + 10})
        .attr("y", function(d) {return d.y + 38})
        .attr("fill", "blue")
        .attr("font-size", "12px");

    $("#handoffs_" + groupNum).on('click', function(ev){
        ev.stopPropagation();
        
        if (flashTeamsJSON["events"][groupNum-1].gdrive.length > 0){
            window.open(flashTeamsJSON["events"][groupNum-1].gdrive[1])
        }
        else{
            alert("The flash team must be running for you to upload a file!");
        }
    });

    //Add the 2 Interaction Buttons: Handoff and Collaboration
    if(!isUser) { // user page
        var handoff_btn = task_g.append("image")
            .attr("xlink:href", "/assets/rightArrow.png")
            .attr("class", "handoff_btn")
            .attr("id", function(d) {return "handoff_btn_" + groupNum;})
            .attr("groupNum", groupNum)
            .attr("width", 16)
            .attr("height", 16)
            .attr("x", function(d) {return d.x+(getWidth(eventObj))-18})
            .attr("y", function(d) {return d.y+23})
            .on("click", startWriteHandoff);
        $("#handoff_btn_" + groupNum).popover({
            trigger: "click",
            html: true,
            class: "interactionPopover",
            style: "font-size: 8px",
            placement: "right",
            content: "Click another event to draw a handoff. <br>Click on this event to cancel.",
            container: $("#timeline-container")
        });
        $("#handoff_btn_" + groupNum).popover("show");
        $("#handoff_btn_" + groupNum).popover("hide");        
        var collab_btn = task_g.append("image")
            .attr("xlink:href", "/assets/doubleArrow.png")
            .attr("class", "collab_btn")
            .attr("id", function(d) {return "collab_btn_" + groupNum;})
            .attr("groupNum", groupNum)
            .attr("width", 16)
            .attr("height", 16)
            .attr("x", function(d) {return d.x+(getWidth(eventObj))-38; })
            .attr("y", function(d) {return d.y+23})
            .on("click", startWriteCollaboration);
        $("#collab_btn_" + groupNum).popover({
            trigger: "click",
            html: true,
            class: "interactionPopover",
            style: "font-size: 8px",
            placement: "right",
            content: "Click another event to draw a collaboration. <br>Click on this event to cancel.",
            container: $("#timeline-container")
        });
        $("#collab_btn_" + groupNum).popover("show");
        $("#collab_btn_" + groupNum).popover("hide");
    }

    // render the member lines
    renderEventMembers(groupNum);
};

//Redraw a single task rectangle after it is dragged
function redraw(group, newWidth, gNum) {
    var d3Group = d3.select(group);
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

    //console.log("REDRAWING GRDIVE LINK: ");
    //console.log(d3Group.selectAll(".gdrive_link"));
    d3Group.selectAll(".gdrive_link")
        .attr("x", function(d) {return d.x + 10})
        .attr("y", function(d) {return d.y + 38});

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
    destroyPopover(rectId);
    $("#rect_" + rectId).remove();
    $("#lt_rect_" + rectId).remove();
    $("#rt_rect_" + rectId).remove();
    $("#title_text_" + rectId).remove();
    $("#time_text_" + rectId).remove();
    $("#collab_btn_" + rectId).remove();
    $("#handoff_btn_" + rectId).remove();
    $("#handoffs_" + rectId).remove();

    var indexOfJSON = getEventJSONIndex(rectId);
    for (i = 1; i <= flashTeamsJSON["events"][indexOfJSON].members.length; i++) {
        $("#event_" + rectId + "_eventMemLine_" + i).remove();
    }
    //Remove from JSON
    flashTeamsJSON["events"].splice(indexOfJSON, 1);

    updateStatus(false);
    overlayOff();
};

function renderAllEventsMembers() {
    var events = flashTeamsJSON["events"];
    for (var i = 0; i < events.length; i++){
        var ev = events[i];
        console.log("EVENT ID: " + ev.id);
        renderEventMembers(ev.id);
        console.log("rendered event");
    }
};

function renderEventMembers(eventId) {
    // get event
    var ev = flashTeamsJSON["events"][getEventJSONIndex(eventId)];
    $('event_eventMemLine_*');
    // get number of members in the event
    var members = ev.members;
    //remove member lines before redrawing them
    $('[id^="event_' + eventId + '_eventMemLine"]').each(function(){
        this.remove();
    });
    for (var i = 0; i < members.length; i++) {
        // get member information
        var member = members[i];
        var color = member.color;
        var name = member.name;

        // get g in DOM
        var task = getTaskGFromGroupNum(eventId);
        
        // append new line to it
        task.append("rect")
            .attr("class", "member_line")
            .attr("id", function(d) {
                return "event_" + eventId + "_eventMemLine_" + (i+1);
            })
            .attr("x", function(d) {
                return parseInt(ev.x) + 8;})
            .attr("y", function(d) {
                return parseInt(ev.y) + 60 + (i*8);})
            .attr("groupNum", eventId)
            .attr("height", 5)
            .attr("width", function(d) {
                return parseInt(getWidth(ev)) - 8;})
            .attr("fill", color)
            .attr("fill-opacity", .9);

        // change color of rect
        if (current != undefined){
            for (var j = 0; j < flashTeamsJSON["members"].length; j++) {
                console.log('NAME', name);
                 if (flashTeamsJSON["members"][j].role == name){
                     if (j == current){
                        if (currentUserIds.indexOf(eventId) < 0){
                            currentUserIds.push(eventId);
                            currentUserEvents.push(ev);
                        }
                         $("#rect_" + eventId).attr("fill", color)
                             .attr("fill-opacity", .4);   
                    }
                } 
            }
        }
    }
    if ((current != undefined) && (currentUserEvents.length > 0)){
        currentUserEvents = currentUserEvents.sort(function(a,b){return parseInt(a.startTime) - parseInt(b.startTime)});
        upcomingEvent = currentUserEvents[0].id; 
        $("#rect_" + upcomingEvent).attr("fill", color)
            .attr("fill-opacity", .9);  
    }
};

//Add one of the team members to an event, includes a bar to represent it on the task rectangle
//and a pill in the popover that can be deleted, both of the specified color of the member
function addEventMember(eventId, memberIndex) {
    // get details from members array
    var memberName = flashTeamsJSON["members"][memberIndex].role;
    var memberUniq = flashTeamsJSON["members"][memberIndex].uniq;
    var memberColor = flashTeamsJSON["members"][memberIndex].color;

    // get event
    var indexOfEvent = getEventJSONIndex(eventId);

    // add member to event
    flashTeamsJSON["events"][indexOfEvent].members.push({name: memberName, uniq: memberUniq, color: memberColor});

    // render on events
    renderEventMembers(eventId);
}

//Remove a team member from an event
//memberNum is the (index+1) in the member array for that event, NOT the member id number
function deleteEventMember(eventId, memberNum, memberName) {
    //Delete the line
    $("#event_" + eventId + "_eventMemLine_" + memberNum).remove();
    if (memberNum == current){
         $("#rect_" + eventId).attr("fill", "#C9C9C9")
    }
    //Update the JSON
    var indexOfJSON = getEventJSONIndex(eventId);
    for (i = 0; i < flashTeamsJSON["events"][indexOfJSON].members.length; i++) {
        if (flashTeamsJSON["events"][indexOfJSON].members[i]["name"] == memberName) {
            flashTeamsJSON["events"][indexOfJSON].members.splice(i, 1);
            //START HERE IF YOU WANT TO SHIFT UP MEMBER LINES AFTER DELETION
            break;
        }
    }
    renderEventMembers(eventId);
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
    //updateEventPopover(idNum, title, startHr, startMin, hours, minutes, eventNotes);
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