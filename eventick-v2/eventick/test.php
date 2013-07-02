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


  </head>

  <body>

    <div class="container-fluid">    
    
    <div>
 
    	    <div class="input-append date datepicker" id="dp3" data-date="Event Date" data-date-format="yyyy-mm-dd">
  <input class="span2" name="txtDate" size="16" type="text" value="">
  <span class="add-on"><i class="icon-th"></i></span>
</div>
     
   


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
