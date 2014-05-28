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
var poll_interval_id;
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
var in_progress = false;
var delayed_tasks_time = [];
var dri_responded = [];
var project_status_handler;
var cursor_details;
var cursor_interval_id;
var tracking_tasks_interval_id;

var window_visibility_state = null;
var window_visibility_change = null;

var getXCoordForTime = function(t){
   // console.log("time t: " + t);
    var numInt = parseInt(t / timeline_interval);
    var remainder = t % timeline_interval;
   // console.log("numInt: " + numInt + " | remainder: " + remainder);

    var xCoordForRemainder = (remainder / timeline_interval) * 50;
    var xCoordForMainIntervals = 50*numInt;
   // console.log("xCoordForRemainder: " + xCoordForRemainder + " | xCoordForMainIntervals: " + xCoordForMainIntervals);

    var finalX = parseFloat(xCoordForRemainder) + parseFloat(xCoordForMainIntervals);
   // console.log("finalX: " + finalX);
    return {"finalX": finalX, "numInt": numInt};
};

function removeColabBtns(){
   var events = flashTeamsJSON["events"];
   for (var i = 0; i < events.length; i++){
        var eventObj = events[i];
        var groupNum = eventObj["id"];
        var task_g = getTaskGFromGroupNum(groupNum);
        task_g.selectAll(".collab_btn").attr("display","none");
    }
};

function removeHandoffBtns(){
    var events = flashTeamsJSON["events"];
   for (var i = 0; i < events.length; i++){
        var eventObj = events[i];
        var groupNum = eventObj["id"];
        var task_g = getTaskGFromGroupNum(groupNum);
        task_g.selectAll(".handoff_btn").attr("display","none");
    }

};

$("#flashTeamStartBtn").click(function(){
    // view changes
    $("#flashTeamStartBtn").attr("disabled", "disabled");
    $("div#search-events-container").css('display','none');
    $("div#project-status-container").css('display','');
    $("div#chat-box-container").css('display','');
    $("#flashTeamTitle").css('display','none');
    removeColabBtns();
    removeHandoffBtns();
    startTeam(false);
    googleDriveLink();
});



$("#flashTeamEndBtn").click(function(){
    updateStatus(false);
    stopCursor();
    stopProjectStatus();
    stopPolling();
    stopTrackingTasks();
    $("#flashTeamEndBtn").attr("disabled", "disabled");
});

function stopPolling() {
    console.log("STOPPED POLLING");
    window.clearInterval(poll_interval_id);
};

function stopTrackingTasks() {
    console.log("STOPPED TRACKING TASKS");
    window.clearInterval(tracking_tasks_interval_id);
};

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var uniq = getParameterByName('uniq');
$("#uniq").value = uniq;

var chat_role;
var chat_name;

$(document).ready(function(){
    var flash_team_id = $("#flash_team_id").val();
    var url = '/flash_teams/' + flash_team_id + '/get_status';
    $.ajax({
        url: url,
        type: 'get'
    }).done(function(data){
        renderChatbox();

        //get user name and user role for the chat
        if(data == null){
            console.log("RETURNING BEFORE LOAD"); 
            return; // status not set yet
        }
        loadedStatus = data;

        in_progress = loadedStatus.flash_team_in_progress;
        flashTeamsJSON = loadedStatus.flash_teams_json;

        setCurrentMember();

        if(in_progress){
            console.log("flash team in progress");
            //renderChatbox();
            $("#flashTeamStartBtn").attr("disabled", "disabled");
            loadData(true);
            renderMembersUser();
            startTeam(true);
        } else {
            console.log("flash team not in progress");
            if(flashTeamsJSON){
                // gdrive
                if (flashTeamsJSON.events.length == 0 && flashTeamsJSON.members.length == 0){
                    createNewFolder(flashTeamsJSON["title"]);
                }

                // render view
                loadData(false);
                updateAllPopoversToReadOnly();
                if(!isUser) {
                    renderMembersRequester();
                }
                //renderChatbox();
            }
        }

    });

    poll_interval_id = poll();

    listenForVisibilityChange();
});

