var sendEarlyCompletionEmail= function(minutes) {
	/*placeholder for now!*/
	var emails=new Array("rahmati.nr@gmail.com","rahmati@stanford.edu");

	var flash_team_id = $("#flash_team_id").val();
    var url = '/flash_teams/' + flash_team_id + '/early_completion_email';
    $.post(url, {emails: emails, minutes:minutes} ,function(data){
    	console.log("successfully sent Early Task Completion email");
    });
};

