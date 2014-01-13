/* Timeline.js
 * ---------------------------------------------
 * Code that manages the workflow timeline in Foundry. And also the team awareness
 * feature.
 */

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
var handoff_counter = 0;
var collab_counter = 0;

var DRAWING_HANDOFF = false;
var DRAWING_COLLAB = false;
var INTERACTION_TASK_ONE_IDNUM = 0;

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

        //Update event popover
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
        var eventNotes = flashTeamsJSON["events"][getEventJSONIndex(groupNum)].notes;
        updateEventPopover(groupNum, title, startHour, startMin, hours, min, eventNotes);  
        $("#rect_" + groupNum).popover("hide");

        //Vertical Dragging
        var dragY = d3.event.y - (d3.event.y%(RECTANGLE_HEIGHT)) + 17;
        var newY = Math.min(SVG_HEIGHT - RECTANGLE_HEIGHT, dragY);
        if (d3.event.dy + d.y < 20) d.y = 17;
        else d.y = newY;

        redraw(group, rectWidth, groupNum);

        //Update JSON
        var indexOfJSON = getEventJSONIndex(groupNum);
        flashTeamsJSON["events"][indexOfJSON].startTime = (startHour*60 + startMin);
    });

//Called when the right dragbar of a task rectangle is dragged
var drag_right = d3.behavior.drag()
    .on("drag", rightResize);

//Called when the left dragbar of a task rectangle is dragged
var drag_left = d3.behavior.drag()
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
    .style("stroke", "#d3d1d1");

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

/* --------------- TEAM AWARENESS STUFF START ------------ */

// unique link to identify/access the page
// can't shift tasks to the left before the cursor! - try to reproduce the problem
// plan out data infrastructure
// convert interactive mockups to smaller size and send out/upload to google docs

/* Time cursor in red */
timeline_svg.append("line")
    .attr("y1", 15)
    .attr("y2", SVG_HEIGHT-50)
    .attr("x1", 0)
    .attr("x2", 0)
    .attr("class", "cursor")
    .style("stroke", "red")
    .style("stroke-width", "2")

var poll_interval = 5000; // 20 seconds
var timeline_interval = 10000; // TODO: should be 30 minutes = 1800000 milliseconds
var fire_interval = 180; // change back to 180
var numIntervals = parseFloat(timeline_interval)/parseFloat(fire_interval);
var increment = parseFloat(50)/parseFloat(numIntervals);
var curr_x_standard = 0;
var cursor = timeline_svg.select(".cursor");
var live_tasks = [];
var remaining_tasks = [];
var delayed_tasks = [];
var drawn_blue_tasks = [];
var completed_red_tasks = [];
var task_groups = [];
var loadedStatus;

var getXCoordForTime = function(t){
    console.log("time t: " + t);
    var numInt = parseInt(t / timeline_interval);
    var remainder = t % timeline_interval;
    console.log("numInt: " + numInt + " | remainder: " + remainder);

    var xCoordForRemainder = (remainder / timeline_interval) * 50;
    var xCoordForMainIntervals = 50*numInt;
    console.log("xCoordForRemainder: " + xCoordForRemainder + " | xCoordForMainIntervals: " + xCoordForMainIntervals);

    var finalX = parseFloat(xCoordForRemainder) + parseFloat(xCoordForMainIntervals);
    console.log("finalX: " + finalX);
    return {"finalX": finalX, "numInt": numInt};
};

$("#flashTeamStartBtn").click(function(){
    $("#flashTeamStartBtn").attr("disabled", "disabled");
    
    recordStartTime();
    updateStatus(true);
    setCursorMoving();
    trackLiveAndRemainingTasks();
    poll();
});

$("#flashTeamEndBtn").click(function(){
    updateStatus(false);
});

$(document).ready(function(){
    var flash_team_id = $("#flash_team_id").val();
    var url = '/flash_teams/' + flash_team_id + '/get_status';
    $.ajax({
        url: url,
        type: 'get'
    }).done(function(data){
        if(data == null) return; // status not set yet

        loadedStatus = data;
        var in_progress = loadedStatus.flash_team_in_progress;
        if(in_progress){
            $("#flashTeamStartBtn").attr("disabled", "disabled");
            loadData();
            poll();
        }
    });
});

var flashTeamEnded = function(){
    return !loadedStatus.flash_team_in_progress;
};

var flashTeamUpdated = function(){
    var updated_drawn_blue_tasks = loadedStatus.drawn_blue_tasks;
    var updated_completed_red_tasks = loadedStatus.completed_red_tasks;

    console.log("updated drawn blue: " + updated_drawn_blue_tasks);
    console.log("updated completed red: " + updated_completed_red_tasks);
    console.log("drawn blue: " + drawn_blue_tasks);
    console.log("completed red: " + completed_red_tasks);

    if (updated_drawn_blue_tasks.length != drawn_blue_tasks.length) return true;
    if (updated_completed_red_tasks.length != completed_red_tasks.length) return true;

    if(updated_drawn_blue_tasks.sort().join(',') !== drawn_blue_tasks.sort().join(',')){
        return true;
    }

    if(updated_completed_red_tasks.sort().join(',') !== completed_red_tasks.sort().join(',')){
        return true;
    }
    return false;
};

