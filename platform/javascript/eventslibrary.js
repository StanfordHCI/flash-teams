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
"duration":"2.5hrs", 
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
"duration":"4hrs", 
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
"duration":"2hrs", 
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
		var str = "<div class=\"event-block\" id=\"searchEventBlock"+i+"\" draggable=\"true\" ondragstart=\"dragEvent(event)\">";
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
	overlayOn();
}

function drop(ev) {
	ev.preventDefault();
	var data = ev.dataTransfer.getData("Text");
	var scrollpageX = ev.pageX-$(window).scrollLeft();
	var scrollpageY = ev.pageY-$(window).scrollTop();
	document.getElementById("overlay").style.display = "none";   //turn overlay off
	createDragEvent(scrollpageX, scrollpageY, 3);
}
	

function createDragEvent(mouseX, mouseY, numHours) {
    //WRITE IF CASE, IF INTERACTION DRAWING, STOP
    if(DRAWING_HANDOFF==true || DRAWING_COLLAB==true) {
        alert("Please click on another event or the same event to cancel");
        return;
    }

    event_counter++; //To generate id
	var current_svg = document.querySelector('svg');
	var windowPoint = current_svg.createSVGPoint();
	windowPoint.x = mouseX;
	windowPoint.y = mouseY;
	var tmatrix = current_svg.getScreenCTM();
	var svgPoint = windowPoint.matrixTransform(tmatrix.inverse());

	var snapPoint = calcSnap(svgPoint.x, svgPoint.y);
    drawEvents(snapPoint[0], snapPoint[1], numHours);
	fillPopover(snapPoint[0], numHours);
};