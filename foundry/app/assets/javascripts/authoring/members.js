/* Members.js
 * ---------------------------------
 *
 */

 var pillCounter = 0;
 var colorToChange = "#ff0000";
 var current = undefined;
 var isUser = false;

 $(document).ready(function() {
    pressEnterKeyToSubmit("#addMemberInput", "#addMemberButton");
 });

 function renderMembersRequester() {
    var members = flashTeamsJSON.members;
    renderPills(members);
    renderMemberPopovers(members);
    renderDiagram(members);
    renderAllMemberLines();
};

function renderMembersUser() {
    var members = flashTeamsJSON.members;
    renderAllMemberLines();
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
                current = flash_team_members[i].id;
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
        $("#memberPills").append('<li class="active pill' + member_id + '" id="mPill_' + member_id + '""><a>' + member_name 
            + '<div class="close" onclick="deleteMember(' + member_id + '); updateStatus(false);">  X</div></a></li>');
        renderMemberPillColor(member_id);
    }
};

function renderMemberPopovers(members) {
    var len = members.length;
    for (var i=0;i<len;i++){
        var member = members[i];
        var member_id = member.id;
        console.log("RENDERING POPOVER FOR MEMBER " + member_id);
        var member_name = member.role;
        var invitation_link = member.invitation_link;

        var content = '<form name="memberForm_' + member_id + '>'
        +'<div class="mForm_' + member_id + '">'
        +'<div class="input-append" > ' 
        +'<select class="category1Input" id="member' + member_id + '_category1">';

        var newColor = "'"+member.color+"'";

        var category1 = member.category1;
        var category2 = member.category2;

        //alert("render1");

        // add the drop-down for two-tiered oDesk job posting categories on popover
        for (var key in oDeskCategories) {
            console.log("category1");
            var option = document.createElement("option");
            if(key == category1){
                content += '<option value="' + key + '" selected>' + key + '</option>';
            } else {
                content += '<option value="' + key + '">' + key + '</option>';
            }
        }

        //alert("render2");

        //reload or build category2 based on previously selected category 1
        content += '</select>';

        if (category1 == "--oDesk Category--" || category1 == ""){
            content += '<br><br><select class="category2Input" id="member' + member_id + '_category2" disabled="disabled">--oDesk Sub-Category--</select>';
        } else{

            content += '<br><br><select class="category2Input" id="member' + member_id + '_category2">'
            for (var j=0; j<oDeskCategories[category1].length; j++) {
                console.log("category2");
                var key2 = oDeskCategories[category1][j];

                var option = document.createElement("option");
                if(key2 == category2){
                    content += '<option value="' + key2 + '" selected>' + key2 + '</option>';
                }
                else
                    content += '<option value="' + key2 + '">' + key2 + '</option>';
            }
            content += '</select>';
        }

        content += '<br><br><input class="skillInput" id="addSkillInput_' + member_id + '" type="text" data-provide="typeahead" placeholder="New oDesk Skill" />'
        +'<button class="btn" type="button" class="addSkillButton" id="addSkillButton_' + member_id + '" onclick="addSkill(' + member_id + ');">+</button>'
        +'</div>'
        +'<br>Skills:'  
        +'<ul class="nav nav-pills" id="skillPills_' + member_id + '">';

        //alert("render3");

        var skills_len = member.skills.length;
        for(var j=0;j<skills_len;j++){
            var memberSkillNumber = j+1;
            var skillName = member.skills[j];
            content+='<li class="active" id="sPill_mem' + member_id + '_skill' + memberSkillNumber + '"><a>' + skillName 
            + '<div class="close" onclick="deleteSkill(' + member_id + ', ' + memberSkillNumber + ', &#39' + skillName + '&#39)">  X</div></a></li>';
        }

        //alert("render4");

        content +='</ul>'
        +'Member Color: <input type="text" class="full-spectrum" id="color_' + member_id + '"/>'
        +'<p><script type="text/javascript"> initializeColorPicker(' + newColor +'); </script></p>'
        +'<p><button type="button" onclick="deleteMember(' + member_id + ');">Delete</button>     '
        +'<button type="button" onclick="saveMemberInfo(' + member_id + '); updateStatus();">Save</button><br><br>'
        + 'Invitation link: <a id="invitation_link_' + member_id + '" href="' + invitation_link + '" target="_blank">'
        + invitation_link
        + '</a>'
        +'</p></form>' 
        +'</div>';

        //console.log("destroying popover: " + member_id);
        $("#mPill_" + member_id).popover('destroy');

        $("#mPill_" + member_id).popover({
            placement: "right",
            html: "true",
            class: "member",
            id: '"memberPopover' + member_id + '"',
            trigger: "click",
            title: '<b>' + member_name + '</b>',
            content:  content,
            container: $("#member-container"),
            callback: function(){
               $(".skillInput").each(function () {
                $(this).typeahead({source: oSkills})
            });  
           }
       });

        $("#mPill_" + member_id).off('click', generateMemberPillClickHandlerFunction(member_id));
        $("#mPill_" + member_id).on('click', generateMemberPillClickHandlerFunction(member_id));

        // append oDesk Skills input to popover
        $(document).ready(function() {
            pressEnterKeyToSubmit("#addSkillInput_" + member_id, "#addSkillButton_" + member_id);
        });
    }
};

function generateMemberPillClickHandlerFunction(mem_id) {
    return function() {
        memberPillClick(mem_id);
    };
}

