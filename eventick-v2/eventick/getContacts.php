<?php
  require_once('config.php');
  $contact_sql = mysql_query("SELECT user_id,user_name FROM tbl_users") or die(mysql_error());
  if( mysql_num_rows( $contact_sql ) > 0 ){
      while ( $contacts = mysql_fetch_array( $contact_sql ) ) {
          echo '<label class="checkbox">
                    <input type="checkbox" name="contacts" value='.$contacts['user_id'].'>'.$contacts['user_name'].
                '</label>';
      }
  }else{
      echo ' <div class="alert">
                <a class="close" data-dismiss="alert">x</a>
                <h4 class="alert-heading">Warning!</h4>
                There is no contacts!
            </div>';
  }
?>
