/***chat****/

var myDataRef = new Firebase('https://foundry-ft.firebaseio.com/'+ flash_team_id +'/chats');


var currentdate = new Date(); 

var name;


$('#messageInput').keydown(function(e){
    if (e.keyCode == 13) {
        console.log("PRESSED RETURN KEY!");
        var text = $('#messageInput').val();
        var uniq_u=getParameterByName('uniq');
        
        if(uniq_u == undefined || uniq_u == ""){
	        uniq_u = 'Author';
        }
        
        myDataRef.push({name: chat_name, role: chat_role, uniq: uniq_u, date: currentdate.toUTCString(), text: text});
        $('#messageInput').attr("placeholder", "Type your message here...").val('').blur();
    }
});

myDataRef.once('value', function(snapshot){
    console.log(snapshot);
})

var lastMessage=0;
var lastWriter;

function displayChatMessage(name, uniq, role, date, text) {
    
    if(name == undefined ){
       console.log("!!! chat name is undefined!")
        return;
    }
    
    message_date = new Date(date);
    dateform = message_date.toLocaleString();
    
    // diff in milliseconds 
    var diff = Math.abs(new Date() - message_date);
    
    //diff in minutes
    console.log("minutes ago: " + diff/(1000*60)); 
  /*  
    //notification text   
    //notification title
    var notif_title = name+': '+ text;
    //notification body
    var notif_body = dateform;
    
    var showchatnotif; // true if notifications should be shown
       
    if ((current_user == 'Author' && role == 'Author') || (current_user.uniq == uniq)){
    	showchatnotif = false;
    }
    else{
	    showchatnotif = true;
    }
    
    // checks if last notification was less than 5 seconds ago
    // this is used to only create notifications for messages that were sent from the time you logged in and forward 
    // (e.g., no notifications for messages in the past)
    if (diff <= 50000 && showchatnotif == true){
	    notifyMe(notif_title, notif_body, 'chat');
    }
*/
	//revise condition to include OR if timestamp of last message (e.g., lastDate) was over 10 minutes ago
    if(lastWriter!=name){
        lastMessage=(lastMessage+1)%2;
        var div1 = $('<div/>',{"id":"m"+lastMessage}).text(text).prepend($('<strong/>').text(name+ ' (' + role + ')' + ': ' )).prepend('<br>').prepend($('<em/>').text(dateform));

        div1.css('padding-left','5%');
        div1.appendTo($('#messageList'));
        
    }else{
        var div1 = $('<div/>',{"id":"m"+lastMessage}).text(text);
        div1.css('padding-left','5%');
        div1.appendTo($('#messageList'));
    }
    lastWriter=name;
    lastDate = message_date;
    $('#messageList')[0].scrollTop = $('#messageList')[0].scrollHeight;


            //notification text   
    //notification title
    var notif_title = name+': '+ text;
    //notification body
    var notif_body = dateform;
    

    // checks if last notification was less than 5 seconds ago
    // this is used to only create notifications for messages that were sent from the time you logged in and forward 
    // (e.g., no notifications for messages in the past)
    if (diff <= 50000 && showchatnotif == true){
        notifyMe(notif_title, notif_body, 'chat');
    }


};


//*** online users
// since I can connect from multiple devices or browser tabs, we store each connection instance separately
// any time that connectionsRef's value is null (i.e. has no children) I am offline
var myConnectionsRef = new Firebase('https://foundry-ft.firebaseio.com/'+flash_team_id+'/users/'+name+'/connections');
// stores the timestamp of my last disconnect (the last time I was seen online)
var lastOnlineRef = new Firebase('https://foundry-ft.firebaseio.com/'+flash_team_id+'/users/'+name+'/lastOnline');
var connectedRef = new Firebase('https://foundry-ft.firebaseio.com/.info/connected');

// Get a reference to the presence data in Firebase.
var userListRef = new Firebase('https://foundry-ft.firebaseio.com/' + flash_team_id + '/presence');

// Generate a reference to a new location for my user with push.
var myUserRef = userListRef.push();

/*
connectedRef.once('value', function(snapshot) {
    var message = snapshot.val();
    console.log(snapshot);
    console.log(message);
    console.log("MESSAGE NAME: " + message["name"]);

    displayChatMessage(message.name, message.uniq, message.role, message.date, message.text);
    
    name = message.name;
});*/

myDataRef.on('child_added', function(snapshot) {
    var message = snapshot.val();
    console.log(snapshot);
    console.log(message);
    console.log("MESSAGE NAME: " + message["name"]);

    displayChatMessage(message.name, message.uniq, message.role, message.date, message.text);
    
    name = message.name;
});

connectedRef.on('value', function(snap) {
    if (snap.val() === true) {
        // We're connected (or reconnected)! Do anything here that should happen only if online (or on reconnect)

        // add this device to my connections list
        // this value could contain info about the device or a timestamp too
        var con = myConnectionsRef.push(true);

        // when I disconnect, remove this device
        con.onDisconnect().remove();

        // when I disconnect, update the last time I was seen online
        lastOnlineRef.onDisconnect().set(Firebase.ServerValue.TIMESTAMP);
    
		// If we lose our internet connection, we want ourselves removed from the list.
		myUserRef.onDisconnect().remove();

		// Set our initial online status.
		setUserStatus("online ★");
      
    } else {

      // We need to catch anytime we are marked as offline and then set the correct status. We
      // could be marked as offline 1) on page load or 2) when we lose our internet connection
      // temporarily.
      setUserStatus(currentStatus);
    }
});


