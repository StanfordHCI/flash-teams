<?php
require_once("header.php");
if(!empty($_POST))
{
    if ($_FILES["file"]["error"] > 0)
    {
        echo "Return Code: " . $_FILES["file"]["error"] . "<br>";
    }
    else
    {
        $uniq = "upload/" .uniqid()."-".$_FILES["file"]["name"];
        move_uploaded_file($_FILES["file"]["tmp_name"],$uniq);

        $course = R::dispense('course');
        $course->title = $_POST["title"];
        $course->description = $_POST["description"];
        $course->video_url = $_POST["video_url"];
        $course->category = $_POST["category"];
        $course->picture = $uniq;
        $id = R::store($course);

        for ($i=0; $i < count($_POST["q"]);$i++) {
            $q = R::dispense('question');
            $q->question = $_POST["q"][$i];
            $q->c_answer =  $_POST["ca"][$i];
            $q->i_answer1 =  $_POST["ia1"][$i];
            $q->i_answer2 =  $_POST["ia2"][$i];
            $q->i_answer3 =  $_POST["ia3"][$i];
            $q->course_id = $id;
             R::store($q);
        }
    }
}
?>

<form class="form-horizontal" method="post" enctype="multipart/form-data" action="">
<fieldset>

<!-- Form Name -->
<legend>Create Course</legend>

<!-- Text input-->
<div class="control-group">
  <label class="control-label">Title</label>
  <div class="controls">
    <input id="title" name="title" type="text" placeholder="title" class="input-xlarge" required="">
    <p class="help-block">Enter title of course</p>
  </div>
</div>

<!-- Text input-->
<div class="control-group">
  <label class="control-label">Description</label>
  <div class="controls">
    <input id="description" name="description" type="text" placeholder="description of course" class="input-xlarge" required="">
    <p class="help-block">enter course description</p>
  </div>
</div>

<!-- Text input-->
<div class="control-group">
  <label class="control-label">Video</label>
  <div class="controls">
    <input id="video_url" name="video_url" type="text" placeholder="url" class="input-xlarge" required="">
    <p class="help-block">Enter url of the video</p>
  </div>
</div>
<?php $cats = R::getAll( 'select * from category' );?>
<!-- Select Basic -->
<div class="control-group">
  <label class="control-label" for="selectbasic">Select Category</label>
  <div class="controls">
    <select id="selectbasic" name="category" class="input-xlarge">
        <?php for($i = 0; $i < count($cats); $i++){
            echo "<option value='".$cats[$i]["name"]."'>".$cats[$i]["name"]."</option>";
    }?>
      
    </select>
  </div>
</div>

<!-- File Button -->
<div class="control-group">
  <label class="control-label">Upload Picture</label>
  <div class="controls">
    <input id="picture" name="file" class="input-file" type="file" required="">
  </div>
</div>
<div id="question-container">
  <div id="question">
    <div class="control-group" >
        <legend>Question </legend>
      <label class="control-label">Quiz Question</label>
      <div class="controls">
        <input  name="q[]" type="text" class="input-xlarge" required="">
        <p class="help-block"></p>
      </div>
        <label class="control-label">Correct Answer</label>
      <div class="controls">
        <input  name="ca[]" type="text" class="input-xlarge" required="">
        <p class="help-block"></p>
      </div>
      <label class="control-label">Incorrect Answer 1</label>
      <div class="controls">
        <input  name="ia1[]" type="text" class="input-xlarge" required="">
        <p class="help-block"></p>
      </div>
      <label class="control-label">Incorrect Answer 2</label>
      <div class="controls">
        <input  name="ia2[]" type="text" class="input-xlarge" required="">
        <p class="help-block"></p>
      </div>
      <label class="control-label">Incorrect Answer 3</label>
      <div class="controls">
        <input  name="ia3[]" type="text" class="input-xlarge" required="">
        <p class="help-block"></p>
      </div>

    </div>
</div>
 </div>
<!-- Button -->
<div class="control-group">
  <label class="control-label"></label>
  <div class="controls">
    <input class="btn btn-primary" type="submit" name="save" value="Save" />
    <input  class="btn" type="reset" value="Clear"/>
  </div>
</div>
<a href="#" onclick='$("#question-container").append($("#question").html());return false;'> Add new question </a>
</fieldset>
</form>
<?php
require_once("footer.php");
?>
