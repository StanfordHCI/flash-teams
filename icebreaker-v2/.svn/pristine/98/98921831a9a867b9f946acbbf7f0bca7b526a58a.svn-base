<?php render('_header',array('title'=>$title))?>

<ul data-filter="true" data-role="listview" data-inset="true" data-theme="c" data-dividertheme="b">
   <?php $users = User::find();
   $meter = 100;
    foreach ($users as $user) {

    $meter = $meter - rand(0, 3);
    ?>
        <li>
            <a href="profile.php?id=<?echo $user->id?>">
                <img src="https://graph.facebook.com/<?echo $user->fbid?>/picture" />
                <?php echo $user->name?> <div class='<?=rand(0, 1)==0?"offline":"online"?>' ></div>
                <p><?=rand(1, 15)?> common friends</p>
                <p><?=rand(1, 25)?> common interests</p>
                <div class="meter">
                    <span style="width: <?=$meter ?>%"></span>
                </div>
            </a>
        </li>
    <?}?>
</ul>
<?php render('_footer')?>