var poll = function(){
    setInterval(function(){
        var flash_team_id = $("#flash_team_id").val();
        var url = '/flash_teams/' + flash_team_id + '/get_status';
        $.ajax({
            url: url,
            type: 'get'
        }).done(function(data){
            if(data == null) return;
            loadedStatus = data;
            console.log(loadedStatus);

            if(flashTeamEnded() || flashTeamUpdated()) {
                location.reload();
            } else {
                console.log("Flash team not updated and not ended");
            }
        });
    }, poll_interval); // every 5 seconds currently
};

var recordStartTime = function(){
    /*
    var startTime = 'startTime' in flashTeamsJSON;
    console.log("startTime: " + startTime);
    if (!startTime) {
        flashTeamsJSON["startTime"] = (new Date).getTime();
        console.log(flashTeamsJSON["startTime"]);
    }
    */

    flashTeamsJSON["startTime"] = (new Date).getTime();
};

var loadStatus = function(id){
    var loadedStatusJSON;
    var url = '/flash_teams/' + id.toString() + '/get_status';
    $.ajax({
        url: url,
        type: 'get'
    }).done(function(data){
        loadedStatusJSON = data;
        console.log("loadedStatusJSON: " + loadedStatusJSON);
    });
 
    return JSON.parse(loadedStatusJSON);
};

var loadData = function(){
    if (loadedStatus.task_groups !== undefined && loadedStatus.task_groups !== null) {
        task_groups = loadedStatus.task_groups;
        var j = task_groups.length - 1;
        while(j >= 0){
            var g = task_groups[j];
            task_groups.splice(j, 1);
            j--;
            drawEvents(g[0].x, g[0].y, g, null, null); // need to change null and null to title and totalMinutes
            fillPopover(g[0].x, g[0].groupNum, false, null, null);
            //addEventToJSON(g[0].x, g[0].y, g[0].groupNum, false);
        }

        live_tasks = loadedStatus.live_tasks;
        remaining_tasks = loadedStatus.remaining_tasks;
        delayed_tasks = loadedStatus.delayed_tasks;
        drawn_blue_tasks = loadedStatus.drawn_blue_tasks;
        completed_red_tasks = loadedStatus.completed_red_tasks;
        flashTeamsJSON = loadedStatus.flash_teams_json;
    
        var cursor_details = positionCursor(flashTeamsJSON);
        drawBlueBoxes();
        drawRedBoxes();
        drawDelayedTasks();
        trackLiveAndRemainingTasks();
        startCursor(cursor_details);
    }
};

var drawBlueBox = function(task_g){
    var data = task_g.data()[0];
    console.log(data);
    var task_start = parseFloat(data.x);
    console.log(task_start);
    var completed_x = 'completed_x' in data;
    console.log(completed_x);
    if (!completed_x){
        return null;
    }

    completed_x = parseFloat(data.completed_x);
    console.log(completed_x);
    var groupNum = data.groupNum;
    console.log(groupNum);
    var task_rect_curr_width = parseFloat(task_g.select("#rect_" + groupNum).attr("width"));
    console.log(task_rect_curr_width);
    var task_end = task_start + task_rect_curr_width;
    console.log(task_end);
    var blue_width = task_end - completed_x;
    console.log(blue_width);
    
    var blue_rectangle = task_g.append("rect")
        .attr("class", "early_rectangle")
        .attr("x", function(d) {return completed_x})
        .attr("y", function(d) {return d.y})
        .attr("id", function(d) {
            return "early_rect_" + groupNum; })
        .attr("groupNum", groupNum)
        .attr("height", RECTANGLE_HEIGHT)
        .attr("width", blue_width)
        .attr("fill", "blue")
        .attr("fill-opacity", .6)
        .attr("stroke", "#5F5A5A");

    return blue_width;
};

var drawRedBox = function(task_g, use_cursor){
    console.log("drawRedBox!");
    var data = task_g.data()[0];
    var groupNum = data.groupNum;
    var task_start = parseFloat(data.x);
    var task_rect_curr_width = parseFloat(task_g.select("#rect_" + groupNum).attr("width"));
    var task_end = task_start + task_rect_curr_width;
    var completed_x = 'completed_x' in data;
    var red_width;
    if(!use_cursor){
        if (!completed_x){
            red_width = 1;
        } else {
            completed_x = parseFloat(data.completed_x);
            red_width = completed_x - task_end;
        }
    } else {
        console.log("USING CURSOR!");
        var cursor_x = parseFloat(cursor.attr("x1"));
        console.log("cursor_x: " + cursor_x);
        console.log("task_end: " + task_end);
        red_width = cursor_x - task_end;
        console.log("red_width: " + red_width);
    }

    // add red box of width 1
    var red_rectangle = task_g.append("rect")
        .attr("class", "delayed_rectangle")
        .attr("x", function(d) {return parseFloat(d.x) + task_rect_curr_width})
        .attr("y", function(d) {return d.y})
        .attr("id", function(d) {
            return "delayed_rect_" + groupNum; })
        .attr("groupNum", groupNum)
        .attr("height", RECTANGLE_HEIGHT)
        .attr("width", red_width)
        .attr("fill", "red")
        .attr("fill-opacity", .6)
        .attr("stroke", "#5F5A5A");

    return red_width;
};

