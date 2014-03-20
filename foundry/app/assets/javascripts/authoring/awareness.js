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
var delayed_tasks_time = [];
var dri_responded = [];

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

$("#flashTeamStartBtn").click(function(){
    $("#flashTeamStartBtn").attr("disabled", "disabled");
    
    recordStartTime();
    updateStatus(true);
    updateAllPopoversToReadOnly();
    
    setCursorMoving();
   
    setProjectStatusMoving();
    trackLiveAndRemainingTasks();
    boldEvents(1);
    trackUpcomingEvent();
    poll();



    /******* projec status bar start*****/

    //moveProjectStatus(timeline_interval);

    

    /******* projec status bar end*****/
    
});

$("#flashTeamEndBtn").click(function(){
    updateStatus(false);
});

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
        //get user name and user role for the chat
         
        var uniq_u=getParameterByName('uniq');
        
        var url2 = '/flash_teams/' + flash_team_id + '/get_user_name';
        $.ajax({
           url: url2,
           type: 'post',
           data : { "uniq" : String(uniq_u) }
        }).done(function(data){
           chat_name = data["user_name"];
           chat_role = data["user_role"];
           //alert(chat_role);
           if (chat_role == ""){
             
             uniq_u2 = data["uniq"];
             flash_team_members = flashTeamsJSON["members"];
             console.log(flash_team_members[0].uniq);
             for(var i=0;i<flash_team_members.length;i++){
                
                if (flash_team_members[i].uniq == uniq_u2){
                  chat_role = flash_team_members[i].role; 
                }
             }
            
           }

           //alert(chat_role);
           //alert(chat_name);
           //end


        if(data == null) return; // status not set yet

        loadedStatus = data;
        var in_progress = loadedStatus.flash_team_in_progress;
        flashTeamsJSON = loadedStatus.flash_teams_json;
        console.log("flashTeamsJSON: ");
        console.log(flashTeamsJSON);
        if(in_progress){
            $("#flashTeamStartBtn").attr("disabled", "disabled");
            loadData();
            poll();
        } else { // note: won't loadData(), even though there may be events created, so users don't see them
            console.log("flash team not in progress");
            renderMembers();
        }

        
        });
    });
});

var flashTeamEnded = function(){
    return !loadedStatus.flash_team_in_progress;
};

var flashTeamUpdated = function(){
    var updated_drawn_blue_tasks = loadedStatus.drawn_blue_tasks;
    var updated_completed_red_tasks = loadedStatus.completed_red_tasks;

   // console.log("updated drawn blue: " + updated_drawn_blue_tasks);
   // console.log("updated completed red: " + updated_completed_red_tasks);
   // console.log("drawn blue: " + drawn_blue_tasks);
   // console.log("completed red: " + completed_red_tasks);

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
                //flashTeamsJSON["members"] = [];
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
    
        var cursor_details = positionCursor(flashTeamsJSON);
        drawBlueBoxes();
        drawRedBoxes();
        drawDelayedTasks();
        renderMembers();
        trackLiveAndRemainingTasks();
        startCursor(cursor_details);
        trackUpcomingEvent();
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
     //   console.log("USING CURSOR!");
        var cursor_x = parseFloat(cursor.attr("x1"));
     //   console.log("cursor_x: " + cursor_x);
      //  console.log("task_end: " + task_end);
        red_width = cursor_x - task_end;
      //  console.log("red_width: " + red_width);
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
        for (i = 0; i<flashTeamsJSON["events"].length; i++){
            var eventt = flashTeamsJSON["events"][i]
            eventId = flashTeamsJSON["events"][i].id
            if (eventId == groupNum){
                var newX = x + parseFloat(amount);
                var newHr = (newX-(newX%100))/100;
                var newMin = (newX%100)/25*15;
                if(newMin == 57.599999999999994) {
                    newHr++;
                    newMin = 0;
                } else newMin += 2.4;
                var newTime = parseInt((newHr*60)) + parseInt(newMin);
               // console.log("new time", newTime);
                flashTeamsJSON["events"][i].startTime = newTime;
               // console.log("time reset!", flashTeamsJSON["events"][i].startTime);
            } 
        }
    }
};

//Notes: Error exist with delay and handoff connections...how and why are those dependencies the way they are?

