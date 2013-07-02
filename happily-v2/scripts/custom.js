function ShowErrorMessage(message) {
    $("<div class='ui-loader ui-overlay-shadow ui-body-b ui-corner-all'><h1 style='font-size: 12px; color: red;'>" + message + "</h1></div>")
.css({ "display": "block", "opacity": 0.96, "top": $(window).scrollTop() + 100 })
.appendTo($.mobile.pageContainer)
.delay(800)
.fadeOut(400, function () {
    $(this).remove();
});
}

function ShowSuccessMessage(message) {
    $("<div class='ui-loader ui-overlay-shadow ui-body-b ui-corner-all'><h1 style='font-size: 12px; color: green;'>" + message + "</h1></div>")
.css({ "display": "block", "opacity": 0.96, "top": $(window).scrollTop() + 100 })
.appendTo($.mobile.pageContainer)
.delay(800)
.fadeOut(400, function () {
    $(this).remove();
});
}

function AddRecursion() {
    $(".ui-dialog").dialog("close");
}

function GenerateTodaysLog() {
    var Log = localStorage.Log;
    if (Log != undefined && Log != "") {       
        var AllRows = Log.split("_|_");
        var strRow = "";
        for (i = 0; i < AllRows.length - 1; i++) {
            var crntRow = AllRows[i].split("|-|");
            strRow += '<tr><td style="width: 90%;">' + crntRow[0] + ' <span style="font-weight: bold;">' + crntRow[1] + '</span></td><td><a href="recursive.html" data-rel="dialog" ><img src="images/refresh-icon.png" /></a></td><td><img src="images/edit-icon.png" onclick=ToEdit("' + encodeURIComponent(AllRows[i]) + '"); /></td><td><img src="images/delete.png" onclick=ToDelete("' + encodeURIComponent(AllRows[i]) + '"); id="opendialog" /></td></tr>';
            strRow += '<tr><td colspan="4"> <div style="border-bottom: 1px solid gray;"></div></td></tr>';         
        }
        $("#tblLogs").empty();
        $("#tblLogs").html(strRow).show();
       
    }
    else {
       
        $("#tblLogs").before('<tr><td colspan=4><div id="empty2" class="center" style="color: red;">No activites added today</div></tr>');
        $("#tblLogs").hide();
       
    }
}

function GenerateWeeklyLog() {
    var Log = localStorage.WeeklyLog;
    if (Log != undefined && Log !="") {
        var AllRows = Log.split("_|_");
        var strRow = "";
        for (i = 0; i < AllRows.length - 1; i++) {
            var crntRow = AllRows[i].split("|-|");        
            strRow += '<tr><td style="width: 90%;">' + crntRow[0] + ' <span style="font-weight: bold;">' + crntRow[1] + '</span></td><td><a href="recursive.html" data-rel="dialog" ><img src="images/refresh-icon.png" /></a></td></td><td><img src="images/delete.png" onclick=ToDelete("' + encodeURIComponent(AllRows[i]) + '"); id="opendialog" /></td></tr>';
            strRow += '<tr><td colspan="4"> <div style="border-bottom: 1px solid gray;"></div></td></tr>';
        }
        $("#tblLogs").html(strRow);
        
    }
    else {
        $("#tblLogs").html('<tr><td colspan=4><div id="empty" class="center" style="color: red;">No weekly log found</div></td></tr>');
    }
}
function ToDelete(Rec) {
    Rec = decodeURIComponent(Rec);
    sessionStorage.ToDelete = Rec+"_|_";
}
function ToEdit(Rec) {
    Rec = decodeURIComponent(Rec);
    sessionStorage.ToEdit = Rec + "_|_";
    window.location.href = "activity.html";
}
function CalcHappiness() {
        
    var Log = localStorage.Log;
    if (Log != undefined && Log!="") {
        var AllRows = Log.split("_|_");
        var Level = 0;
        for (i = 0; i < AllRows.length - 1; i++) {
            var crntRow = AllRows[i].split("|-|");
            Level = Level + parseFloat(crntRow[1]);
        }
        var Recs = AllRows.length - 1;
        var Avg = parseFloat(Level / Recs);
        $("#slider-1").val(Avg.toFixed(2)).slider('refresh');
        $("#slider-1").hide();
        $("#level").html(Avg.toFixed(2) + " (" + HappinessLevel(Avg.toFixed(2)) + ")");
        
        
        $("#graphHappiness").html(Avg.toFixed(2) + "(" + HappinessLevel(Avg.toFixed(2))+")");
    }
    else {
        $("#imgactivity").before('<div class="center" style="color: red;">No activites added</div>');
        $("#imgactivity").hide();
        $("#slider-1").hide();
    }
    
}
function CalcWeeklyHappiness() {

    var Log = localStorage.WeeklyLog;;
    if (Log != undefined && Log != "") {
        var AllRows = Log.split("_|_");
        var Level = 0;
        for (i = 0; i < AllRows.length - 1; i++) {
            var crntRow = AllRows[i].split("|-|");
            Level = Level + parseFloat(crntRow[1]);
        }
        var Recs = AllRows.length - 1;
        var Avg = parseFloat(Level / Recs);
        $("#slider-2").val(Avg.toFixed(2)).slider('refresh');
        $("#slider-2").hide();
        
        $("#weeklylevel").html(Avg.toFixed(2));

        $("#graphHappiness").html(Avg.toFixed(2));
    }
    else {
        $("#noweekly").show();        
        $("#slider-2").hide();
    }

}

