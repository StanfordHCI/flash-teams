/* load.js
 * ---------------------------------
 *
 */

$(document).ready(function() {
  var textAreaJSON = $('#flash_team_json').val();
  console.log(textAreaJSON);
  flashTeamsJSON = JSON.stringify(eval("(" + textAreaJSON + ")"));
});