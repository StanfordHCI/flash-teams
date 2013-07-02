<?php
    require_once('config.php');
    require_once('et_db.php');
                              
    //$_SESSION['userid'] = 15;
    
    $dbObj = new etdb($sDbUser, $sDbPwd, $sDbName, $sDbHost);
    $data = $_POST;
    if(isset($_POST['action']) == 'submit')
    {
         $dbObj->insert( 'tbl_events', array(
                        'Event_ID' => 0, 
                        'Event_name' => $data['event_name'],
                        'Event_Details' => $data['event_details'], 
                        'Event_pic' => $_FILES["file"]["name"],
                        'Event_place' => $data['event_place'],
                        'Event_From' => $data['event_from'].' 00:00:00',
                        'Event_To' => $data['event_to'].' 00:00:00',
                        'Created_By' => $data['created_by'],
                        'Created_Date' => date('Y-m-d H:i:s')
                        ));
         upload_image();
		  header("location: index.php");
    }
    function upload_image()
    {
        if($_FILES["file"]["name"] == "") return;
        $allowedExts = array("gif", "jpeg", "jpg", "png");
        $tmp = explode(".", $_FILES["file"]["name"]);
        $extension = end($tmp);
        if ((($_FILES["file"]["type"] == "image/gif")
        || ($_FILES["file"]["type"] == "image/jpeg")
        || ($_FILES["file"]["type"] == "image/jpg")
        || ($_FILES["file"]["type"] == "image/pjpeg")
        || ($_FILES["file"]["type"] == "image/x-png")
        || ($_FILES["file"]["type"] == "image/png"))
        && ($_FILES["file"]["size"] < 1048576)
        && in_array($extension, $allowedExts))
          {
          if ($_FILES["file"]["error"] > 0)
            {
            echo "Return Code: " . $_FILES["file"]["error"] . "<br>";
            }
          else
            {
              move_uploaded_file($_FILES["file"]["tmp_name"],"event_pics/" . $_FILES["file"]["name"]);
            }
          }
        else
          {
          echo "Invalid file";
          }
    }
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title></title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- Le styles -->
    <link href="css/bootstrap.css" rel="stylesheet">
    <style type="text/css">
      body {
        padding-top: 60px;
        padding-bottom: 40px;
      }
      
      .bgcolor {
        background-color: none;
      }      
      
      .lightblue {
       background-color: none;
      }
      
    </style>
    <link href="css/bootstrap-responsive.css" rel="stylesheet">
    <link href="css/bootstrap.min.css" rel="stylesheet">
    <link href="css/bootstrap-timepicker.min.css" rel="stylesheet">

    <!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
      <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->

    <!-- Le fav and touch icons -->
    <link rel="shortcut icon" href="../assets/ico/favicon.ico">
    <link rel="apple-touch-icon-precomposed" sizes="144x144" href="../assets/ico/apple-touch-icon-144-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="../assets/ico/apple-touch-icon-114-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="../assets/ico/apple-touch-icon-72-precomposed.png">
    <link rel="apple-touch-icon-precomposed" href="../assets/ico/apple-touch-icon-57-precomposed.png">
    
    <link rel="stylesheet" type="text/css" media="all" href="css/jsDatePick_ltr.min.css" />
    <script type="text/javascript" src="http://maps.google.com/maps/api/js?v=3&sensor=false&language=en"></script>
    
    <script type="text/javascript" src="js/jquery-1.8.0.min.js"></script> 
    <script type="text/javascript" src="js/jsDatePick.min.1.3.js"></script>
    
    <script type="text/javascript" src="js/bootstrap.min.js"></script>  
    <script type="text/javascript">
        $(document).ready(function () {
             $("#head").html("Near By " + sessionStorage.recommend1 + " activities that you could join");
             new JsDatePick({
                useMode:2,
                target:"event_from",
                dateFormat:"%Y-%m-%d"
            });
            new JsDatePick({
                useMode:2,
                target:"event_to",
                dateFormat:"%Y-%m-%d"
            });
         });
         var map;         
         function addMarker(location) {
             marker = new google.maps.Marker({
                 position: location,
                 map: map, animation: google.maps.Animation.DROP,
                 iconURL: "images/marker1.png"
             });
             // google.maps.event.addListener(marker, 'click', (function (marker, i) { return function () { infowindow.setContent("Your current location"); infowindow.open(map, marker); } })(marker, i));

         }

         function initialize() {             
             var locations = [['Event on 01 May 2013 at<br/><a href="#" data-transition="fade">7964 Veree Rd philadelphia</a>', 40.072448, -75.076527, 183]];
             map = new google.maps.Map(document.getElementById('map'), {
                 zoom: 10,
                 center: new google.maps.LatLng(40.072448, -75.076527, 151.25), mapTypeId: google.maps.MapTypeId.ROADMAP
             });
             var infowindow = new google.maps.InfoWindow();
             var marker, i;
             var iconURL;
             var pinColor;
             for (i = 0; i < locations.length; i++) {

                 switch (i) {
                     case 0:
                         iconURL = "img/marker1.png";
                         break;                  


                 }
                 var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor
                               );

                 marker = new google.maps.Marker({
                     position: new google.maps.LatLng(locations[i][1], locations[i][2]),
                     map: map, animation: google.maps.Animation.DROP,
                     icon: iconURL
                 });

                 google.maps.event.addListener(marker, 'click', (function (marker, i) { return function () { infowindow.setContent(locations[i][0]); infowindow.open(map, marker); } })(marker, i));


             }

         }
         function validateForm()
        {
            var x=document.forms["myForm"];
            if (x.event_name.value=="")
              {
                  alert("Event Name must be filled out");
                  return false;
              }
              if (x.event_from.value=="")
              {
                  alert("Event Start Date must be filled out");
                  return false;
              }
              if (x.event_to.value=="")
              {
                  alert("Event End Date must be filled out");
                  return false;
              }
              return true;  
        }
