/* popovers.js
 * ---------------------------------------------
 * Code that manages the popovers
 * Drawing them on first event create/drop, update events on timeline
 * when new information added including: duration, event members, etc.
 */

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
    var startTimeinMinutes = parseInt((startHr*60)) + parseInt(startMin); 
    //D3, Exit to Remove Deleted Data
    task_g = timeline_svg.selectAll(".task_g").data(task_groups, function(d) {return d.id});
    task_g.exit().remove();
    //add new event to flashTeams database
    var newEvent = {"title":"New Event", "id":event_counter, 
        "startTime": startTimeinMinutes, "duration":totalMinutes, 
        "members":[], "dri":"", "notes":"", "startHr": startHr, "startMin": startMin};
    flashTeamsJSON.events.push(newEvent);
    addEventPopover(startHr, startMin, title, totalMinutes, groupNum, showPopover);
    overlayOn();
};

function updateAllPopoversToReadOnly() {
    for(var i=0;i<flashTeamsJSON.events.length;i++) {
        var ev = flashTeamsJSON.events[i];
        updatePopoverToReadOnly(ev, true);
    }
    console.log("UPDATED ALL POPOVERS TO BE READONLY");
};

function updatePopoverToReadOnly(ev, enableComplete) {
    var groupNum = ev.id;
    var hrs = Math.floor(ev.duration/60);
    var mins = ev.duration % 60;

    $("#rect_" + groupNum).data('popover').options.title = ev.title;

    var content = '<b>Event Start:</b><br>'
        + ev.startHr + ':'
        + ev.startMin + '<br>'
        +'<b>Total Runtime: </b><br>' 
        + hrs + ' hrs ' + mins + ' mins<br>';

    content += '<b>Members:</b><br>';
    for (var j=0;j<ev.members.length;j++){
        content += ev.members[j];
        content += '<br>';
    }

    if (ev.dri != ""){
        content += '<b>Directly-Responsible Individual:</b><br>';
        content += ev.dri;
        content += '<br>';
    }

    if (ev.content != ""){
        content += '<b>Notes:</b><br>';
        content += ev.notes;
        content += '<br>';
    }

    if (enableComplete) {
        content += '<br><form><button type="button" id="complete_' + groupNum 
        + '" onclick="completeTask(' + groupNum + ');">Complete</button><button type="button" id="ok"'
        +' onclick="hidePopover(' + groupNum + ');">Ok</button></form>';
    } else {
        content += '<br><form><button type="button" style="pointer-events:none;" id="complete_' + groupNum 
            + '" onclick="completeTask(' + groupNum + ');">Complete</button><button type="button"' 
            +' id="ok" onclick="hidePopover(' + groupNum + ');">Ok</button></form>';
    }

    $("#rect_" + groupNum).data('popover').options.content = content;
};

function hidePopover(popId){
    $("#rect_" + popId).popover("hide");
    overlayOff();
};

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
                class: "eventPopover",
                id: '"popover' + groupNum + '"',
                trigger: "click",
                title: '<input type ="text" name="eventName" id="eventName_' + groupNum 
                    + '" placeholder="'+title+'" >',
                content: '<table><tr><td>'
                + '<form name="eventForm_' + groupNum + '">'
                +'<b>Event Start:          </b><br>' 
                +'<input type="number" id="startHr_' + groupNum + '" placeholder="' + startHr 
                    + '" min="0" style="width:35px">  hrs'
                +'<input type="number" id="startMin_' + groupNum + '" placeholder="' + startMin 
                    + '" min="0" step="15" max="45" style="width:35px">  min<br>'
                +'<b>Total Runtime: </b><br>' 
                +'Hours: <input type = "number" id="hours_' + groupNum + '" placeholder="'
                    +numHours+'" min="2" style="width:35px"/>          ' 
                +'Minutes: <input type = "number" id = "minutes_' + groupNum + '" placeholder="'+minutesLeft
                    +'" style="width:35px" min="0" step="15" max="45"/><br>'
                +'<br><b>Members</b><br> <div id="event' + groupNum + 'memberList">'
                    + writeEventMembers(groupNum) +'</div>'
                +'</td><td><br>Directly-Responsible Individual for This Event<br><select class="driInput"' 
                    +' name="driName" id="driEvent_' + groupNum + '"' 
                + 'onchange="getDRI('+groupNum + ')">'+ writeDRIMembers(groupNum,0) +'</select>'
                +'<br><b>Notes: </br></b><textarea rows="3" id="notes_' + groupNum + '"></textarea>'
                +'</td></tr><tr><td><br><br><p><button type="button" id="delete"'
                    +' onclick="deleteRect(' + groupNum +');">Delete</button>       ' 
                +'<button type="button" id="save" onclick="saveEventInfo(' + groupNum + ');">Save</button> </p>' 
                +'<button type="button" id="complete" onclick="completeTask(' + groupNum + ');">Complete</button> </p>' 
                +'</form></td></tr>',
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
    var driId = getDRI(popId);
   

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
    updateEventPopover(popId, newTitle, startHour, startMin, newHours, newMin, eventNotes,driId);

    $("#rect_" + popId).popover("hide");
    overlayOff();

    //Update JSON
    var indexOfJSON = getEventJSONIndex(popId);
    flashTeamsJSON["events"][indexOfJSON].title = newTitle;
    flashTeamsJSON["events"][indexOfJSON].hours = newHours;
    flashTeamsJSON["events"][indexOfJSON].minutes = newMin;
    flashTeamsJSON["events"][indexOfJSON].notes = eventNotes;
    flashTeamsJSON["events"][indexOfJSON].dri = driId;
   
    //UPDATE EVENT MEMBERS?
    
};

