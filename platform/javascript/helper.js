/* helper.js
 * ---------------------------------
 *
 */

var flashTeamsJSON = {
    "title" : "New Flash Team",
    "id" : 1,
    "events": [],        //{"title", "id", "startTime", "duration", "notes", "members", "dri"}
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

function saveFlashTeam() {
	console.log("Saving flash team"); 
}