var drawBlueBoxes = function(){
    for (var i=0;i<drawn_blue_tasks.length;i++){
        var task_g = getTaskGFromGroupNum(drawn_blue_tasks[i]);
        drawBlueBox(task_g);
    }
};

var drawRedBoxes = function(){
    for (var i=0;i<completed_red_tasks.length;i++){
        var task_g = getTaskGFromGroupNum(completed_red_tasks[i]);
        drawRedBox(task_g, false);
    }
};

var drawDelayedTasks = function(){
    var cursor_x = parseFloat(cursor.attr("x1"));
    var before_tasks = computeTasksBeforeCurrent(cursor_x);
    var tasks_after = null;
    var allRanges = [];

    for (var i=0;i<before_tasks.length;i++){
        var groupNum = before_tasks[i];
        var task_g = getTaskGFromGroupNum(groupNum);
        var completed = task_g.data()[0].completed;
        if (completed) continue;

        console.log("task " + groupNum + " is now delayed, so drawing red box");
        var red_width = drawRedBox(task_g, true);
        if(live_tasks.indexOf(groupNum) != -1) {
            live_tasks.splice(i, 1);
        }
        delayed_tasks.push(groupNum);

        var data = task_g.data()[0];
        var groupNum = data.groupNum;
        var task_start = parseFloat(data.x);
        var task_rect_curr_width = parseFloat(task_g.select("#rect_" + groupNum).attr("width"));
        var task_end = task_start + task_rect_curr_width;
        var red_end = task_end + red_width;
        tasks_after = computeTasksAfterCurrent(task_end); // TODO: right-most task or left-most task?

        allRanges.push([task_end, red_end]);
        //moveTasksRight(tasks_after_curr, red_width);
    }

    if (tasks_after != null){
        var actual_offset = computeTotalOffset(allRanges);
        console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& ACTUAL OFFSET: " + actual_offset);
        moveTasksRight(tasks_after, actual_offset);
    }
};

var sortComparator = function(a, b){
    if(a[0] < b[0]) return -1;
    if(a[0] > b[0]) return 1;
    return 0;
};

// "overlapping" algorithm
var computeTotalOffset = function(allRanges){
    var changes = [];
    for(var i=0;i<allRanges.length;i++){
        var range = allRanges[i];
        changes.push([range[0], 1]);
        changes.push([range[1], -1]);
    }

    var sorted_changes = changes.sort(sortComparator);

    var curr = 0;
    var height = 0;
    var new_ranges = [];
    for(var j=0;j<sorted_changes.length;j++){
        var r = sorted_changes[j];
        new_ranges.push([curr, r[0], height]);
        curr = r[0];
        height = height + r[1];
    }

    var totalOffset = 0;
    for(var k=0;k<new_ranges.length;k++){
        var curr_range = new_ranges[k];
        if(curr_range[2] == 0) continue;
        totalOffset = totalOffset + (curr_range[1] - curr_range[0]);
    }

    return totalOffset;
};

var positionCursor = function(team){
    var currTime = (new Date).getTime();
    var startTime = team["startTime"];
    var diff = currTime - startTime;

    console.log(startTime);
    console.log(currTime);
    console.log("diff in seconds: " + diff/1000);

    var cursor_details = getXCoordForTime(diff);
    var x = cursor_details["finalX"];
    cursor.attr("x1", x);
    cursor.attr("x2", x);
    curr_x_standard = x;

    return cursor_details;
};

var startCursor = function(cursor_details){
    var x = cursor_details["finalX"];
    var numIntervals = cursor_details["numInt"] + 1;
    var target_x = 50*numIntervals;
    var dist = target_x - x;
    var t = (dist/50)*timeline_interval;
    syncCursor(t, target_x);
};

var syncCursor = function(length_of_time, target_x){
    curr_x_standard = target_x;
    console.log("time: " + length_of_time + " | target_x: " + target_x);
    cursor.transition()
        .duration(length_of_time)
        .ease("linear")
        .attr("x1", curr_x_standard)
        .attr("x2", curr_x_standard)
        .each("end", function(){
            console.log("completed sync");
            console.log("sync cursor done. moving cursor normally now..");
            setCursorMoving();
        });
};

var moveCursor = function(length_of_time){
    curr_x_standard += 50;
    console.log("curr_x_standard: " + curr_x_standard);

    cursor.transition()
        .duration(length_of_time)
        .ease("linear")
        .attr("x1", curr_x_standard)
        .attr("x2", curr_x_standard);
};