function listenForVisibilityChange(){
    if (typeof document.hidden !== "undefined") {
        window_visibility_change = "visibilitychange";
        window_visibility_state = "visibilityState";
    } else if (typeof document.mozHidden !== "undefined") {
        window_visibility_change = "mozvisibilitychange";
        window_visibility_state = "mozVisibilityState";
    } else if (typeof document.msHidden !== "undefined") {
        window_visibility_change = "msvisibilitychange";
        window_visibility_state = "msVisibilityState";
    } else if (typeof document.webkitHidden !== "undefined") {
        window_visibility_change = "webkitvisibilitychange";
        window_visibility_state = "webkitVisibilityState";
    }

    // Add a listener for the next time that the page becomes visible
    document.addEventListener(window_visibility_change, function() {
        var state = document[window_visibility_state];
        if(state == "visible" && in_progress){
            location.reload();
        }
    }, false);
};  

//finds user name and sets current variable to user's index in array
var renderChatbox = function(){
    var uniq_u=getParameterByName('uniq');
        
    var url2 = '/flash_teams/' + flash_team_id + '/get_user_name';
    $.ajax({
       url: url2,
       type: 'post',
       data : { "uniq" : String(uniq_u) }
    }).done(function(data){
       chat_name = data["user_name"];
       chat_role = data["user_role"];
       if (chat_role == "" || chat_role == null){
         uniq_u2 = data["uniq"];
         
        
         flash_team_members = flashTeamsJSON["members"];
         console.log(flash_team_members[0].uniq);
         for(var i=0;i<flash_team_members.length;i++){
            
            if (flash_team_members[i].uniq == uniq_u2){
              chat_role = flash_team_members[i].role; 
              current = i;

              // here there once existed a call to boldEvents
              trackUpcomingEvent();

            }
         }
        
       }
    });
};

var flashTeamEndedorStarted = function(){
    if (loadedStatus.flash_team_in_progress == undefined){
        return false;
    }
    return in_progress != loadedStatus.flash_team_in_progress;
};

var flashTeamUpdated = function(){
    var updated_drawn_blue_tasks = loadedStatus.drawn_blue_tasks;
    var updated_completed_red_tasks = loadedStatus.completed_red_tasks;

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
    console.log("POLLING");
    return setInterval(function(){
        console.log("MAKING POLL NOW...");
        var flash_team_id = $("#flash_team_id").val();
        var url = '/flash_teams/' + flash_team_id + '/get_status';
        $.ajax({
            url: url,
            type: 'get'
        }).done(function(data){
            if(data == null) return;
            loadedStatus = data;
            //console.log(loadedStatus);

            if(flashTeamEndedorStarted() || flashTeamUpdated()) {
                stopPolling();
                location.reload();
            } else {
                console.log("Flash team not updated and not ended");
            }
        });
    }, poll_interval); // every 5 seconds currently
};

