   
    <div class="navbar">
  <div class="navbar-inner">
    <ul class="nav">
<?php 

 $currentFile = $_SERVER["PHP_SELF"];
    $parts = Explode('/', $currentFile);
    $name= $parts[count($parts) - 1];
	
  if($name=="index.php")  {?>
      <li class="active"><a href="index.php">All Events</a></li>
      <?php }else {?>
           <li><a href="index.php">All Events</a></li>
           <?php } ?>
<?php           if($name=="myevents.php")  {?>  
      <li class="active"><a href="myevents.php">My Events</a></li>
    <?php }else {?>
           <li><a href="myevents.php">My Events</a></li>
           <?php } ?>
           
           <?php           if($name=="collaborators.php")  {?>  
      <li class="active"><a href="collaborators.php">Collaborators</a></li>
     
          <?php }else {?>
           <li><a href="collaborators.php">Collaborators</a></li>
           <?php } ?>
           
                      <?php           if($name=="following.php")  {?>  
    	<li class="active"><a href="following.php">Following</a></li>
        
          <?php }else {?>
           <li><a href="following.php">Following</a></li>
           <?php } ?>
    </ul>
  </div>
</div>