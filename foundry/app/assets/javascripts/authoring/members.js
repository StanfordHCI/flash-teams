/* Members.js
 * ---------------------------------
 *
 */

var pillCounter = 0;
var colorToChange = "#ff0000";

function addMember() {
    pillCounter++;
    var memberName = $("#addMemberInput").val();
    if (memberName == "") {
        alert("Not a valid member");
        return;
    }
    //Appends a list item pill to the memberPills ul
    $("#memberPills").append('<li class="active pill' + pillCounter + '" id="mPill_' + pillCounter + '""><a>' + memberName 
        + '<div class="close" onclick="deleteMember(' + pillCounter + '); saveFlashTeam();">  X</div>' + '</a></li>');

    //Clear Input
    $("#addMemberInput").val(this.placeholder);

    //Append a popover to the pill
    $("#mPill_" + pillCounter).popover({
        placement: "right",
        html: "true",
        class: "member",
        id: '"memberPopover' + pillCounter + '"',
        trigger: "click",
        title: '<b>' + memberName + '</b>',
        content:  '<form name="memberForm_' + pillCounter + '" autocomplete="on">'
        +'<div class="mForm_' + pillCounter + '">'
            +'<div class="input-append" > ' 
            +'<select class="category1Input" id="member' + pillCounter + '_category1"></select>'
            +'<br><br><select class="category2Input" id="member' + pillCounter + '_category2" disabled="disabled">--oDesk Sub-Category--</select>'
            +'<br><br><input class="skillInput" id="addSkillInput_' + pillCounter + '" type="text" onclick="addAuto()" placeholder="New oDesk Skill" autocomplete="on">'
            +'<button class="btn" type="button" class="addSkillButton" id="addSkillButton_' + pillCounter + '" onclick="addSkill(' + pillCounter + ');">+</button>'
            +'</div>'
            +'Skills:'  
            +'<ul class="nav nav-pills" id="skillPills_' + pillCounter + '"> </ul>'
            +'Member Color: <input type="text" class="full-spectrum" id="color_' + pillCounter + '"/>'
            +'<script type="text/javascript"> initializeColorPicker(); </script>'
            +'<p><button type="button" onclick="deleteMember(' + pillCounter + '); saveFlashTeam();">Delete</button>     '
            +'<button type="button" onclick="saveMemberInfo(' + pillCounter + '); saveFlashTeam();">Save</button>'
        +'</p></form>' 
        +'</div>',
        container: $("#member-container")
    });
    $("#mPill_"+pillCounter).popover("show");

    //Adds the drop-down for two-tiered oDesk job posting categories on popover
    for (var key in oDeskCategories) {
        var option = document.createElement("option");
        $("#member" + pillCounter + "_category1").append('<option value="' + key + '">' + key + '</option>');
    }
    $("#member" + pillCounter + "_category1").change(function() {
        if ($("#member" + pillCounter + "_category1").value == "--oDesk Category--") {
            $("#member" + pillCounter + "_category2").attr("disabled", "disabled");
        } else {
            $("#member" + pillCounter + "_category2").removeAttr("disabled");
            $("#member" + pillCounter + "_category2").empty();

            var category1Select = document.getElementById("member" + pillCounter + "_category1");
            var category1Name = category1Select.options[category1Select.selectedIndex].value;
            for (i = 0; i < oDeskCategories[category1Name].length; i++) {
                var option = document.createElement("option");
                $("#member" + pillCounter + "_category2").append("<option>" + oDeskCategories[category1Name][i] + "</option>");
            }
        }

    });

    //Appends oDesk Skills input to popover
    $(document).ready(function() {
        pressEnterKeyToSubmit("#addSkillInput_" + pillCounter, "#addSkillButton_" + pillCounter);
    });
 
    //Add to Flash Teams JSON Object
    var newMember = {"role":memberName, "id": pillCounter, "color":"rgb(0, 168, 0)", "skills":[], "category1":"", "category2":""};
    flashTeamsJSON.members.push(newMember); 
    addMemberNode(memberName, pillCounter, "#808080");

    //If there are tasks, add the checkbox to them
    //START HERE
};

function addAuto() {
    $(".skillInput").each(function () {
        $(this).autocomplete({
            source: oSkills
        });
    });
};

