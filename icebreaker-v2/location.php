<?php

require_once "includes/main.php";
try {
    render('location');
}
catch(Exception $e) {
	// Display the error page using the "render()" helper function:
	render('error',array('message'=>$e->getMessage()));
}

?>