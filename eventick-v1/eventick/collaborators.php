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
    <h1>Collaborators</h1>
       			
       	            <div class="row">
                     <div class="span1">1</div>
					  <div class="span1"><img src='img/profile-photo.jpg' /></div>					 
                       <div class="span1">Kim Barker</div>
                      <div class="span2"></div>
                      <div class="span2"></div>
                      <div class="span2"></div>
                      <div class="span2"></div>
                      <div class="span2"></div>
					</div>
                    	<hr>
                      <div class="row">
                      <div class="span1">2</div>
					  <div class="span1"><img src='img/profile-photo.jpg' /></div>
					  <div class="span1">Jason Tam</div>
                      <div class="span2"></div>
                      <div class="span2"></div>
                      <div class="span2"></div>
                      <div class="span2"></div>
                      <div class="span2"></div>
					</div>
                    <hr>
                      <div class="row">
                      <div class="span1">2</div>
					  <div class="span1"><img src='img/profile-photo.jpg' /></div>
					  <div class="span2">Tom hensley</div>
                      <div class="span2"></div>
                      <div class="span2"></div>
                      <div class="span2"></div>
                      <div class="span2"></div>
                      <div class="span2"></div>
					</div>
           
     
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
