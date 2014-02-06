/* interaction.js
 * ---------------------------------------------
 * Code that manages the interactions (collaborations and handoffs)
 * Drawing from scratch, drag response on (popovers.js)
 */
var DRAWING_HANDOFF = false;
var DRAWING_COLLAB = false;
var INTERACTION_TASK_ONE_IDNUM = 0;

var interaction_counter = 0;

//Loops through interactions in JSON, if event is in, need to redraw the interaction
function redrawInteractions(idNum) {
    console.log("Trying to redraw interaction on id:", idNum);
    for (i = 1; i <= flashTeamsJSON["interactions"].length; i++) {
        var interaction = flashTeamsJSON["interactions"][i-1];
        if (interaction.event1 == idNum) {
            //REDRAW THE X1, Y1 OF THE INTERACTION
            //START HERE
            var taskRect1 = $("#rect_" + idNum)[0]
            var x1 = taskRect1.x.animVal.value + taskRect1.width.animVal.value;
            var y1 = taskRect1.y.animVal.value + 50;
            $("#interaction_" + i)
                .attr("y1", y1)
                .attr("x1", x1);


        } else if (interaction.event2 == idNum) {
            //REDRAW THE X2, Y2 OF THE INTERACTION
            var taskRect2 = $("#rect_" + i)[0];
            var x2 = taskRect2.x.animVal.value;
            var y2 = taskRect2.y.animVal.value + 50;
            $("#interaction_" + i)
                .attr("y2", y2)
                .attr("x2", x2);

        }
    }

    /*.attr("d", function(d) {
         var dx = x1 - x2,
            dy = y1 - y2,
            dr = Math.sqrt(dx * dx + dy * dy);
        //For ref: http://stackoverflow.com/questions/13455510/curved-line-on-d3-force-directed-tree
        return "M" + x1 + "," + y1 + "A" + dr + "," + dr + " 0 0,1 " + x2 + "," + y2; 
        })*/
};

//Called when a user clicks a task rectangle (aka event)
//Determines if the user is trying to draw an interaction and if so, what type
function drawInteraction(task2idNum) {
    console.log("hi");
    var task1idNum = INTERACTION_TASK_ONE_IDNUM;
    timeline_svg.on("mousemove", null);
    $(".followingLine").remove();

    //The user has cancelled the drawing
    if (task1idNum == task2idNum) { 
        DRAWING_COLLAB = false;
        DRAWING_HANDOFF = false;
    //Draw a handoff from task one to task two
    } else if (DRAWING_HANDOFF == true) {
        interaction_counter++;
        var handoffData = {"event1":task1idNum, "event2":task2idNum, "type":"handoff", "description":""};
        flashTeamsJSON.interactions.push(handoffData);
        drawInteractionLine(task1idNum, task2idNum, "handoff");
        DRAWING_HANDOFF = false;
        $(".task_rectangle").popover("hide");
    //Draw a collaboration link between task one and task two
    } else if (DRAWING_COLLAB == true) {
        interaction_counter++;
        var collabData = {"event1":task1idNum, "event2":task2idNum, "type":"collaboration", "descriptioin":""};
        flashTeamsJSON.interactions.push(collabData);
        drawInteractionLine(task1idNum, task2idNum, "collaboration");
        DRAWING_COLLAB = false;
        $(".task_rectangle").popover("hide");
    //There is no collaboration being drawn
    } else {
        console.log("Not drawing anything");
        return;
    }
}

//Redraw the position of the interaction line
function drawInteractionLine(task1Id, task2Id, type) {
    //Find end of task 1
    var task1Rect = $("#rect_" + task1Id)[0];
    var x1 = task1Rect.x.animVal.value + 3;
    var y1 = task1Rect.y.animVal.value + 50;
    //Find beginning of task 2
    var task2Rect = $("#rect_" + task2Id)[0];
    var x2 = task2Rect.x.animVal.value + 3;
    var y2 = task2Rect.y.animVal.value + 50;

    var path = timeline_svg.selectAll("path")
       .data(flashTeamsJSON["interactions"]);

    path.enter().insert("svg:path")
       .attr("class", "link")
       .style("stroke", "#ccc");

       //FINISH CUSTOMIZING FOR COLLAB
       //NEED TO MAKE CURVES NOT FILLED
    path = timeline_svg.append("path")
        .attr("class", "interactionLine")
        .attr("id", function () {
            return "interaction_" + interaction_counter;
        })
        .attr("x1", function(){
            if (type == "handoff") return (x1 + task1Rect.width.animVal.value)
            else return x1
        })
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
        .style("stroke-dasharray", function() {
            if (type == "handoff") return ("0, 0")
            else return ("4, 4")
        })
        .attr("d", function(d) {
             var dx = x1 - x2,
                dy = y1 - y2,
                dr = Math.sqrt(dx * dx + dy * dy);
            //For ref: http://stackoverflow.com/questions/13455510/curved-line-on-d3-force-directed-tree
            return "M" + x1 + "," + y1 + "A" + dr + "," + dr + " 0 0,1 " + x2 + "," + y2; 
        })
        .attr("stroke", function() {
            if (type == "handoff") return "gray"
            else return "black"
        })
        .attr("stroke-width", 5)
        .attr("fill", "none")
        .attr("marker-end", "url(#arrowhead)"); //FOR ARROW
}

//Called when we find DRAWING_HANDOFF
//initializes creating a handoff b/t two events
function writeHandoff() {
    INTERACTION_TASK_ONE_IDNUM = this.getAttribute('groupNum');
    DRAWING_HANDOFF = true;
    var m = d3.mouse(this);
    //console.log("x: " + m[0] + " y: " + m[1]);
    line = timeline_svg.append("line")
        .attr("class", "followingLine")
        .attr("x1", m[0])
        .attr("y1", m[1])
        .attr("x2", m[0])
        .attr("y2", m[1])
        .attr("stroke-width", 3)
        .attr("stroke", "gray");
    timeline_svg.on("mousemove", interMouseMove);
};


//Called when we find DRAWING_COLLABORATION 
//initializes creating a collaboration b/t two events
function writeCollaboration() {
    INTERACTION_TASK_ONE_IDNUM = this.getAttribute('groupNum'); 
    DRAWING_COLLAB = true;
    var m = d3.mouse(this);
    line = timeline_svg.append("line")
        .attr("class", "followingLine")
        .attr("x1", m[0])
        .attr("y1", m[1])
        .attr("x2", m[0])
        .attr("y2", m[1])
        .attr("stroke-width", 3)
        .attr("stroke", "black")
        .attr("stroke-dasharray", (4,4));
    timeline_svg.on("mousemove", interMouseMove);
};

//Follow the mouse movements after a handoff is initialized
function interMouseMove() {
    var m = d3.mouse(this);
    line.attr("x2", m[0]-3)
        .attr("y2", m[1]-3);
}
