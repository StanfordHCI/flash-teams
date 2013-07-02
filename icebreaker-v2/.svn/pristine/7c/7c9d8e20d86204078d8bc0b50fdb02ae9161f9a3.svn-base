<?php

class Interest {

	public static function find($arr = array()){
		global $db;

		if(empty($arr)){
			$st = $db->prepare("SELECT * FROM interests");
		}
		else if($arr['id']){
			$st = $db->prepare("SELECT * FROM interests WHERE id=:id");
		}
		else{
			throw new Exception("Unsupported property!");
		}

		$st->execute($arr);

		// Returns an array of Category objects:
		return $st->fetchAll(PDO::FETCH_CLASS, "Interest");
	}
        
}

?>