<?php
require_once("header.php");
$course  = R::load('course',$_GET["id"]);
 R::trash($course);
?>
<div class="alert alert-success">
  Course is deleted successfully.
</div>
<?php
require_once("footer.php");
?>