function generateMemberCategoryChangeFunction(mem_id) {
    return function() {
        memberCategoryChange(mem_id);
    }
}

function memberPillClick(mem_id) {
    $("#member" + mem_id + "_category1").off('change', generateMemberCategoryChangeFunction(mem_id));
    $("#member" + mem_id + "_category1").on('change', generateMemberCategoryChangeFunction(mem_id));
}

function memberCategoryChange(mem_id) {
    if ($("#member" + mem_id + "_category1").value === "--oDesk Category--") {
        $("#member" + mem_id + "_category2").attr("disabled", "disabled");
    } else {
        $("#member" + mem_id + "_category2").removeAttr("disabled");
        $("#member" + mem_id + "_category2").empty();

        var category1Select = document.getElementById("member" + mem_id + "_category1");
        var category1Name = category1Select.options[category1Select.selectedIndex].value;

        for (var j = 0; j < oDeskCategories[category1Name].length; j++) {
            var option = document.createElement("option");
            $("#member" + mem_id + "_category2").append("<option>" + oDeskCategories[category1Name][j] + "</option>");
        }
    }
}

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

    //alert("yo2");

    // clear input
    $("#addMemberInput").val(this.placeholder);

    //alert("yo3");

    // add member to json
    var members = flashTeamsJSON.members;
    var member_obj = newMemberObject(member_name);
    members.push(member_obj);

    //alert("yo4");

    //update event popovers to show the new member
    var events = flashTeamsJSON.events;
    for(var i=0;i<events.length;i++){
       drawPopover(events[i], true, false);
    }

   //alert("a");
   renderPills(members);
   //alert("b");
   renderMemberPopovers(members);
   //alert("c");

   updateStatus(false);

   //alert("d");
   inviteMember(member_obj.id);
   //alert("e");
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
    for (var i = 0; i < flashTeamsJSON["members"][indexOfJSON].skills.length; i++) {
        if (flashTeamsJSON["members"][indexOfJSON].skills[i] == skillName) {
            flashTeamsJSON["members"][indexOfJSON].skills.splice(i, 1);
            break;
        }
    }
};

//Saves info and updates popover, no need to update JSON, done by individual item elsewhere
function saveMemberInfo(popId) {
    var indexOfJSON = getMemberJSONIndex(popId);
    //flashTeamsJSON["members"][indexOfJSON].category1 = $("#member" + popId + "_category1").value;
    //flashTeamsJSON["members"][indexOfJSON].category2 = $("#member" + popId + "_category2").value;

    flashTeamsJSON["members"][indexOfJSON].category1 = document.getElementById("member" + popId + "_category1").value;
    flashTeamsJSON["members"][indexOfJSON].category2 = document.getElementById("member" + popId + "_category2").value;

    var newColor = $("#color_" + popId).spectrum("get").toHexString();

    updateMemberPillColor(newColor, popId);
    renderMemberPillColor(popId);
    //updateMemberPopover(popId);

    console.log($("#mPill_"+popId).popover("show"));
    $("#mPill_" + popId).popover("hide");
    renderAllMemberLines();
    renderMemberPopovers(flashTeamsJSON["members"]);
};

//Delete team member from team list, JSON, diagram, and events
function deleteMember(pillId) {
    // remove from members array
    var indexOfJSON = getMemberJSONIndex(pillId);
    var members = flashTeamsJSON["members"];
    var memberId = members[indexOfJSON].id;
    console.log("deleting member " + memberId);
    console.log($("#mPill_" + memberId));
    $("#mPill_" + memberId).popover('destroy');

    members.splice(indexOfJSON, 1);
    renderPills(members);
    renderMemberPopovers(members);

    // remove from members array with event object
    for(var i=0; i<flashTeamsJSON["events"].length; i++){
        var ev = flashTeamsJSON["events"][i];
        var member_event_index = ev.members.indexOf(memberId);
        
        // remove member
        if(member_event_index != -1){ // found member in the event
            removeAllMemberLines(ev);
            ev.members.splice(member_event_index,1);
            drawEvent(ev,false);
        }

        //remove dri if the member was a dri
        if (ev.dri == String(memberId)){
            ev.dri = "";
        }
    }

    // update event popovers
    drawAllPopovers();

    updateStatus(false);
};

function inviteMember(pillId) {
    var flash_team_id = $("#flash_team_id").val();
    var url = '/members/' + flash_team_id + '/invite';
    var indexOfJSON = getMemberJSONIndex(pillId);
    var data = {uniq: flashTeamsJSON["members"][indexOfJSON].uniq};
    $.get(url, data, function(data){
        console.log("INVITED MEMBER, NOT RERENDERING MEMBER POPOVER");
        var members = flashTeamsJSON["members"];
        members[indexOfJSON].uniq = data["uniq"];
        members[indexOfJSON].invitation_link = data["url"];

        renderMemberPopovers(members);
        updateStatus(false);
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
};

//Draws the color picker on a member popover
function initializeColorPicker(newColor) {

    $(".full-spectrum").spectrum({
        showPaletteOnly: true,
        showPalette: true,
        color: newColor,
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
        if (parseInt(flashTeamsJSON["members"][i].id) == parseInt(idNum)) return i; 
    }
    return -1;
};

function getMemberById(id) {
    var idx = getMemberJSONIndex(id);
    if(idx != -1){
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