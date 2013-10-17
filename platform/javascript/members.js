/* Members.js
 * ---------------------------------
 *
 */
 
var pillCounter = 0;
var colorToChange = "#ff0000";

var currentMembers = []; //For Event Autocomplete

function addMember() {
	pillCounter++;

	//Appends a list item pill to the memberPills ul
	var memberName = $("#addMemberInput").val();
	$("#memberPills").append('<li class="active pill' + pillCounter + '" id="mPill_' + pillCounter + '""><a>' + memberName + '</a></li> <br></br>');


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
			+'<p><button type="button" onclick="deleteMember(' + pillCounter + ',' + memberName + ');">Delete</button>     '
			+'<button type="button" onclick="saveMemberInfo(' + pillCounter + ');">Save</button>'
		+'</p></form>' 
		+'</div>',
		container: $("#member-container")
	});
	$("#mPill_"+pillCounter).popover("show");
	

	currentMembers.push(memberName);
	var memberId = "member_" + pillCounter;
	var newMember = {"name":memberName, "id": pillCounter, "color":"GRAY"}
	foundryJSONObject.members.push( newMember); //HELP HERE
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

function saveMemberInfo(popId) {
	var newColor = $("#color_" + popId).spectrum("get");
	updateMemberPillColor(newColor, popId);

	updateMemberPopover(popId);

	//UPDATE MEMBER JSON

	$("#mPill_" + popId).popover("hide");
};

function deleteMember(pillId, memberName) {
	//Remove Member from Current Members

	$("#mPill_" + pillId).popover("destroy");
	$("#mPill_" + pillId).remove();

	//REMOVE THE CIRCLES
	//REMOVE THE MEMBER FROM EVENTS
};

function updateMemberPillColor(color, colorId) {
	var newColor = color.toHexString();
	var pillLi = document.getElementById("mPill_" + colorId);
	pillLi.childNodes[0].style.backgroundColor = newColor;
};

function updateMemberPopover(idNum) {
	$("#mPill_" + idNum).data('popover').options.content = "";
};

function initializeColorPicker() {
	$(".full-spectrum").spectrum({
		showPaletteOnly: true,
		showPalette: true,
	    color: "GRAY",
	    palette: [
        ["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)",
        "rgb(204, 204, 204)", "rgb(217, 217, 217)","rgb(255, 255, 255)"],
        ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)",
        "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"], 
        ["rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)", 
        "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)", 
        "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)", 
        "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)",
        "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)",
        "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)",
        "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)", 
        "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]
    ],
	    change: function(color) {
	        colorToChange = color.toHexString();
	    }
	});
}

$(document).ready(function() {
	$("#addMemberInput").autocomplete({
		source: availableMembers
	});
});



