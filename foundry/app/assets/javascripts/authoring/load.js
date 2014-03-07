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

function sendConfirmationEmail(name, uniq, email) {
	var flash_team_id = $("#flash_team_id").val();
  var url = '/flash_teams/' + flash_team_id + '/send_confirmation_email';
  $.post(url, {name: name, email: email, uniq: uniq} ,function(data){
  	alert("Pls check your email for an email.");
    window.close();
  });
};

function login(uniq) {
  var flash_team_id = $("#flash_team_id").val();
  var url = '/flash_teams/' + flash_team_id + '/login';
  $.post(url, {uniq: uniq}, function(data){
    if (data !== null){
      alert("Welcome " + data + "! You are now logged in.");
    } else {
      alert("Sorry there was an error logging you in!");
    }
  });
};

var ready = function() {
  var textAreaJSON = $('#flash_team_json').val();
  var uniq = getParameterByName('u');
  var confirm_email_uniq = getParameterByName('cu');
  var flash_team_id = $("#flash_team_id").val();

  if(uniq !== "") {
    var url = '/flash_teams/' + flash_team_id + '/check_email_confirmed';
    $.post(url, {uniq: uniq}, function(data){
      if (!data){ // email not confirmed
        if (confirm_email_uniq === ""){ // on the first link
          var email = prompt("Please enter your email address.");
          if (email !== null) {
            console.log("send confirmation email");
            var name = "placeholder";
            sendConfirmationEmail(name, uniq, email);
          };
        } else { // on the email confirmation link
          var flash_team_id = $("#flash_team_id").val();
          var url = '/flash_teams/' + flash_team_id + '/confirm_email';
          $.post(url, {uniq: uniq, confirm_email_uniq: confirm_email_uniq}, function(data){
            console.log("email confirmed");
            login(uniq);
          });
        }
      } else {
        login(uniq);
      }
    });
  };

  var url = '/flash_teams/' + flash_team_id + '/get_json';
  $.post(url, {uniq: uniq}, function(data){
    flashTeamsJSON = JSON.parse(data);
    drawFlashTeamFromJSON(flashTeamsJSON);
  });
};

// Trick to fix a turbolink issue
$(document).ready(ready);
$(document).on('page:load', ready);