var cursor_interval_id;
var setCursorMoving = function(){
    moveCursor(timeline_interval);
    cursor_interval_id = setInterval(function(){
        moveCursor(timeline_interval);
    }, timeline_interval); // every 18 seconds currently
};

var computeLiveAndRemainingTasks = function(){
    var curr_x = cursor.attr("x1");
    var curr_new_x = parseFloat(curr_x) + increment;

    var remaining_tasks = [];
    var live_tasks = [];
    for (var i=0;i<task_groups.length;i++){
        var task = task_groups[i];
        var data = task.data()[0];
        var groupNum = data.groupNum;

        var task_rect = task.select("#rect_" + groupNum);
        var start_x = task_rect.attr("x");
        var width = task_rect.attr("width");
        var end_x = parseFloat(start_x) + parseFloat(width);

        if(curr_new_x >= start_x && curr_new_x <= end_x){
            live_tasks.push(groupNum);
        } else if(curr_new_x < start_x){
            remaining_tasks.push(groupNum);
        }
    }

    return {"live":live_tasks, "remaining":remaining_tasks};
};

var computeTasksAfterCurrent = function(curr_x){
    tasks_after_curr = [];
    
    // go through all tasks
    for (var i=0;i<task_groups.length;i++){
        var task = task_groups[i];
        var data = task.data()[0];
        var groupNum = data.groupNum;

        // get start x coordinate of task
        var task_rect = task.select("#rect_" + groupNum);
        var start_x = task_rect.attr("x");
        
        // if the task's x coordinate is after the current x, it is "after," so add it
        if(curr_x < start_x){
            tasks_after_curr.push(groupNum);
        }
    }

    return tasks_after_curr;
};

var computeTasksBeforeCurrent = function(curr_x){
    tasks_before_curr = [];
    
    // go through all tasks
    for (var i=0;i<task_groups.length;i++){
        var task = task_groups[i];
        var data = task.data()[0];
        var groupNum = data.groupNum;

        // get start x coordinate of task
        var task_rect = task.select("#rect_" + groupNum);
        var start_x = task_rect.attr("x");
        var width = task_rect.attr("width");
        var end_x = parseFloat(start_x) + parseFloat(width);
        
        // if the task's end x coordinate is before the current x, it is "before," so add it
        if(end_x < curr_x){
            tasks_before_curr.push(groupNum);
        }
    }

    return tasks_before_curr;
};

var getTaskGFromGroupNum = function(groupNum){
    for(var i=0;i<task_groups.length;i++){
        var task_g = task_groups[i];
        if (task_g.data()[0].groupNum == groupNum) return task_g;
    }
    return null;
};

var extendDelayedBoxes = function(){
    // go through delayed tasks and increase width of red box
    var cursor_x = parseFloat(cursor.attr("x1"));
    var diff = 0;
    for (var i=0;i<delayed_tasks.length;i++){
        var groupNum = delayed_tasks[i];
        var delayed_rect = timeline_svg.selectAll("#delayed_rect_" + groupNum);
        
        // new width is diff b/w current cursor position and starting of delayed rect
        var curr_width = parseFloat(delayed_rect.attr("width"));
        var new_width = cursor_x - parseFloat(delayed_rect.attr("x"));
        delayed_rect.attr("width", new_width);
        
        diff = new_width - curr_width;
    }
    moveRemainingTasksRight(diff);
};

var moveTasksRight = function(tasks, amount){
    for (var i=0;i<tasks.length;i++){
        var groupNum = tasks[i];
        var task_g = getTaskGFromGroupNum(groupNum);
        var x = parseFloat(task_g.data()[0].x);
        task_g.data()[0].x = x + parseFloat(amount);
        var group = task_g[0][0];

        var rectWidth = parseFloat(task_g.select("#rect_" + groupNum).attr("width"));
        redraw(group, rectWidth, groupNum);
    }
};

var moveTasksLeft = function(tasks, amount){
    for (var i=0;i<tasks.length;i++){
        var groupNum = tasks[i];
        var task_g = getTaskGFromGroupNum(groupNum);
        var x = parseFloat(task_g.data()[0].x);
        task_g.data()[0].x = x - parseFloat(amount);
        var group = task_g[0][0];

        var rectWidth = parseFloat(task_g.select("#rect_" + groupNum).attr("width"));
        redraw(group, rectWidth, groupNum);
    }
};

var moveRemainingTasksRight = function(amount){
    moveTasksRight(remaining_tasks, amount);
};

var moveRemainingTasksLeft = function(amount){
    moveTasksLeft(remaining_tasks, amount);
}

