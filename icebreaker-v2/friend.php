<?php
require_once "includes/main.php";
$user = $_POST['user'];
$friends = $_POST['friends'];
foreach ($friends as $friend) {
   Friend::insert(array("id" => $user["id"],"fid" => $friend["id"],"name" => $friend["name"]));
}
?>
