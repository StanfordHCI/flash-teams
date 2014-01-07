/* eventslibrary.js
 * ---------------------------------------------
 * Code that manages the searching and adding of events to the timeline in Foundry. 
 * 
 */
 
 //Sample Event JSONs
var EventJSONArray= [
{
"title":"Low-fi prototype v1",
"id":1,
"startTime":null, 
"duration":2.5, 
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
"duration":4, 
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
"duration":2, 
"notes":"Refer to Nielsen's heuristics",
"members":["UI Designer", "Developer"], 
"dri":"UX Researcher", 
"yPosition":null, 
"inputs":["low-fidelity prototype v1"], 
"outputs":["final HE report"]
}
]

//Called when user searches for events
function searchEvents() {
	for (var i = 0; i < EventJSONArray.length; i++) {
		var str = "<div class=\"event-block\" id=\"searchEventBlock_"+i+"\" draggable=\"true\" ondragstart=\"dragEvent(event)\">";
		str += "<div class=\"row-fluid\">";
		str += "<div class=\"span9\"><b>"+EventJSONArray[i]["title"]+"</b></div>";		//event Title
		str += "<div class=\"span2\">"+EventJSONArray[i]["duration"]+"</div></div>";			//event duration
		str += "<b>DRI: </b>"+EventJSONArray[i]["dri"]+"<br />";		//event DRI
		str += "<b>Input: </b>"+EventJSONArray[i]["inputs"]+"<br />";		//event inputs
		str += "<b>Output: </b>"+EventJSONArray[i]["outputs"]+"</div>";		//event outputs
		//drag button

		$("#search-results").append(str);
	}
}

function allowDrop(ev) {
	ev.preventDefault();
}

function dragEvent(ev) {
	ev.dataTransfer.setData("Text",ev.target.id);
	document.getElementById("overlay").style.display = "block"; 
	
}

function drop(ev) {
	ev.preventDefault();
	var data = ev.dataTransfer.getData("Text");
	var timelineX = document.getElementById("timeline-container").offsetLeft; //w
	var timelineY = document.getElementById("timeline-container").offsetTop; //w
	var timelineScrollX = document.getElementById("timeline-container").scrollLeft;
	var timelineScrollY = document.getElementById("timeline-container").scrollTop;
	var scrollpageX = ev.pageX-$(window).scrollLeft()-timelineX+timelineScrollX;
	var scrollpageY = ev.pageY-$(window).scrollTop()+timelineScrollY;
	
	document.getElementById("overlay").style.display = "none";   //turn overlay off
	
	//get id of event block div and map back to EventJSONArray
	var eventBlockDivIdStrArray = data.split("_");
	var eventJSONId = eventBlockDivIdStrArray[1];

	//draw the dropped event on timeline
	createDragEvent(scrollpageX, scrollpageY, eventJSONId);
}
	

function createDragEvent(mouseX, mouseY, EventJSONID) {
    //WRITE IF CASE, IF INTERACTION DRAWING, STOP
    if(DRAWING_HANDOFF==true || DRAWING_COLLAB==true) {
        alert("Please click on another event or the same event to cancel");
        return;
    }

    event_counter++; //To generate id
	
	var eventTitle=EventJSONArray[EventJSONID]["title"];
	
	var duration=EventJSONArray[EventJSONID]["duration"];
	var durationHrs=Math.floor(duration);
	
	
	var current_svg = document.querySelector('svg');
	var windowPoint = current_svg.createSVGPoint();
	windowPoint.x = mouseX;
	windowPoint.y = mouseY;
	var tmatrix = current_svg.getScreenCTM();

	var svgPoint = windowPoint.matrixTransform(tmatrix.inverse());

	var snapPoint = calcSnap(svgPoint.x, svgPoint.y);
    drawEvents(snapPoint[0], snapPoint[1], durationHrs, eventTitle);
	fillPopover(snapPoint[0], durationHrs, eventTitle);
};