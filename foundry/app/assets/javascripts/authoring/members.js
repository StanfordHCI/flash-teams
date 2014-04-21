/* Members.js
 * ---------------------------------
 *
 */

var pillCounter = 0;
var colorToChange = "#ff0000";
var current = undefined;
var isUser = false;

function renderMembersRequester() {
    var members = flashTeamsJSON.members;
    console.log("rendering members: " + members);
    renderPills(members);
    renderMemberPopovers(members);
    renderDiagram(members);
    renderAllEventsMembers();
};

function renderMembersUser() {
    var members = flashTeamsJSON.members;
    renderAllEventsMembers();
};

function setCurrentMember() {
    var uniq = getParameterByName('uniq');
    console.log("THIS IS THE CURRENT UNIQ VALUE", uniq);
    
    if (uniq){
        $("#uniq").value = uniq;
        flash_team_members = flashTeamsJSON["members"];
        console.log(flash_team_members[0].uniq);
        for(var i=0;i<flash_team_members.length;i++){            
            if (flash_team_members[i].uniq == uniq){
                console.log("uniq1: " + flash_team_members[i].uniq);
                console.log("uniq2: " + uniq);
                current = i;
                isUser = true;
            }
        }
    } else {
        current = undefined;
        isUser = false;
    }
};

function renderPills(members) {
    $("#memberPills").html("");
    for (var i=0;i<members.length;i++){
        var member = members[i];
        var member_id = member.id;
        var member_name = member.role;
        var member_color = member.color;
        console.log("RENDERING PILL...COLOR IS: " + member_color);
        $("#memberPills").append('<li class="active pill' + member_id + '" id="mPill_' + member_id + '""><a>' + member_name 
        + '<div class="close" onclick="deleteMember(' + member_id + '); updateStatus(false);">  X</div></a></li>');
        renderMemberPillColor(member_id);
    }
};

function renderMemberPopovers(members) {
    for (var i=0;i<members.length;i++){
        var member = members[i];
        var member_id = member.id;
        var member_name = member.role;
        var invitation_link = member.invitation_link;

        var content = '<form name="memberForm_' + member_id + '" autocomplete="on">'
                +'<div class="mForm_' + member_id + '">'
                +'<div class="input-append" > ' 
                +'<select class="category1Input" id="member' + member_id + '_category1">';

        // add the drop-down for two-tiered oDesk job posting categories on popover
        for (var key in oDeskCategories) {
            var option = document.createElement("option");
            content += '<option value="' + key + '">' + key + '</option>';
        }

        content += '</select>';
        content += '<br><br><select class="category2Input" id="member' + member_id + '_category2" disabled="disabled">--oDesk Sub-Category--</select>'
                +'<br><br><input class="skillInput" id="addSkillInput_' + member_id + '" type="text" onclick="autocompleteSkills()" placeholder="New oDesk Skill" autocomplete="on">'
                +'<button class="btn" type="button" class="addSkillButton" id="addSkillButton_' + member_id + '" onclick="addSkill(' + member_id + ');">+</button>'
                +'</div>'
                +'Skills:'  
                +'<ul class="nav nav-pills" id="skillPills_' + member_id + '"> </ul>'
                +'Member Color: <input type="text" class="full-spectrum" id="color_' + member_id + '"/>'
                +'<p><script type="text/javascript"> initializeColorPicker(); </script></p>'
                +'<p><button type="button" onclick="deleteMember(' + member_id + '); updateStatus();">Delete</button>     '
                +'<button type="button" onclick="saveMemberInfo(' + member_id + '); updateStatus();">Save</button><br><br>'
                +'<button type="button" onclick="$(\'#mPill_' + member_id + '\').popover(\'hide\');">Cancel</button><br><br>'
                + 'Invitation link: <a id="invitation_link_' + member_id + '" href="' + invitation_link + '" target="_blank">'
                + invitation_link
                + '</a>'
            +'</p></form>' 
            +'</div>';

        $("#mPill_" + member_id).popover('destroy');

        $("#mPill_" + member_id).popover({
            placement: "right",
            html: "true",
            class: "member",
            id: '"memberPopover' + member_id + '"',
            trigger: "click",
            title: '<b>' + member_name + '</b>',
            content:  content,
            container: $("#member-container")
        });

        var mem_id = member_id;
        console.log("attaching click handler to " + member_id);
        $("#mPill_" + member_id).on('click', function() {
            console.log("clicked on " + mem_id);
            $("#member" + mem_id + "_category1").on('change', function(){
                if ($("#member" + mem_id + "_category1").value === "--oDesk Category--") {
                    $("#member" + mem_id + "_category2").attr("disabled", "disabled");
                } else {
                    $("#member" + mem_id + "_category2").removeAttr("disabled");
                    $("#member" + mem_id + "_category2").empty();

                    var category1Select = document.getElementById("member" + mem_id + "_category1");
                    var category1Name = category1Select.options[category1Select.selectedIndex].value;
                    for (var i = 0; i < oDeskCategories[category1Name].length; i++) {
                        var option = document.createElement("option");
                        $("#member" + mem_id + "_category2").append("<option>" + oDeskCategories[category1Name][i] + "</option>");
                    }
                }
            });
        });

        // append oDesk Skills input to popover
        $(document).ready(function() {
            pressEnterKeyToSubmit("#addSkillInput_" + member_id, "#addSkillButton_" + member_id);
        });
    }
};

