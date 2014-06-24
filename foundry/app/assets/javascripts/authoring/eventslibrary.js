/* eventslibrary.js
* ---------------------------------------------
* Code that manages the searching and adding of events to the timeline in Foundry.
*
*/

// Reusable AJAX function, which takes 4 arguments, including: the ID of the input element (i.e. text field), the type of AJAX request (i.e. GET or POST), the 				URL for the AJAX request and the id for the container where the results will appear 

function callajaxreq(inputid, type, url, resultsid){
  
  // Setup AJAX request onclick
  var query_input = document.getElementById(inputid);

  query_input.onkeyup = function(event){
    
    var query_value = document.getElementById(inputid).value;
    var request = $.ajax({
      url: url,
      type: "GET",
      data: { params : query_value },
      dataType: "html"
    }); //end var request
   
    request.done(function( msg ) {
      $( "#" + resultsid ).html( msg );
    }); //end request.done

  }// end query_input.onkeyup

} //end callajaxreq

callajaxreq("searchEventsInput", "GET", "/flash_teams/event_search", "search-results");


/*
//Array of sample Event JSONs used for testing
var EventJSONArray= [
{
"title":"Low-fi prototype v1",
"id":1,
"startTime":null,
"duration":2.5*60,
"notes":"Use balsamiq to construct mockups",
"members":["UX Researcher", "Developer"],
"dri":"UI Designer",
"yPosition":null,
"inputs":[],
"outputs":["low-fidelity prototype v1"]
},

{
"title":"Low-fi prototype v2",
"id":2,
"startTime":null,
"duration":4*60,
"notes":"Use Axure to construct prototype",
"members":["UX Researcher", "Developer"],
"dri":"UI Designer",
"yPosition":null,
"inputs":["low-fidelity prototype v1", "first HE violation from shared document"],
"outputs":["low-fidelity prototype v2"]
},

{
"title":"Heuristic Evaluation",
"id":3,
"startTime":null,
"duration":2*60,
"notes":"Refer to Nielsen's heuristics",
"members":["UI Designer", "Developer"],
"dri":"UX Researcher",
"yPosition":null,
"inputs":["low-fidelity prototype v1"],
"outputs":["final HE report"]
}
];

//Array of sample Member JSONs used for testing
var MembersJSONArray= [
{
"id":1,
"role":"UI Designer",
"skills":["skill1", "skill2"],
"color":null,
"category1":"Web Development",
"category2":"Web Design"
},

{
"id":2,
"role":"UX Researcher 1",
"skills":["skill3", "skill4"],
"color":null,
"category1":"cat2a",
"category2":"cat2"
},

{
"id":3,
"role":"Developer",
"skills":["skill2", "skill3"],
"color":null,
"category1":"cat3a",
"category2":"cat3"
},

{
"id":4,
"role":"UI Researcher 2",
"skills":["skill1", "skill3"],
"color":null,
"category1":"cat4a",
"category2":"cat4"
}
]
*/

//DR: I have no idea what the following three lines do
/* Dialog prompt code. Prevents dialogs from automatically opening upon initialization */
//$( "#teamRolesPrompt" ).dialog({ autoOpen: false });
//$( "#teamRolesPrompt" ).dialog({ height: "auto" },{ width: "450px" });
//$( "#teamRolesPrompt" ).dialog({ modal: true }); //creates overlay between dialog and rest of the web page in order to disables interactions with other page elements

// DR: I got commented out the search button since I use live search instead
/* Called when user clicks on 'Go' button next to search bar in the 'Add Events' container in side menu and returns search results.
Currently is a dummy function that each Event JSON in EventJSONArray into an Event div and displays them as search results. */
/*
function searchEvents() {
alert($('meta[name=events_json]').attr('content'));
for (var i = 0; i < EventJSONArray.length; i++) {
var str = "<div class=\"event-block\" id=\"searchEventBlock_"+i+"\"" //assigns each Event div a unique id
str += "draggable=\"true\" ondragstart=\"dragEvent(event)\" style=\"cursor:move\">"; //makes Event div draggable
str += "<div class=\"row-fluid\">";
str += "<div class=\"span9\"><b>"+EventJSONArray[i]["title"]+"</b></div>"; //Event Title
str += "<div class=\"span3\">"+EventJSONArray[i]["duration"]/60+" hrs</div></div>"; //Event duration
str += "<b>DRI: </b>"+EventJSONArray[i]["dri"]+"<br />"; //Event DRI
str += "<b>Input: </b>"+listInputs(EventJSONArray[i])+"<br />"; //Event inputs
str += "<b>Output: </b>"+listOutputs(EventJSONArray[i])+"</div>"; //Event outputs
$("#search-results").append(str); //appends each Event div to search results container
}
}
*/

