/* helper.js
 * ---------------------------------
 *
 */

var flashTeamsJSON = {
    "title" : "New Flash Team",
    "id" : 1,
    "events": [],        //{"title", "id", "startTime", "duration", "notes", "members", "dri", "y-position"}
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
    "events": [],        //{"title", "id", "startTime", "duration", "notes", "members", "dri", "y-position"}
    "members": [{"id":1, "role":"Illustrator", "category1":"Web Development", "category2":"UI Design", "skills":["shopify"]}],       //{"id", "role", "skills":[], "color", "category1", "category2"}
    "interactions" : []  //{"event1", "event2", "type", "description"}
}


//Takes a Flash Teams JSON Object and Draws a Flash Team
//INCOMPLETE
function drawFlashTeamFromJSON(ftJSON) {
    //POPULATE MEMBERS
    for (i = 0; i < ftJSON["members"].length; i++) {
    	$("#addMemberInput").val(ftJSON["members"][i].role); //Need to mimic adding this name manually
    	addMember(); //Pulls role name from member input

    	ftJSON["members"][i].id = pillCounter;
    	flashTeamsJSON["members"].push(ftJSON["members"][i]);

    	//Populate the Member Popover
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
    		$("#addSkillInput_" + memberId).val(ftJSON["members"][i].skills[k]);
    		addSkill(ftJSON["members"][i].id); //BROKEN, START HERE
    	}
    }

    //DRAW EVENTS
    for (i = 0; i<ftJSON["events"].length; i++) {

    }

    //DRAW EVENT POPOVERS

    //DRAW INTERACTIONS
}

function saveFlashTeam() {
	console.log("Saving flash team"); 
}