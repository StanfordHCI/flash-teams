/***chat****/

var myDataRef = new Firebase('https://intense-fire-1391.firebaseio.com/'+ flash_team_id)    
                        
var currentdate = new Date(); 
      var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes();

var name;
$('#messageInput').keypress(function (e) {
    name =  chat_name+" ("+chat_role+")";
    if (e.keyCode == 13) {
        //name = $('#nameInput').val();
        var text = $('#messageInput').val();
        myDataRef.push({name: name, text: text});
        $('#messageInput').val('');
       }
    });
myDataRef.on('child_added', function(snapshot) {
    var message = snapshot.val();
    displayChatMessage(message.name, message.text);
    });
      
var lastMessage=0;
      var lastWriter;
      function displayChatMessage(name, text) {
        
        if(lastWriter!=name){
            lastMessage=(lastMessage+1)%2;
            var div1 = $('<div/>',{"id":"m"+lastMessage}).text(text).prepend('<br>').prepend($('<strong/>').text(name+':'));
            div1.css('padding-left','5%');
            div1.append($('<div/>' , {"id":"message-date"}).text(datetime));
            div1.appendTo($('#messageList'));
            
        }else{
            var div1 = $('<div/>',{"id":"m"+lastMessage}).text(text);
            div1.append($('<div/>' , {"id":"message-date"}).text(datetime));
            div1.css('padding-left','5%');
            div1.appendTo($('#messageList'));
        }
        lastWriter=name;
        $('#messageList')[0].scrollTop = $('#messageList')[0].scrollHeight;
      };


//*** online users
// since I can connect from multiple devices or browser tabs, we store each connection instance separately
// any time that connectionsRef's value is null (i.e. has no children) I am offline
var myConnectionsRef = new Firebase('https://intense-fire-1391.firebaseio.com/'+flash_team_id+'/users/'+name+'/connections');
// stores the timestamp of my last disconnect (the last time I was seen online)
var lastOnlineRef = new Firebase('https://intense-fire-1391.firebaseio.com/'+flash_team_id+'/users/'+name+'/lastOnline');
var connectedRef = new Firebase('https://intense-fire-1391.firebaseio.com/.info/connected');

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

    }
});

/***chat end****/


//*************status bar begin *******//

//var status_width=302; --> negar's
/* --------------- PROJECT STATUS BAR START ------------ */
var project_status_svg = d3.select("#status-bar-container").append("svg")
    .attr("width", SVG_WIDTH)
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
        var task = task_groups[i];
        var data = task.data()[0];
        var groupNum = data.groupNum;
       
        var task_rect = task.select("#rect_" + groupNum);
        var start_x = data.x+4;  //CHECK with Jay
        var width = task_rect.attr("width");
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
                var task = task_groups[i];
                var data = task.data()[0];
                var groupNum = data.groupNum;
                
                
                if ( groupNum == delayed_tasks[0]){
                  
                    start_delayed_x = data.x+4;  //CHECK with Jay
                    var task_rect = task.select("#rect_" + groupNum);
                    width_delayed = task_rect.attr("width");
                    end_delayed_x = parseFloat(start_delayed_x) + parseFloat(width_delayed);
                    
                   
                    break;
                }
            }

        var last_group_num=-1;
        var last_end_x=0;
          
        for (var i=0;i<task_groups.length;i++){
            var task = task_groups[i];
            var data = task.data()[0];
            var groupNum = data.groupNum;
           
            var task_rect = task.select("#rect_" + groupNum);
           
            var start_x = data.x+4;  //CHECK with Jay
            var width = task_rect.attr("width");
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
        var task = task_groups[i];
        var data = task.data()[0];
        var groupNum = data.groupNum;
       
        var task_rect = task.select("#rect_" + groupNum);
                var start_x = data.x+4;  //CHECK with Jay
        var width = task_rect.attr("width");
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