/* Called when a user drags an event over the overlay div covering the timeline svg element, allowing overlay to catch and handle the drop */
function allowDrop(ev) {
ev.preventDefault();
}

/* Called when an Event div is being dragged. */
function dragEvent(ev) {
  //console.log(ev);
ev.dataTransfer.setData('eventHash', ev.target.getAttribute('data-hash'));
ev.dataTransfer.setData("Text",ev.target.id); //saves id of dragged Event div into 'data'
document.getElementById("overlay").style.display = "block"; //turns overlay on
}

/* Called when a user drops an event in a div that allows drop, in this case, overlay. Mouse coordinates at the point of drop are detected and members belonging to the dragged event and members belonging to the existing flash-team are compared */
function drop(ev) {
ev.preventDefault();

//console.log(ev);

var targetHash = ev.dataTransfer.getData('eventHash');

//calculates mouse coordinates relative to timeline svg to draw dragged event in corresponding location
var mouseCoords = calcMouseCoords(ev);

//turn overlay off so event blocks can be drawn on timeline svg
document.getElementById("overlay").style.display = "none";  

//added createdragevent (and changed eventJSONId to eventJSONindex) here instead of compMember to test:
createDragEvent(mouseCoords[0], mouseCoords[1], targetHash);

//compares two members. Currently both are sample Member JSONs from MembersJSONArray, but should compared a team member from dragged Event and an existing team member in flash-team
//compMember(MembersJSONArray[0], MembersJSONArray[2], mouseCoords, eventJSONindex); //TO BE CHANGED
}

/* Calculates mouse coordinates relative to timeline svg so Event block can be drawn in correct spot*/
function calcMouseCoords(event) {
var timelineX = document.getElementById("timeline-container").offsetLeft;
var timelineY = document.getElementById("timeline-container").offsetTop;
var overlayX = document.getElementById("overlay").offsetLeft;
var overlayY = document.getElementById("overlay").offsetTop;

var svgX = timelineX + overlayX;
var svgY = timelineY + overlayY;

var timelineScrollX = document.getElementById("timeline-container").scrollLeft;
var timelineScrollY = document.getElementById("timeline-container").scrollTop;

var absoluteX = event.pageX+timelineScrollX;
var absoluteY = event.pageY+timelineScrollY;

var svgpointX = absoluteX - svgX;
var svgpointY = absoluteY - svgY;

var svgpoint = [svgpointX, svgpointY];
return svgpoint;
}

/* Creates event block on timeline with according pop up information*/
function createDragEvent(mouseX, mouseY, targetHash) {
   //WRITE IF CASE, IF INTERACTION DRAWING, STOP
   if(DRAWING_HANDOFF==true || DRAWING_COLLAB==true) {
       alert("Please click on another event or the same event to cancel");
       return;
   }

   event_counter++; //To generate id

    /*
var matchblock = document.getElementById("matchblock");
console.log("matchblock: " + matchblock.innerHTML);
*/

var title = document.getElementById("title-" + targetHash).innerHTML;
var duration = document.getElementById("duration-" + targetHash).innerHTML * 60;
var inputs = document.getElementById("inputs-" + targetHash).innerHTML;
var outputs = document.getElementById("outputs-" + targetHash).innerHTML;

var snapPoint = calcSnap(mouseX, mouseY);

//DRAWEVENT HAS DIFFERENT PARAMETERS NOW
//var groupNum = drawEvent(snapPoint[0], snapPoint[1], null, eventTitle, duration);
//var groupNum = drawEvents(snapPoint[0], snapPoint[1], null, eventTitle, duration);

//FILLPOPOVER NO LONGER EXISTS
//fillPopover(snapPoint[0], groupNum, eventTitle, duration);
//fillPopover(snapPoint[0], groupNum, false, eventTitle, duration);

//var crev = createEvent(snapPoint);
var crev = newEventFromLib(snapPoint, title, duration, inputs, outputs); //add DRI, members, other attributes to the arguments (and method params)

drawEvents(crev);

//editablePopoverObj(crev);

//drawPopover(crev, true, true);
};