/*
TODO:
update popover when automatically shift the tasks left or right
shorten width when finish early (?)
offset of half of drag bar width when drawing red and blue boxes
*/
var trackLiveAndRemainingTasks = function() {
    setInterval(function(){
        var tasks = computeLiveAndRemainingTasks();
        var new_live_tasks = tasks["live"];
        var new_remaining_tasks = tasks["remaining"];

        // extend already delayed boxes
        extendDelayedBoxes();

        // detect any live task is delayed or completed early
        for (var i=0;i<live_tasks.length;i++){
            var groupNum = live_tasks[i];
            var task_g = getTaskGFromGroupNum (groupNum);
            var completed = task_g.data()[0].completed;
            var task_rect_curr_width = parseFloat(task_g.select("#rect_" + groupNum).attr("width"));

            // delayed
            if (new_live_tasks.indexOf(groupNum) == -1 && !completed) { // groupNum is no longer live
                drawRedBox(task_g, false);

                // add to delayed_tasks list
                delayed_tasks.push(groupNum);
            }
        }
        live_tasks = new_live_tasks;
        remaining_tasks = new_remaining_tasks;
    }, fire_interval);
};

var getAllData = function(){
    var data = [];
    for(var i=0;i<task_groups.length;i++){
        var task_g = task_groups[i];
        data.push(task_g.data());
        console.log("stored data: ");
        console.log(task_g.data());
    }
    return data;
};

var getAllTasks = function(){
    var all_tasks = [];
    for(var i=0;i<task_groups.length;i++){
        var task = task_groups[i];
        var data = task.data()[0];
        var groupNum = data.groupNum;
        all_tasks.push(groupNum);
    }
    return all_tasks;
};

var constructStatusObj = function(){
    var localStatus = {};
    localStatus.task_groups = getAllData(task_groups);
    localStatus.live_tasks = live_tasks;
    localStatus.remaining_tasks = remaining_tasks;
    localStatus.delayed_tasks = delayed_tasks;
    localStatus.drawn_blue_tasks = drawn_blue_tasks;
    localStatus.completed_red_tasks = completed_red_tasks;
    localStatus.flash_teams_json = flashTeamsJSON;

    return localStatus;
};

var updateStatus = function(flash_team_in_progress){
    var localStatus = constructStatusObj();
    localStatus.flash_team_in_progress = flash_team_in_progress;
    var localStatusJSON = JSON.stringify(localStatus);
    console.log("updating string: " + localStatusJSON);

    var flash_team_id = $("#flash_team_id").val();
    var authenticity_token = $("#authenticity_token").val();
    var url = '/flash_teams/' + flash_team_id + '/update_status';
    $.ajax({
        url: url,
        type: 'post',
        data: {"localStatusJSON": localStatusJSON, "authenticity_token": authenticity_token}
    }).done(function(data){
        console.log("UPDATED FLASH TEAM STATUS");
        if(!flash_team_in_progress){
            window.location.reload();
        }
    });
};

var completeTask = function(groupNum){
    var task_g = getTaskGFromGroupNum (groupNum);

    // mark as completed
    task_g.data()[0].completed = true;

    var cursor_x = cursor.attr("x1");
    task_g.data()[0].completed_x = cursor_x;

    // remove from either live or delayed tasks
    var idx = delayed_tasks.indexOf(groupNum);
    if (idx != -1) { // delayed task
        delayed_tasks.splice(idx, 1);
        completed_red_tasks.push(groupNum);
    } else {
        idx = live_tasks.indexOf(groupNum);
        if (idx != -1){ // live task
            var blue_width = drawBlueBox(task_g);
            console.log(blue_width);
            if (blue_width !== null){
                drawn_blue_tasks.push(groupNum);
                moveRemainingTasksLeft(blue_width);
            }
            live_tasks.splice(idx, 1);
        }
    }

    $("#rect_" + groupNum).popover("hide");
    overlayOff();

    updateStatus(true);
};

/* --------------- TEAM AWARENESS STUFF END ------------ */

timeline_svg.append("rect")
    .attr("class", "background")
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT)
    .attr("fill", "white")
    .attr("fill-opacity", 0)
    .on("mousedown", mousedown);

var task_g = timeline_svg.selectAll(".task_g");

//VCom Calculates where to snap event block to when created
function calcSnap(mouseX, mouseY) {
    var snapX = Math.floor(mouseX - (mouseX%50) - DRAGBAR_WIDTH/2),
        snapY = Math.floor(mouseY/RECTANGLE_HEIGHT) * RECTANGLE_HEIGHT;
	return [snapX, snapY];
}	

