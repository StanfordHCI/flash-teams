/* helper.js
 * ---------------------------------
 *
 */

var flashTeamsJSON = {
    "title" : "New Flash Team",
    "id" : 1,
    "events": [],        //{"title", "id", "startTime", "duration", "notes", "members", "dri", "yPosition"}
    "members": [],       //{"id", "role", "skills":[], "color", "category1", "category2"}
    "interactions" : []  //{"event1", "event2", "type", "description"}
};

function pressEnterKeyToSubmit(inputId, buttonId) {
	$(inputId).keyup(function(event){
		if(event.keyCode == 13){
			$(buttonId).click();
		}
	});
}

//FOR TESTING, DELETE LATER
fakeJSON = {
	"title" : "New Flash Team",
    "id" : 1,
    "events": [{"startTime":60, "yPosition":100, "members":[], "id":1, "notes":"", "title":"My Event", "dri":""}],        //{"title", "id", "startTime", "duration", "notes", "members", "dri", "yPosition"}
    "members": [{"id":1, "role":"Illustrator", "category1":"Web Development", "category2":"UI Design", "skills":["shopify"], "color":"BLUE"}],       //{"id", "role", "skills":[], "color", "category1", "category2"}
    "interactions" : []  //{"event1", "event2", "type", "description"}
}


//Takes a Flash Teams JSON Object and Draws a Flash Team
//INCOMPLETE
function drawFlashTeamFromJSON(ftJSON) {
    //POPULATE MEMBERS
    for (i = 0; i < ftJSON["members"].length; i++) {
    	$("#addMemberInput").val(ftJSON["members"][i].role); //Need to mimic adding this name manually
    	addMember(); //Pulls role name from member input, also appends to FlashTeamsJSON
    	var memberIndex = flashTeamsJSON["members"].length-1;

    	//Populate the Member Popover
    	//Add oDesk Category 1 and Category 2
    	$("#member" + (i+1) + "_category1")[0].value = ftJSON["members"][i].category1;
    	$("#member" + (i+1) + "_category2").removeAttr("disabled");
    	$("#member" + (i+1) + "_category2").empty();
		var category1Select = document.getElementById("member" + pillCounter + "_category1");
	    var category1Name = category1Select.options[category1Select.selectedIndex].value;
	    for (j = 0; j < oDeskCategories[category1Name].length; j++) {
	        var option = document.createElement("option");
	        $("#member" + pillCounter + "_category2").append("<option>" + oDeskCategories[category1Name][j] + "</option>");
	    }
    	$("#member" + (i+1) + "_category2")[0].value = ftJSON["members"][i].category2;

    	//Add skills
    	for (k = 0; k<ftJSON["members"][i].skills.length; k++) {
    		$("#addSkillInput_" + pillCounter).val(ftJSON["members"][i].skills[k]);
    		addSkill(pillCounter);
    	}
    }
    saveMemberInfo(pillCounter);

    //DRAW EVENTS
    for (i = 0; i<ftJSON["events"].length; i++) {
    	event_counter++;

    	var x = ftJSON["events"][i].startTime * (1 + (2/3));
    	var y = ftJSON["events"][i].yPosition;
    	drawEvents(x, y);

    	//Add to JSON
    	ftJSON["events"][i].id = event_counter;
    	flashTeamsJSON.events.push(ftJSON["events"][i]);

    	//DRAW EVENT POPOVERS
    	var startHr = (ftJSON["events"][i].startTime - (ftJSON["events"][i].startTime%60))/60;
    	var startMin = ftJSON["events"][i].startTime%60;
    	addEventPopover(startHr, startMin);
    	overlayOn();
    }
    

    //DRAW INTERACTIONS
}

function drawEventFromJSON() {

}

function saveFlashTeam() {
	console.log("Saving flash team"); 
}