// A helper function to let us set our own status
function setUserStatus(status) {
	// Set our status in the list of online users.
	currentStatus = status;
	if (presname != undefined && status != undefined){
		myUserRef.set({ name: presname, status: status });
	}
}

function getMessageId(snapshot) {
    return snapshot.name().replace(/[^a-z0-9\-\_]/gi,'');
}

// Update our GUI to show someone"s online status.
userListRef.on("child_added", function(snapshot) {
	var user = snapshot.val();
	
	$("<div/>")
	  .attr("id", getMessageId(snapshot))
	  .text(user.name + " is " + user.status)
	  .appendTo("#presenceDiv");
});

// Update our GUI to remove the status of a user who has left.
userListRef.on("child_removed", function(snapshot) {
	$("#presenceDiv").children("#" + getMessageId(snapshot))
	  .remove();
});

// Update our GUI to change a user"s status.
userListRef.on("child_changed", function(snapshot) {
	var user = snapshot.val();
	$("#presenceDiv").children("#" + getMessageId(snapshot))
	  .text(user.name + " is " + user.status);
});
  

// Use idle/away/back events created by idle.js to update our status information.
$(function() { 

	// when user is inactive for 60 seconds
	var awayCallback = function() {
		setUserStatus("away");
	};
	
	var awayBackCallback = function() {
		setUserStatus("online ★");
	};
	
	//when user is looking at another tab
	var hiddenCallback = function() {
		//☆ idle
		setUserStatus("idle ☆");
	};
	
	var visibleCallback = function(){
		//setUserStatus("active again");
		setUserStatus("online ★");
	};

	var idle = new Idle({
		onHidden: hiddenCallback,
		onVisible: visibleCallback,
		onAway: awayCallback,
		onAwayBack: awayBackCallback,
		awayTimeout: 60000 //away with 1 minute (e.g., 60 seconds) of inactivity
	}).start();				
});
/***chat end****/


//*************status bar begin *******//

//var status_width=302; --> negar's
/* --------------- PROJECT STATUS BAR START ------------ */
var project_status_svg = d3.select("#status-bar-container").append("svg")
/* .attr("width", SVG_WIDTH) */
.attr("width", 300)
.attr("height", 100);

var statusText = project_status_svg.append("text").text("You currently have no tasks")
.attr("x", 0)
.attr("y", 15)
.attr("font-size", "sans-serif")
.attr("font-size", "20px")
.attr("fill", "black");

var status_width=100; 
var status_height=32;
var status_x=0;
var status_y=25;
var curr_status_width=0;
var project_duration=1440000;
var status_bar_timeline_interval=1000;  //TODO back to 10 secs //start moving each second for the width of project_status_interval_width.
var num_intervals;                      //=(parseFloat(project_duration)/parseFloat(status_bar_timeline_interval));
var project_status_interval_width;      //=parseFloat(status_width)/parseFloat(num_intervals);
var thirty_min=10000; //TODO back to 1800000
var first_move_status=1;

// var gdrive_link = project_status_svg.append("text")
//         .text("Google Drive Folder")
//         .attr("style", "cursor:pointer; text-decoration:underline; text-decoration:bold;")
//         .attr("class", "gdrive_link")
//         .attr("id", function(d) {return "folderLink";})
//         // .attr("groupNum", groupNum)
//         .attr("x", function(d) {return status_x})
//         .attr("y", function(d) {return status_y + 10})
//         .attr("font-size", "12px");

// $("#folderLink").on('click', function(){
//     window.open(flashTeamsJSON.folder[1]);
// });

/*var project_status_svg = d3.select("#status-bar-container").append("svg")
    .attr("width", SVG_WIDTH)
    .attr("height", 50)


project_status_svg.append("rect")
    .attr("width", status_width)
    .attr("height", status_height)
    .attr("x",status_x)
    .attr("y",status_y)
    .style("stroke","black" )
    .attr("fill","white")

var project_status=project_status_svg.append("rect")
    .attr("width", curr_status_width)
    .attr("height", status_height)
    .attr("x",status_x)
    .attr("y",status_y)
    .attr("fill","green")
    .attr("class","project_status")

$(document).ready(function(){
  $("#flip").click(function(){
    $("#panel").slideToggle();
  });
});
*/
var moveProjectStatus = function(status_bar_timeline_interval){
    var me = $('.progress .bar');
    var perc = 100;

    var current_perc = 0;

    var progress = setInterval(function() {
                //current_perc +=1;
                if(curr_status_width<status_width && delayed_tasks.length==0){
                    curr_status_width += project_status_interval_width;

                }
                if(curr_status_width>status_width){
                    curr_status_width = status_width;
                }
                me.css('width', (curr_status_width)+'%');
                

                //me.text(curr_status_width+'%');

           // var int_width=Math.round(curr_status_width);      
       },status_bar_timeline_interval);

    return progress;
};