function renderDiagram(members) {
    removeAllMemberNodes();
    for (var i=0;i<members.length;i++){
        var member = members[i];
        addMemberNode(member.role, member.id, "#808080");
    }
};

function newMemberObject(memberName) {
    pillCounter++;
    return {"role":memberName, "id": pillCounter, "color":"#08c", "skills":[], "category1":"", "category2":""};
};

function addMember() {
    // retrieve member role
    var member_name = $("#addMemberInput").val();
    if (member_name === "") {
        alert("Please enter a member role.");
        return;
    }

    // clear input
    $("#addMemberInput").val(this.placeholder);

    // add member to json
    var member_obj = newMemberObject(member_name);
    flashTeamsJSON.members.push(member_obj);

    updateStatus(false);

    console.log("member_obj.id: " + member_obj.id);
    inviteMember(member_obj.id);
};

function autocompleteSkills() {
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
    //debugger;
    flashTeamsJSON["members"][indexOfJSON].category1 = $("#member" + popId + "_category1")[0].value;
    flashTeamsJSON["members"][indexOfJSON].category2 = $("#member" + popId + "_category2")[0].value;

    var newColor = $("#color_" + popId).spectrum("get").toHexString();
    updateMemberPillColor(newColor, popId);
    renderMemberPillColor(popId);
    //updateMemberPopover(popId);
    //ALEXANDRA: START HERE

    $("#mPill_" + popId).popover("hide");
};

//Delete team member from team list, JSON, diagram, and events
function deleteMember(pillId) {
    //Remove Member from JSON
    var indexOfJSON = getMemberJSONIndex(pillId);
    var memName = flashTeamsJSON["members"][indexOfJSON].role;
    flashTeamsJSON["members"].splice(indexOfJSON, 1);

    $("#mPill_" + pillId).popover("destroy");
    $("#mPill_" + pillId).remove();

    //REMOVE THE CIRCLES
    removeMemberNode(pillId);

    //Remove member from events, iterate over events looking for role/name
    for (i = 0; i < flashTeamsJSON["events"].length; i++) {
        for (j = 0; j < flashTeamsJSON["events"][i].members.length; j++) {
            if (flashTeamsJSON["events"][i].members.length == 0) { 
                return;
            } else if (flashTeamsJSON["events"][i].members[j].name == memName) {
                var eventId = flashTeamsJSON["events"][i].id;
                flashTeamsJSON["events"][indexOfJSON].members.splice(j, 1);
                $("#event_" + eventId + "_eventMemLine_" + pillId).remove();
            }
        }
    }
};

function inviteMember(pillId) {
    var flash_team_id = $("#flash_team_id").val();
    var url = '/members/' + flash_team_id + '/invite';
    var data = {uniq: flashTeamsJSON["members"][pillId-1].uniq};
    $.get(url, data, function(data){
        flashTeamsJSON["members"][pillId-1].uniq = data["uniq"];
        flashTeamsJSON["members"][pillId-1].invitation_link = data["url"];
        updateStatus(false);

        // display pills, popovers, and diagram
        renderMembersRequester();
    });
};

function renderMemberPillColor(memberId) {
    var indexOfJSON = getMemberJSONIndex(memberId);
    var color = flashTeamsJSON["members"][indexOfJSON].color;

    var pillLi = document.getElementById("mPill_" + memberId);
    pillLi.childNodes[0].style.backgroundColor = color;
};

//Takes the new color, turns into hex and changes background color of a pill list item
function updateMemberPillColor(color, memberId) {
    var indexOfJSON = getMemberJSONIndex(memberId);
    flashTeamsJSON["members"][indexOfJSON].color = color;

    updateStatus(false);

    // Update JSON for team diagram
    //workers.nodes[searchById(workers.nodes, memberId)].color = color;
    //updateNodeColor();
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
        color: "#08c",
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
    for (var i = 0; i < flashTeamsJSON["members"].length; i++) {
        if (flashTeamsJSON["members"][i].id == idNum) return i; 
    }
    return null;
};

function getMemberById(id) {
    var idx = getMemberJSONIndex(id);
    if(idx){
        return flashTeamsJSON["members"][idx];
    }
    return null;
};

function searchById (arr, id) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i].id == id) {
            return i;
        }
    }
};

$(document).ready(function() {
    pressEnterKeyToSubmit("#addMemberInput", "#addMemberButton");
});

//Populate the autocomplete function for the event members
//TO BE DELETED, WILL BE CHANGING TO A CHECKBOX SYSTEM
function addMemAuto() {
    var memberArray = new Array(flashTeamsJSON["members"].length);
    for (i = 0; i < flashTeamsJSON["members"].length; i++) {
        memberArray[i] = flashTeamsJSON["members"][i].role;
    }

    $(".eventMemberInput").each(function() {
        $(this).autocomplete({
            source: memberArray
        });
    })
};