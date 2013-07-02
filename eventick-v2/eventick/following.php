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
    
   
    <hr/>
    <h1>Following</h1>
    
       <?php 
   $result = mysql_query("SELECT distinct t3.Event_name,t2.User_Name from tbl_eventresponse t1
JOIN tbl_users t2 on t1.User_ID=t2.User_ID
JOIN tbl_events t3 on t1.User_ID=t3.Created_By
WHERE t1.IsAttending=1")
or die(mysql_error());
$cnt=1;
while($row = mysql_fetch_array( $result ))
{
   ?>
       			
       	            <div class="row">
                     <div class="span1"><?php echo $cnt++;?></div>
					  <div class="span4"><?php echo $row['User_Name'];?> is going to <strong><?php echo $row['Event_name'];?></strong></div>				 
                   
                      <div class="span2"></div>
                      <div class="span2"></div>
                      <div class="span2"></div>
                      <div class="span2"></div>
                      <div class="span2"></div>
					</div>
                    	
 <?php }?>          
     
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
