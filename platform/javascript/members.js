/*
 *
 *
 */
var pillCounter = 0;

var currentMembers = []; //For Event Autocomplete

function addMember() {
	pillCounter++;

	//Appends a list item pill to the memberPills ul
	var memberName = $("#addMemberInput").val();
	$("#memberPills").append('<li class="active" id="mPill_' + pillCounter + '""><a>' + memberName + '</a></li> <br></br>');


	//Clear Input
	$("#addMemberInput").val(this.placeholder);

	//Append a popover to the pill
	$("#mPill_" + pillCounter).popover({
		placement: "right",
		html: "true",
		class: "member",
		id: '"memberPopover' + pillCounter + '"',
		trigger: "click",
		title: '<b>' + memberName + ' [ ]</b>',
		content:  '<form name="memberForm_' + pillCounter + '" autocomplete="on">'
		+'<div class="mForm_' + pillCounter + '">'
			+'<div class="input-append" > ' 
			+'<input class="skillInput" id="addSkillInput_' + pillCounter + '" type="text" onclick="addAuto()" placeholder="New Skill" autocomplete="on">'
			+'<button class="btn" type="button" onclick="addSkill(' + pillCounter + ');">+</button>'
			+'</div>'
			+'Skills:'	
			+'<ul class="nav nav-pills" id="skillPills_' + pillCounter + '"> </ul>'
			+'Member Color: <input type="text" class="full-spectrum" id="color_' + pillCounter + '"/>'
			+'<script type="text/javascript"> initializeColorPicker(); </script>'
			+'<p><button type="button" onclick="deleteMember(' + pillCounter + ', ' + memberName + ');">Delete</button>     '
			+'<button type="button" onclick="hideMemberPopover(' + pillCounter + ');">Save</button>'
		+'</p></form>' 
		+'</div>',
		container: $("#member-container")
	});
	$("#mPill_"+pillCounter).popover("show");
	

	currentMembers.push(memberName);
	var newMember = {"name":memberName, "id": pillCounter}
	foundryJSONObject.members.push(newMember);
	addMemberNode(memberName);
};

function addAuto() {
	$(".skillInput").each(function () {
		$(this).autocomplete({
			source: oSkills
		});
	});
}

function addSkill(pillId) {
	var skillName = $("#addSkillInput_" + pillId).val();
	$("#skillPills_" + pillId).append('<li class="active" id="sPill_' + pillId + '"><a>' + skillName + '</a></li>');
	$("#addSkillInput_" + pillId).val(this.placeholder);
}

function hideMemberPopover(popId) {
	$("#mPill_" + popId).popover("hide");

	//Save Changes?
};

function deleteMember(pillId, memberName) {
	$("#mPill_" + pillId).popover("destroy");
	$('#mPill_' + pillId).remove();

	//Remove Member from Current Members

	var i = currentMembers.indexOf(memberName);

    if(i != -1) array.splice(i, 1);

	//REMOVE THE CIRCLES
	//REMOVE THE MEMBER FROM EVENTS
};

function updateMemberPillColor() {
	//var data = d3.select("#mPill_" + pillId).data();
	//data.color = "#000000";

	//CALL 'ONCHANGE' FOR COLORPICKER
	//ALSO CALL 'ONSUBMIT' FOR COLOPICKER
}

function initializeColorPicker(color) {
	$(".full-spectrum").spectrum({
	    color: color,
	    change: function(color) {
	        updateMemberPillColor();
	    }
	});
}

$(document).ready(function() {
	$("#addMemberInput").autocomplete({
		source: availableMembers
	});
});



