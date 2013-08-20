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
		title: '<b>' + memberName + ' [  ]</b>',
		content: '<div class="mForm_' + pillCounter + '"><form name="memberForm_' + pillCounter + '" autocomplete="on">'
		+'<div class="input-append"><input class="skillInput" id="addSkillInput_' + pillCounter 
			+'" type="text" placeholder="New Skill" autocomplete="on">'
		+'<button class="btn" type="button" onclick="addSkill(' + pillCounter + ');">+</button>'
		+'</div></form>'
		+'Skills:'	
		+'<ul class="nav nav-pills" id="skillPills_' + pillCounter + '"> </ul>'
		+'<p><button type="button" onclick="deleteMember(' + pillCounter + ');">Delete</button>     '
		+'<button type="button" onclick="hideMemberPopover(' + pillCounter + ');">Done</button></p></div>',
		container: $("#member-container")
	});
};

function addSkill(pillId) {
	var skillName = $("#addSkillInput").val();
	$('"#mForm_' + pillId + '"').append('<li class="active" id="sPill_' + pillId + '"><a>' + skillName + '</a></li>');
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
	$(".skillInput").each(function () {
		$(this).autocomplete({
			source: availableSkills
		});
	});

	$("#addMemberInput").autocomplete({
		source: availableMembers
	});


});



