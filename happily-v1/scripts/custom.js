function ShowErrorMessage(message) {
    $("<div class='ui-loader ui-overlay-shadow ui-body-b ui-corner-all'><h1 style='font-size: 12px; color: red;'>" + message + "</h1></div>")
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

function GenerateLog() {
    var Log = localStorage.Log;
    if (Log != undefined && Log !="") {
        var AllRows = Log.split("_|_");
        var strRow = "";
        for (i = 0; i < AllRows.length - 1; i++) {
            var crntRow = AllRows[i].split("|-|");        
            strRow += '<tr><td style="width: 90%;">' + crntRow[0] + ' <span style="font-weight: bold;">' + crntRow[1] + '</span></td><td><a href="recursive.html" data-rel="dialog" ><img src="images/refresh-icon.png" /></a></td><td><img src="images/edit-icon.png" onclick=ToEdit("' + encodeURIComponent(AllRows[i]) + '"); /></td><td><img src="images/delete.png" onclick=ToDelete("' + encodeURIComponent(AllRows[i]) + '"); id="opendialog" /></td></tr>';
            strRow += '<tr><td colspan="4"> <div style="border-bottom: 1px solid gray;"></div></td></tr>';
        }
        $("#tblLogs").html(strRow);
    }
    else {
        $("#tblLogs").before('<div class="center" style="color: red;">No activites added yet</div>');
        $("#tblLogs").hide();
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
        $("#level").html(Avg.toFixed(2));
        $("#graphHappiness").html(Avg.toFixed(2));
    }
    else {
        $("#imgactivity").before('<div class="center" style="color: red;">No activites added</div>');
        $("#imgactivity").hide();
        $("#slider-1").hide();
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
            
            if (r2 == undefined || r2=="")
                r2 = "Swimming";
            if (r1 == undefined || r1 == "")
                r1 = "Biking";
          

            sessionStorage.recommend1 = r1;
            sessionStorage.recommend2 = r2;
        
            $("#recommend").html('Your happiness level could be better. You like <a href="recommend1.html" data-ajax="false">' + r1 + '</a>. People who like '+r1+' also like <a data-ajax="false" href="recommend2.html">' + r2 + '</a>');
    }
    else {
        $("#recommend").html('Your happiness level could be better. Add some activites.');
        $("#tblLogs").before('<div class="center" style="color: red;">No activites added yet</div>');
        sessionStorage.recommend1 = "Biking";
        sessionStorage.recommend2 = "Swimming";
        $("#tblLogs").hide();
    }
}