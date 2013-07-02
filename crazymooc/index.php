<?php include 'header.php';?>
    <div class="span12">
              <div class="hero-unit">
            <div class="carousel slide" id="myCarousel">
                <ol class="carousel-indicators">
                  <li class="" data-slide-to="0" data-target="#myCarousel"></li>
                  <li data-slide-to="1" data-target="#myCarousel" class="active"></li>
                  <li data-slide-to="2" data-target="#myCarousel" class=""></li>
                </ol>
                <div class="carousel-inner">
                  <div class="item">
                    <img alt="" src="img/bootstrap-mdo-sfmoma-03.jpg">
                    <div class="carousel-caption">
                      <h4>First featured course</h4>
                      <p>Cras justo odio, dapibus ac facilisis in, egestas eget quam. Donec id elit non mi porta gravida at eget metus. Nullam id dolor id nibh ultricies vehicula ut id elit.</p>
                    </div>
                  </div>
                  <div class="item active">
                    <img alt="" src="img/bootstrap-mdo-sfmoma-03.jpg">
                    <div class="carousel-caption">
                      <h4>Second featured course</h4>
                      <p>Cras justo odio, dapibus ac facilisis in, egestas eget quam. Donec id elit non mi porta gravida at eget metus. Nullam id dolor id nibh ultricies vehicula ut id elit.</p>
                    </div>
                  </div>
                  <div class="item">
                    <img alt="" src="img/bootstrap-mdo-sfmoma-03.jpg">
                    <div class="carousel-caption">
                      <h4>Third featured course</h4>
                      <p>Cras justo odio, dapibus ac facilisis in, egestas eget quam. Donec id elit non mi porta gravida at eget metus. Nullam id dolor id nibh ultricies vehicula ut id elit.</p>
                    </div>
                  </div>
                </div>
                <a data-slide="prev" href="#myCarousel" class="left carousel-control">‹</a>
                <a data-slide="next" href="#myCarousel" class="right carousel-control">›</a>
              </div>
          </div>

    </div>
</div>
<div class="row-fluid">
        <div class="span3">
            <div class="row-fluid">
            
            <form class="navbar-search span12" action="index.php" method="GET">
               <div class='input-append span12'>
                    <input placeholder="Search..." name="course" class="span11"/>
                    <button class='btn add-on'>
                        <i class="icon-search"></i>
                    </button>
                </div>
            </form>

            </div>
          <div class="well sidebar-nav">
            <ul class="nav nav-list">
              <li class="nav-header">Course Categories</li>
               <li><a href="index.php">All</a></li>
              <?php 
                $cats = R::getAll( 'select * from category' );
                foreach ($cats as $cat) {
                    echo '<li><a href="index.php?id='.$cat['name'].'">'.$cat['name'].'</a></li>';
                }
              ?>
            </ul>
          </div><!--/.well -->
        </div><!--/span-->
        <div class="span9">
          <?php 
             
             if(isset($_GET['id']))
              {
                  $courses = R::getAll( 'select * from course where category="'.$_GET['id'].'" order by id desc' );
              }
              else if(isset ($_GET['course']))
              {
                  $courses = R::getAll( 'select * from course where title like"'.$_GET['course'].'%" order by id desc' );
              }
             else {
                $courses = R::getAll( 'select * from course order by id desc' );
            }
             $i=0;
             foreach ($courses as $course) {
              //if($i%3 == 0){
                echo '<div class="row-fluid">';
              //}
              $i++;
        ?>
          
            <div class="span12 box" onclick="location.href='view-course.php?id=<?php echo  $course["id"]?>';"title="Click to view the course details">
              <h2><?php echo $course["title"]?></h2>
              <p><?php echo $course["description"]?> </p>
              <p>Date: <?php echo $course["created_at"]?> </p>
            </div><!--/span-->
        <?php
//            if($i%3 == 0){
                echo '</div>';
//                }
             }
        ?>
        </div><!--/span-->
<?php include 'footer.php';?>