//VCom Populates event block popover with correct info
function fillPopover(newmouseX, groupNum, showPopover, title, totalMinutes) {
	if (title == null) {
		title = "New Event";
	}
	if (totalMinutes == null) {
		totalMinutes = 60;
	}
	
    //Find the start time
    var startHr = (newmouseX-(newmouseX%100))/100;
    var startMin = (newmouseX%100)/25*15;
    if(startMin == 57.599999999999994) {
        startHr++;
        startMin = 0;
    } else startMin += 2.4
    var startTimeinMinutes = (startHr*60) + startMin;
    //D3, Exit to Remove Deleted Data
    task_g = timeline_svg.selectAll(".task_g").data(task_groups, function(d) {return d.id});
    task_g.exit().remove();
	//add new event to flashTeams database
    var newEvent = {"title":"New Event", "id":event_counter, "startTime": startTimeinMinutes, "duration":totalMinutes, "members":[], "dri":"", "notes":""};
    flashTeamsJSON.events.push(newEvent);
    addEventPopover(startHr, startMin, title, totalMinutes, groupNum, showPopover);
    overlayOn();
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
        .attr("xlink:href", "/images/rightArrow.png")
        .attr("class", "handoff_btn")
        .attr("id", function(d) {return "handoff_btn_" + groupNum;})
        .attr("width", 16)
        .attr("height", 16)
        .attr("x", function(d) {return d.x+RECTANGLE_WIDTH*numHoursDec-18})
        .attr("y", function(d) {return d.y+23})
        .on("click", writeHandoff);
    var collab_btn = task_g.append("image")
        .attr("xlink:href", "/images/doubleArrow.png")
        .attr("class", "collab_btn")
        .attr("id", function(d) {return "collab_btn_" + groupNum;})
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
}

//The initialization of the twitter bootstrap popover on an event's task rectangle
function addEventPopover(startHr, startMin, title, totalMinutes, groupNum, showPopover) {
	var numHours = Math.floor(totalMinutes/60);
	var minutesLeft = totalMinutes%60;
	
    //Add Popovers
    timeline_svg.selectAll("#rect_" + groupNum).each(
        function(d) {
            $(this).popover({
                placement: "right",
                html: "true",
                class: "event",
                style: "width: 650",
                id: '"popover' + groupNum + '"',
                trigger: "click",
                title: '<input type ="text" name="eventName" id="eventName_' + groupNum + '" placeholder="'+title+'" >',
                content: '<form name="eventForm_' + groupNum + '">'
                +'<b>Event Start:          </b><br>' 
                +'<input type="number" id="startHr_' + groupNum + '" placeholder="' + startHr + '" min="0" style="width:35px">  hrs'
                +'<input type="number" id="startMin_' + groupNum + '" placeholder="' + startMin + '" min="0" step="15" max="45" style="width:35px">  min<br>'
                +'<b>Total Runtime: </b><br>' 
                +'Hours: <input type = "number" id="hours_' + groupNum + '" placeholder="'+numHours+'" min="2" style="width:35px"/>          ' 
                +'Minutes: <input type = "number" id = "minutes_' + groupNum + '" placeholder="'+minutesLeft+'" style="width:35px" min="0" step="15" max="45"/><br>'
                +'<br><b>Members</b><br> <div id="event' + groupNum + 'memberList">'+ writeEventMembers(event_counter) +'</div>'
                +'<br>Directly-Responsible Individual for This Event<br><select class="driInput" id="driEvent_' + pillCounter + '"></select>'
                +'<br><b>Notes: </b><textarea rows="3" id="notes_' + groupNum + '"></textarea>'
                +'<br><br><p><button type="button" id="delete" onclick="deleteRect(' + groupNum +');">Delete</button>       ' 
                +'<button type="button" id="save" onclick="saveEventInfo(' + groupNum + ');">Save</button> </p>' 
                +'<button type="button" id="complete" onclick="completeTask(' + groupNum + ');">Complete</button> </p>' 
                +'</form>',
                container: $("#timeline-container")
            });
            if(showPopover){
                $(this).popover("show");
            } else {
                $(this).popover("hide");
            }
        });

    $(document).ready(function() {
        pressEnterKeyToSubmit("#eventMember_" + groupNum, "#addEventMember_" + groupNum);
    });
};

//Populate the autocomplete function for the event members
//TO BE DELETED, WILL BE CHANGING TO A CHECKBOX SYSTEM
function addMemAuto() {
    var memberArray = new Array(flashTeamsJSON["members"].length);
    for (i = 0; i < flashTeamsJSON["members"].length; i++) {
        memberArray[i] = flashTeamsJSON["members"][i].role;
    }

    $(".eventMemberInput").each(function() {
        $(this).autocomplete({
            source: memberArray
        });
    })
}