//Access the data of a single event's popover and changes the content
function updateEventPopover(idNum, title, startHr, startMin, hrs, min, notes, driId) {
    $("#rect_" + idNum).data('popover').options.title = '<input type ="text" name="eventName" id="eventName_' 
        + event_counter + '" placeholder="' + title + '">';

    $("#rect_" + idNum).data('popover').options.content = '<form name="eventForm_' + event_counter + '">'
        +'<b>Event Start</b><br>' 
        +'<input type="number" id="startHr_' + event_counter 
            + '" placeholder="' + startHr + '" min="0" style="width:35px"> hrs  '
        +'<input type="number" id="startMin_' + event_counter 
            + '" placeholder="' + startMin + '" step="15" max="45" min="0" style="width:35px"> min<br>'
        +'<b>Total Runtime: </b><br>' 
        +'Hours: <input type = "number" id="hours_' + event_counter + '" placeholder="' 
            + hrs + '" min="0" style="width:35px"/>          ' 
        +'Minutes: <input type = "number" id = "minutes_' + event_counter + '" placeholder="' + min 
            + '" style="width:35px" min="0" step="15" max="45" min="0"/>'
        +'<br><b>Members</b><br> <div id="event' + event_counter + 'memberList">' 
            +  writeEventMembers(event_counter) + '</div>'
        +'<br>Directly-Responsible Individual for This Event<br><select class="driInput"' 
            +' name="driName" id="driEvent_' + event_counter + '"' 
        + 'onchange="getDRI('+event_counter + ')">'+ writeDRIMembers(event_counter, driId) +'</select>'
        +'<br><b>Notes: <br></b><textarea rows="3" id="notes_' + event_counter + '">' + notes + '</textarea>'
        +'<br><br><p><button type="button" id="delete"' 
            +' onclick="deleteRect(' + event_counter +');">Delete</button>       ' 
        +'<button type="button" id="save" onclick="saveEventInfo(' + event_counter + ');">Save</button> </p>'
        +'<button type="button" id="complete" onclick="completeTask(' + event_counter + ');">Complete</button> </p>' 
        +'</form>';
};


// Adds/updates the DRI dropdown on the event popover
function writeDRIMembers(idNum, driId){
	var indexOfJSON = getEventJSONIndex(idNum);
    var DRIString = '<option value="0">-- Choose DRI --</option>';
    
    var eventDRI = driId;
    
    // at some point change this to only members for that event (not all members in the flash team)
    if (flashTeamsJSON["members"].length == 0) return "No Team Members";
    for (i = 0; i<flashTeamsJSON["members"].length; i++) {
    			var memberName = flashTeamsJSON["members"][i].role;
				var memberId = flashTeamsJSON["members"][i].id;
				
				if (eventDRI == memberId){
					DRIString += '<option value="'+memberId+'"' + 'selected="selected">' + memberName + '</option>';
				}
				else{
					DRIString += '<option value="'+memberId+'">' + memberName + '</option>';
				}	
	    	           
    }
     
    return DRIString;
}


// returns the id of the selected DRI in the DRI dropdown menu on the event popover 
function getDRI(groupNum) {    
    var dri = document.getElementById("driEvent_" + groupNum);
    //var driId = dri.value;
    var driId;
    
    if (dri == null){
	     console.log("dri ID is null");
	     driId = 0;       
    }
    else{
	    console.log("The dri ID is:" + driId);
	    var driId = dri.value;    
    }

    //var driName = flashTeamsJSON["members"][driId].role;
    //console.log('DRI ID: ' + driId);
    //console.log('DRI Name: ' + driName);
   
    return driId;
    
}

//Adds member checkboxes onto the popover of an event, checks if a member is involved in event
function writeEventMembers(idNum) {
    var indexOfJSON = getEventJSONIndex(idNum);
    var memberString = "";
    //console.log("These are the members!");
    //console.log(flashTeamsJSON["members"]);
    if (flashTeamsJSON["members"].length == 0) return "No Team Members";
    for (i = 0; i<flashTeamsJSON["members"].length; i++) {
        var memberName = flashTeamsJSON["members"][i].role;

        var found = false;

        for (j = 0; j<flashTeamsJSON["events"][indexOfJSON].members.length; j++) {
            if (flashTeamsJSON["events"][indexOfJSON].members[j] == memberName) {
                //OLD CODE: onclick="if(this.checked){addEventMember(' + event_counter + ', ' +  i + ')}"
                memberString += '<input type="checkbox" id="event' + idNum + 'member' 
                    + i + 'checkbox" checked="true">' + memberName + "   ";
                found = true;
                break;
            }
        }
        if (!found) {
            memberString +=  '<input type="checkbox" id="event' + idNum 
                + 'member' + i + 'checkbox">' + memberName + "   "; 
        }      
    }
    return memberString;
};