var stopProjectStatus = function(){
    var me = $('.progress .bar');
    me.css('width', curr_status_width+'%');
    window.clearInterval(project_status_handler);
};

function init_statusBar(status_bar_timeline_interval){
    var last_group_num=-1;
    var last_end_x=0;

    for (var i=0;i<task_groups.length;i++){
        var data = task_groups[i];
        var groupNum = data.groupNum;

        var ev = flashTeamsJSON["events"][getEventJSONIndex(groupNum)];
        var start_x = ev.x+4;  //CHECK with Jay
        var width = getWidth(ev);
        var end_x = parseFloat(start_x) + parseFloat(width);
        
        /*console.log("start_x",start_x);
        console.log("width",width);
        console.log("here2");
        console.log("end_time",groupNum +" "+ parseFloat(end_x)/100);
        */
        if(last_end_x<end_x){
            last_end_x=end_x;
        }
        
    }
   // last_end_x=parseFloat(last_end_x)/50*thirty_min; //TODO change to width
   console.log("last_end",last_end_x);
   project_duration=parseInt(last_end_x/50)*thirty_min;
   console.log("project duration: ",project_duration);

   num_intervals=(parseFloat(project_duration)/parseFloat(status_bar_timeline_interval));
   project_status_interval_width=parseFloat(status_width)/parseFloat(num_intervals);
}


function load_statusBar(status_bar_timeline_interval){

    //pause if a task is delayed
    if(delayed_tasks.length != 0){

        var start_delayed_x;  //CHECK with Jay
        var width_delayed;
        var end_delayed_x;
        
        for (var i = 0; i<task_groups.length; i++){
            var data = task_groups[i];
            var groupNum = data.groupNum;
            
            
            if ( groupNum == delayed_tasks[0]){

                start_delayed_x = data.x+4;  //CHECK with Jay
                var ev = flashTeamsJSON["events"][getEventJSONIndex(groupNum)];
                width_delayed = getWidth(ev);
                end_delayed_x = parseFloat(start_delayed_x) + parseFloat(width_delayed);
                

                break;
            }
        }

        var last_group_num=-1;
        var last_end_x=0;

        for (var i=0;i<task_groups.length;i++){
            var data = task_groups[i];
            var groupNum = data.groupNum;

            var ev = flashTeamsJSON["events"][getEventJSONIndex(groupNum)];

            var start_x = ev.x+4;  //CHECK with Jay
            var width = getWidth(ev);
            var end_x = parseFloat(start_x) + parseFloat(width);
            
            if(last_end_x<end_x){
                last_end_x=end_x;
            }
            
        }
        

        // last_end_x=parseFloat(last_end_x)/50*thirty_min; //TODO change to width
        console.log("last_end",last_end_x);
        var cursor_x = cursor.attr("x1");
        project_duration=parseInt((last_end_x)/50)*thirty_min;
        console.log("project duration: ",project_duration);

        num_intervals=(parseFloat(project_duration)/parseFloat(status_bar_timeline_interval));
        project_status_interval_width=parseFloat(status_width)/parseFloat(num_intervals);


        curr_status_width = status_width * parseFloat(end_delayed_x)/parseFloat(last_end_x);

        return;    
    }
    




    if (flashTeamsJSON["startTime"] == null ){
        return;
    }
    
    var currTime = (new Date).getTime();
    
    var startTime = flashTeamsJSON["startTime"];
    var diff = currTime - startTime;
    var diff_sec = diff/1000;


    var last_group_num=-1;
    var last_end_x=0;

    for (var i=0;i<task_groups.length;i++){
        var data = task_groups[i];
        var groupNum = data.groupNum;

        var ev = flashTeamsJSON["events"][getEventJSONIndex(groupNum)];
        var start_x = ev.x+4;  //CHECK with Jay
        var width = getWidth(ev);
        var end_x = parseFloat(start_x) + parseFloat(width);
        
        if(last_end_x<end_x){
            last_end_x=end_x;
        }
        
    }

   // last_end_x=parseFloat(last_end_x)/50*thirty_min; //TODO change to width
   console.log("last_end",last_end_x);
   project_duration=parseInt(last_end_x/50)*thirty_min;
   console.log("project duration: ",project_duration);

   num_intervals=(parseFloat(project_duration)/parseFloat(status_bar_timeline_interval));
   project_status_interval_width=parseFloat(status_width)/parseFloat(num_intervals);

   curr_status_width = project_status_interval_width * diff_sec;
}
var status_interval_id;
var setProjectStatusMoving = function(){

    return moveProjectStatus(status_bar_timeline_interval);
/*    status_interval_id = setInterval(function(){
        moveProjectStatus(status_bar_timeline_interval);
    }, status_bar_timeline_interval); // every 10 seconds currently*/

};
/* --------------- PROJECT STATUS BAR END ------------ */
/* --------------- PROJECT STATUS BAR END ------------ */