</script>

  </head>

  <body onLoad="initialize();">

    
 <?php include("includes/nav.inc.php");?>
    
    <div class="container-fluid">
     
      <hr>
      <div style="text-align: center; font-size: 20px;">New Event</div>
      <br/>      
      <div>
        <center> 
        <form name="myForm" method="post" enctype="multipart/form-data" onsubmit="return validateForm();">
        <input type="hidden" name="event_id" value=""/>
        <input type="hidden" name="created_by" value="<?=$_SESSION['userid']?>"/>
        <input type="hidden" name="action" value="submit"/>
        <table cellpadding="5" cellspacing="5" width="50%">
        <tr>
            <td colspan="2"><input type="text" name="event_name" value="" style="width:98%;"/></td>
        </tr>
        <tr>
            <td colspan="2"><textarea name="event_details" rows="5" style="width:98%;"></textarea></td>
        </tr>
        <tr>
            <td colspan="2">
                <input type="file" name="file" id="file"/>
            </td>
        </tr>
        <tr>
            <td width="50%" align="left"><div style="width:98%;border-bottom: 2px solid #cccccc;">When</div></td>
            <td align="left"><div style="width:98%;border-bottom: 2px solid #cccccc;">Where</div></td>
        </tr>
        <tr valign="top">
            <td align="left">
                <table cellpadding="3" cellspacing="3" width="100%">
                <tr>
                    <td width="10%" align="right">From</td>
                    <td align="center">
                        <table cellpadding="2" cellspacing="2" width="100%">
                        <tr>
                            <td align="center"><input type="text" name="event_from" id="event_from" style="width:150px;"/></td>
                            <td align="center">
                                  <input type="text" name="time_from" id="event_from" style="width:80px;" value="07:00 PM"/>
                            </td>
                        </tr>
                        </table>
                    </td>
                </tr>
                <tr>                        
                    <td align="right">To</td>
                    <td align="center">
                        <table cellpadding="2" cellspacing="2" width="100%">
                        <tr>
                            <td align="center"><input type="text" size="12" name="event_to" id="event_to" style="width:150px;"/></td>
                            <td align="center">
                                 <input type="text" name="time_to" id="event_from" style="width:80px;" value="07:00 PM"/>
                            </td>
                        </tr>
                        </table>
                    </td>
                </tr>
                </table> 
            </td>
            <td align="left">
                 <input type="text" name="event_place" id="event_place" style="width:60%;"/>
                 <div id="map" style="height: 300px; border: solid 1px #ccc;""></div>
            </td>
        </tr>  
        <tr>
            <td colspan="2" align="center">
                <input type="submit" value="Submit"/>&nbsp;&nbsp;<input type="reset" value="Reset"/>
            </td>
        </tr>   
        </table>
        </center>
     </div>    
     <?php include("includes/footer.inc.php");?>
    </div><!--/.fluid-container-->
    

    <!-- Le javascript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
    <script src="js/jquery-1.8.0.min.js"></script>
    <script src="js/bootstrap.js"></script>
  </body>
</html>
