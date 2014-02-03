/* load.js
 * ---------------------------------
 *
 */

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function sendConfirmationEmail(uniq, email) {
	var flash_team_id = $("#flash_team_id").val();
    var url = '/flash_teams/' + flash_team_id + '/confirm_email';
    $.post(url, {email: email, uniq: uniq} ,function(data){
    	console.log("successfully sent email");
    });
};

var ready = function () {
  var textAreaJSON = $('#flash_team_json').val();
  var uniq = getParameterByName('uniq');
  if(uniq !== "") {
  	var email = prompt("Please enter your email address.");
  	if (email != null) {
  		console.log(email);
  		sendConfirmationEmail(uniq, email);
  	}
  }

  flashTeamsJSON = JSON.parse(textAreaJSON);
  drawFlashTeamFromJSON(flashTeamsJSON);
}

// Trick to fix a turbolink issue
$(document).ready(ready);
$(document).on('page:load', ready);