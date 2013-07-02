<?php include 'header.php';
$course = R::load('course',$_GET["id"]);
?>
<div class="span3">
</div><!--/span-->
<div class="span9">
    <div class="row-fluid">
        <div class="span12">
            <?php
                if(isset($_POST['optionsRadios'])){
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
                }
            ?>
        </div>
    </div>
    <div class="row-fluid">
        <div class="span12">
            <h1><?php echo $course->title?></h1>
        </div>
    </div>
    <div class="row-fluid">
        <div class="span2">
            <img src="<?php echo $course->picture?>" width="80"/>
        </div>
        <div class="span10"><?php echo $course->description?></div>
    </div>
    <div class="row-fluid">
        <div class="span12">
            <h4>Course Video</h4>
            <iframe width="800" height="345"
                src="<?php echo $course->video_url?>">
            </iframe>
        </div>
    </div>
    <div class="row-fluid">
        <div class="span12">
            <h4>Course quiz</h4>
            <div class="span12">
                <?php $q = R::getAll( 'select * from question where course_id ='.$course->id.' Limit 1' );?>
                <b>Q</b> <?php echo $q[0]["question"]?><br>
                <form action="" method="POST">
                <div class="clearfix">
                    <div class="input">
                      <ul class="inputs-list">
                        <li>
                          <label>
                            <input type="radio" value="option1" name="optionsRadios" checked="">
                           <?php echo $q[0]["i_answer1"]?>
                          </label>
                        </li>
                        <li>
                          <label>
                            <input type="radio" value="option2" name="optionsRadios">
                            <?php echo $q[0]["c_answer"]?>
                          </label>
                        </li>
                        <li>
                          <label>
                            <input type="radio" value="option3" name="optionsRadios" checked="">
                           <?php echo $q[0]["i_answer2"]?>
                          </label>
                        </li>
                        <li>
                          <label>
                            <input type="radio" value="option4" name="optionsRadios" checked="">
                           <?php echo $q[0]["i_answer3"]?>
                          </label>
                        </li>

                      </ul>
                        
                    </div>
                  </div>
                    <input class="btn btn-primary" type="submit" value="Submit"/>
                 </form>

            </div>
        </div>
         <div class="span12">
             <p class="pull-right">
                <a class="btn btn-primary" href="edit-course.php?id=<?php echo $course->id?>">Edit</a>
                <a class="btn btn-danger"  href="delete-course.php?id=<?php echo $course->id?>">Delete</a>
            </p>
         </div>
    </div>
    
</div>
<?php
require_once("footer.php");
?>