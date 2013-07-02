<?php
include('config.php');
session_start();
$uid = $_SESSION['userid'];
$eid= mysql_real_escape_string(htmlspecialchars($_REQUEST['id']));
// mysql_real_escape_string(htmlspecialchars($_POST['city']))
$result =  mysql_query("select * from tbl_eventresponse  WHERE event_id='".$eid."' and User_ID=".$uid."")
or die(mysql_error());

$rowCount = mysql_num_rows($result);
if($rowCount=="0")
{
$str = "INSERT into tbl_eventresponse(Event_ID,User_ID,IsFavorite,IsAttending) values(".$eid.",".$uid.",0,1)";

mysql_query("INSERT into tbl_eventresponse(Event_ID,User_ID,IsFavorite,IsAttending) values(".$eid.",".$uid.",0,1)")
or die(mysql_error());

}
else
{
$str="UPDATE tbl_eventresponse SET IsAttending=1 WHERE User_ID='".$uid."' and Event_ID='".$eid."'";

mysql_query($str)
or die(mysql_error());


}
if(isset($_REQUEST['up'])){
echo "<script type='text/javascript'>location.href='myevents.php?up=1';</script>";}
else if(isset($_REQUEST['past'])){
echo "<script type='text/javascript'>location.href='myevents.php?past=1';</script>";}
else if(isset($_REQUEST['adv'])){
echo "<script type='text/javascript'>location.href='advancesearch.php';</script>";}
else{
echo "<script type='text/javascript'>location.href='index.php';</script>";}
?>