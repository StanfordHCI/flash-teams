<?php include("config.php");?>
<?php
    
    $ret_response = mysql_query("DELETE FROM tbl_eventresponse WHERE event_id=".$_GET['id'] ,$dbConn);
    if ( $ret_response ){
        $ret_event = mysql_query("DELETE FROM tbl_events WHERE event_id=".$_GET['id'] ,$dbConn);
        if( $ret_event){
            echo "Deleted event successfully\n";
        }else{
            die('Could not delete event: '.mysql_error());
        }
    }     
  
?>