//Called when the user clicks save on an event popover, grabs new info from user and updates 
//both the info in the popover and the event rectangle graphics
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

    var eventNotes = $("#notes_" + popId).val();

    //ADD EVENT MEMBERS, SEE IF THEY ARE CHECKED OR UNCHECKED???
    var indexOfJSON = getEventJSONIndex(popId);
    for (i = 0; i<flashTeamsJSON["members"].length; i++) {
        //START HERE
        var memberName = flashTeamsJSON["members"][i].role;

        if ( $("#event" + popId + "member" + i + "checkbox")[0].checked == true) {
            if (flashTeamsJSON["events"][indexOfJSON].members.indexOf(memberName) == -1) {
                addEventMember(popId, i);
            }
        } else {
            for (j = 0; j<flashTeamsJSON["events"][indexOfJSON].members.length; j++) {
                if (flashTeamsJSON["events"][indexOfJSON].members[j] == flashTeamsJSON["members"][i].role) {
                    var memId = flashTeamsJSON["members"][i].id;
                    flashTeamsJSON["events"][indexOfJSON].members.splice(j, 1);
                    $("#event_" + popId + "_eventMemLine_" + memId).remove(); //THIS IS THE PROBLEM, j
                }
            }
        }
    }

    //Update width
    var newHours = $("#hours_" + popId).val();
    var newMin = $("#minutes_" + popId).val();
    if (newHours == "") newHours = parseInt($("#hours_" + popId)[0].placeholder);
    if (newMin == "") newMin = parseInt($("#minutes_" + popId)[0].placeholder);
    var newWidth = (newHours * 100) + (newMin/15*25);
    updateWidth(popId, newHours, newMin); //Also updates width of event members
    updateStartPlace(popId, startHour, startMin, newWidth);

    //Update Popover
    updateEventPopover(popId, newTitle, startHour, startMin, newHours, newMin, eventNotes);

    $("#rect_" + popId).popover("hide");
    overlayOff();

    //Update JSON
    var indexOfJSON = getEventJSONIndex(popId);
    flashTeamsJSON["events"][indexOfJSON].title = newTitle;
    flashTeamsJSON["events"][indexOfJSON].hours = newHours;
    flashTeamsJSON["events"][indexOfJSON].minutes = newMin;
    flashTeamsJSON["events"][indexOfJSON].notes = eventNotes;
    //UPDATE EVENT MEMBERS?
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
}

