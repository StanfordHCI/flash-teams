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
			+'<div class="input-append">' 
			+'<input class="skillInput" id="addSkillInput_' + pillCounter + '" type="text" onclick="addAuto()" placeholder="New Skill" autocomplete="on">'
			+'<button class="btn" type="button" onclick="addSkill(' + pillCounter + ');">+</button>'
			+'</div>'
			+'Skills:'	
			+'<ul class="nav nav-pills" id="skillPills_' + pillCounter + '"> </ul>'
			+'Member Color:  <input type="color" id="member_Color" style="width:40px" color="blue"/>'
			+'<p><button type="button" onclick="deleteMember(' + pillCounter + ');">Delete</button>     '
			+'<button type="button" onclick="hideMemberPopover(' + pillCounter + ');">Done</button>'
		+'</p></form>' 
		+'</div>',
		container: $("#member-container")
	});

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
};

function deleteMember(pillId) {
	$("#mPill_" + pillId).popover("destroy");
	$('#mPill_' + pillId).remove();

	//REMOVE THE CIRCLES
	//REMOVE THE MEMBER FROM EVENTS
};


$(document).ready(function() {
	$("#addMemberInput").autocomplete({
		source: availableMembers
	});
});