//I added this
function newEventFromLib(snapPoint, eventTitle, duration, inputs, outputs) {
    event_counter++;
    var startTimeObj = getStartTime(snapPoint[0]);
    var newEvent = {"title": eventTitle, "id":event_counter, "x": snapPoint[0], "y": snapPoint[1], "startTime": startTimeObj["startTimeinMinutes"], "duration": duration, "members":[], "dri":"", "notes":"", "startHr": startTimeObj["startHr"], "startMin": startTimeObj["startMin"], "gdrive":[], "completed_x": null, "inputs": inputs, "outputs": outputs };
    flashTeamsJSON.events.push(newEvent);
    return newEvent;
};


//DR: I didn't touch any of the code below 

/* Compares the skills and second level category of two members. Depending on the comparison, may pop up dialog. Depending on dialog button chosen, may draw Event block onto timeline*/
function compMember(member1, member2, mouseCoords, eventJSONId) {
var promptText;
if (compMemberCats(member1, member2) || compMemberSkills(member1, member2)) { //if skills or second level category matches
promptText = "This event requires a <b>"+member1["role"]+"</b> with skills overlapping those of your existing team member, <b>"+member2["role"]+"</b>. What would you like to do?";
$( "#teamRolesPrompt" ).dialog({
buttons: [ //3 options:
{
text: "Add this event but use an existing team member",
click: function() {
$( this ).dialog( "close" );
createDragEvent(mouseCoords[0],mouseCoords[1],eventJSONId);
}
},
{
text: "Add this event and "+member1["role"]+" to my team",
click: function() {
$( this ).dialog( "close" );
addMemberFromEvent(member1);
createDragEvent(mouseCoords[0],mouseCoords[1],eventJSONId);
}
},
{
text: "Do not add this event and keep my team as is",
click: function() {
$( this ).dialog( "close" );
}
}
]
});
document.getElementById("teamRolesPrompt").innerHTML=promptText;
$( "#teamRolesPrompt" ).dialog( "open" );
} else { //else no matches, add Event block and its listed team members automatically
addMemberFromEvent(member1);
createDragEvent(mouseCoords[0],mouseCoords[1],eventJSONId);
addMemberFromEvent(member1);
}
}

/* Returns the 'inputs' of an Event JSON*/
function listInputs(event) {
var inputs="";
for (var i = 0; i < event["inputs"].length; i++) {
inputs += event["inputs"][i];
if (i < event["inputs"].length-1) {
inputs += ", ";
}
}
return inputs;
}

/* Returns the 'outputs' of an Event JSON*/
function listOutputs(event) {
var outputs="";
for (var i = 0; i < event["outputs"].length; i++) {
outputs += event["outputs"][i];
if (i < event["outputs"].length-1) {
outputs += ", ";
}
}
return outputs;
}

/* Returns the 'skills' of a Member JSON*/
function listSkills(member) {
var skills="";
for (var i = 0; i < member["skills"].length; i++) {
skills += member["skills"][i];
skills += "<br />";
}
return skills;
}

/* Compares second level category, or 'category2' of two members*/
function compMemberCats(member1, member2) {
if (member1["category2"] == member2["category2"]) {
return true;
}
return false;
}

/* Compares skills of two members*/
function compMemberSkills(member1, member2) {
for (var i = 0; i < member1["skills"].length; i++) {
for (var j=0; j < member2["skills"].length; j++) {
if (member1["skills"][i] == member2["skills"][j]) {
return true;
}
}
}
return false;
}