function GenerateRecommendation() {
    var Log = localStorage.Log;
    if (Log != undefined && Log != "") {
        var AllRows = Log.split("_|_");
        var strRow = "" ,r1="",r2="";       
        var crntRow = AllRows[0].split("|-|");
        var crntRow2 = AllRows[1].split("|-|");
            r1 = crntRow[0];
            r2 = crntRow2[0];
            r3 = "Swimming";
            r4 = "Hiking";
            r5 = "The gym";
            r6 = "Hunting";
            if (r2 == undefined || r2=="")
                r2 = "Swimming";
            if (r1 == undefined || r1 == "")
                r1 = "Biking";
          

            sessionStorage.recommend1 = r1;
            sessionStorage.recommend2 = r2;
            sessionStorage.recommend3 = r3;
            sessionStorage.recommend4 = r4;
            sessionStorage.recommend5 = r5;
            sessionStorage.recommend6 = r6;
        
            $("#recommend").html('Your happiness level could be better. You like <a href="recommend1.html" data-ajax="false">' + r1 + '</a>. Your friends who  like ' + r1 + ' also like <br/>1. <a data-ajax="false" href="recommend3.html">' + r3 + '</a><br/>2. <a data-ajax="false" href="recommend4.html">' + r4 + '</a><br/>3. <a data-ajax="false" href="recommend5.html">' + r5 + '</a><br/>4. <a data-ajax="false" href="recommend6.html">' + r6 + '</a>');
    }
    else {
        $("#recommend").html('Your happiness level could be better. Add some activites.');
        $("#tblLogs").before('<div class="center" style="color: red;">No activites added yet</div>');
        sessionStorage.recommend1 = "Biking";
        sessionStorage.recommend2 = "Swimming";
        $("#tblLogs").hide();
    }
}

function NewActivity() {

    $(".ui-link").trigger('click');
}

function ddlActivityOnChange() {
    if($("#select-choice-1").val()=="new")
        $(".ui-link").trigger('click');

}

function GetLog()
{
    if ($("#select-choice-1").val() == "weekly")
        GenerateWeeklyLog();
    else
        GenerateTodaysLog();

}

function AddFriend(Name) {
    if (localStorage.Friends != undefined && localStorage.Friends != "") {
        if (localStorage.Friends.indexOf(Name) >= 0) {
            ShowErrorMessage("Friend already added");
            return;
        }
       
    }
    var tempArray = Name + "_|_";
    if (localStorage.Friends != undefined && localStorage.Friends != "")
        localStorage.Friends = localStorage.Friends + tempArray;
    else
        localStorage.Friends = tempArray;
   
    ShowSuccessMessage("Friends Added Succesffully");
    LoadFriends();
       
}

function LoadFriends() {    
    if (localStorage.Friends != undefined && localStorage.Friends != "") {
        var temp = localStorage.Friends.split('_|_');
        var str = "";
        for (i = 0; i < temp.length - 1; i++) {
            str += '<li data-icon="false" style="height: 35px;"><a href="#">' + temp[i] + '<span style="margin-left: 10px;font-size: 10px;" onclick=GetActivity("' + temp[i] + '"); data-ajax="false"><img src="images/btn1.png" /></span>&nbsp;&nbsp;<span onclick=Unfriend("' + temp[i] + '"); ><img src="images/unfriend.png"></span></a></li>';

        }
        $("#lstFriends").html(str).listview('refresh');
    }
    else {
        var str = "<div style='color: red;margin-left: 10px;'>No friend(s) added</div>";
        $("#lstFriends").html(str).listview('refresh');
    }
}

function SearchFriends() {

    var search = $("#txtFName").val().toUpperCase();
    $("div[name$='tempDiv']").each(function () {
        var email = $(this).attr('email').toUpperCase();
       
        if (email.indexOf(search) == -1)
            $(this).hide();
        else
            $(this).show();
    });
}

function GetActivity(Name) {
    sessionStorage.ActiveName = Name;
    location.href = "friends-activity.html";
}

function Unfriend(Name) {
    ShowSuccessMessage("Unfriend Successfully");
    localStorage.Friends = localStorage.Friends.replace(Name + "_|_", "");
    LoadFriends();
}

function HappinessLevel(lval) {

    if (lval >= 0 && lval <= 1) {
        return "Depressed";
    }
    if (lval >= 1 && lval <= 2) {
        return "Upset";
    }
    if (lval >= 2 && lval <= 3) {
        return "Not happy";
    }
    if (lval >= 3 && lval <= 4) {
        return "Partially Happy";
    }
    if (lval >= 4 && lval <= 5) {
        return "Somehow happy";
    }
    if (lval >= 5 && lval <= 6) {
        return "Bit Happy";
    }
    if (lval >= 6 && lval <= 7) {
        return "Happy";
    }
    if (lval >= 7 && lval <= 8) {
        return "Happy";
    }
    if (lval >= 8 && lval <= 9) {
        return "Very Happy";
    }
    if (lval >= 9 && lval <= 10) {
        return "Extremely happy";
    }
}