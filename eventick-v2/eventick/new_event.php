<?php
    require_once('config.php');
    require_once('et_db.php');
          session_start();                       
    //$_SESSION['userid'] = 15;
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
    
    $dbObj = new etdb($sDbUser, $sDbPwd, $sDbName, $sDbHost);
    $data = $_POST;
    $id = 0;
    if(isset($_GET['id']))
         $id = $_GET['id'];
    if(isset($_POST['action']) == 'submit')
    {
        if($id == 0)
        {
             $dbObj->insert( 'tbl_events', array(
                            'Event_ID' => 0, 
                            'Event_name' => $data['event_name'],
                            'Event_Details' => $data['event_details'], 
                            'Event_pic' => (isset($_FILES["file"]["name"]))? $_FILES["file"]["name"]: $data['event_pic'],
                            'Event_place' => $data['event_place'],
                            'Event_From' => $data['event_from'].' '.$data['time_from'],
                            'Event_To' => $data['event_to'].' '.$data['time_to'],
                            'Created_By' => $data['created_by'],
                            'Created_Date' => date('Y-m-d H:i:s')
                            ));
        }
        else
        {
            $dbObj->query( $dbObj->prepare("UPDATE tbl_events SET 
                Event_name = %s, 
                Event_Details = %s, 
                Event_pic = %s,
                Event_place = %s,
                Event_From = %s,  
                Event_To = %s    
                WHERE Event_ID = %d", $data['event_name'],
                                    $data['event_details'], 
                                    (isset($_FILES["file"]["name"]))? $_FILES["file"]["name"]: $data['event_pic'], 
                                    $data['event_place'],
                                    $data['event_from'].' '.$data['time_from'],
                                    $data['event_to'].' '.$data['time_to'],
                                     $id) );
        }
         upload_image();
		  header("location: index.php");
    }
    $data  = $dbObj->get_row("select * from tbl_events where Event_ID = ".$id);
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
   
    <!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
      <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
   <link rel="stylesheet" href="http://code.jquery.com/ui/1.10.2/themes/smoothness/jquery-ui.css" />
  <script src="http://code.jquery.com/jquery-1.9.1.js"></script>
  <script src="http://code.jquery.com/ui/1.10.2/jquery-ui.js"></script>
  
    <!-- Le fav and touch icons -->
    <link rel="shortcut icon" href="../assets/ico/favicon.ico">
    <link rel="apple-touch-icon-precomposed" sizes="144x144" href="../assets/ico/apple-touch-icon-144-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="../assets/ico/apple-touch-icon-114-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="../assets/ico/apple-touch-icon-72-precomposed.png">
    <link rel="apple-touch-icon-precomposed" href="../assets/ico/apple-touch-icon-57-precomposed.png">
    
    <link rel="stylesheet" type="text/css" media="all" href="css/jsDatePick_ltr.min.css" />
    <script type="text/javascript" src="http://maps.google.com/maps/api/js?v=3&sensor=false&language=en"></script>
    
    <link href="css/datepicker.css" rel="stylesheet">
   <script src="js/bootstrap.js"></script>
     <script src="js/bootstrap-datepicker.js"></script>

     <link type="text/css" href="css/bootstrap-timepicker.css" /> 
     <script src="js/bootstrap-timepicker.js"></script>
    <script type="text/javascript">
         $(document).ready(function()
        {
            $('.datepicker').datepicker()
                .on('changeDate', function(ev){
                $(".dropdown-menu").hide();  });
        });
        </script>
      <script type="text/javascript">
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
            var rgx = /(\d{4})-(\d{2})-(\d{2})/;
            if (x.event_name.value=="Enter Event Name...")
              {
                  alert("'Event Name' must be filled out");
                  return false;
              }
              if (x.event_from.value=="")
              {
                  alert("'Event Start' Date must be filled out");
                  return false;
              }
              /*if (!x.event_from.value.test(rgx))
              {
                  alert("'Event Start' Date format must be 'yyy-mm-dd'");
                  return false;
              }  */
              if (x.event_to.value=="")
              {
                  alert("'Event End' Date must be filled out");
                  return false;
              }
              if (x.event_place.value=="")
              {
                  alert("'Event Place' must be filled out");
                  return false;
              }
              return true;  
        }
        function setImageUrl()
        {
             var x=document.forms["myForm"];
             x.event_pic.value = x.file.value.substr(x.file.value.lastIndexOf("\\")+1);
        }
      </script>
      <script>
      $(function() {
        var availableTags = [
          "Alabama (AL)",
            "Alaska (AK)",
            "Arizona (AZ)",
            "Arkansas (AR)",
            "California (CA)",
            "Colorado (CO)",
            "Conneticut (CT)",
            "Deleware (DE)",
            "District of Columbia (DC)",
            "Florida (FL)",
            "Georgia (GA)",
            "Hawaii (HI)",
            "Idaho (ID)",
            "Illinois (IL)",
            "Indiana (IN)",
            "Iowa (IA)",
            "Kansas (KS)",
            "Kentucky (KY)",
            "Lousiana (LA)",
            "Maine (ME)",
            "Maryland (MD)",
            "Massachusetts (MA)",
            "Michigan (MI)",
            "Minnesota (MN)",
            "Mississippo (MS)",
            "Missouri (MO)",
            "Montana (MT)",
            "Nebraska (NE)",
            "Nevada (NV)",
            "New Hampshire (NH)",
            "New Jersey (NJ)",
            "New Mexico (NM)",
            "New York (NY)",
            "North Carolina (NC)",
            "North Dakota (ND)",
            "Ohio (OH)",
            "Oklahoma (OK)",
            "Oregon (OR)",
            "Pennsylvania (PA)",
            "Rhode Island (RI)",
            "South Carolina (SC)",
            "South Dakota (SD)",
            "Tennessee (TN)",
            "Texas (TX)",
            "Utah (UT)",
            "Vermont (VT)",
            "Virginia (VA)",
            "Washington (WA)",
            "West Virginia (WV)",
            "Wisconsin (WI)",
            "Wyoming (WY)"
        ];
        $( "#event_place" ).autocomplete({
          source: availableTags
        });
      });
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
        <input type="hidden" name="event_id" value="<?php echo $id;?>"/>
        <input type="hidden" name="created_by" value="<?=$_SESSION['userid']?>"/>
        <input type="hidden" name="action" value="submit"/>
        <table cellpadding="5" cellspacing="5" width="50%">
        <tr>
            <td colspan="2"><input type="text" name="event_name" value="<?php echo (isset($data))? $data->Event_name:'Enter Event Name...';?>" style="width:98%;" onFocus="this.value=(this.value=='Enter Event Name...')? '':this.value;" onBlur="this.value=(this.value=='')? 'Enter Event Name...':this.value;"/></td>
        </tr>
        <tr>
            <td colspan="2"><textarea name="event_details" rows="5" style="width:98%;" onFocus="this.value=(this.value=='Enter a Description...')? '':this.value;" onBlur="this.value=(this.value=='')? 'Enter a Description...':this.value;"><?php echo (isset($data))? $data->Event_Details:'Enter a Description...';?></textarea></td>
        </tr>
        <tr valign="top">
            <td colspan="2">
                <input type="hidden" name="event_pic" value="<?php echo (isset($data))? $data->Event_pic:'noimage.jpg';?>"/>
                <input type="file" name="file" id="file"/>
                <?php if ($id != 0){?>
                <img src="event_pics/<?php echo ($data->Event_pic != '')? $data->Event_pic:'noimage.jpg';?>" data-src="holder.js/200x180" alt="200x180" style="width: 200px; height: 180px;" />
                <?php }?>
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
                            <td align="center">
                                <div class="input-append date datepicker" id="dp3" data-date="Event From" data-date-format="yyyy-mm-dd">
                                  <input type="text" class="span2" name="event_from" value="<?php echo (isset($data))? substr($data->Event_From,0,10):'';?>" style="width:150px;" readonly="readonly"/>
                                  <span class="add-on"><i class="icon-th"></i></span>
                                </div>
                            </td>
                            <td align="center">
                            <div class="input-append bootstrap-timepicker">
                                <input name="time_from" id="time_from" type="text" class="input-small" style="width:80px;" value="<?php echo (isset($data))?  substr($data->Event_From,11):'';?>" readonly="readonly"/>
                                <span class="add-on"><i class="icon-time"></i></span>
                            </div>
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
                            <td align="center">
                                  <div class="input-append date datepicker" id="dp3" data-date="Event To" data-date-format="yyyy-mm-dd">
                                  <input type="text" class="span2" name="event_to" value="<?php echo (isset($data))? substr($data->Event_To,0,10):'';?>" style="width:150px;" readonly="readonly"/>
                                  <span class="add-on"><i class="icon-th"></i></span>
                                </div>
                            </td>
                            <td align="center">
                                 <div class="input-append bootstrap-timepicker">
                                    <input name="time_to" id="time_to" type="text" class="input-small" style="width:80px;" value="<?php echo (isset($data))? substr($data->Event_To,11):'';?>" readonly="readonly"/>
                                    <span class="add-on"><i class="icon-time"></i></span>
                                </div>
                            </td>
                        </tr>
                        </table>
                    </td>
                </tr>
                </table> 
            </td>
            <td align="left">
                <div class="ui-widget">
                    <input type="text" name="event_place" id="event_place" value="<?php echo (isset($data))? $data->Event_place:'';?>" style="width:60%;" />
                </div>
                 <div id="map" style="height: 300px; border: solid 1px #ccc;"></div> 
            </td>
        </tr>  
        <tr>
            <td colspan="2" align="center">
                <input type="submit" value="Submit" onClick="setImageUrl();"/>&nbsp;&nbsp;<input type="reset" value="Reset" onclick = "return confirm('Are you sure you want to delete this event?');"/>
            </td>
        </tr>   
        </table>
        </center>
     </div>    
     <?php include("includes/footer.inc.php");?>
    </div>
    <script type="text/javascript">
             $('#time_from').timepicker({
                minuteStep: 1,
                template: 'modal',
                showSeconds: true,
                showMeridian: false
            });
            $('#time_to').timepicker({
                minuteStep: 1,
                template: 'modal',
                showSeconds: true,
                showMeridian: false
            });
        </script>
  </body>
</html>
