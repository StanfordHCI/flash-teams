/*
 *
 *
 */
var pillCounter = 0;

function addMember() {
	pillCounter++;

	//Appends a list item pill to the memberPills ul
	var memberName = $("#addMemberInput").val();
	$("#member-container ul").append('<li class="active" id="mPill_' + pillCounter + '""><a>' + memberName + '</a></li> <br></br>');

	//Clear Input
	$("#addMemberInput").val(this.placeholder);

	//Append a popover to the pill
	$("#mPill_" + pillCounter).popover({
		placement: "right",
		html: "true",
		class: "member",
		id: '"memberPopover' + pillCounter + '"',
		trigger: "click",
		title: memberName,
		content: '<form name="memberForm_' + pillCounter + '">'
		+ '<div class="input-append"><input class="span8" id="addSkillInput_' + pillCounter + '" type="text" placeholder="New Skill" autocomplete="on">'
		+ '<button class="btn" type="button" onclick="addSkill(' + pillCounter + ');">+</button></div>'
		+'Skills:'	
		+'<ul class="nav nav-pills" id="skillPills_' + pillCounter + '"> </ul>'
		+'<p><button type="button" onclick="deleteMember(' + pillCounter + ');">Delete</button>     '
		+'<button type="button" onclick="hideMemberPopover(' + pillCounter + ');">Done</button></p>'
		+'</form>',
		container: $("#member-container")
	});
};

function addSkill(pillId) {
	var skillName = $("#addSkillInput").val();
	$("#memberPopover" + pillId + "ul").append('<li class="active" id="sPill_' + pillId + '"><a>' + skillName + '</a></li>');
}

function hideMemberPopover(popId) {
	$("#mPill_" + popId).popover("hide");
};

function deleteMember(pillId) {
	$("#mPill_" + pillId).popover("destroy");
	$('#mPill_' + pillId).remove();

	//REMOVE THE CIRCLES
	//REMOVE THE MEMBER FROM EVENTS
};

var availableSkills = [
	"AJAX",
	"Javascript",
	"JQuery"
];

$(document).ready(function() {
	$("#addMemberInput").autocomplete({
		source: availableMembers
	});

	//FIX THIS NEXT
	for (var i = 1; i <= pillCounter; i++) {
		$("#addSkillInput_" + i).autocomplete({
			source: availableSkills
		})
	}

});




