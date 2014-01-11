/* helper.js
 * ---------------------------------
 * 
 */

//MAKE SURE THE JSON IS UPDATED IN ITS CURRENT VERSION EVERYWHERE
var flashTeamsJSON = {
    "title" : "New Flash Team",
    "id" : 1,
    "events": [],        //{"title", "id", "startTime", "duration", "notes", "members": [], "dri", "yPosition", inputs”:[], “outputs”:[]}
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

    //{"title", "id", "startTime", "duration", "notes", "members", "dri", "yPosition"}
    "events": [{"startTime":60, "yPosition":100, "members":["Illustrator"], "id":1, "notes":"hi there", "title":"My Event", "dri":""}],

    //{"id", "role", "skills":[], "color", "category1", "category2"}
    "members": [{"id":1, "role":"Illustrator", "category1":"Web Development", "category2":"UI Design", "skills":["shopify"], "color":"BLUE"}, 
    	{"id":2, "role":"Author", "category1":"Writing & Translation", "category2":"Creative Writing", "skills":["ebooks"], "color":"RED"}],       
    "interactions" : []  //{"event1", "event2", "type", "description"}       
};


//Takes a Flash Teams JSON Object and Draws a Flash Team
function drawFlashTeamFromJSON(ftJSON) {
    //Populate members
    //console.log("ftJSON: ");
    //console.log(ftJSON);
    var members_len = ftJSON["members"].length;
    for (var i = 0; i < members_len; i++) {
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
    	for (var k = 0; k<ftJSON["members"][i].skills.length; k++) {
    		$("#addSkillInput_" + pillCounter).val(ftJSON["members"][i].skills[k]);
    		addSkill(pillCounter);
    	}
    	saveMemberInfo(pillCounter);
    }

    var events_len = ftJSON["events"].length;
    //DRAW EVENTS
    for (var j = 0; j < events_len; j++) {
    	event_counter++;

    	var x = ftJSON["events"][j].startTime * (1 + (2/3));
    	var y = ftJSON["events"][j].yPosition;
    	drawEvents(x, y);

    	//Add to JSON
    	ftJSON["events"][j].id = event_counter;
    	flashTeamsJSON.events.push(ftJSON["events"][j]);

    	//DRAW EVENT POPOVERS
    	var startHr = (ftJSON["events"][j].startTime - (ftJSON["events"][j].startTime%60))/60;
    	var startMin = ftJSON["events"][j].startTime%60;
    	addEventPopover(startHr, startMin);
    	//CHECK THAT MEMBERS WORK, SHOULD BE TAKEN CARE OF BY EVENT POPOVERT
    	$("#notes_" + pillCounter).val(ftJSON["events"][j].notes);
    	overlayOn();
    }
    
    //DRAW INTERACTIONS
}

function saveFlashTeam() {
	console.log("Saving flash team");
    $('#flash_team_json').val(JSON.stringify(flashTeamsJSON));
    $('.edit_flash_team').submit();
}

