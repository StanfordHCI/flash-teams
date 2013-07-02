<?php

class User{

	public static function find($arr = array()){
		global $db;

		if(empty($arr)){
			$st = $db->prepare("SELECT * FROM users LIMIT 100");
		}
		else if($arr['id']){
			$st = $db->prepare("SELECT * FROM users WHERE fbid=:id");
		}
                else if($arr['dbid']){
			$st = $db->prepare("SELECT * FROM users WHERE id=:dbid");
		}
		else{
			throw new Exception("Unsupported property!");
		}

		$st->execute($arr);

		// Returns an array of Category objects:
		return $st->fetchAll(PDO::FETCH_CLASS, "User");
	}
        
        public static function insert($param=array()) {

            global $db;
            $user = User::find(array("id" => $param["id"]));
            if(empty($user))
            {
             $stmt = $db->prepare("INSERT INTO users(fbid,email,name) VALUES(?,?,?)");
             $stmt->execute(array($param["id"], '',$param["name"]));
              return 1;
            }
            else
            {
               return 0;
            }


        }
}

?>