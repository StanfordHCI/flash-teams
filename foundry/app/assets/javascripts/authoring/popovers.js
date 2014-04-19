/* popovers.js
 * ---------------------------------------------
 * Code that manages the popovers
 * Drawing them on first event create/drop, update events on timeline
 * when new information added including: duration, event members, etc.
 */

// Quick hack that allows popovers to take callback functions
var tmp = $.fn.popover.Constructor.prototype.show; 
$.fn.popover.Constructor.prototype.show = function () { 
    tmp.call(this); 
    if (this.options.callback) { 
        this.options.callback(); 
    } 
};

/*
 * Input(s): 
 * eventObj - event object taken from the events array within the flashTeamsJSON object
 * 
 * Output(s):
 * an object that contains all info necessary to render an 'editable' popover
 */
function editablePopoverObj(eventObj) {
    // var totalMinutes = eventObj["duration"];
    var groupNum = eventObj["id"];
    // var title = eventObj["title"];
    // var startHr = eventObj["startHr"];
    // var startMin = eventObj["startMin"];
    // var notes = eventObj["notes"];

    // var numHours = Math.floor(totalMinutes/60);
    // var minutesLeft = totalMinutes%60;

    var obj = {
        placement: "right",
        html: "true",
        class: "eventPopover",
        id: '"popover' + groupNum + '"',
        trigger: "click",
        title: function() {
            return '<input type ="text" name="eventName" id="eventName_' + groupNum 
            + '" placeholder="'+ eventObj["title"] +'" >'},
        content: function() {
            var totalMinutes = eventObj["duration"];
            var startHr = eventObj["startHr"];
            var startMin = eventObj["startMin"];
            var notes = eventObj["notes"];
            
            var inputs = eventObj["inputs"];
            if (inputs == null) {
                inputs = ""
            }

            var outputs = eventObj["outputs"];
            if (outputs == null) {
                outputs = ""
            }

            var numHours = Math.floor(totalMinutes/60);
            var minutesLeft = totalMinutes%60;

            return '<form name="eventForm_' + groupNum + '">' + '<table><tr><td>'
        +'<b>Event Start:          </b><br>' 
        +'Hours: <input type="number" id="startHr_' + groupNum + '" value="' + startHr
            + '" min="0" style="width:35px">'
        +'Minutes: <input type="number" id="startMin_' + groupNum + '" value="' + startMin 
            + '" min="0" step="15" max="45" style="width:35px">'
        +'</td><td><b>Total Runtime: </b><br>' 
        +'Hours: <input type = "number" id="hours_' + groupNum + '" value="'
            +numHours+'" min="2" style="width:35px"/><br>          ' 
        +'Minutes: <input type = "number" id = "minutes_' + groupNum + '" value="'+minutesLeft
            +'" style="width:35px" min="0" step="15" max="45"/><br>'
        +'</td></tr><tr><td><b>Members</b><br> <div id="event' + groupNum + 'memberList">'
            + writeEventMembers(groupNum) +'</div>'
        +'</td><td><b>Directly-Responsible Individual</b><br><select class="driInput"' 
            +' name="driName" id="driEvent_' + groupNum + '"' 
        + 'onchange="getDRI('+groupNum + ')">'+ writeDRIMembers(groupNum,0) +'</select>'
        +'<br><b>Notes: </br></b><textarea rows="3" id="notes_' + groupNum + '" placeholder="' + notes + '"></textarea>'
        +'</td></tr>'
        +'<div><input type="text" data-role="tagsinput" placeholder="Add input" id="inputs_' + groupNum + '" value="' + inputs + '" /></div>'
        +'<div><input type="text" data-role="tagsinput" placeholder="Add output" id="outputs_' + groupNum + '" value="' + outputs + '" /></div>'
        +'<tr><td><p><button type="button" id="delete"'
            +' onclick="deleteRect(' + groupNum +');">Delete</button>       ' 
        +'<button type="button" id="save" onclick="saveEventInfo(' + groupNum + '); hidePopover(' + groupNum + ')">Save</button> </p>' 
        // +'<button type="button" id="complete" onclick="completeTask(' + groupNum + ');">Complete</button> </p>' 
        +'<button type="button" id="cancel" onclick="hidePopover(' + groupNum + ');">Cancel</button> </p>' 
        +'</td></tr></table></form>'},
        container: $("#timeline-container"),
        callback: function() {
            $("input[data-role=tagsinput], select[multiple][data-role=tagsinput]").tagsinput();
        }
    };

    return obj;
};

/*
 * Input(s): 
 * eventObj - event object taken from the events array within the flashTeamsJSON object
 * 
 * Output(s):
 * an object that contains all info necessary to render an 'editable' popover
 */