var moveTasksLeft = function(tasks, amount){
    for (var i=0;i<tasks.length;i++){
        var groupNum = tasks[i];
        var task_g = getTaskGFromGroupNum(groupNum);
        var x = parseFloat(task_g.data()[0].x);
        task_g.data()[0].x = x - parseFloat(amount);
        var group = task_g[0][0];

        var rectWidth = parseFloat(task_g.select("#rect_" + groupNum).attr("width"));
        redraw(group, rectWidth, groupNum);
        for (i = 0; i<flashTeamsJSON["events"].length; i++){
            var eventt = flashTeamsJSON["events"][i]
            eventId = flashTeamsJSON["events"][i].id
            if (eventId == groupNum){
                var newX = x - parseFloat(amount);
                var newHr = (newX-(newX%100))/100;
                var newMin = (newX%100)/25*15;
                if(newMin == 57.599999999999994) {
                    newHr++;
                    newMin = 0;
                } else newMin += 2.4;
                var newTime = parseInt((newHr*60)) + parseInt(newMin);
                console.log("new time", newTime);
                flashTeamsJSON["events"][i].startTime = newTime;
              //  console.log("time reset!", flashTeamsJSON["events"][i].startTime);
            } 
        }
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

                //send email when a task is delayed
                //TODO: call if in master
                delayed_notification_helper(new_remaining_tasks);
                //end   

                // add to delayed_tasks list
                delayed_tasks.push(groupNum);

                //updateStatus is required to send the notification email when a task is delayed
                delayed_tasks_time[groupNum]=(new Date).getTime();
                updateStatus(1);
            }
        }
        live_tasks = new_live_tasks;
        remaining_tasks = new_remaining_tasks;
    }, fire_interval);
};

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
    setInterval(function(){
        task_g = getTaskGFromGroupNum(upcomingEvent)
        if (task_g.data()[0].completed){
            toDelete = upcomingEvent;
            currentUserEvents.splice(0,1);
            upcomingEvent = currentUserEvents[0].id;
            $("#rect_" + toDelete).attr("fill-opacity", .4);
            $("#rect_" + upcomingEvent).attr("fill-opacity", .9);
            task_g = getTaskGFromGroupNum(upcomingEvent)
        }
       // console.log("time", currentUserEvents[0].startTime);
        var cursor_x = cursor.attr("x1");
        var cursorHr = (cursor_x-(cursor_x%100))/100;
        var cursorMin = (cursor_x%100)/25*15;
        if(cursorMin == 57.599999999999994) {
            cursorHr++;
            cursorMin = 0;
        } else cursorMin += 2.4
        var cursorTimeinMinutes = parseInt((cursorHr*60)) + parseInt(cursorMin);
        var displayTimeinMinutes = parseInt(currentUserEvents[0].startTime) - parseInt(cursorTimeinMinutes);
        var hours = parseInt(displayTimeinMinutes/60);
        var minutes = displayTimeinMinutes%60;
        var overallTime = hours + ":" + minutes;
        
        /*send notification email before task starts*/
        var email="rahmati.nr@gmail.com";
        if(minutes==30 && hours==0){
          //  sendBeforeTaskStartsEmail(minutes,email);
        }
        /*end*/


        if (displayTimeinMinutes < 0){
            // make the complete button clickable for live/delayed task
            for (var i = 0; i<flashTeamsJSON["events"].length; i++){
                var eventt = flashTeamsJSON["events"][i];
                eventId = flashTeamsJSON["events"][i].id
                if (eventId == upcomingEvent){
                    updatePopoverToReadOnly(eventt, true);
                    break;
                }
            }

            if(!isDelayed(upcomingEvent)){
                overallTime = "NOW";
                $(statusText.attr("fill", "blue"));
            }
            else{
                overallTime = "DELAYED";
                $(statusText.attr("fill", "red"));
            }
        }else $(statusText.attr("fill", "black"))
      //  console.log("cursor time", cursorTimeinMinutes);
       // console.log("distance", overallTime);
        $(statusText.text(overallTime));
    }, fire_interval);
}


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

    //delayed_task_time is required for sending notification emails on delay
    localStatus.delayed_tasks_time = delayed_tasks_time;
    localStatus.dri_responded = dri_responded;

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

        /*send delayed task is finished email*/
        
        if(remaining_tasks.length!=0){
           
            DelayedTaskFinished_helper(remaining_tasks);
        } /* end */

    } else {
        idx = live_tasks.indexOf(groupNum);
        if (idx != -1){ // live task
            var blue_width = drawBlueBox(task_g);

            /* send early completion email */
            var early_minutes=parseInt((parseFloat(blue_width+4)/50.0)*30);
            early_completion_helper(remaining_tasks,early_minutes);
            /* end */
             
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

current = 1;

function isCurrent(element) {
    var memberName = flashTeamsJSON["members"][current].role;
    return element.members.indexOf(memberName) != -1;
};

//Bold and emphasize the tasks of the current user
function boldEvents(currentUser){
    console.log("it's bold!")
    var uniq = getParameterByName('uniq');
    $("#uniq").value = uniq;
    console.log("yoyoyoyoyo", uniq);
    // if (session[:uniq]){
    //     console.log("Hello");
    // }
    var memberName = flashTeamsJSON["members"][currentUser].role;
    var newColor;
    for (i = 0; i < flashTeamsJSON["members"].length; i++) {
        if (flashTeamsJSON["members"][i].role == memberName) newColor = flashTeamsJSON["members"][i].color;
    }
    for (i = 0; i<flashTeamsJSON["events"].length; i++){
        eventId = flashTeamsJSON["events"][i].id
        if (flashTeamsJSON["events"][i].members.indexOf(memberName) != -1) {
            $("#rect_" + eventId).attr("fill", newColor)
                .attr("fill-opacity", .4);
        }
    }
    currentUserEvents = flashTeamsJSON["events"].filter(isCurrent);
    console.log(currentUserEvents);
    currentUserEvents = currentUserEvents.sort(function(a,b){return parseInt(a.startTime) - parseInt(b.startTime)});
    upcomingEvent = currentUserEvents[0].id;
    $("#rect_" + upcomingEvent).attr("fill-opacity", .9);
};

/* --------------- TEAM AWARENESS STUFF END ------------ */



