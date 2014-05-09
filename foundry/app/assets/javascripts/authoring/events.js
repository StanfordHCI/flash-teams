/* events.js
 * ---------------------------------------------
 * 
 */

var RECTANGLE_WIDTH = 100;
var RECTANGLE_HEIGHT = 90;
var ROW_HEIGHT = 100;
var DRAGBAR_WIDTH = 8;
var event_counter = 0;

$(document).ready(function(){
    timeline_svg.append("rect")
    .attr("class", "background")
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT)
    .attr("fill", "white")
    .attr("fill-opacity", 0)
    .on("mousedown", function(){
        var point = d3.mouse(this);
        newEvent(point);
    });
});

//Called when the right dragbar of a task rectangle is dragged
var drag_right = d3.behavior.drag()
                .on("drag", rightResize)
                .on("dragend", function(d){
                    var ev = getEventFromId(d.groupNum);
                    drawPopover(ev, true, false);
                    updateStatus(false);
                });

//Called when the left dragbar of a task rectangle is dragged
var drag_left = d3.behavior.drag()
                .on("drag", leftResize)
                .on("dragend", function(d){
                    var ev = getEventFromId(d.groupNum);
                    drawPopover(ev, true, false);
                    updateStatus(false);
                });

//Called when task rectangles are dragged
var drag = d3.behavior.drag()
            .origin(Object)
            .on("drag", dragEvent)
            .on("dragend", function(d){
                var ev = getEventFromId(d.groupNum);
                drawPopover(ev, true, false);
                updateStatus(false);
            });

// leftResize: resize the rectangle by dragging the left handle
function leftResize(d) {
    if(isUser) { // user page
        return;
    }

    // get event id
    var groupNum = d.groupNum;

    // get event object
    var ev = getEventFromId(groupNum);
    
    // get new left x
    var width = getWidth(ev);
    var rightX = ev.x + width;
    var newX = d3.event.x - (d3.event.x%(STEP_WIDTH)) - DRAGBAR_WIDTH/2;
    if(newX < 0){
        newX = 0;
    }
    var newWidth = width + (ev.x - newX);

    // update x and draw event
    ev.x = newX;
    ev.duration = durationForWidth(newWidth);
    
    var startHr = startHrForX(newX);
    var startMin = startMinForX(newX);
    ev.startHr = startHr;
    ev.startMin = startMin;
    ev.startTime = startHr * 60 + startMin;

    drawEvent(ev, false);
}

// rightResize: resize the rectangle by dragging the right handle
function rightResize(d) {
    if(isUser) { // user page
        return;
    }

    // get event id
    var groupNum = d.groupNum;

    // get event object
    var ev = getEventFromId(groupNum);

    var newX = d3.event.x - (d3.event.x%(STEP_WIDTH)) - (DRAGBAR_WIDTH/2);
    if(newX > SVG_WIDTH){
        newX = SVG_WIDTH;
    }
    var newWidth = newX - ev.x;

    ev.duration = durationForWidth(newWidth);

    drawEvent(ev, false);
}

function dragEvent(d) {
    if(isUser) { // user page
        return;
    }

    // get event id
    var groupNum = d.groupNum;

    // get event object
    var ev = getEventFromId(groupNum);

    var width = getWidth(ev);

    //Horizontal dragging
    var dragX = d3.event.x - (d3.event.x%(STEP_WIDTH)) - DRAGBAR_WIDTH/2;
    var newX = Math.max((0 - (DRAGBAR_WIDTH/2)), Math.min(SVG_WIDTH-width, dragX));
    if (d3.event.dx + d.x < 0) newX = (0 - (DRAGBAR_WIDTH/2));
    
    ev.x = newX;

    //update start time, start hour, start minute
    var startHr = startHrForX(newX);
    var startMin = startMinForX(newX);
    ev.startHr = startHr;
    ev.startMin = startMin;
    ev.startTime = startHr * 60 + startMin;

    //Vertical Dragging
    var dragY = d3.event.y - (d3.event.y%(ROW_HEIGHT)) + 5;
    var newY = Math.min(SVG_HEIGHT - ROW_HEIGHT, dragY);
    if (d3.event.dy + d.y < 20) {
        ev.y = 17;
    } else {
        ev.y = newY;
    }

    drawEvent(ev, false);
}

//VCom Calculates where to snap event block to when created
function calcSnap(mouseX, mouseY) {
    var snapX = Math.floor(mouseX - (mouseX%50) - DRAGBAR_WIDTH/2),
        snapY = Math.floor(mouseY/ROW_HEIGHT) * ROW_HEIGHT + 5;
    return [snapX, snapY];
}

