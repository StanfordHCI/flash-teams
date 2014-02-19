var sendEarlyCompletionEmail= function(minutes) {
	/*placeholder for now!*/
	var emails=new Array("rahmati.nr@gmail.com","rahmati@stanford.edu");

	var flash_team_id = $("#flash_team_id").val();
    var url = '/flash_teams/' + flash_team_id + '/early_completion_email';
    $.post(url, {emails: emails, minutes:minutes} ,function(data){
    	console.log("successfully sent Early Task Completion email");
    });
};

var sendBeforeTaskStartsEmail=function(minutes,email){
	
	var flash_team_id = $("#flash_team_id").val();
    var url = '/flash_teams/' + flash_team_id + '/before_task_starts_email';
    $.post(url, {email: email, minutes:minutes} ,function(data){
    	console.log("successfully sent notification before task starts");
    });
};


var sendDelayedTaskFinishedEmail=function(minutes,email){
	
	var flash_team_id = $("#flash_team_id").val();
    var url = '/flash_teams/' + flash_team_id + '/delayed_task_finished_email';
    $.post(url, {email: email, minutes:minutes} ,function(data){
    	console.log("successfully sent notification: delayed task is finished");
    });
};


var sendTaskDelayedEmail=function(email){
	
	var flash_team_id = $("#flash_team_id").val();
    var url = '/flash_teams/' + flash_team_id + '/task_delayed_email';
    $.post(url, {email: email} ,function(data){
    	console.log("successfully sent notification: a task is delayed");
    });
};


/* called in awareness.js */
function delayed_notification_helper(new_remaining_tasks){
     var emails=[];
     for (var i=0;i<new_remaining_tasks.length;i++){
        var groupNum = new_remaining_tasks[i];
        alert(i+" "+groupNum);
    	for (var j = 0; j<flashTeamsJSON["events"].length; j++){
       
        eventId = flashTeamsJSON["events"][j].id;
	        if (eventId == groupNum){
	        	alert("id == groupNum");
	            var event_tmp = flashTeamsJSON["events"][j];
	            //alert(event_tmp["members"]);
	            //TODO actual emails instead of roles
	            for( var m_i=0;m_i<event_tmp["members"].length;m_i++ ){
	            	tmp_email=event_tmp["members"][m_i];
	             	
	                if(emails.indexOf(tmp_email)==-1){
	                emails.push(tmp_email);
	                alert("sent email to"+tmp_email);
	                sendTaskDelayedEmail(tmp_email);
	             	}
	            }
	        }
        }
    }  
};