var recordStartTime = function(){
    flashTeamsJSON["startTime"] = (new Date).getTime();
    updateStatus(true);
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

var loadData = function(in_progress){
    live_tasks = loadedStatus.live_tasks;
    remaining_tasks = loadedStatus.remaining_tasks;
    delayed_tasks = loadedStatus.delayed_tasks;
    drawn_blue_tasks = loadedStatus.drawn_blue_tasks;
    completed_red_tasks = loadedStatus.completed_red_tasks;

    load_statusBar(status_bar_timeline_interval);
    
    var latest_time;
    if (in_progress){
        latest_time = (new Date).getTime();
    } else {
        latest_time = loadedStatus.latest_time;
    }
    cursor_details = positionCursor(flashTeamsJSON, latest_time);

    event_counter = flashTeamsJSON["events"].length;
    
    drawEvents(!in_progress);
    drawBlueBoxes();
    drawRedBoxes();
    drawDelayedTasks();
    drawInteractions();
    googleDriveLink();
};

var googleDriveLink = function(){
    var gFolderLink = document.getElementById("gFolder");
    gFolderLink.onclick=function(){
        console.log("is clicked");
        window.open(flashTeamsJSON.folder[1]);
    }
};

var startTeam = function(team_in_progress){
    console.log("STARTING TEAM");
    updateAllPopoversToReadOnly();

    if(team_in_progress){
        startCursor(cursor_details);
    } else {
        in_progress = true;
        recordStartTime();
        console.log("recorded Start time");
        addAllFolders();
        setCursorMoving();
    }
    //init_statusBar(status_bar_timeline_interval);

    load_statusBar(status_bar_timeline_interval);
    project_status_handler = setProjectStatusMoving();
    trackLiveAndRemainingTasks();
    console.log("Let me show the current user's events", currentUserEvents);
    trackUpcomingEvent();
    // poll_interval_id = poll();
};

var drawEvents = function(editable){
    for(var i=0;i<flashTeamsJSON.events.length;i++){
        var ev = flashTeamsJSON.events[i];
        console.log("DRAWING EVENT " + i);
        drawEvent(ev, true);
        drawPopover(ev, editable, false);
    }
};

var drawBlueBox = function(ev, task_g){
    var completed_x = ev.completed_x;

    if (!completed_x){
        return null;
    }

    var groupNum = ev.id;

    var task_start = parseFloat(ev.x);
    var task_rect_curr_width = parseFloat(getWidth(ev));
    var task_end = task_start + task_rect_curr_width;
    var blue_width = task_end - completed_x;
    
    task_g.append("rect")
        .attr("class", "early_rectangle")
        .attr("x", completed_x)
        .attr("y", function(d){ return d.y; })
        .attr("id", "early_rect_" + groupNum )
        .attr("groupNum", function(d){ return d.groupNum; })
        .attr("height", RECTANGLE_HEIGHT)
        .attr("width", blue_width)
        .attr("fill", "blue")
        .attr("fill-opacity", .6)
        .attr("stroke", "#5F5A5A");

    return blue_width;
};

var drawRedBox = function(ev, task_g, use_cursor){
    var groupNum = ev.id;
    var task_start = parseFloat(ev.x);
    var task_rect_curr_width = parseFloat(getWidth(ev));
    var task_end = task_start + task_rect_curr_width;
    var completed_x = ev.completed_x;
    var red_width;
    if(!use_cursor){
        if (!completed_x){
            red_width = 1;
        } else {
            completed_x = parseFloat(completed_x);
            red_width = completed_x - task_end;
        }
    } else {
        var cursor_x = parseFloat(cursor.attr("x1"));
        red_width = cursor_x - task_end;
    }

    // add red box of width 1
    task_g.append("rect")
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
        var ev = flashTeamsJSON["events"][getEventJSONIndex(drawn_blue_tasks[i])];
        var task_g = getTaskGFromGroupNum(drawn_blue_tasks[i]);
        drawBlueBox(ev, task_g);
    }
};

var drawRedBoxes = function(){
    for (var i=0;i<completed_red_tasks.length;i++){
        var ev = flashTeamsJSON["events"][getEventJSONIndex(completed_red_tasks[i])];
        var task_g = getTaskGFromGroupNum(completed_red_tasks[i]);
        drawRedBox(ev, task_g, false);
    }
};