//Remove a team member from an event
function deleteEventMember(eventId, memberNum, memberName) {
    //Delete the line
    $("#event_" + eventId + "_eventMemLine_" + memberNum).remove();

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
    flashTeamsJSON["events"][indexOfJSON].startTime = (startHr*60) + startMin;
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

//Access the data of a single event's popover and changes the content
function updateEventPopover(idNum, title, startHr, startMin, hrs, min, notes) {
    $("#rect_" + idNum).data('popover').options.title = '<input type ="text" name="eventName" id="eventName_' + event_counter + '" placeholder="' + title + '">';

    $("#rect_" + idNum).data('popover').options.content = '<form name="eventForm_' + event_counter + '">'
        +'<b>Event Start</b><br>' 
        +'<input type="number" id="startHr_' + event_counter + '" placeholder="' + startHr + '" min="0" style="width:35px">'
        +'<input type="number" id="startMin_' + event_counter + '" placeholder="' + startMin + '" step="15" max="45" min="0" style="width:35px"><br>'
        +'<b>Total Runtime: </b><br>' 
        +'Hours: <input type = "number" id="hours_' + event_counter + '" placeholder="' + hrs + '" min="0" style="width:35px"/>          ' 
        +'Minutes: <input type = "number" id = "minutes_' + event_counter + '" placeholder="' + min + '" style="width:35px" min="0" step="15" max="45" min="0"/>'
        +'<br><b>Members</b><br> <div id="event' + event_counter + 'memberList">' +  writeEventMembers(event_counter) + '</div>'
        +'<br><b>Directly-Responsible Individual for This Event<b><br><select class="driInput" id="driEvent_' + pillCounter + '"></select>'
        +'<br><b>Notes: </b><textarea rows="3" id="notes_' + event_counter + '">' + notes + '</textarea>'
        +'<br><br><p><button type="button" id="delete" onclick="deleteRect(' + event_counter +');">Delete</button>       ' 
        +'<button type="button" id="save" onclick="saveEventInfo(' + event_counter + ');">Save</button> </p>'
        +'<button type="button" id="complete" onclick="completeTask(' + event_counter + ');">Complete</button> </p>' 
        +'</form>';
}

function drawInteraction(task2idNum) {
    var task1idNum = INTERACTION_TASK_ONE_IDNUM;
    //START HERE
    console.log("interaction draw called");
    timeline_svg.on("mousemove", null);

    //The user has cancelled the drawing

    if (task1idNum == task2idNum) { //NOT WORKING B/C TASK1 NOT IDENTIFIED
        DRAWING_COLLAB == false;
        DRAWING_HANDOFF == false
        console.log("Cancelled the interaction");
        //FINISH CANCELLING HERE
    
    //Draw a handoff from task one to task two
    } else if (DRAWING_HANDOFF == true) {
        console.log("Drawing a handoff, clicked event ", task2idNum);
        $("#handoff_" + handoff_counter).remove();
        //NOT DONE

        DRAWING_HANDOFF = false;
    //Draw a collaboration link between task one and task two
    } else if (DRAWING_COLLAB == true) {
        console.log("Drawing a collaboration, clicked event ", task2idNum)
        //NOT DONE

        DRAWING_COLLAB = false;
    //There is no collaboration being drawn
    } else {
        console.log("Not drawing anything");
        return;
    }
}

//Adds member checkboxes onto the popover of an event, checks if a member is involved in event
function writeEventMembers(idNum) {
    var indexOfJSON = getEventJSONIndex(idNum);
    var memberString = "";
    if (flashTeamsJSON["members"].length == 0) return "No Team Members";
    for (i = 0; i<flashTeamsJSON["members"].length; i++) {
        var memberName = flashTeamsJSON["members"][i].role;

        var found = false;

        for (j = 0; j<flashTeamsJSON["events"][indexOfJSON].members.length; j++) {
            if (flashTeamsJSON["events"][indexOfJSON].members[j] == memberName) {
                //OLD CODE: onclick="if(this.checked){addEventMember(' + event_counter + ', ' +  i + ')}"
                memberString += '<input type="checkbox" id="event' + idNum + 'member' + i + 'checkbox" checked="true">' + memberName + "   ";
                found = true;
                break;
            }
        }
        if (!found) {
            memberString +=  '<input type="checkbox" id="event' + idNum + 'member' + i + 'checkbox">' + memberName + "   "; 
        }      
    }
    return memberString;
}

//Called when a user clicks the gray handoff arrow, initializes creating a handoff b/t two events
function writeHandoff() {
    handoff_counter++;
    DRAWING_HANDOFF = true;
    var m = d3.mouse(this);
    console.log("x: " + m[0] + " y: " + m[1]);
    line = timeline_svg.append("line")
        .attr("class", "handOffLine")
        .attr("id", function() {
            return "handoff_" + handoff_counter;
        })
        .attr("x1", m[0])
        .attr("y1", m[1])
        .attr("x2", m[0])
        .attr("y2", m[1])
        .attr("stroke-width", 3)
        .attr("stroke", "gray");
    console.log(line);
    timeline_svg.on("mousemove", handoffMouseMove);
}

//Follow the mouse movements after a handoff is initialized
function handoffMouseMove() {
    console.log("in the mouse move");
    var m = d3.mouse(this);
    line.attr("x2", m[0])
        .attr("y2", m[1]);
    //timeline_svg.on("click", handoffMouseClick);
}

//OLD CODE: Stop following the position of the mouse
/*function handoffMouseClick() {
    //SET INDICATOR TO FALSE, WHEN CLICKED ANYWHERE
    timeline_svg.on("mousemove", null);
}*/

//Called when a user clicks the black collaboration arrow, initializes creating a collaboration b/t two events
function writeCollaboration() {
    console.log("Trying to write a collaboration");
}

//Turn on the overlay so a user cannot continue to draw events when focus is on a popover
function overlayOn() {
    document.getElementById("overlay").style.display = "block";
}

//Remove the overlay so a user can draw events again
function overlayOff() {
    $(".task_rectangle").popover("hide");
    document.getElementById("overlay").style.display = "none";
}

//Access a particular "event" in the JSON by its id number and return its index in the JSON array of events
function getEventJSONIndex(idNum) {
    for (i = 0; i < flashTeamsJSON["events"].length; i++) {
        if (flashTeamsJSON["events"][i].id == idNum) {
            return i;
        }
    }
}

//VCom Time expansion button trial 
function addTime() {
    calcAddHours(timelineHours);
    
    //Recalculate 'x' based on added hours
    var x = d3.scale.linear()
    .domain([0, hours])
    .range([0, hours]);
    
    //Reset overlay and svg width
	document.getElementById("overlay").style.width = SVG_WIDTH + 50 + "px";
    timeline_svg.attr("width", SVG_WIDTH);
    
    //Remove all exising grid lines
    timeline_svg.selectAll("line").remove();
    
    //Redraw all x-axis grid lines
    timeline_svg.selectAll("line.x")
    .data(x.ticks(XTicks)) 
    .enter().append("line")
    .attr("class", "x")
    .attr("x1", x)
    .attr("x2", x)
    .attr("y1", 15)
    .attr("y2", SVG_HEIGHT-50)
    .style("stroke", "#000");
    
    //Redraw all y-axis grid lines
    timeline_svg.selectAll("line.y")
    .data(yLines) 
    .enter().append("line")
    .attr("class", "y")
    .attr("x1", 0)
    .attr("x2", SVG_WIDTH-50)
    .attr("y1", y)
    .attr("y2", y)
    .style("stroke", "#d3d1d1");
    
    //Redraw darker first x and y grid lines
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
    
    //Remove existing X-axis labels -- can't get this to work
    //timeline_svg.selectAll(".rule").remove();
    numMins = -30;

    //Redraw X-axis labels
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
    
    //Add ability to draw rectangles on extended timeline
    timeline_svg.append("rect")
    .attr("class", "background")
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT)
    .attr("fill", "white")
    .attr("fill-opacity", 0)
    .on("mousedown", mousedown);
    
}

//VCom Calculates how many hours to add when user expands timeline
function calcAddHours(currentHours) {
    timelineHours = currentHours + Math.floor(currentHours/3);
    hours = timelineHours * Y_WIDTH;
    
    SVG_WIDTH = timelineHours * 100 + 50;
    XTicks = timelineHours * 2;
}