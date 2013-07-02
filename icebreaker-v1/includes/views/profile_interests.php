<?php render('_header',array('title'=>"User Profile"))?>

<?php 
//    echo $_GET['id'];
    $arr = Array();
    $arr['dbid'] = $_GET['id'];
    $meArr = User::find( $arr );
    $me = $meArr[0];
//    var_dump( $me );
?>

<h1><?=$me->name?></h1>
<div class="ui-grid-a">
    <div class="ui-block-a">
        <img src="https://graph.facebook.com/<?echo $me->fbid?>/picture?width=150&height=150"/>
        <div class="meter">
            <span style="width: <?=rand(1, 99)?>%"></span>
        </div>
    </div>
    <div class="ui-block-b">
        <b>Friends: <?=rand(1, 25)?></b> and <b>Interests: <?=rand(1, 25)?></b>
        <button type="button" data-theme="a" >Start Chatting <div class='<?=rand(0, 1)==0?"offline":"online"?>' ></div></button>
        <button type="button" data-theme="b" onclick="alert('User added in your friend list.');" >Add Friend</button>
    </div>
</div>

<div class="ui-bar ui-bar-b">
    <h3>Interests (<?=rand(1, 25)?>)</h3> <a href="profile.php?id=<?=$me->id?>" data-role="button" data-inline="true" data-mini="true" class="ui-btn-right">Friends</a>
</div>

<ul data-role="listview" data-inset="true" data-theme="c" data-dividertheme="b">
   <?php $interests = Interest::find();
    foreach ($interests as $intrst) {
    ?>
        <li>
            <a href="interest.php?id=<?echo $intrst->id?>">
                <img src="https://graph.facebook.com/<?echo $intrst->fbid?>/picture"/>
                <h2><?php echo $intrst->interest?></h2>
                <p><?=rand(1, 15)?> common friends</p>                
                <div class="meter">
                    <span style="width: <?=rand(1, 99)?>%"></span>
                </div>
            </a>
        </li>
    <?}?>
</ul>
<?php render('_footer')?>
