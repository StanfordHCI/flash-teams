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
      
      div.tab-content table tbody tr {
            border-left: 1px solid #DDDDDD;
            border-right: 1px solid #DDDDDD;
      }
      
      div.tab-content table tbody tr td {
            border-top: 0;
            border-bottom: 1px solid #DDDDDD;
      }
    </style>
    <link href="css/bootstrap-responsive.css" rel="stylesheet">

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
    
  </head>

  <body  onLoad="initialize();">

    
 <?php include("includes/nav.inc.php");?>
  <?php include("includes/navbar2.inc.php");?>
 <?php include("config.php");?>
    
    <div class="container-fluid">
        <!--    check if url includes event id parameter -->
        <?php if(!empty($_GET['id'])){ ?>
            <?php $event_id = $_GET['id']; ?>
            <?php $detail_sql = mysql_query("SELECT event.event_name, event.event_details, event.event_pic, event.event_place, event.created_date, 
                                        users.User_Name,event.created_date  FROM (SELECT * FROM tbl_events WHERE event_id=".$event_id.") event 
                                        INNER JOIN tbl_users users ON event.Created_By=users.User_ID") or die(mysql_error()); 
                   $detail = mysql_fetch_array( $detail_sql );
                   if( mysql_num_rows( $detail_sql ) > 0 ){
            ?>
                    <div class="row-fluid">
                        <div class="span12">
                            <h1 style="text-align:center;"><?php echo $detail['event_name']; ?>&nbsp;&nbsp;(&nbsp;<?php echo $detail['created_date']; ?>&nbsp;)</h1>
                        </div>
                    </div><!-- Event Title -->
                    <div class="row-fluid" style="margin-bottom: 5px;">
                         <div class="span12" style="text-align:right;padding-right: 20px;">
                            <a href="new_event.php?id=<?php echo $event_id; ?>" title="Edit Event"><i class="icon-pencil"></i></a>
                            <a href="#" title="Delete Event" onClick="delEvent()"><i class="icon-trash"></i></a>
                        </div>
                    </div>
                    <div class="row-fluid" style="margin-bottom: 30px;">
                        <div class="span3">
                            <div style="width: 200px; height: 200px; border: 1px solid black;"><img src="event_pics/<?php echo $detail['event_pic']; ?>" style="width: 100%; height: 100%;" alt="<?php echo $detail['event_pic'] ?>" /></div>
                            <div style="position:relative;top:-25px;text-align:right;right:30px;">
                                <a href="#" style="display:none;" Title="Edit"><i class="icon-pencil"></i></a>
                                <a href="#" style="display:none;" Title="Delete"><i class="icon-trash"></i></a>
                            </div>
                        </div><!-- Event Image -->
                        <div class="span9">
                            <div class="span12">
                                <p>
                                    <?php echo $detail['event_details']; ?>
                                </p>
                            </div>
                       </div><!-- Event Details -->
                    </div>
                    <div class="row-fluid">
                        <div class="span6 tabbable"><!-- attendant and collaborator tabs -->
                            <?php 
                                $attendant_sql = mysql_query("SELECT response.id, users.User_Name, response.IsFavorite, response.IsAttending 
                                                                FROM tbl_eventresponse response 
                                                                INNER JOIN tbl_users users ON response.User_ID=users.User_ID 
                                                              WHERE response.Event_ID=".$event_id." ORDER BY id") or die(mysql_error());
                            ?>
                            <ul class="nav nav-tabs" style="margin-bottom:0;">
                                <li class="active"><a href="#attendant" data-toggle="tab">Attendant</a></li>
                                <li><a href="#collaborator" data-toggle="tab">Event Creator</a></li>
                            </ul>
                            <div class="tab-content">
                                <div id="attendant" class="tab-pane active">
                                    <table class="table">
                                        <tbody>
                                            <?php $i=1; while ( $attendant = mysql_fetch_array( $attendant_sql ) ) { ?>
                                                <tr>
                                                    <!--<td class="span2"><?php //echo $i; ?></td>-->
                                                    <td class="span2">
<!--                                                        <i class="icon-minus-sign"></i>-->
                                                        <img src="img/profilepic.png" width="25px" height="24px"/>
                                                    </td>
                                                    <td class="span3"><?php echo $attendant['User_Name']; ?></td>
                                                    <td class="span2" style="text-align:right;"><i class="icon-plus"></i>&nbsp;<i class="icon-envelope"></i></td>
                                                </tr>
                                            <?php $i++;} ?>
                                        </tbody>
                                    </table>
                                    <div class="span6">
                                        <a href="#" onClick="openContact()">Invite Contacts</a>
                                        
                                        <!-- Modal for Invite Contacts -->
                                        <div id="contactModal" class="modal hide fade" style="width: 250px;" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
                                            <div class="modal-header">
                                                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">X</button>
                                                <h3 id="myModalLabel">Invite Contacts</h3>
                                            </div>
                                            <div class="modal-body">
                                                
                                            </div>
                                            <div class="modal-footer">
                                                <button class="btn btn-primary" onClick="invite()">Invite</button>
                                                <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
                                            </div>
                                        </div>
                                        
                                    </div>
                                </div>
                                <div id="collaborator" class="tab-pane">
                                    <table class="table">
                                        <tbody>
                                            <tr>
                                                <td class="span2"><img src="img/profilepic.png" width="25px" height="24px"/></td>
                                                <td class="span4"><?php echo $detail['User_Name']; ?></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div class="span6">
                             <div id="map" style="height: 250px; border: solid 1px #ccc;""></div> 
                        </div>    
                    </div>
                <?php } ?>                          
        <?php } else {
            echo "Can't find event ID. Please confirm the ID of event.";
        }?>
        
      <hr>
        
     <?php include("includes/footer.inc.php");?>
    </div><!--/.fluid-container-->

    <!-- Le javascript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
    <script src="js/jquery-1.8.0.min.js"></script>
    <script src="js/bootstrap.js"></script>
    <script type="text/javascript" src="http://maps.google.com/maps/api/js?v=3&sensor=false&language=en"></script>
    
    <script type="text/javascript">
    
        function invite(){
            var contactSelected = new Array();
            contacts = document.getElementsByName('contacts');
            for(i=0; i<contacts.length; i++){
                if(contacts[i].checked){
                    contactSelected.push(contacts[i].value);
                }
            }
            
            //for(i=0; i<contactSelected.length; i++){
            //    alert("Sent invitaion to user id: " + contactSelected[i]);
            //}
            
            alert("Sent invitaion to " + contactSelected.length + " Users");
             $("#contactModal").modal('hide');
             
             
        }
        
        $('body').on('hidden','.modal',function() {
            $(this).removeData('modal');
        })
        
        function openContact(){
            $("#contactModal").modal({
                show: true,
                remote: "getContacts.php"
            });
        }
                 
         $(document).ready(function () {
             $("#head").html("Near By " + sessionStorage.recommend1 + " activities that you could join");
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
         
         function delEvent(){
             if(confirm("Are you sure to delete event?")){
                 $.ajax({url:"deleteEvent.php?id="+<?php echo $event_id; ?>,success:function(result){
                    alert(result);
                    if( result.indexOf('successfully') > -1){
                        window.location = "index.php?del="+<?php echo $event_id; ?>;
                    }   
                 }})
             }
         }
    </script>
  </body>
</html>