// mousedown on timeline => creates new event and draws it
function newEvent(point) {
    // interactions
    if(DRAWING_HANDOFF==true || DRAWING_COLLAB==true) {
        alert("Please click on another event or the same event to cancel");
        return;
    }

    if (overlayIsOn) {
        overlayOff();
        return;
    } 

    //Close all open popovers
    for (var i = 0; i<flashTeamsJSON["events"].length; i++) {
        var idNum = flashTeamsJSON["events"][i].id;
        $(timeline_svg.selectAll("g#g_"+idNum)[0][0]).popover('hide');
    }

    if(isUser) { // user page
        return;
    }
    
    createEvent(point);
};

function createEvent(point) {
    // get coords where event should snap to
    var snapPoint = calcSnap(point[0], point[1]);
  
    if(!checkWithinTimelineBounds(snapPoint)){ return; }

    // create event object
    var eventObj = createEventObj(snapPoint);
    
    // render event on timeline
    drawEvent(eventObj, true);
    
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

function createEventObj(snapPoint) {
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

function getWidth(ev) {
    var durationInMinutes = ev.duration;
    var hrs = parseFloat(durationInMinutes)/parseFloat(60);
    var width = hrs*RECTANGLE_WIDTH;
    var roundedWidth = Math.round(width/STEP_WIDTH) * STEP_WIDTH;
    return roundedWidth;
};

function durationForWidth(width) {
    var hrs = parseFloat(width)/parseFloat(RECTANGLE_WIDTH);
    return hrs*60;
};

function startHrForX(X){
    var roundedX = Math.round(X/STEP_WIDTH) * STEP_WIDTH;
    var hrs = Math.floor(parseFloat(roundedX)/parseFloat(RECTANGLE_WIDTH));
    return hrs;
};

function startMinForX(X){
    var roundedX = Math.round(X/STEP_WIDTH) * STEP_WIDTH;
    var mins = (parseFloat(roundedX) % parseFloat(RECTANGLE_WIDTH)) * 60 / parseFloat(RECTANGLE_WIDTH);
    return mins;
};


function getMemberIndexFromName(name) {
    for (var j = 0; j < flashTeamsJSON["members"].length; j++) { // go through all members
        if (flashTeamsJSON["members"][j].role == name){
            return j;
        }
    }
    return -1;
}

function drawG(eventObj, firstTime) {
    var x = eventObj["x"];
    var y = eventObj["y"];
    var groupNum = eventObj["id"];
    var y_offset = 17;

    if(!firstTime){ // update existing data object
        var idx = getDataIndexFromGroupNum(groupNum);
        task_groups[idx].x = x;
        task_groups[idx].y = y+y_offset;
    } else { // create data object
        var new_data = {id: "task_g_" + groupNum, class: "task_g", groupNum: groupNum, x: x, y: y+y_offset};
        task_groups.push(new_data);
    }
    
    // add group to timeline, based on the data object
    timeline_svg.selectAll("g")
        .data(task_groups, function(d){ return d.groupNum; })
        .enter()
        .append("g")
        .attr("id", "g_" + groupNum);
}

function drawMainRect(eventObj, firstTime) {
    var groupNum = eventObj["id"];
    var task_g = getTaskGFromGroupNum(groupNum);
    var width = getWidth(eventObj);

    if(firstTime){
        task_g.append("rect")
            .attr("class", "task_rectangle")
            .attr("x", function(d) {return d.x;})
            .attr("y", function(d) {return d.y;})
            .attr("id", function(d) {
                return "rect_" + d.groupNum; })
            .attr("groupNum", function(d) {return d.groupNum;})
            .attr("height", RECTANGLE_HEIGHT)
            .attr("width", width)
            .attr("fill", "#C9C9C9")
            .attr("fill-opacity", .6)
            .attr("stroke", "#5F5A5A")
            .attr('pointer-events', 'all')
            .on("click", function(d) {
                if(d3.event.defaultPrevented) return;
                eventMousedown(d.groupNum); })
            .call(drag);
    } else {
        task_g.selectAll(".task_rectangle")
            .attr("x", function(d) {return d.x;})
            .attr("y", function(d) {return d.y;})
            .attr("width", width);
    }
};

function drawRightDragBar(eventObj, firstTime) {
    var groupNum = eventObj["id"];
    var task_g = getTaskGFromGroupNum(groupNum);
    var width = getWidth(eventObj);

    if(firstTime){
        task_g.append("rect")
            .attr("class", "rt_rect")
            .attr("x", function(d) { 
                return d.x + width; })
            .attr("y", function(d) {return d.y})
            .attr("id", function(d) {
                return "rt_rect_" + d.groupNum; })
            .attr("groupNum", function(d) {return d.groupNum})
            .attr("height", RECTANGLE_HEIGHT)
            .attr("width", DRAGBAR_WIDTH)
            .attr("fill", "#00")
            .attr("fill-opacity", .6)
            .attr('pointer-events', 'all')
            .call(drag_right);
    } else {
        task_g.selectAll(".rt_rect")
            .attr("x", function(d) {return d.x + width})
            .attr("y", function(d) {return d.y});
    }
}

function drawLeftDragBar(eventObj, firstTime) {
    var groupNum = eventObj["id"];
    var task_g = getTaskGFromGroupNum(groupNum);

    if(firstTime) {
        task_g.append("rect")
            .attr("class", "lt_rect")
            .attr("x", function(d) { return d.x})
            .attr("y", function(d) {return d.y})
            .attr("id", function(d) {
                return "lt_rect_" + d.groupNum; })
            .attr("groupNum", function(d) {return d.groupNum})
            .attr("height", RECTANGLE_HEIGHT)
            .attr("width", DRAGBAR_WIDTH)
            .attr("fill", "#00")
            .attr("fill-opacity", .6)
            .attr('pointer-events', 'all')
            .call(drag_left);
    } else {
        task_g.selectAll(".lt_rect")
            .attr("x", function(d) {return d.x}) 
            .attr("y", function(d) {return d.y});
    }
}

function drawTitleText(eventObj, firstTime) {
    var x_offset = 10; // unique for title
    var y_offset = 14; // unique for title

    var groupNum = eventObj["id"];
    var title = eventObj["title"];
    var task_g = getTaskGFromGroupNum(groupNum);

    if(firstTime) {
        task_g.append("text")
            .text(title)
            .attr("class", "title_text")
            .attr("id", function(d) { return "title_text_" + d.groupNum; })
            .attr("groupNum", function(d) {return d.groupNum})
            .attr("x", function(d) {return d.x + x_offset})
            .attr("y", function(d) {return d.y + y_offset})
            .attr("font-weight", "bold")
            .attr("font-size", "12px");
    } else {
        task_g.selectAll(".title_text")
            .text(title)
            .attr("x", function(d) {return d.x + x_offset})
            .attr("y", function(d) {return d.y + y_offset});
    }
}

function drawDurationText(eventObj, firstTime) {
    var x_offset = 10; // unique for duration
    var y_offset = 26; // unique for duration

    var totalMinutes = eventObj["duration"];
    var numHoursInt = Math.floor(totalMinutes/60);
    var minutesLeft = Math.round(totalMinutes%60);

    var groupNum = eventObj["id"];
    var task_g = getTaskGFromGroupNum(groupNum);

    if(firstTime) {
        task_g.append("text")
            .text(function (d) {
                return numHoursInt+"hrs "+minutesLeft+"min";
            })
            .attr("class", "time_text")
            .attr("id", function(d) {return "time_text_" + groupNum;})
            .attr("groupNum", function(d){return d.groupNum})
            .attr("x", function(d) {return d.x + x_offset})
            .attr("y", function(d) {return d.y + y_offset})
            .attr("font-size", "12px");
    } else {
        task_g.selectAll(".time_text")
            .text(function (d) {
                return numHoursInt+"hrs "+minutesLeft+"min";
            })
            .attr("x", function(d) {return d.x + x_offset})
            .attr("y", function(d) {return d.y + y_offset});
    }
}

function drawGdriveLink(eventObj, firstTime) {
    var x_offset = 10; // unique for gdrive link
    var y_offset = 38; // unique for gdrive link

    var groupNum = eventObj["id"];
    var task_g = getTaskGFromGroupNum(groupNum);

    if(firstTime) {
        task_g.append("text")
            .text("Upload")
            .attr("style", "cursor:pointer; text-decoration:underline; text-decoration:bold;")
            .attr("class", "gdrive_link")
            .attr("id", function(d) {return "gdrive_" + d.groupNum;})
            .attr("groupNum", function(d){return d.groupNum})
            .attr("x", function(d) {return d.x + x_offset})
            .attr("y", function(d) {return d.y + y_offset})
            .attr("fill", "blue")
            .attr("font-size", "12px");

        // open gdrive upon click
        $("#gdrive_" + groupNum).on('click', function(ev){
            ev.stopPropagation();
            
            if (flashTeamsJSON["events"][groupNum-1].gdrive.length > 0){
                window.open(flashTeamsJSON["events"][groupNum-1].gdrive[1])
            }
            else{
                alert("The flash team must be running for you to upload a file!");
            }
        });
    } else {
         task_g.selectAll(".gdrive_link")
            .attr("x", function(d) {return d.x + x_offset})
            .attr("y", function(d) {return d.y + y_offset});
    }
}

function drawHandoffBtn(eventObj, firstTime) {
    if(isUser){ return; }

    var x_offset = getWidth(eventObj)-18; // unique for handoff btn
    var y_offset = 23; // unique for handoff btn

    var groupNum = eventObj["id"];
    var task_g = getTaskGFromGroupNum(groupNum);

    if(firstTime) {
        task_g.append("image")
            .attr("xlink:href", "/assets/rightArrow.png")
            .attr("class", "handoff_btn")
            .attr("id", function(d) {return "handoff_btn_" + d.groupNum;})
            .attr("groupNum", function(d){return d.groupNum})
            .attr("width", 16)
            .attr("height", 16)
            .attr("x", function(d) {return d.x+x_offset})
            .attr("y", function(d) {return d.y+y_offset})
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
    } else {
        task_g.selectAll(".handoff_btn")
            .attr("x", function(d) {return d.x + x_offset})
            .attr("y", function(d) {return d.y + y_offset});
    }
}

function drawCollabBtn(eventObj, firstTime) {
    if(isUser){ return; }

    var x_offset = getWidth(eventObj)-38; // unique for collab btn
    var y_offset = 23; // unique for collab btn

    var groupNum = eventObj["id"];
    var task_g = getTaskGFromGroupNum(groupNum);

    if(firstTime) {
        task_g.append("image")
            .attr("xlink:href", "/assets/doubleArrow.png")
            .attr("class", "collab_btn")
            .attr("id", function(d) {return "collab_btn_" + d.groupNum;})
            .attr("groupNum", function(d){return d.groupNum})
            .attr("width", 16)
            .attr("height", 16)
            .attr("x", function(d) {return d.x+x_offset})
            .attr("y", function(d) {return d.y+y_offset})
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
    } else {
        task_g.selectAll(".collab_btn")
            .attr("x", function(d) {return d.x + x_offset})
            .attr("y", function(d) {return d.y + y_offset});
    }
}

function drawMemberLines(eventObj) {
    var x_offset = 8; // unique for member lines
    var width = getWidth(eventObj) - 8;

    var groupNum = eventObj["id"];
    var members = eventObj["members"];
    var task_g = getTaskGFromGroupNum(groupNum);

    // figure out if first time or not for each member line
    for(var i=0;i<members.length;i++){
        var existingLine = task_g.selectAll("#event_" + groupNum + "_eventMemLine_" + (i+1));
        var y_offset = 60 + (i*8); // unique for member lines
        if(existingLine[0].length == 0){ // first time
            var member = getMemberById(members[i]);
            var color = member.color;
            var name = member.name;
            
            task_g.append("rect")
                .attr("class", "member_line")
                .attr("id", function(d) {
                    return "event_" + groupNum + "_eventMemLine_" + (i+1);
                })
                .attr("x", function(d) {
                    return d.x + x_offset;})
                .attr("y", function(d) {
                    return d.y + y_offset;})
                .attr("groupNum", groupNum)
                .attr("height", 5)
                .attr("width", width)
                .attr("fill", color)
                .attr("fill-opacity", .9);
        } else { // line already exists, just need to redraw
            var members = eventObj["members"];
            var member = getMemberById(members[i]);
            var color = member.color;

            existingLine
                .attr("x", function(d) {return d.x + x_offset})
                .attr("y", function(d) {return d.y + y_offset})
                .attr("fill", color)
                .attr("width", width);
        }
    }
};

function drawShade(eventObj, firstTime) {
    if(!current || !firstTime) {return;}

    var groupNum = eventObj["id"];
    var members = eventObj["members"];
    var task_g = getTaskGFromGroupNum(groupNum);

    // draw shade on main rect of this event
    for (var i=0; i<members.length; i++) {
        var member = members[i];
        var idx = getMemberIndexFromName(member["name"]);
        if (current == idx){
            if (currentUserIds.indexOf(groupNum) < 0){
                currentUserIds.push(groupNum);
                currentUserEvents.push(eventObj);
            }

            task_g.selectAll("#rect_" + groupNum)
                .attr("fill", color)
                .attr("fill-opacity", .4);

            break;
        }
    }

    if (currentUserEvents.length > 0){
        currentUserEvents = currentUserEvents.sort(function(a,b){return parseInt(a.startTime) - parseInt(b.startTime)});
        upcomingEvent = currentUserEvents[0].id; 
        task_g.selectAll("#rect_" + upcomingEvent)
            .attr("fill", color)
            .attr("fill-opacity", .9);  
    }
}

function drawEachHandoff(eventObj, firstTime){
    var interactions = flashTeamsJSON["interactions"];
    for (var i = 0; i < interactions.length; i++){
        var inter = interactions[i];
        var draw;
        if (inter["type"] == "handoff"){
            if (inter["event1"] == eventObj["id"]){
                draw = true;
                var ev1 = eventObj;
                var ev2 = flashTeamsJSON["events"][getEventJSONIndex(inter["event2"])];
            }
            else if (inter["event2"] == eventObj["id"]){
                draw = true;
                var ev1 = flashTeamsJSON["events"][getEventJSONIndex(inter["event1"])];
                var ev2 = eventObj;
            }
            if (draw){
                var x1 = ev1.x + 3 + getWidth(eventObj);
                var y1 = ev1.y + 50;
                var x2 = ev2.x + 3;
                var y2 = ev2.y + 50;
                $("#interaction_" + inter["id"])
                    .attr("x1", x1)
                    .attr("y1", y1)
                    .attr("x2", x2)
                    .attr("y2", y2)
                    .attr("d", function(d) {
                        var dx = x1 - x2,
                        dy = y1 - y2,
                        dr = Math.sqrt(dx * dx + dy * dy);
                        //For ref: http://stackoverflow.com/questions/13455510/curved-line-on-d3-force-directed-tree
                        return "M " + x1 + "," + y1 + "\n A " + dr + ", " + dr 
                        + " 0 0,0 " + x2 + "," + (y2+15); 
                    });
            }
        }
    }
}

function drawEachCollab(eventObj, firstTime){
    var interactions = flashTeamsJSON["interactions"];
    for (var i = 0; i < interactions.length; i++){
        var inter = interactions[i];
        var draw;
        if (inter["type"] == "collaboration"){
            if (inter["event1"] == eventObj["id"]){
                draw = true;
                var ev1 = eventObj;
                var ev2 = flashTeamsJSON["events"][getEventJSONIndex(inter["event2"])];
            }
            else if (inter["event2"] == eventObj["id"]){
                draw = true;
                var ev1 = flashTeamsJSON["events"][getEventJSONIndex(inter["event1"])];
                var ev2 = eventObj;
            }
            if (draw){
                var y1 = ev1.y + 17;
                var x2 = ev2.x + 3;
                var y2 = ev2.y + 17;
                var firstTaskY = 0;
                var taskDistance = 0;
                var overlap = eventsOverlap(ev1.x, getWidth(ev1), ev2.x, getWidth(ev2));
                if (y1 < y2) {
                    firstTaskY = y1 + 90;
                    taskDistance = y2 - firstTaskY;
                } else {
                    firstTaskY = y2 + 90;
                    taskDistance = y1 - firstTaskY;
                }
                $("#interaction_" + inter["id"])
                    .attr("x", x2)
                    .attr("y", firstTaskY)
                    .attr("height", taskDistance)
                    .attr("width", overlap);
            }
        }
    }

}

//Creates graphical elements from array of data (task_rectangles)
function drawEvent(eventObj, firstTime) {    
    drawG(eventObj, firstTime);
    drawMainRect(eventObj, firstTime);
    drawRightDragBar(eventObj, firstTime);
    drawLeftDragBar(eventObj, firstTime);
    drawTitleText(eventObj, firstTime);
    drawDurationText(eventObj, firstTime);
    drawGdriveLink(eventObj, firstTime);
    drawHandoffBtn(eventObj, firstTime);
    drawCollabBtn(eventObj, firstTime);
    drawMemberLines(eventObj);
    drawShade(eventObj, firstTime);
    drawEachHandoff(eventObj, firstTime);
    drawEachCollab(eventObj, firstTime);
};
function drawAllPopovers() {
    var events = flashTeamsJSON["events"];
    for (var i = 0; i < events.length; i++){
        var ev = events[i];
        drawPopover(ev, true, false);
    }
};


function removeAllMemberLines(eventObj){
    var groupNum = eventObj["id"];
    var members = eventObj["members"];
    var task_g = getTaskGFromGroupNum(groupNum);

    for(var i=0;i<members.length;i++){
        task_g.selectAll("#event_" + groupNum + "_eventMemLine_" + (i+1)).remove();
    }
};

function renderAllMemberLines() {
    var events = flashTeamsJSON["events"];
    for (var i = 0; i < events.length; i++){
        var ev = events[i];
        drawMemberLines(ev);
    }
};

// deprecated
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
    renderAllMemberLines();
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
        if (flashTeamsJSON["events"][indexOfJSON].members[i]["name"] == memberName) {
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