//Adds a needed skill to a member and updates JSON
function addSkill(memberId) {
    var skillName = $("#addSkillInput_" + memberId).val();
    if (skillName == "" || oSkills.indexOf(skillName) < 0) {
        alert("Not a valid oDesk skill");
        return;
    }

    //Update JSON
    var indexOfJSON = getMemberJSONIndex(memberId);
    flashTeamsJSON["members"][indexOfJSON].skills.push(skillName);

    var memberSkillNumber = flashTeamsJSON["members"][indexOfJSON].skills.length;
    $("#skillPills_" + memberId).append('<li class="active" id="sPill_mem' + memberId + '_skill' + memberSkillNumber + '"><a>' + skillName 
        + '<div class="close" onclick="deleteSkill(' + memberId + ', ' + memberSkillNumber + ', &#39' + skillName + '&#39)">  X</div></a></li>');
    $("#addSkillInput_" + memberId).val(this.placeholder);
};

function deleteSkill(memberId, pillId, skillName) {
    //Remove skill pill
    $("#sPill_mem" + memberId + '_skill' + pillId).remove();
    //Update JSON
    var indexOfJSON = getMemberJSONIndex(memberId);
    for (i = 0; i < flashTeamsJSON["members"][indexOfJSON].skills.length; i++) {
        if (flashTeamsJSON["members"][indexOfJSON].skills[i] == skillName) {
            flashTeamsJSON["members"][indexOfJSON].skills.splice(i, 1);
            break;
        }
    }
};

//Saves info and updates popover, no need to update JSON, done by individual item elsewhere
function saveMemberInfo(popId) {
    var indexOfJSON = getMemberJSONIndex(popId);
    flashTeamsJSON["members"][indexOfJSON].category1 = $("#member" + popId + "_category1").value;
    flashTeamsJSON["members"][indexOfJSON].category2 = $("#member" + popId + "_category2").value;

    var newColor = $("#color_" + popId).spectrum("get");
    updateMemberPillColor(newColor, popId);
    updateMemberPopover(popId);

    $("#mPill_" + popId).popover("hide");
};

//Delete team member from team list, JSON, diagram, and events
function deleteMember(pillId) {
    //Remove Member from JSON
    var indexOfJSON = getMemberJSONIndex(pillId);
    var memberName = flashTeamsJSON["members"][indexOfJSON].role;
    flashTeamsJSON["members"].splice(indexOfJSON, 1);

    $("#mPill_" + pillId).popover("destroy");
    $("#mPill_" + pillId).remove();

    //REMOVE THE CIRCLES
    removeMemberNode(pillId);

    //REMOVE THE MEMBER FROM EVENTS

};

//Takes the new color, turns into hex and changes background color of a pill list item
function updateMemberPillColor(color, memberId) {
    var newColor = color.toHexString();
    var pillLi = document.getElementById("mPill_" + memberId);
    pillLi.childNodes[0].style.backgroundColor = newColor;
    var indexOfJSON = getMemberJSONIndex(memberId);
    flashTeamsJSON["members"][indexOfJSON].color = newColor;

    // Update JSON for team diagram
    workers.nodes[searchById(workers.nodes, memberId)].color = newColor;
    updateNodeColor();
};

//Necessary to save member popover information
function updateMemberPopover(idNum) {
    $("#mPill_" + idNum).data('popover').options.content = "";
};

//Draws the color picker on a member popover
function initializeColorPicker() {
    $(".full-spectrum").spectrum({
        showPaletteOnly: true,
        showPalette: true,
        color: "rgb(0, 168, 0)",
        palette: [
        ["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)",
        "rgb(204, 204, 204)", "rgb(217, 217, 217)","rgb(255, 255, 255)"],
        ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(0, 255, 0)",
        "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"], 
        ["rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(182, 215, 168)", 
        "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)"], 
        ["rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(100, 196, 100)", 
        "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)"],
        ["rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(0, 168, 0)",
        "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)"],
        ["rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)",  "rgb(39, 78, 19)", 
        "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]
    ],
        change: function(color) {
            colorToChange = color.toHexString();
        }
    });
}

//Find the index of a member in the JSON object "members" array by using unique id
function getMemberJSONIndex(idNum) {
    for (i = 0; i < flashTeamsJSON["members"].length; i++) {
        if (flashTeamsJSON["members"][i].id == idNum) return i; 
    }
}

function searchById (arr, id) {
    for (i = 0; i < arr.length; i++) {
        if (arr[i].id == id) {
            return i;
        }
    }
}

$(document).ready(function() {
    pressEnterKeyToSubmit("#addMemberInput", "#addMemberButton");
});