/* Called when a user chooses from the dialog to add a team member included in a dragged Event into the flash-team. Appends a pill under 'Team Roles' container and a popover to that pill populated with that member's data*/
function addMemberFromEvent(member) {
   pillCounter++;
var memberName = member["role"];
   
//Appends a list item pill to the memberPills ul
   $("#memberPills").append('<li class="active pill' + pillCounter + '" id="mPill_' + pillCounter + '""><a>' + memberName
       + '<div class="close" onclick="deleteMember(' + pillCounter + '); updateStatus(false);">  X</div>' + '</a></li>');

   //Clears Input
   $("#addMemberInput").val(this.placeholder);

   //Appends a popover to the pill
   $("#mPill_" + pillCounter).popover({
       placement: "right",
       html: "true",
       class: "member",
       id: '"memberPopover' + pillCounter + '"',
       trigger: "click",
       title: '<b>' + memberName + '</b>',
       content:  '<form name="memberForm_' + pillCounter + '" autocomplete="on">'
       +'<div class="mForm_' + pillCounter + '">'
           +'<div class="ui-front" class="input-append" > '
           +'<select class="category1Input" id="member' + pillCounter + '_category1"></select>'
           +'<br><br><select class="category2Input" id="member' + pillCounter + '_category2">--oDesk Sub-Category--</select>'
           +'<br><br><input class="skillInput" id="addSkillInput_' + pillCounter + '" type="text" onclick="addAuto()" placeholder="New oDesk Skill" autocomplete="on">'
           +'<button class="btn" type="button" class="addSkillButton" id="addSkillButton_' + pillCounter + '" onclick="addSkill(' + pillCounter + ');">+</button>'
           +'</div>'
           +'Skills:'  
           +'<ul class="nav nav-pills" id="skillPills_' + pillCounter + '"> </ul>'
           +'Member Color: <input type="text" class="full-spectrum" id="color_' + pillCounter + '"/>'
           +'<script type="text/javascript"> initializeColorPicker(); </script>'
           +'<p><button type="button" onclick="deleteMember(' + pillCounter + '); updateStatus(false);">Delete</button>     '
           +'<button type="button" onclick="saveMemberInfo(' + pillCounter + '); updateStatus(false);">Save</button>'
       +'</p></form>'
       +'</div>',
       container: $("#member-container")
   });

   $("#mPill_"+pillCounter).popover("show");

//Adds new member to Flash Teams JSON Object
   var newMember = {"role":memberName, "id": pillCounter, "color":"rgb(0, 168, 0)", "skills":[], "category1":"", "category2":""};
   flashTeamsJSON.members.push(newMember);
   addMemberNode(memberName, pillCounter, "#808080");

   //Adds the drop-down for two-tiered oDesk job posting categories on popover and populates member attribute values
//Preset 'category1' attribute
   for (var key in oDeskCategories) {
if (member["category1"] == key) {
$("#member" + pillCounter + "_category1").append('<option value="' + key + '" selected>' + key + '</option>');
} else {
$("#member" + pillCounter + "_category1").append('<option value="' + key + '">' + key + '</option>');
}
   }
//Presets 'category2' attribute
var category1Select = document.getElementById("member" + pillCounter + "_category1");
   var category1Name = category1Select.options[category1Select.selectedIndex].value;
   for (i = 0; i < oDeskCategories[category1Name].length; i++) {
if (oDeskCategories[category1Name][i] == member["category2"]) {
$("#member" + pillCounter + "_category2").append("<option selected>" + oDeskCategories[category1Name][i] + "</option>");
} else {
$("#member" + pillCounter + "_category2").append("<option>" + oDeskCategories[category1Name][i] + "</option>");
}
   }
//Presets 'skills' attribute and add to flashteamsJSON
   var skillName;
var indexOfJSON = getMemberJSONIndex(pillCounter);
for (j = 0; j < member["skills"].length; j++) {
skillName = member["skills"][j];
flashTeamsJSON["members"][indexOfJSON].skills.push(skillName);
$("#skillPills_" + pillCounter).append('<li class="active" id="sPill_mem' + pillCounter + '_skill' + j + '"><a>' + skillName
       + '<div class="close" onclick="deleteSkill(' + pillCounter + ', ' + j + ', &#39' + skillName + '&#39)">  X</div></a></li>');
$("#addSkillInput_" + pillCounter).val(this.placeholder);
}

   //Enables skills to be submitted by Enter key
   $(document).ready(function() {
       pressEnterKeyToSubmit("#addSkillInput_" + pillCounter, "#addSkillButton_" + pillCounter);
   });
};
