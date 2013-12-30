/* load.js
 * ---------------------------------
 *
 */

window.onload = function() {
  var textAreaJSON = $('#flash_team_json').val();
  console.log(textAreaJSON);
  flashTeamsJSON = JSON.parse(textAreaJSON);
  drawFlashTeamFromJSON(flashTeamsJSON);
};