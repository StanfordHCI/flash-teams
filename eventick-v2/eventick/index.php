<?php 
include('config.php');
session_start();
$_SESSION['userid']="1";
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
         <link href="css/datepicker.css" rel="stylesheet">
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

    <!-- Le fav and touch icons -->
    <link rel="shortcut icon" href="../assets/ico/favicon.ico">
    <link rel="apple-touch-icon-precomposed" sizes="144x144" href="../assets/ico/apple-touch-icon-144-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="../assets/ico/apple-touch-icon-114-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="72x72" href="../assets/ico/apple-touch-icon-72-precomposed.png">
    <link rel="apple-touch-icon-precomposed" href="../assets/ico/apple-touch-icon-57-precomposed.png">
  </head>

  <body>

    
 <?php include("includes/nav.inc.php");?>
   <?php include("includes/navbar2.inc.php");?>  
    <div class="container-fluid">    
    
    <div>
     <form action="" method="post">
    	<fieldset>
        	<legend></legend>
            <div class="row">
            	<div class="span3 lightblue">                
	              <label></label>
	              <input type="text" name="txtName" value="<?php if(isset($_POST['txtName'])){echo $_POST['txtName'];}else{echo "";}?>" class="span3" placeholder="Search by Name">      
                </div>
            
    <div class="span3 lightblue">                
	              <label></label>
	              <input type="submit" value="Search" name="btnSearch" class="btn"> 
                  <a href="advancesearch.php" class="btn btn-secondary">Advance Search</a>     
                </div>
            </div>
        </fieldset>
        </form>
    <div> 
    <hr/>
    <h1></h1>
   <?php 
   if(isset($_REQUEST['del'])=="1")
   echo '<div class="alert alert-error"> <button type="button" class="close" data-dismiss="alert">&times;</button> <strong>! Event Deleted Successflly</strong></div>'; ?>
   <?php if(isset($_REQUEST['add'])=="1")
   echo '<div class="alert alert-message"> <button type="button" class="close" data-dismiss="alert">&times;</button> <strong>! Event Added Successflly</strong></div>'; ?>
        <ul class="thumbnails">
        <?php 
		
	

        echo "<li class='span3'><a href=new_event.php>";
echo '<div class="thumbnail">';
echo '<img src="img/new.png" data-src="holder.js/300x200" alt="300x200" style="width: 300px; height: 200px;" >';
echo '<div class="caption">';
echo ' <h3>+ Add New Event</h3>';
echo ' <p></p>
                      <p></p>

                    <p></p>
                  </div>
                </div></a>
              </li>';
        ?>
        <?php

include('config.php');
if(isset($_POST['btnSearch']))
{
$result = mysql_query("SELECT t1.*,t2.IsFavorite,t2.IsAttending FROM tbl_events t1 LEFT JOIN tbl_eventresponse t2 on t1.Event_ID= t2.Event_ID and t2.User_ID=".$_SESSION['userid']." where Event_name like '%".$_POST['txtName']."%'")
or die(mysql_error());


}else
{
$result = mysql_query("SELECT t1.*,t2.IsFavorite,t2.IsAttending FROM tbl_events t1 LEFT JOIN tbl_eventresponse t2 on t1.Event_ID= t2.Event_ID and t2.User_ID=".$_SESSION['userid']."")
or die(mysql_error());
}
$cnt=0;
while($row = mysql_fetch_array( $result ))
{
$cnt++;
echo "<li class='span3'>";
echo '<div style="height: 450px !important;" class="thumbnail">';
echo '<a href="#" title="Delete Event" onClick="delEvent('.$row['Event_ID'].')"><i class="icon-trash"></i></a>';
echo '<a style="text-decoration: none;" href="eventdetail.php?id='.$row['Event_ID'].'">';
echo "<p style='text-align:right;'>From <strong>".substr($row['Event_From'],0,10)."</strong> to <strong>".substr($row['Event_To'],0,10)."</strong></p>";
if($row['Event_pic']!='')
echo '<img src="event_pics/'.$row['Event_pic'].'" data-src="holder.js/300x200" alt="300x200" style="width: 300px; height: 200px;" >';
else
echo '<img src="img/na.gif" data-src="holder.js/300x200" alt="300x200" style="width: 300px; height: 200px;" >';
echo '<div class="caption">';
echo ' <h3>'.$row['Event_name'].'</h3>';

echo ' <p>'.substr($row['Event_Details'], 0,20) .'... <a href="">Read More</a>'.'</p>
                      <p> at <strong>'.$row['Event_place'].'</strong></p>

                    <p>
					';
				if($row['IsAttending']=='1')
				{
				echo 	'<img src="img/check.png" /> <span style="color:green;">You are Attending</span><br/><a href="notattending.php?id='.$row['Event_ID'].'" style="color: red;" class="btn btn-secondary">Not Attending</a> ';
				}
				else
				{
				echo '<a href="attend.php?id='.$row['Event_ID'].'" class="btn btn-secondary">Attend</a> ';
				}
				if($row['IsFavorite']=='1')
				{
			//	echo 	'<a href="#" style="color: green;" class="btn btn-secondary"><img src="img/check.png" />Fav\'ed</a> ';
				}
				else
				{
			//	echo '<a href="favorite.php?id='.$row['Event_ID'].'" class="btn">Favorite</a></p>';
				}
				
				
				
              echo    '</p></div></a>
                </div>
              </li>';

}
if($cnt==0)
	echo '<div class="alert alert-error"> <button type="button" class="close" data-dismiss="alert">&times;</button> <strong>! No events Found</strong></div>';


?>                 
              </ul>
     
      <hr>
        
     <?php include("includes/footer.inc.php");?>
    </div><!--/.fluid-container-->
    

    <!-- Le javascript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
    <script src="js/jquery-1.8.0.min.js"></script>
    <script src="js/bootstrap.js"></script>
     <script src="js/bootstrap-datepicker.js"></script>
        <script type="text/javascript">
		$(document).ready(function()
		{
			$('.datepicker').datepicker()
  .on('changeDate', function(ev){
				$(".dropdown-menu").hide();  });
		});
		 
		</script>
        
        <script type="text/javascript">
		
		function delEvent(eventid){			
             if(confirm("Are you sure you want to delete this event?")){
			 	var durl ="deleteEvent.php?id="+eventid;
                 $.ajax({url:durl,success:function(result)
					 {
						//alert(result);
						if( result.indexOf('successfully') > -1){
							window.location = "index.php?del="+eventid;
						}   
					 }
				 });
             }
         }
		</script>
  </body>
</html>
