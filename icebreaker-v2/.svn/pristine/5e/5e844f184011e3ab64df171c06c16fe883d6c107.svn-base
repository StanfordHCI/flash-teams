<?php render('_header',array('title'=>$title))?>

<ul data-filter="true" data-role="listview" data-inset="true" data-theme="c" data-dividertheme="b">
   <?php $users = User::find();
    foreach ($users as $user) {
    ?>
        <li>
            <a href="profile.php?id=<?echo $user->id?>">
                <img src="https://graph.facebook.com/<?echo $user->fbid?>/picture" />
                <?php echo $user->name?> <div class='<?=rand(0, 1)==0?"offline":"online"?>' ></div>
                <div class="meter">
                    <span style="width: <?=rand(1, 99)?>%"></span>
                </div>
            </a>
        </li>
    <?}?>
</ul>
<?php render('_footer')?>
