<?php
require_once("header.php");
if($_POST['optionsRadios']=="option2"){
?>
<div class="alert alert-success">
  Your choice is correct.
</div>

<?php
}
else
{
    ?>
    <div class="alert alert-error">
      Your choice is wrong.
    </div>
    <?php
}
?>
 <fieldset>
    <legend>Feedback</legend>
    <textarea rows="5"></textarea>
    <a class="btn btn-primary" href="index.php">Send</a>
</fieldset>
<?php
require_once("footer.php");
?>