<?php render('_header',array('title'=>"Interest"))?>

<?php 
//    echo $_GET['id'];    
    $meArr = Interest::find( array('id'=> $_GET['id']) );
    $me = $meArr[0];
//    var_dump( $me );
?>

<h1><?=$me->interest?></h1>
<div class="ui-grid-a">
    <div class="ui-block-a">
        <img src="https://graph.facebook.com/<?echo $me->fbid?>/picture?width=150&height=150"/>
        <div class="meter">
            <span style="width: <?=rand(1, 99)?>%"></span>
        </div>
    </div>
    <div class="ui-block-b">
        <b>Friends: <?=rand(1, 25)?></b>        
        <button type="button" data-theme="b">Add Interest</button>
    </div>
</div>

<div class="ui-bar ui-bar-b">
    <h3>Friends (<?=rand(1, 25)?>)</h3>
</div>

<ul data-role="listview" data-inset="true" data-theme="c" data-dividertheme="b">
   <?php $users = User::find();
    foreach ($users as $user) {
    ?>
        <li>
            <a href="profile.php?id=<?echo $user->id?>">
                <img src="https://graph.facebook.com/<?echo $user->fbid?>/picture"/>
                <h2><?php echo $user->name?></h2>
                <p><?=rand(1, 15)?> common friends</p>
                <p><?=rand(1, 25)?> common interests</p>
                <div class="meter">
                    <span style="width: <?=rand(1, 99)?>%"></span>
                </div>
            </a>
        </li>
    <?}?>
</ul>
<?php render('_footer')?>
