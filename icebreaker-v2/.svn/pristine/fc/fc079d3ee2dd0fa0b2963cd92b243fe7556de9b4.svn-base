<?php

class Friend{

	public static function find($arr = array()){
		global $db;

		if(empty($arr)){
			$st = $db->prepare("SELECT * FROM friends");
		}
		else if($arr['id']){
			$st = $db->prepare("SELECT * FROM friends WHERE fbid=:id and f_fbid=:fid");
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
            $user = Friend::find(array("id" => $param["id"],"fid" => $param["fid"]));
            if(empty($user))
            {
             $stmt = $db->prepare("INSERT INTO friends(fbid,f_fbid) VALUES(?,?)");
             $stmt->execute(array($param["id"], $param["fid"]));
             User::insert(array("id" => $param["fid"],"name"=>$param["name"]));
              return 1;
            }
            else
            {
               return 0;
            }


        }
}

?>