<?php

require_once "includes/main.php";
try {
    render('friendrequests',array('title'=> "My Friends"));
}
catch(Exception $e) {
	// Display the error page using the "render()" helper function:
	render('error',array('message'=>$e->getMessage()));
}

?>