var drawDelayedTasks = function(){
    var cursor_x = parseFloat(cursor.attr("x1"));
    var before_tasks = computeTasksBeforeCurrent(cursor_x);
    var tasks_after = null;
    var allRanges = [];

    for (var i=0;i<before_tasks.length;i++){
        var groupNum = parseInt(before_tasks[i]);
        var ev = flashTeamsJSON["events"][getEventJSONIndex(groupNum)];
        var task_g = getTaskGFromGroupNum(groupNum);
        var completed = ev.completed_x;
        if (completed) continue;

        console.log("task " + groupNum + " is now delayed, so drawing red box");
        console.log("LOADED LIVE TASKS: " + live_tasks);
        var red_width = drawRedBox(ev, task_g, true);
        if(live_tasks.indexOf(groupNum) != -1) {
            live_tasks.splice(i, 1);
            console.log("live tasks: " + live_tasks);
            console.log("delayed tasks: " + delayed_tasks);
            console.log("PUSHING " + groupNum + " TO DELAYED_TASKS: " + delayed_tasks);
            delayed_tasks.push(groupNum);
        }

        var groupNum = ev.id;
        var task_start = parseFloat(ev.x);
        var task_rect_curr_width = parseFloat(getWidth(ev));
        var task_end = task_start + task_rect_curr_width;
        var red_end = task_end + red_width;
        tasks_after = computeTasksAfterCurrent(task_end); // TODO: right-most task or left-most task?

        allRanges.push([task_end, red_end]);
        //moveTasksRight(tasks_after_curr, red_width);
    }

    if (tasks_after != null){
        var actual_offset = computeTotalOffset(allRanges);
        //console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&& ACTUAL OFFSET: " + actual_offset);
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

var positionCursor = function(team, latest_time){
    if(!team["startTime"]){
        cursor.attr("x1", 0);
        cursor.attr("x2", 0);
        curr_x_standard = 0;
        return;
    }

    var currTime = latest_time;
    var startTime = team["startTime"];
    var diff = currTime - startTime;

    //console.log(startTime);
    //console.log(currTime);
    //console.log("diff in seconds: " + diff/1000);

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
   // console.log("time: " + length_of_time + " | target_x: " + target_x);
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

    var next = function(){
        moveCursor(length_of_time);
    };

    cursor.transition()
        .duration(length_of_time)
        .ease("linear")
        .attr("x1", curr_x_standard)
        .attr("x2", curr_x_standard)
        .each("end", next);
};

var setCursorMoving = function(){
    moveCursor(timeline_interval);
    /*
    cursor_interval_id = window.setInterval(function(){
        //console.log("CALLING INTERVAL METHOD FOR CURSOR");
        moveCursor(timeline_interval);
    }, timeline_interval); // every 18 seconds currently
    */
    //console.log("CURSOR INTERVAL: " + cursor_interval_id);
    //console.log("SET INTERVAL FOR CURSOR");
};

var stopCursor = function() {
    console.log("STOPPED CURSOR");
    cursor.transition().duration(0);
    window.clearInterval(cursor_interval_id);
};

var computeLiveAndRemainingTasks = function(){
    //console.log("computing live and remaining tasks: " + task_groups.length);
    var curr_x = cursor.attr("x1");
    var curr_new_x = parseFloat(curr_x) + increment;

    var remaining_tasks = [];
    var live_tasks = [];
    for (var i=0;i<task_groups.length;i++){
        var data = task_groups[i];
        var groupNum = data.groupNum;

        var ev = flashTeamsJSON["events"][getEventJSONIndex(groupNum)];
        var start_x = ev.x;
        var width = getWidth(ev);
        var end_x = parseFloat(start_x) + parseFloat(width);

        if(curr_new_x >= start_x && curr_new_x <= end_x && drawn_blue_tasks.indexOf(groupNum) == -1){
            live_tasks.push(groupNum);
        } else if(curr_new_x < start_x){
            remaining_tasks.push(groupNum);
        }
    }
    //console.log("returning from computing live and remaining tasks");
    return {"live":live_tasks, "remaining":remaining_tasks};
};

var computeTasksAfterCurrent = function(curr_x){
    tasks_after_curr = [];
    
    // go through all tasks
    for (var i=0;i<task_groups.length;i++){
        var data = task_groups[i];
        var groupNum = data.groupNum;

        // get start x coordinate of task
        var ev = flashTeamsJSON["events"][getEventJSONIndex(groupNum)];
        var start_x = ev.x;
        
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
        var data = task_groups[i];
        var groupNum = data.groupNum;

        // get start x coordinate of task
        var ev = flashTeamsJSON["events"][getEventJSONIndex(groupNum)];
        var start_x = ev.x;
        var width = getWidth(ev);
        var end_x = parseFloat(start_x) + parseFloat(width);
        
        // if the task's end x coordinate is before the current x, it is "before," so add it
        if(end_x < curr_x){
            tasks_before_curr.push(groupNum);
        }
    }

    return tasks_before_curr;
};

/*
    Usage:
    var g = getTaskGFromGroupNum(groupNum);
    g.append("rect").attr()..
    g.data()
*/
var getTaskGFromGroupNum = function(groupNum){
    return timeline_svg.selectAll("g#g_"+groupNum);
};

var getDataIndexFromGroupNum = function(groupNum){
    for(var i=0;i<task_groups.length;i++){
        var data = task_groups[i];
        if(data.groupNum == groupNum){
            return i;
        }
    }
    return null;
};

var removeTask = function(groupNum){
    // destroy popover
    destroyPopover(groupNum);

    // remove from data array
    var idx = null;
    for(var i=0;i<task_groups.length;i++){
        var data = task_groups[i];
        if (data.groupNum == groupNum){
            idx = i;
            break;
        }
    }
    if(idx != null){
        task_groups.splice(idx, 1);
    }

    // remove from screen
    timeline_svg.selectAll("g").data(task_groups, function(d){ return d.groupNum; }).exit().remove();
};

var extendDelayedBoxes = function(){
    // go through delayed tasks and increase width of red box
    var cursor_x = parseFloat(cursor.attr("x1"));
    var diff = 0;
    //console.log("NUM DELAYED TASKS: " + delayed_tasks.length);
    for (var i=0;i<delayed_tasks.length;i++){
        var groupNum = delayed_tasks[i];
        //console.log("DELAYED TASK: " + groupNum + " | index: " + i);
        var delayed_rect = timeline_svg.selectAll("#delayed_rect_" + groupNum);
        
        // new width is diff b/w current cursor position and starting of delayed rect
        var curr_width = parseFloat(delayed_rect.attr("width"));
        var new_width = cursor_x - parseFloat(delayed_rect.attr("x"));
        delayed_rect.attr("width", new_width);
        
        diff = new_width - curr_width;
        //console.log("DIFF IS: " + diff);
    }
    if(diff > 0){
        moveRemainingTasksRight(diff);
    }
};

var drawInteractions = function(tasks){
    console.log("DRAWING INTERACTIONS FOR TASKS: " + tasks);
    //Find Remaining Interactions and Draw
    var remainingHandoffs = getHandoffs(tasks);
    var numHandoffs = remainingHandoffs.length;

    var remainingCollabs = getCollabs(tasks);
    var numCollabs = remainingCollabs.length;

    for (var j = 0; j < numHandoffs; j++) {
        deleteInteraction(remainingHandoffs[j].id);
        drawHandoff(remainingHandoffs[j]);
    }

    for (var k = 0; k < numCollabs; k++) {
        deleteInteraction(remainingCollabs[k].id);
        var event1 = flashTeamsJSON["events"][getEventJSONIndex(remainingCollabs[k].event1)];
        var event2 = flashTeamsJSON["events"][getEventJSONIndex(remainingCollabs[k].event2)];
        var overlap = eventsOverlap(event1.x, getWidth(event1), event2.x, getWidth(event2));
        drawCollaboration(remainingCollabs[k], overlap);
    }

    console.log("DONE DRAWING INTERACTIONS");
};

var moveTasksRight = function(tasks, amount){
    var len = tasks.length;
    for (var i=0;i<len;i++){
        // get the task id
        var groupNum = tasks[i];

        // get the event object
        var ev = flashTeamsJSON["events"][getEventJSONIndex(groupNum)];

        // change the start x
        ev.x += parseFloat(amount);

        // change the time corresponding to the new start x
        var startTimeObj = getStartTime(ev.x);
        ev.startTime = startTimeObj["startTime"];
        ev.startHr = startTimeObj["startHr"];
        ev.startMin = startTimeObj["startMin"];

        drawEvent(ev, false);
        drawPopover(ev, false, false);
    }

    var tasks_with_current = tasks.slice(0);
    tasks_with_current = tasks_with_current.concat(delayed_tasks);
    drawInteractions(tasks_with_current);
};

//Notes: Error exist with delay and handoff connections...how and why are those dependencies the way they are?

var moveTasksLeft = function(tasks, amount){
    for (var i=0;i<tasks.length;i++){
        // get the task id
        var groupNum = tasks[i];
        
        // get the event object
        var ev = flashTeamsJSON["events"][getEventJSONIndex(groupNum)];
        
        // change the start x
        ev.x -= parseFloat(amount);
        
        // change the time corresponding to the new start x
        var startTimeObj = getStartTime(ev.x);
        ev.startTime = startTimeObj["startTime"];
        ev.startHr = startTimeObj["startHr"];
        ev.startMin = startTimeObj["startMin"];

        drawEvent(ev, false);
        drawPopover(ev, false, false);
    }

    var tasks_with_current = tasks.slice(0);
    tasks_with_current = tasks_with_current.concat(delayed_tasks);
    drawInteractions(tasks_with_current);
};

var moveRemainingTasksRight = function(amount){
    moveTasksRight(remaining_tasks, amount);
};

var moveRemainingTasksLeft = function(amount){
    // console.log("THESE ARE THE REMAINING TASKS", remaining_tasks);
    lastEndTime = 0;
    for (var i=0;i<live_tasks.length;i++){
        var ev = flashTeamsJSON["events"][getEventJSONIndex(live_tasks[i])]
        var start_x = ev.x;
        var width = getWidth(ev);
        var end_x = parseFloat(start_x) + parseFloat(width);
        if (end_x > lastEndTime){
            lastEndTime = end_x;
        }
    }
    to_move = [];
    for (var i=0;i<remaining_tasks.length;i++){
        var evNum = remaining_tasks[i];
        var ev = flashTeamsJSON["events"][getEventJSONIndex(evNum)]
        var start_x = ev.x;
        var width = getWidth(ev);
        var end_x = parseFloat(start_x) + parseFloat(width);
        if (start_x > lastEndTime + 15){
            to_move.push(evNum);
        }
    }
    moveTasksLeft(to_move, amount);
}

/*
TODO:
update popover when automatically shift the tasks left or right
shorten width when finish early (?)
offset of half of drag bar width when drawing red and blue boxes
*/
var trackLiveAndRemainingTasks = function() {
    tracking_tasks_interval_id = setInterval(function(){
        var tasks = computeLiveAndRemainingTasks();
        //console.log(tasks["remaining"]);
        var new_live_tasks = tasks["live"];
        var new_remaining_tasks = tasks["remaining"];

        // extend already delayed boxes
        extendDelayedBoxes();

        var at_least_one_task_delayed = false;

        // detect any live task is delayed or completed early
        for (var i=0;i<live_tasks.length;i++){
            var groupNum = parseInt(live_tasks[i]);
            var task_g = getTaskGFromGroupNum (groupNum);
            var ev = flashTeamsJSON["events"][getEventJSONIndex(groupNum)];
            //console.log("LOOKING AT TASK " + ev.id);
            var completed = ev.completed_x;
            var task_rect_curr_width = parseFloat(getWidth(ev));

            // delayed
            if (new_live_tasks.indexOf(groupNum) == -1 && !completed) { // groupNum is no longer live
                //console.log("TASK DELAYED!");
                drawRedBox(ev, task_g, false);

                // add to delayed_tasks list
                delayed_tasks.push(groupNum);
                
                // updateStatus is required to send the notification email when a task is delayed
                delayed_tasks_time[groupNum]=(new Date).getTime();

                at_least_one_task_delayed = true;
            }
        }

        live_tasks = new_live_tasks;
        remaining_tasks = new_remaining_tasks;
        if(at_least_one_task_delayed){
            updateStatus(true);
            at_least_one_task_delayed = false;
        }
    }, fire_interval);
};

//Search all handoffs, return those that involve only two remaining tasks
function getHandoffs(tasks) {
    var handoffs = [];
    for (var i=0; i<flashTeamsJSON["interactions"].length; i++) {
        var inter = flashTeamsJSON["interactions"][i];
        if (inter.type == "collaboration") continue;

        if(tasks == undefined){
            handoffs.push(inter);
        } else {
            for (var j = 0; j<tasks.length; j++) {
                var task1Id = tasks[j];
                for (var k = 0; k<tasks.length; k++) {
                    if (j == k) continue;
                    var task2Id = tasks[k];
                    if ((inter.event1 == task1Id && inter.event2 == task2Id) 
                    || (inter.event1 == task2Id && inter.event2 == task1Id)) {
                        handoffs.push(inter);
                    }
                }
            }
        }
    }

    return handoffs;
}

//Search all collaborations, return those that involve only two remaining tasks
function getCollabs(tasks) {
    var collabs = [];
    for (var i=0; i<flashTeamsJSON["interactions"].length; i++) {
        var inter = flashTeamsJSON["interactions"][i];
        if (inter.type == "handoff") continue;

        if(tasks == undefined){
            collabs.push(inter);
        } else {
            for (var j = 0; j<tasks.length; j++) {
                var task1Id = tasks[j];
                for (var k = 0; k<tasks.length; k++) {
                    if (j == k) {
                        continue;
                    }
                    var task2Id = tasks[k];
                    if ((inter.event1 == task1Id && inter.event2 == task2Id) 
                    || (inter.event1 == task2Id && inter.event2 == task1Id)) {
                        collabs.push(inter);
                    }
                }
            }
        }
    }

    return collabs;
}

function isDelayed(element) {
    for (var i=0; i<delayed_tasks.length;i++){
        if (delayed_tasks[i] == element){
            return true;
        }
    }
    return false;
};

//Tracks a current user's ucpcoming and current events
var trackUpcomingEvent = function(){
     if (current == null){
        return;
    }
    setInterval(function(){
        if(!upcomingEvent) return;
        var ev = flashTeamsJSON["events"][getEventJSONIndex(upcomingEvent)];
        var task_g = getTaskGFromGroupNum(upcomingEvent);
        if (ev.completed_x){
            toDelete = upcomingEvent;
            console.log("BEFORE SPLICING", currentUserEvents);
            currentUserEvents.splice(0,1);
            console.log("AFTER SPLICING", currentUserEvents);
            if (currentUserEvents.length == 0){
                $("#rect_" + toDelete).attr("fill-opacity", .4);
                upcomingEvent = undefined;
                statusText.text("You've Completed Your Tasks!");
                return;
            }
            upcomingEvent = currentUserEvents[0].id;
            // console.log("AFTER SPLICING", currentUserEvents, upcomingEvent);
            $("#rect_" + toDelete).attr("fill-opacity", .4);
            $("#rect_" + upcomingEvent).attr("fill-opacity", .9);
            task_g = getTaskGFromGroupNum(upcomingEvent);
        }
        var cursor_x = cursor.attr("x1");
        var cursorHr = (cursor_x-(cursor_x%100))/100;
        var cursorMin = (cursor_x%100)/25*15;
        if(cursorMin == 57.599999999999994) {
            cursorHr++;
            cursorMin = 0;
        } else cursorMin += 2.4
        var cursorTimeinMinutes = parseInt((cursorHr*60)) + parseInt(cursorMin);
        console.log(currentUserEvents, currentUserEvents[0]);
        console.log("THIS IS START HOUR AND MINUTES", currentUserEvents[0].startHr, currentUserEvents[0].startMin);
        currentUserEvents[0].startTime = parseInt(currentUserEvents[0].startHr)*60 + parseInt(currentUserEvents[0].startMin);
        console.log("THIS IS THE START TIME", currentUserEvents[0].startTime);
        var displayTimeinMinutes = parseInt(currentUserEvents[0].startTime) - parseInt(cursorTimeinMinutes);
        console.log(currentUserEvents[0].startTime);
        console.log("DISPLAY TIME", displayTimeinMinutes);
        var hours = parseInt(displayTimeinMinutes/60);
        var minutes = displayTimeinMinutes%60;
        var minutesText = minutes;
        if (minutes < 10){
            minutesText = "0" + minutes;
        }
        var overallTime = hours + ":" + minutesText;
        
        if (displayTimeinMinutes < 0){

            if(!isDelayed(upcomingEvent)){
                overallTime = "NOW";
                statusText.attr("fill", "blue");
            }
            else{
                overallTime = "Your Task Is DELAYED";
                statusText.attr("fill", "red");
            }
        } else{
            statusText.attr("fill", "black");
            overallTime = "Your task starts in " + overallTime;
        }

        statusText.text(overallTime);
       
    }, fire_interval);

    console.log("EXITING TRACKUPCOMINGEVENT FUNCTION");
}


var getAllData = function(){
    var all_data = [];
    for(var i=0;i<task_groups.length;i++){
        var data = task_groups[i];
        all_data.push(data);
    }
    return all_data;
};

var getAllTasks = function(){
    var all_tasks = [];
    for(var i=0;i<task_groups.length;i++){
        var data = task_groups[i];
        var groupNum = data.groupNum;
        all_tasks.push(groupNum);
    }
    return all_tasks;
};

var constructStatusObj = function(){
    var flash_team_id = $("#flash_team_id").val();
    flashTeamsJSON["id"] = flash_team_id;

    var localStatus = {};

    localStatus.live_tasks = live_tasks;
    localStatus.remaining_tasks = remaining_tasks;
    localStatus.delayed_tasks = delayed_tasks;
    localStatus.drawn_blue_tasks = drawn_blue_tasks;
    localStatus.completed_red_tasks = completed_red_tasks;
    localStatus.flash_teams_json = flashTeamsJSON;

    //delayed_task_time is required for sending notification emails on delay
    localStatus.delayed_tasks_time = delayed_tasks_time;
    localStatus.dri_responded = dri_responded;

    return localStatus;
};

var updateStatus = function(flash_team_in_progress){
    var localStatus = constructStatusObj();
    if(flash_team_in_progress != undefined){ // could be undefined if want to call updateStatus in a place where not sure if the team is running or not
        localStatus.flash_team_in_progress = flash_team_in_progress;
    } else {
        localStatus.flash_team_in_progress = in_progress;
    }
    localStatus.latest_time = (new Date).getTime();
    var localStatusJSON = JSON.stringify(localStatus);
    //console.log("updating string: " + localStatusJSON);

    var flash_team_id = $("#flash_team_id").val();
    var authenticity_token = $("#authenticity_token").val();
    var url = '/flash_teams/' + flash_team_id + '/update_status';
    $.ajax({
        url: url,
        type: 'post',
        data: {"localStatusJSON": localStatusJSON, "authenticity_token": authenticity_token}
    }).done(function(data){
        console.log("UPDATED FLASH TEAM STATUS");
    });
};

var sendEmailOnCompletionOfDelayedTask = function(groupNum){
    // send "delayed task is finished" email
    if(remaining_tasks.length!=0){
        var title="test";
        var events = flashTeamsJSON["events"];
        
        for(var i=0;i<events.length;i++){
            var ev = events[i];
            if (parseInt(ev["id"]) == groupNum){
                title = ev["title"];
                break;
            }
        }

        DelayedTaskFinished_helper(remaining_tasks,title);
    }
};

var sendEmailOnEarlyCompletion = function(blue_width){
    var early_minutes=parseInt((parseFloat(blue_width+4)/50.0)*30);
    early_completion_helper(remaining_tasks,early_minutes);
};

var completeTask = function(groupNum){
    var ev = flashTeamsJSON["events"][getEventJSONIndex(groupNum)];

    var cursor_x = cursor.attr("x1");
    ev.completed_x = cursor_x;

    // remove from either live or delayed tasks
    var idx = delayed_tasks.indexOf(groupNum);
    if (idx != -1) { // delayed task
        delayed_tasks.splice(idx, 1);
        completed_red_tasks.push(groupNum);
        sendEmailOnCompletionOfDelayedTask(groupNum);
    } else {
        idx = live_tasks.indexOf(groupNum);
        if (idx != -1){ // live task
            var task_g = getTaskGFromGroupNum (groupNum);
            var blue_width = drawBlueBox(ev, task_g);
            if (blue_width !== null){
                drawn_blue_tasks.push(groupNum);
                moveRemainingTasksLeft(blue_width);
                sendEmailOnEarlyCompletion(blue_width);
            }
            live_tasks.splice(idx, 1);
        }
    }

    hidePopover(groupNum);

    // update db
    updateStatus(true);

    // reload status bar
    load_statusBar(status_bar_timeline_interval);
};

/* --------------- TEAM AWARENESS STUFF END ------------ */
