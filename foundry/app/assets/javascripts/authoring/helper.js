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

// var flashTeamsJSON = {"title":"New Flash Team","id":1,"events":[{"title":"New Event","id":1,"startTime":"030","duration":90,"members":["ds"],"dri":"","notes":"","hours":1,"minutes":30},{"title":"New Event","id":2,"startTime":"1200","duration":60,"members":["ds"],"dri":"","notes":"","hours":1,"minutes":0},{"title":"New Event","id":3,"startTime":"12030","duration":60,"members":["Yey","ds"],"dri":"","notes":"","hours":1,"minutes":0}],"members":[{"role":"ds","id":1,"color":"#e69138","skills":[],"category1":"","category2":""},{"role":"Yey","id":3,"color":"#76a5af","skills":[],"category1":"","category2":""}],"interactions":[]}

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