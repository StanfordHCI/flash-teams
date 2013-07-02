<?php
require_once "includes/main.php";
try {
        // Select all the categories:
            $content = Category::find();

            render('home',array(
                    'title'		=> 'Home',
                    'content'	=> $content
            ));
}
catch(Exception $e) {
	// Display the error page using the "render()" helper function:
	render('error',array('message'=>$e->getMessage()));
}



?>