function readOnlyPopoverObj(ev) {
    var groupNum = ev.id;
    var hrs = Math.floor(ev.duration/60);
    var mins = ev.duration % 60;

    var content = '<b>Event Start:</b><br>'
        + ev.startHr + ':'
        + ev.startMin.toFixed(0) + '<br>'
        +'<b>Total Runtime: </b><br>' 
        + hrs + ' hrs ' + mins + ' mins<br>';

    var num_members = ev.members.length;
    if(num_members > 0){
        content += '<b>Members:</b><br>';
        for (var j=0;j<num_members;j++){
            content += ev.members[j].name;
            content += '<br>';
        }
    }

    console.log("EV.DRI: " + ev.dri);

    if (ev.dri != "" && ev.dri != undefined){
        var mem = getMemberById(ev.dri);
        if(mem){
            content += '<b>Directly-Responsible Individual:</b><br>';
            content += mem.role;
            content += '<br>';
        }
    }

    if (ev.content != ""){
        content += '<b>Notes:</b><br>';
        content += ev.notes;
        content += '<br>';
    }

    content += '<br><form><button type="button" id="complete_' + groupNum 
        + '" onclick="completeTask(' + groupNum + ');">Complete</button><button type="button" id="ok"'
        +' onclick="hidePopover(' + groupNum + ');">Ok</button></form>';
    
    /*content += '<br><form><button type="button" style="pointer-events:none;" id="complete_' + groupNum 
            + '" onclick="completeTask(' + groupNum + ');">Complete</button><button type="button"' 
            +' id="ok" onclick="hidePopover(' + groupNum + ');">Ok</button></form>';*/
    
    var obj = {
        title: ev.title,
        content: content,
        placement: "right",
        html: "true",
        class: "eventPopover",
        id: '"popover' + groupNum + '"',
        trigger: "click",
        container: $("#timeline-container")
    };

    return obj;
}

/*
 * Draw popover on event.
 *
 * Input(s):
 * eventObj - event object taken from the events array within the flashTeamsJSON object
 * editable - boolean specifying whether to render an editable (true) or readonly (false) popover
 * show - boolean specifying whether to show the popover after rendering it
 *
 * Output(s):
 * None
 */
function drawPopover(eventObj, editable, show) {
    var groupNum = eventObj.id;

    // draw it
    var data = getPopoverDataFromGroupNum(groupNum);
    if(!data){ // popover not set yet
        if(editable){
            setPopoverOnTask(groupNum, editablePopoverObj(eventObj));
        } else {
            setPopoverOnTask(groupNum, readOnlyPopoverObj(eventObj));
        }
    } else { // update the popover's content
        var obj;
        if(editable){
            obj = editablePopoverObj(eventObj);
        } else {
            obj = readOnlyPopoverObj(eventObj);
        }
        data.options.title = obj["title"];
        data.options.content = obj["content"];
    }

    // show/hide it
    if(show){
        showPopover(groupNum);
    }
    
    // allow using return key to save and close the popover
    $(document).ready(function() {
        pressEnterKeyToSubmit("#eventMember_" + groupNum, "#addEventMember_" + groupNum);
    });
};

function updateAllPopoversToReadOnly() {
    for(var i=0;i<flashTeamsJSON.events.length;i++) {
        var ev = flashTeamsJSON.events[i];
        drawPopover(ev, false, false);
    }
    console.log("UPDATED ALL POPOVERS TO BE READONLY");
};

var setPopoverOnTask = function(groupNum, obj){
    $(timeline_svg.selectAll("g#g_"+groupNum)[0][0]).popover(obj);
};

function hidePopover(popId){
    console.log("hiding popover " + popId);
    $(timeline_svg.selectAll("g#g_"+popId)[0][0]).popover('hide');
    //overlayOff();
};

function showPopover(popId){
    console.log("showing popover " + popId);
    $(timeline_svg.selectAll("g#g_"+popId)[0][0]).popover('show');
    //overlayOn();
};

function destroyPopover(popId){
    console.log("destroying popover " + popId);
    $(timeline_svg.selectAll("g#g_"+popId)[0][0]).popover('destroy');
};

var getPopoverDataFromGroupNum = function(groupNum){
    return $(timeline_svg.selectAll("g#g_"+groupNum)[0][0]).data('bs.popover');
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

        if ($("#event" + popId + "member" + i + "checkbox")[0] == undefined) return;

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

    //hidePopover(popId);
  
    //Update JSON
    var indexOfJSON = getEventJSONIndex(popId);
    var ev = flashTeamsJSON["events"][indexOfJSON];
    ev.title = newTitle;
    ev.duration = newHours*60 + newMin;
    ev.notes = eventNotes;
    ev.dri = driId;
    ev.inputs = $('#inputs_' + popId).val();
    ev.outputs = $('#outputs_' + popId).val();

    console.log("DRAWING POPOVER AFTER SAVED EVENT POPOVER");
    console.log("EV.duration: " + ev.duration);
    drawPopover(ev, true, false);
   
    //UPDATE EVENT MEMBERS?

    //console.log("saved event info");
    updateStatus(false);
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
    var driId;
    
    if (dri == null){
	     console.log("dri ID is null");
	     driId = 0;       
    }
    else{
	    console.log("The dri ID is:" + driId);
	    var driId = dri.value;    
    }
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
                    + i + 'checkbox" checked="true">' + memberName + "   <br>";
                found = true;
                break;
            }
        }
        if (!found) {
            memberString +=  '<input type="checkbox" id="event' + idNum 
                + 'member' + i + 'checkbox">' + memberName + "   <br>"; 
        }      
    }
    return memberString;
};