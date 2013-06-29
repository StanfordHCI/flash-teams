<?php
require_once("header.php");
$course  = R::load('course',$_GET["id"]);
if(!empty($_POST))
{
    
        if($_FILES["file"]["error"] != 4){
            $uniq = "upload/" .uniqid()."-".$_FILES["file"]["name"];
            move_uploaded_file($_FILES["file"]["tmp_name"],$uniq);
            $course->picture = $uniq;
        }

        
        $course->title = $_POST["title"];
        $course->description = $_POST["description"];
        $course->video_url = $_POST["video_url"];
        $course->category = $_POST["category"];
        
        $id = R::store($course);

        for ($i=0; $i < count($_POST["q"]);$i++) {
            $q = R::load('question',$_POST['qid'][$i]);
            $q->question = $_POST["q"][$i];
            $q->c_answer =  $_POST["ca"][$i];
            $q->i_answer1 =  $_POST["ia1"][$i];
            $q->i_answer2 =  $_POST["ia2"][$i];
            $q->i_answer3 =  $_POST["ia3"][$i];
            R::store($q);
        }
    
}
?>

<form class="form-horizontal" method="post" enctype="multipart/form-data" action="">
<fieldset>

<!-- Form Name -->
<legend>Edit Course</legend>

<!-- Text input-->
<div class="control-group">
  <label class="control-label">Title</label>
  <div class="controls">
    <input id="title" name="title" type="text" placeholder="title" class="input-xlarge" required="" value="<?=$course->title?>">
    <p class="help-block">Enter title of course</p>
  </div>
</div>

<!-- Text input-->
<div class="control-group">
  <label class="control-label">Description</label>
  <div class="controls">
    <input id="description" name="description" type="text" placeholder="description of course" value="<?=$course->description?>" class="input-xlarge" required="">
    <p class="help-block">enter course description</p>
  </div>
</div>

<!-- Text input-->
<div class="control-group">
  <label class="control-label">Video</label>
  <div class="controls">
    <input id="video_url" name="video_url" type="text" placeholder="url" class="input-xlarge" required=""  value="<?=$course->video_url?>">
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
            if($course->category == $cats[$i]["name"])
                echo "<option selected='selected' value='".$cats[$i]["name"]."'>".$cats[$i]["name"]."</option>";
            else
                echo "<option value='".$cats[$i]["name"]."'>".$cats[$i]["name"]."</option>";
    }?>

    </select>
  </div>
</div>

<!-- File Button -->
<div class="control-group">
  <label class="control-label">Upload Picture</label>
  <div class="controls">
      <img src="<?=$course->picture?>" height="150" width="150"/><br/>
    <input id="picture" name="file" class="input-file" type="file" >
  </div>
</div>
<div id="question-container">
<?php $qs = R::getAll( 'select * from question where course_id ='.$course->id );
$id_rndr = true;
    foreach ($qs as $q) {

    if($id_rndr){
?>

  <div id="question">
      <?php }?>
      <input type="hidden" name="qid[]" value="<?= $q["id"]?>">
    <div class="control-group" >
        <legend>Question </legend>
      <label class="control-label">Quiz Question</label>
      <div class="controls">
        <input  name="q[]" type="text" class="input-xlarge" required="" value="<?=$q['question']?>">
        <p class="help-block"></p>
      </div>
        <label class="control-label">Correct Answer</label>
      <div class="controls">
        <input  name="ca[]" type="text" class="input-xlarge" required="" value="<?=$q['c_answer']?>">
        <p class="help-block"></p>
      </div>
      <label class="control-label">Incorrect Answer 1</label>
      <div class="controls">
        <input  name="ia1[]" type="text" class="input-xlarge" required="" value="<?=$q['i_answer1']?>">
        <p class="help-block"></p>
      </div>
      <label class="control-label">Incorrect Answer 2</label>
      <div class="controls">
        <input  name="ia2[]" type="text" class="input-xlarge" required="" value="<?=$q['i_answer2']?>">
        <p class="help-block"></p>
      </div>
      <label class="control-label">Incorrect Answer 3</label>
      <div class="controls">
        <input  name="ia3[]" type="text" class="input-xlarge" required="" value="<?=$q['i_answer3']?>">
        <p class="help-block"></p>
      </div>

    </div>
   <?php if($id_rndr){?>
            </div>
    <?php }
    $id_rndr = false;}?>
 </div>
<!-- Button -->
<div class="control-group">
  <label class="control-label"></label>
  <div class="controls">
    <input class="btn btn-primary" type="submit" name="save" value="Save" />
  </div>
</div>
</fieldset>
</form>
<?php
require_once("footer.php");
?>
