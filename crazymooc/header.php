<?php
require_once("rb.php");
require_once("config.php");
R::setup("mysql:host=$dbhost;dbname=$dbname",$dbuser,$dbpass);
session_start();

function strip_slashes_recursive($mixed){
	if(is_string($mixed))
    	return stripslashes($mixed);	
    if(is_array($mixed))
        foreach($mixed as $i=>$value)
            $mixed[$i]=strip_slashes_recursive($value); 
    return $mixed; 
}

function hasher($p){
  $salt="";
  for($i=0;$i<16;$i++)
  	$salt.=chr(rand(ord('@'),ord('~'))); //create a random 16 char string from ascii @ to ~
  return crypt($p,'$5$rounds=5000$'.$salt.'$'); //$5 = SHA_256
}
function check_hash($p,$h){
	return $h==crypt($p,$h);
}

if (get_magic_quotes_gpc()){ //!! ideally disable the magic
	$_GET=strip_slashes_recursive($_GET);
	$_POST=strip_slashes_recursive($_POST);
	$_COOKIE=strip_slashes_recursive($_COOKIE);
}
?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>CrazyMOOC</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="">
    <meta name="author" content="">

    <!-- Le styles -->
    <link href="css/bootstrap.css" rel="stylesheet">
    <style type="text/css">
      body {
        padding-top: 60px;
        padding-bottom: 40px;
      }
      .sidebar-nav {
        padding: 9px 0;
      }

      @media (max-width: 980px) {
        /* Enable use of floated navbar text */
        .navbar-text.pull-right {
          float: none;
          padding-left: 5px;
          padding-right: 5px;
        }
      }
    </style>
    <link href="css/bootstrap-responsive.css" rel="stylesheet">

    <!-- HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
      <script src="../assets/js/html5shiv.js"></script>
    <![endif]-->

    <!-- Fav and touch icons -->
    <link rel="apple-touch-icon-precomposed" sizes="144x144" href="apple-touch-icon-144-precomposed.png">
    <link rel="apple-touch-icon-precomposed" sizes="114x114" href="apple-touch-icon-114-precomposed.png">
      <link rel="apple-touch-icon-precomposed" sizes="72x72" href="apple-touch-icon-72-precomposed.png">
       <link rel="apple-touch-icon-precomposed" href="apple-touch-icon-57-precomposed.png">
       <link rel="shortcut icon" href="favicon.png">
  </head>

  <body>
    <div class="navbar navbar-inverse navbar-fixed-top">
      <div class="navbar-inner">
        <div class="container-fluid">
          <button type="button" class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="brand" href="index.php">CrazyMOOC</a>
          <div class="nav-collapse collapse">
            <p class="navbar-text pull-right">
              Logged in as <a href="#" class="navbar-link">Shehbaz</a>
            </p>
            <ul class="nav">
              <li class="active"><a href="index.php">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="add-course.php">Add course</a></li>
            </ul>
          </div><!--/.nav-collapse -->
        </div>
      </div>
    </div>
    <div class="container-fluid">
      <div class="row-fluid">