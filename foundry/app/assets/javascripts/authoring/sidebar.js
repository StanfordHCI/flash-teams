/*-----------Pusher chat box ----------------*/

$(function() {     

    var pusher = new Pusher('5fa76b11a664d088aa65');
    var chatWidget = new PusherChatWidget(pusher, {
    chatEndPoint: '/assets/pusher-realtime-chat-widget/src/ruby-sinatra/chat.rb'
    });
   
});


//
/*$(function() {     
  var pusher = new Pusher('5fa76b11a664d088aa65');
  var chatWidget = new PusherChatWidget(pusher, {
    chatEndPoint: 'pusher-realtime-chat-widget/src/ruby-sinatra/chat.rb'
  });
});
*/



/*-----------pusher chat box --------------*/

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

var status_width=250;
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

var moveProjectStatus = function(status_bar_timeline_interval){
    if(first_move_status){
        first_move_status=0;
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
    
    if(curr_status_width<status_width && delayed_tasks.length==0){
        curr_status_width += project_status_interval_width;
    }
    project_status.transition()
        .duration(status_bar_timeline_interval)
        .ease("linear")
        .attr("width", curr_status_width)
        
};

var status_interval_id;
var setProjectStatusMoving = function(){
    moveProjectStatus(status_bar_timeline_interval);
    status_interval_id = setInterval(function(){
        moveProjectStatus(status_bar_timeline_interval);
    }, status_bar_timeline_interval); // every 10 seconds currently
};

/* --------------- PROJECT STATUS BAR END ------------ */