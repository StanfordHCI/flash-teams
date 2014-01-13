/* load.js
 * ---------------------------------
 *
 */

var ready = function () {
  var textAreaJSON = $('#flash_team_json').val();
  //console.log(textAreaJSON);
  flashTeamsJSON = JSON.parse(textAreaJSON);
  drawFlashTeamFromJSON(flashTeamsJSON);
}

// Trick to fix a turbolink issue
$(document).ready(ready);
$(document).on('page:load', ready);