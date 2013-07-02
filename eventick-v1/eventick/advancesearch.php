<?php 
include('config.php');
session_start();
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
        	<legend>Search Events</legend>
            <div class="row">
            	<div class="span3 lightblue">                
	              <label>Event Name</label>
	              <input type="text" name="txtName" value="<?php if(isset($_POST['txtName'])){echo $_POST['txtName'];}else{echo "";}?>" class="span3" placeholder="Event Name">      
                </div>
                <div class="span1">&nbsp;</div>              
                  <div class="span4 lightblue">
              <label>Event Date</label>             
              <div class="input-append date datepicker" id="dp3" data-date="Event Date" data-date-format="yyyy-mm-dd">
  <input class="span2" name="txtDate" size="16" type="text" value="<?php if(isset($_POST['txtDate'])){echo $_POST['txtDate'];}else{echo "";}?>">
  <span class="add-on"><i class="icon-th"></i></span>
</div> 
	</div>
    <div class="span4 lightblue">
              <label>Location</label>             
             
  <input class="span2" name="txtLocation" size="16" type="text" value="<?php if(isset($_POST['txtLocation'])){echo $_POST['txtLocation'];}else{echo "";}?>">
  

	</div>
    <div class="span3 lightblue">                
	              <label></label>
	              <input type="submit" value="Search" name="btnSearch" class="btn">      
                </div>
            </div>
        </fieldset>
        </form>
    <div> 
    <hr/>
    <h1>All Events</h1>
        <ul class="thumbnails">
 
     
        <?php

include('config.php');
if(isset($_POST['btnSearch']))
{
$str ="SELECT t1.*,t2.IsFavorite,t2.IsAttending FROM tbl_events t1 LEFT JOIN tbl_eventresponse t2 on t1.Event_ID= t2.Event_ID and t2.User_ID=".$_SESSION['userid']." where 1=1 ";
if($_POST['txtDate']!="")
$str .= " and Event_From = '".$_POST['txtDate']."'";
if($_POST['txtName']!="")
$str .= "and Event_name like '%".$_POST['txtName']."%'";
if($_POST['txtLocation']!="")
$str .= "and Event_place like '%".$_POST['txtLocation']."%'";
$result = mysql_query($str)
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
echo '<div class="thumbnail">';
echo "<p style='text-align:right;'>From <strong>".$row['Event_From']."</strong> to <strong>".$row['Event_To']."</strong></p>";
echo '<img src="event_pics/1920x1200_fifa_10.jpg" data-src="holder.js/300x200" alt="300x200" style="width: 300px; height: 200px;" >';
echo '<div class="caption">';
echo ' <h3>'.$row['Event_name'].'</h3>';

echo ' <p>'.substr($row['Event_Details'], 0,30) .'...'.'</p>
                      <p> at <strong>'.$row['Event_place'].'</strong></p>

                    <p><a href="eventdetail.php?id='.$row['Event_ID'].'" class="btn">View</a>
					';
				if($row['IsAttending']=='1')
				{
				echo 	'<a href="#" style="color: green;" class="btn btn-secondary"><img src="img/check.png" />Attending</a> ';
				}
				else
				{
				echo '<a href="attend.php?id='.$row['Event_ID'].'" class="btn btn-secondary">Attend</a> ';
				}
				if($row['IsFavorite']=='1')
				{
				echo 	'<a href="#" style="color: green;" class="btn btn-secondary"><img src="img/check.png" />Fav\'ed</a> ';
				}
				else
				{
				echo '<a href="favorite.php?id='.$row['Event_ID'].'" class="btn">Favorite</a></p>';
				}
				
				
				
              echo    '</p></div>
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
  </body>
</html>
